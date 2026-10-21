import React, { useState, useRef, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { collection, getDocs } from 'firebase/firestore';
import {
  KosvidioGallerySectionConfig,
  KosvidioGalleryItem,
  KosvidioGalleryLayoutPreset,
  KosvidioGalleryViewMode,
  KosvidioGallerySource,
  KosvidioGallerySortBy,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { getCategoryFromPage, PAGE_CATEGORIES, PageCategory } from '../../types/pageBuilder.types';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { PageBuilderInput, PageBuilderTextarea, resolveInputValue } from '../../ui/PageBuilderInput';
import { sanitizeSectionConfig } from '../../utils/sanitizeConfig';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { BrandDna } from '../../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';
import {
  Video,
  LayoutGrid,
  List,
  Columns,
  Sparkles,
  Shield,
  Layers,
  Compass,
  Crosshair,
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Sliders,
  FileText,
  Play,
  ExternalLink,
  Clock,
  Eye,
  EyeOff,
  ThumbsUp,
  Sun,
  Moon,
} from 'lucide-react';

const DUMMY_YOUTUBE_IDS = new Set([
  'M7lc1UVf-VE',
  'dQw4w9WgXcQ',
  'aqz-KE-bpKQ',
  'jNQXAC9IVRw',
  'L_LUpnjgPso',
]);

function extractYouTubeId(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
  );
  return match ? match[1] : null;
}

function isDummyVideoItem(item?: Partial<KosvidioGalleryItem> | null): boolean {
  if (!item) return true;
  const ytId = extractYouTubeId(item.youtubeVideoId || item.videoUrl);
  if (ytId && DUMMY_YOUTUBE_IDS.has(ytId)) return true;
  const itemId = String(item.id || '');
  return (
    itemId.startsWith('kosvidio-default-') ||
    itemId.startsWith('kosvidio-item-') ||
    itemId.startsWith('brand-srv-vid-')
  );
}

function cleanPageTitle(val?: string): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/\s*-\s*Kosvidio$/i, '')
    .replace(/\s*-\s*KosTube$/i, '')
    .replace(/\s*\|\s*Kosvidio$/i, '')
    .replace(/\s*\|\s*KosTube$/i, '')
    .replace(/\s*-\s*KOSVIDIO$/i, '')
    .replace(/\s*\|\s*KOSVIDIO$/i, '')
    .trim();
}

function extractVideoTitleFromPage(p: any): string {
  if (!p) return 'סרטון וידאו';
  const sections = Object.values(p.sections || {}) as any[];
  const vidSec = sections.find(
    (s) => s && (s.type === 'kosvidio' || s.type === 'videoGallery' || s.type === 'videoEngagement')
  );
  if (vidSec?.title && typeof vidSec.title === 'string' && vidSec.title.trim()) {
    return cleanPageTitle(vidSec.title.trim());
  }
  if (vidSec?.videoTitle && typeof vidSec.videoTitle === 'string' && vidSec.videoTitle.trim()) {
    return cleanPageTitle(vidSec.videoTitle.trim());
  }
  if (p.seoSettings?.title && typeof p.seoSettings.title === 'string' && p.seoSettings.title.trim()) {
    return cleanPageTitle(p.seoSettings.title.trim());
  }
  if (p.pageTitle && typeof p.pageTitle === 'string' && p.pageTitle.trim()) {
    return cleanPageTitle(p.pageTitle.trim());
  }
  const aboutSec = sections.find(
    (s) => s && (s.type === 'about' || s.type === 'hero' || s.type === 'richContent')
  );
  if (aboutSec?.title && typeof aboutSec.title === 'string' && aboutSec.title.trim()) {
    return cleanPageTitle(aboutSec.title.trim());
  }
  return 'סרטון וידאו';
}

function extractVideoDescriptionFromPage(p: any): string {
  if (!p) return '';
  if (
    p.seoSettings?.description &&
    typeof p.seoSettings.description === 'string' &&
    p.seoSettings.description.trim()
  ) {
    return p.seoSettings.description.trim();
  }
  if (
    p.seoSettings?.aiKnowledgeSummary &&
    typeof p.seoSettings.aiKnowledgeSummary === 'string' &&
    p.seoSettings.aiKnowledgeSummary.trim()
  ) {
    return p.seoSettings.aiKnowledgeSummary.trim();
  }
  const sections = Object.values(p.sections || {}) as any[];
  const vidSec = sections.find((s) => s && (s.type === 'kosvidio' || s.type === 'videoGallery'));
  if (
    vidSec?.shortDescription &&
    typeof vidSec.shortDescription === 'string' &&
    vidSec.shortDescription.trim()
  ) {
    return vidSec.shortDescription.trim();
  }
  if (vidSec?.description && typeof vidSec.description === 'string' && vidSec.description.trim()) {
    return vidSec.description.trim();
  }
  if (
    vidSec?.longDescriptionMarkdown &&
    typeof vidSec.longDescriptionMarkdown === 'string' &&
    vidSec.longDescriptionMarkdown.trim()
  ) {
    return vidSec.longDescriptionMarkdown.trim().slice(0, 180);
  }
  const aboutSec = sections.find((s) => s && (s.type === 'about' || s.type === 'richContent'));
  if (aboutSec?.subtitle && typeof aboutSec.subtitle === 'string' && aboutSec.subtitle.trim()) {
    return aboutSec.subtitle.trim();
  }
  if (aboutSec?.description && typeof aboutSec.description === 'string' && aboutSec.description.trim()) {
    return aboutSec.description.trim();
  }
  if (aboutSec?.content && typeof aboutSec.content === 'string' && aboutSec.content.trim()) {
    const plain = aboutSec.content.replace(/<[^>]*>/g, '').trim();
    if (plain) return plain.slice(0, 180);
  }
  return '';
}

