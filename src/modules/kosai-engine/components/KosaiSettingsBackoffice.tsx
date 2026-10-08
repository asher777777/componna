import React, { useState, useEffect, useRef } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { kosaiRulesService, KosaiAnalyticsLog } from '../services/kosaiFirestoreService';
import { KosaiRule, KosaiCapability } from '../types';
import { Bot, Plus, Trash2, Sparkles, Layout, Briefcase, Activity, Target, Sliders, LineChart, Database, Zap, X } from 'lucide-react';
import { KOSAI_SUPPORTED_MODULES } from '../config/kosaiModules';
import { KOSAI_TEMPLATES } from '../config/kosaiTemplates';
import { generateAgentPromptWithAi } from '../api/kosaiApi';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { clsx } from 'clsx';

const CAPABILITY_LABELS: Record<string, string> = {
  'CODE_GENERATION': 'כתיבת קוד למערכת',
  'PDF_READING': 'קריאת מסמכי PDF',
  'WEB_SEARCH': 'חיפוש מידע ברשת',
  'IMAGE_GENERATION': 'יצירת תמונות',
  'VIDEO_GENERATION': 'עריכת וידאו',
  'DEEP_RESEARCH': 'מחקר מעמיק במאגרים',
};

const DATA_SOURCES_LABELS: Record<string, string> = {
  [SYSTEM_COLLECTIONS.PAGES]: 'האתרים ועמודי הנחיתה שלי',
  [SYSTEM_COLLECTIONS.SMART_FORMS]: 'הטפסים והשאלונים שיצרתי',
  [SYSTEM_COLLECTIONS.CONTACTS]: 'מאגר הלקוחות (CRM)',
  [SYSTEM_COLLECTIONS.MEDIA_ITEMS]: 'ספריית המדיה האישית',
  [SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS]: 'עסקאות והכנסות',
  [SYSTEM_COLLECTIONS.BRAND_DNA_DOC]: 'הגדרות המותג שלי',
  [SYSTEM_COLLECTIONS.VIDEO_PROJECTS]: 'סרטי הוידאו שלי',
};

// Cashwan Branding: Tooltip component (Mobile First, Click to open)
const InfoTooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block ml-1.5 z-10" ref={ref}>
      <span 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-[11px] font-black text-purple-400 hover:text-purple-600 transition-colors border border-purple-200 hover:border-purple-400 rounded-full w-4 h-4 inline-flex items-center justify-center bg-purple-50/50"
        title="מידע נוסף"
      >
        ?
      </span>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-3 bg-purple-900 text-white text-xs rounded-xl shadow-xl z-20 border border-purple-800">
          <p className="leading-relaxed font-medium">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-900"></div>
        </div>
      )}
    </div>
  );
};

