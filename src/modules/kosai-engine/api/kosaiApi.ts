import { resolveApiKey as defaultResolveApiKey, callGeminiApi as coreCallGeminiApi } from '../../page-builder/api/functionsApi';
import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai/geminiCostTracker';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';

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
    : getModuleGeminiKey('kosai-engine') || getModuleGeminiKey('page-builder') || defaultResolveApiKey();
  
  const model = 'gemini-3.8-flash';

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

  // Try direct fetch with primary model and automatic fallback to gemini-1.5-flash if needed
  const modelsToTry = [model, 'gemini-1.5-flash'];
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
  toneOfVoice: { professionalism: number, detail: number, creativity: number }
): Promise<{ prompt: string, usage: TokenUsageReport }> => {
  
  const systemInstruction = `You are a world-class prompt engineer and AI system designer for Kosun's KOSAI engine.
Your task is to write a highly effective, professional system prompt IN HEBREW for a new AI assistant acting inside the component "${moduleName}".

Here is the assistant's profile:
- Granted Capabilities (Tools): ${capabilities.length > 0 ? capabilities.join(', ') : 'None'}
- Authorized Data Sources (Collections): ${allowedDataSources.length > 0 ? allowedDataSources.join(', ') : 'None'}
- Tone of Voice Profile (0-100 scale):
  * Professionalism: ${toneOfVoice.professionalism} (0=Casual/Funny, 100=Strict/Formal)
  * Detail: ${toneOfVoice.detail} (0=Short/Concise, 100=Highly detailed and elaborate)
  * Creativity: ${toneOfVoice.creativity} (0=Conservative/Safe, 100=Bold/Creative)

Instructions:
1. Write ONLY the final system prompt in Hebrew that will be injected into the AI.
2. The prompt should explicitly tell the AI what its persona is based on the tone of voice sliders.
3. The prompt should explain to the AI what tools it has and what data it can access.
4. Do NOT wrap the response in markdown blocks (no \`\`\` text). Return plain text only.`;

  const model = 'gemini-2.5-flash';

  const response = await coreCallGeminiApi({
    prompt: `Please generate the system prompt for the "${moduleName}" assistant.`,
    systemInstruction,
    responseMimeType: 'text/plain',
    model,
    timeoutMs: 60000,
  });

  const usage = calculateGeminiCost({
    model,
    promptTokens: response.usageMetadata?.promptTokenCount || 50,
    candidatesTokens: response.usageMetadata?.candidatesTokenCount || 100,
  });

  if (!response.success || response.isFallback) {
    let errorReason = response.error || 'שגיאה לא ידועה';
    if (errorReason === 'NO_API_KEY_FOUND') {
      errorReason = 'חסר מפתח API של Google Gemini בהגדרות.';
    }
    return {
      prompt: `[שגיאה בניסוח אוטומטי - אנא בדוק הגדרות] 
הסיבה: ${errorReason}

אתה עוזר AI מקצועי. המטרה שלך היא לעזור למשתמש לנהל את המודול הנוכחי.`,
      usage
    };
  }
  let textData = typeof response.data === 'string' ? response.data.trim() : JSON.stringify(response.data);

  return {
    prompt: textData,
    usage
  };
};
