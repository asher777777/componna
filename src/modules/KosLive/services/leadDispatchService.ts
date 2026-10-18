import { Firestore, doc, setDoc } from 'firebase/firestore';
import { eventBus } from '../../../core/bridge/EventBus';
import { LeadPayload, SYSTEM_COLLECTIONS } from '../../../core/contracts';

export class LeadDispatchService {
  /**
   * Dispatches a lead captured during living video player interaction to KOSUN CRM, KSF Smart Forms, and optional Webhook
   */
  static async dispatchLead(
    db: Firestore | undefined,
    tenantId: string,
    formData: Record<string, string>,
    context: {
      campaignId: string;
      campaignName?: string;
      sceneId?: string;
      sceneTitle?: string;
      smartFormId?: string;
      webhookUrl?: string;
    }
  ): Promise<void> {
    const name = formData.fullName || formData.name || formData.conta_name || Object.values(formData)[0] || 'ליד מעמוד חי';
    const phone = formData.phone || formData.tel || formData.mobile || formData.conta_phone || Object.values(formData)[1] || '';
    const email = formData.email || formData.mail || '';
    const leadId = `lead_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const canonicalPayload: LeadPayload = {
      kosun_crm_name: name,
      kosun_crm_phone: phone,
      kosun_crm_email: email,
      kosun_crm_source: `KosLive:${context.campaignName || context.campaignId}`,
      kosun_crm_notes: `נלכד בסצנה: ${context.sceneTitle || context.sceneId || 'כללי'} | נתונים: ${JSON.stringify(formData)}`,
      kosun_crm_tags: ['KosLive', 'עמוד_חי', 'וידאו_אינטראקטיבי'],
      conta_name: name,
      conta_phone: phone,
      email,
      source: `KosLive:${context.campaignId}`,
      tags: ['KosLive', 'עמוד_חי'],
      metadata: {
        ...formData,
        ...context,
        timestamp: Date.now()
      }
    };

    // 1. Broadcast over EventBus to CRM Analytics & KSF Smart Forms
    try {
      eventBus.emit('crm:lead:created', canonicalPayload);
      eventBus.emit('form:submitted', {
        formId: context.smartFormId || `koslive_${context.campaignId}`,
        data: formData,
        campaignId: context.campaignId
      });
      if (context.smartFormId) {
        eventBus.emit('smart_form:submitted', {
          formId: context.smartFormId,
          formTitle: context.campaignName || 'טופס עמוד חי',
          submissionId: leadId,
          data: formData,
          leadPayload: canonicalPayload,
          submittedAt: new Date().toISOString()
        });
      }
      eventBus.emit('player:interaction', {
        videoId: context.campaignId,
        eventType: 'form_submit',
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('[LeadDispatchService] EventBus broadcast notice:', e);
    }

    // 2. Optional Custom Webhook POST (from Flow Player Engine's formsApiEndpoint)
    if (context.webhookUrl && context.webhookUrl.trim().startsWith('http')) {
      try {
        await fetch(context.webhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            tenantId,
            campaignId: context.campaignId,
            campaignName: context.campaignName,
            sceneId: context.sceneId,
            formData,
            submittedAt: new Date().toISOString()
          })
        });
      } catch (whErr) {
        console.warn('[LeadDispatchService] Webhook POST notice:', whErr);
      }
    }

    // 3. Direct Multi-Tenant Firestore write
    if (db && tenantId) {
      try {
        const contactRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.CONTACTS, leadId);
        await setDoc(contactRef, {
          id: leadId,
          ...canonicalPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('[LeadDispatchService] Firestore lead write error:', err);
      }
    }
  }
}
