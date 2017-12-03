function optional(descriptor) {
  return Object.assign({}, descriptor, { optional: true });
}

const ABSOLUTE_PATH = {
  role: 'absolutePath',
  type: 'string',
  description: 'Absolute path to the file',
};

const SUCCESS = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      oneOf: [true],
    }
  },
};

const CURSOR = {
  type: 'object',
  properties: {
    row: { type: 'number' },
    col: { type: 'number' },
    index: { type: 'number' },
    selection: {
      type: 'object',
      properties: {
        text: optional({ type: 'string' }),
        start: {
          type: 'object',
          properties: {
            row: { type: 'number' },
            col: { type: 'number' },
            index: { type: 'number' },
          }
        },
        end: {
          type: 'object',
          properties: {
            row: { type: 'number' },
            col: { type: 'number' },
            index: { type: 'number' },
          },
        },
      },
    },
  },
};

const operations = [
  {
    name: 'getOpenFiles',
    hasEffects: false,
    input: { type: 'null' },
    output: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: ABSOLUTE_PATH,
        },
      },
    }
  },
  {
    name: 'openFile',
    hasEffects: true,
    input: {
      type: 'object',
      properties: {
        path: ABSOLUTE_PATH,
      },
    },
    output: SUCCESS,
  },
  {
    name: 'saveFile',
    hasEffects: true,
    input: {
      type: 'object',
      properties: {
        path: ABSOLUTE_PATH,
      },
    },
    output: SUCCESS,
  },
  {
    name: 'closeAllFiles',
    hasEffects: true,
    input: {
      type: 'object',
      properties: {
        noSave: {
          type: 'boolean',
        },
      },
    },
    output: SUCCESS,
  },
  {
    name: 'getCursor',
    hasEffects: false,
    input: { type: 'null' },
    output: CURSOR,
  },
  {
    name: 'getFileContent',
    hasEffects: false,
    input: {
      type: 'object',
      properties: {
        path: ABSOLUTE_PATH,
      }
    },
    output: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
        }
      },
    },
  },
  {
    name: 'setFileContent',
    hasEffects: true,
    input: {
      type: 'object',
      properties: {
        path: ABSOLUTE_PATH,
        text: { type: 'string' },
        opts: optional({
          type: 'object',
          properties: {
            save: optional({ type: 'boolean' }),
          },
        }),
      },
    },
    output: SUCCESS,
  },
  {
    name: 'getActiveFile',
    hasEffects: false,
    input: { type: 'null' },
    output: {
      type: 'object',
      properties: {
        path: ABSOLUTE_PATH,
      },
    },
  }
];

const schema = {
  operations,
};

module.exports = schema;
