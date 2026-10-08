const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', 'utf8');

const newFunctions = `
export async function generateAiPersona(brand: BrandDna, apiKey?: string): Promise<any> {
  const finalKey = apiKey || getModuleGeminiKey('brand-dna-hub');
  if (!finalKey) return null;

  const systemPrompt = buildBrandSystemContext(brand);
  const userPrompt = \`Based on our Brand DNA, generate a completely new, realistic, and highly detailed Target Audience Persona.
Do not repeat the ones we already have: \${brand.audience.personas.map(p => p.name).join(', ')}.

Return ONLY a valid JSON object with EXACTLY these keys:
{
  "name": "e.g. דן, בעל עסק",
  "role": "e.g. מנהל שיווק",
  "pain": "The main pain point",
  "dream": "The ultimate dream outcome"
}\`;

  try {
    const response = await executeWithGeminiFallback(finalKey, {
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      responseSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          role: { type: 'string' },
          pain: { type: 'string' },
          dream: { type: 'string' }
        },
        required: ['name', 'role', 'pain', 'dream']
      }
    });
    return JSON.parse(response);
  } catch(e) {
    console.error('Failed to generate Persona:', e);
    return null;
  }
}

export async function generateAiObjection(brand: BrandDna, apiKey?: string): Promise<any> {
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
      prompt: userPrompt,
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
    return JSON.parse(response);
  } catch(e) {
    console.error('Failed to generate Objection:', e);
    return null;
  }
}
`;

c += '\n' + newFunctions;
fs.writeFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', c);
