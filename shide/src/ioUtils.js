const crypto = require('crypto');
const bs58 = require('bs58');

function randId() {
  const b = crypto.randomBytes(16);
  return bs58.encode(b);
}

function makeMessage(reqId, subtype, meta, content) {
  let str = ``;
  str += `SHIDE MSG START ${subtype} ${reqId}\n`;
  str += `SHIDE META ${meta ? JSON.stringify(meta) : 'null'}\n`;
  str += `SHIDE CONTENT START ${id}\n`;
  if (typeof content !== 'string') {
    content = JSON.stringify(content, null, 2);
  }
  str += content;
  str += `SHIDE CONTENT END ${id}\n`;
  str += `SHIDE MSG END ${subtype} ${reqId}\n`;
  return str;
}

function makeTextMessage(reqId, meta, content) {
  return makeMessage(reqId, 'text', meta, content);
}

const lineRegex = [
  {
    pattern: /^SHIDE MSG START (\w+) (\w+)$/g,
    map: ([full, subtype, reqId]) => ({ type: 'msg_start', subtype, reqId }),
  },
  {
    pattern: /^SHIDE META (.*)$/g,
    map: ([full, json]) => ({ type: 'meta', value: JSON.parse(json), reqId }),
  },
  {
    pattern: /^SHIDE CONTENT START (\w+)$/g,
    map: ([full, reqId]) => ({ type: 'content_start', reqId }),
  },
  {
    pattern: /^SHIDE CONTENT END (\w+)$/g,
    map: ([full, reqId]) => ({ type: 'content_end', reqId }),
  },
  {
    pattern: /^SHIDE MSG END (\w+) (\w+)$/g,
    map: ([full, subtype, reqId]) => ({ type: 'msg_end', subtype, reqId }),
  },
];

function parseLine(line) {
  for (const { pattern, map } of lineRegex) {
    pattern.lastIndex = 0;
    const match = line.match(pattern);
    if (match) {
      const res = map(match);
      if (res) {
        return res;
      }
    }
  }

  if (/^SHIDE\s/.test(line)) {
    throw new TypeError(`Attempted to parse line ${JSON.stringify(line)} but no patterns matched`);
  }

  return { type: 'raw', text: line };
}

module.exports = {
  randId,
  makeMessage,
  makeTextMessage,
  parseLine,
};
