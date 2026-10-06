const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src/modules/whatsapp-green-api-hub/components/WhatsAppStatusesTab.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("useState<'create' | 'archive'>('create')", "useState<'create' | 'archive' | 'automations'>('create')");
content = content.replace(/c\.conta_phone/g, "c.phone");
content = content.replace(/crmContact\?\.conta_name/g, "crmContact?.name");
content = content.replace(/crmContact\.conta_name/g, "crmContact.name");

if (!content.includes('WhatsAppStatusAutomationsTab')) {
    content = content.replace("import { WhatsAppImageStudio } from './WhatsAppImageStudio';", "import { WhatsAppImageStudio } from './WhatsAppImageStudio';\nimport { WhatsAppStatusAutomationsTab } from './WhatsAppStatusAutomationsTab';");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed');
