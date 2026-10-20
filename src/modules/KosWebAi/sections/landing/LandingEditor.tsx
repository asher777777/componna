import React, { useState, useEffect, useMemo } from 'react';
import {
  LandingSectionConfig,
  LandingLayoutPreset,
  LandingFormPosition,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea, resolveInputValue } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { ContactFormConfigEditor } from '../contact/ContactFormConfigEditor';
import { DEFAULT_LANDING_FORM_CONFIG } from './LandingFormDefaults';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { BrandDna, AiTextAssistantContract, BrandDnaContract } from '../../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import {
  Sparkles,
  Shield,
  Layers,
  Compass,
  Crosshair,
  Activity,
  Heart,
  Save,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Sliders,
  FileText,
  Wand2,
  FormInput,
  Send,
  ChevronDown,
  LayoutTemplate,
  Maximize2,
  MoveHorizontal,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  Type,
  Loader2,
  Box,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface LandingEditorProps {
  config: LandingSectionConfig;
  onChange: (updated: LandingSectionConfig) => void;
  onClose?: () => void;
}

interface LayoutOptionDef {
  id: LandingLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  swatches: string[];
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  cardDesc: string;
  defaultValues: Partial<LandingSectionConfig>;
}

const LANDING_LAYOUT_DEFINITIONS: LayoutOptionDef[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'נשי',
    title: 'א. סגנון נשי יוקרתי',
    icon: Heart,
    swatches: ['#f43f5e', '#fb7185', '#fff1f2', '#fda4af'],
    objectSizingDesc: 'מרווח ומאוורר (Spacious/Normal), פינות קשתיות רכות (36px)',
    buttonStyleDesc: 'קפסולה מעוגלת מלאה (Pill), רוז-גולד והילה עדינה',
    colorPaletteDesc: 'ורוד בלאש, רוז-גולד, שמנת יוקרתית והילת אור עדינה',
    cardDesc: 'כרטיס זכוכיתי מעוגל ברכות עם שדות קלט רכים ונעימים למגע',
    defaultValues: {
      layout: 'feminine',
      objectScale: 'normal',
      buttonShape: 'pill',
      buttonSize: 'md',
      cardBackgroundColor: '#ffffff',
      accentColor: '#f43f5e',
      badge: 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
    },
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'גברי',
    title: 'ב. סגנון גברי עוצמתי',
    icon: Shield,
    swatches: ['#09090b', '#27272a', '#f59e0b', '#10b981'],
    objectSizingDesc: 'קומפקטי וממוקד (Compact), מסגרות כפולות 2px',
    buttonStyleDesc: 'חד וישר (Sharp), פינות מודגשות ונוכחות חזקה',
    colorPaletteDesc: 'שחור עמוק, פלדה כהה, הדגשות אמבר/אזמרגד עוצמתיות',
    cardDesc: 'כרטיס פלדה כהה מודגש עם שדות מונוספייס נועזים',
    defaultValues: {
      layout: 'masculine',
      objectScale: 'compact',
      buttonShape: 'sharp',
      buttonSize: 'md',
      cardBackgroundColor: '#0f172a',
      accentColor: '#f59e0b',
      badge: '• נתוני ביצועים וחוזק •',
    },
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'סטנדרטי',
    title: 'ג. סגנון סטנדרטי (נוכחי) מודרני',
    icon: Layers,
    swatches: ['#4f46e5', '#6366f1', '#1e1e24', '#f8fafc'],
    objectSizingDesc: 'מאוזן ונקי (Normal), פינות מעוגלות 24px',
    buttonStyleDesc: 'מעוגל קלאסי (Rounded 12px)',
    colorPaletteDesc: 'כחול אינדיגו, סגול עמוק, רקע נקי ואלגנטי',
    cardDesc: 'עיצוב SaaS מודרני ונקי עם חלוקה מפוצלת מאוזנת של הטקסט והטופס',
    defaultValues: {
      layout: 'standard',
      objectScale: 'normal',
      buttonShape: 'rounded',
      buttonSize: 'md',
      cardBackgroundColor: '#ffffff',
      accentColor: '#4f46e5',
      badge: 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
    },
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'רוחני',
    title: 'ד. סגנון רוחני והוליסטי',
    icon: Compass,
    swatches: ['#10b981', '#14b8a6', '#061815', '#a7f3d0'],
    objectSizingDesc: 'מרווח ומדיטטיבי (Spacious), מעוגל 40px',
    buttonStyleDesc: 'קפסולה עוטפת (Pill), הילה פלורסנטית עדינה',
    colorPaletteDesc: 'אמרלד אזמרגד, ירוק יער עמוק, גווני מנטה ואור הילתי',
    cardDesc: 'כרטיס הילתי עם מעברי צבע רכים (Glow) ואווירה נעימה ומכילה',
    defaultValues: {
      layout: 'spiritual',
      objectScale: 'spacious',
      buttonShape: 'pill',
      buttonSize: 'lg',
      cardBackgroundColor: '#09221d',
      accentColor: '#10b981',
      badge: '• צמיחה והתפתחות •',
    },
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'חד',
    title: 'ה. סגנון חד וטכנולוגי (Cyber/Sharp)',
    icon: Crosshair,
    swatches: ['#06b6d4', '#000000', '#ef4444', '#22d3ee'],
    objectSizingDesc: 'מדויק וקומפקטי (Compact), פינות ישרות 0px',
    buttonStyleDesc: 'ישר וחד לחלוטין (Sharp), מסגרת ניאון',
    colorPaletteDesc: 'שחור מוחלט, ציאן עתידני, אדום בוהק וניגודיות שיא',
    cardDesc: 'כרטיס חד ללא עיגול, מסגרות ניאון זוהרות וטיפוגרפיה חדה',
    defaultValues: {
      layout: 'sharp',
      objectScale: 'compact',
      buttonShape: 'sharp',
      buttonSize: 'md',
      cardBackgroundColor: '#000000',
      accentColor: '#06b6d4',
      badge: '• ביצועים ותוצאות שיא •',
    },
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'אנליטי',
    title: 'ו. סגנון אנליטי ופיננסי (Data-First)',
    icon: Activity,
    swatches: ['#2563eb', '#0284c7', '#091528', '#38bdf8'],
    objectSizingDesc: 'מודולרי ומובנה (Normal), תצוגת שדות מובנית',
    buttonStyleDesc: 'מעוגל עדין (Rounded), כפתור הדגשה טכני',
    colorPaletteDesc: 'כחול רויאל, כחול כהה פיננסי, תגיות אינדקס ותכלת',
    cardDesc: 'כרטיס דשבורד מובנה עם מסגרות עדינות וקווים נקיים',
    defaultValues: {
      layout: 'analytical',
      objectScale: 'normal',
      buttonShape: 'rounded',
      buttonSize: 'md',
      cardBackgroundColor: '#091528',
      accentColor: '#38bdf8',
      badge: '• אנליטיקה ואינדקסים •',
    },
  },
];

