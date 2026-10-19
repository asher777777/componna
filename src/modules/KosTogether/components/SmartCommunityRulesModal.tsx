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
  Trash2,
  Tag
} from 'lucide-react';
import { ContactRecord, SmartGroup, GroupRule, GroupRuleField, GroupRuleOperator } from '../types';
import { RULE_FIELD_OPTIONS } from '../config';
import { evaluateRule } from '../services/groupsUtils';
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
  const [selectedField, setSelectedField] = useState<GroupRuleField>('tags');
  const [operator, setOperator] = useState<GroupRuleOperator>('contains');
  const [value, setValue] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');
  const [isParsingNlp, setIsParsingNlp] = useState(false);

  const selectedFieldDef = useMemo(() => {
    return RULE_FIELD_OPTIONS.find((f) => f.value === selectedField) || RULE_FIELD_OPTIONS[0];
  }, [selectedField]);

  // Extract top frequent tags from existing contacts for 1-click suggestion
  const popularTags = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      const arr = Array.isArray(c.tags)
        ? c.tags
        : typeof c.tags === 'string'
        ? (c.tags as string).split(',').map((t) => t.trim())
        : [];
      arr.forEach((t) => {
        if (t && t.length > 1) {
          counts[t] = (counts[t] || 0) + 1;
        }
      });
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
  }, [contacts]);

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
        const validField = RULE_FIELD_OPTIONS.some((f) => f.value === firstRule.field)
          ? firstRule.field
          : 'tags';
        setSelectedField(validField);
        setOperator(firstRule.operator);
        setValue(String(firstRule.value || ''));
      }
    } catch (err) {
      console.error('Failed to parse NLP rules:', err);
    } finally {
      setIsParsingNlp(false);
    }
  };

  // Real-time matching contacts evaluation using centralized evaluateRule
  const matchingContacts = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];
    if (operator !== 'exists' && operator !== 'not_exists' && !value.trim()) return [];

    const rule: GroupRule = {
      field: selectedField,
      operator,
      value: (operator === 'exists' || operator === 'not_exists') ? '' : value.trim(),
    };

    return contacts.filter((c) => evaluateRule(c, rule));
  }, [contacts, selectedField, operator, value]);

  const handleApply = async () => {
    if (operator !== 'exists' && operator !== 'not_exists' && !value.trim()) return;

    try {
      setIsApplying(true);
      const rule: GroupRule = {
        field: selectedField,
        operator,
        value: (operator === 'exists' || operator === 'not_exists') ? '' : value.trim(),
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>1. בחר שדה מתוך קולקציית אנשי הקשר:</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {RULE_FIELD_OPTIONS.length} שדות זמינים
                  </span>
                </div>

                {/* Popular Quick Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'tags', label: 'תווית / תגית', icon: Tag },
                    { id: 'mh_crm_city', label: 'עיר מגורים' },
                    { id: 'job_title', label: 'תפקיד' },
                    { id: 'company_name', label: 'חברה / ארגון' },
                    { id: 'lead_source', label: 'מקור ליד' },
                    { id: 'status', label: 'סטטוס' },
                    { id: 'total_spent', label: 'סך תשלומים' },
                    { id: 'community', label: 'קהילה משויכת' },
                  ].map((field) => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => { setSelectedField(field.id as GroupRuleField); setValue(''); }}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        selectedField === field.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {field.icon && <field.icon className="w-3 h-3 text-indigo-600" />}
                      <span>{field.label}</span>
                    </button>
                  ))}
                </div>

                {/* Full Select for ALL Contact Fields */}
                <div className="pt-1">
                  <select
                    value={selectedField}
                    onChange={(e) => {
                      const newField = e.target.value as GroupRuleField;
                      setSelectedField(newField);
                      const def = RULE_FIELD_OPTIONS.find((f) => f.value === newField);
                      if (def?.type === 'number') setOperator('gte');
                      else if (def?.type === 'boolean') setOperator('exists');
                      else setOperator('contains');
                      setValue('');
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <optgroup label="תוויות וסיווג">
                      <option value="tags">🏷️ תווית / תגית (tags)</option>
                      <option value="community">🌐 קהילה משויכת (community)</option>
                      <option value="status">📊 סטטוס ב-CRM (status)</option>
                      <option value="lead_source">🎯 מקור הגעה / ליד (lead_source)</option>
                    </optgroup>
                    <optgroup label="פרטים אישיים ויצירת קשר">
                      <option value="conta_name">👤 שם איש קשר (conta_name)</option>
                      <option value="conta_phone">📞 מספר טלפון (conta_phone)</option>
                      <option value="email">✉️ כתובת אימייל (email)</option>
                      <option value="gender">⚧ מגדר (gender)</option>
                      <option value="notes">📝 הערות (notes)</option>
                      <option value="last_form_name">📋 שם טופס אחרון (last_form_name)</option>
                      <option value="has_phone">📱 קיים מספר טלפון (has_phone)</option>
                      <option value="has_email">📧 קיימת כתובת אימייל (has_email)</option>
                    </optgroup>
                    <optgroup label="כתובת ומיקום">
                      <option value="mh_crm_city">🏙️ עיר מגורים (mh_crm_city)</option>
                      <option value="mh_crm_street">📍 כתובת / רחוב (mh_crm_street)</option>
                    </optgroup>
                    <optgroup label="עבודה וארגון">
                      <option value="company_name">🏢 שם חברה / ארגון (company_name)</option>
                      <option value="job_title">💼 תפקיד או מקצוע (job_title)</option>
                    </optgroup>
                    <optgroup label="כספים וקמפיינים">
                      <option value="total_spent">💰 סך תשלומים מצטבר ₪ (total_spent)</option>
                      <option value="campaign_amount">🎯 סכום תרומה לקמפיין ₪ (campaign_amount)</option>
                      <option value="order_count">📦 מספר הזמנות / תשלומים (order_count)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

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
              disabled={isApplying || ((operator !== 'exists' && operator !== 'not_exists') && !value.trim()) || matchingContacts.length === 0}
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
