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
  internationalPhone?: string;
  name?: string;
  isAdmin?: boolean;
  chatId?: string;
  formattedDisplay?: string;
  isValidPhone?: boolean;
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

import { GreenApiService, validateWhatsAppPhone, ValidatedWhatsAppPhone } from '../../whatsapp-green-api-hub/services/greenApiService';

export async function fetchLiveWhatsAppGroups(instanceId: string, token: string): Promise<WhatsAppGroupItem[]> {
  if (!instanceId || !token) return [];
  const greenApi = new GreenApiService({
    idInstance: instanceId,
    apiTokenInstance: token,
  });

  try {
    const chats = await greenApi.getChats();
    return chats
      .filter((c) => c.isGroup || (typeof c.id === 'string' && c.id.endsWith('@g.us')))
      .map((c) => ({
        id: c.id,
        name: c.name || c.contactName || c.id.replace('@g.us', ''),
      }));
  } catch (err) {
    console.warn('[WhatsAppGroupImport] Error fetching groups via GreenApiService:', err);
  }

  // Candidate hosts fallback
  const hosts = getGreenApiCandidateHosts(instanceId);
  for (const host of hosts) {
    try {
      const url = `${host}/waInstance${instanceId.trim()}/getChats/${token.trim()}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const raw: any[] = await res.json();
      return (raw || [])
        .filter((c) => typeof c.id === 'string' && c.id.endsWith('@g.us'))
        .map((c) => ({
          id: c.id,
          name: c.name || c.contactName || c.id.replace('@g.us', ''),
        }));
    } catch {}
  }

  return [];
}

export async function fetchGroupParticipants(
  instanceId: string, 
  token: string, 
  groupId: string,
  existingCrmContacts?: Array<{ conta_name?: string; conta_phone?: string }>,
  onProgress?: (progress: { stage: string; current: number; total: number }) => void
): Promise<WhatsAppParticipant[]> {
  if (!instanceId || !token || !groupId) return [];
  const greenApi = new GreenApiService({
    idInstance: instanceId,
    apiTokenInstance: token,
  });

  onProgress?.({ stage: 'שולף נתוני קבוצה וספר טלפונים מחשבון ה-WhatsApp...', current: 0, total: 0 });

  // 1. Fetch group data and phonebook contacts in parallel
  const [groupData, phonebookContacts] = await Promise.all([
    greenApi.getGroupData(groupId).catch(() => null),
    greenApi.getContacts().catch(() => []),
  ]);

  if (!groupData || !Array.isArray(groupData.participants)) {
    return [];
  }

  const rawParticipants = groupData.participants;
  const totalCount = rawParticipants.length;

  // 2. Build name resolution map from phonebook & existing CRM contacts
  const nameMap = new Map<string, string>();

  if (Array.isArray(phonebookContacts)) {
    phonebookContacts.forEach((c: any) => {
      const candidateName = c.name || c.contactName;
      if (candidateName && c.id) {
        const val = validateWhatsAppPhone(c.id);
        if (val.nationalPhone) nameMap.set(val.nationalPhone, candidateName);
        if (val.internationalPhone) nameMap.set(val.internationalPhone, candidateName);
        nameMap.set(c.id, candidateName);
      }
    });
  }

  if (Array.isArray(existingCrmContacts)) {
    existingCrmContacts.forEach((c) => {
      if (c.conta_name && c.conta_phone) {
        const val = validateWhatsAppPhone(c.conta_phone);
        if (val.nationalPhone && !nameMap.has(val.nationalPhone)) {
          nameMap.set(val.nationalPhone, c.conta_name);
        }
        if (val.internationalPhone && !nameMap.has(val.internationalPhone)) {
          nameMap.set(val.internationalPhone, c.conta_name);
        }
      }
    });
  }

  // 3. Pre-process participants
  const participants: WhatsAppParticipant[] = [];
  const needInfoLookup: Array<{ participant: any; index: number; chatId: string }> = [];

  rawParticipants.forEach((p: any, idx: number) => {
    const rawId = p.id || '';
    const val = validateWhatsAppPhone(rawId);
    let resolvedName = p.name || '';

    if (!resolvedName) {
      if (val.nationalPhone && nameMap.has(val.nationalPhone)) {
        resolvedName = nameMap.get(val.nationalPhone)!;
      } else if (val.internationalPhone && nameMap.has(val.internationalPhone)) {
        resolvedName = nameMap.get(val.internationalPhone)!;
      } else if (nameMap.has(rawId)) {
        resolvedName = nameMap.get(rawId)!;
      }
    }

    const participantItem: WhatsAppParticipant = {
      phone: val.nationalPhone || normalizePhoneNumber(rawId),
      internationalPhone: val.internationalPhone,
      name: resolvedName,
      isAdmin: Boolean(p.admin),
      chatId: val.chatId || rawId,
      formattedDisplay: val.formattedDisplay || val.nationalPhone,
      isValidPhone: val.isValid,
    };

    participants.push(participantItem);

    if (!resolvedName && val.isValid) {
      needInfoLookup.push({ participant: p, index: idx, chatId: val.chatId || rawId });
    }
  });

  // 4. Resolve remaining unnamed participants in parallel chunks via getContactInfo (up to 36)
  if (needInfoLookup.length > 0) {
    onProgress?.({ 
      stage: `מפענח שמות פרופיל וואטסאפ עבור ${needInfoLookup.length} משתתפים נוספים...`, 
      current: totalCount - needInfoLookup.length, 
      total: totalCount 
    });

    const CHUNK_SIZE = 6;
    const lookupSubset = needInfoLookup.slice(0, 36);

    for (let i = 0; i < lookupSubset.length; i += CHUNK_SIZE) {
      const chunk = lookupSubset.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (item) => {
          try {
            const info = await greenApi.getContactInfo(item.chatId);
            const foundName = info?.name || info?.contactName;
            if (foundName) {
              participants[item.index].name = foundName;
            }
          } catch {}
        })
      );
    }
  }

  // Fallback label for any participant still without an explicit name
  participants.forEach((p) => {
    if (!p.name || p.name.trim() === '') {
      p.name = p.formattedDisplay ? `איש קשר ${p.formattedDisplay}` : `איש קשר ${p.phone}`;
    }
  });

  return participants;
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

    slice.forEach((p) => {
      const val = validateWhatsAppPhone(p.phone || p.chatId);
      const normPhone = val.nationalPhone || normalizePhoneNumber(p.phone);
      if (!normPhone) return;

      const safeId = `wa_${communityName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}_${normPhone}`;
      const docRef = doc(db, contactsCollectionName, safeId);

      const allTags = Array.from(new Set([communityName, 'וואטסאפ', ...extraTags])).filter(Boolean);

      batch.set(docRef, {
        id: safeId,
        conta_name: p.name || `איש קשר ${val.formattedDisplay || normPhone}`,
        conta_phone: normPhone,
        wa_chat_id: val.chatId,
        wa_international_phone: val.internationalPhone,
        wa_me_url: `https://wa.me/${val.internationalPhone}`,
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