export const LandingEditor: React.FC<LandingEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { db } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const aiAssistant = getCapability<AiTextAssistantContract>('ai-assistant');
  const rawBrandCap = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );

  // Local draft state for Dirty tracking & saving
  const [localConfig, setLocalConfig] = useState<LandingSectionConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  // AI loading per field
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

  // Synchronize when outer config changes and not dirty
  useEffect(() => {
    if (!isDirty) {
      setLocalConfig(config);
    }
  }, [config, isDirty]);

  // Firestore Brand DNA state
  const [firestoreBrand, setFirestoreBrand] = useState<BrandDna | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchBrand() {
      try {
        const dna = await loadBrandDna(db, effTenant);
        if (active && dna) {
          setFirestoreBrand(dna);
        }
      } catch {
        // ignore
      }
    }
    fetchBrand();
    return () => {
      active = false;
    };
  }, [db, effTenant]);

  const liveBrand = useMemo(
    () => resolveLiveBrandDna(firestoreBrand || rawBrandCap, effTenant),
    [firestoreBrand, rawBrandCap, effTenant]
  );

  // Nested Exclusive Accordions - ALL CLOSED BY DEFAULT
  const [openMainAccordion, setOpenMainAccordion] = useState<string | null>(null);
  const [openNestedAccordion, setOpenNestedAccordion] = useState<string | null>(null);

  const toggleMainAccordion = (id: string) => {
    setOpenMainAccordion((prev) => (prev === id ? null : id));
    setOpenNestedAccordion(null);
  };

  const toggleNestedAccordion = (id: string) => {
    setOpenNestedAccordion((prev) => (prev === id ? null : id));
  };

  // Hover layout tooltip
  const [hoveredLayoutId, setHoveredLayoutId] = useState<string | null>(null);

  const normalizedActiveLayout: LandingLayoutPreset =
    (localConfig.layout as LandingLayoutPreset) || 'standard';

  const activeLayoutDef =
    LANDING_LAYOUT_DEFINITIONS.find((d) => d.id === normalizedActiveLayout) ||
    LANDING_LAYOUT_DEFINITIONS[2];

  const tooltipLayoutDef =
    LANDING_LAYOUT_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

  // Update handler
  const handleUpdate = (updated: Partial<LandingSectionConfig>) => {
    const next = { ...localConfig, ...updated };
    setLocalConfig(next);
    setIsDirty(true);
    onChange(next);
  };

  // Layout selection
  const handleSelectLayout = (def: LayoutOptionDef) => {
    const next: LandingSectionConfig = {
      ...localConfig,
      ...def.defaultValues,
      layout: def.id,
    };
    setLocalConfig(next);
    setIsDirty(true);
    onChange(next);
  };

  // AI Text Enhancement Handler
  const handleEnhanceTextWithAi = async (
    fieldKey: 'title' | 'subtitle' | 'badge' | 'description' | 'modalButtonText' | 'buttonText',
    instruction: string
  ) => {
    if (!aiAssistant) return;
    const currentText = (localConfig as any)[fieldKey] || '';
    setAiLoadingField(fieldKey);
    try {
      const voiceHint = liveBrand?.voice?.powerWords?.slice(0, 3).join(', ') || '';
      const res = await aiAssistant.enhanceText({
        originalText: currentText,
        instruction: `${instruction}. מילות מפתח מותג: ${voiceHint}. פנייה: ${liveBrand?.voice?.genderAddressing || 'direct'}.`,
        brandDna: liveBrand,
      });
      if (res && res.text) {
        handleUpdate({ [fieldKey]: res.text });
      }
    } catch (err) {
      console.warn('AI Enhance failed:', err);
    } finally {
      setAiLoadingField(null);
    }
  };

  // Brand DNA sync
  const handleSyncBrandDna = () => {
    if (!liveBrand) return;
    const companyName =
      liveBrand.identity?.companyName || (liveBrand.identity as any)?.brandName || '';
    const slogan = liveBrand.identity?.slogan || '';
    const uvp = liveBrand.audience?.mainUvp || liveBrand.identity?.companyVision || '';
    const primaryColor = liveBrand.designTokens?.primaryColor;
    const uiVocab = liveBrand.uiVocabulary;

    const brandTitle =
      uiVocab?.sectionHeadings?.landingHeading ||
      uiVocab?.sectionHeadings?.painPointsHeading ||
      (companyName ? `השאירו פרטים לקבלת מידע נוסף מ-${companyName}` : localConfig.title);

    const brandSubtitle =
      uiVocab?.sectionHeadings?.landingSubtitle || slogan || localConfig.subtitle;

    const brandSubmitText = uiVocab?.formSubmitText || localConfig.buttonText;

    const next: LandingSectionConfig = {
      ...localConfig,
      title: brandTitle,
      subtitle: brandSubtitle,
      badge: companyName ? `• ${companyName} LEADS •` : '• קבלת מידע נוסף •',
      description: uvp || localConfig.description,
      buttonText: brandSubmitText,
      accentColor: primaryColor || localConfig.accentColor,
    };

    setLocalConfig(next);
    setIsDirty(true);
    setIsBrandSynced(true);
    onChange(next);
    setTimeout(() => setIsBrandSynced(false), 3000);
  };

  // Save handler
  const handleSave = (andClose = false) => {
    setIsSaving(true);
    onChange(localConfig);
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setIsSaving(false);
    if (andClose && onClose) {
      onClose();
    }
  };

  // Close handler with confirmation
  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
      return;
    }
    if (onClose) onClose();
  };

  return (
    <div
      className="w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right bg-[#0a0a0a] border-white/10 text-white"
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* 1. Header: Compact with Two-Letter Avatar Icon (LS), Title, Brand DNA Sync, Save Icon, and Close */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 border-white/10">
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            title="Landing Section Editor"
          >
            LS
          </div>

          <div className="truncate">
            <div className="text-xs sm:text-sm font-black truncate leading-tight text-white flex items-center gap-1.5">
              <span>דף נחיתה וטופס הרשמה (Landing Section)</span>
            </div>
            <div className="text-[10px] truncate leading-none mt-0.5 text-zinc-400">
              {activeLayoutDef.title}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className={`p-1.5 rounded-full border transition hover:opacity-80 cursor-pointer ${
              isBrandSynced
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : 'border-indigo-900 text-indigo-400 bg-indigo-950/30'
            }`}
            title="סנכרן מ-Brand DNA"
          >
            {isBrandSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                : saveSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isDirty ? 'שמור שינויים שלא נשמרו' : saveSuccess ? 'נשמר בהצלחה!' : 'שמור'}
          >
            {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className="p-1.5 rounded-full transition cursor-pointer bg-white/10 hover:bg-white/20 text-white"
              title="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Banner */}
      {showUnsavedConfirm && (
        <div className="mb-2.5 p-3 rounded-2xl border flex flex-col gap-2 animate-fadeIn bg-amber-950/40 border-amber-500/40 text-amber-200">
          <div className="text-xs font-bold">יש שינויים שלא נשמרו. מה ברצונך לעשות?</div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition cursor-pointer"
            >
              שמור וסגור
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUnsavedConfirm(false);
                if (onClose) onClose();
              }}
              className="px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50"
            >
              צא ללא שמירה
            </button>
            <button
              type="button"
              onClick={() => setShowUnsavedConfirm(false)}
              className="px-2.5 py-1 rounded-xl text-xs opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Icon Menu for the 6 Visual Presets */}
      <div className="p-2.5 mb-2.5 rounded-2xl border relative transition-all bg-[#141414] border-white/5">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>תפריט סגנונות פריסה (רחף מעל אייקון לפירוט)</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
            פעיל: {activeLayoutDef.letter}. {activeLayoutDef.shortLabel}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {LANDING_LAYOUT_DEFINITIONS.map((def) => {
            const IconComp = def.icon;
            const isSelected = normalizedActiveLayout === def.id;
            return (
              <div
                key={def.id}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredLayoutId(def.id)}
                onMouseLeave={() => setHoveredLayoutId((prev) => (prev === def.id ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => handleSelectLayout(def)}
                  onFocus={() => setHoveredLayoutId(def.id)}
                  onBlur={() => setHoveredLayoutId(null)}
                  aria-label={def.title}
                  className={clsx(
                    'w-full py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black opacity-75">{def.letter}.</span>
                    <IconComp className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-full">{def.shortLabel}</span>
                </button>
              </div>
            );
          })}
        </div>

        {tooltipLayoutDef && (
          <div className="mt-2 p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn shadow-xl bg-[#0d0d0d] border-indigo-500/40 text-zinc-200">
            <div className="flex items-center justify-between border-b pb-1.5 border-indigo-500/20">
              <span className="font-black text-indigo-400 text-xs">{tooltipLayoutDef.title}</span>
              <div className="flex items-center gap-1">
                {tooltipLayoutDef.swatches.map((hex, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-3 rounded-full border border-white/20 inline-block"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] leading-snug pt-0.5">
              <div>
                <strong className="text-indigo-400">גודל אובייקטים: </strong>
                <span>{tooltipLayoutDef.objectSizingDesc}</span>
              </div>
              <div>
                <strong className="text-indigo-400">צורת כפתורים: </strong>
                <span>{tooltipLayoutDef.buttonStyleDesc}</span>
              </div>
              <div>
                <strong className="text-indigo-400">פלטת צבעים: </strong>
                <span>{tooltipLayoutDef.colorPaletteDesc}</span>
              </div>
              <div>
                <strong className="text-indigo-400">סגנון כרטיסים: </strong>
                <span>{tooltipLayoutDef.cardDesc}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Exclusive Nested Accordions (All Closed by Default) */}
      <div className="flex flex-col gap-2">
        {/* Accordion 1: סגנונות פריסה, מיקום הטופס וגדלים */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('layout')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="הגדרות פריסה, תצוגת מודאל, מיקום כפתור ומסגרת פתוחה"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>1. סגנונות פריסה, מיקום הטופס ומסגרת (Layout & Boundary)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'layout' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'layout' && (
            <div className="p-3.5 border-t border-white/10 space-y-3.5 bg-black/30">
              {/* Unbounded section toggle */}
              <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">אזור לא תחום (Unbounded Layout)</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    הסרת מסגרת הכרטיס והצללים כדי שהאזור ישתלב ברקע העמוד באופן פתוח
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.isUnbounded)}
                    onChange={(e) => handleUpdate({ isUnbounded: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Form Placement / Position */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">מיקום תצוגת הטופס באזור (Form Placement)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'left', label: 'טופס משמאל', desc: 'מפוצל (תואם עיצוב)' },
                    { id: 'right', label: 'טופס מימין', desc: 'מפוצל הפוך' },
                    { id: 'bottom', label: 'טופס למטה', desc: 'ממורכז ומדורג' },
                    { id: 'modal', label: 'פתיחה במודאל', desc: 'קופץ בלחיצת כפתור' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => handleUpdate({ formPosition: pos.id as LandingFormPosition })}
                      className={clsx(
                        'p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-0.5',
                        (localConfig.formPosition || 'left') === pos.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <span className="text-xs">{pos.label}</span>
                      <span className="text-[10px] opacity-75">{pos.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Trigger Button Placement Options (Start, Center, End) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">מיקום כפתור הפעולה (CTA Placement)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'start', label: 'ימין (התחלה)', icon: AlignRight },
                      { id: 'center', label: 'מרכז', icon: AlignCenter },
                      { id: 'end', label: 'שמאל (סוף)', icon: AlignLeft },
                    ].map((bp) => {
                      const IconComp = bp.icon;
                      return (
                        <button
                          key={bp.id}
                          type="button"
                          onClick={() => handleUpdate({ buttonPosition: bp.id as any })}
                          className={clsx(
                            'p-2 rounded-xl border text-xs text-center transition cursor-pointer flex flex-col items-center gap-1',
                            (localConfig.buttonPosition || 'start') === bp.id
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title={`מיקום כפתור: ${bp.label}`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[10px]">{bp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">יישור טקסט ותוכן כללי</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'right', label: 'לימין', icon: AlignRight },
                      { id: 'center', label: 'מרכז', icon: AlignCenter },
                      { id: 'left', label: 'לשמאל', icon: AlignLeft },
                    ].map((ca) => {
                      const IconComp = ca.icon;
                      return (
                        <button
                          key={ca.id}
                          type="button"
                          onClick={() => handleUpdate({ contentAlignment: ca.id as any })}
                          className={clsx(
                            'p-2 rounded-xl border text-xs text-center transition cursor-pointer flex flex-col items-center gap-1',
                            (localConfig.contentAlignment || 'right') === ca.id
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title={`יישור תוכן: ${ca.label}`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[10px]">{ca.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Button Text (shown when formPosition is modal) */}
              {localConfig.formPosition === 'modal' && (
                <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-2 animate-fadeIn">
                  <div className="text-[11px] text-indigo-300 font-bold">
                    הטופס יפתח כחלון מודאל מרחף ומעוצב בסגנון המיתוג שנבחר!
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={localConfig.modalButtonText || ''}
                      onChange={(e) => handleUpdate({ modalButtonText: e.target.value })}
                      placeholder="השאירו פרטים לקבלת מידע"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleEnhanceTextWithAi('modalButtonText', 'נסח קריאה לפעולה ממירה לפתיחת טופס הרשמה במודאל')
                      }
                      disabled={aiLoadingField === 'modalButtonText'}
                      className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 cursor-pointer"
                      title="שפר טקסט כפתור באמצעות AI"
                    >
                      {aiLoadingField === 'modalButtonText' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Object Scale */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">סקאלת גודל אובייקטים ומרווחים (Object Scale)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'קומפקטי', desc: 'שדות הדוקים וצפופים' },
                    { id: 'normal', label: 'מאוזן', desc: 'סטנדרטי ומותאם למובייל' },
                    { id: 'spacious', label: 'מרווח', desc: 'שדות גדולים ומאווררים' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleUpdate({ objectScale: s.id as any })}
                      className={clsx(
                        'p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1',
                        (localConfig.objectScale || 'normal') === s.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <span className="text-xs">{s.label}</span>
                      <span className="text-[10px] opacity-75">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Shape & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">צורת כפתורים ותגיות</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'rounded', label: 'מעוגל' },
                      { id: 'pill', label: 'קפסולה' },
                      { id: 'sharp', label: 'חד 0px' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleUpdate({ buttonShape: b.id as any })}
                        className={clsx(
                          'p-1.5 rounded-lg border text-xs text-center transition cursor-pointer',
                          (localConfig.buttonShape || 'rounded') === b.id
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        )}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">גודל כפתור שליחה</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'sm', label: 'קטן' },
                      { id: 'md', label: 'בינוני' },
                      { id: 'lg', label: 'גדול' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => handleUpdate({ buttonSize: sz.id as any })}
                        className={clsx(
                          'p-1.5 rounded-lg border text-xs text-center transition cursor-pointer',
                          (localConfig.buttonSize || 'md') === sz.id
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        )}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: תוכן, טיפוגרפיה ועוזר AI (Nested Accordion) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('content_typography')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="עריכת כותרות, תיאור, פונטים וסוכן AI"
          >
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-400" />
              <span>2. תוכן, טיפוגרפיה ועוזר AI (Nested Accordion)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'content_typography' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'content_typography' && (
            <div className="p-3 border-t border-white/10 space-y-2 bg-black/40">
              {/* Nested Item 2.1: כותרת ראשית ותגית עליונה */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleNestedAccordion('title_sub')}
                  className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:bg-white/5 cursor-pointer"
                >
                  <span>כותרת ראשית, תגית עליונה ועיצוב גופן</span>
                  <ChevronDown
                    className={clsx(
                      'w-3.5 h-3.5 transition-transform',
                      openNestedAccordion === 'title_sub' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                    )}
                  />
                </button>

                {openNestedAccordion === 'title_sub' && (
                  <div className="p-3 border-t border-white/10 space-y-3 bg-black/30">
                    {/* Badge with AI button */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={localConfig.badge || ''}
                        onChange={(e) => handleUpdate({ badge: e.target.value })}
                        placeholder="תגית עליונה (באדג')..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleEnhanceTextWithAi('badge', 'נסח תגית קצרה, יוקרתית וממוקדת לדף נחיתה')
                        }
                        disabled={aiLoadingField === 'badge'}
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                        title="שפר תגית באמצעות סוכן AI"
                      >
                        {aiLoadingField === 'badge' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Title with AI button */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={localConfig.title || ''}
                        onChange={(e) => handleUpdate({ title: e.target.value })}
                        placeholder="כותרת ראשית של האזור..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleEnhanceTextWithAi('title', 'שפר והתאם את כותרת דף הנחיתה והטופס לטון המותג')
                        }
                        disabled={aiLoadingField === 'title'}
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                        title="שפר כותרת באמצעות סוכן AI"
                      >
                        {aiLoadingField === 'title' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Typography Controls - Icons & Tooltips Only */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1 flex-wrap">
                      {/* Font Size */}
                      <div className="flex items-center gap-1">
                        {(['xl', '2xl', '3xl', '4xl'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleUpdate({ titleFontSize: sz })}
                            className={clsx(
                              'px-2 py-1 rounded border text-[10px] cursor-pointer transition',
                              (localConfig.titleFontSize || '3xl') === sz
                                ? 'border-emerald-500 bg-emerald-500/30 text-white font-bold'
                                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                            )}
                            title={`גודל גופן ${sz}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>

                      {/* Weight, Italic, Underline */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate({
                              titleFontWeight:
                                localConfig.titleFontWeight === 'extrabold'
                                  ? 'bold'
                                  : localConfig.titleFontWeight === 'bold'
                                  ? 'normal'
                                  : 'extrabold',
                            })
                          }
                          className={clsx(
                            'p-1.5 rounded border text-xs cursor-pointer transition',
                            localConfig.titleFontWeight === 'extrabold' || localConfig.titleFontWeight === 'bold'
                              ? 'border-emerald-500 bg-emerald-500/30 text-white'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title="משקל גופן (עבה/רגיל)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdate({ titleItalic: !localConfig.titleItalic })}
                          className={clsx(
                            'p-1.5 rounded border text-xs cursor-pointer transition',
                            localConfig.titleItalic
                              ? 'border-emerald-500 bg-emerald-500/30 text-white'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title="נטוי (Italic)"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdate({ titleUnderline: !localConfig.titleUnderline })}
                          className={clsx(
                            'p-1.5 rounded border text-xs cursor-pointer transition',
                            localConfig.titleUnderline
                              ? 'border-emerald-500 bg-emerald-500/30 text-white'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title="קו תחתון"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title Alignment */}
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'right', icon: AlignRight, title: 'יישור לימין' },
                          { id: 'center', icon: AlignCenter, title: 'יישור למרכז' },
                          { id: 'left', icon: AlignLeft, title: 'יישור לשמאל' },
                        ].map((al) => {
                          const IconComp = al.icon;
                          return (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() => handleUpdate({ titleAlignment: al.id as any })}
                              className={clsx(
                                'p-1.5 rounded border text-xs cursor-pointer transition',
                                (localConfig.titleAlignment || 'right') === al.id
                                  ? 'border-emerald-500 bg-emerald-500/30 text-white'
                                  : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                              )}
                              title={al.title}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nested Item 2.2: תת-כותרת ותיאור מורחב */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleNestedAccordion('subtitle_desc')}
                  className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:bg-white/5 cursor-pointer"
                >
                  <span>תת-כותרת, תיאור מורחב וכפתור שליחה</span>
                  <ChevronDown
                    className={clsx(
                      'w-3.5 h-3.5 transition-transform',
                      openNestedAccordion === 'subtitle_desc' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                    )}
                  />
                </button>

                {openNestedAccordion === 'subtitle_desc' && (
                  <div className="p-3 border-t border-white/10 space-y-3 bg-black/30">
                    {/* Subtitle with AI button */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={localConfig.subtitle || ''}
                        onChange={(e) => handleUpdate({ subtitle: e.target.value })}
                        placeholder="תת-כותרת..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleEnhanceTextWithAi('subtitle', 'נסח תת-כותרת ממוקדת ומזמינה להשארת פרטים')
                        }
                        disabled={aiLoadingField === 'subtitle'}
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                        title="שפר תת-כותרת באמצעות סוכן AI"
                      >
                        {aiLoadingField === 'subtitle' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Description with AI button */}
                    <div className="flex items-center gap-1.5">
                      <textarea
                        rows={2}
                        value={localConfig.description || ''}
                        onChange={(e) => handleUpdate({ description: e.target.value })}
                        placeholder="תיאור מורחב / פסקה מקדימה..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleEnhanceTextWithAi('description', 'הרחב את פסקת ההסבר של דף הנחיתה תוך שמירה על עניין והנעה לפעולה')
                        }
                        disabled={aiLoadingField === 'description'}
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer shrink-0"
                        title="שפר תיאור באמצעות סוכן AI"
                      >
                        {aiLoadingField === 'description' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Button text with AI button */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={localConfig.buttonText || ''}
                        onChange={(e) => handleUpdate({ buttonText: e.target.value })}
                        placeholder="טקסט כפתור שליחה..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleEnhanceTextWithAi('buttonText', 'נסח קריאה לפעולה מדויקת וקצרה לכפתור שליחת פרטים')
                        }
                        disabled={aiLoadingField === 'buttonText'}
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                        title="שפר טקסט כפתור באמצעות סוכן AI"
                      >
                        {aiLoadingField === 'buttonText' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: תמונה, גלישה מעבר למסגרת (Overlapping Image) ומדיה מ-KOSCLOUD */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('image_overflow')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="תמונה ראשית, גלישה מעבר למסגרת ופינות מעוגלות"
          >
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>3. תמונה, פריצה ממסגרת (Image Overflow) ומדיה</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'image_overflow' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'image_overflow' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <PageBuilderImageUpload
                label="תמונה נלווית לצד הטופס (אך ורק מתוך KOSCLOUD)"
                value={localConfig.imageSrc}
                onChange={(url) => handleUpdate({ imageSrc: url })}
              />

              {localConfig.imageSrc && (
                <>
                  {/* Image Overflow Toggle */}
                  <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">תמונה שיוצאת מהמסגרת (Overlapping Image)</span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        מאפשר לתמונה לפרוץ קלות מקווי המסגרת עם צל תלת-ממדי והילה עשירה
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(localConfig.imageOverflow)}
                        onChange={(e) => handleUpdate({ imageOverflow: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {localConfig.imageOverflow && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-300">כיוון פריצה מהמסגרת</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'top', label: 'כלפי מעלה' },
                            { id: 'bottom', label: 'כלפי מטה' },
                            { id: 'side', label: 'לצדדים' },
                            { id: 'both', label: 'משולב (מעלה+צד)' },
                          ].map((dir) => (
                            <button
                              key={dir.id}
                              type="button"
                              onClick={() => handleUpdate({ imageOverflowOffset: dir.id as any })}
                              className={clsx(
                                'p-2 rounded-xl border text-xs text-center transition cursor-pointer',
                                (localConfig.imageOverflowOffset || 'side') === dir.id
                                  ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                                  : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                              )}
                            >
                              {dir.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-300">עיגול פינות התמונה</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'none', label: 'ישר 0px' },
                            { id: 'md', label: 'מעוגל עדין' },
                            { id: '2xl', label: 'מעוגל עשיר' },
                            { id: 'full', label: 'קפסולה' },
                          ].map((rad) => (
                            <button
                              key={rad.id}
                              type="button"
                              onClick={() => handleUpdate({ imageBorderRadius: rad.id as any })}
                              className={clsx(
                                'p-2 rounded-xl border text-xs text-center transition cursor-pointer',
                                (localConfig.imageBorderRadius || '2xl') === rad.id
                                  ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                                  : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                              )}
                            >
                              {rad.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Accordion 4: רקע תמונה אינטראקטיבי מאחורי הטקסט */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('textBg')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="רקע תמונה מרחף ואפקטי זום"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>4. רקע תמונה מאחורי הטקסט ואפקטי מעבר</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'textBg' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'textBg' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(localConfig.textBgEnabled)}
                  onChange={(e) => handleUpdate({ textBgEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-700 bg-zinc-800"
                />
                <span className="text-xs font-semibold text-zinc-200">הפעל רקע תמונה אינטראקטיבי</span>
              </label>

              {localConfig.textBgEnabled && (
                <>
                  <PageBuilderImageUpload
                    label="תמונת רקע אינטראקטיבית (KOSCLOUD בלבד)"
                    value={localConfig.textBgImageUrl || ''}
                    onChange={(url) => handleUpdate({ textBgImageUrl: url })}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-300">אפקט מעבר מרחף (Hover Effect)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {[
                        { id: 'zoom-glow', label: 'זום והילה (Zoom Glow)' },
                        { id: 'shimmer-sweep', label: 'ברק חולף (Shimmer)' },
                        { id: 'float-parallax', label: 'ריחוף קל (Float)' },
                        { id: 'blur-reveal', label: 'מטושטש לחד (Blur)' },
                        { id: 'gradient-shift', label: 'מעבר צבע (Shift)' },
                      ].map((eff) => (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() => handleUpdate({ textBgEffect: eff.id as HeroTextBgEffect })}
                          className={clsx(
                            'p-2 rounded-xl border text-center text-xs transition cursor-pointer',
                            (localConfig.textBgEffect || 'zoom-glow') === eff.id
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                        >
                          {eff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <PageBuilderColorPicker
                      label="צבע שכבת כיסוי (Overlay Color)"
                      value={localConfig.textBgOverlayColor || '#000000'}
                      onChange={(color) => handleUpdate({ textBgOverlayColor: color })}
                    />

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-zinc-300">
                        שקיפות שכבת כיסוי: {localConfig.textBgOverlayOpacity ?? 60}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localConfig.textBgOverlayOpacity ?? 60}
                        onChange={(e) => handleUpdate({ textBgOverlayOpacity: Number(e.target.value) })}
                        className="w-full accent-indigo-500 mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-zinc-300">היקף תחולת רקע התמונה</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'text-card', label: 'על כרטיס האזור בלבד' },
                        { id: 'whole-section', label: 'על כל שטח האזור' },
                      ].map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => handleUpdate({ textBgScope: sc.id as any })}
                          className={clsx(
                            'p-2 rounded-xl border text-center text-xs transition cursor-pointer',
                            (localConfig.textBgScope || 'text-card') === sc.id
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Accordion 5: עריכת טופס KFS, שדות וסליקה (Form Config Contract Monopoly) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('form')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="עריכת טופס KFS, שדות, סליקה והודעות WhatsApp"
          >
            <div className="flex items-center gap-2">
              <FormInput className="w-4 h-4 text-indigo-400" />
              <span>5. עריכת טופס KFS, שדות, סליקה והודעות WhatsApp</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'form' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'form' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
              <ContactFormConfigEditor
                value={
                  typeof localConfig.form === 'object' && localConfig.form
                    ? localConfig.form
                    : DEFAULT_LANDING_FORM_CONFIG
                }
                formId={localConfig.formId}
                onFormIdChange={(id) => handleUpdate({ formId: id })}
                onChange={(formConfig) => handleUpdate({ form: formConfig })}
              />
            </div>
          )}
        </div>

        {/* Accordion 6: צבעי מיתוג וכרטיסים */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('colors')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="צבעי רקע ופלטת מיתוג"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>6. צבעי מיתוג וכרטיסים</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'colors' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'colors' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע רקע כללי של האזור"
                  value={localConfig.backgroundColor || 'transparent'}
                  onChange={(color) => handleUpdate({ backgroundColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע רקע כרטיס הטופס"
                  value={localConfig.cardBackgroundColor || ''}
                  onChange={(color) => handleUpdate({ cardBackgroundColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע הדגשה / Accent"
                  value={localConfig.accentColor || '#4f46e5'}
                  onChange={(color) => handleUpdate({ accentColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע כותרת ראשית"
                  value={localConfig.titleColor || ''}
                  onChange={(color) => handleUpdate({ titleColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע תת-כותרת"
                  value={localConfig.subtitleColor || ''}
                  onChange={(color) => handleUpdate({ subtitleColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע תיאור מורחב"
                  value={localConfig.descriptionColor || ''}
                  onChange={(color) => handleUpdate({ descriptionColor: color })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
