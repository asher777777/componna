import React, { useState } from 'react';
import {
  FormStep,
  FieldType,
  FieldOption,
  TicketTier,
  CouponDefinition,
  ConditionOperator,
  StepConditionRule,
} from '../../types';
import { TenantStylePreset } from '../../../../core/contracts';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { IconPickerModal } from '../shared/IconPickerModal';
import {
  Plus,
  Trash2,
  Settings,
  Sparkles,
  HelpCircle,
  CheckSquare,
  Type,
  Mail,
  Phone,
  Hash,
  Star,
  Sliders,
  Calendar,
  Clock,
  Upload,
  Ticket,
  Tag,
  CreditCard,
  Coins,
  Calculator,
  GitBranch,
  EyeOff,
} from 'lucide-react';

export interface StepFieldConfigProps {
  step: FormStep;
  allSteps?: FormStep[];
  stylePreset?: TenantStylePreset;
  onChange: (updatedStep: FormStep) => void;
  onDelete?: () => void;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'טקסט קצר', icon: Type },
  { type: 'textarea', label: 'טקסט ארוך / פירוט', icon: Type },
  { type: 'email', label: 'דואר אלקטרוני', icon: Mail },
  { type: 'phone', label: 'מספר טלפון', icon: Phone },
  { type: 'number', label: 'מספר / כמות', icon: Hash },
  { type: 'price', label: 'שדה מחיר (₪)', icon: Coins },
  { type: 'calculated', label: 'שדה חישוב', icon: Calculator },
  { type: 'hidden', label: 'שדה נסתר', icon: EyeOff },
  { type: 'single_choice', label: 'בחירה יחידה (כרטיסיות יוקרה)', icon: Sparkles },
  { type: 'multi_choice', label: 'בחירה מרובה (צ\'קבוקס)', icon: CheckSquare },
  { type: 'rating', label: 'דירוג כוכבי יוקרה', icon: Star },
  { type: 'scale', label: 'סולם 1-10', icon: Sliders },
  { type: 'date', label: 'תאריך', icon: Calendar },
  { type: 'time', label: 'שעה', icon: Clock },
  { type: 'file_upload', label: 'העלאת קובץ / מסמך', icon: Upload },
  { type: 'ticket_booking', label: 'הזמנת כרטיסים', icon: Ticket },
  { type: 'coupon_code', label: 'קוד קופון והנחה', icon: Tag },
  { type: 'payment', label: 'סליקה ותשלום', icon: CreditCard },
];

