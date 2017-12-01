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
    const { body } = await this.io.performRequest('get_open_files', {}, null);
    return JSON.parse(body);
  }

  async getCursorPosition() {
    const { body } = await this.io.performRequest('get_cursor_position', {}, null);
    return body;
  }

  async getFileContent(name) {
    const { body } = await this.io.performRequest('get_file_content', {}, {
      name,
    });
    return body;
  }
}
