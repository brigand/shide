
const MappedFile = require('../src/mapped/MappedFile');

const map = new MappedFile();
const initial = map.init({
  ranges: [
    { path: '/tmp/b', startRow: 5, endRow: 6 },
    { path: '/tmp/a', startRow: 1, endRow: 5 },
    { path: '/tmp/b', startRow: 2, endRow: 3 },
  ]
});

console.log(initial.mappedOriginal);
console.log(`>>>>> Mapping`);
console.log(initial.mappedFile);

console.log(`>>> Going to update`);

initial.mappedFile = initial.mappedFile.replace(/a line 3/, `a updated line 3\nand another line`);

const map2 = new MappedFile(initial);
const out = map2.applyFiles()

for (const file of out) {
  console.log(`> ${file.path}`);
  console.log(`${file.content}\n`);
}

