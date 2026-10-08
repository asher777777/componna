const fs = require('fs');

const file = 'src/modules/kosai-engine/context/KosaiContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `      let parsed;
      try {
        const cleanJson = response.data.replace(/\\s*\\n\\s*/g, ' ').replace(/^[\\\`\\s]*(json)?\\s*|\\s*[\\\`\\s]*$/g, '');
        parsed = JSON.parse(cleanJson);
      } catch {
        throw new Error('Failed to parse Kosai JSON response');
      }`;

const newBlock = `      let parsed;
      try {
        if (typeof response.data === 'string') {
          let cleanJson = response.data.replace(/\\s*\\n\\s*/g, ' ').replace(/^[\\\`\\s]*(json)?\\s*|\\s*[\\\`\\s]*$/g, '');
          parsed = JSON.parse(cleanJson);
        } else {
          parsed = response.data;
        }
      } catch (e) {
        console.error('KOSAI Parsing Error:', e, 'Raw:', response.data);
        throw new Error('Failed to parse Kosai JSON response');
      }`;

if (content.includes("const cleanJson = response.data.replace")) {
  content = content.replace(/let parsed;\s*try {\s*const cleanJson = response\.data\.replace[^}]+}\s*catch[^{]*{\s*throw new Error\('Failed to parse Kosai JSON response'\);\s*}/g, newBlock);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed KosaiContext.tsx parsing block');
} else {
  console.log('Could not find the block');
}
