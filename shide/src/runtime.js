'use babel';

const IoManager = require('./IoManager');

class ShideRuntime {
  constructor() {
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

  async getFileContent(name) {
    const { body } = await this.io.performRequest('getFileContent', {}, {
      name,
    });
    return body;
  }
}

module.exports = ShideRuntime;
