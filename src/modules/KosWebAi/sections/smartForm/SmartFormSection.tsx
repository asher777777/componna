import React, { useState } from 'react';
import { BaseSectionConfig } from '../../types/pageBuilder.types';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { eventBus } from '../../../../core/bridge/EventBus';
import { Check, Send } from 'lucide-react';

export interface SmartFormSectionConfig extends BaseSectionConfig {
  type: 'smartForm';
  formId?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  containerWidth?: 'sm' | 'md' | 'lg' | 'full';
  backgroundColor?: string;
}

export const SmartFormSection: React.FC<{ config: SmartFormSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const formBuilder = getCapability<any>('form-builder');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const widthClasses = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'w-full',
  }[config.containerWidth || 'md'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const submissionId = `sub_${Date.now()}`;
    eventBus.publish('smart_form:submitted', {
      formId: config.formId || `form_${config.id}`,
      formTitle: config.sectionTitle || 'טופס יצירת קשר',
      submissionId,
      data: { fullName, phone, email, notes },
      submittedAt: new Date().toISOString(),
    });

    eventBus.publish('crm:lead:created', {
      conta_name: fullName,
      conta_phone: phone,
      email,
      source: 'עמוד נחיתה / Smart Form',
      tags: ['ליד מטופס חכם', config.sectionTitle || 'טופס אתר'],
      metadata: { notes, formId: config.formId },
    });

    setIsSubmitted(true);
  };

  return (
    <section
      id={`section-${config.id}`}
      className={`py-12 px-4 transition-all ${config.mobileHidden ? 'hidden md:block' : ''}`}
      style={{ backgroundColor: config.backgroundColor || 'transparent' }}
      dir="rtl"
    >
      <div className={`mx-auto ${widthClasses} space-y-6`}>
        {(config.sectionTitle || config.sectionSubtitle) && (
          <div className="text-center space-y-2">
            {config.sectionTitle && (
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {config.sectionTitle}
              </h2>
            )}
            {config.sectionSubtitle && (
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                {config.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {config.formId && formBuilder?.renderFormRunner ? (
          formBuilder.renderFormRunner({ formId: config.formId })
        ) : isSubmitted ? (
          <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-emerald-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">הטופס נשלח בהצלחה!</h3>
            <p className="text-xs text-slate-300">תודה שפנית אלינו. פרטיך נקלטו ונחזור אליך בהקדם.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">שם מלא *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">טלפון נייד *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="050-1234567"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">דוא״ל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">הודעה / הערות</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="במה נוכל לעזור לכם?"
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>שליחה וקבלת מענה מהיר</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
