import { AiSalesOptimizationInput, AiSalesOptimizationResult } from '../types';
import { SmartFormDefinition, FormStep } from '../../smart-form-builder/types';

export class AiSalesAgentService {
  /**
   * Analyzes the customer profile and generates a dynamic, highly persuasive sales proposal optimization
   */
  static async analyzeCustomerAndOptimizeProposal(
    input: AiSalesOptimizationInput,
    customApiKey?: string
  ): Promise<AiSalesOptimizationResult> {
    const apiKey = customApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);

    const prompt = `
אתה "סוכן מכירות AI בכיר ומומחה סגירת עסקאות SaaS" (Chief Revenue & Deal Closing Officer).
המטרה שלך: לנתח את פרופיל הלקוח, הרכיבים שנבחרו לעגלה, הסאב-דומיין והתמחור, ולייצר הצעת מכירה מותאמת אישית ברמה הגבוהה ביותר, שתמקסם את יחס ההמרה (Conversion Rate).

נתוני הלקוח והעסקה:
- שם העסק / לקוח: ${input.businessName || 'עסק דיגיטלי מוביל'}
- תחום פעילות (Industry): ${input.industry || 'כללי / טכנולוגיה / מסחר'}
- סאב-דומיין מבוקש: ${input.subdomain || 'חדש'}
- רכיבים שנבחרו לעגלה: ${input.cartModules.join(', ') || 'חבילת מודולים בסיסית'}
- מסלול חיוב: ${input.billingPlan === 'annual' ? 'שנתי (הנחה 20%)' : 'חודשי'}
- סה"כ השקעה חודשית: ${input.monthlyTotal} ₪
- גודל צוות / תקציב: ${input.teamSize || '1-10'} | ${input.budgetRange || 'סטנדרטי'}
- הערות מיוחדות: ${input.customerNotes || 'אין'}

הנחיות קריטיות:
1. עברית רהוטה, יוקרתית, מקצועית, מעוררת ביטחון וממוקדת תוצאות עסקיות (ROI).
2. אסור להשתמש באימוג'ים מוגזמים.
3. לחשב תחזית ROI מנומקת (חיסכון בשעות עבודה, הגדלת המרות, קיצור זמני הגעה לשוק).
4. לזהות 2 התנגדויות נפוצות של לקוחות בתחום זה ולספק מענה משכנע.
5. להמליץ על מודול משלים 1 מתוך המערכת (אם רלוונטי) עם הנחת באנדל.

החזר תשובה אך ורק בפורמט JSON תקני במבנה המדויק הבא:
{
  "headlinePitch": "כותרת הצעה עוצמתית ומותאמת אישית",
  "executiveSummary": "תמצית מנהלים יוקרתית המסבירה מדוע חבילה זו היא הפתרון האופטימלי לצמיחת העסק",
  "roiProjectionText": "תחזית החזר השקעה מפורטת (לדוגמה: חיסכון של 35 שעות הפקה בחודש וגידול צפוי של 25-40% בהמרות)",
  "estimatedRoiMultiplier": "x4.2",
  "keyBenefitsByIndustry": [
    "יתרון עסקי ראשון המותאם לענף",
    "יתרון עסקי שני",
    "יתרון עסקי שלישי"
  ],
  "objectionHandlers": [
    {
      "objection": "התנגדות אפשרית (למשל: עקומת למידה או זמן הקמה)",
      "response": "מענה מקצועי המפיג את החשש (למשל: סביבת עבודה מוכנה בתוך 60 שניות ללא צורך בידע טכני)"
    },
    {
      "objection": "התנגדות נוספת (למשל: מחויבות או עלויות)",
      "response": "מענה ממוקד ROI"
    }
  ],
  "suggestedAddons": [
    {
      "moduleId": "crm-analytics",
      "moduleName": "אנליטיקה ו-CRM 360",
      "reason": "סנכרון מיידי של כל הלידים מטפסי הנחיתה לכרטיס לקוח מועשר ב-AI",
      "discountOffer": "15% הנחה בהוספה עכשיו"
    }
  ],
  "persuasiveClosingHook": "משפט סגירה מניע לפעולה שמייצר ודאות ודחיפות חיובית"
}
`;

