import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { kosaiRulesService, KosaiAnalyticsLog } from '../services/kosaiFirestoreService';
import { KosaiRule, KosaiCapability } from '../types';
import {
  Bot, Plus, Trash2, Sparkles, Layout, Briefcase, Activity, Target,
  Sliders, LineChart, Database, Zap, X, Search, Filter, Check, Eye,
  Code2, FileText, Globe, Image, Film, Layers, CheckSquare, Users,
  CreditCard, ChevronDown, Settings, CheckCircle2, AlertCircle, Info,
  SlidersHorizontal, ChevronLeft, ShieldCheck, ArrowRight
} from 'lucide-react';
import { KOSAI_SUPPORTED_MODULES } from '../config/kosaiModules';
import { KOSAI_TEMPLATES } from '../config/kosaiTemplates';
import { generateAgentPromptWithAi } from '../api/kosaiApi';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { clsx } from 'clsx';

// Capability Definitions with High-Quality Lucide Icons (Cashwan 2026: Zero Emojis)
const CAPABILITIES_META: {
  id: KosaiCapability;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'CODE_GENERATION', label: 'כתיבת קוד', desc: 'יצירה ועדכון קוד מערכת', icon: Code2 },
  { id: 'PDF_READING', label: 'קריאת מסמכים', desc: 'חילוץ ידע מקבצי PDF', icon: FileText },
  { id: 'WEB_SEARCH', label: 'חיפוש ברשת', desc: 'שליפת מידע אונליין', icon: Search },
  { id: 'IMAGE_GENERATION', label: 'יצירת תמונות', desc: 'מחולל ויזואלי חכם', icon: Image },
  { id: 'VIDEO_GENERATION', label: 'עריכת וידאו', desc: 'הפקת תכני וידאו', icon: Film },
  { id: 'DEEP_RESEARCH', label: 'מחקר במאגרים', desc: 'הצלבת נתונים מעמיקה', icon: Layers },
];

// Data Source Definitions with High-Quality Lucide Icons (Cashwan 2026: Zero Emojis)
const DATA_SOURCES_META: {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: SYSTEM_COLLECTIONS.PAGES, label: 'אתרים ודפי נחיתה', desc: 'תוכן העמודים והעיצובים', icon: Globe },
  { id: SYSTEM_COLLECTIONS.SMART_FORMS, label: 'טפסים ושאלונים', desc: 'שדות ולידים מטפסים', icon: CheckSquare },
  { id: SYSTEM_COLLECTIONS.CONTACTS, label: 'מאגר לקוחות (CRM)', desc: 'פרטי לקוחות ורשימות תפוצה', icon: Users },
  { id: SYSTEM_COLLECTIONS.MEDIA_ITEMS, label: 'ספריית מדיה', desc: 'תמונות וקבצי מדיה אישיים', icon: Image },
  { id: SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS, label: 'עסקאות והכנסות', desc: 'נתוני תשלומים ורכישות', icon: CreditCard },
  { id: SYSTEM_COLLECTIONS.BRAND_DNA_DOC, label: 'הגדרות מותג', desc: 'שפת מותג, סלוגן וקהל יעד', icon: Sparkles },
  { id: SYSTEM_COLLECTIONS.VIDEO_PROJECTS, label: 'סרטי וידאו', desc: 'פרויקטים והפקות סרטונים', icon: Film },
];

// Cashwan Branding: Tooltip component (Rule 3: i icon, closes on outside click and has X)
const InfoTooltip = ({ text, title = 'מידע נוסף' }: { text: string; title?: string }) => {
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
    <div className="relative inline-flex items-center ml-1.5 z-20" ref={ref}>
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-300 hover:border-indigo-400 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition"
        title={title}
      >
        i
      </button>
      
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white text-slate-800 text-xs rounded-2xl shadow-xl z-50 border border-slate-200 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <span className="font-bold text-indigo-600 text-[11px]">{title}</span>
            <button 
              type="button"
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="leading-relaxed font-normal text-slate-600 text-[11px]">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
};

