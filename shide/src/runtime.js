'use babel';
const fs = require('fs');
const pify = require('util.promisify');
const IoManager = require('./IoManager');

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

function assertAbsolutePath(path) {
  if (!path) throw new TypeError(`path is required`);
  if (path[0] !== '/') throw new TypeError(`path must be absolute`);
}

class ShideRuntime {
  constructor(opts = {}) {
    this.args = opts.inputArgs || [];
  }

  init() {
    this.io = new IoManager(process.stdout, process.stdin);
    process.stdin.resume();
    this.io.init();
  }

  async getOpenFiles() {
    const { body } = await this.io.performRequest('getOpenFiles', {}, null);
    return body;
  }

  async openFile(opts) {
    assertAbsolutePath(opts.path);
    const { body } = await this.io.performRequest('openFile', {}, opts);
    return body;
  }

  async saveFile(opts = {}) {
    assertAbsolutePath(opts.path);
    const { body } = await this.io.performRequest('saveFile', {}, {
      path: opts.path,
    });
    return body;
  }

  async closeAllFiles(opts = {}) {
    const { body } = await this.io.performRequest('closeAllFiles', {}, {
      noSave: opts.noSave,
    });
    return body;
  }

  async getCursor() {
    const { body } = await this.io.performRequest('getCursor', {}, null);
    return body;
  }

  async getFileContent(path) {
    assertAbsolutePath(path);
    try {
      const { body } = await this.io.performRequest('getFileContent', {}, {
        path,
      });
      return body;
    } catch (e) {
      if (path && e.body && e.body.type === 'no_matching_editor') {
        const text = await readFile(path, 'utf-8');
        return { text };
      }
      throw e;
    }
  }

  async setFileContent(path, text, opts = {}) {
    assertAbsolutePath(path);
    try {
      const { body } = await this.io.performRequest('setFileContent', {}, {
        path,
        text,
        opts,
      });
      return body;
    } catch (e) {
      if (path && e.body && e.body.type === 'no_matching_editor') {
        await writeFile(path, text);
        return null;
      }
      throw e;
    }
  }

  /*
    Gets metadata about the current active editor file. Throws if no active
    file.

    @returns { path: string }
  */
  async getActiveFile() {
    const { body } = await this.io.performRequest('getActiveFile', {}, null);
    return body;
  }
}

module.exports = ShideRuntime;
