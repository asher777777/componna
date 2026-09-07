import { Contact, AIInteraction } from '../types';

export interface AISummaryResult {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  leadTemperature: 'hot' | 'warm' | 'cold';
  nextBestAction: string;
  recommendedTags: string[];
}

export interface AIDraftMessageResult {
  channel: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  messageText: string;
}

/**
 * Generate AI 360 Summary and Next Best Action for a Contact
 */
export async function generateContactAISummary(
  contact: Contact,
  geminiApiKey?: string
): Promise<AISummaryResult> {
  const apiKey = geminiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);

  // If Gemini API Key is available, call Gemini API
  if (apiKey && apiKey.length > 10) {
    try {
      const prompt = `
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
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          return JSON.parse(rawText) as AISummaryResult;
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, using intelligent local engine:', e);
    }
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
  customInstruction?: string
): Promise<AIDraftMessageResult> {
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
    // Email channel
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
