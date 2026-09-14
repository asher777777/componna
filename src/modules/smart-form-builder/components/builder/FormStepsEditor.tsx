import React, { useState } from 'react';
import { FormStep, FieldType } from '../../types';
import { StepFieldConfig } from './StepFieldConfig';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Trash2,
  Sparkles,
} from 'lucide-react';

export interface FormStepsEditorProps {
  steps: FormStep[];
  onChange: (updatedSteps: FormStep[]) => void;
}

export const FormStepsEditor: React.FC<FormStepsEditorProps> = ({
  steps,
  onChange,
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(
    steps[0]?.id || null
  );

  const handleAddStep = () => {
    const newStepId = `step_${Date.now()}`;
    const newStep: FormStep = {
      id: newStepId,
      order: steps.length + 1,
      title: `שאלה חדשה ${steps.length + 1}`,
      subtitle: '',
      fieldType: 'text',
      iconName: 'Sparkles',
      placeholder: '',
      required: true,
      mappingKey: `field_${steps.length + 1}`,
    };

    const newSteps = [...steps, newStep];
    onChange(newSteps);
    setExpandedStepId(newStepId);
  };

  const handleUpdateStep = (index: number, updated: FormStep) => {
    const newSteps = [...steps];
    newSteps[index] = updated;
    onChange(newSteps);
  };

  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) {
      alert('טופס חייב להכיל לפחות שלב אחד');
      return;
    }
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange(newSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    // re-assign order
    const reordered = newSteps.map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
            שלבי הטופס (שדה אחד בכל שלב)
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {steps.length} שלבים
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>הוסף שלב חדש</span>
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isExpanded = expandedStepId === step.id;
          return (
            <div
              key={step.id || index}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all"
            >
              {/* Step Header Accordion Bar */}
              <div
                onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                  isExpanded
                    ? 'bg-amber-50/50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                    {index + 1}
                  </div>

                  <LuxuryIconRenderer
                    iconName={step.iconName}
                    className="w-5 h-5 text-amber-500 shrink-0"
                  />

                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 dark:text-white text-sm truncate block">
                      {step.title}
                    </span>
                    {step.subtitle && (
                      <span className="text-xs text-slate-400 truncate block">
                        {step.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] hidden sm:inline-block">
                    {step.fieldType}
                  </span>

                  {/* Move Up/Down */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveStep(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === steps.length - 1}
                      onClick={() => handleMoveStep(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Step Editor */}
              {isExpanded && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
                  <StepFieldConfig
                    step={step}
                    onChange={(updated) => handleUpdateStep(index, updated)}
                    onDelete={steps.length > 1 ? () => handleDeleteStep(index) : undefined}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
