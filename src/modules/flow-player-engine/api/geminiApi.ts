import { INTENT_ROUTER_SYSTEM_PROMPT, buildIntentPrompt } from '../prompts';
import { VoiceIntentPayload, VoiceIntentResponse } from '../types';

export class GeminiApi {
  /**
   * Route user intent using Google Gemini Flash model
   */
  public static async routeIntentWithGemini(
    payload: VoiceIntentPayload
  ): Promise<VoiceIntentResponse> {
    const apiKey = payload.apiKey || import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[GeminiApi] No Gemini API key provided. Falling back to local keyword matching.');
      return this.localKeywordFallback(payload);
    }

    const allowedIntentsList = Object.keys(payload.allowedIntents);
    const userPrompt = buildIntentPrompt({
      currentNodeInfo: payload.currentNodeInfo || payload.currentNodeId,
      userText: payload.userText,
      allowedIntentsList,
    });

    try {
      // Use gemini-flash-latest for lightning-fast intent recognition
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: INTENT_ROUTER_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn('[GeminiApi] Gemini HTTP warning, trying fallback:', response.status, errText);
        return this.localKeywordFallback(payload);
      }

      const data = await response.json();
      const rawOutputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      let parsed: { intent?: string; confidence?: number; explanation?: string };
      try {
        parsed = JSON.parse(rawOutputText);
      } catch (e) {
        const cleaned = rawOutputText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const detectedIntent = parsed.intent || 'fallback';
      const targetNodeId = payload.allowedIntents[detectedIntent];

      return {
        success: detectedIntent !== 'fallback' && !!targetNodeId,
        intent: detectedIntent,
        nextNodeId: targetNodeId || payload.currentNodeId,
        confidence: parsed.confidence ?? 0.9,
        rawText: payload.userText,
        explanation: parsed.explanation,
      };
    } catch (err: any) {
      console.warn('[GeminiApi] Exception routing intent with Gemini, using fallback:', err);
      return this.localKeywordFallback(payload);
    }
  }

  /**
   * Fast rule/keyword matching fallback if network fails
   */
  private static localKeywordFallback(payload: VoiceIntentPayload): VoiceIntentResponse {
    const text = payload.userText.toLowerCase();
    const allowed = payload.allowedIntents;

    for (const [intentName, targetNodeId] of Object.entries(allowed)) {
      if (
        intentName.includes('pricing') ||
        intentName.includes('price') ||
        intentName.includes('מחיר') ||
        intentName.includes('עלות')
      ) {
        if (
          text.includes('מחיר') ||
          text.includes('כמה') ||
          text.includes('עולה') ||
          text.includes('תשלום') ||
          text.includes('price') ||
          text.includes('cost')
        ) {
          return { success: true, intent: intentName, nextNodeId: targetNodeId, rawText: payload.userText, confidence: 0.85 };
        }
      }
      if (
        intentName.includes('demo') ||
        intentName.includes('features') ||
        intentName.includes('הדגמה') ||
        intentName.includes('פיצ')
      ) {
        if (
          text.includes('הדגמה') ||
          text.includes('יכולות') ||
          text.includes('פיצ') ||
          text.includes('תראה') ||
          text.includes('demo') ||
          text.includes('feature')
        ) {
          return { success: true, intent: intentName, nextNodeId: targetNodeId, rawText: payload.userText, confidence: 0.85 };
        }
      }
      if (
        intentName.includes('contact') ||
        intentName.includes('lead') ||
        intentName.includes('קשר') ||
        intentName.includes('נציג')
      ) {
        if (
          text.includes('נציג') ||
          text.includes('קשר') ||
          text.includes('להשאיר') ||
          text.includes('טלפון') ||
          text.includes('contact') ||
          text.includes('call')
        ) {
          return { success: true, intent: intentName, nextNodeId: targetNodeId, rawText: payload.userText, confidence: 0.85 };
        }
      }
    }

    return {
      success: false,
      intent: 'fallback',
      nextNodeId: payload.currentNodeId,
      rawText: payload.userText,
      confidence: 0.0,
    };
  }
}