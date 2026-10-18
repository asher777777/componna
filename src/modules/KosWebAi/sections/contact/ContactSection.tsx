import React, { useState, useEffect } from 'react';
import {
  ContactSectionConfig,
  ContactLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import {
  FormConfigContract,
  WhatsAppContract,
  BrandDnaContract,
} from '../../../../core/contracts';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Clock,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import { eventBus } from '../../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { resolveLiveBrandDna } from '../../generators/pageGenerator';
import { DEFAULT_CONTACT_FORM_CONFIG } from './ContactFormConfigEditor';
import { clsx } from 'clsx';

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
    titleColor,
    subtitleColor,
    phone = fallbackPhone,
    email = fallbackEmail,
    address = fallbackAddress,
    whatsapp = fallbackWhatsapp,
    showForm = true,
    openingHours,
    directWhatsappChat,
    formId,
    form: propForm,
    backgroundColor = 'transparent',
    cardBackgroundColor,
    layout = 'standard',
    objectScale = 'auto',
    buttonShape = 'auto',
    buttonSize = 'auto',
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
  } = config;

  const activeForm: FormConfigContract = propForm || DEFAULT_CONTACT_FORM_CONFIG;

  const isDummyPhone = (p?: string) => !p || p === '03-1234567' || p === '050-0000000';
  const isDummyEmail = (e?: string) => !e || e === 'contact@example.com' || e === 'info@example.com';
  const isDummyAddress = (a?: string) => !a || a === 'רחוב הרצל 1, תל אביב' || a === 'תל אביב, ישראל';

  const resolvedPhone = (!isDummyPhone(config.phone) ? config.phone : null) || fallbackPhone;
  const resolvedEmail = (!isDummyEmail(config.email) ? config.email : null) || fallbackEmail;
  const resolvedAddress = (!isDummyAddress(config.address) ? config.address : null) || fallbackAddress;
  const resolvedWhatsapp =
    config.whatsapp && config.whatsapp !== '0501234567' && config.whatsapp !== '972545947701'
      ? config.whatsapp
      : fallbackWhatsapp;

  const normalizedLayout: ContactLayoutPreset =
    !layout || layout === 'current' || layout === 'split-cards' || layout === 'minimal'
      ? 'standard'
      : layout;

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

  const sendAutomatedWhatsApp = async (
    templateText: string,
    extraVars: Record<string, string> = {}
  ) => {
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
    } catch (e) {
      console.warn('Failed to send automated WhatsApp:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    if (activeForm.form_type === 'payment') {
      let clientName = '';
      let clientPhone = '';
      let clientEmail = '';

      visibleFields.forEach((f) => {
        const val = formData[f.label] || '';
        if (f.map_to === 'conta_name' || f.label.includes('שם')) clientName = val;
        if (f.map_to === 'conta_phone' || f.type === 'tel') clientPhone = val;
        if (f.map_to === 'email' || f.type === 'email') clientEmail = val;
      });

      setCheckoutData({
        amount: getResolvedPaymentAmount(),
        clientName: clientName || 'לקוח מזדמן',
        phone: clientPhone,
        email: clientEmail,
      });
      setShowCheckout(true);
      return;
    }

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

      eventBus.emit('crm:lead:created', {
        conta_name: clientName || 'פנייה מטופס צור קשר',
        conta_phone: clientPhone,
        email: clientEmail,
        source: 'KosWebAi:ContactSection',
        metadata: formData,
      });

      if (activeForm.standard_whatsapp_message) {
        await sendAutomatedWhatsApp(activeForm.standard_whatsapp_message);
      }

      setSuccessMessage(
        activeForm.standard_success_message ||
          'פנייתך התקבלה בהצלחה! צוות המומחים שלנו יחזור אליך בהקדם האפשרי.'
      );
      setIsSubmitted(true);

      if (activeForm.standard_redirect_url) {
        setTimeout(() => {
          window.location.href = activeForm.standard_redirect_url!;
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (res: { transactionId: string; amount: number; receiptUrl?: string }) => {
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

      if (activeForm.payment_success_message) {
        await sendAutomatedWhatsApp(activeForm.payment_success_message, {
          amount: String(res.amount),
          receiptUrl: res.receiptUrl || '',
        });
      }

      setSuccessMessage(
        `התשלום בסך ₪${res.amount} אושר בהצלחה! אסמכתא: ${res.transactionId}. אישור וקבלה נשלחו.`
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

  // Sizing helpers
  const getHeadingScaleClass = (defaultClass: string) => {
    if (objectScale === 'compact') return 'text-2xl sm:text-3xl';
    if (objectScale === 'normal') return 'text-3xl sm:text-4xl';
    if (objectScale === 'large') return 'text-3xl sm:text-5xl';
    if (objectScale === 'massive') return 'text-4xl sm:text-6xl';
    return defaultClass;
  };

  const getButtonShapeClass = (defaultRadius: string) => {
    if (buttonShape === 'pill') return 'rounded-full';
    if (buttonShape === 'rounded') return 'rounded-2xl';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'chiseled') return 'rounded-lg';
    return defaultRadius;
  };

  const getButtonSizeClass = (defaultSize: string) => {
    if (buttonSize === 'sm') return 'px-4 py-2 text-xs';
    if (buttonSize === 'md') return 'px-5 py-2.5 text-xs sm:text-sm';
    if (buttonSize === 'lg') return 'px-7 py-3 text-sm sm:text-base';
    if (buttonSize === 'xl') return 'px-9 py-4 text-base sm:text-lg';
    return defaultSize;
  };

  // Text Background Overlay & Effects
  const effectiveBgImage =
    textBgImageUrl ||
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80';
  const overlayAlpha = Math.min(95, Math.max(10, textBgOverlayOpacity ?? 75)) / 100;

  const defaultOverlayHex = (() => {
    if (textBgOverlayColor && textBgOverlayColor !== 'transparent') return textBgOverlayColor;
    switch (normalizedLayout) {
      case 'feminine':
        return '#250d18';
      case 'masculine':
        return '#090a0f';
      case 'spiritual':
        return '#061614';
      case 'sharp':
        return '#050505';
      case 'analytical':
        return '#050e1c';
      default:
        return '#0f172a';
    }
  })();

  const renderTextBgLayer = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src={effectiveBgImage}
        alt="Text backdrop"
        className={clsx(
          'w-full h-full object-cover transition-all ease-out',
          textBgEffect === 'zoom-glow' && 'duration-1000 group-hover/textbg:scale-110',
          textBgEffect === 'shimmer-sweep' && 'duration-700 group-hover/textbg:scale-105',
          textBgEffect === 'float-parallax' &&
            'duration-700 scale-105 group-hover/textbg:scale-110 group-hover/textbg:-translate-y-2',
          textBgEffect === 'blur-reveal' &&
            'duration-700 blur-[3px] scale-105 group-hover/textbg:blur-0 group-hover/textbg:scale-100',
          textBgEffect === 'gradient-shift' &&
            'duration-1000 group-hover/textbg:scale-105 group-hover/textbg:rotate-1'
        )}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover/textbg:opacity-85"
        style={{
          backgroundColor: defaultOverlayHex,
          opacity: overlayAlpha,
        }}
      />
      {textBgEffect === 'shimmer-sweep' && (
        <div className="absolute inset-0 -translate-x-full group-hover/textbg:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      )}
      {textBgEffect === 'zoom-glow' && (
        <div className="absolute inset-0 opacity-0 group-hover/textbg:opacity-100 transition-opacity duration-700 bg-radial from-white/15 via-transparent to-transparent" />
      )}
      {textBgEffect === 'gradient-shift' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-transparent to-amber-500/30 opacity-40 group-hover/textbg:opacity-80 transition-opacity duration-700" />
      )}
      {textBgEffect === 'float-parallax' && (
        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 group-hover/textbg:ring-white/50 transition-all duration-700" />
      )}
    </div>
  );

  const wrapTextWithOptionalBg = (content: React.ReactNode, cardRadiusClass = 'rounded-3xl') => {
    if (!textBgEnabled || textBgScope === 'full-section') {
      return content;
    }
    return (
      <div
        className={clsx(
          'relative overflow-hidden p-6 sm:p-10 transition-all duration-500 shadow-2xl border border-white/15 group/textbg w-full',
          cardRadiusClass
        )}
      >
        {renderTextBgLayer()}
        <div className="relative z-10">{content}</div>
      </div>
    );
  };

  // Reusable Form Renderer matching active theme style
  const renderInteractiveForm = (theme: {
    containerClass: string;
    inputClass: string;
    inputRadiusClass: string;
    buttonShapeClass: string;
    buttonColorClass: string;
    titleColorClass: string;
    labelColorClass: string;
    stepActiveColorClass: string;
    stepInactiveColorClass: string;
  }) => {
    if (formId) {
      return (
        <CapabilitySlot
          name="form-renderer"
          props={{ formId }}
          fallback={
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-2xl">
              טוען טופס KFS ({formId})...
            </div>
          }
        />
      );
    }

    if (isSubmitted) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 gap-3 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className={`text-xl font-bold ${theme.titleColorClass}`}>הפנייה נשלחה בהצלחה!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{successMessage}</p>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setSuccessMessage('');
              setShowCheckout(false);
              setCurrentStep(1);
            }}
            className={clsx(
              'mt-3 px-5 py-2 text-xs font-bold transition cursor-pointer',
              theme.buttonShapeClass,
              'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
            )}
          >
            שליחת פנייה חדשה
          </button>
        </div>
      );
    }

    if (showCheckout && checkoutData) {
      return (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.titleColorClass}`}>
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>סליקה ותשלום מאובטח</span>
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
            <div>
              <strong>סכום לחיוב:</strong>{' '}
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                ₪{checkoutData.amount}
              </span>
            </div>
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
                  onClick={() =>
                    handlePaymentSuccess({
                      transactionId: `demo_${Date.now()}`,
                      amount: checkoutData.amount,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  אישור תשלום (סביבת בדיקה)
                </button>
              </div>
            }
          />
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className={`text-lg font-bold ${theme.titleColorClass}`}>
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
                className={clsx(
                  'h-1.5 flex-1 rounded-full transition-all',
                  i + 1 <= currentStep ? theme.stepActiveColorClass : theme.stepInactiveColorClass
                )}
              />
            ))}
          </div>
        )}

        {/* Fields for current step */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleFields
            .filter((f) => (f.step || 1) === currentStep)
            .map((field, idx) => {
              const isFullWidth =
                field.widthPercentage === 100 ||
                field.type === 'textarea' ||
                field.type === 'payment_summary' ||
                field.type === 'payment_cc' ||
                field.type === 'step';
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
                    <h4 className={`text-sm font-bold ${theme.titleColorClass}`} style={{ color: field.textColor || undefined }}>
                      {field.label}
                    </h4>
                  </div>
                );
              }

              if (field.type === 'payment_summary') {
                return (
                  <div
                    key={idx}
                    className="sm:col-span-2 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-indigo-300">סכום לחיוב:</span>
                    <span className="font-mono text-base font-extrabold text-white">
                      ₪{getResolvedPaymentAmount()}
                    </span>
                  </div>
                );
              }

              if (field.type === 'payment_cc') {
                return (
                  <div
                    key={idx}
                    className="sm:col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>סליקת האשראי תתבצע בצורה מאובטחת במסך הבא תחת תקן PCI-DSS.</span>
                  </div>
                );
              }

              const customStyle: React.CSSProperties = {
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
                    <label
                      className={`block text-xs font-semibold mb-1 ${theme.labelColorClass}`}
                      style={{ textAlign: field.textAlign || 'right' }}
                    >
                      {field.label}
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData[field.label] || ''}
                      style={customStyle}
                      className={clsx(
                        'w-full border px-4 py-2.5 text-sm font-mono opacity-90 cursor-not-allowed',
                        theme.inputRadiusClass,
                        theme.inputClass
                      )}
                    />
                  </div>
                );
              }

              return (
                <div key={idx} className={isFullWidth ? 'sm:col-span-2' : ''}>
                  <label
                    className={`block text-xs font-semibold mb-1 ${theme.labelColorClass}`}
                    style={{ textAlign: field.textAlign || 'right' }}
                  >
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[field.label] || ''}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      placeholder={field.placeholder || ''}
                      style={customStyle}
                      autoComplete={field.autocomplete || undefined}
                      className={clsx(
                        'w-full border px-4 py-2.5 text-sm focus:outline-none resize-none transition-all',
                        theme.inputRadiusClass,
                        theme.inputClass,
                        hasError && 'border-rose-500 ring-1 ring-rose-500'
                      )}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.label] || ''}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      style={customStyle}
                      className={clsx(
                        'w-full border px-4 py-2.5 text-sm focus:outline-none transition-all',
                        theme.inputRadiusClass,
                        theme.inputClass,
                        hasError && 'border-rose-500 ring-1 ring-rose-500'
                      )}
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
                      type={
                        field.type === 'email'
                          ? 'email'
                          : field.type === 'tel'
                            ? 'tel'
                            : field.type === 'number'
                              ? 'number'
                              : 'text'
                      }
                      value={formData[field.label] || ''}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      placeholder={field.placeholder || ''}
                      style={customStyle}
                      autoComplete={field.autocomplete || undefined}
                      className={clsx(
                        'w-full border px-4 py-2.5 text-sm focus:outline-none transition-all',
                        theme.inputRadiusClass,
                        theme.inputClass,
                        hasError && 'border-rose-500 ring-1 ring-rose-500'
                      )}
                      dir={
                        field.type === 'email' || field.type === 'tel'
                          ? 'ltr'
                          : field.textAlign === 'left'
                            ? 'ltr'
                            : 'rtl'
                      }
                    />
                  )}

                  {hasError && (
                    <span className="text-[10px] text-rose-500 font-bold block mt-1">
                      {hasError}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className={clsx(
                'px-5 py-3 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all',
                theme.buttonShapeClass,
                'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              <ChevronRight className="w-4 h-4" />
              <span>{activeForm.back_button_text || 'חזור'}</span>
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep(currentStep)) {
                  setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
                }
              }}
              className={clsx(
                'flex-1 py-3 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all',
                theme.buttonShapeClass,
                theme.buttonColorClass
              )}
            >
              <span>{activeForm.continue_button_text || 'המשך'}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                'flex-1 py-3.5 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 transition-all',
                theme.buttonShapeClass,
                theme.buttonColorClass
              )}
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
    );
  };

  // ============================================================================
  // א. פריסה בסגנון נשי (Feminine Style - Soft, Rose-Gold, Capsule Pills)
  // ============================================================================
  if (normalizedLayout === 'feminine') {
    return (
      <section
        id={anchorId || 'contact'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#fff9fb] via-[#fdf2f6] to-[#fcf6f0] dark:from-[#160c12] dark:via-[#1e1018] dark:to-[#120b0f] transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute -top-16 right-12 w-[340px] h-[340px] bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-800 dark:text-rose-200 text-xs font-medium w-fit">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400/40" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                  'font-bold tracking-normal leading-[1.25]',
                  textBgEnabled ? 'text-white' : 'text-rose-950 dark:text-rose-50'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-[2.5rem]'
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {resolvedPhone && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right shadow-lg shadow-rose-200/20 backdrop-blur-md"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-rose-700/80 dark:text-rose-300/80 block font-medium">טלפון ישיר</span>
                    <a
                      href={`tel:${resolvedPhone}`}
                      className="text-base font-bold text-rose-950 dark:text-rose-100 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                      dir="ltr"
                    >
                      {resolvedPhone}
                    </a>
                  </div>
                </div>
              )}

              {resolvedWhatsapp && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right shadow-lg shadow-rose-200/20 backdrop-blur-md"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-rose-700/80 dark:text-rose-300/80 block font-medium">וואטסאפ לבירורים</span>
                    <a
                      href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                    >
                      שלחו הודעה בוואטסאפ
                    </a>
                  </div>
                </div>
              )}

              {resolvedEmail && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right shadow-lg shadow-rose-200/20 backdrop-blur-md"
                >
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-rose-700/80 dark:text-rose-300/80 block font-medium">דואר אלקטרוני</span>
                    <a
                      href={`mailto:${resolvedEmail}`}
                      className="text-base font-bold text-rose-950 dark:text-rose-100 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                      dir="ltr"
                    >
                      {resolvedEmail}
                    </a>
                  </div>
                </div>
              )}

              {resolvedAddress && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right shadow-lg shadow-rose-200/20 backdrop-blur-md"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-rose-700/80 dark:text-rose-300/80 block font-medium">כתובת ומיקום</span>
                    <span className="text-base font-bold text-rose-950 dark:text-rose-100">{resolvedAddress}</span>
                  </div>
                </div>
              )}

              {openingHours && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right shadow-lg shadow-rose-200/20 backdrop-blur-md"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-rose-700/80 dark:text-rose-300/80 block font-medium">שעות פעילות</span>
                    <span className="text-base font-bold text-rose-950 dark:text-rose-100">{openingHours}</span>
                  </div>
                </div>
              )}

              {directWhatsappChat && resolvedWhatsapp && (
                <a
                  href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    'w-full py-3.5 px-6 rounded-full bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer mt-2'
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>מענה ישיר בוואטסאפ עכשיו</span>
                </a>
              )}
            </div>

            {/* Form Column */}
            {showForm && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="lg:col-span-7 bg-white/95 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-rose-200/20 text-right backdrop-blur-md"
              >
                {renderInteractiveForm({
                  containerClass: '',
                  inputClass:
                    'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/70 text-rose-950 dark:text-rose-50 placeholder-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30',
                  inputRadiusClass: getButtonShapeClass('rounded-2xl'),
                  buttonShapeClass: getButtonShapeClass('rounded-full'),
                  buttonColorClass:
                    'bg-gradient-to-l from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 shadow-rose-400/30',
                  titleColorClass: 'text-rose-950 dark:text-rose-50',
                  labelColorClass: 'text-rose-900/80 dark:text-rose-200',
                  stepActiveColorClass: 'bg-rose-500',
                  stepInactiveColorClass: 'bg-rose-200 dark:bg-rose-900',
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // ב. פריסה בסגנון גברי (Masculine Style - Bold, Charcoal, Gold & Steel)
  // ============================================================================
  if (normalizedLayout === 'masculine') {
    return (
      <section
        id={anchorId || 'contact'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#0c0d12] via-[#12131a] to-[#090a0e] dark:from-[#06070a] dark:via-[#090a0f] dark:to-[#040507] text-white transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wider uppercase w-fit">
                  <Shield className="w-3.5 h-3.5" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl md:text-6xl'),
                  'font-black tracking-tight leading-none text-white'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-2xl'
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {resolvedPhone && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-zinc-900/90 border-2 border-zinc-700/80 hover:border-amber-500/60 rounded-2xl p-5 flex items-center gap-4 text-right shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-bold uppercase">טלפון ישיר</span>
                    <a
                      href={`tel:${resolvedPhone}`}
                      className="text-lg font-black text-white hover:text-amber-400 transition-colors"
                      dir="ltr"
                    >
                      {resolvedPhone}
                    </a>
                  </div>
                </div>
              )}

              {resolvedWhatsapp && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-zinc-900/90 border-2 border-zinc-700/80 hover:border-amber-500/60 rounded-2xl p-5 flex items-center gap-4 text-right shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-bold uppercase">וואטסאפ מהיר</span>
                    <a
                      href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      שלח הודעה בוואטסאפ
                    </a>
                  </div>
                </div>
              )}

              {resolvedEmail && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-zinc-900/90 border-2 border-zinc-700/80 hover:border-amber-500/60 rounded-2xl p-5 flex items-center gap-4 text-right shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-bold uppercase">דואר אלקטרוני</span>
                    <a
                      href={`mailto:${resolvedEmail}`}
                      className="text-lg font-black text-white hover:text-blue-400 transition-colors"
                      dir="ltr"
                    >
                      {resolvedEmail}
                    </a>
                  </div>
                </div>
              )}

              {resolvedAddress && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-zinc-900/90 border-2 border-zinc-700/80 hover:border-amber-500/60 rounded-2xl p-5 flex items-center gap-4 text-right shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-bold uppercase">כתובת ומיקום</span>
                    <span className="text-base font-black text-white">{resolvedAddress}</span>
                  </div>
                </div>
              )}

              {openingHours && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-zinc-900/90 border-2 border-zinc-700/80 hover:border-amber-500/60 rounded-2xl p-5 flex items-center gap-4 text-right shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-bold uppercase">שעות פעילות</span>
                    <span className="text-base font-black text-white">{openingHours}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Form Column */}
            {showForm && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="lg:col-span-7 bg-[#0e0f14] border-2 border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-right"
              >
                {renderInteractiveForm({
                  containerClass: '',
                  inputClass:
                    'bg-zinc-950 border-2 border-zinc-800 text-white placeholder-zinc-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20',
                  inputRadiusClass: getButtonShapeClass('rounded-xl'),
                  buttonShapeClass: getButtonShapeClass('rounded-xl'),
                  buttonColorClass:
                    'bg-gradient-to-l from-amber-500 via-amber-400 to-yellow-500 text-black font-black uppercase tracking-wider shadow-amber-500/25 hover:brightness-110',
                  titleColorClass: 'text-white font-black',
                  labelColorClass: 'text-zinc-300 font-bold',
                  stepActiveColorClass: 'bg-amber-400',
                  stepInactiveColorClass: 'bg-zinc-800',
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // ד. פריסה רוחנית (Spiritual Style - Serene Sage, Turquoise, Sacred Harmony)
  // ============================================================================
  if (normalizedLayout === 'spiritual') {
    return (
      <section
        id={anchorId || 'contact'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#f6faf8] via-[#eef6f3] to-[#f4f8f6] dark:from-[#061614] dark:via-[#0a1f1c] dark:to-[#04100e] transition-colors duration-700 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute top-10 right-1/4 w-[360px] h-[360px] bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-500/15 border border-teal-300 dark:border-teal-400/30 text-teal-800 dark:text-teal-200 text-xs font-normal w-fit">
                  <Sun className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                  'font-light sm:font-normal tracking-wide text-teal-950 dark:text-teal-50'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-[2.5rem]'
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {resolvedPhone && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/80 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right backdrop-blur-md shadow-lg shadow-teal-900/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-teal-700/80 dark:text-teal-300/80 block font-normal">טלפון ישיר</span>
                    <a
                      href={`tel:${resolvedPhone}`}
                      className="text-base font-bold text-teal-950 dark:text-teal-100 hover:text-teal-600 transition-colors"
                      dir="ltr"
                    >
                      {resolvedPhone}
                    </a>
                  </div>
                </div>
              )}

              {resolvedWhatsapp && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/80 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right backdrop-blur-md shadow-lg shadow-teal-900/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-teal-700/80 dark:text-teal-300/80 block font-normal">וואטסאפ לבירורים</span>
                    <a
                      href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                    >
                      שלחו הודעה בוואטסאפ
                    </a>
                  </div>
                </div>
              )}

              {resolvedEmail && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/80 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right backdrop-blur-md shadow-lg shadow-teal-900/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-teal-700/80 dark:text-teal-300/80 block font-normal">דואר אלקטרוני</span>
                    <a
                      href={`mailto:${resolvedEmail}`}
                      className="text-base font-bold text-teal-950 dark:text-teal-100 hover:text-teal-600 transition-colors"
                      dir="ltr"
                    >
                      {resolvedEmail}
                    </a>
                  </div>
                </div>
              )}

              {resolvedAddress && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="bg-white/80 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-800/40 rounded-[2rem] p-5 flex items-center gap-4 text-right backdrop-blur-md shadow-lg shadow-teal-900/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-teal-700/80 dark:text-teal-300/80 block font-normal">כתובת ומיקום</span>
                    <span className="text-base font-bold text-teal-950 dark:text-teal-100">{resolvedAddress}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Form Column */}
            {showForm && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="lg:col-span-7 bg-white/90 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/40 rounded-[2.5rem] p-6 sm:p-10 shadow-xl backdrop-blur-md text-right"
              >
                {renderInteractiveForm({
                  containerClass: '',
                  inputClass:
                    'bg-teal-50/40 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-50 placeholder-teal-400/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20',
                  inputRadiusClass: getButtonShapeClass('rounded-2xl'),
                  buttonShapeClass: getButtonShapeClass('rounded-full'),
                  buttonColorClass:
                    'bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/20 duration-700',
                  titleColorClass: 'text-teal-950 dark:text-teal-50',
                  labelColorClass: 'text-teal-900/80 dark:text-teal-200',
                  stepActiveColorClass: 'bg-teal-600',
                  stepInactiveColorClass: 'bg-teal-200 dark:bg-teal-900',
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // ה. פריסה חדה (Sharp Style - Brutalist, 90° Angles, Hard Shadows)
  // ============================================================================
  if (normalizedLayout === 'sharp') {
    return (
      <section
        id={anchorId || 'contact'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#fafafa] dark:bg-[#050505] text-black dark:text-white transition-colors duration-300 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-mono uppercase text-xs font-bold w-fit">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-5xl md:text-6xl'),
                  'font-black tracking-tight uppercase'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            </div>,
            'rounded-none'
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {resolvedPhone && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#6366f1] p-5 flex items-center gap-4 text-right transition-transform hover:-translate-x-1"
                >
                  <div className="w-12 h-12 rounded-none bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 font-mono font-bold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase block text-zinc-500 font-bold">
                      [PHONE // DIRECT]
                    </span>
                    <a
                      href={`tel:${resolvedPhone}`}
                      className="text-base font-black hover:text-indigo-600 dark:hover:text-indigo-400 font-mono"
                      dir="ltr"
                    >
                      {resolvedPhone}
                    </a>
                  </div>
                </div>
              )}

              {resolvedWhatsapp && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#10b981] p-5 flex items-center gap-4 text-right transition-transform hover:-translate-x-1"
                >
                  <div className="w-12 h-12 rounded-none bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase block text-zinc-500 font-bold">
                      [WHATSAPP // QUICK]
                    </span>
                    <a
                      href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-black text-emerald-600 dark:text-emerald-400"
                    >
                      שלח הודעה בוואטסאפ
                    </a>
                  </div>
                </div>
              )}

              {resolvedEmail && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#6366f1] p-5 flex items-center gap-4 text-right transition-transform hover:-translate-x-1"
                >
                  <div className="w-12 h-12 rounded-none bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase block text-zinc-500 font-bold">
                      [EMAIL // INBOX]
                    </span>
                    <a
                      href={`mailto:${resolvedEmail}`}
                      className="text-base font-black hover:text-indigo-600 dark:hover:text-indigo-400 font-mono"
                      dir="ltr"
                    >
                      {resolvedEmail}
                    </a>
                  </div>
                </div>
              )}

              {resolvedAddress && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#6366f1] p-5 flex items-center gap-4 text-right transition-transform hover:-translate-x-1"
                >
                  <div className="w-12 h-12 rounded-none bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase block text-zinc-500 font-bold">
                      [LOCATION // HQ]
                    </span>
                    <span className="text-base font-black">{resolvedAddress}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Form Column */}
            {showForm && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="lg:col-span-7 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#6366f1] p-6 sm:p-8 text-right"
              >
                {renderInteractiveForm({
                  containerClass: '',
                  inputClass:
                    'bg-white dark:bg-zinc-950 border-2 border-black dark:border-white text-black dark:text-white font-mono focus:border-indigo-600 focus:ring-0',
                  inputRadiusClass: getButtonShapeClass('rounded-none'),
                  buttonShapeClass: getButtonShapeClass('rounded-none'),
                  buttonColorClass:
                    'bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-black uppercase shadow-[4px_4px_0px_#6366f1] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none',
                  titleColorClass: 'text-black dark:text-white font-black uppercase font-mono',
                  labelColorClass: 'text-black dark:text-white font-mono font-bold',
                  stepActiveColorClass: 'bg-black dark:bg-white',
                  stepInactiveColorClass: 'bg-zinc-300 dark:bg-zinc-800',
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // ו. פריסה אנליטית (Analytical Style - Data HUD, Live Telemetry SLA)
  // ============================================================================
  if (normalizedLayout === 'analytical') {
    return (
      <section
        id={anchorId || 'contact'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#070e1b] via-[#0b1528] to-[#040812] text-white transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        {/* Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#06b6d4 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs w-fit">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                  <span className="text-[10px] text-emerald-400 font-bold border-r border-cyan-500/30 pr-2 mr-1">
                    [ONLINE // 99.8%]
                  </span>
                </div>
              )}
              <h2
                className={clsx(
                  getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                  'font-bold tracking-tight text-white font-mono'
                )}
                style={{ color: titleColor }}
              >
                {title}
              </h2>

              {/* Telemetry live status strip */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-cyan-300/80 pt-1 border-t border-cyan-500/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>זמן תגובה ממוצע: 3.8 דקות</span>
                </span>
                <span>•</span>
                <span>הצפנת נתונים: SSL 256-Bit</span>
                <span>•</span>
                <span>סנכרון ישיר ל-CRM</span>
              </div>
            </div>,
            'rounded-2xl'
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {resolvedPhone && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-2xl bg-[#091322]/90 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/50 p-5 flex items-center gap-4 text-right hover:border-cyan-400 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 font-mono">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400/80 block uppercase tracking-wider">
                      [TELEMETRY // TEL]
                    </span>
                    <a
                      href={`tel:${resolvedPhone}`}
                      className="text-base font-bold text-white hover:text-cyan-400 font-mono"
                      dir="ltr"
                    >
                      {resolvedPhone}
                    </a>
                  </div>
                </div>
              )}

              {resolvedWhatsapp && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-2xl bg-[#091322]/90 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/50 p-5 flex items-center gap-4 text-right hover:border-emerald-400 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400/80 block uppercase tracking-wider">
                      [INSTANT // WHATSAPP]
                    </span>
                    <a
                      href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-bold text-emerald-400 hover:text-emerald-300 font-mono"
                    >
                      פתח שיחה ישירה
                    </a>
                  </div>
                </div>
              )}

              {resolvedEmail && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-2xl bg-[#091322]/90 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/50 p-5 flex items-center gap-4 text-right hover:border-cyan-400 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400/80 block uppercase tracking-wider">
                      [DISPATCH // EMAIL]
                    </span>
                    <a
                      href={`mailto:${resolvedEmail}`}
                      className="text-base font-bold text-white hover:text-cyan-400 font-mono"
                      dir="ltr"
                    >
                      {resolvedEmail}
                    </a>
                  </div>
                </div>
              )}

              {resolvedAddress && (
                <div
                  style={{ backgroundColor: cardBackgroundColor }}
                  className="rounded-2xl bg-[#091322]/90 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/50 p-5 flex items-center gap-4 text-right hover:border-cyan-400 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400/80 block uppercase tracking-wider">
                      [GEO_NODE // OFFICE]
                    </span>
                    <span className="text-base font-bold text-white">{resolvedAddress}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Form Column */}
            {showForm && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="lg:col-span-7 rounded-2xl bg-[#091322]/95 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md text-right"
              >
                {renderInteractiveForm({
                  containerClass: '',
                  inputClass:
                    'bg-[#050b14] border border-cyan-900/60 text-cyan-50 placeholder-cyan-700 font-mono focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40',
                  inputRadiusClass: getButtonShapeClass('rounded-xl'),
                  buttonShapeClass: getButtonShapeClass('rounded-xl'),
                  buttonColorClass:
                    'bg-gradient-to-l from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold shadow-cyan-500/25',
                  titleColorClass: 'text-white font-mono font-bold',
                  labelColorClass: 'text-cyan-300 font-mono text-xs',
                  stepActiveColorClass: 'bg-cyan-400',
                  stepInactiveColorClass: 'bg-cyan-950',
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // ג. הפריסה העכשווית (Standard / Current - Notion / SaaS 2026 Style)
  // ============================================================================
  return (
    <section
      id={anchorId || 'contact'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden group/textbg transition-colors duration-300"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        {wrapTextWithOptionalBg(
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
            <h2
              className={clsx(
                getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                'font-extrabold tracking-tight leading-tight',
                textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
              )}
              style={{ color: titleColor }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={clsx(
                  'text-sm sm:text-base leading-relaxed',
                  textBgEnabled ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'
                )}
                style={{ color: subtitleColor }}
              >
                {subtitle}
              </p>
            )}
          </div>,
          'rounded-3xl'
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {resolvedPhone && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">טלפון ישיר</span>
                  <a
                    href={`tel:${resolvedPhone}`}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    dir="ltr"
                  >
                    {resolvedPhone}
                  </a>
                </div>
              </div>
            )}

            {resolvedWhatsapp && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    וואטסאפ לבירורים מהירים
                  </span>
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
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">דואר אלקטרוני</span>
                  <a
                    href={`mailto:${resolvedEmail}`}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    dir="ltr"
                  >
                    {resolvedEmail}
                  </a>
                </div>
              </div>
            )}

            {resolvedAddress && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">כתובת ומיקום</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{resolvedAddress}</span>
                </div>
              </div>
            )}

            {openingHours && (
              <div
                style={{ backgroundColor: cardBackgroundColor }}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">שעות פעילות</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{openingHours}</span>
                </div>
              </div>
            )}

            {directWhatsappChat && resolvedWhatsapp && (
              <a
                href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className={clsx(
                  'w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer mt-1'
                )}
              >
                <MessageCircle className="w-5 h-5" />
                <span>פנייה ישירה בוואטסאפ</span>
              </a>
            )}
          </div>

          {/* Form Column */}
          {showForm && (
            <div
              style={{ backgroundColor: cardBackgroundColor }}
              className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-right"
            >
              {renderInteractiveForm({
                containerClass: '',
                inputClass:
                  'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500',
                inputRadiusClass: getButtonShapeClass('rounded-xl'),
                buttonShapeClass: getButtonShapeClass('rounded-xl'),
                buttonColorClass:
                  'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
                titleColorClass: 'text-slate-900 dark:text-white',
                labelColorClass: 'text-slate-700 dark:text-slate-300',
                stepActiveColorClass: 'bg-indigo-600',
                stepInactiveColorClass: 'bg-slate-200 dark:bg-slate-800',
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
