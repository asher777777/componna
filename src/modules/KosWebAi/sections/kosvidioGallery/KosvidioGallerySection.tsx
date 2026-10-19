import React, { useState, useEffect, useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import { collection, getDocs } from 'firebase/firestore';
import {
  KosvidioGallerySectionConfig,
  KosvidioGalleryItem,
  KosvidioGalleryLayoutPreset,
  KosvidioGalleryViewMode,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { getCategoryFromPage, PAGE_CATEGORIES, PageCategory } from '../../types/pageBuilder.types';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { BrandDna } from '../../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';
import {
  Play,
  Video,
  Eye,
  ThumbsUp,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Tag,
  LayoutGrid,
  List,
  Columns,
  ArrowLeft,
  Filter,
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
  if (
    itemId.startsWith('kosvidio-default-') ||
    itemId.startsWith('kosvidio-item-') ||
    itemId.startsWith('brand-srv-vid-')
  ) {
    return true;
  }
  return false;
}

function buildVideoHref(slugOrUrl?: string): string {
  if (!slugOrUrl) return '/kosvidio';
  let clean = slugOrUrl.trim().replace(/^\/?p\//i, '').replace(/^\/+/, '');
  if (!clean || clean.toLowerCase() === 'kosvidio') {
    return '/kosvidio';
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.toLowerCase().startsWith('kosvidio/')) {
    return `/${clean}`;
  }
  if (clean.toLowerCase().startsWith('kosvidio-')) {
    const sub = clean.slice('kosvidio-'.length);
    return `/kosvidio/${sub}`;
  }
  return `/kosvidio/${clean}`;
}

function formatNumber(num?: number): string {
  if (typeof num !== 'number' || Number.isNaN(num)) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('he-IL');
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

export const KosvidioGallerySection: React.FC<{ config: KosvidioGallerySectionConfig }> = ({ config }) => {
  const { db } = useSystemConnection();

  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );
  const isMaster = effTenant === '_master' || effTenant === ROOT_TENANT_ID;

  const [firestoreBrand, setFirestoreBrand] = useState<BrandDna | null>(null);

  useEffect(() => {
    let active = true;
    loadBrandDna(db, effTenant)
      .then((dna) => {
        if (active && dna) {
          setFirestoreBrand(dna);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [db, effTenant]);

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
  const brandPrimaryColor = liveBrand?.designTokens?.primaryColor || '#ef4444';

  const {
    anchorId = 'video-library',
    badge,
    title,
    subtitle,
    description,
    layout: rawLayout = 'standard',
    viewMode: rawViewMode = 'spotlight-grid',
    objectScale = 'normal',
    buttonShape = 'rounded',
    buttonSize = 'md',
    allowVisitorLayoutSwitch = false,
    source = 'tenant_kosvidio',
    logicRules,
    maxVideos = 6,
    clickBehavior = 'inline_and_link',
    channelName,
    channelSlogan,
    channelAvatarUrl,
    backgroundColor = '#090d16',
    titleColor = '#ffffff',
    descriptionColor = '#94a3b8',
    accentColor,
    cardBgColor = '#111827',
    items = [],
    ctaButtonText,
    ctaButtonUrl = '/kosvidio',

    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor = '#000000',
    textBgOverlayOpacity = 60,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
  } = config;

  // Cleanse any accidental _master text leakage when running on a subdomain tenant
  const cleanConfigText = (val?: string): string => {
    if (!val) return '';
    if (!isMaster && (val.includes('קושאן') || val.includes('כל אדם זה נכס'))) {
      return '';
    }
    return val;
  };

  const cleanedTitle = cleanConfigText(title);
  const cleanedSubtitle = cleanConfigText(subtitle);
  const cleanedDescription = cleanConfigText(description);
  const cleanedChannelName = cleanConfigText(channelName);
  const cleanedChannelSlogan = cleanConfigText(channelSlogan);
  const cleanedAvatarUrl =
    !isMaster &&
    (channelAvatarUrl === '/images/kosun-logo.svg' ||
      channelAvatarUrl === '/images/kosun-official-logo.png')
      ? ''
      : channelAvatarUrl || '';

  const effectiveTitle =
    cleanedTitle ||
    (brandCompanyName ? `ספריית הוידאו והתוכן של ${brandCompanyName}` : 'ספריית הוידאו והתוכן');
  const effectiveSubtitle = cleanedSubtitle || brandSlogan;
  const effectiveDescription =
    cleanedDescription ||
    brandUvp ||
    (brandCompanyName
      ? `צפו בסרטונים, בהדרכות ובמאמרי הוידאו המובילים של ${brandCompanyName}.`
      : 'סרטונים, הדרכות ותוכן בלעדי');
  const effectiveChannelName = cleanedChannelName || brandCompanyName;
  const effectiveChannelSlogan = cleanedChannelSlogan || brandSlogan;
  const effectiveChannelAvatar = cleanedAvatarUrl || brandLogoUrl;

  const effectiveBadge =
    badge || (brandCompanyName ? `• ${brandCompanyName} VIDEO •` : '• ספריית וידאו חכמה •');
  const effectiveCtaText =
    ctaButtonText || (brandCompanyName ? `לכל הסרטונים של ${brandCompanyName}` : 'לכל סרטוני הערוץ');

  // Determine layout style preset vs view mode
  const effectiveLayoutStyle: 'feminine' | 'masculine' | 'standard' | 'spiritual' | 'sharp' | 'analytical' = useMemo(() => {
    if (
      rawLayout === 'feminine' ||
      rawLayout === 'masculine' ||
      rawLayout === 'spiritual' ||
      rawLayout === 'sharp' ||
      rawLayout === 'analytical'
    ) {
      return rawLayout;
    }
    return 'standard';
  }, [rawLayout]);

  const initialViewMode: 'spotlight-grid' | 'stacked-list' | 'horizontal-scroll' = useMemo(() => {
    if (rawLayout === 'spotlight-grid' || rawLayout === 'stacked-list' || rawLayout === 'horizontal-scroll') {
      return rawLayout;
    }
    return rawViewMode || 'spotlight-grid';
  }, [rawLayout, rawViewMode]);

  const [activeLayout, setActiveLayout] = useState<'spotlight-grid' | 'stacked-list' | 'horizontal-scroll'>(initialViewMode);

  useEffect(() => {
    setActiveLayout(initialViewMode);
  }, [initialViewMode]);

  // Style Themes
  const getThemeClasses = () => {
    switch (effectiveLayoutStyle) {
      case 'feminine':
        return {
          wrapper: 'font-sans',
          badge: 'bg-rose-500/15 text-rose-300 border-rose-400/30 rounded-full px-4 py-1.5 shadow-sm',
          title: 'font-serif text-rose-50 drop-shadow-sm',
          subtitle: 'text-rose-200/80',
          card: 'bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/20 hover:border-rose-400/50 rounded-[2.2rem] shadow-[0_15px_40px_rgba(244,63,94,0.12)]',
          spotlightCard: 'rounded-[2.5rem] border border-rose-500/30 shadow-[0_20px_50px_rgba(244,63,94,0.2)]',
          videoThumbRadius: 'rounded-[2rem]',
          tag: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-full',
          playBtn: 'rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]',
          accent: '#f43f5e',
          channelBadge: 'border-rose-400/30 bg-rose-950/60 rounded-full',
        };
      case 'masculine':
        return {
          wrapper: 'font-sans',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40 rounded-lg px-3.5 py-1 uppercase tracking-wider',
          title: 'font-black tracking-tight text-white drop-shadow-md',
          subtitle: 'text-slate-300 font-medium',
          card: 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-zinc-800 hover:border-amber-500/60 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]',
          spotlightCard: 'rounded-2xl border-2 border-amber-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.9)]',
          videoThumbRadius: 'rounded-xl',
          tag: 'bg-zinc-800 text-amber-300 border border-amber-500/30 rounded-md font-bold',
          playBtn: 'rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-[0_0_30px_rgba(245,158,11,0.6)]',
          accent: '#f59e0b',
          channelBadge: 'border-amber-500/40 bg-zinc-900 rounded-xl',
        };
      case 'spiritual':
        return {
          wrapper: 'font-sans',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 rounded-full px-4 py-1.5',
          title: 'font-light tracking-wide text-emerald-50 drop-shadow-sm',
          subtitle: 'text-emerald-200/70',
          card: 'bg-gradient-to-b from-emerald-950/40 to-slate-950 border border-emerald-500/20 hover:border-emerald-400/50 rounded-[2.5rem] shadow-[0_15px_45px_rgba(16,185,129,0.12)]',
          spotlightCard: 'rounded-[2.8rem] border border-emerald-500/30 shadow-[0_20px_55px_rgba(16,185,129,0.18)]',
          videoThumbRadius: 'rounded-[2.2rem]',
          tag: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full',
          playBtn: 'rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]',
          accent: '#10b981',
          channelBadge: 'border-emerald-400/30 bg-emerald-950/60 rounded-full',
        };
      case 'sharp':
        return {
          wrapper: 'font-sans',
          badge: 'bg-cyan-950/80 text-cyan-300 border-2 border-cyan-500/60 rounded-none px-3 py-1 font-mono text-[10px]',
          title: 'font-mono font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]',
          subtitle: 'text-cyan-200/80 font-mono text-xs',
          card: 'bg-black border-2 border-cyan-500/30 hover:border-cyan-400 rounded-none shadow-[0_0_25px_rgba(6,182,212,0.18)]',
          spotlightCard: 'rounded-none border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.3)]',
          videoThumbRadius: 'rounded-none',
          tag: 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 rounded-none font-mono text-[10px]',
          playBtn: 'rounded-none bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.8)]',
          accent: '#06b6d4',
          channelBadge: 'border-cyan-500/60 bg-black rounded-none',
        };
      case 'analytical':
        return {
          wrapper: 'font-sans',
          badge: 'bg-blue-950/60 text-blue-300 border border-blue-500/40 rounded-md px-3 py-1 font-mono text-xs',
          title: 'font-extrabold tracking-tight text-white border-r-4 border-blue-500 pr-3',
          subtitle: 'text-slate-400 font-mono text-xs',
          card: 'bg-slate-900/90 border border-slate-700/80 hover:border-blue-400/60 rounded-lg shadow-md',
          spotlightCard: 'rounded-xl border border-blue-500/40 shadow-xl',
          videoThumbRadius: 'rounded-lg',
          tag: 'bg-slate-800 text-blue-300 border border-blue-600/40 rounded-md font-mono text-[11px]',
          playBtn: 'rounded-lg bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.5)]',
          accent: '#3b82f6',
          channelBadge: 'border-blue-500/40 bg-slate-900 rounded-md',
        };
      case 'standard':
      default:
        return {
          wrapper: 'font-sans',
          badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30 rounded-full px-4 py-1.5',
          title: 'font-black tracking-tight text-white',
          subtitle: 'text-slate-300',
          card: 'bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl shadow-xl',
          spotlightCard: 'rounded-3xl border border-white/10 shadow-2xl',
          videoThumbRadius: 'rounded-2xl',
          tag: 'bg-slate-800 text-slate-200 border border-slate-700 rounded-lg',
          playBtn: 'rounded-full bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.6)]',
          accent: '#ef4444',
          channelBadge: 'border-slate-800 bg-slate-900 rounded-2xl',
        };
    }
  };

  const theme = getThemeClasses();
  const effectiveAccent = accentColor || brandPrimaryColor || theme.accent;

  // Scale settings
  const getScaleClasses = () => {
    switch (objectScale) {
      case 'compact':
        return {
          headerGap: 'space-y-2 mb-6',
          titleSize: 'text-2xl sm:text-3xl',
          subSize: 'text-xs sm:text-sm',
          cardPadding: 'p-3',
          cardGrid: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3',
          cardTitle: 'text-xs font-bold line-clamp-1',
          cardDesc: 'text-[11px] line-clamp-1',
          iconSize: 'w-3.5 h-3.5',
          spotlightPlay: 'w-14 h-14',
          itemPlay: 'w-10 h-10',
        };
      case 'spacious':
        return {
          headerGap: 'space-y-4 mb-12',
          titleSize: 'text-4xl sm:text-5xl md:text-6xl',
          subSize: 'text-base sm:text-lg',
          cardPadding: 'p-5 sm:p-6',
          cardGrid: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6',
          cardTitle: 'text-base sm:text-lg font-black line-clamp-2',
          cardDesc: 'text-sm line-clamp-3',
          iconSize: 'w-5 h-5',
          spotlightPlay: 'w-24 h-24',
          itemPlay: 'w-16 h-16',
        };
      case 'normal':
      default:
        return {
          headerGap: 'space-y-3 mb-8',
          titleSize: 'text-3xl sm:text-4xl md:text-5xl',
          subSize: 'text-sm sm:text-base',
          cardPadding: 'p-4',
          cardGrid: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
          cardTitle: 'text-sm sm:text-base font-bold line-clamp-2',
          cardDesc: 'text-xs line-clamp-2',
          iconSize: 'w-4 h-4',
          spotlightPlay: 'w-20 h-20',
          itemPlay: 'w-14 h-14',
        };
    }
  };
  const scale = getScaleClasses();

  // Button Shape
  const getButtonShapeClass = () => {
    if (buttonShape === 'pill') return 'rounded-full';
    if (buttonShape === 'square') return 'rounded-none';
    if (buttonShape === 'rounded') return 'rounded-2xl';
    switch (effectiveLayoutStyle) {
      case 'feminine':
      case 'spiritual':
        return 'rounded-full';
      case 'masculine':
        return 'rounded-xl';
      case 'sharp':
        return 'rounded-none';
      case 'analytical':
        return 'rounded-lg';
      default:
        return 'rounded-2xl';
    }
  };

  // Button Size
  const getButtonSizeClass = () => {
    switch (buttonSize) {
      case 'sm':
        return 'px-4 py-2 text-xs';
      case 'lg':
        return 'px-8 py-4 text-base font-black';
      case 'md':
      default:
        return 'px-6 py-3 text-sm font-bold';
    }
  };

  // Text Background Hover Effect
  const getTextBgEffectClass = (eff: HeroTextBgEffect) => {
    switch (eff) {
      case 'zoom-glow':
        return 'group-hover/textbg:scale-105 group-hover/textbg:brightness-110 transition-all duration-700';
      case 'shimmer-sweep':
        return 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent after:-translate-x-full group-hover/textbg:after:translate-x-full after:transition-transform after:duration-1000';
      case 'float-parallax':
        return 'group-hover/textbg:-translate-y-1 group-hover/textbg:scale-[1.01] transition-all duration-500';
      case 'blur-reveal':
        return 'blur-[2px] group-hover/textbg:blur-0 transition-all duration-500';
      case 'gradient-shift':
        return 'group-hover/textbg:contrast-125 transition-all duration-700';
      default:
        return 'transition-transform duration-500 group-hover/textbg:scale-105';
    }
  };

  const cleanCustomItems = useMemo(
    () => (Array.isArray(items) ? items.filter((item) => !isDummyVideoItem(item)) : []),
    [items]
  );

  const [rawResolvedItems, setRawResolvedItems] = useState<KosvidioGalleryItem[]>(cleanCustomItems);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic collection fetching from Tenant Videos (Strictly Real Videos Only)
  useEffect(() => {
    let isMounted = true;

    async function loadTenantVideos() {
      if (source === 'custom') {
        if (isMounted) {
          setRawResolvedItems(cleanCustomItems);
        }
        return;
      }

      if (!db) {
        if (isMounted) setRawResolvedItems(cleanCustomItems);
        return;
      }

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

      if (isMounted) {
        setRawResolvedItems(collected.length > 0 ? collected : cleanCustomItems);
      }
    }

    loadTenantVideos();
    return () => {
      isMounted = false;
    };
  }, [db, effTenant, isMaster, source, brandCompanyName, cleanCustomItems]);

  // Apply logic filtering & sorting
  const finalVideos = useMemo(() => {
    let list = [...rawResolvedItems];

    if (logicRules?.filterKeyword && logicRules.filterKeyword.trim()) {
      const q = logicRules.filterKeyword.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.title?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (logicRules?.filterTag && logicRules.filterTag.trim()) {
      const t = logicRules.filterTag.trim().toLowerCase();
      list = list.filter((v) => v.tags?.some((tag) => tag.toLowerCase() === t));
    }

    if (typeof logicRules?.minViews === 'number' && logicRules.minViews > 0) {
      list = list.filter((v) => Number(v.viewsCount || 0) >= (logicRules.minViews || 0));
    }

    const sortBy = logicRules?.sortBy || 'newest';
    list.sort((a, b) => {
      if (sortBy === 'most_views') {
        return Number(b.viewsCount || 0) - Number(a.viewsCount || 0);
      }
      if (sortBy === 'most_likes') {
        return Number(b.likesCount || 0) - Number(a.likesCount || 0);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '', 'he');
      }
      return 0;
    });

    const limit = logicRules?.maxVideos || maxVideos || 6;
    return list.slice(0, limit);
  }, [rawResolvedItems, logicRules, maxVideos]);

  const activeSpotlightVideo = useMemo(() => {
    if (selectedVideoId) {
      const found = finalVideos.find((v) => v.id === selectedVideoId);
      if (found) return found;
    }
    const feat = finalVideos.find((v) => v.featured);
    return feat || finalVideos[0] || null;
  }, [finalVideos, selectedVideoId]);

  const handleSelectVideo = (video: KosvidioGalleryItem, autoPlay = true) => {
    setSelectedVideoId(video.id);
    if (autoPlay) {
      setPlayingVideoId(video.id);
    }
    if (clickBehavior === 'navigate_slug' && video.kosvidioSlug) {
      window.location.href = buildVideoHref(video.kosvidioSlug);
    }
  };

  const getThumbnail = (v: KosvidioGalleryItem) => {
    if (v.thumbnailUrl) return v.thumbnailUrl;
    const ytId = extractYouTubeId(v.youtubeVideoId || v.videoUrl);
    if (ytId) return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    return 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80';
  };

  const renderVideoPlayerOrThumbnail = (
    video: KosvidioGalleryItem,
    isLargeSpotlight = false
  ) => {
    const ytId = extractYouTubeId(video.youtubeVideoId || video.videoUrl);
    const isPlaying = playingVideoId === video.id;
    const thumb = getThumbnail(video);
    const slugHref = buildVideoHref(video.kosvidioSlug);

    if (isPlaying && ytId) {
      return (
        <div className={clsx("relative w-full aspect-video bg-black overflow-hidden shadow-2xl", theme.videoThumbRadius)}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (isPlaying && video.videoUrl) {
      return (
        <div className={clsx("relative w-full aspect-video bg-black overflow-hidden shadow-2xl", theme.videoThumbRadius)}>
          <video src={video.videoUrl} controls autoPlay className="w-full h-full object-cover" />
        </div>
      );
    }

    return (
      <div
        onClick={() => handleSelectVideo(video, true)}
        className={clsx(
          "group relative w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer select-none",
          theme.videoThumbRadius
        )}
      >
        <img
          src={thumb}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-opacity group-hover:opacity-90" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2 pointer-events-none">
          <span
            className={clsx("inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md", theme.tag)}
            style={{ backgroundColor: `${effectiveAccent}e6` }}
          >
            <Video className="w-3 h-3" />
            <span>{video.category || 'וידאו'}</span>
          </span>

          {video.duration && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 text-white text-[11px] font-mono backdrop-blur-md border border-white/10">
              <Clock className="w-3 h-3 text-slate-300" />
              {video.duration}
            </span>
          )}
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={clsx(
              'flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110',
              theme.playBtn,
              isLargeSpotlight ? scale.spotlightPlay : scale.itemPlay
            )}
            style={{
              boxShadow: `0 0 35px ${effectiveAccent}80`,
            }}
          >
            <Play className={clsx('fill-current ml-0.5', isLargeSpotlight ? 'w-8 h-8' : 'w-5 h-5')} />
          </div>
        </div>

        {/* Bottom Overlay Info on Spotlight */}
        {isLargeSpotlight && (
          <div className="absolute bottom-4 right-4 left-4 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-semibold text-white/80 mb-1">
                נגן ראשי • לחצו להפעלה מהירה
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                {video.title}
              </h3>
            </div>
            <a
              href={slugHref}
              onClick={(e) => e.stopPropagation()}
              className={clsx(
                "pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition",
                getButtonShapeClass()
              )}
            >
              <span>לצפייה בסרטון המלא</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  };

  const scrollHorizontal = (dir: 'left' | 'right') => {
    if (!horizontalScrollRef.current) return;
    const delta = dir === 'left' ? -340 : 340;
    horizontalScrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section
      id={anchorId}
      className={clsx('relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 text-right overflow-hidden', theme.wrapper)}
      style={{ backgroundColor }}
      dir="rtl"
    >
      {/* Full-Section Background Image with Overlay & Effect */}
      {textBgEnabled && textBgImageUrl && textBgScope === 'full-section' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={textBgImageUrl}
            alt=""
            className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: textBgOverlayColor,
              opacity: (textBgOverlayOpacity ?? 60) / 100,
            }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className={clsx('relative flex flex-col items-center text-center max-w-3xl mx-auto group/textbg', scale.headerGap)}>
          {/* Card-scoped background image */}
          {textBgEnabled && textBgImageUrl && textBgScope === 'text-card' && (
            <div className="absolute inset-0 -m-6 rounded-3xl overflow-hidden pointer-events-none z-0">
              <img
                src={textBgImageUrl}
                alt=""
                className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: textBgOverlayColor,
                  opacity: (textBgOverlayOpacity ?? 60) / 100,
                }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center">
            {effectiveBadge && (
              <div className={clsx('inline-flex items-center gap-2 mb-3 backdrop-blur-md', theme.badge)}>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold">{effectiveBadge}</span>
              </div>
            )}

            <h2
              className={clsx('font-black tracking-tight leading-tight', scale.titleSize, theme.title)}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>

            {effectiveSubtitle && (
              <p
                className={clsx('mt-2 font-medium leading-relaxed max-w-2xl', scale.subSize, theme.subtitle)}
                style={{ color: descriptionColor }}
              >
                {effectiveSubtitle}
              </p>
            )}

            {effectiveDescription && (
              <p
                className="text-xs sm:text-sm mt-1 max-w-xl leading-relaxed text-slate-400"
                style={{ color: descriptionColor ? `${descriptionColor}cc` : undefined }}
              >
                {effectiveDescription}
              </p>
            )}
          </div>
        </div>

        {/* Channel Branding Pill */}
        {effectiveChannelName && (
          <div className="flex justify-center -mt-2">
            <div
              className={clsx(
                'inline-flex items-center gap-3 px-4 py-2 border backdrop-blur-md shadow-sm',
                theme.channelBadge
              )}
            >
              {effectiveChannelAvatar && (
                <img
                  src={effectiveChannelAvatar}
                  alt={effectiveChannelName}
                  className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-sm"
                />
              )}
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{effectiveChannelName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                </div>
                {effectiveChannelSlogan && (
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {effectiveChannelSlogan}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Visitor Layout Switcher (3 View Modes) */}
        {allowVisitorLayoutSwitch && (
          <div className="flex items-center justify-center gap-2 pb-2">
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <button
                type="button"
                onClick={() => setActiveLayout('spotlight-grid')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeLayout === 'spotlight-grid'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>וידאו מרכזי וכרטיסים</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayout('stacked-list')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeLayout === 'stacked-list'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span>רשימה עשירה</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayout('horizontal-scroll')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeLayout === 'horizontal-scroll'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>גלריה אופקית</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {finalVideos.length === 0 && (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center max-w-xl mx-auto space-y-3">
            <Video className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">אין סרטונים זמינים כרגע</h4>
            <p className="text-xs text-slate-400">
              הוסיפו סרטונים דרך מודל העריכה או חברו את ערוץ הוידאו של {brandCompanyName || 'העסק'}.
            </p>
          </div>
        )}

        {/* VIEW MODE A: Spotlight Grid */}
        {finalVideos.length > 0 && activeLayout === 'spotlight-grid' && (
          <div className="space-y-6">
            {/* Main Spotlight Video */}
            {activeSpotlightVideo && (
              <div
                className={clsx('overflow-hidden p-3 sm:p-4 transition-all', theme.spotlightCard)}
                style={{ backgroundColor: cardBgColor }}
              >
                {renderVideoPlayerOrThumbnail(activeSpotlightVideo, true)}

                <div className="pt-4 px-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {activeSpotlightVideo.title}
                    </h3>
                    {activeSpotlightVideo.description && (
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 max-w-3xl">
                        {activeSpotlightVideo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {typeof activeSpotlightVideo.viewsCount === 'number' && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatNumber(activeSpotlightVideo.viewsCount)} צפיות</span>
                      </span>
                    )}

                    {typeof activeSpotlightVideo.likesCount === 'number' && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatNumber(activeSpotlightVideo.likesCount)}</span>
                      </span>
                    )}

                    <a
                      href={buildVideoHref(activeSpotlightVideo.kosvidioSlug)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 font-bold text-white shadow transition-transform hover:-translate-y-0.5',
                        getButtonShapeClass(),
                        getButtonSizeClass()
                      )}
                      style={{ backgroundColor: effectiveAccent }}
                    >
                      <span>לצפייה בסרטון</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Sub Grid Cards */}
            <div className={clsx('grid', scale.cardGrid)}>
              {finalVideos.map((video, idx) => {
                const isSelected = activeSpotlightVideo?.id === video.id;
                const ytId = extractYouTubeId(video.youtubeVideoId || video.videoUrl);
                const thumb = getThumbnail(video);
                const slugHref = buildVideoHref(video.kosvidioSlug);

                return (
                  <div
                    key={video.id || idx}
                    onClick={() => handleSelectVideo(video, true)}
                    className={clsx(
                      'group transition-all duration-300 overflow-hidden cursor-pointer flex flex-col',
                      theme.card,
                      scale.cardPadding,
                      isSelected && 'ring-2 ring-red-500 shadow-2xl scale-[1.01]'
                    )}
                    style={{ backgroundColor: cardBgColor }}
                  >
                    <div className={clsx('relative aspect-video overflow-hidden bg-slate-950 mb-3', theme.videoThumbRadius)}>
                      <img
                        src={thumb}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={clsx(
                            'flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110',
                            theme.playBtn,
                            scale.itemPlay
                          )}
                          style={{
                            boxShadow: `0 0 20px ${effectiveAccent}66`,
                          }}
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>

                      {video.duration && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white">
                          {video.duration}
                        </span>
                      )}

                      {/* Video index counter in analytical style */}
                      {effectiveLayoutStyle === 'analytical' && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-blue-950/90 text-[10px] font-mono text-blue-300 border border-blue-600/50">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className={clsx('text-white group-hover:text-amber-300 transition-colors', scale.cardTitle)}>
                          {video.title}
                        </h4>
                        {video.description && (
                          <p className={clsx('text-slate-400 mt-1', scale.cardDesc)}>
                            {video.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{video.category || 'וידאו'}</span>
                        <a
                          href={slugHref}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-white flex items-center gap-1 font-bold text-sky-400"
                        >
                          <span>עמוד מלא</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE B: Stacked List */}
        {finalVideos.length > 0 && activeLayout === 'stacked-list' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {finalVideos.map((video, idx) => {
              const ytId = extractYouTubeId(video.youtubeVideoId || video.videoUrl);
              const thumb = getThumbnail(video);
              const slugHref = buildVideoHref(video.kosvidioSlug);

              return (
                <div
                  key={video.id || idx}
                  className={clsx(
                    'p-4 sm:p-5 flex flex-col md:flex-row items-center gap-5 transition-all duration-300 group',
                    theme.card
                  )}
                  style={{ backgroundColor: cardBgColor }}
                >
                  <div className="w-full md:w-80 shrink-0">
                    {renderVideoPlayerOrThumbnail(video, false)}
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={clsx('px-2.5 py-0.5 text-[10px] font-bold', theme.tag)}>
                          #{idx + 1} • {video.category || 'וידאו'}
                        </span>
                        {video.duration && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            משך: {video.duration}
                          </span>
                        )}
                        {typeof video.viewsCount === 'number' && (
                          <span className="text-[11px] text-slate-400">
                            • {formatNumber(video.viewsCount)} צפיות
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectVideo(video, true)}
                        className={clsx(
                          'inline-flex items-center gap-1.5 font-bold text-white shadow transition-all cursor-pointer',
                          getButtonShapeClass(),
                          getButtonSizeClass()
                        )}
                        style={{ backgroundColor: effectiveAccent }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>נגן סרטון</span>
                      </button>

                      <a
                        href={slugHref}
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition',
                          getButtonShapeClass()
                        )}
                      >
                        <span>לעמוד הסרטון המלא</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE C: Horizontal Scroll */}
        {finalVideos.length > 0 && activeLayout === 'horizontal-scroll' && (
          <div className="relative group/carousel">
            {/* Scroll Navigation Arrows */}
            <button
              type="button"
              onClick={() => scrollHorizontal('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center shadow-2xl transition cursor-pointer"
              title="גלול ימינה"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollHorizontal('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center shadow-2xl transition cursor-pointer"
              title="גלול שמאלה"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={horizontalScrollRef}
              className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-3 px-8 snap-x snap-mandatory scroll-smooth"
            >
              {finalVideos.map((vid, idx) => {
                const slugHref = buildVideoHref(vid.kosvidioSlug);
                return (
                  <div
                    key={vid.id || idx}
                    className={clsx(
                      'w-72 sm:w-80 shrink-0 snap-start flex flex-col justify-between overflow-hidden transition-all duration-300 group',
                      theme.card,
                      scale.cardPadding
                    )}
                    style={{ backgroundColor: cardBgColor }}
                  >
                    <div>
                      <div className="mb-3">{renderVideoPlayerOrThumbnail(vid, false)}</div>
                      <span className={clsx('px-2.5 py-0.5 text-[10px] font-bold mb-1.5 inline-block', theme.tag)}>
                        {vid.category || 'וידאו'}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {vid.title}
                      </h4>
                      {vid.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectVideo(vid, true)}
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer',
                          getButtonShapeClass()
                        )}
                        style={{ backgroundColor: effectiveAccent }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>הפעל וידאו</span>
                      </button>

                      <a
                        href={slugHref}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                      >
                        <span>לצפייה בסרטון</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA to main video library */}
        {effectiveCtaText && (
          <div className="pt-4 flex justify-center">
            <a
              href={buildVideoHref(ctaButtonUrl)}
              className={clsx(
                'inline-flex items-center gap-2.5 text-sm font-black text-white shadow-xl transition-transform hover:-translate-y-0.5',
                getButtonShapeClass(),
                getButtonSizeClass()
              )}
              style={{
                backgroundColor: effectiveAccent,
                boxShadow: `0 10px 30px -5px ${effectiveAccent}66`,
              }}
            >
              <Video className="w-4 h-4" />
              <span>{effectiveCtaText}</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
