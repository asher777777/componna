import React from 'react';
import { VideoGallerySectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Video, Sliders } from 'lucide-react';

interface VideoGalleryEditorProps {
  config: VideoGallerySectionConfig;
  onChange: (updated: VideoGallerySectionConfig) => void;
}

export const VideoGalleryEditor: React.FC<VideoGalleryEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof VideoGallerySectionConfig>(field: K, value: VideoGallerySectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="הגדרות נגן וידאו" icon={<Video className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
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
        <PageBuilderInput
          label="קישור לוידאו (YouTube / Vimeo / MP4)"
          value={config.videoUrl || ''}
          onChange={(e) => update('videoUrl', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          dir="ltr"
        />
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
