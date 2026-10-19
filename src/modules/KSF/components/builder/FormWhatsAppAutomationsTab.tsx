import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SmartFormDefinition, FormWhatsAppRule, FormWhatsAppConditionType, FormWhatsAppRecipientType } from '../../types';
import { AVAILABLE_DYNAMIC_TAGS, renderWhatsAppMessage } from '../../services/whatsappTemplateService';
import { getGreenApiService } from '../../services/formWhatsAppService';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { WhatsAppContract } from '../../../../core/contracts';
import { useTenantScope } from '../../../../core/tenant';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';
import { useBrandDna } from '../../../KosBranding/hooks/useBrandDna';
import { SavedWhatsAppTemplate } from '../../types/whatsapp.types';
import {
  getSavedWhatsAppTemplates,
  saveWhatsAppTemplate,
  deleteWhatsAppTemplate,
} from '../../services/whatsappTemplateStorageService';
import {
  generateBrandedWhatsAppTemplates,
  extractBrandingEssence,
} from '../../services/aiWhatsAppTemplateService';
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
  Clock,
  ShieldCheck,
  BookOpen,
  BookmarkPlus,
  Save,
  X,
  Loader2,
  Bot,
  Search,
} from 'lucide-react';

export interface FormWhatsAppAutomationsTabProps {
  form: SmartFormDefinition;
  onChange: (updatedForm: SmartFormDefinition) => void;
}

