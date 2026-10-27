import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useCrmAnalyticsContext } from '../context/CrmAnalyticsContext';
import { Contact } from '../types';
import {
  CrmDynamicGroup,
  DynamicGroupCategory,
  DynamicRankingMode,
  EntityUsageRecord,
  RankedContactItem,
  ContactDataSectionGroup,
  buildDynamicCrmGroupsFromCollection,
  buildContactDynamicDataSections,
  fetchCloudUsageMetrics,
  loadLocalUsageMetrics,
  recordCrmEntityUsage,
  boostCrmEntityImportance,
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
  onSwitchToLegacyTable: () => void;
  onSwitchToLegacyAnalytics: () => void;
}

interface VisualCardAdapter {
  id: string;
  indexBadge: string;
  title: string;
  subtitle: string;
  badge: string;
  metricsLine: string;
  importanceScore: number;
  globalUsageCount: number;
  userUsageCount: number;
  icon: string;
  bgImage: string;
  ctaText: string;
  secondaryCtaText?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: (e: React.MouseEvent) => void;
  onBoostImportance?: (e: React.MouseEvent) => void;
}

const RANKING_MODE_META: Record<
  DynamicRankingMode,
  { label: string; shortLabel: string; icon: string; desc: string }
> = {
  combined: {
    label: 'דירוג משוקלל חכם (חשיבות + שימושים + שלי)',
    shortLabel: 'משוקלל חכם',
    icon: 'Sparkles',
    desc: 'שקלול דינמי של חשיבות עסקית, סך השימושים במערכת והשימושים האישיים שלך',
  },
  importance: {
    label: 'לפי חשיבות עסקית (Importance)',
    shortLabel: 'לפי חשיבות',
    icon: 'Crown',
    desc: 'מציג בראש את הקבוצות ואנשי הקשר בעלי הערך הכלכלי והדחיפות הגבוהים ביותר',
  },
  global_usage: {
    label: 'לפי מספר שימושים כללי (Global Usage)',
    shortLabel: 'לפי מס׳ שימושים',
    icon: 'Activity',
    desc: 'מציג בראש את הקבוצות ואנשי הקשר הפעילים ביותר בכלל המערכת והאינטראקציות',
  },
  user_usage: {
    label: 'לפי מספר השימושים של המשתמש (My Usage)',
    shortLabel: 'השימושים שלי',
    icon: 'UserCheck',
    desc: 'לומד כל לחיצה שלך ומקפיץ לראש המסך את הקבוצות ואנשי הקשר שבהם אתה משתמש הכי הרבה',
  },
};

const CATEGORY_FILTER_LABELS: Record<DynamicGroupCategory | 'all', { label: string; icon: string }> = {
  all: { label: 'כל הקבוצות הדינמיות', icon: 'Layers' },
  priority: { label: 'חשיבות וסטטוס', icon: 'Flame' },
  community: { label: 'קהילות וקבוצות', icon: 'Users' },
  tag: { label: 'תגיות וסגמנטים', icon: 'Tag' },
  source: { label: 'מקורות הגעה', icon: 'Compass' },
  form: { label: 'טפסים חכמים', icon: 'FileText' },
  city: { label: 'ערים ואזורים', icon: 'MapPin' },
  custom: { label: 'שדות דינמיים', icon: 'Database' },
};

