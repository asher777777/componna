import { Contact } from '../types';
import {
  dispatchContactSummaryToKosai,
  dispatchDraftMessageToKosai,
  dispatchVoiceDebriefToKosai,
  dispatchBusinessCardToKosai,
} from '../kosai/promptToKosai';
import {
  CrmContactSummary,
  CrmDraftMessage,
  CrmVoiceDebrief,
  CrmBusinessCardData,
} from '../../kosai-engine/modelsAiService/crmAiContract';

export type ContactSummaryResult = CrmContactSummary;
export type DraftMessageResult = CrmDraftMessage;
export type VoiceDebriefResult = CrmVoiceDebrief;

/**
 * מפיק סיכום 360 ותובנות עסקיות עבור איש קשר
 */
export async function generateContactSummary(
  contact: Contact,
  options?: { apiKey?: string; tenantId?: string; skipCache?: boolean }
): Promise<ContactSummaryResult> {
  try {
    const res = await dispatchContactSummaryToKosai(contact, options);
    if (res && res.summary) {
      return res;
    }
  } catch (err) {
    console.warn('[crmCopilotService] KOSAI summary dispatch failed, using heuristic fallback:', err);
  }

  // מנגנון חלופי מקומי (Zero-Token Heuristic Engine)
  const spent = Number(contact.total_spent || 0);
  const camp = Number(contact.campaign_amount || 0);
  const hasOrders = (contact.order_count || 0) > 0;

  let temp: 'hot' | 'warm' | 'cold' = 'warm';
  let sent: 'positive' | 'neutral' | 'negative' | 'urgent' = 'positive';
  let nba = 'יצירת קשר ראשוני והיכרות';
  let recTags: string[] = [];

  if (spent > 5000 || camp > 2000) {
    temp = 'hot';
    sent = 'positive';
    nba = 'הצעת שדרוג לשירות VIP והזמנה אישית למפגש בכירים';
    recTags = ['לקוח VIP', 'פוטנציאל גבוה'];
  } else if (contact.last_form_name) {
    temp = 'hot';
    nba = `חזרה מהירה בנוגע לטופס "${contact.last_form_name}" שנשלח לאחרונה`;
    recTags = ['ליד חם', 'ממתין למענה'];
  } else if (hasOrders) {
    temp = 'warm';
    nba = 'שליחת סקר שביעות רצון והצעת מוצר משלים';
    recTags = ['לקוח חוזר'];
  } else {
    temp = 'cold';
    sent = 'neutral';
    nba = 'שליחת ניוזלטר תוכן בעל ערך לשמירה על מודעות למותג';
    recTags = ['טיפוח ליד'];
  }

  return {
    summary: `${contact.conta_name} הינו איש קשר רשום במערכת${contact.company_name ? ` מ${contact.company_name}` : ''}. היקף פעילות מצטבר: ₪${spent.toLocaleString('he-IL')}.${camp > 0 ? ` שותף פעיל בקמפיינים בהיקף של ₪${camp.toLocaleString('he-IL')}.` : ''}`,
    sentiment: sent,
    leadTemperature: temp,
    nextBestAction: nba,
    recommendedTags: recTags,
  };
}

/**
 * מנסח הודעת וואטסאפ או אימייל מותאמת אישית
 */
