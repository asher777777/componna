import React, { useState } from 'react';
import { PricingSectionConfig, PricingPackageItem } from '../../types/sectionConfigs';
import { Check, Sparkles, ArrowLeft, ShieldCheck, CreditCard, FileText, X } from 'lucide-react';
import { clsx } from 'clsx';
import { KesherCheckoutModal } from '../../components/KesherCheckoutModal';
import { SmartFormRunner, SMART_FORM_TEMPLATES } from '../../../smart-form-builder';

export const PricingSection: React.FC<{ config: PricingSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'תוכניות ומחירים שקופים ומותאמים',
    subtitle = 'בחרו את החבילה המתאימה ביותר עבורכם',
    description,
    showBillingToggle = true,
    yearlyDiscountBadge = 'חיסכון של 20% 🎉',
    backgroundColor = 'transparent',
    packages = [],
  } = config;

  const [isYearly, setIsYearly] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PricingPackageItem | null>(null);

  const handleSelectPackage = (pkg: PricingPackageItem) => {
    // If buttonUrl is an external link (http/https) and action is external_url, navigate
    if (pkg.actionType === 'external_url' && pkg.buttonUrl && (pkg.buttonUrl.startsWith('http://') || pkg.buttonUrl.startsWith('https://'))) {
      window.open(pkg.buttonUrl, '_blank');
      return;
    }
    setSelectedPackage(pkg);
  };

  const activeFormTemplate = selectedPackage?.actionType === 'smart_form'
    ? SMART_FORM_TEMPLATES.find((t) => t.id === selectedPackage?.formTemplateId) || SMART_FORM_TEMPLATES[0]
    : null;

  return (
    <section
      id={anchorId || 'pricing'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {description}
            </p>
          )}

          {/* Monthly / Yearly Switch */}
          {showBillingToggle && (
            <div className="flex items-center gap-3 mt-4 p-1.5 rounded-full bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={clsx(
                  'px-5 py-2 rounded-full text-xs font-bold transition-all',
                  !isYearly ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                )}
              >
                תשלום חודשי
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={clsx(
                  'px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
                  isYearly ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                )}
              >
                <span>תשלום שנתי</span>
                {yearlyDiscountBadge && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                    {yearlyDiscountBadge}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const activePrice = isYearly && pkg.priceYearly ? pkg.priceYearly : pkg.priceMonthly || '₪99';
            const isSmartForm = pkg.actionType === 'smart_form';

            return (
              <div
                key={pkg.id}
                className={clsx(
                  'relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl',
                  pkg.isFeatured
                    ? 'bg-slate-900 border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.25)] md:-translate-y-4 z-10'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                )}
              >
                {pkg.badge && (
                  <div className="absolute -top-3.5 right-8 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-black shadow-lg">
                    {pkg.badge}
                  </div>
                )}

                <div className="flex flex-col gap-6 text-right">
                  <div>
                    <h3 className="text-2xl font-black text-white">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{pkg.description}</p>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">{activePrice}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {isYearly ? '/ חודש (בחיוב שנתי)' : pkg.period || '/ חודש'}
                    </span>
                  </div>

                  <div className="h-px bg-slate-800" />

                  <div className="flex flex-col gap-3">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className={clsx(
                      'w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer',
                      pkg.isFeatured
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white shadow-xl shadow-indigo-600/40 hover:scale-105'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    )}
                  >
                    {isSmartForm ? <FileText className="w-4 h-4 text-indigo-300" /> : <CreditCard className="w-4 h-4" />}
                    <span>{pkg.buttonText || (isSmartForm ? 'מילוי שאלון התאמה' : 'התחילו עכשיו')}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>סליקה מאובטחת ע"י קשר • טפסים חכמים ומעוצבים • סנכרון CRM מיידי וניהול לידים</span>
        </div>
      </div>

      {/* 1. Kesher Direct Checkout Modal */}
      {selectedPackage && selectedPackage.actionType !== 'smart_form' && (
        <KesherCheckoutModal
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          pkg={selectedPackage}
          isYearly={isYearly}
          pageTitle={title}
          onPaymentSuccess={(info) => {
            console.log('[PricingSection] Payment completed:', info);
          }}
        />
      )}

      {/* 2. Smart Form Runner Modal (Cleanly imported from smart-form-builder) */}
      {selectedPackage && selectedPackage.actionType === 'smart_form' && activeFormTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" dir="rtl">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setSelectedPackage(null)}
              className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900 border border-slate-800 z-20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <SmartFormRunner
              form={activeFormTemplate}
              formId={selectedPackage.formId}
              onComplete={(answers, submissionId) => {
                console.log('[PricingSection] Smart Form Submitted:', submissionId, answers);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

