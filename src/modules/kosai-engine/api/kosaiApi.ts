import { callGeminiApi as coreCallGeminiApi } from '../../page-builder/api/functionsApi';

interface KosaiApiOptions {
  prompt: string;
  systemInstruction?: string;
  imageBase64?: string;
}

export const callGeminiApi = async ({ prompt, systemInstruction, imageBase64 }: KosaiApiOptions) => {
  const imageParts = imageBase64 
    ? [{ 
        inlineData: { 
          data: imageBase64.split(',')[1] || imageBase64, 
          mimeType: imageBase64.split(';')[0].split(':')[1] || 'image/png' 
        } 
      }]
    : undefined;

  return await coreCallGeminiApi({
    prompt,
    systemInstruction,
    responseMimeType: 'application/json',
    model: imageBase64 ? 'gemini-1.5-pro-vision' : 'gemini-1.5-flash',
    imageParts,
    timeoutMs: 60000,
  });
};
