import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as Icons from 'lucide-react';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { kosunDb, comonaDb } from '../../../../src/lib/firebase';
import {
  CognitiveNodeModel,
  BranchInfo,
  TenantProfile,
  EntityProduct,
  KosCognitivePortalProps,
  TenantThemeColors
} from './types';
import { WelcomeExperience } from './WelcomeExperience';
import { InteractiveCapsule } from './InteractiveCapsule';
import { RootHeroRows } from './RootHeroRows';
import { CatalogCompassGrid } from './CatalogCompassGrid';
import { BranchesView } from './BranchesView';
import { FocusVoiceModal } from './FocusVoiceModal';
import { EntityDetailsModal } from './EntityDetailsModal';
import { AboutBrandModal } from './AboutBrandModal';
import { OwnerAuthModal } from './OwnerAuthModal';
import { OwnerAiStudioModal } from './OwnerAiStudioModal';
import { OwnerDashboardRows } from './OwnerDashboardRows';
import { OwnerCategorySubView, OwnerCategoryView } from './OwnerCategorySubView';
import { QuestionExplorationView, QuestionAffinityItem } from './QuestionExplorationView';
import { QuestionExplorationEditor, QuestionGuidedConfig } from './QuestionExplorationEditor';
import { InteractiveStepFormEngine } from './InteractiveStepFormEngine';
import { CommunityAndCrmEngine } from './CommunityAndCrmEngine';
import { KosunUniversalFooter } from './KosunUniversalFooter';
import { trackQuestionAffinityClick, getCognitiveExplorationTree } from '../../../factory/questionAffinityEngine';
import { getAreaCollectionSchema, saveAreaCollectionConfig, KOSUN_STYLE_PRESETS } from '../../../factory/areaCollectionManager';

