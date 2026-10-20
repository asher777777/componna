import React, { useState, useEffect } from 'react';
import {
  LandingSectionConfig,
  LandingLayoutPreset,
  LandingFormPosition,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import {
  FormConfigContract,
  WhatsAppContract,
  BrandDnaContract,
} from '../../../../core/contracts';
import {
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
  ArrowLeft,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { eventBus } from '../../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { resolveLiveBrandDna } from '../../generators/pageGenerator';
import { DEFAULT_LANDING_FORM_CONFIG } from './LandingFormDefaults';
import { clsx } from 'clsx';

export const LandingSection: React.FC<{ config: LandingSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const fallbackCompanyName = brandDna?.identity?.companyName || '';
  const fallbackSlogan = brandDna?.identity?.slogan || '';
  const fallbackUvp = brandDna?.audience?.mainUvp || brandDna?.identity?.companyVision || '';

  const {
    anchorId = 'landingSection',
    title = rawBrandDna?.uiVocabulary?.sectionHeadings?.landingHeading || rawBrandDna?.uiVocabulary?.sectionHeadings?.painPointsHeading || (fallbackCompanyName ? `השאירו פרטים לקבלת מידע נוסף מ-${fallbackCompanyName}` : 'השאירו פרטים לקבלת מידע נוסף'),
    subtitle = rawBrandDna?.uiVocabulary?.sectionHeadings?.landingSubtitle || fallbackSlogan || 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
    badge = 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
    description = fallbackUvp || 'מלאו את הפרטים הקצרים בטופס ונציג מקצועי יחזור אליכם בהקדם האפשרי.',
    imageSrc,
    buttonText = 'שליחת פרטים עכשיו',
    modalButtonText = 'השאירו פרטים לקבלת מידע',
    formId,
    form: propForm,
    formPosition = 'left',
    layout = 'standard',
    objectScale = 'normal',
    buttonShape = 'rounded',
    buttonSize = 'md',
    titleColor,
    subtitleColor,
    descriptionColor,
    backgroundColor = 'transparent',
    cardBackgroundColor,
    accentColor,
    isUnbounded,
    buttonPosition = 'start',
    contentAlignment = 'right',
    imageOverflow,
    imageOverflowOffset = 'side',
    imageBorderRadius = '2xl',
    titleFontSize,
    titleFontWeight,
    titleItalic,
    titleUnderline,
    titleAlignment,
    subtitleFontSize,
    subtitleFontWeight,
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
  } = config;

  const activeForm: FormConfigContract =
    typeof propForm === 'object' && propForm ? propForm : DEFAULT_LANDING_FORM_CONFIG;

  const normalizedLayout: LandingLayoutPreset =
    layout === 'feminine' ||
    layout === 'masculine' ||
    layout === 'spiritual' ||
    layout === 'sharp' ||
    layout === 'analytical'
      ? layout
      : 'standard';

  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
        conta_name: clientName || 'ליד מדף נחיתה',
        conta_phone: clientPhone,
        email: clientEmail,
        source: 'KosWebAi:LandingSection',
        metadata: formData,
      });

      if (activeForm.standard_whatsapp_message) {
        await sendAutomatedWhatsApp(activeForm.standard_whatsapp_message);
      }

      setSuccessMessage(
        activeForm.standard_success_message ||
          'פנייתך התקבלה בהצלחה! נציג מקצועי יחזור אליך בהקדם האפשרי.'
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
        source: 'KosWebAi:LandingSection:Payment',
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

  // Sizing scale helpers
  const getScaleClasses = () => {
    switch (objectScale) {
      case 'compact':
        return {
          titleSize: 'text-2xl sm:text-3xl',
          subSize: 'text-xs sm:text-sm',
          descSize: 'text-xs sm:text-sm leading-relaxed',
          cardPadding: 'p-5 sm:p-6',
          inputHeight: 'h-9 text-xs',
          btnPadding: 'px-4 py-2 text-xs',
          gap: 'gap-4',
        };
      case 'spacious':
        return {
          titleSize: 'text-4xl sm:text-5xl md:text-6xl',
          subSize: 'text-sm sm:text-base',
          descSize: 'text-base sm:text-lg leading-relaxed',
          cardPadding: 'p-8 sm:p-12',
          inputHeight: 'h-13 text-base',
          btnPadding: 'px-8 py-4 text-base font-extrabold',
          gap: 'gap-8',
        };
      case 'normal':
      default:
        return {
          titleSize: 'text-3xl sm:text-4xl lg:text-5xl',
          subSize: 'text-xs sm:text-sm',
          descSize: 'text-sm sm:text-base leading-relaxed',
          cardPadding: 'p-6 sm:p-8',
          inputHeight: 'h-11 text-sm',
          btnPadding: 'px-6 py-3 text-sm font-bold',
          gap: 'gap-6',
        };
    }
  };
  const scale = getScaleClasses();

  // Button shape helper
  const getButtonShapeClass = () => {
    switch (buttonShape) {
      case 'pill':
        return 'rounded-full';
      case 'sharp':
        return 'rounded-none';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  };

  // Alignment classes
  const getContentAlignClass = () => {
    switch (contentAlignment) {
      case 'center':
        return 'text-center items-center';
      case 'left':
        return 'text-left items-start';
      case 'right':
      default:
        return 'text-right items-start';
    }
  };

  const getButtonPositionClass = () => {
    switch (buttonPosition) {
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'start':
      default:
        return 'justify-start';
    }
  };

  const getTitleSizeClass = () => {
    switch (titleFontSize) {
      case 'xl': return 'text-xl sm:text-2xl';
      case '2xl': return 'text-2xl sm:text-3xl';
      case '3xl': return 'text-3xl sm:text-4xl';
      case '4xl': return 'text-4xl sm:text-5xl';
      default: return scale.titleSize;
    }
  };

  const getImageBorderRadiusClass = () => {
    switch (imageBorderRadius) {
      case 'none': return 'rounded-none';
      case 'md': return 'rounded-xl';
      case 'full': return 'rounded-full';
      case '2xl':
      default: return 'rounded-3xl';
    }
  };

  const getImageOverflowClass = () => {
    if (!imageOverflow) return '';
    switch (imageOverflowOffset) {
      case 'top':
        return '-mt-8 sm:-mt-14 relative z-20 shadow-2xl scale-[1.03] transition-transform duration-500 hover:scale-105';
      case 'bottom':
        return '-mb-8 sm:-mb-14 relative z-20 shadow-2xl scale-[1.03] transition-transform duration-500 hover:scale-105';
      case 'side':
        return 'lg:-mr-10 xl:-mr-16 relative z-20 shadow-2xl scale-[1.04] transition-transform duration-500 hover:scale-105';
      case 'both':
      default:
        return '-mt-6 lg:-mt-12 lg:-mr-10 relative z-20 shadow-2xl scale-[1.05] transition-transform duration-500 hover:scale-105';
    }
  };

  // Button size helper
  const getButtonSizeClass = () => {
    switch (buttonSize) {
      case 'sm':
        return 'px-4 py-2 text-xs';
      case 'lg':
        return 'px-8 py-4 text-base font-extrabold';
      case 'md':
      default:
        return 'px-6 py-3 text-sm font-bold';
    }
  };

  // Hover Effect for Text Background
  const getTextBgEffectClass = (eff: HeroTextBgEffect) => {
    switch (eff) {
      case 'zoom-glow':
        return 'group-hover/textbg:scale-105 group-hover/textbg:brightness-110 transition-all duration-700';
      case 'shimmer-sweep':
        return 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent after:-translate-x-full group-hover/textbg:after:translate-x-full after:transition-transform after:duration-1000';
      case 'float-parallax':
        return 'group-hover/textbg:-translate-y-1 group-hover/textbg:scale-[1.01] transition-all duration-500';
      case 'blur-reveal':
        return 'blur-[2px] group-hover/textbg:blur-0 transition-all duration-500';
      case 'gradient-shift':
        return 'group-hover/textbg:contrast-125 transition-all duration-700';
      default:
        return 'transition-transform duration-500 group-hover/textbg:scale-105';
    }
  };

  // Theme Classes for the 6 Visual Presets
  const getThemeClasses = () => {
    switch (normalizedLayout) {
      case 'feminine':
        return {
          wrapper: 'font-sans bg-gradient-to-br from-[#fff7f9] via-[#fdf2f5] to-[#fbf7f4] dark:from-[#170a13] dark:via-[#1c0f17] dark:to-[#120a0f]',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-300/40 rounded-full px-4 py-1.5 shadow-sm font-medium',
          title: 'font-serif text-rose-950 dark:text-rose-50 drop-shadow-sm',
          subtitle: 'text-rose-700/80 dark:text-rose-200/70',
          desc: 'text-rose-900/60 dark:text-rose-200/50',
          containerCard: 'bg-white/85 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-500/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(244,63,94,0.08)] backdrop-blur-xl',
          formCard: 'bg-white/95 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-[2.2rem] shadow-xl backdrop-blur-xl',
          input: 'bg-rose-50/40 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-500/30 text-rose-950 dark:text-rose-50 placeholder-rose-400/60 rounded-2xl focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30',
          label: 'text-rose-900 dark:text-rose-100 font-medium',
          submitBtn: 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25',
          modalBackdrop: 'bg-black/60 backdrop-blur-md',
          modalBox: 'bg-gradient-to-b from-rose-950/95 via-black to-black border-2 border-rose-500/30 rounded-[2.5rem] text-white shadow-2xl',
          accent: '#f43f5e',
          stepActive: 'bg-rose-500',
          stepInactive: 'bg-rose-500/20',
        };
      case 'masculine':
        return {
          wrapper: 'font-sans bg-gradient-to-b from-zinc-950 via-zinc-900 to-black',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30 rounded-lg px-3.5 py-1 tracking-wider uppercase font-mono text-xs',
          title: 'font-black tracking-tight text-white drop-shadow-md',
          subtitle: 'text-zinc-400 font-medium',
          desc: 'text-zinc-500',
          containerCard: 'bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black border-2 border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl',
          formCard: 'bg-black/90 border-2 border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl',
          input: 'bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono',
          label: 'text-zinc-200 font-bold',
          submitBtn: 'bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider shadow-lg shadow-amber-500/20',
          modalBackdrop: 'bg-black/80 backdrop-blur-lg',
          modalBox: 'bg-zinc-950 border-2 border-amber-500/40 rounded-2xl text-white shadow-2xl',
          accent: '#f59e0b',
          stepActive: 'bg-amber-500',
          stepInactive: 'bg-zinc-800',
        };
      case 'spiritual':
        return {
          wrapper: 'font-sans bg-gradient-to-b from-[#061815] via-[#09221d] to-[#040e0c]',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 rounded-full px-4 py-1.5 font-light shadow-[0_0_20px_rgba(16,185,129,0.2)]',
          title: 'font-light tracking-wide text-emerald-50 drop-shadow-sm',
          subtitle: 'text-emerald-200/80',
          desc: 'text-emerald-300/60',
          containerCard: 'bg-gradient-to-b from-emerald-950/30 via-teal-950/20 to-slate-950/80 border border-emerald-500/25 rounded-[2.5rem] shadow-[0_20px_60px_rgba(16,185,129,0.15)] backdrop-blur-2xl',
          formCard: 'bg-emerald-950/40 border border-emerald-500/30 rounded-[2.2rem] shadow-xl backdrop-blur-2xl',
          input: 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-50 placeholder-emerald-400/50 rounded-2xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20',
          label: 'text-emerald-200 font-medium',
          submitBtn: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30',
          modalBackdrop: 'bg-black/70 backdrop-blur-md',
          modalBox: 'bg-[#09221d] border border-emerald-500/40 rounded-[2.5rem] text-white shadow-2xl',
          accent: '#10b981',
          stepActive: 'bg-emerald-500',
          stepInactive: 'bg-emerald-950',
        };
      case 'sharp':
        return {
          wrapper: 'font-sans bg-black',
          badge: 'bg-cyan-950/80 text-cyan-300 border-2 border-cyan-500/70 rounded-none px-3 py-1 font-mono text-[11px] uppercase tracking-widest',
          title: 'font-mono font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]',
          subtitle: 'text-cyan-200/80 font-mono text-xs',
          desc: 'text-zinc-400 font-mono text-xs',
          containerCard: 'bg-black border-2 border-cyan-500/40 rounded-none shadow-[0_0_30px_rgba(6,182,212,0.18)]',
          formCard: 'bg-black border-2 border-cyan-500/50 rounded-none shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          input: 'bg-zinc-950 border border-cyan-500/60 text-white placeholder-zinc-600 rounded-none focus:border-cyan-400 focus:ring-0 font-mono text-xs',
          label: 'text-cyan-200 font-mono text-xs font-bold',
          submitBtn: 'bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black uppercase rounded-none shadow-[0_0_20px_rgba(6,182,212,0.5)]',
          modalBackdrop: 'bg-black/85 backdrop-blur-md',
          modalBox: 'bg-black border-2 border-cyan-500 rounded-none text-white shadow-[0_0_40px_rgba(6,182,212,0.3)]',
          accent: '#06b6d4',
          stepActive: 'bg-cyan-500',
          stepInactive: 'bg-zinc-800',
        };
      case 'analytical':
        return {
          wrapper: 'font-sans bg-slate-950',
          badge: 'bg-blue-950/80 text-blue-300 border border-blue-500/40 rounded-md px-3 py-1 font-mono text-xs',
          title: 'font-extrabold tracking-tight text-white border-r-4 border-blue-500 pr-3',
          subtitle: 'text-slate-400 font-mono text-xs',
          desc: 'text-slate-400 text-xs',
          containerCard: 'bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-xl',
          formCard: 'bg-slate-950/90 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-xl',
          input: 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-mono text-xs',
          label: 'text-slate-200 font-bold text-xs',
          submitBtn: 'bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md shadow-blue-600/30',
          modalBackdrop: 'bg-black/80 backdrop-blur-md',
          modalBox: 'bg-slate-900 border border-blue-500/40 rounded-xl text-white shadow-2xl',
          accent: '#3b82f6',
          stepActive: 'bg-blue-500',
          stepInactive: 'bg-slate-800',
        };
      case 'standard':
      default:
        return {
          wrapper: 'font-sans bg-slate-50/50 dark:bg-slate-950/50',
          badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full px-4 py-1 text-xs font-bold shadow-xs',
          title: 'font-extrabold tracking-tight text-slate-900 dark:text-white',
          subtitle: 'text-slate-600 dark:text-slate-300 font-medium',
          desc: 'text-slate-600 dark:text-slate-300',
          containerCard: 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl',
          formCard: 'bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl backdrop-blur-xl',
          input: 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
          label: 'text-slate-700 dark:text-slate-300 font-semibold',
          submitBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-bold',
          modalBackdrop: 'bg-black/75 backdrop-blur-sm',
          modalBox: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-900 dark:text-white shadow-2xl',
          accent: accentColor || '#4f46e5',
          stepActive: 'bg-indigo-600',
          stepInactive: 'bg-slate-200 dark:bg-slate-800',
        };
    }
  };
  const theme = getThemeClasses();

  // Render form content inside card or modal
  const renderFormContent = () => {
    if (isSubmitted) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-8 gap-3 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {successMessage || 'פנייתך התקבלה בהצלחה!'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            הפרטים נקלטו במערכת ונציג מקצועי יחזור אליך בהקדם האפשרי.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setShowCheckout(false);
              setCurrentStep(1);
            }}
            className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            שליחת טופס נוסף
          </button>
        </div>
      );
    }

    if (showCheckout && checkoutData) {
      return (
        <div className="space-y-4 text-right animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <span>סליקה ותשלום מאובטח</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              חזרה לטופס
            </button>
          </div>

          <div className="p-3.5 rounded-2xl text-xs space-y-1.5 border border-white/10 bg-white/5">
            <div><strong>עבור:</strong> {title}</div>
            <div><strong>משלם:</strong> {checkoutData.clientName}</div>
            {checkoutData.phone && <div><strong>טלפון:</strong> {checkoutData.phone}</div>}
            <div>
              <strong>סכום לחיוב:</strong>{' '}
              <span className="font-mono font-bold text-emerald-400">
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
              <div className="p-5 bg-slate-800/40 rounded-2xl text-center space-y-2 border border-slate-700">
                <CreditCard className="w-7 h-7 text-indigo-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">מסוף הסליקה מוכן לקליטת תשלום</h4>
                <p className="text-[11px] text-slate-400">הסליקה מתבצעת תחת מודול kesher-payments-hub.</p>
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentSuccess({
                      transactionId: `landing_${Date.now()}`,
                      amount: checkoutData.amount,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-md"
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-right">
        {totalSteps > 1 && (
          <div className="flex items-center justify-between pb-1 border-b border-white/10 text-xs">
            <span className="font-semibold text-slate-400">
              שלב {currentStep} מתוך {totalSteps}
            </span>
            <div className="flex gap-1 w-24">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'h-1.5 flex-1 rounded-full transition-all',
                    i + 1 <= currentStep ? theme.stepActive : theme.stepInactive
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div key={idx} className="sm:col-span-2 pt-1 pb-0.5" style={{ textAlign: field.textAlign || 'right' }}>
                    <h4 className="text-xs font-bold text-white" style={{ color: field.textColor || undefined }}>
                      {field.label}
                    </h4>
                  </div>
                );
              }

              if (field.type === 'payment_summary') {
                return (
                  <div
                    key={idx}
                    className="sm:col-span-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-indigo-300">סכום לתשלום:</span>
                    <span className="font-mono text-sm font-black text-white">
                      ₪{getResolvedPaymentAmount()}
                    </span>
                  </div>
                );
              }

              if (field.type === 'payment_cc') {
                return (
                  <div
                    key={idx}
                    className="sm:col-span-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>סליקת האשראי תתבצע בצורה מאובטחת תחת תקן PCI-DSS.</span>
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

              return (
                <div key={idx} className={isFullWidth ? 'sm:col-span-2' : ''}>
                  <label
                    className={clsx('block text-xs font-semibold mb-1', theme.label)}
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
                      className={clsx(
                        'w-full px-3.5 py-2.5 text-sm outline-none resize-none transition-all',
                        theme.input,
                        hasError && 'border-rose-500 ring-1 ring-rose-500'
                      )}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.label] || ''}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      style={customStyle}
                      className={clsx(
                        'w-full px-3.5 py-2.5 text-sm outline-none transition-all',
                        scale.inputHeight,
                        theme.input,
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
                      className={clsx(
                        'w-full px-3.5 py-2 text-sm outline-none transition-all',
                        scale.inputHeight,
                        theme.input,
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

        {/* Step Buttons / Submit Button */}
        <div className="flex items-center gap-2 pt-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className={clsx(
                'px-4 py-2 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5',
                getButtonShapeClass()
              )}
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{activeForm.back_button_text || 'חזור'}</span>
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep(currentStep)) {
                  setCurrentStep((prev) => prev + 1);
                }
              }}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 transition cursor-pointer',
                scale.btnPadding,
                getButtonShapeClass(),
                theme.submitBtn
              )}
            >
              <span>{activeForm.continue_button_text || 'המשך לשלב הבא'}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50',
                scale.btnPadding,
                getButtonShapeClass(),
                theme.submitBtn
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>שולח נתונים...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{activeForm.submit_button_text || buttonText || 'שליחת פרטים עכשיו'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    );
  };

  // Render text & media side
  const renderTextContent = () => (
    <div className={clsx('flex flex-col gap-4', getContentAlignClass())}>
      {badge && (
        <div className={clsx('w-fit flex', getButtonPositionClass())}>
          <span className={clsx('text-xs font-bold inline-block', theme.badge)}>
            {badge}
          </span>
        </div>
      )}

      {title && (
        <h2
          className={clsx(
            'leading-tight tracking-tight',
            getTitleSizeClass(),
            titleFontWeight === 'extrabold' ? 'font-black' : titleFontWeight === 'bold' ? 'font-bold' : titleFontWeight === 'normal' ? 'font-normal' : '',
            titleItalic && 'italic',
            titleUnderline && 'underline underline-offset-4',
            theme.title
          )}
          style={{
            color: titleColor,
            textAlign: titleAlignment || contentAlignment || 'right',
          }}
        >
          {title}
        </h2>
      )}

      {subtitle && (
        <p
          className={clsx(
            'leading-relaxed font-medium',
            subtitleFontSize === 'sm' ? 'text-sm' : subtitleFontSize === 'lg' ? 'text-lg font-bold' : 'text-base',
            theme.subtitle
          )}
          style={{ color: subtitleColor }}
        >
          {subtitle}
        </p>
      )}

      {description && (
        <p
          className={clsx('leading-relaxed', scale.descSize, theme.desc)}
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
      )}

      {/* Modal Trigger Button when formPosition === 'modal' */}
      {formPosition === 'modal' && (
        <div className={clsx('pt-2 flex w-full', getButtonPositionClass())}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={clsx(
              'inline-flex items-center gap-2.5 transition-all duration-300 shadow-xl cursor-pointer hover:scale-105',
              scale.btnPadding,
              getButtonShapeClass(),
              getButtonSizeClass(),
              theme.submitBtn
            )}
          >
            <Send className="w-4 h-4" />
            <span>{modalButtonText || buttonText || 'השאירו פרטים לקבלת מידע'}</span>
          </button>
        </div>
      )}

      {imageSrc && (
        <div
          className={clsx(
            'mt-3 overflow-hidden border border-white/10 max-w-sm sm:max-w-md aspect-video shadow-xl transition-all duration-500',
            getImageBorderRadiusClass(),
            getImageOverflowClass()
          )}
        >
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );

  return (
    <section
      id={anchorId || 'landingSection'}
      className={clsx('w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors', theme.wrapper)}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Whole-Section Text Background Layer */}
      {textBgEnabled && textBgScope === 'whole-section' && textBgImageUrl && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 group/textbg">
          <div
            className={clsx('absolute inset-0 bg-cover bg-center', getTextBgEffectClass(textBgEffect))}
            style={{ backgroundImage: `url(${textBgImageUrl})` }}
          />
          <div
            className="absolute inset-0 transition-opacity"
            style={{
              backgroundColor: textBgOverlayColor || '#000000',
              opacity: (textBgOverlayOpacity ?? 60) / 100,
            }}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Section Container Card */}
        <div
          className={clsx(
            'relative transition-all duration-300 group/textbg',
            imageOverflow ? 'overflow-visible' : 'overflow-hidden',
            isUnbounded
              ? 'bg-transparent border-none shadow-none p-0'
              : clsx(theme.containerCard, scale.cardPadding)
          )}
          style={{
            backgroundColor: isUnbounded ? 'transparent' : (cardBackgroundColor || undefined),
          }}
        >
          {/* Card-Scope Text Background Layer */}
          {textBgEnabled && textBgScope === 'text-card' && textBgImageUrl && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div
                className={clsx('absolute inset-0 bg-cover bg-center', getTextBgEffectClass(textBgEffect))}
                style={{ backgroundImage: `url(${textBgImageUrl})` }}
              />
              <div
                className="absolute inset-0 transition-opacity"
                style={{
                  backgroundColor: textBgOverlayColor || '#000000',
                  opacity: (textBgOverlayOpacity ?? 70) / 100,
                }}
              />
            </div>
          )}

          <div className="relative z-10">
            {/* Display Placement: Left Form (Matches Screenshot) */}
            {formPosition === 'left' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Right Column: Headings & Text */}
                <div className="lg:col-span-6">{renderTextContent()}</div>

                {/* Left Column: Form Card */}
                <div
                  className={clsx(
                    'lg:col-span-6 p-6 sm:p-8 transition-all',
                    theme.formCard
                  )}
                >
                  {renderFormContent()}
                </div>
              </div>
            )}

            {/* Display Placement: Right Form */}
            {formPosition === 'right' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Right Column: Form Card */}
                <div
                  className={clsx(
                    'lg:col-span-6 p-6 sm:p-8 transition-all order-2 lg:order-1',
                    theme.formCard
                  )}
                >
                  {renderFormContent()}
                </div>

                {/* Left Column: Headings & Text */}
                <div className="lg:col-span-6 order-1 lg:order-2">{renderTextContent()}</div>
              </div>
            )}

            {/* Display Placement: Stacked Bottom */}
            {formPosition === 'bottom' && (
              <div className="flex flex-col gap-8 max-w-3xl mx-auto">
                <div className="text-center flex flex-col items-center">
                  {renderTextContent()}
                </div>

                <div className={clsx('w-full p-6 sm:p-8 transition-all', theme.formCard)}>
                  {renderFormContent()}
                </div>
              </div>
            )}

            {/* Display Placement: Modal Trigger Only */}
            {formPosition === 'modal' && (
              <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
                {renderTextContent()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branded Modal Popup for Form (when formPosition === 'modal' or opened) */}
      {isModalOpen && (
        <div
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200',
            theme.modalBackdrop
          )}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={clsx(
              'relative w-full max-w-xl max-h-[92vh] overflow-y-auto no-scrollbar p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-right',
              theme.modalBox
            )}
            style={{ fontFamily: "'Heebo', sans-serif" }}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="truncate">
                <h3 className="text-base sm:text-lg font-black truncate">{title}</h3>
                {subtitle && <p className="text-xs text-zinc-400 truncate mt-0.5">{subtitle}</p>}
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-white shrink-0"
                title="סגור"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            {renderFormContent()}
          </div>
        </div>
      )}
    </section>
  );
};
