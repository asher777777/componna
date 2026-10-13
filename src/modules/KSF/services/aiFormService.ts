import { SmartFormDefinition, FormStep, ToneStyle, FormThemeSettings } from '../types';
import { TONE_PRESETS } from '../config/tonePresets';
import { DEFAULT_THEME_SETTINGS, DEFAULT_COMPLETION_SETTINGS } from '../config/constants';
import { SYSTEM_COLLECTIONS, KOSUN_CRM_FIELD_KEYS } from '../../../core/contracts/collections';
import { executeCloudAi } from '../../../core/ai';

/**
 * מילון שדות הסנכרון התקניים לקולקציית ה-CRM (contacts) עם קידומת kosun_crm_
 */
export interface CrmSyncFieldDefinition {
  id: string;
  label: string;
  description: string;
  fieldType: 'text' | 'phone' | 'email' | 'textarea';
  iconName: string;
  defaultChecked: boolean;
}

export const CRM_COLLECTION_FIELDS: CrmSyncFieldDefinition[] = [
  {
    id: KOSUN_CRM_FIELD_KEYS.NAME,
    label: 'שם מלא (איש קשר)',
    description: `סנכרון ישיר לשדה ${KOSUN_CRM_FIELD_KEYS.NAME} בכרטיס הלקוח`,
    fieldType: 'text',
    iconName: 'User',
    defaultChecked: true,
  },
  {
    id: KOSUN_CRM_FIELD_KEYS.PHONE,
    label: 'טלפון נייד ראשי',
    description: `סנכרון ל-${KOSUN_CRM_FIELD_KEYS.PHONE} (קריטי לוואטסאפ ושיחות)`,
    fieldType: 'phone',
    iconName: 'Smartphone',
    defaultChecked: true,
  },
  {
    id: KOSUN_CRM_FIELD_KEYS.EMAIL,
    label: 'דואר אלקטרוני',
    description: `סנכרון ל-${KOSUN_CRM_FIELD_KEYS.EMAIL} (משלוח חשבוניות ודיוור)`,
    fieldType: 'email',
    iconName: 'Mail',
    defaultChecked: true,
  },
  {
    id: KOSUN_CRM_FIELD_KEYS.COMPANY,
    label: 'שם חברה / בית עסק',
    description: `סנכרון ל-${KOSUN_CRM_FIELD_KEYS.COMPANY} בכרטיס הלקוח`,
    fieldType: 'text',
    iconName: 'Building2',
    defaultChecked: false,
  },
  {
    id: KOSUN_CRM_FIELD_KEYS.CITY,
    label: 'עיר / יישוב',
    description: `סנכרון ל-${KOSUN_CRM_FIELD_KEYS.CITY} בפילוח אזורים`,
    fieldType: 'text',
    iconName: 'MapPin',
    defaultChecked: false,
  },
  {
    id: KOSUN_CRM_FIELD_KEYS.STREET,
    label: 'כתובת מלאה / רחוב',
    description: `סנכרון ל-${KOSUN_CRM_FIELD_KEYS.STREET} למשלוחים וקבלות`,
    fieldType: 'text',
    iconName: 'Compass',
    defaultChecked: false,
  },
  {
    id: KOSUN_CRM_FIELD_KEYS.GOV_ID,
    label: 'מספר ת.ז. / ח.פ. / עוסק מורשה',
    description: `סנכרון ל-${KOSUN_CRM_FIELD_KEYS.GOV_ID} להנהלת חשבונות`,
    fieldType: 'text',
    iconName: 'ShieldCheck',
    defaultChecked: false,
  },
  {
    id: KOSUN_CRM_FIELD_KEYS.NOTES,
    label: 'הערות ובקשות מיוחדות',
    description: `סנכרון ל-${KOSUN_CRM_FIELD_KEYS.NOTES} בכרטיס הלקוח`,
    fieldType: 'textarea',
    iconName: 'FileText',
    defaultChecked: true,
  },
];

