import React, { useEffect, useState } from 'react';
import { EventPosterSectionConfig, EventPosterSemanticStyle } from '../../types/sectionConfigs';
import { EVENT_POSTER_PRESET_PALETTES } from '../../utils/stylePresetTheme';
import { generateEventPosterSemanticStyle } from '../../kosai/promptToKosai';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { useTenantScope } from '../../../../core/tenant';
import {
  BrandDnaContract,
  FormBuilderContract,
  FormItemSummary,
} from '../../../../core/contracts';
import { SectionStylePresetSelector } from '../../ui/SectionStylePresetSelector';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import {
  Loader2,
  Palette,
  Sparkles,
  Wand2,
  FileSpreadsheet,
  RefreshCw,
  Image as ImageIcon,
  Type,
  Calendar,
} from 'lucide-react';

export interface EventPosterEditorProps {
  config: EventPosterSectionConfig;
  onChange?: (updated: EventPosterSectionConfig) => void;
  onUpdate?: (partial: Partial<EventPosterSectionConfig>) => void;
}

export const EventPosterEditor: React.FC<EventPosterEditorProps> = ({
  config,
  onChange,
  onUpdate,
}) => {
  const { getCapability } = useHostCapabilities();
  const { tenantId } = useTenantScope();

  const brandDnaContract = getCapability<BrandDnaContract>('brand-dna');
  const formBuilder = getCapability<FormBuilderContract>('form-builder');

  const [semanticPrompt, setSemanticPrompt] = useState('');
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);
  const [availableForms, setAvailableForms] = useState<FormItemSummary[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);

  const emitUpdate = (partial: Partial<EventPosterSectionConfig>) => {
    const nextConfig: EventPosterSectionConfig = {
      ...config,
      ...partial,
    };
    if (onChange) {
      onChange(nextConfig);
    } else if (onUpdate) {
      onUpdate(partial);
    }
  };

  const updateField = <K extends keyof EventPosterSectionConfig>(
    key: K,
    val: EventPosterSectionConfig[K]
  ) => {
    emitUpdate({ [key]: val } as Partial<EventPosterSectionConfig>);
  };

  const loadKfsForms = async () => {
    if (!formBuilder?.getForms) return;
    setLoadingForms(true);
    try {
      const list = await formBuilder.getForms();
      setAvailableForms(list || []);
    } catch {
      // ignore
    } finally {
      setLoadingForms(false);
    }
  };

  useEffect(() => {
    loadKfsForms();
  }, [formBuilder]);

  const handleSyncBrandDna = () => {
    const dna = brandDnaContract?.getBrandDna?.();
    if (!dna) return;
    const primary = dna.designTokens?.primaryColor || '#0f5c66';
    const accent = dna.designTokens?.secondaryColor || '#d4a24c';
    const nextStyle: EventPosterSemanticStyle = {
      moodLabel: `מיתוג ${dna.identity?.companyName || 'העסק'}`,
      primaryColor: primary,
      accentColor: accent,
      secondaryColor: primary,
      surfaceColor: '#fdf9ef',
      cardBgColor: '#f5e3ba',
      textColor: '#0f172a',
      frameBorderColor: accent,
    };
    emitUpdate({
      logoUrl: dna.identity?.logoUrl || config.logoUrl,
      semanticStyle: nextStyle,
    });
  };

  const handleGenerateSemanticStyle = async () => {
    if (!semanticPrompt.trim()) return;
    setIsGeneratingStyle(true);
    setStyleError(null);
    try {
      const dna = brandDnaContract?.getBrandDna?.();
      const nextStyle = await generateEventPosterSemanticStyle({
        semanticPrompt,
        companyName: dna?.identity?.companyName,
        tenantId,
      });
      emitUpdate({ semanticStyle: nextStyle });
    } catch (err: any) {
      setStyleError(err?.message || 'שגיאה ביצירת הסגנון');
    } finally {
      setIsGeneratingStyle(false);
    }
  };

  const updateSemanticField = (key: keyof EventPosterSemanticStyle, value: string) => {
    const current: EventPosterSemanticStyle = config.semanticStyle || {
      ...EVENT_POSTER_PRESET_PALETTES[config.stylePreset || 'standard'],
    };
    emitUpdate({
      semanticStyle: {
        ...current,
        [key]: value,
      },
    });
  };

  const inputClass =
    'w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500';
  const labelClass = 'text-xs font-bold text-slate-300 block mb-1';

  return (
    <div dir="rtl" className="flex flex-col gap-6 text-right">
      {/* 0. Standard KosWebAi Style Preset Selector */}
      <SectionStylePresetSelector
        value={config.stylePreset}
        onChange={(preset) => emitUpdate({ stylePreset: preset, semanticStyle: undefined })}
      />

      {/* 1. Background & Print Mode (Same PageBuilderImageUpload as all other editors) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>רקע הפלייר והתמונות (KOSCLOUD)</span>
        </h4>

        <PageBuilderImageUpload
          label="תמונת רקע לפלייר (רקע ללא מילים או גרסת הדפסה)"
          value={config.posterBackgroundImageUrl || ''}
          onChange={(url) => updateField('posterBackgroundImageUrl', url)}
        />

        {config.posterBackgroundImageUrl && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => updateField('posterBackgroundMode', 'overlay_text')}
              className={`p-3 rounded-xl border text-right text-xs transition-all ${
                config.posterBackgroundMode !== 'print_exact'
                  ? 'border-amber-400 bg-amber-500/15 text-amber-200 font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>רקע ללא מילים (טקסטים מעל הרקע)</div>
              <div className="text-[11px] opacity-75 font-normal mt-0.5">
                שומר על הרקע נקי כמו בהדפסה ומציג עליו את הטקסטים
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateField('posterBackgroundMode', 'print_exact')}
              className={`p-3 rounded-xl border text-right text-xs transition-all ${
                config.posterBackgroundMode === 'print_exact'
                  ? 'border-amber-400 bg-amber-500/15 text-amber-200 font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>גרסת הדפסה מלאה 1:1 + טופס מתחת</div>
              <div className="text-[11px] opacity-75 font-normal mt-0.5">
                מציג את התמונה בדיוק כפי שהיא להדפסה ללא טקסטים חופפים
              </div>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <PageBuilderImageUpload
            label="לוגו מותג (ימין למעלה)"
            value={config.logoUrl || ''}
            onChange={(url) => updateField('logoUrl', url)}
          />
          <PageBuilderImageUpload
            label="תמונת דוברת / אורחת"
            value={config.speakerImageUrl || ''}
            onChange={(url) => updateField('speakerImageUrl', url)}
          />
        </div>

        <PageBuilderImageUpload
          label="תמונת אווירה / אולם (שמאל למעלה - כשאין רקע מלא)"
          value={config.venueImageUrl || ''}
          onChange={(url) => updateField('venueImageUrl', url)}
        />
      </div>

      {/* 2. Semantic AI Style & Brand DNA */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span>מיתוג וסגנון סמנטי (AI + Brand DNA)</span>
        </h4>

        <button
          type="button"
          onClick={handleSyncBrandDna}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span>סנכרן לוגו וצבעים מרכיב המיתוג (Brand DNA)</span>
        </button>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            <span>קבלת סגנון חדש מה-AI לפי נתונים סמנטיים</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={semanticPrompt}
              onChange={(e) => setSemanticPrompt(e.target.value)}
              placeholder="למשל: אווירת יוקרה בורדו וזהב, או ערב קיץ רענן..."
              className={inputClass}
            />
            <button
              type="button"
              disabled={isGeneratingStyle || !semanticPrompt.trim()}
              onClick={handleGenerateSemanticStyle}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1 shrink-0"
            >
              {isGeneratingStyle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>עצב</span>
            </button>
          </div>
          {styleError && <p className="text-[11px] text-rose-400">{styleError}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {(
            [
              ['primaryColor', 'צבע ראשי'],
              ['accentColor', 'צבע הדגשה (זהב)'],
              ['surfaceColor', 'רקע הפוסטר'],
              ['cardBgColor', 'רקע כרטיסים'],
              ['textColor', 'צבע טקסט'],
              ['frameBorderColor', 'מסגרת'],
            ] as const
          ).map(([k, lbl]) => (
            <label
              key={k}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
            >
              <span className="text-slate-300">{lbl}</span>
              <input
                type="color"
                value={
                  config.semanticStyle?.[k] ||
                  EVENT_POSTER_PRESET_PALETTES[config.stylePreset || 'standard']?.[k] ||
                  '#0f5c66'
                }
                onChange={(e) => updateSemanticField(k, e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 3. Poster Texts & Event Details */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Type className="w-4 h-4 text-emerald-400" />
          <span>תוכן הפוסטר והפרטים</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>כותרת ראשית</label>
            <input
              type="text"
              value={config.headline || ''}
              onChange={(e) => updateField('headline', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>תגית תאריך עברי / כותרת משנה</label>
            <input
              type="text"
              value={config.dateBadge || ''}
              onChange={(e) => updateField('dateBadge', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>תיאור אווירה מתחת לתגית</label>
            <input
              type="text"
              value={config.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>כותרת כרטיס ההדגשה (מימין לתמונה)</label>
            <input
              type="text"
              value={config.highlightTitle || ''}
              onChange={(e) => updateField('highlightTitle', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>שם הדוברת / אורחת</label>
            <input
              type="text"
              value={config.highlightSpeaker || ''}
              onChange={(e) => updateField('highlightSpeaker', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>טקסט עליון בבאנר המרכזי</label>
            <input
              type="text"
              value={config.featuredBannerTopText || ''}
              onChange={(e) => updateField('featuredBannerTopText', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>כותרת מודגשת בבאנר המרכזי</label>
            <input
              type="text"
              value={config.featuredBannerTitle || ''}
              onChange={(e) => updateField('featuredBannerTitle', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>פירוט התוועדות / תוכן נוסף</label>
            <textarea
              rows={2}
              value={config.featuredDescription || ''}
              onChange={(e) => updateField('featuredDescription', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>תגית סעודה / אירוח</label>
            <input
              type="text"
              value={config.hospitalityBadge || ''}
              onChange={(e) => updateField('hospitalityBadge', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>כתובת המיקום</label>
            <input
              type="text"
              value={config.addressText || ''}
              onChange={(e) => updateField('addressText', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>תאריך (טור 1)</label>
            <input
              type="text"
              value={config.eventDateLabel || ''}
              onChange={(e) => updateField('eventDateLabel', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>שעה (טור 2)</label>
            <input
              type="text"
              value={config.eventTimeLabel || ''}
              onChange={(e) => updateField('eventTimeLabel', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>שורות מחיר (שורה לכל מחיר)</label>
            <textarea
              rows={2}
              value={(config.priceLines || []).join('\n')}
              onChange={(e) =>
                updateField(
                  'priceLines',
                  e.target.value.split('\n').filter((l) => l.trim().length > 0)
                )
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>משפט סיום השראתי</label>
            <textarea
              rows={2}
              value={config.closingQuote || ''}
              onChange={(e) => updateField('closingQuote', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 4. KFS Smart Form Link */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>טופס KFS בתחתית האזור</span>
          </h4>
          <button
            type="button"
            onClick={loadKfsForms}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loadingForms ? 'animate-spin' : ''}`} />
            <span>רענן רשימה</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>בחר טופס KFS להטמעה</label>
            <select
              value={config.formId || ''}
              onChange={(e) => updateField('formId', e.target.value)}
              className={inputClass}
            >
              <option value="">-- בחר טופס מ-KFS --</option>
              {availableForms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.submissionsCount || 0} הגשות)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>כותרת מעל הטופס</label>
            <input
              type="text"
              value={config.formTitle || ''}
              onChange={(e) => updateField('formTitle', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>טקסט כפתור שליחה</label>
            <input
              type="text"
              value={config.submitButtonText || ''}
              onChange={(e) => updateField('submitButtonText', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>תת-כותרת מעל הטופס</label>
            <input
              type="text"
              value={config.formSubtitle || ''}
              onChange={(e) => updateField('formSubtitle', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
