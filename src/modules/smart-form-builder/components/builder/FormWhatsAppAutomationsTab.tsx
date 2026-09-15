import React, { useState } from 'react';
import { SmartFormDefinition, FormWhatsAppRule, FormWhatsAppConditionType, FormWhatsAppRecipientType } from '../../types';
import { AVAILABLE_DYNAMIC_TAGS, renderWhatsAppMessage } from '../../services/whatsappTemplateService';
import { getGreenApiService } from '../../services/formWhatsAppService';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import {
  MessageSquare,
  Plus,
  Trash2,
  Copy,
  Send,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Flame,
  Zap,
  Sliders,
  Eye,
  FileText,
  User,
  Phone,
  Link,
  HelpCircle,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export interface FormWhatsAppAutomationsTabProps {
  form: SmartFormDefinition;
  onChange: (updatedForm: SmartFormDefinition) => void;
}

export const FormWhatsAppAutomationsTab: React.FC<FormWhatsAppAutomationsTabProps> = ({
  form,
  onChange,
}) => {
  const { apiKeys, openConnectorModal } = useSystemConnection();
  const isGreenApiConnected = Boolean(apiKeys.greenApiInstanceId && apiKeys.greenApiToken);

  const rules: FormWhatsAppRule[] = form.whatsappRules || [];
  const isEnabled = form.whatsappAutomationEnabled ?? false;

  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(
    rules.length > 0 ? rules[0].id : null
  );

  // Test send state
  const [testPhone, setTestPhone] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const activeRule = rules.find((r) => r.id === selectedRuleId) || null;

  const handleToggleAutomation = (checked: boolean) => {
    onChange({
      ...form,
      whatsappAutomationEnabled: checked,
      whatsappRules: rules.length === 0 && checked ? [createDefaultRule(form)] : rules,
    });
    if (rules.length === 0 && checked) {
      setSelectedRuleId('rule_welcome');
    }
  };

  const handleAddRule = () => {
    const newRule: FormWhatsAppRule = {
      id: `rule_${Date.now()}`,
      name: `אוטומציה חדשה ${rules.length + 1}`,
      enabled: true,
      recipientType: 'submitter',
      conditionType: 'always',
      messageTemplate: `שלום {{conta_name}}!\nתודה שפנית אלינו דרך טופס "{{form_title}}".\n\nקיבלנו את פרטיך בהצלחה וניצור עמך קשר בהקדם.\nבברכה,\nצוות הארגון`,
    };

    const updated = [...rules, newRule];
    onChange({ ...form, whatsappRules: updated });
    setSelectedRuleId(newRule.id);
  };

  const handleUpdateActiveRule = (patch: Partial<FormWhatsAppRule>) => {
    if (!activeRule) return;
    const updated = rules.map((r) => (r.id === activeRule.id ? { ...r, ...patch } : r));
    onChange({ ...form, whatsappRules: updated });
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    onChange({ ...form, whatsappRules: updated });
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleCloneRule = (rule: FormWhatsAppRule) => {
    const cloned: FormWhatsAppRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      name: `${rule.name} (עותק)`,
    };
    const updated = [...rules, cloned];
    onChange({ ...form, whatsappRules: updated });
    setSelectedRuleId(cloned.id);
  };

  const insertTagAtCursor = (tag: string) => {
    if (!activeRule) return;
    const current = activeRule.messageTemplate || '';
    handleUpdateActiveRule({ messageTemplate: current + ` ${tag}` });
  };

  const handleApplyPresetTemplate = (presetType: 'welcome_lead' | 'hot_lead_alert' | 'answers_summary') => {
    if (!activeRule) return;

    if (presetType === 'welcome_lead') {
      handleUpdateActiveRule({
        name: 'הודעת תודה ואישור פנייה ללקוח',
        recipientType: 'submitter',
        conditionType: 'always',
        messageTemplate: `שלום {{conta_name}},\nתודה שפנית אלינו בנושא "{{form_title}}".\n\nקיבלנו את פנייתך בהצלחה ופרטייך נרשמו במערכת.\nאחד מנציגינו יחזור אלייך בהקדם למספר {{conta_phone}}.\n\nבברכה,\nצוות השירות`,
      });
    } else if (presetType === 'hot_lead_alert') {
      handleUpdateActiveRule({
        name: 'התראת WhatsApp דחופה למנהל על ליד חם',
        recipientType: 'custom_phone',
        conditionType: 'lead_temperature_hot',
        customPhone: '052-0000000',
        messageTemplate: `[התראת ליד חם חדש במערכת]\n\n*טופס:* {{form_title}}\n*שם הפונה:* {{conta_name}}\n*טלפון ישיר:* {{conta_phone}}\n*אימייל:* {{email}}\n*ציון איכות ליד:* {{lead_score}}/100\n*שעת הגעה:* {{submission_time}} ({{submission_date}})\n\n*פירוט תשובות הטופס:*\n{{all_answers_summary}}\n\nנא ליצור קשר מיידי.`,
      });
    } else if (presetType === 'answers_summary') {
      handleUpdateActiveRule({
        name: 'סיכום תשובות מלא ללקוח',
        recipientType: 'submitter',
        conditionType: 'always',
        messageTemplate: `היי {{conta_name}},\nתודה שמילאת את הטופס "{{form_title}}".\n\nלהלן ריכוז הפרטים ששלחת:\n{{all_answers_summary}}\n\nלכל שאלה או שינוי ניתן להשיב ישירות להודעה זו.`,
      });
    }
  };

  // Test live dispatch
  const handleTestSend = async () => {
    if (!activeRule || !testPhone) {
      alert('נא להזין מספר טלפון לבדיקה');
      return;
    }

    const greenService = getGreenApiService();
    if (!greenService || !greenService.isConfigured()) {
      setTestResult({
        success: false,
        msg: 'שירות Green-API לא מוגדר במערכת. לחץ על הגדרות לחיבור.',
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const sampleRendered = renderWhatsAppMessage(activeRule.messageTemplate, {
        form,
        rawAnswers: {
          conta_name: 'ישראל ישראלי (בדיקה)',
          conta_phone: testPhone,
          email: 'israel@example.com',
        },
        metadata: {
          leadScore: 92,
          leadTemperature: 'hot',
          pageTitle: form.title,
        },
        submissionId: 'test_sub_123',
        submittedAt: new Date().toISOString(),
      });

      const res = await greenService.sendMessage({
        chatId: testPhone,
        message: sampleRendered,
      });

      if (res?.idMessage) {
        setTestResult({
          success: true,
          msg: `הודעת בדיקה נשלחה בהצלחה! מזהה: ${res.idMessage}`,
        });
      } else {
        setTestResult({
          success: false,
          msg: res?.error || 'שגיאה בשליחת הודעת בדיקה',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        msg: e?.message || 'שגיאה בעת שליחת הודעת בדיקה',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const samplePreviewText = activeRule
    ? renderWhatsAppMessage(activeRule.messageTemplate, {
        form,
        rawAnswers: {
          conta_name: 'ישראל ישראלי',
          conta_phone: '052-1234567',
          email: 'israel@example.com',
          ...form.steps.reduce((acc: any, s) => {
            acc[s.mappingKey || s.id] = s.defaultValue || `ערך לדוגמה (${s.title})`;
            return acc;
          }, {}),
        },
        metadata: {
          leadScore: 92,
          leadTemperature: 'hot',
          pageTitle: form.title,
        },
        submissionId: 'sub_sample_889',
        submittedAt: new Date().toISOString(),
      })
    : '';

  return (
    <div dir="rtl" className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      {/* Top Banner: Master Toggle & Connection Status */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-2xl shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                אוטומציות וואטסאפ (GREEN-API WhatsApp Automations)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                שליחת הודעות וואטסאפ אוטומטיות מותנות לוגית ללקוחות ולמנהלים, עם תגיות דינמיות ומשתנים.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Green API Status Indicator */}
          {isGreenApiConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
              <span>GREEN-API מחובר</span>
            </div>
          ) : (
            <button
              onClick={openConnectorModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>נדרש חיבור Green-API</span>
            </button>
          )}

          {/* Master Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => handleToggleAutomation(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
            <span className="mr-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              {isEnabled ? 'אוטומציות פעילות' : 'מושבת'}
            </span>
          </label>
        </div>
      </div>

      {isEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Rules List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>תרחישים ואוטומציות ({rules.length})</span>
                </h4>
                <button
                  onClick={handleAddRule}
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-colors"
                  title="הוסף חוק חדש"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {rules.map((rule) => {
                  const isSelected = rule.id === selectedRuleId;

                  return (
                    <div
                      key={rule.id}
                      onClick={() => setSelectedRuleId(rule.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              const updated = rules.map((r) =>
                                r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                              );
                              onChange({ ...form, whatsappRules: updated });
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                            {rule.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloneRule(rule);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="שכפל תרחיש"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRule(rule.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="מחק תרחיש"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>
                          {rule.recipientType === 'submitter'
                            ? 'ללקוח'
                            : rule.recipientType === 'custom_phone'
                            ? 'למנהל'
                            : 'לשניהם'}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {rule.conditionType === 'always'
                            ? 'תמיד'
                            : rule.conditionType === 'lead_temperature_hot'
                            ? 'ליד חם'
                            : 'מותנה'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {rules.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    עדיין אין אוטומציות. לחץ על + להוספת תרחיש ראשון.
                  </div>
                )}
              </div>
            </div>

            {/* Ready Preset Starters */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 block">תבניות מהירות מוכנות:</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleApplyPresetTemplate('welcome_lead')}
                  className="w-full text-right p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>הודעת תודה ואישור ללקוח</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                </button>
                <button
                  onClick={() => handleApplyPresetTemplate('hot_lead_alert')}
                  className="w-full text-right p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>התראת ליד חם דחופה למנהל</span>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </button>
                <button
                  onClick={() => handleApplyPresetTemplate('answers_summary')}
                  className="w-full text-right p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>סיכום תשובות מלא ללקוח</span>
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Rule Editor & Live Preview (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeRule ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                {/* Rule Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">שם התרחיש</label>
                    <input
                      type="text"
                      value={activeRule.name}
                      onChange={(e) => handleUpdateActiveRule({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="min-w-[160px]">
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">יעד השליחה</label>
                    <select
                      value={activeRule.recipientType}
                      onChange={(e) =>
                        handleUpdateActiveRule({
                          recipientType: e.target.value as FormWhatsAppRecipientType,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="submitter">ללקוח שמילא את הטופס</option>
                      <option value="custom_phone">למספר מנהל / קבוצה קבוע</option>
                      <option value="both">גם ללקוח וגם למנהל</option>
                    </select>
                  </div>

                  {(activeRule.recipientType === 'custom_phone' || activeRule.recipientType === 'both') && (
                    <div className="w-full sm:w-auto flex-1">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">מספר טלפון יעד (מנהל/קבוצה)</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={activeRule.customPhone || ''}
                        onChange={(e) => handleUpdateActiveRule({ customPhone: e.target.value })}
                        placeholder="052-1234567 או מזהה קבוצה"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Condition Builder (תנאים לוגיים חכמים) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>תנאי לוגי להפעלת האוטומציה (Condition Trigger):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">סוג התנאי</label>
                      <select
                        value={activeRule.conditionType}
                        onChange={(e) =>
                          handleUpdateActiveRule({
                            conditionType: e.target.value as FormWhatsAppConditionType,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="always">תמיד (בכל הגשה)</option>
                        <option value="lead_temperature_hot">כאשר הליד סווג כליד חם (HOT)</option>
                        <option value="score_gte">ציון איכות ליד AI שווה או גבוה מ...</option>
                        <option value="field_equals">ערך שדה שווה ל...</option>
                        <option value="field_not_equals">ערך שדה שונה מ...</option>
                        <option value="field_contains">ערך שדה מכיל טקסט...</option>
                        <option value="field_not_empty">שדה מסוים מולא (אינו ריק)</option>
                        <option value="numeric_greater_than">ערך מספרי של שדה גדול מ...</option>
                        <option value="numeric_less_than">ערך מספרי של שדה קטן מ...</option>
                      </select>
                    </div>

                    {/* Field selector if condition relies on field */}
                    {['field_equals', 'field_not_equals', 'field_contains', 'field_not_empty', 'numeric_greater_than', 'numeric_less_than'].includes(
                      activeRule.conditionType
                    ) && (
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">בחר שדה לבדיקה</label>
                        <select
                          value={activeRule.conditionFieldKey || ''}
                          onChange={(e) =>
                            handleUpdateActiveRule({ conditionFieldKey: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">-- בחר שדה --</option>
                          {form.steps.map((step) => (
                            <option key={step.id} value={step.mappingKey || step.id}>
                              {step.title} ({step.mappingKey || step.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Value input for comparison */}
                    {['field_equals', 'field_not_equals', 'field_contains', 'numeric_greater_than', 'numeric_less_than'].includes(
                      activeRule.conditionType
                    ) && (
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">ערך להשוואה</label>
                        <input
                          type="text"
                          value={activeRule.conditionValue || ''}
                          onChange={(e) =>
                            handleUpdateActiveRule({ conditionValue: e.target.value })
                          }
                          placeholder="לדוגמה: כן, VIP, 5000"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}

                    {/* Score Threshold */}
                    {activeRule.conditionType === 'score_gte' && (
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">סף ציון איכות (1-100)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={activeRule.conditionScoreThreshold || 80}
                          onChange={(e) =>
                            handleUpdateActiveRule({
                              conditionScoreThreshold: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Tags Toolbar (צירוף תוויות דינמיות) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>תוויות דינמיות לשילוב בהודעה (לחץ להטמעה):</span>
                    </label>
                  </div>

                  {/* Predefined Tags */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto">
                    {AVAILABLE_DYNAMIC_TAGS.map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTagAtCursor(t.tag)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-mono transition-colors shadow-xs"
                        title={t.label}
                      >
                        {t.tag}
                      </button>
                    ))}

                    {/* Step Fields Tags */}
                    {form.steps.map((step) => {
                      const tag = `{{${step.mappingKey || step.id}}}`;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => insertTagAtCursor(tag)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-mono transition-colors shadow-xs"
                          title={`ערך השדה "${step.title}"`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Template Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    נוסח הודעת הוואטסאפ:
                  </label>
                  <textarea
                    rows={6}
                    value={activeRule.messageTemplate}
                    onChange={(e) => handleUpdateActiveRule({ messageTemplate: e.target.value })}
                    placeholder="הזן את נוסח ההודעה. ניתן לשלב כל תגית דינמית..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Live Preview & Direct Test Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* WhatsApp Preview Bubble */}
                  <div className="p-4 bg-[#0b141a] rounded-2xl border border-slate-700 space-y-2 text-white">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                      <span className="font-bold">תצוגה מקדימה (WhatsApp Preview):</span>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    </div>

                    <div className="bg-[#005c4b] text-slate-100 p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-sm font-sans max-h-48 overflow-y-auto">
                      {samplePreviewText || 'ההודעה ריקה'}
                    </div>
                  </div>

                  {/* Test Dispatch Box */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      בדיקת שליחה ישירה בזמן אמת:
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          placeholder="052-1234567"
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleTestSend}
                          disabled={isSendingTest || !testPhone}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
                        >
                          {isSendingTest ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>שלח בדיקה</span>
                        </button>
                      </div>

                      {testResult && (
                        <div
                          className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                            testResult.success
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {testResult.success ? (
                            <CheckCircle className="w-4 h-4 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                          )}
                          <span>{testResult.msg}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
                בחר או צור תרחיש כדי להתחיל לערוך.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function createDefaultRule(form: SmartFormDefinition): FormWhatsAppRule {
  return {
    id: 'rule_welcome',
    name: 'הודעת תודה ואישור פנייה ללקוח',
    enabled: true,
    recipientType: 'submitter',
    conditionType: 'always',
    messageTemplate: `שלום {{conta_name}},\nתודה שפנית אלינו דרך טופס "{{form_title}}".\n\nקיבלנו את פנייתך בהצלחה ופרטייך נרשמו במערכת.\nניצור עמך קשר בהקדם למספר {{conta_phone}}.\n\nבברכה,\nצוות השירות`,
  };
}
