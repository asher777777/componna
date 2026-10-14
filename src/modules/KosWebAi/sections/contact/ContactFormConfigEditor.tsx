import React, { useState, useEffect } from 'react';
import { FormConfigContract, FormFieldContract, FormItemSummary } from '../../../../core/contracts';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import {
  Folder,
  Settings2,
  LayoutTemplate,
  Palette,
  MessageCircle,
  Coins,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Clock,
  Check,
  CreditCard,
  Send,
  Layers,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

export const DEFAULT_CONTACT_FORM_CONFIG: FormConfigContract = {
  enabled: true,
  form_type: 'standard',
  submit_button_text: 'שליחת פנייה',
  submit_button_bg_color: '#4f46e5',
  submit_button_text_color: '#ffffff',
  continue_button_text: 'המשך לשלב הבא',
  back_button_text: 'חזור',
  fields: [
    {
      label: 'שם מלא',
      type: 'text',
      map_to: 'conta_name',
      required: true,
      default_value: '',
      options: '',
      step: 1,
      widthPercentage: 50,
      placeholder: 'ישראל ישראלי',
    },
    {
      label: 'טלפון נייד',
      type: 'tel',
      map_to: 'conta_phone',
      required: true,
      default_value: '',
      options: '',
      step: 1,
      widthPercentage: 50,
      placeholder: '050-1234567',
    },
    {
      label: 'דואר אלקטרוני',
      type: 'email',
      map_to: 'email',
      required: false,
      default_value: '',
      options: '',
      step: 1,
      widthPercentage: 100,
      placeholder: 'name@example.com',
    },
    {
      label: 'תוכן הפנייה',
      type: 'textarea',
      map_to: 'notes',
      required: true,
      default_value: '',
      options: '',
      step: 1,
      widthPercentage: 100,
      placeholder: 'כתבו לנו כאן במה נוכל לעזור...',
    },
  ],
  save_to_crm: true,
  crm_owner_id: '1',
  standard_success_message: 'פנייתך התקבלה בהצלחה! נציג יחזור אליך בהקדם.',
  standard_redirect_url: '',
  standard_whatsapp_message: 'שלום {שם מלא}, תודה שפנית אלינו! פנייתך נקלטה במערכת ונשוב אליך בהקדם.',
  standard_whatsapp_image_url: '',
  payment_amount: 100,
  payment_amount_crm_map: 'payment_amount',
  payment_pending_message: 'שלום {שם מלא}, ההזמנה שלך התקבלה וממתינה לתשלום.',
  payment_pending_image_url: '',
  payment_success_message: 'שלום {שם מלא}, התשלום בסך {סכום} ש״ח בוצע בהצלחה! קישור לקבלה: {link_kabala}',
  payment_success_image_url: '',
  payment_receipt_type: '320', // 320 = חשבונית מס קבלה
  payment_methods: ['one-time', 'installments', 'recurring', 'bit'],
  payment_frequency: 'one-time',
  payment_require_id: false,
};

const CRM_DB_FIELDS: Record<string, string> = {
  '': '-- ללא מיפוי --',
  conta_name: 'שם / שם מלא',
  f_m: 'שם משפחה',
  conta_phone: 'טלפון נייד (וואטסאפ)',
  email: 'דוא״ל ראשי',
  company_name: 'שם החברה / עסק',
  notes: 'הערות / תוכן פנייה',
  mh_crm_city: 'עיר',
  mh_crm_street: 'כתובת / רחוב',
  payment_amount: 'סכום לתשלום (עבור טופס תשלום)',
};

const FIELD_TYPES = [
  { id: 'text', label: 'טקסט קצר' },
  { id: 'tel', label: 'טלפון נייד' },
  { id: 'email', label: 'כתובת אימייל' },
  { id: 'textarea', label: 'אזור טקסט ארוך' },
  { id: 'select', label: 'בחירה מרשימה (Dropdown)' },
  { id: 'number', label: 'מספר (סכום להזנה)' },
  { id: 'fixed_amount', label: 'סכום קבוע לתשלום' },
  { id: 'payment_summary', label: 'שלב תשלום: סיכום ועריכת נתונים' },
  { id: 'payment_cc', label: 'שלב תשלום: נתוני אשראי ומסוף קשר' },
];

export interface ContactFormConfigEditorProps {
  value?: FormConfigContract;
  formId?: string;
  onFormIdChange?: (formId: string) => void;
  onChange: (config: FormConfigContract) => void;
}

export const ContactFormConfigEditor: React.FC<ContactFormConfigEditorProps> = ({
  value: propValue,
  formId,
  onFormIdChange,
  onChange,
}) => {
  const value = propValue || DEFAULT_CONTACT_FORM_CONFIG;

  const { getCapability } = useHostCapabilities();
  const formBuilder = getCapability<any>('form-builder');

  const [activeTab, setActiveTab] = useState<string>('fields');
  const [expandedFieldIndex, setExpandedFieldIndex] = useState<number | null>(null);
  const [availableForms, setAvailableForms] = useState<FormItemSummary[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);

  useEffect(() => {
    if (formBuilder?.getForms) {
      setLoadingForms(true);
      formBuilder.getForms()
        .then((list: FormItemSummary[]) => {
          setAvailableForms(list || []);
        })
        .catch((err: any) => console.warn('Could not load forms from KSF:', err))
        .finally(() => setLoadingForms(false));
    }
  }, [formBuilder]);

  const update = (updates: Partial<FormConfigContract>) => {
    onChange({ ...value, ...updates });
  };

  const handleFieldChange = (index: number, updates: Partial<FormFieldContract>) => {
    const nextFields = [...(value.fields || [])];
    nextFields[index] = { ...nextFields[index], ...updates };
    update({ fields: nextFields });
  };

  const addField = () => {
    const newField: FormFieldContract = {
      label: `שדה חדש ${(value.fields || []).length + 1}`,
      type: 'text',
      map_to: '',
      required: false,
      default_value: '',
      options: '',
      step: 1,
      widthPercentage: 100,
      placeholder: '',
    };
    const next = [...(value.fields || []), newField];
    update({ fields: next });
    setExpandedFieldIndex(next.length - 1);
  };

  const addStep = () => {
    const maxStep = Math.max(1, ...(value.fields || []).map((f) => f.step || 1));
    const newField: FormFieldContract = {
      label: `שלב ${maxStep + 1}`,
      type: 'text',
      map_to: '',
      required: false,
      step: maxStep + 1,
      widthPercentage: 100,
    };
    const next = [...(value.fields || []), newField];
    update({ fields: next });
    setExpandedFieldIndex(next.length - 1);
  };

  const deleteField = (index: number) => {
    const next = (value.fields || []).filter((_, i) => i !== index);
    update({ fields: next });
    if (expandedFieldIndex === index) setExpandedFieldIndex(null);
  };

  const duplicateField = (index: number) => {
    const field = (value.fields || [])[index];
    const clone: FormFieldContract = {
      ...field,
      label: `${field.label} (עותק)`,
    };
    const next = [...(value.fields || [])];
    next.splice(index + 1, 0, clone);
    update({ fields: next });
    setExpandedFieldIndex(index + 1);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const fields = [...(value.fields || [])];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = fields[index];
    fields[index] = fields[target];
    fields[target] = temp;
    update({ fields });
    if (expandedFieldIndex === index) setExpandedFieldIndex(target);
  };

  const insertPlaceholder = (placeholder: string, fieldName: keyof FormConfigContract) => {
    const currentText = (value[fieldName] as string) || '';
    update({ [fieldName]: `${currentText} ${placeholder}` });
  };

  return (
    <div className="w-full flex flex-col gap-3 text-right" dir="rtl">
      {/* Tab 0: Choose existing KSF Form or Create Custom */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'templates' ? '' : 'templates')}
          className="w-full p-3.5 flex justify-between items-center hover:bg-slate-800/60 text-white font-bold text-xs cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-400" />
            <span>בחירת טופס מתוך KFS / שאלונים שמורים</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === 'templates' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {activeTab === 'templates' && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">טופס חכם מקושר מ-KSF</label>
              {formBuilder?.getForms && (
                <button
                  type="button"
                  onClick={() => {
                    setLoadingForms(true);
                    formBuilder.getForms().then((l: any) => setAvailableForms(l || [])).finally(() => setLoadingForms(false));
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingForms ? 'animate-spin' : ''}`} />
                  <span>רענן רשימה</span>
                </button>
              )}
            </div>

            <select
              value={formId || ''}
              onChange={(e) => onFormIdChange?.(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">טופס מותאם אישית (הגדרות עורך למטה)</option>
              {availableForms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.submissionsCount || 0} הגשות) {f.hasPaymentStep ? '💳 כולל סליקה' : ''}
                </option>
              ))}
            </select>

            {formId && (
              <p className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                הטופס מקושר ישירות לטופס החכם ב-KFS. הגשות ייקלטו וינוהלו במערכת הטפסים המרכזית.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tab 1: Form Type */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'type' ? '' : 'type')}
          className="w-full p-3.5 flex justify-between items-center hover:bg-slate-800/60 text-white font-bold text-xs cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-amber-400" />
            <span>סוג הטופס (רגיל / סליקה ותשלום / הרשמה)</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === 'type' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {activeTab === 'type' && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => update({ form_type: 'standard' })}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  value.form_type === 'standard'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Send className="w-5 h-5 text-indigo-400" />
                <span className="text-xs">טופס לידים רגיל</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const fields = [...(value.fields || [])];
                  // If no payment summary field, append it
                  if (!fields.some((f) => f.type === 'payment_summary' || f.type === 'payment_cc')) {
                    fields.push({
                      label: 'סיכום תשלום',
                      type: 'payment_summary',
                      map_to: 'payment_amount',
                      required: true,
                      payment_doc_type: '320',
                      payment_methods: ['one-time', 'installments', 'recurring', 'bit'],
                      payment_recurring_limit: 'user-choice',
                      step: 2,
                      widthPercentage: 100,
                    });
                    fields.push({
                      label: 'פרטי אשראי',
                      type: 'payment_cc',
                      map_to: '',
                      required: true,
                      payment_require_id: false,
                      step: 2,
                      widthPercentage: 100,
                    });
                  }
                  update({ form_type: 'payment', fields });
                }}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  value.form_type === 'payment'
                    ? 'border-amber-500 bg-amber-500/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-xs">טופס סליקה ותשלום</span>
              </button>

              <button
                type="button"
                onClick={() => update({ form_type: 'register' })}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  value.form_type === 'register'
                    ? 'border-purple-500 bg-purple-500/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-xs">הרשמת לקוח / חבר</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab 2: Fields Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'fields' ? '' : 'fields')}
          className="w-full p-3.5 flex justify-between items-center hover:bg-slate-800/60 text-white font-bold text-xs cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-emerald-400" />
            <span>ניהול שדות הטופס ({(value.fields || []).length} שדות)</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === 'fields' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {activeTab === 'fields' && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">רשימת השדות בטופס</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addStep}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>הוסף שלב</span>
                </button>
                <button
                  type="button"
                  onClick={addField}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף שדה</span>
                </button>
              </div>
            </div>

            {/* Fields list */}
            <div className="flex flex-col gap-2">
              {(value.fields || []).map((field, idx) => {
                const isExpanded = expandedFieldIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all"
                  >
                    <div className="p-2.5 flex items-center justify-between gap-2">
                      <div
                        onClick={() => setExpandedFieldIndex(isExpanded ? null : idx)}
                        className="flex-1 flex items-center gap-2 cursor-pointer select-none"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{field.label || 'שדה ללא שם'}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md">
                          {FIELD_TYPES.find((t) => t.id === field.type)?.label || field.type}
                        </span>
                        {field.required && (
                          <span className="text-[10px] text-rose-400 font-bold">*חובה</span>
                        )}
                        {field.step && field.step > 1 && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            שלב {field.step}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveField(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="הזז למעלה"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(idx, 'down')}
                          disabled={idx === (value.fields || []).length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="הזז למטה"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateField(idx)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="שכפל שדה"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteField(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                          title="מחק שדה"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">תווית השדה (Label) *</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleFieldChange(idx, { label: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">סוג שדה</label>
                            <select
                              value={field.type}
                              onChange={(e) => handleFieldChange(idx, { type: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                              {FIELD_TYPES.map((t) => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">מיפוי לשדה CRM</label>
                            <select
                              value={field.map_to || ''}
                              onChange={(e) => handleFieldChange(idx, { map_to: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                              {Object.entries(CRM_DB_FIELDS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">רוחב בשורה</label>
                            <select
                              value={field.widthPercentage || 100}
                              onChange={(e) => handleFieldChange(idx, { widthPercentage: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                              <option value={100}>100% (רוחב מלא)</option>
                              <option value={50}>50% (חצי שורה)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">מספר שלב</label>
                            <input
                              type="number"
                              min={1}
                              value={field.step || 1}
                              onChange={(e) => handleFieldChange(idx, { step: Number(e.target.value) || 1 })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">טקסט ממלא מקום (Placeholder)</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => handleFieldChange(idx, { placeholder: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            placeholder="הזינו כאן..."
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`req-${idx}`}
                            checked={field.required}
                            onChange={(e) => handleFieldChange(idx, { required: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                          />
                          <label htmlFor={`req-${idx}`} className="text-xs text-slate-300 font-semibold cursor-pointer">
                            שדה חובה למילוי
                          </label>
                        </div>

                        {/* Special config for payment summary */}
                        {field.type === 'payment_summary' && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 mt-2">
                            <span className="text-xs font-bold text-amber-300 block">הגדרות סליקה עבור שלב זה</span>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">סוג מסמך להפקה בקשר (Kesher)</label>
                              <select
                                value={field.payment_doc_type || '320'}
                                onChange={(e) => handleFieldChange(idx, { payment_doc_type: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                              >
                                <option value="320">320 - חשבונית מס / קבלה</option>
                                <option value="400">400 - קבלה רגילה</option>
                                <option value="405">405 - קבלה על תרומה (סעיף 46)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tab 3: Buttons & Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'buttons' ? '' : 'buttons')}
          className="w-full p-3.5 flex justify-between items-center hover:bg-slate-800/60 text-white font-bold text-xs cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>עיצוב כפתורי שליחה ומעבר שלב</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === 'buttons' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {activeTab === 'buttons' && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">טקסט כפתור שליחה</label>
              <input
                type="text"
                value={value.submit_button_text || ''}
                onChange={(e) => update({ submit_button_text: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="למשל: שליחת פנייה / תשלום מאובטח"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">צבע רקע כפתור</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2 rounded-xl">
                  <input
                    type="color"
                    value={value.submit_button_bg_color || '#4f46e5'}
                    onChange={(e) => update({ submit_button_bg_color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-300">{value.submit_button_bg_color || '#4f46e5'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">צבע טקסט כפתור</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2 rounded-xl">
                  <input
                    type="color"
                    value={value.submit_button_text_color || '#ffffff'}
                    onChange={(e) => update({ submit_button_text_color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-300">{value.submit_button_text_color || '#ffffff'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">טקסט כפתור המשך (רב-שלבי)</label>
                <input
                  type="text"
                  value={value.continue_button_text || 'המשך'}
                  onChange={(e) => update({ continue_button_text: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">טקסט כפתור חזור</label>
                <input
                  type="text"
                  value={value.back_button_text || 'חזור'}
                  onChange={(e) => update({ back_button_text: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab 4: WhatsApp Automation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'whatsapp' ? '' : 'whatsapp')}
          className="w-full p-3.5 flex justify-between items-center hover:bg-slate-800/60 text-white font-bold text-xs cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>אוטומציית הודעות WhatsApp (KosWhatsUp)</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === 'whatsapp' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {activeTab === 'whatsapp' && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>מנגנון WhatsApp אוטומטי (מונופול KosWhatsUp)</span>
              </h4>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                הודעות WhatsApp יישלחו אוטומטית למספר הטלפון שיוזן בטופס.
                לחצו על הפלייסהולדרים למטה כדי להטמיע נתונים דינמיים מתוך השדות שמילא הלקוח:
              </p>

              {/* Dynamic Placeholders Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['{שם מלא}', '{טלפון}', '{אימייל}', '{הערות}'].map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => insertPlaceholder(ph, value.form_type === 'payment' ? 'payment_success_message' : 'standard_whatsapp_message')}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold cursor-pointer"
                  >
                    {ph}
                  </button>
                ))}
                {value.form_type === 'payment' && (
                  <>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{סכום}', 'payment_success_message')}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[10px] font-bold cursor-pointer"
                    >
                      {'{סכום}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{link_kabala}', 'payment_success_message')}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[10px] font-bold cursor-pointer"
                    >
                      {'{link_kabala}'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {value.form_type === 'standard' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    נוסח הודעת WhatsApp לאחר פנייה מוצלחת
                  </label>
                  <textarea
                    rows={4}
                    value={value.standard_whatsapp_message || ''}
                    onChange={(e) => update({ standard_whatsapp_message: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="שלום {שם מלא}, תודה שפנית אלינו..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    קישור לתמונה מצורפת להודעת WhatsApp (אופציונלי)
                  </label>
                  <input
                    type="url"
                    value={value.standard_whatsapp_image_url || ''}
                    onChange={(e) => update({ standard_whatsapp_image_url: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="https://example.com/banner.png"
                    dir="ltr"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>הודעה בעת יצירת פנייה (ממתין לתשלום)</span>
                  </span>
                  <textarea
                    rows={3}
                    value={value.payment_pending_message || ''}
                    onChange={(e) => update({ payment_pending_message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="שלום {שם מלא}, ההזמנה שלך התקבלה וממתינה להשלמת התשלום..."
                  />
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>הודעה לאחר ביצוע תשלום מוצלח (כולל קבלה)</span>
                  </span>
                  <textarea
                    rows={3}
                    value={value.payment_success_message || ''}
                    onChange={(e) => update({ payment_success_message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="שלום {שם מלא}, התשלום בסך {סכום} ש״ח בוצע בהצלחה! קבלה: {link_kabala}"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab 5: Advanced Clearing & CRM Settings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'clearing' ? '' : 'clearing')}
          className="w-full p-3.5 flex justify-between items-center hover:bg-slate-800/60 text-white font-bold text-xs cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>הגדרות סליקה מתקדמות (Kesher Clearing)</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === 'clearing' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {activeTab === 'clearing' && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">סכום לתשלום ברירת מחדל (₪)</label>
                <input
                  type="number"
                  min={1}
                  value={value.payment_amount || 100}
                  onChange={(e) => update({ payment_amount: Number(e.target.value) || 100 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">סוג מסמך להפקה בקשר</label>
                <select
                  value={value.payment_receipt_type || '320'}
                  onChange={(e) => update({ payment_receipt_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="320">320 - חשבונית מס / קבלה</option>
                  <option value="400">400 - קבלה רגילה</option>
                  <option value="405">405 - קבלה על תרומה (סעיף 46)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">אפשרויות תשלום מותרות במסוף</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'one-time', label: 'תשלום חד-פעמי' },
                  { id: 'installments', label: 'תשלומים' },
                  { id: 'recurring', label: 'הוראת קבע' },
                  { id: 'bit', label: 'אפליקציית Bit' },
                ].map((opt) => {
                  const methods = value.payment_methods || ['one-time', 'installments', 'recurring', 'bit'];
                  const isChecked = methods.includes(opt.id);
                  return (
                    <label key={opt.id} className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...methods, opt.id]
                            : methods.filter((m) => m !== opt.id);
                          update({ payment_methods: next });
                        }}
                        className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">תדירות התשלום</label>
                <select
                  value={value.payment_frequency || 'one-time'}
                  onChange={(e) => update({ payment_frequency: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="one-time">תשלום חד פעמי</option>
                  <option value="recurring">הוראת קבע חודשית קבועה</option>
                  <option value="user-choice">תן ללקוח לבחור בטופס</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="require-id"
                  checked={value.payment_require_id || false}
                  onChange={(e) => update({ payment_require_id: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="require-id" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  דרוש מספר תעודת זהות (ת.ז) בעת החיוב בקשר
                </label>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">הודעת הצלחה על המסך לאחר שליחה</label>
                <input
                  type="text"
                  value={value.standard_success_message || ''}
                  onChange={(e) => update({ standard_success_message: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="הפנייה נשלחה בהצלחה!"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">כתובת להפניה חיצונית (Redirect URL - אופציונלי)</label>
                <input
                  type="url"
                  value={value.standard_redirect_url || ''}
                  onChange={(e) => update({ standard_redirect_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="https://example.com/thank-you"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
