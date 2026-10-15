import React, { useState, useEffect } from 'react';
import { ContactSectionConfig } from '../../types/sectionConfigs';
import { FormConfigContract, FormFieldContract, WhatsAppContract, BrandDnaContract } from '../../../../core/contracts';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, CreditCard, Coins, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { eventBus } from '../../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { resolveLiveBrandDna } from '../../generators/pageGenerator';
import { DEFAULT_CONTACT_FORM_CONFIG } from './ContactFormConfigEditor';

export const ContactSection: React.FC<{ config: ContactSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const fallbackPhone = brandDna?.trust?.contactPhone || '052-6968008';
  const fallbackEmail = brandDna?.trust?.contactEmail || 'ovt5771@gmail.com';
  const fallbackAddress = brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';
  const fallbackWhatsapp = brandDna?.trust?.whatsappSupportNumber || '0526968008';

  const {
    anchorId,
    title = 'צרו איתנו קשר',
    subtitle = 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות',
    phone = fallbackPhone,
    email = fallbackEmail,
    address = fallbackAddress,
    whatsapp = fallbackWhatsapp,
    showForm = true,
    formId,
    form: propForm,
    backgroundColor = 'transparent',
  } = config;

  const activeForm: FormConfigContract = propForm || DEFAULT_CONTACT_FORM_CONFIG;

  const isDummyPhone = (p?: string) => !p || p === '03-1234567' || p === '050-0000000';
  const isDummyEmail = (e?: string) => !e || e === 'contact@example.com' || e === 'info@example.com';
  const isDummyAddress = (a?: string) => !a || a === 'רחוב הרצל 1, תל אביב' || a === 'תל אביב, ישראל';

  const resolvedPhone = (!isDummyPhone(config.phone) ? config.phone : null) || fallbackPhone;
  const resolvedEmail = (!isDummyEmail(config.email) ? config.email : null) || fallbackEmail;
  const resolvedAddress = (!isDummyAddress(config.address) ? config.address : null) || fallbackAddress;
  const resolvedWhatsapp = config.whatsapp && config.whatsapp !== '0501234567' && config.whatsapp !== '972545947701' ? config.whatsapp : fallbackWhatsapp;

  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [checkoutData, setCheckoutData] = useState<{
    amount: number;
    clientName: string;
    phone: string;
    email: string;
  } | null>(null);

  // Initialize default form values
  useEffect(() => {
    const initial: Record<string, string> = {};
    (activeForm.fields || []).forEach((f) => {
      initial[f.label] = f.default_value || '';
    });
    setFormData(initial);
  }, [propForm]);

  const visibleFields = (activeForm.fields || []).filter((f) => {
    if (!f.cond_enable) return true;
    const trigger = (activeForm.fields || [])[f.cond_field_index || 0];
    if (!trigger) return true;
    const curVal = formData[trigger.label] || '';
    return f.cond_operator === 'is_not' ? curVal !== f.cond_value : curVal === f.cond_value;
  });

  const stepsList = Array.from(new Set(visibleFields.map((f) => f.step || 1))).sort((a, b) => a - b);
  const totalSteps = stepsList.length > 0 ? Math.max(...stepsList) : 1;

  const handleInputChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
    if (errors[label]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[label];
        return next;
      });
    }
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    const stepFields = visibleFields.filter((f) => (f.step || 1) === stepNumber);

    stepFields.forEach((f) => {
      const val = (formData[f.label] || '').trim();
      if (f.required && !val) {
        newErrors[f.label] = 'שדה חובה';
      }
      if (f.type === 'email' && val && !/\S+@\S+\.\S+/.test(val)) {
        newErrors[f.label] = 'כתובת אימייל לא תקינה';
      }
      if (f.type === 'tel' && val && val.replace(/\D/g, '').length < 9) {
        newErrors[f.label] = 'מספר טלפון קצר מדי';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getResolvedPaymentAmount = () => {
    let amt = activeForm.payment_amount || 100;
    visibleFields.forEach((f) => {
      if (f.map_to === 'payment_amount' || f.type === 'fixed_amount' || f.type === 'number') {
        const parsed = parseFloat(formData[f.label]);
        if (!isNaN(parsed) && parsed > 0) amt = parsed;
      }
    });
    return amt;
  };

  // Helper to send automated WhatsApp message via KosWhatsUp monopoly
  const sendAutomatedWhatsApp = async (templateText: string, extraVars: Record<string, string> = {}) => {
    if (!templateText) return;

    let targetPhone = '';
    visibleFields.forEach((f) => {
      if (f.map_to === 'conta_phone' || f.type === 'tel') {
        targetPhone = formData[f.label] || '';
      }
    });

    if (!targetPhone) return;

    let rendered = templateText;
    visibleFields.forEach((f) => {
      rendered = rendered.split(`{${f.label}}`).join(formData[f.label] || '');
    });
    rendered = rendered.split('{שם מלא}').join(formData['שם מלא'] || formData['שם'] || '');
    rendered = rendered.split('{טלפון}').join(targetPhone);
    rendered = rendered.split('{אימייל}').join(formData['דואר אלקטרוני'] || formData['אימייל'] || '');
    rendered = rendered.split('{סכום}').join(String(extraVars.amount || activeForm.payment_amount || ''));
    rendered = rendered.split('{link_kabala}').join(extraVars.receiptUrl || 'הקבלה נשלחה למייל');

    try {
      const whatsApp = getCapability<WhatsAppContract>('whatsapp');
      if (whatsApp && typeof whatsApp.sendMessage === 'function') {
        await whatsApp.sendMessage({
          phone: targetPhone,
          message: rendered,
        });
      }

      eventBus.emit('whatsapp:message:sent', {
        phone: targetPhone,
        text: rendered,
        source: 'KosWebAi:ContactSection',
      });
    } catch (e) {
      console.warn('Could not dispatch automated WhatsApp:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      let clientName = '';
      let clientPhone = '';
      let clientEmail = '';
      let clientNotes = '';

      visibleFields.forEach((f) => {
        const val = formData[f.label] || '';
        if (f.map_to === 'conta_name' || f.label.includes('שם')) clientName = val;
        if (f.map_to === 'conta_phone' || f.type === 'tel') clientPhone = val;
        if (f.map_to === 'email' || f.type === 'email') clientEmail = val;
        if (f.map_to === 'notes' || f.type === 'textarea') clientNotes = val;
      });

      if (activeForm.form_type === 'payment') {
        const amount = getResolvedPaymentAmount();
        setCheckoutData({
          amount,
          clientName: clientName || 'לקוח',
          phone: clientPhone,
          email: clientEmail,
        });

        // Send pending payment WhatsApp if defined
        if (activeForm.payment_pending_message) {
          sendAutomatedWhatsApp(activeForm.payment_pending_message, { amount: String(amount) });
        }

        setShowCheckout(true);
        setIsSubmitting(false);
      } else {
        // Standard Lead Form
        eventBus.emit('crm:lead:created', {
          conta_name: clientName,
          conta_phone: clientPhone,
          email: clientEmail,
          source: 'KosWebAi:ContactSection',
          metadata: {
            notes: clientNotes,
            formData,
            pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          },
        });

        eventBus.emit('form:submitted', {
          formId: formId || 'KosWebAi-contact',
          title,
          data: formData,
        });

        if (activeForm.standard_whatsapp_message) {
          await sendAutomatedWhatsApp(activeForm.standard_whatsapp_message);
        }

        setSuccessMessage(activeForm.standard_success_message || 'פנייתך התקבלה בהצלחה!');
        setIsSubmitted(true);

        if (activeForm.standard_redirect_url) {
          setTimeout(() => {
            window.location.href = activeForm.standard_redirect_url!;
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (res: { transactionId: string; amount: number; receiptUrl?: string }) => {
    setShowCheckout(false);
    setIsSubmitting(true);

    try {
      let clientName = '';
      let clientPhone = '';
      let clientEmail = '';
      visibleFields.forEach((f) => {
        const val = formData[f.label] || '';
        if (f.map_to === 'conta_name' || f.label.includes('שם')) clientName = val;
        if (f.map_to === 'conta_phone' || f.type === 'tel') clientPhone = val;
        if (f.map_to === 'email' || f.type === 'email') clientEmail = val;
      });

      // Emit CRM lead / order with payment completion
      eventBus.emit('crm:lead:created', {
        conta_name: clientName,
        conta_phone: clientPhone,
        email: clientEmail,
        source: 'KosWebAi:ContactSection:Payment',
        metadata: {
          formData,
          amountPaid: res.amount,
          transactionId: res.transactionId,
          receiptUrl: res.receiptUrl,
          status: 'תשלום בוצע',
        },
      });

      // Send WhatsApp payment success confirmation
      if (activeForm.payment_success_message) {
        await sendAutomatedWhatsApp(activeForm.payment_success_message, {
          amount: String(res.amount),
          receiptUrl: res.receiptUrl || '',
        });
      }

      setSuccessMessage(
        `התשלום בסך ₪${res.amount} אושר בהצלחה! מספר אסמכתא: ${res.transactionId}. אישור וקבלה נשלחו.`
      );
      setIsSubmitted(true);

      if (activeForm.standard_redirect_url) {
        setTimeout(() => {
          window.location.href = activeForm.standard_redirect_url!;
        }, 2000);
      }
    } catch (e) {
      console.error('Error recording payment success:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id={anchorId || 'contact'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {resolvedPhone && (
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">טלפון ישיר</span>
                  <a href={`tel:${resolvedPhone}`} className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" dir="ltr">
                    {resolvedPhone}
                  </a>
                </div>
              </div>
            )}

            {resolvedWhatsapp && (
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">וואטסאפ לבירורים מהירים</span>
                  <a
                    href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
                  >
                    שלחו הודעה בוואטסאפ
                  </a>
                </div>
              </div>
            )}

            {resolvedEmail && (
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">דואר אלקטרוני</span>
                  <a href={`mailto:${resolvedEmail}`} className="text-base font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors" dir="ltr">
                    {resolvedEmail}
                  </a>
                </div>
              </div>
            )}

            {resolvedAddress && (
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">כתובת ומיקום</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{resolvedAddress}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Column */}
          {showForm && (
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-right">
              {/* If external KSF formId is selected, render via KSF CapabilitySlot */}
              {formId ? (
                <CapabilitySlot
                  name="form-renderer"
                  props={{ formId }}
                  fallback={
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-2xl">
                      טוען טופס KFS ({formId})...
                    </div>
                  }
                />
              ) : isSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-3 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">הפעולה הושלמה בהצלחה!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{successMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setSuccessMessage('');
                      setShowCheckout(false);
                      setCurrentStep(1);
                    }}
                    className="mt-3 px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition cursor-pointer"
                  >
                    שליחת פנייה חדשה
                  </button>
                </div>
              ) : showCheckout && checkoutData ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-500" />
                      <span>סליקה ותשלום מאובטח (קשר)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      ביטול וחזרה לטופס
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
                    <div><strong>עבור:</strong> {title}</div>
                    <div><strong>משלם:</strong> {checkoutData.clientName}</div>
                    {checkoutData.phone && <div><strong>טלפון:</strong> {checkoutData.phone}</div>}
                    <div><strong>סכום לחיוב:</strong> <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">₪{checkoutData.amount}</span></div>
                  </div>

                  <CapabilitySlot
                    name="kesher-payment-slot"
                    props={{
                      amount: checkoutData.amount,
                      clientName: checkoutData.clientName,
                      phone: checkoutData.phone,
                      email: checkoutData.email,
                      description: title,
                      documentType: activeForm.payment_receipt_type || 320,
                      requireId: activeForm.payment_require_id,
                      onSuccess: handlePaymentSuccess,
                      onCancel: () => setShowCheckout(false),
                    }}
                    fallback={
                      <div className="p-6 bg-slate-800/40 rounded-2xl text-center space-y-2 border border-slate-700">
                        <CreditCard className="w-8 h-8 text-indigo-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white">מסוף הסליקה מוכן לקליטת תשלום</h4>
                        <p className="text-xs text-slate-400">הסליקה מתבצעת תחת מודול kesher-payments-hub.</p>
                        <button
                          type="button"
                          onClick={() => handlePaymentSuccess({ transactionId: `demo_${Date.now()}`, amount: checkoutData.amount })}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                        >
                          אישור תשלום (סביבת בדיקה)
                        </button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeForm.form_type === 'payment' ? 'טופס רישום ותשלום מאובטח' : 'טופס פנייה ישיר'}
                    </h3>
                    {totalSteps > 1 && (
                      <span className="text-xs font-semibold text-slate-400">
                        שלב {currentStep} מתוך {totalSteps}
                      </span>
                    )}
                  </div>

                  {/* Multi-step progress bar */}
                  {totalSteps > 1 && (
                    <div className="flex gap-1.5 w-full">
                      {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i + 1 <= currentStep ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Render fields for current step */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visibleFields
                      .filter((f) => (f.step || 1) === currentStep)
                      .map((field, idx) => {
                        const isFullWidth = field.widthPercentage === 100 || field.type === 'textarea' || field.type === 'payment_summary' || field.type === 'payment_cc' || field.type === 'step';
                        const hasError = errors[field.label];

                        if (field.type === 'hidden') {
                          return (
                            <input
                              key={idx}
                              type="hidden"
                              value={formData[field.label] || field.default_value || ''}
                            />
                          );
                        }

                        if (field.type === 'step') {
                          return (
                            <div key={idx} className="sm:col-span-2 pt-2 pb-1" style={{ textAlign: field.textAlign || 'right' }}>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-white" style={{ color: field.textColor || undefined }}>
                                {field.label}
                              </h4>
                            </div>
                          );
                        }

                        if (field.type === 'payment_summary') {
                          return (
                            <div key={idx} className="sm:col-span-2 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs">
                              <span className="font-bold text-indigo-300">סכום לחיוב:</span>
                              <span className="font-mono text-base font-extrabold text-white">₪{getResolvedPaymentAmount()}</span>
                            </div>
                          );
                        }

                        if (field.type === 'payment_cc') {
                          return (
                            <div key={idx} className="sm:col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>סליקת האשראי תתבצע בצורה מאובטחת במסך הבא תחת תקן PCI-DSS.</span>
                            </div>
                          );
                        }

                        const inputStyle: React.CSSProperties = {
                          textAlign: field.textAlign,
                          color: field.textColor,
                          backgroundColor: field.bgColor,
                          borderColor: hasError ? undefined : field.borderColor,
                          height: field.height || undefined,
                          fontSize: field.fontSize ? `${field.fontSize}px` : undefined,
                        };

                        if (field.type === 'calculated') {
                          return (
                            <div key={idx} className={isFullWidth ? 'sm:col-span-2' : ''}>
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" style={{ textAlign: field.textAlign || 'right' }}>
                                {field.label}
                              </label>
                              <input
                                type="text"
                                readOnly
                                value={formData[field.label] || ''}
                                style={inputStyle}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm font-mono opacity-90 cursor-not-allowed"
                              />
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className={isFullWidth ? 'sm:col-span-2' : ''}>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" style={{ textAlign: field.textAlign || 'right' }}>
                              {field.label} {field.required && <span className="text-rose-500">*</span>}
                            </label>

                            {field.type === 'textarea' ? (
                              <textarea
                                rows={3}
                                value={formData[field.label] || ''}
                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                placeholder={field.placeholder || ''}
                                style={inputStyle}
                                autoComplete={field.autocomplete || undefined}
                                className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                                  hasError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                                } text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none`}
                              />
                            ) : field.type === 'select' ? (
                              <select
                                value={formData[field.label] || ''}
                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                style={inputStyle}
                                className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                                  hasError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                                } text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                              >
                                <option value="">בחר...</option>
                                {(field.options || '').split('\n').map((opt) => {
                                  const c = opt.trim();
                                  if (!c) return null;
                                  return <option key={c} value={c}>{c}</option>;
                                })}
                              </select>
                            ) : (
                              <input
                                type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
                                value={formData[field.label] || ''}
                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                placeholder={field.placeholder || ''}
                                style={inputStyle}
                                autoComplete={field.autocomplete || undefined}
                                className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                                  hasError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                                } text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                                dir={field.type === 'email' || field.type === 'tel' ? 'ltr' : (field.textAlign === 'left' ? 'ltr' : 'rtl')}
                              />
                            )}

                            {hasError && <span className="text-[10px] text-rose-500 font-bold block mt-1">{hasError}</span>}
                          </div>
                        );
                      })}
                  </div>

                  {/* Navigation & Submit Buttons */}
                  <div className="flex gap-2 pt-2">
                    {currentStep > 1 && (() => {
                      const curStepField = visibleFields.find((f) => f.type === 'step' && (f.step || 1) === currentStep);
                      return (
                        <button
                          type="button"
                          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                          style={{
                            backgroundColor: curStepField?.step_back_button_bg_color || undefined,
                            color: curStepField?.step_back_button_text_color || undefined,
                          }}
                          className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                          <span>{curStepField?.step_back_button_text || activeForm.back_button_text || 'חזור'}</span>
                        </button>
                      );
                    })()}

                    {currentStep < totalSteps ? (() => {
                      const curStepField = visibleFields.find((f) => f.type === 'step' && (f.step || 1) === currentStep);
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            if (validateStep(currentStep)) {
                              setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
                            }
                          }}
                          style={{
                            backgroundColor: curStepField?.step_button_bg_color || undefined,
                            color: curStepField?.step_button_text_color || undefined,
                          }}
                          className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
                        >
                          <span>{curStepField?.step_button_text || activeForm.continue_button_text || 'המשך'}</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      );
                    })() : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: activeForm.submit_button_bg_color || undefined,
                          color: activeForm.submit_button_text_color || undefined,
                        }}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-indigo-600/30 disabled:opacity-50 transition-all"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : activeForm.form_type === 'payment' ? (
                          <CreditCard className="w-4 h-4" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{activeForm.submit_button_text || 'שליחת פנייה'}</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
