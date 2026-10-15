import React, { useState, useEffect, useMemo } from 'react';
import {
  FormConfigContract,
  FormFieldContract,
  FormItemSummary,
  CrmMetadataContract,
  CrmFieldOption,
} from '../../../../core/contracts';
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
  Image as ImageIcon,
  AlignRight,
  AlignCenter,
  AlignLeft,
  X,
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

const WIDTH_OPTIONS = [
  { id: 100, label: '100% (שורה מלאה)' },
  { id: 75, label: '75%' },
  { id: 66, label: '66%' },
  { id: 50, label: '50% (חצי שורה)' },
  { id: 33, label: '33% (שליש שורה)' },
  { id: 25, label: '25% (רבע שורה)' },
];

const HEIGHT_OPTIONS = [
  { id: '', label: 'רגיל (Auto)' },
  { id: '30px', label: '30px (קטן מאוד)' },
  { id: '40px', label: '40px (קטן)' },
  { id: '50px', label: '50px (בינוני)' },
  { id: '60px', label: '60px (גדול)' },
  { id: '80px', label: '80px (ענק)' },
];

const FONT_SIZE_OPTIONS = [
  { id: '', label: 'רגיל' },
  { id: 10, label: '10px' },
  { id: 12, label: '12px' },
  { id: 14, label: '14px' },
  { id: 16, label: '16px' },
  { id: 18, label: '18px' },
  { id: 20, label: '20px' },
  { id: 24, label: '24px' },
  { id: 28, label: '28px' },
  { id: 32, label: '32px' },
  { id: 36, label: '36px' },
  { id: 42, label: '42px' },
  { id: 48, label: '48px' },
  { id: 54, label: '54px' },
  { id: 60, label: '60px' },
  { id: 68, label: '68px' },
  { id: 75, label: '75px' },
];

