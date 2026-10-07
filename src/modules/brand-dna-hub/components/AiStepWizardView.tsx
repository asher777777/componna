import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBrandDna } from '../context/BrandDnaContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import {
  generateStepAiAssistance,
  StepAiSuggestion,
  StepAiAssistanceResult,
} from '../services/geminiBrandPrompt';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { extractDominantColorsFromImage } from '../services/colorExtractor';
import {
  Sparkles,
  Wand2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Check,
  Loader2,
  Building2,
  Sliders,
  Target,
  Palette,
  ShieldCheck,
  Users,
  Flame,
  Zap,
  Award,
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  Compass,
  Eye,
  HeartHandshake,
  Brain,
  Bot,
  Plus,
  Trash2,
  Layers,
  Sparkle,
  UploadCloud,
  FolderOpen,
  Lock,
  Image as ImageIcon,
} from 'lucide-react';
import {
  OrganizationType,
  GenderAddressing,
  SectorCompliance,
  BorderRadiusStyle,
  ButtonStyleType,
  PersonaItem,
  ObjectionItem,
} from '../types/brandDna';

export interface StepDefinition {
  id: string;
  stepNumber: number;
  category: 'identity' | 'voice' | 'audience' | 'design' | 'trust';
  categoryLabel: string;
  title: string;
  question: string;
  subtitle: string;
  whyItMatters: string;
}

