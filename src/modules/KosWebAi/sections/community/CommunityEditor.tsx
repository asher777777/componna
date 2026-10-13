import React from 'react';
import { CommunitySectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Users, MessageCircle, Sliders } from 'lucide-react';

interface CommunityEditorProps {
  config: CommunitySectionConfig;
  onChange: (updated: CommunitySectionConfig) => void;
}

export const CommunityEditor: React.FC<CommunityEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof CommunitySectionConfig>(field: K, value: CommunitySectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרות וטקסט קהילה" icon={<Users className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת ראשית"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: הצטרפו לקהילה שלנו"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: קהילה חמה, תומכת ומחוברת"
        />
        <PageBuilderTextarea
          label="תיאור הקהילה"
          value={config.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
        />
        <PageBuilderInput
          label="ציטוט / משפט השראה"
          value={config.quote || ''}
          onChange={(e) => update('quote', e.target.value)}
          placeholder="ציטוט קהילתי..."
        />
      </PageBuilderAccordion>

      <PageBuilderAccordion title="כפתור וואטסאפ ותמונה" icon={<MessageCircle className="w-4 h-4 text-emerald-400" />} defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PageBuilderInput
            label="טקסט כפתור"
            value={config.buttonText || ''}
            onChange={(e) => update('buttonText', e.target.value)}
            placeholder="למשל: הצטרפות לקבוצת הוואטסאפ"
          />
          <PageBuilderInput
            label="מספר וואטסאפ (כולל קידומת 972...)"
            value={config.whatsappNumber || ''}
            onChange={(e) => update('whatsappNumber', e.target.value)}
            placeholder="972545947701"
            dir="ltr"
          />
        </div>

        <PageBuilderImageUpload
          label="תמונת קהילה / מנהל"
          value={config.imageSrc}
          onChange={(url) => update('imageSrc', url)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderInput
            label="כותרת תגית (Badge)"
            value={config.badgeTitle || ''}
            onChange={(e) => update('badgeTitle', e.target.value)}
            placeholder="למשל: 5,000+ חברים"
          />
          <PageBuilderInput
            label="תת-כותרת תגית"
            value={config.badgeSubtitle || ''}
            onChange={(e) => update('badgeSubtitle', e.target.value)}
            placeholder="למשל: בכל רחבי הארץ"
          />
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'community'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="community"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
