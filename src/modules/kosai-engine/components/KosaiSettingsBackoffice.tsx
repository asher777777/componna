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
  SlidersHorizontal, ChevronLeft, ChevronRight, ShieldCheck, ArrowRight, MessageSquare, Phone, Tag, CheckCircle
} from 'lucide-react';
import { KOSAI_SUPPORTED_MODULES } from '../config/kosaiModules';
import { KOSAI_TEMPLATES } from '../config/kosaiTemplates';
import { generateAgentPromptWithAi } from '../api/kosaiApi';
import { loadBrandDna } from '../../KosBranding/services/brandDnaFirestore';
import type { BrandDna } from '../../KosBranding/types';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { checkKeywordMatch, WhatsAppBotService, WhatsAppAiBotConfig } from '../../KosWhatsUp/services/whatsappBotService';
import { doc, setDoc } from 'firebase/firestore';
import { clsx } from 'clsx';
import { MODULE_AGENTS_MAP, createDefaultRuleForModule } from '../config/moduleAgents';

// Capability Definitions with High-Quality Lucide Icons (Cashwan 2026: Zero Emojis)
const CAPABILITIES_META: {
  id: KosaiCapability;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'ADD_SECTION', label: 'הוספת אזורים ועיצובים', desc: 'יצירת סקשנים חדשים לפי תבנית או HTML מותאם', icon: Layout },
  { id: 'UPDATE_SECTION', label: 'עריכת תוכן וסקשנים', desc: 'שינוי כותרות, טקסטים ואלמנטים קיימים בעמוד', icon: Sliders },
  { id: 'UPDATE_GLOBAL_SETTINGS', label: 'הגדרות עיצוב ומיתוג', desc: 'שינוי צבעים ראשיים, פונטים וסגנון גלובלי', icon: Sparkles },
  { id: 'UPDATE_SEO', label: 'הגדרות קידום ו-SEO', desc: 'עדכון כותרות מטא, תיאורים ותגיות לעמוד', icon: Target },
  { id: 'CREATE_CRM_CHART', label: 'יצירת גרפים ב-CRM', desc: 'הפקת תרשימים וגרפים סטטיסטיים בזמן אמת', icon: LineChart },
  { id: 'REMOVE_CONTACT_TAGS', label: 'הסרת תגיות גורפת', desc: 'הסרת תגיות מאנשי קשר באישור מפורש, ללא מחיקת אנשי הקשר', icon: Tag },
  { id: 'CODE_GENERATION', label: 'כתיבת קוד', desc: 'יצירה ועדכון קוד מערכת', icon: Code2 },
  { id: 'PDF_READING', label: 'קריאת מסמכים', desc: 'חילוץ ידע מקבצי PDF', icon: FileText },
  { id: 'WEB_SEARCH', label: 'חיפוש ברשת', desc: 'שליפת מידע אונליין', icon: Search },
  { id: 'IMAGE_GENERATION', label: 'יצירת תמונות', desc: 'מחולל ויזואלי חכם', icon: Image },
  { id: 'VIDEO_GENERATION', label: 'עריכת וידאו', desc: 'הפקת תכני וידאו', icon: Film },
  { id: 'DEEP_RESEARCH', label: 'מחקר במאגרים', desc: 'הצלבת נתונים מעמיקה', icon: Layers },
  { id: 'WHATSAPP_AUTOMATION', label: 'אוטומציית וואטסאפ', desc: 'מענה חכם להודעות Green API', icon: MessageSquare },
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
  { id: 'crm_groups', label: 'קהילות וקבוצות CRM', desc: 'פילוח סגמנטים וקבוצות לקוחות', icon: Users },
  { id: 'wa_bot_chats', label: 'שיחות וואטסאפ', desc: 'היסטוריית פניות מלקוחות', icon: MessageSquare },
  { id: SYSTEM_COLLECTIONS.MEDIA_ITEMS, label: 'ספריית מדיה', desc: 'תמונות וקבצי מדיה אישיים', icon: Image },
  { id: SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS, label: 'עסקאות והכנסות', desc: 'נתוני תשלומים ורכישות', icon: CreditCard },
  { id: SYSTEM_COLLECTIONS.BRAND_DNA_DOC, label: 'הגדרות מותג', desc: 'שפת מותג, סלוגן וקהל יעד', icon: Sparkles },
  { id: SYSTEM_COLLECTIONS.VIDEO_PROJECTS, label: 'סרטי וידאו', desc: 'פרויקטים והפקות סרטונים', icon: Film },
];