export const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 'step_identity_name',
    stepNumber: 1,
    category: 'identity',
    categoryLabel: 'זהות עסקית',
    title: 'שם המותג וסוג הפעילות',
    question: 'איך קוראים לעסק או לארגון שלך, ומה מבנה הפעילות שלו?',
    subtitle: 'זהו היסוד הראשון של המערכת. שם מדויק יוצר רושם ראשוני ומגדיר את אופי הפעילות.',
    whyItMatters: 'השם מוטמע בכל הנכסים הדיגיטליים – מדפי נחיתה, דרך כותרות הודעות בוט ועד מסמכי סליקה.',
  },
  {
    id: 'step_identity_purpose',
    stepNumber: 2,
    category: 'identity',
    categoryLabel: 'זהות עסקית',
    title: 'תחום הפעילות והיקף הצוות',
    question: 'מה תחום הפעילות והשירות המרכזי שלכם? כמה חברים מובילים את הארגון?',
    subtitle: 'הגדרת השירות והיקף הצוות מאפשרת ל-AI לכוונן את הטקסטים בהתאם לרמת הסמכות והזמינות.',
    whyItMatters: 'הבדל בין עסק של אדם יחיד לעסק עם צוות משנה את לשון הפנייה וההבטחה השירותית.',
  },
  {
    id: 'step_identity_slogan',
    stepNumber: 3,
    category: 'identity',
    categoryLabel: 'זהות עסקית',
    title: 'סלוגן מוביל ותמצית המסר',
    question: 'מהו המשפט הקליט או הסלוגן שמזקק את הבטחת המותג שלך?',
    subtitle: 'סלוגן קצר וממוקד של 3 עד 6 מילים שנצרב בזיכרון של כל לקוח פוטנציאלי.',
    whyItMatters: 'סלוגן חד וקליט מעלה את זכירות המותג ב-80% ומלווה כל כותרת עליונה בדפי הנחיתה.',
  },
  {
    id: 'step_identity_vision',
    stepNumber: 4,
    category: 'identity',
    categoryLabel: 'זהות עסקית',
    title: 'חזון הארגון לעתיד',
    question: 'לאן אתם שואפים להגיע ומה ההשפעה שאתם מייצרים עבור לקוחותיכם?',
    subtitle: 'נסח את החזון שמניע אתכם קדימה, והוסף תמצית חזון במשפט אחד קצר.',
    whyItMatters: 'חזון מעורר השראה מחבר לקוחות ברמה הרגשית ומצדיק תמחור פרימיום.',
  },
  {
    id: 'step_voice_personality',
    stepNumber: 5,
    category: 'voice',
    categoryLabel: 'שפת מותג וטון',
    title: 'אישיות וסגנון המותג (4 הממדים)',
    question: 'איך המותג שלך נשמע במפגש עם הלקוח? (כוונן את 4 הסקאלות)',
    subtitle: 'הגדר את רמת הרשמיות, החמימות, היוקרה והאנרגיה כדי שכל קופי של AI ישמע בדיוק כמוך.',
    whyItMatters: 'ה-AI מתרגם ערכים אלו ישירות לניסוח פסקאות, תסריטי וידאו והודעות ווטסאפ.',
  },
  {
    id: 'step_voice_sector',
    stepNumber: 6,
    category: 'voice',
    categoryLabel: 'שפת מותג וטון',
    title: 'לשון פנייה, שבת והתאמה תרבותית',
    question: 'איך תרצו לפנות ללקוח, ולאיזה מגזר תרבותי המסרים מיועדים?',
    subtitle: 'בחר פנייה בלשון רבים או יחיד, התאמה מגזרית (כללי/דתי/חרדי/B2B) והגדרת שומר שבת.',
    whyItMatters: 'מניעת שגיאות מגדריות ותרבותיות מייצרת תחושת כבוד ואמון בלתי מעורער.',
  },
  {
    id: 'step_voice_words',
    stepNumber: 7,
    category: 'voice',
    categoryLabel: 'שפת מותג וטון',
    title: 'מילות כוח ומילים אסורות (Guardrails)',
    question: 'אילו מילים מייצרות אצלכם המרה, ואילו מילים אסור ל-AI לכתוב לעולם?',
    subtitle: 'הזן מילות כוח שמשדרות איכות וביטחון, לצד גבולות שליליים שימנעו שחיקת מותג.',
    whyItMatters: 'חוקי הברזל של ה-AI מגנים על השם שלכם מפני קופי נמוך, זול או לא הולם.',
  },
  {
    id: 'step_audience_uvp',
    stepNumber: 8,
    category: 'audience',
    categoryLabel: 'קהל ובידול',
    title: 'הצעת הערך הייחודית (UVP)',
    question: 'למה שלקוח יבחר דווקא בכם על פני כל מתחרה אחר בשוק?',
    subtitle: 'הבטחת הערך המרכזית והבידול החד שגורמים ללקוח להגיד "זה בדיוק מה שחיפשתי".',
    whyItMatters: 'ה-UVP הוא עמוד השדרה של כל דף מכירה, הצעה שיווקית וקמפיין ממומן.',
  },
  {
    id: 'step_audience_target',
    stepNumber: 9,
    category: 'audience',
    categoryLabel: 'קהל ובידול',
    title: 'קהלי היעד העיקריים',
    question: 'מי הם פלחי הלקוחות המרכזיים שאתם פונים אליהם?',
    subtitle: 'הגדר 2-3 קהלים מובחנים כדי שנוכל לייצר דפי נחיתה ומסעות לקוח ממוקדים לכל אחד.',
    whyItMatters: 'כאשר דף מדבר בדיוק לסוג העסק של הלקוח, יחס ההמרה מזנק פי כמה.',
  },
  {
    id: 'step_audience_persona',
    stepNumber: 10,
    category: 'audience',
    categoryLabel: 'קהל ובידול',
    title: 'פרסונת הלקוח האידיאלי',
    question: 'מי הלקוח האופייני שהכי מרוויח מהשירות שלכם? מה הכאב שלו ומה חלומו?',
    subtitle: 'הגדרת פרסונה מוחשית מאפשרת ל-AI לגעת בכאבים האמיתיים ולהבטיח את תוצאת החלום.',
    whyItMatters: 'אנשים קונים פתרונות לכאב שלהם והגשמת תוצאת החלום, לא פיצ׳רים טכניים.',
  },
  {
    id: 'step_audience_objections',
    stepNumber: 11,
    category: 'audience',
    categoryLabel: 'קהל ובידול',
    title: 'טיפול בהתנגדויות וחששות',
    question: 'מהו החשש העיקרי שגורם ללקוחות להסס, ואיך אתם מפיגים אותו?',
    subtitle: 'ציין חשש נפוץ (כגון מחיר, זמן או מורכבות) ואת המענה המרגיע של המותג.',
    whyItMatters: 'טיפול מוקדם בהתנגדות בתוך שאלון או דף נחיתה מסיר חסמי רכישה ומכפיל מכירות.',
  },
  {
    id: 'step_design_tokens',
    stepNumber: 12,
    category: 'design',
    categoryLabel: 'שפה חזותית',
    title: 'פלטת צבעים, גופנים וסגנון',
    question: 'איזה צבעים, גופן וסגנון כפתורים ישדרו את אישיות המותג שלכם?',
    subtitle: 'בחר פלטה מעוצבת, גופן עברי מוביל וסגנון כפתור שיוזרקו אוטומטית לכלל עמודי המערכת.',
    whyItMatters: 'השפה הוויזואלית משפיעה על התפיסה התת-הכרתית של הלקוח תוך 50 אלפיות שנייה.',
  },
  {
    id: 'step_trust_checkout',
    stepNumber: 13,
    category: 'trust',
    categoryLabel: 'אמינות וסליקה',
    title: 'אמון, שירות וסליקה בטוחה',
    question: 'מהם פרטי יצירת הקשר, תנאי הביטול ותגיות האבטחה שירגיעו את הרוכשים?',
    subtitle: 'פרטי יצירת קשר, ח.פ, מדיניות החזרים והצהרת אבטחת תשלום שמופיעים בדפי הסליקה.',
    whyItMatters: 'שקיפות ואבטחה מורידים את סף החרדה ומעלים את אחוז ההשלמה בסליקה ביותר מ-30%.',
  },
];

const THINKING_MESSAGES = [
  'Gemini מנתח את שם המותג ותחום הפעילות...',
  'גוזר תובנות פסיכולוגיות והתאמה לקהל היעד...',
  'מלטש אפשרויות שיווקיות ומחשב את ההמלצה החזקה ביותר...',
  'מנסח קופי חד ומותאם אישית לפרופיל המותג שלך...',
];

