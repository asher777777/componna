/**
 * KOSAI AI Bridge - CRM Analytics Module
 * Connects CRM prompts to the KOSAI modelsAiService central monopoly contract.
 * Guarantees zero direct external calls, model governance (gemini-3.8-flash-lite), and token capping.
 */

import {
  BUILD_CONTACT_SUMMARY_PROMPT,
  BUILD_DRAFT_MESSAGE_PROMPT,
  BUILD_VOICE_DEBRIEF_PROMPT,
  BUILD_BUSINESS_CARD_PROMPT,
} from '../prompts/contactPrompts';
import {
  kosaiCrmContract,
  CrmContactSummary,
  CrmDraftMessage,
  CrmVoiceDebrief,
  CrmBusinessCardData,
} from '../../KosAi/modelsAiService/crmAiContract';
import { Contact } from '../types';

export interface KosaiDispatchOptions {
  apiKey?: string;
  tenantId?: string;
  skipCache?: boolean;
}

/**
 * Dispatches contact summary generation to KOSAI
 */
export async function dispatchContactSummaryToKosai(
  contact: Contact,
  options?: KosaiDispatchOptions
): Promise<CrmContactSummary> {
  const prompt = BUILD_CONTACT_SUMMARY_PROMPT(contact);
  const cacheKey = `crm_sum_${contact.id || contact.conta_phone || 'temp'}`;
  const result = await kosaiCrmContract.summarizeLead(prompt, {
    cacheKey,
    skipCache: options?.skipCache,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * Dispatches smart follow-up message generation to KOSAI
 */
export async function dispatchDraftMessageToKosai(
  contact: Contact,
  channel: 'whatsapp' | 'email' | 'sms',
  goal: 'warm_intro' | 'campaign_invite' | 'payment_reminder' | 'custom',
  customInstruction?: string,
  options?: KosaiDispatchOptions
): Promise<CrmDraftMessage> {
  const prompt = BUILD_DRAFT_MESSAGE_PROMPT(contact, channel, goal, customInstruction);
  const result = await kosaiCrmContract.draftFollowUpMessage(prompt, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * Dispatches audio/voice debrief analysis to KOSAI
 */
export async function dispatchVoiceDebriefToKosai(
  transcript: string,
  options?: KosaiDispatchOptions
): Promise<CrmVoiceDebrief> {
  const prompt = BUILD_VOICE_DEBRIEF_PROMPT(transcript);
  const result = await kosaiCrmContract.analyzeVoiceDebrief(prompt, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * Dispatches business card image OCR to KOSAI
 */
export async function dispatchBusinessCardToKosai(
  imageBase64: string,
  imageMimeType: string = 'image/jpeg',
  options?: KosaiDispatchOptions
): Promise<CrmBusinessCardData> {
  const prompt = BUILD_BUSINESS_CARD_PROMPT();
  const result = await kosaiCrmContract.extractBusinessCard(prompt, imageBase64, imageMimeType, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}
