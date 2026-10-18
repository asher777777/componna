import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Sparkles, Smartphone, Monitor, CheckCircle2,
  Save, MessageSquare, User, Image as ImageIcon, Sliders
} from 'lucide-react';
import { ConciergePageUiConfig } from '../types';
import { KOS_LIVE_AVATARS } from '../config';
import {
  LivingStorageService,
  DEFAULT_CONCIERGE_PAGE_UI_CONFIG
} from '../services/livingStorageService';
import { useKosLive } from '../context/KosLiveContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';

const GREETING_PRESETS = [
  'שלום! אפשר לעזור לך?',
  'לחצו לצפייה בעמוד החי',
  'יש לכם שאלה? דברו איתי',
  'גלו את ההצעה המיוחדת שלנו'
];

export const PageUiSettingsEditor: React.FC = () => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { projects, activeProject } = useKosLive();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [config, setConfig] = useState<ConciergePageUiConfig>(() => ({
    ...DEFAULT_CONCIERGE_PAGE_UI_CONFIG,
    ...LivingStorageService.getLocalPageUiConfig(tenantId)
  }));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    LivingStorageService.loadPageUiConfig(db as any, tenantId).then(loaded => {
      if (mounted && loaded) {
        setConfig(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, [db, tenantId]);

  const updateAndSave = async (patch: Partial<ConciergePageUiConfig>) => {
    const nextConfig: ConciergePageUiConfig = {
      ...config,
      ...patch
    };
    setConfig(nextConfig);
    setIsSaving(true);
    try {
      await LivingStorageService.savePageUiConfig(db as any, tenantId, nextConfig);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickCustomAvatarImage = async () => {
    if (!mediaPicker) return;
    try {
      const selected = await mediaPicker.openPicker({ accept: 'image/*', multiple: false });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (typeof url === 'string') {
          updateAndSave({ customAvatarImageUrl: url });
        }
      }
    } catch (err) {
      console.warn('[PageUiSettingsEditor] Error picking avatar image:', err);
    }
  };

  const selectedAvatar =
    KOS_LIVE_AVATARS.find(a => a.id === config.avatarId) || KOS_LIVE_AVATARS[1];
  const previewAvatarImage = config.customAvatarImageUrl || selectedAvatar.previewImageUrl;

  return (
    <div
      className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 text-right font-sans select-none"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                אזור עריכת תצוגת ה-UI והאווטאר בעמוד
              </h3>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  config.isVisibleOnPage
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {config.isVisibleOnPage ? 'ה-UI גלוי בעמוד' : 'ה-UI נסתר בעמוד (ברירת מחדל)'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              קבעו אם ה-UI בעמוד גלוי או נסתר (כברירת מחדל: נסתר), וערכו את הטקסט שמופיע ליד תמונת האווטאר (מוסתר אוטומטית במובייל).
            </p>
          </div>
        </div>

        {savedToast && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>ההגדרות נשמרו והוחלו!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Settings Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* א. קביעה אם ה-UI בעמוד גלוי או נסתר (ברירת מחדל: נסתר) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-black text-amber-400">
              א. נראות ה-UI בעמוד (גלוי / נסתר - כברירת מחדל נסתר):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateAndSave({ isVisibleOnPage: false })}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-black transition cursor-pointer ${
                  !config.isVisibleOnPage
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>נסתר בעמוד (ברירת מחדל)</span>
              </button>

              <button
                type="button"
                onClick={() => updateAndSave({ isVisibleOnPage: true })}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-black transition cursor-pointer ${
                  config.isVisibleOnPage
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>גלוי בעמוד</span>
              </button>
            </div>
          </div>

          {/* ב. עריכת הטקסט ליד תמונת האווטאר והסתרתו במובייל */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>ב. הטקסט שמופיע ליד תמונת האווטאר:</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                מוסתר אוטומטית במובייל
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={config.greetingText}
                onChange={e => setConfig({ ...config, greetingText: e.target.value })}
                onBlur={() => updateAndSave({ greetingText: config.greetingText })}
                placeholder="הקלידו את הטקסט שיופיע ליד תמונת האווטאר..."
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => updateAndSave({ greetingText: config.greetingText })}
                disabled={isSaving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>שמור טקסט</span>
              </button>
            </div>

            {/* Quick text presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold ml-1">משפטים מהירים:</span>
              {GREETING_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateAndSave({ greetingText: preset })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    config.greetingText === preset
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Mobile & Desktop text visibility checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hideTextOnMobile !== false}
                  onChange={e => updateAndSave({ hideTextOnMobile: e.target.checked })}
                  className="accent-amber-500 w-4 h-4"
                />
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold">במובייל הסתר את הטקסט ליד האווטאר</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTextOnDesktop !== false}
                  onChange={e => updateAndSave({ showTextOnDesktop: e.target.checked })}
                  className="accent-amber-500 w-4 h-4"
                />
                <Monitor className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold">במחשב הצג את הטקסט ליד האווטאר</span>
              </label>
            </div>
          </div>

          {/* בחירת אווטאר, מיקום וקמפיין */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>תמונת האווטאר, מיקום וקמפיין פעיל:</span>
              </label>
              <button
                type="button"
                onClick={handlePickCustomAvatarImage}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <ImageIcon className="w-3 h-3 text-amber-400" />
                <span>בחר תמונה מכספת המדיה</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {KOS_LIVE_AVATARS.map(av => (
                <div
                  key={av.id}
                  onClick={() =>
                    updateAndSave({
                      avatarId: av.id,
                      customAvatarImageUrl: undefined
                    })
                  }
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    config.avatarId === av.id && !config.customAvatarImageUrl
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={av.previewImageUrl}
                    alt={av.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <span className="text-[11px] font-bold truncate">{av.name.split('-')[0]}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  מיקום האווטאר בעמוד:
                </label>
                <select
                  value={config.position}
                  onChange={e => updateAndSave({ position: e.target.value as 'bottom-left' | 'bottom-right' })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="bottom-left">פינה שמאלית תחתונה (Bottom Left)</option>
                  <option value="bottom-right">פינה ימנית תחתונה (Bottom Right)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  פרויקט עמוד חי שייפתח בלחיצה:
                </label>
                <select
                  value={config.activeCampaignId || activeProject?.id || 'demo-living-page'}
                  onChange={e => updateAndSave({ activeCampaignId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="demo-living-page">ברירת מחדל (Demo Living Page)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Preview for Desktop vs Mobile (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-black text-white mb-1">
              תצוגה מקדימה חיה (מחשב מול מובייל)
            </h4>
            <p className="text-[11px] text-slate-400">
              כך ייראה האווטאר בעמוד כאשר מצב הנראות מוגדר כ״גלוי״:
            </p>
          </div>

          {/* 1. Desktop Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>תצוגת מחשב (Desktop)</span>
              </span>
              <span className="text-[10px] text-emerald-400">הטקסט מוצג ליד האווטאר</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 py-2 px-3 bg-slate-950 rounded-xl border border-slate-800/80">
              {config.showTextOnDesktop !== false && config.greetingText.trim() && (
                <div className="bg-slate-900 border border-amber-500/50 text-white px-3.5 py-2 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{config.greetingText}</span>
                </div>
              )}
              <div className="relative w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-lg shrink-0">
                <img
                  src={previewAvatarImage}
                  alt={selectedAvatar.name}
                  className="w-full h-full object-cover rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
            </div>
          </div>

          {/* 2. Mobile Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>תצוגת מובייל (Mobile)</span>
              </span>
              <span className="text-[10px] text-amber-400">
                {config.hideTextOnMobile !== false ? 'הטקסט מוסתר במובייל' : 'הטקסט גלוי במובייל'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 py-2 px-3 bg-slate-950 rounded-xl border border-slate-800/80">
              {config.hideTextOnMobile === false && config.greetingText.trim() && (
                <div className="bg-slate-900 border border-amber-500/50 text-white px-3 py-1.5 rounded-2xl shadow-lg text-[11px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{config.greetingText}</span>
                </div>
              )}
              <div className="relative w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-lg shrink-0">
                <img
                  src={previewAvatarImage}
                  alt={selectedAvatar.name}
                  className="w-full h-full object-cover rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
            </div>
          </div>

          {/* Summary note */}
          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            מצב נוכחי בעמוד:{' '}
            <strong className={config.isVisibleOnPage ? 'text-emerald-400' : 'text-amber-400'}>
              {config.isVisibleOnPage ? 'גלוי ופעיל' : 'נסתר (ברירת מחדל)'}
            </strong>
            . כל שינוי נשמר אוטומטית ומתעדכן בזמן אמת בכל עמודי המערכת.
          </div>
        </div>
      </div>
    </div>
  );
};
