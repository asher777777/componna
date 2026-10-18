import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import {
  AccessibilityDeclarationDocument,
  AccessibilityFeedbackSubmission,
} from '../types';

export class KosAccessFirestoreService {
  /**
   * Get the tenant's official accessibility declaration document
   */
  static async getDeclaration(
    db: Firestore,
    tenantId: string
  ): Promise<AccessibilityDeclarationDocument | null> {
    if (!tenantId) return null;
    try {
      const docRef = doc(
        db,
        'tenants',
        tenantId,
        SYSTEM_COLLECTIONS.KOS_ACCESS_DECLARATIONS,
        'official_statement'
      );
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as AccessibilityDeclarationDocument;
      }
      return null;
    } catch (err) {
      console.warn('[KosAccessFirestore] Failed to get declaration:', err);
      return null;
    }
  }

  /**
   * Save or update the tenant's official accessibility declaration
   */
  static async saveDeclaration(
    db: Firestore,
    tenantId: string,
    declaration: Partial<AccessibilityDeclarationDocument>
  ): Promise<AccessibilityDeclarationDocument> {
    const docRef = doc(
      db,
      'tenants',
      tenantId,
      SYSTEM_COLLECTIONS.KOS_ACCESS_DECLARATIONS,
      'official_statement'
    );

    const now = new Date().toISOString();
    const dataToSave: AccessibilityDeclarationDocument = {
      tenantId,
      organizationName: declaration.organizationName || 'ארגון KOSUN',
      websiteUrl: declaration.websiteUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
      accessibilityLevel: declaration.accessibilityLevel || 'AA',
      standard: declaration.standard || 'IS5568',
      statementDate: declaration.statementDate || now.split('T')[0],
      lastAuditDate: declaration.lastAuditDate || now.split('T')[0],
      coordinatorName: declaration.coordinatorName || '',
      coordinatorEmail: declaration.coordinatorEmail || '',
      coordinatorPhone: declaration.coordinatorPhone || '',
      coordinatorHours: declaration.coordinatorHours || 'ימים א\'-ה\' בין השעות 09:00 - 17:00',
      receptionAccessibility: declaration.receptionAccessibility || 'המבנה נגיש לכיסאות גלגלים, קיימת חניית נכים ומעלית מונגשת.',
      accessibleAccommodations: declaration.accessibleAccommodations || [
        'ניווט מקלדת מלא בכל רכיבי האתר',
        'התאמת ניגודיות צבעים (Dark, Light, Monochrome, Inverted)',
        'שינוי גודל טקסט ללא פגיעה בפריסה (עד 200%)',
        'גופן קריא מותאם לדיסלקציה וריווח אותיות מוגדל',
        'עצירת תנועות, הבהובים ומעברים להגנה מהתקפים',
        'סרגל קריאה ומיסוך מיקוד לקוראים עם ADHD',
        'סמן עכבר מוגדל וניגודי',
        'תגיות ARIA והקראה קולית מקומית בעברית',
        'התאמה מלאה למסכי מגע ולכל סוגי המסכים',
      ],
      exemptionsRationale: declaration.exemptionsRationale || '',
      feedbackEmail: declaration.feedbackEmail || declaration.coordinatorEmail || 'accessibility@domain.com',
      feedbackPhone: declaration.feedbackPhone || declaration.coordinatorPhone || '',
      isActive: declaration.isActive !== undefined ? declaration.isActive : true,
      updatedAt: now,
    };

    await setDoc(docRef, dataToSave, { merge: true });
    return dataToSave;
  }

  /**
   * Submit an accessibility barrier / feedback report
   */
  static async submitFeedback(
    db: Firestore,
    tenantId: string,
    feedback: Omit<AccessibilityFeedbackSubmission, 'id' | 'createdAt' | 'status' | 'tenantId'>
  ): Promise<string> {
    const feedbackCol = collection(
      db,
      'tenants',
      tenantId,
      SYSTEM_COLLECTIONS.KOS_ACCESS_FEEDBACK
    );
    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDocRef = doc(feedbackCol, feedbackId);

    const submission: AccessibilityFeedbackSubmission = {
      id: feedbackId,
      tenantId,
      pageUrl: feedback.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
      reporterName: feedback.reporterName || 'אנונימי',
      reporterEmail: feedback.reporterEmail || '',
      reporterPhone: feedback.reporterPhone || '',
      deviceType: feedback.deviceType || 'desktop',
      assistiveTechUsed: feedback.assistiveTechUsed || 'מקלדת / קורא מסך',
      description: feedback.description,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    await setDoc(newDocRef, {
      ...submission,
      _serverTimestamp: serverTimestamp(),
    });

    return feedbackId;
  }

  /**
   * Fetch tenant feedback submissions for admin review
   */
  static async getFeedbackSubmissions(
    db: Firestore,
    tenantId: string
  ): Promise<AccessibilityFeedbackSubmission[]> {
    if (!tenantId) return [];
    try {
      const feedbackCol = collection(
        db,
        'tenants',
        tenantId,
        SYSTEM_COLLECTIONS.KOS_ACCESS_FEEDBACK
      );
      const q = query(feedbackCol, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as AccessibilityFeedbackSubmission);
    } catch (err) {
      console.warn('[KosAccessFirestore] Failed to get feedback submissions:', err);
      return [];
    }
  }
}
