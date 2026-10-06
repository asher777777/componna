import React, { useState } from 'react';
import { PricingSectionConfig, PricingPackageItem } from '../../types/sectionConfigs';
import { Check, Sparkles, ArrowLeft, ShieldCheck, CreditCard, FileText, X } from 'lucide-react';
import { clsx } from 'clsx';
import { KesherCheckoutModal } from '../../components/KesherCheckoutModal';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { eventBus } from '../../../../core/bridge/EventBus';

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

  const { getCapability } = useHostCapabilities();
  const formBuilder = getCapability<any>('form-builder');

  const [isYearly, setIsYearly] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PricingPackageItem | null>(null);

  // Form registration state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleSelectPackage = (pkg: PricingPackageItem) => {
    if (pkg.actionType === 'external_url' && pkg.buttonUrl && (pkg.buttonUrl.startsWith('http://') || pkg.buttonUrl.startsWith('https://'))) {
      window.open(pkg.buttonUrl, '_blank');
      return;
    }
    setSelectedPackage(pkg);
    setIsFormSubmitted(false);
  };

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}

          {/* Billing Cycle Toggle */}
          {showBillingToggle && (
            <div className="mt-4 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={clsx(
                  'px-5 py-2 rounded-xl text-xs font-bold transition-all',
                  !isYearly
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                חיוב חודשי
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={clsx(
                  'px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                  isYearly
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <span>חיוב שנתי</span>
                {yearlyDiscountBadge && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                    {yearlyDiscountBadge}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const displayPrice = isYearly && pkg.priceYearly ? pkg.priceYearly : pkg.priceMonthly || '₪0';
            const billingPeriod = isYearly ? '/שנה' : '/חודש';

            return (
              <div
                key={pkg.id}
                className={clsx(
                  'relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300',
                  pkg.isFeatured
                    ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900/90 to-slate-900/90 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-500/10 scale-105 z-10'
                    : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-700'
                )}
              >
                {pkg.isFeatured && pkg.badge && (
                  <div className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/30">
                    {pkg.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{pkg.name}</h3>
                    {pkg.actionType === 'smart_form' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>טופס</span>
                      </span>
                    )}
                  </div>

                  {pkg.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      {pkg.description}
                    </p>
                  )}

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{billingPeriod}</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3.5 mb-8">
                    {pkg.features?.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className={clsx(
                      'w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg',
                      pkg.isFeatured
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-indigo-600/30 hover:scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    )}
                  >
                    <span>{pkg.buttonText || 'בחר מסלול זה'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>סליקה מאובטחת ע"פ תקן PCI</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>קבלה / חשבונית מס דיגיטלית מיידית</span>
          </div>
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

      {/* 2. Form Runner Modal (Decoupled with Host Capabilities / Graceful Fallback) */}
      {selectedPackage && selectedPackage.actionType === 'smart_form' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" dir="rtl">
          <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <button
              type="button"
              onClick={() => {
                setSelectedPackage(null);
                setIsFormSubmitted(false);
              }}
              className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900 border border-slate-800 z-20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {formBuilder?.renderFormRunner ? (
              formBuilder.renderFormRunner({
                formId: selectedPackage.formId,
                onComplete: (answers: Record<string, any>, submissionId: string) => {
                  eventBus.publish('smart_form:submitted', {
                    formId: selectedPackage.formId || 'pricing-lead',
                    formTitle: `טופס הרשמה - ${selectedPackage.name}`,
                    submissionId,
                    data: answers,
                    submittedAt: new Date().toISOString(),
                  });
                  setSelectedPackage(null);
                },
              })
            ) : isFormSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">הבקשה נשלחה בהצלחה!</h3>
                <p className="text-sm text-slate-400">
                  נציג מטעמנו ייצור עמכם קשר בהקדם בנוגע לחבילת {selectedPackage.name}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackage(null);
                    setIsFormSubmitted(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                >
                  סגור
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formName.trim() || !formPhone.trim()) return;
                  const submissionId = `sub_${Date.now()}`;
                  eventBus.publish('smart_form:submitted', {
                    formId: selectedPackage.formId || 'pricing-form',
                    formTitle: `הרשמה לחבילת ${selectedPackage.name}`,
                    submissionId,
                    data: { name: formName, phone: formPhone, email: formEmail, packageName: selectedPackage.name },
                    submittedAt: new Date().toISOString(),
                  });
                  eventBus.publish('crm:lead:created', {
                    conta_name: formName,
                    conta_phone: formPhone,
                    email: formEmail,
                    source: `עמוד נחיתה - חבילת ${selectedPackage.name}`,
                    tags: ['מתעניין בחבילה', selectedPackage.name],
                  });
                  setIsFormSubmitted(true);
                }}
                className="space-y-4 text-right"
              >
                <div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                    הרשמה לחבילה
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">
                    הצטרפות לחבילת {selectedPackage.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    השאירו פרטים ונחבר אתכם באופן מיידי למערכת.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">שם מלא *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="ישראל ישראלי"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">מספר טלפון *</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="050-1234567"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">כתובת דוא״ל</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:opacity-90 transition-all cursor-pointer mt-4"
                >
                  שליחת פרטים והמשך 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PricingSection;
