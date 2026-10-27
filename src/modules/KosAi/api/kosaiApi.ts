import { resolveApiKey as defaultResolveApiKey, callGeminiApi as coreCallGeminiApi } from '../../KosWebAi/api/functionsApi';
import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai/geminiCostTracker';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { TenantTokenTracker } from '../../../core/ai/tenantTokenTracker';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';

interface KosaiApiOptions {
  prompt: string;
  systemInstruction?: string;
  imageBase64?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  cachedContentId?: string;
  apiKey?: string;
}

export interface KosaiApiResponse<T = any> {
  data: T;
  usageReport: TokenUsageReport;
  cachedContentId?: string;
}

function extractJsonFromText(raw: string): any {
  if (!raw || typeof raw !== 'string') return raw;
  let cleaned = raw.trim();

  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // Find outermost JSON object
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const candidateJson = cleaned.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(candidateJson);
    } catch {
      // If parsing fails due to unescaped newlines in string properties, try sanitizing
      try {
        const sanitized = candidateJson.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === '\n') return '\\n';
          if (match === '\r') return '\\r';
          if (match === '\t') return '\\t';
          return '';
        });
        return JSON.parse(sanitized);
      } catch {
        // Continue to fallback
      }
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      message: cleaned,
      action: 'NONE',
      payload: {}
    };
  }
}

