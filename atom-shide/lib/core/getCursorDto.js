'use babel';
export default async function getCursorDto(te) {
  const range = te.getSelectedBufferRange();
  const selectedText = te.getSelectedText();
  const cursor = te.getCursorBufferPosition();
  const text = te.getText();
  const res = {
    row: cursor.row,
    col: cursor.column,
    index: null,
    selection: {
      start: {
        row: range.start.row,
        col: range.start.column,
        index: null,
      },
      end: {
        row: range.end.row,
        col: range.end.column,
        index: null,
      },
      text: selectedText || null,
    },
  };
  let currRow = 0;
  let currCol = 0;
  let solved = 0;
  for (let i = 0; i < text.length + 1; i += 1) {
    const char = text[i];

    if (currRow === res.row && currCol === res.col) {
      solved += 1;
      res.index = i;
    }
    if (currRow === res.selection.start.row && currCol === res.selection.start.col) {
      solved += 1;
      res.selection.start.index = i;
    }
    if (currRow === res.selection.end.row && currCol === res.selection.end.col) {
      solved += 1;
      res.selection.end.index = i;
    }

    // found all of the offsets? we can stop now
    if (solved === 3) {
      break;
    }

    if (char === '\n') {
      currCol = 0;
      currRow += 1;
    } else {
      currCol += 1;
    }
  }
  return res;
}
