'use babel';
const fs = require('fs');
const pify = require('util.promisify');
const IoManager = require('./IoManager');

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

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

  async getCursor() {
    const { body } = await this.io.performRequest('getCursor', {}, null);
    return body;
  }

  async getFileContent(path) {
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

  async getActiveFile() {
    const { body } = await this.io.performRequest('getActiveFile', {}, null);
    return body;
  }
}

module.exports = ShideRuntime;
