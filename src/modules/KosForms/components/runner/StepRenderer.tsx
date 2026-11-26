import React, { useCallback } from 'react';
import { FormStep, FormThemeSettings, SmartFormDefinition } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { transliterateHebrewToSlug, cleanEmailSpeech } from '../../utils/transliteration';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { resolveActivePaymentProvider } from '../../../../core/connection/paymentProviderResolver';
import { useTenantScope } from '../../../../core/tenant';
import { NedarimCheckout } from '../../../KosNedarim/components/NedarimCheckout';
import { TicketBookingStepView, CouponCodeStepView } from './TicketAndCouponStepViews';
import { resolveFinalPaymentAmount, resolvePaymentIsRecurring } from '../../services/ticketCouponService';
import { evaluateFormula, toNumericAnswer } from '../../utils/formulaEvaluator';
import { resolveKoswebFormStyle } from '../../config/koswebStylePresets';
import { Star, Check, Upload, FileCheck, Mic, MicOff, Volume2, Globe, Lock, CreditCard, CheckCircle2, Coins, Calculator } from 'lucide-react';

export interface StepRendererProps {
  step: FormStep;
  form?: SmartFormDefinition;
  value: any;
  onChange: (value: any) => void;
  onEnter?: () => void;
  theme?: FormThemeSettings;
  validationError?: string | null;
  allAnswers?: Record<string, any>;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  form,
  value,
  onChange,
  onEnter,
  theme,
  validationError,
  allAnswers,
}) => {
  const { apiKeys, purchasedModules } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const activePaymentProvider = resolveActivePaymentProvider(apiKeys, purchasedModules);
  const styleTokens = resolveKoswebFormStyle(theme?.stylePreset);

  const accentColor = theme?.accentColor || styleTokens.themeDefaults.accentColor || '#D97706';
  const isVoiceEnabled = theme?.enableVoiceInput !== false;

  const isSubdomain =
    step.mappingKey === 'requested_subdomain' ||
    step.id?.includes('subdomain') ||
    step.title?.toLowerCase().includes('סאב') ||
    step.title?.toLowerCase().includes('subdomain');

  const isEmail =
    step.fieldType === 'email' ||
    step.mappingKey === 'email' ||
    step.id?.includes('email') ||
    step.title?.includes('דוא"ל') ||
    step.title?.includes('אימייל');

  const handleSpeechResult = useCallback(
    (transcript: string) => {
      if (isSubdomain) {
        const slug = transliterateHebrewToSlug(transcript);
        onChange(slug);
      } else if (isEmail) {
        const email = cleanEmailSpeech(transcript);
        onChange(email);
      } else if (step.fieldType === 'number') {
        const numOnly = transcript.replace(/\D/g, '');
        onChange(numOnly || transcript);
      } else {
        onChange(transcript);
      }
    },
    [isSubdomain, isEmail, step.fieldType, onChange]
  );

  const { isListening, isSupported, toggleListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    lang: 'he-IL',
  });

  const renderFieldInput = () => {
    // 1. Dedicated Subdomain Input with Auto-Transliteration and Live URL Preview
    if (isSubdomain) {
      const cleanSub = transliterateHebrewToSlug(value || '');
      return (
        <div className="w-full max-w-xl space-y-3">
          <div className="relative flex items-center rounded-2xl border-2 transition-all overflow-hidden bg-slate-900/90 border-slate-800 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 shadow-lg">
            {/* Globe Icon */}
            <div className="p-3.5 text-amber-400 border-l border-slate-800 bg-slate-950/60">
              <Globe className="w-5 h-5" />
            </div>

            {/* Subdomain Input */}
            <input
              type="text"
              autoFocus
              value={value || ''}
              onChange={(e) => {
                const transliterated = transliterateHebrewToSlug(e.target.value);
                onChange(transliterated);
              }}
              placeholder={step.placeholder || 'your-business'}
              className="flex-1 bg-transparent px-4 py-4 text-lg md:text-xl font-bold font-mono text-white placeholder:text-slate-500 focus:outline-none text-left"
              dir="ltr"
            />

            {/* Locked Domain Suffix Badge */}
            <div className="bg-amber-500/10 text-amber-400 border-r border-slate-800 font-mono font-black text-sm px-4 py-4 select-none flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 opacity-70" />
              <span>.kosun.pro</span>
            </div>

            {/* Microphone Button */}
            {isSupported && isVoiceEnabled && (
              <div className="pr-3 pl-1 flex items-center">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40 scale-110'
                      : 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700'
                  }`}
                  title={
                    isListening
                      ? 'הקלטה פעילה - לחץ לעצירה'
                      : 'הקרא בעברית או באנגלית והמערכת תתרגם לסאב-דומיין תקין באנגלית'
                  }
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Live URL Preview Badge */}
          <div className="flex items-center justify-between text-xs px-2 text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span>כתובת המערכת:</span>
              <span className="font-mono font-bold text-amber-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                https://{cleanSub || 'your-brand'}.kosun.pro
              </span>
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              ✨ הקלדה או הקראה בעברית מתורגמת לאנגלית מיידית
            </span>
          </div>
        </div>
      );
    }

    // 2. Dedicated Email Input with LTR isolation and voice email recognition
    if (isEmail || step.fieldType === 'email') {
      return (
        <div className="relative w-full max-w-xl">
            <input
              type="email"
              dir="ltr"
              autoFocus
              value={value || ''}
              onChange={(e) => {
                const cleaned = cleanEmailSpeech(e.target.value);
                onChange(cleaned || e.target.value);
              }}
              placeholder={step.placeholder || 'name@business.co.il'}
              className={`w-full px-5 py-4 ${
                isSupported && isVoiceEnabled ? 'pl-14' : ''
              } font-mono text-left text-lg md:text-xl transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm ${
                isListening
                  ? 'border-2 border-red-500 ring-4 ring-red-500/20 rounded-2xl bg-slate-900/90 text-white'
                  : styleTokens.inputClass
              }`}
            />

          {/* Microphone Voice Button */}
          {isSupported && isVoiceEnabled && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40 scale-110'
                    : 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700'
                }`}
                title={
                  isListening
                    ? 'הקלטה פעילה - לחץ לעצירה'
                    : 'הקרא כתובת אימייל (לדוגמה: "ישראל שטרודל ג\'ימייל נקודה קום")'
                }
              >
                <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          )}
        </div>
      );
    }

    switch (step.fieldType) {
      case 'text':
      case 'phone':
      case 'number':
        return (
          <div className="relative w-full max-w-xl">
            <input
              type={
                step.fieldType === 'number'
                  ? 'number'
                  : step.fieldType === 'phone'
                  ? 'tel'
                  : 'text'
              }
              dir={
                step.fieldType === 'phone' ||
                step.fieldType === 'number'
                  ? 'ltr'
                  : 'rtl'
              }
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={step.placeholder || (step.fieldType === 'phone' ? '050-1234567' : 'הקלד כאן...')}
              className={`w-full px-5 py-4 ${
                isSupported && isVoiceEnabled ? 'pl-14' : ''
              } ${
                step.fieldType === 'phone' || step.fieldType === 'number'
                  ? 'font-mono text-left'
                  : ''
              } text-lg md:text-xl transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm ${
                isListening
                  ? 'border-2 border-red-500 ring-4 ring-red-500/20 rounded-2xl bg-slate-900/90 text-white'
                  : styleTokens.inputClass
              }`}
            />

            {/* Microphone Voice Button (End of text field in RTL) */}
            {isSupported && isVoiceEnabled && (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40 scale-110'
                      : 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700'
                  }`}
                  title={isListening ? 'הקלטה פעילה - לחץ לעצירה' : 'לחץ להקראה קולית במקום הקלדה'}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
                </button>
              </div>
            )}
          </div>
        );

      case 'price': {
        let derivedVal: number | undefined;
        if (step.priceSource === 'field' && step.priceSourceFieldKey) {
          const srcStep = form?.steps?.find(
            (s) => (s.mappingKey || s.id) === step.priceSourceFieldKey || s.id === step.priceSourceFieldKey
          );
          if (srcStep?.fieldType === 'calculated') {
            derivedVal = Math.max(0, evaluateFormula(srcStep.calcFormula, allAnswers || {}, form?.steps || []));
          } else {
            const rawSrc = allAnswers?.[step.priceSourceFieldKey] ?? (srcStep ? allAnswers?.[srcStep.id] : undefined);
            if (rawSrc !== undefined && rawSrc !== null && rawSrc !== '') {
              derivedVal = Math.max(0, toNumericAnswer(rawSrc, srcStep));
            }
          }
        }
        const fallbackVal = derivedVal ?? (step.defaultValue ?? 0);
        const isEditable = step.priceEditable !== false;
        const displayVal = isEditable
          ? (value !== undefined && value !== '' ? value : fallbackVal)
          : fallbackVal;
        return (
          <div className="w-full max-w-xl">
            {isEditable ? (
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={0}
                  dir="ltr"
                  autoFocus
                  value={displayVal}
                  onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={step.placeholder || '0'}
                  className={`w-full px-5 py-4 pl-12 font-mono text-left text-xl font-bold transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm ${styleTokens.inputClass}`}
                />
                <span className="absolute left-4 text-lg font-black text-amber-500 select-none">₪</span>
              </div>
            ) : (
              <div className="p-5 bg-white/80 dark:bg-slate-900/80 border-2 border-amber-500/30 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-bold text-sm">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span>מחיר לתשלום:</span>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₪{displayVal}
                </span>
              </div>
            )}
          </div>
        );
      }

      case 'calculated': {
        const computed = evaluateFormula(step.calcFormula, allAnswers || {}, form?.steps || []);
        return (
          <div className="w-full max-w-xl">
            <div className="p-5 bg-white/80 dark:bg-slate-900/80 border-2 border-indigo-500/30 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-bold text-sm">
                <Calculator className="w-5 h-5 text-indigo-500" />
                <span>{step.isPriceField ? 'סכום מחושב לתשלום:' : 'תוצאת החישוב:'}</span>
              </div>
              <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {step.isPriceField ? `₪${computed}` : computed}
              </span>
            </div>
          </div>
        );
      }

      case 'textarea':
        return (
          <div className="relative w-full max-w-xl">
            <textarea
              autoFocus
              rows={4}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={step.placeholder || 'הקלד את תשובתך בהרחבה כאן...'}
              className={`w-full px-5 py-4 ${
                isSupported && isVoiceEnabled ? 'pl-14' : ''
              } text-base md:text-lg transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm resize-y ${
                isListening
                  ? 'border-2 border-red-500 ring-4 ring-red-500/20 rounded-2xl bg-slate-900/90 text-white'
                  : styleTokens.inputClass
              }`}
            />

            {/* Microphone Voice Button for Textarea */}
            {isSupported && isVoiceEnabled && (
              <div className="absolute left-3.5 bottom-4">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40 scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700'
                  }`}
                  title={isListening ? 'הקלטה פעילה - לחץ לעצירה' : 'לחץ להקראה קולית במקום הקלדה'}
                >
                  {isListening ? (
                    <Mic className="w-5 h-5 animate-bounce" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        );

      case 'single_choice': {
        const options = step.options || [];
        return (
          /* חוק קושאן: תיבות בחירה מסוגננות מופיעות תמיד שורה מתחת לשורה */
          <div className="w-full max-w-xl flex flex-col space-y-2.5">
            {options.map((opt, idx) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.id || opt.value || idx}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={`group relative p-4 text-right flex items-start gap-3.5 cursor-pointer ${styleTokens.optionCardBaseClass} ${
                    isSelected
                      ? styleTokens.optionCardSelectedClass
                      : styleTokens.optionCardUnselectedClass
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 transition-colors ${
                      isSelected
                        ? styleTokens.optionIconSelectedClass
                        : styleTokens.optionIconUnselectedClass
                    }`}
                  >
                    <LuxuryIconRenderer
                      iconName={opt.iconName || 'Sparkles'}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base leading-tight ${isSelected ? 'font-black' : ''}`}>
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div className="text-xs opacity-75 mt-1 leading-relaxed">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 self-center"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      }

      case 'multi_choice': {
        const options = step.options || [];
        const currentVals: string[] = Array.isArray(value) ? value : [];
        const toggleOption = (optVal: string) => {
          if (currentVals.includes(optVal)) {
            onChange(currentVals.filter((v) => v !== optVal));
          } else {
            onChange([...currentVals, optVal]);
          }
        };

        return (
          /* חוק קושאן: תיבות בחירה מסוגננות מופיעות תמיד שורה מתחת לשורה */
          <div className="w-full max-w-xl flex flex-col space-y-2.5">
            {options.map((opt, idx) => {
              const isSelected = currentVals.includes(opt.value);
              return (
                <button
                  key={opt.id || opt.value || idx}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  className={`group relative p-4 text-right flex items-start gap-3.5 cursor-pointer ${styleTokens.optionCardBaseClass} ${
                    isSelected
                      ? styleTokens.optionCardSelectedClass
                      : styleTokens.optionCardUnselectedClass
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 transition-colors ${
                      isSelected
                        ? styleTokens.optionIconSelectedClass
                        : styleTokens.optionIconUnselectedClass
                    }`}
                  >
                    <LuxuryIconRenderer
                      iconName={opt.iconName || 'CheckSquare'}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-base ${isSelected ? 'font-bold' : ''}`}>
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div className="text-xs opacity-75 mt-0.5 leading-relaxed">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 self-center transition-colors ${
                      isSelected
                        ? 'text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                    style={isSelected ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        );
      }

      case 'rating': {
        const max = step.maxRating || 5;
        const currentRating = Number(value || 0);

        return (
          <div className="flex items-center gap-3 py-4">
            {Array.from({ length: max }, (_, i) => i + 1).map((starNum) => {
              const isFilled = starNum <= currentRating;
              return (
                <button
                  key={starNum}
                  type="button"
                  onClick={() => onChange(starNum)}
                  className="p-2 transition-transform duration-150 hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-500 drop-shadow-md'
                        : 'fill-none text-slate-300 dark:text-slate-700 hover:text-amber-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        );
      }

      case 'scale': {
        const min = step.minScale || 1;
        const max = step.maxScale || 10;
        const count = max - min + 1;
        const currentScale = Number(value);

        return (
          <div className="w-full max-w-2xl space-y-3">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: count }, (_, i) => min + i).map((num) => {
                const isSelected = currentScale === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChange(num)}
                    className={`h-12 font-bold text-base transition-all cursor-pointer ${styleTokens.optionCardBaseClass} ${
                      isSelected
                        ? `${styleTokens.optionCardSelectedClass} scale-105`
                        : styleTokens.optionCardUnselectedClass
                    }`}
                    style={isSelected ? { borderColor: accentColor } : undefined}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span>{step.minScaleLabel || 'נמוך'}</span>
              <span>{step.maxScaleLabel || 'גבוה מאוד'}</span>
            </div>
          </div>
        );
      }

      case 'date':
        return (
          <div className="w-full max-w-md">
            <input
              type="date"
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-5 py-4 text-lg transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm ${styleTokens.inputClass}`}
            />
          </div>
        );

      case 'time':
        return (
          <div className="w-full max-w-md">
            <input
              type="time"
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-5 py-4 text-lg transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm ${styleTokens.inputClass}`}
            />
          </div>
        );

      case 'file_upload':
        return (
          <div className="w-full max-w-xl">
            <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed cursor-pointer transition-all ${styleTokens.optionCardUnselectedClass}`}>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file.name);
                  }
                }}
              />
              {value ? (
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-8 h-8" />
                  <span className="font-semibold">{value}</span>
                </div>
              ) : (
                <div className={`flex flex-col items-center gap-2 ${styleTokens.helperTextClass}`}>
                  <Upload className={`w-8 h-8 ${styleTokens.iconColorClass}`} />
                  <span className="text-sm font-medium">
                    לחץ לבחירת קובץ או גרור לכאן
                  </span>
                  <span className="text-xs opacity-75">
                    PDF, תמונה או מסמך (עד 10MB)
                  </span>
                </div>
              )}
            </label>
          </div>
        );

      case 'ticket_booking':
        return (
          <TicketBookingStepView
            step={step}
            value={value}
            onChange={onChange}
          />
        );

      case 'coupon_code':
        return (
          <CouponCodeStepView
            step={step}
            form={form}
            value={value}
            onChange={onChange}
            allAnswers={allAnswers}
          />
        );

      case 'payment': {
        const {
          subtotal,
          discountAmount,
          finalAmount: resolvedAmount,
          isFreeByCoupon,
          appliedCoupon,
          ticketBooking,
        } = resolveFinalPaymentAmount(
          allAnswers,
          Number(step.defaultValue) || 100,
          step,
          form?.steps
        );
        const resolvedClientName =
          allAnswers?.conta_name ||
          allAnswers?.name ||
          allAnswers?.fullName ||
          allAnswers?.kosun_crm_name ||
          '';
        const resolvedPhone =
          allAnswers?.conta_phone ||
          allAnswers?.phone ||
          allAnswers?.kosun_crm_phone ||
          '';
        const resolvedEmail =
          allAnswers?.email ||
          allAnswers?.kosun_crm_email ||
          '';
        const isRecurring = resolvePaymentIsRecurring(allAnswers, step, form?.steps);
        const recurringInstallments = step.paymentRecurringInstallments ?? 0;
        const documentType = step.paymentDocumentType || 320;
        const requireId = Boolean(step.paymentRequireId);
        const dedication =
          allAnswers?.dedication_note ||
          allAnswers?.dedication ||
          '';

        return (
          <div className="w-full max-w-xl space-y-4">
            {/* Dynamic Summary Pill */}
            <div className="p-4 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-right space-y-2 text-xs text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {ticketBooking
                    ? `הזמנת כרטיסים (${ticketBooking.totalQuantity})`
                    : isRecurring
                    ? recurringInstallments > 0
                      ? `הוראת קבע חודשית (${recurringInstallments} חודשים)`
                      : 'הוראת קבע חודשית (מתחדשת)'
                    : 'תשלום חד-פעמי'}
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ₪{resolvedAmount} {isRecurring ? '/ חודש' : ''}
                </span>
              </div>
              {ticketBooking && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>פירוט:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{ticketBooking.summaryText}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span>קופון {appliedCoupon.code} (מתוך ₪{subtotal}):</span>
                  <span className="font-mono font-bold">-₪{discountAmount}</span>
                </div>
              )}
              {resolvedClientName && (
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>עבור:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{resolvedClientName}</span>
                </div>
              )}
              {dedication && (
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>הקדשה:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 italic">{dedication}</span>
                </div>
              )}
            </div>

            {isFreeByCoupon || resolvedAmount === 0 ? (
              <div className="p-6 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl text-center space-y-3 shadow-md">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-black text-white text-base">
                  הזמנה ללא עלות (100% הנחה באמצעות קופון)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  אין צורך בתשלום באשראי. לחץ על אישור ההזמנה או על כפתור השליחה להשלמת הרישום והפקת הכרטיסים.
                </p>
                <button
                  type="button"
                  onClick={() => onChange(`free_coupon_${appliedCoupon?.code || '100'}`)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                >
                  {value ? 'אושר (100% הנחה)' : 'אשר הזמנה ללא עלות'}
                </button>
              </div>
            ) : activePaymentProvider === 'nedarim' ? (
              <NedarimCheckout
                amount={resolvedAmount}
                clientName={resolvedClientName || 'לקוח'}
                phone={resolvedPhone}
                mail={resolvedEmail}
                receiptType={String(documentType)}
                isRecurring={isRecurring}
                installments={isRecurring ? recurringInstallments : undefined}
                tenantId={tenantId}
                onSuccess={() => onChange(`nedarim_${Date.now()}`)}
              />
            ) : (
              <CapabilitySlot
                name="kesher-payment-slot"
                props={{
                  amount: resolvedAmount,
                  clientName: resolvedClientName,
                  phone: resolvedPhone,
                  email: resolvedEmail,
                  description: step.title || 'תשלום שאלון KSF',
                  documentType,
                  requireId,
                  isRecurring,
                  installments: isRecurring ? (recurringInstallments > 0 ? recurringInstallments : 9999) : undefined,
                  onSuccess: (res: any) => onChange(res.transactionId || 'approved'),
                }}
                fallback={
                  <div className="p-6 bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-2xl text-center space-y-3 shadow-md">
                    <CreditCard className="w-8 h-8 text-indigo-500 mx-auto" />
                    <h4 className="font-black text-slate-900 dark:text-white text-base">
                      סליקה מאובטחת באמצעות מסוף קשר
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      סליקת אשראי, ביט והעברה בנקאית מאובטחת. המסמך יישלח אוטומטית בסיום.
                    </p>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-700 dark:text-indigo-300 text-sm font-black flex items-center justify-center gap-2">
                      <span>סכום לתשלום:</span>
                      <span className="text-base font-mono">₪{resolvedAmount}</span>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        );
      }

      default:
        return (
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              autoFocus
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={step.placeholder || 'הקלד כאן...'}
              className={`w-full px-5 py-4 text-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${styleTokens.inputClass}`}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-center space-y-6 animate-fadeIn">
      {/* Step Icon & Title Header */}
      <div className="flex flex-col items-center space-y-3 max-w-2xl px-4">
        <LuxuryIconRenderer
          iconName={step.iconName}
          withContainer
          containerClassName={styleTokens.iconContainerClass}
          className={`w-8 h-8 ${styleTokens.iconColorClass}`}
        />
        <h2 className={`text-2xl sm:text-3xl md:text-4xl drop-shadow-sm ${styleTokens.titleClass}`}>
          {step.title}
          {step.required && (
            <span className="mr-1.5 text-xl" style={{ color: accentColor }} title="שדה חובה">*</span>
          )}
        </h2>
        {step.subtitle && (
          <p className={`text-sm sm:text-base max-w-lg ${styleTokens.subtitleClass}`}>
            {step.subtitle}
          </p>
        )}
      </div>

      {/* Field Input */}
      <div className="w-full flex justify-center px-4">
        {renderFieldInput()}
      </div>

      {/* Voice Recording Listening Status Banner */}
      {isListening && (
        <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl animate-pulse">
          <Mic className="w-4 h-4 animate-bounce" />
          <span>מקליט ומפענח את קולך כעת... דבר ברור</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-4 py-2 rounded-xl animate-shake">
          {validationError}
        </div>
      )}

      {/* Helper text */}
      {step.helperText && !validationError && !isListening && (
        <p className="text-xs text-slate-400 max-w-md">
          {step.helperText}
        </p>
      )}
    </div>
  );
};