export const KosaiSettingsBackoffice: React.FC = () => {
  const { db, purchasedModules } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [rules, setRules] = useState<KosaiRule[]>([]);
  const [analytics, setAnalytics] = useState<KosaiAnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter modules based on what the user actually purchased (Cashwan Business Logic)
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
    const defaultModule = moduleId ? availableModules.find(m => m.id === moduleId) : null;
    const newRule: KosaiRule = {
      id: `rule_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      name: defaultModule ? `סוכן עבור ${defaultModule.name}` : 'סוכן חדש',
      slugPattern: defaultModule?.route || '',
      moduleId: defaultModule?.id || '',
      systemPromptAddon: '',
      isActive: true,
      enabledCapabilities: [],
      allowedDataSources: [],
      toneOfVoice: { professionalism: 50, detail: 50, creativity: 50 },
      createdAt: Date.now()
    };
    
    await kosaiRulesService.saveRule(db, tenantId, newRule);
    setRules(prev => [newRule, ...prev]);
  };

  const handleSeedDefaultAgents = async () => {
    if (!db) return;
    setLoading(true);
    for (const mod of availableModules) {
      if (!rules.find(r => r.moduleId === mod.id)) {
        await handleCreateRule(mod.id);
      }
    }
    loadData();
  };

  const handleUpdateRule = async (updated: KosaiRule) => {
    setRules(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (db) {
      await kosaiRulesService.saveRule(db, tenantId, updated);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!db || !window.confirm('האם אתה בטוח שברצונך למחוק את הסוכן?')) return;
    setRules(prev => prev.filter(r => r.id !== ruleId));
    await kosaiRulesService.deleteRule(db, tenantId, ruleId);
  };

  const handleGeneratePrompt = async (rule: KosaiRule) => {
    const mod = availableModules.find(m => m.id === rule.moduleId);
    const modName = mod ? mod.name : rule.moduleId;
    const caps = rule.enabledCapabilities.map(c => CAPABILITY_LABELS[c as string] || c);
    
    const tempRule = { ...rule, systemPromptAddon: 'Kosun AI חושב ומנסח כעת פרומפט מדויק עבורך...' };
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
    <div className="min-h-screen p-12 text-center bg-slate-50 text-slate-800" style={{ fontFamily: 'Heebo, sans-serif' }}>
      טוען נתונים למערכת...
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans" dir="rtl" style={{ fontFamily: 'Heebo, sans-serif' }}>
      
      {/* Top Navigation (Cashwan Mobile First, Clean Top Nav) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Kosun Agents</h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">ניהול הסוכנים והעוזרים החכמים בעסק שלך</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSeedDefaultAgents} 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
              title="יצירת סוכני ברירת מחדל לכל המודולים"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">חולל סוכני ברירת מחדל</span>
            </button>
            <button 
              onClick={() => handleCreateRule()} 
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-purple-500/20 flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">הוסף סוכן למערכת</span>
              <span className="sm:hidden">חדש</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        
        {/* Dashboard Stats (Bento Grid) */}
        {/* Dashboard Stats (Bento Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'סוכנים פעילים בעסק', value: rules.filter(r => r.isActive).length, icon: Bot, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: 'מודולים שנרכשו (Tenant)', value: purchasedModules.length, icon: Layout, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            { label: 'צריכת טוקנים החודש', value: totalTokens.toLocaleString(), icon: LineChart, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100' },
            { label: 'עלות AI משוערת', value: `₪${totalCostIls.toFixed(4)}`, icon: Zap, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          ].map((stat, i) => (
            <div key={i} className={clsx("p-5 rounded-[2rem] border shadow-sm flex flex-col justify-center relative overflow-hidden", stat.bg, stat.border)}>
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <stat.icon className={clsx("w-24 h-24", stat.color)} />
              </div>
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <stat.icon className={clsx("w-4 h-4", stat.color)} />
                <div className={clsx("text-xs font-bold leading-tight", stat.color)}>{stat.label}</div>
              </div>
              <div className={clsx("text-3xl font-black relative z-10", stat.color)}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Agents List (Bento Layout) */}
        <div className="space-y-6">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 relative group transition-all">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input 
                      type="text" 
                      value={rule.name} 
                      placeholder="שם הסוכן..."
                      onChange={e => handleUpdateRule({ ...rule, name: e.target.value })}
                      className="text-2xl font-black text-slate-900 bg-transparent border-b-2 border-transparent focus:border-slate-400 focus:outline-none transition-colors w-full sm:w-auto"
                    />
                    <button 
                      onClick={() => handleUpdateRule({ ...rule, isActive: !rule.isActive })}
                      className={clsx("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none", rule.isActive ? "bg-purple-600" : "bg-slate-300")}
                    >
                      <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", rule.isActive ? "-translate-x-6" : "-translate-x-1")} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-sm font-medium text-slate-500">
                      סוכן המשויך למערכת:
                    </span>
                    <select
                      value={rule.moduleId || ''}
                      onChange={e => {
                        const mId = e.target.value;
                        const m = availableModules.find(x => x.id === mId);
                        handleUpdateRule({ ...rule, moduleId: mId, slugPattern: m?.route || '' });
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 focus:ring-0 focus:border-slate-400 outline-none cursor-pointer"
                    >
                      <option value="">-- בחר רכיב מערכת --</option>
                      {availableModules.map(m => (
                        <option key={m.id} value={m.id}>
                          {purchasedModules.includes(m.id) ? '✅ ' : '🔒 '}{m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDeleteRule(rule.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                  title="מחק סוכן"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Grid 2 Columns for Agent Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* Left Side: Capabilities & DB */}
                <div className="space-y-6">
                  
                  <details className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        הגדרות מתקדמות - יכולות וגישה לנתונים
                      </div>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24" className="w-5 h-5 text-slate-400"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-8">
                      {/* Capabilities */}
                      <div>
                        <label className="text-sm font-bold text-slate-800 flex items-center mb-3 mt-4">
                          מה הסוכן מסוגל לעשות?
                          <InfoTooltip text="סמן את היכולות המורשות שיעמדו לרשות הסוכן שלך בעת ביצוע משימות אוטומטיות במערכת." />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(CAPABILITY_LABELS).map(([cap, label]) => {
                            const hasCap = rule.enabledCapabilities.includes(cap as KosaiCapability);
                            return (
                              <label key={cap} className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", hasCap ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
                                <input
                                  type="checkbox"
                                  checked={hasCap}
                                  onChange={() => {
                                    const newCaps = hasCap 
                                      ? rule.enabledCapabilities.filter(c => c !== cap)
                                      : [...rule.enabledCapabilities, cap as KosaiCapability];
                                    handleUpdateRule({ ...rule, enabledCapabilities: newCaps });
                                  }}
                                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 bg-white"
                                />
                                <span className="text-sm font-bold">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Data Sources */}
                      <div>
                        <label className="text-sm font-bold text-slate-800 flex items-center mb-3">
                          לאילו נתונים בעסק יש לו גישה?
                          <InfoTooltip text="מאפשר לסוכן גישה בזמן אמת לשלוף ולחקור מידע מתוך מאגרי המידע שבחרת ב-Tenant שלך." />
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(DATA_SOURCES_LABELS).map(([col, label]) => {
                            const hasAccess = (rule.allowedDataSources || []).includes(col);
                            return (
                              <label key={col} className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", hasAccess ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
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
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="text-xs font-bold truncate">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Right Side: Brain & Tone */}
                <div className="space-y-6">
                  
                  {/* Persona Configuration */}
                  <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                    <label className="text-sm font-bold text-slate-800 flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        אופי ומומחיות הסוכן
                        <InfoTooltip text="בחר תבנית אישיותית מוכנה מראש שתנחה את Kosun כיצד להתנהג ולהגיב, או כתוב פרומפט משלך." />
                      </div>
                      <select
                        value={rule.templateId || ''}
                        onChange={e => applyTemplate(rule, e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm outline-none cursor-pointer"
                      >
                        <option value="">תבניות AI לבחירה...</option>
                        {KOSAI_TEMPLATES.filter(t => t.targetModules.includes('all') || t.targetModules.includes(rule.moduleId || '')).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </label>

                    <div className="relative">
                      <textarea 
                        value={rule.systemPromptAddon || ''} 
                        onChange={e => handleUpdateRule({ ...rule, systemPromptAddon: e.target.value })}
                        placeholder="הסבר במילים פשוטות ל-Kosun איזה סוג סוכן אתה צריך שיהיה, או בחר תבנית..."
                        className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none shadow-inner"
                      />
                      <button 
                        onClick={() => handleGeneratePrompt(rule)}
                        disabled={!rule.moduleId}
                        className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-purple-500/20"
                      >
                        <Sparkles className="w-3 h-3" />
                        נסח לי פרומפט
                      </button>
                    </div>
                  </div>

                  {/* Tone of Voice */}
                  <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200">
                    <label className="text-sm font-bold text-slate-800 flex items-center mb-6">
                      סגנון שיחה
                      <InfoTooltip text="כוונן את האופי והטון שבו הסוכן מתנסח במערכת ומול הלקוחות." />
                    </label>
                    <div className="space-y-6">
                      
                      <div className="relative">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 absolute -top-5 w-full">
                          <span>זורם וקליל</span>
                          <span>רשמי ומקצועי</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={rule.toneOfVoice?.professionalism ?? 50}
                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, professionalism: Number(e.target.value) } })}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>

                      <div className="relative">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 absolute -top-5 w-full">
                          <span>קצר ולעניין</span>
                          <span>מפורט ומעמיק</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={rule.toneOfVoice?.detail ?? 50}
                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, detail: Number(e.target.value) } })}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div className="relative">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 absolute -top-5 w-full">
                          <span>שמרני ומדויק</span>
                          <span>נועז ויצירתי</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={rule.toneOfVoice?.creativity ?? 50}
                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, creativity: Number(e.target.value) } })}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="p-16 text-center rounded-[2rem] bg-white border border-slate-200 shadow-sm">
              <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Target className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">אין לך סוכנים פעילים כרגע</h2>
              <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-8">
                זה הזמן לגייס את איש הצוות הראשון שלך שיעזור לך לנהל ולעצב את המערכת.
              </p>
              <button 
                onClick={() => handleCreateRule()} 
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 text-white rounded-xl font-bold transition-transform hover:scale-105"
              >
                הוסף את הסוכן הראשון
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
