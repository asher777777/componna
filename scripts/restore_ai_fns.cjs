const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', 'utf8');

const objectionFn = `export async function generateAiObjection(brand: BrandDna, apiKey?: string): Promise<any> {
  const finalKey = apiKey || getModuleGeminiKey('brand-dna-hub');
  if (!finalKey) return null;

  const systemPrompt = buildBrandSystemContext(brand);
  const userPrompt = \`Based on our Brand DNA, generate a completely new, realistic, and challenging customer objection, along with an excellent, persuasive rebuttal.
Do not repeat existing ones: \${brand.audience.commonObjections.map(o => o.objection).join(' | ')}.

Return ONLY a valid JSON object with EXACTLY these keys:
{
  "objection": "e.g. זה יקר לי מדי",
  "rebuttal": "The perfect answer to overcome this objection"
}\`;

  try {
    const response = await executeWithGeminiFallback(finalKey, {
      systemInstruction: systemPrompt,
      userPrompt: userPrompt,
      temperature: 0.7,
      responseSchema: {
        type: 'object',
        properties: {
          objection: { type: 'string' },
          rebuttal: { type: 'string' }
        },
        required: ['objection', 'rebuttal']
      }
    });
    return JSON.parse(response.text);
  } catch(e) {
    console.error('Failed to generate Objection:', e);
    return null;
  }
}`;

const ecoFn = `export async function generateAiEcosystemItems(brand: BrandDna, category: string, currentItems: string[], apiKey?: string): Promise<string[]> {
  const finalKey = apiKey || getModuleGeminiKey('brand-dna-hub');
  if (!finalKey) return [];

  const systemPrompt = buildBrandSystemContext(brand);
  const userPrompt = \`Based on our Brand DNA, suggest 3 completely new, highly relevant '\${category}' for our brand ecosystem.
Do not repeat any of our existing \${category}: \${currentItems.join(', ')}.

Return ONLY a valid JSON object with EXACTLY this key:
{
  "items": ["item 1", "item 2", "item 3"]
}\`;

  try {
    const response = await executeWithGeminiFallback(finalKey, {
      systemInstruction: systemPrompt,
      userPrompt: userPrompt,
      temperature: 0.7,
      responseSchema: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'string' } }
        },
        required: ['items']
      }
    });
    const parsed = JSON.parse(response.text);
    return parsed.items || [];
  } catch(e) {
    console.error('Failed to generate Ecosystem items:', e);
    return [];
  }
}`;

c += '\n' + objectionFn + '\n' + ecoFn;
fs.writeFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', c);
