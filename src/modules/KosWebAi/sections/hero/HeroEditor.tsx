import React from 'react';
import { HeroSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';

export const HeroEditor: React.FC<{
  config: HeroSectionConfig;
  onChange: (updated: HeroSectionConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <PageBuilderInput
        label="כותרת ראשית של העמוד (H1)"
        value={config.title || ''}
        onChange={(val) => onChange({ ...config, title: val })}
      />

      <PageBuilderInput
        label="פסקת תיאור / כותרת משנה"
        value={config.description || ''}
        onChange={(val) => onChange({ ...config, description: val })}
      />

      {/* Announcement Badge */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-300">תגית הכרזה עליונה (Announcement Pill)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PageBuilderInput
            label="טקסט התגית"
            value={config.announcementBadge?.text || ''}
            onChange={(val) =>
              onChange({
                ...config,
                announcementBadge: { ...(config.announcementBadge || {}), text: val },
              })
            }
          />
          <PageBuilderInput
            label="קישור (עוגן או URL)"
            value={config.announcementBadge?.url || ''}
            onChange={(val) =>
              onChange({
                ...config,
                announcementBadge: { ...(config.announcementBadge || {}), url: val, text: config.announcementBadge?.text || 'חדש' },
              })
            }
          />
        </div>
      </div>

      {/* Buttons Config */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-4">
        <h4 className="text-xs font-bold text-slate-300">כפתורי הנעה לפעולה (CTAs)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <PageBuilderInput
              label="כפתור ראשי - טקסט"
              value={config.primaryButton?.text || ''}
              onChange={(val) =>
                onChange({
                  ...config,
                  primaryButton: { ...(config.primaryButton || { url: '#' }), text: val },
                })
              }
            />
            <PageBuilderInput
              label="כפתור ראשי - קישור"
              value={config.primaryButton?.url || ''}
              onChange={(val) =>
                onChange({
                  ...config,
                  primaryButton: { ...(config.primaryButton || { text: 'התחל' }), url: val },
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <PageBuilderInput
              label="כפתור משני - טקסט"
              value={config.secondaryButton?.text || ''}
              onChange={(val) =>
                onChange({
                  ...config,
                  secondaryButton: { ...(config.secondaryButton || { url: '#' }), text: val },
                })
              }
            />
            <PageBuilderInput
              label="כפתור משני - קישור"
              value={config.secondaryButton?.url || ''}
              onChange={(val) =>
                onChange({
                  ...config,
                  secondaryButton: { ...(config.secondaryButton || { text: 'פרטים' }), url: val },
                })
              }
            />
          </div>
        </div>
      </div>

      <PageBuilderImageUpload
        label="תמונת רקע / Showcase (גלריית מדיה)"
        value={config.imageSrc}
        onChange={(url) => onChange({ ...config, imageSrc: url })}
      />
    </div>
  );
};
