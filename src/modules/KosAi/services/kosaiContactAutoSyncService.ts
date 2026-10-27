import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { eventBus } from '../../../core/bridge/EventBus';
import { KosaiMessage } from '../types';

export interface ExtractedContactDetails {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  company?: string;
}

/**
 * Normalizes phone numbers (removes non-digits, international 972 prefix, leading zeros)
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('972')) cleaned = cleaned.substring(3);
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  return cleaned;
}

/**
 * Extract contact details mentioned in chat messages
 */
export function extractContactDetailsFromText(text: string): ExtractedContactDetails {
  const result: ExtractedContactDetails = {};
  if (!text) return result;

  // 1. Phone extraction
  const phoneRegex = /(?:(?:\+?972[-\s]?|0)(?:5[0-9]|7[0-9]|2|3|4|8|9)[-\s]?\d{3}[-\s]?\d{4})/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch[0]) {
    result.phone = phoneMatch[0].replace(/[^\d+]/g, '');
  }

  // 2. Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch[0]) {
    result.email = emailMatch[0].trim().toLowerCase();
  }

  // 3. Name extraction: "קוראים לי [שם]", "השם שלי הוא [שם]", "שמי [שם]", "מדבר [שם]"
  const nameIntroRegex = /(?:קוראים לי|השם שלי(?: הוא)?|שמי|מדבר(?:ת)?|אני|שם מלא:?)\s+([א-תA-Za-z]{2,}(?:\s+[א-תA-Za-z]{2,}){1,3})/i;
  const nameMatch = text.match(nameIntroRegex);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    const falsePositives = ['מעוניין', 'רוצה', 'צריך', 'מחפש', 'מבקש', 'שואל', 'שמח', 'יכול', 'כאן'];
    if (!falsePositives.includes(rawName)) {
      result.name = rawName;
    }
  }

  // 4. City extraction
  const cityRegex = /(?:מ|ב|גר ב|גרה ב|עיר:?)\s*(תל אביב|ירושלים|חיפה|באר שבע|ראשון לציון|אשדוד|פתח תקווה|נתניה|חולון|בני ברק|רמת גן|רחובות|אשקלון|בת ים|הרצליה|כפר סבא|חדרה|מודיעין|רעננה|רמלה|לוד|נצרת|עכו|טבריה|אילת|הוד השרון|גבעתיים|קריית אתא|נהריה|קריית גת|קריית מוצקין|עפולה|כרמיאל|קריית ביאליק|רמת השרון|יבנה|נשר|קריית אונו|אור יהודה|צפת|דימונה|מעלה אדומים|טירת כרמל|נס ציונה|ערד|יהוד|שדרות|אופקים|נתיבות|בית שמש|אלעד|ביתר עילית|מודיעין עילית)/;
  const cityMatch = text.match(cityRegex);
  if (cityMatch && cityMatch[1]) {
    result.city = cityMatch[1].trim();
  }

  // 5. Company extraction
  const companyRegex = /(?:מחברת|חברה:?|עסק:?|ארגון:?)\s+([א-תA-Za-z0-9\s"'-]{2,25})/i;
  const companyMatch = text.match(companyRegex);
  if (companyMatch && companyMatch[1]) {
    result.company = companyMatch[1].trim();
  }

  return result;
}

export interface AutoSyncChatParams {
  db: Firestore;
  tenantId: string;
  conversationId: string;
  moduleId: string;
  title: string;
  userMessage: string;
  assistantMessage: string;
  cachedContentId?: string | null;
  messages: KosaiMessage[];
}

export const kosaiContactAutoSyncService = {
  /**
   * Scans chat messages for contact info, creates or updates the Contact Card in CRM,
   * archives the conversation in the contact's subcollection, and persists cachedContentId.
   */
  async syncChatToContactCard(params: AutoSyncChatParams): Promise<string | null> {
    const {
      db,
      tenantId,
      conversationId,
      moduleId,
      title,
      userMessage,
      cachedContentId,
      messages,
    } = params;

    if (!db || !tenantId) return null;

    const extracted = extractContactDetailsFromText(userMessage);
    const hasContactInfo = Boolean(extracted.phone || extracted.email || extracted.name);

    if (!hasContactInfo) {
      return null;
    }

    const contactsColPath = `tenants/${tenantId}/contacts`;
    const contactsRef = collection(db, contactsColPath);

    let matchedContactDocId: string | null = null;
    let existingContactData: any = null;

    try {
      const contactsSnap = await getDocs(contactsRef);
      const normInputPhone = extracted.phone ? normalizePhone(extracted.phone) : '';

      contactsSnap.forEach((d) => {
        const data = d.data();
        const contactPhone = normalizePhone(
          data.conta_phone || data.phone || data.mobile || data.phoneNumber || ''
        );
        if (normInputPhone && contactPhone && contactPhone === normInputPhone) {
          matchedContactDocId = d.id;
          existingContactData = data;
        } else if (
          extracted.email &&
          data.email &&
          data.email.trim().toLowerCase() === extracted.email.trim().toLowerCase()
        ) {
          matchedContactDocId = d.id;
          existingContactData = data;
        }
      });
    } catch (err) {
      console.warn('[kosaiContactAutoSyncService] Contact lookup notice:', err);
    }

    const now = Date.now();
    const isoDate = new Date().toISOString();
    const contactId = matchedContactDocId || `contact_${now}_${Math.random().toString(36).slice(2, 6)}`;

    if (matchedContactDocId && existingContactData) {
      // UPDATE EXISTING CONTACT
      const updates: Record<string, any> = {
        updatedAt: isoDate,
        last_conversation_date: isoDate,
        last_message: userMessage,
        last_channel: 'web_chat',
      };

      if (cachedContentId) {
        updates.cachedContentId = cachedContentId;
      }

      const currentName = existingContactData.conta_name || '';
      const isPlaceholder = !currentName || currentName === 'איש קשר' || currentName === 'ליד ללא שם';
      if (extracted.name && (isPlaceholder || extracted.name.length > currentName.length)) {
        updates.conta_name = extracted.name;
      }
      if (extracted.phone && !existingContactData.conta_phone) {
        updates.conta_phone = extracted.phone;
      }
      if (extracted.email && !existingContactData.email) {
        updates.email = extracted.email;
      }
      if (extracted.city && !existingContactData.mh_crm_city) {
        updates.mh_crm_city = extracted.city;
      }
      if (extracted.company && !existingContactData.company_name) {
        updates.company_name = extracted.company;
      }

      try {
        const contactDocRef = doc(db, contactsColPath, contactId);
        await updateDoc(contactDocRef, updates);

        eventBus.publish('crm:contact:updated', {
          id: contactId,
          ...existingContactData,
          ...updates,
        });
      } catch (uErr) {
        console.warn('[kosaiContactAutoSyncService] Error updating contact:', uErr);
      }
    } else {
      // CREATE BRAND NEW CONTACT CARD
      const newContactName = extracted.name || `ליד ${extracted.phone ? extracted.phone.slice(-4) : 'משיחת AI'}`;
      const newContactRecord = {
        id: contactId,
        conta_name: newContactName,
        conta_phone: extracted.phone || '',
        email: extracted.email || '',
        mh_crm_city: extracted.city || '',
        company_name: extracted.company || '',
        is_lead: true,
        contact_type: 'lead',
        status: 'active',
        lead_source: `סוכן קושאן AI (${moduleId})`,
        tags: ['ליד חדש', 'שיחת קושאן AI'],
        cachedContentId: cachedContentId || null,
        total_spent: 0,
        order_count: 0,
        createdAt: isoDate,
        updatedAt: isoDate,
        last_conversation_date: isoDate,
        last_message: userMessage,
        last_channel: 'web_chat',
      };

      try {
        const contactDocRef = doc(db, contactsColPath, contactId);
        await setDoc(contactDocRef, newContactRecord);

        eventBus.publish('crm:lead:created', {
          conta_name: newContactRecord.conta_name,
          conta_phone: newContactRecord.conta_phone,
          email: newContactRecord.email,
          source: newContactRecord.lead_source,
          tags: newContactRecord.tags,
          metadata: {
            contactId,
            cachedContentId,
            channel: 'web_chat',
            moduleId,
          },
        });
      } catch (cErr) {
        console.warn('[kosaiContactAutoSyncService] Error creating contact:', cErr);
      }
    }

    // ARCHIVE FULL CONVERSATION IN SUBCOLLECTION:
    // tenants/{tenantId}/contacts/{contactId}/conversations/{conversationId}
    try {
      const convSubRef = doc(db, `tenants/${tenantId}/contacts/${contactId}/conversations`, conversationId);
      await setDoc(
        convSubRef,
        {
          id: conversationId,
          contactId,
          channel: 'web_chat',
          moduleId,
          title,
          cachedContentId: cachedContentId || null,
          lastUpdatedAt: now,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: typeof m.timestamp === 'object' && m.timestamp instanceof Date ? m.timestamp.getTime() : m.timestamp,
          })),
        },
        { merge: true }
      );
    } catch (sErr) {
      console.warn('[kosaiContactAutoSyncService] Error archiving to contact conversations subcollection:', sErr);
    }

    return contactId;
  },
};
