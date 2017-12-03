// This file is generated by /Users/fb/github/brigand/shide/shide/scripts/genJsRuntime.js
const assert = require('assert');
const { inspect } = require('util');

class BaseGeneratedRuntime {
  async getOpenFiles() {

    const res = await this.io.performRequest('getOpenFiles', {});

    return res.body;
  }

  async openFile(input) {
    try { assert.equal(!!input, true) } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input, 'object') } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input.path, 'string') } catch (e) {
      throw new Error(`Expected input.path to be a string but got ${inspect(input.path)}`) }


    const res = await this.io.performRequest('openFile', {}, {
        path: input.path,
    });

    try { assert.equal(!!res.body, true) } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body, 'object') } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body.success, 'boolean') } catch (e) {
      throw new Error(`Expected res.body.success to be a boolean but got ${inspect(res.body.success)}`) }

    return res.body;
  }

  async saveFile(input) {
    try { assert.equal(!!input, true) } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input, 'object') } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input.path, 'string') } catch (e) {
      throw new Error(`Expected input.path to be a string but got ${inspect(input.path)}`) }


    const res = await this.io.performRequest('saveFile', {}, {
        path: input.path,
    });

    try { assert.equal(!!res.body, true) } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body, 'object') } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body.success, 'boolean') } catch (e) {
      throw new Error(`Expected res.body.success to be a boolean but got ${inspect(res.body.success)}`) }

    return res.body;
  }

  async closeAllFiles(input) {
    try { assert.equal(!!input, true) } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input, 'object') } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input.noSave, 'boolean') } catch (e) {
      throw new Error(`Expected input.noSave to be a boolean but got ${inspect(input.noSave)}`) }


    const res = await this.io.performRequest('closeAllFiles', {}, {
        noSave: input.noSave,
    });

    try { assert.equal(!!res.body, true) } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body, 'object') } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body.success, 'boolean') } catch (e) {
      throw new Error(`Expected res.body.success to be a boolean but got ${inspect(res.body.success)}`) }

    return res.body;
  }

  async getCursor() {

    const res = await this.io.performRequest('getCursor', {});

    try { assert.equal(!!res.body, true) } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body, 'object') } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body.row, 'number') } catch (e) {
      throw new Error(`Expected res.body.row to be a number but got ${inspect(res.body.row)}`) }
    try { assert.equal(typeof res.body.col, 'number') } catch (e) {
      throw new Error(`Expected res.body.col to be a number but got ${inspect(res.body.col)}`) }
    try { assert.equal(typeof res.body.index, 'number') } catch (e) {
      throw new Error(`Expected res.body.index to be a number but got ${inspect(res.body.index)}`) }
    try { assert.equal(!!res.body.selection, true) } catch (e) {
      throw new Error(`Expected res.body.selection to be an object but got ${inspect(res.body.selection)}`) }
    try { assert.equal(typeof res.body.selection, 'object') } catch (e) {
      throw new Error(`Expected res.body.selection to be an object but got ${inspect(res.body.selection)}`) }
    try { assert.equal(!!res.body.selection.start, true) } catch (e) {
      throw new Error(`Expected res.body.selection.start to be an object but got ${inspect(res.body.selection.start)}`) }
    try { assert.equal(typeof res.body.selection.start, 'object') } catch (e) {
      throw new Error(`Expected res.body.selection.start to be an object but got ${inspect(res.body.selection.start)}`) }
    try { assert.equal(typeof res.body.selection.start.row, 'number') } catch (e) {
      throw new Error(`Expected res.body.selection.start.row to be a number but got ${inspect(res.body.selection.start.row)}`) }
    try { assert.equal(typeof res.body.selection.start.col, 'number') } catch (e) {
      throw new Error(`Expected res.body.selection.start.col to be a number but got ${inspect(res.body.selection.start.col)}`) }
    try { assert.equal(typeof res.body.selection.start.index, 'number') } catch (e) {
      throw new Error(`Expected res.body.selection.start.index to be a number but got ${inspect(res.body.selection.start.index)}`) }
    try { assert.equal(!!res.body.selection.end, true) } catch (e) {
      throw new Error(`Expected res.body.selection.end to be an object but got ${inspect(res.body.selection.end)}`) }
    try { assert.equal(typeof res.body.selection.end, 'object') } catch (e) {
      throw new Error(`Expected res.body.selection.end to be an object but got ${inspect(res.body.selection.end)}`) }
    try { assert.equal(typeof res.body.selection.end.row, 'number') } catch (e) {
      throw new Error(`Expected res.body.selection.end.row to be a number but got ${inspect(res.body.selection.end.row)}`) }
    try { assert.equal(typeof res.body.selection.end.col, 'number') } catch (e) {
      throw new Error(`Expected res.body.selection.end.col to be a number but got ${inspect(res.body.selection.end.col)}`) }
    try { assert.equal(typeof res.body.selection.end.index, 'number') } catch (e) {
      throw new Error(`Expected res.body.selection.end.index to be a number but got ${inspect(res.body.selection.end.index)}`) }

    return res.body;
  }

  async getFileContent(input) {
    try { assert.equal(!!input, true) } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input, 'object') } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input.path, 'string') } catch (e) {
      throw new Error(`Expected input.path to be a string but got ${inspect(input.path)}`) }


    const res = await this.io.performRequest('getFileContent', {}, {
        path: input.path,
    });

    try { assert.equal(!!res.body, true) } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body, 'object') } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body.text, 'string') } catch (e) {
      throw new Error(`Expected res.body.text to be a string but got ${inspect(res.body.text)}`) }

    return res.body;
  }

  async setFileContent(input) {
    try { assert.equal(!!input, true) } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input, 'object') } catch (e) {
      throw new Error(`Expected input to be an object but got ${inspect(input)}`) }
    try { assert.equal(typeof input.path, 'string') } catch (e) {
      throw new Error(`Expected input.path to be a string but got ${inspect(input.path)}`) }
    try { assert.equal(typeof input.text, 'string') } catch (e) {
      throw new Error(`Expected input.text to be a string but got ${inspect(input.text)}`) }
    if (input.opts) {
      try { assert.equal(typeof input.opts, 'object') } catch (e) {
      throw new Error(`Expected input.opts to be an object but got ${inspect(input.opts)}`) }
    }


    const res = await this.io.performRequest('setFileContent', {}, {
        path: input.path,
        text: input.text,
        opts: input.opts,
    });

    try { assert.equal(!!res.body, true) } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body, 'object') } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body.success, 'boolean') } catch (e) {
      throw new Error(`Expected res.body.success to be a boolean but got ${inspect(res.body.success)}`) }

    return res.body;
  }

  async getActiveFile() {

    const res = await this.io.performRequest('getActiveFile', {});

    try { assert.equal(!!res.body, true) } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body, 'object') } catch (e) {
      throw new Error(`Expected res.body to be an object but got ${inspect(res.body)}`) }
    try { assert.equal(typeof res.body.path, 'string') } catch (e) {
      throw new Error(`Expected res.body.path to be a string but got ${inspect(res.body.path)}`) }

    return res.body;
  }
}
module.exports = BaseGeneratedRuntime;