function extractVideoBadgeFromPage(p: any): string {
  if (!p) return 'וידאו';
  if (p.badge && typeof p.badge === 'string' && p.badge.trim()) {
    return p.badge.trim();
  }
  const sections = Object.values(p.sections || {}) as any[];
  const vidSec = sections.find(
    (s) => s && (s.type === 'kosvidio' || s.type === 'videoGallery' || s.type === 'videoEngagement')
  );
  if (vidSec?.badge && typeof vidSec.badge === 'string' && vidSec.badge.trim()) {
    return vidSec.badge.trim();
  }
  if (
    vidSec?.category &&
    typeof vidSec.category === 'string' &&
    vidSec.category.trim() &&
    !vidSec.category.includes('KOSVIDIO')
  ) {
    return vidSec.category.trim();
  }
  if (Array.isArray(vidSec?.tags) && vidSec.tags.length > 0) {
    const firstTag = vidSec.tags.find(
      (t: any) => typeof t === 'string' && t.trim() && !t.includes('KOSVIDIO')
    );
    if (firstTag) return firstTag.trim();
  }
  if (Array.isArray(p.seoSettings?.keywords) && p.seoSettings.keywords.length > 0) {
    const firstKeyword = p.seoSettings.keywords.find(
      (k: any) => typeof k === 'string' && k.trim() && !k.includes('KOSVIDIO')
    );
    if (firstKeyword) return firstKeyword.trim();
  }
  if (p.pageCategory && PAGE_CATEGORIES[p.pageCategory as PageCategory]) {
    return PAGE_CATEGORIES[p.pageCategory as PageCategory].shortLabel;
  }
  return 'וידאו';
}

function extractVideoTitleFromTubePage(d: any): string {
  if (!d) return 'סרטון וידאו';
  const raw = d.h1 || d.metaTitle || d.title || d.seoTitle || '';
  return cleanPageTitle(raw) || 'סרטון וידאו';
}

function extractVideoDescriptionFromTubePage(d: any): string {
  if (!d) return '';
  if (d.executiveSummary && typeof d.executiveSummary === 'string' && d.executiveSummary.trim()) {
    return d.executiveSummary.trim();
  }
  if (d.metaDescription && typeof d.metaDescription === 'string' && d.metaDescription.trim()) {
    return d.metaDescription.trim();
  }
  if (d.summary && typeof d.summary === 'string' && d.summary.trim()) {
    return d.summary.trim();
  }
  if (d.articleContent && typeof d.articleContent === 'string' && d.articleContent.trim()) {
    const plain = d.articleContent.replace(/<[^>]*>/g, '').trim();
    if (plain) return plain.slice(0, 180);
  }
  return '';
}

function extractVideoBadgeFromTubePage(d: any): string {
  if (!d) return 'וידאו';
  if (d.badge && typeof d.badge === 'string' && d.badge.trim()) return d.badge.trim();
  if (
    d.category &&
    typeof d.category === 'string' &&
    d.category.trim() &&
    !d.category.includes('KOSVIDIO')
  ) {
    return d.category.trim();
  }
  if (Array.isArray(d.tags) && d.tags.length > 0) {
    const t = d.tags.find((tag: any) => typeof tag === 'string' && tag.trim() && !tag.includes('KOSVIDIO'));
    if (t) return t.trim();
  }
  if (Array.isArray(d.focusKeywords) && d.focusKeywords.length > 0) {
    const kw = d.focusKeywords.find((k: any) => typeof k === 'string' && k.trim());
    if (kw) return kw.trim();
  }
  return 'וידאו';
}

function extractVideoBadgeFromTubeVideo(d: any): string {
  if (!d) return 'וידאו';
  if (
    d.category &&
    typeof d.category === 'string' &&
    d.category.trim() &&
    !d.category.includes('KOSVIDIO')
  ) {
    return d.category.trim();
  }
  if (Array.isArray(d.tags) && d.tags.length > 0) {
    const t = d.tags.find((tag: any) => typeof tag === 'string' && tag.trim() && !tag.includes('KOSVIDIO'));
    if (t) return t.trim();
  }
  return 'וידאו';
}

interface LayoutOptionDef {
  id: KosvidioGalleryLayoutPreset;
  title: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  typography: string;
  buttonShape: string;
  colors: string[];
  description: string;
}

const LAYOUT_OPTIONS: LayoutOptionDef[] = [
  {
    id: 'feminine',
    title: 'א. סגנון נשי',
    badge: 'רך ואלגנטי',
    icon: Sparkles,
    typography: 'גופן סריפי מעודן, פינות קשתיות (36px)',
    buttonShape: 'קפסולה מעוגלת מלאה (Pill), רוז-גולד',
    colors: ['#f43f5e', '#fb7185', '#fff1f2', '#fda4af'],
    description: 'פינות מעוגלות רכות, גווני בלאש ורוז-גולד, הילת תאורה עדינה וכרטיסים קשתיים יוקרתיים.',
  },
  {
    id: 'masculine',
    title: 'ב. סגנון גברי',
    badge: 'עוצמתי ודומיננטי',
    icon: Shield,
    typography: 'כותרות ענק מודגשות, פחם שחור וזהב פליז',
    buttonShape: 'מלבני ישר ומוצק עם מסגרת מתכתית',
    colors: ['#09090b', '#27272a', '#d97706', '#f59e0b'],
    description: 'פחם עמוק, שחור מט וזהב פליז יוקרתי. שולי פלדה יציבים, מסגרת חזקה וניגודיות דרמטית.',
  },
  {
    id: 'standard',
    title: 'ג. פריסה עכשווית',
    badge: 'מומלץ KOSUN',
    icon: Layers,
    typography: 'טיפוגרפיה מודרנית ונקייה, מרווחים מאוזנים',
    buttonShape: 'פינות מעוגלות קלאסיות (16px), חלקות',
    colors: ['#0f172a', '#1e293b', '#6366f1', '#ef4444'],
    description: 'הפריסה המוכרת והאהובה של KOSUN – נגן מרכזי מאוזן, מודרני ונקי המתאים לכל מותג.',
  },
  {
    id: 'spiritual',
    title: 'ד. סגנון רוחני',
    badge: 'הרמוני ושלו',
    icon: Compass,
    typography: 'גופן אוורירי ושקט, אותיות מרווחות',
    buttonShape: 'מעוגל רך עם קווי מתאר עדינים',
    colors: ['#064e3b', '#047857', '#10b981', '#a7f3d0'],
    description: 'גווני מרווה, מנטה ואמרלד. נגן צף עם הילת צללים עדינה ואווירה שלווה ומחברת.',
  },
  {
    id: 'sharp',
    title: 'ה. סגנון חד',
    badge: 'הייטק ומינימליזם',
    icon: Crosshair,
    typography: 'גופן מונוספייס טכני, סמני HUD',
    buttonShape: 'חד לחלוטין (90 מעלות, ללא רדיוס)',
    colors: ['#000000', '#083344', '#06b6d4', '#22d3ee'],
    description: 'פינות 90 מעלות ללא רדיוס, סמני HUD פינתיים, כיתוב מונו וניגודיות שחור-ציאן עתידנית.',
  },
  {
    id: 'analytical',
    title: 'ו. סגנון אנליטי',
    badge: 'סדר ואינדקס נתונים',
    icon: Activity,
    typography: 'טיפוגרפיה מובנית וקטלוגית, אינדקס #01',
    buttonShape: 'קומפקטי ומיושר בדיוק לפי הגריד',
    colors: ['#0f172a', '#1e1b4b', '#3b82f6', '#818cf8'],
    description: 'סדר קטלוגי מבוסס אינדקס נתונים מובנה, כחול נייבי עמוק, פלדה וקווים הנדסיים נקיים.',
  },
];

