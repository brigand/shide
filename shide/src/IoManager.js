'use babel';

const EventEmitter = require('events');
const byline = require('byline');
const { makeMessage, randId, parseLine } = require('./ioUtils');
const jsonParseWithGoodError = require('./jsonParseWithGoodError');

class IoManager extends EventEmitter {
  constructor(sOutput, sInput) {
    super();
    this.sOutput = sOutput;
    this.sInput = sInput;
    this.deferreds = {};
    this.inProgress = null;
  }

  init() {
    const sInputs = Array.isArray(this.sInput) ? this.sInput : [this.sInput];

    sInputs.forEach((sInput) => {
      byline(sInput).on('data', (line) => {
        line = String(line);

        // Skip blank lines, unless we're parsing a raw text body
        if ((!line || !line.trim()) && (!this.inProgress || !this.inProgress.parsingBody)) {
          return;
        }

        const data = parseLine(line);
        const matches = !!this.inProgress && !!this.inProgress.reqId;

        if (data.type === 'meta' && matches) {
          this.inProgress.meta = data.value;
          return;
        }
        if (data.type === 'content_start' && matches) {
          this.inProgress.bodyBuffer = [];
          this.inProgress.parsingBody = true;
          return;
        }

        // When in raw mode, there's no reqId, so we'll just assume it matches
        if (this.inProgress && this.inProgress.parsingBody && (!data || data.type !== 'content_end')) {
          this.inProgress.bodyBuffer.push(line);
          return;
        }

        // Extra important to check reqId here because there could be a line
        // in the raw text body that starts with "SHIDE CONTENT END "
        // but it's nearly impossible for the reqId to also match
        // Works identically to a HEREDOC, but has enough randomness to never
        // match by mistake.
        if (this.inProgress && data.type === 'content_end' && this.inProgress.parsingBody && matches) {
          this.inProgress.parsingBody = false;
          return;
        }

        if (data.type === 'msg_start') {
          this.inProgress = {
            reqId: data.reqId,
            subtype: data.subtype,
            bodyBuffer: null,
            parsingBody: false,
          };
          return;
        }

        if (!this.inProgress && data.type === 'log') {
          this.emit('log', data);
          return;
        }

        // At the end of the message, notify the caller of this request if any
        if (data.type === 'msg_end' && matches) {
          const { reqId, subtype, meta, bodyBuffer } = this.inProgress;
          const bodyString = bodyBuffer
            ? bodyBuffer.join('\n')
            : null;
          const body = meta && meta.isJSON && bodyString
            ? jsonParseWithGoodError(bodyString)
            : bodyString;

          const response = {
            reqId,
            body,
            subtype,
            meta: meta || null,
          };

          // The message event is primarily for the IDE process
          // since it's receiving commands
          const reply = (opts, body) => {
            this.sendReply(response.reqId, opts, body);
          };
          const messageEvent = Object.assign({}, response, { reply });
          this.emit('message', messageEvent);

          // The deferreds are primarily for the shell process because
          // it's making requests to the IDE process and expects
          // responses
          if (this.deferreds[data.reqId]) {
            this.deferreds[data.reqId].resolve(response);
            delete this.deferreds[data.reqId];
          }

          // Clear this out, mostly for memory reasons.
          this.inProgress = null;
        }
      });
    });
  }

  performRequest(type, opts = {}, body = null) {
    const reqId = randId();
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    this.deferreds[reqId] = deferred;

    const msg = makeMessage(reqId, type, opts, body);
    this.sOutput.write(msg + '\n');

    return deferred.promise;
  }

  sendReply(reqId, opts = {}, body = null) {
    if (body && typeof body === 'object') {
      body = JSON.stringify(body, null, 2);
      opts.isJSON = true;
    }

    const msg = makeMessage(reqId, 'reply', opts, body);
    this.sOutput.write(msg + '\n');
  }
}

module.exports = IoManager;
