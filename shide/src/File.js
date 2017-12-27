
function makeFile(ide) {
  class File {
    constructor(fpath, cursor = null, content = null) {
      this.absPath = fpath;
      this.cursor = cursor;
      this.content = content;
      this.origContent = content;
      if (cursor) this.currCursorIndex = cursor.index;
    }

    /*
      Reads the file into memory as text.

      Returns the text, and updates file.content and file.cursor
    */
    async read() {
      const { text } = await ide.getFileContent({ path: this.absPath });
      if (this.isActive) {
        const cursor = await ide.getCursor();
        this.cursor = cursor;
        this.currCursorIndex = cursor.index;
      }

      this.origContent = text;
      this.content = text;
      return text;
    }

    /*
      Set the current file text, but don't update the editor. Call file.write
      to do that.
    */
    set(text) {
      this.content = text;
    }

    /*
      Update the file in the text editor if it's open, but otherwise update
      the file on disk. If text (1st arg) is provided, it'll be set to that text.
      If cursor (2nd arg) is passed, it'll use that cursor position.
    */
    async write(text = null, cursor = null) {
      if (text != null) this.content = text;
      if (cursor != null) {
        this.cursor = cursor;
        this.currCursorIndex = cursor.index;
      }

      await ide.setFileContent({
        path: this.absPath,
        text: this.content,
        cursor: { index: this.currCursorIndex },
      });
    }

    ///// Helper functions

    insertAtIndex(index, text) {
      const result = this.content.slice(0, index) + text + this.content.slice(index);
      if (this.cursor && index <= this.currCursorIndex) {
        this.currCursorIndex += text.length;
      }
      this.content = result;
      return this;
    }

    insertAtCursor(text) {
      const index = this.cursor.index;
      return this.insertAtIndex(index, text);
    }
  }

  /*
    Get a File for the active file in the editor
  */
  File.fromActive = async (opts = {}) => {
    const { path: absPath } = await ide.getActiveFile({});
    const cursor = await ide.getCursor();
    const file = new File(absPath, cursor, null);
    file.isActive = true;
    if (opts.read) await file.read();
    return file;
  }

  /*
    Get a File for the specified absoltue path
  */
  File.fromPath = async (absPath, opts = {}) => {
    const file = new File(absPath, null, null);
    if (opts.read) await file.read();
    return file;
  }

  /*
    Get an array of File objects for the currently open tabs/buffers.
  */
  File.arrayFromOpen = async (opts = {}) => {
    const { path: absPath } = await ide.getActiveFile({});

    const openFilePaths = await ide.getOpenFiles({});
    const ps = openFilePaths.map(async (fileDesc) => {
      const file = new File(fileDesc.path, null, null);
      if (fileDesc.path === absPath) {
        file.isActive = true;
      }

      if (opts.read) await file.read();
      return file;
    })
    return Promise.all(ps);
  }

  return File;
}

module.exports = makeFile;
