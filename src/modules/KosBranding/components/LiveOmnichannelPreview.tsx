import React, { useState } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import {
  Globe,
  FileSpreadsheet,
  CreditCard,
  Lock,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Phone,
  ShieldCheck,
  Eye,
} from 'lucide-react';

type PreviewMode = 'landing' | 'form' | 'checkout';

export const LiveOmnichannelPreview: React.FC = () => {
  const { brandDna } = useBrandDna();
  const [activeTab, setActiveTab] = useState<PreviewMode>('landing');

  const { identity, voice, audience, designTokens, trust } = brandDna;

  // Radius helper
  const radiusClass =
    designTokens.borderRadius === 'none'
      ? 'rounded-none'
      : designTokens.borderRadius === 'sm'
      ? 'rounded-sm'
      : designTokens.borderRadius === 'lg'
      ? 'rounded-2xl'
      : designTokens.borderRadius === 'full'
      ? 'rounded-full'
      : 'rounded-xl';

  // Button style helper
  const getButtonClass = () => {
    switch (designTokens.buttonStyle) {
      case 'gradient':
        return 'bg-gradient-to-r shadow-lg hover:brightness-110';
      case 'outline':
        return 'border-2 bg-transparent hover:bg-white/10';
      case 'glass':
        return 'backdrop-blur-md bg-opacity-70 border border-white/20 shadow-md';
      case 'solid':
      default:
        return 'shadow-md hover:brightness-110';
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white">הדמיה חיה ב-360° (Omnichannel Preview)</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'landing'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            עמוד נחיתה
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'form'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            טופס חכם
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checkout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'checkout'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            דף סליקה ותשלום
          </button>
        </div>
      </div>

      {/* Canvas Mockup Container */}
      <div
        className="w-full rounded-2xl border border-slate-700/80 overflow-hidden shadow-inner p-4 sm:p-6 transition-all min-h-[320px] flex flex-col justify-between"
        style={{
          backgroundColor: designTokens.backgroundColor || '#0f172a',
          fontFamily: designTokens.fontFamily || 'Heebo, sans-serif',
          color: designTokens.textColor || '#f8fafc',
        }}
      >
        {/* ================= MODE 1: LANDING PAGE CARD ================= */}
        {activeTab === 'landing' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Nav Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                {identity.logoUrl ? (
                  <img src={identity.logoUrl} alt="Logo" className="h-7 object-contain" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: designTokens.primaryColor, color: designTokens.buttonTextColor }}
                  >
                    {identity.companyName.charAt(0) || 'M'}
                  </div>
                )}
                <span className="font-bold text-sm" style={{ color: designTokens.textColorH1 }}>
                  {identity.companyName}
                </span>
              </div>
              <span className="text-xs opacity-75 font-medium">{identity.slogan}</span>
            </div>

            {/* Hero Body */}
            <div className="py-4 space-y-2 text-center sm:text-right">
              <h2
                className="text-xl sm:text-2xl font-black leading-tight"
                style={{ color: designTokens.textColorH1 }}
              >
                {identity.shortVision || identity.companyName}
              </h2>
              <p className="text-xs sm:text-sm opacity-80 max-w-xl leading-relaxed">
                {audience.mainUvp || identity.companyVision}
              </p>
            </div>

            {/* CTA Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs opacity-75">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{voice.powerWords[0] || 'מקצועיות ואיכות ללא פשרות'}</span>
              </div>
              <button
                type="button"
                className={`px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ${radiusClass} ${getButtonClass()}`}
                style={{
                  backgroundColor: designTokens.buttonBgColor,
                  color: designTokens.buttonTextColor,
                  borderColor: designTokens.buttonBgColor,
                  backgroundImage:
                    designTokens.buttonStyle === 'gradient'
                      ? `linear-gradient(135deg, ${designTokens.primaryColor}, ${designTokens.secondaryColor})`
                      : undefined,
                }}
              >
                <span>הצטרף עכשיו</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE 2: SMART FORM CARD ================= */}
        {activeTab === 'form' && (
          <div className="space-y-4 animate-in fade-in max-w-lg mx-auto w-full">
            <div className="text-center space-y-1">
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block"
                style={{
                  backgroundColor: `${designTokens.primaryColor}25`,
                  color: designTokens.primaryColor,
                }}
              >
                טופס הרשמה וקבלת פרטים
              </span>
              <h3 className="text-base font-bold" style={{ color: designTokens.textColorH1 }}>
                {identity.companyName} - יצירת קשר מהירה
              </h3>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs mb-1 opacity-80">שם מלא</label>
                <input
                  disabled
                  placeholder="ישראל ישראלי"
                  className={`w-full bg-black/30 border border-white/10 px-3 py-2 text-xs text-white ${radiusClass}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-80">טלפון נייד</label>
                <input
                  disabled
                  placeholder="050-1234567"
                  className={`w-full bg-black/30 border border-white/10 px-3 py-2 text-xs text-white ${radiusClass}`}
                />
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 ${radiusClass} ${getButtonClass()}`}
              style={{
                backgroundColor: designTokens.buttonBgColor,
                color: designTokens.buttonTextColor,
                borderColor: designTokens.buttonBgColor,
                backgroundImage:
                  designTokens.buttonStyle === 'gradient'
                    ? `linear-gradient(135deg, ${designTokens.primaryColor}, ${designTokens.secondaryColor})`
                    : undefined,
              }}
            >
              <span>שלח פרטים</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= MODE 3: CHECKOUT PAGE ================= */}
        {activeTab === 'checkout' && (
          <div className="space-y-4 animate-in fade-in max-w-lg mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold" style={{ color: designTokens.textColorH1 }}>
                  דף תשלום מאובטח - {identity.companyName}
                </h4>
                <span className="text-[11px] opacity-75 font-mono">ח.פ / עוסק: {trust.legalEntityId || '516000000'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Order Summary Box */}
            <div className={`p-3.5 bg-black/30 border border-white/10 space-y-2 text-xs ${radiusClass}`}>
              <div className="flex justify-between font-semibold">
                <span>מנוי שירות שנתי / הצטרפות לקהילה</span>
                <span className="font-mono font-bold" style={{ color: designTokens.primaryColor }}>
                  ₪ 299.00
                </span>
              </div>
              <div className="flex justify-between text-[11px] opacity-75">
                <span>מע״מ (17%)</span>
                <span className="font-mono">כלול במחיר</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              className={`w-full py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${radiusClass} ${getButtonClass()}`}
              style={{
                backgroundColor: designTokens.buttonBgColor,
                color: designTokens.buttonTextColor,
                borderColor: designTokens.buttonBgColor,
                backgroundImage:
                  designTokens.buttonStyle === 'gradient'
                    ? `linear-gradient(135deg, ${designTokens.primaryColor}, ${designTokens.secondaryColor})`
                    : undefined,
              }}
            >
              <CreditCard className="w-4 h-4" />
              <span>בצע תשלום מאובטח (₪ 299)</span>
            </button>

            {/* Trust Footer */}
            <div className="text-center space-y-1 text-[11px] opacity-75 pt-2">
              <p className="flex items-center justify-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {trust.securityBadgeText || 'סליקה מאובטחת בתקן PCI-DSS'}
              </p>
              <p>{trust.refundPolicySummary || 'החזר כספי מלא מובטח תוך 14 יום'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
