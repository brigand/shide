'use babel';

import fuzzy from 'fuzzy';

function normal(q, xs, _extract) {
  let extract = _extract;
  if (typeof _extract === 'string') extract = val => val[_extract];
  if (!extract) extract = val => val.text;

  return fuzzy.filter(q, xs, { extract }).map(x => x.original);
}

// TODO: implement this, will eventually filter based on the first characters
// of identifiers, e.g. FooBar-Qux would strongly match 'fbq'
// and we sort on that
//
// function getIdentParts(str) {
//   const parts = str
//     .replace(/([A-Z]+)/g, (m) => `-${m.toLowerCase()}-`)
//     .split(/[^\d\w]+/)
//     .filter(Boolean);
//
//   const firsts = parts.map(x => x[0].toLowerCase());
//   return { parts, firsts };
// }
//
// function identifier(q, xs) {
//   const matches = fuzzy.filter(q, xs).map(x => x.original);
//
//   function score(str) {
//     const { firsts } = getIdentParts(str);
//     let score = 0;
//     let siMatched = 0;
//     for (let qi = 0; qi < q.length; qi += 1) {
//       const qc = q[qi];
//       for (let si2 = siMatched; si2 <= )
//     }
//   }
// }

export default { normal };
