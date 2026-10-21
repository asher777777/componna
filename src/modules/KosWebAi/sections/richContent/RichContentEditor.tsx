import { clsx } from 'clsx';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RichContentSectionConfig,
  RichContentItem,
  RichContentLayoutPreset,
  RichContentDisplayMode,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderIconPicker, DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { RichContentWysiwygEditor } from './RichContentWysiwygEditor';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { BrandDna } from '../../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import {
  Save,
  X,
  ChevronDown,
  Sparkles,
  Palette,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  BarChart3,
  Layers,
  Wand2,
  Info,
  Plus,
  Trash2,
  Quote,
  Compass,
  Milestone,
  Check,
  Columns,
  Grid,
  Split,
  Box,
  Maximize2,
  AlignRight,
  AlignCenter,
  Sliders,
  Square,
  Circle,
} from 'lucide-react';

interface RichContentEditorProps {
  config: RichContentSectionConfig;
  onChange: (config: RichContentSectionConfig) => void;
  onClose?: () => void;
  isDarkMode?: boolean;
}

interface PresetDefinition {
  id: RichContentLayoutPreset;
  letter: string;
  name: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
}

const PRESET_DEFINITIONS: PresetDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    name: 'סגנון נשי',
    subtitle: 'קווים מעוגלים, רוז-גולד, קשתות אלגנטיות ורוך ויזואלי',
    icon: Heart,
    accentColor: '#f43f5e',
  },
  {
    id: 'masculine',
    letter: 'ב',
    name: 'סגנון גברי',
    subtitle: 'כותרות ענק דרמטיות, שחור-פחם, זהב מתכתי וכרטיסי פלדה',
    icon: Shield,
    accentColor: '#f59e0b',
  },
  {
    id: 'standard',
    letter: 'ג',
    name: 'סגנון עכשווי',
    subtitle: 'עיצוב SaaS 2026 נקי, אינדיגו וסלייט, מאוזן ואיכותי',
    icon: LayoutTemplate,
    accentColor: '#6366f1',
  },
  {
    id: 'spiritual',
    letter: 'ד',
    name: 'סגנון רוחני',
    subtitle: 'ירוק מרווה וטורקיז עמוק, זהב חם ואווירת עומק והשראה',
    icon: Sun,
    accentColor: '#0d9488',
  },
  {
    id: 'sharp',
    letter: 'ה',
    name: 'סגנון חד (הייטק)',
    subtitle: 'טיפוגרפיה חדה, פינות ישרות, ניגודיות שחור-לבן מינימליסטית',
    icon: Crosshair,
    accentColor: '#ffffff',
  },
  {
    id: 'analytical',
    letter: 'ו',
    name: 'סגנון אנליטי',
    subtitle: 'אלמנטים עתידניים, ניאון ציאן, מסגרות HUD ודגש על נתונים',
    icon: BarChart3,
    accentColor: '#06b6d4',
  },
];

interface ContentLayoutOption {
  id: RichContentDisplayMode;
  name: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}

const CONTENT_LAYOUT_OPTIONS: ContentLayoutOption[] = [
  {
    id: 'standard',
    name: 'קלאסי מאוזן',
    desc: 'כותרת, גוף טקסט מעוצב ותמונת נושא לצד התוכן',
    icon: LayoutTemplate,
  },
  {
    id: 'split-story',
    name: 'סיפור מפוצל',
    desc: 'עמודת חזון נרחבת לצד תמונת פורטרט גדולה עם חותמת חזון צפה',
    icon: Split,
  },
  {
    id: 'quote-hero',
    name: 'ציטוט חזון מרכזי',
    desc: 'משפט חזון ענק ממורכז עם מרכאות השראה ועמודי תווך מתחתיו',
    icon: Quote,
  },
  {
    id: 'timeline-vision',
    name: 'ציר זמן ואבני דרך',
    desc: 'מפת דרכים ויזואלית: יסודות, צמיחה וחזון העתיד',
    icon: Milestone,
  },
  {
    id: 'bento-about',
    name: 'בנטו אודות וחזון',
    desc: 'פריסת Bento Grid מודרנית עם כרטיס חזון ראשי, תמונה וערכים',
    icon: Box,
  },
  {
    id: 'two-columns',
    name: 'שני טורים',
    desc: 'חלוקת גוף התוכן לשני טורי קריאה אלגנטיים בסגנון מגזין',
    icon: Columns,
  },
  {
    id: 'highlight-box',
    name: 'תיבת הדגשה מוארת',
    desc: 'כרטיס זכוכית מעוצב עם רקע ייחודי, מסגרת זוהרת וריפוד עשיר',
    icon: Layers,
  },
  {
    id: 'cards-grid-3',
    name: 'רשת 3 עמודי תווך',
    desc: 'רשת 3 כרטיסי ערכים ועקרונות פעולה מתחת לגוף התוכן',
    icon: Grid,
  },
  {
    id: 'cards-grid-2',
    name: 'רשת 2 כרטיסים',
    desc: 'זוג כרטיסים רחבים להבלטת מטרות מרכזיות',
    icon: Grid,
  },
];