const ORGANIZATION_TYPES: OrganizationType[] = ['חברה', 'עוסק מורשה', 'עמותה', 'שותפות', 'עוסק פטור', 'אחר'];
const MEMBER_COUNTS = ['1 (עצמאי)', 'עד 10', '11-50', '50+'];
const GENDER_OPTIONS: Array<{ id: GenderAddressing; label: string; desc: string }> = [
  { id: 'plural', label: 'רבים כוללת', desc: 'פנייה מכבדת לכולם ("אתם", "שלכם")' },
  { id: 'male', label: 'זכר יחיד', desc: 'פנייה אישית ("אתה", "שלך")' },
  { id: 'female', label: 'נקבה יחיד', desc: 'פנייה ממוקדת לנשים ("את", "שלך")' },
  { id: 'neutral', label: 'נייטרלית/פסיבית', desc: 'פנייה כללית ("ניתן להצטרף")' },
  { id: 'direct', label: 'חדה ומניעה לפעולה', desc: 'ציווי מכירתי ("בוא לקבל", "קבל עכשיו")' },
];

const SECTOR_OPTIONS: Array<{ id: SectorCompliance; label: string }> = [
  { id: 'general', label: 'כללי (עברית ישראלית מודרנית)' },
  { id: 'religious', label: 'דתי / מסורתי (לשון נקייה ומכבדת)' },
  { id: 'ultra_orthodox', label: 'חרדי (צנוע, שפה שמורה וללא סלנג)' },
  { id: 'business', label: 'עסקי B2B (מונחים מקצועיים וממוקדי ROI)' },
];

