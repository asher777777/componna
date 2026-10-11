/**
 * KOSUN AM (קושאן מייל אוטומטי) - Scoped Multi-Tenant Firestore Service
 * Layer 5: Strict Tenant Isolation (tenants/{tenantId}/) & 100% Real Database Persistence
 */

import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import {
  EmailCampaign,
  EmailTemplate,
  EmailAutomation,
  EmailDeliveryLog,
} from '../types';
import { KOSUN_AM_COLLECTIONS } from '../config';

export type ScopedRefGetter = <T = DocumentData>(db: Firestore, collectionName: string) => CollectionReference<T>;

export class EmailFirestoreService {
  private db?: Firestore;
  private tenantId: string;
  private scopedRefGetter?: ScopedRefGetter;

  constructor(db?: Firestore, tenantId = '_master', scopedRefGetter?: ScopedRefGetter) {
    this.db = db;
    this.tenantId = (tenantId || '').trim().toLowerCase() || '_master';
    this.scopedRefGetter = scopedRefGetter;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getScopedPath(collectionName: string): string {
    return `tenants/${this.tenantId}/${collectionName}`;
  }

  private getRef<T = DocumentData>(collectionName: string): CollectionReference<T> | null {
    if (!this.db) return null;
    if (this.scopedRefGetter) {
      return this.scopedRefGetter<T>(this.db, collectionName);
    }
    return collection(this.db, 'tenants', this.tenantId, collectionName) as CollectionReference<T>;
  }

  // --- Campaigns ---
  async getCampaigns(): Promise<EmailCampaign[]> {
    const ref = this.getRef<EmailCampaign>(KOSUN_AM_COLLECTIONS.CAMPAIGNS);
    if (!ref || !this.db) {
      return [];
    }
    try {
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailCampaign));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getCampaigns error:', err);
      return [];
    }
  }

  async getCampaign(id: string): Promise<EmailCampaign | null> {
    if (!this.db) return null;
    try {
      const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.CAMPAIGNS, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as EmailCampaign;
      }
      return null;
    } catch (err) {
      console.warn('[Kosun AM] Firestore getCampaign error:', err);
      return null;
    }
  }

  async saveCampaign(campaign: Partial<EmailCampaign>): Promise<string> {
    const id = campaign.id || `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const fullCampaign: EmailCampaign = {
      id,
      name: campaign.name || 'קמפיין חדש ללא שם',
      subject: campaign.subject || 'הודעה חדשה מקושאן',
      preheader: campaign.preheader || '',
      fromName: campaign.fromName || 'קושאן',
      fromEmail: campaign.fromEmail || 'noreply@kosun.pro',
      replyTo: campaign.replyTo || '',
      templateId: campaign.templateId,
      htmlContent: campaign.htmlContent || '',
      textContent: campaign.textContent || '',
      status: campaign.status || 'draft',
      audience: campaign.audience || { type: 'all' },
      scheduledAt: campaign.scheduledAt,
      sentAt: campaign.sentAt,
      stats: campaign.stats || {
        totalRecipients: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        unsubscribedCount: 0,
      },
      provider: campaign.provider || 'resend',
      createdAt: campaign.createdAt || now,
      updatedAt: now,
      createdById: campaign.createdById,
    };

    if (this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.CAMPAIGNS, id);
        await setDoc(docRef, fullCampaign, { merge: true });
      } catch (err) {
        console.error('[Kosun AM] Firestore saveCampaign error:', err);
        throw err;
      }
    }

    return id;
  }

  async deleteCampaign(id: string): Promise<void> {
    if (this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.CAMPAIGNS, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('[Kosun AM] Firestore deleteCampaign error:', err);
        throw err;
      }
    }
  }

  // --- Templates ---
  async getTemplates(): Promise<EmailTemplate[]> {
    const ref = this.getRef<EmailTemplate>(KOSUN_AM_COLLECTIONS.TEMPLATES);
    if (!ref || !this.db) {
      return [];
    }
    try {
      const snap = await getDocs(ref);
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailTemplate));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getTemplates error:', err);
      return [];
    }
  }

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    if (!this.db) return null;
    try {
      const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.TEMPLATES, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as EmailTemplate;
      }
      return null;
    } catch (err) {
      console.warn('[Kosun AM] Firestore getTemplate error:', err);
      return null;
    }
  }

  async saveTemplate(template: Partial<EmailTemplate>): Promise<string> {
    const id = template.id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const fullTemplate: EmailTemplate = {
      id,
      name: template.name || 'תבנית מייל ללא שם',
      description: template.description || '',
      category: template.category || 'newsletter',
      thumbnailUrl: template.thumbnailUrl,
      blocks: template.blocks || [],
      htmlSnapshot: template.htmlSnapshot || '',
      variables: template.variables || ['contact_name'],
      isDefault: template.isDefault ?? false,
      createdAt: template.createdAt || now,
      updatedAt: now,
    };

    if (this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.TEMPLATES, id);
        await setDoc(docRef, fullTemplate, { merge: true });
      } catch (err) {
        console.error('[Kosun AM] Firestore saveTemplate error:', err);
        throw err;
      }
    }

    return id;
  }

  async deleteTemplate(id: string): Promise<void> {
    if (this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.TEMPLATES, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('[Kosun AM] Firestore deleteTemplate error:', err);
        throw err;
      }
    }
  }

  // --- Automations ---
  async getAutomations(): Promise<EmailAutomation[]> {
    const ref = this.getRef<EmailAutomation>(KOSUN_AM_COLLECTIONS.AUTOMATIONS);
    if (!ref || !this.db) {
      return [];
    }
    try {
      const snap = await getDocs(ref);
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailAutomation));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getAutomations error:', err);
      return [];
    }
  }

  async getAutomation(id: string): Promise<EmailAutomation | null> {
    if (!this.db) return null;
    try {
      const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.AUTOMATIONS, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as EmailAutomation;
      }
      return null;
    } catch (err) {
      console.warn('[Kosun AM] Firestore getAutomation error:', err);
      return null;
    }
  }

  async saveAutomation(automation: Partial<EmailAutomation>): Promise<string> {
    const id = automation.id || `aut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const fullAutomation: EmailAutomation = {
      id,
      name: automation.name || 'אוטומציה חדשה',
      description: automation.description || '',
      isActive: automation.isActive ?? true,
      trigger: automation.trigger || { event: 'crm:lead:created' },
      steps: automation.steps || [],
      executionCount: automation.executionCount || 0,
      lastExecutedAt: automation.lastExecutedAt,
      createdAt: automation.createdAt || now,
      updatedAt: now,
    };

    if (this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.AUTOMATIONS, id);
        await setDoc(docRef, fullAutomation, { merge: true });
      } catch (err) {
        console.error('[Kosun AM] Firestore saveAutomation error:', err);
        throw err;
      }
    }

    return id;
  }

  async deleteAutomation(id: string): Promise<void> {
    if (this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.AUTOMATIONS, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('[Kosun AM] Firestore deleteAutomation error:', err);
        throw err;
      }
    }
  }

  // --- Logs ---
  async getLogs(): Promise<EmailDeliveryLog[]> {
    const ref = this.getRef<EmailDeliveryLog>(KOSUN_AM_COLLECTIONS.LOGS);
    if (!ref || !this.db) {
      return [];
    }
    try {
      const q = query(ref, orderBy('dispatchedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailDeliveryLog));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getLogs error:', err);
      return [];
    }
  }

  async addLog(log: Omit<EmailDeliveryLog, 'id'>): Promise<string> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullLog: EmailDeliveryLog = { id, ...log };

    if (this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.LOGS, id);
        await setDoc(docRef, fullLog);
      } catch (err) {
        console.error('[Kosun AM] Firestore addLog error:', err);
        throw err;
      }
    }

    return id;
  }
}
