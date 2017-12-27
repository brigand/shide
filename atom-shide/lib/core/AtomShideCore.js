'use babel';
import * as cu from './coreUtils';
import getCursorDto from './getCursorDto';
import PromptUi from '../ui/PromptUi';
import SelectUi from '../ui/SelectUi';

export default class AtomShideCore {
  constructor() {
    const wd = atom.project.getPaths()[0];
    this.MappedFile = require(`${wd}/node_modules/shide/src/mapped/MappedFile`);
  }
  async runForIo(io, command) {
    // eslint-disable-next-line
    io.on('message', async (reqData) => {
      const reply = reqData.reply;
      const toPass = Object.assign({}, reqData, { command, reply: null });
      try {
        // Handle the various commands. Sync with shide/src/runtime.js
        // TODO: refactor these to a separate file?
        const output = await this.handleMessage(toPass);
        if (output instanceof cu.Success) {
          reply(output.meta || {}, output.res);
          return;
        } else {
          reply({}, output);
        }
      } catch (e) {
        if (e instanceof cu.ExpectedError) {
          // atom.notifications.addWarning(`${e.message}`);
          reply({ error: true }, { type: e.type, message: e.message, expected: true });
          return;
        }
        atom.notifications.addError(`shide unexpected ${e}`);
        reply({ error: true }, { type: e.type, message: e.message });
      }
    });
  }

