// Gives better error messages, and doesn't error if you pass e.g. undefined
// but warns
function jsonParseWithGoodError(value) {
  if (typeof value !== 'string') {
    console.error(`Attempted to parse json for a ${typeof value} with value`, value);
    return null;
  }
  try {
    return JSON.parse(value)
  } catch (e) {
    throw new TypeError(`Attempted to parse json for string "${value}"`);
  }
}

module.exports = jsonParseWithGoodError;
