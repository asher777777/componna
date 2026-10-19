import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { SavedWhatsAppTemplate } from '../types/whatsapp.types';

export const DEFAULT_WHATSAPP_TEMPLATES: SavedWhatsAppTemplate[] = [
  {
    id: 'tpl_welcome_standard',
    name: 'הודעת תודה ואישור פנייה (ליד חדש)',
    category: 'leads',
    messageTemplate: `שלום {{conta_name}}!\nתודה שפנית אלינו דרך טופס "{{form_title}}".\n\nקיבלנו את פנייתך בהצלחה ופרטייך נרשמו במערכת.\nאחד מנציגינו יחזור אלייך בהקדם למספר {{conta_phone}}.\n\nבברכה,\nצוות השירות`,
    tags: ['לידים', 'אישור פנייה'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_payment_confirmation',
    name: 'אישור תשלום וקבלה דיגיטלית',
    category: 'payment',
    messageTemplate: `שלום {{conta_name}},\nתשלומך נקלט בהצלחה במערכת!\n\n*עבור:* {{payment_description}}\n*סכום ששולם:* {{payment_amount}} ₪\n*תאריך ושעה:* {{submission_date}} ({{submission_time}})\n\nקבלה דיגיטלית נשלחה לכתובת {{email}}.\nתודה שבחרת בנו!`,
    tags: ['סליקה', 'אישור תשלום'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_donation_thanks',
    name: 'תודה מעומק הלב על התרומה',
    category: 'donation',
    messageTemplate: `שלום {{conta_name}},\nתודה ענקית מעומק הלב על תרומתך הנדיבה!\n\nזכות המצווה והסיוע עומדת לזכותך ולזכות משפחתך.\n*מסלול:* {{donation_tier}}\n*הקדשה:* {{dedication}}\n\nקבלה לפי סעיף 46 הופקה ונשלחה למייל {{email}}.\nיישר כוח וירבו כמותך בישראל!`,
    tags: ['תרומות', 'הוראת קבע', 'סעיף 46'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_hot_lead_admin',
    name: 'התראת WhatsApp דחופה למנהל על ליד חם',
    category: 'leads',
    messageTemplate: `[התראת ליד חם חדש במערכת]\n\n*טופס:* {{form_title}}\n*שם הפונה:* {{conta_name}}\n*טלפון ישיר:* {{conta_phone}}\n*אימייל:* {{email}}\n*ציון איכות ליד:* {{lead_score}}/100\n*שעת הגעה:* {{submission_time}} ({{submission_date}})\n\n*פירוט תשובות:*\n{{all_answers_summary}}\n\nנא ליצור קשר מיידי.`,
    tags: ['מנהל', 'התראה דחופה'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Loads saved WhatsApp templates from the tenant-scoped collection
 */
export async function getSavedWhatsAppTemplates(
  customFirestore?: Firestore,
  collectionName: string = SYSTEM_COLLECTIONS.KOS_WHATSUP_TEMPLATES
): Promise<SavedWhatsAppTemplate[]> {
  const targetDb = customFirestore || db;

  try {
    const colRef = collection(targetDb, collectionName);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      return DEFAULT_WHATSAPP_TEMPLATES;
    }

    const items: SavedWhatsAppTemplate[] = [];
    snap.forEach((docSnap) => {
      items.push({
        id: docSnap.id,
        ...(docSnap.data() as any),
      });
    });

    return items;
  } catch (err) {
    console.warn('[whatsappTemplateStorageService] Failed to load templates from Firestore, using defaults:', err);
    return DEFAULT_WHATSAPP_TEMPLATES;
  }
}

/**
 * Saves or updates a WhatsApp template in the tenant-scoped collection
 */
export async function saveWhatsAppTemplate(
  template: Partial<SavedWhatsAppTemplate>,
  customFirestore?: Firestore,
  collectionName: string = SYSTEM_COLLECTIONS.KOS_WHATSUP_TEMPLATES
): Promise<string> {
  const targetDb = customFirestore || db;
  const id = template.id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const payload: SavedWhatsAppTemplate = {
    id,
    name: template.name || 'תבנית וואטסאפ ללא שם',
    messageTemplate: template.messageTemplate || '',
    category: template.category || 'general',
    tags: template.tags || [],
    createdAt: template.createdAt || now,
    updatedAt: now,
    isAiGenerated: Boolean(template.isAiGenerated),
  };

  const docRef = doc(targetDb, collectionName, id);
  await setDoc(docRef, payload, { merge: true });
  return id;
}

/**
 * Deletes a WhatsApp template from the tenant-scoped collection
 */
export async function deleteWhatsAppTemplate(
  templateId: string,
  customFirestore?: Firestore,
  collectionName: string = SYSTEM_COLLECTIONS.KOS_WHATSUP_TEMPLATES
): Promise<void> {
  const targetDb = customFirestore || db;
  const docRef = doc(targetDb, collectionName, templateId);
  await deleteDoc(docRef);
}
