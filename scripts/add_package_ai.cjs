const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', 'utf8');

const packageAiFunction = `export async function generateAiBusinessPackages(brand: BrandDna, apiKey?: string): Promise<any[]> {
  const finalKey = apiKey || getModuleGeminiKey('brand-dna-hub');
  if (!finalKey) return [];

  const systemPrompt = buildBrandSystemContext(brand);
  const userPrompt = \`Based on our Brand DNA and Target Audiences, assemble 3 highly recommended "Business Packages" (חבילות פתרונות ושירותים) that we can offer to businesses. 
Focus ONLY on business solutions and business outcomes, not software or technical terms (e.g. use "Customer Retention System", not "CRM Analytics").

Return ONLY a valid JSON object with EXACTLY this key:
{
  "packages": [
    {
      "name": "שם החבילה",
      "description": "תיאור החבילה ומה היא כוללת",
      "painPointsAddressed": "נקודות הכאב המרכזיות שזה פותר",
      "competitiveAdvantage": "היתרון שלנו על פני המתחרים",
      "targetAudience": "סוג הלקוח האידיאלי לחבילה זו",
      "callToAction": "הצעה עסקית והנעה לפעולה מנוסחת היטב"
    }
  ]
}\`;

  try {
    const response = await executeWithGeminiFallback(finalKey, {
      systemInstruction: systemPrompt,
      userPrompt: userPrompt,
      temperature: 0.7,
      responseSchema: {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                painPointsAddressed: { type: 'string' },
                competitiveAdvantage: { type: 'string' },
                targetAudience: { type: 'string' },
                callToAction: { type: 'string' }
              }
            }
          }
        },
        required: ['packages']
      }
    });
    const parsed = JSON.parse(response.text);
    return parsed.packages || [];
  } catch(e) {
    console.error('Failed to generate Business Packages:', e);
    return [];
  }
}`;

c += '\n' + packageAiFunction;
fs.writeFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', c);
