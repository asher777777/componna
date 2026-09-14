import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Firestore,
  increment,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { SmartFormDefinition } from '../types';
import { DEFAULT_FORMS_COLLECTION } from '../config/constants';

/**
 * Fetch all smart forms
 */
export async function getSmartForms(
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
): Promise<SmartFormDefinition[]> {
  const targetDb = customFirestore || db;
  if (!targetDb) return [];

  try {
    const collRef = collection(targetDb, collectionName);
    const q = query(collRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as SmartFormDefinition[];
  } catch (error) {
    console.warn('Error fetching smart forms:', error);
    return [];
  }
}

/**
 * Real-time listener for smart forms
 */
export function subscribeSmartForms(
  onData: (forms: SmartFormDefinition[]) => void,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
) {
  const targetDb = customFirestore || db;
  if (!targetDb) return () => {};

  const collRef = collection(targetDb, collectionName);
  const q = query(collRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const forms = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SmartFormDefinition[];
      onData(forms);
    },
    (err) => {
      console.warn('Smart forms subscription error:', err);
    }
  );
}

/**
 * Fetch single form definition by ID
 */
export async function getSmartFormById(
  formId: string,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
): Promise<SmartFormDefinition | null> {
  const targetDb = customFirestore || db;
  if (!targetDb || !formId) return null;

  try {
    const docRef = doc(targetDb, collectionName, formId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SmartFormDefinition;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching form ${formId}:`, error);
    return null;
  }
}

/**
 * Save / Update a Smart Form definition
 */
export async function saveSmartForm(
  form: Partial<SmartFormDefinition>,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
): Promise<string> {
  const targetDb = customFirestore || db;
  if (!targetDb) throw new Error('Firestore is not initialized');

  const now = new Date().toISOString();
  const formId = form.id || `form_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const dataToSave: SmartFormDefinition = {
    id: formId,
    title: form.title || 'טופס ללא שם',
    slug: form.slug || formId,
    description: form.description || '',
    category: form.category || 'כללי',
    tone: form.tone || 'executive_luxury',
    toneDescription: form.toneDescription || '',
    steps: form.steps || [],
    theme: form.theme || ({} as any),
    completion: form.completion || ({} as any),
    createdAt: form.createdAt || now,
    updatedAt: now,
    createdBy: form.createdBy || 'system',
    status: form.status || 'published',
    viewsCount: form.viewsCount || 0,
    startsCount: form.startsCount || 0,
    submissionsCount: form.submissionsCount || 0,
    isCrmSyncEnabled: form.isCrmSyncEnabled ?? true,
    crmDefaultTags: form.crmDefaultTags || ['טופס דיגיטלי'],
    crmDefaultCommunity: form.crmDefaultCommunity || '',
  };

  const docRef = doc(targetDb, collectionName, formId);
  await setDoc(docRef, dataToSave, { merge: true });

  return formId;
}

/**
 * Delete a Smart Form
 */
export async function deleteSmartForm(
  formId: string,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
): Promise<void> {
  const targetDb = customFirestore || db;
  if (!targetDb || !formId) return;

  const docRef = doc(targetDb, collectionName, formId);
  await deleteDoc(docRef);
}

/**
 * Increment form view counter
 */
export async function trackFormView(
  formId: string,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
) {
  const targetDb = customFirestore || db;
  if (!targetDb || !formId) return;

  try {
    const docRef = doc(targetDb, collectionName, formId);
    await updateDoc(docRef, {
      viewsCount: increment(1),
    });
  } catch (e) {
    // Ignore tracking errors
  }
}

/**
 * Increment form start counter
 */
export async function trackFormStart(
  formId: string,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
) {
  const targetDb = customFirestore || db;
  if (!targetDb || !formId) return;

  try {
    const docRef = doc(targetDb, collectionName, formId);
    await updateDoc(docRef, {
      startsCount: increment(1),
    });
  } catch (e) {
    // Ignore tracking errors
  }
}
