import { executeCloudAi } from '../../../core/ai';
import { SavedWhatsAppTemplate } from '../types/whatsapp.types';
import { SmartFormDefinition } from '../types';

/**
 * מחלץ באופן קפדני אך ורק את "תמצית המיתוג" (Brand Essence)
 * על מנת לחסוך טוקנים ולמנוע עומס נתונים גולמיים בפרומפט
 */
export function extractBrandingEssence(brandDna?: any): string {
  if (!brandDna) {
    return 'מותג מוביל בעל שירות אישי, אמינות גבוהה וליווי מקצועי.';
  }

  const name = brandDna.identity?.companyName || brandDna.identity?.brandNameHebrew || 'הארגון';
  const purpose = brandDna.identity?.organizationPurpose || '';
  const slogan = brandDna.identity?.slogan ? `בסימן: "${brandDna.identity.slogan}"` : '';
  const uvp = brandDna.audience?.mainUvp ? `בידול וערך מוסף: ${brandDna.audience.mainUvp}` : '';

  const toneObj = brandDna.voice?.personality;
  const toneDesc = toneObj
    ? `חמימות ${toneObj.warmth || 4}/5, רשמיות ${toneObj.formality || 3}/5, יוקרה ${toneObj.luxury || 3}/5`
    : 'חם ומכובד';

  const addressing =
    brandDna.voice?.genderAddressing === 'female'
      ? 'פנייה ישירה ומקרבת בלשון נקבה'
      : brandDna.voice?.genderAddressing === 'male'
      ? 'פנייה בלשון זכר'
      : 'פנייה מכבדת ומשולבת (לשון רבים/ניסוח מאוזן)';

  // אם קיימת פסקת תמצית מותג ייעודית (Brand Summary Paragraph), נשתמש בה כתמצית המזוקקת
  const baseSummary =
    brandDna.brandSummaryParagraph && brandDna.brandSummaryParagraph.trim().length > 15
      ? brandDna.brandSummaryParagraph.trim()
      : [purpose, slogan, uvp].filter(Boolean).join('. ');

  return `
שם המותג: ${name}
תמצית המותג: ${baseSummary || 'פעילות ענפה, שירות איכותי וליווי מסור'}
סגנון וטון דיבור: ${toneDesc} (${addressing})
`.trim();
}

/**
 * מחולל תבניות הודעות וואטסאפ ממותגות באמצעות AI המבוססות אך ורק על תמצית המיתוג
 */
