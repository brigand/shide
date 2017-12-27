const fs = require('fs');
const { resolve: pathResolve } = require('path');
const os = require('os');
const crypto = require('crypto');

// Manages mapped files. Initially, you'll construct it with 0 arguments, and
// then call 'init' passing the ranges. It'll create the mapping files in memory.
// In the future, you can creaet a MappedFile passing mappedOriginal and mappedFile
// to the constructor, which are the contents of each file. It can then perform
// the mapping back to original files, by calling .applyFiles()
// No other internal state is needed. You don't need to keep the range information
// passed to 'init' around; everything is stored in the two files.
class MappedFile {
  constructor(opts = {}) {
    if (opts.mappedOriginal) this.mappedOriginal = opts.mappedOriginal;
    if (opts.mappedFile) this.mappedFile = opts.mappedFile;
  }

  /*
    opts should have a 'ranges' property. The items should look like this:
    { path: '/home/me/foo.js', startRow: 0, endRow: 5 }

    In the future, it'll be more flexibile
  */
  init(opts) {
    this.ranges = JSON.parse(JSON.stringify(opts.ranges));

    const firstFile = opts.ranges[0].path.split(/[/\\]/).pop().split('.').shift();

    const random = crypto.randomBytes(6).toString('hex');
    this.filePath = pathResolve(os.tmpdir(), `${firstFile}${random}.txt`);
    return this.initFilePair();
  }

  // Set up the initial files
  // TODO: throw if two ranges overlap for one file
  initFilePair() {
    // Load the text for each file
    let contents = {};
    const { ranges } = this;
    ranges.forEach((range) => {
      if (!contents[range.path]) {
        contents[range.path] = fs.readFileSync(range.path, 'utf-8');
      }
      range.fullContents = contents[range.path];
    });

    // These are our output files
    let mappedOriginal = ``;
    let mappedFile = ``;

    // Start with the 'original' file which contains the full contents of each file
    let originalFound = {};
    ranges.forEach((range) => {
      if (originalFound[range.path]) return;
      originalFound[range.path] = true;
      mappedOriginal += `${getOriginalFileBlock(range)}\n`;
    });

    // Then the second file we take the range slices
    ranges.forEach((range) => {
      mappedFile += `${getMappedBlock(range)}\n`;
    });

    this.mappedOriginal = mappedOriginal;
    this.mappedFile = mappedFile;

    return { mappedOriginal, mappedFile };
  }

  applyFiles() {
    if (!this.mappedOriginal || !this.mappedFile) {
      throw new Error(`applyFiles requires the MappedFile to be fully initialized.`);
    }

    const origFiles = parseOriginalFile(this.mappedOriginal);
    const mappings = sortParsedMappings(parseMappings(this.mappedFile));

    const out = [];
    for (const { path, content: origContent } of origFiles) {
      const lines = origContent.split(/\r?\n/g);
      for (const m of mappings) {
        if (m.path !== path) continue;
        lines.splice(m.startRow, m.endRow - m.startRow + 1, m.content);
      }
      out.push({ path, content: lines.join('\n') });
    }

    return out;
  }
}

const ORIG_START = `//@mapped-orig-start`;
const ORIG_END = `//@mapped-orig-end`;
const MAP_START = `//@mapped-start`;
const MAP_END = `//@mapped-end`;

function getOriginalFileBlock(range) {
  let out = `${ORIG_START} ${range.path}\n`;
  out += range.fullContents;
  out += `${ORIG_END}\n`;
  return out;
}

function sliceRange(range) {
  const lines = range.fullContents.split(/\r?\n/g);
  return lines.slice(range.startRow, range.endRow + 1).join('\n');
}

function getMappedBlock(range) {
  let out = `//@mapped-start ${range.startRow} ${range.endRow} ${range.path}\n`;
  const contents = sliceRange(range);
  out += contents;
  out += `\n//@mapped-end`;
  return out;
}

function parseOriginalFile(originalFile) {
  const lines = originalFile.split(/\r?\n/g);

  const allFiles = [];
  let currFile = null;

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    if (!currFile) {
      if (line.startsWith(ORIG_START)) {
        currFile = { path: line.slice(ORIG_START.length + 1).trim(), content: '' };
        allFiles.push(currFile);
      }
    } else if (line.startsWith(ORIG_END)) {
      currFile = null;
    } else {
      currFile.content += `${line}\n`;
    }
  }

  return allFiles;
}

function parseMappings(mappedFile) {
  const lines = mappedFile.split(/\r?\n/g);

  const allFiles = [];
  let currFile = null;

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    if (!currFile) {
      if (line.startsWith(MAP_START)) {
        const rest = line.slice(MAP_START.length).trim();
        const [ startRow, endRow, path ] = rest.split(/\s+/g);
        currFile = { startRow: Number(startRow), endRow: Number(endRow), path, content: '' };
        allFiles.push(currFile);
      }
    } else if (line.startsWith(MAP_END)) {
      // We don't want a trailing newline unless it's actually in the text range
      currFile.content = currFile.content.slice(0, -1);
      currFile = null;
    } else {
      currFile.content += `${line}`;

      currFile.content += `\n`;
    }
  }

  return allFiles;
}

function sortParsedMappings(mappings) {
  // Don't need to do anything with endRow because we don't (shouldn't) allow
  // overlapping ranges
  // Also we don't care about the file path, only that we iterate over them from
  // last to first
  return mappings.slice().sort((a, b) => b.startRow - a.startRow);
}

module.exports = MappedFile;
