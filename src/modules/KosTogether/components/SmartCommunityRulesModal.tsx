import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Check,
  CheckCircle2,
  Users,
  Filter,
  Brain,
  HelpCircle,
  Lightbulb,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { ContactRecord, SmartGroup, GroupRule } from '../types';
import { generateSmartGroupRules } from '../services/togetherCopilotService';

interface SmartCommunityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGroup: SmartGroup;
  contacts: ContactRecord[];
  availableCities: string[];
  onSaveRule: (rules: GroupRule[], matchingContactIds: string[]) => Promise<void>;
}

export const SmartCommunityRulesModal: React.FC<SmartCommunityRulesModalProps> = ({
  isOpen,
  onClose,
  activeGroup,
  contacts,
  availableCities,
  onSaveRule,
}) => {
  const [selectedField, setSelectedField] = useState<'mh_crm_city' | 'job_title' | 'lead_source' | 'company_name' | 'tags'>('mh_crm_city');
  const [operator, setOperator] = useState<'eq' | 'contains' | 'is_not_empty'>('eq');
  const [value, setValue] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');
  const [isParsingNlp, setIsParsingNlp] = useState(false);

  const handleParseNlpWithAi = async () => {
    if (!nlpQuery.trim()) return;
    try {
      setIsParsingNlp(true);
      const res = await generateSmartGroupRules({
        naturalLanguageQuery: nlpQuery.trim(),
        availableCities,
      });
      if (res.rules && res.rules.length > 0) {
        const firstRule = res.rules[0];
        const validField = FIELD_OPTIONS.some((f) => f.id === firstRule.field)
          ? (firstRule.field as any)
          : 'mh_crm_city';
        setSelectedField(validField);
        if (firstRule.operator === 'exists') {
          setOperator('is_not_empty');
          setValue('');
        } else if (firstRule.operator === 'contains') {
          setOperator('contains');
          setValue(String(firstRule.value || ''));
        } else {
          setOperator('eq');
          setValue(String(firstRule.value || ''));
        }
      }
    } catch (err) {
      console.error('Failed to parse NLP rules:', err);
    } finally {
      setIsParsingNlp(false);
    }
  };

  // Field options in friendly, everyday Hebrew
  const FIELD_OPTIONS = [
    { id: 'mh_crm_city', label: 'עיר מגורים', placeholder: 'לדוגמה: ירושלים' },
    { id: 'job_title', label: 'תפקיד או מקצוע', placeholder: 'לדוגמה: עובד / מנהל / מתנדב' },
    { id: 'company_name', label: 'שם ארגון או חברה', placeholder: 'לדוגמה: קושאן גרופ' },
    { id: 'lead_source', label: 'מקור הגעה למערכת', placeholder: 'לדוגמה: וואטסאפ / אתר' },
    { id: 'tags', label: 'תגית או סיווג קיים', placeholder: 'לדוגמה: VIP / שגריר' },
  ] as const;

  const OPERATOR_OPTIONS = [
    { id: 'eq', label: 'שווה בדיוק ל...' },
    { id: 'contains', label: 'מכיל את המילה...' },
    { id: 'is_not_empty', label: 'קיים וממולא (לא ריק)' },
  ] as const;

  // Real-time matching contacts evaluation
  const matchingContacts = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];
    if (operator !== 'is_not_empty' && !value.trim()) return [];

    const val = value.trim().toLowerCase();

    return contacts.filter((c) => {
      let fieldVal = '';
      if (selectedField === 'mh_crm_city') {
        fieldVal = (c.mh_crm_city || c.kosun_crm_city || '').toLowerCase();
      } else if (selectedField === 'job_title') {
        fieldVal = (c.job_title || c.kosun_crm_role || '').toLowerCase();
      } else if (selectedField === 'company_name') {
        fieldVal = (c.company_name || c.kosun_crm_company || '').toLowerCase();
      } else if (selectedField === 'lead_source') {
        fieldVal = (c.lead_source || c.kosun_crm_source || '').toLowerCase();
      } else if (selectedField === 'tags') {
        const tags = Array.isArray(c.tags) ? c.tags.join(' ').toLowerCase() : '';
        fieldVal = tags;
      }

      if (operator === 'is_not_empty') {
        return fieldVal.trim().length > 0;
      }
      if (operator === 'eq') {
        return fieldVal.trim() === val;
      }
      if (operator === 'contains') {
        return fieldVal.includes(val);
      }
      return false;
    });
  }, [contacts, selectedField, operator, value]);

  const handleApply = async () => {
    if (operator !== 'is_not_empty' && !value.trim()) return;

    try {
      setIsApplying(true);
      const rule: GroupRule = {
        field: selectedField,
        operator: operator === 'is_not_empty' ? 'exists' : operator,
        value: operator === 'is_not_empty' ? '' : value.trim(),
      };

      const matchingIds = matchingContacts.map((c) => c.id);
      await onSaveRule([rule], matchingIds);

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to apply smart rule:', err);
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-6" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-right animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>צירוף חכם לפי תנאים לוגיים</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  איש חושב
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                הגדר תנאי פשוט – כל איש קשר שיענה עליו יצורף לקהילה באופן אוטומטי
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            title="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {successMessage ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                התנאי הופעל בהצלחה על הקהילה!
              </h4>
              <p className="text-xs text-slate-500">
                {matchingContacts.length} אנשי קשר צורפו לקהילת {activeGroup.name} והתנאי חל כעת אוטומטית.
              </p>
            </div>
          ) : (
            <>
              {/* Natural Hebrew Condition Sentence */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-indigo-950 dark:text-indigo-200">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>ניסוח חכם עם KOSAI בלשון חופשית:</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold">
                    Gemini 3.8 Flash-Lite
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nlpQuery}
                    onChange={(e) => setNlpQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleParseNlpWithAi(); } }}
                    placeholder="לדוגמה: כל מי שגר בירושלים ותרם מעל 1000 שח ויש לו טלפון..."
                    className="flex-1 h-9 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleParseNlpWithAi}
                    disabled={isParsingNlp || !nlpQuery.trim()}
                    className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isParsingNlp ? 'animate-spin' : ''}`} />
                    <span>{isParsingNlp ? 'מנתח...' : 'צור חוק'}</span>
                  </button>
                </div>
              </div>

              {/* Step 1: Choose Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>1. בחר את המאפיין של איש הקשר:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FIELD_OPTIONS.map((field) => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => { setSelectedField(field.id); setValue(''); }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        selectedField === field.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {field.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Operator */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. סוג ההשוואה:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATOR_OPTIONS.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setOperator(op.id)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        operator === op.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Value input (if not 'is_not_empty') */}
              {operator !== 'is_not_empty' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    3. ערך התנאי:
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={FIELD_OPTIONS.find((f) => f.id === selectedField)?.placeholder || 'הזן ערך...'}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
                  />

                  {/* Quick Suggestions for cities */}
                  {selectedField === 'mh_crm_city' && availableCities.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400">ערים נפוצות:</span>
                      {availableCities.slice(0, 6).map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setValue(city)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Real-time Matching Preview Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      נמצאו {matchingContacts.length} אנשי קשר
                    </span>
                    <span className="text-[10px] text-slate-400">
                      תואמים לתנאי הלוגי ברגע זה ויוספו אוטומטית
                    </span>
                  </div>
                </div>

                <span className="text-sm font-mono font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-xl">
                  {matchingContacts.length}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!successMessage && (
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ביטול
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying || (operator !== 'is_not_empty' && !value.trim())}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isApplying ? (
                <span>מחיל תנאי...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>החל תנאי אוטומטי על הקהילה ({matchingContacts.length})</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
