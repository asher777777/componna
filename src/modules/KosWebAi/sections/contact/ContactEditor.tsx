import React from 'react';
import { ContactSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Phone, Mail, MapPin, Sliders, FormInput } from 'lucide-react';
import { ContactFormConfigEditor, DEFAULT_CONTACT_FORM_CONFIG } from './ContactFormConfigEditor';

interface ContactEditorProps {
  config: ContactSectionConfig;
  onChange: (updated: ContactSectionConfig) => void;
}

export const ContactEditor: React.FC<ContactEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof ContactSectionConfig>(field: K, value: ContactSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const isFormEnabled = config.showForm ?? true;

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      {/* 1. Header & Contact Information */}
      <PageBuilderAccordion title="כותרות ופרטי התקשרות" icon={<Phone className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: צרו איתנו קשר"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: נשמח לעמוד לשירותכם לכל שאלה"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderInput
            label="טלפון"
            value={config.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="03-1234567"
            dir="ltr"
          />
          <PageBuilderInput
            label="אימייל"
            value={config.email || ''}
            onChange={(e) => update('email', e.target.value)}
            placeholder="info@example.com"
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderInput
            label="כתובת"
            value={config.address || ''}
            onChange={(e) => update('address', e.target.value)}
            placeholder="רחוב הרצל 1, תל אביב"
          />
          <PageBuilderInput
            label="וואטסאפ"
            value={config.whatsapp || ''}
            onChange={(e) => update('whatsapp', e.target.value)}
            placeholder="972545947701"
            dir="ltr"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mt-2">
          <label className="text-xs font-semibold text-slate-300">הצג טופס יצירת קשר</label>
          <input
            type="checkbox"
            checked={isFormEnabled}
            onChange={(e) => update('showForm', e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
          />
        </div>
      </PageBuilderAccordion>

      {/* 2. Embedded KFS Form & Clearing Editor */}
      {isFormEnabled && (
        <PageBuilderAccordion
          title="עריכת טופס KFS, סליקה והודעות WhatsApp"
          icon={<FormInput className="w-4 h-4 text-emerald-400" />}
          defaultOpen={true}
        >
          <ContactFormConfigEditor
            value={config.form || DEFAULT_CONTACT_FORM_CONFIG}
            formId={config.formId}
            onFormIdChange={(id) => update('formId', id)}
            onChange={(formConfig) => update('form', formConfig)}
          />
        </PageBuilderAccordion>
      )}

      {/* 3. Design & Anchor */}
      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'contact'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="contact"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