export const FormWhatsAppAutomationsTab: React.FC<FormWhatsAppAutomationsTabProps> = ({
  form,
  onChange,
}) => {
  const { tenantApiKeys, apiKeys, openConnectorModal } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const { getScopedCollectionPath } = useTenantScope();
  const brandContext = useBrandDna();
  const brandDna = brandContext?.brandDna;

  const templatesCollection = getScopedCollectionPath(SYSTEM_COLLECTIONS.KOS_WHATSUP_TEMPLATES);

  // Consume WhatsApp contract from HostCapabilities (Monopoly Law)
  const whatsappContract =
    getCapability<WhatsAppContract>('whatsapp') ||
    getCapability<WhatsAppContract>('whatsapp-service') ||
    getCapability<WhatsAppContract>('KosWhatsUp') ||
    getCapability<WhatsAppContract>('koswhatsup');

  const isGreenApiConnected = Boolean(
    whatsappContract?.isConfigured() ||
    (apiKeys.greenApiInstanceId && apiKeys.greenApiToken) ||
    (tenantApiKeys?.greenApiInstanceId && tenantApiKeys?.greenApiToken)
  );

  const rules: FormWhatsAppRule[] = form.whatsappRules || [];
  const isEnabled = form.whatsappAutomationEnabled ?? false;

  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(
    rules.length > 0 ? rules[0].id : null
  );

  // Saved templates state
  const [savedTemplates, setSavedTemplates] = useState<SavedWhatsAppTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [saveTemplateSuccess, setSaveTemplateSuccess] = useState(false);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');

  // AI branded templates state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTemplates, setAiTemplates] = useState<SavedWhatsAppTemplate[]>([]);
  const [savedAiTemplateIds, setSavedAiTemplateIds] = useState<Record<string, boolean>>({});

  // Load saved system templates
  const loadTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const items = await getSavedWhatsAppTemplates(undefined, templatesCollection);
      setSavedTemplates(items);
    } catch (e) {
      console.warn('Failed to load saved templates:', e);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [templatesCollection]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

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

  const brandingEssencePreview = useMemo(() => {
    return extractBrandingEssence(brandDna);
  }, [brandDna]);

  // Save current active rule message as a reusable system template
  const handleSaveCurrentAsTemplate = async () => {
    if (!activeRule?.messageTemplate?.trim()) return;
    try {
      await saveWhatsAppTemplate(
        {
          name: activeRule.name || 'תבנית הודעת וואטסאפ',
          messageTemplate: activeRule.messageTemplate,
          category: (form.category?.includes('סליקה') ? 'payment' : form.category?.includes('תרומ') ? 'donation' : 'leads') as any,
          tags: ['טופס', form.title],
        },
        undefined,
        templatesCollection
      );
      setSaveTemplateSuccess(true);
      setTimeout(() => setSaveTemplateSuccess(false), 2500);
      loadTemplates();
    } catch (e: any) {
      alert('שגיאה בשמירת התבנית למערכת: ' + (e?.message || ''));
    }
  };

  // Apply a saved system template to the active rule
  const handleApplySavedTemplate = (template: SavedWhatsAppTemplate) => {
    if (!activeRule) return;
    handleUpdateActiveRule({
      messageTemplate: template.messageTemplate,
      name: template.name || activeRule.name,
    });
    setIsTemplatesModalOpen(false);
  };

  // Delete a saved template from system
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('האם למחוק תבנית זו מספריית המערכת?')) return;
    try {
      await deleteWhatsAppTemplate(templateId, undefined, templatesCollection);
      loadTemplates();
    } catch (e: any) {
      alert('שגיאה במחיקת התבנית');
    }
  };

  // Generate branded templates using AI and brand essence
  const handleGenerateAiTemplates = async () => {
    setIsGeneratingAi(true);
    try {
      const generated = await generateBrandedWhatsAppTemplates({
        form,
        brandDna,
      });
      setAiTemplates(generated);
    } catch (e: any) {
      alert('חלה שגיאה ביצירת תבניות ממותגות ב-AI: ' + (e?.message || ''));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save an AI generated template into system library
  const handleSaveAiTemplate = async (tpl: SavedWhatsAppTemplate) => {
    try {
      await saveWhatsAppTemplate(tpl, undefined, templatesCollection);
      setSavedAiTemplateIds((prev) => ({ ...prev, [tpl.id]: true }));
      loadTemplates();
    } catch (e: any) {
      alert('שגיאה בשמירת התבנית למערכת');
    }
  };

  // Test live dispatch - tries WhatsAppContract first (Zero Cross-Import Monopoly), then greenService fallback
  const handleTestSend = async () => {
    if (!activeRule || !testPhone) {
      alert('נא להזין מספר טלפון לבדיקה');
      return;
    }

    if (!isGreenApiConnected) {
      setTestResult({
        success: false,
        msg: 'שירות וואטסאפ אינו מחובר. לחץ על הגדרות להזנת פרטי Green-API.',
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

      // Priority 1: Use WhatsApp Contract
      if (whatsappContract && whatsappContract.isConfigured()) {
        const res = await whatsappContract.sendMessage(testPhone, sampleRendered);
        if (res?.success) {
          setTestResult({
            success: true,
            msg: `הודעת בדיקה נשלחה בהצלחה! מזהה: ${res.idMessage || 'נשלח בהצלחה'}`,
          });
        } else {
          setTestResult({
            success: false,
            msg: res?.error || 'שגיאה בשליחת הודעת בדיקה דרך חוזה הוואטסאפ',
          });
        }
      } else {
        // Priority 2: Use direct Green API service
        const greenService = getGreenApiService();
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
          {/* WhatsApp Status Indicator */}
          {isGreenApiConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
              <span>{whatsappContract?.isConfigured() ? 'וואטסאפ מחובר (חוזה KosWhatsUp)' : 'וואטסאפ מחובר (GREEN-API)'}</span>
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

                {/* Cloud Reminders & Contact Card (תזכורות ענן וכרטיס איש קשר) */}
                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>תזמון שליחה (Google Cloud Functions Scheduler):</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      אוטונומי בענן 24/7
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">מתי לשלוח את ההודעה?</label>
                      <select
                        value={activeRule.timing || 'immediate'}
                        onChange={(e) =>
                          handleUpdateActiveRule({
                            timing: e.target.value as 'immediate' | 'delayed_reminder',
                            delayMinutes: e.target.value === 'delayed_reminder' ? (activeRule.delayMinutes || 60) : undefined
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="immediate">⚡ מיידי (בעת הגשת הטופס)</option>
                        <option value="delayed_reminder">⏰ תזכורת ענן אוטומטית (Cloud Reminder)</option>
                      </select>
                    </div>

                    {activeRule.timing === 'delayed_reminder' && (
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">השהיה לתזכורת (בדקות)</label>
                        <select
                          value={activeRule.delayMinutes || 60}
                          onChange={(e) => handleUpdateActiveRule({ delayMinutes: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value={15}>15 דקות לאחר ההרשמה</option>
                          <option value={60}>שעה לאחר ההרשמה</option>
                          <option value={180}>3 שעות לאחר ההרשמה</option>
                          <option value={1440}>24 שעות (יום למחרת)</option>
                          <option value={2880}>יומיים לאחר ההרשמה</option>
                          <option value={4320}>3 ימים לאחר ההרשמה</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Anti-Ban & Statuses Contact Card Toggle */}
                  <div className="pt-2 border-t border-emerald-500/15">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(activeRule.sendContactCard)}
                        onChange={(e) => handleUpdateActiveRule({ sendContactCard: e.target.checked })}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>צרף כרטיס איש קשר רשמי (vCard) לשמירה בזיכרון הליד</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          מאפשר לליד לצפות בסטטוסים שלנו ומונע חסימות והשעיות חשבון (Anti-Ban)
                        </span>
                      </div>
                    </label>
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
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      נוסח הודעת הוואטסאפ:
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. AI Branded Templates Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAiModalOpen(true);
                          if (aiTemplates.length === 0) {
                            handleGenerateAiTemplates();
                          }
                        }}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                        title="יצירת 3 תבניות וואטסאפ ממותגות ב-AI על בסיס תמצית המיתוג"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>יצירת תבניות מיתוג ב-AI</span>
                      </button>

                      {/* 2. System Templates Library Button */}
                      <button
                        type="button"
                        onClick={() => setIsTemplatesModalOpen(true)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="פתיחת ספריית התבניות השמורות במערכת"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>ספריית תבניות ({savedTemplates.length})</span>
                      </button>

                      {/* 3. Save Current as System Template Button */}
                      <button
                        type="button"
                        onClick={handleSaveCurrentAsTemplate}
                        disabled={!activeRule.messageTemplate?.trim()}
                        className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="שמור הודעה זו כתבנית מערכת שמורה לשימוש חוזר בכל טופס"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{saveTemplateSuccess ? 'נשמר בהצלחה!' : 'שמור כתבנית'}</span>
                      </button>
                    </div>
                  </div>

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
      {/* 1. Modal: ספריית תבניות מערכת שמורות */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            dir="rtl"
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    ספריית תבניות הודעות וואטסאפ במערכת
                  </h3>
                  <p className="text-xs text-slate-400">
                    תבניות הודעות שמורות בטננט לשימוש חוזר בכל הטפסים והקמפיינים
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[200px] relative">
                <input
                  type="text"
                  value={templateSearchTerm}
                  onChange={(e) => setTemplateSearchTerm(e.target.value)}
                  placeholder="חיפוש לפי שם תבנית או מילות מפתח..."
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <select
                value={templateCategoryFilter}
                onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">כל הקטגוריות</option>
                <option value="leads">לידים ופניות</option>
                <option value="payment">סליקה ותשלומים</option>
                <option value="donation">תרומות והוראת קבע</option>
                <option value="branded">תבניות ממותגות AI</option>
              </select>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {savedTemplates
                .filter((t) => {
                  const matchCat =
                    templateCategoryFilter === 'all' ||
                    t.category === templateCategoryFilter ||
                    (templateCategoryFilter === 'branded' && t.isAiGenerated);
                  const matchSearch =
                    !templateSearchTerm ||
                    t.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                    t.messageTemplate.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                    t.tags?.some((tag) => tag.toLowerCase().includes(templateSearchTerm.toLowerCase()));
                  return matchCat && matchSearch;
                })
                .map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 rounded-2xl transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {tpl.name}
                        </span>
                        {tpl.isAiGenerated && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI ממותג</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          {tpl.category === 'payment'
                            ? 'סליקה'
                            : tpl.category === 'donation'
                            ? 'תרומות'
                            : tpl.category === 'leads'
                            ? 'לידים'
                            : 'כללי'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplySavedTemplate(tpl)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                          החל על התרחיש
                        </button>
                        {!DEFAULT_WHATSAPP_TEMPLATES.some((d) => d.id === tpl.id) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                            title="מחק תבנית זו"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed border border-slate-100 dark:border-slate-800">
                      {tpl.messageTemplate}
                    </div>

                    {tpl.tags && tpl.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tpl.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {savedTemplates.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>טוען תבניות...</span>
                    </div>
                  ) : (
                    'אין תבניות שמורות כרגע.'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: יצירת תבניות מיתוגיות על ידי ה-AI (על בסיס תמצית המיתוג) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            dir="rtl"
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[88vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    יצירת תבניות הודעות ממותגות ב-AI (Brand WhatsApp AI)
                  </h3>
                  <p className="text-xs text-slate-400">
                    חילוץ תמצית המותג המזוקקת ויצירת 3 תבניות וואטסאפ מלוטשות
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Essence Box (תמצית המיתוג שנשלחת לסוכן) */}
            <div className="p-3.5 bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  תמצית המיתוג שנשלחת לסוכן ה-AI (Brand Essence בלבד):
                </span>
                <span className="text-[10px] font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  ללא עודף נתונים גולמיים
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-indigo-500/10 whitespace-pre-wrap">
                {brandingEssencePreview}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">
                {aiTemplates.length > 0 ? `נוצרו ${aiTemplates.length} תבניות מותג מותאמות` : 'מוכן למחולל'}
              </span>

              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleGenerateAiTemplates}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>הסוכן מייצר תבניות מותג...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>{aiTemplates.length > 0 ? 'חולל שוב תבניות מותג' : 'חולל 3 תבניות מותג ב-AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Templates Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {aiTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-2xl shadow-xs space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {tpl.name}
                    </h4>

                    <div className="flex items-center gap-2">
                      {/* Save to System Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveAiTemplate(tpl)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                          savedAiTemplateIds[tpl.id]
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {savedAiTemplateIds[tpl.id] ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>נשמר במערכת</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 text-slate-500" />
                            <span>שמור במערכת</span>
                          </>
                        )}
                      </button>

                      {/* Apply to Current Rule */}
                      <button
                        type="button"
                        onClick={() => {
                          handleApplySavedTemplate(tpl);
                          setIsAiModalOpen(false);
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        החל על התרחיש
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
                    {tpl.messageTemplate}
                  </div>
                </div>
              ))}

              {isGeneratingAi && (
                <div className="p-10 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                  <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    מנתח את תמצית המותג של "{brandDna?.identity?.companyName || 'הארגון'}"...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    יוצר 3 נוסחי וואטסאפ ממוקדים עם התאמת טון, שפה ותגיות דינמיות.
                  </p>
                </div>
              )}
            </div>
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
