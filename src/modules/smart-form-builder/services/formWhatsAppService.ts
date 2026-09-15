import { GreenApiService } from '../../whatsapp-green-api-hub/services/greenApiService';
import { SmartFormDefinition, FormWhatsAppRule, FormWhatsAppDeliveryLog } from '../types';
import { renderWhatsAppMessage, evaluateRuleCondition } from './whatsappTemplateService';

/**
 * Retrieves the active Green-API service credentials from system configuration
 */
export function getGreenApiService(): GreenApiService | null {
  try {
    let instanceId = '';
    let token = '';

    // 1. Try from localStorage system API keys
    const saved = localStorage.getItem('comona_system_apikeys_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      instanceId = parsed.greenApiInstanceId || '';
      token = parsed.greenApiToken || '';
    }

    // 2. Try from env variables if empty
    if (!instanceId) instanceId = (import.meta.env.VITE_GREEN_API_INSTANCE_ID as string) || '';
    if (!token) token = (import.meta.env.VITE_GREEN_API_TOKEN as string) || '';

    if (!instanceId || !token) {
      return null;
    }

    return new GreenApiService({
      idInstance: instanceId,
      apiTokenInstance: token,
    });
  } catch (e) {
    console.warn('Could not initialize GreenApiService:', e);
    return null;
  }
}

/**
 * Processes all configured WhatsApp rules for a form submission and sends messages via Green-API
 */
export async function processSubmissionWhatsAppAutomations(params: {
  form: SmartFormDefinition;
  rawAnswers: Record<string, any>;
  detailedAnswers?: any[];
  metadata?: any;
  submissionId: string;
  submittedAt: string;
}): Promise<FormWhatsAppDeliveryLog[]> {
  const { form, rawAnswers, detailedAnswers, metadata, submissionId, submittedAt } = params;

  // If automation is globally disabled on the form or no rules exist
  if (!form.whatsappAutomationEnabled || !form.whatsappRules || form.whatsappRules.length === 0) {
    return [];
  }

  const logs: FormWhatsAppDeliveryLog[] = [];
  const greenService = getGreenApiService();

  const conta_phone =
    rawAnswers['conta_phone'] ||
    rawAnswers['phone'] ||
    rawAnswers['tel'] ||
    '';

  const cleanSubmitterPhone = String(conta_phone).replace(/[^\d+]/g, '');

  for (const rule of form.whatsappRules) {
    if (!rule.enabled) continue;

    // 1. Evaluate logical conditions
    const conditionMatched = evaluateRuleCondition(rule, rawAnswers, metadata);
    if (!conditionMatched) {
      continue;
    }

    // 2. Render dynamic template
    const renderedMessage = renderWhatsAppMessage(rule.messageTemplate, {
      form,
      rawAnswers,
      detailedAnswers,
      metadata,
      submissionId,
      submittedAt,
    });

    if (!renderedMessage) continue;

    // 3. Determine recipients
    const recipients: Array<{ phone: string; type: 'submitter' | 'admin' }> = [];

    if ((rule.recipientType === 'submitter' || rule.recipientType === 'both') && cleanSubmitterPhone) {
      recipients.push({ phone: cleanSubmitterPhone, type: 'submitter' });
    }

    if ((rule.recipientType === 'custom_phone' || rule.recipientType === 'both') && rule.customPhone) {
      const cleanCustom = rule.customPhone.trim();
      if (cleanCustom) {
        recipients.push({ phone: cleanCustom, type: 'admin' });
      }
    }

    // If no valid recipients found for this rule
    if (recipients.length === 0) {
      logs.push({
        ruleId: rule.id,
        ruleName: rule.name,
        recipientPhone: 'לא צוין מספר',
        recipientType: rule.recipientType === 'custom_phone' ? 'admin' : 'submitter',
        status: 'skipped',
        sentAt: new Date().toISOString(),
        renderedMessage,
        error: 'לא נמצא מספר טלפון תקין למשלוח',
      });
      continue;
    }

    // 4. Dispatch via Green-API for each recipient
    for (const rec of recipients) {
      if (!greenService || !greenService.isConfigured()) {
        logs.push({
          ruleId: rule.id,
          ruleName: rule.name,
          recipientPhone: rec.phone,
          recipientType: rec.type,
          status: 'skipped',
          sentAt: new Date().toISOString(),
          renderedMessage,
          error: 'שירות Green-API לא מוגדר (נדרש להזין Instance ID ו-API Token בהגדרות המערכת)',
        });
        continue;
      }

      try {
        let sendResult: any;
        if (rule.mediaUrl) {
          sendResult = await greenService.sendFileByUrl({
            chatId: rec.phone,
            urlFile: rule.mediaUrl,
            fileName: rule.mediaFileName || 'attachment',
            caption: renderedMessage,
          });
        } else {
          sendResult = await greenService.sendMessage({
            chatId: rec.phone,
            message: renderedMessage,
          });
        }

        if (sendResult?.idMessage) {
          logs.push({
            ruleId: rule.id,
            ruleName: rule.name,
            recipientPhone: rec.phone,
            recipientType: rec.type,
            status: 'sent',
            messageId: sendResult.idMessage,
            sentAt: new Date().toISOString(),
            renderedMessage,
          });
        } else {
          logs.push({
            ruleId: rule.id,
            ruleName: rule.name,
            recipientPhone: rec.phone,
            recipientType: rec.type,
            status: 'failed',
            sentAt: new Date().toISOString(),
            renderedMessage,
            error: sendResult?.error || 'ההודעה לא נשלחה (תקלה בממשק WhatsApp)',
          });
        }
      } catch (err: any) {
        logs.push({
          ruleId: rule.id,
          ruleName: rule.name,
          recipientPhone: rec.phone,
          recipientType: rec.type,
          status: 'failed',
          sentAt: new Date().toISOString(),
          renderedMessage,
          error: err?.message || String(err),
        });
      }
    }
  }

  return logs;
}
