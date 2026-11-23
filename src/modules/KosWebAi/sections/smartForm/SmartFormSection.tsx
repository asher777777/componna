import React, { useState } from 'react';
import { BaseSectionConfig } from '../../types/pageBuilder.types';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { eventBus } from '../../../../core/bridge/EventBus';
import { Check, CreditCard, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveStylePresetTokens } from '../../utils/stylePresetTheme';
import { KesherCheckoutModal } from '../../components/KesherCheckoutModal';

export interface SmartFormCrmField {
  crmFieldKey: string;
  labelHe: string;
  inputType: 'text' | 'tel' | 'email' | 'textarea' | 'number';
  autocomplete?: string;
  required?: boolean;
}

export interface SmartFormSectionConfig extends BaseSectionConfig {
  type: 'smartForm';
  formId?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  containerWidth?: 'sm' | 'md' | 'lg' | 'full';
  backgroundColor?: string;
  crmFields?: SmartFormCrmField[];
  formMode?: 'registration' | 'payment';
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentItemTitle?: string;
  submitButtonText?: string;
}

export const SmartFormSection: React.FC<{ config: SmartFormSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const formBuilder = getCapability<any>('form-builder');
  const styleTokens = resolveStylePresetTokens((config as any).stylePreset || (config as any).layout);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isPaymentMode = config.formMode === 'payment' && typeof config.paymentAmount === 'number' && config.paymentAmount > 0;

  const widthClasses = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'w-full',
  }[config.containerWidth || 'md'];

  const hasDynamicCrmFields = Array.isArray(config.crmFields) && config.crmFields.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionId = `sub_${Date.now()}`;

    if (hasDynamicCrmFields && config.crmFields) {
      const crmPayload: Record<string, any> = {};
      for (const field of config.crmFields) {
        const val = (dynamicValues[field.crmFieldKey] || '').trim();
        if (field.required && !val) return;
        if (val) crmPayload[field.crmFieldKey] = val;
      }

      eventBus.publish('smart_form:submitted', {
        formId: config.formId || `form_${config.id}`,
        formTitle: config.sectionTitle || 'טופס יצירת קשר',
        submissionId,
        data: crmPayload,
        submittedAt: new Date().toISOString(),
      });

      eventBus.publish('crm:lead:created', {
        conta_name: crmPayload.kosun_crm_name || '',
        conta_phone: crmPayload.kosun_crm_phone || '',
        email: crmPayload.kosun_crm_email || '',
        ...crmPayload,
        source: 'עמוד נחיתה / Smart Form',
        tags: ['ליד מטופס חכם', config.sectionTitle || 'טופס אתר'],
        metadata: { formId: config.formId, crmFieldKeys: config.crmFields.map((f) => f.crmFieldKey) },
      });

      setIsSubmitted(true);
      if (isPaymentMode) {
        setIsCheckoutOpen(true);
      }
      return;
    }

    if (!fullName.trim() || !phone.trim()) return;

    eventBus.publish('smart_form:submitted', {
      formId: config.formId || `form_${config.id}`,
      formTitle: config.sectionTitle || 'טופס יצירת קשר',
      submissionId,
      data: {
        kosun_crm_name: fullName,
        kosun_crm_phone: phone,
        kosun_crm_email: email,
        kosun_crm_notes: notes,
      },
      submittedAt: new Date().toISOString(),
    });

    eventBus.publish('crm:lead:created', {
      conta_name: fullName,
      conta_phone: phone,
      email,
      kosun_crm_name: fullName,
      kosun_crm_phone: phone,
      kosun_crm_email: email,
      kosun_crm_notes: notes,
      source: 'עמוד נחיתה / Smart Form',
      tags: ['ליד מטופס חכם', config.sectionTitle || 'טופס אתר'],
      metadata: { notes, formId: config.formId },
    });

    setIsSubmitted(true);
    if (isPaymentMode) {
      setIsCheckoutOpen(true);
    }
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
            className={clsx('p-6 sm:p-8 space-y-4 backdrop-blur-sm', styleTokens.cardClass)}
          >
            {hasDynamicCrmFields && config.crmFields ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.crmFields.map((field) => {
                  const fieldDomId = `${config.id}_${field.crmFieldKey}`;
                  const isWide = field.inputType === 'textarea' || field.crmFieldKey === 'kosun_crm_email';
                  return (
                    <div key={field.crmFieldKey} className={isWide ? 'sm:col-span-2' : ''}>
                      <label htmlFor={fieldDomId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {field.labelHe} {field.required ? '*' : ''}
                      </label>
                      {field.inputType === 'textarea' ? (
                        <textarea
                          id={fieldDomId}
                          name={field.crmFieldKey}
                          data-crm-field={field.crmFieldKey}
                          required={field.required}
                          value={dynamicValues[field.crmFieldKey] || ''}
                          onChange={(e) => setDynamicValues((prev) => ({ ...prev, [field.crmFieldKey]: e.target.value }))}
                          rows={3}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      ) : (
                        <input
                          id={fieldDomId}
                          name={field.crmFieldKey}
                          data-crm-field={field.crmFieldKey}
                          type={field.inputType}
                          autoComplete={field.autocomplete || 'on'}
                          required={field.required}
                          value={dynamicValues[field.crmFieldKey] || ''}
                          onChange={(e) => setDynamicValues((prev) => ({ ...prev, [field.crmFieldKey]: e.target.value }))}
                          dir={field.inputType === 'tel' || field.inputType === 'email' ? 'ltr' : 'rtl'}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${config.id}_name`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">שם מלא *</label>
                    <input
                      id={`${config.id}_name`}
                      name="kosun_crm_name"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="שם פרטי ומשפחה"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${config.id}_phone`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">טלפון נייד *</label>
                    <input
                      id={`${config.id}_phone`}
                      name="kosun_crm_phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="050-1234567"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${config.id}_email`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">דוא״ל</label>
                  <input
                    id={`${config.id}_email`}
                    name="kosun_crm_email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label htmlFor={`${config.id}_notes`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">הודעה / הערות</label>
                  <textarea
                    id={`${config.id}_notes`}
                    name="kosun_crm_notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="במה נוכל לעזור לכם?"
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </>
            )}

            {isPaymentMode && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {config.paymentItemTitle || config.sectionTitle || 'תשלום מאובטח'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      פרטי המשלם מסונכרנים אוטומטית ל-CRM
                    </div>
                  </div>
                </div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  ₪{config.paymentAmount}
                </div>
              </div>
            )}

            <button
              type="submit"
              className={clsx(
                'w-full py-3.5 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer',
                styleTokens.buttonClass
              )}
            >
              {isPaymentMode ? <CreditCard className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>
                {config.submitButtonText ||
                  (isPaymentMode ? `המשך לתשלום מאובטח (₪${config.paymentAmount})` : 'שליחה וקבלת מענה מהיר')}
              </span>
            </button>
          </form>
        )}

        {isPaymentMode && isCheckoutOpen && (
          <KesherCheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            isYearly={false}
            pageTitle={config.sectionTitle}
            pkg={{
              id: config.formId || `form_pkg_${config.id}`,
              name: config.paymentItemTitle || config.sectionTitle || 'הזמנה / תשלום',
              priceMonthly: String(config.paymentAmount || 0),
              priceYearly: String(config.paymentAmount || 0),
              description: config.sectionSubtitle || 'תשלום מאובטח מסונכרן CRM',
              features: [],
              buttonText: 'השלמת תשלום',
            }}
          />
        )}
      </div>
    </section>
  );
};
