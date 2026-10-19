import React, { useState } from 'react';
import {
  DynamicCategoriesSectionConfig,
  DynamicCategoryCardItem,
  DynamicCategoriesLayoutPreset,
} from '../../types/sectionConfigs';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { RichContentWysiwygEditor } from '../richContent/RichContentWysiwygEditor';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, AiTextAssistantContract, TenantStylePreset } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import {
  Palette,
  Type,
  Layout,
  Layers,
  Sparkles,
  ChevronDown,
  Plus,
  Trash2,
  MoveVertical,
  Activity,
  Heart,
  Shield,
  Flower2,
  Compass,
  Cpu,
  ImageIcon,
  Mic,
  Briefcase,
  MessageSquare,
  BookOpen,
  Calendar,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Wand2,
  Loader2,
  Play,
  RotateCw,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface DynamicCategoriesEditorProps {
  config: DynamicCategoriesSectionConfig;
  onChange: (updated: DynamicCategoriesSectionConfig) => void;
  onClose?: () => void;
}

const AVAILABLE_ICONS = [
  { id: 'Mic', label: 'פודקאסט / מיקרופון', icon: Mic },
  { id: 'Heart', label: 'כנסים / לב', icon: Heart },
  { id: 'Briefcase', label: 'קורסים / תיק', icon: Briefcase },
  { id: 'MessageSquare', label: 'מאמרים / שיעורים', icon: MessageSquare },
  { id: 'BookOpen', label: 'ספר / תוכן', icon: BookOpen },
  { id: 'Calendar', label: 'אירועים / יומן', icon: Calendar },
  { id: 'Sparkles', label: 'יוקרה / קסם', icon: Sparkles },
  { id: 'Activity', label: 'אנליטיקה / דופק', icon: Activity },
];

export const DynamicCategoriesEditor: React.FC<DynamicCategoriesEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);
  const aiAssistant = getCapability<AiTextAssistantContract>('ai-assistant');

  // Accordion State - ALL CLOSED BY DEFAULT, EXCLUSIVE (Only 1 open at a time)
  const [openMainAccordion, setOpenMainAccordion] = useState<string | null>(null);
  const [openNestedAccordion, setOpenNestedAccordion] = useState<string | null>(null);

  const toggleMainAccordion = (id: string) => {
    setOpenMainAccordion((prev) => (prev === id ? null : id));
    setOpenNestedAccordion(null); // Reset nested when switching main
  };

  const toggleNestedAccordion = (id: string) => {
    setOpenNestedAccordion((prev) => (prev === id ? null : id));
  };

  // AI loading per field
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

  const handleUpdate = (patch: Partial<DynamicCategoriesSectionConfig>) => {
    onChange({ ...config, ...patch });
  };

  // AI Text Enhancement with Agent Contract
  const handleEnhanceTextWithAi = async (
    fieldKey: 'title' | 'subtitle' | 'badge',
    instruction: string
  ) => {
    if (!aiAssistant) return;
    const currentText = (config as any)[fieldKey] || '';
    setAiLoadingField(fieldKey);
    try {
      const voiceHint = brandDna.voice.powerWords?.slice(0, 3).join(', ') || '';
      const res = await aiAssistant.enhanceText({
        originalText: currentText,
        instruction: `${instruction}. מילות כוח: ${voiceHint}. פנייה: ${brandDna.voice.genderAddressing || 'direct'}.`,
        brandDna,
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

  // Categories CRUD
  const handleAddCategory = () => {
    const newCat: DynamicCategoryCardItem = {
      id: `cat_${Date.now()}`,
      title: 'קטגוריה חדשה',
      subtitle: 'תיאור קצר וממוקד',
      iconName: 'BookOpen',
      linkUrl: '#',
    };
    handleUpdate({ categories: [...(config.categories || []), newCat] });
  };

  const handleUpdateCategory = (idx: number, patch: Partial<DynamicCategoryCardItem>) => {
    const list = [...(config.categories || [])];
    list[idx] = { ...list[idx], ...patch };
    handleUpdate({ categories: list });
  };

  const handleRemoveCategory = (idx: number) => {
    const list = [...(config.categories || [])];
    list.splice(idx, 1);
    handleUpdate({ categories: list });
  };

  // 6 Synced Style Presets
  const STYLE_PRESETS: Array<{
    id: DynamicCategoriesLayoutPreset;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    { id: 'standard', title: 'סטנדרטי ומאוזן (כיפות עגולות)', icon: Layers, color: '#6366f1' },
    { id: 'feminine', title: 'נשי ורך (ורוד/פסטל מעוגל)', icon: Heart, color: '#ec4899' },
    { id: 'masculine', title: 'גברי ועוצמתי (שחור/כחול חד)', icon: Shield, color: '#2563eb' },
    { id: 'spiritual', title: 'רוחני ועדין (סגול/לוטוס)', icon: Flower2, color: '#8b5cf6' },
    { id: 'sharp', title: 'חד וטכנולוגי (0px קשתות חדות)', icon: Compass, color: '#06b6d4' },
    { id: 'analytical', title: 'אנליטי ומדעי (מסגרות HUD)', icon: Cpu, color: '#10b981' },
  ];

  return (
    <div dir="rtl" className="space-y-3 p-1 font-sans text-xs text-zinc-300">
      {/* 1. Main Accordion: 6 Visual Style Presets */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('styles')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג"
        >
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-sky-400" />
            <span>סגנונות עיצוב מסונכרנים (6 Presets)</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'styles' ? 'rotate-180 text-sky-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'styles' && (
          <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((p) => {
                const IconComp = p.icon;
                const isSelected = (config.layout || 'standard') === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleUpdate({ layout: p.id })}
                    className={clsx(
                      'p-2.5 rounded-xl border text-right transition flex items-center gap-2 cursor-pointer',
                      isSelected
                        ? 'border-sky-500 bg-sky-500/20 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                    )}
                    title={p.title}
                  >
                    <span style={{ color: p.color }} className="shrink-0">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className="truncate">{p.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Icon Motion Effect Selector */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400">אפקט תנועת אייקונים:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'bounce-gentle', title: 'קפיצה עדינה' },
                  { id: 'pulse-slow', title: 'פעימה רכה' },
                  { id: 'float-subtle', title: 'ציפה וריחוף' },
                  { id: 'wiggle', title: 'נענוע קל' },
                  { id: 'scale-hover', title: 'הגדלה במעבר' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleUpdate({ iconMotionEffect: m.id as any })}
                    className={clsx(
                      'px-2 py-1 rounded-lg border text-[10px] cursor-pointer transition',
                      (config.iconMotionEffect || 'bounce-gentle') === m.id
                        ? 'border-sky-500 bg-sky-500/30 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    )}
                    title={m.title}
                  >
                    {m.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Accordion: Nested Accordions for Content & Typography */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('content_typography')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="עריכת תוכן, כותרות, פונטים ועורך WYSIWYG"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" />
            <span>תוכן וטיפוגרפיה (Nested Accordion)</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'content_typography' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'content_typography' && (
          <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
            {/* Nested Accordion 1: Headings & AI Enhancement */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                type="button"
                onClick={() => toggleNestedAccordion('headings')}
                className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="כותרת, תת-כותרת ותגית עם AI"
              >
                <span>כותרות ושדרוג AI</span>
                <ChevronDown
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform',
                    openNestedAccordion === 'headings' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                  )}
                />
              </button>

              {openNestedAccordion === 'headings' && (
                <div className="p-3 border-t border-white/10 space-y-2.5 bg-black/20">
                  {/* Badge field with AI */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.badge || ''}
                      onChange={(e) => handleUpdate({ badge: e.target.value })}
                      placeholder="תגית עליונה..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleEnhanceTextWithAi('badge', 'חבר תגית יוקרתית ומושכת')}
                      className="p-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 cursor-pointer"
                      title="שפר תגית באמצעות סוכן ה-AI של המותג"
                    >
                      {aiLoadingField === 'badge' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Title field with AI */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.title || ''}
                      onChange={(e) => handleUpdate({ title: e.target.value })}
                      placeholder="כותרת ראשית ברורה..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleEnhanceTextWithAi('title', 'נסח כותרת ראשית שיווקית חדה וסוחפת')}
                      className="p-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 cursor-pointer"
                      title="שפר כותרת באמצעות סוכן ה-AI של המותג"
                    >
                      {aiLoadingField === 'title' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Subtitle field with AI */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.subtitle || ''}
                      onChange={(e) => handleUpdate({ subtitle: e.target.value })}
                      placeholder="תת-כותרת מסבירה..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleEnhanceTextWithAi('subtitle', 'נסח תת-כותרת ברורה ומזמינה המפרטת את הקטגוריות')}
                      className="p-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 cursor-pointer"
                      title="שפר תת-כותרת באמצעות סוכן ה-AI של המותג"
                    >
                      {aiLoadingField === 'subtitle' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Nested Accordion 2: Font Controls (Icons & Tooltips ONLY) */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                type="button"
                onClick={() => toggleNestedAccordion('typography')}
                className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="שליטה מלאה בגודל, צבע, משקל ויישור פונטים"
              >
                <span>עריכת פונטים וטיפוגרפיה (אייקונים וטולטיפים בלבד)</span>
                <ChevronDown
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform',
                    openNestedAccordion === 'typography' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                  )}
                />
              </button>

              {openNestedAccordion === 'typography' && (
                <div className="p-3 border-t border-white/10 space-y-3 bg-black/20">
                  {/* Font Size & Weight Button Group with Tooltips */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    {/* Alignments */}
                    <div className="flex items-center gap-1 border border-white/10 p-1 rounded-xl bg-white/5">
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleAlignment: 'right' })}
                        className={clsx(
                          'p-1.5 rounded-lg cursor-pointer transition',
                          (config.titleAlignment || 'center') === 'right' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'
                        )}
                        title="יישור לימין"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleAlignment: 'center' })}
                        className={clsx(
                          'p-1.5 rounded-lg cursor-pointer transition',
                          (config.titleAlignment || 'center') === 'center' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'
                        )}
                        title="יישור למרכז"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleAlignment: 'left' })}
                        className={clsx(
                          'p-1.5 rounded-lg cursor-pointer transition',
                          (config.titleAlignment || 'center') === 'left' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'
                        )}
                        title="יישור לשמאל"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Font Style Toggles */}
                    <div className="flex items-center gap-1 border border-white/10 p-1 rounded-xl bg-white/5">
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleFontWeight: config.titleFontWeight === 'bold' ? 'normal' : 'bold' })}
                        className={clsx(
                          'p-1.5 rounded-lg cursor-pointer transition',
                          config.titleFontWeight === 'bold' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'
                        )}
                        title="כתב מודגש (Bold)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleItalic: !config.titleItalic })}
                        className={clsx(
                          'p-1.5 rounded-lg cursor-pointer transition',
                          config.titleItalic ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'
                        )}
                        title="כתב נטוי (Italic)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleUnderline: !config.titleUnderline })}
                        className={clsx(
                          'p-1.5 rounded-lg cursor-pointer transition',
                          config.titleUnderline ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'
                        )}
                        title="קו תחתון (Underline)"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Font Size Selector with Tooltip */}
                    <div className="flex items-center gap-1">
                      {(['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleUpdate({ titleFontSize: sz })}
                          className={clsx(
                            'px-1.5 py-1 rounded-lg border text-[10px] cursor-pointer transition',
                            (config.titleFontSize || '3xl') === sz
                              ? 'border-sky-500 bg-sky-500/30 text-white font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title={`גודל גופן: ${sz}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title & Card Colors */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <PageBuilderColorPicker
                      label="צבע כותרת ראשית"
                      value={config.titleColor || '#0f172a'}
                      onChange={(c) => handleUpdate({ titleColor: c })}
                    />
                    <PageBuilderColorPicker
                      label="צבע כותרות כרטיסים"
                      value={config.cardTitleColor || '#0f172a'}
                      onChange={(c) => handleUpdate({ cardTitleColor: c })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Nested Accordion 3: WYSIWYG Description Editor with AI */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                type="button"
                onClick={() => toggleNestedAccordion('wysiwyg')}
                className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="עורך WYSIWYG עשיר לתיאור מורחב ומחובר ל-AI"
              >
                <span>עורך תוכן עשיר (WYSIWYG + AI)</span>
                <ChevronDown
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform',
                    openNestedAccordion === 'wysiwyg' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                  )}
                />
              </button>

              {openNestedAccordion === 'wysiwyg' && (
                <div className="p-3 border-t border-white/10 bg-black/30">
                  <RichContentWysiwygEditor
                    value={config.descriptionHtml || ''}
                    onChange={(html) => handleUpdate({ descriptionHtml: html })}
                    brandDna={brandDna}
                    placeholder="תיאור מורחב של המתחמים והשירותים מתוך חזון המותג..."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Accordion: Categories Cards Management */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('categories')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="ניהול והגדרת קטגוריות, קישורים ומדיה מ-KOSCLOUD"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>כרטיסי קטגוריות דינמיים ({config.categories?.length || 0})</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'categories' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'categories' && (
          <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
            <div className="space-y-3">
              {(config.categories || []).map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 text-xs">כרטיס #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(idx)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      title="מחק קטגוריה זו"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => handleUpdateCategory(idx, { title: e.target.value })}
                      placeholder="כותרת הקטגוריה..."
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={cat.subtitle || ''}
                      onChange={(e) => handleUpdateCategory(idx, { subtitle: e.target.value })}
                      placeholder="תת-כותרת / הסבר..."
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Link URL & Icon Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cat.linkUrl}
                      onChange={(e) => handleUpdateCategory(idx, { linkUrl: e.target.value })}
                      placeholder="כתובת קישור (URL)..."
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <select
                      value={cat.iconName}
                      onChange={(e) => handleUpdateCategory(idx, { iconName: e.target.value })}
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      title="בחירת אייקון מובנה"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.id} value={ic.id} className="bg-slate-900 text-white">
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* KOSCLOUD Custom Icon/Media Upload */}
                  <PageBuilderImageUpload
                    label="אייקון/מדיה מותאם מ-KOSCLOUD (אופציונלי)"
                    value={cat.iconUrl}
                    onChange={(url) => handleUpdateCategory(idx, { iconUrl: url })}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddCategory}
              className="w-full py-2 rounded-xl border border-dashed border-sky-500/40 text-sky-400 hover:bg-sky-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer font-bold"
              title="הוספת כרטיס קטגוריה חדש"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף קטגוריה</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Accordion: KOSCLOUD Background Media & Colors */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('background')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="הגדרת צבעי רקע ומדיה מתוך KOSCLOUD"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>רקע ומדיה מ-KOSCLOUD</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'background' ? 'rotate-180 text-purple-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'background' && (
          <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
            {/* Background Media from KOSCLOUD */}
            <PageBuilderImageUpload
              label="מדיה רקע לאזור מתוך KOSCLOUD (תמונה / וידאו)"
              value={config.bgMediaUrl}
              onChange={(url) => {
                const isVid = /\.(mp4|webm|mov)$/i.test(url);
                handleUpdate({ bgMediaUrl: url, bgMediaType: isVid ? 'video' : 'image' });
              }}
            />

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <PageBuilderColorPicker
                label="צבע רקע האזור"
                value={config.backgroundColor || 'transparent'}
                onChange={(c) => handleUpdate({ backgroundColor: c })}
              />
              <PageBuilderColorPicker
                label="צבע הדגשה ראשי"
                value={config.accentColor || brandDna?.designTokens?.primaryColor || '#0ea5e9'}
                onChange={(c) => handleUpdate({ accentColor: c })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