export const KosCognitivePortal: React.FC<KosCognitivePortalProps> = ({
  tenantId = 'kosun',
  targetProject = 'comona',
  defaultAudience = 'guest',
  onActionDispatched
}) => {
  const [audience, setAudience] = useState<'guest' | 'owner'>(defaultAudience);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<CognitiveNodeModel[]>([]);
  const [products, setProducts] = useState<EntityProduct[]>([]);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Experience & Flow State
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isOwnerAiStudioOpen, setIsOwnerAiStudioOpen] = useState<boolean>(false);
  const [activeOwnerCategory, setActiveOwnerCategory] = useState<OwnerCategoryView | null>(null);
  const [ownerAiStudioIntent, setOwnerAiStudioIntent] = useState<any>('ADD_PRODUCT_OR_SERVICE');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Selected Item Modal
  const [activeCarModal, setActiveCarModal] = useState<EntityProduct | null>(null);
  const [carModalTab, setCarModalTab] = useState<'specs' | 'details'>('specs');
  const [isAboutBrandModalOpen, setIsAboutBrandModalOpen] = useState<boolean>(false);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState<boolean>(false);

  // קונפיגורציית סגנון ופריסה פעילה לעמוד השאלות ולכל הפורטל
  const [questionVisualConfig, setQuestionVisualConfig] = useState<{
    layoutBudget?: string;
    atmosphereTheme?: string;
    languageStyle?: string;
    intentGoal?: string;
    colorMode?: 'day' | 'night' | string;
  }>({
    layoutBudget: 'accordion_morph',
    atmosphereTheme: 'cyber_neon',
    languageStyle: 'approachable',
    intentGoal: 'conversion',
    colorMode: 'night'
  });

  // חקר שאילתא קוגניטיבי (עמוד 4 שאלות מונחה משפך מכירה)
  const [activeExplorationQuestion, setActiveExplorationQuestion] = useState<{
    mainQuestion: string;
    mainAnswer?: string;
    category?: string;
    affinityScore?: number;
    relatedQuestions: QuestionAffinityItem[];
  } | null>(null);

  // Compass Navigation State
  const [livePreviewTheme, setLivePreviewTheme] = useState<Partial<TenantThemeColors> | null>(null);
  const [catalogSortDirection, setCatalogSortDirection] = useState<'default' | 'newest' | 'oldest' | 'cheapest' | 'priciest'>('default');
  const [catalogPage, setCatalogPage] = useState<number>(0);
  const [activeCompassTooltip, setActiveCompassTooltip] = useState<string | null>(null);

  // Branches Interactive Highlight State
  const [highlightedBranchId, setHighlightedBranchId] = useState<string | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<'proximity' | 'charging' | 'friday' | null>(null);
  const [highlightBannerText, setHighlightBannerText] = useState<string | null>(null);

  // Voice & AI State
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceQuery, setVoiceQuery] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [activeAiAnswer, setActiveAiAnswer] = useState<string | null>(null);

  const activeDb = targetProject === 'comona' ? comonaDb : kosunDb;

  // 1. האזנה ל-Firestore (קולקציות טננט)
  useEffect(() => {
    setIsLoading(true);
    const dbToUse = activeDb || kosunDb;

    const unsubProfile = onSnapshot(doc(dbToUse, 'tenants', tenantId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as TenantProfile;
        setTenantProfile(data);
        if (data.branches && data.branches.length > 0) {
          setBranches(data.branches);
        }
      }
    });

    const unsubNodes = onSnapshot(collection(dbToUse, 'tenants', tenantId, 'cognitive_nodes'), (snapshot) => {
      const items: CognitiveNodeModel[] = [];
      snapshot.forEach((d) => items.push({ id: d.id, ...d.data() } as CognitiveNodeModel));
      setNodes(items);
      setIsLoading(false);
    });

    const unsubProducts = onSnapshot(collection(dbToUse, 'tenants', tenantId, 'products'), (snapshot) => {
      const prods: EntityProduct[] = [];
      snapshot.forEach((d) => prods.push({ id: d.id, ...d.data() } as EntityProduct));
      setProducts(prods);
    });

    // 1.1 טעינה והאזנה לקונפיגורציית עמוד השאלות שנשמרה
    const market = tenantProfile?.category || 'saas';
    getAreaCollectionSchema('area_question_page', tenantId, market).then((schema) => {
      const initialMap: Record<string, any> = {};
      schema.parameters.forEach((p) => {
        initialMap[p.key] = p.currentValue;
      });
      if (initialMap.layoutBudget || initialMap.atmosphereTheme || initialMap.colorMode) {
        setQuestionVisualConfig((prev) => ({
          ...prev,
          layoutBudget: initialMap.layoutBudget || prev.layoutBudget,
          atmosphereTheme: initialMap.atmosphereTheme || prev.atmosphereTheme,
          languageStyle: initialMap.languageStyle || prev.languageStyle,
          intentGoal: initialMap.intentGoal || prev.intentGoal,
          colorMode: initialMap.colorMode || prev.colorMode || 'night'
        }));
      }
    });

    return () => {
      unsubProfile();
      unsubNodes();
      unsubProducts();
    };
  }, [tenantId, targetProject]);

  // 2. שאלות מתחלפות מותאמות הקשר (Context-Aware Prompt Suggestions)
  const currentContextNodes = useMemo(() => {
    if (!currentParentId) {
      return nodes.filter((n) => !n.parentId && n.audience === audience);
    }
    const childNodes = nodes.filter((n) => n.parentId === currentParentId);
    if (childNodes.length > 0) return childNodes;

    if (currentParentId === 'node_root_location') {
      return [
        { id: 'q1', questionText: 'איזה סניף הכי קרוב אליי?' } as CognitiveNodeModel,
        { id: 'q2', questionText: 'האם יש חניה מסודרת ועמדת טעינה?' } as CognitiveNodeModel,
        { id: 'q3', questionText: 'מה שעות הפעילות ביום שישי?' } as CognitiveNodeModel,
      ];
    }
    return [
      { id: 'q4', questionText: 'איך שיטת The Big 3 מנקה לי עומס מחשבתי?' } as CognitiveNodeModel,
      { id: 'q5', questionText: 'איך הופכים שיחה קולית למיקרו-משימות של 15 דקות?' } as CognitiveNodeModel,
      { id: 'q6', questionText: 'מה ההבדל בין חבילת Solo ל-Executive?' } as CognitiveNodeModel,
    ];
  }, [nodes, currentParentId, audience]);

  // טיקר מתחלף כל 4.5 שניות
  useEffect(() => {
    if (currentContextNodes.length === 0) return;
    const interval = setInterval(() => {
      setActiveQuestionIndex((prev) => (prev + 1) % currentContextNodes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [currentContextNodes.length]);

  const activeQuestionNode = currentContextNodes[activeQuestionIndex] || currentContextNodes[0];

  // 3. פתיחת עמוד חקר שאילתא קוגניטיבי (משפך 4 השאלות: 80% / 50% / 25% לקראת הנעה לפעולה)
  const openQuestionExploration = (qText: string) => {
    setActiveAiAnswer(null);
    const exploration = getCognitiveExplorationTree(qText, tenantProfile);
    setActiveExplorationQuestion(exploration);
    trackQuestionAffinityClick(tenantId, 'q_' + Date.now(), targetProject);
  };

  // 4. הקלטה קולית
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechRec();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'he-IL';

      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);
        setVoiceQuery(transcript);
      };

      recog.onend = () => {
        setIsRecording(false);
        if (voiceTranscript.trim()) {
          dispatchSubmittedQuery(voiceTranscript);
        }
      };

      recog.onerror = () => setIsRecording(false);
      recognitionRef.current = recog;
    }
  }, [voiceTranscript]);

  const toggleRecording = () => {
    if (isRecording) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsRecording(false);
    } else {
      setVoiceTranscript('');
      setVoiceQuery('');
      setIsRecording(true);
      try { recognitionRef.current?.start(); } catch (e) {}
    }
  };

  // 5. עיבוד פקודות קוליות ושאילתות לקוח אינטראקטיביות
  const dispatchSubmittedQuery = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const normalized = cleanText.toLowerCase().replace(/['"״׳?]/g, '');

    // פקודת כניסה סודית
    const isSecretLoginPhrase = [
      'קושאן תכניס אותי',
      'תכניס אותי',
      'כניסת מנהל',
      'ניהול',
      'kosun login'
    ].some((phrase) => normalized.includes(phrase));

    if (isSecretLoginPhrase) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsAiThinking(false);
      setIsFocusMode(false);
      setIsRecording(false);
      setVoiceQuery('');
      setVoiceTranscript('');
      setIsLoginModalOpen(true);
      return;
    }

    // פקודות קוליות דינמיות להתאמת סגנון, פריסה ומצב יום/לילה
    if (normalized.includes('מצב יום') || normalized.includes('רקע בהיר') || normalized.includes('מסך בהיר')) {
      const nextConfig = { ...questionVisualConfig, colorMode: 'day' };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('מצב לילה') || normalized.includes('רקע כהה') || normalized.includes('מסך שחור')) {
      const nextConfig = { ...questionVisualConfig, colorMode: 'night' };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('4 שורות') || normalized.includes('ארבע שורות')) {
      const nextConfig = { ...questionVisualConfig, layoutBudget: 'four_rows' as const };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('פריסה הפוכה') || normalized.includes('שאלות למעלה')) {
      const nextConfig = { ...questionVisualConfig, layoutBudget: 'inverted' as const };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('פריסת תקן') || normalized.includes('כרטיס למעלה')) {
      const nextConfig = { ...questionVisualConfig, layoutBudget: 'standard' as const };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('זהב') || normalized.includes('יוקרה')) {
      const preset = KOSUN_STYLE_PRESETS.luxury_gold;
      const nextConfig = { 
        ...questionVisualConfig, 
        atmosphereTheme: 'luxury_gold',
        layoutBudget: preset.defaultLayout
      };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('סייבר') || normalized.includes('ניאון')) {
      const preset = KOSUN_STYLE_PRESETS.cyber_neon;
      const nextConfig = { 
        ...questionVisualConfig, 
        atmosphereTheme: 'cyber_neon',
        layoutBudget: preset.defaultLayout
      };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('הנהלה') || normalized.includes('סלייט') || normalized.includes('executive')) {
      const preset = KOSUN_STYLE_PRESETS.executive_slate;
      const nextConfig = { 
        ...questionVisualConfig, 
        atmosphereTheme: 'executive_slate',
        layoutBudget: preset.defaultLayout
      };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }
    if (normalized.includes('אמרלד') || normalized.includes('שלווה') || normalized.includes('ירוק')) {
      const preset = KOSUN_STYLE_PRESETS.emerald_calm;
      const nextConfig = { 
        ...questionVisualConfig, 
        atmosphereTheme: 'emerald_calm',
        layoutBudget: preset.defaultLayout
      };
      setQuestionVisualConfig(nextConfig);
      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
      setIsFocusMode(false);
      setIsRecording(false);
      return;
    }

    if (normalized.includes('סניף') || normalized.includes('סניפים') || normalized.includes('הגעה') || normalized.includes('איפה אתם')) {
      setCurrentParentId('node_root_location');
      setActiveExplorationQuestion(null);
      setIsFocusMode(false);
      return;
    }

    if (normalized.includes('אודות') || normalized.includes('חזון') || normalized.includes('סיפור') || normalized.includes('מי אתם')) {
      setIsAboutBrandModalOpen(true);
      setIsFocusMode(false);
      return;
    }

    // פתיחת עמוד חקר לשאלה שנשאלה בקול
    openQuestionExploration(cleanText);
    setIsFocusMode(false);
    setIsRecording(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPasscode === '2026' || loginPasscode === 'kosun' || loginPasscode === '1234') {
      setIsLoginModalOpen(false);
      setLoginError('');
      setAudience('owner');
      alert('כניסה מאושרת למרכז הניהול של KOSUN!');
    } else {
      setLoginError('קוד גישה שגוי. נסה שוב (2026).');
    }
  };

  const tenantTheme: TenantThemeColors = useMemo(() => {
    const isDay = questionVisualConfig.colorMode === 'day';
    const presetKey = livePreviewTheme?.stylePresetId || questionVisualConfig.atmosphereTheme || tenantProfile?.themeColors?.stylePresetId || 'cyber_neon';
    const activePreset = KOSUN_STYLE_PRESETS[presetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
    const presetColors = isDay ? activePreset.day : activePreset.night;
    const basePrimary = presetColors.primaryColor || tenantProfile?.themeColors?.primary || '#00F0FF';

    const baseTheme: TenantThemeColors = {
      primary: basePrimary,
      secondary: tenantProfile?.themeColors?.secondary || '#0072FF',
      accent: basePrimary,
      capsuleBg: isDay ? 'rgba(255, 255, 255, 0.96)' : '#090d16',
      capsuleBorder: basePrimary,
      micColor: basePrimary,
      micGlow: presetColors.glowColor || `${basePrimary}40`,
      pageBg: presetColors.pageBg,
      titleColor: presetColors.textColor,
      textColor: presetColors.textColor,
      colorMode: isDay ? 'day' : 'night',
      secondaryText: presetColors.secondaryText,
      cardBg: presetColors.cardBg,
      borderColor: presetColors.borderColor,
      stylePresetId: presetKey
    };

    if (livePreviewTheme) {
      return {
        ...baseTheme,
        ...livePreviewTheme
      };
    }

    return baseTheme;
  }, [tenantProfile, livePreviewTheme, questionVisualConfig.colorMode, questionVisualConfig.atmosphereTheme]);

  const activeRootNodes = useMemo(() => {
    const rootNodes = nodes.filter((n) => !n.parentId && n.audience === audience);
    if (rootNodes.length > 0) return rootNodes;

    // ברירת מחדל חיה מתוך ה-JSON של קושאן
    return [
      {
        id: 'node_root_methodology',
        questionText: 'שיטת The Big 3 הבלתי מתפשרת',
        shortAnswer: 'מקסימום 3 משימות מפתח ביום לשקט מנטלי ו-100% ביצוע',
        indexBadge: '01'
      },
      {
        id: 'node_root_decompose',
        questionText: 'מעבדת פירוק משימות AI Decompose',
        shortAnswer: 'הפיכת רעיונות גולמיים ושיחות לצעדים מעשיים של 15 דקות',
        indexBadge: '02'
      },
      {
        id: 'node_root_ritual',
        questionText: 'טקס נעילת יום ושקט קוגניטיבי',
        shortAnswer: 'סגירה מסודרת של היום ותכנון מוקדם של המחר לשינה רגועה',
        indexBadge: '03'
      },
      {
        id: 'node_root_products',
        questionText: 'חבילות ומודולים 2026',
        shortAnswer: 'מסלולי Solo ליחידים, Executive למנהלים ו-Enterprise לארגונים',
        indexBadge: '04'
      }
    ] as CognitiveNodeModel[];
  }, [nodes, audience]);

  const displayedProducts = useMemo(() => {
    const list = [...products];
    if (catalogSortDirection === 'cheapest') list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (catalogSortDirection === 'priciest') list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    return list.slice(catalogPage * 4, catalogPage * 4 + 4);
  }, [products, catalogSortDirection, catalogPage]);

  const totalPages = Math.ceil(products.length / 4) || 1;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative" dir="rtl">
      
      {/* מסך הפתיחה החוייתי */}
      {showWelcomeScreen && tenantProfile?.welcomeExperience ? (
        <WelcomeExperience
          experience={tenantProfile.welcomeExperience}
          brandColor={tenantTheme.micColor || '#00F0FF'}
          onStart={() => setShowWelcomeScreen(false)}
        />
      ) : (
        <div 
          className="w-full h-full flex flex-col justify-between p-3 select-none transition-colors duration-300 rounded-3xl"
          style={{
            backgroundColor: tenantTheme.pageBg || (tenantTheme.colorMode === 'day' ? '#F0F9FF' : '#040711'),
            color: tenantTheme.textColor || (tenantTheme.colorMode === 'day' ? '#0F172A' : '#FFFFFF')
          }}
        >
          
          {/* בורר מצב (אורח / בעל עסק) + כפתור יום/לילה מהיר */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs z-20 mb-1">
            <button
              type="button"
              onClick={() => {
                setAudience('guest');
              }}
              className={`flex-1 py-1 text-[11px] font-bold rounded-xl transition-all ${
                audience === 'guest'
                  ? 'text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={{
                backgroundColor: audience === 'guest' ? tenantTheme.primary : 'transparent',
                color: audience === 'guest' ? '#000000' : undefined
              }}
            >
              מצב אורח (לקוח)
            </button>
            <button
              type="button"
              onClick={() => {
                setAudience('owner');
                // אם אנחנו בתוך עמוד חקר השאילתא, פותחים מיד את עורך עמוד השאלות הייעודי בכרטיסים!
                if (activeExplorationQuestion) {
                  setIsQuestionEditorOpen(true);
                }
              }}
              className={`flex-1 py-1 text-[11px] font-bold rounded-xl transition-all ${
                audience === 'owner'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              מצב מנהל (Owner)
            </button>

            {/* כפתור החלפת יום/לילה מהיר המוחל על כל המערכת */}
            <button
              type="button"
              onClick={() => {
                const nextMode = questionVisualConfig.colorMode === 'day' ? 'night' : 'day';
                setQuestionVisualConfig((prev) => ({ ...prev, colorMode: nextMode }));
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs shrink-0 flex items-center justify-center active:scale-95 shadow-sm"
              style={{ color: tenantTheme.primary }}
              title={questionVisualConfig.colorMode === 'day' ? 'החלף למצב לילה' : 'החלף למצב יום'}
            >
              {questionVisualConfig.colorMode === 'day' ? <Icons.Moon size={14} /> : <Icons.Sun size={14} />}
            </button>

            {/* כפתור פתיחת עורך הפריסות והסגנונות מכל מסך */}
            <button
              type="button"
              onClick={() => setIsQuestionEditorOpen(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs shrink-0 flex items-center justify-center active:scale-95 shadow-sm"
              style={{ color: tenantTheme.primary }}
              title="פתח עורך פריסות וסגנונות (5 Discovery Layouts)"
            >
              <Icons.SlidersHorizontal size={14} />
            </button>
          </div>

          {/* 🎨 בורר 5 סגנונות גילוי מהקולקציה + 5 ארכיטיפים לבדיקה חיה בזמן אמת */}
          <div className="flex flex-col gap-1 mb-1 z-20">
            {/* שורה 1: 5 סגנונות הגילוי (JSON Style Collection) */}
            <div className="grid grid-cols-5 gap-1">
              {Object.values(KOSUN_STYLE_PRESETS).map((preset, idx) => {
                const isActiveStyle = (tenantTheme.stylePresetId || questionVisualConfig.atmosphereTheme) === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setLivePreviewTheme(null);
                      const nextConfig = {
                        ...questionVisualConfig,
                        atmosphereTheme: preset.value,
                        layoutBudget: preset.defaultLayout || preset.discovery?.mode || 'accordion_morph'
                      };
                      setQuestionVisualConfig(nextConfig);
                      saveAreaCollectionConfig('area_question_page', tenantId, nextConfig);
                    }}
                    className={`py-1 px-1 rounded-lg border text-[9px] font-black truncate transition-all active:scale-95 ${
                      isActiveStyle ? 'shadow-md scale-[1.02]' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isActiveStyle ? tenantTheme.primary : (tenantTheme.colorMode === 'day' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.05)'),
                      borderColor: isActiveStyle ? tenantTheme.primary : tenantTheme.borderColor,
                      color: isActiveStyle ? '#000000' : tenantTheme.textColor
                    }}
                    title={preset.label}
                  >
                    {idx + 1}. {preset.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* שורה 2: 5 הארכיטיפים של ה-60% לבדיקה מהירה */}
            {audience === 'guest' && (
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'hero', label: '1. הירו (4)', active: !currentParentId && !activeExplorationQuestion },
                  { id: 'funnel', label: '2. משפך שאלות', active: Boolean(activeExplorationQuestion) },
                  { id: 'catalog', label: '3. קטלוג מצפן', active: currentParentId === 'node_root_products' || currentParentId === 'node_root_cars' },
                  { id: 'form', label: '4. טופס חכם', active: currentParentId === 'node_root_form' },
                  { id: 'community', label: '5. קהילה/CRM', active: currentParentId === 'node_root_community' }
                ].map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => {
                      if (arch.id === 'hero') {
                        setCurrentParentId(null);
                        setActiveExplorationQuestion(null);
                      } else if (arch.id === 'funnel') {
                        setCurrentParentId(null);
                        openQuestionExploration('איך שיטת The Big 3 ממירה רעיונות לתוצאות מוכחות?');
                      } else if (arch.id === 'catalog') {
                        setActiveExplorationQuestion(null);
                        setCurrentParentId('node_root_products');
                      } else if (arch.id === 'form') {
                        setActiveExplorationQuestion(null);
                        setCurrentParentId('node_root_form');
                      } else if (arch.id === 'community') {
                        setActiveExplorationQuestion(null);
                        setCurrentParentId('node_root_community');
                      }
                    }}
                    className={`py-0.5 px-1 rounded-md border text-[8.5px] font-bold truncate transition-all ${
                      arch.active ? 'font-black' : 'opacity-65 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: arch.active ? `${tenantTheme.primary}25` : 'transparent',
                      borderColor: arch.active ? tenantTheme.primary : tenantTheme.borderColor,
                      color: arch.active ? tenantTheme.primary : tenantTheme.secondaryText
                    }}
                  >
                    {arch.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* קפסולת ה-AI העליונה של קושאן - מעוצבת דינמית לפי הסגנון בקולקציה */}
          <InteractiveCapsule
            tenantProfile={tenantProfile}
            tenantTheme={tenantTheme}
            activeQuestionNode={activeQuestionNode}
            isCatalogActive={Boolean(currentParentId)}
            stylePresetId={tenantTheme.stylePresetId}
            onAvatarPlayClick={() => dispatchSubmittedQuery('ספר לי על החברה')}
            onQuestionClick={() => {
              const qText = activeQuestionNode ? activeQuestionNode.questionText : 'איך עובדת שיטת חוק ה-3 (The Big 3)?';
              openQuestionExploration(qText);
            }}
            onMicClick={() => {
              setIsFocusMode(true);
              toggleRecording();
            }}
          />

          {/* הארנה המרכזית (Zero Scroll) */}
          <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center py-1 overflow-hidden my-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Icons.Loader2 size={28} className="animate-spin text-cyan-400" />
                <span className="text-xs">טוען קולקציות מ-Firestore...</span>
              </div>
            ) : activeExplorationQuestion ? (
              /* עמוד חקר שאילתא קוגניטיבי (שאלה ראשית + 3 ריבועים מותאמים אישית: 80% / 50% / 25%) */
              <div className="w-full h-full flex flex-col justify-between relative">
                {audience === 'owner' && (
                  <button
                    type="button"
                    onClick={() => setIsQuestionEditorOpen(true)}
                    className="absolute -top-1 left-1 z-30 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold shadow-md active:scale-95 transition-all"
                  >
                    <Icons.SlidersHorizontal size={12} />
                    <span>ערוך עמוד זה בכרטיסים</span>
                  </button>
                )}
                <QuestionExplorationView
                  mainQuestion={activeExplorationQuestion.mainQuestion}
                  mainAnswer={activeExplorationQuestion.mainAnswer}
                  category={activeExplorationQuestion.category}
                  affinityScore={activeExplorationQuestion.affinityScore}
                  relatedQuestions={activeExplorationQuestion.relatedQuestions || []}
                  tenantProfile={tenantProfile}
                  visualConfig={questionVisualConfig}
                  onSelectRelatedQuestion={(nextQ) => openQuestionExploration(nextQ)}
                  onBack={() => setActiveExplorationQuestion(null)}
                  onAskAiDirectly={(q) => dispatchSubmittedQuery(q)}
                  onActionTrigger={(action) => {
                    if (action === 'lead_capture') {
                      dispatchSubmittedQuery('אני רוצה להשאיר פרטים ולהתחיל שימוש');
                    } else if (action === 'catalog') {
                      setCurrentParentId('node_root_products');
                      setActiveExplorationQuestion(null);
                    }
                  }}
                />
              </div>
            ) : currentParentId === 'node_root_location' ? (
              <BranchesView
                branches={branches}
                tenantProfile={tenantProfile}
                tenantTheme={tenantTheme}
                highlightedBranchId={highlightedBranchId}
                highlightCategory={highlightCategory}
                highlightBannerText={highlightBannerText}
                onClearHighlight={() => {
                  setHighlightedBranchId(null);
                  setHighlightCategory(null);
                  setHighlightBannerText(null);
                }}
                onBackHome={() => {
                  setCurrentParentId(null);
                  setActiveExplorationQuestion(null);
                }}
                onSelectBranchQuery={(q) => dispatchSubmittedQuery(q)}
              />
            ) : currentParentId === 'node_root_form' ? (
              <InteractiveStepFormEngine
                tenantProfile={tenantProfile}
                tenantTheme={tenantTheme}
                stylePresetId={tenantTheme.stylePresetId}
                layoutBudget={questionVisualConfig.layoutBudget}
                onBackHome={() => {
                  setCurrentParentId(null);
                  setActiveExplorationQuestion(null);
                }}
              />
            ) : currentParentId === 'node_root_community' ? (
              <CommunityAndCrmEngine
                tenantProfile={tenantProfile}
                tenantTheme={tenantTheme}
                stylePresetId={tenantTheme.stylePresetId}
                layoutBudget={questionVisualConfig.layoutBudget}
                onActionClick={(title) => openQuestionExploration(title)}
                onBackHome={() => {
                  setCurrentParentId(null);
                  setActiveExplorationQuestion(null);
                }}
              />
            ) : (currentParentId === 'node_root_cars' || currentParentId === 'node_root_products') ? (
              <CatalogCompassGrid
                products={products}
                displayedProducts={displayedProducts}
                catalogSortDirection={catalogSortDirection}
                currentCatalogPage={catalogPage}
                totalPages={totalPages}
                activeCompassTooltip={activeCompassTooltip}
                tenantProfile={tenantProfile}
                tenantTheme={tenantTheme}
                stylePresetId={tenantTheme.stylePresetId}
                onSortChange={(direction, tooltipText) => {
                  setCatalogSortDirection(direction);
                  setCatalogPage((prev) => (prev + 1) % totalPages);
                  setActiveCompassTooltip(tooltipText);
                  setTimeout(() => setActiveCompassTooltip(null), 2200);
                }}
                onSetTooltip={(text) => setActiveCompassTooltip(text)}
                onSelectProduct={(item) => {
                  setActiveCarModal(item);
                  setCarModalTab('specs');
                }}
                onBackHome={() => {
                  setCurrentParentId(null);
                  setActiveExplorationQuestion(null);
                  setCatalogSortDirection('default');
                  setCatalogPage(0);
                }}
              />
            ) : audience === 'guest' ? (
              <RootHeroRows
                nodes={activeRootNodes}
                onNodeClick={(node) => {
                  if (node.id === 'node_root_products') {
                    setCurrentParentId('node_root_products');
                  } else {
                    openQuestionExploration(node.questionText);
                  }
                }}
                tenantTheme={tenantTheme}
                stylePresetId={tenantTheme.stylePresetId}
                layoutBudget={questionVisualConfig.layoutBudget}
              />
            ) : activeOwnerCategory ? (
              <OwnerCategorySubView
                categoryView={activeOwnerCategory}
                tenantProfile={tenantProfile}
                tenantTheme={tenantTheme}
                tenantId={tenantId}
                products={products}
                branches={branches}
                onBack={() => {
                  setLivePreviewTheme(null);
                  setActiveOwnerCategory(null);
                }}
                onOpenAiStudio={(intent) => {
                  setOwnerAiStudioIntent(intent);
                  setIsOwnerAiStudioOpen(true);
                }}
                onLivePreviewChange={(tempTheme) => setLivePreviewTheme(tempTheme)}
              />
            ) : (
              <OwnerDashboardRows
                tenantProfile={tenantProfile}
                tenantTheme={tenantTheme}
                onOpenCategory={(cat) => setActiveOwnerCategory(cat)}
              />
            )}
          </div>

          {/* סרגל תחתון מודרני ואחיד של קושאן לכל העמודים */}
          <KosunUniversalFooter
            tenantProfile={tenantProfile}
            onHomeClick={() => {
              setCurrentParentId(null);
              setActiveExplorationQuestion(null);
            }}
            onOpenSecretOwner={() => setIsLoginModalOpen(true)}
          />

        </div>
      )}

      {/* Focus Mode Voice Modal */}
      <FocusVoiceModal
        isOpen={isFocusMode}
        onClose={() => setIsFocusMode(false)}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        voiceTranscript={voiceTranscript}
        voiceQuery={voiceQuery}
        setVoiceQuery={setVoiceQuery}
        setVoiceTranscript={setVoiceTranscript}
        isAiThinking={isAiThinking}
        dispatchSubmittedQuery={dispatchSubmittedQuery}
        tenantTheme={tenantTheme}
        tenantProfile={tenantProfile}
        stylePresetId={tenantTheme.stylePresetId}
        nodes={currentContextNodes}
      />

      {/* Entity Product Details Modal */}
      <EntityDetailsModal
        item={activeCarModal}
        onClose={() => setActiveCarModal(null)}
        onAction={(actionText) => {
          setActiveCarModal(null);
          dispatchSubmittedQuery(actionText);
        }}
        activeTab={carModalTab}
        setActiveTab={setCarModalTab}
        tenantTheme={tenantTheme}
        tenantProfile={tenantProfile}
      />

      {/* About Brand Styled Story Modal */}
      <AboutBrandModal
        isOpen={isAboutBrandModalOpen}
        onClose={() => setIsAboutBrandModalOpen(false)}
        tenantProfile={tenantProfile}
        tenantTheme={tenantTheme}
      />

      {/* Question Exploration Guided Decision Editor Modal */}
      <QuestionExplorationEditor
        isOpen={isQuestionEditorOpen}
        onClose={() => {
          setIsQuestionEditorOpen(false);
          setAudience('guest');
        }}
        tenantProfile={tenantProfile}
        tenantTheme={tenantTheme}
        initialQuestion={activeExplorationQuestion?.mainQuestion}
        initialAnswer={activeExplorationQuestion?.mainAnswer}
        initialVisualConfig={questionVisualConfig}
        onSaveConfig={(updated) => {
          if (updated.selectedParams) {
            setQuestionVisualConfig({
              layoutBudget: updated.selectedParams.layoutBudget || 'accordion_morph',
              atmosphereTheme: updated.selectedParams.atmosphereTheme || 'cyber_neon',
              languageStyle: updated.selectedParams.languageStyle || 'approachable',
              intentGoal: updated.selectedParams.intentGoal || 'conversion',
              colorMode: updated.selectedParams.colorMode || questionVisualConfig.colorMode || 'night'
            });
          }
          if (activeExplorationQuestion) {
            setActiveExplorationQuestion({
              mainQuestion: updated.mainQuestion,
              mainAnswer: updated.mainAnswer,
              category: updated.categoryTitle || 'עקרונות פרודוקטיביות',
              affinityScore: 98,
              relatedQuestions: updated.relatedQuestions.map((rc: any, idx: number) => ({
                id: 'custom_rc_' + idx,
                question: rc.question,
                affinityScore: idx === 0 ? 80 : idx === 1 ? 50 : 25,
                intentGoal: rc.intentGoal,
                icon: rc.icon,
                category: rc.category || (idx === 0 ? 'ניהול עומס ישיר' : idx === 1 ? 'יתרון טכנולוגי' : 'מסלולי 2026'),
                ctaLabel: idx === 2 ? 'לכל החבילות ◀' : 'העמקה בשיטה'
              }))
            });
          }
        }}
      />

      {/* Owner Autonomous AI Studio Modal */}
      <OwnerAiStudioModal
        isOpen={isOwnerAiStudioOpen}
        onClose={() => setIsOwnerAiStudioOpen(false)}
        tenantProfile={tenantProfile}
        tenantTheme={tenantTheme}
        tenantId={tenantId}
        initialIntent={ownerAiStudioIntent}
      />

      {/* Owner Secret Auth Modal */}
      <OwnerAuthModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginError('');
        }}
        loginPasscode={loginPasscode}
        setLoginPasscode={setLoginPasscode}
        loginError={loginError}
        onLoginSubmit={handleLoginSubmit}
        tenantTheme={tenantTheme}
      />
    </div>
  );
};
