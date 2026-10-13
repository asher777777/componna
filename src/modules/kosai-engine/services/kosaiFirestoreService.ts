import { Firestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { KosaiRule, KosaiConversation, KosaiMessage } from '../types';
import { KOSAI_CONFIG } from '../config';
import { TokenUsageReport } from '../../../core/ai/geminiCostTracker';

export interface KosaiAnalyticsLog {
  id?: string;
  ruleId: string;
  moduleName: string;
  actionType: string;
  usage: TokenUsageReport;
  timestamp: number;
}

export const kosaiRulesService = {
  async getRules(db: Firestore, tenantId: string): Promise<KosaiRule[]> {
    const colRef = collection(db, `tenants/${tenantId}/${KOSAI_CONFIG.COLLECTIONS.RULES}`);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as KosaiRule));
  },

  async saveRule(db: Firestore, tenantId: string, rule: KosaiRule): Promise<void> {
    const docRef = doc(db, `tenants/${tenantId}/${KOSAI_CONFIG.COLLECTIONS.RULES}`, rule.id);
    await setDoc(docRef, rule, { merge: true });
  },

  async deleteRule(db: Firestore, tenantId: string, ruleId: string): Promise<void> {
    const docRef = doc(db, `tenants/${tenantId}/${KOSAI_CONFIG.COLLECTIONS.RULES}`, ruleId);
    await deleteDoc(docRef);
  },

  async logAiUsage(db: Firestore, tenantId: string, log: Omit<KosaiAnalyticsLog, 'id' | 'timestamp'>): Promise<void> {
    const colRef = collection(db, `tenants/${tenantId}/kosai_ai_logs`);
    await addDoc(colRef, {
      ...log,
      timestamp: Date.now()
    });
  },

  async getRecentAnalytics(db: Firestore, tenantId: string): Promise<KosaiAnalyticsLog[]> {
    const colRef = collection(db, `tenants/${tenantId}/kosai_ai_logs`);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as KosaiAnalyticsLog));
  }
};

export const kosaiConversationsService = {
  async getConversations(db: Firestore, tenantId: string, moduleId?: string): Promise<KosaiConversation[]> {
    const colRef = collection(db, `tenants/${tenantId}/${KOSAI_CONFIG.COLLECTIONS.CONVERSATIONS}`);
    try {
      // Query without requiring Firestore composite index, sorting locally in memory
      const q = moduleId
        ? query(colRef, where('moduleId', '==', moduleId), limit(50))
        : query(colRef, limit(50));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          tenantId,
          moduleId: data.moduleId || 'page-builder',
          title: data.title || 'שיחה ללא כותרת',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
          cachedContentId: data.cachedContentId,
          status: data.status || 'active',
          messages: (data.messages || []).map((m: any) => ({
            ...m,
            timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || Date.now())
          }))
        } as KosaiConversation;
      });
      return list.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (err) {
      console.warn('[kosaiConversationsService] Error getting conversations, attempting fallback:', err);
      const snap = await getDocs(colRef);
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          tenantId,
          moduleId: data.moduleId || 'page-builder',
          title: data.title || 'שיחה ללא כותרת',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
          cachedContentId: data.cachedContentId,
          status: data.status || 'active',
          messages: (data.messages || []).map((m: any) => ({
            ...m,
            timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || Date.now())
          }))
        } as KosaiConversation;
      });
      return list.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  },

  async getConversation(db: Firestore, tenantId: string, conversationId: string): Promise<KosaiConversation | null> {
    const docRef = doc(db, `tenants/${tenantId}/${KOSAI_CONFIG.COLLECTIONS.CONVERSATIONS}`, conversationId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      tenantId,
      moduleId: data.moduleId || 'page-builder',
      title: data.title || 'שיחה ללא כותרת',
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
      cachedContentId: data.cachedContentId,
      status: data.status || 'active',
      messages: (data.messages || []).map((m: any) => ({
        ...m,
        timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || Date.now())
      }))
    } as KosaiConversation;
  },

  async saveConversation(db: Firestore, tenantId: string, conversation: KosaiConversation): Promise<void> {
    const docRef = doc(db, `tenants/${tenantId}/${KOSAI_CONFIG.COLLECTIONS.CONVERSATIONS}`, conversation.id);
    const serializedMessages = conversation.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      imageUrl: m.imageUrl || null,
      timestamp: m.timestamp instanceof Date ? m.timestamp.getTime() : (typeof m.timestamp === 'number' ? m.timestamp : Date.now()),
      isLoading: false
    }));

    await setDoc(docRef, {
      id: conversation.id,
      tenantId,
      moduleId: conversation.moduleId,
      title: conversation.title,
      createdAt: conversation.createdAt || Date.now(),
      updatedAt: Date.now(),
      cachedContentId: conversation.cachedContentId || null,
      status: conversation.status || 'active',
      messages: serializedMessages
    }, { merge: true });
  },

  async deleteConversation(db: Firestore, tenantId: string, conversationId: string): Promise<void> {
    const docRef = doc(db, `tenants/${tenantId}/${KOSAI_CONFIG.COLLECTIONS.CONVERSATIONS}`, conversationId);
    await deleteDoc(docRef);
  }
};

