import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { PageBuilderContract, BrandDnaContract, SYSTEM_COLLECTIONS } from '../../../core/contracts';
import { ROOT_TENANT_ID } from '../../../core/tenant';
import { getModuleYoutubeKey } from '../../../core/connection/tenantApiKeys';
import { doc, setDoc, getDoc, getDocs, collection, query, limit } from 'firebase/firestore';
import { KosTubeChannel, KosTubeVideo, KosTubeSeoPage } from '../types';
import { kosTubeFirestore } from '../services/kosTubeFirestore';
import { fetchYoutubeChannelData, generateAiSeoContent, fetchSingleYoutubeVideo } from '../api/functionsApi';
import { PLEASANT_KOS_TUBE_ERROR_HE } from '../config';
import { KosTubeAiMode, KosTubeAiGeneratedData } from '../../kosai-engine/modelsAiService';
import { KosTubePageSyncService } from '../services/kosTubePageSyncService';
import { eventBus } from '../../../core/bridge/EventBus';

export type KosTubeTab = 'overview' | 'videos' | 'pages' | 'settings';

export interface KosTubeGenerationOptions {
  mode?: KosTubeAiMode;
  includeBrand?: boolean;
  customText?: string;
  customSlug?: string;
}

export interface KosTubeContextValue {
  channel: KosTubeChannel | null;
  videos: KosTubeVideo[];
  seoPages: KosTubeSeoPage[];
  activeTab: KosTubeTab;
  setActiveTab: (tab: KosTubeTab) => void;
  isLoading: boolean;
  isSyncing: boolean;
  isGenerating: boolean;
  generatingVideoId: string | null;
  generationMode: KosTubeAiMode;
  isRootTenant: boolean;
  error: string | null;
  clearError: () => void;
  syncChannel: (query: string, apiKey?: string) => Promise<boolean>;
  addVideoByUrl: (url: string) => Promise<KosTubeVideo | null>;
  generateSeoPage: (video: KosTubeVideo, options?: KosTubeGenerationOptions) => Promise<KosTubeSeoPage | null>;
  generateAiContentOnly: (video: KosTubeVideo, options?: KosTubeGenerationOptions) => Promise<KosTubeAiGeneratedData | null>;
  saveAndDeployReviewedPage: (video: KosTubeVideo, reviewedData: KosTubeAiGeneratedData) => Promise<{ success: boolean; publicUrl?: string; error?: string }>;
  reviewModalData: { video: KosTubeVideo; aiData: KosTubeAiGeneratedData } | null;
  setReviewModalData: (data: { video: KosTubeVideo; aiData: KosTubeAiGeneratedData } | null) => void;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  openGenerationModal: (video: KosTubeVideo) => void;
  batchGenerateSeoPages: () => Promise<number>;
  deleteSeoPage: (pageId: string, videoId?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  selectedVideo: KosTubeVideo | null;
  setSelectedVideo: (v: KosTubeVideo | null) => void;
  selectedPage: KosTubeSeoPage | null;
  setSelectedPage: (p: KosTubeSeoPage | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  modalMode: 'channel_connect' | 'add_video' | 'video_detail' | 'page_preview' | 'schema_view' | 'generate_options';
  setModalMode: (mode: 'channel_connect' | 'add_video' | 'video_detail' | 'page_preview' | 'schema_view' | 'generate_options') => void;
}

const KosTubeContext = createContext<KosTubeContextValue | null>(null);

export const KosTubeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useSystemConnection();
  const { tenantId, isRootTenant } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const pageBuilder = getCapability<PageBuilderContract>('page-builder');

  const [channel, setChannel] = useState<KosTubeChannel | null>(null);
  const [videos, setVideos] = useState<KosTubeVideo[]>([]);
  const [seoPages, setSeoPages] = useState<KosTubeSeoPage[]>([]);
  const [activeTab, setActiveTab] = useState<KosTubeTab>('overview');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingVideoId, setGeneratingVideoId] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<KosTubeAiMode>('eco');
  const [error, setError] = useState<string | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<KosTubeVideo | null>(null);
  const [selectedPage, setSelectedPage] = useState<KosTubeSeoPage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'channel_connect' | 'add_video' | 'video_detail' | 'page_preview' | 'schema_view' | 'generate_options'>('channel_connect');
  const [reviewModalData, setReviewModalData] = useState<{ video: KosTubeVideo; aiData: KosTubeAiGeneratedData } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const clearError = useCallback(() => setError(null), []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedChannel, fetchedVideos, fetchedPages] = await Promise.all([
        kosTubeFirestore.getChannel(db, tenantId),
        kosTubeFirestore.getVideos(db, tenantId),
        kosTubeFirestore.getSeoPages(db, tenantId),
      ]);

