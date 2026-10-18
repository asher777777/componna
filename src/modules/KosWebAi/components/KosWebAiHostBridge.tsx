import React, { useEffect } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import {
  CommunityWebPageContract,
  CommunityWebPageOptions,
  PageBuilderContract,
  CreatePageFromProductOptions,
  CreatePageFromServiceOptions,
  CreateVideoSeoPageOptions,
  CreateCampaignPageOptions,
  BrandDnaContract,
} from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { pageGenerator } from '../generators/pageGenerator';
import { buildPageConfigFromFlagshipProduct, buildPageConfigFromCoreService } from '../generators/productPageBuilder';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';
import { KosvidioGalleryItem } from '../types/sectionConfigs';

export const KosWebAiHostBridge: React.FC = () => {
  const { registerCapability, unregisterCapability, getCapability } = useHostCapabilities();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  useEffect(() => {
    const contract: CommunityWebPageContract = {
      getCommunityPageUrl: (slug: string) => {
        const cleanSlug = (slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        return `/to/${cleanSlug}`;
      },

      openPageBuilderForCommunity: (pageId: string) => {
        window.location.href = `/KosWebAi?pageId=${pageId}`;
      },

      createOrUpdateCommunityPage: async (options: CommunityWebPageOptions) => {
        try {
          const cleanSlug = (options.slug || options.communityId)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '');
          const pageId = `to_${options.communityId}`;
          const existing = await pageBuilderFirestore.getPage(pageId, db, tenantId);

          const now = new Date().toISOString();
          const primaryColor = options.brandProfile?.colors?.primaryColor || '#4f46e5';
          const secondaryColor = options.brandProfile?.colors?.secondaryColor || '#818cf8';

          let pageConfig: PageBuilderConfig;

          if (existing) {
            pageConfig = {
              ...existing,
              pageTitle: options.pageTitle || existing.pageTitle,
              slug: cleanSlug,
              published: options.isPublished ?? existing.published ?? true,
              publishedUrl: `/to/${cleanSlug}`,
              updatedAt: now,
              globalSettings: {
                ...existing.globalSettings,
                primaryColor,
                secondaryColor,
                companyName: options.brandProfile?.name || existing.globalSettings?.companyName || options.pageTitle,
              },
            };
            if (options.sections) {
              pageConfig.sections = { ...existing.sections, ...options.sections };
            }
            if (options.sectionOrder) {
              pageConfig.sectionOrder = options.sectionOrder;
            }
          } else {
            // Build fresh community page blueprint
            const heroId = `hero_${Date.now()}`;
            const aboutId = `about_${Date.now()}`;
            const servicesId = `services_${Date.now()}`;
            const ctaId = `cta_${Date.now()}`;

            const servicesList = options.brandProfile?.services && options.brandProfile.services.length > 0
              ? options.brandProfile.services.map((srv, idx) => ({
                  id: `srv_${idx}`,
                  title: srv,
                  description: `פעילות מרכזית של קהילת ${options.pageTitle}`,
                  icon: 'Sparkles',
                }))
              : [
                  { id: 'srv_1', title: 'מפגשים ואירועים', description: 'פעילויות קהילתיות קבועות', icon: 'Users' },
                  { id: 'srv_2', title: 'שיתוף ידע ותמיכה', description: 'מרחב מפרה ומעצים לחברי הקהילה', icon: 'Heart' },
                  { id: 'srv_3', title: 'יוזמות ופרויקטים', description: 'קידום מטרות משותפות יחד', icon: 'Target' },
                ];

            pageConfig = {
              pageId,
              pageTitle: options.pageTitle,
              slug: cleanSlug,
              published: options.isPublished ?? true,
              publishedUrl: `/to/${cleanSlug}`,
              createdAt: now,
              updatedAt: now,
              viewsCount: 0,
              leadsCount: 0,
              sectionOrder: [heroId, aboutId, servicesId, ctaId],
              sections: {
                [heroId]: {
                  id: heroId,
                  type: 'hero',
                  visible: true,
                  title: options.pageTitle,
                  subtitle: options.description || options.brandProfile?.purpose || 'ברוכים הבאים לקהילה שלנו',
                  ctaButtonText: 'הצטרפו לקהילה',
                  ctaButtonUrl: '#contact',
                  badgeText: 'קהילת KOSUN',
                  alignment: 'center',
                },
                [aboutId]: {
                  id: aboutId,
                  type: 'about',
                  visible: true,
                  title: 'אודות הקהילה והחזון',
                  description: options.brandProfile?.vision || options.brandProfile?.purpose || options.description || '',
                  buttonText: 'למידע נוסף',
                },
                [servicesId]: {
                  id: servicesId,
                  type: 'richContent',
                  visible: true,
                  title: 'פעילויות ושירותי הקהילה',
                  subtitle: 'מה מחכה לכם אצלנו בקהילה',
                  body: servicesList.join(' • '),
                },
                [ctaId]: {
                  id: ctaId,
                  type: 'cta',
                  visible: true,
                  title: 'מוזמנים לקחת חלק פעיל',
                  subtitle: options.brandProfile?.contactPhone
                    ? `צרו קשר ישיר: ${options.brandProfile.contactPhone}`
                    : 'השאירו פרטים ונחזור אליכם בהקדם',
                  ctaText: 'יצירת קשר',
                  ctaUrl: '#contact',
                },
              },
              globalSettings: {
                companyName: options.brandProfile?.name || options.pageTitle,
                primaryColor,
                secondaryColor,
                contactPhone: options.brandProfile?.contactPhone || '',
                contactEmail: options.brandProfile?.contactEmail || '',
                siteTitle: `${options.pageTitle} | קהילה רשמית`,
              },
              seoSettings: {
                title: `${options.pageTitle} | קהילה רשמית`,
                description: options.description || options.brandProfile?.purpose || '',
              },
            };
          }

          await pageBuilderFirestore.savePage(pageConfig, db, tenantId);
          return {
            success: true,
            pageId,
            publicUrl: `/to/${cleanSlug}`,
          };
        } catch (err: any) {
          console.error('[KosWebAiHostBridge] Error creating community page:', err);
          return {
            success: false,
            pageId: '',
            publicUrl: '',
          };
        }
      },
    };

    const pageBuilderContract: PageBuilderContract = {
      openPageBuilder: (pageId?: string) => {
        window.location.href = pageId ? `/KosWebAi?pageId=${pageId}` : '/KosWebAi';
      },

      createPageFromProduct: async (options: CreatePageFromProductOptions) => {
        try {
          const product = options.product;
          options.onStep?.({
            statusText: 'פורס את נתוני מוצר הדגל באזורים המותאמים ומגדיר SEO ו-AIO...',
            percent: 45,
          });

          const generatedConfig = buildPageConfigFromFlagshipProduct(
            options,
            product.linkedPageId
          );

          options.onStep?.({
            statusText: 'שומר עמוד מוצר ומסתיר אזורים שאינם מותאמים...',
            percent: 85,
          });

          // Save page through pageBuilderFirestore
          await pageBuilderFirestore.savePage(generatedConfig, db, tenantId);

          // Update Brand DNA Contract with new service page slug & notify event bus
          try {
            const brandContract = getCapability<BrandDnaContract>('brand-dna');
            if (brandContract?.registerServicePageSlug) {
              await brandContract.registerServicePageSlug(product.nameAndSlogan, generatedConfig.slug);
            }
            eventBus.publish('brand:service_slug_updated', {
              serviceName: product.nameAndSlogan,
              slug: generatedConfig.slug,
              pageId: generatedConfig.pageId,
            });
          } catch (brandErr) {
            console.warn('[KosWebAiHostBridge] Brand slug registration warning:', brandErr);
          }

          options.onStep?.({
            statusText: 'העמוד נוצר בהצלחה!',
            percent: 100,
          });

          return {
            success: true,
            pageId: generatedConfig.pageId,
            slug: generatedConfig.slug,
            publicUrl: `/p/${generatedConfig.slug}`,
          };
        } catch (err: any) {
          console.error('[KosWebAiHostBridge] Error creating product page:', err);
          return {
            success: false,
            pageId: '',
            slug: '',
            publicUrl: '',
            error: err?.message || 'שגיאה בפריסת עמוד הנחיתה מנתוני המוצר.',
          };
        }
      },

      createPageFromService: async (options: CreatePageFromServiceOptions) => {
        try {
          const service = options.service;
          options.onStep?.({
            statusText: 'פורס את נתוני השירות באזורים המותאמים ומגדיר SEO ו-AIO...',
            percent: 45,
          });

          const generatedConfig = buildPageConfigFromCoreService(
            options,
            service.linkedPageId
          );

          options.onStep?.({
            statusText: 'שומר עמוד שירות ומסתיר אזורים שאינם מותאמים...',
            percent: 85,
          });

          // Save page through pageBuilderFirestore
          await pageBuilderFirestore.savePage(generatedConfig, db, tenantId);

          // Update Brand DNA Contract with new service page slug & notify event bus
          try {
            const brandContract = getCapability<BrandDnaContract>('brand-dna');
            if (brandContract?.registerServicePageSlug) {
              await brandContract.registerServicePageSlug(service.nameAndSlogan, generatedConfig.slug);
            }
            eventBus.publish('brand:service_slug_updated', {
              serviceName: service.nameAndSlogan,
              slug: generatedConfig.slug,
              pageId: generatedConfig.pageId,
            });
          } catch (brandErr) {
            console.warn('[KosWebAiHostBridge] Brand slug registration warning:', brandErr);
          }

          options.onStep?.({
            statusText: 'עמוד השירות נוצר בהצלחה!',
            percent: 100,
          });

          return {
            success: true,
            pageId: generatedConfig.pageId,
            slug: generatedConfig.slug,
            publicUrl: `/${generatedConfig.slug}`, // ללא קידומת /p/ לפי דרישת המשתמש
          };
        } catch (err: any) {
          console.error('[KosWebAiHostBridge] Error creating service page:', err);
          return {
            success: false,
            pageId: '',
            slug: '',
            publicUrl: '',
            error: err?.message || 'שגיאה בפריסת עמוד השירות מנתוני השירות.',
          };
        }
      },

      createPageFromCampaign: async (options: CreateCampaignPageOptions) => {
        try {
          const campaignId = options.campaignId || `camp_${Date.now()}`;
          const rawTitle = options.title || 'קמפיין גיוס';
          const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
          const cleanSlug = `kosfunrise-${campaignId.toLowerCase().replace(/[^a-z0-9-]/g, '') || randomSuffix}`;
          const pageId = `page_campaign_${randomSuffix}`;

          const brandCompanyName = options.brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים';
          const brandLogo = options.brandDna?.identity?.logoUrl || '';
          const brandSlogan = options.brandDna?.identity?.slogan || 'שגרירים וגיוס כספים';
          const primaryColor = options.brandDna?.designTokens?.primaryColor || '#e11d48';

          const campaignPageConfig: PageBuilderConfig = {
            pageId,
            pageTitle: `${rawTitle} - KOSFUNRISE`,
            slug: cleanSlug,
            pageCategory: 'fundraising',
            published: true,
            isHomePage: false,
            viewsCount: 0,
            leadsCount: 0,
            globalSettings: {
              siteTitle: `${rawTitle} | ${brandCompanyName}`,
              companyName: brandCompanyName,
              slogan: brandSlogan,
              siteLogoUrl: brandLogo,
              primaryColor,
              theme: 'sunset',
              headerLayout: 'floating-glass',
              headerSticky: true,
              isHeaderVisible: true,
              isFooterVisible: true,
            },
            seoSettings: {
              title: `${rawTitle} | קמפיין גיוס`,
              description: options.description || `קמפיין גיוס כספים ותרומות עבור ${rawTitle}`,
              keywords: ['קמפיין', 'גיוס', 'תרומות', 'KOSFUNRISE'],
            },
            sectionOrder: ['campaignHeader', 'campaignTiers', 'campaignDonors', 'contact'],
            sections: {
              campaignHeader: {
                ...SECTION_REGISTRY.campaignHeader?.defaultConfig,
                id: 'campaignHeader',
                title: rawTitle,
                subtitle: options.description || 'היו שותפים להצלחת הקמפיין',
                targetGoal: options.targetGoal || 100000,
              },
              campaignTiers: {
                ...SECTION_REGISTRY.campaignTiers?.defaultConfig,
                id: 'campaignTiers',
                title: 'מדרגות תרומה ושותפות',
                tiers: options.tiers || SECTION_REGISTRY.campaignTiers?.defaultConfig?.tiers,
              },
              campaignDonors: {
                ...SECTION_REGISTRY.campaignDonors?.defaultConfig,
                id: 'campaignDonors',
                title: 'קיר התורמים והשגרירים',
              },
              contact: {
                ...SECTION_REGISTRY.contact?.defaultConfig,
                id: 'contact',
              },
            },
          };

          await pageBuilderFirestore.savePage(campaignPageConfig, db, tenantId);
          eventBus.publish('campaign:page_created', {
            campaignId,
            slug: cleanSlug,
            publicUrl: `/p/${cleanSlug}`,
          });

          return {
            success: true,
            pageId,
            slug: cleanSlug,
            publicUrl: `/p/${cleanSlug}`,
            config: campaignPageConfig,
          };
        } catch (err: any) {
          console.error('[KosWebAiHostBridge] Error creating campaign page:', err);
          return {
            success: false,
            pageId: '',
            slug: '',
            publicUrl: '',
            error: err?.message || 'שגיאה ביצירת עמוד הקמפיין.',
          };
        }
      },

      notifyServicePageCreated: async (options: {
        pageId: string;
        slug: string;
        title: string;
        serviceName?: string;
      }) => {
        try {
          const brandContract = getCapability<BrandDnaContract>('brand-dna');
          if (brandContract?.registerServicePageSlug) {
            await brandContract.registerServicePageSlug(options.serviceName || options.title, options.slug);
          }
          eventBus.publish('brand:service_slug_updated', {
            serviceName: options.serviceName || options.title,
            slug: options.slug,
            pageId: options.pageId,
          });
        } catch (e) {
          console.warn('[KosWebAiHostBridge] notifyServicePageCreated warning:', e);
        }
      },

      createPageFromVideo: async (options: CreateVideoSeoPageOptions) => {
        try {
          const video = options.video;
          const aiData = options.aiData;
          const cleanVideoId = (video.youtubeVideoId || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
          const rawSlug = aiData?.slug || `kosvidio-${cleanVideoId}`;
          const cleanSlug = rawSlug.trim().replace(/^\/?p\//i, '').replace(/^[#/]+/, '');
          const pageId = `page_kosvidio_${video.youtubeVideoId}`;
          const title = aiData?.h1 || video.title || 'וידאו ומאמר AI SEO';

          // Resolve live Brand DNA for tenant
          const liveBrand = resolveLiveBrandDna(options.brandDna, tenantId);
          const brandCompanyName = liveBrand?.identity?.companyName || 'קושאן';
          const brandLogo = liveBrand?.identity?.logoUrl || '';
          const brandSlogan = liveBrand?.identity?.slogan || 'וידאו חכם ומאמרי SEO מעמיקים';
          const primaryColor = liveBrand?.designTokens?.primaryColor || '#ef4444';
          const secondaryColor = liveBrand?.designTokens?.secondaryColor || '#8b5cf6';
          const whatsapp = liveBrand?.trust?.whatsappSupportNumber || '';
          const phone = liveBrand?.trust?.contactPhone || '';
          const email = liveBrand?.trust?.contactEmail || '';

          // Format executive summary and article content as rich HTML for about-1 section
          const execSummaryHtml = aiData?.executiveSummary
            ? `<div class="p-5 mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium leading-relaxed shadow-sm">
                 <div class="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">תמצית התוכן והסרטון:</div>
                 ${aiData.executiveSummary}
               </div>`
            : '';

          const formattedArticle = (aiData?.articleContent || '')
            .split('\n\n')
            .map((block: string) => {
              const trimmed = block.trim();
              if (!trimmed) return '';
              if (trimmed.startsWith('### ')) {
                return `<h3 class="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">${trimmed.replace(/^###\s*/, '')}</h3>`;
              }
              if (trimmed.startsWith('## ')) {
                return `<h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4">${trimmed.replace(/^##\s*/, '')}</h2>`;
              }
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                const listItems = trimmed
                  .split('\n')
                  .map((item) => `<li class="mr-4 list-disc text-slate-700 dark:text-slate-300 my-1">${item.replace(/^[\*\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`)
                  .join('');
                return `<ul class="my-3 space-y-1">${listItems}</ul>`;
              }
              const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
              return `<p class="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-4">${withBold}</p>`;
            })
            .join('');

          const aboutBodyHtml = `<div class="kosvidio-rich-content space-y-4 font-normal leading-relaxed text-slate-800 dark:text-slate-200">${execSummaryHtml}${formattedArticle}</div>`;

          // Format FAQ items
          const faqItems = Array.isArray(aiData?.faqs) && aiData.faqs.length > 0
            ? aiData.faqs.map((f: any, idx: number) => ({
                id: String(idx + 1),
                question: f.question || '',
                answer: f.answer || '',
              }))
            : SECTION_REGISTRY.faq?.defaultConfig?.items || [];

          // Format Channel Video Gallery items
          const rawVideos = options.channelVideos || [];
          const galleryItems: KosvidioGalleryItem[] = rawVideos.map((v, i) => ({
            id: v.id || `vid-${i}`,
            title: v.title,
            subtitle: options.channelTitle || brandCompanyName,
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

          const pageConfig: PageBuilderConfig = {
            pageId,
            pageTitle: `${title} - Kosvidio`,
            slug: cleanSlug,
            published: true,
            isHomePage: false,
            viewsCount: 0,
            leadsCount: 0,
            globalSettings: {
              siteTitle: `${title} | ${brandCompanyName}`,
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
              title: aiData?.metaTitle || title,
              description: aiData?.metaDescription || video.description.slice(0, 160),
              keywords: aiData?.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
            },
            // Order strictly: Header -> Kosvidio Video -> About / RichContent -> FAQ -> KosvidioGallery
            sectionOrder: ['header-1', 'kosvidio-1', 'about-1', 'faq-1', 'kosvidioGallery-1'],
            sections: {
              'header-1': {
                ...SECTION_REGISTRY.header.defaultConfig,
                id: 'header-1',
                type: 'header',
                visible: true,
                title: brandCompanyName,
                showLogoText: true,
                logoText: brandCompanyName,
                useBrandLogo: Boolean(brandLogo),
                customLogoUrl: brandLogo,
                layout: 'capsule-floating',
                sticky: true,
              },
              'kosvidio-1': {
                ...SECTION_REGISTRY.kosvidio.defaultConfig,
                id: 'kosvidio-1',
                type: 'kosvidio',
                visible: true,
                anchorId: 'kosvidio',
                youtubeVideoId: video.youtubeVideoId,
                title,
                viewsCount: Number(video.viewCount || 0),
                likesCount: Number(video.likeCount || 0),
                commentsCount: 0,
                pageViewsCount: 0,
                channelName: options.channelTitle || 'ערוץ יוטיוב',
                channelAvatarUrl: video.thumbnailUrl,
                tags: aiData?.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
                comments: [],
                shortDescription: aiData?.executiveSummary || video.description.slice(0, 160),
                longDescriptionMarkdown: aiData?.articleContent || '',
                keyTakeaways: aiData?.keyTakeaways || [],
                faqs: (aiData?.faqs as any) || [],
                callToAction: aiData?.callToAction || {
                  title: `רוצים לקחת את התוצאות צעד קדימה עם ${brandCompanyName}?`,
                  subtitle: 'פנו אלינו ונשמח לסייע לכם להגיע ליעדים העסקיים שלכם',
                  buttonText: 'צרו קשר עכשיו',
                  buttonLink: '#contact',
                },
                ambientGlow: true,
                showTheaterMode: true,
                enableSocialShare: true,
              },
              'about-1': {
                ...SECTION_REGISTRY.richContent.defaultConfig,
                id: 'about-1',
                type: 'richContent',
                visible: true,
                anchorId: 'about',
                heading: aiData?.h1 || 'אודות וניתוח תוכן מעמיק',
                subtitle: brandCompanyName,
                body: aboutBodyHtml,
                layout: 'highlight-box',
              },
              'faq-1': {
                ...SECTION_REGISTRY.faq.defaultConfig,
                id: 'faq-1',
                type: 'faq',
                visible: true,
                anchorId: 'faq',
                title: 'שאלות ותשובות נפוצות',
                subtitle: 'תובנות מעמיקות ובירורים מתוך הסרטון',
                showSearchBar: true,
                showContactCard: false,
                items: faqItems,
              },
              'kosvidioGallery-1': {
                ...SECTION_REGISTRY.kosvidioGallery.defaultConfig,
                id: 'kosvidioGallery-1',
                type: 'kosvidioGallery',
                visible: true,
                anchorId: 'kosvidio-gallery',
                badge: 'KOSVIDIO • גלריית סרטונים',
                title: 'ספריית סרטוני הערוץ',
                subtitle: options.channelTitle || brandCompanyName,
                description: `צפו במבחר סרטוני וידאו מתוך ${options.channelTitle || brandCompanyName}`,
                layout: 'horizontal-scroll',
                source: 'tenant_kosvidio',
                items: galleryItems.length > 0 ? galleryItems : SECTION_REGISTRY.kosvidioGallery.defaultConfig.items,
                allowVisitorLayoutSwitch: false,
              },
              // Any other sections explicitly hidden
              'contact-1': {
                ...SECTION_REGISTRY.contact.defaultConfig,
                id: 'contact-1',
                type: 'contact',
                visible: false,
              },
            },
          };

          await pageBuilderFirestore.savePage(pageConfig, db, tenantId);

          return {
            success: true,
            pageId: pageConfig.pageId,
            slug: pageConfig.slug,
            publicUrl: `/${pageConfig.slug}`,
            config: pageConfig,
          };
        } catch (err: any) {
          console.error('[KosWebAiHostBridge] Error creating video page:', err);
          return {
            success: false,
            pageId: '',
            slug: '',
            publicUrl: '',
            error: err?.message || 'שגיאה ביצירת עמוד הוידאו.',
          };
        }
      },
    };

    registerCapability('community-webpage', contract);
    registerCapability('page-builder', pageBuilderContract);

    return () => {
      unregisterCapability('community-webpage');
      unregisterCapability('page-builder');
    };
  }, [db, tenantId, registerCapability, unregisterCapability]);

  return null;
};
