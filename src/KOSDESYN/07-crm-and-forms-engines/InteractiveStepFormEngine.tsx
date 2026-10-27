import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors } from './types';
import { KOSUN_STYLE_PRESETS, StylePresetDefinition, resolveDiscoveryLayoutMode } from '../../../factory/areaCollectionManager';

interface InteractiveStepFormEngineProps {
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  stylePresetId?: string;
  layoutBudget?: string;
  onCompleteForm?: (payload: Record<string, any>) => void;
  onBackHome: () => void;
}

const STEP_DEFINITIONS = [
  {
    stepIndex: 0,
    badge: 'שלב 01 • מטרת הפנייה',
    question: 'באיזה מסלול או שירות תרצה להתמקד היום?',
    options: [
      { id: 'vip_consult', label: 'פגישת אבחון והתאמה אישית VIP', icon: 'Sparkles', tag: 'הכי מבוקש' },
      { id: 'fast_quote', label: 'קבלת הצעת מחיר ומסלול מותאם', icon: 'Zap', tag: 'מענה תוך דקה' },
      { id: 'live_demo', label: 'תיאום הדגמה חיה / נסיעת מבחן', icon: 'Calendar', tag: 'ללא התחייבות' },
      { id: 'support_upgrade', label: 'שדרוג מנוי או תמיכה ללקוח קיים', icon: 'ShieldCheck', tag: 'עדיפות גבוהה' }
    ]
  },
  {
    stepIndex: 1,
    badge: 'שלב 02 • תזמון מועדף',
    question: 'מתי הכי נוח לך שנחזור אליך או נתאם?',
    options: [
      { id: 'now', label: 'עכשיו / בשעה הקרובה (מענה מיידי)', icon: 'Clock', tag: 'זמין כעת' },
      { id: 'morning', label: 'מחר בשעות הבוקר (09:00 - 12:00)', icon: 'Sun', tag: 'בוקר' },
      { id: 'afternoon', label: 'שעות אחר הצהריים (13:00 - 17:00)', icon: 'Coffee', tag: 'צהריים' },
      { id: 'whatsapp', label: 'שלחו לי סיכום מסודר ב-WhatsApp', icon: 'MessageCircle', tag: 'אוטומטי' }
    ]
  },
  {
    stepIndex: 2,
    badge: 'שלב 03 • אישור ושליחה מהירה',
    question: 'הזן שם וטלפון לשריון מיידי מול הסוכן:',
    options: []
  }
];