const FIELD_TYPES = [
  { id: 'text', label: 'טקסט חופשי' },
  { id: 'tel', label: 'טלפון נייד' },
  { id: 'email', label: 'כתובת אימייל' },
  { id: 'textarea', label: 'אזור טקסט ארוך' },
  { id: 'select', label: 'בחירה מרשימה (Dropdown)' },
  { id: 'number', label: 'מספר (סכום להזנה)' },
  { id: 'fixed_amount', label: 'סכום קבוע לתשלום' },
  { id: 'hidden', label: 'שדה מוסתר' },
  { id: 'calculated', label: 'שדה חישוב (נוסחה)' },
  { id: 'step', label: '--- חוצץ שלב חדש ---' },
  { id: 'payment_summary', label: 'שלב תשלום: סיכום ועריכת נתונים' },
  { id: 'payment_cc', label: 'שלב תשלום: נתוני אשראי ומסוף קשר' },
];

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'חפש שדה למיפוי...',
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; group?: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase())
  );
  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div className="relative w-full text-right" dir="rtl">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 text-white border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 outline-none cursor-pointer flex justify-between items-center text-xs transition"
      >
        <span className={value ? 'text-white font-medium' : 'text-slate-400'}>
          {selectedLabel || '-- ללא מיפוי --'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-white' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
          <div className="p-2 sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
            />
          </div>
          <div className="p-1">
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearch('');
              }}
              className="p-2 hover:bg-slate-800/80 rounded-lg cursor-pointer text-xs text-slate-400"
            >
              -- ללא מיפוי --
            </div>
            {filteredOptions.map((opt, i) => {
              const showGroup = i === 0 || filteredOptions[i - 1].group !== opt.group;
              return (
                <div key={`${opt.value}-${i}`}>
                  {showGroup && opt.group && (
                    <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-indigo-400/90 border-t border-slate-800/60 first:border-t-0">
                      {opt.group}
                    </div>
                  )}
                  <div
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`p-2 hover:bg-indigo-600/20 rounded-lg cursor-pointer text-xs transition ${
                      value === opt.value ? 'text-indigo-400 bg-indigo-500/15 font-bold' : 'text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </div>
                </div>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className="p-3 text-slate-500 text-xs text-center">לא נמצאו תוצאות לחיפוש</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const crmService = getCapability<CrmMetadataContract>('crm-service');

  const [activeTab, setActiveTab] = useState<string>('fields');
  const [expandedFieldIndex, setExpandedFieldIndex] = useState<number | null>(null);
  const [activeFieldTab, setActiveFieldTab] = useState<'settings' | 'design' | 'mapping' | 'advanced'>('settings');
  const [availableForms, setAvailableForms] = useState<FormItemSummary[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [crmMappingOptions, setCrmMappingOptions] = useState<CrmFieldOption[]>([]);
  const [showAddCustomFieldModal, setShowAddCustomFieldModal] = useState(false);
  const [newCustomFieldLabel, setNewCustomFieldLabel] = useState('');
  const [newCustomFieldType, setNewCustomFieldType] = useState('text');
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const [fieldForCustomMap, setFieldForCustomMap] = useState<{ index: number; target: 'map_to' | 'map_to_2' } | null>(null);

  useEffect(() => {
    const loadCrmFields = async () => {
      if (crmService?.getMappingFields) {
        try {
          const fields = await crmService.getMappingFields();
          if (fields && fields.length > 0) {
            setCrmMappingOptions(fields);
            return;
          }
        } catch (err) {
          console.warn('[ContactFormConfigEditor] Could not load CRM fields via contract:', err);
        }
      }
      // Fallback core fields
      const fallback: CrmFieldOption[] = Object.entries(CRM_DB_FIELDS)
        .filter(([k]) => k !== '')
        .map(([value, label]) => ({ value, label, group: 'שדות מערכת' }));
      setCrmMappingOptions(fallback);
    };

    loadCrmFields();
  }, [crmService]);

  const mappingOptions = useMemo(() => {
    const opts: { value: string; label: string; group?: string }[] = [...crmMappingOptions];
    opts.push({ value: '__other__', label: 'אחר (הוסף שדה מותאם אישית ב-CRM)...', group: 'פעולות' });
    return opts;
  }, [crmMappingOptions]);

  const handleAddCustomField = async () => {
    if (!newCustomFieldLabel.trim()) {
      alert('נא להזין שם שדה');
      return;
    }
    if (!crmService?.createCustomField) {
      alert('שירות ה-CRM אינו תומך ביצירת שדות מותאמים אישית כרגע');
      return;
    }

    setIsAddingCustomField(true);
    try {
      const res = await crmService.createCustomField({
        label: newCustomFieldLabel.trim(),
        type: newCustomFieldType,
      });

      if (res.success && res.field) {
        setCrmMappingOptions((prev) => [...prev, res.field!]);
        if (fieldForCustomMap) {
          handleFieldChange(fieldForCustomMap.index, { [fieldForCustomMap.target]: res.field.value });
        }
        setShowAddCustomFieldModal(false);
        setNewCustomFieldLabel('');
        setFieldForCustomMap(null);
      } else {
        alert('שגיאה ביצירת השדה: ' + (res.error || 'נא לנסות שוב'));
      }
    } catch (e: any) {
      alert('שגיאה ביצירת השדה: ' + (e?.message || e));
    } finally {
      setIsAddingCustomField(false);
    }
  };

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
                  {f.title} ({f.submissionsCount || 0} הגשות) {f.hasPaymentStep ? 'כולל סליקה' : ''}
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
                      <div className="border-t border-slate-800 bg-slate-950/90 rounded-b-xl text-xs relative overflow-visible">
                        {/* Field Tabs Bar */}
                        <div className="flex bg-slate-950 border-b border-slate-800 overflow-x-auto custom-scrollbar select-none">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFieldTab('settings');
                            }}
                            className={`px-4 py-2.5 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              activeFieldTab === 'settings'
                                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            הגדרות השדה
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFieldTab('design');
                            }}
                            className={`px-4 py-2.5 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              activeFieldTab === 'design'
                                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            עיצוב
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFieldTab('mapping');
                            }}
                            className={`px-4 py-2.5 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              activeFieldTab === 'mapping'
                                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            הגדרות מיפוי
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFieldTab('advanced');
                            }}
                            className={`px-4 py-2.5 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              activeFieldTab === 'advanced'
                                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            הגדרות מתקדמות
                          </button>
                        </div>

                        <div className="p-4 space-y-4">
                          {/* TAB 1: SETTINGS */}
                          {activeFieldTab === 'settings' && (
                            <div className="flex flex-col gap-3 animate-in fade-in">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block font-semibold mb-1 text-slate-400 text-[11px]">תווית השדה (Label) *</label>
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => handleFieldChange(idx, { label: e.target.value })}
                                    className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                                    placeholder="שם השדה לתצוגה"
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1 text-slate-400 text-[11px]">סוג פריט</label>
                                  <select
                                    value={field.type}
                                    onChange={(e) => handleFieldChange(idx, { type: e.target.value })}
                                    className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                                  >
                                    {FIELD_TYPES.map((t) => (
                                      <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {field.type === 'step' ? (
                                <div className="space-y-4 pt-3 border-t border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <input
                                      id={`field-submit-next-${idx}`}
                                      type="checkbox"
                                      checked={field.submitOnNext || false}
                                      onChange={(e) => handleFieldChange(idx, { submitOnNext: e.target.checked })}
                                      className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-800 cursor-pointer"
                                    />
                                    <label htmlFor={`field-submit-next-${idx}`} className="font-bold text-white cursor-pointer text-xs">
                                      הכפתור גם מעביר לשלב הבא וגם שומר את הנתונים הנוכחיים לדאטה-בייס?
                                    </label>
                                  </div>

                                  <h5 className="font-bold text-amber-400 mb-1 mt-2 border-t border-slate-800/80 pt-3 text-xs">
                                    עיצוב כותרת השלב
                                  </h5>
                                  <div className="flex flex-col gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                                    <div>
                                      <label className="block font-semibold mb-1.5 text-slate-400 text-[10px]">יישור כותרת (Title Alignment)</label>
                                      <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 w-fit">
                                        <button
                                          type="button"
                                          onClick={() => handleFieldChange(idx, { textAlign: 'right' })}
                                          className={`p-1.5 rounded-lg transition-colors ${(!field.textAlign || field.textAlign === 'right') ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                          title="יישור לימין"
                                        >
                                          <AlignRight className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleFieldChange(idx, { textAlign: 'center' })}
                                          className={`p-1.5 rounded-lg transition-colors ${field.textAlign === 'center' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                          title="מרכוז"
                                        >
                                          <AlignCenter className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleFieldChange(idx, { textAlign: 'left' })}
                                          className={`p-1.5 rounded-lg transition-colors ${field.textAlign === 'left' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                          title="יישור לשמאל"
                                        >
                                          <AlignLeft className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[10px]">צבע כותרת</label>
                                      <div className="flex gap-2 items-center">
                                        <input
                                          type="color"
                                          value={field.textColor || '#ffffff'}
                                          onChange={(e) => handleFieldChange(idx, { textColor: e.target.value })}
                                          className="w-7 h-7 rounded cursor-pointer border border-slate-700 bg-transparent block"
                                        />
                                        <span className="font-mono text-white text-xs">{field.textColor || '#ffffff'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <h5 className="font-bold text-amber-400 mb-1 mt-2 border-t border-slate-800/80 pt-3 text-xs">
                                    הגדרות כפתור 'המשך' לשלב הבא
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[10px]">טקסט כפתור 'המשך'</label>
                                      <input
                                        type="text"
                                        value={field.step_button_text || ''}
                                        onChange={(e) => handleFieldChange(idx, { step_button_text: e.target.value })}
                                        className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                                        placeholder="לדוגמה: המשך לשלב הבא"
                                      />
                                    </div>
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[10px]">טקסט כפתור 'חזור' (לשלב הקודם)</label>
                                      <input
                                        type="text"
                                        value={field.step_back_button_text || ''}
                                        onChange={(e) => handleFieldChange(idx, { step_back_button_text: e.target.value })}
                                        className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                                        placeholder="לדוגמה: חזור"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[10px]">רקע 'המשך'</label>
                                      <div className="flex gap-1.5 items-center bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                                        <input
                                          type="color"
                                          value={field.step_button_bg_color || '#4f46e5'}
                                          onChange={(e) => handleFieldChange(idx, { step_button_bg_color: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                        />
                                        <span className="font-mono text-white text-[10px] truncate">{field.step_button_bg_color || '#4f46e5'}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[10px]">טקסט 'המשך'</label>
                                      <div className="flex gap-1.5 items-center bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                                        <input
                                          type="color"
                                          value={field.step_button_text_color || '#ffffff'}
                                          onChange={(e) => handleFieldChange(idx, { step_button_text_color: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                        />
                                        <span className="font-mono text-white text-[10px] truncate">{field.step_button_text_color || '#ffffff'}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[10px]">רקע 'חזור'</label>
                                      <div className="flex gap-1.5 items-center bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                                        <input
                                          type="color"
                                          value={field.step_back_button_bg_color || '#1e293b'}
                                          onChange={(e) => handleFieldChange(idx, { step_back_button_bg_color: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                        />
                                        <span className="font-mono text-white text-[10px] truncate">{field.step_back_button_bg_color || '#1e293b'}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[10px]">טקסט 'חזור'</label>
                                      <div className="flex gap-1.5 items-center bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                                        <input
                                          type="color"
                                          value={field.step_back_button_text_color || '#cbd5e1'}
                                          onChange={(e) => handleFieldChange(idx, { step_back_button_text_color: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                        />
                                        <span className="font-mono text-white text-[10px] truncate">{field.step_back_button_text_color || '#cbd5e1'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {field.type === 'select' && (
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[11px]">אפשרויות לבחירה (כל אפשרות בשורה חדשה)</label>
                                      <textarea
                                        value={field.options || ''}
                                        onChange={(e) => handleFieldChange(idx, { options: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2.5 text-xs outline-none resize-none font-mono focus:border-indigo-500"
                                        placeholder="אפשרות א'&#10;אפשרות ב'&#10;אפשרות ג'"
                                      />
                                    </div>
                                  )}

                                  {['hidden', 'fixed_amount'].includes(field.type) ? (
                                    <div>
                                      <label className="block font-semibold mb-1 text-slate-400 text-[11px]">ערך קבוע / ברירת מחדל</label>
                                      <input
                                        type="text"
                                        value={field.default_value || ''}
                                        onChange={(e) => handleFieldChange(idx, { default_value: e.target.value })}
                                        className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                                        placeholder="הזן ערך מוגדר מראש"
                                      />
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block font-semibold mb-1 text-slate-400 text-[11px]">ערך ברירת מחדל</label>
                                        <input
                                          type="text"
                                          value={field.default_value || ''}
                                          onChange={(e) => handleFieldChange(idx, { default_value: e.target.value })}
                                          className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                                          placeholder="הזן ערך התחלתי..."
                                        />
                                      </div>
                                      <div>
                                        <label className="block font-semibold mb-1 text-slate-400 text-[11px]">טקסט שומר מקום (Placeholder)</label>
                                        <input
                                          type="text"
                                          value={field.placeholder || ''}
                                          onChange={(e) => handleFieldChange(idx, { placeholder: e.target.value })}
                                          className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                                          placeholder="הזן טקסט שומר מקום..."
                                        />
                                      </div>
                                      <div>
                                        <label className="block font-semibold mb-1 text-slate-400 text-[11px]">מילוי אוטומטי (דפדפן)</label>
                                        <select
                                          value={field.autocomplete || ''}
                                          onChange={(e) => handleFieldChange(idx, { autocomplete: e.target.value })}
                                          className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                                        >
                                          <option value="">ללא (כבוי)</option>
                                          <option value="name">שם מלא</option>
                                          <option value="given-name">שם פרטי</option>
                                          <option value="family-name">שם משפחה</option>
                                          <option value="tel">טלפון נייד</option>
                                          <option value="email">אימייל</option>
                                          <option value="organization">חברה/ארגון</option>
                                          <option value="street-address">כתובת</option>
                                          <option value="bday">תאריך לידה</option>
                                        </select>
                                      </div>
                                    </div>
                                  )}

                                  {field.type === 'calculated' && (
                                    <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30">
                                      <label className="block font-semibold mb-1 text-amber-300 text-xs">נוסחת חישוב חשבונית</label>
                                      <p className="text-amber-400/90 mb-2 text-[11px]">
                                        כתוב נוסחה חשבונית (כפל <code>*</code>, חילוק <code>/</code>, חיבור <code>+</code>, חיסור <code>-</code>).<br />
                                        כדי להשתמש בערך של שדה אחר, הקלד את שם השדה בתוך סוגריים מרובעים. לדוגמה: <code>[כמות משתתפים] * 50 + 10</code>
                                      </p>
                                      <input
                                        type="text"
                                        value={field.calc_formula || ''}
                                        onChange={(e) => handleFieldChange(idx, { calc_formula: e.target.value })}
                                        className="w-full bg-slate-950 text-white border border-amber-500/40 rounded-xl p-2.5 text-xs outline-none font-mono text-left focus:border-amber-400"
                                        placeholder="e.g. [amount] * 0.17"
                                        dir="ltr"
                                      />
                                    </div>
                                  )}

                                  {field.type === 'payment_summary' && (
                                    <div className="space-y-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                      <span className="text-xs font-bold text-amber-300 block">הגדרות סליקה עבור שלב זה</span>
                                      <div>
                                        <label className="block font-semibold mb-1 text-slate-400 text-[10px]">סוג מסמך להפקה בקשר (Kesher)</label>
                                        <select
                                          value={field.payment_doc_type || '320'}
                                          onChange={(e) => handleFieldChange(idx, { payment_doc_type: e.target.value })}
                                          className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none"
                                        >
                                          <option value="320">חשבונית מס/קבלה (320)</option>
                                          <option value="400">קבלה (400)</option>
                                          <option value="405">קבלה על תרומה (405)</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block font-semibold mb-1 text-slate-400 text-[10px]">אפשרויות תשלום מותרות</label>
                                        <div className="flex flex-wrap gap-3 mt-1">
                                          {['one-time', 'installments', 'recurring', 'bit'].map((method) => {
                                            const labels: Record<string, string> = {
                                              'one-time': 'חד פעמי',
                                              installments: 'תשלומים',
                                              recurring: 'הוראת קבע',
                                              bit: 'אפליקציית Bit',
                                            };
                                            const methods = field.payment_methods || ['one-time'];
                                            return (
                                              <label key={method} className="flex items-center gap-1.5 text-white font-bold cursor-pointer text-xs">
                                                <input
                                                  type="checkbox"
                                                  checked={methods.includes(method)}
                                                  onChange={(e) => {
                                                    const newMethods = e.target.checked
                                                      ? [...methods, method]
                                                      : methods.filter((m) => m !== method);
                                                    handleFieldChange(idx, { payment_methods: newMethods });
                                                  }}
                                                  className="w-4 h-4 text-amber-500 rounded bg-slate-800 cursor-pointer"
                                                />
                                                {labels[method]}
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      {(field.payment_methods || []).includes('recurring') && (
                                        <div>
                                          <label className="block font-semibold mb-1 text-slate-400 text-[10px]">כמות חיובים (הוראת קבע)</label>
                                          <select
                                            value={field.payment_recurring_limit || 'user-choice'}
                                            onChange={(e) => handleFieldChange(idx, { payment_recurring_limit: e.target.value })}
                                            className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none"
                                          >
                                            <option value="user-choice">תן ללקוח לבחור בטופס</option>
                                            <option value="unlimited">ללא הגבלה בלבד (עד ביטול)</option>
                                            <option value="12">קבוע ל-12 חודשים (שנה)</option>
                                            <option value="24">קבוע ל-24 חודשים (שנתיים)</option>
                                          </select>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {field.type === 'payment_cc' && (
                                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          id={`field-req-id-${idx}`}
                                          type="checkbox"
                                          checked={field.payment_require_id || false}
                                          onChange={(e) => handleFieldChange(idx, { payment_require_id: e.target.checked })}
                                          className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-800 cursor-pointer"
                                        />
                                        <label htmlFor={`field-req-id-${idx}`} className="font-bold text-white cursor-pointer text-xs">
                                          דרוש להזין תעודת זהות (ת.ז) בעת החיוב בקשר?
                                        </label>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {/* TAB 2: DESIGN */}
                          {activeFieldTab === 'design' && (
                            <div className="flex flex-col gap-4 animate-in fade-in">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block font-semibold mb-1 text-slate-400 text-[10px]">רוחב השדה בשורה</label>
                                  <select
                                    value={field.widthPercentage || 100}
                                    onChange={(e) => handleFieldChange(idx, { widthPercentage: Number(e.target.value) })}
                                    className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                                  >
                                    {WIDTH_OPTIONS.map((w) => (
                                      <option key={w.id} value={w.id}>{w.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1 text-slate-400 text-[10px]">גובה השדה</label>
                                  <select
                                    value={field.height || ''}
                                    onChange={(e) => handleFieldChange(idx, { height: e.target.value })}
                                    className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500 font-mono"
                                    dir="ltr"
                                  >
                                    {HEIGHT_OPTIONS.map((h) => (
                                      <option key={h.id} value={h.id}>{h.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1 text-slate-400 text-[10px]">גודל גופן</label>
                                  <select
                                    value={field.fontSize || ''}
                                    onChange={(e) => handleFieldChange(idx, { fontSize: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-indigo-500 font-mono"
                                    dir="ltr"
                                  >
                                    {FONT_SIZE_OPTIONS.map((f) => (
                                      <option key={f.id} value={f.id}>{f.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="border-t border-slate-800 pt-3">
                                <label className="block font-semibold mb-1.5 text-slate-400 text-xs">יישור טקסט (לכותרות ושדות)</label>
                                <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 w-fit">
                                  <button
                                    type="button"
                                    onClick={() => handleFieldChange(idx, { textAlign: 'right' })}
                                    className={`p-2 rounded-lg transition-colors ${(!field.textAlign || field.textAlign === 'right') ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                    title="יישור לימין"
                                  >
                                    <AlignRight className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFieldChange(idx, { textAlign: 'center' })}
                                    className={`p-2 rounded-lg transition-colors ${field.textAlign === 'center' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                    title="מרכוז"
                                  >
                                    <AlignCenter className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFieldChange(idx, { textAlign: 'left' })}
                                    className={`p-2 rounded-lg transition-colors ${field.textAlign === 'left' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                    title="יישור לשמאל"
                                  >
                                    <AlignLeft className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-slate-800 pt-3">
                                <div>
                                  <label className="block font-semibold mb-1.5 text-slate-400 text-[10px]">צבע גופן</label>
                                  <div className="flex flex-col items-center gap-1">
                                    <input
                                      type="color"
                                      value={field.textColor || '#ffffff'}
                                      onChange={(e) => handleFieldChange(idx, { textColor: e.target.value })}
                                      className="w-8 h-8 rounded cursor-pointer border border-slate-700 p-0 block bg-transparent"
                                    />
                                    <span className="font-mono text-slate-300 text-[10px]">{field.textColor || '#ffffff'}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1.5 text-slate-400 text-[10px]">צבע רקע</label>
                                  <div className="flex flex-col items-center gap-1">
                                    <input
                                      type="color"
                                      value={field.bgColor || '#0f172a'}
                                      onChange={(e) => handleFieldChange(idx, { bgColor: e.target.value })}
                                      className="w-8 h-8 rounded cursor-pointer border border-slate-700 p-0 block bg-transparent"
                                    />
                                    <span className="font-mono text-slate-300 text-[10px]">{field.bgColor || '#0f172a'}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1.5 text-slate-400 text-[10px]">צבע מסגרת</label>
                                  <div className="flex flex-col items-center gap-1">
                                    <input
                                      type="color"
                                      value={field.borderColor || '#334155'}
                                      onChange={(e) => handleFieldChange(idx, { borderColor: e.target.value })}
                                      className="w-8 h-8 rounded cursor-pointer border border-slate-700 p-0 block bg-transparent"
                                    />
                                    <span className="font-mono text-slate-300 text-[10px]">{field.borderColor || '#334155'}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1.5 text-slate-400 text-[10px]">צבע פוקוס</label>
                                  <div className="flex flex-col items-center gap-1">
                                    <input
                                      type="color"
                                      value={field.focusColor || '#4f46e5'}
                                      onChange={(e) => handleFieldChange(idx, { focusColor: e.target.value })}
                                      className="w-8 h-8 rounded cursor-pointer border border-slate-700 p-0 block bg-transparent"
                                    />
                                    <span className="font-mono text-slate-300 text-[10px]">{field.focusColor || '#4f46e5'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 3: MAPPING */}
                          {activeFieldTab === 'mapping' && (
                            <div className="flex flex-col gap-4 animate-in fade-in">
                              <div className="relative z-20">
                                <label className="block font-semibold mb-1 text-slate-400 text-xs">מיפוי לשדה CRM</label>
                                <SearchableSelect
                                  value={field.map_to || ''}
                                  onChange={(val) => {
                                    if (val === '__other__') {
                                      setFieldForCustomMap({ index: idx, target: 'map_to' });
                                      setShowAddCustomFieldModal(true);
                                    } else {
                                      handleFieldChange(idx, { map_to: val });
                                    }
                                  }}
                                  options={mappingOptions}
                                />
                              </div>

                              <div className="border-t border-slate-800 pt-3 relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    id={`field-map-2-${idx}`}
                                    type="checkbox"
                                    checked={!!field.map_to_2}
                                    onChange={(e) => handleFieldChange(idx, { map_to_2: e.target.checked ? 'notes' : undefined })}
                                    className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-800 cursor-pointer"
                                  />
                                  <label htmlFor={`field-map-2-${idx}`} className="font-bold text-white cursor-pointer text-xs">
                                    מפה לשדה נוסף ב-CRM (מיפוי כפול)
                                  </label>
                                </div>
                                {field.map_to_2 !== undefined && (
                                  <div className="mt-1">
                                    <SearchableSelect
                                      value={field.map_to_2}
                                      onChange={(val) => {
                                        if (val === '__other__') {
                                          setFieldForCustomMap({ index: idx, target: 'map_to_2' });
                                          setShowAddCustomFieldModal(true);
                                        } else {
                                          handleFieldChange(idx, { map_to_2: val });
                                        }
                                      }}
                                      options={mappingOptions}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* TAB 4: ADVANCED */}
                          {activeFieldTab === 'advanced' && (
                            <div className="flex flex-col gap-4 animate-in fade-in">
                              <div className="flex items-center gap-2 pb-2">
                                <input
                                  id={`field-required-${idx}`}
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => handleFieldChange(idx, { required: e.target.checked })}
                                  className="w-4 h-4 text-indigo-500 rounded border-slate-700 bg-slate-800 cursor-pointer"
                                />
                                <label htmlFor={`field-required-${idx}`} className="font-bold text-white cursor-pointer text-xs">
                                  שדה חובה למילוי?
                                </label>
                              </div>

                              {/* URL Parameters */}
                              <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    id={`field-url-${idx}`}
                                    type="checkbox"
                                    checked={field.url_param_enable || false}
                                    onChange={(e) => handleFieldChange(idx, { url_param_enable: e.target.checked })}
                                    className="w-4 h-4 text-indigo-500 rounded border-slate-700 bg-slate-800 cursor-pointer"
                                  />
                                  <label htmlFor={`field-url-${idx}`} className="font-bold text-white cursor-pointer text-xs">
                                    משיכת ערך מפרמטר בכתובת URL?
                                  </label>
                                </div>
                                {field.url_param_enable && (
                                  <div className="flex items-center gap-2 pr-6">
                                    <span className="text-slate-400 text-xs">שם הפרמטר ב-URL:</span>
                                    <input
                                      type="text"
                                      value={field.url_param_name || ''}
                                      onChange={(e) => handleFieldChange(idx, { url_param_name: e.target.value })}
                                      className="bg-slate-900 text-white border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs outline-none w-40 focus:border-indigo-500 font-mono"
                                      placeholder="e.g. utm_source"
                                      dir="ltr"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Conditional Logic */}
                              <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    id={`field-cond-${idx}`}
                                    type="checkbox"
                                    checked={field.cond_enable || false}
                                    onChange={(e) => handleFieldChange(idx, { cond_enable: e.target.checked })}
                                    className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-800 cursor-pointer"
                                  />
                                  <label htmlFor={`field-cond-${idx}`} className="font-bold text-white cursor-pointer text-xs">
                                    הפעל לוגיקה תנאית (Conditional Logic)?
                                  </label>
                                </div>

                                {field.cond_enable && (
                                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex flex-wrap gap-2 items-center mt-1 text-xs">
                                    <span className="text-white">הצג שדה זה רק אם שדה:</span>
                                    <select
                                      value={field.cond_field_index ?? ''}
                                      onChange={(e) => handleFieldChange(idx, { cond_field_index: parseInt(e.target.value) })}
                                      className="bg-slate-900 text-white border border-slate-800 rounded-xl p-1.5 outline-none min-w-[120px]"
                                    >
                                      <option value="">בחר שדה...</option>
                                      {(value.fields || [])
                                        .map((f, fIdx) => ({ label: f.label || `שדה ${fIdx + 1}`, index: fIdx }))
                                        .filter((f) => f.index !== idx)
                                        .map((f) => (
                                          <option key={f.index} value={f.index}>{f.label}</option>
                                        ))}
                                    </select>
                                    <select
                                      value={field.cond_operator || 'is'}
                                      onChange={(e) => handleFieldChange(idx, { cond_operator: e.target.value })}
                                      className="bg-slate-900 text-white border border-slate-800 rounded-xl p-1.5 outline-none"
                                    >
                                      <option value="is">שווה ל-</option>
                                      <option value="is_not">שונה מ-</option>
                                    </select>
                                    <input
                                      type="text"
                                      value={field.cond_value || ''}
                                      onChange={(e) => handleFieldChange(idx, { cond_value: e.target.value })}
                                      className="bg-slate-900 text-white border border-slate-800 rounded-xl p-1.5 outline-none w-32 focus:border-indigo-500"
                                      placeholder="ערך התנאי..."
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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

      {/* Modal: Add Custom CRM Field */}
      {showAddCustomFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>הוספת שדה מותאם אישית חדש ב-CRM</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomFieldModal(false);
                  setNewCustomFieldLabel('');
                  setFieldForCustomMap(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">שם השדה (תווית)</label>
                <input
                  type="text"
                  autoFocus
                  value={newCustomFieldLabel}
                  onChange={(e) => setNewCustomFieldLabel(e.target.value)}
                  placeholder="לדוגמה: מקצוע / תקציב / מקור הגעה"
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">סוג השדה ב-CRM</label>
                <select
                  value={newCustomFieldType}
                  onChange={(e) => setNewCustomFieldType(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="text">טקסט (רגיל)</option>
                  <option value="number">מספר</option>
                  <option value="date">תאריך</option>
                  <option value="select">בחירה מרשימה</option>
                  <option value="boolean">תיבת סימון (כן/לא)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomFieldModal(false);
                  setNewCustomFieldLabel('');
                  setFieldForCustomMap(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleAddCustomField}
                disabled={isAddingCustomField || !newCustomFieldLabel.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs text-white font-bold cursor-pointer flex items-center gap-1.5"
              >
                {isAddingCustomField ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>יוצר שדה...</span>
                  </>
                ) : (
                  <span>שמור שדה ב-CRM</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
