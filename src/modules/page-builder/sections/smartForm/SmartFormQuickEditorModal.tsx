import React, { useState } from 'react';
import { SmartFormDefinition } from '../../../smart-form-builder/types';
import { FormStepsEditor } from '../../../smart-form-builder/components/builder/FormStepsEditor';
import { FormStyleSettings } from '../../../smart-form-builder/components/builder/FormStyleSettings';
import { FormWhatsAppAutomationsTab } from '../../../smart-form-builder/components/builder/FormWhatsAppAutomationsTab';
import { SmartFormRunner } from '../../../smart-form-builder/components/runner/SmartFormRunner';
import { saveSmartForm } from '../../../smart-form-builder/services/formStorageService';
import { LuxuryIconRenderer } from '../../../smart-form-builder/components/shared/LuxuryIconRenderer';
import {
  X,
  Save,
  Layers,
  Sliders,
  MessageSquare,
  Eye,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';

export interface SmartFormQuickEditorModalProps {
  isOpen: boolean;
  form: SmartFormDefinition;
  onClose: () => void;
  onSave: (savedForm: SmartFormDefinition) => void;
  onSaveAsNew: (newForm: SmartFormDefinition) => void;
}

export const SmartFormQuickEditorModal: React.FC<SmartFormQuickEditorModalProps> = ({
  isOpen,
  form: initialForm,
  onClose,
  onSave,
  onSaveAsNew,
}) => {
  if (!isOpen) return null;

  const [formState, setFormState] = useState<SmartFormDefinition>({ ...initialForm });
  const [activeTab, setActiveTab] = useState<'steps' | 'design' | 'whatsapp' | 'preview'>('steps');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Save As New state
  const [isSaveAsNewOpen, setIsSaveAsNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(`${initialForm.title} (עותק חדש)`);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleSaveExisting = async () => {
    setIsSaving(true);
    try {
      await saveSmartForm(formState);
      setSaveSuccess(true);
      onSave(formState);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      alert('שגיאה בשמירת הטופס');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateAndSaveNew = async () => {
    if (!newTitle.trim()) {
      alert('נא להזין כותרת לטופס החדש');
      return;
    }

    setIsDuplicating(true);
    try {
      const newFormId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date().toISOString();

      const newForm: SmartFormDefinition = {
        ...formState,
        id: newFormId,
        title: newTitle.trim(),
        slug: newTitle.trim().toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-'),
        createdAt: now,
        updatedAt: now,
        submissionsCount: 0,
        viewsCount: 0,
        startsCount: 0,
      };

      await saveSmartForm(newForm);
      onSaveAsNew(newForm);
      setIsSaveAsNewOpen(false);
      onClose();
    } catch (e) {
      alert('שגיאה בשמירת הטופס החדש');
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        dir="rtl"
        className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-2xl shadow-sm">
              <LuxuryIconRenderer iconName="Layers" className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-amber-500 rounded px-1"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                קולקציה: `mod_forms/{formState.id}`
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save as New Button */}
            <button
              type="button"
              onClick={() => setIsSaveAsNewOpen(true)}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>שמור בשם חדש</span>
            </button>

            {/* Save Existing */}
            <button
              type="button"
              onClick={handleSaveExisting}
              disabled={isSaving}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saveSuccess ? 'נשמר בהצלחה!' : 'שמור שינויים'}</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'steps'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>שאלות ושלבים ({formState.steps?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'design'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>עיצוב, צבעים וטון</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>אוטומציות וואטסאפ ({formState.whatsappRules?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>תצוגה מקדימה חיה</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/40">
          {activeTab === 'steps' && (
            <FormStepsEditor
              steps={formState.steps || []}
              onChange={(newSteps) => setFormState({ ...formState, steps: newSteps })}
            />
          )}

          {activeTab === 'design' && (
            <FormStyleSettings
              form={formState}
              onChange={(updated) => setFormState(updated)}
            />
          )}

          {activeTab === 'whatsapp' && (
            <FormWhatsAppAutomationsTab
              form={formState}
              onChange={(updated) => setFormState(updated)}
            />
          )}

          {activeTab === 'preview' && (
            <div className="max-w-2xl mx-auto py-4">
              <SmartFormRunner form={formState} previewMode={true} />
            </div>
          )}
        </div>
      </div>

      {/* Save As New Modal Sub-dialog */}
      {isSaveAsNewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            dir="rtl"
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-500" />
                <span>שמירת טופס בשם חדש (שכפול)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSaveAsNewOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              פעולה זו תשכפל את כל השלבים, ההגדרות, העיצוב ואוטומציות הוואטסאפ לטופס חדש ונפרד בקולקציית הטפסים (`mod_forms`), ותשייך אותו ישירות לסקשן הנוכחי בעמוד.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                שם הטופס החדש:
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="למשל: שאלון התאמה - קמפיין קיץ 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsSaveAsNewOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDuplicateAndSaveNew}
                disabled={isDuplicating || !newTitle.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isDuplicating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>שמור והחל בעמוד</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
