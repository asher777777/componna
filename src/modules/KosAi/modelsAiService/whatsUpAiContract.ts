/**
 * KOSAI AI Monopoly - KosWhatsUp Contract
 * KOSUN26 Gate 3: Authorized contract for WhatsApp AI bot, customer queries, and smart auto-replies.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

export const kosaiWhatsUpContract = {
  /**
   * Generates a conversational response for an incoming WhatsApp customer message.
   * Uses ultra-efficient gemini-3.8-flash-lite and tight maxOutputTokens to prevent token bloat.
   */
  async generateBotReply(
    prompt: string,
    systemInstruction?: string,
    options?: { apiKey?: string; tenantId?: string; model?: string; maxOutputTokens?: number; temperature?: number }
  ): Promise<KosaiContractResult<string>> {
    const res = await executeKosaiAi<any>('KosWhatsUp', prompt, {
      model: options?.model || 'gemini-3.8-flash-lite',
      systemInstruction,
      temperature: options?.temperature ?? 0.6,
      maxOutputTokens: options?.maxOutputTokens ?? 250,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'chatbot',
    });

    const reply = typeof res.data === 'string'
      ? res.data
      : (res.data?.reply || res.data?.message || res.data?.text || JSON.stringify(res.data));

    return {
      ...res,
      data: reply,
    };
  },

  /**
   * Polishes and enhances existing WhatsApp status or message text.
   */
  async enhanceStatus(
    prompt: string,
    systemInstruction?: string,
    options?: { apiKey?: string; tenantId?: string; model?: string }
  ): Promise<KosaiContractResult<string>> {
    const res = await executeKosaiAi<any>('KosWhatsUp', prompt, {
      model: options?.model || 'gemini-3.8-flash-lite',
      systemInstruction: systemInstruction || 'אתה מומחה לכתיבת סטטוסים והודעות וואטסאפ בעברית קולחת ומדויקת.',
      temperature: 0.7,
      maxOutputTokens: 200,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'chatbot',
    });

    const text = typeof res.data === 'string' ? res.data : (res.data?.text || res.data?.status || JSON.stringify(res.data));
    return {
      ...res,
      data: text,
    };
  },

  /**
   * Generates status variations from a given topic.
   */
  async generateStatusVariations(
    prompt: string,
    systemInstruction?: string,
    options?: { apiKey?: string; tenantId?: string; model?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosWhatsUp', prompt, {
      model: options?.model || 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      systemInstruction: systemInstruction || 'אתה מחולל סטטוסים לוואטסאפ בעברית המחזיר אך ורק מערך JSON תקני.',
      temperature: 0.8,
      maxOutputTokens: 600,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'chatbot',
    });
  },

  /**
   * Classifies message intent and extracts contact details.
   */
  async extractContactData(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosWhatsUp', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 200,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'chatbot',
    });
  },
};
