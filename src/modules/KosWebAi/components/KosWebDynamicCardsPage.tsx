import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { PageBuilderConfig, PageCategory } from '../types/pageBuilder.types';
import { PageCreationOptions } from './CreatePageWizardModal';
import {
  getAreaCollectionSchema,
  saveAreaCollectionConfig,
  KOSUN_STYLE_PRESETS,
  StylePresetDefinition,
  resolveDiscoveryLayoutMode,
  KosunDiscoveryLayoutMode,
} from '../../../KOSDESYN/01-core-engine/areaCollectionManager';
import { getTerminology } from '../../../KOSDESYN/01-core-engine/pageTerminologyDictionary';
import { InteractiveCapsule } from '../../../KOSDESYN/06-cognitive-web-portal/InteractiveCapsule';
import { KosunUniversalFooter } from '../../../KOSDESYN/06-cognitive-web-portal/KosunUniversalFooter';
import { TenantProfile, TenantThemeColors } from '../../../KOSDESYN/06-cognitive-web-portal/types';
import { useTenantScope } from '../../../core/tenant';
import {
  KOS_WEB_FUNCTIONS_COLLECTION,
  WebFunctionItem,
  matchWebFunctionsForAdvisor,
} from '../services/webFunctionsCollection';
import { KosWebDesignModeToggle } from './KosWebDesignModeToggle';

export interface KosWebDynamicCardsPageProps {
  pages: PageBuilderConfig[];
  activePageId: string;
  onSelectPage: (page: PageBuilderConfig) => void;
  onNewPage: (options: PageCreationOptions | PageCategory) => void;
  onOpenAiBuilder: () => void;
  onDuplicatePage: (page: PageBuilderConfig) => void;
  onDeletePage: (pageId: string) => void;
  onSetHomePage: (pageId: string) => void;
  onUnsetHomePage?: (pageId: string) => void;
  onTogglePublish: (page: PageBuilderConfig) => void;
  onOpenShortener: (page: PageBuilderConfig) => void;
  onConvertToVideo?: (page: PageBuilderConfig) => void;
  onEnsureLegalPages?: () => Promise<void>;
  onEnsureArchivePages?: () => Promise<void>;
  onOpenAnalyticsHub?: () => void;
  onSwitchTenant?: (tenantId: string) => void;
  brandDna?: any;
  tenantId?: string;
  onToggleClassicMode: () => void;
}

type BabushkaStageMode =
  | 'home'
  | 'active_pages'
  | 'ai_studio'
  | 'seo_geo'
  | 'legal_infrastructure';

