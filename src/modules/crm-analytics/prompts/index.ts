import { Contact } from '../types';

export interface AISummaryPromptInput {
  contact: Contact;
}

export interface AISummaryResultSchema {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  leadTemperature: 'hot' | 'warm' | 'cold';
  nextBestAction: string;
  recommendedTags: string[];
}

export interface AIDraftMessagePromptInput {
  contact: Contact;
  channel: 'whatsapp' | 'email' | 'sms';
  goal: 'warm_intro' | 'campaign_invite' | 'payment_reminder' | 'custom';
  customInstruction?: string;
}

export interface AIDraftMessageResultSchema {
  channel: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  messageText: string;
}

/**
 * Builds the AI Copilot Contact 360 Analysis prompt
 */
export function buildContactSummaryPrompt(contact: Contact): string {
  return `
אתה סוכן AI מומחה לניהול קשרי לקוחות (CRM AI Copilot).
נתח את פרופיל איש הקשר הבא וספק תובנות עסקיות ממוקדות:

נתוני איש הקשר:
שם: ${contact.conta_name}
טלפון: ${contact.conta_phone}
עיר: ${contact.mh_crm_city || 'לא צוין'}
חברה: ${contact.company_name || 'לא צוין'} (${contact.job_title || ''})
מקור הגעה: ${contact.lead_source || 'לא צוין'}
תגיות: ${(contact.tags || []).join(', ')}
קהילה: ${contact.community || 'ללא קהילה'}
סה"כ רכישות: ₪${contact.total_spent || 0} (${contact.order_count || 0} הזמנות)
סכום גיוס בקמפיין: ₪${contact.campaign_amount || 0} (${contact.campaign_title || 'ללא'})
טופס אחרון: ${contact.last_form_name || 'אין'} (${contact.last_form_submission_date || ''})
הערות קיימות: ${contact.notes || 'אין'}

החזר תשובה אך ורק בפורמט JSON תקני במבנה הבא:
{
  "summary": "סיכום תמציתי ומקצועי של פרופיל הלקוח בעברית (2-3 משפטים)",
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "leadTemperature": "hot" | "warm" | "cold",
  "nextBestAction": "המלצה מעשית קונקרטית לצעד הבא של מנהל הלקוח",
  "recommendedTags": ["תגית מומלצת 1", "תגית מומלצת 2"]
}
`.trim();
}

/**
 * Builds the WhatsApp / Email personalized message draft prompt
 */
export function buildDraftMessagePrompt(
  contact: Contact,
  channel: 'whatsapp' | 'email' | 'sms',
  goal: 'warm_intro' | 'campaign_invite' | 'payment_reminder' | 'custom',
  customInstruction?: string
): string {
  const firstName = contact.conta_name?.split(' ')[0] || contact.conta_name || 'איש קשר';

  return `
אתה מומחה קופירייטינג ושיווק ישיר מותאם אישית (B2B & B2C).
נסח הודעה ייעודית בערוץ: ${channel} עבור איש הקשר הבא.

פרטי הנמען:
שם מלא: ${contact.conta_name} (שם פרטי: ${firstName})
טלפון: ${contact.conta_phone}
חברה: ${contact.company_name || 'לא צוין'}
קהילה/קבוצה: ${contact.community || 'ללא'}
קמפיין: ${contact.campaign_title || 'כללי'}
מטרת הפנייה: ${goal}
הנחיה מיוחדת: ${customInstruction || 'פנייה אישית, חמה ומקצועית בגובה העיניים'}

החזר אך ורק תשובת JSON תקנית במבנה:
{
  "channel": "${channel}",
  "subject": "${channel === 'email' ? 'נושא המייל המוצע' : ''}",
  "messageText": "טקסט ההודעה המלא מוכן לשליחה"
}
`.trim();
}

/**
 * Business card OCR to contact extraction prompt
 */
export function buildBusinessCardExtractionPrompt(): string {
  return `
אתה מומחה לפענוח כרטיסי ביקור (Business Card OCR & Entity Extraction).
נתח את התמונה המצורפת וחלץ את כל פרטי איש הקשר.

החזר תשובה אך ורק בפורמט JSON תקני במבנה הבא:
{
  "conta_name": "שם מלא של איש הקשר",
  "conta_phone": "מספר טלפון נייד או ראשי בפורמט ישראלי תקני (למשל 0501234567)",
  "work_phone": "טלפון משרדי אם מופיע",
  "email": "כתובת דואר אלקטרוני",
  "company_name": "שם החברה או הארגון",
  "job_title": "תפקיד או טייטל מקצועי",
  "mh_crm_city": "עיר",
  "mh_crm_street": "כתובת או רחוב",
  "website": "אתר אינטרנט אם מופיע",
  "notes": "פרטים נוספים שמופיעים בכרטיס כגון סלוגן או שירותים"
}
`.trim();
}

/**
 * Voice debrief transcription to CRM notes and next action prompt
 */
export function buildVoiceDebriefAnalysisPrompt(transcript: string): string {
  return `
אתה עוזר CRM חכם לפענוח סיכומי פגישות ושיחות קוליות (Voice Debrief Analyzer).
להלן תמלול של סיכום שיחה מוקלט של איש מכירות:
"${transcript}"

חלץ את התובנות העסקיות הבאות והחזר אך ורק JSON תקני:
{
  "meetingSummary": "סיכום מובנה ותמציתי של מה שנאמר בשיחה (3-4 נקודות)",
  "nextStep": "הצעד הבא שהוסכם או שנדרש לבצע",
  "followUpDate": "תאריך יעד למעקב אם נאמר (בפורמט YYYY-MM-DD או תיאור כמו 'יום שלישי הקרוב')",
  "leadTemperature": "hot" | "warm" | "cold",
  "sentiment": "positive" | "neutral" | "negative",
  "suggestedTags": ["תגית 1", "תגית 2"]
}
`.trim();
}