export interface AIBrainstormInput {
  goal: string;
  targetAudience?: string;
  tone: ToneStyle;
  customToneInstructions?: string;
  numberOfSteps?: number;
  specificQuestions?: string[];
  crmSyncFields?: string[];
  geminiApiKey?: string;
}

export interface AIBrainstormOutput {
  form: Partial<SmartFormDefinition>;
  explanation: string;
  suggestedNextSteps: string[];
}

/**
 * הפקת מבנה טופס שלב-אחר-שלב באמצעות סוכן KOSAI ו-Gemini AI
 */
export async function generateSmartFormWithAI(
  input: AIBrainstormInput
): Promise<AIBrainstormOutput> {
  const apiKey = input.geminiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
  const selectedPreset = TONE_PRESETS.find((p) => p.id === input.tone) || TONE_PRESETS[0];

  const defaultSync = [
    KOSUN_CRM_FIELD_KEYS.NAME,
    KOSUN_CRM_FIELD_KEYS.PHONE,
    KOSUN_CRM_FIELD_KEYS.EMAIL,
    KOSUN_CRM_FIELD_KEYS.NOTES,
  ];
  const selectedCrmFields = input.crmSyncFields || defaultSync;

  const systemPrompt = `
אתה סוכן הטפסים והשאלונים החכמים של קושאן (KOSAI Agent - KSF Engine).
הנך מחובר ישירות לקולקציית ה-CRM המרכזית: "${SYSTEM_COLLECTIONS.CONTACTS}" ('contacts').
המשימה שלך: ליצור מבנה טופס חכם רב-שלבי (שאלה אחת בלבד בכל שלב - Step-by-Step Luxury Form) בעברית צחה ורהוטה.

כללי ברזל מחייבים:
1. אסור לחלוטין להשתמש באימוג'ים! (NO EMOJIS בכלל בשום שדה, כותרת או אפשרות).
2. לכל שדה יש לשייך שם אייקון וקטורי יוקרתי (iconName) אך ורק מתוך הרשימה הבאה:
   ['Crown', 'Gem', 'Award', 'Trophy', 'Briefcase', 'Building2', 'TrendingUp', 'Landmark', 'ShieldCheck', 'Scale', 'DollarSign', 'Wallet', 'BadgePercent', 'LineChart', 'BarChart3', 'User', 'Users', 'Mail', 'Phone', 'PhoneCall', 'Smartphone', 'MapPin', 'Globe', 'AtSign', 'Send', 'MessageSquare', 'Star', 'Sparkles', 'Heart', 'ThumbsUp', 'Zap', 'Target', 'Flame', 'CheckCircle2', 'Shield', 'Bookmark', 'Calendar', 'Clock', 'Hourglass', 'Compass', 'Flag', 'FileText', 'ClipboardList', 'Layers', 'Sliders', 'Upload', 'PenTool', 'CheckSquare', 'List', 'HelpCircle'].
3. סוגי שדות נתמכים (fieldType):
   - 'text' (טקסט קצר)
   - 'textarea' (טקסט ארוך)
   - 'email' (דוא"ל)
   - 'phone' (טלפון)
   - 'number' (מספר)
   - 'single_choice' (בחירה יחידה)
   - 'multi_choice' (בחירה מרובה)
   - 'rating' (דירוג כוכבים 1-5)
   - 'scale' (סולם 1-10)
   - 'date' (תאריך)
   - 'file_upload' (העלאת קובץ)

4. סנכרון CRM ומזהי קולקציה תקניים (קידומת חובה: kosun_crm_):
   כל שדה בטופס חייב להכיל mappingKey מדויק.
   עבור שדות פרטי קשר, חובה להשתמש במזהי ה-CRM התקניים הבאים:
   ${selectedCrmFields.map((f) => `- '${f}'`).join('\n   ')}
   עבור שאלות תוכן נוספות (כגון תקציב, העדפה וכו'), השתמש במפתחות תיאוריים באנגלית (כמו 'budget_tier', 'focus_area', 'urgency_rating').

5. הטון והסגנון המבוקש: ${selectedPreset.label} - ${selectedPreset.promptDirective}. ${input.customToneInstructions ? `דגש מיוחד: ${input.customToneInstructions}` : ''}
6. הטופס נועד עבור: "${input.goal}". ${input.targetAudience ? `קהל היעד: ${input.targetAudience}.` : ''}

החזר תשובה אך ורק בפורמט JSON תקני במבנה המדויק הבא:
{
  "title": "כותרת יוקרתית ומזמינה לטופס",
  "description": "תיאור קצר וממוקד של מהות הטופס והערך לממלא",
  "category": "קטגוריה עסקית",
  "explanation": "הסבר מקצועי של סוכן KOSAI על הבחירות המבניות שנעשו בטופס וההתאמה למטרות",
  "suggestedNextSteps": [
    "הצעה לשיפור 1",
    "הצעה לשיפור 2"
  ],
  "steps": [
    {
      "id": "step_1",
      "order": 1,
      "title": "כותרת השאלה (שדה אחד בלבד)",
      "subtitle": "הסבר קצר, תומך ומכבד",
      "fieldType": "text | single_choice | email | phone | rating | etc",
      "iconName": "User",
      "placeholder": "דוגמה או הנחיה למילוי",
      "required": true,
      "mappingKey": "kosun_crm_name",
      "options": [
        {
          "id": "opt_1",
          "label": "תווית אופציה ללא אימוג'י",
          "value": "opt_1",
          "description": "הסבר קצר על האפשרות",
          "iconName": "Crown"
        }
      ]
    }
  ]
}
`;

  if (apiKey && apiKey.length > 10) {
    try {
      const aiRes = await executeCloudAi({
        prompt: systemPrompt,
        model: 'gemini-3.8-flash',
        responseMimeType: 'application/json',
        apiKey,
      });

      if (aiRes.success && aiRes.data) {
        const parsed = typeof aiRes.data === 'string' ? JSON.parse(aiRes.data) : aiRes.data;
        return {
            form: {
              title: parsed.title || input.goal,
              slug: (parsed.title || 'form')
                .toLowerCase()
                .replace(/[^\w\u0590-\u05FF]+/g, '-')
                .slice(0, 40),
              description: parsed.description || '',
              category: parsed.category || 'עסקים',
              tone: input.tone,
              toneDescription: selectedPreset.description,
              steps: (parsed.steps || []).map((step: any, idx: number) => ({
                id: step.id || `step_${idx + 1}`,
                order: idx + 1,
                title: step.title || `שאלה ${idx + 1}`,
                subtitle: step.subtitle || '',
                fieldType: step.fieldType || 'text',
                iconName: step.iconName || 'Sparkles',
                placeholder: step.placeholder || '',
                required: step.required ?? true,
                mappingKey: step.mappingKey || `field_${idx + 1}`,
                options: step.options || undefined,
                minRating: step.minRating || 1,
                maxRating: step.maxRating || 5,
                minScale: step.minScale || 1,
                maxScale: step.maxScale || 10,
                minScaleLabel: step.minScaleLabel || 'נמוך',
                maxScaleLabel: step.maxScaleLabel || 'גבוה מאוד',
              })),
              theme: {
                ...DEFAULT_THEME_SETTINGS,
                ...(selectedPreset.suggestedTheme as FormThemeSettings),
              },
              completion: DEFAULT_COMPLETION_SETTINGS,
              status: 'draft',
              isCrmSyncEnabled: true,
              crmDefaultTags: ['KSF', 'KOSAI Agent', input.goal],
            },
            explanation: parsed.explanation || 'השאלון מוכן ומותאם אישית לפי מטרות הפעילות שלך.',
            suggestedNextSteps: parsed.suggestedNextSteps || [
              'מעבר על השאלות בתצוגה המקדימה',
              'התאמת ניסוחים במידת הצורך',
            ],
          };
        }
      } catch (e) {
      console.warn('Gemini API call failed, falling back to KOSAI intelligent local generator:', e);
    }
  }

  // KOSAI Intelligent Heuristic Engine
  return generateHeuristicForm(input, selectedPreset, selectedCrmFields);
}

