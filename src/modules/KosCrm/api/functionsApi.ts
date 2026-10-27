/**
 * CRM Functions API - Gatekeeper Gateway
 * KOSUN26 Gate 3: All external API operations route through executeKosaiAi.
 */

import { executeKosaiAi } from '../../KosAi/modelsAiService';

export interface CloudFunctionProxyOptions {
  functionUrl?: string;
  authToken?: string;
}

/**
 * Executes a model generation call strictly through KOSAI ModelsAiService monopoly
 */
export async function callGeminiApi<T = any>(params: {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  model?: string;
  apiKey?: string;
  proxyOptions?: CloudFunctionProxyOptions;
}): Promise<T | null> {
  try {
    const res = await executeKosaiAi<T>('crm-analytics', params.prompt, {
      model: 'gemini-3.8-flash-lite',
      customApiKey: params.apiKey,
      imageBase64: params.imageBase64,
      imageMimeType: params.imageMimeType,
      responseMimeType: 'application/json',
      maxOutputTokens: 600,
    });
    return res.data;
  } catch (err) {
    console.warn('[CRM FunctionsApi] executeKosaiAi failed:', err);
    return null;
  }
}
