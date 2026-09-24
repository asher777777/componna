import React, { useState, useEffect } from 'react';
import { useStorefront } from '../context/StorefrontContext';
import { SaasSalesFormBridge } from '../services/saasSalesFormBridge';
import { SmartFormRunner } from '../../smart-form-builder/components/runner/SmartFormRunner';
import { SmartFormDefinition } from '../../smart-form-builder/types';
import { Edit3, ArrowRight, ShieldCheck, ArrowLeft, ShoppingBag } from 'lucide-react';

export const DynamicSalesProposalView: React.FC = () => {
  const {
    cart,
    billingPlan,
    totalMonthly,
    totalAnnualSavings,
    customerInfo,
    setCustomerInfo,
    selectedSubdomain,
    setSelectedSubdomain,
    settings,
    setViewMode,
    activeProposalForm,
    generateOrGetProposalForm,
    runAiOptimization,
    aiOptimizationResult,
    isOptimizingAi,
    completeCheckoutAndProvision,
  } = useStorefront();

  const [currentForm, setCurrentForm] = useState<SmartFormDefinition>(() => generateOrGetProposalForm());

  // Initialize and sync form on mount
  useEffect(() => {
    const form = generateOrGetProposalForm();
    setCurrentForm(form);
  }, []);

  // Seamless under-the-hood AI optimization (no disruptive popups/banners)
  useEffect(() => {
    if (!aiOptimizationResult && !isOptimizingAi && cart.length > 0) {
      runAiOptimization({
        businessName: customerInfo.businessName || customerInfo.fullName,
        subdomain: selectedSubdomain,
      });
    }
  }, []);

  // Update currentForm whenever activeProposalForm changes
  useEffect(() => {
    if (activeProposalForm) {
      setCurrentForm(activeProposalForm);
    }
  }, [activeProposalForm]);

  const handleFormSubmissionComplete = async (answers: Record<string, any>) => {
    const extracted = SaasSalesFormBridge.extractTenantInfoFromSubmission(answers, selectedSubdomain);
    setCustomerInfo(prev => ({
      ...prev,
      ...extracted.customerInfo,
    }));

    if (extracted.subdomain) {
      setSelectedSubdomain(extracted.subdomain);
    }

    // Direct auto-provisioning with GoDaddy DNS, DB collection isolation and WhatsApp welcome
    const tenant = await completeCheckoutAndProvision(extracted.subdomain, extracted.discoveryAnswers);
    if (!tenant) {
      // If subdomain wasn't set or needs confirmation
      setViewMode('subdomain_picker');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* Top Subtle Document Header with Studio Edit Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('catalog')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="חזרה לחנות"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white">
              הצעת מחיר והזמנת שירותים דיגיטליים
            </h1>
            <p className="text-xs text-slate-400">
              {cart.length} רכיבים נבחרו | {totalMonthly} {settings.currencySymbol} לחודש
              {billingPlan === 'annual' && ` (חיסכון שנתי של ${totalAnnualSavings} ${settings.currencySymbol})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Studio Edit Button for Administrator */}
          <button
            type="button"
            onClick={() => setViewMode('edit_proposal_form')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 shadow-sm transition"
            title="עריכת שלבים ושדות ב-Form Builder Studio"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>✏️ ערוך ב-Studio (מנהל)</span>
          </button>
        </div>
      </div>

      {/* Embedded High-Contrast Luxury Smart Form Runner */}
      <div className="w-full bg-[#0a0a0c] border border-slate-800/80 rounded-3xl p-4 sm:p-8 shadow-2xl">
        <SmartFormRunner
          form={currentForm}
          onComplete={handleFormSubmissionComplete}
        />
      </div>

      {/* Trust & Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>ההצעה מוגנת ומאובטחת בהצפנת SSL 256-bit. הקצאת סאב-דומיין וסביבת עבודה מיידית.</span>
      </div>

    </div>
  );
};

export default DynamicSalesProposalView;
