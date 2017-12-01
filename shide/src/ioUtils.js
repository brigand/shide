const crypto = require('crypto');
const bs58 = require('bs58');
const jsonParseWithGoodError = require('./jsonParseWithGoodError');

function randId() {
  const b = crypto.randomBytes(16);
  return bs58.encode(b);
}

function makeMessage(reqId, subtype, meta, content) {
  let str = ``;
  if (typeof content !== 'string') {
    content = JSON.stringify(content, null, 2);
    meta = meta || {};
    meta.isJSON = true;
  }

  str += `SHIDE MSG START ${subtype} ${reqId}\n`;
  str += `SHIDE META ${reqId} ${meta ? JSON.stringify(meta) : 'null'}\n`;
  str += `SHIDE CONTENT START ${reqId}\n`;
  str += content + '\n';
  str += `SHIDE CONTENT END ${reqId}\n`;
  str += `SHIDE MSG END ${subtype} ${reqId}\n`;
  return str;
}

function makeTextMessage(reqId, meta, content) {
  return makeMessage(reqId, 'text', meta, content);
}

const lineRegex = [
  {
    pattern: /^SHIDE MSG START (\w+) (\w+)$/,
    map: ([, subtype, reqId]) => ({ type: 'msg_start', subtype, reqId }),
  },
  {
    pattern: /^SHIDE META (\w+) (.*)$/,
    map: ([, reqId, json]) => ({ type: 'meta', value: jsonParseWithGoodError(json), reqId }),
  },
  {
    pattern: /^SHIDE CONTENT START (\w+)$/,
    map: ([, reqId]) => ({ type: 'content_start', reqId }),
  },
  {
    pattern: /^SHIDE CONTENT END (\w+)$/,
    map: ([, reqId]) => ({ type: 'content_end', reqId }),
  },
  {
    pattern: /^SHIDE MSG END (\w+) (\w+)$/,
    map: ([, subtype, reqId]) => ({ type: 'msg_end', subtype, reqId }),
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

  let other = line.match(/^SHIDE (\w+) (\w+)?(.*)$/);
  if (other) {
    const [, logType, level, text] = other;
    return { type: 'log', logType, level, text: text };
  } else {
    return { type: 'log', logType: 'unknown', level: 'unknown', text: line };
  }
}

module.exports = {
  randId,
  makeMessage,
  makeTextMessage,
  parseLine,
};