export const InteractiveStepFormEngine: React.FC<InteractiveStepFormEngineProps> = ({
  tenantProfile,
  tenantTheme,
  stylePresetId,
  layoutBudget,
  onCompleteForm,
  onBackHome
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const isDay = tenantTheme.colorMode === 'day';
  const activePresetKey = stylePresetId || tenantTheme.stylePresetId || 'cyber_neon';
  const styleContract: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleContract.day : styleContract.night;
  const brandPrimary = tenantTheme.primary || modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleContract.geometry.cardRadius;
  const discoveryMode = resolveDiscoveryLayoutMode(layoutBudget, styleContract.discovery.mode);

  const activeStepData = STEP_DEFINITIONS[currentStep];

  const handleOptionSelect = (optionLabel: string) => {
    if (currentStep === 0) {
      setSelectedTopic(optionLabel);
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setSelectedTime(optionLabel);
      setCurrentStep(2);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onCompleteForm) {
      onCompleteForm({
        topic: selectedTopic,
        time: selectedTime,
        fullName,
        phone,
        tenantId: tenantProfile?.id || 'kosun'
      });
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-2.5 border relative overflow-hidden animate-fadeIn ${styleContract.fontFamily}`}
      style={{
        borderRadius: cardRadius,
        background: modeColors.cardBg,
        borderColor: modeColors.borderColor,
        boxShadow: `0 10px 30px -10px ${modeColors.glowColor}`
      }}
    >
      {/* שורת התקדמות עליונה (Progress Stepper) */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-black text-black"
            style={{ backgroundColor: brandPrimary }}
          >
            {isSubmitted ? '✓ הושלם בהצלחה' : activeStepData.badge}
          </span>
          <span className="text-[10px] font-bold" style={{ color: modeColors.secondaryText }}>
            • {styleContract.shortLabel}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[0, 1, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => !isSubmitted && setCurrentStep(s)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: currentStep === s ? '22px' : '8px',
                backgroundColor: currentStep >= s ? brandPrimary : `${brandPrimary}30`
              }}
            />
          ))}
        </div>
      </div>

      {/* גוף הטופס החכם ב-60% ללא גלילה */}
      {isSubmitted ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-3 animate-fadeIn">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${brandPrimary}25`, color: brandPrimary, border: `2px solid ${brandPrimary}` }}
          >
            <Icons.CheckCircle2 size={26} />
          </div>
          <h3 className="text-sm font-black" style={{ color: modeColors.textColor }}>
            פנייתך נקלטה במערכת {tenantProfile?.name || 'KOSUN'}!
          </h3>
          <p className="text-xs max-w-xs leading-relaxed" style={{ color: modeColors.secondaryText }}>
            בחרת: <strong style={{ color: brandPrimary }}>{selectedTopic}</strong> ({selectedTime}). הסוכן האישי שלך יחזור אליך מיד.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(0);
            }}
            className="mt-1 px-4 py-1.5 rounded-xl text-black font-black text-xs shadow-md"
            style={{ backgroundColor: brandPrimary }}
          >
            פתיחת טופס חדש
          </button>
        </div>
      ) : currentStep < 2 ? (
        <div className="flex-1 flex flex-col justify-between py-1.5 overflow-hidden">
          <h2 className="text-xs sm:text-sm font-black text-right mb-1.5" style={{ color: modeColors.textColor }}>
            {activeStepData.question}
          </h2>

          {/* תצוגת האפשרויות משתנה דינמית לפי מנגנון הגילוי של הסגנון! */}
          <div
            className={
              discoveryMode === 'glass_flip_overlay' || discoveryMode === 'bento_asymmetric'
                ? 'flex-1 grid grid-cols-2 gap-2'
                : 'flex-1 flex flex-col justify-between gap-1.5'
            }
          >
            {activeStepData.options.map((opt, idx) => {
              const OptIcon = (Icons as any)[opt.icon] || Icons.Check;
              const isSpotlightFirst = discoveryMode === 'spotlight_stage' && idx === 0;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionSelect(opt.label)}
                  className={`p-2.5 border text-right transition-all cursor-pointer group flex items-center justify-between gap-2 hover:scale-[1.01] active:scale-95 ${
                    isSpotlightFirst ? 'flex-[1.6] shadow-lg' : 'flex-1'
                  }`}
                  style={{
                    borderRadius: cardRadius,
                    background: isDay ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                    borderColor: isSpotlightFirst ? brandPrimary : modeColors.borderColor
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isSpotlightFirst ? brandPrimary : `${brandPrimary}20`,
                        color: isSpotlightFirst ? '#000' : brandPrimary
                      }}
                    >
                      <OptIcon size={14} />
                    </div>
                    <span className="text-[11px] font-bold truncate" style={{ color: modeColors.textColor }}>
                      {opt.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[8px] font-black"
                      style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                    >
                      {opt.tag}
                    </span>
                    <Icons.ChevronLeft size={13} style={{ color: brandPrimary }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleFinalSubmit} className="flex-1 flex flex-col justify-between py-2 animate-fadeIn">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-right" style={{ color: modeColors.textColor }}>
              {activeStepData.question}
            </h2>
            <p className="text-[10px] mt-0.5" style={{ color: brandPrimary }}>
              בחירה: {selectedTopic} • {selectedTime}
            </p>
          </div>

          <div className="space-y-2 my-auto">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="שם מלא..."
              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
              style={{
                backgroundColor: isDay ? '#FFFFFF' : 'rgba(0,0,0,0.4)',
                borderColor: modeColors.borderColor,
                color: modeColors.textColor
              }}
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="מספר נייד לחזרה..."
              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
              style={{
                backgroundColor: isDay ? '#FFFFFF' : 'rgba(0,0,0,0.4)',
                borderColor: modeColors.borderColor,
                color: modeColors.textColor
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl text-black font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
            style={{ backgroundColor: brandPrimary }}
          >
            <Icons.Send size={13} />
            <span>אשר ושריין עכשיו ◀</span>
          </button>
        </form>
      )}

      {/* פוטר ניווט תחתון בתוך הארכיטיפ */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/10 shrink-0">
        {currentStep > 0 && !isSubmitted ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="text-[10px] font-bold flex items-center gap-1"
            style={{ color: modeColors.secondaryText }}
          >
            <Icons.ArrowRight size={11} />
            <span>שלב קודם</span>
          </button>
        ) : (
          <span className="text-[9px] font-mono" style={{ color: modeColors.secondaryText }}>
            KSF Interactive Form Engine
          </span>
        )}

        <button
          type="button"
          onClick={onBackHome}
          className="text-[10px] font-black flex items-center gap-1"
          style={{ color: brandPrimary }}
        >
          <span>חזרה למסך הראשי</span>
          <Icons.Home size={11} />
        </button>
      </div>
    </div>
  );
};
