import React, { useState } from 'react';
import {
  ArticlesListingSectionConfig,
  ArticleCardItem,
  ArticlesListingLayoutPreset,
} from '../../types/sectionConfigs';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { RichContentWysiwygEditor } from '../richContent/RichContentWysiwygEditor';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, AiTextAssistantContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import {
  Layout,
  Type,
  Layers,
  Sparkles,
  ChevronDown,
  Plus,
  Trash2,
  Heart,
  Shield,
  Flower2,
  Compass,
  Cpu,
  ImageIcon,
  BookOpen,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Wand2,
  Loader2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface ArticlesListingEditorProps {
  config: ArticlesListingSectionConfig;
  onChange: (updated: ArticlesListingSectionConfig) => void;
  onClose?: () => void;
}

export const ArticlesListingEditor: React.FC<ArticlesListingEditorProps> = ({
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
    setOpenNestedAccordion(null);
  };

  const toggleNestedAccordion = (id: string) => {
    setOpenNestedAccordion((prev) => (prev === id ? null : id));
  };

  // AI loading per field
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

  const handleUpdate = (patch: Partial<ArticlesListingSectionConfig>) => {
    onChange({ ...config, ...patch });
  };

  // AI Text Enhancement with Agent Contract
  const handleEnhanceTextWithAi = async (
    fieldKey: 'title' | 'subtitle' | 'badge' | 'topCtaText' | 'cardCtaText',
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

  // Articles CRUD
  const handleAddArticle = () => {
    const newItem: ArticleCardItem = {
      id: `art_${Date.now()}`,
      title: 'כותרת מאמר חדש',
      subtitle: brandDna.identity.companyName || 'שם הכותב / המרצה',
      tag: 'כללי',
      linkUrl: '#',
      imageUrl: '',
      ctaText: config.cardCtaText || 'למאמר המלא',
    };
    handleUpdate({ items: [...(config.items || []), newItem] });
  };

  const handleUpdateArticle = (idx: number, patch: Partial<ArticleCardItem>) => {
    const list = [...(config.items || [])];
    list[idx] = { ...list[idx], ...patch };
    handleUpdate({ items: list });
  };

  const handleRemoveArticle = (idx: number) => {
    const list = [...(config.items || [])];
    list.splice(idx, 1);
    handleUpdate({ items: list });
  };

  // 6 Synced Style Presets
  const STYLE_PRESETS: Array<{
    id: ArticlesListingLayoutPreset;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    { id: 'standard', title: 'סטנדרטי ומאוזן (מנטה/קורל)', icon: Layers, color: '#ea580c' },
    { id: 'feminine', title: 'נשי ורך (ורוד/פסטל מעוגל)', icon: Heart, color: '#ec4899' },
    { id: 'masculine', title: 'גברי ועוצמתי (שחור/כחול חד)', icon: Shield, color: '#2563eb' },
    { id: 'spiritual', title: 'רוחני ועדין (סגול/לוטוס)', icon: Flower2, color: '#8b5cf6' },
    { id: 'sharp', title: 'חד וטכנולוגי (0px זוויות חדות)', icon: Compass, color: '#06b6d4' },
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
            <Layout className="w-4 h-4 text-orange-400" />
            <span>סגנונות עיצוב מסונכרנים (6 Presets)</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'styles' ? 'rotate-180 text-orange-400' : 'text-zinc-500'
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
                        ? 'border-orange-500 bg-orange-500/20 text-white font-bold'
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
          </div>
        )}
      </div>

      {/* 2. Main Accordion: Nested Accordions for Content, Typography & Buttons */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('content_typography')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="עריכת כותרות, כפתורים, פונטים ועורך WYSIWYG"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" />
            <span>תוכן, כפתורים וטיפוגרפיה (Nested Accordion)</span>
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
            {/* Nested Accordion 1: Headings & Top CTA with AI */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                type="button"
                onClick={() => toggleNestedAccordion('headings')}
                className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="כותרת, תת-כותרת וכפתור למרכז התוכן"
              >
                <span>כותרות וכפתור עליון</span>
                <ChevronDown
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform',
                    openNestedAccordion === 'headings' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                  )}
                />
              </button>

              {openNestedAccordion === 'headings' && (
                <div className="p-3 border-t border-white/10 space-y-2.5 bg-black/20">
                  {/* Title field with AI */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.title || ''}
                      onChange={(e) => handleUpdate({ title: e.target.value })}
                      placeholder="כותרת ראשית (למשל: מרכז הידע והתוכן)..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleEnhanceTextWithAi('title', 'נסח כותרת חזקה ומזמינה עבור מרכז המאמרים והידע')}
                      className="p-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 cursor-pointer"
                      title="שפר כותרת עם AI"
                    >
                      {aiLoadingField === 'title' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Subtitle with AI */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.subtitle || ''}
                      onChange={(e) => handleUpdate({ subtitle: e.target.value })}
                      placeholder="תת-כותרת..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleEnhanceTextWithAi('subtitle', 'נסח תת-כותרת קולעת למאגר המאמרים')}
                      className="p-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 cursor-pointer"
                      title="שפר תת-כותרת עם AI"
                    >
                      {aiLoadingField === 'subtitle' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Top Action Button (e.g. "למרכז התוכן") */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                    <input
                      type="text"
                      value={config.topCtaText || ''}
                      onChange={(e) => handleUpdate({ topCtaText: e.target.value })}
                      placeholder="טקסט כפתור עליון..."
                      className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      title="טקסט כפתור עליון בצד שמאל"
                    />
                    <input
                      type="text"
                      value={config.topCtaUrl || ''}
                      onChange={(e) => handleUpdate({ topCtaUrl: e.target.value })}
                      placeholder="קישור כפתור עליון (URL)..."
                      className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      title="כתובת קישור של הכפתור העליון"
                    />
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
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    {/* Alignments */}
                    <div className="flex items-center gap-1 border border-white/10 p-1 rounded-xl bg-white/5">
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleAlignment: 'right' })}
                        className={clsx(
                          'p-1.5 rounded-lg cursor-pointer transition',
                          (config.titleAlignment || 'right') === 'right' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
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
                          (config.titleAlignment || 'right') === 'center' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
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
                          (config.titleAlignment || 'right') === 'left' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
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
                          config.titleFontWeight === 'bold' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
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
                          config.titleItalic ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
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
                          config.titleUnderline ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
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
                              ? 'border-orange-500 bg-orange-500/30 text-white font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title={`גודל גופן: ${sz}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <PageBuilderColorPicker
                      label="צבע כותרת ראשית"
                      value={config.titleColor || '#0e3b5e'}
                      onChange={(c) => handleUpdate({ titleColor: c })}
                    />
                    <PageBuilderColorPicker
                      label="צבע כפתור מאמר (CTA)"
                      value={config.cardCtaBgColor || '#ea580c'}
                      onChange={(c) => handleUpdate({ cardCtaBgColor: c })}
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
                    placeholder="תיאור מורחב על מאגר התוכן והחזון של המותג..."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Accordion: Articles Items Management */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('articles')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="ניהול מאמרים, תמונות מ-KOSCLOUD, תגיות וקישורים"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>כרטיסי מאמרים ({config.items?.length || 0})</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'articles' ? 'rotate-180 text-cyan-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'articles' && (
          <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
            <div className="space-y-3">
              {(config.items || []).map((art, idx) => (
                <div
                  key={art.id || idx}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-400 text-xs">מאמר #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(idx)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      title="מחק מאמר זה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Subtitle / Author */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={art.title}
                      onChange={(e) => handleUpdateArticle(idx, { title: e.target.value })}
                      placeholder="כותרת המאמר..."
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={art.subtitle || ''}
                      onChange={(e) => handleUpdateArticle(idx, { subtitle: e.target.value })}
                      placeholder="שם הכותב / תת-כותרת..."
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Tag & Tag Color */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={art.tag || ''}
                      onChange={(e) => handleUpdateArticle(idx, { tag: e.target.value })}
                      placeholder="תגית (למשל: כללי, הורות ומשפחה)..."
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={art.linkUrl}
                      onChange={(e) => handleUpdateArticle(idx, { linkUrl: e.target.value })}
                      placeholder="כתובת קישור (URL)..."
                      className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* KOSCLOUD Image Upload */}
                  <PageBuilderImageUpload
                    label="תמונת המאמר מתוך KOSCLOUD"
                    value={art.imageUrl}
                    onChange={(url) => handleUpdateArticle(idx, { imageUrl: url })}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddArticle}
              className="w-full py-2 rounded-xl border border-dashed border-orange-500/40 text-orange-400 hover:bg-orange-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer font-bold"
              title="הוספת כרטיס מאמר חדש"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף מאמר</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Accordion: Background Media & Colors */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('background')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="הגדרת צבעי רקע ומדיה מתוך KOSCLOUD"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>רקע האזור ומדיה מ-KOSCLOUD</span>
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
                label="צבע רקע כרטיסי המאמר"
                value={config.cardBackgroundColor || '#eaf4f4'}
                onChange={(c) => handleUpdate({ cardBackgroundColor: c })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
