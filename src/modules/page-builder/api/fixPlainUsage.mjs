import fs from 'fs';

let fa = fs.readFileSync('src/modules/page-builder/api/functionsApi.ts', 'utf8');

fa = fa.replace(
  /return \{\n\s*success: true,\n\s*data: cleaned as unknown as T,\n\s*\};/,
  `return {
      success: true,
      data: cleaned as unknown as T,
      usageMetadata: result.usageMetadata,
    };`
);

fs.writeFileSync('src/modules/page-builder/api/functionsApi.ts', fa);
