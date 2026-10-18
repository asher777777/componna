import React, { useEffect } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import {
  CommunityWebPageContract,
  CommunityWebPageOptions,
  PageBuilderContract,
  CreatePageFromProductOptions,
  CreateVideoSeoPageOptions,
  CreateCampaignPageOptions,
  BrandDnaContract,
} from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { pageGenerator } from '../generators/pageGenerator';
import { buildPageConfigFromFlagshipProduct } from '../generators/productPageBuilder';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';

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
          const rawSlug = aiData?.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'kosvidio';
          const cleanSlug = rawSlug.startsWith('kosvidio') ? rawSlug : 'kosvidio';
          const pageId = `page_kosvidio_${video.youtubeVideoId}`;
          const title = aiData?.h1 || video.title || 'וידאו ומאמר AI SEO';

          const brandCompanyName = options.brandDna?.identity?.companyName || 'קושאן';
          const brandLogo = options.brandDna?.identity?.logoUrl || '';
          const brandSlogan = options.brandDna?.identity?.slogan || 'וידאו חכם ומאמרי SEO מעמיקים';
          const primaryColor = options.brandDna?.designTokens?.primaryColor || '#ef4444';
          const secondaryColor = options.brandDna?.designTokens?.secondaryColor || '#8b5cf6';
          const whatsapp = options.brandDna?.trust?.whatsappSupportNumber || '';
          const phone = options.brandDna?.trust?.contactPhone || '';
          const email = options.brandDna?.trust?.contactEmail || '';

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
            },
            seoSettings: {
              title: aiData?.metaTitle || title,
              description: aiData?.metaDescription || video.description.slice(0, 160),
              keywords: aiData?.tags || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
            },
            sectionOrder: ['header-1', 'kosvidio-1', 'contact-1'],
            sections: {
              'header-1': {
                ...SECTION_REGISTRY.header.defaultConfig,
                id: 'header-1',
                title: brandCompanyName,
                showLogoText: true,
                logoText: brandCompanyName,
                useBrandLogo: true,
                customLogoUrl: brandLogo,
              },
              'kosvidio-1': {
                ...SECTION_REGISTRY.kosvidio.defaultConfig,
                id: 'kosvidio-1',
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
              },
              'contact-1': {
                ...SECTION_REGISTRY.contact.defaultConfig,
                id: 'contact-1',
                title: `צרו קשר עם ${brandCompanyName}`,
                subtitle: 'יש לכם שאלות או מעוניינים בפרטים נוספים? נשמח לסייע',
                phone,
                email,
                whatsApp: whatsapp,
              },
            },
          };

          await pageBuilderFirestore.savePage(pageConfig, db, tenantId);

          return {
            success: true,
            pageId: pageConfig.pageId,
            slug: pageConfig.slug,
            publicUrl: `/p/${pageConfig.slug}`,
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
