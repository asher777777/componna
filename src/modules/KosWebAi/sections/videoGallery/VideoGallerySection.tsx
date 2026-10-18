import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import {
  VideoGallerySectionConfig,
  VideoGalleryItem,
  VideoGalleryLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { getCategoryFromPage } from '../../types/pageBuilder.types';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import {
  Play,
  Video,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Clock,
  Sparkles,
  Youtube,
  ArrowLeft,
} from 'lucide-react';
import { clsx } from 'clsx';

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

function getEmbedUrl(urlOrId?: string, autoplay: boolean = false): string {
  if (!urlOrId) return '';
  const ytId = extractYouTubeId(urlOrId);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?rel=0${autoplay ? '&autoplay=1' : ''}`;
  }
  if (urlOrId.includes('vimeo.com/')) {
    const id = urlOrId.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1' : ''}`;
  }
  return urlOrId;
}

export const VideoGallerySection: React.FC<{ config: VideoGallerySectionConfig }> = ({ config }) => {
  const { db } = useSystemConnection();

  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );
  const isMaster = effTenant === '_master' || effTenant === ROOT_TENANT_ID;

  const {
    anchorId,
    title = 'ספריית הוידאו והתוכן',
    subtitle = 'סרטונים, הדרכות ותוכן בלעדי',
    titleColor,
    subtitleColor,
    videoUrl,
    desktopHeight = '480px',
    backgroundColor = 'transparent',
    cardBackgroundColor,
    source = 'tenant_youtube', // Default connected to tenant YouTube!
    items = [],
    maxVideos = 6,
    selectedVideoId,
    showThumbnails = true,
    ctaButtonText,
    ctaButtonUrl,
    layout = 'standard',
    objectScale = 'auto',
    buttonShape = 'auto',
    buttonSize = 'auto',
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor,
    textBgOverlayOpacity,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
  } = config;

  const normalizedLayout: VideoGalleryLayoutPreset =
    !layout || layout === 'current' || layout === 'spotlight' || layout === 'grid'
      ? 'standard'
      : layout;

  // Synced tenant videos state
  const [resolvedVideos, setResolvedVideos] = useState<VideoGalleryItem[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    selectedVideoId || extractYouTubeId(videoUrl) || null
  );
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Fetch real YouTube videos from the author's tenant
  useEffect(() => {
    let isMounted = true;

    async function loadTenantVideos() {
      if (source === 'custom' && items && items.length > 0) {
        if (isMounted) {
          setResolvedVideos(items);
          if (!activeVideoId && items[0]) {
            setActiveVideoId(items[0].youtubeVideoId || items[0].videoUrl || null);
          }
        }
        return;
      }

      const collected: VideoGalleryItem[] = [];
      const seenIds = new Set<string>();

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
              if (seenIds.has(ytId)) return;
              seenIds.add(ytId);

              collected.push({
                id: `tube_${docSnap.id}`,
                title: d.seoTitle || d.title || 'סרטון YouTube מהטננט',
                subtitle: d.category || 'וידאו',
                description: d.summary || d.metaDescription || '',
                youtubeVideoId: ytId,
                videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
                thumbnailUrl: d.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
                viewsCount: Number(d.viewsCount || 150),
                publishedAt: d.publishedAt || d.createdAt || '',
                category: d.category || 'YouTube',
              });
            });
          } catch {
            // Ignore if collection not present
          }
        }

        // 2. Secondary source: Tenant PageBuilder pages dedicated to KOSVIDIO / YouTube
        try {
          const allPages = await pageBuilderFirestore.getAllPages(db, effTenant);
          const videoPages = (allPages || []).filter((p) => {
            if (!p || p.isHomePage) return false;
            const pageId = String(p.pageId || '');
            const slugLower = String(p.slug || '').toLowerCase();
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
            if (seenIds.has(ytId)) continue;
            seenIds.add(ytId);

            collected.push({
              id: p.pageId || `page_${p.slug}`,
              title: p.pageTitle || kosvidioSec?.title || 'סרטון ערוץ',
              subtitle: p.slug || 'YouTube Video',
              description: kosvidioSec?.description || '',
              youtubeVideoId: ytId,
              videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
              thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
              category: 'YouTube',
            });
          }
        } catch {
          // Ignore
        }

        if (isMounted) {
          const finalVideos = collected.slice(0, maxVideos);
          setResolvedVideos(finalVideos);

          if (!activeVideoId) {
            if (selectedVideoId) {
              setActiveVideoId(selectedVideoId);
            } else if (finalVideos.length > 0) {
              setActiveVideoId(finalVideos[0].youtubeVideoId || finalVideos[0].videoUrl || null);
            } else if (videoUrl) {
              setActiveVideoId(videoUrl);
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching tenant videos for videoGallery:', err);
      }
    }

    loadTenantVideos();

    return () => {
      isMounted = false;
    };
  }, [db, effTenant, isMaster, source, maxVideos]);

  // Handle active video selection
  const currentVideoItem = useMemo(() => {
    return (
      resolvedVideos.find(
        (v) => v.youtubeVideoId === activeVideoId || v.videoUrl === activeVideoId
      ) || null
    );
  }, [resolvedVideos, activeVideoId]);

  const effectiveEmbedUrl = useMemo(() => {
    const raw = activeVideoId || videoUrl;
    return getEmbedUrl(raw, isAutoPlaying);
  }, [activeVideoId, videoUrl, isAutoPlaying]);

  // Sizing helpers
  const getHeadingScaleClass = (defaultClass: string) => {
    if (objectScale === 'compact') return 'text-2xl sm:text-3xl';
    if (objectScale === 'normal') return 'text-3xl sm:text-4xl';
    if (objectScale === 'large') return 'text-3xl sm:text-5xl';
    if (objectScale === 'massive') return 'text-4xl sm:text-6xl';
    return defaultClass;
  };

  const getButtonShapeClass = (defaultRadius: string) => {
    if (buttonShape === 'pill') return 'rounded-full';
    if (buttonShape === 'rounded') return 'rounded-2xl';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'chiseled') return 'rounded-lg';
    return defaultRadius;
  };

  const getButtonSizeClass = (defaultSize: string) => {
    if (buttonSize === 'sm') return 'px-4 py-2 text-xs';
    if (buttonSize === 'md') return 'px-5 py-2.5 text-xs sm:text-sm';
    if (buttonSize === 'lg') return 'px-7 py-3 text-sm sm:text-base';
    if (buttonSize === 'xl') return 'px-9 py-4 text-base sm:text-lg';
    return defaultSize;
  };

  // Text Background Overlay & Effects
  const effectiveBgImage =
    textBgImageUrl ||
    'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1600&q=80';
  const overlayAlpha = Math.min(95, Math.max(10, textBgOverlayOpacity ?? 75)) / 100;

  const defaultOverlayHex = (() => {
    if (textBgOverlayColor && textBgOverlayColor !== 'transparent') return textBgOverlayColor;
    switch (normalizedLayout) {
      case 'feminine':
        return '#250d18';
      case 'masculine':
        return '#090a0f';
      case 'spiritual':
        return '#061614';
      case 'sharp':
        return '#050505';
      case 'analytical':
        return '#050e1c';
      default:
        return '#0f172a';
    }
  })();

  const renderTextBgLayer = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src={effectiveBgImage}
        alt="Text backdrop"
        className={clsx(
          'w-full h-full object-cover transition-all ease-out',
          textBgEffect === 'zoom-glow' && 'duration-1000 group-hover/textbg:scale-110',
          textBgEffect === 'shimmer-sweep' && 'duration-700 group-hover/textbg:scale-105',
          textBgEffect === 'float-parallax' &&
            'duration-700 scale-105 group-hover/textbg:scale-110 group-hover/textbg:-translate-y-2',
          textBgEffect === 'blur-reveal' &&
            'duration-700 blur-[3px] scale-105 group-hover/textbg:blur-0 group-hover/textbg:scale-100',
          textBgEffect === 'gradient-shift' &&
            'duration-1000 group-hover/textbg:scale-105 group-hover/textbg:rotate-1'
        )}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover/textbg:opacity-85"
        style={{
          backgroundColor: defaultOverlayHex,
          opacity: overlayAlpha,
        }}
      />
      {textBgEffect === 'shimmer-sweep' && (
        <div className="absolute inset-0 -translate-x-full group-hover/textbg:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      )}
      {textBgEffect === 'zoom-glow' && (
        <div className="absolute inset-0 opacity-0 group-hover/textbg:opacity-100 transition-opacity duration-700 bg-radial from-white/15 via-transparent to-transparent" />
      )}
      {textBgEffect === 'gradient-shift' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-transparent to-amber-500/30 opacity-40 group-hover/textbg:opacity-80 transition-opacity duration-700" />
      )}
      {textBgEffect === 'float-parallax' && (
        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 group-hover/textbg:ring-white/50 transition-all duration-700" />
      )}
    </div>
  );

  const wrapTextWithOptionalBg = (content: React.ReactNode, cardRadiusClass = 'rounded-3xl') => {
    if (!textBgEnabled || textBgScope === 'full-section') {
      return content;
    }
    return (
      <div
        className={clsx(
          'relative overflow-hidden p-6 sm:p-10 transition-all duration-500 shadow-2xl border border-white/15 group/textbg w-full',
          cardRadiusClass
        )}
      >
        {renderTextBgLayer()}
        <div className="relative z-10">{content}</div>
      </div>
    );
  };

  // ============================================================================
  // א. פריסה בסגנון נשי (Feminine Style - Soft, Rose-Gold, Capsule Pills)
  // ============================================================================
  if (normalizedLayout === 'feminine') {
    return (
      <section
        id={anchorId || 'videoGallery'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#fff9fb] via-[#fdf2f6] to-[#fcf6f0] dark:from-[#160c12] dark:via-[#1e1018] dark:to-[#120b0f] transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute -top-16 right-12 w-[340px] h-[340px] bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-800 dark:text-rose-200 text-xs font-medium w-fit">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400/40" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              {title && (
                <h2
                  className={clsx(
                    getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                    'font-bold tracking-normal leading-[1.25]',
                    textBgEnabled ? 'text-white' : 'text-rose-950 dark:text-rose-50'
                  )}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
              )}
            </div>,
            'rounded-[2.5rem]'
          )}

          {/* Video Player Box */}
          <div
            className="w-full bg-white/90 dark:bg-rose-950/40 rounded-[2.5rem] overflow-hidden border border-rose-200/80 dark:border-rose-800/50 shadow-2xl shadow-rose-200/20 relative backdrop-blur-md"
            style={{ height: desktopHeight }}
          >
            {effectiveEmbedUrl ? (
              <iframe
                src={effectiveEmbedUrl}
                title={currentVideoItem?.title || title || 'YouTube Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-rose-400">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-sm font-medium">לא נמצאו סרטוני וידאו להצגה</span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {showThumbnails && resolvedVideos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {resolvedVideos.map((vid) => {
                const isSelected =
                  activeVideoId === vid.youtubeVideoId || activeVideoId === vid.videoUrl;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setActiveVideoId(vid.youtubeVideoId || vid.videoUrl || null);
                      setIsAutoPlaying(true);
                    }}
                    style={{ backgroundColor: cardBackgroundColor }}
                    className={clsx(
                      'rounded-[2rem] overflow-hidden border p-2 text-right transition-all flex flex-col gap-2 cursor-pointer backdrop-blur-md',
                      isSelected
                        ? 'border-rose-400 bg-white dark:bg-rose-950/60 shadow-lg shadow-rose-300/30 ring-2 ring-rose-400/50 scale-[1.02]'
                        : 'border-rose-200/80 dark:border-rose-900/40 bg-white/70 dark:bg-rose-950/20 hover:border-rose-300 hover:scale-[1.01]'
                    )}
                  >
                    <div className="rounded-2xl overflow-hidden aspect-video relative bg-rose-100 dark:bg-rose-900/40">
                      {vid.thumbnailUrl && (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-rose-950/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="px-1 truncate">
                      <div className="font-bold text-xs text-rose-950 dark:text-rose-100 truncate">
                        {vid.title}
                      </div>
                      <div className="text-[10px] text-rose-600/80 dark:text-rose-300/70 truncate mt-0.5">
                        {vid.subtitle || 'סרטון YouTube'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {ctaButtonText && (
            <div className="flex justify-center pt-2">
              <a
                href={ctaButtonUrl || '/kosvidio'}
                className={clsx(
                  'inline-flex items-center gap-2 bg-gradient-to-l from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold transition-all shadow-lg shadow-rose-400/30',
                  getButtonShapeClass('rounded-full'),
                  getButtonSizeClass('px-7 py-3 text-sm')
                )}
              >
                <Youtube className="w-4 h-4" />
                <span>{ctaButtonText}</span>
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ב. פריסה בסגנון גברי (Masculine Style - Bold, Charcoal, Gold & Steel)
  // ============================================================================
  if (normalizedLayout === 'masculine') {
    return (
      <section
        id={anchorId || 'videoGallery'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#0c0d12] via-[#12131a] to-[#090a0e] dark:from-[#06070a] dark:via-[#090a0f] dark:to-[#040507] text-white transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wider uppercase w-fit">
                  <Shield className="w-3.5 h-3.5" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              {title && (
                <h2
                  className={clsx(
                    getHeadingScaleClass('text-3xl sm:text-5xl md:text-6xl'),
                    'font-black tracking-tight leading-none text-white'
                  )}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
              )}
            </div>,
            'rounded-2xl'
          )}

          {/* Video Player Box */}
          <div
            className="w-full bg-zinc-950 rounded-2xl overflow-hidden border-2 border-zinc-700/80 shadow-2xl shadow-black relative"
            style={{ height: desktopHeight }}
          >
            {effectiveEmbedUrl ? (
              <iframe
                src={effectiveEmbedUrl}
                title={currentVideoItem?.title || title || 'YouTube Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
                <div className="w-16 h-16 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-sm font-bold uppercase">אין סרטונים זמינים</span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {showThumbnails && resolvedVideos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {resolvedVideos.map((vid) => {
                const isSelected =
                  activeVideoId === vid.youtubeVideoId || activeVideoId === vid.videoUrl;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setActiveVideoId(vid.youtubeVideoId || vid.videoUrl || null);
                      setIsAutoPlaying(true);
                    }}
                    style={{ backgroundColor: cardBackgroundColor }}
                    className={clsx(
                      'rounded-xl overflow-hidden border-2 p-2 text-right transition-all flex flex-col gap-2 cursor-pointer',
                      isSelected
                        ? 'border-amber-400 bg-zinc-900 shadow-xl shadow-amber-500/15 scale-[1.02]'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:scale-[1.01]'
                    )}
                  >
                    <div className="rounded-lg overflow-hidden aspect-video relative bg-zinc-900">
                      {vid.thumbnailUrl && (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black shadow-md">
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="px-1 truncate">
                      <div className="font-black text-xs text-white truncate">{vid.title}</div>
                      <div className="text-[10px] text-amber-400 font-bold uppercase truncate mt-0.5">
                        {vid.category || 'HD VIDEO'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {ctaButtonText && (
            <div className="flex justify-center pt-2">
              <a
                href={ctaButtonUrl || '/kosvidio'}
                className={clsx(
                  'inline-flex items-center gap-2 bg-gradient-to-l from-amber-500 via-amber-400 to-yellow-500 text-black font-black uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 hover:brightness-110',
                  getButtonShapeClass('rounded-xl'),
                  getButtonSizeClass('px-8 py-3 text-sm')
                )}
              >
                <Youtube className="w-4 h-4" />
                <span>{ctaButtonText}</span>
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ד. פריסה רוחנית (Spiritual Style - Serene Sage, Turquoise, Sacred Harmony)
  // ============================================================================
  if (normalizedLayout === 'spiritual') {
    return (
      <section
        id={anchorId || 'videoGallery'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#f6faf8] via-[#eef6f3] to-[#f4f8f6] dark:from-[#061614] dark:via-[#0a1f1c] dark:to-[#04100e] transition-colors duration-700 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}
        <div className="absolute top-10 right-1/4 w-[360px] h-[360px] bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-500/15 border border-teal-300 dark:border-teal-400/30 text-teal-800 dark:text-teal-200 text-xs font-normal w-fit">
                  <Sun className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              {title && (
                <h2
                  className={clsx(
                    getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                    'font-light sm:font-normal tracking-wide text-teal-950 dark:text-teal-50'
                  )}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
              )}
            </div>,
            'rounded-[2.5rem]'
          )}

          {/* Video Player Box */}
          <div
            className="w-full bg-white/90 dark:bg-teal-950/40 rounded-[2.5rem] overflow-hidden border border-teal-200/80 dark:border-teal-800/40 shadow-xl shadow-teal-900/10 relative backdrop-blur-md"
            style={{ height: desktopHeight }}
          >
            {effectiveEmbedUrl ? (
              <iframe
                src={effectiveEmbedUrl}
                title={currentVideoItem?.title || title || 'YouTube Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-teal-600/70">
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-600 flex items-center justify-center">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-sm font-medium">לא נבחרו סרטונים</span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {showThumbnails && resolvedVideos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {resolvedVideos.map((vid) => {
                const isSelected =
                  activeVideoId === vid.youtubeVideoId || activeVideoId === vid.videoUrl;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setActiveVideoId(vid.youtubeVideoId || vid.videoUrl || null);
                      setIsAutoPlaying(true);
                    }}
                    style={{ backgroundColor: cardBackgroundColor }}
                    className={clsx(
                      'rounded-[2rem] overflow-hidden border p-2 text-right transition-all flex flex-col gap-2 cursor-pointer backdrop-blur-md duration-500',
                      isSelected
                        ? 'border-teal-400 bg-white dark:bg-teal-950/50 shadow-lg shadow-teal-700/20 ring-2 ring-teal-400/50 scale-[1.02]'
                        : 'border-teal-200/70 dark:border-teal-800/40 bg-white/70 dark:bg-teal-950/20 hover:border-teal-300'
                    )}
                  >
                    <div className="rounded-2xl overflow-hidden aspect-video relative bg-teal-100 dark:bg-teal-900/40">
                      {vid.thumbnailUrl && (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-teal-950/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-teal-700 flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="px-1 truncate">
                      <div className="font-medium text-xs text-teal-950 dark:text-teal-100 truncate">
                        {vid.title}
                      </div>
                      <div className="text-[10px] text-teal-700/70 dark:text-teal-300/70 truncate mt-0.5">
                        {vid.subtitle || 'סרטון השראה'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {ctaButtonText && (
            <div className="flex justify-center pt-2">
              <a
                href={ctaButtonUrl || '/kosvidio'}
                className={clsx(
                  'inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium transition-all shadow-lg shadow-teal-600/20 duration-700',
                  getButtonShapeClass('rounded-full'),
                  getButtonSizeClass('px-8 py-3 text-sm')
                )}
              >
                <Youtube className="w-4 h-4" />
                <span>{ctaButtonText}</span>
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ה. פריסה חדה (Sharp Style - Brutalist, 90° Angles, Hard Shadows)
  // ============================================================================
  if (normalizedLayout === 'sharp') {
    return (
      <section
        id={anchorId || 'videoGallery'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#fafafa] dark:bg-[#050505] text-black dark:text-white transition-colors duration-300 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-mono uppercase text-xs font-bold w-fit">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                </div>
              )}
              {title && (
                <h2
                  className={clsx(
                    getHeadingScaleClass('text-3xl sm:text-5xl md:text-6xl'),
                    'font-black tracking-tight uppercase'
                  )}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
              )}
            </div>,
            'rounded-none'
          )}

          {/* Video Player Box */}
          <div
            className="w-full bg-white dark:bg-black rounded-none overflow-hidden border-2 border-black dark:border-white shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#6366f1] relative"
            style={{ height: desktopHeight }}
          >
            {effectiveEmbedUrl ? (
              <iframe
                src={effectiveEmbedUrl}
                title={currentVideoItem?.title || title || 'YouTube Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-500 font-mono">
                <div className="w-16 h-16 rounded-none bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-xs uppercase">[NO_VIDEO_LOADED]</span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {showThumbnails && resolvedVideos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {resolvedVideos.map((vid) => {
                const isSelected =
                  activeVideoId === vid.youtubeVideoId || activeVideoId === vid.videoUrl;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setActiveVideoId(vid.youtubeVideoId || vid.videoUrl || null);
                      setIsAutoPlaying(true);
                    }}
                    style={{ backgroundColor: cardBackgroundColor }}
                    className={clsx(
                      'rounded-none overflow-hidden border-2 p-2 text-right transition-transform flex flex-col gap-2 cursor-pointer',
                      isSelected
                        ? 'border-black dark:border-white bg-white dark:bg-black shadow-[5px_5px_0px_#6366f1] -translate-x-1'
                        : 'border-black dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#333] hover:-translate-x-0.5'
                    )}
                  >
                    <div className="rounded-none overflow-hidden aspect-video relative bg-zinc-200 dark:bg-zinc-900 border border-black dark:border-zinc-700">
                      {vid.thumbnailUrl && (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-none bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-md">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="px-1 truncate">
                      <div className="font-black text-xs font-mono uppercase truncate">{vid.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                        {vid.category || 'YOUTUBE'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {ctaButtonText && (
            <div className="flex justify-center pt-2">
              <a
                href={ctaButtonUrl || '/kosvidio'}
                className={clsx(
                  'inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-black uppercase shadow-[4px_4px_0px_#6366f1] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform',
                  getButtonShapeClass('rounded-none'),
                  getButtonSizeClass('px-8 py-3 text-sm')
                )}
              >
                <Youtube className="w-4 h-4" />
                <span>{ctaButtonText}</span>
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ו. פריסה אנליטית (Analytical Style - Data HUD, Live Telemetry SLA)
  // ============================================================================
  if (normalizedLayout === 'analytical') {
    return (
      <section
        id={anchorId || 'videoGallery'}
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#070e1b] via-[#0b1528] to-[#040812] text-white transition-colors duration-500 group/textbg"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

        {/* Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#06b6d4 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
          {wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs w-fit">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span style={{ color: subtitleColor }}>{subtitle}</span>
                  <span className="text-[10px] text-emerald-400 font-bold border-r border-cyan-500/30 pr-2 mr-1">
                    [STREAM // 4K]
                  </span>
                </div>
              )}
              {title && (
                <h2
                  className={clsx(
                    getHeadingScaleClass('text-3xl sm:text-4xl md:text-5xl'),
                    'font-bold tracking-tight text-white font-mono'
                  )}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
              )}

              {/* Telemetry live status strip */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-cyan-300/80 pt-1 border-t border-cyan-500/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                  <span>שידור וידאו פעיל</span>
                </span>
                <span>•</span>
                <span>איכות: 1080p / 4K UHD</span>
                <span>•</span>
                <span>סנכרון ישיר מ-YouTube</span>
              </div>
            </div>,
            'rounded-2xl'
          )}

          {/* Video Player Box */}
          <div
            className="w-full bg-[#091322]/95 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 relative backdrop-blur-md"
            style={{ height: desktopHeight }}
          >
            {effectiveEmbedUrl ? (
              <iframe
                src={effectiveEmbedUrl}
                title={currentVideoItem?.title || title || 'YouTube Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-cyan-500 font-mono">
                <div className="w-16 h-16 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-xs uppercase">[TELEMETRY_NO_FEED]</span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {showThumbnails && resolvedVideos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {resolvedVideos.map((vid) => {
                const isSelected =
                  activeVideoId === vid.youtubeVideoId || activeVideoId === vid.videoUrl;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setActiveVideoId(vid.youtubeVideoId || vid.videoUrl || null);
                      setIsAutoPlaying(true);
                    }}
                    style={{ backgroundColor: cardBackgroundColor }}
                    className={clsx(
                      'rounded-xl overflow-hidden border p-2 text-right transition-all flex flex-col gap-2 cursor-pointer backdrop-blur-md',
                      isSelected
                        ? 'border-cyan-400 bg-[#091322] shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400 scale-[1.02]'
                        : 'border-cyan-900/40 bg-[#050b14]/80 hover:border-cyan-500/50 hover:scale-[1.01]'
                    )}
                  >
                    <div className="rounded-lg overflow-hidden aspect-video relative bg-[#091322] border border-cyan-900/60">
                      {vid.thumbnailUrl && (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-[#050b14]/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="px-1 truncate">
                      <div className="font-bold text-xs text-cyan-50 font-mono truncate">{vid.title}</div>
                      <div className="text-[10px] text-cyan-400/70 font-mono truncate mt-0.5">
                        [ID: {vid.youtubeVideoId || 'VIDEO'}]
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {ctaButtonText && (
            <div className="flex justify-center pt-2">
              <a
                href={ctaButtonUrl || '/kosvidio'}
                className={clsx(
                  'inline-flex items-center gap-2 bg-gradient-to-l from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold transition-all shadow-xl shadow-cyan-500/25',
                  getButtonShapeClass('rounded-xl'),
                  getButtonSizeClass('px-8 py-3 text-sm')
                )}
              >
                <Youtube className="w-4 h-4" />
                <span>{ctaButtonText}</span>
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // ג. הפריסה העכשווית (Standard / Current - Notion / SaaS 2026 Style)
  // ============================================================================
  return (
    <section
      id={anchorId || 'videoGallery'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden group/textbg transition-colors duration-300"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {textBgEnabled && textBgScope === 'full-section' && renderTextBgLayer()}

      <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
        {(title || subtitle) &&
          wrapTextWithOptionalBg(
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-2">
              {subtitle && (
                <span
                  className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"
                  style={{ color: subtitleColor }}
                >
                  {subtitle}
                </span>
              )}
              {title && (
                <h2
                  className={clsx(
                    getHeadingScaleClass('text-3xl sm:text-4xl font-extrabold tracking-tight'),
                    textBgEnabled ? 'text-white' : 'text-slate-900 dark:text-white'
                  )}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
              )}
            </div>,
            'rounded-3xl'
          )}

        {/* Video Player Box */}
        <div
          className="w-full bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative"
          style={{ height: desktopHeight }}
        >
          {effectiveEmbedUrl ? (
            <iframe
              src={effectiveEmbedUrl}
              title={currentVideoItem?.title || title || 'YouTube Video Player'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Play className="w-8 h-8 ml-1" />
              </div>
              <span className="text-sm font-medium">לא הוגדר קישור וידאו</span>
            </div>
          )}
        </div>

        {/* Thumbnails grid */}
        {showThumbnails && resolvedVideos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {resolvedVideos.map((vid) => {
              const isSelected =
                activeVideoId === vid.youtubeVideoId || activeVideoId === vid.videoUrl;
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => {
                    setActiveVideoId(vid.youtubeVideoId || vid.videoUrl || null);
                    setIsAutoPlaying(true);
                  }}
                  style={{ backgroundColor: cardBackgroundColor }}
                  className={clsx(
                    'rounded-2xl overflow-hidden border p-2 text-right transition-all flex flex-col gap-2 cursor-pointer',
                    isSelected
                      ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/40 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-indigo-400 hover:scale-[1.01]'
                  )}
                >
                  <div className="rounded-xl overflow-hidden aspect-video relative bg-slate-200 dark:bg-slate-800">
                    {vid.thumbnailUrl && (
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-md">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="px-1 truncate">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {vid.title}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {vid.subtitle || 'סרטון YouTube'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {ctaButtonText && (
          <div className="flex justify-center pt-2">
            <a
              href={ctaButtonUrl || '/kosvidio'}
              className={clsx(
                'inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xl shadow-indigo-600/30',
                getButtonShapeClass('rounded-xl'),
                getButtonSizeClass('px-7 py-3 text-sm')
              )}
            >
              <Youtube className="w-4 h-4" />
              <span>{ctaButtonText}</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
