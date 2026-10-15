import { Contact } from '../types';

export interface ContactSummaryPromptInput {
  contact: Contact;
}

export interface ContactSummaryResultSchema {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  leadTemperature: 'hot' | 'warm' | 'cold';
  nextBestAction: string;
  recommendedTags: string[];
}

export interface DraftMessagePromptInput {
  contact: Contact;
  channel: 'whatsapp' | 'email' | 'sms';
  goal: 'warm_intro' | 'campaign_invite' | 'payment_reminder' | 'custom';
  customInstruction?: string;
}

export interface DraftMessageResultSchema {
  channel: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  messageText: string;
}

/**
 * פרומפט תמציתי וחסכוני לסיכום תיק לקוח וצעד הבא
 * פחות מ-50 מילים - חסכון של מעל 70% בטוקנים
 */
export function BUILD_CONTACT_SUMMARY_PROMPT(contact: Contact): string {
  const name = contact.conta_name || 'איש קשר';
  const company = contact.company_name ? `(${contact.company_name})` : '';
  const spent = contact.total_spent ? `רכישות: ₪${contact.total_spent}` : '';
  const tags = contact.tags?.length ? `תגיות: ${contact.tags.join(',')}` : '';
  const notes = contact.notes ? `הערות: ${contact.notes}` : '';

  return `נתח איש קשר זה והחזר JSON בלבד:
שם: ${name} ${company}
${spent} ${tags} ${notes}

פורמט נדרש:
{"summary":"סיכום 2 משפטים","sentiment":"positive|neutral|negative|urgent","leadTemperature":"hot|warm|cold","nextBestAction":"המלצה קונקרטית","recommendedTags":["תגית1","תגית2"]}`.trim();
}

/**
 * פרומפט תמציתי לניסוח הודעה אישית ללקוח
 */
export function BUILD_DRAFT_MESSAGE_PROMPT(
  contact: Contact,
  channel: 'whatsapp' | 'email' | 'sms',
  goal: 'warm_intro' | 'campaign_invite' | 'payment_reminder' | 'custom',
  customInstruction?: string
): string {
  const firstName = contact.conta_name?.split(' ')[0] || contact.conta_name || 'שלום';

  return `נסח הודעה בערוץ ${channel} עבור ${firstName} (${contact.company_name || 'עסק'}).
מטרה: ${goal}. ${customInstruction ? `דגש: ${customInstruction}` : ''}
החזר JSON בלבד:
{"channel":"${channel}","subject":"${channel === 'email' ? 'נושא' : ''}","messageText":"טקסט מלא לשליחה"}`.trim();
}

/**
 * פרומפט לפענוח כרטיס ביקור (OCR ומיצוי ישויות)
 */
export function BUILD_BUSINESS_CARD_PROMPT(): string {
  return `חלץ פרטי איש קשר מתמונת כרטיס הביקור והחזר JSON בלבד:
{"conta_name":"שם מלא","conta_phone":"טלפון ראשי","work_phone":"טלפון נוסף","email":"אימייל","company_name":"שם חברה","job_title":"תפקיד","mh_crm_city":"עיר","mh_crm_street":"רחוב","website":"אתר","notes":"פרטים נוספים"}`.trim();
}

/**
 * פרומפט לפענוח תמלול סיכום שיחה וצעדים להמשך
 */
export function BUILD_VOICE_DEBRIEF_PROMPT(transcript: string): string {
  return `נתח תמלול סיכום פגישה זה והחזר JSON בלבד:
"${transcript}"

פורמט נדרש:
{"meetingSummary":"סיכום תמציתי","nextStep":"הצעד הבא","followUpDate":"תאריך מעקב","leadTemperature":"hot|warm|cold","sentiment":"positive|neutral|negative","suggestedTags":["תגית1"]}`.trim();
}
