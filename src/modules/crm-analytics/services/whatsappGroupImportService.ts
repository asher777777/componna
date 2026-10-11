import { FirebaseApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, query, where, setDoc } from 'firebase/firestore';
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

export async function checkWhatsAppConnection(instanceId: string, token: string): Promise<{ authorized: boolean; message: string }> {
  if (!instanceId || !token) {
    return { authorized: false, message: 'חסרים פרטי חיבור ל-WhatsApp (Instance ID / Token)' };
  }
  try {
    const url = `https://api.green-api.com/waInstance${instanceId.trim()}/getStateInstance/${token.trim()}`;
    const res = await fetch(url);
    if (!res.ok) return { authorized: false, message: `שגיאת רשת (${res.status})` };
    const data = await res.json();
    if (data.stateInstance === 'authorized') {
      return { authorized: true, message: 'חשבון WhatsApp מחובר ומאושר' };
    }
    return { authorized: false, message: `סטטוס WhatsApp: ${data.stateInstance || 'אינו מורשה'}` };
  } catch (e: any) {
    return { authorized: false, message: e?.message || 'שגיאה בבדיקת חיבור' };
  }
}

export async function fetchLiveWhatsAppGroups(instanceId: string, token: string): Promise<WhatsAppGroupItem[]> {
  if (!instanceId || !token) return [];
  try {
    const url = `https://api.green-api.com/waInstance${instanceId.trim()}/getChats/${token.trim()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const chats: any[] = await res.json();

    return (chats || [])
      .filter((c) => typeof c.id === 'string' && c.id.endsWith('@g.us'))
      .map((c) => ({
        id: c.id,
        name: c.name || c.contactName || c.id.replace('@g.us', ''),
      }));
  } catch (err) {
    console.warn('[WhatsAppGroupImport] Error fetching groups:', err);
    return [];
  }
}

export async function fetchGroupParticipants(
  instanceId: string, 
  token: string, 
  groupId: string
): Promise<WhatsAppParticipant[]> {
  if (!instanceId || !token || !groupId) return [];
  try {
    const url = `https://api.green-api.com/waInstance${instanceId.trim()}/getGroupData/${token.trim()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });

    if (!res.ok) return [];
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
    console.warn('[WhatsAppGroupImport] Error fetching participants:', err);
    return [];
  }
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
