import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { TemplateItem } from '../types';

export class TemplateFirestoreService {
  private db: Firestore;
  private collectionName: string;

  constructor(db: Firestore, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  async getItems(): Promise<TemplateItem[]> {
    const collRef = collection(this.db, this.collectionName);
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as TemplateItem[];
  }

  async getItemById(id: string): Promise<TemplateItem | null> {
    const docRef = doc(this.db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as TemplateItem;
  }

  async createItem(item: Omit<TemplateItem, 'id' | 'createdAt'>): Promise<string> {
    const collRef = collection(this.db, this.collectionName);
    const docRef = await addDoc(collRef, {
      ...item,
      createdAt: Date.now(),
    });
    return docRef.id;
  }

  async updateItem(id: string, updates: Partial<TemplateItem>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, { ...updates });
  }

  async deleteItem(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
