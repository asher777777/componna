import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { FirestoreDocumentRecord } from '../types';

/**
 * Remove undefined values recursively to avoid Firestore SDK crashes
 */
function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === 'object' && item !== null ? cleanUndefined(item) : item)) as any;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Timestamp) && !(value instanceof Date)) {
        cleaned[key] = cleanUndefined(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as T;
}

export class FirestoreAdminService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  // Format any Firestore Timestamp or Date safely
  private formatValue(val: any): any {
    if (val === null || val === undefined) return val;
    if (val instanceof Timestamp) {
      return val.toDate().toLocaleString('he-IL');
    }
    if (typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) {
      return new Date(val.seconds * 1000).toLocaleString('he-IL');
    }
    if (val instanceof Date) {
      return val.toLocaleString('he-IL');
    }
    return val;
  }

  // Convert raw Firestore doc to FirestoreDocumentRecord
  public parseDocSnap(docSnap: any): FirestoreDocumentRecord {
    const rawData = docSnap.data() || {};
    
    // Extract formatted time if present
    let createdAtFormatted: string | undefined;
    let updatedAtFormatted: string | undefined;

    if (rawData.createdAt) {
      createdAtFormatted = typeof rawData.createdAt === 'number'
        ? new Date(rawData.createdAt).toLocaleString('he-IL')
        : this.formatValue(rawData.createdAt);
    }

    if (rawData.updatedAt) {
      updatedAtFormatted = typeof rawData.updatedAt === 'number'
        ? new Date(rawData.updatedAt).toLocaleString('he-IL')
        : this.formatValue(rawData.updatedAt);
    }

    return {
      id: docSnap.id,
      data: rawData,
      createdAtFormatted,
      updatedAtFormatted,
      hasTimestamp: Boolean(rawData.createdAt || rawData.updatedAt),
    };
  }

  // Fetch documents with optional limit
  async getDocuments(collectionName: string, maxDocs: number = 100): Promise<FirestoreDocumentRecord[]> {
    const collRef = collection(this.db, collectionName);
    const q = query(collRef, limit(maxDocs));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => this.parseDocSnap(docSnap));
  }

  // Real-time subscriber
  subscribeToCollection(
    collectionName: string,
    onData: (docs: FirestoreDocumentRecord[]) => void,
    onError: (err: Error) => void,
    maxDocs: number = 100
  ): Unsubscribe {
    const collRef = collection(this.db, collectionName);
    const q = query(collRef, limit(maxDocs));
    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => this.parseDocSnap(docSnap));
        onData(docs);
      },
      (error) => {
        onError(error);
      }
    );
  }

  // Fetch single document by ID
  async getDocumentById(collectionName: string, docId: string): Promise<FirestoreDocumentRecord | null> {
    const docRef = doc(this.db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return this.parseDocSnap(docSnap);
  }

  // Create document (auto ID or custom ID)
  async saveDocument(
    collectionName: string,
    data: Record<string, any>,
    customDocId?: string
  ): Promise<string> {
    const enrichedData = cleanUndefined({
      ...data,
      updatedAt: Date.now(),
    });

    if (customDocId && customDocId.trim()) {
      const docRef = doc(this.db, collectionName, customDocId.trim());
      await setDoc(docRef, {
        ...enrichedData,
        createdAt: data.createdAt || Date.now(),
      }, { merge: true });
      return customDocId.trim();
    } else {
      const collRef = collection(this.db, collectionName);
      const docRef = await addDoc(collRef, {
        ...enrichedData,
        createdAt: Date.now(),
      });
      return docRef.id;
    }
  }

  // Update document
  async updateDocument(
    collectionName: string,
    docId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    const sanitized = cleanUndefined({
      ...updates,
      updatedAt: Date.now(),
    });
    await updateDoc(docRef, sanitized);
  }

  // Delete document
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    await deleteDoc(docRef);
  }

  // Ping / test database connection
  async testConnection(collectionName: string = 'sdo_player_campaign_configs'): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = performance.now();
    try {
      const collRef = collection(this.db, collectionName);
      const q = query(collRef, limit(1));
      await getDocs(q);
      const end = performance.now();
      return { success: true, latencyMs: Math.round(end - start) };
    } catch (err: any) {
      return { success: false, latencyMs: 0, error: err?.message || 'שגיאת חיבור' };
    }
  }
}