// Cashwan Branding Tooltip
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

export interface KosaiSettingsBackofficeProps {
  initialRuleId?: string;
  moduleId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const KosaiSettingsBackoffice: React.FC<KosaiSettingsBackofficeProps> = ({
  initialRuleId,
  moduleId,
  onClose,
  isModal = false
}) => {
  const { db, purchasedModules } = useSystemConnection();
  const { tenantId } = useTenantScope();
  
  const [rules, setRules] = useState<KosaiRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(initialRuleId || null);
  const [analytics, setAnalytics] = useState<KosaiAnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);
  
  // WhatsApp Trigger Editor State
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [triggerTesterInput, setTriggerTesterInput] = useState('');

  const availableModules = KOSAI_SUPPORTED_MODULES;

  const loadData = async () => {
    if (!db) return;
    setLoading(true);
    let r = await kosaiRulesService.getRules(db, tenantId);
    const a = await kosaiRulesService.getRecentAnalytics(db, tenantId);
    
    // Find matching rule
    let targetRule = r.find(x => 
      (initialRuleId && x.id === initialRuleId) || 
      (moduleId && x.moduleId === moduleId)
    );

    // If not found and moduleId is provided, auto-create and persist the default rule for this module!
    if (!targetRule && moduleId) {
      const meta = MODULE_AGENTS_MAP[moduleId] || MODULE_AGENTS_MAP['crm-analytics'];
      targetRule = createDefaultRuleForModule(meta);
      try {
        await kosaiRulesService.saveRule(db, tenantId, targetRule);
      } catch (e) {
        console.warn('[KosaiSettings] Could not auto-save rule:', e);
      }
    }
    // Auto-sanitize any previously corrupted error strings in prompt
    r = r.map(rule => {
      if (rule.systemPromptAddon && (rule.systemPromptAddon.includes('שגיאה בניסוח') || rule.systemPromptAddon.includes('API_ERROR'))) {
        const meta = MODULE_AGENTS_MAP[rule.moduleId] || MODULE_AGENTS_MAP['crm-analytics'];
        const sanitized = { ...rule, systemPromptAddon: meta.systemPrompt };
        kosaiRulesService.saveRule(db, tenantId, sanitized).catch(console.warn);
        return sanitized;
      }
      return rule;
    });

    setRules(r);
    setAnalytics(a);
    if (targetRule) {
      // If targetRule was corrupt, sanitize its active prompt too
      if (targetRule.systemPromptAddon && (targetRule.systemPromptAddon.includes('שגיאה בניסוח') || targetRule.systemPromptAddon.includes('API_ERROR'))) {
        const meta = MODULE_AGENTS_MAP[targetRule.moduleId] || MODULE_AGENTS_MAP['crm-analytics'];
        targetRule.systemPromptAddon = meta.systemPrompt;
      }
      setSelectedRuleId(targetRule.id);
    } else if (initialRuleId) {
      setSelectedRuleId(initialRuleId);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [db, tenantId]);

  useEffect(() => {
    if (!isModal && !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  useEffect(() => {
    if (initialRuleId) {
      setSelectedRuleId(initialRuleId);
    }
  }, [initialRuleId]);

  const handleCreateRule = async (modId?: string) => {
    if (!db) return;
    const defaultModule = modId ? availableModules.find(m => m.id === modId) : null;
    const newRule: KosaiRule = {
      id: `rule_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      name: defaultModule ? `KOSAI ${defaultModule.name}` : 'KOSAI Expert',
      slugPattern: defaultModule?.route || '',
      moduleId: defaultModule?.id || '',
      systemPromptAddon: '',
      isActive: true,
      enabledCapabilities: [],
      allowedDataSources: [],
      toneOfVoice: { professionalism: 60, detail: 50, creativity: 50 },
      createdAt: Date.now()
    };
    
    await kosaiRulesService.saveRule(db, tenantId, newRule);
    setRules(prev => [newRule, ...prev]);
    setSelectedRuleId(newRule.id);
  };

  const handleUpdateRule = async (updated: KosaiRule) => {
    setRules(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (db) {
      await kosaiRulesService.saveRule(db, tenantId, updated);

      if (updated.whatsappTrigger?.enabled) {
        try {
          const botConfig: WhatsAppAiBotConfig = {
            id: `kosai_${updated.id}`,
            name: updated.whatsappTrigger.botDisplayName || updated.name,
            role: 'סוכן קושאן AI מחובר לוואטסאפ',
            avatarIcon: 'Bot',
            isActive: updated.isActive,
            triggerType: updated.whatsappTrigger.triggerType || 'keyword',
            triggerKeywords: updated.whatsappTrigger.keywords || [],
            matchMode: updated.whatsappTrigger.matchMode || 'contains',
            kosaiRuleId: updated.id,
            systemPrompt: updated.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
            model: 'gemini-3.8-flash',
            temperature: (updated.toneOfVoice?.creativity ?? 50) / 100,
            interactiveButtons: [
              { buttonId: 'btn_info', buttonText: 'פרטים נוספים', actionType: 'prompt' as const, actionValue: 'פרט עוד בבקשה' },
              { buttonId: 'btn_rep', buttonText: 'שיחה עם נציג', actionType: 'message' as const, actionValue: 'נציג יחזור אליך בהקדם.' }
            ],
            autoGenerateButtons: false,
            createdAt: updated.createdAt || Date.now()
          };
          const botPath = tenantId ? `tenants/${tenantId}/whatsapp_ai_bots` : 'whatsapp_ai_bots';
          await setDoc(doc(db, botPath, botConfig.id), botConfig, { merge: true });

          try {
            const currentStored = WhatsAppBotService.getStoredBots();
            const existingIdx = currentStored.findIndex((b: WhatsAppAiBotConfig) => b.id === botConfig.id || b.kosaiRuleId === updated.id);
            if (existingIdx >= 0) {
              currentStored[existingIdx] = botConfig;
            } else {
              currentStored.push(botConfig);
            }
            WhatsAppBotService.saveBots(currentStored);
          } catch (storageErr) {
            console.warn('Could not update localStorage bots:', storageErr);
          }
        } catch (err) {
          console.warn('Error syncing Kosai agent to WhatsApp bot collection:', err);
        }
      }
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
    
    const tempRule = { ...rule, systemPromptAddon: 'Kosun AI מנסח כעת פרומפט מדויק וממותג...' };
    setRules(prev => prev.map(r => r.id === rule.id ? tempRule : r));

    let tenantBrandDna: BrandDna | null = null;
    try {
      tenantBrandDna = await loadBrandDna(db || undefined, tenantId);
    } catch (bErr) {
      console.warn('[KosaiSettings] Could not load tenant brand DNA:', bErr);
    }

    const { prompt, usage } = await generateAgentPromptWithAi(
      modName,
      caps,
      rule.allowedDataSources || [],
      rule.toneOfVoice || { professionalism: 60, detail: 50, creativity: 50 },
      tenantBrandDna
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
      <div className={clsx("min-h-screen p-12 text-center bg-slate-50 text-slate-800 flex flex-col items-center justify-center gap-3", isModal && "fixed inset-0 z-[120]")} dir="rtl" style={{ fontFamily: 'Heebo, sans-serif' }}>
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-sm text-slate-600">טוען את הגדרות הסוכן של קושאן...</p>
      </div>
    );
  }

  // ============================================================================
  // VIEW A: DIRECT SPECIFIC AGENT EDITOR (When an agent is selected)
  // High Focus, Clean Light Mode, 100% Full-Screen, Comfortable & Usable
  // ============================================================================
  if (activeRule) {
    const assignedModule = availableModules.find(m => m.id === activeRule.moduleId);

    return (
      <div 
        className={clsx(
          "bg-slate-50 text-slate-900 flex flex-col font-sans",
          isModal ? "fixed inset-0 w-screen h-screen z-[120] overflow-y-auto" : "min-h-screen pb-24"
        )} 
        dir="rtl" 
        style={{ fontFamily: 'Heebo, sans-serif' }}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedRuleId(null)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="חזרה לכל צוות הסוכנים"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="hidden sm:inline">לכל הסוכנים</span>
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                  <img
                    src="/images/kosun-symbol.svg"
                    alt="K"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                    }}
                    className="w-7 h-7 object-contain drop-shadow animate-pulse"
                  />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Active Toggle */}
              <button
                type="button"
                onClick={() => handleUpdateRule({ ...activeRule, isActive: !activeRule.isActive })}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer",
                  activeRule.isActive 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" 
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                )}
              >
                <span className={clsx("w-2 h-2 rounded-full", activeRule.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                <span>{activeRule.isActive ? 'סוכן פעיל' : 'סוכן מושהה'}</span>
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  title="סגור וחזור לצ'אט"
                  aria-label="סגירה"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Form Body */}
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1 pb-28">

          {/* Card 1: Name & Module Mapping */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-500" />
                פרטי הסוכן ושיוך למודול
              </span>
              <span className="text-[11px] text-slate-400">הגדרת זיהוי במערכת</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1.5">
                  שם הסוכן
                </label>
                <input 
                  type="text" 
                  value={activeRule.name} 
                  placeholder="למשל: סוכן CRM וניתוח לקוחות"
                  onChange={e => handleUpdateRule({ ...activeRule, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1.5">
                  שיוך לרכיב מערכת (Module)
                </label>
                <select
                  value={activeRule.moduleId || ''}
                  onChange={e => {
                    const mId = e.target.value;
                    const m = availableModules.find(x => x.id === mId);
                    handleUpdateRule({ ...activeRule, moduleId: mId, slugPattern: m?.route || '' });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer transition"
                >
                  <option value="">-- בחר רכיב מערכת משויך --</option>
                  {availableModules.map(m => (
                    <option key={m.id} value={m.id}>
                      {purchasedModules.includes(m.id) ? 'פעיל ברישיון: ' : 'מודול: '}{m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Capabilities */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-xs text-slate-900">יכולות ביצוע מורשות (Capabilities)</span>
                <InfoTooltip text="הדלק או כבה בלחיצה את הכלים והיכולות המורשות שיעמדו לרשות הסוכן בעת ביצוע משימות." />
              </div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                {activeRule.enabledCapabilities.length} מופעלות
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      "p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 select-none",
                      isEnabled
                        ? "bg-purple-50/70 border-purple-300 text-purple-900 shadow-xs"
                        : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/80"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        isEnabled ? "bg-purple-600 text-white" : "bg-white text-slate-400 border border-slate-200"
                      )}>
                        <cap.icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-xs block truncate">{cap.label}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{cap.desc}</span>
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

          {/* Card 3: Allowed Data Sources */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-900">מאגרי מידע מחוברים (Data Sources)</span>
                <InfoTooltip text="מאפשר לסוכן לחקור ולשלוף מידע בזמן אמת מתוך מאגרי המידע שבחרת בעסק שלך." />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {(activeRule.allowedDataSources || []).length} מורשים
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      "p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 select-none",
                      isAllowed
                        ? "bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-xs"
                        : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/80"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        isAllowed ? "bg-indigo-600 text-white" : "bg-white text-slate-400 border border-slate-200"
                      )}>
                        <src.icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-xs block truncate">{src.label}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{src.desc}</span>
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

          {/* Card 4: Persona & Custom Prompt */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>הנחיות ייעודיות ופרומפט סוכן</span>
                <InfoTooltip text="הנחה את הסוכן כיצד להתנהג ולהגיב, או בחר תבנית מוכנה שנוסחה על ידי המומחים של קושאן." />
              </div>

              <select
                value={activeRule.templateId || ''}
                onChange={e => applyTemplate(activeRule, e.target.value)}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 shadow-xs outline-none cursor-pointer"
              >
                <option value="">תבניות AI מוכנות מראש...</option>
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
                className="w-full h-36 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none resize-none leading-relaxed text-slate-800"
              />
              <button 
                type="button"
                onClick={() => handleGeneratePrompt(activeRule)}
                disabled={!activeRule.moduleId}
                className="absolute bottom-3 left-3 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>נסח לי פרומפט בעזרת AI</span>
              </button>
            </div>
          </div>

          {/* Card 5: Tone of Voice Sliders */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 border-b pb-3 border-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              <span>סגנון שיחה והתנסחות</span>
              <InfoTooltip text="קובע את אופי וטון המענה של הסוכן – רשמי או קליל, ממוקד או מפורט, שמרני או יצירתי." />
            </div>

            <div className="space-y-4 pt-1">
              {/* Professionalism */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>חברי וקליל</span>
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
                  <span>קצר וממוקד</span>
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
                  <span>סולידי ומדויק</span>
                  <span className="text-pink-600">{activeRule.toneOfVoice?.creativity ?? 50}%</span>
                  <span>יצירתי ונועז</span>
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

          {/* Card 6: WhatsApp Trigger (Optional) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                    <span>הפעלת סוכן בוואטסאפ (Green API)</span>
                    <InfoTooltip text="מאפשר לסוכן לקבל הודעות מלקוחות בוואטסאפ ולהגיב להן אוטומטית לפי מילות מפתח מוגדרות." />
                  </div>
                  <span className="text-[10px] text-slate-400">אינטגרציה ישירה לשירות לקוחות ומכירות</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-[11px] font-bold text-slate-600">חיבור לוואטסאפ:</span>
                <input
                  type="checkbox"
                  checked={Boolean(activeRule.whatsappTrigger?.enabled)}
                  onChange={e => {
                    const enabled = e.target.checked;
                    handleUpdateRule({
                      ...activeRule,
                      whatsappTrigger: {
                        enabled,
                        triggerType: activeRule.whatsappTrigger?.triggerType || 'keyword',
                        keywords: activeRule.whatsappTrigger?.keywords || [],
                        matchMode: activeRule.whatsappTrigger?.matchMode || 'contains',
                        botDisplayName: activeRule.whatsappTrigger?.botDisplayName || activeRule.name
                      }
                    });
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>

            {activeRule.whatsappTrigger?.enabled && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={e => setNewKeywordInput(e.target.value)}
                    placeholder="הוסף מילת מפתח להפעלת הסוכן (למשל: מחיר, עזרה, ליד)..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newKeywordInput.trim()) {
                        e.preventDefault();
                        const kw = newKeywordInput.trim();
                        const existing = activeRule.whatsappTrigger?.keywords || [];
                        if (!existing.includes(kw)) {
                          handleUpdateRule({
                            ...activeRule,
                            whatsappTrigger: {
                              ...activeRule.whatsappTrigger!,
                              keywords: [...existing, kw]
                            }
                          });
                        }
                        setNewKeywordInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const kw = newKeywordInput.trim();
                      if (!kw) return;
                      const existing = activeRule.whatsappTrigger?.keywords || [];
                      if (!existing.includes(kw)) {
                        handleUpdateRule({
                          ...activeRule,
                          whatsappTrigger: {
                            ...activeRule.whatsappTrigger!,
                            keywords: [...existing, kw]
                          }
                        });
                      }
                      setNewKeywordInput('');
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    הוסף מילה
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(activeRule.whatsappTrigger.keywords || []).map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedKw = (activeRule.whatsappTrigger?.keywords || []).filter(k => k !== kw);
                          handleUpdateRule({
                            ...activeRule,
                            whatsappTrigger: {
                              ...activeRule.whatsappTrigger!,
                              keywords: updatedKw
                            }
                          });
                        }}
                        className="text-emerald-500 hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </main>

        {/* Sticky Footer */}
        <footer className="bg-white border-t border-slate-200 sticky bottom-0 z-30 p-3.5 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleDeleteRule(activeRule.id)}
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>מחק סוכן</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedRuleId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                לכל הסוכנים
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  else setSelectedRuleId(null);
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                שמירה וחזרה לצ'אט
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ============================================================================
  // VIEW B: FLEET MANAGEMENT OVERVIEW (When no specific agent is active)
  // Grid of all agents, Search, KPIs, Filter pills
  // ============================================================================
  const mainContent = (
    <div className={clsx("bg-slate-50 text-slate-900 flex flex-col font-sans", isModal ? "w-screen h-screen overflow-y-auto relative" : "min-h-screen pb-24")} dir="rtl" style={{ fontFamily: 'Heebo, sans-serif' }}>
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          {/* Right side: Blinking K logo only */}
          <div className="flex items-center">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <img
                src="/images/kosun-symbol.svg"
                alt="K"
                className="w-8 h-8 object-contain drop-shadow animate-pulse"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                }}
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping pointer-events-none" />
            </div>
          </div>

          {/* Left side: Actions & Close button on left */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => handleCreateRule()} 
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>סוכן חדש</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="סגור חלון"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 flex-1 pb-16">
        
        {/* KPI & Cost Summary */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer shadow-xs"
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
                <div key={i} className={clsx("p-4 rounded-2xl border shadow-xs flex flex-col justify-between", stat.bg, stat.border)}>
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

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={clsx("px-2.5 py-1 rounded-lg transition", statusFilter === 'all' ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              >
                הכל ({rules.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={clsx("px-2.5 py-1 rounded-lg transition", statusFilter === 'active' ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              >
                פעילים ({rules.filter(r => r.isActive).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={clsx("px-2.5 py-1 rounded-lg transition", statusFilter === 'inactive' ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              >
                מושהים ({rules.filter(r => !r.isActive).length})
              </button>
            </div>

            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">כל המודולים</option>
              {availableModules.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fleet Grid */}
        {filteredRules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.map(rule => {
              const assignedModule = availableModules.find(m => m.id === rule.moduleId);
              const enabledCapsCount = (rule.enabledCapabilities || []).length;
              const dataSourcesCount = (rule.allowedDataSources || []).length;

              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={clsx(
                    "group bg-white rounded-3xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300",
                    rule.isActive ? "border-slate-200" : "border-slate-200/60 opacity-80 bg-slate-50/50"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={clsx(
                          "w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 transition p-2",
                          rule.isActive ? "bg-indigo-50 border border-indigo-200/60 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" : "bg-slate-100 border border-slate-200 text-slate-400"
                        )}>
                          <img
                            src="/images/kosun-symbol.svg"
                            alt="KOSAI"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                            }}
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                              KOSAI
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition truncate max-w-[150px]">
                              {rule.name?.replace(/^סוכן עבור\s*/, '')?.replace(/^סוכן\s*/, '')?.replace(/^KOSAI\s*/, '') || (assignedModule?.name || 'Expert')}
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 block truncate font-mono">
                            {assignedModule ? assignedModule.name : (rule.moduleId || 'Global Expert')}
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
                        title={rule.isActive ? 'KOSAI פעיל - לחץ להשהיה' : 'KOSAI מושהה - לחץ להפעלה'}
                      >
                        <div className={clsx("w-8 h-4 rounded-full transition-colors relative", rule.isActive ? "bg-emerald-500" : "bg-slate-300")}>
                          <div className={clsx("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", rule.isActive ? "right-0.5" : "left-0.5")} />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px] mb-4 font-normal leading-relaxed">
                      {rule.systemPromptAddon || 'סוכן אוטונומי חכם המסייע בביצוע משימות ומענה במערכת.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-bold">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-lg flex items-center gap-1 border",
                        enabledCapsCount > 0 ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-100 text-slate-400 border-slate-200"
                      )}>
                        <Zap className="w-3 h-3" />
                        <span>{enabledCapsCount} יכולות</span>
                      </span>

                      <span className={clsx(
                        "px-2 py-0.5 rounded-lg flex items-center gap-1 border",
                        dataSourcesCount > 0 ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200"
                      )}>
                        <Database className="w-3 h-3" />
                        <span>{dataSourcesCount} מאגרים</span>
                      </span>

                      {rule.whatsappTrigger?.enabled && (
                        <span className="px-2 py-0.5 rounded-lg flex items-center gap-1 border bg-emerald-50 text-emerald-700 border-emerald-200">
                          <MessageSquare className="w-3 h-3" />
                          <span>וואטסאפ פעיל</span>
                        </span>
                      )}
                    </div>

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
                        <span>ערוך הגדרות סוכן</span>
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
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs">
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
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-[120] bg-slate-50 overflow-hidden flex flex-col animate-fadeIn">
        {mainContent}
      </div>
    );
  }

  return mainContent;
};
