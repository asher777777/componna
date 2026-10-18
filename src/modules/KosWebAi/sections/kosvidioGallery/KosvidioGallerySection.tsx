import React, { useState, useEffect, useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import { collection, getDocs } from 'firebase/firestore';
import {
  KosvidioGallerySectionConfig,
  KosvidioGalleryItem,
  KosvidioGalleryLayout,
} from '../../types/sectionConfigs';
import { getCategoryFromPage } from '../../types/pageBuilder.types';
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

function buildKosvidioHref(slugOrUrl?: string): string {
  if (!slugOrUrl) return '/kosvidio';
  let clean = slugOrUrl.trim();
  clean = clean.replace(/^\/?p\//i, '');
  if (!clean || clean.toLowerCase() === 'kosvidio' || clean.toLowerCase() === '/kosvidio') {
    return '/kosvidio';
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function formatNumber(num?: number): string {
  if (typeof num !== 'number' || Number.isNaN(num)) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('he-IL');
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
    anchorId = 'kosvidio-gallery',
    badge = 'KOSVIDIO • גלריית וידאו חכמה',
    title,
    subtitle,
    description,
    layout: initialLayout = 'spotlight-grid',
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
    ctaButtonText = 'לכל סרטוני הערוץ (KOSVIDIO)',
    ctaButtonUrl = '/kosvidio',
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
      ? `צפו בסרטונים, בהדרכות ובמאמרי הוידאו של ${brandCompanyName} המקושרים ישירות לעמודי ה-KOSVIDIO של העסק.`
      : '');
  const effectiveChannelName = cleanedChannelName || brandCompanyName;
  const effectiveChannelSlogan = cleanedChannelSlogan || brandSlogan;
  const effectiveChannelAvatar = cleanedAvatarUrl || brandLogoUrl;
  const effectiveAccent = accentColor || brandPrimaryColor || '#ef4444';

  const cleanCustomItems = useMemo(
    () => (Array.isArray(items) ? items.filter((item) => !isDummyVideoItem(item)) : []),
    [items]
  );

  const [activeLayout, setActiveLayout] = useState<KosvidioGalleryLayout>(initialLayout);
  const [rawResolvedItems, setRawResolvedItems] = useState<KosvidioGalleryItem[]>(cleanCustomItems);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveLayout(initialLayout);
  }, [initialLayout]);

  // Dynamic collection fetching from Tenant KOSVIDIO / KosTube / Pages (Strictly Real Videos Only)
  useEffect(() => {
    let isMounted = true;

    async function loadTenantVideos() {
      if (source === 'custom') {
        if (isMounted) {
          setRawResolvedItems(cleanCustomItems);
        }
        return;
      }

      // Pull from tenant's real KOSVIDIO collections (mod_kos_tube_pages, kos_web_ai_documents, mod_kos_tube_videos)
      const collected: KosvidioGalleryItem[] = [];
      const seenYoutubeIds = new Set<string>();
      const seenDocIds = new Set<string>();

      try {
        const tenantPrefix = isMaster ? 'tenants/_master' : `tenants/${effTenant}`;

        // 1. Primary source: Firestore mod_kos_tube_pages under current tenant
        if (db) {
          try {
            const tubePagesRef = collection(db, `${tenantPrefix}/${SYSTEM_COLLECTIONS.KOS_TUBE_PAGES}`);
            const tubePagesSnap = await getDocs(tubePagesRef);
            tubePagesSnap.forEach((docSnap) => {
              const d = docSnap.data() as any;
              if (!d) return;
              const ytId = extractYouTubeId(d.youtubeVideoId);
              if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId)) return;
              if (seenYoutubeIds.has(ytId)) return;
              seenYoutubeIds.add(ytId);

              const idKey = `tube_page_${docSnap.id}`;
              seenDocIds.add(idKey);
              collected.push({
                id: idKey,
                title: d.seoTitle || d.title || 'סרטון KOSVIDIO',
                subtitle: brandCompanyName || effectiveChannelName,
                description: d.summary || d.metaDescription || '',
                youtubeVideoId: ytId,
                thumbnailUrl:
                  d.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
                kosvidioSlug: d.slug || `kosvidio-${ytId}`,
                viewsCount: Number(d.viewsCount || 150),
                likesCount: Number(d.likesCount || 30),
                publishedAt: d.publishedAt || d.createdAt || '',
                category: d.category || 'KOSVIDIO',
                tags: Array.isArray(d.tags) ? d.tags : ['KOSVIDIO'],
                featured: collected.length === 0,
              });
            });
          } catch {
            // Ignore if collection does not exist yet
          }
        }

        // 2. Secondary source: Tenant PageBuilder pages dedicated to KOSVIDIO
        const allPages = await pageBuilderFirestore.getAllPages(db, effTenant);
        const videoPages = (allPages || []).filter((p) => {
          if (!p || p.isHomePage) return false;
          const pageId = String(p.pageId || '');
          const slugLower = String(p.slug || '').toLowerCase();
          if (pageId.startsWith('home_')) return false;
          const cat = getCategoryFromPage(p);
          return (
            pageId.startsWith('page_kosvidio_') ||
            cat === 'youtube_post' ||
            slugLower.startsWith('kosvidio-') ||
            slugLower.startsWith('kostube-')
          );
        });

        for (const p of videoPages) {
          const kosvidioSec = Object.values(p.sections || {}).find(
            (s: any) => s && s.type === 'kosvidio'
          ) as any;
          const pageIdSuffix = String(p.pageId || '').replace(/^page_kosvidio_/, '');
          const ytId =
            extractYouTubeId(kosvidioSec?.youtubeVideoId) ||
            extractYouTubeId(kosvidioSec?.videoUrl) ||
            extractYouTubeId(pageIdSuffix);
          if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId)) continue;
          if (seenYoutubeIds.has(ytId)) continue;
          seenYoutubeIds.add(ytId);

          const itemId = p.pageId || `page_${p.slug}`;
          seenDocIds.add(itemId);
          collected.push({
            id: itemId,
            title: kosvidioSec?.title || p.pageTitle || 'סרטון KOSVIDIO',
            subtitle:
              cleanConfigText(kosvidioSec?.channelName) || brandCompanyName || effectiveChannelName,
            description:
              kosvidioSec?.shortDescription ||
              p.seoSettings?.description ||
              (brandCompanyName ? `עמוד וידאו ומאמר מתוך ${brandCompanyName}` : ''),
            youtubeVideoId: ytId,
            videoUrl: kosvidioSec?.videoUrl,
            thumbnailUrl:
              p.seoSettings?.ogImage || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            kosvidioSlug: p.slug || `kosvidio-${ytId}`,
            viewsCount: Number(kosvidioSec?.viewsCount || p.viewsCount || 120),
            likesCount: Number(kosvidioSec?.likesCount || 24),
            publishedAt: kosvidioSec?.publishedDateText || p.updatedAt || '',
            category: 'KOSVIDIO',
            tags: Array.isArray(kosvidioSec?.tags)
              ? kosvidioSec.tags
              : ['KOSVIDIO', brandCompanyName].filter(Boolean),
            featured: collected.length === 0,
          });
        }

        // 3. Tertiary source: Processed videos in mod_kos_tube_videos not yet added
        if (db) {
          try {
            const tubeVideosRef = collection(db, `${tenantPrefix}/${SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS}`);
            const tubeVideosSnap = await getDocs(tubeVideosRef);
            tubeVideosSnap.forEach((docSnap) => {
              const d = docSnap.data() as any;
              if (!d || d.status !== 'processed') return;
              const ytId = extractYouTubeId(d.youtubeVideoId || docSnap.id.replace(/^vid_/, ''));
              if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId)) return;
              if (seenYoutubeIds.has(ytId)) return;
              seenYoutubeIds.add(ytId);

              const idKey = `tube_vid_${docSnap.id}`;
              seenDocIds.add(idKey);
              collected.push({
                id: idKey,
                title: d.title || 'סרטון ערוץ',
                subtitle: d.channelTitle || brandCompanyName || effectiveChannelName,
                description: d.description || '',
                youtubeVideoId: ytId,
                thumbnailUrl:
                  d.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
                kosvidioSlug: d.seoPageSlug || d.slug || `kosvidio-${ytId}`,
                duration: d.duration || '',
                viewsCount: Number(d.viewCount || d.viewsCount || 100),
                likesCount: Number(d.likeCount || d.likesCount || 18),
                publishedAt: d.publishedAt || '',
                category: 'KOSVIDIO',
                tags: Array.isArray(d.tags) ? d.tags : ['KOSVIDIO'],
                featured: collected.length === 0,
              });
            });
          } catch {
            // Ignore if collection does not exist yet
          }
        }
      } catch (err) {
        console.warn('[KosvidioGallerySection] Dynamic fetch error:', err);
      }

      if (!isMounted) return;

      if (collected.length > 0) {
        setRawResolvedItems(collected);
      } else if (cleanCustomItems.length > 0) {
        setRawResolvedItems(cleanCustomItems);
      } else {
        setRawResolvedItems([]);
      }
    }

    loadTenantVideos();
    return () => {
      isMounted = false;
    };
  }, [source, db, effTenant, isMaster, cleanCustomItems, brandCompanyName, effectiveChannelName]);

  // Apply logical rules (filterTag, filterKeyword, minViews, sortBy, and maxVideos limit)
  const displayedVideos = useMemo(() => {
    let list = [...rawResolvedItems];

    const rules = logicRules || {};
    const effectiveLimit = Number(rules.maxVideos || maxVideos || 6);

    if (rules.filterTag && rules.filterTag.trim() !== '') {
      const tagNeedle = rules.filterTag.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.category?.toLowerCase().includes(tagNeedle) ||
          v.tags?.some((t) => t.toLowerCase().includes(tagNeedle)) ||
          v.title?.toLowerCase().includes(tagNeedle)
      );
    }

    if (rules.filterKeyword && rules.filterKeyword.trim() !== '') {
      const kw = rules.filterKeyword.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.title?.toLowerCase().includes(kw) ||
          v.subtitle?.toLowerCase().includes(kw) ||
          v.description?.toLowerCase().includes(kw)
      );
    }

    if (typeof rules.minViews === 'number' && rules.minViews > 0) {
      list = list.filter((v) => (v.viewsCount || 0) >= rules.minViews!);
    }

    const sortMode = rules.sortBy || 'newest';
    if (sortMode === 'most_views') {
      list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else if (sortMode === 'most_likes') {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortMode === 'title_asc') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'he'));
    }

    return list.slice(0, Math.max(1, effectiveLimit));
  }, [rawResolvedItems, logicRules, maxVideos]);

  // Active spotlight video (defaults to first video in displayedVideos)
  const activeSpotlightVideo = useMemo(() => {
    if (displayedVideos.length === 0) return null;
    if (selectedVideoId) {
      const found = displayedVideos.find((v) => v.id === selectedVideoId);
      if (found) return found;
    }
    return displayedVideos[0];
  }, [displayedVideos, selectedVideoId]);

  const subVideos = useMemo(() => {
    if (displayedVideos.length <= 1) return [];
    const activeId = activeSpotlightVideo?.id;
    return displayedVideos.filter((v) => v.id !== activeId);
  }, [displayedVideos, activeSpotlightVideo]);

  const handleSelectVideo = (video: KosvidioGalleryItem, autoPlay = true) => {
    if (clickBehavior === 'navigate_slug' && video.kosvidioSlug) {
      window.location.href = buildKosvidioHref(video.kosvidioSlug);
      return;
    }
    setSelectedVideoId(video.id);
    if (autoPlay) {
      setPlayingVideoId(video.id);
    }
  };

  const scrollHorizontal = (dir: 'right' | 'left') => {
    if (!horizontalScrollRef.current) return;
    const distance = dir === 'left' ? -380 : 380;
    horizontalScrollRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const getThumbnail = (v: KosvidioGalleryItem) => {
    if (v.thumbnailUrl && v.thumbnailUrl.trim() !== '') return v.thumbnailUrl;
    const ytId = extractYouTubeId(v.youtubeVideoId || v.videoUrl);
    if (ytId) return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  };

  const renderVideoEmbedOrThumbnail = (
    video: KosvidioGalleryItem,
    isLargeSpotlight = false
  ) => {
    const isPlaying = playingVideoId === video.id;
    const ytId = extractYouTubeId(video.youtubeVideoId || video.videoUrl);
    const thumb = getThumbnail(video);
    const slugHref = buildKosvidioHref(video.kosvidioSlug || 'Kosvidio');

    if (isPlaying && ytId) {
      return (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
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
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video src={video.videoUrl} controls autoPlay className="w-full h-full object-cover" />
        </div>
      );
    }

    return (
      <div
        onClick={() => handleSelectVideo(video, true)}
        className="group relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden cursor-pointer select-none"
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-lg backdrop-blur-md"
            style={{ backgroundColor: `${effectiveAccent}e6` }}
          >
            <Video className="w-3 h-3" />
            <span>{video.category || 'KOSVIDIO'}</span>
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
              'rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110',
              isLargeSpotlight ? 'w-20 h-20' : 'w-14 h-14'
            )}
            style={{
              backgroundColor: effectiveAccent,
              boxShadow: `0 0 35px ${effectiveAccent}80`,
            }}
          >
            <Play className={clsx('fill-current ml-0.5', isLargeSpotlight ? 'w-8 h-8' : 'w-6 h-6')} />
          </div>
        </div>

        {/* Bottom Overlay Info on Spotlight */}
        {isLargeSpotlight && (
          <div className="absolute bottom-4 right-4 left-4 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-semibold text-red-300 mb-1">
                נגן ראשי • לחצו להפעלה מהירה
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                {video.title}
              </h3>
            </div>
            <a
              href={slugHref}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition"
            >
              <span>לעמוד KOSVIDIO המלא</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      id={anchorId}
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors"
      style={{ backgroundColor: backgroundColor || '#090d16' }}
      dir="rtl"
    >
      {/* Ambient Decorative Glow */}
      <div
        className="pointer-events-none absolute -top-32 right-1/4 w-[480px] h-[480px] rounded-full blur-[130px] opacity-20"
        style={{ backgroundColor: effectiveAccent }}
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3 text-right">
            {badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" style={{ color: effectiveAccent }} />
                <span className="text-xs font-bold tracking-wide text-slate-200">{badge}</span>
              </div>
            )}

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
              style={{ color: titleColor || '#ffffff' }}
            >
              {effectiveTitle}
            </h2>

            {effectiveSubtitle && (
              <p className="text-base sm:text-lg font-bold" style={{ color: effectiveAccent }}>
                {effectiveSubtitle}
              </p>
            )}

            {effectiveDescription && (
              <p
                className="text-sm sm:text-base leading-relaxed max-w-2xl"
                style={{ color: descriptionColor || '#94a3b8' }}
              >
                {effectiveDescription}
              </p>
            )}
          </div>

          {/* Right/Left Controls: Brand Channel Badge & Optional Visitor Layout Switcher */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
            {/* Brand Channel Identity Pill */}
            <a
              href={buildKosvidioHref(ctaButtonUrl)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition group"
            >
              <img
                src={effectiveChannelAvatar}
                alt={effectiveChannelName}
                className="w-9 h-9 rounded-full object-contain bg-slate-900 p-0.5 border border-white/15"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/kosun-official-logo.png';
                }}
              />
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>{effectiveChannelName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-[11px] text-slate-400">{effectiveChannelSlogan}</div>
              </div>
            </a>

            {/* Optional Visitor Layout Switcher */}
            {allowVisitorLayoutSwitch && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveLayout('spotlight-grid')}
                  className={clsx(
                    'p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer',
                    activeLayout === 'spotlight-grid'
                      ? 'bg-white/15 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  )}
                  title="וידאו גדול ותחתיו קטנים"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">ראשי + רשת</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayout('stacked-list')}
                  className={clsx(
                    'p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer',
                    activeLayout === 'stacked-list'
                      ? 'bg-white/15 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  )}
                  title="רשימה זה תחת זה"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">רשימה אנכית</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayout('horizontal-scroll')}
                  className={clsx(
                    'p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer',
                    activeLayout === 'horizontal-scroll'
                      ? 'bg-white/15 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  )}
                  title="גלילה אופקית ללא גלישה"
                >
                  <Columns className="w-4 h-4" />
                  <span className="hidden sm:inline">גלילה אופקית</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Pill Notification if logicRules are active */}
        {(logicRules?.filterTag || logicRules?.minViews) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <Filter className="w-3 h-3 text-amber-400" />
              <span>סינון דינמי פעיל: מציג עד {displayedVideos.length} סרטונים נבחרים</span>
            </span>
            {logicRules?.filterTag && (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                תגית: #{logicRules.filterTag}
              </span>
            )}
          </div>
        )}

        {/* LAYOUT A: SPOTLIGHT GRID (וידאו גדול ותחתיו כמה קטנים) */}
        {activeLayout === 'spotlight-grid' && activeSpotlightVideo && (
          <div className="flex flex-col gap-8">
            {/* Big Featured Video Card */}
            <div
              className="rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl transition-all"
              style={{ backgroundColor: cardBgColor || '#111827' }}
            >
              {renderVideoEmbedOrThumbnail(activeSpotlightVideo, true)}

              <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      {formatNumber(activeSpotlightVideo.viewsCount)} צפיות
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      {formatNumber(activeSpotlightVideo.likesCount)} אהבו
                    </span>
                    {activeSpotlightVideo.publishedAt && (
                      <span>• {activeSpotlightVideo.publishedAt}</span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {activeSpotlightVideo.title}
                  </h3>
                  {activeSpotlightVideo.description && (
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                      {activeSpotlightVideo.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectVideo(activeSpotlightVideo, true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: effectiveAccent }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>נגן סרטון עכשיו</span>
                  </button>

                  <a
                    href={buildKosvidioHref(activeSpotlightVideo.kosvidioSlug || 'Kosvidio')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/15 transition"
                  >
                    <span>עבור לעמוד KOSVIDIO</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Smaller Videos Underneath */}
            {subVideos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {subVideos.map((vid) => {
                  const thumb = getThumbnail(vid);
                  const slugHref = buildKosvidioHref(vid.kosvidioSlug || 'Kosvidio');
                  return (
                    <div
                      key={vid.id}
                      onClick={() => handleSelectVideo(vid, true)}
                      className="group rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:-translate-y-1"
                      style={{ backgroundColor: cardBgColor || '#111827' }}
                    >
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                            style={{ backgroundColor: effectiveAccent }}
                          >
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                        {vid.duration && (
                          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold" style={{ color: effectiveAccent }}>
                              {vid.category || 'KOSVIDIO'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(vid.viewsCount)}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                            {vid.title}
                          </h4>
                          {vid.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {vid.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-medium">
                            לחץ להפעלה בנגן הראשי
                          </span>
                          <a
                            href={slugHref}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                          >
                            <span>לעמוד הוידאו</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LAYOUT B: STACKED LIST (רשימה זה תחת זה) */}
        {activeLayout === 'stacked-list' && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            {displayedVideos.map((vid, idx) => {
              const slugHref = buildKosvidioHref(vid.kosvidioSlug || 'Kosvidio');
              return (
                <div
                  key={vid.id}
                  className="rounded-3xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all shadow-xl flex flex-col md:flex-row gap-6 items-stretch"
                  style={{ backgroundColor: cardBgColor || '#111827' }}
                >
                  {/* Video Player / Thumbnail column */}
                  <div className="w-full md:w-5/12 lg:w-1/2 shrink-0">
                    {renderVideoEmbedOrThumbnail(vid, false)}
                  </div>

                  {/* Details column */}
                  <div className="flex-1 flex flex-col justify-between py-1 text-right space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: effectiveAccent }}
                        >
                          #{idx + 1} • {vid.category || 'KOSVIDIO'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          {formatNumber(vid.viewsCount)} צפיות
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                          {formatNumber(vid.likesCount)}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                        {vid.title}
                      </h3>

                      {vid.subtitle && (
                        <p className="text-xs font-bold text-slate-300">{vid.subtitle}</p>
                      )}

                      {vid.description && (
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                          {vid.description}
                        </p>
                      )}

                      {Array.isArray(vid.tags) && vid.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {vid.tags.slice(0, 4).map((t, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 text-[11px] border border-white/5"
                            >
                              <Tag className="w-2.5 h-2.5 text-slate-400" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectVideo(vid, true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer"
                        style={{ backgroundColor: effectiveAccent }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>נגן סרטון במקום</span>
                      </button>

                      <a
                        href={slugHref}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition"
                      >
                        <span>לעמוד הוידאו (KOSVIDIO)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LAYOUT C: HORIZONTAL SCROLL WITHOUT PAGE OVERFLOW (גלריה עם גלילה אופקית ללא גלישה) */}
        {activeLayout === 'horizontal-scroll' && (
          <div className="relative w-full max-w-full overflow-hidden">
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold text-slate-400">
                החליקו ימינה או שמאלה לצפייה ב-{displayedVideos.length} סרטוני הגלריה
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollHorizontal('right')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition cursor-pointer"
                  aria-label="גלול ימינה"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal('left')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition cursor-pointer"
                  aria-label="גלול שמאלה"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contained Horizontal Track (Zero Page Overflow) */}
            <div
              ref={horizontalScrollRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {displayedVideos.map((vid) => {
                const slugHref = buildKosvidioHref(vid.kosvidioSlug || 'Kosvidio');
                return (
                  <div
                    key={vid.id}
                    className="snap-start shrink-0 w-[85vw] sm:w-[360px] md:w-[400px] rounded-3xl overflow-hidden border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between shadow-xl"
                    style={{ backgroundColor: cardBgColor || '#111827' }}
                  >
                    <div className="p-3 pb-0">{renderVideoEmbedOrThumbnail(vid, false)}</div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-bold" style={{ color: effectiveAccent }}>
                            {vid.category || 'KOSVIDIO'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                            {formatNumber(vid.viewsCount)} צפיות
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-white line-clamp-2">
                          {vid.title}
                        </h3>

                        {vid.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {vid.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectVideo(vid, true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer"
                          style={{ backgroundColor: effectiveAccent }}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>הפעל וידאו</span>
                        </button>

                        <a
                          href={slugHref}
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                        >
                          <span>לעמוד KOSVIDIO</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA to main KOSVIDIO hub */}
        {ctaButtonText && (
          <div className="pt-4 flex justify-center">
            <a
              href={buildKosvidioHref(ctaButtonUrl)}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black text-white shadow-xl transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: effectiveAccent,
                boxShadow: `0 10px 30px -5px ${effectiveAccent}66`,
              }}
            >
              <Video className="w-4 h-4" />
              <span>{ctaButtonText}</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
