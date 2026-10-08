import { Firestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { KosaiRule } from '../types';
import { KOSAI_CONFIG } from '../config';

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
  }
};
