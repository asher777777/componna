const fs = require('fs');
const p = 'src/modules/smart-form-builder/services/submissionStorageService.ts';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes("import { eventBus } from '../../../core/bridge/EventBus'")) {
  c = "import { eventBus } from '../../../core/bridge/EventBus';\n" + c;
}
c = c.replace(/const \{ eventBus \} = await import\('..\/..\/..\/core\/bridge\/EventBus'\);/g, '');

fs.writeFileSync(p, c);
console.log('submissionStorageService Patched');
