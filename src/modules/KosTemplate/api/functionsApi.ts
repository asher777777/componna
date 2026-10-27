import { AIPromptPayload, AIPromptResponse } from '../types';

export async function callTemplateAIFunction(
  baseUrl: string | undefined,
  payload: AIPromptPayload
): Promise<AIPromptResponse> {
  const url = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/processTemplateAI`
    : '/api/processTemplateAI';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      result: '',
      error: error.message || 'Unknown network error',
    };
  }
}
