import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import {
  KosTikTokAccount,
  KosTikTokVideo,
  KosTikTokLead,
  KosTikTokEventPayload,
} from '../types';

/**
 * Scoped collection reference helper for KosTikTok
 */
function getTenantCollection<T = any>(db: Firestore, tenantId: string, colName: string) {
  return collection(db, 'tenants', tenantId, colName);
}

// ==========================================
// Accounts Management (חיבור חשבונות טיקטוק)
// ==========================================

export async function fetchTenantTikTokAccounts(db: Firestore, tenantId: string): Promise<KosTikTokAccount[]> {
  try {
    const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_ACCOUNTS);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as KosTikTokAccount));
  } catch (err) {
    console.warn('[KosTikTok] Error fetching accounts:', err);
    return [];
  }
}

export async function saveTenantTikTokAccount(
  db: Firestore,
  tenantId: string,
  account: Omit<KosTikTokAccount, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_ACCOUNTS);
  const docRef = doc(colRef, account.id);
  const now = new Date().toISOString();
  
  await setDoc(docRef, {
    ...account,
    updatedAt: now,
    createdAt: (account as any).createdAt || now,
    _serverTimestamp: serverTimestamp(),
  }, { merge: true });
}

export async function removeTenantTikTokAccount(db: Firestore, tenantId: string, accountId: string): Promise<void> {
  const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_ACCOUNTS);
  await deleteDoc(doc(colRef, accountId));
}

// ==========================================
// Videos Feed (סרטונים מסונכרנים)
// ==========================================

export async function fetchTenantTikTokVideos(db: Firestore, tenantId: string): Promise<KosTikTokVideo[]> {
  try {
    const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_VIDEOS);
    const q = query(colRef, orderBy('createTime', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as KosTikTokVideo));
  } catch (err) {
    console.warn('[KosTikTok] Error fetching videos:', err);
    return [];
  }
}

export async function saveTenantTikTokVideos(db: Firestore, tenantId: string, videos: KosTikTokVideo[]): Promise<void> {
  const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_VIDEOS);
  
  for (const video of videos) {
    const docRef = doc(colRef, video.id);
    await setDoc(docRef, {
      ...video,
      _serverTimestamp: serverTimestamp(),
    }, { merge: true });
  }
}

// ==========================================
// Leads Management (לידים מטפסים ממומנים)
// ==========================================

export async function fetchTenantTikTokLeads(db: Firestore, tenantId: string): Promise<KosTikTokLead[]> {
  try {
    const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_LEADS);
    const q = query(colRef, orderBy('submittedAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as KosTikTokLead));
  } catch (err) {
    console.warn('[KosTikTok] Error fetching leads:', err);
    return [];
  }
}

export async function saveTenantTikTokLead(db: Firestore, tenantId: string, lead: KosTikTokLead): Promise<void> {
  const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_LEADS);
  const docRef = doc(colRef, lead.id);
  await setDoc(docRef, {
    ...lead,
    _serverTimestamp: serverTimestamp(),
  }, { merge: true });
}

// ==========================================
// Events Tracker (אירועי המרה)
// ==========================================

export async function saveTenantTikTokEventLog(
  db: Firestore,
  tenantId: string,
  event: KosTikTokEventPayload & { status: string; sentAt: string }
): Promise<void> {
  const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_EVENTS);
  const eventId = event.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, eventId);
  await setDoc(docRef, {
    ...event,
    eventId,
    _serverTimestamp: serverTimestamp(),
  }, { merge: true });
}

export async function fetchTenantTikTokEvents(db: Firestore, tenantId: string): Promise<any[]> {
  try {
    const colRef = getTenantCollection(db, tenantId, SYSTEM_COLLECTIONS.KOS_TIKTOK_EVENTS);
    const q = query(colRef, orderBy('sentAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[KosTikTok] Error fetching events:', err);
    return [];
  }
}
