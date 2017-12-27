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

const CURSOR_INPUT = {
  type: 'object',
  properties: {
    row: optional({ type: 'number' }),
    col: optional({ type: 'number' }),
    index: optional({ type: 'number' }),
    selection: optional({
      type: 'object',
      properties: {
        text: optional({ type: 'string' }),
        start: optional({
          type: 'object',
          properties: {
            row: optional({ type: 'number' }),
            col: optional({ type: 'number' }),
            index: optional({ type: 'number' }),
          },
        }),
        end: optional({
          type: 'object',
          properties: {
            row: optional({ type: 'number' }),
            col: optional({ type: 'number' }),
            index: optional({ type: 'number' }),
          },
        }),
      },
    }),
  },
};

const operations = [
  {
    name: 'log',
    hasEffects: true,
    input: {
      type: 'object',
      properties: {
        level: { type: 'string' },
        message: { type: 'string' },
      },
    },
    output: { type: 'null' }
  },
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
        cursor: optional(CURSOR_INPUT),
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
    name: 'setCursor',
    hasEffects: false,
    input: CURSOR_INPUT,
    output: SUCCESS,
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
        cursor: optional(CURSOR_INPUT),
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
  },
  {
    name: 'prompt',
    hasEffects: false,
    input: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    output: {
      type: 'object',
      properties: {
        response: { type: 'string' },
      },
    },
  },
  {
    name: 'select',
    hasEffects: false,
    input: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        fuzzyType: optional({ type: 'string' }),
        options: { type: 'array' },
      },
    },
    output: {
      type: 'object',
      properties: {
        response: { type: 'any' },
      },
    },
  },
];

const schema = {
  operations,
};

module.exports = schema;