  // eslint-disable-next-line
  async handleMessage({ command, reqId, meta, body, subtype }) {
    if (subtype === 'log') {
      const { level, message } = body;
      const levels = ['silly', 'debug', 'verbose', 'info', 'success', 'warn', 'error'];
      const toConsole = levels.slice(0, levels.indexOf('verbose'));
      const toNotify = levels.slice(levels.indexOf('info'));
      if (toConsole.includes(level)) {
        if (level === 'error') console.error(`${level}:`, message);
        else if (level === 'warn') console.warn(`${level}:`, message);
        else console.debug(`${level}:`, message);
      }
      if (toNotify.includes(level)) {
        const display = `${command.displayName}: ${message}`;
        if (level === 'success') atom.notifications.addSuccess(display);
        if (level === 'error') atom.notifications.addError(display);
        if (level === 'warn') atom.notifications.addWarning(display);
      }

      return new cu.Success({});
    }
    if (subtype === 'getOpenFiles') {
      const paths = atom.workspace.getPaneItems()
        .map((x) => {
          if (x && x.getPath) {
            return x.getPath();
          }
          return null;
        })
        .filter(Boolean);
      return new cu.Success({ paths });
    }

    if (subtype === 'closeAllFiles') {
      let closed = [];
      atom.workspace.getPanes()
        .forEach((pane) => {
          pane.getItems().forEach(async (item) => {
          if (item && item.getPath) {
            closed.push(item.getPath());
            if (!body.noSave) {
              await pane.saveItem(item);
            }
            await pane.destroyItem(item);
          }
        });
      });
      return new cu.Success({ success: true, closed });
    }

    if (subtype === 'saveFile') {
      const match = atom.workspace.getPaneItems()
        .find((x) => {
          if (x && x.getPath) {
            const p = x.getPath();
            if (p === body.path) {
              return true;
            }
          }
          return false;
        });
      if (match) {
        match.save();
        return new cu.Success({ success: true });
      }
      throw new cu.ExpectedError('not_found', `No active editor found for path "${body.path}"`);
    }

    if (subtype === 'getActiveFile') {
      const te = cu.ensureGetActiveTextEditor(true);
      if (!te) return;
      return new cu.Success({ path: te.getPath() });
    }

    if (subtype === 'getCursor') {
      const te = cu.ensureGetActiveTextEditor(true);
      if (!te) return;
      const cursor = await getCursorDto(te);
      return new cu.Success(cursor);
    }

    if (subtype === 'openFile') {
      // const te = await atom.workspace.open(body.path, {
      await atom.workspace.open(body.path, {
        // activatePane: body.inBackground ? false : true,
        pending: false,
        searchAllPanes: body.allowDuplicate ? false : true,
      });
      // if (!body.inBackground) {
      //   activateEditorForPath(body.path, false);
      //   setTimeout(() => {
      //     activateEditorForPath(body.path, false);
      //   }, 200);
      // }
      if (body.cursor) {
        await cu.applyCursor(body.path, body.cursor, true);
        // te.scrollToBufferPosition({
        //   row: 10000,
        //   col: 0,
        // });
        // te.scrollToBufferPosition({
        //   // FIXME: how do we set the first line in the editor?
        //   row: body.cursor.row + 25,
        //   col: body.cursor.col || 0,
        // });
      }
      return new cu.Success({ success: true });
    }

    if (subtype === 'getFileContent') {
      const te = await cu.getTeForOptionalPath(body.path, true);
      if (!te) return;
      return new cu.Success({ text: te.getText() });
    }
    if (subtype === 'setFileContent') {
      const te = await cu.getTeForOptionalPath(body.path, true);
      if (!te) return;
      te.setText(body.text);
      if (body.opts && body.opts.save) {
        te.save();
      }
      if (body.cursor) {
        await cu.applyCursor(body.path, body.cursor, false);
      }
      return new cu.Success({ success: true });
    }

    if (subtype === 'setCursor') {
      await cu.applyCursor(body.path, body.cursor, false);
      return new cu.Success({ success: true });
    }

    if (subtype === 'prompt') {
      if (this.currentUi) this.currentUi.destroy();

      // Hack to get atom to restore focus to the text editor
      // the activating pane items seems to not work in this case
      const initialFocus = document.activeElement;

      this.currentUi = null;
      const resP = new Promise((resolve) => {
        this.currentUi = new PromptUi({
          message: body.message,
          callback: async (err, res) => {
            this.destroyUi();
            if (initialFocus) {
              initialFocus.focus();
            }
            resolve(new cu.Success({ response: res.response || null }));
          },
        });
      });
      this.currentUiModal = atom.workspace.addModalPanel({
        item: this.currentUi.getElement(),
        visible: true,
      });

      return resP;
    }

    if (subtype === 'select') {
      if (this.currentUi) this.currentUi.destroy();

      // Hack to get atom to restore focus to the text editor
      // the activating pane items seems to not work in this case
      const initialFocus = document.activeElement;

      this.currentUi = null;
      const resP = new Promise((resolve) => {
        this.currentUi = new SelectUi({
          message: body.message,
          fuzzyType: body.fuzzyType,
          options: body.options,
          callback: async (err, res) => {
            this.destroyUi();
            if (initialFocus) {
              initialFocus.focus();
            }
            resolve(new cu.Success({ response: res.response || '' }));
          },
        });
      });
      this.currentUiModal = atom.workspace.addModalPanel({
        item: this.currentUi.getElement(),
        visible: true,
      });
      return resP;
    }

    if (subtype === 'makeMapped') {
      const mf = new this.MappedFile();
      mf.init({ ranges: body.ranges });
      const outFile = mf.writeToDisk();
      await atom.workspace.open(outFile, {
        activatePane: true,
        pending: false,
        searchAllPanes: false,
      });

      return new cu.Success({ success: true });
    }

    // Could be caused by a mismatch in atom-shide and shide package versions
    // or a bug in either package
    atom.notifications.addWarning(`Shide ${command.displayName} attempted to use action "${subtype}" which isn't supported by atom-shide`);

    throw new cu.ExpectedError('unsupported_command', `Unsupported operation`);
  }

  destroy() {
    this.destroyUi();
  }

  destroyUi() {
    if (this.currentUi) this.currentUi.destroy();
    if (this.currentUiModal) this.currentUiModal.destroy();
    this.currentUi = null;
    this.currentUiModal = null;
  }
}
