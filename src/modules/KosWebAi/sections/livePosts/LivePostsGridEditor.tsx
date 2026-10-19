import React, { useState, useEffect, useMemo } from 'react';
import {
  LivePostsGridSectionConfig,
  LivePostItem,
  LivePostsLayoutPreset,
  LivePostsDisplayMode,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea, resolveInputValue } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { BrandDna } from '../../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
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
  Grid,
  Calendar,
  Star,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  ArrowLeft,
  LayoutTemplate,
  List,
} from 'lucide-react';

export interface LivePostsGridEditorProps {
  config: LivePostsGridSectionConfig;
  onChange: (updated: LivePostsGridSectionConfig) => void;
  onClose?: () => void;
}

interface LayoutOptionDef {
  id: LivePostsLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  swatches: string[];
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  cardDesc: string;
  defaultValues: Partial<LivePostsGridSectionConfig>;
}

const LIVE_POSTS_LAYOUT_DEFINITIONS: LayoutOptionDef[] = [
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
    cardDesc: 'כרטיסים זכוכיתיים מעוגלים ברכות, קשתות רכות ותגיות פסטל מעוגלות',
    defaultValues: {
      layout: 'feminine',
      objectScale: 'normal',
      buttonShape: 'pill',
      buttonSize: 'md',
      cardBackgroundColor: '#ffffff',
      accentColor: '#f43f5e',
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
    cardDesc: 'כרטיסי פלדה כהים דמויי קוביות פלדה עם מסגרות כפולות וסמכותיות',
    defaultValues: {
      layout: 'masculine',
      objectScale: 'compact',
      buttonShape: 'sharp',
      buttonSize: 'md',
      cardBackgroundColor: '#0f172a',
      accentColor: '#f59e0b',
    },
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'סטנדרטי',
    title: 'ג. סגנון סטנדרטי (נוכחי) מודרני',
    icon: LayoutTemplate,
    swatches: ['#4f46e5', '#6366f1', '#1e1e24', '#f8fafc'],
    objectSizingDesc: 'מאוזן ונקי (Normal), פינות מעוגלות 24px',
    buttonStyleDesc: 'מעוגל קלאסי (Rounded 12px)',
    colorPaletteDesc: 'כחול אינדיגו, סגול עמוק, רקע נקי ואלגנטי',
    cardDesc: 'כרטיסי Notion SaaS מעוגלים ונקיים עם הצללות רכות וחלוקה אחידה',
    defaultValues: {
      layout: 'standard',
      objectScale: 'normal',
      buttonShape: 'rounded',
      buttonSize: 'md',
      cardBackgroundColor: '#ffffff',
      accentColor: '#4f46e5',
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
    cardDesc: 'כרטיסים הילתיים עם מעברי צבע רכים (Glow) ואווירת רוגע שלווה',
    defaultValues: {
      layout: 'spiritual',
      objectScale: 'large',
      buttonShape: 'pill',
      buttonSize: 'lg',
      cardBackgroundColor: '#09221d',
      accentColor: '#10b981',
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
    cardDesc: 'כרטיסים חדים ללא עיגול, מסגרות ניאון זוהרות וצל מוסט קשיח',
    defaultValues: {
      layout: 'sharp',
      objectScale: 'compact',
      buttonShape: 'sharp',
      buttonSize: 'md',
      cardBackgroundColor: '#000000',
      accentColor: '#06b6d4',
    },
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'אנליטי',
    title: 'ו. סגנון אנליטי ופיננסי (Data-First)',
    icon: Activity,
    swatches: ['#2563eb', '#0284c7', '#091528', '#38bdf8'],
    objectSizingDesc: 'מודולרי ומובנה (Normal), תצוגת מדדי קריאה',
    buttonStyleDesc: 'מעוגל עדין (Rounded), כפתור הדגשה טכני',
    colorPaletteDesc: 'כחול רויאל, כחול כהה פיננסי, תגיות אינדקס ותכלת',
    cardDesc: 'כרטיסי דשבורד אנליטיים עם זמני קריאה, מדדי אירוע וגבולות עדינים',
    defaultValues: {
      layout: 'analytical',
      objectScale: 'normal',
      buttonShape: 'rounded',
      buttonSize: 'md',
      cardBackgroundColor: '#091528',
      accentColor: '#38bdf8',
    },
  },
];

export const LivePostsGridEditor: React.FC<LivePostsGridEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { db } = useSystemConnection();
  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );

  // Local draft state for Dirty tracking & real-time preview
  const [localConfig, setLocalConfig] = useState<LivePostsGridSectionConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  // Synchronize when outer config changes ONLY if not dirty
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
          // If section has default 'standard' or missing layout, sync to tenant's preset
          if (dna.designTokens?.defaultStylePreset && (!config.layout || config.layout === 'standard')) {
            const tenantPreset = dna.designTokens.defaultStylePreset as LivePostsLayoutPreset;
            if (['feminine', 'masculine', 'standard', 'spiritual', 'sharp', 'analytical'].includes(tenantPreset)) {
              setLocalConfig((prev) => ({
                ...prev,
                layout: tenantPreset,
              }));
            }
          }
        }
      } catch {
        // ignore
      }
    }
    fetchBrand();
    return () => {
      active = false;
    };
  }, [db, effTenant, config.layout]);

  const liveBrand = useMemo(
    () => resolveLiveBrandDna(firestoreBrand, effTenant),
    [firestoreBrand, effTenant]
  );

  // Accordions: All closed by default
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Hover layout tooltip
  const [hoveredLayoutId, setHoveredLayoutId] = useState<string | null>(null);

  // Expanded post item inside Accordion 4
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const normalizedActiveLayout: LivePostsLayoutPreset =
    (localConfig.layout as LivePostsLayoutPreset) || 'standard';

  const activeLayoutDef =
    LIVE_POSTS_LAYOUT_DEFINITIONS.find((d) => d.id === normalizedActiveLayout) ||
    LIVE_POSTS_LAYOUT_DEFINITIONS[2];

  const tooltipLayoutDef =
    LIVE_POSTS_LAYOUT_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

  // Real-time update handler
  const handleUpdate = (updated: Partial<LivePostsGridSectionConfig>) => {
    const next = { ...localConfig, ...updated };
    setLocalConfig(next);
    setIsDirty(true);
    onChange(next);
  };

  // Layout selection
  const handleSelectLayout = (def: LayoutOptionDef) => {
    const next: LivePostsGridSectionConfig = {
      ...localConfig,
      ...def.defaultValues,
      layout: def.id,
    };
    setLocalConfig(next);
    setIsDirty(true);
    onChange(next);
  };

  // Brand DNA sync
  const handleSyncBrandDna = () => {
    if (!liveBrand) return;
    const companyName =
      liveBrand.identity?.companyName || (liveBrand.identity as any)?.brandName || '';
    const slogan = liveBrand.identity?.slogan || '';
    const uvp = liveBrand.audience?.mainUvp || liveBrand.identity?.companyVision || '';
    const primaryColor = liveBrand.designTokens?.primaryColor;
    const tenantPreset = (liveBrand.designTokens?.defaultStylePreset as LivePostsLayoutPreset) || 'standard';
    const whatsapp = liveBrand.trust?.whatsappSupportNumber || liveBrand.trust?.contactPhone || '';

    const next: LivePostsGridSectionConfig = {
      ...localConfig,
      title: companyName ? `עדכונים ואירועים אחרונים מ-${companyName}` : localConfig.title,
      subtitle: slogan || localConfig.subtitle,
      description: uvp || localConfig.description,
      ctaText: localConfig.ctaText || 'לכל האירועים והחדשות',
      ctaUrl: whatsapp
        ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`שלום ${companyName}, קראתי על העדכונים שלכם ואשמח לקבל פרטים נוספים`)}`
        : localConfig.ctaUrl || '#',
      layout: tenantPreset,
      accentColor: primaryColor || localConfig.accentColor,
    };

    setLocalConfig(next);
    setIsDirty(true);
    setIsBrandSynced(true);
    onChange(next);
    setTimeout(() => setIsBrandSynced(false), 3000);
  };

  // Save handler: immediate, clean, no glitching
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

  // Post Items helpers
  const handlePostChange = (index: number, field: keyof LivePostItem, rawValue: any) => {
    const value =
      typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean'
        ? rawValue
        : resolveInputValue(rawValue);
    const updatedPosts = [...(localConfig.customPages || [])];
    updatedPosts[index] = { ...updatedPosts[index], [field]: value };
    handleUpdate({ customPages: updatedPosts });
  };

  const handleAddPost = () => {
    const newPost: LivePostItem = {
      id: `post_${Date.now()}`,
      title: 'כותרת אירוע או עדכון חדש',
      excerpt: 'תקציר הידיעה, מה התחדש ומידע רלוונטי לקהילה...',
      date: 'היום',
      tag: 'אירועים',
      readTimeMinutes: 3,
      authorName: liveBrand?.identity?.companyName || 'צוות הארגון',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      linkUrl: '#',
      isFeatured: false,
    };
    const nextPosts = [...(localConfig.customPages || []), newPost];
    handleUpdate({ customPages: nextPosts });
    setExpandedPostId(newPost.id);
  };

  const handleDeletePost = (index: number) => {
    const nextPosts = (localConfig.customPages || []).filter((_, i) => i !== index);
    handleUpdate({ customPages: nextPosts });
  };

  const handleMovePost = (index: number, direction: 'up' | 'down') => {
    const current = [...(localConfig.customPages || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    handleUpdate({ customPages: current });
  };

  return (
    <div
      className="w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right bg-[#0a0a0a] border-white/10 text-white"
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* 1. Header: Compact with Two-Letter Avatar Icon (LP), Title, Brand DNA Sync, Save Icon, and Close */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 border-white/10">
        {/* Right: Connected Two-Letter Avatar Icon (LP) + Title */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            title="Live Posts Section Editor"
          >
            LP
          </div>

          <div className="truncate">
            <div className="text-xs sm:text-sm font-black truncate leading-tight text-white flex items-center gap-1.5">
              <span>עדכונים ואירועים (פוסטים)</span>
            </div>
            <div className="text-[10px] truncate leading-none mt-0.5 text-zinc-400">
              {activeLayoutDef.title}
            </div>
          </div>
        </div>

        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className={`p-1.5 rounded-full border transition hover:opacity-80 cursor-pointer ${
              isBrandSynced
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : 'border-indigo-900 text-indigo-400 bg-indigo-950/30'
            }`}
            title="סנכרן מ-Brand DNA של הטננט"
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

      {/* 2. Top Icon Menu for the 6 Visual Presets (Strictly Icons + Letters, with rich interactive hover tooltip) */}
      <div className="p-2.5 mb-2.5 rounded-2xl border relative transition-all bg-[#141414] border-white/5">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>סגנון פריסה מותג (רחף מעל אייקון לפירוט)</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
            פעיל: {activeLayoutDef.letter}. {activeLayoutDef.shortLabel}
          </span>
        </div>

        {/* 6 Icons Row */}
        <div className="grid grid-cols-6 gap-1.5">
          {LIVE_POSTS_LAYOUT_DEFINITIONS.map((def) => {
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
                  className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
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

        {/* Rich Interactive Tooltip on Hover / Focus */}
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

      {/* 3. Five Closed-by-Default Accordions */}
      <div className="flex flex-col gap-2">
        {/* Accordion 1: סגנונות פריסה, אופן תצוגה וגדלים */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleAccordion('layout')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>1. סגנונות פריסה, אופן תצוגה וגדלים</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'layout' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'layout' && (
            <div className="p-3.5 border-t border-white/10 space-y-3.5 bg-black/30">
              {/* Display Mode (4 Compact Modes with Icons) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">אופן תצוגת הפוסטים (Display Mode)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'grid', label: 'גריד עמודות', desc: '3 עמודות קלאסי', icon: Grid },
                    { id: 'carousel', label: 'קרוסלה זזה', desc: 'גלילה עם חיצים', icon: Sliders },
                    { id: 'spotlight', label: 'ספוטלייט מודגש', desc: 'פוסט ראשי גדול', icon: Star },
                    { id: 'compact-list', label: 'רשימה מהודקת', desc: 'שורות כרטיסים', icon: List },
                  ].map((m) => {
                    const ModeIcon = m.icon;
                    const isSelected = (localConfig.displayMode || 'grid') === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleUpdate({ displayMode: m.id as LivePostsDisplayMode })}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <ModeIcon className="w-4 h-4" />
                        <span className="text-xs">{m.label}</span>
                        <span className="text-[10px] opacity-75">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Object Scale */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">סקאלת גודל אובייקטים ומרווחים (Object Scale)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'קומפקטי', desc: 'כרטיסים הדוקים' },
                    { id: 'normal', label: 'מאוזן', desc: 'סטנדרטי ונקי' },
                    { id: 'large', label: 'מרווח', desc: 'כרטיסים עשירים' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleUpdate({ objectScale: s.id as any })}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        (localConfig.objectScale || 'normal') === s.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                      }`}
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
                        className={`p-1.5 rounded-lg border text-xs text-center transition cursor-pointer ${
                          (localConfig.buttonShape || 'rounded') === b.id
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">גודל כפתור הנעה לפעולה</label>
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
                        className={`p-1.5 rounded-lg border text-xs text-center transition cursor-pointer ${
                          (localConfig.buttonSize || 'md') === sz.id
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        }`}
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

        {/* Accordion 2: כותרות, תגית עליונה והנעה לפעולה */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleAccordion('headings')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>2. כותרות, תגית עליונה והנעה לפעולה</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'headings' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'headings' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <PageBuilderInput
                label="כותרת ראשית של האזור"
                value={localConfig.title || ''}
                placeholder="עדכונים ואירועים אחרונים"
                onChange={(e) => handleUpdate({ title: resolveInputValue(e) })}
              />

              <PageBuilderInput
                label="תת-כותרת / תגית"
                value={localConfig.subtitle || ''}
                placeholder="כל מה שחדש וקורה בפעילות ובקהילה"
                onChange={(e) => handleUpdate({ subtitle: resolveInputValue(e) })}
              />

              <PageBuilderTextarea
                label="תיאור מורחב / פסקה"
                value={localConfig.description || ''}
                rows={2}
                placeholder="הסבר קצר על מהות העדכונים..."
                onChange={(e) => handleUpdate({ description: resolveInputValue(e) })}
              />

              {/* CTA Button Settings */}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.showCtaButton)}
                    onChange={(e) => handleUpdate({ showCtaButton: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-700 bg-zinc-800"
                  />
                  <span className="text-xs font-semibold text-zinc-200">הצג כפתור קריאה לפעולה בתחתית</span>
                </label>

                {localConfig.showCtaButton && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <PageBuilderInput
                      label="טקסט כפתור"
                      value={localConfig.ctaText || ''}
                      placeholder="לכל האירועים והחדשות"
                      onChange={(e) => handleUpdate({ ctaText: resolveInputValue(e) })}
                    />
                    <PageBuilderInput
                      label="קישור כפתור (URL)"
                      value={localConfig.ctaUrl || ''}
                      placeholder="#contact או כתובת דף"
                      onChange={(e) => handleUpdate({ ctaUrl: resolveInputValue(e) })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: רקע תמונה מאחורי הטקסט ואפקטי מעבר */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleAccordion('textBg')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>3. רקע תמונה מאחורי הטקסט ואפקטי מעבר</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'textBg' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'textBg' && (
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
                    label="תמונת רקע אינטראקטיבית"
                    value={localConfig.textBgImageUrl || ''}
                    onChange={(url) => handleUpdate({ textBgImageUrl: url })}
                  />

                  {/* 5 Hover Effects */}
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
                          className={`p-2 rounded-xl border text-center text-xs transition cursor-pointer ${
                            (localConfig.textBgEffect || 'zoom-glow') === eff.id
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          }`}
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
                          className={`p-2 rounded-xl border text-center text-xs transition cursor-pointer ${
                            (localConfig.textBgScope || 'text-card') === sc.id
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          }`}
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

        {/* Accordion 4: ניהול פוסטים, אירועים ועדכונים */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleAccordion('posts')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>4. ניהול פוסטים ואירועים ({localConfig.customPages?.length || 0})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'posts' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'posts' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              {/* Display Metadata Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2 border-b border-white/10 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.showPostExcerpt)}
                    onChange={(e) => handleUpdate({ showPostExcerpt: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-zinc-700 bg-zinc-800"
                  />
                  <span>תקציר ידיעה</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.showPostDate)}
                    onChange={(e) => handleUpdate({ showPostDate: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-zinc-700 bg-zinc-800"
                  />
                  <span>תאריך פרסום</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.showPostTag)}
                    onChange={(e) => handleUpdate({ showPostTag: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-zinc-700 bg-zinc-800"
                  />
                  <span>תגית קטגוריה</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.showPostAuthor)}
                    onChange={(e) => handleUpdate({ showPostAuthor: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-zinc-700 bg-zinc-800"
                  />
                  <span>שם המחבר</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.showReadTime)}
                    onChange={(e) => handleUpdate({ showReadTime: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-zinc-700 bg-zinc-800"
                  />
                  <span>זמן קריאה</span>
                </label>
              </div>

              {/* Posts Header with Add Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-zinc-300">רשימת פוסטים ואירועים</span>
                <button
                  type="button"
                  onClick={handleAddPost}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף פוסט</span>
                </button>
              </div>

              {/* Posts List */}
              <div className="flex flex-col gap-2.5">
                {localConfig.customPages?.map((post, idx) => {
                  const isExpanded = expandedPostId === (post.id || String(idx));
                  return (
                    <div
                      key={post.id || idx}
                      className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition"
                    >
                      {/* Post Item Header */}
                      <div className="p-2.5 flex items-center justify-between gap-2 hover:bg-white/5">
                        <div
                          className="flex items-center gap-2 flex-1 cursor-pointer truncate"
                          onClick={() =>
                            setExpandedPostId(isExpanded ? null : post.id || String(idx))
                          }
                        >
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-white truncate">
                              {post.title || `פוסט #${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                              {post.tag && <span className="text-indigo-400">{post.tag}</span>}
                              {post.date && <span>• {post.date}</span>}
                              {post.isFeatured && (
                                <span className="text-amber-400 font-bold">★ מוביל</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMovePost(idx, 'up')}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="הזז למעלה"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (localConfig.customPages?.length || 0) - 1}
                            onClick={() => handleMovePost(idx, 'down')}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="הזז למטה"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(idx)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-400 transition cursor-pointer"
                            title="מחק פוסט"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Post Item Expanded Content */}
                      {isExpanded && (
                        <div className="p-3 border-t border-white/10 space-y-3 bg-black/40">
                          <PageBuilderInput
                            label="כותרת הפוסט / האירוע"
                            value={post.title || ''}
                            placeholder="כותרת הידיעה"
                            onChange={(e) => handlePostChange(idx, 'title', resolveInputValue(e))}
                          />

                          <PageBuilderTextarea
                            label="תקציר הידיעה"
                            value={post.excerpt || ''}
                            rows={2}
                            placeholder="תקציר קצר שיופיע בכרטיס..."
                            onChange={(e) => handlePostChange(idx, 'excerpt', resolveInputValue(e))}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <PageBuilderInput
                              label="תגית / קטגוריה"
                              value={post.tag || ''}
                              placeholder="אירועים, חדשות..."
                              onChange={(e) => handlePostChange(idx, 'tag', resolveInputValue(e))}
                            />
                            <PageBuilderInput
                              label="תאריך להצגה"
                              value={post.date || ''}
                              placeholder="היום, 15 באוגוסט..."
                              onChange={(e) => handlePostChange(idx, 'date', resolveInputValue(e))}
                            />
                            <PageBuilderInput
                              label="זמן קריאה (בדקות)"
                              value={String(post.readTimeMinutes || 3)}
                              placeholder="3"
                              onChange={(e) =>
                                handlePostChange(
                                  idx,
                                  'readTimeMinutes',
                                  parseInt(resolveInputValue(e)) || 3
                                )
                              }
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <PageBuilderInput
                              label="שם המחבר / הנהלה"
                              value={post.authorName || ''}
                              placeholder="צוות הארגון"
                              onChange={(e) =>
                                handlePostChange(idx, 'authorName', resolveInputValue(e))
                              }
                            />
                            <PageBuilderInput
                              label="קישור לכתבה / עמוד מלא"
                              value={post.linkUrl || ''}
                              placeholder="# או כתובת דף"
                              onChange={(e) => handlePostChange(idx, 'linkUrl', resolveInputValue(e))}
                            />
                          </div>

                          <PageBuilderImageUpload
                            label="תמונת פוסט ראשית"
                            value={post.imageUrl}
                            onChange={(url) => handlePostChange(idx, 'imageUrl', url)}
                          />

                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(post.isFeatured)}
                              onChange={(e) => handlePostChange(idx, 'isFeatured', e.target.checked)}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-zinc-700 bg-zinc-800"
                            />
                            <span className="text-xs font-semibold text-zinc-200">
                              סמן כפוסט מוביל (מוגדש בספוטלייט)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 5: צבעי מיתוג וכרטיסים */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleAccordion('colors')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>5. צבעי מיתוג וכרטיסים</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'colors' ? 'rotate-180 text-indigo-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'colors' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע רקע כללי של האזור"
                  value={localConfig.backgroundColor || 'transparent'}
                  onChange={(color) => handleUpdate({ backgroundColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע רקע כרטיסי הפוסטים"
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
