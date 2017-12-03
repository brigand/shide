const fs = require('fs');
const schema = require('../src/data/schema.js');
const outfile = `src/generated/runtime.gen.js`;

const indent = `    `; // for inside methods
let file = `// This file is generated by ${__filename}\n`;
file += `const assert = require('assert');\n`;
file += `const { inspect } = require('util');\n\n`;

file += `class BaseGeneratedRuntime {\n`;

let methods = [];
schema.operations.forEach((op) => {
  const { name, input, output } = op;

  const inProps = input.type === 'object'
    ? Object.keys(input.properties)
    : null;
  const outProps = output.type === 'object'
    ? Object.keys(output.properties)
    : null;

  let method = ``;
  method += `  async ${name}(`;
  if (inProps) {
    method += `input`;
  }

  method += `) {\n`;
  if (inProps) {
    method += makeAssertions(input, ['input'], 2).join('\n') + '\n\n';
  }
  method += `\n${indent}const res = await this.io.performRequest('${name}', {}`
  if (inProps) {
    method += `, {\n`;
    method += inProps.map(x => `${indent}${indent}${x}: input.${x},`).join('\n');
    method += `\n${indent}}`;
  }
  method += ');\n\n';

  if (outProps) {
    method += makeAssertions(output, ['res', 'body'], 2).join('\n') + '\n\n';
  }

  method += `${indent}return res.body;\n`
  method += `  }`;

  methods.push(method);
});

file += methods.join('\n\n');
file += '\n}\nmodule.exports = BaseGeneratedRuntime;';
console.log(file);
fs.writeFileSync(outfile, file);

function makeAssertions(item, parentPath, indentCount) {
  const results = [];
  const indent = `  `.repeat(indentCount);
  const base = parentPath.join('.');
  const insp = `but got \${inspect(${base})}`;

  function makeAssert(method, first, second, error) {
    return `try { assert.${method}(${first}, ${second}) } catch (e) {\n${indent + ` `.repeat(2)}throw new Error(\`${error}\`) }`;
  }

  if (item.type === 'string' && !item.optional) {
    results.push(indent + makeAssert('equal', `typeof ${base}`, `'string'`,
      `Expected ${base} to be a string ${insp}`,
    ));
  }
  if (item.type === 'number' && !item.optional) {
    results.push(indent + makeAssert('equal', `typeof ${base}`, `'number'`,
      `Expected ${base} to be a number ${insp}`,
    ));
  }
  if (item.type === 'array' && !item.optional) {
    results.push(indent + makeAssert('equal', `Array.isArray(${base})`, `true`,
      `Expected ${base} to be an array ${insp}`,
    ));
  }
  if (item.type === 'boolean' && !item.optional) {
    results.push(indent + makeAssert('equal', `typeof ${base}`, `'boolean'`,
      `Expected ${base} to be a boolean ${insp}`,
    ));
  }

  if (item.type === 'object') {
    const first = makeAssert('equal', `!!${base}`, `true`,
      `Expected ${base} to be an object ${insp}`,
    );
    const second = makeAssert('equal', `typeof ${base}`, `'object'`,
      `Expected ${base} to be an object ${insp}`,
    );

    if (!item.optional) {
      results.push(indent + first);
      results.push(indent + second);
      Object.keys(item.properties).map((key) => {
        const sub = item.properties[key];
        results.push(
          ...makeAssertions(sub, parentPath.concat([key]), indentCount),
        );
      });
    } else {
      results.push(`${indent}if (${base}) {`);
      results.push(`${indent}  ${second}`);
      Object.keys(item.properties).map((key) => {
        const sub = item.properties[key];
        results.push(...makeAssertions(sub, parentPath.concat([key]), indentCount + 1).join('\n'));
      });
      results.push(`${indent}}`);
    }
  }

  return results;
}