/**
 * מחולל חכם מקומי של סוכן KOSAI (מופעל במצב אופליין או ללא מפתח Gemini)
 */
function generateHeuristicForm(
  input: AIBrainstormInput,
  selectedPreset: (typeof TONE_PRESETS)[0],
  crmFields: string[]
): AIBrainstormOutput {
  const goalLower = input.goal.toLowerCase();
  const steps: FormStep[] = [];
  let currentOrder = 1;

  // 1. שדה שם מלא
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.NAME) || crmFields.includes('conta_name')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'מהו שמך המלא?',
      subtitle: selectedPreset.id === 'executive_luxury' ? 'נשמח להכיר את מוביל הפעילות' : 'נשמח להכיר אותך אישית',
      fieldType: 'text',
      iconName: 'User',
      placeholder: 'ישראל ישראלי',
      required: true,
      mappingKey: KOSUN_CRM_FIELD_KEYS.NAME,
    });
  }

  // 2. שדה טלפון נייד
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.PHONE) || crmFields.includes('conta_phone')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'מהו מספר הטלפון הישיר שלך?',
      subtitle: 'לתיאום מהיר וסנכרון ישיר לוואטסאפ ול-CRM',
      fieldType: 'phone',
      iconName: 'Smartphone',
      placeholder: '050-1234567',
      required: true,
      mappingKey: KOSUN_CRM_FIELD_KEYS.PHONE,
    });
  }

  // 3. שדה דואר אלקטרוני
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.EMAIL) || crmFields.includes('email')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'מהי כתובת הדואר האלקטרוני המועדפת עליך?',
      subtitle: 'למשלוח סיכומים, מסמכים ועדכונים',
      fieldType: 'email',
      iconName: 'Mail',
      placeholder: 'name@company.co.il',
      required: true,
      mappingKey: KOSUN_CRM_FIELD_KEYS.EMAIL,
    });
  }

  // 4. שדה חברה / עסק (אם נבחר)
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.COMPANY) || crmFields.includes('company')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'מהו שם החברה או בית העסק?',
      subtitle: 'פרט את הפעילות העסקית או הארגון',
      fieldType: 'text',
      iconName: 'Building2',
      placeholder: 'שם החברה או הפעילות...',
      required: false,
      mappingKey: KOSUN_CRM_FIELD_KEYS.COMPANY,
    });
  }

  // 5. שדה עיר / יישוב (אם נבחר)
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.CITY) || crmFields.includes('city')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'באיזו עיר או אזור אתה ממוקם?',
      subtitle: 'לצורך התאמה גיאוגרפית ושירות אזורי',
      fieldType: 'text',
      iconName: 'MapPin',
      placeholder: 'לדוגמה: תל אביב, ירושלים, חיפה...',
      required: false,
      mappingKey: KOSUN_CRM_FIELD_KEYS.CITY,
    });
  }

  // 6. שדה כתובת מלאה (אם נבחר)
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.STREET) || crmFields.includes('street')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'מהי הכתובת המלאה?',
      subtitle: 'רחוב, מספר בית ומיקוד',
      fieldType: 'text',
      iconName: 'Compass',
      placeholder: 'לדוגמה: רחוב הרצל 1...',
      required: false,
      mappingKey: KOSUN_CRM_FIELD_KEYS.STREET,
    });
  }

  // 7. שאלת תוכן מותאמת לפי נושא הטופס
  if (goalLower.includes('מחיר') || goalLower.includes('תקציב') || goalLower.includes('עסקי') || goalLower.includes('פרויקט')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'מהי מסגרת התקציב או היקף הפרויקט המתוכנן?',
      subtitle: 'נתון זה יאפשר לנו להתאים את המענה המדויק והריאלי ביותר',
      fieldType: 'single_choice',
      iconName: 'Briefcase',
      required: true,
      mappingKey: 'budget_tier',
      options: [
        { id: 'opt_1', label: 'היקף בסיסי (עד 25,000 ₪)', value: 'tier_basic', iconName: 'Award', description: 'מענה מהיר וממוקד' },
        { id: 'opt_2', label: 'היקף מורחב (25,000 ₪ - 75,000 ₪)', value: 'tier_growth', iconName: 'TrendingUp', description: 'ליווי מלא ומקיף' },
        { id: 'opt_3', label: 'פרויקט פרימיום VIP (מעל 75,000 ₪)', value: 'tier_vip', iconName: 'Crown', description: 'התאמה אישית מלאה' },
      ],
    });
  } else {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'באיזה נושא מרכזי תרצה שנתמקד?',
      subtitle: 'סמן את התחום החשוב ביותר עבורך כרגע',
      fieldType: 'single_choice',
      iconName: 'Target',
      required: true,
      mappingKey: 'focus_area',
      options: [
        { id: 'opt_1', label: 'פיתוח וצמיחה עסקית', value: 'growth', iconName: 'TrendingUp' },
        { id: 'opt_2', label: 'שדרוג טכנולוגי ודיגיטל', value: 'tech', iconName: 'Zap' },
        { id: 'opt_3', label: 'ניהול וליווי אישי', value: 'consulting', iconName: 'ShieldCheck' },
      ],
    });
  }

  // 8. שאלת דירוג
  steps.push({
    id: `step_${currentOrder}`,
    order: currentOrder++,
    title: 'עד כמה פרויקט זה דחוף ומשמעותי עבורך כעת?',
    subtitle: 'דירוג מ-1 (בדיקה ראשונית) עד 5 (מוכן לתחילת עבודה מיידית)',
    fieldType: 'rating',
    iconName: 'Star',
    required: false,
    mappingKey: 'urgency_rating',
    minRating: 1,
    maxRating: 5,
  });

  // 9. שדה ת.ז. / ח.פ. (אם נבחר)
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.GOV_ID) || crmFields.includes('tg1')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'מספר תעודת זהות / ח.פ.',
      subtitle: 'לצורך הנפקת מסמכים והסכמים',
      fieldType: 'text',
      iconName: 'ShieldCheck',
      placeholder: 'מספר מזהה רשמי...',
      required: false,
      mappingKey: KOSUN_CRM_FIELD_KEYS.GOV_ID,
    });
  }

  // 10. שדה הערות (אם נבחר)
  if (crmFields.includes(KOSUN_CRM_FIELD_KEYS.NOTES) || crmFields.includes('notes')) {
    steps.push({
      id: `step_${currentOrder}`,
      order: currentOrder++,
      title: 'האם יש פרטים נוספים שתרצה שנכיר מראש?',
      subtitle: 'כל מידע, דגש או בקשה מיוחדת יתקבלו בברכה',
      fieldType: 'textarea',
      iconName: 'FileText',
      placeholder: 'פרט כאן בחופשיות...',
      required: false,
      mappingKey: KOSUN_CRM_FIELD_KEYS.NOTES,
    });
  }

  const title = input.goal || 'שאלון התאמה והצטרפות';

  return {
    form: {
      title,
      slug: title.toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-').slice(0, 40),
      description: `שאלון מקצועי רב-שלבי שנבנה בהתאמה לסגנון ${selectedPreset.label} על ידי סוכן KOSAI`,
      category: 'שאלונים ועסקים',
      tone: input.tone,
      toneDescription: selectedPreset.description,
      steps,
      theme: {
        ...DEFAULT_THEME_SETTINGS,
        ...(selectedPreset.suggestedTheme as FormThemeSettings),
      },
      completion: DEFAULT_COMPLETION_SETTINGS,
      status: 'draft',
      isCrmSyncEnabled: true,
      crmDefaultTags: ['KSF', 'KOSAI Agent', input.goal],
    },
    explanation: 'השאלון מוכן ומותאם אישית לפי מטרות הפעילות שלך.',
    suggestedNextSteps: [
      'מעבר על השאלות בתצוגה המקדימה',
      'התאמת ניסוחים במידת הצורך',
    ],
  };
}
