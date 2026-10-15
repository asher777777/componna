import React from 'react';
import {
  TiktokHeroSectionConfig,
  TiktokHeroVideoSettings,
  TiktokHeroOverlaySettings,
  TiktokHeroFloatingCard,
  TiktokHeroCtaButton,
} from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion, PageBuilderAccordionGroup } from '../../ui/PageBuilderAccordion';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderIconPicker } from '../../ui/PageBuilderIconPicker';
import { ContactFormConfigEditor, DEFAULT_CONTACT_FORM_CONFIG } from '../contact/ContactFormConfigEditor';
import {
  Video,
  Layers,
  Type,
  Square,
  Sparkles,
  FormInput,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';

interface TiktokHeroEditorProps {
  config: TiktokHeroSectionConfig;
  onChange: (updated: TiktokHeroSectionConfig) => void;
}

export const TiktokHeroEditor: React.FC<TiktokHeroEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof TiktokHeroSectionConfig>(field: K, value: TiktokHeroSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const updateVideo = (key: keyof TiktokHeroVideoSettings, val: any) => {
    onChange({
      ...config,
      video: {
        ...(config.video || {}),
        [key]: val,
      },
    });
  };

  const updateOverlay = (key: keyof TiktokHeroOverlaySettings, val: any) => {
    onChange({
      ...config,
      overlay: {
        ...(config.overlay || { mode: 'gradient', opacity: 40 }),
        [key]: val,
      },
    });
  };

  const updateCard = (key: keyof TiktokHeroFloatingCard, val: any) => {
    onChange({
      ...config,
      card: {
        ...(config.card || {}),
        [key]: val,
      },
    });
  };

  const updateCta = (key: keyof TiktokHeroCtaButton, val: any) => {
    onChange({
      ...config,
      ctaButton: {
        ...(config.ctaButton || {
          text: 'מצא עכשיו',
          iconName: 'Sparkles',
          showIcon: true,
          actionType: 'modal_form',
        }),
        [key]: val,
      },
    });
  };

  const video = config.video || {};
  const overlay = config.overlay || { mode: 'gradient', opacity: 40 };
  const card = config.card || { enabled: true };
  const cta = config.ctaButton || { text: 'מצא עכשיו', actionType: 'modal_form' };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordionGroup defaultActiveId={null}>
        {/* 1. Video & Player Media */}
        <PageBuilderAccordion id="video" title="נגן וידאו אנכי (9:16)" icon={<Video className="w-4 h-4 text-blue-400" />}>
        <PageBuilderImageUpload
          label="קובץ וידאו (MP4) מתוך הגלריה או קישור"
          value={video.videoUrl || ''}
          onChange={(url) => updateVideo('videoUrl', url)}
        />

        <div className="mt-3">
          <PageBuilderImageUpload
            label="תמונת פוסטר / כיסוי לוידאו"
            value={video.posterUrl || ''}
            onChange={(url) => updateVideo('posterUrl', url)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={video.muted ?? true}
              onChange={(e) => updateVideo('muted', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <span>השתקת סאונד (Mute)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={video.loop ?? true}
              onChange={(e) => updateVideo('loop', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <span>לופ אינסופי (Loop)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={video.autoplay ?? true}
              onChange={(e) => updateVideo('autoplay', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <span>הפעלה אוטומטית (Autoplay)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={video.showSoundWaveAnimation ?? true}
              onChange={(e) => updateVideo('showSoundWaveAnimation', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <span>אנימציית גלי קול בתחתית</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer col-span-2">
            <input
              type="checkbox"
              checked={video.showTopBadges ?? false}
              onChange={(e) => updateVideo('showTopBadges', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <span>הצג תגיות מידע עליונות (VIDEO / טיימר / נושא)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer col-span-2">
            <input
              type="checkbox"
              checked={video.showMuteButton ?? true}
              onChange={(e) => updateVideo('showMuteButton', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <span>הצג כפתור בקרת סאונד בפינה העליונה</span>
          </label>
        </div>

        {(video.showTopBadges ?? false) && (
          <div className="p-3 mt-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PageBuilderInput
                label="תגית עליונה (באדג' וידאו)"
                value={video.badgeText || ''}
                onChange={(e) => updateVideo('badgeText', e.target.value)}
                placeholder="VIDEO"
              />
              <PageBuilderInput
                label="משך זמן / טיימר"
                value={video.durationText || ''}
                onChange={(e) => updateVideo('durationText', e.target.value)}
                placeholder="9.9s"
              />
            </div>

            <div>
              <PageBuilderInput
                label="תגית סדרה / נושא"
                value={video.seasonEpisodeText || ''}
                onChange={(e) => updateVideo('seasonEpisodeText', e.target.value)}
                placeholder="S2 Command the Room"
              />
            </div>
          </div>
        )}
      </PageBuilderAccordion>

      {/* 2. Background & Overlay */}
      <PageBuilderAccordion id="overlay" title="שכבת רקע וציפוי (Overlay)" icon={<Layers className="w-4 h-4 text-purple-400" />}>
        <div className="flex flex-col gap-1.5 mb-3">
          <label className="text-xs font-semibold text-slate-300">סוג שכבת הציפוי</label>
          <select
            value={overlay.mode || 'gradient'}
            onChange={(e) => updateOverlay('mode', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="gradient">גרדיאנט (Gradient עדין לקריאות מושלמת)</option>
            <option value="solid">סולידי (Solid Color עם שקיפות)</option>
            <option value="image">תמונת ציפוי (Pattern / Image)</option>
            <option value="none">ללא שכבת ציפוי</option>
          </select>
        </div>

        {overlay.mode === 'solid' && (
          <PageBuilderColorPicker
            label="צבע ציפוי סוליד"
            value={overlay.solidColor || '#000000'}
            onChange={(color) => updateOverlay('solidColor', color)}
          />
        )}

        {overlay.mode === 'image' && (
          <PageBuilderImageUpload
            label="תמונת ציפוי"
            value={overlay.imageUrl || ''}
            onChange={(url) => updateOverlay('imageUrl', url)}
          />
        )}

        <div className="flex flex-col gap-1.5 mt-3">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-300">רמת שקיפות הציפוי</label>
            <span className="font-mono text-purple-400 font-bold">{overlay.opacity ?? 40}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={overlay.opacity ?? 40}
            onChange={(e) => updateOverlay('opacity', parseInt(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mt-4">
          <label className="text-xs font-semibold text-slate-300">הילה סביבתית זוהרת (Ambient Glow)</label>
          <input
            type="checkbox"
            checked={config.ambientGlow ?? true}
            onChange={(e) => update('ambientGlow', e.target.checked)}
            className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>

        <div className="mt-3">
          <PageBuilderColorPicker
            label="צבע רקע כללי של האזור"
            value={config.backgroundColor || 'transparent'}
            onChange={(color) => update('backgroundColor', color)}
          />
        </div>
      </PageBuilderAccordion>

      {/* 3. Main Hook Headline */}
      <PageBuilderAccordion id="headline" title="כותרת ראשית (Hook Headline)" icon={<Type className="w-4 h-4 text-emerald-400" />}>
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3">
          <label className="text-xs font-semibold text-slate-300">הצג כותרת ראשית</label>
          <input
            type="checkbox"
            checked={config.showHeadline ?? true}
            onChange={(e) => update('showHeadline', e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>

        {(config.showHeadline ?? true) && (
          <>
            <PageBuilderInput
              label="טקסט הכותרת הראשית"
              value={config.headline || ''}
              onChange={(e) => update('headline', e.target.value)}
              placeholder="למשל: מחפש עבודה"
            />

            <div className="mt-3">
              <PageBuilderColorPicker
                label="צבע כותרת"
                value={config.headlineColor || '#ffffff'}
                onChange={(color) => update('headlineColor', color)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">גודל גופן</label>
                <select
                  value={config.headlineSize || 'xl'}
                  onChange={(e) => update('headlineSize', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="sm">קטן (Small)</option>
                  <option value="md">בינוני (Medium)</option>
                  <option value="lg">גדול (Large)</option>
                  <option value="xl">ענק (Extra Large)</option>
                  <option value="2xl">עוצמתי (2XL)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">משקל גופן</label>
                <select
                  value={config.headlineWeight || 'extrabold'}
                  onChange={(e) => update('headlineWeight', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="bold">מודגש (Bold)</option>
                  <option value="extrabold">מודגש במיוחד (Extra Bold)</option>
                  <option value="black">שחור כבד (Black)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mt-3">
              <label className="text-xs font-semibold text-slate-300">צל מודגש לקריאות גבוהה (Text Drop Shadow)</label>
              <input
                type="checkbox"
                checked={config.headlineShadow ?? true}
                onChange={(e) => update('headlineShadow', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer"
              />
            </div>
          </>
        )}
      </PageBuilderAccordion>

      {/* 4. Floating Content Card */}
      <PageBuilderAccordion id="card" title="כרטיס מידע צף" icon={<Square className="w-4 h-4 text-amber-400" />}>
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3">
          <label className="text-xs font-semibold text-slate-300">הצג כרטיס תוכן צף מעל הוידאו</label>
          <input
            type="checkbox"
            checked={card.enabled ?? true}
            onChange={(e) => updateCard('enabled', e.target.checked)}
            className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>

        {card.enabled && (
          <div className="space-y-3">
            {/* Control Toggles: Image, Tag, Text */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={card.showImage ?? true}
                  onChange={(e) => updateCard('showImage', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700"
                />
                <span>הצג תמונה</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={card.showTag ?? true}
                  onChange={(e) => updateCard('showTag', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700"
                />
                <span>הצג תגית</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={card.showText ?? true}
                  onChange={(e) => updateCard('showText', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700"
                />
                <span>הצג כיתוב וטקסט</span>
              </label>
            </div>

            {(card.showImage ?? true) && (
              <PageBuilderImageUpload
                label="תמונה / לוגו לכרטיס (אופציונלי)"
                value={card.imageUrl || ''}
                onChange={(url) => updateCard('imageUrl', url)}
              />
            )}

            {(card.showTag ?? true) && (
              <PageBuilderInput
                label="תגית עליונה של הכרטיס"
                value={card.tag || ''}
                onChange={(e) => updateCard('tag', e.target.value)}
                placeholder="למשל: קושאן – כל אדם זה נכס"
              />
            )}

            {(card.showText ?? true) && (
              <>
                <PageBuilderInput
                  label="כותרת הכרטיס"
                  value={card.title || ''}
                  onChange={(e) => updateCard('title', e.target.value)}
                  placeholder="כותרת הכרטיס"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">תת-כותרת / תיאור</label>
                  <textarea
                    value={card.subtitle || ''}
                    onChange={(e) => updateCard('subtitle', e.target.value)}
                    rows={2}
                    placeholder="פירוט קצר..."
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">סגנון עיצוב הכרטיס</label>
              <select
                value={card.style || 'solid'}
                onChange={(e) => updateCard('style', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="solid">סוליד לבן (נקי ובולט)</option>
                <option value="glass">זכוכית מודרנית (Glassmorphism שקוף)</option>
                <option value="bordered">מסגרת זוהרת (Bordered Glow)</option>
              </select>
            </div>
          </div>
        )}
      </PageBuilderAccordion>

      {/* 5. CTA Button with Lucide Icon or Gallery Image */}
      <PageBuilderAccordion id="cta" title="כפתור הנעה לפעולה (CTA)" icon={<Sparkles className="w-4 h-4 text-sky-400" />}>
        <PageBuilderInput
          label="טקסט הכפתור"
          value={cta.text || ''}
          onChange={(e) => updateCta('text', e.target.value)}
          placeholder="מצא עכשיו"
        />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">שוליים פנימיים (ריווח טקסט)</label>
            <select
              value={cta.paddingY || 'compact'}
              onChange={(e) => updateCta('paddingY', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="compact">מצומצם / קומפקטי (מומלץ)</option>
              <option value="normal">רגיל</option>
              <option value="spacious">מרווח</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">מיקום האייקון בכפתור</label>
            <select
              value={cta.iconPosition || 'left'}
              onChange={(e) => updateCta('iconPosition', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="right">מימין לטקסט</option>
              <option value="left">משמאל לטקסט</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <PageBuilderColorPicker
            label="צבע רקע כפתור"
            value={cta.bgColor || '#0284c7'}
            onChange={(color) => updateCta('bgColor', color)}
          />
          <PageBuilderColorPicker
            label="צבע טקסט כפתור"
            value={cta.textColor || '#ffffff'}
            onChange={(color) => updateCta('textColor', color)}
          />
        </div>

        <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">הצג אייקון או תמונה בכפתור</label>
            <input
              type="checkbox"
              checked={cta.showIcon ?? true}
              onChange={(e) => updateCta('showIcon', e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
          </div>

          {(cta.showIcon ?? true) && (
            <>
              <PageBuilderImageUpload
                label="העלאת תמונה / לוגו מהגלריה במקום אייקון"
                value={cta.customIconUrl || ''}
                onChange={(url) => updateCta('customIconUrl', url)}
              />

              {!cta.customIconUrl && (
                <div className="mt-2">
                  <PageBuilderIconPicker
                    label="או בחירת אייקון מתוך ספריית Lucide"
                    value={cta.iconName || 'Sparkles'}
                    onChange={(iconName) => updateCta('iconName', iconName)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mt-3">
          <label className="text-xs font-semibold text-slate-300">אפקט פולס עדין (Pulse Effect)</label>
          <input
            type="checkbox"
            checked={cta.pulseEffect ?? true}
            onChange={(e) => updateCta('pulseEffect', e.target.checked)}
            className="w-4 h-4 rounded text-sky-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5 mt-3">
          <label className="text-xs font-semibold text-slate-300">פעולת לחיצה</label>
          <select
            value={cta.actionType || 'modal_form'}
            onChange={(e) => updateCta('actionType', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
          >
            <option value="modal_form">פתיחת מודאל עם טופס לידים (מומלץ)</option>
            <option value="link">מעבר לקישור חיצוני / עמוד אחר</option>
          </select>
        </div>

        {cta.actionType === 'link' && (
          <div className="mt-3">
            <PageBuilderInput
              label="כתובת קישור (URL)"
              value={cta.linkUrl || ''}
              onChange={(e) => updateCta('linkUrl', e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
            />
          </div>
        )}
      </PageBuilderAccordion>

      {/* 6. Lead Form Modal & KFS Configuration */}
      {cta.actionType === 'modal_form' && (
        <PageBuilderAccordion
          id="modal_form"
          title="הגדרות מודאל טופס לידים, סליקה ו-WhatsApp"
          icon={<FormInput className="w-4 h-4 text-emerald-400" />}
        >
          <PageBuilderInput
            label="כותרת חלון המודאל"
            value={config.modalTitle || ''}
            onChange={(e) => update('modalTitle', e.target.value)}
            placeholder="למשל: השארת פרטים לקבלת הצעה"
          />

          <div className="mt-3">
            <PageBuilderInput
              label="תת-כותרת חלון המודאל"
              value={config.modalSubtitle || ''}
              onChange={(e) => update('modalSubtitle', e.target.value)}
              placeholder="למשל: מלאו את הפרטים ונחזור אליכם בהקדם"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <ContactFormConfigEditor
              value={config.form || DEFAULT_CONTACT_FORM_CONFIG}
              formId={config.formId}
              onFormIdChange={(id) => update('formId', id)}
              onChange={(formConfig) => update('form', formConfig)}
            />
          </div>
        </PageBuilderAccordion>
      )}

      {/* 7. Anchor Settings */}
      <PageBuilderAccordion id="anchor" title="עוגן מזהה (Anchor)" icon={<SlidersHorizontal className="w-4 h-4 text-slate-400" />}>
        <PageBuilderInput
          label="עוגן ניווט (Anchor ID)"
          value={config.anchorId || ''}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="tiktok-hero"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </PageBuilderAccordionGroup>
  </div>
);
};
