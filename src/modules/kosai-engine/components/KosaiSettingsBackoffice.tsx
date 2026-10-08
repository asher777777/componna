import React, { useState, useEffect } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { kosaiRulesService, KosaiAnalyticsLog } from '../services/kosaiFirestoreService';
import { KosaiRule, KosaiCapability } from '../types';
import { Bot, Plus, Save, Trash2, Edit, Sparkles, Layout, Sun, Moon, Briefcase, Activity, Target, Sliders, LineChart, Database } from 'lucide-react';
import { KOSAI_SUPPORTED_MODULES } from '../config/kosaiModules';
import { KOSAI_TEMPLATES } from '../config/kosaiTemplates';
import { generateAgentPromptWithAi } from '../api/kosaiApi';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { clsx } from 'clsx';

const CAPABILITY_LABELS: Record<string, string> = {
  'CODE_GENERATION': 'כתיבת קוד',
  'PDF_READING': 'קריאת PDF',
  'WEB_SEARCH': 'חיפוש בדפדפן',
  'IMAGE_GENERATION': 'יצירת תמונות',
  'VIDEO_GENERATION': 'יצירת סרטים',
  'DEEP_RESEARCH': 'מחקר מעמיק',
};

// Map friendly names to collections for the Data Sources section
const DATA_SOURCES_LABELS: Record<string, string> = {
  [SYSTEM_COLLECTIONS.PAGES]: 'עמודי נחיתה ואתרים (Pages)',
  [SYSTEM_COLLECTIONS.SMART_FORMS]: 'טפסים חכמים (Smart Forms)',
  [SYSTEM_COLLECTIONS.CONTACTS]: 'לקוחות ולידים (CRM Contacts)',
  [SYSTEM_COLLECTIONS.MEDIA_ITEMS]: 'ספריית המדיה (Media Items)',
  [SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS]: 'עסקאות וסליקה (Transactions)',
  [SYSTEM_COLLECTIONS.BRAND_DNA_DOC]: 'מרכז מיתוג גלובלי (Brand DNA)',
  [SYSTEM_COLLECTIONS.VIDEO_PROJECTS]: 'פרויקטים בוידאו (Video Studio)',
};