export const KosaiSettingsBackoffice: React.FC = () => {
  const { db, purchasedModules } = useSystemConnection();
  const { tenantId } = useTenantScope();
  
  const [rules, setRules] = useState<KosaiRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<KosaiAnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search states (2026 Management Fleet)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);

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
      name: defaultModule ? `סוכן ${defaultModule.name}` : 'סוכן חדש',
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
    setSelectedRuleId(newRule.id);
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
    if (!db || !window.confirm('האם אתה בטוח שברצונך למחוק סוכן זה?')) return;
    setRules(prev => prev.filter(r => r.id !== ruleId));
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(null);
    }
    await kosaiRulesService.deleteRule(db, tenantId, ruleId);
  };

  const handleGeneratePrompt = async (rule: KosaiRule) => {
    const mod = availableModules.find(m => m.id === rule.moduleId);
    const modName = mod ? mod.name : rule.moduleId;
    const caps = rule.enabledCapabilities.map(c => {
      const found = CAPABILITIES_META.find(x => x.id === c);
      return found ? found.label : c;
    });
    
    const tempRule = { ...rule, systemPromptAddon: 'Kosun AI מנסח כעת פרומפט מדויק...' };
    setRules(prev => prev.map(r => r.id === rule.id ? tempRule : r));

    const { prompt, usage } = await generateAgentPromptWithAi(
      modName,
      caps,
      rule.allowedDataSources || [],
      rule.toneOfVoice || { professionalism: 50, detail: 50, creativity: 50 }
    );
    
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

  // Filtered Rules for Fleet Management
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchesSearch = !searchQuery || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        availableModules.find(m => m.id === r.moduleId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? r.isActive :
        !r.isActive;

      const matchesModule = 
        moduleFilter === 'all' ? true :
        r.moduleId === moduleFilter;

      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [rules, searchQuery, statusFilter, moduleFilter, availableModules]);

  const activeRule = useMemo(() => {
    return rules.find(r => r.id === selectedRuleId) || null;
  }, [rules, selectedRuleId]);

  const totalCostIls = analytics.reduce((acc, log) => acc + (log.usage.estimatedCostILS || 0), 0);
  const totalTokens = analytics.reduce((acc, log) => acc + (log.usage.totalTokens || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen p-12 text-center bg-slate-50 text-slate-800 flex flex-col items-center justify-center gap-3" dir="rtl" style={{ fontFamily: 'Heebo, sans-serif' }}>
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-sm text-slate-600">טוען את צוות הסוכנים של קושאן...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50 text-slate-900" dir="rtl" style={{ fontFamily: 'Heebo, sans-serif' }}>
      
      {/* Top Navigation (Cashwan Mobile First, Clean Top Nav) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">הסוכנים של קושאן</h1>
                <InfoTooltip text="כאן מנהלים את צוות סוכני ה-AI הפועלים ברחבי המערכת שלך, קובעים לאילו מאגרי מידע יש להם גישה ומגדירים את יכולות הפעולה שלהם." />
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">מרכז שליטה ובקרה לצוות הדיגיטלי בעסק שלך</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleSeedDefaultAgents} 
              className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
              title="יצירת סוכני ברירת מחדל לכל המודולים"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">חולל סוכני מחדל</span>
            </button>
            <button 
              type="button"
              onClick={() => handleCreateRule()} 
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>סוכן חדש</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        
        {/* KPI & Cost Summary (Collapsible by Default - Rule 7) */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span>{showStats ? 'הסתר נתונים סטטיסטיים' : 'הצג נתוני צריכה ועלויות AI'}</span>
            <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", showStats && "rotate-180")} />
          </button>

          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 animate-fadeIn">
              {[
                { label: 'סוכנים פעילים', value: rules.filter(r => r.isActive).length, icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                { label: 'מודולים שנרכשו', value: purchasedModules.length, icon: Layout, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
                { label: 'טוקנים החודש', value: totalTokens.toLocaleString(), icon: LineChart, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
                { label: 'עלות AI משוערת', value: `₪${totalCostIls.toFixed(4)}`, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              ].map((stat, i) => (
                <div key={i} className={clsx("p-4 rounded-2xl border shadow-sm flex flex-col justify-between", stat.bg, stat.border)}>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>{stat.label}</span>
                    <stat.icon className={clsx("w-4 h-4", stat.color)} />
                  </div>
                  <div className={clsx("text-xl sm:text-2xl font-black", stat.color)}>{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter and Search Bar for Fleet Management (Handles Dozens of Agents) */}
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש סוכן לפי שם או שיוך..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Status Filter Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={clsx("px-2.5 py-1 rounded-lg transition", statusFilter === 'all' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                הכל ({rules.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={clsx("px-2.5 py-1 rounded-lg transition", statusFilter === 'active' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                פעילים ({rules.filter(r => r.isActive).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={clsx("px-2.5 py-1 rounded-lg transition", statusFilter === 'inactive' ? "bg-white text-slate-700 shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                מושהים ({rules.filter(r => !r.isActive).length})
              </button>
            </div>

            {/* Module Filter Select */}
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="p-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">כל המודולים</option>
              {availableModules.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bento Grid: Digital Team Roster */}
        {filteredRules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.map(rule => {
              const assignedModule = availableModules.find(m => m.id === rule.moduleId);
              const enabledCapsCount = rule.enabledCapabilities?.length || 0;
              const dataSourcesCount = rule.allowedDataSources?.length || 0;

              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={clsx(
                    "group bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer relative flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-300",
                    rule.isActive ? "border-slate-200" : "border-slate-200/60 opacity-80 bg-slate-50/50"
                  )}
                >
                  {/* Top Bar of the Card */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition",
                          rule.isActive ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition truncate max-w-[170px]">
                            {rule.name || 'סוכן ללא שם'}
                          </h3>
                          <span className="text-[10px] font-medium text-slate-400 block truncate">
                            {assignedModule ? assignedModule.name : 'ללא שיוך מודול'}
                          </span>
                        </div>
                      </div>

                      {/* Active Toggle Switch */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateRule({ ...rule, isActive: !rule.isActive });
                        }}
                        className="flex items-center shrink-0 cursor-pointer"
                        title={rule.isActive ? 'סוכן פעיל - לחץ להשהיה' : 'סוכן מושהה - לחץ להפעלה'}
                      >
                        <div className={clsx("w-8 h-4 rounded-full transition-colors relative", rule.isActive ? "bg-emerald-500" : "bg-slate-300")}>
                          <div className={clsx("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", rule.isActive ? "right-0.5" : "left-0.5")} />
                        </div>
                      </div>
                    </div>

                    {/* Personality & Purpose Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px] mb-4 font-normal leading-relaxed">
                      {rule.systemPromptAddon || 'סוכן אוטונומי חכם המסייע בביצוע משימות ומענה במערכת.'}
                    </p>
                  </div>

                  {/* Badges Summary (Capabilities & Data Sources) */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-bold">
                      {/* Capabilities Badge */}
                      <span className={clsx(
                        "px-2 py-0.5 rounded-lg flex items-center gap-1 border",
                        enabledCapsCount > 0 ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-100 text-slate-400 border-slate-200"
                      )}>
                        <Zap className="w-3 h-3" />
                        <span>{enabledCapsCount} יכולות</span>
                      </span>

                      {/* Data Sources Badge */}
                      <span className={clsx(
                        "px-2 py-0.5 rounded-lg flex items-center gap-1 border",
                        dataSourcesCount > 0 ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200"
                      )}>
                        <Database className="w-3 h-3" />
                        <span>{dataSourcesCount} מאגרים</span>
                      </span>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRuleId(rule.id);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>הגדרות סוכן</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRule(rule.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="מחק סוכן"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="w-14 h-14 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">לא נמצאו סוכנים תואמים</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              נסה לשנות את מונחי החיפוש או הסינון, או הוסף סוכן חדש לצוות שלך.
            </p>
            <button 
              type="button"
              onClick={() => handleCreateRule()} 
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              הוסף סוכן עכשיו
            </button>
          </div>
        )}

      </main>

      {/* Slide-over Drawer for Agent Configuration (Option 1 Core: High Focus, Clean Light Mode) */}
      {activeRule && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedRuleId(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-r border-slate-200 animate-slideLeft">
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text" 
                      value={activeRule.name} 
                      placeholder="שם הסוכן..."
                      onChange={e => handleUpdateRule({ ...activeRule, name: e.target.value })}
                      className="font-black text-base sm:text-lg text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition w-full"
                    />
                    <span className="text-[11px] text-slate-400 block">הגדרות פעילות והרשאות מערכת</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Pill Toggle */}
                  <button
                    type="button"
                    onClick={() => handleUpdateRule({ ...activeRule, isActive: !activeRule.isActive })}
                    className={clsx(
                      "px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer",
                      activeRule.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    )}
                  >
                    <span className={clsx("w-1.5 h-1.5 rounded-full", activeRule.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                    <span>{activeRule.isActive ? 'פעיל' : 'מושהה'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setSelectedRuleId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition"
                    title="סגור"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-800">

                {/* Section 1: Assigned Module */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="font-bold text-xs text-slate-700 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span>שיוך לרכיב מערכת (Module)</span>
                      <InfoTooltip text="קובע באיזה מסך או רכיב במערכת הסוכן יפעל ויסייע לך באופן אוטומטי." />
                    </div>
                  </label>
                  <select
                    value={activeRule.moduleId || ''}
                    onChange={e => {
                      const mId = e.target.value;
                      const m = availableModules.find(x => x.id === mId);
                      handleUpdateRule({ ...activeRule, moduleId: mId, slugPattern: m?.route || '' });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="">-- בחר רכיב מערכת משויך --</option>
                    {availableModules.map(m => (
                      <option key={m.id} value={m.id}>
                        {purchasedModules.includes(m.id) ? 'פעיל ברישיון: ' : 'מודול: '}{m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section 2: Interactive Capabilities (Replaces Wall of Checkboxes!) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-xs text-slate-900">מה הסוכן מסוגל לעשות? (יכולות ביצוע)</span>
                      <InfoTooltip text="הדלק או כבה בלחיצה את הכלים והיכולות המורשות שיעמדו לרשות הסוכן בעת ביצוע משימות." />
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                      {activeRule.enabledCapabilities.length} מופעלות
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {CAPABILITIES_META.map(cap => {
                      const isEnabled = activeRule.enabledCapabilities.includes(cap.id);
                      return (
                        <div
                          key={cap.id}
                          onClick={() => {
                            const newCaps = isEnabled
                              ? activeRule.enabledCapabilities.filter(c => c !== cap.id)
                              : [...activeRule.enabledCapabilities, cap.id];
                            handleUpdateRule({ ...activeRule, enabledCapabilities: newCaps });
                          }}
                          className={clsx(
                            "p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 select-none",
                            isEnabled
                              ? "bg-purple-50/80 border-purple-300 text-purple-900 shadow-xs"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={clsx(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                              isEnabled ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                              <cap.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-xs block truncate">{cap.label}</span>
                              <span className="text-[9px] text-slate-400 block truncate">{cap.desc}</span>
                            </div>
                          </div>

                          <div className={clsx(
                            "w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition",
                            isEnabled ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"
                          )}>
                            {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Interactive Data Sources (Replaces Wall of Checkboxes!) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">לאילו נתונים בעסק יש לו גישה? (מאגרי מידע)</span>
                      <InfoTooltip text="מאפשר לסוכן לחקור ולשלוף מידע בזמן אמת מתוך מאגרי המידע שבחרת בעסק שלך." />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {(activeRule.allowedDataSources || []).length} מורשים
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {DATA_SOURCES_META.map(src => {
                      const isAllowed = (activeRule.allowedDataSources || []).includes(src.id);
                      return (
                        <div
                          key={src.id}
                          onClick={() => {
                            const curr = activeRule.allowedDataSources || [];
                            const newSources = isAllowed
                              ? curr.filter(c => c !== src.id)
                              : [...curr, src.id];
                            handleUpdateRule({ ...activeRule, allowedDataSources: newSources });
                          }}
                          className={clsx(
                            "p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 select-none",
                            isAllowed
                              ? "bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-xs"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={clsx(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                              isAllowed ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                              <src.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-xs block truncate">{src.label}</span>
                              <span className="text-[9px] text-slate-400 block truncate">{src.desc}</span>
                            </div>
                          </div>

                          <div className={clsx(
                            "w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition",
                            isAllowed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                          )}>
                            {isAllowed && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Persona & Custom Prompt */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>אופי ומומחיות הסוכן</span>
                      <InfoTooltip text="הנחה את הסוכן כיצד להתנהג ולהגיב, או בחר תבנית מוכנה שנוסחה על ידי המומחים של קושאן." />
                    </div>

                    <select
                      value={activeRule.templateId || ''}
                      onChange={e => applyTemplate(activeRule, e.target.value)}
                      className="p-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 shadow-xs outline-none cursor-pointer"
                    >
                      <option value="">תבניות AI מוכנות...</option>
                      {KOSAI_TEMPLATES.filter(t => t.targetModules.includes('all') || t.targetModules.includes(activeRule.moduleId || '')).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <textarea 
                      value={activeRule.systemPromptAddon || ''} 
                      onChange={e => handleUpdateRule({ ...activeRule, systemPromptAddon: e.target.value })}
                      placeholder="הסבר במילים פשוטות ל-Kosun איזה סוג סוכן אתה צריך שיהיה, או בחר תבנית..."
                      className="w-full h-28 p-3 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                    />
                    <button 
                      type="button"
                      onClick={() => handleGeneratePrompt(activeRule)}
                      disabled={!activeRule.moduleId}
                      className="absolute bottom-2.5 left-2.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>נסח לי פרומפט</span>
                    </button>
                  </div>
                </div>

                {/* Section 5: Tone of Voice Sliders */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-1 font-bold text-xs text-slate-900 mb-4">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                    <span>סגנון שיחה והתנסחות</span>
                    <InfoTooltip text="קובע את אופי וטון המענה של הסוכן – רשמי או קליל, ממוקד או מפורט, שמרני או יצירתי." />
                  </div>

                  <div className="space-y-4">
                    {/* Professionalism */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>זורם וקליל</span>
                        <span className="text-purple-600">{activeRule.toneOfVoice?.professionalism ?? 50}%</span>
                        <span>רשמי ומקצועי</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={activeRule.toneOfVoice?.professionalism ?? 50}
                        onChange={e => handleUpdateRule({ ...activeRule, toneOfVoice: { ...activeRule.toneOfVoice!, professionalism: Number(e.target.value) } })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    {/* Detail */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>קצר ולעניין</span>
                        <span className="text-indigo-600">{activeRule.toneOfVoice?.detail ?? 50}%</span>
                        <span>מפורט ומעמיק</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={activeRule.toneOfVoice?.detail ?? 50}
                        onChange={e => handleUpdateRule({ ...activeRule, toneOfVoice: { ...activeRule.toneOfVoice!, detail: Number(e.target.value) } })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Creativity */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>שמרני ומדויק</span>
                        <span className="text-pink-600">{activeRule.toneOfVoice?.creativity ?? 50}%</span>
                        <span>נועז ויצירתי</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={activeRule.toneOfVoice?.creativity ?? 50}
                        onChange={e => handleUpdateRule({ ...activeRule, toneOfVoice: { ...activeRule.toneOfVoice!, creativity: Number(e.target.value) } })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteRule(activeRule.id)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>מחק סוכן</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRuleId(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  סיום ושמירה
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
