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
import { buildPageConfigFromVideo } from '../generators/videoPageBuilder';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';
import { KosvidioGalleryItem } from '../types/sectionConfigs';
import { applyStylePresetToAllTenantPages, resetAllTenantPagesToBrand } from '../services/pageStylePresetService';
import { TenantStylePreset } from '../../../core/contracts';

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

            const rawGallery = options.gallery || options.brandProfile?.gallery || [];
            const cleanGallery = rawGallery.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
            const galleryId = `gallery_${Date.now()}`;

            const initialSectionOrder = [heroId, aboutId, servicesId];
            if (cleanGallery.length > 0) {
              initialSectionOrder.push(galleryId);
            }
            initialSectionOrder.push(ctaId);

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
              sectionOrder: initialSectionOrder,
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
                ...(cleanGallery.length > 0
                  ? {
                      [galleryId]: {
                        id: galleryId,
                        type: 'kosvidioGallery',
                        visible: true,
                        anchorId: 'sec-gallery',
                        badge: '• גלריית קהילה •',
                        title: `גלריית הפעילות של קהילת ${options.pageTitle}`,
                        subtitle: 'רגעים, מפגשים ותיעוד מהשטח',
                        layout: 'standard',
                        viewMode: 'spotlight-grid',
                        source: 'custom',
                        items: cleanGallery.map((imgUrl, i) => ({
                          id: `comm_img_${i}`,
                          title: `פעילות קהילתית #${i + 1}`,
                          subtitle: options.pageTitle,
                          thumbnailUrl: imgUrl,
                          youtubeVideoId: '',
                          category: 'קהילה',
                        })),
                      },
                    }
                  : {}),
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
          const liveBrand = resolveLiveBrandDna(options.brandDna, tenantId);
          const pageConfig = buildPageConfigFromVideo({
            ...options,
            brandDna: liveBrand,
          });

          await pageBuilderFirestore.savePage(pageConfig, db, tenantId);

          return {
            success: true,
            pageId: pageConfig.pageId,
            slug: pageConfig.slug,
            publicUrl: pageConfig.publicUrl || `/kosvidio/${pageConfig.slug}`,
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

    // Dynamic brand style sync for all tenant pages
    const handleApplyAll = async (data: { preset: TenantStylePreset; tenantId: string }) => {
      const targetTenant = data.tenantId || tenantId || '_master';
      try {
        console.log(`[KosWebAiHostBridge] Applying style preset "${data.preset}" to all pages of tenant "${targetTenant}"...`);
        const res = await applyStylePresetToAllTenantPages(db || null, targetTenant, data.preset);
        console.log(`[KosWebAiHostBridge] Successfully applied to ${res.updatedCount} pages.`);
      } catch (err) {
        console.error('[KosWebAiHostBridge] Error applying style preset to all pages:', err);
      }
    };

    const handleResetAll = async (data: { tenantId: string; brandDna?: any }) => {
      const targetTenant = data.tenantId || tenantId || '_master';
      try {
        console.log(`[KosWebAiHostBridge] Resetting all pages of tenant "${targetTenant}" to brand initial state...`);
        const liveBrandDna = data.brandDna || resolveLiveBrandDna(null, targetTenant);
        const res = await resetAllTenantPagesToBrand(db || null, targetTenant, liveBrandDna);
        console.log(`[KosWebAiHostBridge] Successfully reset ${res.updatedCount} pages.`);
      } catch (err) {
        console.error('[KosWebAiHostBridge] Error resetting pages to brand:', err);
      }
    };

    const unsubApply = eventBus.subscribe('brand:apply_style_to_all_pages', handleApplyAll);
    const unsubReset = eventBus.subscribe('brand:reset_all_pages', handleResetAll);

    const onWinApply = (e: any) => {
      if (e?.detail?.preset) {
        handleApplyAll({ preset: e.detail.preset, tenantId: e.detail.tenantId });
      }
    };
    const onWinReset = (e: any) => {
      handleResetAll({ tenantId: e?.detail?.tenantId });
    };
    window.addEventListener('kos_brand_apply_all_pages', onWinApply);
    window.addEventListener('kos_brand_reset_all_pages', onWinReset);

    return () => {
      unregisterCapability('community-webpage');
      unregisterCapability('page-builder');
      unsubApply();
      unsubReset();
      window.removeEventListener('kos_brand_apply_all_pages', onWinApply);
      window.removeEventListener('kos_brand_reset_all_pages', onWinReset);
    };
  }, [db, tenantId, registerCapability, unregisterCapability]);

  return null;
};
