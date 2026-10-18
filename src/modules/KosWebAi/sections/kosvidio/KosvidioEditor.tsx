import React from 'react';
import { KosvidioSectionConfig } from '../../types/sectionConfigs';
import {
  Video,
  Type,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const KosvidioEditor: React.FC<{
  config: KosvidioSectionConfig;
  onChange: (updated: KosvidioSectionConfig) => void;
}> = ({ config, onChange }) => {
  const update = (patch: Partial<KosvidioSectionConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-slate-200 mb-1">
          <Video className="w-4 h-4 text-red-500" />
          <span>עריכת נגן וידאו Kosvidio</span>
        </div>
        <p className="text-[11px] text-slate-400">
          אזור זה מציג ומנהל אך ורק את נגן המדיה והערוץ. תגובות, לייקים, תוויות, מאמר אודות והנעה לפעולה מנוהלים באזורים הייעודיים שלהם בעמוד.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            מזהה סרטון יוטיוב (YouTube Video ID או קישור מלא)
          </label>
          <input
            type="text"
            value={config.youtubeVideoId || config.videoUrl || ''}
            onChange={(e) => {
              const val = e.target.value.trim();
              const match = val.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
              if (match) {
                update({ youtubeVideoId: match[1], videoUrl: val });
              } else {
                update({ youtubeVideoId: val, videoUrl: val });
              }
            }}
            placeholder="למשל: dQw4w9WgXcQ או קישור יוטיוב"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 font-mono"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">כותרת הוידאו הראשית (H1)</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="כותרת הוידאו"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">שם הערוץ</label>
            <input
              type="text"
              value={config.channelName || ''}
              onChange={(e) => update({ channelName: e.target.value })}
              placeholder="שם ערוץ היוטיוב"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">מספר מנויים (טקסט)</label>
            <input
              type="text"
              value={config.channelSubscribers || ''}
              onChange={(e) => update({ channelSubscribers: e.target.value })}
              placeholder="למשל: 12.4K מנויים"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">תמונת פרופיל / לוגו הערוץ (URL)</label>
          <input
            type="text"
            value={config.channelAvatarUrl || ''}
            onChange={(e) => update({ channelAvatarUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 font-mono"
            dir="ltr"
          />
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.ambientGlow !== false}
              onChange={(e) => update({ ambientGlow: e.target.checked })}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <span>תאורה סביבתית זוהרת מאחורי הנגן (Ambient Mesh Glow)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.showTheaterMode !== false}
              onChange={(e) => update({ showTheaterMode: e.target.checked })}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <span>אפשר כפתור מעבר למצב קולנוע (Theater Mode) עבור הגולש</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.verifiedBadge !== false}
              onChange={(e) => update({ verifiedBadge: e.target.checked })}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <span>הצג תג ערוץ מאומת (Verified Badge)</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">צבע רקע לאזור הנגן</label>
          <input
            type="color"
            value={config.backgroundColor || '#07090e'}
            onChange={(e) => update({ backgroundColor: e.target.value })}
            className="w-full h-9 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default KosvidioEditor;
