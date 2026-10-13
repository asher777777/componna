import React from 'react';
import { LandingSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { FileText, Sliders } from 'lucide-react';

interface LandingEditorProps {
  config: LandingSectionConfig;
  onChange: (updated: LandingSectionConfig) => void;
}

export const LandingEditor: React.FC<LandingEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof LandingSectionConfig>(field: K, value: LandingSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרות וטקסט דף נחיתה" icon={<FileText className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: השאירו פרטים לקבלת מידע נוסף"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: הצטרפו למאות המשתתפים שכבר עשו את הצעד"
        />
        <PageBuilderTextarea
          label="תיאור כללי"
          value={config.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
        />
        <PageBuilderInput
          label="טקסט כפתור שליחה"
          value={config.buttonText || ''}
          onChange={(e) => update('buttonText', e.target.value)}
          placeholder="שלח פרטים עכשיו"
        />
        <PageBuilderImageUpload
          label="תמונה נלווית (אופציונלי)"
          value={config.imageSrc}
          onChange={(url) => update('imageSrc', url)}
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
          value={config.anchorId || 'landingSection'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="landingSection"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
