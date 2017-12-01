'use babel';

const EventEmitter = require('events');
const byline = require('byline');
const { makeTextMessage, randId, parseLine } = require('./ioUtils');

class IoToEditor extends EventEmitter {
  constructor(sToEditor, sFromEditor) {
    super();
    this.sToEditor = sToEditor;
    this.sFromEditor = sFromEditor;
    this.deferreds = {};
    this.inProgress = null;
  }

  init() {
    byline(this.sFromEditor).on('data', (line) => {
      // Skip blank lines, unless we're parsing a raw text body
      if ((!line || !line.trim) && (!this.inProgress || !this.inProgress.parsingBody)) {
        return;
      }

      const data = parseLine(line);
      if (data.type === 'msg_start') {
        this.inProgress = {
          reqId: data.reqId,
          bodyBuffer: null,
          parsingBody: false,
        };
      }
      const matches = (this.inProgress && this.inProgress.reqId)
        ? data.reqId === this.inProgress.reqId
        : false;
      if (data.type === 'meta' && matches) {
        this.inProgress.meta = data.value;
      }
      if (data.type === 'content_start' && matches) {
        this.inProgress.bodyBuffer = [];
        this.inProgress.parsingBody = true;
      }

      // When in raw mode, there's no reqId, so we'll just assume it matches
      if (data.type === 'raw' && this.inProgress.parsingBody) {
        this.inProgress.bodyBuffer.push(data.text);
      }
      // Extra important to check reqId here because there could be a line
      // in the raw text body that starts with "SHIDE CONTENT END "
      // but it's nearly impossible for the reqId to also match
      // Works identically to a HEREDOC, but has enough randomness to never
      // match by mistake.
      if (data.type === 'content_end' this.inProgress.parsingBody && && matches) {
        this.inProgress.parsingBody = false;
      }

      // At the end of the message, notify the caller of this request if any
      if (data.type === 'msg_end' && matches) {
        if (this.deferreds[data.reqId]) {
          const response = {
            reqId: this.inProgress.reqId,
            body: this.inProgress.bodyBuffer
              ? this.inProgress.bodyBuffer.join('\n')
              : null,
            meta: this.inProgress.meta || null,
          };

          this.deferreds[data.reqId].resolve(response);
          delete(this.deferreds[data.reqId]);
        }
      }
    });
  }

  performRequest(type, opts = {}, body = {}) {
    const reqId = randId();
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    this.deferreds[reqId] = deferred;

    const msg = makeMessage(reqId, type, opts, body);
    this.sToEditor.write(msg + '\n');

    return deferred.promise;
  }
}
