const fs = require('fs');

const filesToUpdate = [
  'src/modules/whatsapp-green-api-hub/components/WhatsAppAiBotTab.tsx',
  'src/modules/whatsapp-green-api-hub/services/whatsappAiBotService.ts',
  'src/modules/kosai-engine/api/kosaiApi.ts',
  'src/modules/kosai-engine/prompts/index.ts',
  'src/modules/saas-storefront-composer/services/aiSalesAgentService.ts',
  'src/modules/whatsapp-green-api-hub/components/WhatsAppGreenApiMainView.tsx',
  'src/pages/HomePage.tsx',
  'src/modules/page-builder/registry/sectionRegistry.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Comona with Cashwan in prompts and user-facing text
    content = content.replace(/Comona's/g, "Cashwan's");
    content = content.replace(/Comona/g, "Cashwan");
    content = content.replace(/קומפונה/g, "קשוואן");
    
    // Replace "סטודיו דיגיטל פרו" or "סמארט דיגיטל פרו" with generic "[שם העסק]"
    content = content.replace(/סטודיו דיגיטל פרו/g, "סטודיו קריאייטיב");
    content = content.replace(/סמארט דיגיטל פרו/g, "סטודיו קריאייטיב");

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  } else {
    console.log('Not found:', file);
  }
});
