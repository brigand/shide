'use babel';
export class ExpectedError extends Error {
  constructor(type, message, opts = {}) {
    super(message);
    this.message = message;
    this.type = type;
    this.isError = true;
    Object.assign(this, opts);
  }
}

export class Success {
  constructor(res, meta = {}) {
    this.res = res;
    this.meta = meta;
    this.isSuccess = true;
  }
  toJSON() {
    return this.res;
  }
}

// Used to get consistent warnings for there not being an active text editor
// Not sure exactly when this happens
export function ensureGetActiveTextEditor(errorOnFail = false) {
  const te = atom.workspace.getActiveTextEditor() || null;
  if (!te) {
    if (errorOnFail) {
      throw ExpectedError(`no_editor`, `No editor focused`);
    }
  }
  return te;
}

export function getTeByPath(path) {
  return atom.workspace.getPaneItems()
    .find(x => x && x.getPath && x.getPath() === path);
}

export function getPaneByPath(path) {
  const item = getTeByPath(path);
  return atom.workspace.paneForItem(item);
}

export async function getTeForOptionalPath(path, errorOnFail = false, doOpen) {
  let te = null;
  if (path) {
    te = getTeByPath(path);
    if (!te) {
      if (doOpen) {
        te = await atom.workspace.open(path);
        return te;
      } else if (errorOnFail) {
        throw new ExpectedError(`no_matching_editor`, `No text editor with path ${path}`);
      }
      return null;
    }
  }
  if (!te) {
    te = ensureGetActiveTextEditor(errorOnFail);
  }
  return te;
}

export async function activateEditorForPath(path, errorOnFail = false) {
  const te = await getTeForOptionalPath(path, errorOnFail, true);
  if (!te) return;
  const pane = getPaneByPath(path);
  if (pane) {
    pane.activateItem(te);
  }
}

export async function applyCursor(path, cursor, errorOnFail = false) {
  const te = await getTeForOptionalPath(path, errorOnFail, true);
  if (!te) return;
  await activateEditorForPath(path);
  if (cursor.row != null && cursor.col != null) {
    te.setCursorBufferPosition([cursor.row, cursor.col]);
  } else if (cursor.index != null) {
    let row = 0;
    let col = 0;
    const text = te.getText();
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];

      if (i === cursor.index) {
        te.setCursorBufferPosition([row, col]);
        return;
      }

      if (char === '\n') {
        row += 1;
        col = 0;
      } else {
        col += 1;
      }
    }
  }
  await activateEditorForPath(path);
}
