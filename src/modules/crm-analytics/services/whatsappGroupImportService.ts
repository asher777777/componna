import { FirebaseApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, getDoc, query, where, setDoc } from 'firebase/firestore';
import { DEFAULT_COLLECTIONS } from '../config';

export interface WhatsAppGroupItem {
  id: string;
  name: string;
  participantsCount?: number;
}

export interface WhatsAppParticipant {
  phone: string;
  name?: string;
  isAdmin?: boolean;
  chatId?: string;
}

export function normalizePhoneNumber(raw?: string): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('972')) {
    digits = '0' + digits.slice(3);
  } else if (digits.length === 9 && digits.startsWith('5')) {
    digits = '0' + digits;
  }
  return digits;
}

/**
 * Returns candidate hosts for Green API to prevent 301 redirects and CORS blocks
 */
export function getGreenApiCandidateHosts(instanceId: string): string[] {
  const clean = (instanceId || '').trim();
  const hosts: string[] = [];
  if (clean.length >= 4) {
    const cluster = clean.slice(0, 4);
    hosts.push(`https://${cluster}.api.greenapi.com`);
  }
  hosts.push('https://api.green-api.com');
  hosts.push('https://media.green-api.com');
  return Array.from(new Set(hosts));
}

/**
 * Directly queries the Tenant Settings Collection from Firestore:
 * tenants/{tenantId}/settings/api_keys
 */
export async function fetchTenantWhatsAppCredentials(
  firebaseApp?: FirebaseApp,
  tenantId: string = '_master'
): Promise<{ instanceId: string; token: string }> {
  if (!firebaseApp) return { instanceId: '', token: '' };
  try {
    const db = getFirestore(firebaseApp);
    const targetTenant = tenantId || '_master';
    
    // 1. Primary path: tenants/{tenantId}/settings/api_keys
    const primaryRef = doc(db, 'tenants', targetTenant, 'settings', 'api_keys');
    const primarySnap = await getDoc(primaryRef);
    if (primarySnap.exists()) {
      const data = primarySnap.data() || {};
      const id = data.greenApiInstanceId || data.greenApiIdInstance || data.idInstance || '';
      const tok = data.greenApiToken || data.greenApiTokenInstance || data.apiTokenInstance || data.whatsappApiToken || '';
      if (id && tok) {
        return { instanceId: String(id).trim(), token: String(tok).trim() };
      }
    }

    // 2. Fallback path: tenants/{tenantId}/settings/whatsapp
    const fallbackRef = doc(db, 'tenants', targetTenant, 'settings', 'whatsapp');
    const fallbackSnap = await getDoc(fallbackRef);
    if (fallbackSnap.exists()) {
      const data = fallbackSnap.data() || {};
      const id = data.greenApiInstanceId || data.greenApiIdInstance || data.idInstance || '';
      const tok = data.greenApiToken || data.greenApiTokenInstance || data.apiTokenInstance || data.token || '';
      if (id && tok) {
        return { instanceId: String(id).trim(), token: String(tok).trim() };
      }
    }
  } catch (err) {
    console.warn('[WhatsAppGroupImport] Error loading tenant credentials from Firestore:', err);
  }
  return { instanceId: '', token: '' };
}

export async function checkWhatsAppConnection(instanceId: string, token: string): Promise<{ authorized: boolean; message: string }> {
  if (!instanceId || !token) {
    return { authorized: false, message: 'חסרים פרטי חיבור ל-WhatsApp (Instance ID / Token)' };
  }

  const hosts = getGreenApiCandidateHosts(instanceId);
  let lastError: any = null;

  for (const host of hosts) {
    try {
      const url = `${host}/waInstance${instanceId.trim()}/getStateInstance/${token.trim()}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.stateInstance === 'authorized') {
        return { authorized: true, message: 'חשבון WhatsApp מחובר ומאושר' };
      }
      return { authorized: false, message: `סטטוס WhatsApp: ${data.stateInstance || 'אינו מורשה'}` };
    } catch (e: any) {
      lastError = e;
    }
  }

  return { authorized: false, message: lastError?.message || 'שגיאה בבדיקת חיבור' };
}

export async function fetchLiveWhatsAppGroups(instanceId: string, token: string): Promise<WhatsAppGroupItem[]> {
  if (!instanceId || !token) return [];
  const hosts = getGreenApiCandidateHosts(instanceId);

  for (const host of hosts) {
    try {
      const url = `${host}/waInstance${instanceId.trim()}/getChats/${token.trim()}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const chats: any[] = await res.json();

      return (chats || [])
        .filter((c) => typeof c.id === 'string' && c.id.endsWith('@g.us'))
        .map((c) => ({
          id: c.id,
          name: c.name || c.contactName || c.id.replace('@g.us', ''),
        }));
    } catch (err) {
      console.warn(`[WhatsAppGroupImport] Error fetching groups from ${host}:`, err);
    }
  }

  return [];
}

export async function fetchGroupParticipants(
  instanceId: string, 
  token: string, 
  groupId: string
): Promise<WhatsAppParticipant[]> {
  if (!instanceId || !token || !groupId) return [];
  const hosts = getGreenApiCandidateHosts(instanceId);

  for (const host of hosts) {
    try {
      const url = `${host}/waInstance${instanceId.trim()}/getGroupData/${token.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });

      if (!res.ok) continue;
      const data = await res.json();

      const participants: WhatsAppParticipant[] = (data.participants || []).map((p: any) => {
        const rawPhone = (p.id || '').replace('@c.us', '');
        const normalized = normalizePhoneNumber(rawPhone);
        return {
          phone: normalized || rawPhone,
          name: p.name || `איש קשר ${normalized || rawPhone}`,
          isAdmin: Boolean(p.admin),
          chatId: p.id,
        };
      });

      return participants;
    } catch (err) {
      console.warn(`[WhatsAppGroupImport] Error fetching participants from ${host}:`, err);
    }
  }

  return [];
}

export async function importParticipantsToCrmContacts(
  firebaseApp: FirebaseApp | undefined,
  contactsCollectionName: string,
  participants: WhatsAppParticipant[],
  communityName: string,
  extraTags: string[] = [],
  ownerId?: string
): Promise<{ createdCount: number; updatedCount: number }> {
  if (!firebaseApp || participants.length === 0) return { createdCount: 0, updatedCount: 0 };

  const db = getFirestore(firebaseApp);
  let createdCount = 0;
  let updatedCount = 0;

  // Process in batches of 400
  const BATCH_SIZE = 400;
  for (let i = 0; i < participants.length; i += BATCH_SIZE) {
    const slice = participants.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    slice.forEach((p, idx) => {
      const normPhone = normalizePhoneNumber(p.phone);
      if (!normPhone) return;

      const safeId = `wa_${communityName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}_${normPhone}`;
      const docRef = doc(db, contactsCollectionName, safeId);

      const allTags = Array.from(new Set([communityName, 'וואטסאפ', ...extraTags])).filter(Boolean);

      batch.set(docRef, {
        id: safeId,
        conta_name: p.name || `איש קשר ${normPhone}`,
        conta_phone: normPhone,
        community: communityName.trim(),
        tags: allTags,
        status: 'active',
        source: 'whatsapp_group_import',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: ownerId || null,
      }, { merge: true });

      createdCount++;
    });

    await batch.commit();
  }

  return { createdCount, updatedCount };
}
