import React, { useState, useEffect } from 'react';
import { SmartFormSectionConfig } from './SmartFormSection';
import { getSmartForms, getSmartFormById, saveSmartForm } from '../../../smart-form-builder/services/formStorageService';
import { SmartFormDefinition } from '../../../smart-form-builder/types';
import { SmartFormQuickEditorModal } from './SmartFormQuickEditorModal';
import { AIBrainstormModal } from '../../../smart-form-builder/components/builder/AIBrainstormModal';
import { LuxuryIconRenderer } from '../../../smart-form-builder/components/shared/LuxuryIconRenderer';
import {
  Sparkles,
  Layers,
  Edit3,
  Copy,
  Plus,
  RefreshCw,
  CheckCircle,
  Eye,
  Sliders,
  FileText,
  MessageSquare,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const SmartFormEditor: React.FC<{
  config: SmartFormSectionConfig;
  onChange: (newConfig: SmartFormSectionConfig) => void;
}> = ({ config, onChange }) => {
  const [forms, setForms] = useState<SmartFormDefinition[]>([]);
  const [selectedForm, setSelectedForm] = useState<SmartFormDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBrainstormModalOpen, setIsBrainstormModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const list = await getSmartForms();
      setForms(list);

      if (config.formId) {
        const found = list.find((f) => f.id === config.formId);
        if (found) {
          setSelectedForm(found);
        } else {
          const fetched = await getSmartFormById(config.formId);
          if (fetched) setSelectedForm(fetched);
        }
      } else if (list.length > 0) {
        onChange({ ...config, formId: list[0].id });
        setSelectedForm(list[0]);
      }
    } catch (e) {
      console.warn('Error fetching smart forms:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleSelectForm = (formId: string) => {
    onChange({ ...config, formId });
    const found = forms.find((f) => f.id === formId) || null;
    setSelectedForm(found);
  };

  const handleDuplicateForm = async () => {
    if (!selectedForm || !duplicateTitle.trim()) return;
    setIsDuplicating(true);
    try {
      const newId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date().toISOString();

      const newForm: SmartFormDefinition = {
        ...selectedForm,
        id: newId,
        title: duplicateTitle.trim(),
        slug: duplicateTitle.trim().toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-'),
        createdAt: now,
        updatedAt: now,
        submissionsCount: 0,
        viewsCount: 0,
        startsCount: 0,
      };

      await saveSmartForm(newForm);
      await fetchForms();
      onChange({ ...config, formId: newId });
      setSelectedForm(newForm);
      setIsDuplicateModalOpen(false);
      setDuplicateTitle('');
      showSuccessFeedback(`הטופס "${newForm.title}" שוכפל ונשמר בהצלחה!`);
    } catch (e) {
      alert('שגיאה בשכפול הטופס');
    } finally {
      setIsDuplicating(false);
    }
  };

  const showSuccessFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div dir="rtl" className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 1. Form Selection & Quick Action Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>בחירת טופס חכם (Smart Form) להטמעה:</span>
          </label>
          <button
            type="button"
            onClick={fetchForms}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="רענן רשימת טפסים"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dropdown Selector */}
        {loading ? (
          <div className="p-3 text-slate-400 font-medium">טוען טפסים מ-mod_forms...</div>
        ) : forms.length === 0 ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl space-y-2">
            <p className="font-bold">לא נמצאו טפסים בקולקציית הטפסים</p>
            <p className="text-[11px] leading-relaxed">
              ניתן ליצור טופס חדש ב-AI ישירות מכאן בלחיצה על הכפתור למטה.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <select
              value={config.formId || ''}
              onChange={(e) => handleSelectForm(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.steps?.length || 0} שלבים • {f.category || 'כללי'})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 font-mono block px-1">
              קולקציית מקור: `mod_forms/{config.formId || 'לא נבחר'}`
            </span>
          </div>
        )}

        {/* Action Buttons: Edit / Save As New / Create AI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Edit Button */}
          <button
            type="button"
            disabled={!selectedForm}
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-600 dark:text-amber-400 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ערוך טופס</span>
          </button>

          {/* Duplicate & Save as New */}
          <button
            type="button"
            disabled={!selectedForm}
            onClick={() => {
              if (selectedForm) {
                setDuplicateTitle(`${selectedForm.title} (עותק דף נחיתה)`);
                setIsDuplicateModalOpen(true);
              }
            }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>שמור בשם חדש</span>
          </button>

          {/* Create AI Form */}
          <button
            type="button"
            onClick={() => setIsBrainstormModalOpen(true)}
            className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>צור טופס ב-AI</span>
          </button>
        </div>

        {/* Selected Form Quick Info Card */}
        {selectedForm && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                פרטי הטופס הנבחר:
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {selectedForm.steps?.length || 0} שלבים
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedForm.steps?.map((step, idx) => (
                <span
                  key={step.id || idx}
                  className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                >
                  {idx + 1}. {step.title}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>סגנון: {selectedForm.tone || 'יוקרתי'}</span>
              <span>
                וואטסאפ: {selectedForm.whatsappAutomationEnabled ? 'פעיל' : 'כבוי'} (
                {selectedForm.whatsappRules?.length || 0} חוקים)
              </span>
              <span>הגשות: {selectedForm.submissionsCount || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Section Customization & Layout Overrides */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>הגדרות תצוגה של הסקשן בעמוד:</span>
        </h4>

        {/* Section Title */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 block">
            כותרת עליונה לסקשן (אופציונלי):
          </label>
          <input
            type="text"
            value={config.sectionTitle || ''}
            onChange={(e) => onChange({ ...config, sectionTitle: e.target.value })}
            placeholder="לדוגמה: הצטרפו אלינו עוד היום"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Section Subtitle */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 block">
            כותרת משנה לסקשן:
          </label>
          <input
            type="text"
            value={config.sectionSubtitle || ''}
            onChange={(e) => onChange({ ...config, sectionSubtitle: e.target.value })}
            placeholder="לדוגמה: מלאו את השאלון הקצר ונציג יחזור אליכם בהקדם"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Width & Background */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              רוחב המיכל (Width):
            </label>
            <select
              value={config.containerWidth || 'md'}
              onChange={(e) => onChange({ ...config, containerWidth: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="sm">צר ויוקרתי (max-w-xl)</option>
              <option value="md">סטנדרטי מומלץ (max-w-2xl)</option>
              <option value="lg">רחב (max-w-4xl)</option>
              <option value="full">רוחב מלא (100%)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              צבע רקע לסקשן:
            </label>
            <input
              type="text"
              value={config.backgroundColor || ''}
              onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
              placeholder="transparent או #0f172a"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {selectedForm && isEditModalOpen && (
        <SmartFormQuickEditorModal
          isOpen={isEditModalOpen}
          form={selectedForm}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(saved) => {
            setSelectedForm(saved);
            fetchForms();
            showSuccessFeedback(`הטופס "${saved.title}" עודכן בהצלחה!`);
          }}
          onSaveAsNew={(newForm) => {
            onChange({ ...config, formId: newForm.id });
            setSelectedForm(newForm);
            fetchForms();
            showSuccessFeedback(`הטופס החדש "${newForm.title}" נוצר ושויך לסקשן!`);
          }}
        />
      )}

      {/* Duplicate Dialog */}
      {isDuplicateModalOpen && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            dir="rtl"
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Copy className="w-4 h-4 text-amber-500" />
              <span>שמירת טופס בשם חדש (שכפול)</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              הטופס ישוכפל כטופס עצמאי חדש בקולקציית `mod_forms` עם כל שלביו, סגנונו ואוטומציות הוואטסאפ שלו, ויוגדר מיד בסקשן זה.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                שם הטופס החדש:
              </label>
              <input
                type="text"
                value={duplicateTitle}
                onChange={(e) => setDuplicateTitle(e.target.value)}
                placeholder="הזן שם לטופס החדש..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDuplicateForm}
                disabled={isDuplicating || !duplicateTitle.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>שמור והחל בעמוד</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Brainstorm Modal */}
      <AIBrainstormModal
        isOpen={isBrainstormModalOpen}
        onClose={() => setIsBrainstormModalOpen(false)}
        onFormGenerated={async (newForm) => {
          try {
            await saveSmartForm(newForm);
            await fetchForms();
            onChange({ ...config, formId: newForm.id });
            setSelectedForm(newForm);
            setIsBrainstormModalOpen(false);
            showSuccessFeedback(`טופס AI חדש "${newForm.title}" נוצר ושויך בהצלחה!`);
          } catch (e) {
            alert('שגיאה בשמירת הטופס שנוצר');
          }
        }}
      />
    </div>
  );
};
