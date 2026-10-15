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
  SlidersHorizontal,
  Paintbrush,
  Maximize2,
  Layout,
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

        {/* 2. Backgrounds: Behind Video & In Front of Video (Overlays) */}
        <PageBuilderAccordion id="backgrounds" title="רקעים (מאחורי הוידאו ולפני הוידאו)" icon={<Layers className="w-4 h-4 text-purple-400" />}>
          {/* A. Background Behind Video */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Paintbrush className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">1. רקע מאחורי הוידאו (רקע האזור כולו)</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">סוג רקע מאחורי הוידאו</label>
              <select
                value={config.backgroundType || 'transparent'}
                onChange={(e) => update('backgroundType', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="transparent">שקוף / לפי עיצוב האתר</option>
                <option value="solid">צבע אחיד (Solid)</option>
                <option value="gradient">גרדיאנט יוקרתי (Gradient)</option>
                <option value="image">תמונת רקע (Background Image)</option>
              </select>
            </div>

            {config.backgroundType === 'solid' && (
              <PageBuilderColorPicker
                label="צבע רקע מאחורי הוידאו"
                value={config.backgroundColor || '#0a0f1d'}
                onChange={(color) => update('backgroundColor', color)}
              />
            )}

            {config.backgroundType === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <PageBuilderColorPicker
                    label="מצבע"
                    value={config.backgroundGradientFrom || '#0b0f19'}
                    onChange={(color) => update('backgroundGradientFrom', color)}
                  />
                  <PageBuilderColorPicker
                    label="עד צבע"
                    value={config.backgroundGradientTo || '#1e1b4b'}
                    onChange={(color) => update('backgroundGradientTo', color)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">כיוון הגרדיאנט</label>
                  <select
                    value={config.backgroundGradientDirection || 'to-b'}
                    onChange={(e) => update('backgroundGradientDirection', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="to-b">מלמעלה למטה</option>
                    <option value="to-t">מלמטה למעלה</option>
                    <option value="to-r">משמאל לימין</option>
                    <option value="to-l">מימין לשמאל</option>
                    <option value="to-br">באלכסון (מלמעלה-שמאל למטה-ימין)</option>
                  </select>
                </div>
              </div>
            )}

            {config.backgroundType === 'image' && (
              <PageBuilderImageUpload
                label="תמונת רקע מאחורי הוידאו"
                value={config.backgroundImageUrl || ''}
                onChange={(url) => update('backgroundImageUrl', url)}
              />
            )}

            {/* Ambient Glow */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">הילת תאורה זוהרת מאחורי הוידאו (Ambient Glow)</label>
                <input
                  type="checkbox"
                  checked={config.ambientGlow ?? true}
                  onChange={(e) => update('ambientGlow', e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>

              {(config.ambientGlow ?? true) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <PageBuilderColorPicker
                    label="צבע ההילה"
                    value={config.ambientGlowColor || '#4f46e5'}
                    onChange={(color) => update('ambientGlowColor', color)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">עוצמת ההילה</span>
                      <span className="font-mono text-purple-400 font-bold">{config.ambientGlowOpacity ?? 30}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={config.ambientGlowOpacity ?? 30}
                      onChange={(e) => update('ambientGlowOpacity', parseInt(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* B. Foreground Overlay directly in front of the video */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 mt-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">2. שכבת רקע וציפוי לפני הוידאו (Front Overlay)</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">סוג שכבת הציפוי מעל הוידאו</label>
              <select
                value={overlay.mode || 'gradient'}
                onChange={(e) => updateOverlay('mode', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="gradient">גרדיאנט (Gradient עדין לקריאות מושלמת)</option>
                <option value="solid">צבע אחיד (Solid Color עם שקיפות)</option>
                <option value="vignette">אפקט האפלת שוליים (Vignette דרמטי)</option>
                <option value="image">תמונת פילטר / טקסטורה (Image Overlay)</option>
                <option value="none">ללא שכבת ציפוי</option>
              </select>
            </div>

            {overlay.mode === 'gradient' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">כיוון הגרדיאנט מעל הוידאו</label>
                <select
                  value={overlay.gradientDirection || 'to-t'}
                  onChange={(e) => updateOverlay('gradientDirection', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="to-t">מלמטה למעלה (החשכת התחתית לכרטיס ולכפתור)</option>
                  <option value="to-b">מלמעלה למטה (החשכת החלק העליון לכותרת)</option>
                  <option value="radial">מעגלי מהמרכז לשוליים (Radial)</option>
                  <option value="to-r">משמאל לימין</option>
                  <option value="to-l">מימין לשמאל</option>
                </select>
              </div>
            )}

            {overlay.mode === 'solid' && (
              <PageBuilderColorPicker
                label="צבע ציפוי סוליד מעל הוידאו"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">שקיפות הציפוי</label>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">טשטוש רקע מעל הוידאו (Backdrop Blur)</label>
                <select
                  value={overlay.blur || 'none'}
                  onChange={(e) => updateOverlay('blur', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="none">ללא טשטוש</option>
                  <option value="sm">טשטוש עדין (Blur Sm)</option>
                  <option value="md">טשטוש בינוני (Blur Md)</option>
                  <option value="lg">טשטוש משמעותי (Blur Lg)</option>
                </select>
              </div>
            </div>
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
            <div className="space-y-3">
              <PageBuilderInput
                label="טקסט הכותרת הראשית"
                value={config.headline || ''}
                onChange={(e) => update('headline', e.target.value)}
                placeholder="למשל: מחפש עבודה"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">מיקום הכותרת</label>
                  <select
                    value={config.headlinePosition || 'top'}
                    onChange={(e) => update('headlinePosition', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="top">מעל מסגרת הוידאו (עליון חיצוני)</option>
                    <option value="inside-top">בתוך מסגרת הוידאו (עליון פנימי)</option>
                    <option value="above-card">מעל הכרטיס הצף ישירות</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">יישור הכותרת</label>
                  <select
                    value={config.headlineAlign || 'center'}
                    onChange={(e) => update('headlineAlign', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="center">מרכז</option>
                    <option value="right">ימין</option>
                    <option value="left">שמאל</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">גודל גופן</label>
                  <select
                    value={config.headlineSize || 'xl'}
                    onChange={(e) => update('headlineSize', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="xs">קטן מאוד (XS)</option>
                    <option value="sm">קטן (Small)</option>
                    <option value="md">בינוני (Medium)</option>
                    <option value="lg">גדול (Large)</option>
                    <option value="xl">ענק (Extra Large)</option>
                    <option value="2xl">עוצמתי (2XL)</option>
                    <option value="3xl">ענקי (3XL)</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע כותרת"
                  value={config.headlineColor || '#ffffff'}
                  onChange={(color) => update('headlineColor', color)}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">מרווח תחתון (Margin)</label>
                  <select
                    value={config.headlineMarginBottom || 'normal'}
                    onChange={(e) => update('headlineMarginBottom', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="none">ללא מרווח</option>
                    <option value="compact">מצומצם</option>
                    <option value="normal">רגיל</option>
                    <option value="spacious">מרווח</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">צל מודגש לקריאות גבוהה (Text Drop Shadow)</label>
                <input
                  type="checkbox"
                  checked={config.headlineShadow ?? true}
                  onChange={(e) => update('headlineShadow', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
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
              {/* Placement & Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">מיקום הכרטיס בוידאו</label>
                  <select
                    value={card.position || 'bottom'}
                    onChange={(e) => updateCard('position', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="top">למעלה בוידאו</option>
                    <option value="center">במרכז הוידאו</option>
                    <option value="bottom">בתחתית הוידאו (מומלץ)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">רוחב הכרטיס</label>
                  <select
                    value={card.width || 'full'}
                    onChange={(e) => updateCard('width', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="full">רוחב מלא (בתוך המסגרת)</option>
                    <option value="compact">קומפקטי וממורכז</option>
                    <option value="wide">רחב (Wide)</option>
                    <option value="auto">צמוד לתוכן (Auto)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">יישור טקסט</label>
                  <select
                    value={card.textAlign || 'right'}
                    onChange={(e) => updateCard('textAlign', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="right">ימין</option>
                    <option value="center">מרכז</option>
                    <option value="left">שמאל</option>
                  </select>
                </div>
              </div>

              {/* Style, Shape, Padding */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">סגנון עיצוב הכרטיס</label>
                  <select
                    value={card.style || 'solid'}
                    onChange={(e) => updateCard('style', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="solid">סוליד לבן (נקי ובולט)</option>
                    <option value="glass">זכוכית מודרנית (Glass שקוף)</option>
                    <option value="bordered">מסגרת זוהרת (Bordered Glow)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">צורת הכרטיס</label>
                  <select
                    value={card.shape || 'rounded'}
                    onChange={(e) => updateCard('shape', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="rounded">פינות מעוגלות סטנדרטיות</option>
                    <option value="pill">גלולה מעוגלת עמוקה (Pill)</option>
                    <option value="asymmetric">עיצוב אסימטרי יוקרתי</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">ריווח פנימי (Padding)</label>
                  <select
                    value={card.padding || 'normal'}
                    onChange={(e) => updateCard('padding', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="compact">קומפקטי</option>
                    <option value="normal">רגיל</option>
                    <option value="spacious">מרווח</option>
                  </select>
                </div>
              </div>

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
                  label="תמונה / לוגו לכרטיס"
                  value={card.imageUrl || ''}
                  onChange={(url) => updateCard('imageUrl', url)}
                />
              )}

              {(card.showTag ?? true) && (
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <PageBuilderInput
                    label="תגית עליונה של הכרטיס"
                    value={card.tag || ''}
                    onChange={(e) => updateCard('tag', e.target.value)}
                    placeholder="למשל: קושאן – כל אדם זה נכס"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">גודל גופן תגית</label>
                      <select
                        value={card.tagSize || 'xs'}
                        onChange={(e) => updateCard('tagSize', e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        <option value="xs">קטן מאוד</option>
                        <option value="sm">קטן</option>
                        <option value="md">בינוני</option>
                      </select>
                    </div>
                    <PageBuilderColorPicker
                      label="צבע טקסט תגית"
                      value={card.tagColor || '#475569'}
                      onChange={(color) => updateCard('tagColor', color)}
                    />
                    <PageBuilderColorPicker
                      label="צבע רקע תגית"
                      value={card.tagBgColor || 'transparent'}
                      onChange={(color) => updateCard('tagBgColor', color)}
                    />
                  </div>
                </div>
              )}

              {(card.showText ?? true) && (
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <PageBuilderInput
                    label="כותרת הכרטיס"
                    value={card.title || ''}
                    onChange={(e) => updateCard('title', e.target.value)}
                    placeholder="כותרת הכרטיס"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">גודל גופן כותרת כרטיס</label>
                      <select
                        value={card.titleSize || 'sm'}
                        onChange={(e) => updateCard('titleSize', e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        <option value="xs">קטן (XS)</option>
                        <option value="sm">רגיל (SM)</option>
                        <option value="md">בינוני (MD)</option>
                        <option value="lg">גדול (LG)</option>
                        <option value="xl">ענק (XL)</option>
                      </select>
                    </div>
                    <PageBuilderColorPicker
                      label="צבע כותרת כרטיס"
                      value={card.titleColor || '#0f172a'}
                      onChange={(color) => updateCard('titleColor', color)}
                    />
                  </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">גודל גופן תת-כותרת</label>
                      <select
                        value={card.subtitleSize || 'xs'}
                        onChange={(e) => updateCard('subtitleSize', e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        <option value="xs">קטן מאוד</option>
                        <option value="sm">רגיל</option>
                        <option value="md">בינוני</option>
                      </select>
                    </div>
                    <PageBuilderColorPicker
                      label="צבע תת-כותרת"
                      value={card.subtitleColor || '#334155'}
                      onChange={(color) => updateCard('subtitleColor', color)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </PageBuilderAccordion>

        {/* 5. CTA Button with full sizing and placement controls */}
        <PageBuilderAccordion id="cta" title="כפתור הנעה לפעולה מעל הוידאו (CTA)" icon={<Sparkles className="w-4 h-4 text-sky-400" />}>
          <PageBuilderInput
            label="טקסט הכפתור"
            value={cta.text || ''}
            onChange={(e) => updateCta('text', e.target.value)}
            placeholder="מצא עכשיו"
          />

          {/* Positioning & Placement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">מיקום הכפתור</label>
              <select
                value={cta.position || 'inside-card'}
                onChange={(e) => updateCta('position', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="inside-card">בתוך הכרטיס הצף (מובנה)</option>
                <option value="below-card">מתחת לכרטיס הצף ישירות</option>
                <option value="center-video">במרכז הוידאו (בולט)</option>
                <option value="bottom-floating">צף בתחתית הוידאו באופן עצמאי</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">יישור הכפתור</label>
              <select
                value={cta.align || 'center'}
                onChange={(e) => updateCta('align', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="center">מרכז</option>
                <option value="right">ימין</option>
                <option value="left">שמאל</option>
                <option value="stretch">רוחב מלא מתוח (Stretch)</option>
              </select>
            </div>
          </div>

          {/* Sizing Controls (Requirement ג) */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 mt-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Maximize2 className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white">הגדרת גודל ומימדי הכפתור מעל הוידאו</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">גודל כפתור כללי</label>
                <select
                  value={cta.buttonSize || 'normal'}
                  onChange={(e) => updateCta('buttonSize', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="compact">קומפקטי (Compact)</option>
                  <option value="normal">רגיל (Normal)</option>
                  <option value="spacious">מרווח (Spacious)</option>
                  <option value="huge">ענק / בולט (Huge)</option>
                  <option value="fullWidth">רוחב מלא (Full Width)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">מצב רוחב הכפתור</label>
                <select
                  value={cta.widthMode || 'auto'}
                  onChange={(e) => updateCta('widthMode', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="auto">אוטומטי (לפי תוכן)</option>
                  <option value="full">רוחב מלא (100%)</option>
                  <option value="fixed">רוחב מותאם אישית (פיקסלים)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">גודל טקסט בכפתור</label>
                <select
                  value={cta.fontSize || 'sm'}
                  onChange={(e) => updateCta('fontSize', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="xs">קטן (XS)</option>
                  <option value="sm">רגיל (SM)</option>
                  <option value="md">בינוני (MD)</option>
                  <option value="lg">גדול (LG)</option>
                  <option value="xl">ענק (XL)</option>
                </select>
              </div>
            </div>

            {cta.widthMode === 'fixed' && (
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">רוחב הכפתור בפיקסלים</label>
                  <span className="font-mono text-sky-400 font-bold">{cta.customWidthPx || 220}px</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="400"
                  step="10"
                  value={cta.customWidthPx || 220}
                  onChange={(e) => updateCta('customWidthPx', parseInt(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">שוליים פנימיים (ריווח טקסט)</label>
                <select
                  value={cta.paddingY || 'compact'}
                  onChange={(e) => updateCta('paddingY', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="compact">מצומצם / קומפקטי</option>
                  <option value="normal">רגיל</option>
                  <option value="spacious">מרווח ועשיר</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">צורת הכפתור</label>
                <select
                  value={cta.shape || 'pill'}
                  onChange={(e) => updateCta('shape', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="pill">גלולה מעוגלת (Pill)</option>
                  <option value="rounded">מעוגל קל (Rounded)</option>
                  <option value="sharp">פינות חדות מודרניות</option>
                </select>
              </div>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">מיקום האייקון</label>
                    <select
                      value={cta.iconPosition || 'left'}
                      onChange={(e) => updateCta('iconPosition', e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                    >
                      <option value="right">מימין לטקסט</option>
                      <option value="left">משמאל לטקסט</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">גודל האייקון</label>
                    <select
                      value={cta.iconSize || 'md'}
                      onChange={(e) => updateCta('iconSize', e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                    >
                      <option value="sm">קטן</option>
                      <option value="md">בינוני</option>
                      <option value="lg">גדול</option>
                    </select>
                  </div>
                </div>

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
              <option value="modal_form">פתיחת מודאל עם טופס לידים (KSF)</option>
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

        {/* 6. Lead Form Modal & Modal Submit Button & KSF Integration */}
        {cta.actionType === 'modal_form' && (
          <PageBuilderAccordion
            id="modal_form"
            title="מודאל טופס לידים, כפתור המודל ורכיב הטפסים"
            icon={<FormInput className="w-4 h-4 text-emerald-400" />}
          >
            {/* Modal Window Framing & Styles */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Layout className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">עיצוב מסגרת חלון המודאל</span>
              </div>

              <PageBuilderInput
                label="כותרת חלון המודאל"
                value={config.modalTitle || ''}
                onChange={(e) => update('modalTitle', e.target.value)}
                placeholder="למשל: השארת פרטים לקבלת הצעה"
              />

              <PageBuilderInput
                label="תת-כותרת חלון המודאל"
                value={config.modalSubtitle || ''}
                onChange={(e) => update('modalSubtitle', e.target.value)}
                placeholder="למשל: מלאו את הפרטים ונחזור אליכם בהקדם"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">רוחב חלון מודאל</label>
                  <select
                    value={config.modalMaxWidth || 'md'}
                    onChange={(e) => update('modalMaxWidth', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="sm">קומפקטי (SM)</option>
                    <option value="md">רגיל (MD)</option>
                    <option value="lg">מרווח (LG)</option>
                    <option value="xl">רחב (XL)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">סגנון חלון המודאל</label>
                  <select
                    value={config.modalEffect || 'glass'}
                    onChange={(e) => update('modalEffect', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="glass">זכוכית מודרנית (Glassmorphism)</option>
                    <option value="neon">מסגרת ניאון זוהרת (Neon)</option>
                    <option value="aura">הילה מרחפת (Aura)</option>
                    <option value="shadow-luxury">צל עמוק יוקרתי (Luxury Shadow)</option>
                    <option value="flat">שטוח ונקי (Flat)</option>
                    <option value="gradient-border">מסגרת גרדיאנטית (Gradient Border)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">צורת חלון המודאל</label>
                  <select
                    value={config.modalShape || 'rounded-3xl'}
                    onChange={(e) => update('modalShape', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="rounded-2xl">מעוגל קלאסי (2XL)</option>
                    <option value="rounded-3xl">מעוגל יוקרתי (3XL)</option>
                    <option value="rounded-capsule">גלולה (Capsule)</option>
                    <option value="rounded-asymmetric">אסימטרי מעוצב</option>
                    <option value="rounded-sharp">פינות ישרות</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <PageBuilderColorPicker
                  label="צבע רקע חלון מודאל"
                  value={config.modalBgColor || '#0f172a'}
                  onChange={(color) => update('modalBgColor', color)}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">טשטוש רקע מאחורי המודאל (Backdrop Blur)</label>
                  <select
                    value={config.modalBackdropBlur || 'md'}
                    onChange={(e) => update('modalBackdropBlur', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="none">ללא טשטוש</option>
                    <option value="sm">טשטוש עדין (SM)</option>
                    <option value="md">טשטוש בינוני (MD)</option>
                    <option value="lg">טשטוש חזק (LG)</option>
                    <option value="xl">טשטוש מקסימלי (XL)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Submit Button Settings (Requirement א) */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 mt-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">כפתור המודל (גודל, טקסט ועיצוב)</span>
              </div>

              <PageBuilderInput
                label="טקסט כפתור השליחה במודאל"
                value={config.modalButtonText || ''}
                onChange={(e) => update('modalButtonText', e.target.value)}
                placeholder="למשל: שלח פנייה עכשיו"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">גודל כפתור המודל</label>
                  <select
                    value={config.modalButtonSize || 'spacious'}
                    onChange={(e) => update('modalButtonSize', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="compact">קומפקטי</option>
                    <option value="normal">רגיל</option>
                    <option value="spacious">מרווח (מומלץ)</option>
                    <option value="fullWidth">רוחב מלא</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">גודל טקסט כפתור המודל</label>
                  <select
                    value={config.modalButtonFontSize || 'md'}
                    onChange={(e) => update('modalButtonFontSize', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="xs">קטן (XS)</option>
                    <option value="sm">רגיל (SM)</option>
                    <option value="md">בינוני (MD)</option>
                    <option value="lg">גדול (LG)</option>
                    <option value="xl">ענק (XL)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">צורת כפתור המודל</label>
                  <select
                    value={config.modalButtonShape || 'capsule'}
                    onChange={(e) => update('modalButtonShape', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="capsule">גלולה מעוגלת (Capsule)</option>
                    <option value="rounded">מעוגל קל</option>
                    <option value="square">פינות ישרות</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <PageBuilderColorPicker
                  label="צבע רקע כפתור המודל"
                  value={config.modalButtonBgColor || '#4f46e5'}
                  onChange={(color) => update('modalButtonBgColor', color)}
                />
                <PageBuilderColorPicker
                  label="צבע טקסט כפתור המודל"
                  value={config.modalButtonTextColor || '#ffffff'}
                  onChange={(color) => update('modalButtonTextColor', color)}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">אפקט פולס עדין לכפתור המודל</span>
                <input
                  type="checkbox"
                  checked={config.modalButtonPulse ?? true}
                  onChange={(e) => update('modalButtonPulse', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* KSF Form Builder & CRM Fields (Requirement ב) */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300 mb-2">
                חיבור לטפסי KSF, הגדרות שדות, סליקה ו-WhatsApp:
              </div>
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