    if (apiKey && apiKey.length > 10) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              ...parsed,
              generatedAt: new Date().toISOString(),
            };
          }
        }
      } catch (err) {
        console.warn('[AiSalesAgentService] Gemini API call error, falling back to smart heuristic:', err);
      }
    }

    // Heuristic Fallback
    const biz = input.businessName || 'העסק שלך';
    return {
      headlinePitch: `פלטפורמת צמיחה דיגיטלית מותאמת אישית עבור ${biz}`,
      executiveSummary: `ההצעה שנבנתה עבור ${biz} מאגדת את הרכיבים המובילים להאצת תהליכי שיווק, אוטומציה וניהול לקוחות, המופעלים תחת סאב-דומיין ייעודי ומאובטח.`,
      roiProjectionText: `חיסכון מוערך של כ-30 שעות עבודה חודשיות, קיצור זמני תגובה ללידים ב-80% ושיפור צפוי של 25-35% באחוזי ההמרה.`,
      estimatedRoiMultiplier: 'x3.8',
      keyBenefitsByIndustry: [
        'הקצאת סאב-דומיין מיידית ומבודדת ללא תלות באנשי פיתוח',
        'סנכרון מלא בזמן אמת בין עמודי הנחיתה לכרטיס הלקוח ב-CRM',
        'הפחתה דרמטית בעלויות רישיונות נפרדים לתוכנות שונות',
      ],
      objectionHandlers: [
        {
          objection: 'האם נדרש ידע טכני או תכנות כדי לתפעל את המערכת?',
          response: 'לא. המערכת מגיעה עם ממשק ויזואלי אינטואיטיבי, תבניות מוכנות ועורך Drag & Drop מלא בעברית.',
        },
        {
          objection: 'מה קורה אם נרצה לשדרג או להוסיף רכיבים בעתיד?',
          response: 'המערכת מודולרית לחלוטין. ניתן להוסיף או להסיר רכיבים בלחיצת כפתור ישירות מלוח הבקרה.',
        }
      ],
      suggestedAddons: [
        {
          moduleId: 'crm-analytics',
          moduleName: 'אנליטיקה ו-CRM',
          reason: 'איסוף אוטומטי של כל הפניות והלידים לפרופיל 360 מועשר ב-AI',
          discountOffer: 'חיסכון של 20% במסלול שנתי',
        }
      ],
      persuasiveClosingHook: 'ההצעה תקפה להפעלה מיידית עם שריון כתובת הסאב-דומיין ואחריות ביצועים מלאה.',
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Adapts an existing SmartFormDefinition with AI-optimized copy and pitch
   */
  static refineFormDefinitionWithAi(
    formDef: SmartFormDefinition,
    optimization: AiSalesOptimizationResult
  ): SmartFormDefinition {
    const updated = JSON.parse(JSON.stringify(formDef)) as SmartFormDefinition;

    updated.title = optimization.headlinePitch || updated.title;
    updated.description = optimization.executiveSummary || updated.description;
    
    if (updated.completion) {
      updated.completion.title = 'הצעת המחיר אושרה בהצלחה! 🚀';
      updated.completion.subtitle = optimization.persuasiveClosingHook || updated.completion.subtitle;
    }

    // Refine agreement step subtitle
    const agreementStep = updated.steps.find(s => s.mappingKey === 'proposal_accepted');
    if (agreementStep) {
      agreementStep.subtitle = `${optimization.roiProjectionText} | החזר השקעה צפוי ${optimization.estimatedRoiMultiplier}`;
    }

    updated.updatedAt = new Date().toISOString();
    return updated;
  }

  /**
   * Interactive Sales Copilot Q&A
   */
  static async askSalesAgentCopilot(
    query: string,
    context: {
      businessName?: string;
      cartModules: string[];
      totalMonthly: number;
      billingPlan: string;
      subdomain?: string;
    },
    customApiKey?: string
  ): Promise<string> {
    const apiKey = customApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);

    const prompt = `
אתה "סוכן המכירות וההדרכה של פלטפורמת Comona SaaS".
פונה אליך לקוח שמתעניין בהצעת המחיר והרכיבים שנבחרו:
- שם העסק: ${context.businessName || 'הלקוח'}
- רכיבים שנבחרו: ${context.cartModules.join(', ')}
- סאב-דומיין: ${context.subdomain || 'טרם נבחר'}
- מחיר חודשי: ${context.totalMonthly} ₪ (${context.billingPlan})

שאלת הלקוח: "${query}"

ענה בעברית צחה, באדיבות, בביטחון, תוך הסבר ברור על היתרונות הטכנולוגיים והעסקיים של הפלטפורמה.
שמור על תשובה ממוקדת (עד 3-4 פסקאות קצרות), משכנעת ומזמינה להשלים את ההזמנה.
`;

    if (apiKey && apiKey.length > 10) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) return rawText.trim();
        }
      } catch (e) {
        console.warn('[AiSalesAgentService] Copilot chat error:', e);
      }
    }

    return `פלטפורמת Comona מספקת מענה מקיף וכולל עם סאב-דומיין מבודד (${context.subdomain || 'kosun.pro'}), מסדי נתונים עצמאיים ואפס צורך בידע טכני. הרכיבים שנבחרו (${context.cartModules.join(', ')}) מוכנים להפעלה מיידית בלחיצת כפתור אחת.`;
  }
}
