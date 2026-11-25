import { Firestore } from 'firebase/firestore';
import { BrandDna, MarketResearchItem, TenantStylePreset } from '../types/brandDna';
import { PageBuilderConfig } from '../../KosWebAi/types/pageBuilder.types';
import { pageBuilderFirestore } from '../../KosWebAi/services/pageBuilderFirestore';
import { createDynamicSectionConfig } from '../../KosWebAi/services/brandSectionHydrator';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';

function buildSlug(title: string, id: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 36);
  const shortId = id.replace(/[^a-z0-9]/gi, '').slice(-5) || String(Date.now()).slice(-5);
  return `research-${clean || 'info'}-${shortId}`;
}

function buildPublicUrl(slug: string, tenantId: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (!tenantId || tenantId === ROOT_TENANT_ID || tenantId === '_master') {
      return `${origin}/${slug}`;
    }
    return `${origin}/${tenantId}/${slug}`;
  }
  return `/${slug}`;
}

/**
 * מפיק עמוד מידע מלא לשימוש חוזר מתוך פריט מחקר שוק או סריקת אתר, ושומר אותו בקולקציית העמודים (KosWebAi).
 */
export async function generateInfoPageFromMarketResearch(
  item: MarketResearchItem,
  brandDna: BrandDna,
  db?: Firestore | null,
  tenantId?: string
): Promise<{
  pageConfig: PageBuilderConfig;
  pageId: string;
  slug: string;
  publicUrl: string;
}> {
  const activeTenant = tenantId || resolveCurrentTenantId() || ROOT_TENANT_ID;
  const pageId = item.infoPageId || `page_research_${item.id}`;
  const slug = item.infoPageSlug || buildSlug(item.title, item.id);
  const preset: TenantStylePreset = (brandDna?.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard';

  const headerSec = createDynamicSectionConfig('header', brandDna, preset, activeTenant);
  const heroSec = createDynamicSectionConfig('hero', brandDna, preset, activeTenant);
  const richSec = createDynamicSectionConfig('richContent', brandDna, preset, activeTenant);
  const contactSec = createDynamicSectionConfig('contact', brandDna, preset, activeTenant);

  const isScan = item.type === 'website_scan';
  const badgeLabel = isScan ? 'דוח סריקת אתר ומיתוג (KOSAI)' : 'דוח מחקר שוק ומתחרים (AI)';

  // Build structured HTML content for richContent section
  const htmlBlocks: string[] = [];
  htmlBlocks.push(`<div dir="rtl" style="text-align:right; line-height:1.8;">`);
  htmlBlocks.push(`<h2>תקציר מנהלים</h2>`);
  htmlBlocks.push(`<p>${item.summary || 'דוח מחקר שוק ומיתוג.'}</p>`);

  if (item.sourceUrl) {
    htmlBlocks.push(`<p><strong>מקור סריקה:</strong> <a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">${item.sourceUrl}</a></p>`);
  }

  if (item.marketTrends && item.marketTrends.length > 0) {
    htmlBlocks.push(`<h3>מגמות מרכזיות בשוק</h3><ul>${item.marketTrends.map((t) => `<li>${t}</li>`).join('')}</ul>`);
  }

  if (item.competitiveness) {
    htmlBlocks.push(`<h3>יתרון תחרותי ופערים</h3><p>${item.competitiveness}</p>`);
  }

  if (item.pricingRecommendations) {
    htmlBlocks.push(`<h3>המלצות תמחור</h3><p>${item.pricingRecommendations}</p>`);
  }

  if (item.designLanguageRecommendations) {
    htmlBlocks.push(`<h3>שפה עיצובית מומלצת</h3><p>${item.designLanguageRecommendations}</p>`);
  }

  if (item.competitors && item.competitors.length > 0) {
    htmlBlocks.push(`<h3>ניתוח מתחרים</h3><ul>`);
    for (const c of item.competitors) {
      htmlBlocks.push(
        `<li><strong>${c.name}</strong>${c.pricingTier ? ` (${c.pricingTier})` : ''}${c.strengths ? ` — חוזקות: ${c.strengths}` : ''}${c.weaknesses ? ` | חולשות: ${c.weaknesses}` : ''}</li>`
      );
    }
    htmlBlocks.push(`</ul>`);
  }

  if (item.learnedSiteProfile) {
    const lp = item.learnedSiteProfile;
    htmlBlocks.push(`<h3>מאפייני עיצוב ופריסה שנלמדו</h3>`);
    if (lp.designElementsSummary) htmlBlocks.push(`<p>${lp.designElementsSummary}</p>`);
    if (lp.layoutNotes) htmlBlocks.push(`<p>${lp.layoutNotes}</p>`);
    if (lp.extractedPalette && lp.extractedPalette.length > 0) {
      htmlBlocks.push(
        `<p><strong>פלטת צבעים:</strong> ${lp.extractedPalette
          .map(
            (hex) =>
              `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:6px;background:${hex};color:#fff;font-family:monospace;font-size:12px;">${hex}</span>`
          )
          .join(' ')}</p>`
      );
    }
  }

  htmlBlocks.push(`</div>`);

  const nowIso = new Date().toISOString();

  const pageConfig: PageBuilderConfig = {
    pageId,
    slug,
    pageTitle: `${item.title} — עמוד מידע`,
    pageCategory: 'info',
    isPublished: true,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastModified: Date.now(),
    sectionOrder: ['header', 'hero', 'richContent', 'contact'],
    globalSettings: {
      theme: preset,
      primaryColor: item.extractedBrand?.designTokens?.primaryColor || brandDna.designTokens.primaryColor,
      secondaryColor: item.extractedBrand?.designTokens?.secondaryColor || brandDna.designTokens.secondaryColor,
      backgroundColor: item.extractedBrand?.designTokens?.backgroundColor || brandDna.designTokens.backgroundColor,
      textColor: item.extractedBrand?.designTokens?.textColor || brandDna.designTokens.textColor,
      buttonBgColor: item.extractedBrand?.designTokens?.buttonBgColor || brandDna.designTokens.buttonBgColor,
      buttonTextColor: item.extractedBrand?.designTokens?.buttonTextColor || brandDna.designTokens.buttonTextColor,
      fontFamily: item.extractedBrand?.designTokens?.fontFamily || brandDna.designTokens.fontFamily,
      borderRadius: item.extractedBrand?.designTokens?.borderRadius || brandDna.designTokens.borderRadius,
      buttonStyle: item.extractedBrand?.designTokens?.buttonStyle || brandDna.designTokens.buttonStyle,
      siteTitle: brandDna.identity.companyName || item.title,
      siteLogoUrl: brandDna.identity.logoUrl || '',
    },
    seoSettings: {
      title: `${item.title} — דף מידע`,
      description: item.summary.slice(0, 155),
    },
    sections: {
      header: headerSec,
      hero: {
        ...heroSec,
        badgeText: badgeLabel,
        title: item.title,
        subtitle: item.summary,
        ctaPrimaryText: 'צור קשר לפרטים',
        ctaSecondaryText: '',
      },
      richContent: {
        ...richSec,
        title: 'ממצאי המחקר והתובנות',
        content: htmlBlocks.join('\n'),
        htmlContent: htmlBlocks.join('\n'),
      },
      contact: contactSec,
    },
  };

  await pageBuilderFirestore.savePage(pageConfig, db || null, activeTenant);

  return {
    pageConfig,
    pageId,
    slug,
    publicUrl: buildPublicUrl(slug, activeTenant),
  };
}