export async function generateSmartMessageDraft(
  contact: Contact,
  channel: 'whatsapp' | 'email' | 'sms',
  goal: 'warm_intro' | 'campaign_invite' | 'payment_reminder' | 'custom',
  customInstruction?: string,
  options?: { apiKey?: string; tenantId?: string }
): Promise<DraftMessageResult> {
  try {
    const res = await dispatchDraftMessageToKosai(contact, channel, goal, customInstruction, options);
    if (res && res.messageText) {
      return res;
    }
  } catch (err) {
    console.warn('[crmCopilotService] KOSAI message draft dispatch failed, using template fallback:', err);
  }

  // מנגנון תבניות מקומי חלופי (Zero-Token Template Engine)
  const firstName = contact.conta_name?.split(' ')[0] || contact.conta_name || 'שלום';
  let text = '';
  let subject = '';

  if (channel === 'whatsapp') {
    switch (goal) {
      case 'warm_intro':
        text = `היי ${firstName}, מה שלומך? 😊\nשמחתי לראות את התעניינותך ב-${contact.community || 'שירותים שלנו'}. אשמח לקבוע איתך שיחה קצרה של 10 דקות להכיר ולראות איך נוכל לקדם את הדברים. מתי נוח לך השבוע?`;
        break;
      case 'campaign_invite':
        text = `שלום ${firstName} יקר/ה,\nאנחנו משיקים בימים אלו את ${contact.campaign_title || 'הקמפיין המרכזי שלנו'}, וחשבנו עליך כשותף טבעי למהלך המרגש הזה! 🌟\nנשמח שתצטרף אלינו כאן: ${contact.ambassador_page_url || 'https://example.com'}\nתודה רבה על השותפות!`;
        break;
      case 'payment_reminder':
        text = `היי ${firstName}, שבוע טוב!\nרק רצינו לוודא שקיבלת את סיכום ההזמנה והקבלה על סך ₪${contact.total_spent || ''}. אם יש כל שאלה או צורך בהסדר נוסף – אנחנו זמינים עבורך תמיד. 🙏`;
        break;
      default:
        text = `שלום ${firstName},\n${customInstruction || 'אשמח לעמוד לרשותך בכל שאלה.'}\nבברכה!`;
    }
  } else {
    switch (goal) {
      case 'warm_intro':
        subject = `המשך התקשרות והיכרות - ${contact.conta_name}`;
        text = `שלום ${firstName},\n\nפניתי אליך בהמשך להתעניינותך בפעילות שלנו.\nנשמח לתאם שיחת היכרות קצרה ולהציג בפניך את מגוון הפתרונות המותאמים ביותר עבורך.\n\nבברכה ובאיחולי הצלחה,\nצוות ניהול לקוחות`;
        break;
      case 'campaign_invite':
        subject = `הזמנה אישית להצטרפות לקמפיין: ${contact.campaign_title || 'שותפות דרך'}`;
        text = `שלום ${firstName},\n\nאנו שמחים להזמינך לקחת חלק מוביל בפעילות הקמפיין החדש שלנו.\nהתמיכה והמעורבות שלך משמעותיות ביותר עבורנו.\n\nלפרטים נוספים והצטרפות:\n${contact.ambassador_page_url || 'https://example.com'}\n\nתודה מקרב לב,\nהנהלת הפרויקט`;
        break;
      default:
        subject = `עדכון חשוב עבור ${contact.conta_name}`;
        text = `שלום ${firstName},\n\n${customInstruction || 'אנו לשירותך לכל נושא ועניין.'}\n\nבברכה,\nצוות השירות`;
    }
  }

  return { channel, subject, messageText: text };
}

/**
 * מפענח כרטיס ביקור לחילוץ שדות איש קשר
 */
export async function parseBusinessCardImage(
  imageBase64: string,
  imageMimeType: string = 'image/jpeg',
  options?: { apiKey?: string; tenantId?: string }
): Promise<Partial<Contact> | null> {
  try {
    const res = await dispatchBusinessCardToKosai(imageBase64, imageMimeType, options);
    if (res && (res.conta_name || res.conta_phone)) {
      return res as Partial<Contact>;
    }
  } catch (err) {
    console.warn('[crmCopilotService] Business card OCR dispatch failed, using fallback:', err);
  }

  return null;
}

/**
 * מפענח תמלול סיכום שיחה ומחלץ משימות וצעדי המשך
 */
export async function analyzeVoiceDebrief(
  transcript: string,
  options?: { apiKey?: string; tenantId?: string }
): Promise<VoiceDebriefResult | null> {
  try {
    const res = await dispatchVoiceDebriefToKosai(transcript, options);
    if (res && res.meetingSummary) {
      return res;
    }
  } catch (err) {
    console.warn('[crmCopilotService] Voice debrief dispatch failed, using fallback:', err);
  }

  return {
    meetingSummary: transcript,
    nextStep: 'המשך טיפול ומעקב',
    leadTemperature: 'warm',
    sentiment: 'positive',
    suggestedTags: ['שיחה קולית'],
  };
}
