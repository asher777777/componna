const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src/modules/whatsapp-green-api-hub/components/WhatsAppStatusesTab.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("import { WhatsAppStatusAutomationsTab }")) {
    content = content.replace("import { WhatsAppImageStudio } from './WhatsAppImageStudio';", "import { WhatsAppImageStudio } from './WhatsAppImageStudio';\nimport { WhatsAppStatusAutomationsTab } from './WhatsAppStatusAutomationsTab';");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed');
