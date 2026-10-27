/**
 * KOSAI AI Monopoly - CrmAnalytics Contract
 * KOSUN26 Gate 3: Authorized contract for CRM lead summaries, sentiment analysis, voice debriefs, and business cards.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

export interface CrmContactSummary {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  leadTemperature: 'hot' | 'warm' | 'cold';
  nextBestAction: string;
  recommendedTags: string[];
}

export interface CrmDraftMessage {
  channel: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  messageText: string;
}

export interface CrmVoiceDebrief {
  meetingSummary: string;
  nextStep: string;
  followUpDate?: string;
  leadTemperature: 'hot' | 'warm' | 'cold';
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedTags: string[];
}

export interface CrmBusinessCardData {
  conta_name?: string;
  conta_phone?: string;
  work_phone?: string;
  email?: string;
  company_name?: string;
  job_title?: string;
  mh_crm_city?: string;
  mh_crm_street?: string;
  website?: string;
  notes?: string;
}

export const kosaiCrmContract = {
  /**
   * Generates a CRM lead summary and next best action.
   * Capped to 500 max output tokens for lean footprint.
   */
  async summarizeLead(
    prompt: string,
    options?: { cacheKey?: string; skipCache?: boolean; apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<CrmContactSummary>> {
    return executeKosaiAi<CrmContactSummary>('crm-analytics', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 500,
      cacheKey: options?.cacheKey,
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Drafts a personalized follow-up CRM message for a contact.
   * Capped to 600 max output tokens.
   */
  async draftFollowUpMessage(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<CrmDraftMessage>> {
    return executeKosaiAi<CrmDraftMessage>('crm-analytics', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.6,
      maxOutputTokens: 600,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Analyzes an audio/voice debrief and extracts CRM contact action items.
   * Capped to 600 max output tokens.
   */
  async analyzeVoiceDebrief(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<CrmVoiceDebrief>> {
    return executeKosaiAi<CrmVoiceDebrief>('crm-analytics', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 600,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Parses business card image via Multimodal Vision into structured contact fields.
   * Capped to 500 max output tokens.
   */
  async extractBusinessCard(
    prompt: string,
    imageBase64: string,
    imageMimeType: string = 'image/jpeg',
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<CrmBusinessCardData>> {
    return executeKosaiAi<CrmBusinessCardData>('crm-analytics', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 500,
      imageBase64,
      imageMimeType,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },
};
