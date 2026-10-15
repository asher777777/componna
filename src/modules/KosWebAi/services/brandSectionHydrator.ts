import { SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { DEFAULT_BRAND_DNA } from '../../KosBranding/types/brandDna';

/**
 * Resolves live Brand DNA from active context, local storage, or populated defaults.
 * Guarantees that branding details are NEVER null or empty.
 */
export function resolveLiveBrandDna(provided?: BrandDna | null, tenantId?: string): BrandDna {
  let loadedDna: BrandDna | null = provided && (provided.identity?.companyName || provided.trust?.contactPhone) ? provided : null;

  if (typeof window !== 'undefined') {
    try {
      const tenantKey = tenantId ? `kosun_${tenantId}_brand_dna_settings` : null;
      const raw = (tenantKey && localStorage.getItem(tenantKey)) ||
                  localStorage.getItem('kosun_brand_dna_settings') ||
                  localStorage.getItem('brand_dna_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.identity?.companyName || parsed?.trust?.contactPhone) {
          loadedDna = {
            ...(loadedDna || DEFAULT_BRAND_DNA),
            ...parsed,
            identity: { ...(loadedDna?.identity || DEFAULT_BRAND_DNA.identity), ...parsed.identity },
            designTokens: { ...(loadedDna?.designTokens || DEFAULT_BRAND_DNA.designTokens), ...parsed.designTokens },
            trust: { ...(loadedDna?.trust || DEFAULT_BRAND_DNA.trust), ...parsed.trust },
            audience: { ...(loadedDna?.audience || DEFAULT_BRAND_DNA.audience), ...parsed.audience },
            ecosystem: { ...(loadedDna?.ecosystem || DEFAULT_BRAND_DNA.ecosystem), ...parsed.ecosystem },
            voice: { ...(loadedDna?.voice || DEFAULT_BRAND_DNA.voice), ...parsed.voice },
          };
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  return loadedDna || DEFAULT_BRAND_DNA;
}

/**
 * Clean numeric WhatsApp URL helper
 */
function buildWhatsAppUrl(rawNumber?: string, message?: string): string {
  if (!rawNumber) return '#contact';
  const digits = rawNumber.replace(/\D/g, '');
  const cleanPhone = digits.startsWith('0') ? `972${digits.slice(1)}` : digits;
  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleanPhone}${encodedMsg}`;
}

/**
 * Injects dynamic Brand DNA information into any newly created section configuration.
 * Adapts to the specific section type to ensure content, contact, and colors reflect the brand immediately.
 */
export function hydrateSectionWithBrandDna(
  baseConfig: any,
  brandDnaInput?: BrandDna | null,
  sectionType?: SectionType
): any {
  const brand = resolveLiveBrandDna(brandDnaInput);
  const type = sectionType || baseConfig?.type;
  const cloned = JSON.parse(JSON.stringify(baseConfig || {}));

  const companyName = brand.identity?.companyName || 'קושאן';
  const slogan = brand.identity?.slogan || 'כל אדם זה נכס';
  const logoUrl = brand.identity?.logoUrl || '/images/kosun-logo.svg';
  const uvp = brand.audience?.mainUvp || brand.identity?.companyVision || slogan;
  const phone = brand.trust?.contactPhone || '052-6968008';
  const email = brand.trust?.contactEmail || 'ovt5771@gmail.com';
  const whatsapp = brand.trust?.whatsappSupportNumber || '0526968008';
  const address = brand.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';
  const primaryColor = brand.designTokens?.primaryColor;
  const secondaryColor = brand.designTokens?.secondaryColor;
  const services = brand.ecosystem?.services || [];
  const commonObjections = brand.audience?.commonObjections || [];

  cloned.brandDnaSynced = true;

  // Apply colors if section supports them and not explicitly locked
  if (primaryColor) {
    if ('primaryColor' in cloned) cloned.primaryColor = primaryColor;
    if ('accentColor' in cloned && !cloned.accentColor) cloned.accentColor = primaryColor;
  }
  if (secondaryColor && 'secondaryColor' in cloned) {
    cloned.secondaryColor = secondaryColor;
  }

  // Section Type Specific Hydration
  switch (type) {
    case 'header': {
      cloned.logoText = companyName;
      cloned.useBrandLogo = true;
      if (logoUrl) cloned.customLogoUrl = logoUrl;
      cloned.phone = phone;
      cloned.whatsApp = whatsapp;
      cloned.showPhone = Boolean(phone);
      cloned.showWhatsApp = Boolean(whatsapp);
      break;
    }

    case 'hero': {
      cloned.badge = companyName;
      cloned.title = `${companyName} - ${slogan}`;
      cloned.subtitle = uvp;
      if (!cloned.primaryButton || cloned.primaryButton.text === 'התחל עכשיו') {
        cloned.primaryButton = { text: 'לפנייה ופרטים נוספים', url: '#contact' };
      }
      if (!cloned.secondaryButton) {
        cloned.secondaryButton = {
          text: 'שיחה מהירה ב-WhatsApp',
          url: buildWhatsAppUrl(whatsapp, `שלום, הגעתי דרך האתר של ${companyName}`),
        };
      }
      break;
    }

    case 'contact': {
      cloned.title = `יצירת קשר עם ${companyName}`;
      cloned.subtitle = slogan ? `${slogan} • נשמח לעמוד לשירותכם` : 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות';
      cloned.phone = phone;
      cloned.email = email;
      cloned.whatsapp = whatsapp;
      cloned.address = address;
      break;
    }

    case 'geoLocal': {
      cloned.businessName = companyName;
      cloned.title = `שירות ${companyName} באזורכם`;
      cloned.subtitle = slogan;
      cloned.phone = phone;
      cloned.email = email;
      cloned.whatsapp = whatsapp;
      cloned.address = address;
      cloned.serviceArea = address ? `מרכז הפעילות: ${address}` : 'בפריסה ארצית וזמינות גבוהה';
      break;
    }

    case 'faq': {
      cloned.subtitle = `כל מה שחשוב לדעת על ${companyName}`;
      if (commonObjections.length > 0) {
        const dynamicFaq = commonObjections.map((item, idx) => ({
          id: `faq_${idx + 1}`,
          question: item.objection,
          answer: item.rebuttal,
        }));
        if (brand.trust?.refundPolicySummary) {
          dynamicFaq.push({
            id: 'faq_policy',
            question: 'מהי מדיניות האחריות והשירות?',
            answer: brand.trust.refundPolicySummary,
          });
        }
        cloned.items = dynamicFaq;
      }
      break;
    }

    case 'pricing': {
      cloned.subtitle = `מסלולים ופתרונות בהתאמה אישית מאת ${companyName}`;
      // If the brand has distinct packages, inject them
      if (Array.isArray(brand.ecosystem?.businessPackages) && brand.ecosystem.businessPackages.length > 0) {
        cloned.plans = brand.ecosystem.businessPackages.map((pkg: any, idx) => ({
          id: `plan_${idx + 1}`,
          name: pkg.name || `חבילה ${idx + 1}`,
          price: pkg.price ? `${pkg.price}` : 'בהתאמה אישית',
          period: pkg.billingPeriod || 'חודשי',
          description: pkg.description || pkg.competitiveAdvantage || '',
          highlight: idx === 1,
          features: Array.isArray(pkg.features) && pkg.features.length > 0
            ? pkg.features
            : [pkg.competitiveAdvantage, pkg.painPointsAddressed, ...services.slice(0, 3)].filter(Boolean),
          ctaText: pkg.callToAction || 'בחירה במסלול',
          ctaUrl: buildWhatsAppUrl(whatsapp, `היי, אני מעוניין בחבילת ${pkg.name} של ${companyName}`),
        }));
      } else if (services.length > 0 && Array.isArray(cloned.plans)) {
        // Hydrate features with real brand services
        cloned.plans = cloned.plans.map((p: any, idx: number) => ({
          ...p,
          features: services.slice(idx * 2, idx * 2 + 4).length > 0 ? services.slice(idx * 2, idx * 2 + 4) : p.features,
          ctaUrl: buildWhatsAppUrl(whatsapp, `היי, מעוניין במסלול ${p.name}`),
        }));
      }
      break;
    }

    case 'statsBento': {
      cloned.title = `היתרונות המובילים של ${companyName}`;
      cloned.description = uvp;
      if (services.length > 0 && Array.isArray(cloned.items)) {
        cloned.items = cloned.items.map((item: any, idx: number) => {
          if (services[idx]) {
            return {
              ...item,
              title: services[idx],
              description: `פתרון מתקדם מבית ${companyName} המבטיח מקצועיות ותוצאות מוכחות.`,
            };
          }
          return item;
        });
      }
      break;
    }

    case 'testimonials': {
      cloned.title = `מה הלקוחות מספרים על ${companyName}?`;
      cloned.trustBadgeText = `לקוחות מאומתים של ${companyName}`;
      if (Array.isArray(brand.audience?.personas) && brand.audience.personas.length > 0 && Array.isArray(cloned.items)) {
        cloned.items = cloned.items.map((item: any, idx: number) => {
          const persona = brand.audience?.personas[idx];
          if (persona) {
            return {
              ...item,
              name: persona.name.split(',')[0].trim(),
              role: persona.roleOrProfile || item.role,
              content: `״${persona.dreamOutcome || item.content} - קיבלנו מענה מדויק ושירות מקצועי מכל הלב מ-${companyName}.״`,
            };
          }
          return item;
        });
      }
      break;
    }

    case 'flowPlayer':
    case 'tiktokHero':
    case 'kosvidio': {
      cloned.title = cloned.title || `${companyName} - צפו בסיפור שלנו`;
      cloned.headline = cloned.headline || companyName;
      cloned.subheadline = cloned.subheadline || slogan;
      cloned.ctaButtonText = 'לשיחה מהירה ב-WhatsApp';
      cloned.ctaButtonUrl = buildWhatsAppUrl(whatsapp, `היי, הגעתי דרך הווידאו של ${companyName}`);
      break;
    }

    case 'eventRsvp': {
      cloned.organizer = companyName;
      cloned.contactPhone = phone;
      cloned.contactEmail = email;
      break;
    }

    case 'community': {
      cloned.title = `קהילת ${companyName}`;
      cloned.subtitle = slogan;
      cloned.whatsappLink = buildWhatsAppUrl(whatsapp, `היי, אני רוצה להצטרף לקהילה של ${companyName}`);
      break;
    }

    default: {
      // General fallbacks for common fields across any section type
      if ('companyName' in cloned && !cloned.companyName) cloned.companyName = companyName;
      if ('businessName' in cloned && !cloned.businessName) cloned.businessName = companyName;
      if ('phone' in cloned && !cloned.phone) cloned.phone = phone;
      if ('email' in cloned && !cloned.email) cloned.email = email;
      if ('whatsapp' in cloned && !cloned.whatsapp) cloned.whatsapp = whatsapp;
      if ('address' in cloned && !cloned.address) cloned.address = address;
      break;
    }
  }

  return cloned;
}

/**
 * Factory function for creating a new fully-hydrated section data object
 */
export function createDynamicSectionConfig(
  type: SectionType,
  brandDnaInput?: BrandDna | null,
  defaultConfig?: any,
  tenantId?: string
): any {
  const brand = resolveLiveBrandDna(brandDnaInput, tenantId);
  const now = Date.now();
  const id = `${type}_${now}`;
  const anchorId = `${type}_${now.toString().slice(-4)}`;

  const base = defaultConfig ? JSON.parse(JSON.stringify(defaultConfig)) : { type, visible: true };
  base.id = id;
  base.type = type;
  base.visible = true;
  base.anchorId = base.anchorId || anchorId;

  return hydrateSectionWithBrandDna(base, brand, type);
}
