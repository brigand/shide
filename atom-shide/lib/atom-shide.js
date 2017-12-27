'use babel';

import cp from 'child_process';
import AtomShideView from './atom-shide-view';
import { CompositeDisposable } from 'atom';
import AtomShideCore from './core/AtomShideCore';

// We will import these relative to the working directory for the project
// when atom-shide is activated
let getCommands;
let IoManager;
let getNodeExecutable;

export default {
  atomShideView: null,
  modalPanel: null,
  subscriptions: null,
  processes: [],

  // instance of one of our UI classes
  currentUi: null,

  getWorkDir() {
    return atom.project.getPaths()[0];
  },

  activate(state) {
    this.atomShideView = new AtomShideView(state.atomShideViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomShideView.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'shide:reload': () => this.init(),
    }));

    this.init();
  },

  async init() {
    if (this.core) this.core.destroy();
    this.core = new AtomShideCore();
    this.destroyUi();

    const wd = this.getWorkDir();
    try {
      getCommands = require(`${wd}/node_modules/shide/src/getCommands`);
      IoManager = require(`${wd}/node_modules/shide/src/IoManager`);
      getNodeExecutable = require(`${wd}/node_modules/shide/src/getNodeExecutable`);
    } catch (e) {
      console.warn(`Shide isn't installed for this project`, e.message);
      return;
    }

    this.killAll();
    if (this.extraActions) this.extraActions.dispose();

    this.extraActions = new CompositeDisposable();
    const commands = await getCommands(this.getWorkDir());
    Object.keys(commands).forEach((key) => {
      const command = commands[key];
      this.extraActions.add(atom.commands.add('atom-workspace', {
        [`shide-command:${command.name}`]: () => this.perform(command),
      }));

      // Binds to ex-mode if it's installed
      // Because it lazy loads, it won't be available on the first init
      // but because it only activates once, when we re-init (due to shide:reload)
      // we need to add any new shide commands to it
      const maybeSetupExMode = () => {
        const ex = atom.packages.getActivePackage('ex-mode');
        if (ex) {
          const exMode = ex.mainModule.provideEx();
          exMode.registerCommand(`${command.name}`, (exParams) => {
            const { args: rawArgs } = exParams;
            const argv = rawArgs
              .split(' ')
              .map(x => x.trim())
              .filter(Boolean);
            this.perform(command, {
              argv,
            });
          });
          return true;
        }
        return false;
      };

      // It returns false if it failed to find ex-mode - in which case
      // we'll add a listener for ex-mode activating
      if (!maybeSetupExMode()) {
        const activateDisposable = atom.packages.onDidActivatePackage((pack) => {
          if (pack.name === 'ex-mode') {
            activateDisposable.dispose();
            maybeSetupExMode();
          }
        });
      }
    });
  },

  killAll() {
    // Not sure if the slice/clone is required, but we handle the
    // 'exit' event on each process by removing it from the array
    this.processes.slice().forEach((proc) => {
      console.warn(`Killed process for command "${proc.shideCommandName}"`);
      proc.kill();
    });
    this.processes = [];
  },

  async perform(command, inputArgs = []) {
    // Do our best to find node 8.x
    const nodeExecutable = await getNodeExecutable((errMessage) => {
      atom.notifications.addWarning(errMessage);
    });

    // We're running the shide cli in the actual project directory,
    // not atom-shide's node_modules
    const args = ['./node_modules/shide/src/cli.js', 'invoke-from-ide', command.name, JSON.stringify(inputArgs)];

    const c = cp.spawn(nodeExecutable, args, {
      cwd: this.getWorkDir(),
      stdio: 'pipe',
    });
    c.shideCommandName = command.displayName;
    this.processes.push(c);
    c.on('exit', () => {
      const index = this.processes.indexOf(c);
      if (index !== -1) this.processes.splice(index, 1);
    });
    c.stderr.on('data', (msg) => {
      console.error(String(msg));
    });

    // Set up being able to talk both ways with the child process
    const io = new IoManager(c.stdin, [c.stdout, c.stderr]);

    // Handle the child process sending a request to us
    // eslint-disable-next-line
    this.core.runForIo(io, command);

    let logBuffer = '';
    let timerRunning = false;
    io.on('log', (data) => {
      if (data.logType === 'SUCCESS') {
        // End stdin so the process can naturally exit
        c.stdin.end();
        console.debug(`Shide ${command.displayName}: finished.`);
      }

      // Generic log message, typically a console.log or console.error in
      // the shide script
      // We buffer up the output a little because otherwise it looks crappy
      // in the atom dev tools console
      if (data.logType === 'unknown') {
        if (data.text) {
          logBuffer += `${data.text}\n`;
          if (!timerRunning) {
            timerRunning = true;
            setTimeout(() => {
              console.debug(`Shide ${command.displayName}: ${logBuffer}`);
              logBuffer = '';
              timerRunning = false;
            }, 50);
          }
        }
      }

      // The user needs to see this
      if (data.level === 'FATAL') {
        atom.notifications.addError(data.text);
      }
    });

    io.init();
  },

  destroyUi() {
    if (this.currentUi) this.currentUi.destroy();
    if (this.currentUiModal) this.currentUiModal.destroy();
    this.currentUi = null;
    this.currentUiModal = null;
  },

  deactivate() {
    this.destroyUi();
    this.subscriptions.dispose();
    this.atomShideView.destroy();
  },

  serialize() {
    return {
      atomShideViewState: this.atomShideView.serialize()
    };
  },
};
