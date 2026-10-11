/**
 * KOSUN AM (קושאן מייל אוטומטי) - Firestore Service
 * 12-Layer Scaffolding Layer 5: Multi-Tenant Scoped Persistence with Graceful Mock Fallback
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
import {
  KOSUN_AM_COLLECTIONS,
  MOCK_CAMPAIGNS,
  MOCK_TEMPLATES,
  MOCK_AUTOMATIONS,
  MOCK_LOGS,
} from '../config';

export class EmailFirestoreService {
  private db?: Firestore;
  private tenantId: string;
  private localCampaigns: EmailCampaign[] = [...MOCK_CAMPAIGNS];
  private localTemplates: EmailTemplate[] = [...MOCK_TEMPLATES];
  private localAutomations: EmailAutomation[] = [...MOCK_AUTOMATIONS];
  private localLogs: EmailDeliveryLog[] = [...MOCK_LOGS];

  constructor(db?: Firestore, tenantId = '_master') {
    this.db = db;
    this.tenantId = tenantId;
  }

  private getRef<T = DocumentData>(collectionName: string): CollectionReference<T> | null {
    if (!this.db) return null;
    return collection(this.db, 'tenants', this.tenantId, collectionName) as CollectionReference<T>;
  }

  // --- Campaigns ---
  async getCampaigns(): Promise<EmailCampaign[]> {
    const ref = this.getRef<EmailCampaign>(KOSUN_AM_COLLECTIONS.CAMPAIGNS);
    if (!ref || !this.db) {
      return [...this.localCampaigns];
    }
    try {
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailCampaign));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getCampaigns error, using local fallback:', err);
      return [...this.localCampaigns];
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
      provider: campaign.provider || 'mock_local',
      createdAt: campaign.createdAt || now,
      updatedAt: now,
      createdById: campaign.createdById,
    };

    const ref = this.getRef(KOSUN_AM_COLLECTIONS.CAMPAIGNS);
    if (ref && this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.CAMPAIGNS, id);
        await setDoc(docRef, fullCampaign, { merge: true });
      } catch (err) {
        console.warn('[Kosun AM] Firestore saveCampaign error, falling back to local memory:', err);
      }
    }

    const idx = this.localCampaigns.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.localCampaigns[idx] = fullCampaign;
    } else {
      this.localCampaigns.unshift(fullCampaign);
    }

    return id;
  }

  async deleteCampaign(id: string): Promise<void> {
    const ref = this.getRef(KOSUN_AM_COLLECTIONS.CAMPAIGNS);
    if (ref && this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.CAMPAIGNS, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[Kosun AM] Firestore deleteCampaign error:', err);
      }
    }
    this.localCampaigns = this.localCampaigns.filter((c) => c.id !== id);
  }

  // --- Templates ---
  async getTemplates(): Promise<EmailTemplate[]> {
    const ref = this.getRef<EmailTemplate>(KOSUN_AM_COLLECTIONS.TEMPLATES);
    if (!ref || !this.db) {
      return [...this.localTemplates];
    }
    try {
      const snap = await getDocs(ref);
      if (snap.empty) {
        return [...this.localTemplates];
      }
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailTemplate));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getTemplates error, using local fallback:', err);
      return [...this.localTemplates];
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

    const ref = this.getRef(KOSUN_AM_COLLECTIONS.TEMPLATES);
    if (ref && this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.TEMPLATES, id);
        await setDoc(docRef, fullTemplate, { merge: true });
      } catch (err) {
        console.warn('[Kosun AM] Firestore saveTemplate error:', err);
      }
    }

    const idx = this.localTemplates.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.localTemplates[idx] = fullTemplate;
    } else {
      this.localTemplates.unshift(fullTemplate);
    }

    return id;
  }

  async deleteTemplate(id: string): Promise<void> {
    const ref = this.getRef(KOSUN_AM_COLLECTIONS.TEMPLATES);
    if (ref && this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.TEMPLATES, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[Kosun AM] Firestore deleteTemplate error:', err);
      }
    }
    this.localTemplates = this.localTemplates.filter((t) => t.id !== id);
  }

  // --- Automations ---
  async getAutomations(): Promise<EmailAutomation[]> {
    const ref = this.getRef<EmailAutomation>(KOSUN_AM_COLLECTIONS.AUTOMATIONS);
    if (!ref || !this.db) {
      return [...this.localAutomations];
    }
    try {
      const snap = await getDocs(ref);
      if (snap.empty) {
        return [...this.localAutomations];
      }
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailAutomation));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getAutomations error, using local fallback:', err);
      return [...this.localAutomations];
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

    const ref = this.getRef(KOSUN_AM_COLLECTIONS.AUTOMATIONS);
    if (ref && this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.AUTOMATIONS, id);
        await setDoc(docRef, fullAutomation, { merge: true });
      } catch (err) {
        console.warn('[Kosun AM] Firestore saveAutomation error:', err);
      }
    }

    const idx = this.localAutomations.findIndex((a) => a.id === id);
    if (idx >= 0) {
      this.localAutomations[idx] = fullAutomation;
    } else {
      this.localAutomations.unshift(fullAutomation);
    }

    return id;
  }

  async deleteAutomation(id: string): Promise<void> {
    const ref = this.getRef(KOSUN_AM_COLLECTIONS.AUTOMATIONS);
    if (ref && this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.AUTOMATIONS, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[Kosun AM] Firestore deleteAutomation error:', err);
      }
    }
    this.localAutomations = this.localAutomations.filter((a) => a.id !== id);
  }

  // --- Logs ---
  async getLogs(): Promise<EmailDeliveryLog[]> {
    const ref = this.getRef<EmailDeliveryLog>(KOSUN_AM_COLLECTIONS.LOGS);
    if (!ref || !this.db) {
      return [...this.localLogs];
    }
    try {
      const q = query(ref, orderBy('dispatchedAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) {
        return [...this.localLogs];
      }
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailDeliveryLog));
    } catch (err) {
      console.warn('[Kosun AM] Firestore getLogs error, using local fallback:', err);
      return [...this.localLogs];
    }
  }

  async addLog(log: Omit<EmailDeliveryLog, 'id'>): Promise<string> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullLog: EmailDeliveryLog = { id, ...log };

    const ref = this.getRef(KOSUN_AM_COLLECTIONS.LOGS);
    if (ref && this.db) {
      try {
        const docRef = doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.LOGS, id);
        await setDoc(docRef, fullLog);
      } catch (err) {
        console.warn('[Kosun AM] Firestore addLog error:', err);
      }
    }

    this.localLogs.unshift(fullLog);
    return id;
  }
}
