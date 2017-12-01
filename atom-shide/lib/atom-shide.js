'use babel';

import AtomShideView from './atom-shide-view';
import { CompositeDisposable } from 'atom';
import getCommands from 'shide/src/getCommands';
import IoManager from 'shide/src/IoManager';
import getNodeExecutable from 'shide/src/getNodeExecutable';
import cp from 'child_process';

export default {
  atomShideView: null,
  modalPanel: null,
  subscriptions: null,

  getWorkDir() {
    return atom.project.getPaths()[0];;
  },

  activate(state) {
    this.atomShideView = new AtomShideView(state.atomShideViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomShideView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'shide:reload': () => this.init(),
    }));

    this.init();
  },

  async init() {
    if (this.extraActions) this.extraActions.dispose();

    this.extraActions = new CompositeDisposable();
    const commands = await getCommands(this.getWorkDir());
    Object.keys(commands).forEach((key) => {
      const command = commands[key];
      this.extraActions.add(atom.commands.add('atom-workspace', {
        [`shide-command:${command.name}`]: () => this.perform(command),
      }));
    });
  },

  async perform(command) {
    const nodeExecutable = await getNodeExecutable((errMessage) => {
      atom.notifications.addWarning(errMessage);
    });
    const args = ['./node_modules/shide/src/cli.js', 'invoke-from-ide', command.name];
    const c = cp.spawn(nodeExecutable, args, {
      cwd: this.getWorkDir(),
      stdio: 'pipe',
    });
    c.stderr.on('data', (msg) => {
      console.error(String(msg));
    });
    const io = new IoManager(c.stdin, [c.stdout, c.stderr]);

    io.on('message', ({ reqId, meta, body, reply, subtype }) => {
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

      if (subtype === 'getCursor') {
        const te = atom.workspace.getActiveTextEditor();
        if (!te) {
          atom.workspace.addWarning(`Shide ${command.displayName} attempted to use '${subtype}' but no editor is focused`);
          reply({ error: true }, { message: `No editor focused`, type: 'no_editor' });
          return;
        }
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

      if (subtype === 'getFileContent') {
        return;
      }

      atom.workspace.addWarning(`Shide ${command.displayName} attempted to use action "${subtype}" which isn't supported by atom-shide`);

      reply({ error: true }, { message: `Unsupported operation`, type: 'unsupported_command' });
    });

    io.on('log', (data) => {
      if (data.logType === 'SUCCESS') {
        c.stdin.end();
      }

      if (data.logType === 'unknown') {
        console.debug(`Shide ${command.displayName}: ${data.text}`);
      }

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
