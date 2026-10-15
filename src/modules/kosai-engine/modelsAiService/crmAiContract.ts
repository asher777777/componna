/**
 * KOSAI AI Monopoly - CrmAnalytics Contract
 * KOSUN26 Gate 3: Authorized contract for CRM lead summaries, sentiment analysis, and voice debriefs.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

export const kosaiCrmContract = {
  /**
   * Generates a CRM lead summary and next best action.
   */
  async summarizeLead(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('crm-analytics', prompt, {
      responseMimeType: 'application/json',
      temperature: 0.5,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Drafts a personalized follow-up CRM message for a contact.
   */
  async draftFollowUpMessage(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('crm-analytics', prompt, {
      responseMimeType: 'application/json',
      temperature: 0.7,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Analyzes an audio/voice debrief and extracts CRM contact action items.
   */
  async analyzeVoiceDebrief(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('crm-analytics', prompt, {
      responseMimeType: 'application/json',
      temperature: 0.3,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },
};
