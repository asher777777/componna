import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useCrmAnalyticsContext } from '../context/CrmAnalyticsContext';
import { Contact } from '../types';
import {
  CrmMinimalSummaryItem,
  fetchTenantRecentRevenuesOnDemand,
  fetchTenantLeadsRequiringCareOnDemand,
  executeTenantBulkTagActionOnDemand,
  queryAdvisorCardsOnDemand,
  recordCrmEntityUsage,
  safeLocalStorageGet,
  safeLocalStorageSet,
} from '../services/crmDynamicGroupsEngine';
import {
  KOSUN_STYLE_PRESETS,
  StylePresetDefinition,
  KosunDiscoveryLayoutMode,
  resolveDiscoveryLayoutMode,
  getAreaCollectionSchema,
  saveAreaCollectionConfig,
} from '../../../KOSDESYN/01-core-engine/areaCollectionManager';
import { InteractiveCapsule } from '../../../KOSDESYN/06-cognitive-web-portal/InteractiveCapsule';
import { KosunUniversalFooter } from '../../../KOSDESYN/06-cognitive-web-portal/KosunUniversalFooter';
import { TenantProfile, TenantThemeColors } from '../../../KOSDESYN/06-cognitive-web-portal/types';
import { useTenantScope } from '../../../core/tenant';

interface KosCrmDynamicGroupsPageProps {
  onOpenContact360: (contact: Contact) => void;
  onOpenNewContact: () => void;
  onOpenIngestionTools: () => void;
  onOpenExcelImport?: () => void;
  onOpenGoogleSheets?: () => void;
  onSyncSmartForms?: () => void;
  onMergeDuplicates?: () => void;
  onScanCard?: () => void;
  onSwitchToLegacyTable: () => void;
  onSwitchToLegacyAnalytics: () => void;
}

type BabushkaStageMode =
  | 'home'          // מסך הבית: 4 כרטיסי הליבה של המנג'ר
  | 'add_assets'    // כרטיס 1: 4 הצעות להרחבת הנכסים האנושיים
  | 'revenues'      // כרטיס 2: 4 כרטיסיות עם נתוני הכנסות אחרונות (מהשרת לטננט בלבד)
  | 'leads'         // כרטיס 3: 4 כרטיסיות של לידים הדורשים טיפול (מהשרת לטננט בלבד)
  | 'bulk_sort'     // כרטיס 4: 4 פעולות תיוג ומיון רבות-משתתפים
  | 'advisor_cards'; // כרטיסים שנפרשו על ידי היועץ העליון לפי דרישת שיחה