export const StepFieldConfig: React.FC<StepFieldConfigProps> = ({
  step,
  allSteps = [],
  stylePreset,
  onChange,
  onDelete,
}) => {
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [activeOptionIndexForIcon, setActiveOptionIndexForIcon] = useState<number | null>(null);

  const updateField = (key: keyof FormStep, value: any) => {
    onChange({ ...step, [key]: value });
  };

  const handleAddOption = () => {
    const currentOptions = step.options || [];
    const newOpt: FieldOption = {
      id: `opt_${Date.now()}`,
      label: `אפשרות ${currentOptions.length + 1}`,
      value: `option_${currentOptions.length + 1}`,
      iconName: 'Sparkles',
    };
    updateField('options', [...currentOptions, newOpt]);
  };

  const handleUpdateOption = (index: number, updated: Partial<FieldOption>) => {
    const currentOptions = [...(step.options || [])];
    currentOptions[index] = { ...currentOptions[index], ...updated };
    updateField('options', currentOptions);
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = [...(step.options || [])];
    currentOptions.splice(index, 1);
    updateField('options', currentOptions);
  };

  const isChoiceType = step.fieldType === 'single_choice' || step.fieldType === 'multi_choice';

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
      {/* Top Header & Type Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsIconPickerOpen(true)}
            className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5"
            title="החלף אייקון יוקרה"
          >
            <LuxuryIconRenderer iconName={step.iconName} className="w-5 h-5" />
            <span className="text-[11px] font-bold">שנה אייקון</span>
          </button>

          <span className="text-xs font-bold text-slate-400">
            שלב #{step.order}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <input
              type="checkbox"
              checked={step.required}
              onChange={(e) => updateField('required', e.target.checked)}
              className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <span>שדה חובה</span>
          </label>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              title="מחק שלב זה"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Field Type Selection Grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
          סוג השדה:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {FIELD_TYPES.map((ft) => {
            const isSelected = step.fieldType === ft.type;
            const IconCmp = ft.icon;
            return (
              <button
                key={ft.type}
                type="button"
                onClick={() => {
                  updateField('fieldType', ft.type);
                  if (
                    (ft.type === 'single_choice' || ft.type === 'multi_choice') &&
                    (!step.options || step.options.length === 0)
                  ) {
                    updateField('options', [
                      { id: 'opt_1', label: 'אפשרות א׳', value: 'opt_1', iconName: 'Crown' },
                      { id: 'opt_2', label: 'אפשרות ב׳', value: 'opt_2', iconName: 'Gem' },
                    ]);
                  }
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 text-[11px] ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-1 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <IconCmp className="w-4 h-4" />
                <span className="truncate w-full">{ft.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Title & Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            כותרת השאלה (שדה המילוי):
          </label>
          <input
            type="text"
            value={step.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="לדוגמה: מהו שמך המלא?"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            כותרת משנה / הנחיה תומכת:
          </label>
          <input
            type="text"
            value={step.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="לדוגמה: נשמח להכיר את מי שמוביל את המהלך"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Mapping Key & Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>מפתח נתונים וסנכרון CRM (mappingKey):</span>
            <span className="text-[10px] text-slate-400 font-mono">(kosun_crm_name / kosun_crm_email / kosun_crm_phone וכו')</span>
          </label>
          <input
            type="text"
            value={step.mappingKey || ''}
            onChange={(e) => updateField('mappingKey', e.target.value)}
            placeholder="kosun_crm_name, kosun_crm_phone, kosun_crm_email, kosun_crm_notes"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            טקסט עזר / Placeholder בשדה:
          </label>
          <input
            type="text"
            value={step.placeholder || ''}
            onChange={(e) => updateField('placeholder', e.target.value)}
            placeholder="לדוגמה: הקלד כאן..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Options Editor for Choice Fields */}
      {isChoiceType && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              אפשרויות בחירה (כרטיסיות עם אייקונים ללא אימוג'י):
            </label>
            <button
              type="button"
              onClick={handleAddOption}
              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוסף אפשרות</span>
            </button>
          </div>

          <div className="space-y-2">
            {(step.options || []).map((opt, idx) => (
              <div
                key={opt.id || idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap sm:flex-nowrap items-center gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveOptionIndexForIcon(idx);
                    setIsIconPickerOpen(true);
                  }}
                  className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-amber-500 hover:scale-105 transition-transform"
                  title="שנה אייקון לאפשרות"
                >
                  <LuxuryIconRenderer iconName={opt.iconName || 'Sparkles'} className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleUpdateOption(idx, { label: e.target.value })}
                  placeholder="כותרת האפשרות"
                  className="flex-1 min-w-[120px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white"
                />

                <input
                  type="text"
                  dir="ltr"
                  value={opt.value}
                  onChange={(e) => handleUpdateOption(idx, { value: e.target.value })}
                  placeholder="ערך הבחירה (למשל: 100 / vip)"
                  title="ערך הבחירה (ישמש לחישובים, תנאים לוגיים וקביעת מחיר/אופן תשלום)"
                  className="w-32 sm:w-36 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-xs font-mono text-left text-indigo-700 dark:text-indigo-300"
                />

                <input
                  type="text"
                  value={opt.description || ''}
                  onChange={(e) => handleUpdateOption(idx, { description: e.target.value })}
                  placeholder="הסבר קצר (אופציונלי)"
                  className="flex-1 min-w-[120px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteOption(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Field Config */}
      {step.fieldType === 'price' && (() => {
        const otherSteps = allSteps.filter((s) => s.id !== step.id);
        const priceSource = step.priceSource || 'default';
        const isEditable = step.priceEditable !== false;

        return (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-xs" dir="rtl">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>הגדרות שדה מחיר (₪)</span>
            </div>

            {/* Source: Default amount vs Derived from another field */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateField('priceSource', 'default')}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${
                  priceSource === 'default'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                מסכום ברירת מחדל
              </button>
              <button
                type="button"
                onClick={() => updateField('priceSource', 'field')}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${
                  priceSource === 'field'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                נגזר משדה בטופס
              </button>
            </div>

            {priceSource === 'default' ? (
              <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  סכום ברירת מחדל (₪):
                </label>
                <input
                  type="number"
                  min={0}
                  value={step.defaultValue ?? 0}
                  onChange={(e) => updateField('defaultValue', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-28 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                  dir="ltr"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                    בחר שדה שממנו נגזר המחיר:
                  </label>
                  <select
                    value={step.priceSourceFieldKey || ''}
                    onChange={(e) => updateField('priceSourceFieldKey', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  >
                    <option value="">-- בחר שדה מהטופס --</option>
                    {otherSteps.map((s) => {
                      const key = s.mappingKey || s.id;
                      return (
                        <option key={s.id} value={key}>
                          שלב #{s.order}: {s.title} ({s.fieldType})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                    סכום ברירת מחדל (אם השדה ריק):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={step.defaultValue ?? 0}
                    onChange={(e) => updateField('defaultValue', e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Fixed vs User-Editable choice — available for BOTH default and field-derived */}
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                אפשרות עריכה למשתמש:
              </span>
              <button
                type="button"
                onClick={() => updateField('priceEditable', false)}
                className={`px-3 py-1 rounded-lg border font-bold transition-colors ${
                  !isEditable
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                סכום קבוע (לקריאה בלבד)
              </button>
              <button
                type="button"
                onClick={() => updateField('priceEditable', true)}
                className={`px-3 py-1 rounded-lg border font-bold transition-colors ${
                  isEditable
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                ניתן לשינוי ע&quot;י המשתמש
              </button>
            </div>
          </div>
        );
      })()}

      {/* Hidden Field Config */}
      {step.fieldType === 'hidden' && (() => {
        const otherSteps = allSteps.filter((s) => s.id !== step.id);
        const currentVal = step.defaultValue !== undefined && step.defaultValue !== null ? String(step.defaultValue) : '';
        const insertToken = (token: string) => {
          updateField('defaultValue', currentVal ? `${currentVal}${token}` : token);
        };

        return (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-xs" dir="rtl">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
              <EyeOff className="w-4 h-4 text-slate-500" />
              <span>הגדרות שדה נסתר (נשמר אוטומטית ללא תצוגה למשתמש)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                  הוסף שדה דינמי או שדה מהטופס:
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) insertToken(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                >
                  <option value="">-- בחר שדה דינמי להוספה --</option>
                  <optgroup label="משתני מערכת וכתובת">
                    <option value="{tenantId}">מזהה טננט / עסק ({'{tenantId}'})</option>
                    <option value="{formId}">מזהה טופס ({'{formId}'})</option>
                    <option value="{formTitle}">שם הטופס ({'{formTitle}'})</option>
                    <option value="{url}">כתובת URL מלאה ({'{url}'})</option>
                    <option value="{pathname}">נתיב עמוד ({'{pathname}'})</option>
                    <option value="{utm_source}">UTM Source ({'{utm_source}'})</option>
                    <option value="{utm_medium}">UTM Medium ({'{utm_medium}'})</option>
                    <option value="{utm_campaign}">UTM Campaign ({'{utm_campaign}'})</option>
                    <option value="{date}">תאריך נוכחי ({'{date}'})</option>
                    <option value="{datetime}">תאריך ושעה ({'{datetime}'})</option>
                    <option value="{timestamp}">חותמת זמן ({'{timestamp}'})</option>
                  </optgroup>
                  {otherSteps.length > 0 && (
                    <optgroup label="שדות מהטופס">
                      {otherSteps.map((s) => {
                        const key = s.mappingKey || s.id;
                        return (
                          <option key={s.id} value={`{${key}}`}>
                            שלב #{s.order}: {s.title} ({`{${key}}`})
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                  פרמטר URL אופציונלי (למשל ref או source):
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={step.hiddenUrlParam || ''}
                  onChange={(e) => updateField('hiddenUrlParam', e.target.value)}
                  placeholder="לדוגמה: utm_source"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-left text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                ערך השדה הנסתר (טקסט קבוע או תבנית דינמית):
              </label>
              <input
                type="text"
                value={currentVal}
                onChange={(e) => updateField('defaultValue', e.target.value)}
                placeholder="הקלד ערך או בחר שדה דינמי מהתפריט למעלה..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        );
      })()}

      {/* Calculated Field Config */}
      {step.fieldType === 'calculated' && (() => {
        const otherSteps = allSteps.filter((s) => s.id !== step.id);
        const formula = step.calcFormula || '';
        const appendToFormula = (snippet: string) => {
          const spacer = formula && !formula.endsWith(' ') && !formula.endsWith('(') ? ' ' : '';
          updateField('calcFormula', `${formula}${spacer}${snippet}`);
        };

        return (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-xs" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                <Calculator className="w-4 h-4 text-indigo-500" />
                <span>הגדרות שדה חישוב מתמטי</span>
              </div>

              <label className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <input
                  type="checkbox"
                  checked={Boolean(step.isPriceField)}
                  onChange={(e) => updateField('isPriceField', e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600"
                />
                <span>השתמש בתוצאה כשדה מחיר לתשלום (₪)</span>
              </label>
            </div>

            {/* Selectors for Fields and Math Functions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                  הוסף שדה מהטופס לנוסחה:
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) appendToFormula(`{${e.target.value}}`);
                  }}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                >
                  <option value="">-- בחר שדה להוספה --</option>
                  {otherSteps.map((s) => {
                    const key = s.mappingKey || s.id;
                    return (
                      <option key={s.id} value={key}>
                        שלב #{s.order}: {s.title} ({key})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                  הוסף פעולה / פונקציה מתמטית:
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) appendToFormula(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                >
                  <option value="">-- בחר פעולה או פונקציה --</option>
                  <option value="+">+ חיבור</option>
                  <option value="-">- חיסור</option>
                  <option value="*">* כפל</option>
                  <option value="/">/ חילוק</option>
                  <option value="(">( פתיחת סוגריים</option>
                  <option value=")">) סגירת סוגריים</option>
                  <option value="ROUND()">ROUND() - עיגול</option>
                  <option value="FLOOR()">FLOOR() - עיגול מטה</option>
                  <option value="CEIL()">CEIL() - עיגול מעלה</option>
                  <option value="ABS()">ABS() - ערך מוחלט</option>
                  <option value="MIN( , )">MIN(a, b) - מינימום</option>
                  <option value="MAX( , )">MAX(a, b) - מקסימום</option>
                </select>
              </div>
            </div>

            {/* Formula Text Input for numbers and expressions */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                נוסחת החישוב (ניתן להקליד מספרים, פעולות ומשתנים כמו {'{quantity} * 50'}):
              </label>
              <input
                type="text"
                dir="ltr"
                value={formula}
                onChange={(e) => updateField('calcFormula', e.target.value)}
                placeholder="לדוגמה: {field_1} * 100 + 50"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg font-mono text-left text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        );
      })()}

      {/* Rating & Scale Settings */}
      {step.fieldType === 'rating' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-4 text-xs font-semibold">
          <span>מקסימום כוכבי דירוג:</span>
          <select
            value={step.maxRating || 5}
            onChange={(e) => updateField('maxRating', Number(e.target.value))}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
          >
            <option value={3}>3 כוכבים</option>
            <option value={5}>5 כוכבים (מומלץ)</option>
            <option value={7}>7 כוכבים</option>
            <option value={10}>10 כוכבים</option>
          </select>
        </div>
      )}

      {step.fieldType === 'scale' && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
          <div>
            <label className="font-bold text-slate-600 dark:text-slate-400">תווית לציון הנמוך (1):</label>
            <input
              type="text"
              value={step.minScaleLabel || 'נמוך'}
              onChange={(e) => updateField('minScaleLabel', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 dark:text-slate-400">תווית לציון הגבוה (10):</label>
            <input
              type="text"
              value={step.maxScaleLabel || 'גבוה מאוד'}
              onChange={(e) => updateField('maxScaleLabel', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Ticket Booking Tiers Config */}
      {step.fieldType === 'ticket_booking' && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-amber-500" />
              <span>סוגי כרטיסים ומלאי ({step.ticketTiers?.length || 0})</span>
            </label>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={step.collectAttendeeNames !== false}
                  onChange={(e) => updateField('collectAttendeeNames', e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-amber-600"
                />
                <span>איסוף שמות משתתפים לכל כרטיס</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const tiers = step.ticketTiers || [];
                  const newTier: TicketTier = {
                    id: `tier_${Date.now()}`,
                    name: `כרטיס ${tiers.length + 1}`,
                    description: '',
                    price: 100,
                    capacity: 100,
                    soldCount: 0,
                    maxPerOrder: 10,
                    iconName: 'Ticket',
                  };
                  updateField('ticketTiers', [...tiers, newTier]);
                }}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף סוג כרטיס</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(step.ticketTiers || []).map((tier, idx) => (
              <div
                key={tier.id || idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => {
                      const next = [...(step.ticketTiers || [])];
                      next[idx] = { ...next[idx], name: e.target.value };
                      updateField('ticketTiers', next);
                    }}
                    placeholder="שם הכרטיס (למשל: רגיל / VIP)"
                    className="flex-1 min-w-[140px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                  />
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500">מחיר ₪:</span>
                    <input
                      type="number"
                      min={0}
                      value={tier.price}
                      onChange={(e) => {
                        const next = [...(step.ticketTiers || [])];
                        next[idx] = { ...next[idx], price: Number(e.target.value) || 0 };
                        updateField('ticketTiers', next);
                      }}
                      className="w-20 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500">מלאי:</span>
                    <input
                      type="number"
                      min={0}
                      value={tier.capacity ?? ''}
                      placeholder="ללא הגבלה"
                      onChange={(e) => {
                        const next = [...(step.ticketTiers || [])];
                        next[idx] = {
                          ...next[idx],
                          capacity: e.target.value === '' ? undefined : Number(e.target.value),
                        };
                        updateField('ticketTiers', next);
                      }}
                      className="w-20 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    נמכרו: {tier.soldCount || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(step.ticketTiers || [])];
                      next.splice(idx, 1);
                      updateField('ticketTiers', next);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={tier.description || ''}
                  onChange={(e) => {
                    const next = [...(step.ticketTiers || [])];
                    next[idx] = { ...next[idx], description: e.target.value };
                    updateField('ticketTiers', next);
                  }}
                  placeholder="תיאור קצר לכרטיס (למשל: כולל כיבוד ומקומות שמורים)"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupon Codes Config */}
      {step.fieldType === 'coupon_code' && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-500" />
              <span>קודי קופון פעילים ({step.coupons?.length || 0})</span>
            </label>
            <button
              type="button"
              onClick={() => {
                const coupons = step.coupons || [];
                const newCoupon: CouponDefinition = {
                  id: `cpn_${Date.now()}`,
                  code: `SALE${coupons.length + 1}`,
                  discountType: 'percent',
                  discountValue: 15,
                  maxUses: 50,
                  usedCount: 0,
                  active: true,
                };
                updateField('coupons', [...coupons, newCoupon]);
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוסף קוד קופון</span>
            </button>
          </div>

          <div className="space-y-2">
            {(step.coupons || []).map((cpn, idx) => (
              <div
                key={cpn.id || idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center gap-2 text-xs"
              >
                <input
                  type="text"
                  dir="ltr"
                  value={cpn.code}
                  onChange={(e) => {
                    const next = [...(step.coupons || [])];
                    next[idx] = { ...next[idx], code: e.target.value.toUpperCase() };
                    updateField('coupons', next);
                  }}
                  placeholder="קוד (VIP20)"
                  className="w-28 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold uppercase text-left"
                />

                <select
                  value={cpn.discountType}
                  onChange={(e) => {
                    const next = [...(step.coupons || [])];
                    next[idx] = {
                      ...next[idx],
                      discountType: e.target.value as 'percent' | 'fixed',
                    };
                    updateField('coupons', next);
                  }}
                  className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="percent">אחוזים (%)</option>
                  <option value="fixed">סכום קבוע (₪)</option>
                </select>

                <input
                  type="number"
                  min={0}
                  value={cpn.discountValue}
                  onChange={(e) => {
                    const next = [...(step.coupons || [])];
                    next[idx] = { ...next[idx], discountValue: Number(e.target.value) || 0 };
                    updateField('coupons', next);
                  }}
                  className="w-16 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  title="ערך ההנחה"
                />

                <div className="flex items-center gap-1">
                  <span className="text-slate-500">מכסה:</span>
                  <input
                    type="number"
                    min={0}
                    value={cpn.maxUses ?? ''}
                    placeholder="∞"
                    onChange={(e) => {
                      const next = [...(step.coupons || [])];
                      next[idx] = {
                        ...next[idx],
                        maxUses: e.target.value === '' ? undefined : Number(e.target.value),
                      };
                      updateField('coupons', next);
                    }}
                    className="w-16 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500">עד תאריך:</span>
                  <input
                    type="date"
                    value={cpn.validUntil || ''}
                    onChange={(e) => {
                      const next = [...(step.coupons || [])];
                      next[idx] = { ...next[idx], validUntil: e.target.value || undefined };
                      updateField('coupons', next);
                    }}
                    className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cpn.active !== false}
                    onChange={(e) => {
                      const next = [...(step.coupons || [])];
                      next[idx] = { ...next[idx], active: e.target.checked };
                      updateField('coupons', next);
                    }}
                    className="w-3.5 h-3.5 rounded text-emerald-600"
                  />
                  <span>פעיל</span>
                </label>

                <span className="text-[11px] text-slate-400">
                  מומש: {cpn.usedCount || 0}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const next = [...(step.coupons || [])];
                    next.splice(idx, 1);
                    updateField('coupons', next);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment & Clearing Config */}
      {step.fieldType === 'payment' && (() => {
        const otherSteps = allSteps.filter((s) => s.id !== step.id);
        const amountSource = step.paymentAmountSource || 'fixed';
        const frequencyMode = step.paymentFrequencyMode || 'one_time';
        const selectedFreqStep = otherSteps.find(
          (s) => (s.mappingKey || s.id) === step.paymentFrequencyFieldKey || s.id === step.paymentFrequencyFieldKey
        );

        return (
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800" dir="rtl">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                הגדרות סליקה ותשלום (תואם קשר ונדרים פלוס)
              </span>
            </div>

            {/* 1. Price / Amount Source */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                1. קביעת מחיר / סכום לתשלום:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateField('paymentAmountSource', 'fixed')}
                  className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${
                    amountSource === 'fixed'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  סכום קבוע (₪)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('paymentAmountSource', 'field')}
                  className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${
                    amountSource === 'field'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  לפי שדה מהטופס
                </button>
              </div>

              {amountSource === 'fixed' ? (
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    סכום לחיוב (₪):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={step.defaultValue ?? 100}
                    onChange={(e) => updateField('defaultValue', e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-28 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                      בחר שדה מחיר מהטופס:
                    </label>
                    <select
                      value={step.paymentAmountFieldKey || ''}
                      onChange={(e) => updateField('paymentAmountFieldKey', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                    >
                      <option value="">-- בחר שדה מהטופס --</option>
                      {otherSteps.map((s) => {
                        const key = s.mappingKey || s.id;
                        return (
                          <option key={s.id} value={key}>
                            שלב #{s.order}: {s.title} ({s.fieldType})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                      סכום ברירת מחדל (אם השדה ריק):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={step.defaultValue ?? 100}
                      onChange={(e) => updateField('defaultValue', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Payment Frequency: One-time vs Standing Order (הוראת קבע) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                2. אופן התשלום (הוראת קבע / תשלום חד-פעמי):
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'one_time', label: 'תשלום חד-פעמי' },
                  { id: 'recurring', label: 'הוראת קבע חודשית' },
                  { id: 'from_field', label: 'נקבע לפי שדה בטופס' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('paymentFrequencyMode', opt.id)}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${
                      frequencyMode === opt.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {frequencyMode === 'from_field' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                      בחר שדה שקובע הוראת קבע / חד-פעמי:
                    </label>
                    <select
                      value={step.paymentFrequencyFieldKey || ''}
                      onChange={(e) => updateField('paymentFrequencyFieldKey', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                    >
                      <option value="">-- בחר שדה מהטופס --</option>
                      {otherSteps.map((s) => {
                        const key = s.mappingKey || s.id;
                        return (
                          <option key={s.id} value={key}>
                            שלב #{s.order}: {s.title} ({s.fieldType})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                      ערך/אפשרות שמפעילה הוראת קבע:
                    </label>
                    {selectedFreqStep?.options && selectedFreqStep.options.length > 0 ? (
                      <select
                        value={step.paymentRecurringMatchValue || ''}
                        onChange={(e) => updateField('paymentRecurringMatchValue', e.target.value || undefined)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                      >
                        <option value="">זיהוי אוטומטי (הוראת קבע / חודשי / recurring)</option>
                        {selectedFreqStep.options.map((o) => (
                          <option key={o.id} value={o.value}>
                            {o.label} ({o.value})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={step.paymentRecurringMatchValue || ''}
                        onChange={(e) => updateField('paymentRecurringMatchValue', e.target.value || undefined)}
                        placeholder="אוטומטי (או הקלד ערך מדויק)"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              )}

              {(frequencyMode === 'recurring' || frequencyMode === 'from_field') && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    מספר חודשים בהוראת קבע:
                  </label>
                  <select
                    value={step.paymentRecurringInstallments ?? 0}
                    onChange={(e) => updateField('paymentRecurringInstallments', Number(e.target.value))}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  >
                    <option value={0}>ללא הגבלה (עד ביטול)</option>
                    <option value={12}>12 חודשים</option>
                    <option value={24}>24 חודשים</option>
                    <option value={36}>36 חודשים</option>
                  </select>
                </div>
              )}
            </div>

            {/* 3. Document Type & ID Requirement */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  סוג מסמך להפקה:
                </label>
                <select
                  value={step.paymentDocumentType ?? 320}
                  onChange={(e) => updateField('paymentDocumentType', Number(e.target.value))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                >
                  <option value={320}>חשבונית מס קבלה (320)</option>
                  <option value={400}>קבלה (400)</option>
                  <option value={405}>קבלה על תרומה - סעיף 46 (405)</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(step.paymentRequireId)}
                  onChange={(e) => updateField('paymentRequireId', e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-indigo-600"
                />
                <span>חייב הזנת ת.ז בסליקת אשראי</span>
              </label>
            </div>
          </div>
        );
      })()}

      {/* Universal Conditional Logic (תנאים לוגיים להצגת השדה) */}
      {(() => {
        const otherSteps = allSteps.filter((s) => s.id !== step.id);
        const logic = step.conditionalLogic || { enabled: false, logicType: 'all' as const, rules: [] };
        const updateLogic = (patch: Partial<typeof logic>) => {
          updateField('conditionalLogic', { ...logic, ...patch });
        };

        const addRule = () => {
          const defaultTarget = otherSteps[0];
          const newRule: StepConditionRule = {
            id: `rule_${Date.now()}`,
            fieldKey: defaultTarget ? (defaultTarget.mappingKey || defaultTarget.id) : '',
            operator: 'equals',
            value: '',
          };
          updateLogic({ enabled: true, rules: [...(logic.rules || []), newRule] });
        };

        const updateRule = (idx: number, patch: Partial<StepConditionRule>) => {
          const next = [...(logic.rules || [])];
          next[idx] = { ...next[idx], ...patch };
          updateLogic({ rules: next });
        };

        const deleteRule = (idx: number) => {
          const next = [...(logic.rules || [])];
          next.splice(idx, 1);
          updateLogic({ rules: next });
        };

        const OPERATORS: { value: ConditionOperator; label: string }[] = [
          { value: 'equals', label: 'שווה ל- (=)' },
          { value: 'not_equals', label: 'שונה מ- (≠)' },
          { value: 'contains', label: 'מכיל' },
          { value: 'greater_than', label: 'גדול מ- (>)' },
          { value: 'less_than', label: 'קטן מ- (<)' },
          { value: 'greater_or_equal', label: 'גדול או שווה ל- (≥)' },
          { value: 'less_or_equal', label: 'קטן או שווה ל- (≤)' },
          { value: 'is_empty', label: 'ריק' },
          { value: 'is_not_empty', label: 'לא ריק' },
        ];

        return (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(logic.enabled)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked && (!logic.rules || logic.rules.length === 0)) {
                      const defaultTarget = otherSteps[0];
                      updateField('conditionalLogic', {
                        enabled: true,
                        logicType: logic.logicType || 'all',
                        rules: [
                          {
                            id: `rule_${Date.now()}`,
                            fieldKey: defaultTarget ? (defaultTarget.mappingKey || defaultTarget.id) : '',
                            operator: 'equals',
                            value: '',
                          },
                        ],
                      });
                    } else {
                      updateLogic({ enabled: checked });
                    }
                  }}
                  className="w-3.5 h-3.5 rounded text-indigo-600"
                />
                <GitBranch className="w-4 h-4 text-indigo-500" />
                <span>תנאים לוגיים להצגת השדה</span>
              </label>

              {logic.enabled && (
                <div className="flex items-center gap-2">
                  <select
                    value={logic.logicType || 'all'}
                    onChange={(e) => updateLogic({ logicType: e.target.value as 'all' | 'any' })}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold"
                  >
                    <option value="all">כל התנאים מתקיימים (וגם)</option>
                    <option value="any">לפחות תנאי אחד מתקיים (או)</option>
                  </select>
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף תנאי</span>
                  </button>
                </div>
              )}
            </div>

            {logic.enabled && (
              <div className="space-y-2">
                {(logic.rules || []).map((rule, rIdx) => {
                  const targetStep = otherSteps.find(
                    (s) => (s.mappingKey || s.id) === rule.fieldKey || s.id === rule.fieldKey
                  );
                  const needsValue = rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty';

                  return (
                    <div
                      key={rule.id || rIdx}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center gap-2"
                    >
                      <select
                        value={rule.fieldKey}
                        onChange={(e) => updateRule(rIdx, { fieldKey: e.target.value })}
                        className="flex-1 min-w-[150px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                      >
                        <option value="">-- בחר שדה --</option>
                        {otherSteps.map((s) => {
                          const key = s.mappingKey || s.id;
                          return (
                            <option key={s.id} value={key}>
                              שלב #{s.order}: {s.title}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(rIdx, { operator: e.target.value as ConditionOperator })}
                        className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {needsValue && (
                        <>
                          {targetStep?.options && targetStep.options.length > 0 && (
                            <select
                              value={
                                targetStep.options.some((o) => o.value === rule.value)
                                  ? rule.value
                                  : '__custom__'
                              }
                              onChange={(e) => {
                                if (e.target.value !== '__custom__') {
                                  updateRule(rIdx, { value: e.target.value });
                                }
                              }}
                              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                            >
                              <option value="__custom__">ערך מותאם / מתמטי</option>
                              {targetStep.options.map((o) => (
                                <option key={o.id} value={o.value}>
                                  {o.label} ({o.value})
                                </option>
                              ))}
                            </select>
                          )}

                          <input
                            type="text"
                            value={rule.value || ''}
                            onChange={(e) => updateRule(rIdx, { value: e.target.value })}
                            placeholder="ערך להשוואה או ביטוי (למשל: {qty} * 10)"
                            className="flex-1 min-w-[140px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                          />
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteRule(rIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                        title="מחק תנאי"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={isIconPickerOpen}
        stylePreset={stylePreset}
        selectedIcon={
          activeOptionIndexForIcon !== null
            ? step.options?.[activeOptionIndexForIcon]?.iconName
            : step.iconName
        }
        onSelect={(newIcon) => {
          if (activeOptionIndexForIcon !== null) {
            handleUpdateOption(activeOptionIndexForIcon, { iconName: newIcon });
            setActiveOptionIndexForIcon(null);
          } else {
            updateField('iconName', newIcon);
          }
        }}
        onClose={() => {
          setIsIconPickerOpen(false);
          setActiveOptionIndexForIcon(null);
        }}
      />
    </div>
  );
};
