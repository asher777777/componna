/**
 * KOSAI AI Monopoly - KosWhatsUp Contract
 * KOSUN26 Gate 3: Authorized contract for WhatsApp AI bot, customer queries, and smart auto-replies.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

export const kosaiWhatsUpContract = {
  /**
   * Generates a conversational response for an incoming WhatsApp customer message.
   */
  async generateBotReply(
    prompt: string,
    systemInstruction?: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<string>> {
    const res = await executeKosaiAi<any>('KosWhatsUp', prompt, {
      systemInstruction,
      temperature: 0.7,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'chatbot',
    });

    const reply = typeof res.data === 'string' 
      ? res.data 
      : (res.data?.reply || res.data?.message || JSON.stringify(res.data));

    return {
      ...res,
      data: reply,
    };
  },

  /**
   * Classifies message intent and extracts contact details.
   */
  async extractContactData(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosWhatsUp', prompt, {
      responseMimeType: 'application/json',
      temperature: 0.2,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'chatbot',
    });
  },
};
