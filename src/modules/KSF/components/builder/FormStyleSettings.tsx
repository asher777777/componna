import React from 'react';
import { FormThemeSettings, FormCompletionSettings, SmartFormDefinition } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import {
  Palette,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Image,
  Square,
  Circle,
  Smartphone,
  Tv,
  Mic,
  Maximize2,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../../core/contracts';

export interface FormStyleSettingsProps {
  form: SmartFormDefinition;
  onChange: (updatedForm: SmartFormDefinition) => void;
}

const PRESET_BACKGROUND_IMAGES = [
  {
    name: 'שיש יוקרתי כהה',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'אלגנטיות משרדית',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'זהב וטקסטורה',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'מינימליזם מודרני',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  },
];

export const FormStyleSettings: React.FC<FormStyleSettingsProps> = ({
  form,
  onChange,
}) => {
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const theme = form.theme || ({} as FormThemeSettings);
  const completion = form.completion || ({} as FormCompletionSettings);

  const handlePickBackgroundImage = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'image/*' });
      if (selected) {
        const finalUrl = Array.isArray(selected) ? selected[0] : selected;
        if (finalUrl) {
          updateTheme('backgroundImageUrl', finalUrl);
        }
      }
    }
  };

  const updateTheme = (key: keyof FormThemeSettings, value: any) => {
    onChange({
      ...form,
      theme: {
        ...theme,
        [key]: value,
      },
    });
  };

  const updateCompletion = (key: keyof FormCompletionSettings, value: any) => {
    onChange({
      ...form,
      completion: {
        ...completion,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Aspect Ratio & Container Dimensions */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Maximize2 className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            מימדי הטופס, יחס מסך וצורת המיכל
          </h4>
        </div>

        {/* Aspect Ratio Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            יחס ממדים (Aspect Ratio):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'auto', label: 'גמיש / אוטומטי', icon: Layers, desc: 'התאמה אוטומטית לתוכן' },
              { id: '16:9', label: '16:9 מסך רחב', icon: Tv, desc: 'מצגת / מסכים רחבים' },
              { id: '9:16', label: '9:16 סטורי / מובייל', icon: Smartphone, desc: 'מובייל / טיקטוק' },
              { id: '1:1', label: '1:1 מרובע', icon: Square, desc: 'אינסטגרם / ריבוע' },
            ].map((ratio) => {
              const isSelected = (theme.aspectRatio || 'auto') === ratio.id;
              const IconCmp = ratio.icon;
              return (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => updateTheme('aspectRatio', ratio.id)}
                  className={`p-3 rounded-2xl border-2 text-right transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <IconCmp className="w-4 h-4" />
                    <span className="text-xs font-bold">{ratio.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">{ratio.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Container Shape Picker */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            צורת המיכל (Shape):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'rounded', label: 'מעוגל יוקרתי', icon: Square, desc: 'פינות מעוגלות אלגנטיות' },
              { id: 'square', label: 'מרובע חד', icon: Square, desc: 'קווים חדים ומודרניים' },
              { id: 'circle', label: 'עיגול', icon: Circle, desc: 'תצוגה עגולה מיוחדת' },
              { id: 'pill', label: 'קפסולה / פיל', icon: Circle, desc: 'עיגול מלא בצדדים' },
            ].map((shape) => {
              const isSelected = (theme.containerShape || 'rounded') === shape.id;
              const IconCmp = shape.icon;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => updateTheme('containerShape', shape.id)}
                  className={`p-3 rounded-2xl border-2 text-right transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <IconCmp className="w-4 h-4" />
                    <span className="text-xs font-bold">{shape.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">{shape.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Mode (Single Field Focus vs Standard Card) */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            מצב תצוגת השאלות (Display Mode):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'standard_card',
                label: 'תצוגת כרטיס סטנדרטית',
                desc: 'כרטיס טופס מלא עם בר ניווט עליון ותחתון',
              },
              {
                id: 'single_field_focus',
                label: 'תצוגת שדה אחד בלבד (Single Field Focus)',
                desc: 'התמקדות מלאה בשאלה הבודדת ללא הסחות דעת',
              },
            ].map((mode) => {
              const isSelected = (theme.displayMode || 'standard_card') === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => updateTheme('displayMode', mode.id)}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{mode.label}</div>
                  <div className="text-[11px] text-slate-400 font-normal mt-0.5">{mode.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Background: Color vs Image */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Image className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            הגדרות רקע ותמונת רקע (Background)
          </h4>
        </div>

        {/* Background Type Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          {[
            { id: 'color', label: 'צבע רקע אחיד' },
            { id: 'gradient', label: 'גרדיאנט יוקרתי' },
            { id: 'image', label: 'תמונת רקע מלאה' },
          ].map((bt) => {
            const isSelected = (theme.backgroundType || 'color') === bt.id;
            return (
              <button
                key={bt.id}
                type="button"
                onClick={() => updateTheme('backgroundType', bt.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {bt.label}
              </button>
            );
          })}
        </div>

        {/* If Image Background */}
        {theme.backgroundType === 'image' && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  קישור לתמונת רקע (Image URL):
                </label>
                <button
                  type="button"
                  onClick={handlePickBackgroundImage}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>בחר מגלריית המדיה</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={theme.backgroundImageUrl || ''}
                  onChange={(e) => updateTheme('backgroundImageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/... או בחר מהגלריה"
                  className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handlePickBackgroundImage}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="פתח גלריית מדיה"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>גלריה</span>
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">תמונות יוקרה לדוגמה:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_BACKGROUND_IMAGES.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => updateTheme('backgroundImageUrl', img.url)}
                    className="relative h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group transition-transform hover:scale-105"
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                      <span className="text-[10px] text-white font-bold">{img.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Opacity Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>כהות שכבת כיסוי לקריאות מיטבית (Overlay):</span>
                <span>{theme.backgroundOverlayOpacity ?? 50}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={95}
                value={theme.backgroundOverlayOpacity ?? 50}
                onChange={(e) => updateTheme('backgroundOverlayOpacity', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Colors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              צבע ראשי / כותרות (Primary):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primaryColor || '#0F172A'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={theme.primaryColor || '#0F172A'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              צבע הדגשה יוקרתי (Accent / Gold):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.accentColor || '#D97706'}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={theme.accentColor || '#D97706'}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              רקע כרטיס הטופס (Card BG):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.cardBackground || '#FFFFFF'}
                onChange={(e) => updateTheme('cardBackground', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={theme.cardBackground || '#FFFFFF'}
                onChange={(e) => updateTheme('cardBackground', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showProgressBar !== false}
              onChange={(e) => updateTheme('showProgressBar', e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              הצג מד התקדמות (Progress Bar) בראש הטופס
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showStepNumbers !== false}
              onChange={(e) => updateTheme('showStepNumbers', e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              הצג מספרי שלבים ("שלב X מתוך Y")
            </span>
          </label>
        </div>
      </div>

      {/* Voice Input Microphone Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Mic className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            הקראה קולית במקום הקלדה (Voice Speech-to-Text)
          </h4>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.enableVoiceInput !== false}
            onChange={(e) => updateTheme('enableVoiceInput', e.target.checked)}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            הצג אייקון מיקרופון בסוף כל שדה טקסט להקראה קולית חכמה בעברית
          </span>
        </label>
      </div>

      {/* Completion Screen Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            מסך סיום והודעת תודה
          </h4>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              כותרת מסך הסיום:
            </label>
            <input
              type="text"
              value={completion.title || ''}
              onChange={(e) => updateCompletion('title', e.target.value)}
              placeholder="תודה רבה! פנייתך התקבלה בהצלחה"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              הודעת תודה / הנחיות המשך:
            </label>
            <textarea
              rows={2}
              value={completion.subtitle || ''}
              onChange={(e) => updateCompletion('subtitle', e.target.value)}
              placeholder="הפרטים הועברו לטיפול אישי. ניצור עמך קשר בהקדם..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={completion.showRedirectButton || false}
                onChange={(e) => updateCompletion('showRedirectButton', e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>הצג כפתור הפניה לדף אינטרנט חיצוני / דף תודה</span>
            </label>

            {completion.showRedirectButton && (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={completion.redirectUrl || ''}
                  onChange={(e) => updateCompletion('redirectUrl', e.target.value)}
                  placeholder="https://example.com/thank-you"
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CRM Sync Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
            סנכרון לידים ישיר ל-CRM
          </h4>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isCrmSyncEnabled !== false}
            onChange={(e) => onChange({ ...form, isCrmSyncEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            הזן לידים חדשים אוטומטית לקולקציית ה-CRM המרכזית בעת הגשה
          </span>
        </label>
      </div>
    </div>
  );
};
