const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', 'utf8');

const marketAgentFn = `export async function runMarketResearchAgent(brand: BrandDna, apiKey?: string): Promise<any> {
  const finalKey = apiKey || getModuleGeminiKey('brand-dna-hub');
  if (!finalKey) return null;

  const systemPrompt = buildBrandSystemContext(brand);
  const userPrompt = \`You are a top-tier Market Research AI Agent.
Analyze the following Brand DNA and its industry in the Israeli/Global market.

Return a valid JSON object with the following structure:
{
  "marketTrends": ["Trend 1", "Trend 2", "Trend 3"],
  "competitors": [
    { "name": "Competitor Name", "strengths": "What they do well", "weaknesses": "Their gaps", "pricingTier": "High/Medium/Low" }
  ],
  "competitiveness": "A paragraph analyzing our competitive advantage and market gaps.",
  "pricingRecommendations": "A paragraph with strategic pricing advice based on our UVP.",
  "designLanguageRecommendations": "A paragraph suggesting colors, fonts, and vibe to stand out.",
  "actionableUpdates": {
    "slogan": "A suggested better slogan (leave empty if current is great)",
    "primaryColor": "A suggested hex color to stand out (leave empty if current is great)",
    "newService": "A suggested new service to add to the ecosystem (leave empty if none)"
  }
}\`;

  try {
    const response = await executeWithGeminiFallback(finalKey, {
      systemInstruction: systemPrompt,
      userPrompt: userPrompt,
      temperature: 0.7,
      responseSchema: {
        type: 'object',
        properties: {
          marketTrends: { type: 'array', items: { type: 'string' } },
          competitors: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: {
                name: { type: 'string' },
                strengths: { type: 'string' },
                weaknesses: { type: 'string' },
                pricingTier: { type: 'string' }
              }
            } 
          },
          competitiveness: { type: 'string' },
          pricingRecommendations: { type: 'string' },
          designLanguageRecommendations: { type: 'string' },
          actionableUpdates: {
            type: 'object',
            properties: {
              slogan: { type: 'string' },
              primaryColor: { type: 'string' },
              newService: { type: 'string' }
            }
          }
        },
        required: ['marketTrends', 'competitors', 'competitiveness', 'pricingRecommendations', 'designLanguageRecommendations']
      }
    });
    return JSON.parse(response.text);
  } catch(e) {
    console.error('Failed to run market research agent:', e);
    return null;
  }
}`;

c += '\n' + marketAgentFn;
fs.writeFileSync('src/modules/brand-dna-hub/services/geminiBrandPrompt.ts', c);
