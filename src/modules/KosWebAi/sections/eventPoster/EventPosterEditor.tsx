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
  MediaPickerContract,
} from '../../../../core/contracts';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import {
  Cloud,
  Loader2,
  Palette,
  Sparkles,
  Wand2,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

export interface EventPosterEditorProps {
  config: EventPosterSectionConfig;
  onUpdate: (newConfig: Partial<EventPosterSectionConfig>) => void;
}

export const EventPosterEditor: React.FC<EventPosterEditorProps> = ({
  config,
  onUpdate,
}) => {
  const { getCapability } = useHostCapabilities();
  const { tenantId } = useTenantScope();

  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const brandDnaContract = getCapability<BrandDnaContract>('brand-dna');
  const formBuilder = getCapability<FormBuilderContract>('form-builder');

  const [semanticPrompt, setSemanticPrompt] = useState('');
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);
  const [availableForms, setAvailableForms] = useState<FormItemSummary[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);

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

  const handlePickFromKoscloud = async (field: 'logoUrl' | 'venueImageUrl' | 'speakerImageUrl') => {
    if (!mediaPicker?.openPicker) return;
    try {
      const picked = await mediaPicker.openPicker({
        accept: 'image/*',
        multiple: false,
        initialTab: 'gallery',
      });
      const url = Array.isArray(picked) ? picked[0] : picked;
      if (url) {
        onUpdate({ [field]: url });
      }
    } catch {
      // user cancelled
    }
  };

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
    onUpdate({
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
      onUpdate({ semanticStyle: nextStyle });
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
    onUpdate({
      semanticStyle: {
        ...current,
        [key]: value,
      },
    });
  };

  return (
    <div dir="rtl" className="space-y-4 text-right">
      {/* 1. Styles & AI Semantic Styling */}
      <PageBuilderAccordion title="סגנון, מיתוג ועיצוב סמנטי (AI)" defaultOpen>
        <div className="space-y-4">
          {/* Brand DNA Sync */}
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Palette className="w-4 h-4" />
            <span>סנכרן לוגו וצבעים מרכיב המיתוג (Brand DNA)</span>
          </button>

          {/* Preset Selector from stylePresetTheme */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">סגנונות מקובץ הסגנונות</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(EVENT_POSTER_PRESET_PALETTES).map(([key, pal]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onUpdate({ stylePreset: key, semanticStyle: undefined })}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    config.stylePreset === key && !config.semanticStyle
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: pal.primaryColor }}
                  />
                  <span className="truncate">{pal.moodLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Semantic Style Prompt */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
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
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={isGeneratingStyle || !semanticPrompt.trim()}
                onClick={handleGenerateSemanticStyle}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1 shrink-0"
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

          {/* Fine-tune Semantic Colors */}
          <div className="grid grid-cols-2 gap-2 text-xs">
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
              <label key={k} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800">
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
      </PageBuilderAccordion>

      {/* 2. Media from KOSCLOUD */}
      <PageBuilderAccordion title="תמונות ולוגו (KOSCLOUD)" defaultOpen>
        <div className="space-y-3">
          {(
            [
              ['logoUrl', 'לוגו עליון (ימין)'],
              ['speakerImageUrl', 'תמונת דוברת / אורחת'],
              ['venueImageUrl', 'תמונת רקע / אולם (שמאל למעלה)'],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">{label}</label>
                <button
                  type="button"
                  onClick={() => handlePickFromKoscloud(field)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center gap-1"
                >
                  <Cloud className="w-3 h-3" />
                  <span>בחר מ-KOSCLOUD</span>
                </button>
              </div>
              <PageBuilderInput
                value={(config[field] as string) || ''}
                onChange={(e) => onUpdate({ [field]: e.target.value })}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
          ))}
        </div>
      </PageBuilderAccordion>

      {/* 3. Poster Content */}
      <PageBuilderAccordion title="תוכן הפוסטר והפרטים" defaultOpen>
        <div className="space-y-3">
          <PageBuilderInput
            label="כותרת ראשית"
            value={config.headline || ''}
            onChange={(e) => onUpdate({ headline: e.target.value })}
          />
          <PageBuilderInput
            label="תגית תאריך עברי / כותרת משנה"
            value={config.dateBadge || ''}
            onChange={(e) => onUpdate({ dateBadge: e.target.value })}
          />
          <PageBuilderInput
            label="תיאור אווירה מתחת לתגית"
            value={config.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
          />
          <PageBuilderInput
            label="כותרת כרטיס ההדגשה (מימין לתמונה)"
            value={config.highlightTitle || ''}
            onChange={(e) => onUpdate({ highlightTitle: e.target.value })}
          />
          <PageBuilderInput
            label="שם הדוברת / אורחת"
            value={config.highlightSpeaker || ''}
            onChange={(e) => onUpdate({ highlightSpeaker: e.target.value })}
          />
          <PageBuilderInput
            label="טקסט עליון בבאנר המרכזי"
            value={config.featuredBannerTopText || ''}
            onChange={(e) => onUpdate({ featuredBannerTopText: e.target.value })}
          />
          <PageBuilderInput
            label="כותרת מודגשת בבאנר המרכזי"
            value={config.featuredBannerTitle || ''}
            onChange={(e) => onUpdate({ featuredBannerTitle: e.target.value })}
          />
          <PageBuilderTextarea
            label="פירוט התוועדות / תוכן נוסף"
            value={config.featuredDescription || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ featuredDescription: e.target.value })}
            rows={2}
          />
          <PageBuilderInput
            label="תגית סעודה / אירוח"
            value={config.hospitalityBadge || ''}
            onChange={(e) => onUpdate({ hospitalityBadge: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <PageBuilderInput
              label="תאריך (טור 1)"
              value={config.eventDateLabel || ''}
              onChange={(e) => onUpdate({ eventDateLabel: e.target.value })}
            />
            <PageBuilderInput
              label="שעה (טור 2)"
              value={config.eventTimeLabel || ''}
              onChange={(e) => onUpdate({ eventTimeLabel: e.target.value })}
            />
          </div>
          <PageBuilderTextarea
            label="שורות מחיר (שורה לכל מחיר)"
            value={(config.priceLines || []).join('\n')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onUpdate({
                priceLines: e.target.value.split('\n').filter((l: string) => l.trim().length > 0),
              })
            }
            rows={2}
          />
          <PageBuilderTextarea
            label="משפט סיום השראתי"
            value={config.closingQuote || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ closingQuote: e.target.value })}
            rows={2}
          />
          <PageBuilderInput
            label="כתובת המיקום"
            value={config.addressText || ''}
            onChange={(e) => onUpdate({ addressText: e.target.value })}
          />
        </div>
      </PageBuilderAccordion>

      {/* 4. KFS Smart Form Link */}
      <PageBuilderAccordion title="טופס KFS בתחתית האזור" defaultOpen>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>בחר טופס KFS להטמעה</span>
            </label>
            <button
              type="button"
              onClick={loadKfsForms}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loadingForms ? 'animate-spin' : ''}`} />
              <span>רענן</span>
            </button>
          </div>

          <select
            value={config.formId || ''}
            onChange={(e) => onUpdate({ formId: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          >
            <option value="">-- בחר טופס מ-KFS --</option>
            {availableForms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title} ({f.submissionsCount || 0} הגשות)
              </option>
            ))}
          </select>

          <PageBuilderInput
            label="כותרת מעל הטופס"
            value={config.formTitle || ''}
            onChange={(e) => onUpdate({ formTitle: e.target.value })}
          />
          <PageBuilderInput
            label="תת-כותרת מעל הטופס"
            value={config.formSubtitle || ''}
            onChange={(e) => onUpdate({ formSubtitle: e.target.value })}
          />
          <PageBuilderInput
            label="טקסט כפתור שליחה"
            value={config.submitButtonText || ''}
            onChange={(e) => onUpdate({ submitButtonText: e.target.value })}
          />
        </div>
      </PageBuilderAccordion>
    </div>
  );
};
