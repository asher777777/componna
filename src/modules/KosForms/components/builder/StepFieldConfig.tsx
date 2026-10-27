import React, { useState } from 'react';
import { FormStep, FieldType, FieldOption } from '../../types';
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
} from 'lucide-react';

export interface StepFieldConfigProps {
  step: FormStep;
  onChange: (updatedStep: FormStep) => void;
  onDelete?: () => void;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'טקסט קצר', icon: Type },
  { type: 'textarea', label: 'טקסט ארוך / פירוט', icon: Type },
  { type: 'email', label: 'דואר אלקטרוני', icon: Mail },
  { type: 'phone', label: 'מספר טלפון', icon: Phone },
  { type: 'number', label: 'מספר / כמות', icon: Hash },
  { type: 'single_choice', label: 'בחירה יחידה (כרטיסיות יוקרה)', icon: Sparkles },
  { type: 'multi_choice', label: 'בחירה מרובה (צ\'קבוקס)', icon: CheckSquare },
  { type: 'rating', label: 'דירוג כוכבי יוקרה', icon: Star },
  { type: 'scale', label: 'סולם 1-10', icon: Sliders },
  { type: 'date', label: 'תאריך', icon: Calendar },
  { type: 'time', label: 'שעה', icon: Clock },
  { type: 'file_upload', label: 'העלאת קובץ / מסמך', icon: Upload },
];

export const StepFieldConfig: React.FC<StepFieldConfigProps> = ({
  step,
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
            <span className="text-[10px] text-slate-400 font-mono">(conta_name / email / phone וכו')</span>
          </label>
          <input
            type="text"
            value={step.mappingKey || ''}
            onChange={(e) => updateField('mappingKey', e.target.value)}
            placeholder="conta_name, conta_phone, email, budget, etc."
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
                  className="flex-1 min-w-[140px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white"
                />

                <input
                  type="text"
                  value={opt.description || ''}
                  onChange={(e) => handleUpdateOption(idx, { description: e.target.value })}
                  placeholder="הסבר קצר (אופציונלי)"
                  className="flex-1 min-w-[140px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
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

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={isIconPickerOpen}
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