export async function generateBrandedWhatsAppTemplates(params: {
  form: SmartFormDefinition;
  brandDna?: any;
}): Promise<SavedWhatsAppTemplate[]> {
  const { form, brandDna } = params;
  const brandName = brandDna?.identity?.companyName || 'הצוות';
  const brandingEssence = extractBrandingEssence(brandDna);

  const prompt = `
אתה מומחה קופירייטינג עילית ואוטומציות וואטסאפ (WhatsApp Copywriting Specialist).
המטרה: לחבר 3 תבניות הודעות וואטסאפ ממותגות ושונות לחלוטין עבור טופס חכם בשם "${form.title}" (קטגוריה: ${form.category || 'כללי'}).

=== תמצית המיתוג (Brand Essence בלבד) ===
${brandingEssence}
=========================================

הנחיות חובה:
1. עשה שימוש מדויק בסגנון, בטון ובערכי תמצית המותג שלמעלה.
2. שמור על כללי הוואטסאפ הישראלי: נקי, קולח, מכבד, ללא קלישאות חלולות, עם שימוש נבון ברווחים והדגשות כוכביות (*הדגשה*).
3. שלב תגיות דינמיות רלוונטיות מתוך הרשימה הבאה בלבד:
   - {{conta_name}} = שם הפונה
   - {{form_title}} = שם הטופס
   - {{conta_phone}} = טלפון הפונה
   - {{email}} = מייל הפונה
   - {{all_answers_summary}} = סיכום התשובות שנמסרו
   - {{submission_date}} = תאריך הגשה
   - {{submission_time}} = שעת הגשה
4. התבניות המבוקשות (3 סוגים):
   - תבנית 1: "קבלת פנים ואישור פנייה ממותגת" (Warm Welcome & Confirmation)
   - תבנית 2: "הצעת ערך והמשך שיחה בוואטסאפ" (Value Hook & WhatsApp Next Step)
   - תבנית 3: "סיכום הגשה וליווי אישי (קונסיירג')" (Detailed Summary & Concierge)

החזר פלט JSON בלבד בתבנית המדויקת הבאה:
{
  "templates": [
    {
      "name": "שם התבנית",
      "category": "branded",
      "messageTemplate": "תוכן הודעת הוואטסאפ המלאה עם תגיות דינמיות...",
      "tags": ["מיתוג", "אישור"]
    }
  ]
}
`.trim();

  try {
    const res = await executeCloudAi<{
      templates: Array<{
        name: string;
        category?: 'leads' | 'payment' | 'donation' | 'general' | 'branded';
        messageTemplate: string;
        tags?: string[];
      }>;
    }>({
      prompt,
      systemInstruction: 'אתה קופירייטר שיווקי בכיר המתמחה בהודעות וואטסאפ ארגוניות ממותגות בעברית. החזר JSON תקני בלבד.',
      responseMimeType: 'application/json',
      temperature: 0.7,
    });

    const parsedTemplates = res.data?.templates || [];
    if (Array.isArray(parsedTemplates) && parsedTemplates.length > 0) {
      const now = new Date().toISOString();
      return parsedTemplates.map((t, idx) => ({
        id: `tpl_branded_ai_${Date.now()}_${idx + 1}`,
        name: t.name || `תבנית ממותגת ${idx + 1}`,
        category: t.category || 'branded',
        messageTemplate: t.messageTemplate || '',
        tags: Array.isArray(t.tags) && t.tags.length > 0 ? t.tags : ['AI ממותג', form.category || 'כללי'],
        createdAt: now,
        updatedAt: now,
        isAiGenerated: true,
      }));
    }
  } catch (err) {
    console.warn('[aiWhatsAppTemplateService] Cloud AI generation failed, using heuristic fallback:', err);
  }

  // Heuristic branded templates fallback (built directly from branding essence)
  const now = new Date().toISOString();
  return [
    {
      id: `tpl_branded_welcome_${Date.now()}`,
      name: `קבלת פנים ממותגת - ${brandName}`,
      category: 'branded',
      messageTemplate: `שלום {{conta_name}},\nתודה שפנית אל ${brandName} דרך "{{form_title}}".\n\nשמחנו לקבל את פנייתך, ופרטייך כבר עברו לצוות המקצועי שלנו.\nנציג יחזור אלייך בהקדם למספר {{conta_phone}} להמשך ליווי אישי.\n\nבברכה חמה,\nצוות ${brandName}`,
      tags: ['מיתוג', 'אישור פנייה'],
      createdAt: now,
      updatedAt: now,
      isAiGenerated: true,
    },
    {
      id: `tpl_branded_value_${Date.now()}`,
      name: `המשך שיחה והצעת ערך - ${brandName}`,
      category: 'branded',
      messageTemplate: `היי {{conta_name}}!\nכאן צוות ${brandName}.\n\nראינו שגילית עניין ב-"{{form_title}}". על מנת שנוכל לדייק עבורך את המענה המושלם, ניתן להשיב ישירות להודעה זו בוואטסאפ בכל שאלה או צורך.\n\nאנחנו כאן לרשותך,\n${brandName}`,
      tags: ['מיתוג', 'המשך שיחה'],
      createdAt: now,
      updatedAt: now,
      isAiGenerated: true,
    },
    {
      id: `tpl_branded_summary_${Date.now()}`,
      name: `סיכום הגשה וליווי אישי - ${brandName}`,
      category: 'branded',
      messageTemplate: `שלום {{conta_name}},\nלהלן ריכוז הפרטים שמילאת ב-"{{form_title}}" של ${brandName}:\n\n{{all_answers_summary}}\n\nהפנייה נקלטה בהצלחה בתאריך {{submission_date}} בשעה {{submission_time}}.\nנשמח לעמוד לצידך בכל שלב!`,
      tags: ['מיתוג', 'סיכום'],
      createdAt: now,
      updatedAt: now,
      isAiGenerated: true,
    },
  ];
}
