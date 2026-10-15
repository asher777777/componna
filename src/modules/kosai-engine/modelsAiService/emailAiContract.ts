/**
 * KOSAI AI Monopoly - KosunAm Email Marketing Contract
 * KOSUN26 Gate 3: Authorized contract for newsletter copy, subject lines, and marketing emails.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

export const kosaiEmailContract = {
  /**
   * Generates email subject lines and body copy for broadcast campaigns.
   */
  async generateCampaignCopy(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('kosun-am', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.75,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Refines or translates an email draft.
   */
  async refineEmailDraft(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<string>> {
    const res = await executeKosaiAi<any>('kosun-am', prompt, {
      model: 'gemini-3.8-flash-lite',
      temperature: 0.6,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });

    return {
      ...res,
      data: typeof res.data === 'string' ? res.data : (res.data?.text || res.data?.content || JSON.stringify(res.data)),
    };
  },
};
