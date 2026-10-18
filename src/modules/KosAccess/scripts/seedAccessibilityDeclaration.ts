/**
 * KosAccess Seed Script
 * Initializes or verifies the default accessibility statement in tenant scope.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';

export async function seedDefaultAccessibility(tenantId: string, firebaseConfig: any) {
  const app = initializeApp(firebaseConfig, 'KosAccessSeeder');
  const db = getFirestore(app);

  const docRef = doc(
    db,
    'tenants',
    tenantId,
    SYSTEM_COLLECTIONS.KOS_ACCESS_DECLARATIONS,
    'official_statement'
  );

  await setDoc(
    docRef,
    {
      tenantId,
      organizationName: 'ארגון KOSUN',
      accessibilityLevel: 'AA',
      standard: 'IS5568',
      statementDate: new Date().toISOString().split('T')[0],
      lastAuditDate: new Date().toISOString().split('T')[0],
      coordinatorName: 'רכז נגישות מוסמך',
      coordinatorEmail: 'accessibility@kosun.org',
      coordinatorPhone: '03-5555555',
      coordinatorHours: 'ימים א\'-ה\' 09:00 - 17:00',
      receptionAccessibility: 'כניסה מונגשת, מעלית רחבה, חניית נכים מסומנת ולולאות השראה שמעיות.',
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`[KosAccess Seed] Initialized default accessibility declaration for tenant: ${tenantId}`);
}
