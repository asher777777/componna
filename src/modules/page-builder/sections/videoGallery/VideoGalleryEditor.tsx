import React from 'react';
import { VideoGallerySectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Video, Sliders, FolderOpen, Sparkles } from 'lucide-react';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../../core/contracts';

interface VideoGalleryEditorProps {
  config: VideoGallerySectionConfig;
  onChange: (updated: VideoGallerySectionConfig) => void;
}

export const VideoGalleryEditor: React.FC<VideoGalleryEditorProps> = ({ config, onChange }) => {
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const update = <K extends keyof VideoGallerySectionConfig>(field: K, value: VideoGallerySectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handlePickVideoFromGallery = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'video/*' });
      if (selected) {
        const finalUrl = Array.isArray(selected) ? selected[0] : selected;
        if (finalUrl) {
          update('videoUrl', finalUrl);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="הגדרות נגן וידאו ומדיה" icon={<Video className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: צפו בהרצאות ושיעורים"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: סרטוני הדרכה ועדכונים"
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">קישור לוידאו (YouTube / Vimeo / MP4)</label>
            <button
              type="button"
              onClick={handlePickVideoFromGallery}
              className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="בחר סרטון מגלריית המדיה"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>בחר מגלריית המדיה</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={config.videoUrl || ''}
              onChange={(e) => update('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... או קישור וידאו ישיר"
              className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handlePickVideoFromGallery}
              className="px-3 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="בחר מגלריה"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">גלריה</span>
            </button>
          </div>
        </div>
        <PageBuilderInput
          label="גובה נגן במחשב (למשל: 480px / 550px)"
          value={config.desktopHeight || '480px'}
          onChange={(e) => update('desktopHeight', e.target.value)}
          dir="ltr"
        />
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'videoGallery'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="videoGallery"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
