import fs from 'fs';

let file = fs.readFileSync('src/modules/page-builder/context/BuilderCopilotContext.tsx', 'utf8');

const newTryBlock = `    try {
      const imageParts = imageBase64 
        ? [{ inlineData: { data: imageBase64.split(',')[1] || imageBase64, mimeType: imageBase64.split(';')[0].split(':')[1] || 'image/png' } }]
        : undefined;

      const response = await callGeminiApi({
        prompt: content,
        systemInstruction: getCopilotPrompt(),
        responseMimeType: 'application/json',
        model: imageBase64 ? 'gemini-1.5-pro-vision' : 'gemini-1.5-flash',
        imageParts,
        timeoutMs: 60000,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'No response from AI');
      }

      let parsed;
      try {
        const cleanJson = response.data.replace(/\\s*\\n\\s*/g, ' ').replace(/^[\`\\s]*(json)?\\s*|\\s*[\`\\s]*$/g, '');
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        throw new Error('Failed to parse AI JSON response');
      }

      if (parsed.action === 'ADD_SECTION' && parsed.sectionData) {
        const newSectionId = \`custom_\${Date.now()}\`;
        const newSection = {
          ...parsed.sectionData,
          id: newSectionId,
        };

        if (setConfig && draftConfig) {
          setConfig({
            ...draftConfig,
            sectionOrder: [...draftConfig.sectionOrder, newSectionId],
            sections: {
              ...draftConfig.sections,
              [newSectionId]: newSection
            }
          });
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: parsed.message || 'הפעולה בוצעה בהצלחה!', isLoading: false }
          : m
      ));
    } catch (err) {
      console.error('[Copilot] Error:', err);
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: 'אופס, אירעה שגיאה ביצירת התוכן. נסה שוב.', isLoading: false }
          : m
      ));
    }`;

file = file.replace(/try\s*\{\s*\/\/\s*TODO[\s\S]*?catch\s*\(err\)\s*\{[\s\S]*?\}\s*\)\);\s*\}/, newTryBlock);
fs.writeFileSync('src/modules/page-builder/context/BuilderCopilotContext.tsx', file);
