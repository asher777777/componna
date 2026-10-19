import { SmartFormDefinition, FormWhatsAppRule, FormWhatsAppDeliveryLog } from '../types';
import { renderWhatsAppMessage, evaluateRuleCondition } from './whatsappTemplateService';
import { getModuleGreenApiCredentials } from '../../../core/connection/tenantApiKeys';
import { SYSTEM_COLLECTIONS, ScheduledReminderPayload } from '../../../core/contracts';
import { collection, doc, setDoc, Firestore } from 'firebase/firestore';
import { eventBus } from '../../../core/bridge/EventBus';

interface GreenSendParams {
  instanceId: string;
  token: string;
  chatId: string;
  message: string;
  mediaUrl?: string;
  fileName?: string;
}

async function sendGreenApiMessage(params: GreenSendParams): Promise<{ idMessage?: string; error?: string }> {
  try {
    const { instanceId, token, chatId, message, mediaUrl, fileName } = params;
    const cleanPhone = chatId.replace(/[^\d]/g, '');
    const recipientChatId = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@c.us`;
    const cluster = instanceId.length >= 4 ? instanceId.slice(0, 4) : '7103';
    const host = `https://${cluster}.api.greenapi.com`;

    if (mediaUrl) {
      const url = `${host}/waInstance${instanceId}/sendFileByUrl/${token}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: recipientChatId,
          urlFile: mediaUrl,
          fileName: fileName || 'attachment',
          caption: message,
        }),
      });
      return await res.json();
    } else {
      const url = `${host}/waInstance${instanceId}/sendMessage/${token}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: recipientChatId,
          message,
        }),
      });
      return await res.json();
    }
  } catch (err: any) {
    return { error: err?.message || 'שגיאה במשלוח הודעת וואטסאפ' };
  }
}

/**
 * Helper providing green-api send methods for internal components
 */
export function getGreenApiService() {
  const { instanceId, token } = getModuleGreenApiCredentials('smart-form-builder');
  return {
    isConfigured: () => Boolean(instanceId && token),
    sendMessage: async (params: { chatId: string; message: string; mediaUrl?: string; fileName?: string }) => {
      return sendGreenApiMessage({
        instanceId,
        token,
        chatId: params.chatId,
        message: params.message,
        mediaUrl: params.mediaUrl,
        fileName: params.fileName,
      });
    },
  };
}

/**
 * Processes all configured WhatsApp rules for a form submission and sends messages via Green-API
 * or schedules them to Google Cloud Functions via ScheduledReminderContract
 */
export async function processSubmissionWhatsAppAutomations(params: {
  form: SmartFormDefinition;
  rawAnswers: Record<string, any>;
  detailedAnswers?: any[];
  metadata?: any;
  submissionId: string;
  submittedAt: string;
  customFirestore?: Firestore;
}): Promise<FormWhatsAppDeliveryLog[]> {
  const { form, rawAnswers, detailedAnswers, metadata, submissionId, submittedAt, customFirestore } = params;

  // If automation is globally disabled on the form or no rules exist
  if (!form.whatsappAutomationEnabled || !form.whatsappRules || form.whatsappRules.length === 0) {
    return [];
  }

  const logs: FormWhatsAppDeliveryLog[] = [];
  const { instanceId, token } = getModuleGreenApiCredentials('smart-form-builder');
  const targetDb = customFirestore || db;

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

    // 4. Handle Cloud Scheduled Reminders (runs via Google Cloud Functions, not local storage)
    if (rule.timing === 'delayed_reminder' || (rule.delayMinutes && rule.delayMinutes > 0)) {
      const delayMs = (rule.delayMinutes || 60) * 60 * 1000;
      const scheduledAtIso = new Date(Date.now() + delayMs).toISOString();

      for (const rec of recipients) {
        try {
          if (targetDb) {
            const reminderRef = doc(collection(targetDb, SYSTEM_COLLECTIONS.SCHEDULED_REMINDERS));
            const reminderDoc: ScheduledReminderPayload = {
              id: reminderRef.id,
              sourceModule: 'KSF',
              sourceId: form.id,
              recipientPhone: rec.phone,
              recipientName: rawAnswers['conta_name'] || rawAnswers['name'] || '',
              recipientType: rec.type,
              message: renderedMessage,
              mediaUrl: rule.mediaUrl,
              mediaFileName: rule.mediaFileName,
              scheduledAt: scheduledAtIso,
              status: 'pending',
              createdAt: new Date().toISOString(),
              sendContactCard: Boolean(rule.sendContactCard),
              metadata: {
                submissionId,
                formTitle: form.title,
                ruleId: rule.id,
                ruleName: rule.name,
              },
            };

            await setDoc(reminderRef, reminderDoc);
          }

          logs.push({
            ruleId: rule.id,
            ruleName: rule.name,
            recipientPhone: rec.phone,
            recipientType: rec.type,
            status: 'sent',
            sentAt: new Date().toISOString(),
            renderedMessage: `[מתוזמן לענן: ${scheduledAtIso}] ${renderedMessage}`,
          });
        } catch (e: any) {
          logs.push({
            ruleId: rule.id,
            ruleName: rule.name,
            recipientPhone: rec.phone,
            recipientType: rec.type,
            status: 'failed',
            sentAt: new Date().toISOString(),
            renderedMessage,
            error: `שגיאה בתזמון תזכורת ענן: ${e?.message || e}`,
          });
        }
      }
      continue;
    }

    // 4. Dispatch via Green-API for each recipient
    for (const rec of recipients) {
      if (!instanceId || !token) {
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
        const sendResult = await sendGreenApiMessage({
          instanceId,
          token,
          chatId: rec.phone,
          message: renderedMessage,
          mediaUrl: rule.mediaUrl,
          fileName: rule.mediaFileName,
        });

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