export const AiStepWizardView: React.FC<{ onSwitchToTabs?: () => void }> = ({ onSwitchToTabs }) => {
  const {
    brandDna,
    updateIdentity,
    updateVoice,
    updateAudience,
    updateDesignTokens,
    updateTrust,
    saveNow,
    isSaving,
    completenessScore,
  } = useBrandDna();

  const { apiKeys } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<StepAiAssistanceResult | null>(null);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number | null>(null);
  const [thinkingMsgIndex, setThinkingMsgIndex] = useState(0);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [newPowerWord, setNewPowerWord] = useState('');
  const [newForbiddenWord, setNewForbiddenWord] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const currentStep = STEP_DEFINITIONS[currentStepIdx];
  const totalSteps = STEP_DEFINITIONS.length;

  // Cycle thinking messages during AI generation
  useEffect(() => {
    let interval: any;
    if (isAiLoading) {
      interval = setInterval(() => {
        setThinkingMsgIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
      }, 1500);
    } else {
      setThinkingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isAiLoading]);

  // Reset AI suggestion on step change, and optionally auto-fetch if brand has name
  useEffect(() => {
    setAiResult(null);
    setSelectedSuggestionIdx(null);
    setAppliedNotice(null);
  }, [currentStepIdx]);

  // Call AI Assistance for the current step
  const handleRequestAi = async () => {
    setIsAiLoading(true);
    const apiKey = apiKeys.googleAiApiKey || '';
    const res = await generateStepAiAssistance(currentStep.id, brandDna, apiKey);
    setAiResult(res);
    setSelectedSuggestionIdx(res?.recommendedIndex ?? 0);
    setIsAiLoading(false);
  };

  // Logo file upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateIdentity({ logoUrl: dataUrl });
        try {
          const colors = await extractDominantColorsFromImage(dataUrl, 2);
          if (colors.length > 0) {
            updateDesignTokens({ primaryColor: colors[0], buttonBgColor: colors[0] });
          }
        } catch {}
      }
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  // Media gallery picker (for paying/admin customers)
  const handleOpenGalleryForLogo = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'image/*' });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (url) {
          updateIdentity({ logoUrl: url });
        }
      }
    } else {
      alert('רכיב הגלריה זמין למנויי המערכת המחוברים.');
    }
  };

  // One-click apply suggestion with immediate active reactivity
  const handleApplySuggestion = (suggestion: StepAiSuggestion, idx: number) => {
    setSelectedSuggestionIdx(idx);
    const val = suggestion.value;

    switch (currentStep.id) {
      case 'step_identity_name':
        updateIdentity({ companyName: typeof val === 'string' ? val : String(val) });
        break;
      case 'step_identity_purpose':
        updateIdentity({ organizationPurpose: typeof val === 'string' ? val : String(val) });
        break;
      case 'step_identity_slogan':
        updateIdentity({ slogan: typeof val === 'string' ? val : String(val) });
        break;
      case 'step_identity_vision':
        updateIdentity({
          companyVision: typeof val === 'string' ? val : String(val),
          shortVision: typeof val === 'string' ? val.slice(0, 70) : '',
        });
        break;
      case 'step_voice_personality':
        if (typeof val === 'object' && val !== null) {
          updateVoice({ personality: { ...brandDna.voice.personality, ...val } });
        }
        break;
      case 'step_voice_sector':
        if (typeof val === 'object' && val !== null) {
          updateVoice(val);
        }
        break;
      case 'step_voice_words':
        if (typeof val === 'object' && val !== null) {
          updateVoice({
            powerWords: val.powerWords || brandDna.voice.powerWords,
            forbiddenWords: val.forbiddenWords || brandDna.voice.forbiddenWords,
          });
        }
        break;
      case 'step_audience_uvp':
        updateAudience({ mainUvp: typeof val === 'string' ? val : String(val) });
        break;
      case 'step_audience_target':
        if (Array.isArray(val)) {
          updateAudience({ targetAudiences: val });
        }
        break;
      case 'step_audience_persona':
        if (Array.isArray(val)) {
          updateAudience({ personas: val });
        }
        break;
      case 'step_audience_objections':
        if (Array.isArray(val)) {
          updateAudience({ commonObjections: val });
        }
        break;
      case 'step_design_tokens':
        if (typeof val === 'object' && val !== null) {
          updateDesignTokens(val);
        }
        break;
      case 'step_trust_checkout':
        if (typeof val === 'object' && val !== null) {
          updateTrust(val);
        }
        break;
      default:
        break;
    }

    setAppliedNotice(`ההצעה "${suggestion.title}" הוחלה בהצלחה!`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  const goToNextStep = async () => {
    await saveNow();
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  // Category Icon helper
  const renderCategoryIcon = (cat: StepDefinition['category']) => {
    switch (cat) {
      case 'identity':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'voice':
        return <Sliders className="w-4 h-4 text-purple-400" />;
      case 'audience':
        return <Target className="w-4 h-4 text-amber-400" />;
      case 'design':
        return <Palette className="w-4 h-4 text-pink-400" />;
      case 'trust':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const progressPercentage = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

  return (
    <div className="space-y-6 select-text" dir="rtl">
      {/* 1. Header Progress Bar & Step Navigation */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  שאלה {currentStep.stepNumber} מתוך {totalSteps}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  {renderCategoryIcon(currentStep.category)}
                  {currentStep.categoryLabel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">
                {currentStep.title}
              </h2>
            </div>
          </div>

          {/* Quick jump or switch to tabbed view */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {onSwitchToTabs && (
              <button
                type="button"
                onClick={onSwitchToTabs}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                title="מעבר ללוח העריכה המתקדם (כל החלקים)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>לוח עריכה 360°</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl font-mono text-xs text-slate-300">
              <span className="text-[10px] text-slate-400">שלמות:</span>
              <strong className="text-emerald-400 font-bold">{completenessScore}%</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Glowing Progress Track */}
        <div className="space-y-2">
          <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 shadow-sm shadow-indigo-500/50"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Pill Indicators (Clickable) */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none pt-1">
            {STEP_DEFINITIONS.map((s, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`h-2 flex-1 rounded-full transition-all min-w-[14px] ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-pink-500 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                      : isPast
                      ? 'bg-indigo-600/60 hover:bg-indigo-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={`${s.stepNumber}. ${s.title}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Question & Interactive Form Canvas */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6">
        {/* Question Title & Subtitle */}
        <div className="space-y-2 border-b border-slate-700/60 pb-5">
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
              {currentStep.stepNumber}
            </span>
            <span>{currentStep.question}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-11">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Step-Specific Form Input Canvas */}
        <div className="space-y-6">
          {/* STEP 1: Name & Org Type */}
          {currentStep.id === 'step_identity_name' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  שם המותג או העסק <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  value={brandDna.identity.companyName}
                  onChange={(e) => updateIdentity({ companyName: e.target.value })}
                  placeholder="הזן את שם המותג..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-base text-white font-bold outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  סוג ההתאגדות והמבנה המשפטי
                </label>
                <div className="flex flex-col space-y-2">
                  {ORGANIZATION_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateIdentity({ organizationType: type })}
                      className={`w-full px-4 py-3 rounded-2xl text-xs font-bold border transition-all text-right flex items-center justify-between ${
                        brandDna.identity.organizationType === type
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-md shadow-indigo-600/10'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{type}</span>
                      {brandDna.identity.organizationType === type && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Purpose & Member Count */}
          {currentStep.id === 'step_identity_purpose' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  תכלית הפעילות ותחום העיסוק המרכזי <span className="text-pink-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={brandDna.identity.organizationPurpose}
                  onChange={(e) => updateIdentity({ organizationPurpose: e.target.value })}
                  placeholder="לדוגמה: מתן ייעוץ משכנתאות וליווי פיננסי למשפחות ומשקיעים להשגת שקט כלכלי..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl p-4 text-sm text-white outline-none transition-all leading-relaxed shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  גודל הצוות המוביל את הפעילות
                </label>
                <div className="flex flex-col space-y-2">
                  {MEMBER_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateIdentity({ memberCount: count })}
                      className={`w-full px-4 py-3 rounded-2xl text-xs font-bold border transition-all text-right flex items-center justify-between ${
                        brandDna.identity.memberCount === count
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-md'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{count}</span>
                      {brandDna.identity.memberCount === count && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Slogan & Short Vision */}
          {currentStep.id === 'step_identity_slogan' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  סלוגן מוביל וקליט <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  value={brandDna.identity.slogan}
                  onChange={(e) => updateIdentity({ slogan: e.target.value })}
                  placeholder="לדוגמה: חדשנות, איכות וצמיחה מתמדת"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-base text-white font-bold outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  תמצית חזון ומסר במשפט אחד (עד 15 מילים)
                </label>
                <input
                  type="text"
                  value={brandDna.identity.shortVision}
                  onChange={(e) => updateIdentity({ shortVision: e.target.value })}
                  placeholder="לדוגמה: שירותים דיגיטליים מתקדמים המניעים תוצאות ומעניקים שקט נפשי."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm text-slate-200 outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Vision & Logo */}
          {currentStep.id === 'step_identity_vision' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  חזון הארגון המלא והערכים המנחים
                </label>
                <textarea
                  rows={4}
                  value={brandDna.identity.companyVision}
                  onChange={(e) => updateIdentity({ companyVision: e.target.value })}
                  placeholder="פרט את החזון לטווח הארוך, המחויבות ללקוח והערך המוסף שאתם מביאים לעולם..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl p-4 text-sm text-white outline-none transition-all leading-relaxed shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  לוגו המותג (העלאת קובץ, קישור או בחירה מגלריה)
                </label>

                {brandDna.identity.logoUrl ? (
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={brandDna.identity.logoUrl}
                        alt="לוגו המותג"
                        className="w-12 h-12 object-contain bg-white/5 rounded-xl border border-slate-700/80 p-1"
                      />
                      <span className="text-xs text-slate-300 truncate max-w-xs font-mono">
                        {brandDna.identity.logoUrl.slice(0, 45)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>החלף</span>
                        <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => updateIdentity({ logoUrl: '' })}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2">
                        {isUploadingLogo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        <span>העלה קובץ לוגו ישירות</span>
                        <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                      </label>

                      <button
                        type="button"
                        onClick={handleOpenGalleryForLogo}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
                        title="פתוח למשתמשי מערכת ובעלי דייר מסונכרן"
                      >
                        <FolderOpen className="w-4 h-4 text-purple-400" />
                        <span>בחר מגלריית המדיה</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={brandDna.identity.logoUrl || ''}
                        onChange={(e) => updateIdentity({ logoUrl: e.target.value })}
                        placeholder="או הדבק כתובת אינטרנט של הלוגו (https://...)"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Voice Personality (4 Sliders) */}
          {currentStep.id === 'step_voice_personality' && (
            <div className="space-y-6">
              {[
                {
                  key: 'formality' as const,
                  label: 'רשמיות וממלכתיות',
                  minDesc: 'קליל וסחבקי (1)',
                  maxDesc: 'רשמי ומוקפד (5)',
                  val: brandDna.voice.personality.formality,
                  color: 'indigo',
                },
                {
                  key: 'warmth' as const,
                  label: 'חמימות ואמפתיה',
                  minDesc: 'ענייני ותכליתי (1)',
                  maxDesc: 'חם ומשפחתי (5)',
                  val: brandDna.voice.personality.warmth,
                  color: 'purple',
                },
                {
                  key: 'luxury' as const,
                  label: 'יוקרה ואקסקלוסיביות',
                  minDesc: 'עממי ונגיש (1)',
                  maxDesc: 'יוקרתי ופרימיום (5)',
                  val: brandDna.voice.personality.luxury,
                  color: 'pink',
                },
                {
                  key: 'energy' as const,
                  label: 'אנרגיה וקצב',
                  minDesc: 'שלו ומרגיע (1)',
                  maxDesc: 'אנרגטי וסוחף (5)',
                  val: brandDna.voice.personality.energy,
                  color: 'amber',
                },
              ].map((slider) => (
                <div key={slider.key} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">{slider.label}</span>
                    <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                      {slider.val} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={slider.val}
                    onChange={(e) =>
                      updateVoice({
                        personality: {
                          ...brandDna.voice.personality,
                          [slider.key]: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{slider.minDesc}</span>
                    <span>{slider.maxDesc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 6: Sector & Gender & Shabbat */}
          {currentStep.id === 'step_voice_sector' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  כלל לשון פנייה מועדף
                </label>
                <div className="flex flex-col space-y-2">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => updateVoice({ genderAddressing: g.id })}
                      className={`w-full p-3.5 rounded-2xl border text-right transition-all flex flex-col gap-1 ${
                        brandDna.voice.genderAddressing === g.id
                          ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{g.label}</span>
                        {brandDna.voice.genderAddressing === g.id && (
                          <Check className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  התאמה מגזרית ותרבותית
                </label>
                <div className="flex flex-col space-y-2">
                  {SECTOR_OPTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => updateVoice({ sectorCompliance: sec.id })}
                      className={`w-full px-4 py-3 rounded-2xl border text-right text-xs font-bold transition-all flex items-center justify-between ${
                        brandDna.voice.sectorCompliance === sec.id
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500 shadow-md'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{sec.label}</span>
                      {brandDna.voice.sectorCompliance === sec.id && (
                        <Check className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shabbat Observance Toggle */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">עסק שומר שבת ומועדי ישראל</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    ה-AI ימנע לחלוטין מהצעת פעילות או שליחת קמפיינים בשבתות
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateVoice({ shabbatObservant: !brandDna.voice.shabbatObservant })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    brandDna.voice.shabbatObservant ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      brandDna.voice.shabbatObservant ? '-translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Power Words & Guardrails */}
          {currentStep.id === 'step_voice_words' && (
            <div className="space-y-6">
              {/* Power words */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  מילות כוח שיווקיות (ה-AI יעדיף להשתמש בהן)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPowerWord}
                    onChange={(e) => setNewPowerWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPowerWord.trim()) {
                        e.preventDefault();
                        updateVoice({ powerWords: [...brandDna.voice.powerWords, newPowerWord.trim()] });
                        setNewPowerWord('');
                      }
                    }}
                    placeholder="הוסף מילת כוח (למשל: ביטחון, שקט נפשי)..."
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPowerWord.trim()) {
                        updateVoice({ powerWords: [...brandDna.voice.powerWords, newPowerWord.trim()] });
                        setNewPowerWord('');
                      }
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {brandDna.voice.powerWords.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>{word}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateVoice({
                            powerWords: brandDna.voice.powerWords.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-indigo-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Forbidden words */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300">
                  מילים אסורות לשימוש (Guardrails - ה-AI לעולם לא ישתמש בהן)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newForbiddenWord}
                    onChange={(e) => setNewForbiddenWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newForbiddenWord.trim()) {
                        e.preventDefault();
                        updateVoice({ forbiddenWords: [...brandDna.voice.forbiddenWords, newForbiddenWord.trim()] });
                        setNewForbiddenWord('');
                      }
                    }}
                    placeholder="הוסף מילה אסורה (למשל: זול, חלטורה, פשוט)..."
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-red-500 rounded-2xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newForbiddenWord.trim()) {
                        updateVoice({ forbiddenWords: [...brandDna.voice.forbiddenWords, newForbiddenWord.trim()] });
                        setNewForbiddenWord('');
                      }
                    }}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {brandDna.voice.forbiddenWords.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>{word}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateVoice({
                            forbiddenWords: brandDna.voice.forbiddenWords.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-red-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: UVP */}
          {currentStep.id === 'step_audience_uvp' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300">
                הצעת הערך הייחודית (Unique Value Proposition) <span className="text-pink-400">*</span>
              </label>
              <textarea
                rows={4}
                value={brandDna.audience.mainUvp}
                onChange={(e) => updateAudience({ mainUvp: e.target.value })}
                placeholder="לדוגמה: פתרון מקיף מקצה לקצה המשלב טכנולוגיה עילית עם ליווי אנושי מסור ומקצועי, המאפשר לכל לקוח ליהנות משקט נפשי מלא..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl p-4 text-sm text-white outline-none transition-all leading-relaxed shadow-inner"
              />
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300">
                💡 <strong>טיפ אסטרטגי:</strong> UVP מנצח מבהיר ללקוח תוך 5 שניות מה הרווח הישיר שלו ומדוע אתם עדיפים על כל חלופה.
              </div>
            </div>
          )}

          {/* STEP 9: Target Audiences */}
          {currentStep.id === 'step_audience_target' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300">
                קהלי יעד מוגדרים
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTargetAudience}
                  onChange={(e) => setNewTargetAudience(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTargetAudience.trim()) {
                      e.preventDefault();
                      updateAudience({ targetAudiences: [...brandDna.audience.targetAudiences, newTargetAudience.trim()] });
                      setNewTargetAudience('');
                    }
                  }}
                  placeholder="הוסף פלח קהל (למשל: בעלי עסקים קטנים, מנהלי קהילות)..."
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTargetAudience.trim()) {
                      updateAudience({ targetAudiences: [...brandDna.audience.targetAudiences, newTargetAudience.trim()] });
                      setNewTargetAudience('');
                    }
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {brandDna.audience.targetAudiences.map((aud, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{aud}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateAudience({
                          targetAudiences: brandDna.audience.targetAudiences.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-purple-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* STEP 10: Persona */}
          {currentStep.id === 'step_audience_persona' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300">
                פרסונות לקוח מרכזיות (Ideal Customer Profiles)
              </label>
              <div className="space-y-3">
                {brandDna.audience.personas.map((persona, idx) => (
                  <div key={persona.id || idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={persona.name}
                        onChange={(e) => {
                          const updated = [...brandDna.audience.personas];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateAudience({ personas: updated });
                        }}
                        placeholder="שם הפרסונה (למשל: דן, בעל עסק עצמאי)"
                        className="bg-transparent text-sm font-bold text-white border-b border-slate-700 focus:border-indigo-500 outline-none pb-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateAudience({
                            personas: brandDna.audience.personas.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">הכאב או האתגר המרכזי:</span>
                        <input
                          type="text"
                          value={persona.mainPain}
                          onChange={(e) => {
                            const updated = [...brandDna.audience.personas];
                            updated[idx] = { ...updated[idx], mainPain: e.target.value };
                            updateAudience({ personas: updated });
                          }}
                          placeholder="חוסר זמן, עומס ופיזור בין כלים..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">תוצאת החלום המבוקשת:</span>
                        <input
                          type="text"
                          value={persona.dreamOutcome}
                          onChange={(e) => {
                            const updated = [...brandDna.audience.personas];
                            updated[idx] = { ...updated[idx], dreamOutcome: e.target.value };
                            updateAudience({ personas: updated });
                          }}
                          placeholder="פלטפורמה מסודרת המניבה הכנסות בשקט..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newP: PersonaItem = {
                      id: `p-${Date.now()}`,
                      name: 'פרסונה חדשה',
                      roleOrProfile: 'פרופיל לקוח',
                      mainPain: 'אתגר מרכזי',
                      dreamOutcome: 'תוצאה רצויה',
                    };
                    updateAudience({ personas: [...brandDna.audience.personas, newP] });
                  }}
                  className="w-full py-2.5 border border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-300 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף פרסונה נוספת</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 11: Common Objections */}
          {currentStep.id === 'step_audience_objections' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300">
                מענה לחששות והתנגדויות לקוח
              </label>
              <div className="space-y-3">
                {brandDna.audience.commonObjections.map((obj, idx) => (
                  <div key={obj.id || idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400">חשש / התנגדות {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          updateAudience({
                            commonObjections: brandDna.audience.commonObjections.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <input
                        type="text"
                        value={obj.objection}
                        onChange={(e) => {
                          const updated = [...brandDna.audience.commonObjections];
                          updated[idx] = { ...updated[idx], objection: e.target.value };
                          updateAudience({ commonObjections: updated });
                        }}
                        placeholder="מהו החשש של הלקוח? (למשל: האם זה מתאים לעסק קטן?)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                      />
                      <textarea
                        rows={2}
                        value={obj.rebuttal}
                        onChange={(e) => {
                          const updated = [...brandDna.audience.commonObjections];
                          updated[idx] = { ...updated[idx], rebuttal: e.target.value };
                          updateAudience({ commonObjections: updated });
                        }}
                        placeholder="מענה המותג המרגיע (למשל: בהחלט, המערכת מודולרית וגדלה איתך...)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newO: ObjectionItem = {
                      id: `o-${Date.now()}`,
                      objection: 'חשש חדש',
                      rebuttal: 'מענה מרגיע של המותג',
                    };
                    updateAudience({ commonObjections: [...brandDna.audience.commonObjections, newO] });
                  }}
                  className="w-full py-2.5 border border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-300 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף מענה לחשש נוסף</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 12: Design Tokens */}
          {currentStep.id === 'step_design_tokens' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'צבע ראשי', key: 'primaryColor' as const, val: brandDna.designTokens.primaryColor },
                  { label: 'צבע משני', key: 'secondaryColor' as const, val: brandDna.designTokens.secondaryColor },
                  { label: 'צבע רקע', key: 'backgroundColor' as const, val: brandDna.designTokens.backgroundColor },
                  { label: 'צבע כפתור', key: 'buttonBgColor' as const, val: brandDna.designTokens.buttonBgColor },
                ].map((c) => (
                  <div key={c.key} className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5 text-center">
                    <span className="text-[11px] text-slate-400 block font-bold">{c.label}</span>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="color"
                        value={c.val}
                        onChange={(e) => updateDesignTokens({ [c.key]: e.target.value })}
                        className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-xs text-white uppercase">{c.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">גופן מוביל</label>
                  <select
                    value={brandDna.designTokens.fontFamily}
                    onChange={(e) => updateDesignTokens({ fontFamily: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Heebo, sans-serif">Heebo (מודרני ורב-תכליתי)</option>
                    <option value="Assistant, sans-serif">Assistant (נקי וקריא)</option>
                    <option value="Rubik, sans-serif">Rubik (צעיר וידידותי)</option>
                    <option value="Secular One, sans-serif">Secular One (עוצמתי לכותרות)</option>
                    <option value="'Frank Ruhl Libre', serif">Frank Ruhl Libre (אלגנטי ומסורתי)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">סגנון פינות</label>
                  <select
                    value={brandDna.designTokens.borderRadius}
                    onChange={(e) => updateDesignTokens({ borderRadius: e.target.value as BorderRadiusStyle })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="none">חד / ישר (None)</option>
                    <option value="sm">מעוגל קל (SM)</option>
                    <option value="md">מעוגל בינוני (MD)</option>
                    <option value="lg">מעוגל מודרני (LG)</option>
                    <option value="full">מעוגל מלא (Pill)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">סגנון כפתורים</label>
                  <select
                    value={brandDna.designTokens.buttonStyle}
                    onChange={(e) => updateDesignTokens({ buttonStyle: e.target.value as ButtonStyleType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="gradient">גרדיאנט זוהר (Gradient)</option>
                    <option value="solid">צבע אחיד (Solid)</option>
                    <option value="outline">מסגרת אלגנטית (Outline)</option>
                    <option value="glass">זכוכית מודרנית (Glass)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 13: Trust & Checkout */}
          {currentStep.id === 'step_trust_checkout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">ח.פ / ע.מ / מספר עמותה</label>
                  <input
                    type="text"
                    value={brandDna.trust.legalEntityId}
                    onChange={(e) => updateTrust({ legalEntityId: e.target.value })}
                    placeholder="516000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">טלפון לתמיכה ובירורים</label>
                  <input
                    type="text"
                    value={brandDna.trust.contactPhone}
                    onChange={(e) => updateTrust({ contactPhone: e.target.value })}
                    placeholder="03-1234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">כתובת דוא"ל רשמית</label>
                  <input
                    type="email"
                    value={brandDna.trust.contactEmail}
                    onChange={(e) => updateTrust({ contactEmail: e.target.value })}
                    placeholder="contact@brand.co.il"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">מספר ווטסאפ לתמיכה מהירה</label>
                  <input
                    type="text"
                    value={brandDna.trust.whatsappSupportNumber || ''}
                    onChange={(e) => updateTrust({ whatsappSupportNumber: e.target.value })}
                    placeholder="0501234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">מדיניות ביטולים והחזרים מקוצרת</label>
                <textarea
                  rows={2}
                  value={brandDna.trust.refundPolicySummary}
                  onChange={(e) => updateTrust({ refundPolicySummary: e.target.value })}
                  placeholder="החזר כספי מלא תוך 14 יום בהתאם לחוק הגנת הצרכן ללא אותיות קטנות."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">טקסט אבטחת סליקה (PCI-DSS / SSL)</label>
                <input
                  type="text"
                  value={brandDna.trust.securityBadgeText}
                  onChange={(e) => updateTrust({ securityBadgeText: e.target.value })}
                  placeholder="סליקה מאובטחת בתקן PCI-DSS ובהצפנת SSL 256-bit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. AI Assistance & Recommendation Hero Dock */}
        <div className="pt-4 border-t border-slate-700/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  סיוע מונחה AI לשלב זה
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <span className="text-[11px] text-slate-400">
                  קבל 3 הצעות מותאמות אישית עם תגית "מומלץ עבורך" עפ״י התשובות הקודמות
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestAi}
              disabled={isAiLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 shrink-0"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>מעבד ומנתח נתונים...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>✨ הצע לי רעיונות ואימות AI</span>
                </>
              )}
            </button>
          </div>

          {/* Loading Animation with Experiential Effects */}
          {isAiLoading && (
            <div className="p-6 bg-slate-950/80 border border-purple-500/30 rounded-3xl space-y-4 text-center animate-in fade-in overflow-hidden relative">
              {/* Glowing Background Waves */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 animate-pulse pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 animate-bounce">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="absolute -inset-2 rounded-3xl bg-pink-500/20 animate-ping -z-10" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-white transition-all duration-300">
                    {THINKING_MESSAGES[thinkingMsgIndex]}
                  </p>
                  <p className="text-[11px] text-purple-300/80 font-mono">
                    מצליב נתוני זהות, אופי שיווקי וקהלי יעד...
                  </p>
                </div>

                {/* Soundwave bars effect */}
                <div className="flex items-center gap-1.5 h-4 pt-1">
                  {[40, 80, 60, 100, 70, 90, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-indigo-500 to-pink-400 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Applied Notification Alert */}
          {appliedNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {/* AI Result Cards Display */}
          {aiResult && !isAiLoading && (
            <div className="space-y-3 animate-in fade-in">
              {/* AI Source Status Banner (Live Gemini API vs Offline Fallback) */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs border transition-all bg-slate-900/50 border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${aiResult.isLiveAi ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-bold text-slate-300">
                    {aiResult.isLiveAi
                      ? `✨ מענה חי מ-Google Gemini (${aiResult.liveModel || 'gemini-3.8-flash'})`
                      : '⚡ הצעות חכמות מובנות (מצב Fallback מקומי)'}
                  </span>
                </div>
                {aiResult.error && (
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    {aiResult.error}
                  </span>
                )}
              </div>

              {/* Recommendation Reason Banner */}
              {aiResult.recommendationReason && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <strong className="text-amber-300 block mb-0.5">
                      מדוע ההמלצה הזו היא המדויקת ביותר עבורך:
                    </strong>
                    <span className="text-slate-200 leading-relaxed">
                      {aiResult.recommendationReason}
                    </span>
                  </div>
                </div>
              )}

              {/* 3 Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiResult.suggestions.map((sug, sIdx) => {
                  const isRec = sIdx === aiResult.recommendedIndex || sug.isRecommended;
                  const isSelected = selectedSuggestionIdx === sIdx;
                  return (
                    <div
                      key={sIdx}
                      onClick={() => handleApplySuggestion(sug, sIdx)}
                      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 relative cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-indigo-900/60 to-purple-950/80 border-indigo-400 shadow-xl shadow-indigo-600/25 ring-2 ring-indigo-400'
                          : isRec
                          ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/40 hover:border-indigo-400'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      {isRec && (
                        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[10px] font-black shadow-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>מומלץ עבורך עפ״י הנתונים</span>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{sug.title}</span>
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">אופציה #{sIdx + 1}</span>
                        </div>
                        {sug.subtitle && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">{sug.subtitle}</p>
                        )}
                        {typeof sug.value === 'string' && (
                          <div className={`p-2.5 rounded-xl text-xs font-medium leading-relaxed ${
                            isSelected
                              ? 'bg-indigo-950/90 border border-indigo-500/50 text-white shadow-inner'
                              : 'bg-slate-950/70 border border-slate-800 text-indigo-200'
                          }`}>
                            "{sug.value}"
                          </div>
                        )}
                        {sug.rationale && (
                          <p className="text-[10px] text-slate-400/90 italic pt-1">
                            🎯 {sug.rationale}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplySuggestion(sug, sIdx);
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : isRec
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>נבחר והוחל כעת ✓</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>החל הצעה זו</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Smart strategic insight */}
              {aiResult.smartInsight && (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-2 text-slate-400 text-[11px]">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{aiResult.smartInsight}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Bottom Stepper Actions (Prev / Next / Finish) */}
        <div className="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevStep}
            disabled={currentStepIdx === 0}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold border border-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
            <span>לשאלה הקודמת</span>
          </button>

          <div className="text-center text-[11px] text-slate-400 font-medium">
            הנתונים נשמרים ומסונכרנים אוטומטית בענן וב-EventBus
          </div>

          <button
            type="button"
            onClick={goToNextStep}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStepIdx === totalSteps - 1 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
            <span>
              {currentStepIdx === totalSteps - 1 ? 'סיים שאלון ושמור DNA' : 'שמור והמשך לשאלה הבאה'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