export const RichContentEditor: React.FC<RichContentEditorProps> = ({
  config,
  onChange,
  onClose,
  isDarkMode = true,
}) => {
  // Local state draft to prevent jumping
  const [localConfig, setLocalConfig] = useState<RichContentSectionConfig>(() => ({
    ...config,
    contentLayout: config.contentLayout || (
      config.layout === 'split-story' ||
      config.layout === 'quote-hero' ||
      config.layout === 'timeline-vision' ||
      config.layout === 'bento-about' ||
      config.layout === 'two-columns' ||
      config.layout === 'highlight-box' ||
      config.layout === 'cards-grid-3' ||
      config.layout === 'cards-grid-2'
        ? config.layout
        : 'standard'
    ),
  }));

  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const [hoveredLayout, setHoveredLayout] = useState<string | null>(null);

  // Firestore & Brand DNA Sync
  const { db } = useSystemConnection();
  const effTenant = resolveCurrentTenantId() || ROOT_TENANT_ID;
  const [firestoreBrand, setFirestoreBrand] = useState<BrandDna | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const dna = await loadBrandDna(db, effTenant);
        if (active && dna) {
          setFirestoreBrand(dna);
          // Auto-sync preset if default/standard
          if (dna.designTokens?.defaultStylePreset && (!config.layout || config.layout === 'standard')) {
            const tenantPreset = dna.designTokens.defaultStylePreset as RichContentLayoutPreset;
            setLocalConfig((prev) => ({
              ...prev,
              layout: tenantPreset,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load Brand DNA for richContent:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [db, effTenant]);

  const liveBrand = useMemo(
    () => resolveLiveBrandDna(firestoreBrand, effTenant),
    [firestoreBrand, effTenant]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdate = <K extends keyof RichContentSectionConfig>(
    key: K,
    val: RichContentSectionConfig[K]
  ) => {
    setLocalConfig((prev) => {
      const next = { ...prev, [key]: val };
      onChange(next);
      return next;
    });
    setIsDirty(true);
  };

  const handlePatch = (patch: Partial<RichContentSectionConfig>) => {
    setLocalConfig((prev) => {
      const next = { ...prev, ...patch };
      onChange(next);
      return next;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    onChange(localConfig);
    setIsDirty(false);
    setSaveSuccess(true);
    showToast('הגדרות אודות והחזון נשמרו בהצלחה!');
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleRequestClose = () => {
    if (!onClose) return;
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Full synchronization from Brand DNA (Vision, Slogan, Purpose, Colors, Preset)
  const handleSyncFromBrandDna = () => {
    if (!liveBrand) {
      showToast('לא נמצאו נתוני מיתוג עבור הטננט');
      return;
    }

    const companyName = liveBrand.identity?.companyName || '';
    const companyVision = liveBrand.identity?.companyVision || '';
    const shortVision = liveBrand.identity?.shortVision || '';
    const orgPurpose = liveBrand.identity?.organizationPurpose || '';
    const slogan = liveBrand.identity?.slogan || '';
    const uvp = liveBrand.audience?.mainUvp || '';
    const tenantPreset = liveBrand.designTokens?.defaultStylePreset as RichContentLayoutPreset;

    const visionParagraph = companyVision || shortVision || orgPurpose;
    const purposeParagraph = orgPurpose || uvp;

    const bodyParts: string[] = [];
    if (visionParagraph) {
      bodyParts.push(`<p class="text-lg font-semibold leading-relaxed"><strong>החזון שלנו:</strong> ${visionParagraph}</p>`);
    }
    if (purposeParagraph && purposeParagraph !== visionParagraph) {
      bodyParts.push(`<p class="leading-relaxed">${purposeParagraph}</p>`);
    }
    if (slogan) {
      bodyParts.push(`<blockquote class="border-r-4 border-amber-500 pr-4 italic my-3 text-slate-300">״${slogan}״</blockquote>`);
    }

    const updated: RichContentSectionConfig = {
      ...localConfig,
      heading: companyName ? `אודות ${companyName}` : (localConfig.heading || 'אודות והחזון שלנו'),
      subtitle: shortVision || slogan || 'החזון והשליחות שלנו',
      body: bodyParts.length > 0 ? bodyParts.join('') : localConfig.body,
      layout: tenantPreset || localConfig.layout || 'standard',
      primaryButtonColor: liveBrand.designTokens?.primaryColor || localConfig.primaryButtonColor,
      headingColor: liveBrand.designTokens?.textColorH1 || localConfig.headingColor,
      bodyColor: liveBrand.designTokens?.textColor || localConfig.bodyColor,
    };

    setLocalConfig(updated);
    setIsDirty(true);
    onChange(updated);
    showToast('התוכן, הכותרת והחזון סונכרנו בהצלחה עם ה-Brand DNA!');
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Items Management (Pillars / Timeline steps)
  const items = localConfig.items || [];
  const handleAddItem = () => {
    const newItem: RichContentItem = {
      id: `pillar_${Date.now()}`,
      title: 'ערך או עמוד תווך חדש',
      text: 'פירוט החשיבות, העשייה והשליחות מאחורי ערך זה...',
      icon: 'Sparkles',
    };
    handleUpdate('items', [...items, newItem]);
  };

  const handleUpdateItem = (idx: number, patch: Partial<RichContentItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    handleUpdate('items', next);
  };

  const handleRemoveItem = (idx: number) => {
    handleUpdate(
      'items',
      items.filter((_, i) => i !== idx)
    );
  };

  const activePreset = localConfig.layout || 'standard';
  const activeContentMode: RichContentDisplayMode =
    localConfig.contentLayout ||
    (activePreset === 'split-story' ||
    activePreset === 'quote-hero' ||
    activePreset === 'timeline-vision' ||
    activePreset === 'bento-about' ||
    activePreset === 'two-columns' ||
    activePreset === 'highlight-box' ||
    activePreset === 'cards-grid-3' ||
    activePreset === 'cards-grid-2'
      ? activePreset
      : 'standard');

  const hoveredPresetDef = PRESET_DEFINITIONS.find((p) => p.id === hoveredPreset);
  const hoveredLayoutDef = CONTENT_LAYOUT_OPTIONS.find((l) => l.id === hoveredLayout);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] bg-[#0a0a0a] border border-[#262626] shadow-2xl flex flex-col overflow-hidden text-right font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xl animate-in slide-in-from-top duration-200">
            {toastMessage}
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#262626] bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  הגדרות אודות והחזון שלנו
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  richContent
                </span>
                {liveBrand?.identity?.companyName && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                    מסונכרן עם חזון {liveBrand.identity.companyName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                עורך תוכן עשיר WYSIWYG, פריסות תוכן מתקדמות ושכתוב AI מחובר לחזון
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Restore from Brand DNA Button */}
            <button
              type="button"
              onClick={handleSyncFromBrandDna}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              title="סנכרן את הכותרות, החזון והסגנון מתוך ה-Brand DNA"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>שחזר מחזון המותג</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : isDirty
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 animate-pulse'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'נשמר בהצלחה!' : 'שמירה'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleRequestClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Accordions Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar">
          {/* ACCORDION 1: Layouts & Display Modes */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleAccordion('layouts')}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LayoutTemplate className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">
                  סגנונות פריסה, אופן תצוגת תוכן וגדלים
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {PRESET_DEFINITIONS.find((p) => p.id === activePreset)?.name || 'סטנדרטי'} •{' '}
                  {CONTENT_LAYOUT_OPTIONS.find((l) => l.id === activeContentMode)?.name || 'קלאסי'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'layouts' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'layouts' && (
              <div className="p-4 sm:p-6 border-t border-[#262626] space-y-6 bg-[#0f0f0f]">
                {/* 1.1 Brand Style Presets (6 Presets) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      סגנון מיתוג עיצובי (Brand Presets):
                    </label>
                    {hoveredPresetDef && (
                      <span className="text-[11px] text-amber-400 font-semibold animate-in fade-in duration-150">
                        {hoveredPresetDef.name} — {hoveredPresetDef.subtitle}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_DEFINITIONS.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleUpdate('layout', preset.id)}
                          onMouseEnter={() => setHoveredPreset(preset.id)}
                          onMouseLeave={() => setHoveredPreset(null)}
                          className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/10'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-bold text-xs">
                            {preset.letter}
                          </div>
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px] font-bold text-center leading-tight">
                            {preset.name.replace('סגנון ', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Content Layout Modes (9 Variations for About & Vision) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      פריסת תוכן החזון והאודות (Content Layout):
                    </label>
                    {hoveredLayoutDef && (
                      <span className="text-[11px] text-cyan-400 font-semibold animate-in fade-in duration-150">
                        {hoveredLayoutDef.name} — {hoveredLayoutDef.desc}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {CONTENT_LAYOUT_OPTIONS.map((layout) => {
                      const Icon = layout.icon;
                      const isSelected = activeContentMode === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => handleUpdate('contentLayout', layout.id)}
                          onMouseEnter={() => setHoveredLayout(layout.id)}
                          onMouseLeave={() => setHoveredLayout(null)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px] font-bold text-center leading-tight">
                            {layout.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.3 Object Scale, Button Shape, Button Size & Image Placement */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      קנה מידה וטיפוגרפיה:
                    </label>
                    <select
                      value={localConfig.objectScale || 'normal'}
                      onChange={(e) => handleUpdate('objectScale', e.target.value as any)}
                      className="w-full bg-[#161619] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="compact">קומפקטי (Compact)</option>
                      <option value="normal">רגיל (Normal)</option>
                      <option value="large">גדול ומודגש (Large)</option>
                      <option value="massive">ענק (Massive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      צורת כפתורים:
                    </label>
                    <select
                      value={localConfig.buttonShape || 'auto'}
                      onChange={(e) => handleUpdate('buttonShape', e.target.value as any)}
                      className="w-full bg-[#161619] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="auto">אוטומטי (לפי המיתוג)</option>
                      <option value="pill">קפסולה עגולה (Pill)</option>
                      <option value="rounded">מעוגל מודרני (Rounded)</option>
                      <option value="sharp">חד (Sharp)</option>
                      <option value="chiseled">משופע (Chiseled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      מיקום תמונת נושא:
                    </label>
                    <select
                      value={localConfig.imagePosition || 'auto'}
                      onChange={(e) => handleUpdate('imagePosition', e.target.value as any)}
                      className="w-full bg-[#161619] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="auto">אוטומטי (לפי הפריסה)</option>
                      <option value="left">משמאל לטקסט</option>
                      <option value="right">מימין לטקסט</option>
                      <option value="top">מעל הטקסט</option>
                      <option value="bottom">מתחת לטקסט</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: Headings, WYSIWYG & AI Rewrite */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleAccordion('content')}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">
                  כותרות, עורך תוכן WYSIWYG ושכתוב AI
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  WYSIWYG 2026
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'content' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'content' && (
              <div className="p-4 sm:p-6 border-t border-[#262626] space-y-5 bg-[#0f0f0f]">
                {/* Heading & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      כותרת ראשית:
                    </label>
                    <input
                      type="text"
                      value={localConfig.heading || ''}
                      onChange={(e) => handleUpdate('heading', e.target.value)}
                      placeholder="אודות והחזון שלנו"
                      className="w-full bg-[#161619] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      תת כותרת (תגית עליונה):
                    </label>
                    <input
                      type="text"
                      value={localConfig.subtitle || ''}
                      onChange={(e) => handleUpdate('subtitle', e.target.value)}
                      placeholder="השליחות, הערכים והשאיפה למצוינות"
                      className="w-full bg-[#161619] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* WYSIWYG Rich Editor Canvas */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    גוף התוכן והחזון (עריכה ויזואלית עשירה):
                  </label>
                  <RichContentWysiwygEditor
                    value={localConfig.body || ''}
                    onChange={(html) => handleUpdate('body', html)}
                    brandDna={liveBrand}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    תמונת נושא / אודות:
                  </label>
                  <PageBuilderImageUpload
                    value={localConfig.imageSrc || ''}
                    onChange={(url) => handleUpdate('imageSrc', url)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 3: Pillars & Timeline Items */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleAccordion('items')}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  עמודי תווך, ערכים ואבני דרך
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {items.length} פריטים
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'items' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'items' && (
              <div className="p-4 sm:p-6 border-t border-[#262626] space-y-4 bg-[#0f0f0f]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    פריטים אלו מוצגים ככרטיסי ערכים ברשת, שלבים בציר הזמן או קוביות בנטו:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף עמוד תווך</span>
                  </button>
                </div>

                {/* Milestone Cards Visual Presentation Toolbar */}
                <div className="p-3.5 rounded-2xl bg-[#141417] border border-white/10 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Icon Position Controls */}
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => handleUpdate('cardIconPosition', 'side')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-all cursor-pointer',
                          (localConfig.cardIconPosition || 'side') === 'side'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                        title="איקון לצד הכותרת (אופקי)"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate('cardIconPosition', 'top')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-all cursor-pointer',
                          localConfig.cardIconPosition === 'top'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                        title="איקון מעל הכותרת (מיושר לימין)"
                      >
                        <Columns className="w-4 h-4 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate('cardIconPosition', 'top-center')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-all cursor-pointer',
                          localConfig.cardIconPosition === 'top-center'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                        title="איקון מעל הכותרת (מרכז)"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Asymmetric Grid Stagger Toggle */}
                    <button
                      type="button"
                      onClick={() => handleUpdate('isAsymmetricGrid', !localConfig.isAsymmetricGrid)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                        localConfig.isAsymmetricGrid
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                          : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                      )}
                      title="פריסה א-סימטרית מדורגת (גבהים ופערים דינמיים בין כרטיסים)"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{localConfig.isAsymmetricGrid ? 'א-סימטרי פעיל' : 'רשת סימטרית'}</span>
                    </button>
                  </div>

                  {/* Card Frame Shape & Visual Effect Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-white/5">
                    {/* Frame Shape Selector */}
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="text-[11px] text-slate-400">מסגרת כרטיס:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'auto', label: 'אוטומטי (לפי מיתוג)', icon: Wand2 },
                          { id: 'rounded', label: 'מעוגל (Rounded 3XL)', icon: Circle },
                          { id: 'sharp', label: 'חד (זווית 90°)', icon: Square },
                          { id: 'pill', label: 'קפסולה / גלולה (Pill)', icon: Box },
                          { id: 'arched', label: 'קשתי (Arched Top)', icon: Milestone },
                          { id: 'chiseled', label: 'משופע דינמי (Chiseled)', icon: Crosshair },
                        ].map((shape) => {
                          const ShapeIcon = shape.icon;
                          const active = (localConfig.cardFrameShape || 'auto') === shape.id;
                          return (
                            <button
                              key={shape.id}
                              type="button"
                              onClick={() => handleUpdate('cardFrameShape', shape.id as any)}
                              className={clsx(
                                'p-1.5 rounded-lg transition-all cursor-pointer',
                                active
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              )}
                              title={shape.label}
                            >
                              <ShapeIcon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visual Brand Effect Selector */}
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="text-[11px] text-slate-400">אפקט מיתוגי:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'auto', label: 'אוטומטי מיתוגי', icon: Sparkles },
                          { id: 'glow', label: 'זוהר מיתוגי מועצם (Brand Glow)', icon: Sun },
                          { id: 'glass', label: 'זכוכית פרוסטד (Glassmorphism)', icon: Box },
                          { id: 'border-beam', label: 'מסגרת הילוכית מודגשת (Border Beam)', icon: Shield },
                          { id: 'heavy-border', label: 'מסגרת עבה מודגשת (Heavy Border)', icon: Layers },
                        ].map((effect) => {
                          const EffectIcon = effect.icon;
                          const active = (localConfig.cardStylePresetEffect || 'auto') === effect.id;
                          return (
                            <button
                              key={effect.id}
                              type="button"
                              onClick={() => handleUpdate('cardStylePresetEffect', effect.id as any)}
                              className={clsx(
                                'p-1.5 rounded-lg transition-all cursor-pointer',
                                active
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              )}
                              title={effect.label}
                            >
                              <EffectIcon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                    לא הוגדרו עדיין עמודי תווך. לחצו על "הוסף עמוד תווך" כדי להוסיף ערכים לחזון.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3.5 rounded-2xl bg-[#161619] border border-white/10 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-bold text-xs text-slate-400">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                              placeholder="כותרת הערך/השלב"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <PageBuilderIconPicker
                              value={item.icon || 'Sparkles'}
                              onChange={(iconName) => handleUpdateItem(idx, { icon: iconName })}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="מחק ערך"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={item.text || item.description || ''}
                          onChange={(e) => handleUpdateItem(idx, { text: e.target.value })}
                          placeholder="תיאור מורחב של הערך או שלב ההתפתחות..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 4: Text Background Overlay & Hover Effects */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleAccordion('text_bg')}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-white">
                  רקע תמונה מאחורי הטקסט ואפקטי מעבר
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {localConfig.textBgEnabled ? 'פעיל' : 'כבוי'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'text_bg' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'text_bg' && (
              <div className="p-4 sm:p-6 border-t border-[#262626] space-y-4 bg-[#0f0f0f]">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      הפעלת רקע תמונה מאחורי הטקסט
                    </span>
                    <span className="text-[11px] text-slate-400">
                      יוצר שכבת רקע מרשימה עם 5 אפקטי מעבר חיים בריחוף
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.textBgEnabled)}
                    onChange={(e) => handleUpdate('textBgEnabled', e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </div>

                {localConfig.textBgEnabled && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        תמונת רקע לטקסט:
                      </label>
                      <PageBuilderImageUpload
                        value={localConfig.textBgImageUrl || ''}
                        onChange={(url) => handleUpdate('textBgImageUrl', url)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          אפקט מעבר בריחוף (Hover Effect):
                        </label>
                        <select
                          value={localConfig.textBgEffect || 'zoom-glow'}
                          onChange={(e) => handleUpdate('textBgEffect', e.target.value as HeroTextBgEffect)}
                          className="w-full bg-[#161619] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="zoom-glow">זום עדין וזוהר (Zoom Glow)</option>
                          <option value="shimmer-sweep">ברק מתכתי (Shimmer Sweep)</option>
                          <option value="float-parallax">ציפה פרלקסית (Float Parallax)</option>
                          <option value="blur-reveal">חשיפה מטושטשת (Blur Reveal)</option>
                          <option value="gradient-shift">תנועת גרדיאנט (Gradient Shift)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          טווח פריסת הרקע:
                        </label>
                        <select
                          value={localConfig.textBgScope || 'text-card'}
                          onChange={(e) => handleUpdate('textBgScope', e.target.value as any)}
                          className="w-full bg-[#161619] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="text-card">רק סביב כרטיס הטקסט</option>
                          <option value="full-section">על פני כל שטח האזור</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>אטימות שכבת הרקע (Overlay):</span>
                        <span>{localConfig.textBgOverlayOpacity ?? 70}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={localConfig.textBgOverlayOpacity ?? 70}
                        onChange={(e) => handleUpdate('textBgOverlayOpacity', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 5: CTA Buttons */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleAccordion('buttons')}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MousePointerClick className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">כפתורי הנעה לפעולה (CTA)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {localConfig.buttonsVisible ? 'פעיל' : 'כבוי'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'buttons' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'buttons' && (
              <div className="p-4 sm:p-6 border-t border-[#262626] space-y-4 bg-[#0f0f0f]">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      הצגת כפתורי הנעה לפעולה
                    </span>
                    <span className="text-[11px] text-slate-400">
                      מוסיף כפתור ראשי ומשני מתחת לתוכן החזון
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.buttonsVisible)}
                    onChange={(e) => handleUpdate('buttonsVisible', e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </div>

                {localConfig.buttonsVisible && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Primary Button */}
                    <div className="p-3.5 rounded-2xl bg-[#161619] border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-amber-400 block">
                        כפתור ראשי (Primary):
                      </span>
                      <input
                        type="text"
                        value={localConfig.primaryButton?.text || ''}
                        onChange={(e) =>
                          handlePatch({
                            primaryButton: {
                              text: e.target.value,
                              url: localConfig.primaryButton?.url || '#',
                            },
                          })
                        }
                        placeholder="טקסט כפתור (לדוגמה: קרא עוד עלינו)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={localConfig.primaryButton?.url || ''}
                        onChange={(e) =>
                          handlePatch({
                            primaryButton: {
                              text: localConfig.primaryButton?.text || 'קרא עוד',
                              url: e.target.value,
                            },
                          })
                        }
                        placeholder="קישור URL (לדוגמה: #contact)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Secondary Button */}
                    <div className="p-3.5 rounded-2xl bg-[#161619] border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-slate-300 block">
                        כפתור משני (Secondary):
                      </span>
                      <input
                        type="text"
                        value={localConfig.secondaryButton?.text || ''}
                        onChange={(e) =>
                          handlePatch({
                            secondaryButton: {
                              text: e.target.value,
                              url: localConfig.secondaryButton?.url || '#',
                            },
                          })
                        }
                        placeholder="טקסט כפתור משני (לדוגמה: הצטרפות לקהילה)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={localConfig.secondaryButton?.url || ''}
                        onChange={(e) =>
                          handlePatch({
                            secondaryButton: {
                              text: localConfig.secondaryButton?.text || 'הצטרפות',
                              url: e.target.value,
                            },
                          })
                        }
                        placeholder="קישור URL"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 6: Colors & Branding */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleAccordion('colors')}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">צבעי מיתוג וכרטיסים</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'colors' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'colors' && (
              <div className="p-4 sm:p-6 border-t border-[#262626] space-y-4 bg-[#0f0f0f]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PageBuilderColorPicker
                    label="צבע רקע האזור"
                    value={localConfig.backgroundColor || 'transparent'}
                    onChange={(c) => handleUpdate('backgroundColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע כותרת ראשית"
                    value={localConfig.headingColor || '#ffffff'}
                    onChange={(c) => handleUpdate('headingColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע גוף הטקסט"
                    value={localConfig.bodyColor || '#cbd5e1'}
                    onChange={(c) => handleUpdate('bodyColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע כפתור ראשי"
                    value={localConfig.primaryButtonColor || '#f59e0b'}
                    onChange={(c) => handleUpdate('primaryButtonColor', c)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                קיימים שינויים שטרם נשמרו
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestClose}
              className="px-4 py-2 rounded-xl hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              שמור שינויים
            </button>
          </div>
        </div>

        {/* Unsaved Changes Confirmation Dialog */}
        {showUnsavedConfirm && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#1a1a1e] border border-amber-500/30 p-6 text-right space-y-4 shadow-2xl">
              <h3 className="text-base font-extrabold text-white">שינויים לא נשמרו</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ביצעת שינויים באזור האודות והחזון. האם ברצונך לשמור את השינויים לפני סגירת העורך?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedConfirm(false);
                    if (onClose) onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-xs text-slate-400"
                >
                  סגור ללא שמירה
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    setShowUnsavedConfirm(false);
                    if (onClose) onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  שמור וסגור
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
