import fs from 'fs';

let fa = fs.readFileSync('src/modules/page-builder/api/functionsApi.ts', 'utf8');

fa = fa.replace(
  /generationConfig: \{\n\s*temperature: options\.temperature \?\? 0\.7,\n\s*responseMimeType: options\.responseMimeType \?\? 'application\/json',\n\s*\}/g,
  `generationConfig: {
          temperature: options.temperature ?? 0.7,
          ...(options.responseMimeType === 'application/json' ? { responseMimeType: 'application/json' } : {})
        }`
);

fs.writeFileSync('src/modules/page-builder/api/functionsApi.ts', fa);
