import { SmartFormDefinition, FormStep, ToneStyle, FormThemeSettings } from '../types';
import { TONE_PRESETS } from '../config/tonePresets';
import { DEFAULT_THEME_SETTINGS, DEFAULT_COMPLETION_SETTINGS } from '../config/constants';

export interface AIBrainstormInput {
  goal: string;
  targetAudience?: string;
  tone: ToneStyle;
  customToneInstructions?: string;
  numberOfSteps?: number;
  specificQuestions?: string[];
  geminiApiKey?: string;
}

export interface AIBrainstormOutput {
  form: Partial<SmartFormDefinition>;
  explanation: string;
  suggestedNextSteps: string[];
}

/**
 * Brainstorm and generate a full multi-step Smart Form using Gemini AI
 */
export async function generateSmartFormWithAI(
  input: AIBrainstormInput
): Promise<AIBrainstormOutput> {
  const apiKey = input.geminiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
  const selectedPreset = TONE_PRESETS.find((p) => p.id === input.tone) || TONE_PRESETS[0];

  const systemPrompt = `
אתה ארכיטקט טפסים ומומחה UI/UX ו-Conversion Rate Optimization ברמה הגבוהה ביותר.
המשימה שלך: ליצור מבנה טופס חכם רב-שלבי (שלב אחד לכל שאלה - Step-by-Step Luxury Form) בעברית צחה ורהוטה.

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
   - 'single_choice' (בחירה יחידה עם כרטיסיות יוקרתיות ואייקונים)
   - 'multi_choice' (בחירה מרובה)
   - 'rating' (דירוג כוכבים 1-5)
   - 'scale' (סולם 1-10)
   - 'date' (תאריך)
   - 'file_upload' (העלאת קובץ)
4. שדה mappingKey חובה לכל שדה (למשל: 'conta_name', 'conta_phone', 'email', 'budget', 'role', 'experience_rating').
5. הטון והסגנון המבוקש: ${selectedPreset.label} - ${selectedPreset.promptDirective}. ${input.customToneInstructions ? `דגש מיוחד: ${input.customToneInstructions}` : ''}
6. הטופס נועד עבור: "${input.goal}". ${input.targetAudience ? `קהל היעד: ${input.targetAudience}.` : ''}

החזר תשובה אך ורק בפורמט JSON תקני במבנה המדויק הבא:
{
  "title": "כותרת יוקרתית ומזמינה לטופס",
  "description": "תיאור קצר וממוקד של מהות הטופס והערך לממלא",
  "category": "קטגוריה עסקית (למשל: ייעוץ עסקי / מועדון לקוחות / אבחון / גיוס)",
  "explanation": "הסבר מקצועי של ה-AI על הבחירות המבניות שנעשו בטופס וההתאמה למטרות",
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
      "mappingKey": "conta_name",
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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
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
            },
            explanation: parsed.explanation || 'הטופס נבנה בהצלחה תוך התאמה לטון המבוקש.',
            suggestedNextSteps: parsed.suggestedNextSteps || [
              'בדוק את רצף השאלות בתצוגה המקדימה',
              'ודא שמיפוי השדות (mappingKey) תואם למבנה הלידים שלך',
            ],
          };
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to intelligent local generator:', e);
    }
  }

  // Smart Heuristic Fallback Engine
  return generateHeuristicForm(input, selectedPreset);
}

/**
 * Intelligent Fallback Generator when Gemini is offline or without key
 */
function generateHeuristicForm(
  input: AIBrainstormInput,
  selectedPreset: (typeof TONE_PRESETS)[0]
): AIBrainstormOutput {
  const goalLower = input.goal.toLowerCase();
  const steps: FormStep[] = [];

  // Step 1: Full Name
  steps.push({
    id: 'step_1',
    order: 1,
    title: 'מהו שמך המלא?',
    subtitle: selectedPreset.id === 'executive_luxury' ? 'נשמח להכיר את מוביל הפעילות' : 'נשמח להכיר אותך אישית',
    fieldType: 'text',
    iconName: 'User',
    placeholder: 'ישראל ישראלי',
    required: true,
    mappingKey: 'conta_name',
  });

  // Step 2: Phone Number
  steps.push({
    id: 'step_2',
    order: 2,
    title: 'מהו מספר הטלפון הישיר שלך?',
    subtitle: 'לתיאום מהיר ועדכונים ישירים לנייד',
    fieldType: 'phone',
    iconName: 'Smartphone',
    placeholder: '050-1234567',
    required: true,
    mappingKey: 'conta_phone',
  });

  // Step 3: Email
  steps.push({
    id: 'step_3',
    order: 3,
    title: 'מהי כתובת הדואר האלקטרוני המועדפת עליך?',
    subtitle: 'למשלוח סיכומים, מסמכים והזמנות',
    fieldType: 'email',
    iconName: 'Mail',
    placeholder: 'name@company.co.il',
    required: true,
    mappingKey: 'email',
  });

  // Step 4: Context / Choice based on goal
  if (goalLower.includes('מחיר') || goalLower.includes('תקציב') || goalLower.includes('עסקי') || goalLower.includes('פרויקט')) {
    steps.push({
      id: 'step_4',
      order: 4,
      title: 'מהי מסגרת התקציב או היקף הפרויקט המתוכנן?',
      subtitle: 'נתון זה יאפשר לנו להתאים את המענה הטוב והריאלי ביותר',
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
      id: 'step_4',
      order: 4,
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

  // Step 5: Rating / Urgency
  steps.push({
    id: 'step_5',
    order: 5,
    title: 'עד כמה פרויקט זה דחוף ומשמעותי עבורך כעת?',
    subtitle: 'דירוג מ-1 (בדיקה ראשונית) עד 5 (מוכן לתחילת עבודה מיידית)',
    fieldType: 'rating',
    iconName: 'Star',
    required: false,
    mappingKey: 'urgency_rating',
    minRating: 1,
    maxRating: 5,
  });

  // Step 6: Free notes
  steps.push({
    id: 'step_6',
    order: 6,
    title: 'האם יש פרטים נוספים שתרצה שנכיר מראש?',
    subtitle: 'כל מידע, דגש או בקשה מיוחדת יתקבלו בברכה',
    fieldType: 'textarea',
    iconName: 'FileText',
    placeholder: 'פרט כאן בחופשיות...',
    required: false,
    mappingKey: 'notes',
  });

  const title = input.goal || 'שאלון התאמה והצטרפות';

  return {
    form: {
      title,
      slug: title.toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-').slice(0, 40),
      description: `שאלון מקצועי רב-שלבי שנבנה בהתאמה לסגנון ${selectedPreset.label}`,
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
    },
    explanation: `הטופס נבנה לפי מודל חכם של שדה יחיד בכל שלב (Step-by-Step), עם שאלות חיוניות וסדר אופטימלי להמרות גבוהות בסגנון ${selectedPreset.label}. כל השדות משתמשים באייקוני יוקרה בלבד.`,
    suggestedNextSteps: [
      'בדוק את ניסוח השאלות והתאם לפי הצורך',
      'חבר את הטופס לדף נחיתה או שיתוף כקישור ישיר',
    ],
  };
}