export const callGeminiApi = async ({ 
  prompt, 
  systemInstruction, 
  imageBase64,
  history,
  cachedContentId,
  apiKey: customApiKey
}: KosaiApiOptions): Promise<KosaiApiResponse> => {
  const apiKey = (customApiKey && customApiKey.trim().length > 5)
    ? customApiKey.trim()
    : getModuleGeminiKey('kosai-engine') || getModuleGeminiKey('KosWebAi') || defaultResolveApiKey();
  
  const model = 'gemini-3.8-flash-lite';

  if (!apiKey) {
    return {
      data: {
        message: 'שלום! כדי שאוכל לענות בזמן אמת ולבצע פעולות עיצוב חכמות עם בינה מלאכותית, אנא הגדר מפתח Google Gemini API בהגדרות הסוכן ⚙️ או בהגדרות הטננט. בינתיים, אני כאן לרשותך בכל שאלה על המערכת והעמודים.',
        action: 'NONE',
        payload: {}
      },
      usageReport: calculateGeminiCost({ model, promptTokens: 0, candidatesTokens: 0 })
    };
  }

  // Try direct fetch with primary model and automatic fallback to flash-lite if needed
  const modelsToTry = [model, 'gemini-3.8-flash-lite'];
  for (const currentModel of Array.from(new Set(modelsToTry))) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
      const contents: any[] = [];

      // Add conversation history if present
      if (history && history.length > 0) {
        for (const item of history) {
          if (!item.content || item.content.startsWith('היי! אני קושאן AI') || item.content.startsWith('היי! אני KOSAI')) continue;
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }]
          });
        }
      }

      // Add current turn
      const currentParts: any[] = [{ text: prompt }];
      if (imageBase64) {
        currentParts.push({
          inlineData: {
            data: imageBase64.split(',')[1] || imageBase64,
            mimeType: imageBase64.split(';')[0]?.split(':')[1] || 'image/png'
          }
        });
      }
      contents.push({
        role: 'user',
        parts: currentParts
      });

      const requestBody: any = {
        contents,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      // Attach Gemini Context Cache ID if available
      if (cachedContentId) {
        requestBody.cachedContent = cachedContentId;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const result = await res.json();
        const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = extractJsonFromText(candidateText || '');

        const usageReport = calculateGeminiCost({
          model: currentModel,
          promptTokens: result.usageMetadata?.promptTokenCount || 20,
          candidatesTokens: result.usageMetadata?.candidatesTokenCount || 40,
        });

        const activeTenant = (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || ROOT_TENANT_ID;
        TenantTokenTracker.recordTokenUsage(
          activeTenant,
          'chatbot',
          usageReport.totalTokens,
          { costUSD: usageReport.estimatedCostUSD }
        ).catch(() => {});

        return {
          data: parsed,
          usageReport,
          cachedContentId: result.cachedContent || cachedContentId
        };
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[KOSAI API] ${currentModel} returned ${res.status}:`, errText);
      }
    } catch (directErr) {
      console.warn(`[KOSAI API] ${currentModel} fetch error:`, directErr);
    }
  }

  // Fallback to coreCallGeminiApi with gemini-1.5-flash
  const imageParts = imageBase64 
    ? [{ 
        inlineData: { 
          data: imageBase64.split(',')[1] || imageBase64, 
          mimeType: imageBase64.split(';')[0].split(':')[1] || 'image/png' 
        } 
      }]
    : undefined;

  const response = await coreCallGeminiApi({
    prompt,
    systemInstruction,
    responseMimeType: 'application/json',
    model: 'gemini-1.5-flash',
    imageParts,
    timeoutMs: 60000,
  });

  const usageReport = calculateGeminiCost({
    model: 'gemini-1.5-flash',
    promptTokens: response.usageMetadata?.promptTokenCount || 10,
    candidatesTokens: response.usageMetadata?.candidatesTokenCount || 20,
  });

  const parsed = typeof response.data === 'string' ? extractJsonFromText(response.data) : response.data;

  return {
    data: parsed || {
      message: 'לא התקבלה תשובה תקינה משרתי ה-AI. אנא נסה שוב או בדוק את מפתח ה-API בהגדרות.',
      action: 'NONE',
      payload: {}
    },
    usageReport,
    cachedContentId
  };
};

export const generateAgentPromptWithAi = async (
  moduleName: string, 
  capabilities: string[], 
  allowedDataSources: string[], 
  toneOfVoice: { professionalism: number, detail: number, creativity: number },
  brandDna?: any
): Promise<{ prompt: string; usage: TokenUsageReport; error?: string }> => {
  
  // Extract concise Brand DNA essence (Dense & Low-Token)
  const brandName = brandDna?.identity?.companyName || brandDna?.identity?.name || 'העסק';
  const slogan = brandDna?.identity?.slogan ? `"${brandDna.identity.slogan}"` : '';
  const vision = brandDna?.identity?.companyVision || brandDna?.identity?.organizationPurpose || '';
  const uvp = brandDna?.audience?.mainUvp || '';
  const powerWords = brandDna?.voice?.powerWords?.length > 0 ? brandDna.voice.powerWords.join(', ') : '';
  const forbiddenWords = brandDna?.voice?.forbiddenWords?.length > 0 ? brandDna.voice.forbiddenWords.join(', ') : '';
  const addressing = brandDna?.voice?.genderAddressing || 'plural';

  const brandContextBlock = `
Brand Profile:
- Company/Brand Name: ${brandName}
${slogan ? `- Slogan: ${slogan}` : ''}
${vision ? `- Vision/Purpose: ${vision}` : ''}
${uvp ? `- Unique Value Proposition: ${uvp}` : ''}
${powerWords ? `- Mandatory Power Words (use naturally): ${powerWords}` : ''}
${forbiddenWords ? `- FORBIDDEN WORDS (strictly prohibited): ${forbiddenWords}` : ''}
- Addressing: ${addressing}
`.trim();

  const systemInstruction = `You are an elite prompt engineer for Kosun KOSAI engine.
Your task is to write a precise, powerful, and TOKEN-EFFICIENT system prompt IN HEBREW for an AI agent operating inside the "${moduleName}" module.

${brandContextBlock}

Assistant Profile:
- Granted Capabilities (Tools): ${capabilities.length > 0 ? capabilities.join(', ') : 'Standard conversation & assistance'}
- Authorized Data Sources: ${allowedDataSources.length > 0 ? allowedDataSources.join(', ') : 'Standard module context'}
- Tone of Voice Profile (0-100 scale):
  * Professionalism: ${toneOfVoice.professionalism} (0=Casual/Warm, 100=Formal/Authoritative)
  * Detail: ${toneOfVoice.detail} (0=Concise/Punchy, 100=Elaborate)
  * Creativity: ${toneOfVoice.creativity} (0=Conservative/Safe, 100=Bold/Creative)

STRICT TOKEN & FORMULATION RULES:
1. TOKEN BUDGET: Keep the prompt compact and direct (strictly between 60 to 120 words). Do not waste tokens on filler or long preambles.
2. IDENTITY & BRAND: Define the agent as the official assistant of "${brandName}". It must represent the brand voice and UVP.
3. STRUCTURE:
   - Role & Brand Identity (1-2 sentences).
   - Core Mission & Tools (1-2 sentences).
   - Tone & Communication Rules (concise bullet points: zero emojis, professional Hebrew, no hallucinations).
4. OUTPUT FORMAT: Plain text only. No markdown formatting blocks (\`\`\`), no greetings, return ONLY the prompt text ready to be saved.`;

  const model = 'gemini-3.8-flash';

  const response = await coreCallGeminiApi({
    prompt: `Please generate the system prompt for the "${moduleName}" assistant for "${brandName}".`,
    systemInstruction,
    responseMimeType: 'text/plain',
    model,
    timeoutMs: 30000,
  });

  const usage = calculateGeminiCost({
    model,
    promptTokens: response.usageMetadata?.promptTokenCount || 50,
    candidatesTokens: response.usageMetadata?.candidatesTokenCount || 100,
  });

  if (!response.success || response.isFallback || !response.data) {
    // Graceful Degradation: Provide a tailored professional prompt with brand alignment
    let defaultPrompt = `אתה נציג ה-AI הרשמי והשירותי של "${brandName}" ברכיב ${moduleName}.
תפקידך לסייע למשתמש באופן ממוקד, מדויק ומהיר, לקדם את מטרות העסק ${slogan ? `(${slogan})` : ''} ולבצע פעולות בצורה חכמה.
כללי תקשורת: שפה עברית רהוטה ומקצועית, ללא שימוש באימוג'ים, תשובות קצרות וענייניות הממוקדות בתוצאות.`;

    if (moduleName.includes('CRM') || moduleName.includes('אנליטיקה') || moduleName.includes('crm')) {
      defaultPrompt = `אתה סוכן ה-CRM והאנליטיקה הרשמי של "${brandName}".
תפקידך לנתח נתוני לקוחות ועסקאות, לבצע פילוחים מתקדמים ולהפיק תובנות עסקיות ותרשימים אנליטיים בזמן אמת.
הקפד על נתוני אמת בלבד (Zero Hallucination), ללא אימוג'ים, ובטון מקצועי ושירותי.`;
    }

    return {
      prompt: defaultPrompt,
      usage,
      error: response.error
    };
  }
  let textData = typeof response.data === 'string' ? response.data.trim() : JSON.stringify(response.data);

  return {
    prompt: textData,
    usage
  };
};
