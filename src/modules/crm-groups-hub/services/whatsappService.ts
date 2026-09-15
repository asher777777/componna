import { Firestore, collection, getDocs, doc, setDoc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { ContactRecord, WhatsAppConnectionInfo, WhatsAppDirectContactItem, WhatsAppGroupItem, WhatsAppGroupParticipant, CrmGroupsCollectionsConfig } from '../types';
import { normalizePhoneNumber } from './groupsUtils';
import { DEFAULT_COLLECTIONS } from '../config';

export interface GreenApiConfig {
  idInstance?: string;
  apiTokenInstance?: string;
  apiUrl?: string;
}

export function getGreenApiBaseUrl(config?: GreenApiConfig): string {
  const host = (config?.apiUrl || 'https://api.green-api.com').replace(/\/+$/, '');
  const idInstance = config?.idInstance || '';
  const apiTokenInstance = config?.apiTokenInstance || '';
  return `${host}/waInstance${idInstance}`;
}

export async function checkWhatsAppConnectionStatus(config?: GreenApiConfig): Promise<WhatsAppConnectionInfo> {
  if (!config?.idInstance || !config?.apiTokenInstance) {
    return {
      status: 'notAuthorized',
      error: 'חסרים מפתחות Green API (ID Instance / Token)',
    };
  }

  try {
    const url = `${getGreenApiBaseUrl(config)}/getStateInstance/${config.apiTokenInstance}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();

    if (data.stateInstance === 'authorized') {
      return {
        status: 'authorized',
        phoneNumber: data.stateInstance,
      };
    }
    return {
      status: 'notAuthorized',
      error: `סטטוס וואטסאפ: ${data.stateInstance || 'אינו מורשה'}`,
    };
  } catch (err: any) {
    return {
      status: 'error',
      error: err.message || 'שגיאה בבדיקת חיבור לוואטסאפ',
    };
  }
}

export async function fetchWhatsAppGroups(config?: GreenApiConfig): Promise<WhatsAppGroupItem[]> {
  if (!config?.idInstance || !config?.apiTokenInstance) return [];

  try {
    const url = `${getGreenApiBaseUrl(config)}/getChats/${config.apiTokenInstance}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const chats: any[] = await res.json();

    // Filter only groups ending with @g.us
    return (chats || [])
      .filter((c) => typeof c.id === 'string' && c.id.endsWith('@g.us'))
      .map((c) => ({
        id: c.id,
        name: c.name || c.contactName || c.id.replace('@g.us', ''),
      }));
  } catch (err) {
    console.warn('Error fetching WhatsApp groups:', err);
    return [];
  }
}

export async function fetchWhatsAppGroupParticipants(
  groupId: string,
  config?: GreenApiConfig
): Promise<WhatsAppGroupParticipant[]> {
  if (!config?.idInstance || !config?.apiTokenInstance || !groupId) return [];

  try {
    const url = `${getGreenApiBaseUrl(config)}/getGroupData/${config.apiTokenInstance}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const participants: WhatsAppGroupParticipant[] = (data.participants || []).map((p: any) => {
      const rawPhone = (p.id || '').replace('@c.us', '');
      const normalized = normalizePhoneNumber(rawPhone);
      return {
        phone: normalized || rawPhone,
        name: p.name || `חבר קבוצה (${normalized || rawPhone})`,
        isAdmin: Boolean(p.admin),
        chatId: p.id,
      };
    });

    return participants;
  } catch (err) {
    console.warn('Error fetching group participants:', err);
    return [];
  }
}

export async function importWhatsAppParticipantsToCrm(
  db: Firestore,
  ownerId: string,
  params: {
    participants: { phone: string; name: string }[];
    targetCommunityName: string;
    extraTags?: string[];
  },
  customCollections?: CrmGroupsCollectionsConfig
): Promise<{ createdCount: number; updatedCount: number; totalProcessed: number }> {
  const collName = customCollections?.contacts || DEFAULT_COLLECTIONS.contacts;
  let createdCount = 0;
  let updatedCount = 0;

  for (const item of params.participants) {
    const normPhone = normalizePhoneNumber(item.phone);
    if (!normPhone) continue;

    // Search for existing contact by normalized phone
    const q = ownerId
      ? query(
          collection(db, collName),
          where('ownerId', '==', ownerId),
          where('conta_phone', '==', normPhone)
        )
      : query(collection(db, collName), where('conta_phone', '==', normPhone));

    const snap = await getDocs(q);

    const extraTags = params.extraTags || [];
    const allNewTags = [params.targetCommunityName, ...extraTags].filter(Boolean);

    if (!snap.empty) {
      // Update existing
      const existingDoc = snap.docs[0];
      const existingTags: string[] = existingDoc.data().tags || [];
      const mergedTags = Array.from(new Set([...existingTags, ...allNewTags]));

      await updateDoc(existingDoc.ref, {
        tags: mergedTags,
        community: params.targetCommunityName,
        updatedAt: new Date().toISOString(),
      });
      updatedCount++;
    } else {
      // Create new contact
      const newRef = doc(collection(db, collName));
      const newContact: ContactRecord = {
        id: newRef.id,
        ownerId,
        conta_name: item.name || `איש קשר ${normPhone}`,
        conta_phone: normPhone,
        tags: allNewTags,
        community: params.targetCommunityName,
        status: 'פעיל',
        lead_source: 'WhatsApp Group Import',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(newRef, newContact);
      createdCount++;
    }
  }

  return {
    createdCount,
    updatedCount,
    totalProcessed: params.participants.length,
  };
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  config?: GreenApiConfig
): Promise<boolean> {
  if (!config?.idInstance || !config?.apiTokenInstance || !phone || !message) return false;

  try {
    const normPhone = normalizePhoneNumber(phone);
    const chatId = `${normPhone}@c.us`;
    const url = `${getGreenApiBaseUrl(config)}/sendMessage/${config.apiTokenInstance}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    });

    return res.ok;
  } catch (err) {
    console.warn('Error sending WhatsApp message:', err);
    return false;
  }
}