interface FocusedBabushkaCard {
  id: string;
  hebrewIndex: string; // א, ב, ג, ד
  title: string;
  summaryLine: string; // שורת הסיכום המעטה בלבד
  badge: string;
  icon: string;
  bgImage: string;
  ctaText: string;
  onAction: () => void;
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד'];

export const KosCrmDynamicGroupsPage: React.FC<KosCrmDynamicGroupsPageProps> = ({
  onOpenContact360,
  onOpenNewContact,
  onOpenIngestionTools,
  onOpenExcelImport,
  onOpenGoogleSheets,
  onSyncSmartForms,
  onMergeDuplicates,
  onScanCard,
}) => {
  const { firebaseApp, ownerId, resolvedCollections } = useCrmAnalyticsContext();
  const { tenantId: rawTenantId } = useTenantScope();
  const tenantId = rawTenantId || '_master';

  const currentUserId = useMemo(() => {
    if (ownerId) return ownerId;
    const saved = safeLocalStorageGet('kosun_active_user_id');
    if (saved) return saved;
    const generated = `user_${tenantId}_admin`;
    safeLocalStorageSet('kosun_active_user_id', generated);
    return generated;
  }, [ownerId, tenantId]);

  // קונפיגורציית עיצוב ופריסה מתוך הקולקציה
  const [visualConfig, setVisualConfig] = useState<{
    layoutBudget: KosunDiscoveryLayoutMode;
    atmosphereTheme: string;
    colorMode: 'day' | 'night';
  }>({
    layoutBudget: 'accordion_morph',
    atmosphereTheme: 'cyber_neon',
    colorMode: 'night',
  });

  const [isStyleDrawerOpen, setIsStyleDrawerOpen] = useState(false);

  // מצב ניווט הבבושקה (תמיד מקסימום 4 כרטיסים על המסך!)
  const [stageMode, setStageMode] = useState<BabushkaStageMode>('home');
  const [isLoadingServer, setIsLoadingServer] = useState<boolean>(false);
  const [serverCards, setServerCards] = useState<CrmMinimalSummaryItem[]>([]);
  const [summaryLineText, setSummaryLineText] = useState<string>(
    'טננט מנהל פעיל • בחר כרטיס או שוחח עם היועץ העליון לשליפה ממוקדת'
  );

  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // היועץ העליון (Top Advisor) – שיחה בטקסט או בקול שפורשת כרטיסים לפי דרישה
  const [isAdvisorChatOpen, setIsAdvisorChatOpen] = useState<boolean>(false);
  const [advisorInput, setAdvisorInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // בטעינה: קוראים אך ורק את הגדרת העיצוב של העמוד (אפס משיכת אנשי קשר מראש!)
  useEffect(() => {
    let mounted = true;
    getAreaCollectionSchema('area_crm_dynamic_groups', tenantId, 'saas').then((schema) => {
      if (!mounted) return;
      const map: Record<string, any> = {};
      schema.parameters.forEach((p) => {
        map[p.key] = p.currentValue;
      });
      setVisualConfig((prev) => ({
        layoutBudget: resolveDiscoveryLayoutMode(map.layoutBudget, prev.layoutBudget),
        atmosphereTheme: map.atmosphereTheme || prev.atmosphereTheme,
        colorMode: map.colorMode === 'day' ? 'day' : 'night',
      }));
    });
    return () => {
      mounted = false;
    };
  }, [tenantId]);

  const updateVisualConfig = (patch: Partial<typeof visualConfig>) => {
    const next = { ...visualConfig, ...patch };
    setVisualConfig(next);
    saveAreaCollectionConfig('area_crm_dynamic_groups', tenantId, next);
  };

  // =========================================================================
  // פעולות משיכה לפי דרישה מהשרת (רק לטננט של המנג'ר ורק עד 4 תוצאות סיכום!)
  // =========================================================================

  // 1. פתיחת כרטיס 1: 4 הצעות להוספת נכסים אנושיים
  const openAddAssetsStage = () => {
    recordCrmEntityUsage(tenantId, currentUserId, 'card_home_add_assets', firebaseApp, 1);
    setStageMode('add_assets');
    setActiveCardIndex(0);
    setSummaryLineText('4 ערוצים להרחבת הנכסים האנושיים של הטננט:');
  };

  // 2. פתיחת כרטיס 2: משיכת 4 נתוני הכנסות אחרונות מהשרת (לטננט הנוכחי בלבד)
  const openRecentRevenuesStage = async () => {
    recordCrmEntityUsage(tenantId, currentUserId, 'card_home_revenues', firebaseApp, 1);
    setStageMode('revenues');
    setActiveCardIndex(0);
    setIsLoadingServer(true);
    setSummaryLineText('מושך מהשרת את 4 נתוני ההכנסות האחרונות של הטננט...');

    const res = await fetchTenantRecentRevenuesOnDemand({
      firebaseApp,
      tenantId,
      contactsCollectionPath: resolvedCollections?.contacts,
    });

    setServerCards(res.items);
    setSummaryLineText(res.summaryLine);
    setIsLoadingServer(false);
  };

  // 3. פתיחת כרטיס 3: משיכת 4 לידים הדורשים טיפול מהשרת (לטננט הנוכחי בלבד)
  const openLeadsRequiringCareStage = async () => {
    recordCrmEntityUsage(tenantId, currentUserId, 'card_home_leads', firebaseApp, 1);
    setStageMode('leads');
    setActiveCardIndex(0);
    setIsLoadingServer(true);
    setSummaryLineText('מושך מהשרת 4 לידים של הטננט הדורשים טיפול...');

    const res = await fetchTenantLeadsRequiringCareOnDemand({
      firebaseApp,
      tenantId,
      contactsCollectionPath: resolvedCollections?.contacts,
    });

    setServerCards(res.items);
    setSummaryLineText(res.summaryLine);
    setIsLoadingServer(false);
  };

  // 4. פתיחת כרטיס 4: 4 פעולות תיוג ומיון רבות-משתתפים
  const openBulkSortingStage = () => {
    recordCrmEntityUsage(tenantId, currentUserId, 'card_home_bulk_sort', firebaseApp, 1);
    setStageMode('bulk_sort');
    setActiveCardIndex(0);
    setSummaryLineText('בחר פעולת תיוג או מיון רבת-משתתפים להחלה על אנשי הקשר של הטננט:');
  };

  // 5. שיחה עם היועץ העליון -> פורש עד 4 כרטיסים עם נתונים לפי דרישה!
  const handleSubmitAdvisorQuery = async (rawQuery: string) => {
    const clean = rawQuery.trim();
    if (!clean) return;

    setIsAdvisorChatOpen(false);
    setAdvisorInput('');
    setIsLoadingServer(true);
    setSummaryLineText(`היועץ העליון שולף מהשרת תוצאות עבור: "${clean}"...`);

    const res = await queryAdvisorCardsOnDemand({
      firebaseApp,
      tenantId,
      queryText: clean,
      contactsCollectionPath: resolvedCollections?.contacts,
    });

    setSummaryLineText(res.advisorReply);

    if (res.modeTrigger === 'add_assets') {
      setStageMode('add_assets');
    } else if (res.modeTrigger === 'bulk_sort') {
      setStageMode('bulk_sort');
    } else if (res.modeTrigger === 'revenues') {
      setStageMode('revenues');
      setServerCards(res.customCards || []);
    } else if (res.modeTrigger === 'leads') {
      setStageMode('leads');
      setServerCards(res.customCards || []);
    } else {
      setStageMode('advisor_cards');
      setServerCards(res.customCards || []);
    }

    setActiveCardIndex(0);
    setIsLoadingServer(false);
  };

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechRec();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'he-IL';
      recog.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) handleSubmitAdvisorQuery(transcript);
      };
      recog.onend = () => setIsRecording(false);
      recog.onerror = () => setIsRecording(false);
      recognitionRef.current = recog;
    }
  }, [tenantId, firebaseApp]);

  const handleMicTrigger = () => {
    if (!recognitionRef.current) {
      setIsAdvisorChatOpen(true);
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  // =========================================================================
  // בניית 4 הכרטיסים הפעילים לפי שלב הבבושקה הנוכחי (לעולם לא יותר מ-4!)
  // =========================================================================
  const activeFourCards = useMemo<FocusedBabushkaCard[]>(() => {
    // -----------------------------------------------------------------------
    // מסך הבית (שורש הבבושקה): 4 הכרטיסים המדויקים שהוגדרו
    // -----------------------------------------------------------------------
    if (stageMode === 'home') {
      return [
        {
          id: 'home_1_add_assets',
          hebrewIndex: 'א',
          title: 'הצעות להוספת נכסים',
          summaryLine: 'פותח 4 כרטיסים עם הצעות להרחבת הנכסים האנושיים של הטננט',
          badge: 'הרחבת נכסים',
          icon: 'UserPlus',
          bgImage:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          ctaText: '4 הצעות הרחבה ◀',
          onAction: openAddAssetsStage,
        },
        {
          id: 'home_2_recent_revenues',
          hebrewIndex: 'ב',
          title: 'צפייה בהכנסות האחרונות',
          summaryLine: 'פותח 4 כרטיסיות עם נתוני ההכנסות והעסקאות האחרונות של הטננט',
          badge: 'נתוני הכנסות',
          icon: 'CreditCard',
          bgImage:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          ctaText: '4 כרטיסי הכנסות ◀',
          onAction: openRecentRevenuesStage,
        },
        {
          id: 'home_3_leads_care',
          hebrewIndex: 'ג',
          title: 'לידים שדורשים טיפול',
          summaryLine: 'פותח 4 כרטיסיות של לידים פעילים בטננט הממתינים למענה',
          badge: 'דורש טיפול',
          icon: 'Flame',
          bgImage:
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          ctaText: '4 לידים לטיפול ◀',
          onAction: openLeadsRequiringCareStage,
        },
        {
          id: 'home_4_bulk_sort',
          hebrewIndex: 'ד',
          title: 'מיון אנשי קשר',
          summaryLine: 'פותח 4 כרטיסים עם פעולות תיוג ומיון רבות-משתתפים בקולקציה',
          badge: 'תיוג רב-משתתפים',
          icon: 'Tags',
          bgImage:
            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
          ctaText: '4 פעולות תיוג ◀',
          onAction: openBulkSortingStage,
        },
      ];
    }

    // -----------------------------------------------------------------------
    // כרטיס 1 (פנימי): 4 כרטיסים עם הצעות להרחבת הנכסים האנושיים
    // -----------------------------------------------------------------------
    if (stageMode === 'add_assets') {
      return [
        {
          id: 'asset_1_excel',
          hebrewIndex: 'א',
          title: 'ייבוא רשימת אנשי קשר מאקסל / CSV',
          summaryLine: 'קליטה מהירה של קובץ לקוחות או מתעניינים ישירות לטננט',
          badge: 'ייבוא קובץ',
          icon: 'FileSpreadsheet',
          bgImage:
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
          ctaText: 'ייבא מאקסל ◀',
          onAction: () => {
            if (onOpenExcelImport) onOpenExcelImport();
            else onOpenIngestionTools();
          },
        },
        {
          id: 'asset_2_gsheets',
          hebrewIndex: 'ב',
          title: 'סנכרון חי מגיליון Google Sheets',
          summaryLine: 'חיבור גיליון גוגל להזרמה אוטומטית של נכסים אנושיים חדשים',
          badge: 'סנכרון חי',
          icon: 'Database',
          bgImage:
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          ctaText: 'חבר גיליון ◀',
          onAction: () => {
            if (onOpenGoogleSheets) onOpenGoogleSheets();
            else onOpenIngestionTools();
          },
        },
        {
          id: 'asset_3_forms',
          hebrewIndex: 'ג',
          title: 'שאיבת פניות חדשות מטפסים חכמים',
          summaryLine: 'מיזוג אוטומטי של כל הנרשמים שהגישו טפסים בטננט',
          badge: 'טפסים חכמים',
          icon: 'FileText',
          bgImage:
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
          ctaText: 'סנכרן טפסים ◀',
          onAction: () => {
            if (onSyncSmartForms) onSyncSmartForms();
            else onOpenIngestionTools();
          },
        },
        {
          id: 'asset_4_new_or_scan',
          hebrewIndex: 'ד',
          title: 'הקמת נכס אנושי חדש / סריקת כרטיס',
          summaryLine: 'הוספה ישירה של איש קשר חדש או צילום כרטיס ביקור ב-AI',
          badge: 'הוספה מהירה',
          icon: 'UserPlus',
          bgImage:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          ctaText: '+ הוסף נכס ◀',
          onAction: () => {
            if (onScanCard) onOpenNewContact();
            else onOpenNewContact();
          },
        },
      ];
    }

    // -----------------------------------------------------------------------
    // כרטיס 4 (פנימי): 4 כרטיסים עם פעולות תיוג ומיון רבות-משתתפים
    // -----------------------------------------------------------------------
    if (stageMode === 'bulk_sort') {
      return [
        {
          id: 'bulk_1_vip',
          hebrewIndex: 'א',
          title: 'תיוג רב-משתתפים: סמן משלמים כ-"לקוח VIP"',
          summaryLine: 'מאתר בשרת את כל הלקוחות המשלמים של הטננט ומתייג אותם כ-VIP',
          badge: 'תיוג אוטומטי',
          icon: 'Crown',
          bgImage:
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          ctaText: 'החל תיוג VIP ◀',
          onAction: async () => {
            setIsLoadingServer(true);
            const res = await executeTenantBulkTagActionOnDemand({
              firebaseApp,
              tenantId,
              contactsCollectionPath: resolvedCollections?.contacts,
              actionType: 'tag_vip',
            });
            setSummaryLineText(res.summaryMessage);
            setIsLoadingServer(false);
          },
        },
        {
          id: 'bulk_2_followup',
          hebrewIndex: 'ב',
          title: 'תיוג רב-משתתפים: סמן מתעניינים ל-"בטיפול ממוקד"',
          summaryLine: 'מתייג באופן מרוכז את הפניות הפתוחות בטננט למעקב מסודר',
          badge: 'מיקוד לידים',
          icon: 'Flame',
          bgImage:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          ctaText: 'תייג למעקב ◀',
          onAction: async () => {
            setIsLoadingServer(true);
            const res = await executeTenantBulkTagActionOnDemand({
              firebaseApp,
              tenantId,
              contactsCollectionPath: resolvedCollections?.contacts,
              actionType: 'tag_followup',
            });
            setSummaryLineText(res.summaryMessage);
            setIsLoadingServer(false);
          },
        },
        {
          id: 'bulk_3_group',
          hebrewIndex: 'ג',
          title: 'שיוך רב-משתתפים לקהילה או תגית מותאמת',
          summaryLine: 'הזן שם תגית או קהילה להחלה מרוכזת על אנשי הקשר של הטננט',
          badge: 'שיוך קבוצתי',
          icon: 'Users',
          bgImage:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          ctaText: 'בחר תגית להחלה ◀',
          onAction: async () => {
            const customTag = window.prompt('הזן שם תגית או קהילה להחלה מרובה על אנשי הקשר של הטננט:', 'מועדון לקוחות 2026');
            if (!customTag) return;
            setIsLoadingServer(true);
            const res = await executeTenantBulkTagActionOnDemand({
              firebaseApp,
              tenantId,
              contactsCollectionPath: resolvedCollections?.contacts,
              actionType: 'assign_group',
              customValue: customTag,
            });
            setSummaryLineText(res.summaryMessage);
            setIsLoadingServer(false);
          },
        },
        {
          id: 'bulk_4_dedup',
          hebrewIndex: 'ד',
          title: 'מיון ואיחוד רשומות כפולות בטננט',
          summaryLine: 'מזהה וממזג אוטומטית אנשי קשר בעלי אותו טלפון או אימייל',
          badge: 'ניקוי קולקציה',
          icon: 'Sparkles',
          bgImage:
            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
          ctaText: 'מזג כפילויות ◀',
          onAction: () => {
            if (onMergeDuplicates) onMergeDuplicates();
          },
        },
      ];
    }

    // -----------------------------------------------------------------------
    // כרטיס 2 (הכנסות אחרונות) / כרטיס 3 (לידים לטיפול) / תוצאות היועץ העליון
    // -----------------------------------------------------------------------
    if (serverCards.length === 0) {
      return [
        {
          id: 'empty_server_result',
          hebrewIndex: 'א',
          title:
            stageMode === 'revenues'
              ? 'טרם נרשמו הכנסות בקולקציית הטננט'
              : 'לא נמצאו רשומות ממתינות בטננט זה',
          summaryLine: 'לחץ להוספת איש קשר / עסקה חדשה או חזור למסך הבית של ה-CRM',
          badge: 'טננט נקי',
          icon: 'PlusCircle',
          bgImage:
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          ctaText: '+ הוסף רשומה ◀',
          onAction: onOpenNewContact,
        },
      ];
    }

    return serverCards.slice(0, 4).map((item, idx) => ({
      id: item.id,
      hebrewIndex: HEBREW_LETTERS[idx] || 'א',
      title: item.title,
      summaryLine: item.summaryLine,
      badge: item.badge,
      icon: item.icon,
      bgImage:
        stageMode === 'revenues'
          ? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      ctaText: item.ctaText,
      onAction: () => {
        if (stageMode === 'leads' && item.phone) {
          const cleanPhone = item.phone.replace(/\D/g, '');
          const intl = cleanPhone.startsWith('0') ? `972${cleanPhone.slice(1)}` : cleanPhone;
          window.open(`https://wa.me/${intl}`, '_blank');
        } else if (item.contactRef) {
          onOpenContact360(item.contactRef);
        }
      },
    }));
  }, [stageMode, serverCards, firebaseApp, tenantId]);

  // אסימוני עיצוב מהקולקציה
  const isDay = visualConfig.colorMode === 'day';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[visualConfig.atmosphereTheme] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleDef.day : styleDef.night;
  const brandPrimary = modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleDef.geometry.cardRadius;
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
        name: 'KOSCRM',
        tagline: 'יועץ עליון • 4 כרטיסים מונעים לפעולה',
        category: 'saas',
        archetypeId: 'saas',
      }) as TenantProfile,
    [tenantId]
  );

  const advisorCapsuleNode = useMemo(
    () =>
      ({
        id: 'top_advisor_node',
        questionText: isRecording
          ? 'מקשיב לך... אמור מה לפרוש בכרטיסים'
          : 'היועץ העליון: לחץ לשיחה או בקש פריסת נתונים לפי דרישה',
      }) as any,
    [isRecording]
  );

  // =========================================================================
  // רנדור 4 הכרטיסים בלבד (שורת כותרת + שורת הסיכום המעטה + כפתור פעולה)
  // =========================================================================
  const renderFourCardsStage = () => {
    if (isLoadingServer) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <Icons.Loader2 size={28} className="animate-spin" style={{ color: brandPrimary }} />
          <span className="text-xs font-bold" style={{ color: modeColors.secondaryText }}>
            שולף מהשרת את תוצאות הטננט בלבד...
          </span>
        </div>
      );
    }

    // פריסת רשת 2x2 (Glass Flip Overlay)
    if (discoveryMode === 'glass_flip_overlay') {
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
                  <h3 className="text-xs font-black text-white line-clamp-2 leading-snug">
                    {card.title}
                  </h3>
                </div>

                {isFlipped && (
                  <div
                    className="absolute inset-0 z-20 p-3 backdrop-blur-xl flex flex-col justify-between text-right animate-fadeIn"
                    style={{ backgroundColor: 'rgba(4,7,17,0.94)' }}
                  >
                    <p className="text-[10.5px] text-slate-200 line-clamp-3 leading-relaxed">
                      {card.summaryLine}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        card.onAction();
                      }}
                      className="w-full py-1.5 rounded-xl text-black font-black text-[10.5px]"
                      style={{ backgroundColor: brandPrimary }}
                    >
                      {card.ctaText}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // ברירת מחדל: 4 רצועות בבושקה ממוקדות (א, ב, ג, ד) עם שורת הסיכום המעטה בלבד
    return (
      <div className="w-full h-full flex flex-col justify-between gap-2 py-0.5" dir="rtl">
        {activeFourCards.map((card, idx) => {
          const isExpanded = discoveryMode === 'accordion_morph' && activeCardIndex === idx;
          const IconComp = (Icons as any)[card.icon] || Icons.Sparkles;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (discoveryMode === 'accordion_morph' && !isExpanded) {
                  setActiveCardIndex(idx);
                } else {
                  card.onAction();
                }
              }}
              className={`relative w-full overflow-hidden border transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between p-2.5 sm:p-3 ${
                isExpanded ? 'flex-[1.5]' : 'flex-1'
              }`}
              style={{
                minHeight: '76px',
                borderRadius: cardRadius,
                borderColor: isExpanded ? brandPrimary : modeColors.borderColor,
                background: modeColors.cardBg,
                boxShadow: isExpanded ? `0 6px 22px -6px ${modeColors.glowColor}` : undefined,
              }}
            >
              <img
                src={card.bgImage}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-25 group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: isDay
                    ? 'linear-gradient(to left, rgba(255,255,255,0.95), rgba(240,249,255,0.86))'
                    : 'linear-gradient(to left, rgba(4,7,17,0.94), rgba(15,23,42,0.80))',
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-2 my-auto">
                <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: isExpanded ? brandPrimary : 'rgba(0,0,0,0.6)',
                      borderColor: brandPrimary,
                      color: isExpanded ? '#000000' : brandPrimary,
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

                    {/* שורת הסיכום המעטה בלבד */}
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
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center py-2 px-2 select-none"
      dir="rtl"
    >
      {/* 📱 מסגרת הפוקוס של KOSUN 2026: יועץ עליון + שורת סיכום מעטה + 4 כרטיסי בבושקה */}
      <div
        className="w-full max-w-md h-[720px] max-h-[88vh] rounded-[36px] overflow-hidden border-2 shadow-2xl relative flex flex-col justify-between p-3 transition-colors duration-300"
        style={{
          backgroundColor: tenantTheme.pageBg,
          color: tenantTheme.textColor,
          borderColor: `${brandPrimary}45`,
          boxShadow: `0 0 45px ${modeColors.glowColor}`,
        }}
      >
        {/* 1. היועץ העליון (Top Advisor Capsule) – מוצג ישירות בראש המסך ללא שכפול כותרות */}
        <div className="shrink-0 z-20">
          <InteractiveCapsule
            tenantProfile={tenantProfile}
            tenantTheme={tenantTheme}
            activeQuestionNode={advisorCapsuleNode}
            isCatalogActive={stageMode !== 'home'}
            stylePresetId={visualConfig.atmosphereTheme}
            onAvatarPlayClick={() => setIsAdvisorChatOpen((prev) => !prev)}
            onQuestionClick={() => setIsAdvisorChatOpen((prev) => !prev)}
            onMicClick={handleMicTrigger}
          />
        </div>

        {/* שורת שיחה נפתחת עם היועץ העליון */}
        {isAdvisorChatOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitAdvisorQuery(advisorInput);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border animate-fadeIn shrink-0 my-1"
            style={{ background: modeColors.cardBg, borderColor: brandPrimary }}
          >
            <Icons.Sparkles size={14} style={{ color: brandPrimary }} />
            <input
              type="text"
              autoFocus
              value={advisorInput}
              onChange={(e) => setAdvisorInput(e.target.value)}
              placeholder="בקש מהיועץ: הכנסות אחרונות / לידים לטיפול / שם לקוח..."
              className="flex-1 bg-transparent text-xs font-bold outline-none"
              style={{ color: modeColors.textColor }}
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-xl text-[10px] font-black text-black shrink-0"
              style={{ backgroundColor: brandPrimary }}
            >
              פרוש 4 כרטיסים ◀
            </button>
          </form>
        )}

        {/* מגירת החלפת סגנון קולקציה קומפקטית */}
        {isStyleDrawerOpen && (
          <div
            className="p-2 rounded-2xl border flex flex-col gap-1.5 z-30 animate-fadeIn shrink-0 my-1"
            style={{ background: modeColors.cardBg, borderColor: brandPrimary }}
          >
            <div className="grid grid-cols-5 gap-1">
              {Object.values(KOSUN_STYLE_PRESETS).map((preset, idx) => {
                const active = visualConfig.atmosphereTheme === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() =>
                      updateVisualConfig({
                        atmosphereTheme: preset.value,
                        layoutBudget: resolveDiscoveryLayoutMode(
                          preset.defaultLayout,
                          preset.discovery.mode
                        ),
                      })
                    }
                    className="py-1 px-1 rounded-lg border text-[8.5px] font-black truncate"
                    style={{
                      backgroundColor: active ? brandPrimary : 'transparent',
                      borderColor: active ? brandPrimary : modeColors.borderColor,
                      color: active ? '#000' : modeColors.textColor,
                    }}
                  >
                    {idx + 1}. {preset.shortLabel}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(
                [
                  { id: 'accordion_morph', label: 'אקורדיון' },
                  { id: 'spotlight_stage', label: 'זרקור' },
                  { id: 'glass_flip_overlay', label: 'רשת 2x2' },
                  { id: 'bento_asymmetric', label: 'בנטו' },
                  { id: 'swipe_action_deck', label: 'חפיסה' },
                ] as Array<{ id: KosunDiscoveryLayoutMode; label: string }>
              ).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    updateVisualConfig({ layoutBudget: l.id });
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
          className="px-2.5 py-1.5 rounded-2xl border text-[10.5px] font-bold flex items-center justify-between shrink-0 mt-1 shadow-sm"
          style={{
            backgroundColor: `${brandPrimary}12`,
            borderColor: `${brandPrimary}35`,
            color: modeColors.textColor,
          }}
        >
          {/* צד ימין (RTL): כפתור חזור + כותרת יחידה תמציתית */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {stageMode !== 'home' && (
              <button
                type="button"
                onClick={() => {
                  setStageMode('home');
                  setActiveCardIndex(0);
                  setSummaryLineText(
                    'טננט מנהל פעיל • בחר כרטיס או שוחח עם היועץ העליון לשליפה ממוקדת'
                  );
                }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-black text-black flex items-center gap-1 shadow-sm active:scale-95 transition-transform shrink-0"
                style={{ backgroundColor: brandPrimary }}
              >
                <Icons.ArrowRight size={12} />
                <span>חזרה</span>
              </button>
            )}

            <span className="truncate text-[10.5px] font-bold">
              {summaryLineText}
            </span>
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

        {/* 3. במת ה-60% המרכזית: 4 כרטיסים מונעים לפעולה בלבד */}
        <div className="relative z-10 w-full flex-1 flex flex-col justify-center py-1 overflow-hidden my-auto">
          {renderFourCardsStage()}
        </div>

        {/* 5. סרגל תחתון אחיד של קושאן */}
        <div className="shrink-0">
          <KosunUniversalFooter
            tenantProfile={tenantProfile}
            onHomeClick={() => {
              setStageMode('home');
              setActiveCardIndex(0);
              setSummaryLineText(
                'טננט מנהל פעיל • בחר כרטיס או שוחח עם היועץ העליון לשליפה ממוקדת'
              );
            }}
            onOpenSecretOwner={() => setIsStyleDrawerOpen((prev) => !prev)}
          />
        </div>
      </div>
    </div>
  );
};

export default KosCrmDynamicGroupsPage;