      if (fetchedChannel) {
        setChannel(fetchedChannel);
      }
      if (fetchedVideos && fetchedVideos.length > 0) {
        setVideos(fetchedVideos);
      }
      if (fetchedPages) {
        setSeoPages(fetchedPages);
      }
    } catch (err: any) {
      console.warn('[KosTube] Error refreshing data:', err);
      setError(PLEASANT_KOS_TUBE_ERROR_HE);
    } finally {
      setIsLoading(false);
    }
  }, [db, tenantId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time bidirectional synchronization listener with PageBuilder
  useEffect(() => {
    if (!db) return;
    const unsubAutoSync = KosTubePageSyncService.initAutoSync(db);
    const unsubSynced = eventBus.subscribe('kostube:synced_from_page' as any, (data: any) => {
      if (data?.seoPage) {
        setSeoPages((prev) => {
          const filtered = prev.filter((p) => p.id !== data.seoPage.id);
          return [data.seoPage, ...filtered];
        });
      }
    });

    return () => {
      unsubAutoSync();
      unsubSynced();
    };
  }, [db]);

  const syncChannel = useCallback(
    async (query: string, apiKey?: string): Promise<boolean> => {
      if (!query || query.trim().length === 0) {
        setError('אנא הזן כתובת ערוץ או Handle תקין');
        return false;
      }
      setIsSyncing(true);
      setError(null);
      try {
        // Resolve YouTube Data API v3 key:
        // For subdomains, automatically inherit the Master tenant key!
        let effectiveApiKey = apiKey?.trim() || channel?.apiKey;

        if (!effectiveApiKey || !effectiveApiKey.startsWith('AIzaSy')) {
          // 1. Try in-memory module key inherited from master
          const mKey = getModuleYoutubeKey('KosTube');
          if (mKey && mKey.startsWith('AIzaSy')) {
            effectiveApiKey = mKey;
          }
        }

        if ((!effectiveApiKey || !effectiveApiKey.startsWith('AIzaSy')) && db) {
          // 2. Fetch directly from Master collection: tenants/_master/settings/api_keys
          try {
            const masterSnap = await getDoc(
              doc(db, 'tenants', ROOT_TENANT_ID, SYSTEM_COLLECTIONS.SETTINGS, 'api_keys')
            );
            if (masterSnap.exists()) {
              const mData = masterSnap.data();
              if (mData.youtubeApiKey && mData.youtubeApiKey.startsWith('AIzaSy')) {
                effectiveApiKey = mData.youtubeApiKey;
              } else if (mData.googleAiApiKey && mData.googleAiApiKey.startsWith('AIzaSy')) {
                effectiveApiKey = mData.googleAiApiKey;
              }
            }
          } catch (e) {
            console.warn('[KosTube] Could not read master api_keys:', e);
          }
        }

        // 3. Check Master channel document directly: tenants/_master/mod_kos_tube_channels
        if ((!effectiveApiKey || !effectiveApiKey.startsWith('AIzaSy')) && db) {
          try {
            const masterChan = await kosTubeFirestore.getChannel(db, ROOT_TENANT_ID);
            if (masterChan?.apiKey && masterChan.apiKey.startsWith('AIzaSy')) {
              effectiveApiKey = masterChan.apiKey;
            }
          } catch (e) {
            console.warn('[KosTube] Could not read master channel apiKey:', e);
          }
        }

        if ((!effectiveApiKey || !effectiveApiKey.startsWith('AIzaSy')) && db) {
          // 4. Fallback to master kostube doc: tenants/_master/settings/kostube
          try {
            const masterTubeSnap = await getDoc(
              doc(db, 'tenants', ROOT_TENANT_ID, SYSTEM_COLLECTIONS.SETTINGS, 'kostube')
            );
            if (masterTubeSnap.exists()) {
              const tData = masterTubeSnap.data();
              if (tData?.apiKey && tData.apiKey.startsWith('AIzaSy')) {
                effectiveApiKey = tData.apiKey;
              }
            }
          } catch (e) {}
        }

        const { channel: syncedChannel, videos: syncedVideos } = await fetchYoutubeChannelData({
          query,
          apiKey: effectiveApiKey,
        });

        await kosTubeFirestore.saveChannel(db, tenantId, syncedChannel);
        await kosTubeFirestore.replaceVideos(db, tenantId, syncedVideos);

        // If master tenant saved a key, persist it to Master settings so all subdomains inherit it!
        if (isRootTenant && effectiveApiKey && db) {
          try {
            await setDoc(
              doc(db, 'tenants', ROOT_TENANT_ID, SYSTEM_COLLECTIONS.SETTINGS, 'api_keys'),
              { youtubeApiKey: effectiveApiKey },
              { merge: true }
            );
            await setDoc(
              doc(db, 'tenants', ROOT_TENANT_ID, SYSTEM_COLLECTIONS.SETTINGS, 'kostube'),
              { apiKey: effectiveApiKey },
              { merge: true }
            );
          } catch (e) {
            console.warn('[KosTube] Could not persist key to master settings:', e);
          }
        }

        setChannel(syncedChannel);
        setVideos(syncedVideos);
        await refreshData();
        setIsModalOpen(false);
        return true;
      } catch (err: any) {
        console.error('[KosTube] syncChannel failed:', err);
        setError(err?.message || PLEASANT_KOS_TUBE_ERROR_HE);
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [db, tenantId, isRootTenant, channel?.apiKey]
  );

  const addVideoByUrl = useCallback(
    async (url: string): Promise<KosTubeVideo | null> => {
      setError(null);
      try {
        const video = await fetchSingleYoutubeVideo(url, channel?.channelId || 'custom_channel');
        await kosTubeFirestore.saveVideos(db, tenantId, [video]);
        setVideos((prev) => {
          const filtered = prev.filter((v) => v.id !== video.id);
          return [video, ...filtered];
        });
        setIsModalOpen(false);
        return video;
      } catch (err: any) {
        console.error('[KosTube] addVideoByUrl failed:', err);
        setError(err?.message || 'שגיאה בהוספת הסרטון. אנא ודא שהקישור תקין.');
        return null;
      }
    },
    [db, tenantId, channel?.channelId]
  );

  const openGenerationModal = useCallback((video: KosTubeVideo) => {
    setSelectedVideo(video);
    setModalMode('generate_options');
    setIsModalOpen(true);
  }, []);

  const generateSeoPage = useCallback(
    async (video: KosTubeVideo, options?: KosTubeGenerationOptions): Promise<KosTubeSeoPage | null> => {
      const effMode = options?.mode || 'eco';
      const effIncludeBrand = options?.includeBrand !== false;
      const customText = options?.customText;

      setIsGenerating(true);
      setGeneratingVideoId(video.id);
      setGenerationMode(effMode);
      setError(null);
      try {
        let brandDna: any = null;
        if (effIncludeBrand) {
          try {
            const brandCap = getCapability<BrandDnaContract>('brand-dna');
            if (brandCap?.getBrandDna) {
              brandDna = brandCap.getBrandDna();
            }
            if (!brandDna && db) {
              const bSnap = await getDoc(
                doc(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC)
              );
              if (bSnap.exists()) {
                brandDna = bSnap.data();
              }
            }
          } catch (e) {
            console.warn('[KosTube] Could not load brand DNA:', e);
          }
        }

        const res = await generateAiSeoContent({
          video,
          channelTitle: channel?.title || 'ערוץ יוטיוב',
          brandDna,
          mode: effMode,
          includeBrand: effIncludeBrand,
          customText,
          tenantId: tenantId || '_master',
        });

        if (!res.success || !res.data) {
          setError(res.error || PLEASANT_KOS_TUBE_ERROR_HE);
          return null;
        }

        const pageId = `page_${video.youtubeVideoId}`;
        const cleanVidId = (video.youtubeVideoId || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        const rawSlugCandidate = options?.customSlug || res.data?.slug || cleanVidId;
        const slug = rawSlugCandidate
          .trim()
          .toLowerCase()
          .replace(/^https?:\/\/[^/]+/i, '')
          .replace(/^\/?(p|to|page)\//i, '')
          .replace(/^\/?kosvidio[-/]/i, '')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '') || cleanVidId || 'video';

        let publicUrl = `/kosvidio/${slug}`;
        let pbPageId = `page_kosvidio_${video.youtubeVideoId}`;

        const brandCompanyName = (effIncludeBrand && brandDna?.identity?.companyName) ? brandDna.identity.companyName : 'קושאן';
        const brandLogo = (effIncludeBrand && brandDna?.identity?.logoUrl) ? brandDna.identity.logoUrl : '';
        const brandSlogan = (effIncludeBrand && brandDna?.identity?.slogan) ? brandDna.identity.slogan : 'וידאו חכם ומאמרי SEO מעמיקים';
        const primaryColor = brandDna?.designTokens?.primaryColor || '#ef4444';
        const secondaryColor = brandDna?.designTokens?.secondaryColor || '#8b5cf6';
        const whatsapp = brandDna?.trust?.whatsappSupportNumber || '';
        const phone = brandDna?.trust?.contactPhone || '';
        const email = brandDna?.trust?.contactEmail || '';

        // 1. Connect to PageBuilder capability if available
        if (pageBuilder?.createPageFromVideo) {
          try {
            const pbRes = await pageBuilder.createPageFromVideo({
              video,
              channelTitle: channel?.title || 'ערוץ יוטיוב',
              brandDna,
              aiData: { ...res.data, slug },
              channelVideos: videos,
              customSlug: slug,
            });
            if (pbRes.success) {
              pbPageId = pbRes.pageId;
              publicUrl = pbRes.publicUrl;
            }
          } catch (pbErr) {
            console.warn('[KosTube] pageBuilder capability call warning:', pbErr);
          }
        } else if (db) {
          // 2. Direct save to SYSTEM_COLLECTIONS.PAGES conforming to Kosvidio blueprint
          try {
            const effTenant = tenantId || '_master';
            const collPath = effTenant === '_master'
              ? `tenants/_master/${SYSTEM_COLLECTIONS.PAGES}`
              : `tenants/${effTenant}/${SYSTEM_COLLECTIONS.PAGES}`;

            const articleHtml = (res.data.articleContent || '')
              .split('\n\n')
              .map((p: string) => {
                const trimmed = p.trim();
                if (!trimmed) return '';
                if (trimmed.startsWith('### ')) return `<h3 class="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">${trimmed.replace(/^###\s*/, '')}</h3>`;
                if (trimmed.startsWith('## ')) return `<h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4">${trimmed.replace(/^##\s*/, '')}</h2>`;
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                  const items = trimmed.split('\n').map(li => `<li class="mr-4 list-disc text-slate-700 dark:text-slate-300 my-1">${li.replace(/^[\*\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('');
                  return `<ul class="my-3 space-y-1">${items}</ul>`;
                }
                const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
                return `<p class="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-4">${withBold}</p>`;
              })
              .join('');

            const fallbackFaqItems = Array.isArray(res.data.faqs) && res.data.faqs.length > 0
              ? res.data.faqs.map((f: any, idx: number) => ({
                  id: String(idx + 1),
                  question: f.question || '',
                  answer: f.answer || '',
                }))
              : [];

            const fallbackGalleryItems = videos.map((v, i) => ({
              id: v.id || `vid-${i}`,
              title: v.title,
              subtitle: channel?.title || brandCompanyName,
              description: v.description?.slice(0, 140) || '',
              youtubeVideoId: v.youtubeVideoId,
              thumbnailUrl: v.thumbnailUrl,
              kosvidioSlug: 'kosvidio',
              duration: v.duration || '',
              viewsCount: Number(v.viewCount || 0),
              likesCount: Number(v.likeCount || 0),
              category: 'סרטוני הערוץ',
              tags: ['וידאו', 'יוטיוב'],
              featured: i === 0,
            }));

            const pageConfig = {
              pageId: pbPageId,
              pageTitle: `${res.data.h1 || video.title} - Kosvidio`,
              pageCategory: 'youtube_post',
              slug,
              shortSlug: slug,
              publicUrl,
              published: true,
              isHomePage: false,
              viewsCount: 0,
              leadsCount: 0,
              globalSettings: {
                siteTitle: `${res.data.h1 || video.title} | ${brandCompanyName}`,
                companyName: brandCompanyName,
                slogan: brandSlogan,
                theme: 'dark',
                headerLayout: 'capsule-floating',
                headerSticky: true,
                isHeaderVisible: true,
                isFooterVisible: true,
                primaryColor,
                secondaryColor,
                backgroundColor: '#090a0f',
                textColor: '#f8fafc',
                fontFamily: 'Heebo, sans-serif',
                borderRadius: 'lg',
                buttonStyle: 'gradient',
                contactWhatsApp: whatsapp,
                contactPhone: phone,
                contactEmail: email,
                siteLogoUrl: brandLogo,
              },
              seoSettings: {
                title: res.data.metaTitle || video.title,
                description: res.data.metaDescription || video.description.slice(0, 160),
                keywords: res.data.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
              },
              sectionOrder: [
                'header-1',
                'kosvidio-1',
                'videoEngagement-1',
                'about-1',
                'sec-takeaways',
                'faq-1',
                'sec-cta',
                'kosvidioGallery-1',
              ],
              sections: {
                'header-1': {
                  type: 'header',
                  id: 'header-1',
                  visible: true,
                  layout: 'capsule-floating',
                  title: brandCompanyName,
                  showLogoText: true,
                  logoText: brandCompanyName,
                  useBrandLogo: Boolean(brandLogo),
                  customLogoUrl: brandLogo,
                  sticky: true,
                },
                'kosvidio-1': {
                  type: 'kosvidio',
                  id: 'kosvidio-1',
                  visible: true,
                  anchorId: 'kosvidio',
                  youtubeVideoId: video.youtubeVideoId,
                  title: res.data.h1 || video.title,
                  channelName: channel?.title || 'ערוץ יוטיוב',
                  channelAvatarUrl: video.thumbnailUrl,
                  viewsCount: Number(video.viewCount || 0),
                  likesCount: Number(video.likeCount || 0),
                  ambientGlow: true,
                  showTheaterMode: true,
                  enableSocialShare: true,
                },
                'videoEngagement-1': {
                  type: 'videoEngagement',
                  id: 'videoEngagement-1',
                  visible: true,
                  anchorId: 'engagement',
                  viewsCount: Number(video.viewCount || 0),
                  likesCount: Number(video.likeCount || 0),
                  commentsCount: 0,
                  comments: [],
                  enableShare: true,
                  enableLikes: true,
                },
                'about-1': {
                  type: 'richContent',
                  id: 'about-1',
                  visible: true,
                  anchorId: 'about',
                  heading: res.data.h1 || 'אודות וניתוח תוכן מקצועי',
                  subtitle: brandCompanyName,
                  body: `<div class="kosvidio-rich-content space-y-4 font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                    ${res.data.executiveSummary ? `<div class="p-5 mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium leading-relaxed shadow-sm"><div class="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">תמצית התוכן והסרטון:</div>${res.data.executiveSummary}</div>` : ''}
                    ${articleHtml}
                  </div>`,
                  layout: 'highlight-box',
                },
                'sec-takeaways': {
                  type: 'richContent',
                  id: 'sec-takeaways',
                  visible: (res.data.keyTakeaways || []).length > 0,
                  anchorId: 'takeaways',
                  heading: 'תובנות מרכזיות ונקודות מפתח',
                  subtitle: 'עיקרי הדברים והמסקנות החשובות מתוך הסרטון',
                  body: `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${(res.data.keyTakeaways || [])
                      .map(
                        (t: any, idx: number) => {
                          const title = typeof t === 'object' && t?.title ? t.title : '';
                          const text = typeof t === 'object' && t?.text ? t.text : String(t);
                          return `
                      <div class="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm shadow-md flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                          <span class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">${idx + 1}</span>
                          ${title ? `<span class="text-sm font-bold text-white">${title}</span>` : ''}
                        </div>
                        <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">${text}</p>
                      </div>
                    `;
                        }
                      )
                      .join('')}
                  </div>`,
                  layout: 'cards-grid-3',
                },
                'faq-1': {
                  type: 'faq',
                  id: 'faq-1',
                  visible: true,
                  anchorId: 'faq',
                  title: 'שאלות ותשובות נפוצות',
                  subtitle: 'תובנות מעמיקות ובירורים מתוך הסרטון',
                  showSearchBar: true,
                  showContactCard: false,
                  items: fallbackFaqItems,
                },
                'sec-cta': {
                  type: 'landingSection',
                  id: 'sec-cta',
                  visible: true,
                  anchorId: 'cta',
                  headline: res.data.callToAction?.title || `רוצים תוצאות דומות עם ${brandCompanyName}?`,
                  subheadline: res.data.callToAction?.subtitle || 'השאירו פרטים ונחזור אליכם בהקדם',
                  description: 'מלאו את הפרטים לקבלת מידע נוסף, ייעוץ אישי והתאמה מדויקת.',
                  badgeText: 'הזדמנות בלעדית',
                  buttonText: res.data.callToAction?.buttonText || 'צרו קשר עכשיו',
                  buttonLink: '#contact',
                  ctaStyle: 'gradient',
                  showLeadForm: true,
                  leadFormTitle: 'קבלו ייעוץ ופרטים מלאים',
                  leadFormButtonText: res.data.callToAction?.buttonText || 'שליחת פרטים',
                  showWhatsAppButton: Boolean(whatsapp),
                  whatsAppNumber: whatsapp,
                  layout: 'split-right',
                },
                'kosvidioGallery-1': {
                  type: 'kosvidioGallery',
                  id: 'kosvidioGallery-1',
                  visible: true,
                  anchorId: 'kosvidio-gallery',
                  badge: 'KOSVIDIO • גלריית סרטונים',
                  title: 'ספריית סרטוני הערוץ',
                  subtitle: channel?.title || brandCompanyName,
                  description: `צפו במבחר סרטוני וידאו מתוך ${channel?.title || brandCompanyName}`,
                  layout: 'horizontal-scroll',
                  source: 'tenant_kosvidio',
                  items: fallbackGalleryItems,
                  allowVisitorLayoutSwitch: false,
                },
                'contact-1': {
                  type: 'contact',
                  id: 'contact-1',
                  visible: false,
                },
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, collPath, pbPageId), pageConfig, { merge: true });
            publicUrl = `/kosvidio/${slug}`;
            eventBus.publish('pagebuilder:page_saved' as any, { page: pageConfig, tenantId });

          } catch (e) {
            console.warn('[KosTube] Direct save to PAGES collection warning:', e);
          }
        }

        const newPage: KosTubeSeoPage = {
          id: pageId,
          videoId: video.id,
          youtubeVideoId: video.youtubeVideoId,
          channelId: video.channelId,
          channelTitle: channel?.title,
          slug,
          metaTitle: res.data.metaTitle || video.title,
          metaDescription: res.data.metaDescription || video.description.slice(0, 150),
          focusKeywords: res.data.focusKeywords || [],
          tags: res.data.tags || [],
          youtubeComments: [],
          pageBuilderPageId: pbPageId,
          h1: res.data.h1 || video.title,
          articleContent: res.data.articleContent || '',
          executiveSummary: res.data.executiveSummary || '',
          keyTakeaways: res.data.keyTakeaways || [],
          faqs: res.data.faqs || [],
          callToAction: {
            title: res.data.callToAction?.title || `רוצים תוצאות דומות עם ${brandCompanyName}?`,
            subtitle: res.data.callToAction?.subtitle || 'השאירו פרטים ונשמח לסייע',
            buttonText: res.data.callToAction?.buttonText || 'צרו קשר עכשיו',
            buttonLink: '#contact',
            showLeadForm: true,
            whatsappNumber: whatsapp,
          },
          schemaJsonLd: res.data.schemaJsonLd || {},
          seoScore: res.data.seoScore || 85,
          seoScoreBreakdown: res.data.seoScoreBreakdown || {
            titleLengthScore: 18,
            descriptionLengthScore: 18,
            keywordsDensityScore: 14,
            headingsStructureScore: 14,
            schemaScore: 15,
            readabilityScore: 14,
          },
          viewCount: Number(video.viewCount || 0),
          likeCount: Number(video.likeCount || 0),
          commentsCount: 0,
          pageViewsCount: 0,
          isPublished: true,
          publishedAt: new Date().toISOString(),
          publicUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await kosTubeFirestore.saveSeoPage(db, tenantId, newPage);

        setSeoPages((prev) => {
          const filtered = prev.filter((p) => p.id !== newPage.id);
          return [newPage, ...filtered];
        });

        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id
              ? { ...v, status: 'processed', seoPageId: newPage.id, seoPageSlug: newPage.slug }
              : v
          )
        );

        setSelectedPage(newPage);
        setIsModalOpen(false);

        // Direct navigation to the published live page at /kosvidio/:slug
        if (typeof window !== 'undefined') {
          const targetUrl = publicUrl || `/kosvidio/${slug}`;
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 350);
        }
        return newPage;
      } catch (err: any) {
        console.error('[KosTube] generateSeoPage failed:', err);
        setError(err?.message || PLEASANT_KOS_TUBE_ERROR_HE);
        return null;
      } finally {
        setIsGenerating(false);
        setGeneratingVideoId(null);
      }
    },
    [db, tenantId, channel?.title, pageBuilder]
  );

  const batchGenerateSeoPages = useCallback(async (): Promise<number> => {
    const ungeneratedVideos = videos.filter((v) => v.status !== 'processed');
    if (ungeneratedVideos.length === 0) return 0;

    let count = 0;
    for (const v of ungeneratedVideos) {
      const res = await generateSeoPage(v);
      if (res) count++;
    }
    return count;
  }, [videos, generateSeoPage]);

  const deleteSeoPage = useCallback(
    async (pageId: string, videoId?: string) => {
      try {
        await kosTubeFirestore.deleteSeoPage(db, tenantId, pageId, videoId);
        setSeoPages((prev) => prev.filter((p) => p.id !== pageId));
        if (videoId) {
          setVideos((prev) =>
            prev.map((v) =>
              v.id === videoId ? { ...v, status: 'pending', seoPageId: undefined, seoPageSlug: undefined } : v
            )
          );
        }
      } catch (err: any) {
        setError(err?.message || 'שגיאה במחיקת עמוד ה-SEO.');
      }
    },
    [db, tenantId]
  );

  const generateAiContentOnly = useCallback(
    async (
      video: KosTubeVideo,
      options?: KosTubeGenerationOptions
    ): Promise<KosTubeAiGeneratedData | null> => {
      const effMode = options?.mode || 'eco';
      const effIncludeBrand = options?.includeBrand !== false;
      const customText = options?.customText;

      setIsGenerating(true);
      setGeneratingVideoId(video.id);
      setGenerationMode(effMode);
      setError(null);
      try {
        let brandDna: any = null;
        if (effIncludeBrand) {
          try {
            const brandCap = getCapability<BrandDnaContract>('brand-dna');
            if (brandCap?.getBrandDna) {
              brandDna = brandCap.getBrandDna();
            }
            if (!brandDna && db) {
              const bSnap = await getDoc(
                doc(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC)
              );
              if (bSnap.exists()) {
                brandDna = bSnap.data();
              }
            }
          } catch (e) {
            console.warn('[KosTube] Could not load brand DNA:', e);
          }
        }

        const res = await generateAiSeoContent({
          video,
          channelTitle: channel?.title || 'ערוץ יוטיוב',
          brandDna,
          mode: effMode,
          includeBrand: effIncludeBrand,
          customText,
          tenantId: tenantId || '_master',
        });

        if (!res.success || !res.data) {
          setError(res.error || PLEASANT_KOS_TUBE_ERROR_HE);
          return null;
        }

        const data: KosTubeAiGeneratedData = {
          metaTitle: res.data.metaTitle || video.title,
          metaDescription: res.data.metaDescription || video.description?.slice(0, 160) || '',
          slug: res.data.slug || (video.youtubeVideoId || 'clip').toLowerCase(),
          focusKeywords: res.data.focusKeywords || [],
          tags: res.data.tags || [],
          h1: res.data.h1 || video.title,
          executiveSummary: res.data.executiveSummary || '',
          keyTakeaways: (res.data.keyTakeaways || []).map((t: any) => typeof t === 'string' ? t : { title: t?.title || 'תובנה', text: t?.text || t?.description || '', icon: t?.icon || 'Sparkles' }),
          articleContent: res.data.articleContent || '',
          faqs: (res.data.faqs as any) || [],
          callToAction: res.data.callToAction
            ? {
                title: res.data.callToAction.title || '',
                subtitle: res.data.callToAction.subtitle || '',
                buttonText: res.data.callToAction.buttonText || '',
                buttonLink: res.data.callToAction.buttonLink || '#sec-cta',
              }
            : undefined,
        };

        return data;
      } catch (err: any) {
        console.error('[KosTube] generateAiContentOnly failed:', err);
        setError(err?.message || PLEASANT_KOS_TUBE_ERROR_HE);
        return null;
      } finally {
        setIsGenerating(false);
        setGeneratingVideoId(null);
      }
    },
    [db, tenantId, channel?.title, getCapability]
  );

  const saveAndDeployReviewedPage = useCallback(
    async (
      video: KosTubeVideo,
      reviewedData: KosTubeAiGeneratedData
    ): Promise<{ success: boolean; publicUrl?: string; error?: string }> => {
      setError(null);
      try {
        let brandDna: any = null;
        try {
          const brandCap = getCapability<BrandDnaContract>('brand-dna');
          if (brandCap?.getBrandDna) {
            brandDna = brandCap.getBrandDna();
          }
          if (!brandDna && db) {
            const bSnap = await getDoc(
              doc(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC)
            );
            if (bSnap.exists()) {
              brandDna = bSnap.data();
            }
          }
        } catch (e) {
          console.warn('[KosTube] Could not load brand DNA:', e);
        }

        const cleanVidId = (video.youtubeVideoId || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        const rawSlug = reviewedData.slug || cleanVidId;
        const slug = rawSlug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '') || cleanVidId || 'video';

        let publicUrl = `/kosvidio/${slug}`;
        let pbPageId = `page_kosvidio_${video.youtubeVideoId || slug}`;

        if (pageBuilder?.createPageFromVideo) {
          try {
            const pbRes = await pageBuilder.createPageFromVideo({
              video,
              channelTitle: channel?.title || 'ערוץ יוטיוב',
              brandDna,
              aiData: { ...reviewedData, slug } as any,
              channelVideos: videos,
              customSlug: slug,
            });
            if (pbRes.success) {
              pbPageId = pbRes.pageId;
              publicUrl = pbRes.publicUrl;
            }
          } catch (pbErr) {
            console.warn('[KosTube] pageBuilder capability call warning:', pbErr);
          }
        } else if (db) {
          try {
            const effTenant = tenantId || '_master';
            const collPath = effTenant === '_master'
              ? `tenants/_master/${SYSTEM_COLLECTIONS.PAGES}`
              : `tenants/${effTenant}/${SYSTEM_COLLECTIONS.PAGES}`;
            const articleHtml = (reviewedData.articleContent || '')
              .split('\n\n')
              .map((p: string) => {
                const trimmed = p.trim();
                if (!trimmed) return '';
                if (trimmed.startsWith('### ')) return `<h3 class="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">${trimmed.replace(/^###\s*/, '')}</h3>`;
                if (trimmed.startsWith('## ')) return `<h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4">${trimmed.replace(/^##\s*/, '')}</h2>`;
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                  const items = trimmed.split('\n').map(li => `<li class="mr-4 list-disc text-slate-700 dark:text-slate-300 my-1">${li.replace(/^[\*\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('');
                  return `<ul class="my-3 space-y-1">${items}</ul>`;
                }
                const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
                return `<p class="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-4">${withBold}</p>`;
              })
              .join('');

            const fallbackFaqItems = Array.isArray(reviewedData.faqs) && reviewedData.faqs.length > 0
              ? reviewedData.faqs.map((f: any, idx: number) => ({
                  id: String(idx + 1),
                  question: f.question || '',
                  answer: f.answer || '',
                }))
              : [];

            const fallbackGalleryItems = videos.map((v, i) => ({
              id: v.id || `vid-${i}`,
              title: v.title,
              subtitle: channel?.title || brandDna?.identity?.companyName || 'קושאן',
              description: v.description?.slice(0, 140) || '',
              youtubeVideoId: v.youtubeVideoId,
              thumbnailUrl: v.thumbnailUrl,
              kosvidioSlug: 'kosvidio',
              duration: v.duration || '',
              viewsCount: Number(v.viewCount || 0),
              likesCount: Number(v.likeCount || 0),
              category: 'סרטוני הערוץ',
              tags: ['וידאו', 'יוטיוב'],
              featured: i === 0,
            }));

            const pageConfig = {
              pageId: pbPageId,
              pageTitle: `${reviewedData.h1 || video.title} - Kosvidio`,
              pageCategory: 'youtube_post',
              slug,
              shortSlug: slug,
              publicUrl,
              published: true,
              isHomePage: false,
              viewsCount: 0,
              leadsCount: 0,
              globalSettings: {
                siteTitle: `${reviewedData.h1 || video.title} | ${brandDna?.identity?.companyName || 'קושאן'}`,
                companyName: brandDna?.identity?.companyName || 'קושאן',
                slogan: brandDna?.identity?.slogan || 'וידאו חכם ומאמרי SEO מעמיקים',
                theme: 'dark',
                headerLayout: 'capsule-floating',
                headerSticky: true,
                isHeaderVisible: true,
                isFooterVisible: true,
                primaryColor: brandDna?.designTokens?.primaryColor || '#ef4444',
                secondaryColor: brandDna?.designTokens?.secondaryColor || '#8b5cf6',
                backgroundColor: '#090a0f',
                textColor: '#f8fafc',
                fontFamily: 'Heebo, sans-serif',
                borderRadius: 'lg',
                buttonStyle: 'gradient',
                contactWhatsApp: brandDna?.trust?.whatsappSupportNumber || '',
                contactPhone: brandDna?.trust?.contactPhone || '',
                contactEmail: brandDna?.trust?.contactEmail || '',
                siteLogoUrl: brandDna?.identity?.logoUrl || '',
              },
              seoSettings: {
                title: reviewedData.metaTitle || video.title,
                description: reviewedData.metaDescription || video.description.slice(0, 160),
                keywords: reviewedData.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
              },
              sectionOrder: [
                'header-1',
                'kosvidio-1',
                'videoEngagement-1',
                'about-1',
                'sec-takeaways',
                'faq-1',
                'sec-cta',
                'kosvidioGallery-1',
              ],
              sections: {
                'header-1': {
                  type: 'header',
                  id: 'header-1',
                  visible: true,
                  layout: 'capsule-floating',
                  sticky: true,
                  useBrandLogo: true,
                  showLogoText: true,
                  logoText: brandDna?.identity?.companyName || 'קושאן',
                },
                'kosvidio-1': {
                  type: 'kosvidio',
                  id: 'kosvidio-1',
                  visible: true,
                  anchorId: 'video',
                  youtubeVideoId: video.youtubeVideoId,
                  videoUrl: `https://www.youtube.com/watch?v=${video.youtubeVideoId}`,
                  title: reviewedData.h1 || video.title,
                  shortDescription: reviewedData.executiveSummary || '',
                  shortDescriptionBadge: 'על הסרטון בכמה מילים',
                  channelName: channel?.title || brandDna?.identity?.companyName || 'קושאן',
                  channelAvatarUrl: video.thumbnailUrl,
                  channelSubscribers: '24.5K',
                  verifiedBadge: true,
                  viewsCount: Number(video.viewCount || 0),
                  likesCount: Number(video.likeCount || 0),
                  commentsCount: 0,
                  ambientGlow: true,
                  showTheaterMode: true,
                  hideInternalEngagement: true,
                  enableSocialShare: true,
                  tags: reviewedData.tags || ['וידאו', 'יוטיוב'],
                  keyTakeaways: (reviewedData.keyTakeaways || []).map((t: any) => typeof t === 'string' ? t : (t?.title ? `${t.title}: ${t.text || ''}` : t?.text || '')),
                  faqs: fallbackFaqItems,
                  callToAction: {
                    title: reviewedData.callToAction?.title || `רוצים תוצאות דומות עם ${brandDna?.identity?.companyName || 'קושאן'}?`,
                    subtitle: reviewedData.callToAction?.subtitle || 'השאירו פרטים ונשמח לסייע',
                    buttonText: reviewedData.callToAction?.buttonText || 'צרו קשר עכשיו',
                    buttonLink: '#sec-cta',
                  },
                },
                'videoEngagement-1': {
                  type: 'videoEngagement',
                  id: 'videoEngagement-1',
                  visible: true,
                  anchorId: 'engagement',
                  title: 'אינטראקציה, שיתוף ותגובות',
                  videoTitle: reviewedData.h1 || video.title,
                  viewsCount: Number(video.viewCount || 0),
                  likesCount: Number(video.likeCount || 0),
                  tags: reviewedData.tags || ['וידאו', 'יוטיוב'],
                  accentColor: brandDna?.designTokens?.primaryColor || '#ef4444',
                  allowLikes: true,
                  allowComments: true,
                  allowUserComments: true,
                  enableSocialShare: true,
                  backgroundColor: 'transparent',
                },
                'about-1': {
                  type: 'about',
                  id: 'about-1',
                  visible: true,
                  anchorId: 'article',
                  heading: reviewedData.h1 || video.title,
                  subtitle: reviewedData.executiveSummary || '',
                  body: `<div class="kosvidio-rich-content space-y-4 font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                    ${reviewedData.executiveSummary ? `<div class="p-5 mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium leading-relaxed shadow-xs"><div class="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">תמצית התוכן והסרטון:</div>${reviewedData.executiveSummary}</div>` : ''}
                    ${articleHtml}
                  </div>`,
                  layout: 'highlight-box',
                },
                'sec-takeaways': {
                  type: 'richContent',
                  id: 'sec-takeaways',
                  visible: (reviewedData.keyTakeaways || []).length > 0,
                  anchorId: 'takeaways',
                  heading: 'תובנות מרכזיות ונקודות מפתח',
                  subtitle: 'עיקרי הדברים והמסקנות החשובות מתוך הסרטון',
                  body: '',
                  layout: 'cards-grid-3',
                },
                'faq-1': {
                  type: 'faq',
                  id: 'faq-1',
                  visible: fallbackFaqItems.length > 0,
                  anchorId: 'faq',
                  title: 'שאלות ותשובות נפוצות',
                  subtitle: 'תובנות מעמיקות ובירורים מתוך הסרטון',
                  showSearchBar: true,
                  showContactCard: false,
                  items: fallbackFaqItems,
                },
                'sec-cta': {
                  type: 'landingSection',
                  id: 'sec-cta',
                  visible: true,
                  anchorId: 'cta',
                  headline: reviewedData.callToAction?.title || `רוצים תוצאות דומות עם ${brandDna?.identity?.companyName || 'קושאן'}?`,
                  subheadline: reviewedData.callToAction?.subtitle || 'השאירו פרטים ונחזור אליכם בהקדם',
                  description: 'מלאו את הפרטים לקבלת מידע נוסף, ייעוץ אישי והתאמה מדויקת.',
                  ctaButton: { text: reviewedData.callToAction?.buttonText || 'צרו קשר עכשיו' },
                },
                'kosvidioGallery-1': {
                  type: 'kosvidioGallery',
                  id: 'kosvidioGallery-1',
                  visible: true,
                  anchorId: 'more-videos',
                  title: 'סרטונים נוספים מהערוץ',
                  subtitle: channel?.title || brandDna?.identity?.companyName || 'קושאן',
                  description: `צפו במבחר סרטוני וידאו מתוך ${channel?.title || brandDna?.identity?.companyName || 'קושאן'}`,
                  layout: 'horizontal-scroll',
                  source: 'tenant_kosvidio',
                  items: fallbackGalleryItems,
                  allowVisitorLayoutSwitch: false,
                },
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, collPath, pbPageId), pageConfig, { merge: true });
            publicUrl = `/kosvidio/${slug}`;
            eventBus.publish('pagebuilder:page_saved' as any, { page: pageConfig, tenantId });
          } catch (e) {
            console.warn('[KosTube] Direct save in saveEditedPage warning:', e);
          }
        }

        const pageId = `page_${video.youtubeVideoId || slug}`;
        const newPage: KosTubeSeoPage = {
          id: pageId,
          videoId: video.id,
          youtubeVideoId: video.youtubeVideoId,
          channelId: video.channelId,
          channelTitle: channel?.title,
          slug,
          metaTitle: reviewedData.metaTitle || video.title,
          metaDescription: reviewedData.metaDescription || video.description.slice(0, 150),
          focusKeywords: reviewedData.focusKeywords || [],
          tags: reviewedData.tags || [],
          youtubeComments: [],
          pageBuilderPageId: pbPageId,
          h1: reviewedData.h1 || video.title,
          articleContent: reviewedData.articleContent || '',
          executiveSummary: reviewedData.executiveSummary || '',
          keyTakeaways: (reviewedData.keyTakeaways || []).map((t: any) => typeof t === 'string' ? t : (t?.title ? `${t.title}: ${t.text || ''}` : t?.text || '')),
          faqs: reviewedData.faqs || [],
          callToAction: {
            title: reviewedData.callToAction?.title || `רוצים תוצאות דומות עם ${brandDna?.identity?.companyName || 'קושאן'}?`,
            subtitle: reviewedData.callToAction?.subtitle || 'השאירו פרטים ונשמח לסייע',
            buttonText: reviewedData.callToAction?.buttonText || 'צרו קשר עכשיו',
            buttonLink: '#sec-cta',
            showLeadForm: true,
            whatsappNumber: brandDna?.trust?.whatsappSupportNumber || '',
          },
          schemaJsonLd: {},
          seoScore: 92,
          seoScoreBreakdown: {
            titleLengthScore: 19,
            descriptionLengthScore: 19,
            keywordsDensityScore: 18,
            headingsStructureScore: 18,
            schemaScore: 18,
            readabilityScore: 18,
          },
          viewCount: Number(video.viewCount || 0),
          likeCount: Number(video.likeCount || 0),
          commentsCount: 0,
          pageViewsCount: 0,
          isPublished: true,
          publishedAt: new Date().toISOString(),
          publicUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await kosTubeFirestore.saveSeoPage(db, tenantId, newPage);
        await KosTubePageSyncService.syncTubeToPage(newPage, db, tenantId);

        setSeoPages((prev) => {
          const filtered = prev.filter((p) => p.id !== newPage.id);
          return [newPage, ...filtered];
        });

        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id
              ? { ...v, status: 'processed', seoPageId: newPage.id, seoPageSlug: newPage.slug }
              : v
          )
        );

        setSelectedPage(newPage);
        return { success: true, publicUrl };
      } catch (err: any) {
        console.error('[KosTube] saveAndDeployReviewedPage failed:', err);
        return { success: false, error: err?.message || 'שגיאה בפריסת עמוד ה-KOSVIDIO' };
      }
    },
    [db, tenantId, channel?.title, pageBuilder, videos, getCapability]
  );

  const value: KosTubeContextValue = {
    channel,
    videos,
    seoPages,
    activeTab,
    setActiveTab,
    isLoading,
    isSyncing,
    isGenerating,
    generatingVideoId,
    generationMode,
    isRootTenant,
    error,
    clearError,
    syncChannel,
    addVideoByUrl,
    generateSeoPage,
    generateAiContentOnly,
    saveAndDeployReviewedPage,
    reviewModalData,
    setReviewModalData,
    isReviewModalOpen,
    setIsReviewModalOpen,
    openGenerationModal,
    batchGenerateSeoPages,
    deleteSeoPage,
    refreshData,
    selectedVideo,
    setSelectedVideo,
    selectedPage,
    setSelectedPage,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    setModalMode,
  };

  return <KosTubeContext.Provider value={value}>{children}</KosTubeContext.Provider>;
};

export function useKosTube(): KosTubeContextValue {
  const context = useContext(KosTubeContext);
  if (!context) {
    throw new Error('useKosTube must be used within a KosTubeProvider');
  }
  return context;
}
