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
import { KosTubeAiMode } from '../../kosai-engine/modelsAiService';

export type KosTubeTab = 'overview' | 'videos' | 'pages' | 'settings';

export interface KosTubeGenerationOptions {
  mode?: KosTubeAiMode;
  includeBrand?: boolean;
  customText?: string;
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
        });

        if (!res.success || !res.data) {
          setError(res.error || PLEASANT_KOS_TUBE_ERROR_HE);
          return null;
        }

        const pageId = `page_${video.youtubeVideoId}`;
        const rawSlug = res.data.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'kosvidio';
        const slug = rawSlug.startsWith('kosvidio') ? rawSlug : 'kosvidio';
        let publicUrl = `/tube/${slug}`;
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
              aiData: res.data,
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
                if (p.startsWith('### ')) return `<h3 class="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">${p.replace('### ', '')}</h3>`;
                if (p.startsWith('## ')) return `<h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4">${p.replace('## ', '')}</h2>`;
                if (p.trim()) return `<p class="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-4">${p}</p>`;
                return '';
              })
              .join('');

            const pageConfig = {
              pageId: pbPageId,
              pageTitle: `${res.data.h1 || video.title} - Kosvidio`,
              slug,
              published: true,
              isHomePage: false,
              viewsCount: 0,
              leadsCount: 0,
              globalSettings: {
                siteTitle: `${res.data.h1 || video.title} | ${brandCompanyName}`,
                companyName: brandCompanyName,
                slogan: brandSlogan,
                theme: 'dark',
                headerLayout: 'floating-glass',
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
              },
              seoSettings: {
                title: res.data.metaTitle || video.title,
                description: res.data.metaDescription || video.description.slice(0, 160),
                keywords: res.data.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
              },
              sectionOrder: ['header-1', 'kosvidio-1', 'about-1', 'contact-1'],
              sections: {
                'header-1': {
                  type: 'header',
                  id: 'header-1',
                  visible: true,
                  layout: 'floating-glass',
                  title: brandCompanyName,
                  showLogoText: true,
                  logoText: brandCompanyName,
                  useBrandLogo: Boolean(brandLogo),
                  customLogoUrl: brandLogo,
                },
                'kosvidio-1': {
                  type: 'kosvidio',
                  id: 'kosvidio-1',
                  visible: true,
                  youtubeVideoId: video.youtubeVideoId,
                  title: res.data.h1 || video.title,
                  channelName: channel?.title || 'ערוץ יוטיוב',
                  channelAvatarUrl: video.thumbnailUrl,
                  viewsCount: Number(video.viewCount || 0),
                  likesCount: Number(video.likeCount || 0),
                  commentsCount: 0,
                  pageViewsCount: 0,
                  tags: res.data.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
                  comments: [],
                  shortDescription: res.data.executiveSummary || video.description.slice(0, 160),
                  longDescriptionMarkdown: res.data.articleContent || '',
                  keyTakeaways: res.data.keyTakeaways || [],
                  faqs: res.data.faqs || [],
                  callToAction: res.data.callToAction,
                  ambientGlow: true,
                  showTheaterMode: true,
                  enableSocialShare: true,
                },
                'about-1': {
                  type: 'richContent',
                  id: 'about-1',
                  visible: true,
                  heading: `אודות וניתוח תוכן מקצועי${effIncludeBrand ? ` - ${brandCompanyName}` : ''}`,
                  body: `<div class="kosvidio-about-article space-y-4 font-normal leading-relaxed text-slate-800 dark:text-slate-200">${articleHtml}</div>`,
                  layout: 'highlight-box',
                },
                'contact-1': {
                  type: 'contact',
                  id: 'contact-1',
                  visible: true,
                  title: `צרו קשר עם ${brandCompanyName}`,
                  subtitle: 'יש לכם שאלות או מעוניינים בפרטים נוספים? נשמח לסייע',
                  phone,
                  email,
                  whatsApp: whatsapp,
                },
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, collPath, pbPageId), pageConfig, { merge: true });
            publicUrl = `/p/${slug}`;

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
        setModalMode('page_preview');
        setIsModalOpen(true);
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