export const KosWebDynamicCardsPage: React.FC<KosWebDynamicCardsPageProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onNewPage,
  onOpenAiBuilder,
  onDuplicatePage,
  onDeletePage,
  onSetHomePage,
  onUnsetHomePage,
  onTogglePublish,
  onOpenShortener,
  onConvertToVideo,
  onEnsureLegalPages,
  onEnsureArchivePages,
  onOpenAnalyticsHub,
  onSwitchTenant,
  brandDna,
  tenantId: rawTenantId,
  onToggleClassicMode,
}) => {
  const { tenantId: scopeTenantId } = useTenantScope();
  const tenantId = rawTenantId || scopeTenantId || '_master';

  // 1. קונפיגורציית עיצוב ופריסה מתוך הקולקציה
  const [visualConfig, setVisualConfig] = useState<{
    layoutBudget: KosunDiscoveryLayoutMode;
    atmosphereTheme: string;
    colorMode: 'day' | 'night';
    card_1_title?: string;
    card_1_badge?: string;
    card_1_summary?: string;
    card_1_cta?: string;
    card_2_title?: string;
    card_2_badge?: string;
    card_2_summary?: string;
    card_2_cta?: string;
    card_3_title?: string;
    card_3_badge?: string;
    card_3_summary?: string;
    card_3_cta?: string;
    card_4_title?: string;
    card_4_badge?: string;
    card_4_summary?: string;
    card_4_cta?: string;
    advisor_hint?: string;
  }>({
    layoutBudget: 'accordion_morph',
    atmosphereTheme: 'cyber_neon',
    colorMode: 'night',
  });

  const [isStyleDrawerOpen, setIsStyleDrawerOpen] = useState(false);
  const [stageMode, setStageMode] = useState<BabushkaStageMode>('home');
  const [summaryLineText, setSummaryLineText] = useState<string>(
    'KosWeb KOSDESYN • בחר כרטיס או שוחח עם היועץ העליון לשליפה ממוקדת'
  );
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // חיפוש ויועץ עליון
  const [advisorQuery, setAdvisorQuery] = useState<string>('');
  const [advisorResults, setAdvisorResults] = useState<Array<{ item: WebFunctionItem; score: number; matchReasons: string[] }>>([]);

  // טעינת הקונפיגורציה מהקולקציה
  useEffect(() => {
    let isMounted = true;
    getAreaCollectionSchema('web_home_cards', tenantId, 'saas').then((schema) => {
      if (!isMounted || !schema) return;
      const initialMap: Record<string, any> = {};
      schema.parameters.forEach((param) => {
        initialMap[param.key] = param.currentValue;
      });
      setVisualConfig((prev) => ({
        ...prev,
        ...initialMap,
      }));
    });
    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  const updateVisualConfig = useCallback(
    (updates: Partial<typeof visualConfig>) => {
      setVisualConfig((prev) => {
        const next = { ...prev, ...updates };
        saveAreaCollectionConfig('web_home_cards', tenantId, next).catch(console.warn);
        return next;
      });
    },
    [tenantId]
  );

  // אסימוני עיצוב מהקולקציה
  const isDay = visualConfig.colorMode === 'day';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[visualConfig.atmosphereTheme] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleDef.day : styleDef.night;
  const brandPrimary = modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleDef.geometry.cardRadius || '16px';
  const discoveryMode = resolveDiscoveryLayoutMode(
    visualConfig.layoutBudget,
    styleDef.discovery.mode
  );

  const tenantTheme: TenantThemeColors = useMemo(
    () =>
      ({
        primary: brandPrimary,
        secondary: modeColors.activeBorder,
        accent: '#F59E0B',
        glow: modeColors.glowColor,
        micColor: brandPrimary,
        micGlow: modeColors.glowColor,
        capsuleBg: modeColors.cardBg,
        capsuleBorder: modeColors.borderColor,
        colorMode: visualConfig.colorMode,
        stylePresetId: visualConfig.atmosphereTheme,
        pageBg: modeColors.pageBg,
        cardBg: modeColors.cardBg,
        textColor: modeColors.textColor,
        secondaryText: modeColors.secondaryText,
        borderColor: modeColors.borderColor,
        fontFamily: styleDef.fontFamily,
        cardRadius,
      }) as TenantThemeColors,
    [brandPrimary, modeColors, visualConfig, styleDef, cardRadius]
  );

  const tenantProfile: TenantProfile = useMemo(
    () =>
      ({
        id: tenantId,
        name: brandDna?.identity?.companyName || 'KosWebAi',
        tagline: brandDna?.identity?.slogan || 'יועץ עליון • 4 כרטיסים מונעים לפעולה',
        category: 'saas',
        archetypeId: 'saas',
      }) as TenantProfile,
    [tenantId, brandDna]
  );

  const advisorCapsuleNode = useMemo(
    () =>
      ({
        id: 'top_web_advisor_node',
        questionText:
          advisorQuery ||
          visualConfig.advisor_hint ||
          'היועץ העליון: שאל בכל נושא או בקש להקים עמוד חדש...',
      }) as any,
    [advisorQuery, visualConfig.advisor_hint]
  );

  // הפעלת שאילתת יועץ
  const handleAdvisorSearch = (queryText: string) => {
    setAdvisorQuery(queryText);
    const matched = matchWebFunctionsForAdvisor(queryText);
    setAdvisorResults(matched);
    if (queryText.trim().length > 0) {
      setSummaryLineText(`תוצאות יועץ חכם עבור: "${queryText}" • 4 פעולות מומלצות`);
    } else {
      setSummaryLineText('KosWeb KOSDESYN • בחר כרטיס או שוחח עם היועץ העליון לשליפה ממוקדת');
    }
  };

  // 4 כרטיסי מסך הבית (Level 0)
  const homeFourCards = useMemo(() => {
    return [
      {
        id: 'card_active_pages',
        hebrewIndex: 'א',
        title: visualConfig.card_1_title || 'עמודי אתר חיים ודפי נחיתה',
        badge: `${pages.length} עמודים`,
        summaryLine: visualConfig.card_1_summary || 'עריכת דפי האתר, ניהול מקטעים, שכפול ופרסום חי',
        ctaText: visualConfig.card_1_cta || '4 דפים פעילים ◀',
        icon: 'Layers',
        bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          setStageMode('active_pages');
          setActiveCardIndex(0);
          setSummaryLineText('עמודי האתר של הטננט • בחר עמוד לעריכה מיידית או שכפול');
        },
      },
      {
        id: 'card_ai_studio',
        hebrewIndex: 'ב',
        title: visualConfig.card_2_title || 'KosAi Studio ומחולל עמודים',
        badge: visualConfig.card_2_badge || 'AI Studio',
        summaryLine: visualConfig.card_2_summary || 'יצירת עמודים ורעיונות שיווקיים שלמים מתוך ה-BrandDNA',
        ctaText: visualConfig.card_2_cta || '4 הצעות AI ◀',
        icon: 'Sparkles',
        bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          setStageMode('ai_studio');
          setActiveCardIndex(1);
          setSummaryLineText('KosAi Studio • הפקת דפים חכמים מתוך ה-Brand DNA');
        },
      },
      {
        id: 'card_seo_geo',
        hebrewIndex: 'ג',
        title: visualConfig.card_3_title || 'KoSeoPowerEngin: קונסול ו-GEO',
        badge: visualConfig.card_3_badge || 'קידום ו-SEO',
        summaryLine: visualConfig.card_3_summary || 'ביצועי מנועי חיפוש, אינדוקס Google Console ואנליטיקס 4',
        ctaText: visualConfig.card_3_cta || 'נתוני דירוג ◀',
        icon: 'TrendingUp',
        bgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          setStageMode('seo_geo');
          setActiveCardIndex(2);
          setSummaryLineText('קידום וסרצ׳ קונסול • מדדי דירוג, מילות מפתח ותנועה אורגנית');
        },
      },
      {
        id: 'card_legal_infra',
        hebrewIndex: 'ד',
        title: visualConfig.card_4_title || 'תשתיות משפט, נגישות וסטודיו וידאו',
        badge: visualConfig.card_4_badge || 'חובה ונגישות',
        summaryLine: visualConfig.card_4_summary || 'תקנון, הצהרת נגישות, פרטיות והמרה למשפכי וידאו',
        ctaText: visualConfig.card_4_cta || '4 כלי תשתית ◀',
        icon: 'ShieldCheck',
        bgImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          setStageMode('legal_infrastructure');
          setActiveCardIndex(3);
          setSummaryLineText('תשתיות חובה ומשפטיות • סנכרון תנאי שימוש, נגישות ומשפכים');
        },
      },
    ];
  }, [visualConfig, pages.length]);

  // בדיוק 4 כרטיסים פעילים המוצגים כעת
  const activeFourCards = useMemo(() => {
    // 1. אם יש תוצאות חיפוש פעילות של היועץ
    if (advisorResults.length > 0) {
      return advisorResults.slice(0, 4).map((res, idx) => ({
        id: res.item.id,
        hebrewIndex: ['א', 'ב', 'ג', 'ד'][idx] || `${idx + 1}`,
        title: res.item.title,
        badge: res.item.badge,
        summaryLine: res.item.summary,
        ctaText: res.item.ctaText,
        icon: res.item.icon,
        bgImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          if (res.item.actionKey === 'open_new_page') onNewPage('service_product');
          else if (res.item.actionKey === 'open_ai_builder') onOpenAiBuilder();
          else if (res.item.actionKey === 'open_seo_hub' && onOpenAnalyticsHub) onOpenAnalyticsHub();
          else if (res.item.actionKey === 'ensure_legal_pages' && onEnsureLegalPages) onEnsureLegalPages();
          else if (res.item.actionKey === 'open_editor' && pages[0]) onSelectPage(pages[0]);
        },
      }));
    }

    // 2. מסך בית (Home)
    if (stageMode === 'home') {
      return homeFourCards;
    }

    // 3. עמודי אתר חיים (Active Pages - 4 ראשונים מתוך הרשימה)
    if (stageMode === 'active_pages') {
      const top4 = pages.slice(0, 4);
      return top4.map((p, idx) => ({
        id: p.pageId,
        hebrewIndex: ['א', 'ב', 'ג', 'ד'][idx] || `${idx + 1}`,
        title: p.pageTitle || 'עמוד ללא שם',
        badge: p.published ? 'באוויר' : 'טיוטה',
        summaryLine: `/${p.slug || 'home'} • ${p.sectionOrder?.length || 0} מקטעים • ${p.viewsCount || 0} צפיות`,
        ctaText: 'ערוך עמוד ◀',
        icon: p.isHomePage ? 'Home' : 'FileText',
        bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        onAction: () => onSelectPage(p),
      }));
    }

    // 4. AI Studio
    if (stageMode === 'ai_studio') {
      return [
        {
          id: 'ai_sub_1',
          hebrewIndex: 'א',
          title: 'מחולל דפי נחיתה מהיר',
          badge: 'KosAi Studio',
          summaryLine: 'הפקת דף נחיתה מלא כולל מקטעים וכפתורי המרה מתוך פרומפט יחיד',
          ctaText: 'הפעל מחולל ◀',
          icon: 'Sparkles',
          bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          onAction: onOpenAiBuilder,
        },
        {
          id: 'ai_sub_2',
          hebrewIndex: 'ב',
          title: 'סנכרון מלא עם ה-Brand DNA',
          badge: 'צבעים ושפה',
          summaryLine: 'התאמת כל העמודים הקיימים ללוגו, לצבעים ולטון הדיבור המעודכנים',
          ctaText: 'סנכרן DNA ◀',
          icon: 'Palette',
          bgImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          onAction: () => {
            if (pages[0]) onSelectPage(pages[0]);
          },
        },
        {
          id: 'ai_sub_3',
          hebrewIndex: 'ג',
          title: 'הצעות שיווקיות רציפות',
          badge: 'קמפיינים',
          summaryLine: 'שליפת רעיונות לקמפיינים ודפי נחיתה חדשים המותאמים בדיוק לשוק',
          ctaText: 'פתח הצעות ◀',
          icon: 'Lightbulb',
          bgImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
          onAction: onOpenAiBuilder,
        },
        {
          id: 'ai_sub_4',
          hebrewIndex: 'ד',
          title: 'הקמת עמוד שירות / מוצר',
          badge: 'שירות חדש',
          summaryLine: 'בניית דף מכירה ממוקד עם שאלות נפוצות, מחירון וטופס לידים',
          ctaText: 'הקם עמוד ◀',
          icon: 'PlusCircle',
          bgImage: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
          onAction: () => onNewPage('service_product'),
        },
      ];
    }

    // 5. SEO & GEO
    if (stageMode === 'seo_geo') {
      return [
        {
          id: 'seo_sub_1',
          hebrewIndex: 'א',
          title: 'KoSeoPowerEngin מרכזי',
          badge: 'Google Console',
          summaryLine: 'פתיחת לוח הבקרה לאינדוקס דומיין, שאילתות חיפוש וביצועי אורגני',
          ctaText: 'פתח KoSeo ◀',
          icon: 'BarChart3',
          bgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          onAction: () => {
            if (onOpenAnalyticsHub) onOpenAnalyticsHub();
          },
        },
        {
          id: 'seo_sub_2',
          hebrewIndex: 'ב',
          title: 'קיצור קישור ושיתוף מהיר',
          badge: 'QR & Link',
          summaryLine: 'הפקת קישור מקוצר לעמוד הבית או לדף קמפיין ושיתוף מהיר ברשת',
          ctaText: 'קצר קישור ◀',
          icon: 'Share2',
          bgImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
          onAction: () => {
            if (pages[0]) onOpenShortener(pages[0]);
          },
        },
        {
          id: 'seo_sub_3',
          hebrewIndex: 'ג',
          title: 'מנוע קידום מקומי (GEO Local)',
          badge: 'ערים ואזורים',
          summaryLine: 'הגדרת אזורי שירות, ערי יעד ונתוני עסק מקומיים למנועי AI וגוגל',
          ctaText: 'הגדר GEO ◀',
          icon: 'MapPin',
          bgImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
          onAction: () => {
            if (pages[0]) onSelectPage(pages[0]);
          },
        },
        {
          id: 'seo_sub_4',
          hebrewIndex: 'ד',
          title: 'דוח המרות וצפיות בדפים',
          badge: 'לידים וצפיות',
          summaryLine: `סך צפיות בדפים: ${pages.reduce((acc, p) => acc + (p.viewsCount || 0), 0)} • לידים פעילים`,
          ctaText: 'צפה בנתונים ◀',
          icon: 'Activity',
          bgImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
          onAction: () => {
            if (onOpenAnalyticsHub) onOpenAnalyticsHub();
          },
        },
      ];
    }

    // 6. תשתיות משפט ונגישות
    return [
      {
        id: 'leg_sub_1',
        hebrewIndex: 'א',
        title: 'הקמת עמודי תקנון ופרטיות',
        badge: 'חובה משפטית',
        summaryLine: 'סנכרון תנאי שימוש, מדיניות פרטיות והסדרי אתר מלאים',
        ctaText: 'סנכרן עכשיו ◀',
        icon: 'ShieldCheck',
        bgImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          if (onEnsureLegalPages) onEnsureLegalPages();
        },
      },
      {
        id: 'leg_sub_2',
        hebrewIndex: 'ב',
        title: 'הצהרת נגישות תקנית',
        badge: 'נגישות 2026',
        summaryLine: 'יצירת עמוד הצהרת נגישות רשמי לפי תקן ישראלי 5568 ברמה AA',
        ctaText: 'הקם נגישות ◀',
        icon: 'CheckCircle2',
        bgImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          if (onEnsureLegalPages) onEnsureLegalPages();
        },
      },
      {
        id: 'leg_sub_3',
        hebrewIndex: 'ג',
        title: 'המרה לסטודיו וידאו (Video Funnel)',
        badge: 'משפכי וידאו',
        summaryLine: 'המרת דפי האתר לסרטוני רילס וסטורי אינטראקטיביים ב-Video Studio',
        ctaText: 'המר לווידאו ◀',
        icon: 'Film',
        bgImage: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          if (onConvertToVideo && pages[0]) onConvertToVideo(pages[0]);
        },
      },
      {
        id: 'leg_sub_4',
        hebrewIndex: 'ד',
        title: 'ארכיון עמודים ודפי תוכן',
        badge: 'ארכיון ובלוג',
        summaryLine: 'ניהול עמודי מאמרים, אירועים ועדכונים שוטפים של הטננט',
        ctaText: 'פתח ארכיון ◀',
        icon: 'FolderArchive',
        bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
        onAction: () => {
          if (onEnsureArchivePages) onEnsureArchivePages();
        },
      },
    ];
  }, [
    advisorResults,
    stageMode,
    homeFourCards,
    pages,
    onSelectPage,
    onNewPage,
    onOpenAiBuilder,
    onOpenAnalyticsHub,
    onEnsureLegalPages,
    onEnsureArchivePages,
    onOpenShortener,
    onConvertToVideo,
  ]);

  // רנדור פריסות הגילוי של KOSDESYN (אקורדיון חי כברירת מחדל)
  const renderCardsLayout = () => {
    // 1. פריסת אקורדיון חי (Accordion Morph)
    if (discoveryMode === 'accordion_morph') {
      return (
        <div className={`w-full h-full flex flex-col justify-between gap-1.5 py-0.5 ${styleDef.fontFamily}`}>
          {activeFourCards.map((card, idx) => {
            const isExpanded = activeCardIndex === idx;
            const IconComp = (Icons as any)[card.icon] || Icons.Sparkles;

            return (
              <div
                key={card.id}
                onClick={() => setActiveCardIndex(idx)}
                className={`relative w-full rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group shadow-md flex flex-col justify-end p-2.5 sm:p-3 ${
                  isExpanded ? 'flex-[2.8] min-h-[96px]' : 'flex-1 min-h-[64px]'
                }`}
                style={{
                  borderRadius: cardRadius,
                  borderColor: isExpanded ? brandPrimary : modeColors.borderColor,
                  backgroundColor: modeColors.cardBg,
                }}
              >
                <img
                  src={card.bgImage}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30" />

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderColor: isExpanded ? brandPrimary : modeColors.borderColor,
                        color: brandPrimary,
                      }}
                    >
                      <span className="font-black text-xs">{card.hebrewIndex}</span>
                    </div>

                    <div className="flex flex-col text-right overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="font-black text-xs sm:text-[13px] truncate"
                          style={{ color: modeColors.textColor }}
                        >
                          {card.title}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[8px] font-bold border shrink-0"
                          style={{
                            backgroundColor: `${brandPrimary}20`,
                            borderColor: `${brandPrimary}40`,
                            color: brandPrimary,
                          }}
                        >
                          {card.badge}
                        </span>
                      </div>

                      <p
                        className="text-[10px] line-clamp-1 font-medium leading-tight"
                        style={{ color: modeColors.secondaryText }}
                      >
                        {card.summaryLine}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      card.onAction();
                    }}
                    className="flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-xl font-black text-[9.5px] transition-transform group-hover:-translate-x-1"
                    style={{
                      backgroundColor: isExpanded ? brandPrimary : `${brandPrimary}18`,
                      color: isExpanded ? '#000000' : brandPrimary,
                    }}
                  >
                    <IconComp size={12} className="hidden sm:inline" />
                    <span>{card.ctaText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 2. פריסת רשת 2x2 (Glass Flip Overlay)
    return (
      <div className={`w-full h-full grid grid-cols-2 grid-rows-2 gap-2 py-0.5 ${styleDef.fontFamily}`}>
        {activeFourCards.map((card) => {
          const isFlipped = flippedCardId === card.id;
          const CardIcon = (Icons as any)[card.icon] || Icons.Sparkles;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (isFlipped) card.onAction();
                else setFlippedCardId(card.id);
              }}
              className="relative w-full h-full overflow-hidden border p-3 flex flex-col justify-between cursor-pointer group shadow-lg"
              style={{
                borderRadius: cardRadius,
                background: modeColors.cardBg,
                borderColor: isFlipped ? brandPrimary : modeColors.borderColor,
              }}
            >
              <img
                src={card.bgImage}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/35" />

              <div className="relative z-10 flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs border"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderColor: brandPrimary,
                    color: brandPrimary,
                  }}
                >
                  {card.hebrewIndex}
                </div>
                <CardIcon size={14} style={{ color: brandPrimary }} />
              </div>

              <div className="relative z-10 text-right mt-auto">
                <span className="text-[9px] font-bold block mb-0.5" style={{ color: brandPrimary }}>
                  {card.badge}
                </span>
                <h4 className="text-xs font-black text-white truncate">{card.title}</h4>
                <p className="text-[9.5px] text-slate-300 line-clamp-1">{card.summaryLine}</p>
                <div className="mt-2 text-left">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[8.5px] font-black"
                    style={{ backgroundColor: brandPrimary, color: '#000000' }}
                  >
                    {card.ctaText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="w-full h-[calc(100vh-70px)] flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: modeColors.pageBg,
        color: modeColors.textColor,
      }}
      dir="rtl"
    >
      <div className="flex-1 flex flex-col justify-between p-2 sm:p-4 max-w-5xl mx-auto w-full h-full overflow-hidden">
        {/* סרגל עליון עם מתג חזרה לעיצוב הקודם + בורר טננט */}
        <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5"
              style={{
                backgroundColor: `${brandPrimary}15`,
                borderColor: `${brandPrimary}40`,
                color: brandPrimary,
              }}
            >
              <Icons.Sparkles size={13} />
              <span>KOSDESYN Web Engine</span>
            </span>

            <span className="text-[11px] font-mono text-slate-400">
              טננט: {tenantId} • {pages.length} עמודים
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* כפתור חזרה מיידית לעיצוב הקודם */}
            <KosWebDesignModeToggle mode="kosdesyn" onToggle={onToggleClassicMode} />
          </div>
        </div>

        {/* 1. היועץ העליון (Top Advisor Capsule) */}
        <div className="shrink-0 z-20 mb-2">
          <InteractiveCapsule
            tenantProfile={tenantProfile}
            tenantTheme={tenantTheme}
            activeQuestionNode={advisorCapsuleNode}
            isCatalogActive={stageMode !== 'home'}
            stylePresetId={visualConfig.atmosphereTheme}
            onQuestionClick={() => {
              const q = prompt('מה תרצה לבצע ב-KosWeb? (למשל: "הקם עמוד חדש", "קדם ב-SEO", "מחולל AI")', advisorQuery);
              if (q !== null) handleAdvisorSearch(q);
            }}
            onAvatarPlayClick={() => {
              const q = prompt('מה תרצה לבצע ב-KosWeb? (למשל: "הקם עמוד חדש", "קדם ב-SEO", "מחולל AI")', advisorQuery);
              if (q !== null) handleAdvisorSearch(q);
            }}
            onMicClick={() => {
              const q = prompt('הקלטה/שאילתת שפה טבעית ליועץ KosWeb:', advisorQuery);
              if (q !== null) handleAdvisorSearch(q);
            }}
          />
        </div>

        {/* מגירת סגנונות מהירה */}
        {isStyleDrawerOpen && (
          <div
            className="p-3 rounded-2xl border mb-2 shadow-2xl animate-fadeIn shrink-0 space-y-2"
            style={{
              backgroundColor: modeColors.cardBg,
              borderColor: brandPrimary,
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>החלפת סגנון אטמוספרי (Style Preset):</span>
              <button
                type="button"
                onClick={() => setIsStyleDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {Object.values(KOSUN_STYLE_PRESETS).map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    updateVisualConfig({ atmosphereTheme: preset.value });
                    setIsStyleDrawerOpen(false);
                  }}
                  className="py-1 px-1.5 rounded-lg border text-[9.5px] font-bold truncate"
                  style={{
                    borderColor: visualConfig.atmosphereTheme === preset.value ? brandPrimary : modeColors.borderColor,
                    color: visualConfig.atmosphereTheme === preset.value ? brandPrimary : modeColors.secondaryText,
                  }}
                >
                  {preset.shortLabel}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1 pt-1 border-t border-white/5">
              {[
                { id: 'accordion_morph', label: 'אקורדיון' },
                { id: 'spotlight_stage', label: 'זרקור' },
                { id: 'glass_flip_overlay', label: 'רשת 2x2' },
                { id: 'bento_asymmetric', label: 'בנטו' },
                { id: 'swipe_action_deck', label: 'חפיסה' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    updateVisualConfig({ layoutBudget: l.id as KosunDiscoveryLayoutMode });
                    setIsStyleDrawerOpen(false);
                  }}
                  className="py-0.5 px-1 rounded-md border text-[8.5px] font-bold truncate"
                  style={{
                    borderColor: discoveryMode === l.id ? brandPrimary : modeColors.borderColor,
                    color: discoveryMode === l.id ? brandPrimary : modeColors.secondaryText,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. כותרת אחת יחידה מעל אזור הכרטיסים עם כפתור אחור מובנה + שורת הסיכום + בקרי תצוגה */}
        <div
          className="px-2.5 py-1.5 rounded-2xl border text-[10.5px] font-bold flex items-center justify-between shrink-0 mb-2 shadow-sm"
          style={{
            backgroundColor: `${brandPrimary}12`,
            borderColor: `${brandPrimary}35`,
            color: modeColors.textColor,
          }}
        >
          {/* צד ימין (RTL): כפתור חזור + כותרת יחידה תמציתית */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {(stageMode !== 'home' || advisorResults.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setStageMode('home');
                  setAdvisorResults([]);
                  setAdvisorQuery('');
                  setActiveCardIndex(0);
                  setSummaryLineText('KosWeb KOSDESYN • בחר כרטיס או שוחח עם היועץ העליון לשליפה ממוקדת');
                }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-black text-black flex items-center gap-1 shadow-sm active:scale-95 transition-transform shrink-0"
                style={{ backgroundColor: brandPrimary }}
              >
                <Icons.ArrowRight size={12} />
                <span>חזרה</span>
              </button>
            )}

            <span className="truncate text-[10.5px] font-bold">{summaryLineText}</span>
          </div>

          {/* צד שמאל: בקרי יום/לילה וסגנון */}
          <div className="flex items-center gap-1 shrink-0 mr-1.5">
            <button
              type="button"
              onClick={() =>
                updateVisualConfig({ colorMode: visualConfig.colorMode === 'day' ? 'night' : 'day' })
              }
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              style={{ color: brandPrimary }}
              title={visualConfig.colorMode === 'day' ? 'מצב לילה' : 'מצב יום'}
            >
              {visualConfig.colorMode === 'day' ? <Icons.Moon size={13} /> : <Icons.Sun size={13} />}
            </button>

            <button
              type="button"
              onClick={() => setIsStyleDrawerOpen((prev) => !prev)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              style={{ color: brandPrimary }}
              title="החלף פריסה / סגנון מהקולקציה"
            >
              <Icons.SlidersHorizontal size={13} />
            </button>
          </div>
        </div>

        {/* 3. אזור הליבה: בדיוק 4 כרטיסים על המסך */}
        <div className="flex-1 min-h-0 overflow-hidden relative mb-2">{renderCardsLayout()}</div>

        {/* סרגל תחתון אחיד KOSUN */}
        <div className="shrink-0">
          <KosunUniversalFooter
            tenantProfile={tenantProfile}
            onHomeClick={() => {
              setStageMode('home');
              setAdvisorResults([]);
              setAdvisorQuery('');
              setActiveCardIndex(0);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KosWebDynamicCardsPage;
