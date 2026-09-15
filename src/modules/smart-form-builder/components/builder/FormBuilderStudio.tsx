import React, { useState } from 'react';
import { useSmartForm } from '../../context/useSmartForm';
import { SmartFormDefinition } from '../../types';
import { FormStepsEditor } from './FormStepsEditor';
import { FormStyleSettings } from './FormStyleSettings';
import { FormWhatsAppAutomationsTab } from './FormWhatsAppAutomationsTab';
import { SmartFormRunner } from '../runner/SmartFormRunner';
import { FormSubmissionsTable } from '../analytics/FormSubmissionsTable';
import { AIBrainstormModal } from './AIBrainstormModal';
import { FormEmbedModal } from '../shared/FormEmbedModal';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import {
  Wand2,
  Save,
  Share2,
  Eye,
  Sliders,
  Layers,
  BarChart3,
  Check,
  Loader2,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export const FormBuilderStudio: React.FC = () => {
  const {
    forms,
    activeForm,
    isLoading,
    isSaving,
    setActiveForm,
    saveForm,
    deleteForm,
  } = useSmartForm();

  const [activeTab, setActiveTab] = useState<'editor' | 'design' | 'whatsapp' | 'analytics' | 'preview'>('editor');
  const [isBrainstormOpen, setIsBrainstormOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // If no active form, let user pick or create one
  if (!activeForm && !isLoading) {
    return (
      <div dir="rtl" className="w-full max-w-5xl mx-auto py-10 px-4 space-y-8 animate-fadeIn">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-xl border border-slate-700/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-2xl">
                <LuxuryIconRenderer iconName="Crown" className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                סטודיו בונה הטפסים החכם (Smart Form Studio)
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              יצירת טפסים רב-שלביים יוקרתיים (שדה יחיד בכל שלב), סיעור מוחות מלא ב-AI, מסד נתונים בתת-קולקציות ואינטגרציה לאנליטיקה.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsBrainstormOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 text-sm transition-all transform hover:-translate-y-0.5"
            >
              <Wand2 className="w-4 h-4" />
              <span>צור טופס חדש ב-AI</span>
            </button>
          </div>
        </div>

        {/* Existing Forms Grid */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>הטפסים הקיימים במערכת ({forms.length})</span>
          </h3>

          {forms.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 space-y-3">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="font-bold text-base text-slate-800 dark:text-white">עדיין לא נוצרו טפסים</p>
              <p className="text-xs text-slate-400">
                לחץ על "צור טופס חדש ב-AI" כדי להתחיל בסיעור מוחות והפקת הטופס הראשון שלך.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setActiveForm(f)}
                  className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {f.category || 'כללי'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {f.steps?.length || 0} שלבים
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-amber-600 transition-colors">
                      {f.title}
                    </h4>
                    {f.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {f.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>הגשות: {f.submissionsCount || 0}</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
                      פתח לעריכה ←
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Brainstorm Modal */}
        <AIBrainstormModal
          isOpen={isBrainstormOpen}
          onClose={() => setIsBrainstormOpen(false)}
          onFormGenerated={(newForm) => {
            setActiveForm(newForm);
          }}
        />
      </div>
    );
  }

  if (!activeForm) return null;

  const handleSave = async () => {
    try {
      await saveForm(activeForm);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2500);
    } catch (e) {
      alert('שגיאה בשמירת הטופס');
    }
  };

  return (
    <div dir="rtl" className="w-full max-w-6xl mx-auto py-6 px-4 space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        {/* Left: Back & Title Edit */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveForm(null)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            ← כל הטפסים
          </button>

          <div className="space-y-0.5">
            <input
              type="text"
              value={activeForm.title}
              onChange={(e) => setActiveForm({ ...activeForm, title: e.target.value })}
              className="text-lg font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-amber-500 rounded px-1"
            />
            <div className="text-[11px] text-slate-400 font-mono px-1">
              קולקציה: `mod_forms/{activeForm.id}/submissions`
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBrainstormOpen(true)}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-amber-500/30"
          >
            <Wand2 className="w-4 h-4" />
            <span>שפר ב-AI</span>
          </button>

          <button
            onClick={() => setIsEmbedOpen(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>הטמעה ושיתוף</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccessMsg ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccessMsg ? 'נשמר בהצלחה!' : 'שמור שינויים'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'editor'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>עורך שלבים ושאלות ({activeForm.steps?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'design'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>עיצוב פרימיום ו-CRM</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>אוטומציות וואטסאפ ({activeForm.whatsappRules?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'preview'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>תצוגה מקדימה חיה (Live Runner)</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'analytics'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>הגשות מתת-קולקציה ואנליטיקה</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {activeTab === 'editor' && (
          <FormStepsEditor
            steps={activeForm.steps || []}
            onChange={(newSteps) => setActiveForm({ ...activeForm, steps: newSteps })}
          />
        )}

        {activeTab === 'design' && (
          <FormStyleSettings
            form={activeForm}
            onChange={(updated) => setActiveForm(updated)}
          />
        )}

        {activeTab === 'whatsapp' && (
          <FormWhatsAppAutomationsTab
            form={activeForm}
            onChange={(updated) => setActiveForm(updated)}
          />
        )}

        {activeTab === 'preview' && (
          <div className="max-w-2xl mx-auto py-4 space-y-4">
            <SmartFormRunner
              form={activeForm}
              previewMode={false}
              onComplete={(answers, subId) => {
                console.log('Form submission saved:', subId, answers);
              }}
            />
          </div>
        )}


        {activeTab === 'analytics' && (
          <FormSubmissionsTable form={activeForm} />
        )}
      </div>

      {/* AI Brainstorm Modal */}
      <AIBrainstormModal
        isOpen={isBrainstormOpen}
        onClose={() => setIsBrainstormOpen(false)}
        onFormGenerated={(newForm) => {
          setActiveForm(newForm);
        }}
      />

      {/* Embed Modal */}
      <FormEmbedModal
        isOpen={isEmbedOpen}
        form={activeForm}
        onClose={() => setIsEmbedOpen(false)}
      />
    </div>
  );
};
