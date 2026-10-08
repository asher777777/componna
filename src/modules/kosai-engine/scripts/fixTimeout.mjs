import fs from 'fs';

let ka = fs.readFileSync('src/modules/kosai-engine/api/kosaiApi.ts', 'utf8');

ka = ka.replace(
  /timeoutMs: 15000/g,
  `timeoutMs: 60000`
);

fs.writeFileSync('src/modules/kosai-engine/api/kosaiApi.ts', ka);
