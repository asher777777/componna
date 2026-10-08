const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', 'utf8');

const flagshipFn = `export async function generateAiFlagshipProduct(idea: string, brand: BrandDna, apiKey?: string): Promise<any> {
  const finalKey = apiKey || getModuleGeminiKey('brand-dna-hub');
  if (!finalKey) return null;

  const systemPrompt = buildBrandSystemContext(brand);
  const userPrompt = \`Based on our Brand DNA and the user's idea: "\${idea}", generate a detailed Flagship Product profile.

Return ONLY a valid JSON object with EXACTLY these keys:
{
  "nameAndSlogan": "שם המוצר + סלוגן",
  "shortDescription": "תיאור קצר",
  "longDescription": "תיאור ארוך עבור SEO וקידום AI (מפורט)",
  "painPointSolved": "נקודת הכאב שהמוצר פותר",
  "targetAudience": "קהל היעד שמתאים",
  "competitiveAdvantage": "המעלה על המתחרים"
}\`;

  try {
    const response = await executeWithGeminiFallback(finalKey, {
      systemInstruction: systemPrompt,
      userPrompt: userPrompt,
      temperature: 0.7,
      responseSchema: {
        type: 'object',
        properties: {
          nameAndSlogan: { type: 'string' },
          shortDescription: { type: 'string' },
          longDescription: { type: 'string' },
          painPointSolved: { type: 'string' },
          targetAudience: { type: 'string' },
          competitiveAdvantage: { type: 'string' }
        },
        required: ['nameAndSlogan', 'shortDescription', 'longDescription', 'painPointSolved', 'targetAudience', 'competitiveAdvantage']
      }
    });
    return JSON.parse(response.text);
  } catch(e) {
    console.error('Failed to generate Flagship Product:', e);
    return null;
  }
}`;

c += '\n' + flagshipFn;
fs.writeFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', c);
