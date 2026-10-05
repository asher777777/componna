import { Contact } from '../types';
import { 
  buildContactSummaryPrompt, 
  buildDraftMessagePrompt, 
  buildBusinessCardExtractionPrompt,
  buildVoiceDebriefAnalysisPrompt,
  AISummaryResultSchema, 
  AIDraftMessageResultSchema 
} from '../prompts';
import { callGeminiApi } from '../api/functionsApi';

export interface AISummaryResult extends AISummaryResultSchema {}
export interface AIDraftMessageResult extends AIDraftMessageResultSchema {}

export interface VoiceDebriefResult {
  meetingSummary: string;
  nextStep: string;
  followUpDate?: string;
  leadTemperature: 'hot' | 'warm' | 'cold';
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedTags: string[];
}

/**
 * Generate AI 360 Summary and Next Best Action for a Contact
 */
export async function generateContactAISummary(
  contact: Contact,
  geminiApiKey?: string
): Promise<AISummaryResult> {
  const prompt = buildContactSummaryPrompt(contact);

  const aiResult = await callGeminiApi<AISummaryResult>({
    prompt,
    apiKey: geminiApiKey,
    model: 'gemini-2.5-flash',
  });

  if (aiResult && aiResult.summary) {
    return aiResult;
  }

  // Fallback: Intelligent heuristic AI Copilot engine
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
 * Draft Smart AI WhatsApp / Email Message
 */
export async function generateSmartMessageDraft(
  contact: Contact,
  channel: 'whatsapp' | 'email',
  goal: 'warm_intro' | 'campaign_invite' | 'payment_reminder' | 'custom',
  customInstruction?: string,
  geminiApiKey?: string
): Promise<AIDraftMessageResult> {
  const prompt = buildDraftMessagePrompt(contact, channel, goal, customInstruction);

  const aiResult = await callGeminiApi<AIDraftMessageResult>({
    prompt,
    apiKey: geminiApiKey,
    model: 'gemini-2.5-flash',
  });

  if (aiResult && aiResult.messageText) {
    return aiResult;
  }

  // Fallback: Template engine
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
 * Parses business card image via Gemini Vision into structured contact fields
 */
export async function parseBusinessCardImage(
  imageBase64: string,
  imageMimeType: string = 'image/jpeg',
  geminiApiKey?: string
): Promise<Partial<Contact> | null> {
  const prompt = buildBusinessCardExtractionPrompt();
  return await callGeminiApi<Partial<Contact>>({
    prompt,
    imageBase64,
    imageMimeType,
    apiKey: geminiApiKey,
    model: 'gemini-2.5-flash',
  });
}

/**
 * Analyzes voice debrief transcript via Gemini into structured meeting summary and next actions
 */
export async function analyzeVoiceDebrief(
  transcript: string,
  geminiApiKey?: string
): Promise<VoiceDebriefResult | null> {
  const prompt = buildVoiceDebriefAnalysisPrompt(transcript);
  const result = await callGeminiApi<VoiceDebriefResult>({
    prompt,
    apiKey: geminiApiKey,
    model: 'gemini-2.5-flash',
  });

  if (result) return result;

  // Local fallback
  return {
    meetingSummary: transcript,
    nextStep: 'המשך טיפול ומעקב',
    leadTemperature: 'warm',
    sentiment: 'positive',
    suggestedTags: ['שיחה קולית'],
  };
}
