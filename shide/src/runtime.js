'use babel';
const fs = require('fs');
const pify = require('util.promisify');
const IoManager = require('./IoManager');
const makeFile = require('./File');

const BaseGeneratedRuntime = require('./generated/runtime.gen.js');

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

// function assertAbsolutePath(path) {
//   if (!path) throw new TypeError(`path is required`);
//   if (path[0] !== '/') throw new TypeError(`path must be absolute`);
// }

class ShideRuntime extends BaseGeneratedRuntime {
  constructor(opts = {}) {
    super();
    this.args = opts.inputArgs || {};
    this.File = makeFile(this);
  }

  init() {
    this.io = new IoManager(process.stdout, process.stdin);
    process.stdin.resume();
    this.io.init();
  }

  async getFileContent(opts) {
    try {
      return await super.getFileContent(opts);
    } catch (e) {
      if (opts.path && e.body && e.body.type === 'no_matching_editor') {
        const text = await readFile(opts.path, 'utf-8');
        return { text };
      }
      throw e;
    }
  }

  async setFileContent(opts) {
    try {
      return await super.setFileContent(opts);
    } catch (e) {
      if (opts.path && e.body && e.body.type === 'no_matching_editor') {
        await writeFile(opts.path, opts.text);
        return null;
      }
      throw e;
    }
  }

  // Commented out functions are inherited from BaseGeneratedRuntime
  // async getOpenFiles() {
  //   const { body } = await this.io.performRequest('getOpenFiles', {}, null);
  //   return body;
  // }
  //
  // async openFile(opts) {
  //   assertAbsolutePath(opts.path);
  //   const { body } = await this.io.performRequest('openFile', {}, opts);
  //   return body;
  // }
  //
  // async saveFile(opts = {}) {
  //   assertAbsolutePath(opts.path);
  //   const { body } = await this.io.performRequest('saveFile', {}, {
  //     path: opts.path,
  //   });
  //   return body;
  // }
  //
  // async closeAllFiles(opts = {}) {
  //   const { body } = await this.io.performRequest('closeAllFiles', {}, {
  //     noSave: opts.noSave,
  //   });
  //   return body;
  // }
  //
  // async getCursor() {
  //   const { body } = await this.io.performRequest('getCursor', {}, null);
  //   return body;
  // }
  //
  // async prompt(opts = {}) {
  //   const { body } = await this.io.performRequest('prompt', {}, {
  //     message: opts.message,
  //   });
  //   return body;
  // }

  /*
    Gets metadata about the current active editor file. Throws if no active
    file.

    @returns { path: string }
  */
  // async getActiveFile() {
  //   const { body } = await this.io.performRequest('getActiveFile', {}, null);
  //   return body;
  // }
}

module.exports = ShideRuntime;
