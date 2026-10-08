import fs from 'fs';

let ctx = fs.readFileSync('src/modules/kosai-engine/context/KosaiContext.tsx', 'utf8');

ctx = ctx.replace(
  /const response = await callGeminiApi\(\{[\s\S]*?\}\);[\s\S]*?if \(!response\.success \|\| !response\.data\) throw new Error\('No AI response'\);/,
  `const response = await callGeminiApi({
        prompt: content,
        systemInstruction: buildKosaiSystemPrompt(currentRule, brandDna, capabilities),
        imageBase64
      });

      if (!response || !response.data) throw new Error('No AI response');
      
      // LOG USAGE TO FIRESTORE
      if (db && currentRule) {
        import('../services/kosaiFirestoreService').then(({ kosaiRulesService }) => {
          kosaiRulesService.logAiUsage(db, tenantId, {
            ruleId: currentRule.id,
            moduleName: currentRule.moduleId || 'unknown',
            actionType: 'CHAT_MESSAGE',
            usage: response.usageReport
          }).catch(console.error);
        });
      }`
);

fs.writeFileSync('src/modules/kosai-engine/context/KosaiContext.tsx', ctx);