export const KosaiSettingsBackoffice: React.FC = () => {
  const { db, purchasedModules } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [rules, setRules] = useState<KosaiRule[]>([]);
  const [analytics, setAnalytics] = useState<KosaiAnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Always show all KOSAI supported modules, but we can visually group/highlight purchased ones if needed
  // For the selector, the user asked to "choose a system component" and to show components from the subscription
  const availableModules = KOSAI_SUPPORTED_MODULES;

  const loadData = async () => {
    if (!db) return;
    setLoading(true);
    const r = await kosaiRulesService.getRules(db, tenantId);
    const a = await kosaiRulesService.getRecentAnalytics(db, tenantId);
    setRules(r);
    setAnalytics(a);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [db, tenantId]);

  const handleCreateRule = async (moduleId?: string) => {
    if (!db) return;
    const defaultModule = availableModules.find(m => m.id === moduleId) || availableModules[0];
    const newRule: KosaiRule = {
      id: `rule_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      name: `סוכן עבור ${defaultModule.name}`,
      moduleId: defaultModule.id,
      slugPattern: defaultModule.route,
      systemPromptAddon: 'אתה סוכן AI חכם שמנהל את הרכיב הנוכחי עבור הלקוח העסקי. עזור לו להגיע לתוצאות מעולות.',
      enabledCapabilities: ['WEB_SEARCH', 'DEEP_RESEARCH'],
      allowedDataSources: [], // start empty
      isActive: true,
      toneOfVoice: { professionalism: 80, detail: 50, creativity: 50 },
      createdAt: Date.now()
    };
    await kosaiRulesService.saveRule(db, tenantId, newRule);
    loadData();
  };

  // Requirement B: "Create a default agent for each system component"
  const handleSeedDefaultAgents = async () => {
    if (!db) return;
    setLoading(true);
    // Find modules that don't have a rule yet
    for (const mod of availableModules) {
      if (!rules.find(r => r.moduleId === mod.id)) {
        await handleCreateRule(mod.id);
      }
    }
    loadData();
  };

  const handleUpdateRule = async (rule: KosaiRule) => {
    if (!db) return;
    setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    await kosaiRulesService.saveRule(db, tenantId, rule);
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm('האם אתה בטוח שברצונך למחוק סוכן זה?')) {
      await kosaiRulesService.deleteRule(db, tenantId, id);
      loadData();
    }
  };

  const handleGeneratePrompt = async (rule: KosaiRule) => {
    const mod = availableModules.find(m => m.id === rule.moduleId);
    const modName = mod ? mod.name : rule.moduleId;
    const caps = rule.enabledCapabilities.map(c => CAPABILITY_LABELS[c as string] || c);
    
    const tempRule = { ...rule, systemPromptAddon: 'ה-AI מנסח כעת פרומפט עסקי מותאם עבורך...' };
    setRules(prev => prev.map(r => r.id === rule.id ? tempRule : r));

    const { prompt, usage } = await generateAgentPromptWithAi(modName, caps, rule.allowedDataSources || [], rule.toneOfVoice || { professionalism: 50, detail: 50, creativity: 50 });
    
    if (db) {
      await kosaiRulesService.logAiUsage(db, tenantId, {
        ruleId: rule.id,
        moduleName: 'backoffice-prompt-generator',
        actionType: 'GENERATE_PROMPT',
        usage
      });
    }

    handleUpdateRule({ ...rule, systemPromptAddon: prompt });
  };

  const applyTemplate = (rule: KosaiRule, templateId: string) => {
    const template = KOSAI_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      handleUpdateRule({
        ...rule,
        templateId,
        systemPromptAddon: template.prompt,
        toneOfVoice: template.toneOfVoice
      });
    }
  };

  const totalCostIls = analytics.reduce((acc, log) => acc + (log.usage.estimatedCostILS || 0), 0);
  const totalTokens = analytics.reduce((acc, log) => acc + (log.usage.totalTokens || 0), 0);

  if (loading) return (
    <div className={clsx("min-h-screen p-12 text-center", theme === 'light' ? "bg-slate-50 text-slate-800" : "bg-slate-950 text-white")}>
      טוען מערך סוכנים חכמים...
    </div>
  );

  return (
    <div className={clsx("min-h-screen transition-colors duration-300 pb-20", theme === 'light' ? "bg-slate-50" : "bg-slate-950")} dir="rtl">
      <div className="max-w-6xl mx-auto p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className={clsx("text-3xl font-black flex items-center gap-3", theme === 'light' ? "text-slate-900" : "text-white")}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                <Briefcase className="w-6 h-6" />
              </div>
              מנהל סוכני KOSAI
            </h1>
            <p className={clsx("mt-2 font-medium", theme === 'light' ? "text-slate-500" : "text-slate-400")}>
              נהל את צוות העוזרים החכמים שלך. הגדר תבניות, התאם טון דיבור, ונהל הרשאות למאגרי המידע.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={clsx("p-3 rounded-xl transition-all border", theme === 'light' ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800")}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleSeedDefaultAgents} 
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              חולל סוכני ברירת מחדל
            </button>
            <button 
              onClick={() => handleCreateRule()} 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              גייס סוכן חדש
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'סוכנים פעילים', value: rules.filter(r => r.isActive).length, icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'רכיבים במנוי (Tenant)', value: purchasedModules.length, icon: Layout, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { label: 'טוקנים שנוצלו החודש', value: totalTokens.toLocaleString(), icon: LineChart, color: 'text-sky-500', bg: 'bg-sky-500/10' },
            { label: 'עלות משוערת (₪)', value: `₪${totalCostIls.toFixed(4)}`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <div key={i} className={clsx("p-6 rounded-2xl border flex items-center gap-4", theme === 'light' ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800")}>
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className={clsx("text-sm font-medium", theme === 'light' ? "text-slate-500" : "text-slate-400")}>{stat.label}</div>
                <div className={clsx("text-xl font-black mt-1", theme === 'light' ? "text-slate-900" : "text-white")}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules Grid */}
        <div className="space-y-6">
          {rules.map(rule => (
            <div key={rule.id} className={clsx("p-6 rounded-2xl border transition-all", theme === 'light' ? "bg-white border-slate-200 shadow-md" : "bg-slate-900 border-slate-800")}>
              
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-200/20">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <input 
                      type="text" 
                      value={rule.name} 
                      onChange={e => handleUpdateRule({ ...rule, name: e.target.value })}
                      className={clsx("text-xl font-black bg-transparent border-b-2 border-transparent focus:border-purple-500 focus:outline-none transition-colors", theme === 'light' ? "text-slate-900" : "text-white")}
                    />
                    
                    <button 
                      onClick={() => handleUpdateRule({ ...rule, isActive: !rule.isActive })}
                      className={clsx("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2", rule.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")}
                    >
                      <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", rule.isActive ? "-translate-x-6" : "-translate-x-1")} />
                    </button>
                    <span className={clsx("text-sm font-medium", rule.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>
                      {rule.isActive ? 'סוכן פעיל' : 'במנוחה'}
                    </span>
                  </div>
                  
                  {/* Module Selector - requirement A */}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className={clsx("text-sm font-medium", theme === 'light' ? "text-slate-600" : "text-slate-400")}>משויך למערכת:</span>
                    <select
                      value={rule.moduleId || ''}
                      onChange={e => {
                        const mId = e.target.value;
                        const m = availableModules.find(x => x.id === mId);
                        handleUpdateRule({ ...rule, moduleId: mId, slugPattern: m?.route || '' });
                      }}
                      className={clsx("p-2 rounded-lg border text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer", theme === 'light' ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-white")}
                    >
                      <option value="">-- בחר רכיב מערכת --</option>
                      {availableModules.map(m => (
                        <option key={m.id} value={m.id}>
                          {purchasedModules.includes(m.id) ? '✅ ' : '🔒 '}{m.name}
                        </option>
                      ))}
                    </select>

                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                    <span className={clsx("text-sm font-medium mt-2 sm:mt-0", theme === 'light' ? "text-slate-600" : "text-slate-400")}>תבנית אישיות:</span>
                    <select
                      value={rule.templateId || ''}
                      onChange={e => applyTemplate(rule, e.target.value)}
                      className={clsx("p-2 rounded-lg border text-sm mt-2 sm:mt-0 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer", theme === 'light' ? "bg-purple-50 border-purple-200 text-purple-800" : "bg-purple-900/30 border-purple-500/30 text-purple-300")}
                    >
                      <option value="">-- בחר תבנית מוכנה --</option>
                      {KOSAI_TEMPLATES.filter(t => t.targetModules.includes('all') || t.targetModules.includes(rule.moduleId || '')).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button onClick={() => handleDelete(rule.id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Two Column Layout for Prompt & Sliders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                
                {/* Prompt Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={clsx("text-sm font-bold flex items-center gap-2", theme === 'light' ? "text-slate-700" : "text-slate-300")}>
                      <Target className="w-4 h-4 text-purple-500" />
                      הנחיות התנהגות (Prompt)
                      <span className="text-[10px] font-normal text-slate-400 mr-2 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full">ניתן לעריכה</span>
                    </label>
                    <button 
                      onClick={() => handleGeneratePrompt(rule)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md hover:scale-105 transition-transform"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      נסח אוטומטית
                    </button>
                  </div>
                  <textarea 
                    value={rule.systemPromptAddon}
                    onChange={e => handleUpdateRule({ ...rule, systemPromptAddon: e.target.value })}
                    rows={5}
                    className={clsx("w-full p-4 rounded-xl text-sm border focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none transition-colors", theme === 'light' ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-800/50 border-slate-700 text-slate-200")}
                    placeholder="לדוגמה: אתה מומחה מכירות ועיצוב. עזור ללקוח להעלות את יחס ההמרה..."
                  />
                </div>

                {/* Tone of Voice Sliders */}
                <div>
                  <label className={clsx("text-sm font-bold flex items-center gap-2 mb-4", theme === 'light' ? "text-slate-700" : "text-slate-300")}>
                    <Sliders className="w-4 h-4 text-purple-500" />
                    סגנון וטון דיבור (Tone of Voice)
                  </label>
                  
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-slate-500">
                        <span>הומוריסטי / קליל</span>
                        <span>רשמי / מקצועי</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={rule.toneOfVoice?.professionalism ?? 50}
                        onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, professionalism: Number(e.target.value) } })}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-slate-500">
                        <span>קצר ותמציתי</span>
                        <span>מפורט וחופר</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={rule.toneOfVoice?.detail ?? 50}
                        onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, detail: Number(e.target.value) } })}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-slate-500">
                        <span>שמרני ומדויק</span>
                        <span>נועז ויצירתי</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={rule.toneOfVoice?.creativity ?? 50}
                        onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, creativity: Number(e.target.value) } })}
                        className="w-full accent-pink-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Two Column Layout for Tools & Data Sources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-200/20 pt-6">
                
                {/* Capabilities / Tools */}
                <div>
                  <label className={clsx("text-sm font-bold flex items-center gap-2 mb-4", theme === 'light' ? "text-slate-700" : "text-slate-300")}>
                    <Layout className="w-4 h-4 text-purple-500" />
                    כלים מורשים לסוכן
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CAPABILITY_LABELS).map(([cap, label]) => {
                      const hasCap = rule.enabledCapabilities.includes(cap as KosaiCapability);
                      return (
                        <label key={cap} className={clsx("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors", hasCap ? (theme === 'light' ? "bg-purple-50 border-purple-200" : "bg-purple-900/20 border-purple-500/30") : (theme === 'light' ? "bg-white border-slate-200" : "bg-slate-800/50 border-slate-700"))}>
                          <input
                            type="checkbox"
                            checked={hasCap}
                            onChange={() => {
                              const newCaps = hasCap 
                                ? rule.enabledCapabilities.filter(c => c !== cap)
                                : [...rule.enabledCapabilities, cap as KosaiCapability];
                              handleUpdateRule({ ...rule, enabledCapabilities: newCaps });
                            }}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className={clsx("text-sm font-medium", theme === 'light' ? "text-slate-700" : "text-slate-200")}>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Data Sources / Collections */}
                <div>
                  <label className={clsx("text-sm font-bold flex items-center gap-2 mb-4", theme === 'light' ? "text-slate-700" : "text-slate-300")}>
                    <Database className="w-4 h-4 text-indigo-500" />
                    גישה למאגרי נתונים (Data Sources)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(DATA_SOURCES_LABELS).map(([col, label]) => {
                      const hasAccess = (rule.allowedDataSources || []).includes(col);
                      return (
                        <label key={col} className={clsx("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors", hasAccess ? (theme === 'light' ? "bg-indigo-50 border-indigo-200" : "bg-indigo-900/20 border-indigo-500/30") : (theme === 'light' ? "bg-white border-slate-200" : "bg-slate-800/50 border-slate-700"))}>
                          <input
                            type="checkbox"
                            checked={hasAccess}
                            onChange={() => {
                              const curr = rule.allowedDataSources || [];
                              const newSources = hasAccess 
                                ? curr.filter(c => c !== col)
                                : [...curr, col];
                              handleUpdateRule({ ...rule, allowedDataSources: newSources });
                            }}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className={clsx("text-sm font-medium truncate", theme === 'light' ? "text-slate-700" : "text-slate-200")}>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className={clsx("text-xs mt-3", theme === 'light' ? "text-slate-500" : "text-slate-400")}>
                    * מאפשר לסוכן לשלוף ולחקור נתונים מזמן אמת מתוך ה-Tenant שלך.
                  </p>
                </div>

              </div>

            </div>
          ))}

          {rules.length === 0 && (
            <div className={clsx("p-16 text-center rounded-3xl border-2 border-dashed", theme === 'light' ? "border-slate-300 bg-slate-50" : "border-slate-800 bg-slate-900/50")}>
              <div className="w-20 h-20 mx-auto bg-purple-100 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-purple-500" />
              </div>
              <h2 className={clsx("text-2xl font-black mb-2", theme === 'light' ? "text-slate-800" : "text-white")}>אין לך סוכנים פעילים עדיין</h2>
              <p className={clsx("mb-6 max-w-md mx-auto", theme === 'light' ? "text-slate-500" : "text-slate-400")}>
                צור את איש הצוות הראשון שלך שיעזור לך לנהל ולעצב את הפלטפורמות שרכשת באופן אוטומטי.
              </p>
              <button 
                onClick={() => handleCreateRule()} 
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-transform hover:scale-105"
              >
                גייס סוכן עכשיו
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
