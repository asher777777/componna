import { Firestore, doc, setDoc, collection } from 'firebase/firestore';
import { eventBus } from '../../../core/bridge/EventBus';
import { LeadPayload, SYSTEM_COLLECTIONS } from '../../../core/contracts';

export class LeadDispatchService {
  /**
   * Dispatches a lead captured during living video player interaction to KOSUN CRM
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
    }
  ): Promise<void> {
    const name = formData.fullName || formData.name || formData.conta_name || 'ליד מעמוד חי';
    const phone = formData.phone || formData.tel || formData.mobile || formData.conta_phone || '';
    const email = formData.email || formData.mail || '';
    const leadId = `lead_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const canonicalPayload: LeadPayload = {
      kosun_crm_name: name,
      kosun_crm_phone: phone,
      kosun_crm_email: email,
      kosun_crm_source: `KosLive:${context.campaignName || context.campaignId}`,
      kosun_crm_notes: `נלכד בסצנה: ${context.sceneTitle || context.sceneId || 'כללי'}`,
      kosun_crm_tags: ['KosLive', 'עמוד_חי', 'וידאו_אינטראקטיבי'],
      // Legacy compatibility
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

    // 1. Broadcast over EventBus to CRM Analytics module & listeners
    try {
      eventBus.emit('crm:lead:created', canonicalPayload);
      eventBus.emit('player:interaction', {
        videoId: context.campaignId,
        eventType: 'form_submit',
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('[LeadDispatchService] EventBus broadcast notice:', e);
    }

    // 2. Direct Multi-Tenant Firestore write
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