export interface KosvidioGalleryEditorProps {
  config: KosvidioGallerySectionConfig;
  onChange: (updated: KosvidioGallerySectionConfig) => void;
  onClose?: () => void;
}

export const KosvidioGalleryEditor: React.FC<KosvidioGalleryEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { db } = useSystemConnection();
  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );
  const isMaster = effTenant === '_master' || effTenant === ROOT_TENANT_ID;

  // Local draft state for Dirty tracking & saving
  const [localConfig, setLocalConfig] = useState<KosvidioGallerySectionConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Editor panel theme — day mode by default
  const [isDayMode, setIsDayMode] = useState(true);

  // Synchronize when outer config changes and not dirty
  useEffect(() => {
    if (!isDirty) {
      setLocalConfig(config);
    }
  }, [config, isDirty]);

  const [firestoreBrand, setFirestoreBrand] = useState<BrandDna | null>(null);
  const [tenantVideos, setTenantVideos] = useState<KosvidioGalleryItem[]>([]);

  // Accordions: all closed by default
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Video Items sub-accordion
  const [activeVideoItemId, setActiveVideoItemId] = useState<string | null>(null);
  const [newQuickTitle, setNewQuickTitle] = useState('');
  const [isPullingTenant, setIsPullingTenant] = useState(false);

  // Hover layout tooltip
  const [hoveredLayout, setHoveredLayout] = useState<LayoutOptionDef | null>(null);

  const liveBrand = useMemo(
    () => resolveLiveBrandDna(firestoreBrand, effTenant),
    [firestoreBrand, effTenant]
  );

  const brandCompanyName =
    liveBrand?.identity?.companyName ||
    (liveBrand?.identity as any)?.brandName ||
    (isMaster ? 'קושאן' : '');
  const brandSlogan = liveBrand?.identity?.slogan || (isMaster ? 'כל אדם זה נכס' : '');
  const brandUvp = liveBrand?.audience?.mainUvp || liveBrand?.identity?.companyVision || '';
  const brandLogoUrl =
    liveBrand?.identity?.logoUrl || (isMaster ? '/images/kosun-official-logo.png' : '');
  const brandPrimaryColor = liveBrand?.designTokens?.primaryColor;

  // Load Tenant Brand DNA & Real Tenant Videos
  useEffect(() => {
    let active = true;

    async function loadTenantData() {
      try {
        const dna = await loadBrandDna(db, effTenant);
        if (active && dna) {
          setFirestoreBrand(dna);
        }
      } catch {
        // ignore
      }

      if (!db) return;
      const collected: KosvidioGalleryItem[] = [];
      const seenYoutubeIds = new Set<string>();
      const tenantPrefix = isMaster ? 'tenants/_master' : `tenants/${effTenant}`;

      // 1. Primary source: Firestore mod_kos_tube_pages under current tenant
      try {
        const tubePagesRef = collection(db, `${tenantPrefix}/${SYSTEM_COLLECTIONS.KOS_TUBE_PAGES}`);
        const tubePagesSnap = await getDocs(tubePagesRef);
        tubePagesSnap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          if (!d) return;
          const ytId = extractYouTubeId(d.youtubeVideoId || docSnap.id);
          if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId) || seenYoutubeIds.has(ytId)) return;
          seenYoutubeIds.add(ytId);

          const title = extractVideoTitleFromTubePage(d);
          const description = extractVideoDescriptionFromTubePage(d);
          const badge = extractVideoBadgeFromTubePage(d);

          collected.push({
            id: `tube_page_${docSnap.id}`,
            title,
            subtitle: d.slug || '',
            description,
            youtubeVideoId: ytId,
            thumbnailUrl: d.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            kosvidioSlug: d.slug || `kosvidio-${ytId}`,
            viewsCount: Number(d.viewCount || d.viewsCount || 150),
            likesCount: Number(d.likeCount || d.likesCount || 30),
            publishedAt: d.publishedAt || d.createdAt || '',
            category: badge,
            tags: Array.isArray(d.tags) ? d.tags : [badge],
            featured: collected.length === 0,
          });
        });
      } catch {
        // ignore
      }

      // 2. Secondary source: Tenant PageBuilder pages dedicated to videos
      try {
        const allPages = await pageBuilderFirestore.getAllPages(db, effTenant);
        const videoPages = (allPages || []).filter((p) => {
          if (!p || p.isHomePage) return false;
          const pageId = String(p.pageId || '');
          const slugLower = String(p.slug || '').toLowerCase();
          if (pageId.startsWith('home_')) return false;
          const cat = getCategoryFromPage(p);
          const hasVideoSection = Object.values(p.sections || {}).some(
            (s: any) =>
              s &&
              (s.type === 'kosvidio' ||
                s.type === 'videoGallery' ||
                s.type === 'flowPlayer' ||
                s.type === 'videoEngagement')
          );
          return (
            pageId.startsWith('page_kosvidio_') ||
            cat === 'youtube_post' ||
            slugLower.startsWith('kosvidio-') ||
            slugLower.startsWith('kostube-') ||
            slugLower.startsWith('video-') ||
            hasVideoSection
          );
        });

        for (const p of videoPages) {
          const vidSec = Object.values(p.sections || {}).find(
            (s: any) =>
              s &&
              (s.type === 'kosvidio' ||
                s.type === 'videoGallery' ||
                s.type === 'flowPlayer' ||
                s.type === 'videoEngagement')
          ) as any;
          const pageIdSuffix = String(p.pageId || '').replace(/^page_kosvidio_/, '');
          const ytId =
            extractYouTubeId(vidSec?.youtubeVideoId) ||
            extractYouTubeId(vidSec?.videoUrl) ||
            extractYouTubeId(p.slug) ||
            extractYouTubeId(pageIdSuffix);
          if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId) || seenYoutubeIds.has(ytId)) continue;
          seenYoutubeIds.add(ytId);

          const title = extractVideoTitleFromPage(p);
          const description = extractVideoDescriptionFromPage(p);
          const badge = extractVideoBadgeFromPage(p);

          collected.push({
            id: p.pageId || `page_${p.slug}`,
            title,
            subtitle: p.slug || '',
            description,
            youtubeVideoId: ytId,
            videoUrl: vidSec?.videoUrl,
            thumbnailUrl:
              p.seoSettings?.ogImage || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            kosvidioSlug: p.slug || `kosvidio-${ytId}`,
            viewsCount: Number(vidSec?.viewsCount || p.viewsCount || 120),
            likesCount: Number(vidSec?.likesCount || 24),
            publishedAt: vidSec?.publishedDateText || p.updatedAt || '',
            category: badge,
            tags: Array.isArray(vidSec?.tags) && vidSec.tags.length > 0 ? vidSec.tags : [badge],
            featured: collected.length === 0,
          });
        }
      } catch {
        // ignore
      }

      // 3. Tertiary source: Processed videos in mod_kos_tube_videos
      try {
        const tubeVideosRef = collection(db, `${tenantPrefix}/${SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS}`);
        const tubeVideosSnap = await getDocs(tubeVideosRef);
        tubeVideosSnap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          if (!d) return;
          const rawYt = d.youtubeVideoId || docSnap.id.replace(/^vid_/, '');
          const ytId = extractYouTubeId(rawYt);
          if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId) || seenYoutubeIds.has(ytId)) return;
          seenYoutubeIds.add(ytId);

          const idKey = `tube_vid_${docSnap.id}`;
          const title = cleanPageTitle(d.title) || 'סרטון ערוץ';
          const description = d.description || '';
          const badge = extractVideoBadgeFromTubeVideo(d);

          collected.push({
            id: idKey,
            title,
            subtitle: d.channelTitle || '',
            description,
            youtubeVideoId: ytId,
            thumbnailUrl: d.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            kosvidioSlug: d.seoPageSlug || d.slug || `kosvidio-${ytId}`,
            duration: d.duration || '',
            viewsCount: Number(d.viewCount || d.viewsCount || 100),
            likesCount: Number(d.likeCount || d.likesCount || 18),
            publishedAt: d.publishedAt || '',
            category: badge,
            tags: Array.isArray(d.tags) ? d.tags : [badge],
            featured: collected.length === 0,
          });
        });
      } catch {
        // ignore
      }

      if (active) {
        setTenantVideos(collected);
      }
    }

    loadTenantData();
    return () => {
      active = false;
    };
  }, [db, effTenant, isMaster, brandCompanyName]);

  // Update helper
  const update = <K extends keyof KosvidioGallerySectionConfig>(
    key: K,
    val: KosvidioGallerySectionConfig[K]
  ) => {
    const cleanVal = typeof val === 'object' && val !== null ? sanitizeSectionConfig(val) : val;
    setLocalConfig((prev) => ({
      ...prev,
      [key]: cleanVal,
    }));
    setIsDirty(true);
  };

  const updateLogicRule = <
    K extends keyof NonNullable<KosvidioGallerySectionConfig['logicRules']>
  >(
    key: K,
    val: NonNullable<KosvidioGallerySectionConfig['logicRules']>[K]
  ) => {
    const nextRules = {
      ...(localConfig.logicRules || {}),
      [key]: val,
    };
    setLocalConfig((prev) => ({
      ...prev,
      logicRules: nextRules,
      ...(key === 'maxVideos' && typeof val === 'number' ? { maxVideos: val } : {}),
    }));
    setIsDirty(true);
  };

  // Save changes
  const handleSave = () => {
    onChange(localConfig);
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  // Close modal with unsaved check
  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose?.();
    }
  };

  // Sync from Brand DNA
  const handleSyncFromBrandDna = async () => {
    const freshBrand = await loadBrandDna(db, effTenant);
    setFirestoreBrand(freshBrand);
    const company =
      freshBrand?.identity?.companyName ||
      (freshBrand?.identity as any)?.brandName ||
      (isMaster ? 'קושאן' : '');
    const slogan = freshBrand?.identity?.slogan || (isMaster ? 'כל אדם זה נכס' : '');
    const uvp = freshBrand?.audience?.mainUvp || freshBrand?.identity?.companyVision || '';
    const logoUrl =
      freshBrand?.identity?.logoUrl || (isMaster ? '/images/kosun-official-logo.png' : '');
    const primaryColor = freshBrand?.designTokens?.primaryColor;

    setLocalConfig((prev) => ({
      ...prev,
      title: company ? `ספריית הוידאו והתוכן של ${company}` : 'ספריית הוידאו והתוכן',
      subtitle: slogan || 'סרטונים, הדרכות ותוכן בלעדי',
      badge: company ? `• ${company} VIDEO •` : '• ספריית וידאו חכמה •',
      description:
        uvp ||
        (company ? `צפו בסרטונים, בהדרכות ובתכנים המובילים של ${company}.` : 'סרטונים, הדרכות ותוכן בלעדי'),
      channelName: company,
      channelSlogan: slogan,
      channelAvatarUrl: logoUrl,
      ctaButtonText: company ? `לכל הסרטונים של ${company}` : 'לכל הסרטונים וההדרכות',
      ctaButtonUrl: '/kosvidio',
      ...(primaryColor ? { accentColor: primaryColor } : {}),
    }));
    setIsDirty(true);
  };

  const cleanCustomItems = useMemo(
    () => (Array.isArray(localConfig.items) ? localConfig.items.filter((i) => !isDummyVideoItem(i)) : []),
    [localConfig.items]
  );

  const editorVideoList = useMemo(
    () => (cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos),
    [cleanCustomItems, tenantVideos]
  );

  const handlePullTenantVideos = () => {
    setIsPullingTenant(true);
    setTimeout(() => {
      if (tenantVideos.length > 0) {
        update('items', tenantVideos);
      }
      setIsPullingTenant(false);
    }, 200);
  };

  const handleQuickAddItem = () => {
    const clean = newQuickTitle.trim();
    if (!clean) return;

    const newItem: KosvidioGalleryItem = {
      id: `vid-${Date.now()}`,
      title: clean,
      subtitle: '',
      description: `סרטון וידאו בנושא ${clean}`,
      youtubeVideoId: '',
      kosvidioSlug: '/kosvidio',
      duration: '03:30',
      viewsCount: 100,
      likesCount: 20,
      category: 'וידאו',
      tags: [clean, 'וידאו'].filter(Boolean),
    };

    const baseList = cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos;
    const next = [...baseList, newItem];
    update('items', next);
    setNewQuickTitle('');
    setActiveVideoItemId(newItem.id);
  };

  const handleUpdateItem = (id: string, patch: Partial<KosvidioGalleryItem>) => {
    const cleanPatch = sanitizeSectionConfig(patch);
    const baseList = cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos;
    const next = baseList.map((item) => (item.id === id ? { ...item, ...cleanPatch } : item));
    update('items', next);
  };

  const handleRemoveItem = (id: string) => {
    const baseList = cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos;
    const next = baseList.filter((item) => item.id !== id);
    update('items', next);
    if (activeVideoItemId === id) {
      setActiveVideoItemId(null);
    }
  };

  const currentLayoutPreset = localConfig.layout || 'standard';

  return (
    <div
      className={`relative w-full max-w-2xl bg-[#141414] text-white rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isDayMode ? 'kvg-day-mode' : ''
      }`}
      dir="rtl"
    >
      <style>{`
        .kvg-day-mode { filter: invert(1) hue-rotate(180deg); }
        .kvg-day-mode img,
        .kvg-day-mode video,
        .kvg-day-mode iframe,
        .kvg-day-mode .kvg-keep-colors { filter: invert(1) hue-rotate(180deg); }
      `}</style>
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#181818]">
        <div className="flex items-center">
          <svg
            viewBox="0 0 64 64"
            className="w-11 h-11 animate-pulse kvg-keep-colors"
            role="img"
            aria-label="Kosun"
          >
            <defs>
              <linearGradient id="kvgBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="kvgAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="kvgWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e7ff" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="64" height="64" rx="18" fill="url(#kvgBgGrad)" />
            <rect x="0.5" y="0.5" width="63" height="63" rx="17.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="16" y="14" width="8" height="36" rx="4" fill="url(#kvgWhiteGrad)" />
            <path d="M24 30 L38 16 C39.5 14.5 42.5 15.6 42.5 17.8 L42.5 22 C42.5 23.2 41.9 24.3 41 25.1 L30 35 Z" fill="url(#kvgWhiteGrad)" opacity="0.95" />
            <path d="M27 31 L43 47 C44 48 43.5 50 42 50 L37 50 C35.7 50 34.5 49.4 33.7 48.5 L22 36 Z" fill="url(#kvgAccentGrad)" />
            <path d="M49 8 Q49 13 54 13 Q49 13 49 18 Q49 13 44 13 Q49 13 49 8 Z" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          {/* Day / Night Toggle */}
          <button
            type="button"
            onClick={() => setIsDayMode((v) => !v)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title={isDayMode ? 'מצב לילה' : 'מצב יום'}
            aria-label={isDayMode ? 'מצב לילה' : 'מצב יום'}
          >
            {isDayMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Brand DNA Sync */}
          <button
            type="button"
            onClick={handleSyncFromBrandDna}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition cursor-pointer"
            title="סנכרן מיתוג"
            aria-label="סנכרן מיתוג"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Pulsing Save Button */}
          <button
            type="button"
            onClick={handleSave}
            title={saveSuccess ? 'נשמר!' : 'שמור'}
            aria-label={saveSuccess ? 'נשמר!' : 'שמור'}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shadow-md cursor-pointer ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse shadow-amber-500/30'
                : saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            {saveSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="סגור"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>ישנם שינויים שלא נשמרו. לחצו על "שמור" כדי לעדכן.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="underline font-bold hover:text-amber-200 cursor-pointer"
          >
            שמור כעת
          </button>
        </div>
      )}

      {/* TOP 6-LAYOUT ICON MENU — collapsible, closed by default */}
      <div className="bg-[#111111] border-b border-white/10">
        <button
          type="button"
          onClick={() => toggleAccordion('tab-style-presets')}
          className="w-full px-4 py-3 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-white/[0.02] transition cursor-pointer"
          aria-expanded={openAccordion === 'tab-style-presets'}
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>סגנון פריסה</span>
            <span className="text-[10px] text-amber-400 font-semibold">
              {LAYOUT_OPTIONS.find((l) => l.id === currentLayoutPreset)?.title || 'עכשווי'}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openAccordion === 'tab-style-presets' ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </button>

        {openAccordion === 'tab-style-presets' && (
        <div className="px-3 pb-3">
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {LAYOUT_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            const isSelected = currentLayoutPreset === opt.id;

            return (
              <div key={opt.id} className="relative">
                <button
                  type="button"
                  onClick={() => update('layout', opt.id)}
                  onMouseEnter={() => setHoveredLayout(opt)}
                  onMouseLeave={() => setHoveredLayout(null)}
                  title={opt.title}
                  aria-label={opt.title}
                  className={`w-full h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/40'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <IconComp className="w-6 h-6" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Hover / Active Layout Rich Details Card */}
        {hoveredLayout && (
          <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="font-black text-amber-300">{hoveredLayout.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {hoveredLayout.badge}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">
              {hoveredLayout.description}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
              <div>
                <span className="font-bold text-slate-300">טיפוגרפיה: </span>
                {hoveredLayout.typography}
              </div>
              <div>
                <span className="font-bold text-slate-300">כפתורים: </span>
                {hoveredLayout.buttonShape}
              </div>
            </div>
          </div>
        )}
        </div>
        )}
      </div>

      {/* Main Scrollable Body with Accordions (All Closed by Default) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar">
        {/* TAB 1: פריסה, גדלים וכפתורים */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('tab-layouts')}
            className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-white/[0.02] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>📐 פריסה, גדלי אובייקטים וכפתורים</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openAccordion === 'tab-layouts' ? 'rotate-180 text-amber-400' : ''
              }`}
            />
          </button>

          {openAccordion === 'tab-layouts' && (
            <div className="p-4 pt-1 border-t border-white/10 space-y-4 text-xs">
              {/* Object Scale */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  קנה-מידה וגודל אובייקטים (Object Scale)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'קומפקטי (Compact)', desc: 'מרווחים הדוקים ומיקוד' },
                    { id: 'normal', label: 'סטנדרטי (Normal)', desc: 'מאוזן ומותאם לכל מסך' },
                    { id: 'spacious', label: 'מרווח (Spacious)', desc: 'נגן ענק ומרווחים נדיבים' },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => update('objectScale', sc.id as any)}
                      className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                        (localConfig.objectScale || 'normal') === sc.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-xs">{sc.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{sc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Shape */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  צורת כפתורים (Button Shape)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'rounded', label: 'מעוגל (16px)' },
                    { id: 'pill', label: 'קפסולה (Pill)' },
                    { id: 'square', label: 'חד (90 מעלות)' },
                  ].map((bs) => (
                    <button
                      key={bs.id}
                      type="button"
                      onClick={() => update('buttonShape', bs.id as any)}
                      className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        (localConfig.buttonShape || 'rounded') === bs.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {bs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Size */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">גודל כפתורים</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sm', label: 'קטן (Small)' },
                    { id: 'md', label: 'בינוני (Medium)' },
                    { id: 'lg', label: 'גדול (Large)' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => update('buttonSize', sz.id as any)}
                      className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        (localConfig.buttonSize || 'md') === sz.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAB 2: תצוגת הגלריה ומקור הנתונים */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('tab-display')}
            className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-white/[0.02] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-sky-400" />
              <span>🎬 תצוגת הגלריה ומקור הנתונים</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openAccordion === 'tab-display' ? 'rotate-180 text-sky-400' : ''
              }`}
            />
          </button>

          {openAccordion === 'tab-display' && (
            <div className="p-4 pt-1 border-t border-white/10 space-y-4 text-xs">
              {/* Display Mode / View Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  מבנה תצוגת הסרטונים באזור
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'spotlight-grid' as KosvidioGalleryViewMode,
                      label: 'וידאו מרכזי וכרטיסים',
                      desc: 'נגן ראשי גדול בראש האזור ומתחתיו כרטיסי וידאו המתחלפים בלחיצה',
                      icon: LayoutGrid,
                    },
                    {
                      id: 'stacked-list' as KosvidioGalleryViewMode,
                      label: 'רשימה זה תחת זה',
                      desc: 'כרטיסי וידאו אנכיים עשירים עם נגן מובנה ופרטים מלאים',
                      icon: List,
                    },
                    {
                      id: 'horizontal-scroll' as KosvidioGalleryViewMode,
                      label: 'קרוסלה אופקית',
                      desc: 'גלילה אופקית חלקה ותחומה ללא שבירת רוחב העמוד',
                      icon: Columns,
                    },
                  ].map((vm) => {
                    const IconComp = vm.icon;
                    const isSelected = (localConfig.viewMode || 'spotlight-grid') === vm.id;
                    return (
                      <button
                        key={vm.id}
                        type="button"
                        onClick={() => update('viewMode', vm.id)}
                        className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <IconComp className="w-4 h-4 text-sky-400" />
                          <span className="font-bold text-xs">{vm.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{vm.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allow live switcher */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white text-xs">כפתורי החלפת תצוגה למבקרים</div>
                  <div className="text-[10px] text-slate-400">
                    אפשרות למבקרים בעמוד לעבור בין 3 הפריסות בזמן אמת
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.allowVisitorLayoutSwitch ?? true}
                  onChange={(e) => update('allowVisitorLayoutSwitch', e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              {/* Source Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">מקור הסרטונים</label>
                  <select
                    value={localConfig.source || 'tenant_kosvidio'}
                    onChange={(e) => update('source', e.target.value as KosvidioGallerySource)}
                    className="w-full bg-[#181818] border border-white/15 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
                  >
                    <option value="tenant_kosvidio">קולקציית הטננט (עמודי וידאו / סרטוני ערוץ)</option>
                    <option value="brand_services">שירותי המותג מ-Brand DNA</option>
                    <option value="custom">סרטונים מותאמים אישית (ניהול ידני)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">מיון סרטונים</label>
                  <select
                    value={localConfig.logicRules?.sortBy || 'newest'}
                    onChange={(e) =>
                      updateLogicRule('sortBy', e.target.value as KosvidioGallerySortBy)
                    }
                    className="w-full bg-[#181818] border border-white/15 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
                  >
                    <option value="newest">הכי חדש תחילה</option>
                    <option value="most_views">הכי נצפה תחילה</option>
                    <option value="most_likes">הכי הרבה לייקים</option>
                    <option value="title_asc">סדר אלפביתי (א-ת)</option>
                  </select>
                </div>
              </div>

              {/* Max Videos & Click Behavior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">כמות סרטונים מקסימלית</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={localConfig.logicRules?.maxVideos || localConfig.maxVideos || 6}
                    onChange={(e) => updateLogicRule('maxVideos', Number(e.target.value))}
                    className="w-full bg-[#181818] border border-white/15 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">התנהגות בלחיצה על כרטיס</label>
                  <select
                    value={localConfig.clickBehavior || 'inline_and_link'}
                    onChange={(e) => update('clickBehavior', e.target.value as any)}
                    className="w-full bg-[#181818] border border-white/15 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
                  >
                    <option value="inline_and_link">ניגון ישיר בגלריה + כפתור מעבר לעמוד המלא</option>
                    <option value="navigate_slug">מעבר מיידי לעמוד הסרטון המלא</option>
                    <option value="inline_only">ניגון בגלריה בלבד ללא מעבר</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAB 3: כותרות, באדג' ופרטי ערוץ */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('tab-content')}
            className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-white/[0.02] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>📝 כותרות, באדג' ופרטי ערוץ</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openAccordion === 'tab-content' ? 'rotate-180 text-emerald-400' : ''
              }`}
            />
          </button>

          {openAccordion === 'tab-content' && (
            <div className="p-4 pt-1 border-t border-white/10 space-y-3 text-xs">
              <PageBuilderInput
                label="באדג' עליון (קטן מעל הכותרת)"
                value={localConfig.badge || ''}
                onChange={(e) => update('badge', resolveInputValue(e))}
                placeholder="• ספריית וידאו חכמה •"
              />

              <PageBuilderInput
                label="כותרת ראשית"
                value={localConfig.title || ''}
                onChange={(e) => update('title', resolveInputValue(e))}
                placeholder="ספריית הוידאו והתוכן"
              />

              <PageBuilderInput
                label="כותרת משנה"
                value={localConfig.subtitle || ''}
                onChange={(e) => update('subtitle', resolveInputValue(e))}
                placeholder="סרטונים, הדרכות ותוכן בלעדי"
              />

              <PageBuilderTextarea
                label="תיאור האזור"
                value={localConfig.description || ''}
                onChange={(e) => update('description', resolveInputValue(e))}
                rows={2}
                placeholder="צפו בסרטונים ובהדרכות המובילים..."
              />

              {/* Channel Info */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <span className="font-bold text-amber-300 block text-xs">פרטי ערוץ הטננט</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PageBuilderInput
                    label="שם הערוץ / העסק"
                    value={localConfig.channelName || ''}
                    onChange={(e) => update('channelName', resolveInputValue(e))}
                    placeholder={brandCompanyName || 'שם העסק'}
                  />
                  <PageBuilderInput
                    label="סלוגן הערוץ"
                    value={localConfig.channelSlogan || ''}
                    onChange={(e) => update('channelSlogan', resolveInputValue(e))}
                    placeholder={brandSlogan || 'סלוגן'}
                  />
                </div>

                <PageBuilderImageUpload
                  label="לוגו / אווטאר הערוץ"
                  value={localConfig.channelAvatarUrl || ''}
                  onChange={(url) => update('channelAvatarUrl', url)}
                />
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 block text-xs">כפתור הנעה לפעולה תחתון</span>
                  <button
                    type="button"
                    onClick={() => update('showCtaButton', localConfig.showCtaButton === false ? true : false)}
                    className={clsx(
                      'p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center',
                      localConfig.showCtaButton === false
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    )}
                    title={localConfig.showCtaButton === false ? 'הכפתור מוסתר (לחץ להצגה)' : 'הכפתור מוצג (לחץ להסתרה)'}
                  >
                    {localConfig.showCtaButton === false ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {localConfig.showCtaButton !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <PageBuilderInput
                      label="טקסט כפתור תחתון"
                      value={localConfig.ctaButtonText || ''}
                      onChange={(e) => update('ctaButtonText', resolveInputValue(e))}
                      placeholder="לכל סרטוני הערוץ"
                    />
                    <PageBuilderInput
                      label="קישור כפתור תחתון"
                      value={localConfig.ctaButtonUrl || ''}
                      onChange={(e) => update('ctaButtonUrl', resolveInputValue(e))}
                      placeholder="/kosvidio"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TAB 4: רקע תמונה מאחורי הטקסט ואפקטים במעבר */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('tab-textbg')}
            className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-white/[0.02] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>🖼️ רקע תמונה מאחורי הטקסט ואפקטי מעבר</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openAccordion === 'tab-textbg' ? 'rotate-180 text-purple-400' : ''
              }`}
            />
          </button>

          {openAccordion === 'tab-textbg' && (
            <div className="p-4 pt-1 border-t border-white/10 space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white text-xs">הפעל תמונת רקע עם אפקט</div>
                  <div className="text-[10px] text-slate-400">
                    תמונה אטמוספרית עם שכבת Overlay מתחלפת במעבר עכבר
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.textBgEnabled ?? false}
                  onChange={(e) => update('textBgEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              {localConfig.textBgEnabled && (
                <div className="space-y-3 pt-1">
                  <PageBuilderImageUpload
                    label="תמונת רקע"
                    value={localConfig.textBgImageUrl || ''}
                    onChange={(url) => update('textBgImageUrl', url)}
                  />

                  {/* 5 Hover Effects */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      אפקט מעבר במעבר עכבר (Hover Transition)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'zoom-glow', label: 'הגדלה וזוהר (Zoom & Glow)' },
                        { id: 'shimmer-sweep', label: 'הבזק אור (Shimmer Sweep)' },
                        { id: 'float-parallax', label: 'ריחוף קל (Float Parallax)' },
                        { id: 'blur-reveal', label: 'מיקוד (Blur to Clear)' },
                        { id: 'gradient-shift', label: 'שינוי זווית (Gradient Shift)' },
                      ].map((eff) => (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() => update('textBgEffect', eff.id as HeroTextBgEffect)}
                          className={`p-2 rounded-xl border text-center font-bold text-[11px] transition cursor-pointer ${
                            (localConfig.textBgEffect || 'zoom-glow') === eff.id
                              ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {eff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PageBuilderColorPicker
                      label="צבע שכבת כיסוי (Overlay Color)"
                      value={localConfig.textBgOverlayColor || '#000000'}
                      onChange={(color) => update('textBgOverlayColor', color)}
                    />

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-300">אטימות כיסוי</span>
                        <span className="font-mono text-purple-400">
                          {localConfig.textBgOverlayOpacity ?? 60}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={localConfig.textBgOverlayOpacity ?? 60}
                        onChange={(e) => update('textBgOverlayOpacity', Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">טווח תצוגת הרקע</label>
                    <select
                      value={localConfig.textBgScope || 'text-card'}
                      onChange={(e) => update('textBgScope', e.target.value as any)}
                      className="w-full bg-[#181818] border border-white/15 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500"
                    >
                      <option value="text-card">מאחורי כותרת האזור (Text Card)</option>
                      <option value="full-section">על פני כל שטח האזור (Full Section)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TAB 5: ניהול סרטוני הספרייה */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('tab-videos')}
            className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-white/[0.02] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Video className="w-4 h-4 text-red-400" />
              <span>🎥 ניהול סרטוני הספרייה ({editorVideoList.length})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openAccordion === 'tab-videos' ? 'rotate-180 text-red-400' : ''
              }`}
            />
          </button>

          {openAccordion === 'tab-videos' && (
            <div className="p-4 pt-1 border-t border-white/10 space-y-3.5 text-xs">
              {/* Max Videos Setting */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white text-xs">כמות סרטונים להצגה</div>
                  <div className="text-[10px] text-slate-400">
                    הגבלת כמות הסרטונים שיוצגו בגלריה
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={localConfig.maxVideos || 12}
                    onChange={(e) => update('maxVideos', parseInt(e.target.value, 10) || 12)}
                    className="w-20 bg-[#181818] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs text-center outline-none focus:border-red-500 font-bold"
                  />
                </div>
              </div>

              {/* Top Action to pull real tenant videos */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white text-xs">סרטוני ערוץ הטננט</div>
                  <div className="text-[10px] text-slate-400">
                    נמצאו {tenantVideos.length} סרטונים בקולקציית הטננט
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePullTenantVideos}
                  disabled={isPullingTenant || tenantVideos.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isPullingTenant ? 'טוען...' : 'משוך לקולקציה'}
                </button>
              </div>

              {/* Quick Add Video by Title */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newQuickTitle}
                  onChange={(e) => setNewQuickTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQuickAddItem();
                    }
                  }}
                  placeholder="הוסף סרטון חדש (הזן כותרת ולחץ הוסף)..."
                  className="flex-1 bg-[#181818] border border-white/15 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleQuickAddItem}
                  disabled={!newQuickTitle.trim()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף</span>
                </button>
              </div>

              {/* Videos List */}
              <div className="space-y-2">
                {editorVideoList.map((video, idx) => {
                  const isOpen = activeVideoItemId === video.id;

                  return (
                    <div
                      key={video.id || idx}
                      className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                    >
                      <div
                        onClick={() => setActiveVideoItemId(isOpen ? null : video.id)}
                        className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.04] transition"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono text-slate-400">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white truncate text-xs">
                            {video.title || 'סרטון ללא שם'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {video.youtubeVideoId && (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px]">
                              YouTube
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(video.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="מחק סרטון"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180 text-amber-400' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-3.5 border-t border-white/10 space-y-3 bg-[#181818]/80 text-xs">
                          <PageBuilderInput
                            label="כותרת הסרטון"
                            value={video.title || ''}
                            onChange={(e) => handleUpdateItem(video.id, { title: resolveInputValue(e) })}
                          />

                          <PageBuilderInput
                            label="מזהה YouTube (11 תווים) או קישור וידאו מלא"
                            value={video.youtubeVideoId || video.videoUrl || ''}
                            onChange={(e) => {
                              const val = resolveInputValue(e);
                              const ytId = extractYouTubeId(val);
                              if (ytId) {
                                handleUpdateItem(video.id, {
                                  youtubeVideoId: ytId,
                                  thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
                                });
                              } else {
                                handleUpdateItem(video.id, { videoUrl: val });
                              }
                            }}
                            placeholder="dQw4w9WgXcQ או https://youtube.com/watch?v=..."
                          />

                          <PageBuilderTextarea
                            label="תיאור קצר"
                            value={video.description || ''}
                            onChange={(e) => handleUpdateItem(video.id, { description: resolveInputValue(e) })}
                            rows={2}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <PageBuilderInput
                              label="משך (למשל: 04:20)"
                              value={video.duration || ''}
                              onChange={(e) => handleUpdateItem(video.id, { duration: resolveInputValue(e) })}
                            />
                            <PageBuilderInput
                              label="קטגוריה"
                              value={video.category || ''}
                              onChange={(e) => handleUpdateItem(video.id, { category: resolveInputValue(e) })}
                              placeholder="וידאו / תווית מהעמוד"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <PageBuilderInput
                              label="מספר צפיות"
                              value={String(video.viewsCount ?? 120)}
                              onChange={(e) =>
                                handleUpdateItem(video.id, { viewsCount: Number(resolveInputValue(e)) || 0 })
                              }
                            />
                            <PageBuilderInput
                              label="קישור עמוד יעד לסרטון"
                              value={video.kosvidioSlug || ''}
                              onChange={(e) => handleUpdateItem(video.id, { kosvidioSlug: resolveInputValue(e) })}
                              placeholder="/kosvidio"
                            />
                          </div>

                          <PageBuilderImageUpload
                            label="תמונה ממוזערת מותאמת (Thumbnail)"
                            value={video.thumbnailUrl || ''}
                            onChange={(url) => handleUpdateItem(video.id, { thumbnailUrl: url })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* TAB 6: צבעי מיתוג וכרטיסים */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('tab-colors')}
            className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-white/[0.02] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-pink-400" />
              <span>🎨 צבעי מיתוג וכרטיסים</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openAccordion === 'tab-colors' ? 'rotate-180 text-pink-400' : ''
              }`}
            />
          </button>

          {openAccordion === 'tab-colors' && (
            <div className="p-4 pt-1 border-t border-white/10 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע דגש (Accent Color)"
                  value={localConfig.accentColor || '#ef4444'}
                  onChange={(color) => update('accentColor', color)}
                />

                <PageBuilderColorPicker
                  label="רקע הכרטיסים (Card Background)"
                  value={localConfig.cardBgColor || '#111827'}
                  onChange={(color) => update('cardBgColor', color)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PageBuilderColorPicker
                  label="רקע האזור"
                  value={localConfig.backgroundColor || '#090d16'}
                  onChange={(color) => update('backgroundColor', color)}
                />

                <PageBuilderColorPicker
                  label="צבע כותרת"
                  value={localConfig.titleColor || '#ffffff'}
                  onChange={(color) => update('titleColor', color)}
                />

                <PageBuilderColorPicker
                  label="צבע תיאור"
                  value={localConfig.descriptionColor || '#94a3b8'}
                  onChange={(color) => update('descriptionColor', color)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedConfirm && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-5 space-y-4 text-center shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">ישנם שינויים שלא נשמרו</h3>
            <p className="text-xs text-slate-400">
              האם ברצונך לשמור את השינויים שביצעת בספריית הוידאו לפני היציאה?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleSave();
                  setShowUnsavedConfirm(false);
                  onClose?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                שמור וסגור
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  setIsDirty(false);
                  onClose?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                בטל שינויים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
