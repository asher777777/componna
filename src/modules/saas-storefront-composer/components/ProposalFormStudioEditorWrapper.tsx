import React, { useEffect } from 'react';
import { useStorefront } from '../context/StorefrontContext';
import { SmartFormProvider } from '../../smart-form-builder/context/SmartFormContext';
import { useSmartForm } from '../../smart-form-builder/context/useSmartForm';
import { FormBuilderStudio } from '../../smart-form-builder/components/builder/FormBuilderStudio';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

const InnerStudioBridge: React.FC = () => {
  const { activeProposalForm, updateProposalForm, setViewMode } = useStorefront();
  const { activeForm, setActiveForm, forms } = useSmartForm();

  // Set the storefront proposal form as active form in SmartFormContext
  useEffect(() => {
    if (activeProposalForm && (!activeForm || activeForm.id !== activeProposalForm.id)) {
      setActiveForm(activeProposalForm);
    }
  }, [activeProposalForm]);

  // Sync back edits to StorefrontContext when activeForm changes
  useEffect(() => {
    if (activeForm && activeProposalForm && activeForm.id === activeProposalForm.id) {
      updateProposalForm(activeForm);
    }
  }, [activeForm]);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Studio Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            ✏️
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">עורך טופס והצעת מכירה (Studio Mode)</h2>
            <p className="text-[11px] text-slate-400">
              כל שינוי בשדות, בשלבים ובעיצוב נשמר ומסונכרן אוטומטית להצעת המחיר
            </p>
          </div>
        </div>

        <button
          onClick={() => setViewMode('sales_proposal')}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לתצוגת הצעת המחיר</span>
        </button>
      </div>

      {/* Main Studio */}
      <FormBuilderStudio />
    </div>
  );
};

export const ProposalFormStudioEditorWrapper: React.FC = () => {
  const { activeProposalForm } = useStorefront();

  return (
    <SmartFormProvider initialFormId={activeProposalForm?.id}>
      <InnerStudioBridge />
    </SmartFormProvider>
  );
};

export default ProposalFormStudioEditorWrapper;
