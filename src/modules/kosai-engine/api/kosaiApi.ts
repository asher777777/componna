import { callGeminiApi as coreCallGeminiApi } from '../../page-builder/api/functionsApi';
import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai/geminiCostTracker';

interface KosaiApiOptions {
  prompt: string;
  systemInstruction?: string;
  imageBase64?: string;
}

export interface KosaiApiResponse<T = any> {
  data: T;
  usageReport: TokenUsageReport;
}

export const callGeminiApi = async ({ prompt, systemInstruction, imageBase64 }: KosaiApiOptions): Promise<KosaiApiResponse> => {
  const imageParts = imageBase64 
    ? [{ 
        inlineData: { 
          data: imageBase64.split(',')[1] || imageBase64, 
          mimeType: imageBase64.split(';')[0].split(':')[1] || 'image/png' 
        } 
      }]
    : undefined;

  const model = imageBase64 ? 'gemini-1.5-pro-vision' : 'gemini-3.8-flash';

  const response = await coreCallGeminiApi({
    prompt,
    systemInstruction,
    responseMimeType: 'application/json',
    model,
    imageParts,
    timeoutMs: 60000,
  });

  const usageReport = calculateGeminiCost({
    model,
    promptTokens: response.usageMetadata?.promptTokenCount || 10,
    candidatesTokens: response.usageMetadata?.candidatesTokenCount || 20,
  });

  return {
    data: response.data,
    usageReport
  };
};

export const generateAgentPromptWithAi = async (
  moduleName: string, 
  capabilities: string[], 
  allowedDataSources: string[], 
  toneOfVoice: { professionalism: number, detail: number, creativity: number }
): Promise<{ prompt: string, usage: TokenUsageReport }> => {
  
  const systemInstruction = `You are a world-class prompt engineer and AI system designer for Comona's KOSAI engine.
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

  const model = 'gemini-3.8-flash';

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
