import { Firestore } from 'firebase/firestore';
import { KosAccessFirestoreService } from '../services/kosAccessFirestore';
import {
  AccessibilityDeclarationDocument,
  AccessibilityFeedbackSubmission,
} from '../types';

export const KosAccessApi = {
  getDeclaration: (db: Firestore, tenantId: string) =>
    KosAccessFirestoreService.getDeclaration(db, tenantId),

  saveDeclaration: (
    db: Firestore,
    tenantId: string,
    declaration: Partial<AccessibilityDeclarationDocument>
  ) => KosAccessFirestoreService.saveDeclaration(db, tenantId, declaration),

  submitFeedback: (
    db: Firestore,
    tenantId: string,
    feedback: Omit<AccessibilityFeedbackSubmission, 'id' | 'createdAt' | 'status' | 'tenantId'>
  ) => KosAccessFirestoreService.submitFeedback(db, tenantId, feedback),

  getFeedbackSubmissions: (db: Firestore, tenantId: string) =>
    KosAccessFirestoreService.getFeedbackSubmissions(db, tenantId),
};

export default KosAccessApi;
