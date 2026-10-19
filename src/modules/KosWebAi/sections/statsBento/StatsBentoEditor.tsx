import React, { useState, useEffect, useMemo } from 'react';
import {
  StatsBentoSectionConfig,
  StatsBentoItem,
  StatsBentoLayoutPreset,
  StatsBentoViewMode,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea, resolveInputValue } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderIconPicker, DynamicIcon } from '../../ui/PageBuilderIconPicker';
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
  BarChart3,
  TrendingUp,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Sliders,
  FileText,
  Wand2,
  LayoutGrid,
  Hash,
} from 'lucide-react';

export interface StatsBentoEditorProps {
  config: StatsBentoSectionConfig;
  onChange: (updated: StatsBentoSectionConfig) => void;
  onClose?: () => void;
}

interface LayoutOptionDef {
  id: StatsBentoLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  swatches: string[];
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  cardDesc: string;
  defaultValues: Partial<StatsBentoSectionConfig>;
}

const STATS_LAYOUT_DEFINITIONS: LayoutOptionDef[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'נשי',
    title: 'א. סגנון נשי יוקרתי',
    icon: Sparkles,
    swatches: ['#f43f5e', '#fb7185', '#fff1f2', '#fda4af'],
    objectSizingDesc: 'מרווח ומאוורר (Spacious/Normal), פינות קשתיות רכות (36px)',
    buttonStyleDesc: 'קפסולה מעוגלת מלאה (Pill), רוז-גולד והילה עדינה',
    colorPaletteDesc: 'ורוד בלאש, רוז-גולד, שמנת יוקרתית והילת אור עדינה',
    cardDesc: 'כרטיסים זכוכיתיים מעוגלים ברכות, ספרות בגווני רוז ועדינות יוקרתית',
    defaultValues: {
      layout: 'feminine',
      objectScale: 'normal',
      buttonShape: 'pill',
      buttonSize: 'md',
      cardBackgroundColor: '#ffffff',
      accentColor: '#f43f5e',
      badge: '• מדדי איכות והשפעה •',
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
    cardDesc: 'כרטיסים כהים דמויי קוביות פלדה, מספרים מונוספייס בגוון לבן זוהר',
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
    swatches: ['#3b82f6', '#6366f1', '#1e1e24', '#f8fafc'],
    objectSizingDesc: 'מאוזן ונקי (Normal), פינות מעוגלות 24px',
    buttonStyleDesc: 'מעוגל קלאסי (Rounded 12px)',
    colorPaletteDesc: 'כחול אינדיגו, סגול עמוק, רקע נקי ואלגנטי',
    cardDesc: 'כרטיסי Bento מאוזנים בעיצוב היי-טק מודרני, הצללות עדינות ומספרים קריאים',
    defaultValues: {
      layout: 'standard',
      objectScale: 'normal',
      buttonShape: 'rounded',
      buttonSize: 'md',
      cardBackgroundColor: '#1e1e24',
      accentColor: '#3b82f6',
      badge: '• מדדי ביצוע מובילים •',
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
    cardDesc: 'כרטיסים הילתיים עם מעברי צבע רכים (Glow), ספרות זוהרות בהדרגה',
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
    cardDesc: 'כרטיסים חדים ללא עיגול, מסגרות ניאון זוהרות ומספרים דיגיטליים חדים',
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
    objectSizingDesc: 'מודולרי ומובנה (Normal), גריד מדדים טכני',
    buttonStyleDesc: 'מעוגל עדין (Rounded), תצוגת מספרי מפתח',
    colorPaletteDesc: 'כחול רויאל, כחול כהה פיננסי, תגיות אינדקס ותכלת מדדים',
    cardDesc: 'כרטיסי דשבורד אנליטיים עם תגיות מספור טכני (#STAT_01) ומספרים מובילים',
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

export const StatsBentoEditor: React.FC<StatsBentoEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { db } = useSystemConnection();
  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );

  // Local draft state for Dirty tracking & saving
  const [localConfig, setLocalConfig] = useState<StatsBentoSectionConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

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

  // Expanded stat item inside Accordion 4
  const [expandedStatId, setExpandedStatId] = useState<string | null>(null);

  const normalizedActiveLayout: StatsBentoLayoutPreset =
    (localConfig.layout as StatsBentoLayoutPreset) || 'standard';

  const activeLayoutDef =
    STATS_LAYOUT_DEFINITIONS.find((d) => d.id === normalizedActiveLayout) ||
    STATS_LAYOUT_DEFINITIONS[2];

  const tooltipLayoutDef =
    STATS_LAYOUT_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

  // Update handler
  const handleUpdate = (updated: Partial<StatsBentoSectionConfig>) => {
    const next = { ...localConfig, ...updated };
    setLocalConfig(next);
    setIsDirty(true);
    onChange(next);
  };

  // Layout selection
  const handleSelectLayout = (def: LayoutOptionDef) => {
    const next: StatsBentoSectionConfig = {
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

    const next: StatsBentoSectionConfig = {
      ...localConfig,
      title: companyName ? `המדדים והתוצאות של ${companyName}` : localConfig.title,
      subtitle: slogan || localConfig.subtitle,
      badge: companyName ? `• ${companyName} METRICS •` : '• מדדי ביצוע מובילים •',
      description: uvp || localConfig.description,
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

  // Stat items handlers
  const handleItemChange = (index: number, field: keyof StatsBentoItem, rawValue: any) => {
    const value =
      typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean'
        ? rawValue
        : resolveInputValue(rawValue);
    const updatedStats = [...(localConfig.stats || [])];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    handleUpdate({ stats: updatedStats });
  };

  const handleAddItem = () => {
    const newItem: StatsBentoItem = {
      id: `stat_${Date.now()}`,
      number: '100',
      prefix: '+',
      suffix: '%',
      label: 'מדד הצלחה חדש',
      description: 'הסבר קצר על מהות הנתון',
      icon: 'TrendingUp',
      color: 'indigo',
    };
    const nextStats = [...(localConfig.stats || []), newItem];
    handleUpdate({ stats: nextStats });
    setExpandedStatId(newItem.id);
  };

  const handleDeleteItem = (index: number) => {
    const nextStats = (localConfig.stats || []).filter((_, i) => i !== index);
    handleUpdate({ stats: nextStats });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const currentStats = [...(localConfig.stats || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentStats.length) return;
    const temp = currentStats[index];
    currentStats[index] = currentStats[targetIndex];
    currentStats[targetIndex] = temp;
    handleUpdate({ stats: currentStats });
  };

  return (
    <div
      className="w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right bg-[#0a0a0a] border-white/10 text-white"
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* 1. Header: Compact with Two-Letter Avatar Icon (SB), Title, Brand DNA Sync, Save Icon, and Close */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 border-white/10">
        {/* Right: Connected Two-Letter Avatar Icon (SB) + Title */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none bg-blue-500/20 text-blue-400 border-blue-500/30"
            title="Stats Bento Section Editor"
          >
            SB
          </div>

          <div className="truncate">
            <div className="text-xs sm:text-sm font-black truncate leading-tight text-white flex items-center gap-1.5">
              <span>עריכת אזור מדדים ומספרים (Stats Bento)</span>
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
                : 'border-blue-900 text-blue-400 bg-blue-950/30'
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

      {/* 2. Top Icon Menu for the 6 Visual Presets (Icons only by default, with rich interactive hover tooltip) */}
      <div className="p-2.5 mb-2.5 rounded-2xl border relative transition-all bg-[#141414] border-white/5">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>תפריט סגנונות פריסה (רחף מעל אייקון לפירוט)</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-300 border-blue-500/30">
            פעיל: {activeLayoutDef.letter}. {activeLayoutDef.shortLabel}
          </span>
        </div>

        {/* 6 Icons Row */}
        <div className="grid grid-cols-6 gap-1.5">
          {STATS_LAYOUT_DEFINITIONS.map((def) => {
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
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-md ring-1 ring-blue-500/40'
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
          <div className="mt-2 p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn shadow-xl bg-[#0d0d0d] border-blue-500/40 text-zinc-200">
            <div className="flex items-center justify-between border-b pb-1.5 border-blue-500/20">
              <span className="font-black text-blue-400 text-xs">{tooltipLayoutDef.title}</span>
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
                <strong className="text-blue-400">גודל אובייקטים: </strong>
                <span>{tooltipLayoutDef.objectSizingDesc}</span>
              </div>
              <div>
                <strong className="text-blue-400">צורת כפתורים: </strong>
                <span>{tooltipLayoutDef.buttonStyleDesc}</span>
              </div>
              <div>
                <strong className="text-blue-400">פלטת צבעים: </strong>
                <span>{tooltipLayoutDef.colorPaletteDesc}</span>
              </div>
              <div>
                <strong className="text-blue-400">סגנון כרטיסים: </strong>
                <span>{tooltipLayoutDef.cardDesc}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Five Closed-by-Default Accordions */}
      <div className="flex flex-col gap-2">
        {/* Accordion 1: סגנונות פריסה, גדלים ומבנה */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleAccordion('layout')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>1. סגנונות פריסה, גדלים ומבנה</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'layout' ? 'rotate-180 text-blue-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'layout' && (
            <div className="p-3.5 border-t border-white/10 space-y-3.5 bg-black/30">
              {/* View Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">תצורת תצוגת הכרטיסים (View Mode)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'grid-4', label: 'גריד 4 סימטרי', desc: '4 עמודות שוות' },
                    { id: 'bento-4', label: 'בנטו א-סימטרי', desc: 'כרטיס מוביל כפול' },
                    { id: 'cards-3', label: '3 כרטיסים', desc: 'היילייט רחב' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleUpdate({ viewMode: m.id as StatsBentoViewMode })}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        (localConfig.viewMode || 'grid-4') === m.id
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{m.label}</span>
                      <span className="text-[10px] opacity-75">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Object Scale */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">סקאלת גודל אובייקטים ומרווחים (Object Scale)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'קומפקטי', desc: 'טקסט צפוף וכרטיסים הדוקים' },
                    { id: 'normal', label: 'מאוזן', desc: 'סטנדרטי ומותאם למובייל' },
                    { id: 'spacious', label: 'מרווח', desc: 'ספרות ענק וכרטיסים רחבים' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleUpdate({ objectScale: s.id as any })}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        (localConfig.objectScale || 'normal') === s.id
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
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
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
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
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
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
              <FileText className="w-4 h-4 text-blue-400" />
              <span>2. כותרות, תגית עליונה והנעה לפעולה</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'headings' ? 'rotate-180 text-blue-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'headings' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <PageBuilderInput
                label="תגית עליונה (Badge)"
                value={localConfig.badge || ''}
                placeholder="למשל: • מדדי ביצוע מובילים •"
                onChange={(e) => handleUpdate({ badge: resolveInputValue(e) })}
              />

              <PageBuilderInput
                label="כותרת ראשית של האזור"
                value={localConfig.title || ''}
                placeholder="למשל: התוצאות מדברות בעד עצמן"
                onChange={(e) => handleUpdate({ title: resolveInputValue(e) })}
              />

              <PageBuilderInput
                label="תת-כותרת (Subtitle)"
                value={localConfig.subtitle || ''}
                placeholder="למשל: היקף המחקרים, הקריאות והערך המקצועי"
                onChange={(e) => handleUpdate({ subtitle: resolveInputValue(e) })}
              />

              <PageBuilderTextarea
                label="תיאור מורחב / פסקה מקדימה"
                value={localConfig.description || ''}
                rows={2}
                placeholder="הסבר על האמינות, הנתונים והמדדים..."
                onChange={(e) => handleUpdate({ description: resolveInputValue(e) })}
              />

              {/* CTA Button Settings */}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.showCtaButton)}
                    onChange={(e) => handleUpdate({ showCtaButton: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-700 bg-zinc-800"
                  />
                  <span className="text-xs font-semibold text-zinc-200">הצג כפתור הנעה לפעולה בתחתית האזור</span>
                </label>

                {localConfig.showCtaButton && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <PageBuilderInput
                      label="טקסט כפתור"
                      value={localConfig.ctaButtonText || ''}
                      placeholder="לכל הנתונים וההישגים"
                      onChange={(e) => handleUpdate({ ctaButtonText: resolveInputValue(e) })}
                    />
                    <PageBuilderInput
                      label="קישור כפתור (URL)"
                      value={localConfig.ctaButtonUrl || ''}
                      placeholder="#contact או כתובת דף"
                      onChange={(e) => handleUpdate({ ctaButtonUrl: resolveInputValue(e) })}
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
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span>3. רקע תמונה מאחורי הטקסט ואפקטי מעבר</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'textBg' ? 'rotate-180 text-blue-400' : 'text-zinc-500'
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
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-700 bg-zinc-800"
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
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
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
                        שקיפות שכבת כיסוי: {localConfig.textBgOverlayOpacity ?? 50}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localConfig.textBgOverlayOpacity ?? 50}
                        onChange={(e) => handleUpdate({ textBgOverlayOpacity: Number(e.target.value) })}
                        className="w-full accent-blue-500 mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-zinc-300">היקף תחולת רקע התמונה</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'text-card', label: 'על כרטיס הכותרת בלבד' },
                        { id: 'whole-section', label: 'על כל שטח האזור' },
                      ].map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => handleUpdate({ textBgScope: sc.id as any })}
                          className={`p-2 rounded-xl border text-center text-xs transition cursor-pointer ${
                            (localConfig.textBgScope || 'text-card') === sc.id
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
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

        {/* Accordion 4: ניהול מדדים ומספרים */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleAccordion('stats')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" />
              <span>4. ניהול מדדים ומספרים ({localConfig.stats?.length || 0})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'stats' ? 'rotate-180 text-blue-400' : 'text-zinc-500'
              }`}
            />
          </button>

          {openAccordion === 'stats' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">רשימת כרטיסי המדדים</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף מדד</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {localConfig.stats?.map((stat, idx) => {
                  const isExpanded = expandedStatId === (stat.id || String(idx));
                  return (
                    <div
                      key={stat.id || idx}
                      className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition"
                    >
                      {/* Stat Item Header */}
                      <div className="p-2.5 flex items-center justify-between gap-2 hover:bg-white/5">
                        <div
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                          onClick={() =>
                            setExpandedStatId(isExpanded ? null : stat.id || String(idx))
                          }
                        >
                          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                            <DynamicIcon name={stat.icon || 'TrendingUp'} className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex items-baseline gap-1.5 truncate">
                            <span className="text-xs font-bold text-white truncate">
                              {stat.label || `מדד #${idx + 1}`}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-blue-400" dir="ltr">
                              {stat.prefix}{stat.number}{stat.suffix}
                            </span>
                          </div>
                        </div>

                        {/* Item Quick Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItem(idx, 'up')}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="הזז למעלה"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (localConfig.stats?.length || 0) - 1}
                            onClick={() => handleMoveItem(idx, 'down')}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="הזז למטה"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-400 transition cursor-pointer"
                            title="מחק מדד"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Stat Item Expanded Content */}
                      {isExpanded && (
                        <div className="p-3 border-t border-white/10 space-y-3 bg-black/40">
                          {/* Number & Prefix/Suffix */}
                          <div className="grid grid-cols-3 gap-2">
                            <PageBuilderInput
                              label="קידומת (+, x, ₪)"
                              value={stat.prefix || ''}
                              placeholder="+"
                              onChange={(e) => handleItemChange(idx, 'prefix', resolveInputValue(e))}
                            />
                            <PageBuilderInput
                              label="מספר ראשי"
                              value={stat.number || ''}
                              placeholder="12,500"
                              onChange={(e) => handleItemChange(idx, 'number', resolveInputValue(e))}
                            />
                            <PageBuilderInput
                              label="סיומת (%, k, M)"
                              value={stat.suffix || ''}
                              placeholder="%"
                              onChange={(e) => handleItemChange(idx, 'suffix', resolveInputValue(e))}
                            />
                          </div>

                          {/* Label & Badge */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <PageBuilderInput
                              label="תווית / כותרת המדד"
                              value={stat.label || ''}
                              placeholder="משתמשים פעילים"
                              onChange={(e) => handleItemChange(idx, 'label', resolveInputValue(e))}
                            />
                            <PageBuilderInput
                              label="תגית מדד אישית (אופציונלי)"
                              value={stat.badge || ''}
                              placeholder="למשל: שיא חודשי"
                              onChange={(e) => handleItemChange(idx, 'badge', resolveInputValue(e))}
                            />
                          </div>

                          {/* Description */}
                          <PageBuilderInput
                            label="תיאור קצר מתחת למדד"
                            value={stat.description || ''}
                            placeholder="קהילה בצמיחה מתמדת..."
                            onChange={(e) => handleItemChange(idx, 'description', resolveInputValue(e))}
                          />

                          {/* Icon & Color */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <PageBuilderIconPicker
                              label="בחירת אייקון מגלריית Lucide"
                              value={stat.icon || 'TrendingUp'}
                              onChange={(name) => handleItemChange(idx, 'icon', name)}
                            />

                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-zinc-300">גוון הדגשה לכרטיס</label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[
                                  { id: 'indigo', label: 'אינדיגו', bg: 'bg-indigo-500' },
                                  { id: 'purple', label: 'סגול', bg: 'bg-purple-500' },
                                  { id: 'emerald', label: 'אזמרגד', bg: 'bg-emerald-500' },
                                  { id: 'amber', label: 'אמבר', bg: 'bg-amber-500' },
                                  { id: 'rose', label: 'רוז', bg: 'bg-rose-500' },
                                  { id: 'cyan', label: 'ציאן', bg: 'bg-cyan-500' },
                                ].map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleItemChange(idx, 'color', c.id)}
                                    className={`px-2 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                                      (stat.color || 'indigo') === c.id
                                        ? 'border-white bg-white/20 text-white font-bold'
                                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                                    <span>{c.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
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
              <Palette className="w-4 h-4 text-blue-400" />
              <span>5. צבעי מיתוג וכרטיסים</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === 'colors' ? 'rotate-180 text-blue-400' : 'text-zinc-500'
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
                  label="צבע רקע כרטיסי המדדים"
                  value={localConfig.cardBackgroundColor || '#1e1e24'}
                  onChange={(color) => handleUpdate({ cardBackgroundColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע הדגשה / Accent"
                  value={localConfig.accentColor || '#3b82f6'}
                  onChange={(color) => handleUpdate({ accentColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע כותרת ראשית"
                  value={localConfig.titleColor || '#ffffff'}
                  onChange={(color) => handleUpdate({ titleColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע תת-כותרת"
                  value={localConfig.subtitleColor || '#60a5fa'}
                  onChange={(color) => handleUpdate({ subtitleColor: color })}
                />

                <PageBuilderColorPicker
                  label="צבע תיאור מורחב"
                  value={localConfig.descriptionColor || '#94a3b8'}
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
