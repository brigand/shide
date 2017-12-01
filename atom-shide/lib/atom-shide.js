'use babel';

import cp from 'child_process';
import AtomShideView from './atom-shide-view';
import { CompositeDisposable } from 'atom';

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

  getWorkDir() {
    return atom.project.getPaths()[0];
  },

  activate(state) {
    const wd = this.getWorkDir();
    getCommands = require(`${wd}/node_modules/shide/src/getCommands`);
    IoManager = require(`${wd}/node_modules/shide/src/IoManager`);
    getNodeExecutable = require(`${wd}/node_modules/shide/src/getNodeExecutable`);

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
    io.on('message', async ({ reqId, meta, body, reply, subtype }) => {

      // Handle the various commands. Sync with shide/src/runtime.js
      // TODO: refactor these to a separate file?

      if (subtype === 'getOpenFiles') {
        const paths = atom.workspace.getPaneItems()
          .map((x) => {
            if (x && x.getPath) {
              return x.getPath();
            }
            return null;
          })
          .filter(Boolean);
        reply({}, { paths });
        return;
      }

      // Used to get consistent warnings for there not being an active text editor
      // Not sure exactly when this happens
      function ensureGetActiveTextEditor(errorOnFail = false) {
        const te = atom.workspace.getActiveTextEditor() || null;
        if (!te) {
          atom.workspace.addWarning(`Shide ${command.displayName} attempted to use '${subtype}' but no editor is focused`);
          if (errorOnFail) {
            reply({ error: true }, { message: `No editor focused`, type: 'no_editor' });
          }
        }
        return te;
      }

      function getPaneByPath(path) {
        return atom.workspace.getPaneItems()
          .find(x => x && x.getPath && x.getPath() === path);
      }

      if (subtype === 'getActiveFile') {
        const te = ensureGetActiveTextEditor(true);
        if (!te) return;
        reply({}, { path: te.getPath() });
      }

      if (subtype === 'getCursor') {
        const te = ensureGetActiveTextEditor(true);
        if (!te) return;

        const range = te.getSelectedBufferRange();
        const text = te.getSelectedText();
        const cursor = te.getCursorBufferPosition();
        reply({}, {
          cursor,
          range,
          text,
        });
        return;
      }

      async function getTeForOptionalPath(path, errorOnFail = false) {
        let te = null;
        if (body && body.path) {
          te = getPaneByPath(body.path);
          if (!te) {
            if (body.opts.open) {
              te = await atom.workspace.open(body.path);
              return te;
            } else if (errorOnFail) {
              reply({ error: true }, {
                message: `No text editor with path ${body.path}`, type: 'no_matching_editor',
              });
            }
            return null;
          }
        }
        if (!te) {
          te = ensureGetActiveTextEditor(errorOnFail);
        }
        return te;
      }

      if (subtype === 'getFileContent') {
        const te = await getTeForOptionalPath(body.path, true);
        if (!te) return;
        reply({}, { text: te.getText() });
        return;
      }
      if (subtype === 'setFileContent') {
        const te = await getTeForOptionalPath(body.path, true);
        if (!te) return;
        te.setText(body.text);
        if (body.opts.save) {
          te.save();
        }
        reply({}, { success: true });
        return;
      }

      // Could be caused by a mismatch in atom-shide and shide package versions
      // or a bug in either package
      atom.workspace.addWarning(`Shide ${command.displayName} attempted to use action "${subtype}" which isn't supported by atom-shide`);

      reply({ error: true }, { message: `Unsupported operation`, type: 'unsupported_command' });
    });

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

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomShideView.destroy();
  },

  serialize() {
    return {
      atomShideViewState: this.atomShideView.serialize()
    };
  },

  toggle() {
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
