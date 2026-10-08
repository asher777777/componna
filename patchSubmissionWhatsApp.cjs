const fs = require('fs');
const p = 'src/modules/smart-form-builder/services/submissionStorageService.ts';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes("import { processSubmissionWhatsAppAutomations } from './formWhatsAppService'")) {
  c = "import { processSubmissionWhatsAppAutomations } from './formWhatsAppService';\n" + c;
}
c = c.replace(/const \{ processSubmissionWhatsAppAutomations \} = await import\('.\/formWhatsAppService'\);/g, '');

fs.writeFileSync(p, c);
console.log('submissionStorageService WhatsApp Patched');
