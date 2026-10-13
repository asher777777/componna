import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  limit,
} from 'firebase/firestore';
import { eventBus } from '../../../core/bridge/EventBus';
import { normalizePhone } from './whatsappCrmSyncService';

export interface ExtractedContactDetails {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  company?: string;
}

export interface ConversationMessage {
  role: 'user' | 'model' | 'assistant';
  text: string;
  timestamp: number;
}

/**
 * Robust regex-based parser to extract contact info mentioned dynamically in chat messages.
 */
export function extractContactDetails(
  text: string,
  fallbackSenderName?: string,
  fallbackPhone?: string
): ExtractedContactDetails {
  const result: ExtractedContactDetails = {};
  if (!text) return result;

  // 1. Phone extraction: matches Israeli patterns like 050-1234567, 0521234567, +972501234567
  const phoneRegex = /(?:(?:\+?972[-\s]?|0)(?:5[0-9]|7[0-9]|2|3|4|8|9)[-\s]?\d{3}[-\s]?\d{4})/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch[0]) {
    result.phone = phoneMatch[0].replace(/[^\d+]/g, '');
  } else if (fallbackPhone) {
    result.phone = fallbackPhone;
  }

  // 2. Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch[0]) {
    result.email = emailMatch[0].trim().toLowerCase();
  }

  // 3. Name extraction: "קוראים לי [שם]", "השם שלי הוא [שם]", "שמי [שם]", "מדבר [שם]", "אני [שם]"
  const nameIntroRegex = /(?:קוראים לי|השם שלי(?: הוא)?|שמי|מדבר(?:ת)?|אני|שם מלא:?)\s+([א-תA-Za-z]{2,}(?:\s+[א-תA-Za-z]{2,}){1,3})/i;
  const nameMatch = text.match(nameIntroRegex);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    // Exclude common false positives
    const falsePositives = ['מעוניין', 'רוצה', 'צריך', 'מחפש', 'מבקש', 'שואל', 'שמח', 'יכול', 'כאן'];
    if (!falsePositives.includes(rawName)) {
      result.name = rawName;
    }
  }

  // Fallback to sender profile name if no explicit name was in text and senderName looks like a real person
  if (!result.name && fallbackSenderName) {
    const cleanSenderName = fallbackSenderName.trim();
    const isPhoneNumber = /^[\d\s+\-_]+$/.test(cleanSenderName);
    if (!isPhoneNumber && cleanSenderName.length >= 2 && !cleanSenderName.includes('@')) {
      result.name = cleanSenderName;
    }
  }

  // 4. City extraction: "אני מ[עיר]", "גר ב[עיר]", "גרה ב[עיר]", "סניף [עיר]"
  const cityRegex = /(?:מ|ב|גר ב|גרה ב|עיר:?)\s*(תל אביב|ירושלים|חיפה|באר שבע|ראשון לציון|אשדוד|פתח תקווה|נתניה|חולון|בני ברק|רמת גן|רחובות|אשקלון|בת ים|הרצליה|כפר סבא|חדרה|מודיעין|רעננה|רמלה|לוד|נצרת|עכו|טבריה|אילת|הוד השרון|גבעתיים|קריית אתא|נהריה|קריית גת|קריית מוצקין|עפולה|כרמיאל|קריית ביאליק|רמת השרון|יבנה|נשר|קריית אונו|אור יהודה|צפת|דימונה|מעלה אדומים|טירת כרמל|נס ציונה|ערד|יהוד|שדרות|אופקים|נתיבות|בית שמש|אלעד|ביתר עילית|מודיעין עילית)/;
  const cityMatch = text.match(cityRegex);
  if (cityMatch && cityMatch[1]) {
    result.city = cityMatch[1].trim();
  }

  // 5. Company extraction: "מחברת [חברה]", "חברה: [חברה]", "עסק: [עסק]"
  const companyRegex = /(?:מחברת|חברה:?|עסק:?|ארגון:?)\s+([א-תA-Za-z0-9\s"'-]{2,25})/i;
  const companyMatch = text.match(companyRegex);
  if (companyMatch && companyMatch[1]) {
    result.company = companyMatch[1].trim();
  }

  return result;
}

export interface SyncConversationToCrmParams {
  db: Firestore;
  tenantId: string;
  senderPhone: string;
  senderName?: string;
  channel: 'whatsapp' | 'web_chat';
  botId?: string;
  botName?: string;
  userMessage: string;
  replyMessage: string;
  cachedContentId?: string | null;
  existingMessages?: ConversationMessage[];
}

export const whatsappAutoCrmService = {
  /**
   * Automatically documents conversation, creates or updates contact card,
   * stores cachedContentId for subsequent turns, and publishes real-time CRM events.
   */
  async syncChatAndContact(params: SyncConversationToCrmParams): Promise<{
    contactId: string;
    cachedContentId?: string | null;
  }> {
    const {
      db,
      tenantId,
      senderPhone,
      senderName,
      channel,
      botId = 'kosai_agent',
      botName = 'קושאן AI',
      userMessage,
      replyMessage,
      cachedContentId,
      existingMessages = [],
    } = params;

    if (!db || !tenantId || !senderPhone) {
      return { contactId: '' };
    }

    const normPhone = normalizePhone(senderPhone);
    const extracted = extractContactDetails(userMessage, senderName, senderPhone);

    const contactsColPath = `tenants/${tenantId}/contacts`;
    const contactsRef = collection(db, contactsColPath);

    let matchedContactDocId: string | null = null;
    let existingContactData: any = null;

    try {
      // 1. Check for existing contact by normalized phone
      const contactsSnap = await getDocs(contactsRef);
      contactsSnap.forEach((d) => {
        const data = d.data();
        const contactPhone = normalizePhone(
          data.conta_phone || data.phone || data.mobile || data.phoneNumber || ''
        );
        if (contactPhone && contactPhone === normPhone) {
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
      console.warn('[whatsappAutoCrmService] Contacts search notice:', err);
    }

    const now = Date.now();
    const isoDate = new Date().toISOString();
    let contactId = matchedContactDocId || `contact_${now}_${Math.random().toString(36).slice(2, 6)}`;

    // Prepare updated messages array
    const updatedMessages: ConversationMessage[] = [
      ...existingMessages,
      { role: 'user', text: userMessage, timestamp: now },
      { role: 'model', text: replyMessage, timestamp: now + 50 },
    ];

    if (matchedContactDocId && existingContactData) {
      // UPDATE EXISTING CONTACT
      const updates: Record<string, any> = {
        updatedAt: isoDate,
        last_conversation_date: isoDate,
        last_message: userMessage,
        last_channel: channel,
      };

      if (cachedContentId) {
        updates.cachedContentId = cachedContentId;
      }

      // If existing contact was missing name or had generic/placeholder name, update it!
      const currentName = existingContactData.kosun_crm_name || existingContactData.conta_name || '';
      const isPlaceholderName = !currentName || currentName === 'איש קשר' || currentName === 'ליד ללא שם' || currentName === senderPhone;
      if (extracted.name && (isPlaceholderName || extracted.name.length > currentName.length)) {
        updates.conta_name = extracted.name;
        updates.kosun_crm_name = extracted.name;
        updates.fullName = extracted.name;
      }

      // If email was missing and now provided
      if (extracted.email && !existingContactData.email) {
        updates.email = extracted.email;
        updates.kosun_crm_email = extracted.email;
      }

      // If city was missing and now provided
      if (extracted.city && !existingContactData.mh_crm_city) {
        updates.mh_crm_city = extracted.city;
        updates.kosun_crm_city = extracted.city;
      }

      // If company was missing and now provided
      if (extracted.company && !existingContactData.company_name) {
        updates.company_name = extracted.company;
        updates.kosun_crm_company = extracted.company;
      }

      try {
        const contactDocRef = doc(db, contactsColPath, contactId);
        await updateDoc(contactDocRef, updates);
        
        // Also mirror update to root collection ONLY if running in _master tenant
        if (tenantId === '_master') {
          try {
            await updateDoc(doc(db, 'contacts', contactId), updates);
          } catch {}
        }

        eventBus.publish('crm:contact:updated', {
          id: contactId,
          ...existingContactData,
          ...updates,
        });
      } catch (uErr) {
        console.warn('[whatsappAutoCrmService] Error updating contact:', uErr);
      }
    } else {
      // CREATE BRAND NEW CONTACT CARD
      const newContactName = extracted.name || senderName || `לקוח ${senderPhone.slice(-4)}`;
      const newContactRecord = {
        id: contactId,
        // Canonical & Legacy Fields for 100% CRM visibility
        conta_name: newContactName,
        kosun_crm_name: newContactName,
        fullName: newContactName,
        name: newContactName,
        
        conta_phone: senderPhone,
        kosun_crm_phone: senderPhone,
        phone: senderPhone,
        normalizedPhone: normPhone,
        
        email: extracted.email || '',
        kosun_crm_email: extracted.email || '',
        
        mh_crm_city: extracted.city || '',
        kosun_crm_city: extracted.city || '',
        city: extracted.city || '',
        
        company_name: extracted.company || '',
        kosun_crm_company: extracted.company || '',
        company: extracted.company || '',
        
        is_lead: true,
        contact_type: 'lead',
        kosun_crm_type: 'lead',
        status: 'active',
        kosun_crm_status: 'active',
        
        lead_source: channel === 'whatsapp' ? 'בוט וואטסאפ (WhatsApp AI Bot)' : 'סוכן קושאן AI',
        kosun_crm_source: channel === 'whatsapp' ? 'בוט וואטסאפ (WhatsApp AI Bot)' : 'סוכן קושאן AI',
        
        tags: ['ליד חדש', channel === 'whatsapp' ? 'שיחת וואטסאפ AI' : 'שיחת קושאן AI', botName],
        kosun_crm_tags: ['ליד חדש', channel === 'whatsapp' ? 'שיחת וואטסאפ AI' : 'שיחת קושאן AI', botName],
        
        cachedContentId: cachedContentId || null,
        total_spent: 0,
        order_count: 0,
        createdAt: isoDate,
        updatedAt: isoDate,
        last_conversation_date: isoDate,
        last_message: userMessage,
        last_channel: channel,
      };

      try {
        // Save in tenant-scoped collection
        const contactDocRef = doc(db, contactsColPath, contactId);
        await setDoc(contactDocRef, newContactRecord);

        // Also mirror to root contacts collection ONLY if running in _master tenant
        if (tenantId === '_master') {
          try {
            const rootContactRef = doc(db, 'contacts', contactId);
            await setDoc(rootContactRef, newContactRecord, { merge: true });
          } catch {}
        }

        // Publish event for real-time CRM synchronization
        eventBus.publish('crm:lead:created', {
          conta_name: newContactRecord.conta_name,
          conta_phone: newContactRecord.conta_phone,
          email: newContactRecord.email,
          source: newContactRecord.lead_source,
          tags: newContactRecord.tags,
          metadata: {
            contactId,
            cachedContentId,
            channel,
            botName,
          },
        });
      } catch (cErr) {
        console.warn('[whatsappAutoCrmService] Error creating contact card:', cErr);
      }
    }

    // DOCUMENT FULL CONVERSATION IN SUBCOLLECTION:
    // tenants/{tenantId}/contacts/{contactId}/conversations/{conversationId}
    const conversationId = `conv_${normPhone || contactId}`;
    try {
      const convDocRef = doc(db, `tenants/${tenantId}/contacts/${contactId}/conversations`, conversationId);
      await setDoc(
        convDocRef,
        {
          id: conversationId,
          contactId,
          channel,
          botId,
          botName,
          cachedContentId: cachedContentId || null,
          lastUpdatedAt: now,
          messages: updatedMessages,
        },
        { merge: true }
      );
    } catch (convErr) {
      console.warn('[whatsappAutoCrmService] Error saving conversation to contact subcollection:', convErr);
    }

    return {
      contactId,
      cachedContentId: cachedContentId || null,
    };
  },
};
