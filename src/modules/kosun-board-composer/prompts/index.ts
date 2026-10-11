/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 6: AI Prompts & Gemini System Instruction
 */

import { TargetAudience, DynamicModuleCapability } from '../types';

export const GEMINI_DASHBOARD_SYSTEM_INSTRUCTION = `אתה ארכיטקט מערכות בכיר ומעצב ממשקים של אקוסיסטם קושאן (KOSUN).
תפקידך לתכנן ולחולל לוח בקרה מותאם אישית (Custom Dashboard in Bento Grid Layout 2026) עבור בעל עסק המשתמש במערכת קושאן.

כללי מיתוג מחייבים (Cashwan Branding):
1. קושאן היא יישות חיה, אינטליגנטית ודינמית. השם בעברית תמיד "קושאן" ובאנגלית "KOSUN".
2. טון הדיבור חם, צעיר, פרואקטיבי ונותן תחושה של שותף אישי שלוקח אחריות ולא רק תוכנה.
3. חל איסור מוחלט על שימוש באימוג'ים! אסור לכלול שום אימוג'י בטקסטים, בכותרות או בתיאורים. יש להשתמש אך ורק בשמות אייקונים מתוך ספריית Lucide (כגון: Activity, TrendingUp, Users, ShoppingBag, Send, CreditCard, Mail, Inbox, Globe, Sparkles).
4. מבנה התצוגה הוא Bento Grid נקי ומודרני – כרטיסיות נקיות, חלוקה לגדלים שונים (sm, md, lg, full).
5. פונקציונליות ודאטה: עליך לקשור את הווידג'טים לקולקציות האמיתיות של הרכיבים שנבחרו, ולהציע פעולות מהירות (quick_actions) המפעילות ישירות את נתיבי המערכת של הרכיבים.

עליך להחזיר אך ורק אובייקט JSON תקין (ללא עטיפת markdown מיותרת, או בתוך \`\`\`json ... \`\`\`), העונה למבנה המבוקש.`;

export function buildDashboardPrompt(
  audience: TargetAudience,
  selectedModules: DynamicModuleCapability[],
  tenantId: string,
  customInstructions?: string
): string {
  const modulesSummary = selectedModules.map((m) => ({
    moduleId: m.moduleId,
    name: m.moduleName,
    description: m.description,
    route: m.route,
    primaryCollections: m.primaryCollections,
    availableActions: m.actions.map((a) => ({ id: a.id, label: a.label, route: a.targetRoute, icon: a.iconName })),
    availableKpis: m.kpis.map((k) => ({ id: k.id, label: k.label, collection: k.collectionName, calculation: k.calculationType })),
  }));

  return `חולל לוח בקרה מותאם אישית עבור טננט/לקוח.

פרטי הבקשה:
- קהל יעד ותחום עיסוק: "${audience.name}" (${audience.category})
- תיאור הקהל: ${audience.description}
- מטרות עסקיות מרכזיות: ${audience.businessGoals.join(', ')}
- טון הדיבור המומלץ: ${audience.defaultTone}
- מזהה ה-Tenant של הלקוח: "${tenantId}"
${customInstructions ? `- הנחיות מיוחדות מהמשתמש: ${customInstructions}` : ''}

הרכיבים שנבחרו עבור המערכת המותאמת:
${JSON.stringify(modulesSummary, null, 2)}

מבנה התשובה הנדרש (Strict JSON Object):
{
  "title": "שם לוח הבקרה (למשל: קושאן בורד - מרכז השליטה למסחר דיגיטלי)",
  "subtitle": "תיאור קצר ומניע לפעולה של לוח הבקרה",
  "aiAdvisor": {
    "greeting": "ברכת שלום אישית וחמה מקושאן לבעל העסק",
    "executiveSummary": "תמצית מצב והמלצה אסטרטגית מותאמת לקהל היעד",
    "recommendedActions": [
      "המלצה לפעולה ראשונה להגדלת תוצאות",
      "המלצה לפעולה שנייה",
      "המלצה לפעולה שלישית"
    ],
    "audienceStrategy": "תובנה עסקית ממוקדת בתחום הלקוח"
  },
  "widgets": [
    {
      "id": "w1",
      "type": "kpi_metric",
      "title": "כותרת מדד ביצועים מרכזי",
      "subtitle": "הסבר קצר",
      "size": "sm",
      "sourceModuleId": "מזהה רכיב",
      "iconName": "TrendingUp",
      "config": {
        "collectionName": "שם הקולקציה המקושרת",
        "calculation": "count או sum",
        "field": "amount (אם מדובר בסכום)",
        "statPrefix": "₪ או ריק",
        "statSuffix": "יחידות או ריק",
        "accentColor": "emerald"
      }
    },
    {
      "id": "w2",
      "type": "quick_actions",
      "title": "פעולות מהירות חיוניות",
      "subtitle": "הפעלת משימות קריטיות בקליק אחד",
      "size": "lg",
      "iconName": "Zap",
      "config": {
        "actions": [
          {
            "id": "act_1",
            "label": "תווית פעולה",
            "description": "הסבר קצר",
            "iconName": "Send",
            "targetRoute": "נתיב הרכיב",
            "actionType": "navigate"
          }
        ]
      }
    },
    {
      "id": "w3",
      "type": "data_stream",
      "title": "פעילות עדכנית בזמן אמת",
      "subtitle": "מעקב אחר תנועות אחרונות",
      "size": "md",
      "sourceModuleId": "מזהה רכיב",
      "iconName": "Activity",
      "config": {
        "collectionName": "קולקציה להצגת פריטים אחרונים",
        "statSuffix": "רשומות"
      }
    }
  ]
}

חשוב: הווידג'טים חייבים לשקף את כל הרכיבים שנבחרו בצורה סינרגטית וחכמה!`;
}
