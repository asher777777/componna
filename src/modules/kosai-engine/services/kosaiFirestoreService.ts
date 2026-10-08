import { Firestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { KosaiRule } from '../types';
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