export const KosCrmDynamicGroupsPage: React.FC<KosCrmDynamicGroupsPageProps> = ({
  onOpenContact360,
  onOpenNewContact,
  onOpenIngestionTools,
  onSwitchToLegacyTable,
  onSwitchToLegacyAnalytics,
}) => {
  const { data, loading, refresh, updateField, firebaseApp, ownerId } = useCrmAnalyticsContext();
  const { tenantId: rawTenantId } = useTenantScope();
  const tenantId = rawTenantId || '_master';

  // זיהוי המשתמש הנוכחי לטובת ספירת "מספר השימושים של המשתמש"
  const currentUserId = useMemo(() => {
    if (ownerId) return ownerId;
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('kosun_active_user_id');
      if (savedUser) return savedUser;
      const generated = `user_${tenantId}_admin`;
      localStorage.setItem('kosun_active_user_id', generated);
      return generated;
    }
    return 'owner_default';
  }, [ownerId, tenantId]);

  // 1. קונפיגורציית עיצוב ופריסה מתוך הקולקציה (Zero Hardcoded UI)
  const [visualConfig, setVisualConfig] = useState<{
    layoutBudget: KosunDiscoveryLayoutMode;
    atmosphereTheme: string;
    colorMode: 'day' | 'night';
  }>({
    layoutBudget: 'accordion_morph',
    atmosphereTheme: 'cyber_neon',
    colorMode: 'night',
  });

  const [isStyleSelectorOpen, setIsStyleSelectorOpen] = useState(false);

  // 2. מטריקות שימוש וחשיבות (מסונכרנות מול Firestore + LocalStorage)
  const [usageMetrics, setUsageMetrics] = useState<Record<string, EntityUsageRecord>>(() =>
    loadLocalUsageMetrics(tenantId)
  );

  // 3. מצבי דירוג, סינון וניווט בבושקה (4 כרטיסים במקסימום בכל מסך)
  const [rankingMode, setRankingMode] = useState<DynamicRankingMode>('combined');
  const [categoryFilter, setCategoryFilter] = useState<DynamicGroupCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // בבושקה: רמה 1 (קבוצות) -> רמה 2 (אנשי קשר בקבוצה) -> רמה 3 (קבוצות הנתונים של איש הקשר)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // אינדקס הכרטיס הפעיל בתוך ה-4 + עמוד נוכחי במצפן (4 כרטיסים לעמוד)
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [groupsPage, setGroupsPage] = useState<number>(0);
  const [contactsPage, setContactsPage] = useState<number>(0);

  // הקלטה קולית וחיפוש קולי
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // טעינת קונפיגורציית העיצוב מהקולקציה + מטריקות השימושים מהענן
  useEffect(() => {
    getAreaCollectionSchema('area_crm_dynamic_groups', tenantId, 'saas').then((schema) => {
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

    fetchCloudUsageMetrics(firebaseApp, tenantId).then((cloudMetrics) => {
      setUsageMetrics(cloudMetrics);
    });
  }, [tenantId, firebaseApp]);

  const updateVisualConfig = (patch: Partial<typeof visualConfig>) => {
    const next = { ...visualConfig, ...patch };
    setVisualConfig(next);
    saveAreaCollectionConfig('area_crm_dynamic_groups', tenantId, next);
  };

  // בניית כל הקבוצות הדינמיות מתוך קולקציית אנשי הקשר החיה
  const allDynamicGroups = useMemo<CrmDynamicGroup[]>(() => {
    const contacts = data?.contacts || [];
    const customFields = data?.customFields || [];
    const extraCommunities = data?.communitiesCount ? Object.keys(data.communitiesCount) : [];

    return buildDynamicCrmGroupsFromCollection({
      contacts,
      customFields,
      extraCommunities,
      usageMetrics,
      userId: currentUserId,
      rankingMode,
      categoryFilter,
      searchQuery,
    });
  }, [data?.contacts, data?.customFields, data?.communitiesCount, usageMetrics, currentUserId, rankingMode, categoryFilter, searchQuery]);

  // קטגוריות שקיימות בפועל בקולקציה (כדי לא להציג טאבים ריקים)
  const availableCategories = useMemo<Array<DynamicGroupCategory | 'all'>>(() => {
    const contacts = data?.contacts || [];
    const allUnfiltered = buildDynamicCrmGroupsFromCollection({
      contacts,
      customFields: data?.customFields || [],
      extraCommunities: data?.communitiesCount ? Object.keys(data.communitiesCount) : [],
      usageMetrics,
      userId: currentUserId,
      rankingMode,
      categoryFilter: 'all',
    });
    const set = new Set<DynamicGroupCategory>();
    allUnfiltered.forEach((g) => set.add(g.category));
    return ['all', ...Array.from(set)];
  }, [data?.contacts, data?.customFields, data?.communitiesCount, usageMetrics, currentUserId, rankingMode]);

  // הקבוצה הנבחרת (רמה 2) ואיש הקשר הנבחר (רמה 3)
  const activeGroup = useMemo<CrmDynamicGroup | null>(() => {
    if (!selectedGroupId) return null;
    return allDynamicGroups.find((g) => g.id === selectedGroupId) || null;
  }, [allDynamicGroups, selectedGroupId]);

  const activeRankedContact = useMemo<RankedContactItem | null>(() => {
    if (!selectedContactId) return null;
    if (activeGroup) {
      const found = activeGroup.contacts.find(
        (rc) => (rc.contact.id || rc.contact.conta_phone) === selectedContactId
      );
      if (found) return found;
    }
    const allContacts = data?.contacts || [];
    const raw = allContacts.find((c) => (c.id || c.conta_phone) === selectedContactId);
    if (!raw) return null;
    return {
      contact: raw,
      importanceScore: 85,
      globalUsageCount: 1,
      userUsageCount: 1,
      totalDynamicScore: 85,
      primaryBadge: raw.is_lead ? 'ליד פעיל' : 'איש קשר',
      subtitleSummary: raw.conta_phone || raw.email || '',
    };
  }, [selectedContactId, activeGroup, data?.contacts]);

  const activeContactSections = useMemo<ContactDataSectionGroup[]>(() => {
    if (!activeRankedContact) return [];
    return buildContactDynamicDataSections(
      activeRankedContact.contact,
      usageMetrics,
      currentUserId
    );
  }, [activeRankedContact, usageMetrics, currentUserId]);

  // רישום שימוש בקבוצה / איש קשר / מקטע נתונים (מעלה גם מספר שימושים כללי וגם שימושי משתמש!)
  const handleRecordUsage = async (entityId: string, importanceDelta: number = 0) => {
    const updated = await recordCrmEntityUsage(
      tenantId,
      currentUserId,
      entityId,
      firebaseApp,
      importanceDelta
    );
    setUsageMetrics({ ...updated });
  };

  const handleBoostImportance = async (entityId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await boostCrmEntityImportance(tenantId, entityId, delta, firebaseApp);
    setUsageMetrics({ ...updated });
    setVoiceFeedback('משקל החשיבות של הקבוצה עודכן ודורג מחדש בזמן אמת!');
    setTimeout(() => setVoiceFeedback(null), 2800);
  };

  // פקודות קוליות וניתוב חכם בקפסולת ה-AI
  const handleVoiceOrAiCommand = (rawText: string) => {
    const clean = rawText.trim();
    if (!clean) return;
    const norm = clean.toLowerCase();

    if (norm.includes('שימושים שלי') || norm.includes('אישי') || norm.includes('הכי משתמש')) {
      setRankingMode('user_usage');
      setGroupsPage(0);
      setContactsPage(0);
      setVoiceFeedback('התצוגה סודרה דינמית לפי מספר השימושים האישיים שלך!');
      setTimeout(() => setVoiceFeedback(null), 3500);
      return;
    }
    if (norm.includes('מספר שימושים') || norm.includes('שימושים כללי') || norm.includes('פופולר')) {
      setRankingMode('global_usage');
      setGroupsPage(0);
      setContactsPage(0);
      setVoiceFeedback('התצוגה סודרה דינמית לפי מספר השימושים הכללי במערכת!');
      setTimeout(() => setVoiceFeedback(null), 3500);
      return;
    }
    if (norm.includes('חשיבות') || norm.includes('חשוב') || norm.includes('vip')) {
      setRankingMode('importance');
      setGroupsPage(0);
      setContactsPage(0);
      setVoiceFeedback('התצוגה סודרה דינמית לפי ציון חשיבות עסקית!');
      setTimeout(() => setVoiceFeedback(null), 3500);
      return;
    }
    if (norm.includes('משוקלל') || norm.includes('איפוס')) {
      setRankingMode('combined');
      setCategoryFilter('all');
      setSearchQuery('');
      setSelectedGroupId(null);
      setSelectedContactId(null);
      setGroupsPage(0);
      setVoiceFeedback('הדירוג הדינמי המשוקלל (חשיבות + שימושים + משתמש) הופעל!');
      setTimeout(() => setVoiceFeedback(null), 3500);
      return;
    }
    if (norm.includes('מצב יום') || norm.includes('בהיר')) {
      updateVisualConfig({ colorMode: 'day' });
      return;
    }
    if (norm.includes('מצב לילה') || norm.includes('כהה')) {
      updateVisualConfig({ colorMode: 'night' });
      return;
    }
    if (norm.includes('זרקור')) {
      updateVisualConfig({ layoutBudget: 'spotlight_stage' });
      return;
    }
    if (norm.includes('בנטו')) {
      updateVisualConfig({ layoutBudget: 'bento_asymmetric' });
      return;
    }
    if (norm.includes('זכוכית')) {
      updateVisualConfig({ layoutBudget: 'glass_flip_overlay' });
      return;
    }
    if (norm.includes('חפיס') || norm.includes('3d')) {
      updateVisualConfig({ layoutBudget: 'swipe_action_deck' });
      return;
    }
    if (norm.includes('אקורדיון')) {
      updateVisualConfig({ layoutBudget: 'accordion_morph' });
      return;
    }

    // חיפוש קבוצה או איש קשר לפי הטקסט שנאמר
    setSearchQuery(clean);
    setSelectedGroupId(null);
    setSelectedContactId(null);
    setGroupsPage(0);
    setVoiceFeedback(`מסנן קבוצות ואנשי קשר עבור: "${clean}"`);
    setTimeout(() => setVoiceFeedback(null), 4000);
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
        if (transcript) {
          handleVoiceOrAiCommand(transcript);
        }
      };
      recog.onend = () => setIsRecording(false);
      recog.onerror = () => setIsRecording(false);
      recognitionRef.current = recog;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setVoiceFeedback('מקשיב... אמור למשל: "לפי השימושים שלי", "לפי חשיבות", או שם קבוצה/איש קשר');
      try {
        recognitionRef.current?.start();
      } catch {
        setIsRecording(false);
      }
    }
  };

  // עיצוב פעיל מתוך קולקציית KOSUN_STYLE_PRESETS
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[visualConfig.atmosphereTheme] || KOSUN_STYLE_PRESETS.cyber_neon;
  const isDay = visualConfig.colorMode === 'day';
  const modeColors = isDay ? styleDef.day : styleDef.night;
  const brandPrimary = modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleDef.geometry.cardRadius;
  const discoveryMode = resolveDiscoveryLayoutMode(
    visualConfig.layoutBudget,
    styleDef.discovery.mode
  );

  const tenantTheme: TenantThemeColors = useMemo(
    () => ({
      primary: brandPrimary,
      secondary: '#0072FF',
      accent: brandPrimary,
      capsuleBg: isDay ? 'rgba(255, 255, 255, 0.96)' : '#090d16',
      capsuleBorder: brandPrimary,
      micColor: brandPrimary,
      micGlow: modeColors.glowColor || `${brandPrimary}40`,
      pageBg: modeColors.pageBg,
      titleColor: modeColors.textColor,
      textColor: modeColors.textColor,
      colorMode: isDay ? 'day' : 'night',
      secondaryText: modeColors.secondaryText,
      cardBg: modeColors.cardBg,
      borderColor: modeColors.borderColor,
      stylePresetId: visualConfig.atmosphereTheme,
    }),
    [brandPrimary, isDay, modeColors, visualConfig.atmosphereTheme]
  );

  const tenantProfile: TenantProfile = useMemo(
    () => ({
      id: tenantId,
      name: 'KOSCRM Dynamic Assets',
      tagline: 'קבוצות דינמיות לפי חשיבות, שימושים כלליים ושימושי המשתמש',
      category: 'saas',
      archetypeId: 'saas',
      phone: '',
      whatsapp: '',
      address: '',
      wazeUrl: '',
      openingHours: '',
      agentName: 'סוכן CRM קוגניטיבי',
      agentAvatarUrl: '',
      logoUrl: '',
    }),
    [tenantId]
  );

  // =========================================================================
  // הכנת 4 הכרטיסים הפעילים למסך הנוכחי (חוק הבבושקה: עד 4 כרטיסים במסך!)
  // =========================================================================
  const totalGroupsPages = Math.max(1, Math.ceil(allDynamicGroups.length / 4));
  const safeGroupsPage = Math.min(groupsPage, totalGroupsPages - 1);
  const currentFourGroups = allDynamicGroups.slice(safeGroupsPage * 4, safeGroupsPage * 4 + 4);

  const totalContactsInGroup = activeGroup?.contacts.length || 0;
  const totalContactsPages = Math.max(1, Math.ceil(totalContactsInGroup / 4));
  const safeContactsPage = Math.min(contactsPage, totalContactsPages - 1);
  const currentFourContacts = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup.contacts.slice(safeContactsPage * 4, safeContactsPage * 4 + 4);
  }, [activeGroup, safeContactsPage]);

  // המרת הרמה הנוכחית (קבוצות / אנשי קשר בקבוצה / 4 קבוצות הנתונים של איש הקשר) ל-4 כרטיסים אחידים
  const activeVisualCards: VisualCardAdapter[] = useMemo(() => {
    // רמה 3: תצוגת 4 קבוצות הנתונים הדינמיות של איש קשר בודד
    if (activeRankedContact && activeContactSections.length > 0) {
      const c = activeRankedContact.contact;
      return activeContactSections.slice(0, 4).map((sec, idx) => {
        const itemsPreview = sec.items
          .map((it) => `${it.label}: ${it.value}`)
          .join(' • ');

        return {
          id: sec.id,
          indexBadge: `0${idx + 1}`,
          title: sec.title,
          subtitle: itemsPreview,
          badge: sec.badge,
          metricsLine: `חשיבות ${sec.importanceScore}% • ${sec.globalUsageCount} שימושים • ${sec.userUsageCount} שלך`,
          importanceScore: sec.importanceScore,
          globalUsageCount: sec.globalUsageCount,
          userUsageCount: sec.userUsageCount,
          icon: sec.icon,
          bgImage:
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          ctaText: 'ערוך בתיק 360 ◀',
          secondaryCtaText: c.conta_phone ? 'שלח WhatsApp' : undefined,
          onPrimaryAction: () => {
            handleRecordUsage(sec.id, 1);
            onOpenContact360(c);
          },
          onSecondaryAction: c.conta_phone
            ? (e: React.MouseEvent) => {
                e.stopPropagation();
                handleRecordUsage(sec.id, 1);
                const cleanPhone = (c.conta_phone || '').replace(/\D/g, '');
                const intlPhone = cleanPhone.startsWith('0')
                  ? `972${cleanPhone.slice(1)}`
                  : cleanPhone;
                window.open(`https://wa.me/${intlPhone}`, '_blank');
              }
            : undefined,
          onBoostImportance: (e: React.MouseEvent) => handleBoostImportance(sec.id, 5, e),
        };
      });
    }

    // רמה 2: תצוגת 4 אנשי קשר מתוך הקבוצה הדינמית שנבחרה
    if (activeGroup) {
      return currentFourContacts.map((rc, idx) => {
        const c = rc.contact;
        const cid = `contact_${c.id || c.conta_phone || idx}`;
        const contactName = c.kosun_crm_name || c.conta_name || 'איש קשר';

        return {
          id: cid,
          indexBadge: `0${safeContactsPage * 4 + idx + 1}`,
          title: contactName,
          subtitle: rc.subtitleSummary,
          badge: rc.primaryBadge,
          metricsLine: `חשיבות ${rc.importanceScore}% • ${rc.globalUsageCount} שימושים • ${rc.userUsageCount} שלך`,
          importanceScore: rc.importanceScore,
          globalUsageCount: rc.globalUsageCount,
          userUsageCount: rc.userUsageCount,
          icon: c.is_lead ? 'Flame' : c.isSubdomainAdmin ? 'Globe' : 'UserCheck',
          bgImage: activeGroup.bgImage,
          ctaText: 'פתח 4 קבוצות נתונים ◀',
          secondaryCtaText: 'תיק 360 מלא',
          onPrimaryAction: () => {
            handleRecordUsage(cid, 1);
            setSelectedContactId(c.id || c.conta_phone || contactName);
            setActiveCardIndex(0);
          },
          onSecondaryAction: (e: React.MouseEvent) => {
            e.stopPropagation();
            handleRecordUsage(cid, 1);
            onOpenContact360(c);
          },
          onBoostImportance: (e: React.MouseEvent) => handleBoostImportance(cid, 6, e),
        };
      });
    }

    // רמה 1 (ברירת מחדל): 4 הקבוצות הדינמיות המובילות מתוך קולקציית אנשי הקשר
    return currentFourGroups.map((grp, idx) => ({
      id: grp.id,
      indexBadge: `0${safeGroupsPage * 4 + idx + 1}`,
      title: grp.title,
      subtitle: grp.subtitle,
      badge: grp.categoryLabel,
      metricsLine: `חשיבות ${grp.importanceScore}% • ${grp.globalUsageCount} שימושים • ${grp.userUsageCount} שלך`,
      importanceScore: grp.importanceScore,
      globalUsageCount: grp.globalUsageCount,
      userUsageCount: grp.userUsageCount,
      icon: grp.icon,
      bgImage: grp.bgImage,
      ctaText: grp.ctaText,
      secondaryCtaText: 'העלה חשיבות ★',
      onPrimaryAction: () => {
        handleRecordUsage(grp.id, 1);
        setSelectedGroupId(grp.id);
        setContactsPage(0);
        setActiveCardIndex(0);
      },
      onSecondaryAction: (e: React.MouseEvent) => handleBoostImportance(grp.id, 5, e),
      onBoostImportance: (e: React.MouseEvent) => handleBoostImportance(grp.id, 5, e),
    }));
  }, [
    activeRankedContact,
    activeContactSections,
    activeGroup,
    currentFourContacts,
    currentFourGroups,
    safeContactsPage,
    safeGroupsPage,
  ]);

  // טקסט דינמי לקפסולת ה-AI העליונה המשקף את הקבוצה/איש הקשר המוביל
  const capsuleQuestionNode = useMemo(() => {
    if (activeRankedContact) {
      const name =
        activeRankedContact.contact.kosun_crm_name ||
        activeRankedContact.contact.conta_name ||
        'איש קשר';
      return {
        id: 'crm_capsule_contact',
        questionText: `${name} • חשיבות ${activeRankedContact.importanceScore}% • ${activeRankedContact.userUsageCount} שימושים שלך`,
      } as any;
    }
    if (activeGroup) {
      return {
        id: 'crm_capsule_group',
        questionText: `${activeGroup.title}: ${activeGroup.contactsCount} אנשי קשר (חשיבות ${activeGroup.importanceScore}% • ${activeGroup.userUsageCount} שימושים שלך)`,
      } as any;
    }
    const topGroup = allDynamicGroups[0];
    if (topGroup) {
      return {
        id: 'crm_capsule_root',
        questionText: `מוביל כעת: ${topGroup.title} (${topGroup.contactsCount} אנשי קשר • חשיבות ${topGroup.importanceScore}% • ${topGroup.globalUsageCount} שימושים)`,
      } as any;
    }
    return {
      id: 'crm_capsule_empty',
      questionText: 'אמור שם קבוצה, תגית או פקודת דירוג ("לפי חשיבות" / "השימושים שלי")',
    } as any;
  }, [activeRankedContact, activeGroup, allDynamicGroups]);

  // =========================================================================
  // רנדור 4 הכרטיסים לפי 5 מנגנוני הגילוי מהקולקציה (Zero Hardcoded Layout)
  // =========================================================================
  const renderDynamicStage = () => {
    if (loading && activeVisualCards.length === 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-12">
          <Icons.Loader2 size={32} className="animate-spin" style={{ color: brandPrimary }} />
          <span className="text-xs font-bold" style={{ color: modeColors.secondaryText }}>
            שואב ומקבץ דינמית את נתוני אנשי הקשר מהקולקציה...
          </span>
        </div>
      );
    }

    if (activeVisualCards.length === 0) {
      return (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 border rounded-3xl text-center"
          style={{
            background: modeColors.cardBg,
            borderColor: modeColors.borderColor,
          }}
        >
          <Icons.Users size={36} style={{ color: brandPrimary }} />
          <h3 className="text-sm font-black" style={{ color: modeColors.textColor }}>
            לא נמצאו קבוצות תואמות לסינון הנוכחי
          </h3>
          <p className="text-xs max-w-md" style={{ color: modeColors.secondaryText }}>
            נסה לאפס את הסינון או להוסיף אנשי קשר חדשים לקולקציה.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setSearchQuery('');
                setSelectedGroupId(null);
                setSelectedContactId(null);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-black text-black shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              הצג את כל הקבוצות
            </button>
            <button
              type="button"
              onClick={onOpenNewContact}
              className="px-4 py-1.5 rounded-xl text-xs font-bold border"
              style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
            >
              + איש קשר חדש
            </button>
          </div>
        </div>
      );
    }

    // תגיות 3 מדדי הדירוג הדינמי (חשיבות, שימושים כלליים, שימושי המשתמש)
    const renderThreeMetricsPills = (card: VisualCardAdapter) => (
      <div className="flex flex-wrap items-center gap-1 text-[9px] font-bold">
        <span
          className="px-1.5 py-0.5 rounded-md flex items-center gap-1 border"
          style={{
            backgroundColor: `${brandPrimary}18`,
            borderColor: `${brandPrimary}45`,
            color: brandPrimary,
          }}
          title="ציון חשיבות עסקית מחושב מהקולקציה"
        >
          <Icons.Crown size={10} />
          <span>חשיבות {card.importanceScore}%</span>
        </span>

        <span
          className="px-1.5 py-0.5 rounded-md flex items-center gap-1 border"
          style={{
            backgroundColor: isDay ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)',
            borderColor: modeColors.borderColor,
            color: modeColors.textColor,
          }}
          title="מספר שימושים כללי במערכת ובאינטראקציות"
        >
          <Icons.Activity size={10} />
          <span>{card.globalUsageCount} שימושים</span>
        </span>

        <span
          className="px-1.5 py-0.5 rounded-md flex items-center gap-1 border"
          style={{
            backgroundColor:
              card.userUsageCount > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
            borderColor:
              card.userUsageCount > 0 ? 'rgba(245, 158, 11, 0.5)' : modeColors.borderColor,
            color: card.userUsageCount > 0 ? '#F59E0B' : modeColors.secondaryText,
          }}
          title="מספר השימושים האישיים שלך בקבוצה/רשומה זו"
        >
          <Icons.UserCheck size={10} />
          <span>{card.userUsageCount} שימושים שלך</span>
        </span>

        {card.onBoostImportance && (
          <button
            type="button"
            onClick={card.onBoostImportance}
            title="העלה עדיפות וחשיבות (+)"
            className="px-1.5 py-0.5 rounded-md border hover:scale-105 active:scale-95 transition-transform flex items-center gap-0.5"
            style={{
              borderColor: `${brandPrimary}50`,
              color: brandPrimary,
            }}
          >
            <Icons.Star size={9} />
            <span>+חשיבות</span>
          </button>
        )}
      </div>
    );

    // -----------------------------------------------------------------------
    // פריסה 1: ACCORDION MORPH (4 רצועות מתרחבות חכמות)
    // -----------------------------------------------------------------------
    if (discoveryMode === 'accordion_morph') {
      return (
        <div className={`w-full h-full flex flex-col justify-between gap-2 py-0.5 ${styleDef.fontFamily}`}>
          {activeVisualCards.map((card, idx) => {
            const isExpanded = activeCardIndex === idx;
            const IconComp = (Icons as any)[card.icon] || Icons.Users;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (isExpanded) {
                    card.onPrimaryAction();
                  } else {
                    setActiveCardIndex(idx);
                  }
                }}
                className={`relative w-full overflow-hidden border transition-all duration-300 cursor-pointer group flex flex-col justify-between p-3 ${
                  isExpanded
                    ? 'flex-[2.3] shadow-2xl'
                    : 'flex-1 opacity-90 hover:opacity-100'
                }`}
                style={{
                  borderRadius: cardRadius,
                  borderColor: isExpanded ? brandPrimary : modeColors.borderColor,
                  boxShadow: isExpanded ? `0 8px 26px -6px ${modeColors.glowColor}` : 'none',
                  background: modeColors.cardBg,
                }}
              >
                <img
                  src={card.bgImage}
                  alt={card.title}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ${
                    isExpanded ? 'scale-105 opacity-25' : 'opacity-15 group-hover:scale-105'
                  }`}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDay
                      ? 'linear-gradient(to left, rgba(255,255,255,0.96), rgba(240,249,255,0.85))'
                      : 'linear-gradient(to left, rgba(4,7,17,0.95), rgba(15,23,42,0.82))',
                  }}
                />

                {/* שורה עליונה */}
                <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all"
                      style={{
                        backgroundColor: isExpanded ? brandPrimary : `${brandPrimary}20`,
                        borderColor: brandPrimary,
                        color: isExpanded ? '#000000' : brandPrimary,
                      }}
                    >
                      <IconComp size={15} />
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                          style={{
                            backgroundColor: `${brandPrimary}20`,
                            color: brandPrimary,
                          }}
                        >
                          #{card.indexBadge}
                        </span>
                        <h2
                          className="text-xs sm:text-sm font-black truncate"
                          style={{ color: modeColors.textColor }}
                        >
                          {card.title}
                        </h2>
                      </div>
                      {!isExpanded && (
                        <p
                          className="text-[10px] truncate mt-0.5"
                          style={{ color: modeColors.secondaryText }}
                        >
                          {card.metricsLine}
                        </p>
                      )}
                    </div>
                  </div>

                  {renderThreeMetricsPills(card)}
                </div>

                {/* תוכן מורחב */}
                {isExpanded && (
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-2 mt-1 border-t border-white/10 animate-fadeIn">
                    <div className="flex-1 text-right">
                      <span
                        className="text-[10px] font-bold block mb-0.5"
                        style={{ color: brandPrimary }}
                      >
                        {card.badge}
                      </span>
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: modeColors.secondaryText }}
                      >
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {card.secondaryCtaText && card.onSecondaryAction && (
                        <button
                          type="button"
                          onClick={card.onSecondaryAction}
                          className="px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all hover:bg-white/10"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        >
                          {card.secondaryCtaText}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          card.onPrimaryAction();
                        }}
                        className="px-4 py-1.5 rounded-xl text-black font-black text-xs shadow-lg active:scale-95 transition-all"
                        style={{ backgroundColor: brandPrimary }}
                      >
                        {card.ctaText}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // פריסה 2: SPOTLIGHT STAGE (במת זרקור: 1 ראשי + 4 קפסולות בחירה)
    // -----------------------------------------------------------------------
    if (discoveryMode === 'spotlight_stage') {
      const spotlight = activeVisualCards[activeCardIndex] || activeVisualCards[0];
      const SpotlightIcon = (Icons as any)[spotlight.icon] || Icons.Users;

      return (
        <div className={`w-full h-full flex flex-col justify-between gap-2.5 py-0.5 ${styleDef.fontFamily}`}>
          <div
            onClick={spotlight.onPrimaryAction}
            className="relative w-full flex-[1.6] overflow-hidden border-2 cursor-pointer group flex flex-col justify-between p-4 shadow-2xl transition-all duration-300"
            style={{
              borderRadius: cardRadius,
              borderColor: brandPrimary,
              boxShadow: `0 10px 30px -8px ${modeColors.glowColor}`,
              background: modeColors.cardBg,
            }}
          >
            <img
              src={spotlight.bgImage}
              alt={spotlight.title}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-25 group-hover:scale-105 transition-transform duration-700"
            />
            <div
              className="absolute inset-0"
              style={{
                background: isDay
                  ? 'linear-gradient(to top, rgba(255,255,255,0.96) 15%, rgba(254,252,232,0.82) 100%)'
                  : 'linear-gradient(to top, rgba(12,10,9,0.96) 15%, rgba(15,23,42,0.82) 100%)',
              }}
            />

            <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur-md flex items-center gap-1.5"
                style={{
                  backgroundColor: isDay ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)',
                  borderColor: brandPrimary,
                  color: brandPrimary,
                }}
              >
                <SpotlightIcon size={13} />
                <span>זרקור CRM • {spotlight.badge}</span>
              </span>

              {renderThreeMetricsPills(spotlight)}
            </div>

            <div className="relative z-10 my-auto py-2 text-right">
              <h2
                className="text-base sm:text-lg font-black leading-tight"
                style={{ color: modeColors.textColor }}
              >
                {spotlight.title}
              </h2>
              <p
                className="text-xs mt-1.5 line-clamp-2 leading-relaxed"
                style={{ color: modeColors.secondaryText }}
              >
                {spotlight.subtitle}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono" style={{ color: modeColors.secondaryText }}>
                מדורג #{spotlight.indexBadge} לפי {RANKING_MODE_META[rankingMode].shortLabel}
              </span>
              <div className="flex items-center gap-2">
                {spotlight.secondaryCtaText && spotlight.onSecondaryAction && (
                  <button
                    type="button"
                    onClick={spotlight.onSecondaryAction}
                    className="px-3 py-1.5 rounded-xl border text-[10px] font-bold"
                    style={{
                      borderColor: modeColors.borderColor,
                      color: modeColors.textColor,
                    }}
                  >
                    {spotlight.secondaryCtaText}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    spotlight.onPrimaryAction();
                  }}
                  className="px-4 py-2 rounded-xl text-black font-black text-xs shadow-lg"
                  style={{ backgroundColor: brandPrimary }}
                >
                  {spotlight.ctaText}
                </button>
              </div>
            </div>
          </div>

          {/* 4 קפסולות תחתונות */}
          <div className="w-full flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activeVisualCards.map((card, idx) => {
              const isCurr = idx === activeCardIndex;
              const ItemIcon = (Icons as any)[card.icon] || Icons.Users;
              return (
                <div
                  key={card.id}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`p-2.5 border cursor-pointer transition-all flex flex-col justify-between ${
                    isCurr ? 'scale-[1.02] shadow-lg' : 'opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    borderRadius: cardRadius,
                    background: modeColors.cardBg,
                    borderColor: isCurr ? brandPrimary : modeColors.borderColor,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: isCurr ? brandPrimary : `${brandPrimary}20`,
                        color: isCurr ? '#000' : brandPrimary,
                      }}
                    >
                      <ItemIcon size={12} />
                    </div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: brandPrimary }}>
                      חשיבות {card.importanceScore}%
                    </span>
                  </div>

                  <span
                    className="text-xs font-black line-clamp-2 text-right my-1"
                    style={{ color: modeColors.textColor }}
                  >
                    {card.title}
                  </span>

                  <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/10">
                    <span style={{ color: modeColors.secondaryText }}>
                      {card.globalUsageCount} שימושים
                    </span>
                    <span className="font-bold" style={{ color: '#F59E0B' }}>
                      {card.userUsageCount} שלך
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // פריסה 3: GLASS FLIP OVERLAY (רשת 2x2 עם וילון זכוכית צף)
    // -----------------------------------------------------------------------
    if (discoveryMode === 'glass_flip_overlay') {
      return (
        <div className={`w-full h-full grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-2.5 py-0.5 ${styleDef.fontFamily}`}>
          {activeVisualCards.map((card) => {
            const isFlipped = flippedCardId === card.id;
            const IconComp = (Icons as any)[card.icon] || Icons.Users;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (isFlipped) {
                    card.onPrimaryAction();
                  } else {
                    setFlippedCardId(card.id);
                  }
                }}
                className="relative w-full min-h-[150px] overflow-hidden border cursor-pointer group flex flex-col justify-between p-3.5 shadow-lg transition-all duration-300"
                style={{
                  borderRadius: cardRadius,
                  borderColor: isFlipped ? brandPrimary : modeColors.borderColor,
                  background: modeColors.cardBg,
                }}
              >
                <img
                  src={card.bgImage}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-20 group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDay
                      ? 'linear-gradient(to top, rgba(255,255,255,0.95) 25%, rgba(241,245,249,0.7) 100%)'
                      : 'linear-gradient(to top, rgba(11,17,32,0.95) 25%, rgba(15,23,42,0.65) 100%)',
                  }}
                />

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span
                    className="px-2 py-0.5 rounded-lg text-[9.5px] font-bold border"
                    style={{
                      backgroundColor: `${brandPrimary}20`,
                      borderColor: `${brandPrimary}50`,
                      color: brandPrimary,
                    }}
                  >
                    #{card.indexBadge} • {card.badge}
                  </span>
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${brandPrimary}25`, color: brandPrimary }}
                  >
                    <IconComp size={14} />
                  </div>
                </div>

                <div className="relative z-10 text-right my-auto py-1">
                  <h3
                    className="text-sm font-black leading-snug line-clamp-2"
                    style={{ color: modeColors.textColor }}
                  >
                    {card.title}
                  </h3>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-1">
                  {renderThreeMetricsPills(card)}
                </div>

                {isFlipped && (
                  <div
                    className="absolute inset-0 z-20 p-3.5 flex flex-col justify-between backdrop-blur-xl animate-fadeIn"
                    style={{
                      backgroundColor: isDay ? 'rgba(255,255,255,0.96)' : 'rgba(11,17,32,0.96)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black" style={{ color: brandPrimary }}>
                        {card.title}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlippedCardId(null);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10"
                        style={{ color: modeColors.secondaryText }}
                      >
                        <Icons.X size={14} />
                      </button>
                    </div>

                    <p
                      className="text-xs leading-relaxed line-clamp-3 my-auto text-right"
                      style={{ color: modeColors.textColor }}
                    >
                      {card.subtitle}
                    </p>

                    <div className="flex items-center gap-2">
                      {card.secondaryCtaText && card.onSecondaryAction && (
                        <button
                          type="button"
                          onClick={card.onSecondaryAction}
                          className="px-3 py-1.5 rounded-xl border text-[10px] font-bold"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        >
                          {card.secondaryCtaText}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          card.onPrimaryAction();
                        }}
                        className="flex-1 py-1.5 rounded-xl text-black font-black text-xs shadow-md"
                        style={{ backgroundColor: brandPrimary }}
                      >
                        {card.ctaText}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // פריסה 4: BENTO ASYMMETRIC (פסיפס בנטו אסימטרי מונחה-משקל: 1 + 2 + 1)
    // -----------------------------------------------------------------------
    if (discoveryMode === 'bento_asymmetric') {
      const hero = activeVisualCards[0];
      const mids = activeVisualCards.slice(1, 3);
      const bottom = activeVisualCards[3];
      const HeroIcon = (Icons as any)[hero.icon] || Icons.Crown;

      return (
        <div className={`w-full h-full flex flex-col justify-between gap-2.5 py-0.5 ${styleDef.fontFamily}`}>
          {/* קומה 1: כרטיס גיבור בנטו (הקבוצה החשובה/המשומשת ביותר) */}
          <div
            onClick={hero.onPrimaryAction}
            className="relative w-full p-4 border-2 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden shadow-xl"
            style={{
              borderRadius: cardRadius,
              background: modeColors.cardBg,
              borderColor: brandPrimary,
            }}
          >
            <div className="flex-1 flex flex-col justify-between z-10 text-right gap-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black"
                  style={{ backgroundColor: `${brandPrimary}25`, color: brandPrimary }}
                >
                  #{hero.indexBadge} • מוקד בנטו ראשי • {hero.badge}
                </span>
                {renderThreeMetricsPills(hero)}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black" style={{ color: modeColors.textColor }}>
                  {hero.title}
                </h2>
                <p className="text-xs line-clamp-2 mt-0.5" style={{ color: modeColors.secondaryText }}>
                  {hero.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className="px-3.5 py-1 rounded-xl text-black text-xs font-black inline-flex items-center gap-1 shadow"
                  style={{ backgroundColor: brandPrimary }}
                >
                  {hero.ctaText}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex w-24 h-24 rounded-2xl overflow-hidden relative shrink-0 border border-white/10 items-center justify-center">
              <img
                src={hero.bgImage}
                alt={hero.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <HeroIcon size={24} style={{ color: brandPrimary }} />
              </div>
            </div>
          </div>

          {/* קומה 2: זוג קוביות בנטו */}
          {mids.length > 0 && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {mids.map((card) => {
                const MidIcon = (Icons as any)[card.icon] || Icons.Users;
                return (
                  <div
                    key={card.id}
                    onClick={card.onPrimaryAction}
                    className="p-3 border cursor-pointer group flex flex-col justify-between gap-2 relative overflow-hidden shadow-md hover:scale-[1.01] transition-all"
                    style={{
                      borderRadius: cardRadius,
                      background: modeColors.cardBg,
                      borderColor: modeColors.borderColor,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                      >
                        <MidIcon size={14} />
                      </div>
                      {renderThreeMetricsPills(card)}
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs sm:text-sm font-black" style={{ color: modeColors.textColor }}>
                        {card.title}
                      </h3>
                      <p className="text-[11px] line-clamp-2 mt-0.5" style={{ color: modeColors.secondaryText }}>
                        {card.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10">
                      <span className="font-bold" style={{ color: brandPrimary }}>
                        {card.ctaText}
                      </span>
                      <Icons.ArrowLeft size={12} style={{ color: brandPrimary }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* קומה 3: רצועת בנטו תחתונה */}
          {bottom && (
            <div
              onClick={bottom.onPrimaryAction}
              className="w-full px-3.5 py-2.5 border cursor-pointer group flex items-center justify-between gap-3 shadow-md"
              style={{
                borderRadius: cardRadius,
                background: modeColors.cardBg,
                borderColor: modeColors.borderColor,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: brandPrimary, color: '#000000' }}
                >
                  <Icons.Layers size={15} />
                </div>
                <div className="min-w-0 text-right">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black truncate" style={{ color: modeColors.textColor }}>
                      {bottom.title}
                    </h4>
                    <span className="text-[9px] font-bold" style={{ color: brandPrimary }}>
                      חשיבות {bottom.importanceScore}% • {bottom.userUsageCount} שלך
                    </span>
                  </div>
                  <p className="text-[10.5px] truncate" style={{ color: modeColors.secondaryText }}>
                    {bottom.subtitle}
                  </p>
                </div>
              </div>

              <span
                className="px-3 py-1.5 rounded-xl text-[10px] font-black text-black shrink-0"
                style={{ backgroundColor: brandPrimary }}
              >
                {bottom.ctaText}
              </span>
            </div>
          )}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // פריסה 5: SWIPE ACTION DECK (חפיסת כרטיסים תלת-ממדית אינטראקטיבית)
    // -----------------------------------------------------------------------
    const deckCard = activeVisualCards[activeCardIndex] || activeVisualCards[0];
    const DeckIcon = (Icons as any)[deckCard.icon] || Icons.Users;

    return (
      <div className={`w-full h-full flex flex-col justify-between gap-2.5 py-0.5 ${styleDef.fontFamily}`}>
        <div className="relative w-full flex-1 flex items-center justify-center min-h-[220px]">
          <div
            onClick={deckCard.onPrimaryAction}
            className="relative w-full h-full overflow-hidden border-2 cursor-pointer group flex flex-col justify-between p-4 shadow-2xl transition-all duration-300"
            style={{
              borderRadius: cardRadius,
              background: modeColors.cardBg,
              borderColor: brandPrimary,
              boxShadow: `0 12px 32px -8px ${modeColors.glowColor}`,
            }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap z-10">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-black"
                style={{ backgroundColor: brandPrimary }}
              >
                כרטיס {activeCardIndex + 1} מתוך {activeVisualCards.length} • {deckCard.badge}
              </span>
              {renderThreeMetricsPills(deckCard)}
            </div>

            <div className="relative z-10 my-auto py-3 text-right">
              <h2 className="text-base sm:text-lg font-black" style={{ color: modeColors.textColor }}>
                {deckCard.title}
              </h2>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: modeColors.secondaryText }}>
                {deckCard.subtitle}
              </p>
            </div>

            <div
              className="absolute bottom-2 left-2 opacity-10 pointer-events-none"
              style={{ color: brandPrimary }}
            >
              <DeckIcon size={88} />
            </div>

            <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCardIndex((prev) => (prev + 1) % activeVisualCards.length);
                }}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5"
                style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
              >
                <Icons.RefreshCw size={13} style={{ color: brandPrimary }} />
                <span>הבא בחפיסה</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deckCard.onPrimaryAction();
                }}
                className="px-4 py-1.5 rounded-xl text-black font-black text-xs shadow-lg"
                style={{ backgroundColor: brandPrimary }}
              >
                {deckCard.ctaText}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {activeVisualCards.map((card, idx) => {
            const isCurr = idx === activeCardIndex;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveCardIndex(idx)}
                className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-between gap-1 truncate ${
                  isCurr ? 'text-black font-black shadow-md' : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isCurr ? brandPrimary : 'transparent',
                  borderColor: isCurr ? brandPrimary : modeColors.borderColor,
                  color: isCurr ? '#000000' : modeColors.textColor,
                }}
              >
                <span className="truncate">{card.title}</span>
                <span className="font-mono text-[9px] shrink-0">{card.importanceScore}%</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 sm:p-4 max-w-6xl mx-auto select-none transition-colors duration-300 rounded-3xl"
      dir="rtl"
      style={{
        backgroundColor: tenantTheme.pageBg,
        color: tenantTheme.textColor,
      }}
    >
      {/* =====================================================================
          1. סרגל עליון נקי: ניווט פירורי לחם (בבושקה) + כלי עיצוב מקולקציה + ייבוא
         ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 z-20">
        <div className="flex items-center gap-2">
          {(selectedGroupId || selectedContactId) && (
            <button
              type="button"
              onClick={() => {
                if (selectedContactId) {
                  setSelectedContactId(null);
                  setActiveCardIndex(0);
                } else {
                  setSelectedGroupId(null);
                  setActiveCardIndex(0);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 transition-all active:scale-95"
              style={{
                borderColor: brandPrimary,
                backgroundColor: `${brandPrimary}20`,
                color: brandPrimary,
              }}
            >
              <Icons.ArrowRight size={14} />
              <span>חזרה</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded-md text-[9px] font-black text-black"
                style={{ backgroundColor: brandPrimary }}
              >
                KOSCRM 2026
              </span>
              <h1 className="text-sm sm:text-base font-black tracking-tight" style={{ color: modeColors.textColor }}>
                {activeRankedContact
                  ? `תיק דינמי: ${activeRankedContact.contact.kosun_crm_name || activeRankedContact.contact.conta_name}`
                  : activeGroup
                  ? activeGroup.title
                  : 'קבוצות אנשי קשר דינמיות (לפי חשיבות ושימושים)'}
              </h1>
            </div>
            <p className="text-[10px]" style={{ color: modeColors.secondaryText }}>
              {activeRankedContact
                ? '4 קבוצות נתונים מדורגות לפי חשיבות, שימושים כלליים ושימושי המשתמש'
                : activeGroup
                ? `${activeGroup.contactsCount} אנשי קשר בקבוצה • מדורגים דינמית בשיטת 4 כרטיסים`
                : `סה״כ ${data?.totalContacts || 0} אנשי קשר חולקו אוטומטית ל-${allDynamicGroups.length} קבוצות דינמיות`}
            </p>
          </div>
        </div>

        {/* כפתורי פעולה מהירים, חיפוש, עיצוב מהקולקציה ומעבר לטבלה/ייבוא */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className="p-1.5 rounded-xl border transition-all"
            style={{
              borderColor: isSearchOpen || searchQuery ? brandPrimary : modeColors.borderColor,
              color: isSearchOpen || searchQuery ? brandPrimary : modeColors.textColor,
            }}
            title="חיפוש מהיר בקולקציה"
          >
            <Icons.Search size={14} />
          </button>

          <button
            type="button"
            onClick={onOpenNewContact}
            className="px-2.5 py-1.5 rounded-xl text-[10px] font-black text-black flex items-center gap-1 shadow-sm"
            style={{ backgroundColor: brandPrimary }}
          >
            <Icons.UserPlus size={12} />
            <span>+ איש קשר</span>
          </button>

          <button
            type="button"
            onClick={onOpenIngestionTools}
            className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1"
            style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
            title="ייבוא אקסל, גוגל שיטס, סריקת כרטיס ביקור וסנכרון קשר"
          >
            <Icons.Database size={12} style={{ color: brandPrimary }} />
            <span className="hidden sm:inline">ייבוא וסנכרון</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToLegacyAnalytics}
            className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1"
            style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
            title="גרפים ודוחות BI"
          >
            <Icons.BarChart3 size={12} style={{ color: brandPrimary }} />
            <span className="hidden md:inline">דוחות BI</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToLegacyTable}
            className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1"
            style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
            title="תצוגת טבלה מלאה"
          >
            <Icons.Table size={12} />
            <span className="hidden md:inline">טבלה</span>
          </button>

          <button
            type="button"
            onClick={() =>
              updateVisualConfig({ colorMode: visualConfig.colorMode === 'day' ? 'night' : 'day' })
            }
            className="p-1.5 rounded-xl border transition-all"
            style={{ borderColor: modeColors.borderColor, color: brandPrimary }}
            title={visualConfig.colorMode === 'day' ? 'מצב לילה' : 'מצב יום'}
          >
            {visualConfig.colorMode === 'day' ? <Icons.Moon size={14} /> : <Icons.Sun size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setIsStyleSelectorOpen((prev) => !prev)}
            className="p-1.5 rounded-xl border transition-all"
            style={{
              borderColor: isStyleSelectorOpen ? brandPrimary : modeColors.borderColor,
              color: brandPrimary,
            }}
            title="בורר 5 פריסות גילוי ו-5 סגנונות מהקולקציה"
          >
            <Icons.SlidersHorizontal size={14} />
          </button>

          <button
            type="button"
            onClick={refresh}
            className="p-1.5 rounded-xl border transition-all"
            style={{ borderColor: modeColors.borderColor, color: modeColors.secondaryText }}
            title="רענן קולקציה"
          >
            <Icons.RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* תיבת חיפוש נפתחת */}
      {(isSearchOpen || searchQuery) && (
        <div className="my-1.5 flex items-center gap-2 px-3 py-1.5 rounded-2xl border animate-fadeIn"
          style={{ background: modeColors.cardBg, borderColor: brandPrimary }}
        >
          <Icons.Search size={14} style={{ color: brandPrimary }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setGroupsPage(0);
              setContactsPage(0);
            }}
            placeholder="חפש קבוצה, תגית, קהילה, עיר, שם איש קשר או טלפון..."
            className="flex-1 bg-transparent text-xs font-bold outline-none"
            style={{ color: modeColors.textColor }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{ color: modeColors.secondaryText }}
            >
              נקה ✕
            </button>
          )}
        </div>
      )}

      {/* בורר פריסות וסגנונות מהקולקציה (נפתח בלחיצה על SlidersHorizontal) */}
      {isStyleSelectorOpen && (
        <div
          className="my-1.5 p-2.5 rounded-2xl border flex flex-col gap-2 animate-fadeIn z-20"
          style={{ background: modeColors.cardBg, borderColor: brandPrimary }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black" style={{ color: brandPrimary }}>
              עיצוב ופריסה מונחי-קולקציה (5 Atmosphere Styles × 5 Discovery Layouts)
            </span>
            <button
              type="button"
              onClick={() => setIsStyleSelectorOpen(false)}
              className="text-[10px]"
              style={{ color: modeColors.secondaryText }}
            >
              סגור ✕
            </button>
          </div>

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
                  className="py-1 px-1.5 rounded-lg border text-[9.5px] font-bold truncate transition-all"
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
                { id: 'accordion_morph', label: '1. אקורדיון (4)' },
                { id: 'spotlight_stage', label: '2. במת זרקור' },
                { id: 'glass_flip_overlay', label: '3. וילון זכוכית 2x2' },
                { id: 'bento_asymmetric', label: '4. פסיפס בנטו' },
                { id: 'swipe_action_deck', label: '5. חפיסת 3D' },
              ] as Array<{ id: KosunDiscoveryLayoutMode; label: string }>
            ).map((layout) => {
              const active = discoveryMode === layout.id;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => updateVisualConfig({ layoutBudget: layout.id })}
                  className="py-1 px-1.5 rounded-lg border text-[9.5px] font-bold truncate transition-all"
                  style={{
                    backgroundColor: active ? `${brandPrimary}25` : 'transparent',
                    borderColor: active ? brandPrimary : modeColors.borderColor,
                    color: active ? brandPrimary : modeColors.secondaryText,
                  }}
                >
                  {layout.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          2. סרגל 4 עדשות הדירוג הדינמי: משוקלל | לפי חשיבות | לפי מס׳ שימושים | השימושים שלי
         ===================================================================== */}
      <div className="flex flex-col gap-1.5 my-1 z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(Object.keys(RANKING_MODE_META) as DynamicRankingMode[]).map((modeKey) => {
            const meta = RANKING_MODE_META[modeKey];
            const isActive = rankingMode === modeKey;
            const ModeIcon = (Icons as any)[meta.icon] || Icons.Sparkles;

            return (
              <button
                key={modeKey}
                type="button"
                onClick={() => {
                  setRankingMode(modeKey);
                  setGroupsPage(0);
                  setContactsPage(0);
                  setActiveCardIndex(0);
                }}
                title={meta.desc}
                className={`px-2.5 py-1.5 rounded-xl border text-[10.5px] font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isActive ? 'shadow-md scale-[1.01]' : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? brandPrimary : modeColors.cardBg,
                  borderColor: isActive ? brandPrimary : modeColors.borderColor,
                  color: isActive ? '#000000' : modeColors.textColor,
                }}
              >
                <ModeIcon size={13} />
                <span className="truncate">{meta.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* סינון ממדי קבוצות (מוצג ברמת הקבוצות הראשית) */}
        {!selectedGroupId && !selectedContactId && availableCategories.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            {availableCategories.map((cat) => {
              const meta = CATEGORY_FILTER_LABELS[cat];
              const isSelected = categoryFilter === cat;
              const CatIcon = (Icons as any)[meta.icon] || Icons.Layers;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat);
                    setGroupsPage(0);
                    setActiveCardIndex(0);
                  }}
                  className="px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all"
                  style={{
                    backgroundColor: isSelected ? `${brandPrimary}22` : 'transparent',
                    borderColor: isSelected ? brandPrimary : modeColors.borderColor,
                    color: isSelected ? brandPrimary : modeColors.secondaryText,
                  }}
                >
                  <CatIcon size={11} />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================================
          3. קפסולת ה-AI והקול העליונה (InteractiveCapsule מתוך KOSDESYN)
         ===================================================================== */}
      <InteractiveCapsule
        tenantProfile={tenantProfile}
        tenantTheme={tenantTheme}
        activeQuestionNode={capsuleQuestionNode}
        isCatalogActive={Boolean(selectedGroupId)}
        stylePresetId={visualConfig.atmosphereTheme}
        onAvatarPlayClick={() => {
          const modes: DynamicRankingMode[] = ['combined', 'importance', 'global_usage', 'user_usage'];
          const next = modes[(modes.indexOf(rankingMode) + 1) % modes.length];
          setRankingMode(next);
          setVoiceFeedback(`עדשת הדירוג הוחלפה ל: ${RANKING_MODE_META[next].label}`);
          setTimeout(() => setVoiceFeedback(null), 3000);
        }}
        onQuestionClick={() => {
          if (!selectedGroupId && allDynamicGroups[0]) {
            handleRecordUsage(allDynamicGroups[0].id, 1);
            setSelectedGroupId(allDynamicGroups[0].id);
          } else if (activeRankedContact) {
            onOpenContact360(activeRankedContact.contact);
          }
        }}
        onMicClick={toggleVoiceRecording}
      />

      {voiceFeedback && (
        <div
          className="my-1 px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-fadeIn"
          style={{
            backgroundColor: `${brandPrimary}18`,
            borderColor: brandPrimary,
            color: modeColors.textColor,
          }}
        >
          <div className="flex items-center gap-2">
            <Icons.Sparkles size={14} style={{ color: brandPrimary }} />
            <span>{voiceFeedback}</span>
          </div>
          <button type="button" onClick={() => setVoiceFeedback(null)} className="text-xs">
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          4. במת ה-60% המרכזית: 4 כרטיסים דינמיים לפי חשיבות ושימושים
         ===================================================================== */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center my-1 overflow-hidden min-h-[340px]">
        {renderDynamicStage()}
      </div>

      {/* =====================================================================
          5. סרגל ניווט מצפן בין קבוצות של 4 (Compass Pagination) + פוטר KOSUN 2026
         ===================================================================== */}
      {!selectedContactId && (
        <div className="flex items-center justify-between px-2 py-1.5 mt-1 border-t border-white/10 text-xs z-20">
          <button
            type="button"
            disabled={selectedGroupId ? safeContactsPage === 0 : safeGroupsPage === 0}
            onClick={() => {
              if (selectedGroupId) {
                setContactsPage((p) => Math.max(0, p - 1));
              } else {
                setGroupsPage((p) => Math.max(0, p - 1));
              }
              setActiveCardIndex(0);
            }}
            className="px-3 py-1 rounded-xl border font-bold flex items-center gap-1 disabled:opacity-35 transition-all"
            style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
          >
            <Icons.ChevronRight size={14} style={{ color: brandPrimary }} />
            <span>4 הקודמים</span>
          </button>

          <div className="flex items-center gap-2 text-[10.5px] font-bold" style={{ color: modeColors.secondaryText }}>
            <span>
              {selectedGroupId
                ? `אנשי קשר בקבוצה: עמוד ${safeContactsPage + 1} מתוך ${totalContactsPages} (${totalContactsInGroup} סה״כ)`
                : `קבוצות דינמיות: עמוד ${safeGroupsPage + 1} מתוך ${totalGroupsPages} (${allDynamicGroups.length} קבוצות)`}
            </span>
          </div>

          <button
            type="button"
            disabled={
              selectedGroupId
                ? safeContactsPage >= totalContactsPages - 1
                : safeGroupsPage >= totalGroupsPages - 1
            }
            onClick={() => {
              if (selectedGroupId) {
                setContactsPage((p) => Math.min(totalContactsPages - 1, p + 1));
              } else {
                setGroupsPage((p) => Math.min(totalGroupsPages - 1, p + 1));
              }
              setActiveCardIndex(0);
            }}
            className="px-3 py-1 rounded-xl border font-bold flex items-center gap-1 disabled:opacity-35 transition-all"
            style={{ borderColor: modeColors.borderColor, color: modeColors.textColor }}
          >
            <span>4 הבאים</span>
            <Icons.ChevronLeft size={14} style={{ color: brandPrimary }} />
          </button>
        </div>
      )}

      <KosunUniversalFooter
        tenantProfile={tenantProfile}
        onHomeClick={() => {
          setSelectedContactId(null);
          setSelectedGroupId(null);
          setGroupsPage(0);
          setContactsPage(0);
          setActiveCardIndex(0);
        }}
        onOpenSecretOwner={() => setIsStyleSelectorOpen((prev) => !prev)}
      />
    </div>
  );
};
export default KosCrmDynamicGroupsPage;
