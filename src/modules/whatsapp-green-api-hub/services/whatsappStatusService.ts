import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
} from 'firebase/firestore';
import { SavedWhatsAppStatus, GreenApiStatusStatisticItem } from '../types';

const LOCAL_STORAGE_KEY = 'comona_whatsapp_statuses_archive_v1';

/**
 * Reads local fallback statuses from localStorage
 */
export function getLocalCachedStatuses(): SavedWhatsAppStatus[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to read local cached statuses:', e);
    return [];
  }
}

/**
 * Saves statuses to localStorage cache
 */
export function setLocalCachedStatuses(items: SavedWhatsAppStatus[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to cache statuses in localStorage:', e);
  }
}

/**
 * Saves a new published status permanently to Firestore and localStorage
 */
export async function saveStatusToArchive(
  db: Firestore | undefined,
  collectionName: string = 'whatsapp_statuses',
  statusItem: SavedWhatsAppStatus
): Promise<void> {
  // 1. Update localStorage cache first
  const current = getLocalCachedStatuses();
  const existingIdx = current.findIndex((s) => s.id === statusItem.id);
  let updatedList: SavedWhatsAppStatus[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = statusItem;
  } else {
    updatedList = [statusItem, ...current];
  }
  setLocalCachedStatuses(updatedList);

  // 2. Save to Firestore if available
  if (db) {
    try {
      const docRef = doc(db, collectionName, statusItem.id);
      await setDoc(docRef, {
        ...statusItem,
        updatedAt: Date.now(),
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to save status to Firestore:', err);
    }
  }
}

/**
 * Loads all archived statuses from Firestore (falling back to localStorage)
 */
export async function loadStatusesFromArchive(
  db?: Firestore,
  collectionName: string = 'whatsapp_statuses'
): Promise<SavedWhatsAppStatus[]> {
  const localList = getLocalCachedStatuses();

  if (!db) {
    return localList;
  }

  try {
    const q = query(collection(db, collectionName), limit(300));
    const snap = await getDocs(q);
    const firestoreList: SavedWhatsAppStatus[] = [];

    snap.forEach((d) => {
      const data = d.data() as SavedWhatsAppStatus;
      firestoreList.push({
        ...data,
        id: d.id,
      });
    });

    // Merge Firestore with LocalStorage
    const map = new Map<string, SavedWhatsAppStatus>();
    localList.forEach((s) => map.set(s.id, s));
    firestoreList.forEach((s) => map.set(s.id, s));

    const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setLocalCachedStatuses(merged);
    return merged;
  } catch (err) {
    console.warn('Error loading statuses from Firestore, returning local cache:', err);
    return localList;
  }
}

/**
 * Updates views and statistic items on an archived status
 */
export async function updateStatusStatisticsInArchive(
  db: Firestore | undefined,
  collectionName: string = 'whatsapp_statuses',
  statusId: string,
  statistics: GreenApiStatusStatisticItem[]
): Promise<void> {
  const viewersCount = statistics.filter((s) => s.status === 'read').length;
  const deliveredCount = statistics.filter((s) => s.status === 'delivered').length;
  const sentCount = statistics.filter((s) => s.status === 'sent').length;

  // 1. Update localStorage
  const current = getLocalCachedStatuses();
  const index = current.findIndex((s) => s.id === statusId);
  if (index >= 0) {
    current[index] = {
      ...current[index],
      viewersCount,
      deliveredCount,
      sentCount,
      statistics,
      lastSyncedAt: Date.now(),
    };
    setLocalCachedStatuses(current);
  }

  // 2. Update Firestore
  if (db) {
    try {
      const docRef = doc(db, collectionName, statusId);
      await updateDoc(docRef, {
        viewersCount,
        deliveredCount,
        sentCount,
        statistics,
        lastSyncedAt: Date.now(),
      });
    } catch (err) {
      console.warn(`Failed to update status ${statusId} statistics in Firestore:`, err);
    }
  }
}

/**
 * Deletes a status from archive
 */
export async function deleteStatusFromArchive(
  db: Firestore | undefined,
  collectionName: string = 'whatsapp_statuses',
  statusId: string
): Promise<void> {
  // 1. LocalStorage
  const current = getLocalCachedStatuses().filter((s) => s.id !== statusId);
  setLocalCachedStatuses(current);

  // 2. Firestore
  if (db) {
    try {
      await deleteDoc(doc(db, collectionName, statusId));
    } catch (err) {
      console.warn(`Failed to delete status ${statusId} from Firestore:`, err);
    }
  }
}