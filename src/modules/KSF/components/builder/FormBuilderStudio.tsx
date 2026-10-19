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
  CreditCard,
  Heart,
  UserCheck,
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
    createDefaultForm,
  } = useSmartForm();

  const [activeTab, setActiveTab] = useState<'editor' | 'design' | 'whatsapp' | 'analytics' | 'preview'>('editor');
  const [isBrainstormOpen, setIsBrainstormOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [creatingTemplateType, setCreatingTemplateType] = useState<string | null>(null);

  const handleCreateTemplate = async (type: 'payment' | 'donation_recurring' | 'leads') => {
    try {
      setCreatingTemplateType(type);
      await createDefaultForm(type);
    } catch (err) {
      console.error('Failed to create default template:', err);
      alert('חלה שגיאה ביצירת התבנית');
    } finally {
      setCreatingTemplateType(null);
    }
  };

  React.useEffect(() => {
    const handleNav = (e: any) => {
      const tab = e?.detail?.tab;
      if (tab === 'list') {
        setActiveForm(null);
      } else if (tab) {
        setActiveTab(tab);
      }
    };
    const handleBrainstorm = () => setIsBrainstormOpen(true);

    window.addEventListener('ksf_navigate_tab', handleNav);
    window.addEventListener('ksf_open_ai_brainstorm', handleBrainstorm);
    return () => {
      window.removeEventListener('ksf_navigate_tab', handleNav);
      window.removeEventListener('ksf_open_ai_brainstorm', handleBrainstorm);
    };
  }, [setActiveForm]);

  // If no active form, let user pick or create one
  if (!activeForm && !isLoading) {
    return (
      <div dir="rtl" className="w-full max-w-5xl mx-auto pt-6 pb-12 px-4 space-y-8 animate-fadeIn">
        {/* Default Canonical Templates Quick-Launch Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                תבניות ברירת מחדל מוכנות לשימוש
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                טפסים מובנים ומחוברים ישירות לסליקה, תרומות ומערכת ה-CRM בלחיצה אחת
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Payment Checkout Template */}
            <div className="p-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    סליקה ותשלומים
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    טופס סליקה ותשלום
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    טופס סליקה מאובטח ומהיר עם בחירת סכום, פרטי משלם וחיבור ישיר לסליקת קשר.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={creatingTemplateType !== null}
                onClick={() => handleCreateTemplate('payment')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {creatingTemplateType === 'payment' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>הקם טופס סליקה</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Donation + Recurring Template */}
            <div className="p-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                    תרומות וקמפיינים
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    טופס תרומות והוראת קבע
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    מדרגות תרומה, תמיכה בהוראת קבע 12 חודשים, הקדשה אישית וסעיף 46.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={creatingTemplateType !== null}
                onClick={() => handleCreateTemplate('donation_recurring')}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {creatingTemplateType === 'donation_recurring' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>הקם טופס תרומות</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Lead Capture Template */}
            <div className="p-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    לידים ו-CRM
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    טופס לידים ויצירת קשר
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    שאלון רב-שלבי חכם, מיפוי ישיר לרשומות ה-CRM והתאמה אישית של פניות.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={creatingTemplateType !== null}
                onClick={() => handleCreateTemplate('leads')}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {creatingTemplateType === 'leads' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>הקם טופס לידים</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* User's Existing Forms Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              הטפסים הקיימים שלך ({forms.length})
            </h3>
          </div>

          {forms.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 space-y-3">
              <Sparkles className="w-9 h-9 text-indigo-500 mx-auto" />
              <p className="font-bold text-base text-slate-800 dark:text-white">עדיין לא הוגדרו טפסים פעילים</p>
              <p className="text-xs text-slate-400">
                בחר באחת התבניות למעלה או פתח את צ'אט ה-AI (KSFAI) להפקת טופס מותאם אישית.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setActiveForm(f)}
                  className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {f.category || 'כללי'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {f.steps?.length || 0} שאלות
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 transition-colors">
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
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      עריכה ←
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
              className="text-lg font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
            />
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
