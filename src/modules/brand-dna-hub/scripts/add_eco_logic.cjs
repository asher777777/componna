const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', 'utf8');

const ecoFunction = `export async function generateAiEcosystemItems(brand: BrandDna, category: string, currentItems: string[], apiKey?: string): Promise<string[]> {
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
      prompt: userPrompt,
      temperature: 0.7,
      responseSchema: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'string' } }
        },
        required: ['items']
      }
    });
    const parsed = JSON.parse(response);
    return parsed.items || [];
  } catch(e) {
    console.error('Failed to generate Ecosystem items:', e);
    return [];
  }
}`;

c += '\n' + ecoFunction;
fs.writeFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', c);
