import React, { useEffect } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import {
  CommunityWebPageContract,
  CommunityWebPageOptions,
  PageBuilderContract,
  CreatePageFromProductOptions,
} from '../../../core/contracts';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { aiPageGenerator } from '../services/aiPageGenerator';
import { PageBuilderConfig } from '../types/pageBuilder.types';

export const KosWebAiHostBridge: React.FC = () => {
  const { registerCapability, unregisterCapability } = useHostCapabilities();
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
                  type: 'services',
                  visible: true,
                  title: 'פעילויות ושירותי הקהילה',
                  subtitle: 'מה מחכה לכם אצלנו בקהילה',
                  services: servicesList,
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
          const prompt = `צור עמוד נחיתה מלא וממיר עבור מוצר הדגל הבא:
שם המוצר: ${product.nameAndSlogan}
תיאור קצר: ${product.shortDescription || ''}
תיאור נרחב (SEO): ${product.longDescription || ''}
נקודות כאב שהוא פותר: ${product.painPointSolved || ''}
יתרון תחרותי: ${product.competitiveAdvantage || ''}
קהל יעד: ${product.targetAudience || ''}

חובה לייצר slug באנגלית על בסיס SEO לשם המוצר. עמוד הנחיתה צריך לכלול Hero מרשים ${product.imageUrl ? `(השתמש בתמונה ${product.imageUrl})` : ''}, פירוט היתרונות, התייחסות לנקודות הכאב כ-Features, וקריאה לפעולה מרכזית.`;

          const generatedConfig = await aiPageGenerator.generatePageLive(
            prompt,
            options.brandDna,
            (step) => {
              if (options.onStep) {
                options.onStep({
                  statusText: step.statusText || 'מייצר עמוד...',
                  percent: step.progressPercent,
                });
              }
            },
            { generateImages: false }
          );

          if (product.imageUrl && generatedConfig.sections) {
            const heroSec = Object.values(generatedConfig.sections).find((s: any) => s.type === 'hero');
            if (heroSec) {
              (heroSec as any).imageSrc = product.imageUrl;
              (heroSec as any).imageUrl = product.imageUrl;
            }
          }

          // Save page through pageBuilderFirestore
          await pageBuilderFirestore.savePage(generatedConfig, db, tenantId);

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
            error: err?.message || 'שגיאה ביצירת עמוד הנחיתה עם AI.',
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
