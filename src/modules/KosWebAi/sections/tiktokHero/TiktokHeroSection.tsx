import React, { useState, useEffect, useRef } from 'react';
import { TiktokHeroSectionConfig } from '../../types/sectionConfigs';
import {
  FormConfigContract,
  WhatsAppContract,
  BrandDnaContract,
} from '../../../../core/contracts';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Video as VideoIcon,
  Clock,
  Radio,
  Send,
  Loader2,
} from 'lucide-react';
import { eventBus } from '../../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { resolveLiveBrandDna } from '../../generators/pageGenerator';
import { DEFAULT_CONTACT_FORM_CONFIG } from '../contact/ContactFormConfigEditor';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { clsx } from 'clsx';

export const TiktokHeroSection: React.FC<{ config: TiktokHeroSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const {
    anchorId,
    video = {},
    overlay = { mode: 'gradient', opacity: 40 },
    ambientGlow = true,
    headline = 'מחפש עבודה',
    headlineColor = '#ffffff',
    headlineSize = 'xl',
    headlineWeight = 'extrabold',
    headlineShadow = true,
    card = {
      enabled: true,
      tag: 'קושאן – מערכת חכמה',
      title: 'קושאן – כל אדם זה נכס',
      subtitle: 'מערכת פרימיום מתקדמת המעניקה מענה מדויק, מהיר ומותאם אישית לכל צורך עסקי.',
      style: 'solid',
    },
    ctaButton = {
      text: 'מצא עכשיו',
      iconName: 'Sparkles',
      showIcon: true,
      iconPosition: 'left',
      bgColor: '#0284c7',
      textColor: '#ffffff',
      pulseEffect: true,
      actionType: 'modal_form',
    },
    modalTitle = 'השארת פרטים לקבלת הצעה',
    modalSubtitle = 'מלאו את הפרטים ונחזור אליכם בהקדם האפשרי',
    formId,
    form: propForm,
    backgroundColor = 'transparent',
  } = config;

  // Video playback & mute states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(video.muted ?? true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const activeForm: FormConfigContract = propForm || DEFAULT_CONTACT_FORM_CONFIG;

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

  // Initialize form default values
  useEffect(() => {
    const initial: Record<string, string> = {};
    (activeForm.fields || []).forEach((f) => {
      initial[f.label] = f.default_value || '';
    });
    setFormData(initial);
  }, [propForm]);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleCtaClick = () => {
    if (ctaButton.actionType === 'modal_form') {
      setIsModalOpen(true);
    } else if (ctaButton.linkUrl) {
      window.open(ctaButton.linkUrl, '_blank');
    }
  };

  // Form field calculations
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
        source: 'KosWebAi:TiktokHeroSection',
      });
    } catch (e) {
      console.warn('Could not dispatch automated WhatsApp:', e);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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

        if (activeForm.payment_pending_message) {
          sendAutomatedWhatsApp(activeForm.payment_pending_message, { amount: String(amount) });
        }

        setShowCheckout(true);
        setIsSubmitting(false);
        return;
      }

      // Emit CRM lead
      eventBus.emit('crm:lead:created', {
        conta_name: clientName,
        conta_phone: clientPhone,
        email: clientEmail,
        source: 'TiktokHeroSection',
        metadata: {
          notes: clientNotes,
          formData,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        },
      });

      if (activeForm.standard_whatsapp_message) {
        await sendAutomatedWhatsApp(activeForm.standard_whatsapp_message);
      }

      setIsSubmitted(true);
      setSuccessMessage(activeForm.standard_success_message || 'תודה! פנייתך התקבלה בהצלחה.');
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (txData: any) => {
    setShowCheckout(false);
    setIsSubmitted(true);
    setSuccessMessage(activeForm.payment_success_message || 'התשלום בוצע בהצלחה! קבלה נשלחה למייל.');

    eventBus.emit('crm:lead:created', {
      conta_name: checkoutData?.clientName || 'לקוח',
      conta_phone: checkoutData?.phone || '',
      email: checkoutData?.email || '',
      source: 'TiktokHeroSection:Payment',
      metadata: {
        amountPaid: checkoutData?.amount,
        transactionId: txData.transactionId,
        receiptUrl: txData.receiptUrl,
        status: 'תשלום בוצע',
      },
    });

    if (activeForm.payment_success_message) {
      await sendAutomatedWhatsApp(activeForm.payment_success_message, {
        amount: String(checkoutData?.amount),
        receiptUrl: txData.receiptUrl || '',
      });
    }
  };

  // Video fallback sample
  const effectiveVideoUrl = video.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4';
  const effectivePosterUrl = video.posterUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80';

  // Headline sizing classes
  const headlineClass = clsx(
    'tracking-tight font-sans drop-shadow-md text-center transition-all',
    headlineSize === 'sm' && 'text-2xl sm:text-3xl',
    headlineSize === 'md' && 'text-3xl sm:text-4xl',
    headlineSize === 'lg' && 'text-4xl sm:text-5xl',
    headlineSize === 'xl' && 'text-4xl sm:text-5xl md:text-6xl',
    headlineSize === '2xl' && 'text-5xl sm:text-6xl md:text-7xl',
    headlineWeight === 'bold' && 'font-bold',
    headlineWeight === 'extrabold' && 'font-extrabold',
    headlineWeight === 'black' && 'font-black',
    headlineShadow && 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
  );

  return (
    <section
      id={anchorId || 'tiktok-hero'}
      className="relative w-full py-8 md:py-16 px-4 sm:px-6 overflow-hidden flex flex-col items-center justify-center min-h-[600px] md:min-h-[850px]"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* 1. Ambient Glow Backdrop */}
      {ambientGlow && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[600px] sm:h-[800px] bg-gradient-to-b from-blue-600/20 via-indigo-600/15 to-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />
        </>
      )}

      {/* 2. TikTok 9:16 Frame Container */}
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] md:max-w-[430px] aspect-[9/16] rounded-[32px] sm:rounded-[38px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[3px] sm:border-[4px] border-slate-800/80 bg-black flex flex-col justify-between p-4 sm:p-5 select-none transition-transform duration-300 hover:shadow-indigo-500/10">
        
        {/* Video Element */}
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          poster={effectivePosterUrl}
          autoPlay={video.autoplay ?? true}
          loop={video.loop ?? true}
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Overlay Layer */}
        {overlay.mode !== 'none' && (
          <div
            className={clsx(
              'absolute inset-0 z-[1] pointer-events-none transition-opacity',
              overlay.mode === 'gradient' &&
                (overlay.gradientDirection === 'to-t'
                  ? 'bg-gradient-to-t from-black/90 via-black/30 to-black/60'
                  : overlay.gradientDirection === 'to-r'
                  ? 'bg-gradient-to-r from-black/80 via-transparent to-black/80'
                  : 'bg-gradient-to-b from-black/70 via-black/20 to-black/90')
            )}
            style={{
              backgroundColor: overlay.mode === 'solid' ? overlay.solidColor || '#000000' : undefined,
              backgroundImage: overlay.mode === 'image' && overlay.imageUrl ? `url(${overlay.imageUrl})` : undefined,
              opacity: (overlay.opacity ?? 40) / 100,
            }}
          />
        )}

        {/* TOP LAYER: Authentic TikTok/Reels Badges & Controls */}
        <div className="relative z-10 flex items-center justify-between w-full pt-1">
          {/* Top Left: Video Tag & Sound Toggle */}
          <div className="flex items-center gap-2">
            {(video.showBadge ?? true) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-md border border-blue-400/30">
                <VideoIcon className="w-3.5 h-3.5" />
                <span>{video.badgeText || 'VIDEO'}</span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs backdrop-blur-md border border-white/20 transition cursor-pointer"
              title={isMuted ? 'בטל השתקה' : 'השתק'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          {/* Top Right: Timer & Episode Pill */}
          <div className="flex items-center gap-1.5">
            {video.durationText && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 text-slate-200 text-[10px] font-mono backdrop-blur-md border border-white/10">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{video.durationText}</span>
              </div>
            )}
            {video.seasonEpisodeText && (
              <div className="px-2 py-0.5 rounded-full bg-purple-600/80 text-white text-[10px] font-bold backdrop-blur-md border border-purple-400/30">
                {video.seasonEpisodeText}
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE LAYER: Central Hook Headline, Floating Card & Attached CTA Button */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-3.5 w-full text-center">
          {/* Main Headline */}
          {headline && (
            <h1 className={headlineClass} style={{ color: headlineColor }}>
              {headline}
            </h1>
          )}

          {/* Combined Card + Attached CTA Button Container */}
          <div className="w-full flex flex-col items-center">
            {/* Floating Card */}
            {(card?.enabled ?? true) && (
              <div
                className={clsx(
                  'w-full max-w-[92%] p-3.5 sm:p-4 rounded-2xl text-right backdrop-blur-xl transition-all shadow-xl',
                  card?.style === 'glass'
                    ? 'bg-white/85 dark:bg-slate-900/85 border border-white/40 dark:border-slate-700/60 text-slate-900 dark:text-white'
                    : card?.style === 'bordered'
                    ? 'bg-slate-950/80 border-2 border-indigo-500/50 text-white'
                    : 'bg-white text-slate-900 border border-slate-100 shadow-2xl'
                )}
              >
                {card?.imageUrl && (
                  <div className="flex items-center justify-center mb-2.5 overflow-hidden rounded-xl">
                    <img
                      src={card.imageUrl}
                      alt={card.title || 'תמונת כרטיס'}
                      className="max-h-28 sm:max-h-36 w-auto object-cover rounded-xl"
                    />
                  </div>
                )}
                {card?.tag && (
                  <div className="flex items-center justify-center mb-2">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60 text-center">
                      {card.tag}
                    </span>
                  </div>
                )}
                {card?.title && (
                  <h3 className="text-base sm:text-lg font-black text-center text-slate-900 leading-snug">
                    {card.title}
                  </h3>
                )}
                {card?.subtitle && (
                  <p className="text-[12px] sm:text-xs text-slate-600 text-center mt-1.5 leading-relaxed font-normal">
                    {card.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* CTA Button Elevated and Attached to Card with exactly 20px outer margin */}
            <div className="w-full px-[20px] -mt-3 z-20">
              <button
                type="button"
                onClick={handleCtaClick}
                style={{
                  backgroundColor: ctaButton.bgColor || '#0284c7',
                  color: ctaButton.textColor || '#ffffff',
                }}
                className={clsx(
                  'w-full rounded-2xl font-black tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
                  // Compact inner padding:
                  ctaButton.paddingY === 'spacious'
                    ? 'py-3.5 px-6 text-base sm:text-lg'
                    : ctaButton.paddingY === 'normal'
                    ? 'py-2.5 px-5 text-sm sm:text-base'
                    : 'py-2 px-4 text-xs sm:text-sm',
                  ctaButton.pulseEffect && 'animate-pulse hover:animate-none'
                )}
              >
                {/* Icon on Right Side (RTL Start) */}
                {ctaButton.showIcon && ctaButton.iconPosition === 'right' && (
                  ctaButton.customIconUrl ? (
                    <img src={ctaButton.customIconUrl} alt="icon" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 rounded" />
                  ) : (
                    <DynamicIcon name={ctaButton.iconName || 'Sparkles'} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  )
                )}

                <span className="leading-tight">{ctaButton.text || 'מצא עכשיו'}</span>

                {/* Icon on Left Side (RTL End) */}
                {ctaButton.showIcon && ctaButton.iconPosition !== 'right' && (
                  ctaButton.customIconUrl ? (
                    <img src={ctaButton.customIconUrl} alt="icon" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 rounded" />
                  ) : (
                    <DynamicIcon name={ctaButton.iconName || 'Sparkles'} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  )
                )}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM LAYER: Sound Equalizer */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-full pb-2">
          {/* Animated Equalizer Wave Bars */}
          {(video.showSoundWaveAnimation ?? true) && (
            <div className="flex items-center justify-center gap-1 w-full pt-1 opacity-70">
              <span className="w-1 h-3 bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-5 bg-white/90 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2.5 bg-white/70 rounded-full animate-bounce [animation-delay:-0.4s]" />
              <span className="w-1 h-4 bg-white/80 rounded-full animate-bounce" />
              <span className="w-1 h-3 bg-white/70 rounded-full animate-bounce [animation-delay:-0.2s]" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Popup Lead Form Modal (learned from ContactSection) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right animate-in zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{modalTitle}</h2>
              {modalSubtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{modalSubtitle}</p>}
            </div>

            {/* Form Rendering: If external KFS formId provided, use CapabilitySlot */}
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
              <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">הפנייה נשלחה בהצלחה!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{successMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setIsModalOpen(false);
                  }}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer"
                >
                  סגור חלון
                </button>
              </div>
            ) : showCheckout && checkoutData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <span>סליקה ותשלום מאובטח</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    ביטול
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
                  <div><strong>עבור:</strong> {modalTitle}</div>
                  <div><strong>משלם:</strong> {checkoutData.clientName}</div>
                  <div><strong>סכום לחיוב:</strong> <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">₪{checkoutData.amount}</span></div>
                </div>

                <CapabilitySlot
                  name="kesher-payment-slot"
                  props={{
                    amount: checkoutData.amount,
                    clientName: checkoutData.clientName,
                    phone: checkoutData.phone,
                    email: checkoutData.email,
                    description: modalTitle,
                    documentType: activeForm.payment_receipt_type || 320,
                    requireId: activeForm.payment_require_id,
                    onSuccess: handlePaymentSuccess,
                    onCancel: () => setShowCheckout(false),
                  }}
                  fallback={
                    <div className="p-6 bg-slate-800/40 rounded-2xl text-center space-y-2 border border-slate-700">
                      <CreditCard className="w-8 h-8 text-indigo-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">מסוף הסליקה מוכן לקליטת תשלום</h4>
                      <button
                        type="button"
                        onClick={() => handlePaymentSuccess({ transactionId: `demo_${Date.now()}`, amount: checkoutData.amount })}
                        className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                      >
                        אישור תשלום (סימולציה)
                      </button>
                    </div>
                  }
                />
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Step indicator if multi-step */}
                {totalSteps > 1 && (
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span>שלב {currentStep} מתוך {totalSteps}</span>
                    <span>{stepsList.indexOf(currentStep) + 1}/{totalSteps}</span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleFields
                    .filter((f) => (f.step || 1) === currentStep)
                    .map((field) => (
                      <div
                        key={field.label}
                        className={clsx(
                          field.widthPercentage === 100 || field.type === 'textarea' ? 'sm:col-span-2' : 'sm:col-span-1'
                        )}
                      >
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={formData[field.label] || ''}
                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                            rows={3}
                            placeholder={field.placeholder}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
                            value={formData[field.label] || ''}
                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                            placeholder={field.placeholder}
                            dir={field.type === 'tel' || field.type === 'email' ? 'ltr' : 'rtl'}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {errors[field.label] && (
                          <span className="text-[11px] text-rose-500 font-medium block mt-1">{errors[field.label]}</span>
                        )}
                      </div>
                    ))}
                </div>

                {/* Submit / Step Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      חזור
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
                      className="mr-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                    >
                      המשך לשלב הבא
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mr-auto flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>שולח פנייה...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{activeForm.submit_button_text || 'שליחת פנייה'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
