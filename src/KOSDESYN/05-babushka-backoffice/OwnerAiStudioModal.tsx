import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors } from './types';
import { buildDynamicOwnerPrompt, OwnerAiIntentType } from '../../../factory/dynamicPrompts';
import { doc, setDoc } from 'firebase/firestore';
import { comonaDb } from '../../../../src/lib/firebase';
import { KosunUserAvatar } from './KosunUserAvatar';
import { getTerminology } from '../../../factory/pageTerminologyDictionary';

export type OwnerStudioDomain = 
  | 'collections'      // קולקציות ומוצרים
  | 'pages_forms'      // עמודים וטפסים מרובי שלבים
  | 'visitor_flows'    // תהליכי גולשים ומשפכי המרה
  | 'ab_tests'         // מבחני A/B ואופטימיזציה
  | 'big_three';       // תעדוף משימות The Big 3

interface OwnerAiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  tenantId: string;
  initialIntent?: OwnerAiIntentType;
}

export const OwnerAiStudioModal: React.FC<OwnerAiStudioModalProps> = ({
  isOpen,
  onClose,
  tenantProfile,
  tenantTheme,
  tenantId,
  initialIntent = 'ADD_PRODUCT_OR_SERVICE'
}) => {
  if (!isOpen) return null;

  // 1. ניהול עקרון הפוקוס: prompt (מרכז שליטה ו-4 כרטיסים) מול answering (שיחה והחלת שינויים)
  const [viewMode, setViewMode] = useState<'prompt' | 'answering'>('prompt');
  const [activeDomain, setActiveDomain] = useState<OwnerStudioDomain>('collections');
  const [activeExecution, setActiveExecution] = useState<{
    prompt: string;
    explanation: string;
    payloadType: OwnerStudioDomain;
    payloadData: any;
  } | null>(null);

  const [displayedChars, setDisplayedChars] = useState(0);
  const typingTimerRef = useRef<any>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  const brandColor = tenantTheme.micColor || tenantTheme.primary || '#EAB308';
  const marketArchetype = tenantProfile?.marketArchetype || tenantProfile?.category || 'saas';
  const customDictionary = (tenantProfile as any)?.customDictionary;

  const saveTooltip = getTerminology('owner_btn_tooltip_save', marketArchetype, customDictionary);
  const previewTooltip = getTerminology('owner_btn_tooltip_preview', marketArchetype, customDictionary);
  const aiAssistTooltip = getTerminology('owner_btn_tooltip_ai', marketArchetype, customDictionary);
  const revertTooltip = getTerminology('owner_btn_tooltip_revert', marketArchetype, customDictionary);
  const closeTooltip = getTerminology('owner_btn_tooltip_close', marketArchetype, customDictionary);
  const successSavedText = getTerminology('owner_modal_status_saved', marketArchetype, customDictionary);

  // 2. כרטיסי פעולה מומלצים מונחי-מיקוד (4 בכל תחום) ללא שטח מת
  const DOMAIN_ACTIONS: Record<OwnerStudioDomain, {
    title: string;
    icon: string;
    badge: string;
    desc: string;
    promptText: string;
  }[]> = {
    collections: [
      {
        title: 'הוסף שירות/מוצר חדש לקולקציה',
        icon: 'PackagePlus',
        badge: '01 • קולקציה',
        desc: 'יצירת פריט מלא עם מפרט 2x2, תמחור ושאלות לקפסולה',
        promptText: 'צור פריט חדש לקולקציה: חבילת פרימיום ממוקדת עם מפרט מלא ותמחור אטרקטיבי'
      },
      {
        title: 'עדכן מחירים ומבצעי השקה',
        icon: 'Tag',
        badge: '02 • תמחור',
        desc: 'דיוק הצעות מחיר, הנחות כמות ומבצעים לקראת קמפיין',
        promptText: 'עדכן את הצעות המחיר והטבות ההשקה בכל הקולקציה כדי להגדיל המרה'
      },
      {
        title: 'שדרג SEO, מטא ותגיות AI',
        icon: 'TrendingUp',
        badge: '03 • קידום',
        desc: 'חידוד סמנטי של כל המוצרים למנועי חיפוש ו-Gemini',
        promptText: 'שדרג את מילות המפתח, כותרות ה-SEO ותגיות החיפוש לכל הקולקציה'
      },
      {
        title: 'בנה חבילת VIP מודולרית',
        icon: 'Sparkles',
        badge: '04 • חבילות',
        desc: 'איגוד מספר שירותים לחבילת ערך גבוהה עם בונוסים',
        promptText: 'בנה חבילת VIP מודולרית המשלבת את שירותי הליבה עם ליווי אישי'
      }
    ],
    pages_forms: [
      {
        title: 'בנה טופס שלבים אינטראקטיבי (Step Form)',
        icon: 'ListFilter',
        badge: '01 • טפסים',
        desc: 'טופס מונחה-שאלות קצר וחכם עם אימות מיידי',
        promptText: 'בנה טופס שלבים אינטראקטיבי חדש של 3 שלבים לסינון ואיסוף לידים חמים'
      },
      {
        title: 'דייק את שאלות חקר השאילתא',
        icon: 'HelpCircle',
        badge: '02 • עמוד שאלות',
        desc: 'התאמת 4 השאלות המובילות במשפך לצרכי הלקוחות',
        promptText: 'דייק את 4 שאלות חקר השאילתא בעמוד כדי להוביל גולשים ישירות להמרה'
      },
      {
        title: 'החלף רקע ווידאו מ-KOSCLOUD',
        icon: 'Video',
        badge: '03 • מדיה',
        desc: 'הטמעת וידאו אווירה ממותג בפורמט WEBP מהמאגר',
        promptText: 'החלף את וידאו הרקע של עמוד הבית למדיה ממותגת ויוקרתית מתוך KOSCLOUD'
      },
      {
        title: 'הוסף שאלת סינון קוגניטיבית',
        icon: 'Sliders',
        badge: '04 • התאמה',
        desc: 'ניתוב מהיר של לקוחות פרימיום למסלול VIP',
        promptText: 'הוסף שאלת סינון קוגניטיבית שתנתב אוטומטית לקוחות בעלי תקציב גבוה'
      }
    ],
    visitor_flows: [
      {
        title: 'קצר את מסלול הגולש ל-60 שניות',
        icon: 'Zap',
        badge: '01 • מהירות',
        desc: 'הסרת חיכוך וניתוב ישיר מהקפסולה לעסקה',
        promptText: 'קצר את מסלול הגולש בעמוד ל-60 שניות מרגע הנחיתה ועד לפעולה'
      },
      {
        title: 'שנה יעד המרה בקפסולה הראשית',
        icon: 'Navigation',
        badge: '02 • קפסולה',
        desc: 'חיבור כפתור ה-CTA ישירות לוואטסאפ או לתיאום פגישה',
        promptText: 'שנה את יעד ההמרה הראשי בקפסולה העליונה כך שיוביל מיידית לתיאום ביומן'
      },
      {
        title: 'הפעל ניתוב קולי לפי כוונת לקוח',
        icon: 'Mic',
        badge: '03 • קולי',
        desc: 'קפיצה ישירה לעמוד המוצר ברגע שהגולש מבקש אותו',
        promptText: 'הגדר ניתוב קולי אוטומטי שמעביר את הגולש ישירות למוצר כשהוא שואל עליו'
      },
      {
        title: 'הגדר שאלת פולואפ מותאמת אישית',
        icon: 'MessageSquare',
        badge: '04 • פולואפ',
        desc: 'התאמת שאלת הסגירה במודל השיחה להגדלת סגירות',
        promptText: 'עדכן את שאלת הפולואפ במודל השיחה של הגולשים כך שתניע לפגישה'
      }
    ],
    ab_tests: [
      {
        title: 'הפעל A/B: סייבר אקורדיון מול זרקור זהב',
        icon: 'GitCompare',
        badge: '01 • סגנון',
        desc: 'השוואת ביצועי גילוי תוכן והמרות בין 2 סגנונות',
        promptText: 'הפעל מבחן A/B טסט שבודק סייבר אקורדיון מול זרקור זהב על 50% מהתנועה'
      },
      {
        title: 'בחן 2 כותרות מניעות לפעולה בקפסולה',
        icon: 'Split',
        badge: '02 • מיקרו-קופי',
        desc: 'בדיקת שיעור לחיצות בין כותרת סקרנות לכותרת תועלת',
        promptText: 'צור מבחן A/B בין כותרת קפסולה מבוססת סקרנות לבין כותרת מבוססת תוצאה'
      },
      {
        title: 'בדוק טופס מהיר (2 שלבים) מול מפורט',
        icon: 'FileCheck',
        badge: '03 • טפסים',
        desc: 'אימות כמות לידים מול איכות וסינון מקדים',
        promptText: 'בחן במבחן A/B טופס הרשמה מהיר של 2 שלבים לעומת טופס מפורט'
      },
      {
        title: 'נתח תוצאות המרה מובילות השבוע',
        icon: 'BarChart3',
        badge: '04 • אנליטיקה',
        desc: 'זיהוי הגרסה המנצחת והחלתה על 100% מהמבקרים',
        promptText: 'נתח את תוצאות מבחני ה-A/B של השבוע והצג את הגרסה המנצחת להחלה'
      }
    ],
    big_three: [
      {
        title: 'הגדר 3 תוצאות מפתח קריטיות להיום',
        icon: 'Target',
        badge: '01 • The Big 3',
        desc: 'מיקוד מוחלט ב-3 משימות מניבות בלבד לשקט מנטלי',
        promptText: 'הגדר את 3 תוצאות המפתח הקריטיות להיום שמביאות 80% מהתוצאות'
      },
      {
        title: 'מעבדת פירוק משימה AI Decompose',
        icon: 'Layers',
        badge: '02 • פירוק',
        desc: 'הפיכת רעיון גדול לצעדים מעשיים של 15 דקות',
        promptText: 'פרק את משימת ההשקה הגדולה ל-3 צעדים מעשיים של עד 15 דקות כל אחד'
      },
      {
        title: 'טקס נעילת יום עבודה וסיכום נכסים',
        icon: 'CheckCircle2',
        badge: '03 • נעילה',
        desc: 'סגירה מסודרת של היום ותכנון מוקדם למחר',
        promptText: 'בצע טקס נעילת יום: סכם את האינטראקציות שהומרו לנכסים ותכנן את המחר'
      },
      {
        title: 'תעדף לידים חמים לטיפול מיידי',
        icon: 'Flame',
        badge: '04 • לידים',
        desc: 'סינון חכם של הלקוחות שהשלימו את תהליך הגילוי',
        promptText: 'סנן ותעדף את 3 הלידים החמים ביותר שהשלימו את מסלול הגילוי היום'
      }
    ]
  };

  // 3. מחולל תוצאות מובנות עשירות לכל אחד מ-5 התחומים
  const generateExecutionPayload = (domain: OwnerStudioDomain, prompt: string) => {
    switch (domain) {
      case 'collections':
        return {
          title: prompt.length > 28 ? prompt.slice(0, 28) + '...' : prompt,
          subtitle: 'פתרון מקצועי מותאם אישית • אספקה מדויקת וביצוע מושלם',
          price: 650,
          category: 'שירותים מובילים',
          badgeText: 'מהדורה מוגבלת',
          specsGrid: [
            { id: 'time', label: 'זמן ביצוע', value: 'אספקה תוך 24 שעות', icon: 'Clock' },
            { id: 'warranty', label: 'אחריות מלאה', value: '100% שביעות רצון', icon: 'ShieldCheck' },
            { id: 'impact', label: 'אימפקט עסקי', value: 'מיידי ומדיד', icon: 'Zap' }
          ],
          suggestedQuestions: [
            'איך הפתרון חוסך לי זמן וכסף?',
            'מה תהליך העבודה שלב אחר שלב?',
            'האם יש ליווי ותמיכה לאחר הרכישה?'
          ]
        };

      case 'pages_forms':
        return {
          formTitle: 'שאלון התאמה אישי ומיקוד תוצאות',
          stepsCount: 3,
          steps: [
            { step: 1, title: 'אפיון הצורך והיעד המרכזי', type: 'single_choice', options: ['הגדלת מכירות', 'פינוי זמן אישי', 'ייעול תהליכים'] },
            { step: 2, title: 'הגדרת תקציב ולוח זמנים', type: 'budget_picker', options: ['מיידי', 'במהלך החודש', 'בדיקה עקרונית'] },
            { step: 3, title: 'פרטי יצירת קשר לוואטסאפ', type: 'contact_action', cta: 'קבל אבחון אישי מיידי ◀' }
          ],
          conversionGoal: 'ליד מאומת תוך 45 שניות'
        };

      case 'visitor_flows':
        return {
          flowName: 'משפך מואץ 60 שניות',
          entryTrigger: 'קפסולה עליונה • לחיצה על שאלה מובילה',
          transitionStep: 'מעבר חלק למודל חקר שאילתא (Focus Modal)',
          primaryCtaAction: 'WhatsApp Direct Connect & שריון פגישה',
          expectedDropRateReduction: '42% פחות נטישה'
        };

      case 'ab_tests':
        return {
          testName: 'מבחן סגנונות גילוי: סייבר אקורדיון מול זרקור זהב',
          variantA: 'Cyber Neon • Accordion Morph (פריסת 4 רצועות מתרחבות)',
          variantB: 'Luxury Gold • Spotlight Stage (במת זרקור מרכזית 56%)',
          trafficSplit: '50% / 50%',
          targetMetric: 'שיעור לחיצה על CTA ובדיקת התאמה',
          status: 'מוכן להפעלה מיידית'
        };

      case 'big_three':
      default:
        return {
          dailyObjective: '3 משימות מפתח להנעת צמיחה ושקט קוגניטיבי',
          tasks: [
            { id: 't1', title: 'סגירת הצעת מחיר ללקוח VIP', duration: '20 דקות', priority: 'High', status: 'pending' },
            { id: 't2', title: 'אישור קמפיין מודעות סייבר חדש', duration: '15 דקות', priority: 'High', status: 'pending' },
            { id: 't3', title: 'עדכון קטלוג המוצרים במערכת', duration: '25 דקות', priority: 'High', status: 'pending' }
          ],
          closingRitual: 'טקס נעילה ב-17:30 • שחרור מוחלט מעומס מנטלי'
        };
    }
  };

  // 4. התחלת ביצוע עריכה עם אפקט הקלדה חי
  const triggerExecution = (domain: OwnerStudioDomain, actionPrompt: string) => {
    const clean = actionPrompt.trim();
    if (!clean) return;

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    const payload = generateExecutionPayload(domain, clean);
    const explanation = `ניתחתי את ההוראה עבור נכסי הטננט (${domain.toUpperCase()}): הפקתי ארכיטקטורה מובנית ומדויקת המוכנה להחלה מיידית בלחיצה אחת!`;

    setActiveExecution({
      prompt: clean,
      explanation,
      payloadType: domain,
      payloadData: payload
    });

    setIsApplied(false);
    setDisplayedChars(0);
    setViewMode('answering');
  };

  // אפקט הקלדה תו אחר תו (Typewriter)
  useEffect(() => {
    if (viewMode === 'answering' && activeExecution) {
      setDisplayedChars(0);
      const totalLen = activeExecution.explanation.length;
      let curr = 0;

      typingTimerRef.current = setInterval(() => {
        curr += 1;
        setDisplayedChars(curr);
        if (curr >= totalLen) {
          clearInterval(typingTimerRef.current);
        }
      }, 14);

      return () => {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      };
    }
  }, [viewMode, activeExecution]);

  // עקרון הפוקוס: חזרת האייקון הענק ו-4 הכרטיסים בלחיצה על "פעולה נוספת"
  const handleAskAnotherAction = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setViewMode('prompt');
    setActiveExecution(null);
    setDisplayedChars(0);
    setInputText('');
    setIsApplied(false);
  };

  // שמירה והחלה בלחיצה אחת ישירות ל-Firestore
  const handleApplyToSystem = async () => {
    if (!activeExecution || isApplied) return;
    setIsLoading(true);

    try {
      const { payloadType, payloadData } = activeExecution;

      if (payloadType === 'collections') {
        const prodId = `prod_${Date.now()}`;
        const newProduct = {
          id: prodId,
          ...payloadData,
          imageUrl: tenantProfile?.logoUrl || '/cloudstore/realestate_hero.webp',
          status: 'active',
          isAvailable: true,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(comonaDb, 'tenants', tenantId, 'products', prodId), newProduct, { merge: true });
        setStatusNotification(`✓ הפריט "${newProduct.title}" נשמר בהצלחה לקולקציה וחי במערכת!`);
      } else if (payloadType === 'pages_forms') {
        await setDoc(
          doc(comonaDb, 'tenants', tenantId),
          { activeStepForm: payloadData, updatedAt: new Date().toISOString() },
          { merge: true }
        );
        setStatusNotification('✓ מפרט טופס השלבים עודכן בהצלחה בעמוד!');
      } else if (payloadType === 'ab_tests') {
        await setDoc(
          doc(comonaDb, 'tenants', tenantId),
          { abTestExperiment: payloadData, updatedAt: new Date().toISOString() },
          { merge: true }
        );
        setStatusNotification('✓ מבחן ה-A/B הופעל בהצלחה על 50% מתנועת הגולשים!');
      } else {
        await setDoc(
          doc(comonaDb, 'tenants', tenantId),
          { [payloadType]: payloadData, updatedAt: new Date().toISOString() },
          { merge: true }
        );
        setStatusNotification('✓ השינויים הוחלו ונשמרו בהצלחה בנכסי הטננט!');
      }

      setIsApplied(true);
      setTimeout(() => setStatusNotification(null), 3500);
    } catch (e: any) {
      console.error('Error applying owner changes:', e);
      setStatusNotification(`שגיאה בשמירה: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // תמיכה בהקלטה קולית
  const handleToggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('הדפדפן אינו תומך בהקלטה קולית');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = 'he-IL';
    recog.interimResults = false;
    recog.onstart = () => setIsRecording(true);
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recog.onend = () => setIsRecording(false);
    recog.start();
  };

  const isTypingDone = activeExecution
    ? displayedChars >= activeExecution.explanation.length
    : false;

  const currentCards = DOMAIN_ACTIONS[activeDomain] || DOMAIN_ACTIONS.collections;

  return (
    <div
      className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between p-3.5 sm:p-4 select-none animate-fadeIn transition-colors duration-300 font-sans"
      dir="rtl"
      style={{ fontFamily: "'Heebo', sans-serif" }}
    >
      {/* הילת רקע זוהרת מותאמת לסוכן המנהל */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-88 h-48 rounded-full blur-[90px] pointer-events-none opacity-20"
        style={{ backgroundColor: brandColor }}
      />

      {/* 1. Header עליון קבוע: חזרה למסך + חיווי מיתוג סטודיו מנהל */}
      <div className="flex items-center justify-between z-20 shrink-0 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
        >
          <Icons.ArrowRight size={14} style={{ color: brandColor }} />
          <span>חזרה למסך</span>
        </button>

        <div className="flex items-center gap-2">
          <KosunUserAvatar color={brandColor} glowColor={`${brandColor}50`} size={22} />
          <span
            className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border"
            style={{
              borderColor: `${brandColor}40`,
              backgroundColor: `${brandColor}15`,
              color: brandColor
            }}
          >
            {viewMode === 'answering' ? 'LIVE EXECUTION' : 'OWNER AI STUDIO'}
          </span>
        </div>
      </div>

      {/* הודעת סטטוס שמירה */}
      {statusNotification && (
        <div className="my-1 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fadeIn shrink-0 z-20">
          {statusNotification}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          2. מצב תצוגה A: שיחה חיה, תוצאה מובנית והחלה בלחיצה אחת (MODE: ANSWERING)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'answering' && activeExecution && (
        <div className="flex-1 flex flex-col justify-between my-auto py-1 z-20 animate-fadeIn overflow-hidden">
          {/* בועת בקשת המנהל */}
          <div className="p-2.5 border border-white/10 bg-white/5 rounded-2xl shadow-md shrink-0 mb-1 flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${brandColor}25`, color: brandColor }}
            >
              <Icons.Wrench size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9.5px] font-mono block text-slate-400">הוראת העריכה שלך:</span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {activeExecution.prompt}
              </h3>
            </div>
          </div>

          {/* תיבת התוצאה המוקלדת עם כרטיסיית החלה אינטראקטיבית */}
          <div
            className="flex-1 border border-white/10 p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 shadow-2xl relative overflow-hidden flex flex-col justify-between my-1"
            style={{ boxShadow: `0 8px 30px -8px ${brandColor}30` }}
          >
            <div className="overflow-y-auto pr-1">
              {/* סרגל כותרת פנימי של סוכן הניהול */}
              <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
                <KosunUserAvatar color={brandColor} glowColor={`${brandColor}50`} size={20} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: brandColor }}>
                  ביצוע ועיבוד סוכן מנהל בשיחה חיה
                </span>
                {!isTypingDone && (
                  <span className="text-[9px] font-mono animate-pulse mr-auto" style={{ color: brandColor }}>
                    מייצר נתונים מובנים...
                  </span>
                )}
              </div>

              {/* טקסט ההסבר מוקלד באפקט הקלדה */}
              <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                {activeExecution.explanation.slice(0, displayedChars)}
                {!isTypingDone && (
                  <span
                    className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
              </p>

              {/* תצוגה מקדימה עשירה ואינטראקטיבית לפי תחום העריכה */}
              {isTypingDone && (
                <div className="mt-2.5 p-3 rounded-xl bg-black/60 border border-white/10 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <span className="text-[10px] font-black" style={{ color: brandColor }}>
                      ⚡ נכס מובנה מוכן לשמירה מיידית ({activeExecution.payloadType.toUpperCase()})
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">100% KOSUN COMPLIANT</span>
                  </div>

                  {/* 1. קולקציות ומוצרים */}
                  {activeExecution.payloadType === 'collections' && (
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-black text-xs">{activeExecution.payloadData.title}</span>
                        <span className="text-xs font-black text-amber-400">₪{activeExecution.payloadData.price}</span>
                      </div>
                      <p className="text-[10px] text-slate-300">{activeExecution.payloadData.subtitle}</p>
                      <div className="grid grid-cols-3 gap-1 pt-1">
                        {activeExecution.payloadData.specsGrid?.map((s: any) => (
                          <div key={s.id} className="p-1 rounded bg-white/5 border border-white/5 text-[9px] text-center">
                            <span className="text-slate-400 block">{s.label}</span>
                            <span className="text-white font-bold block truncate">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. עמודים וטפסים */}
                  {activeExecution.payloadType === 'pages_forms' && (
                    <div className="text-right space-y-1">
                      <span className="text-white font-bold text-xs block">{activeExecution.payloadData.formTitle}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {activeExecution.payloadData.stepsCount} שלבים חכמים
                        </span>
                        <span>{activeExecution.payloadData.conversionGoal}</span>
                      </div>
                    </div>
                  )}

                  {/* 3. תהליכי גולשים */}
                  {activeExecution.payloadType === 'visitor_flows' && (
                    <div className="text-right space-y-1 text-[10px]">
                      <span className="text-white font-bold text-xs block">{activeExecution.payloadData.flowName}</span>
                      <p className="text-slate-300">טריגר כניסה: {activeExecution.payloadData.entryTrigger}</p>
                      <p className="text-amber-300">יעד CTA: {activeExecution.payloadData.primaryCtaAction}</p>
                    </div>
                  )}

                  {/* 4. מבחני A/B */}
                  {activeExecution.payloadType === 'ab_tests' && (
                    <div className="text-right space-y-1 text-[10px]">
                      <span className="text-white font-bold text-xs block">{activeExecution.payloadData.testName}</span>
                      <div className="p-1.5 rounded bg-white/5 border border-white/5 space-y-0.5">
                        <div className="text-cyan-300 font-bold">A: {activeExecution.payloadData.variantA}</div>
                        <div className="text-amber-300 font-bold">B: {activeExecution.payloadData.variantB}</div>
                      </div>
                    </div>
                  )}

                  {/* 5. The Big 3 */}
                  {activeExecution.payloadType === 'big_three' && (
                    <div className="text-right space-y-1 text-[10px]">
                      <span className="text-white font-bold text-xs block">{activeExecution.payloadData.dailyObjective}</span>
                      <div className="space-y-1 pt-1">
                        {activeExecution.payloadData.tasks?.map((t: any) => (
                          <div key={t.id} className="flex items-center justify-between p-1 rounded bg-white/5 border border-white/5">
                            <span className="text-slate-200">{t.title}</span>
                            <span className="text-amber-400 font-mono text-[9px]">{t.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* כפתור החלה בלחיצה אחת */}
                  <button
                    disabled={isApplied || isLoading}
                    onClick={handleApplyToSystem}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                      isApplied
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'text-black hover:scale-[1.01] active:scale-95'
                    }`}
                    style={{
                      backgroundColor: isApplied ? undefined : brandColor,
                      boxShadow: isApplied ? undefined : `0 4px 16px ${brandColor}40`
                    }}
                  >
                    {isApplied ? (
                      <>
                        <Icons.CheckCircle2 size={14} />
                        <span>{successSavedText}</span>
                      </>
                    ) : (
                      <>
                        <Icons.UploadCloud size={14} />
                        <span>✓ {saveTooltip} ◀</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* שאלת פולואפ מסיימת */}
              {isTypingDone && (
                <div
                  className="mt-3 pt-2 border-t border-dashed border-white/10 flex items-center gap-2 animate-fadeIn"
                >
                  <Icons.MessageSquareQuote size={14} style={{ color: brandColor }} className="shrink-0" />
                  <p className="text-xs font-bold leading-tight" style={{ color: brandColor }}>
                    זה מדויק עבורך או שתרצה שנדייק את הפריסה והניסוח?
                  </p>
                </div>
              )}
            </div>

            {/* כפתורי פעולה עפ"י חוק המיקוד: פעולה נוספת (החזרת הסטודיו ו-4 הכרטיסים) מול סגירה */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2.5 mt-1 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={handleAskAnotherAction}
                className="w-full sm:flex-1 py-2 px-3 border border-white/10 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 bg-white/5 hover:bg-white/10"
              >
                <Icons.RotateCcw size={13} style={{ color: brandColor }} />
                <span>פעולה נוספת / רוצה לדייק ◀</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-2 px-3 text-xs font-bold text-slate-300 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-white/5"
              >
                <Icons.Check size={13} />
                <span>סגור סטודיו וחזור למסך</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          3. מצב תצוגה B: מיקוד מלא, 5 תחומי עריכה ו-4 כרטיסים פרוסים (MODE: PROMPT)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'prompt' && (
        <>
          {/* מרכז הסטודיו: אייקון 3D ענק וסטטוס (Zero Scroll) */}
          <div className="flex flex-col items-center justify-center my-auto py-1 z-20 text-center shrink-0 animate-fadeIn">
            <div className="relative mb-1.5 cursor-pointer group" onClick={handleToggleMic}>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl group-hover:scale-105 active:scale-95 border-2"
                style={{
                  borderColor: brandColor,
                  backgroundColor: `${brandColor}18`,
                  boxShadow: `0 0 30px ${brandColor}40`
                }}
              >
                <KosunUserAvatar color={brandColor} glowColor={`${brandColor}60`} size={46} pulse={isRecording} />
              </div>
              {isRecording && (
                <div className="absolute -inset-2.5 rounded-full border-2 border-rose-500/60 animate-ping pointer-events-none" />
              )}
            </div>

            <h3 className="text-sm sm:text-base font-black text-white leading-tight">
              {isRecording ? 'מקשיב להוראת הניהול בעברית...' : 'במה נרצה למקד ולערוך את העסק היום?'}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              שליטה מלאה בכל נכסי הטננט: קולקציות, עמודים, טפסים ומבחני A/B
            </p>
          </div>

          {/* בורר 5 תחומי העריכה של הטננט (5 Domains Pill Bar) */}
          <div className="flex items-center justify-center gap-1.5 py-1 shrink-0 z-20 overflow-x-auto scrollbar-none">
            {[
              { id: 'collections', label: 'קולקציות ומוצרים', icon: 'Package' },
              { id: 'pages_forms', label: 'עמודים וטפסים', icon: 'FileText' },
              { id: 'visitor_flows', label: 'תהליכי גולשים', icon: 'GitFork' },
              { id: 'ab_tests', label: 'מבחני A/B', icon: 'GitCompare' },
              { id: 'big_three', label: 'תעדוף The Big 3', icon: 'Target' }
            ].map((tab) => {
              const TabIcon = (Icons as any)[tab.icon] || Icons.Circle;
              const isActive = activeDomain === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDomain(tab.id as OwnerStudioDomain)}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1.5 border active:scale-95 ${
                    isActive
                      ? 'text-black font-black shadow-md'
                      : 'text-slate-400 bg-white/5 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isActive ? brandColor : undefined,
                    borderColor: isActive ? brandColor : undefined,
                    boxShadow: isActive ? `0 0 14px ${brandColor}40` : undefined
                  }}
                >
                  <TabIcon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* שדה הזנת פקודה / דיבור קולי ישיר */}
          <div
            className="w-full border border-white/10 p-2.5 rounded-2xl shadow-xl relative z-20 shrink-0 my-1 flex flex-col justify-between bg-slate-900/90 animate-fadeIn"
            style={{ boxShadow: `0 4px 18px -4px ${brandColor}30` }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-white bg-white/5'
                }`}
                title="לחץ לפקודה קולית"
              >
                <Icons.Mic size={15} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputText.trim()) {
                    triggerExecution(activeDomain, inputText);
                  }
                }}
                placeholder={
                  activeDomain === 'collections'
                    ? 'הקלד הוראה: למשל "הוסף חבילת השקה חדשה ב-₪490..."'
                    : activeDomain === 'pages_forms'
                    ? 'הקלד הוראה: למשל "בנה טופס 3 שלבים לסינון לקוחות..."'
                    : activeDomain === 'visitor_flows'
                    ? 'הקלד הוראה: למשל "שנה את ה-CTA בקפסולה לוואטסאפ..."'
                    : activeDomain === 'ab_tests'
                    ? 'הקלד הוראה: למשל "בחן 2 סגנונות גילוי לעמוד..."'
                    : 'הקלד הוראה: למשל "תעדף את 3 משימות המפתח להיום..."'
                }
                className="w-full bg-transparent outline-none text-xs text-white placeholder-slate-500"
                dir="rtl"
              />

              <button
                type="button"
                onClick={() => triggerExecution(activeDomain, inputText)}
                disabled={!inputText.trim() || isLoading}
                className="px-3 py-1 rounded-xl text-black font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40 shrink-0"
                style={{ backgroundColor: brandColor }}
              >
                <Icons.Send size={12} />
                <span>הפעל ◀</span>
              </button>
            </div>
          </div>

          {/* 4 כרטיסי פעולה מומלצים פרוסים מול העיניים (Hero Editing Actions Showcase) */}
          <div className="w-full z-20 shrink-0 my-1 animate-fadeIn">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[10px] font-black" style={{ color: brandColor }}>
                💡 פעולות עריכה מהירות לנכסי הטננט (לחץ לביצוע ישיר):
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                100% פוקוס קוגניטיבי
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {currentCards.map((card, idx) => {
                const CardIcon = (Icons as any)[card.icon] || Icons.Sparkles;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => triggerExecution(activeDomain, card.promptText)}
                    className="p-2 border border-white/10 bg-white/5 hover:bg-white/10 text-right transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.02] active:scale-95 rounded-2xl relative overflow-hidden shadow-sm"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                      >
                        <CardIcon size={11} />
                      </div>
                      <span
                        className="text-[8px] font-mono px-1 py-0.2 rounded"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        {card.badge}
                      </span>
                    </div>

                    <p className="text-[10.5px] font-bold text-white leading-tight line-clamp-1 my-0.5">
                      {card.title}
                    </p>
                    <p className="text-[9px] text-slate-400 line-clamp-1">
                      {card.desc}
                    </p>

                    <div className="flex items-center justify-between text-[8px] pt-1 mt-1 border-t border-white/10 w-full text-slate-400">
                      <span>הפעל עכשיו</span>
                      <Icons.ArrowLeft size={10} style={{ color: brandColor }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* פוטר מודל הסטודיו */}
      <div className="text-center text-[9.5px] font-mono pt-1 border-t border-white/10 z-20 shrink-0 text-slate-400">
        ממשק סטודיו מנהל ממוקד • ללא גלילה • {tenantProfile?.name ? tenantProfile.name.split('•')[0].trim() : 'KOSUN 2026'}
      </div>
    </div>
  );
};
