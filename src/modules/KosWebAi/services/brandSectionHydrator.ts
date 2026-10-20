import { SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { DEFAULT_BRAND_DNA } from '../../KosBranding/types/brandDna';
import { createTenantInitialBrandDna } from '../../KosBranding/services/brandDnaFirestore';
import { resolveCurrentTenantId } from '../../../core/tenant';
import { buildDefaultBrandUiVocabulary } from '../../KosBranding/services/brandCopilotService';

/**
 * Resolves live Brand DNA from active context, tenant-scoped local storage, or tenant defaults.
 * Never overwrites a subdomain tenant's Brand DNA with Manager (_master) Brand DNA.
 */
export function resolveLiveBrandDna(provided?: BrandDna | null, tenantId?: string): BrandDna {
  const effTenant = tenantId || (typeof window !== 'undefined' ? resolveCurrentTenantId() : '_master') || '_master';
  const isMaster = effTenant === '_master';
  const baseDefault = isMaster ? DEFAULT_BRAND_DNA : createTenantInitialBrandDna(effTenant);

  const hasProvidedIdentity = Boolean(
    provided &&
      (provided.identity?.companyName ||
        (provided.identity as any)?.brandName ||
        provided.identity?.slogan ||
        provided.audience?.mainUvp ||
        provided.trust?.contactPhone)
  );

  if (hasProvidedIdentity && provided) {
    const cleanIdentity = { ...baseDefault.identity, ...(provided.identity || {}) };
    if (!isMaster) {
      if (cleanIdentity.companyName === 'קושאן' || !cleanIdentity.companyName) {
        cleanIdentity.companyName = (provided.identity as any)?.brandName || effTenant;
      }
      if (cleanIdentity.slogan === 'כל אדם זה נכס') {
        cleanIdentity.slogan = '';
      }
      if (cleanIdentity.logoUrl === '/images/kosun-logo.svg') {
        cleanIdentity.logoUrl = '';
      }
    }
    return {
      ...baseDefault,
      ...provided,
      identity: cleanIdentity,
      designTokens: { ...baseDefault.designTokens, ...(provided.designTokens || {}) },
      trust: { ...baseDefault.trust, ...(provided.trust || {}) },
      audience: { ...baseDefault.audience, ...(provided.audience || {}) },
      ecosystem: {
        services: provided.ecosystem?.services || baseDefault.ecosystem?.services || [],
        products: provided.ecosystem?.products || baseDefault.ecosystem?.products || [],
        annualEvents: provided.ecosystem?.annualEvents || baseDefault.ecosystem?.annualEvents || [],
        communities: provided.ecosystem?.communities || baseDefault.ecosystem?.communities || [],
        ...(provided.ecosystem || {}),
      },
      voice: { ...baseDefault.voice, ...(provided.voice || {}) },
      uiVocabulary: provided.uiVocabulary || (baseDefault as any).uiVocabulary,
    };
  }

  let loadedDna: BrandDna | null = null;

  if (typeof window !== 'undefined') {
    try {
      const primaryTenantKey = `kosun_${effTenant}_kos_branding_settings`;
      const legacyTenantKey = `kosun_${effTenant}_brand_dna_settings`;
      const raw =
        localStorage.getItem(primaryTenantKey) ||
        localStorage.getItem(legacyTenantKey) ||
        (isMaster
          ? localStorage.getItem('kos_branding_settings') ||
            localStorage.getItem('kosun_brand_dna_settings') ||
            localStorage.getItem('brand_dna_settings')
          : null);

      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed?.identity?.companyName ||
          parsed?.identity?.brandName ||
          parsed?.identity?.slogan ||
          parsed?.audience?.mainUvp ||
          parsed?.trust?.contactPhone
        ) {
          const cleanIdentity = { ...baseDefault.identity, ...(parsed.identity || {}) };
          if (!isMaster) {
            if (cleanIdentity.companyName === 'קושאן' || !cleanIdentity.companyName) {
              cleanIdentity.companyName = parsed?.identity?.brandName || effTenant;
            }
            if (cleanIdentity.slogan === 'כל אדם זה נכס') {
              cleanIdentity.slogan = '';
            }
            if (cleanIdentity.logoUrl === '/images/kosun-logo.svg') {
              cleanIdentity.logoUrl = '';
            }
          }
          loadedDna = {
            ...baseDefault,
            ...parsed,
            identity: cleanIdentity,
            designTokens: { ...baseDefault.designTokens, ...(parsed.designTokens || {}) },
            trust: { ...baseDefault.trust, ...(parsed.trust || {}) },
            audience: { ...baseDefault.audience, ...(parsed.audience || {}) },
            ecosystem: { ...baseDefault.ecosystem, ...(parsed.ecosystem || {}) },
            voice: { ...baseDefault.voice, ...(parsed.voice || {}) },
            uiVocabulary: parsed.uiVocabulary || (baseDefault as any).uiVocabulary,
          };
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  const result = loadedDna || baseDefault;
  if (!isMaster && !result.identity?.companyName) {
    result.identity = { ...result.identity, companyName: effTenant };
  }
  return result;
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
  sectionType?: SectionType,
  tenantId?: string
): any {
  const effTenant = tenantId || (typeof window !== 'undefined' ? resolveCurrentTenantId() : '_master') || '_master';
  const isMaster = effTenant === '_master';
  const brand = resolveLiveBrandDna(brandDnaInput, effTenant);
  const type = sectionType || baseConfig?.type;
  const cloned = JSON.parse(JSON.stringify(baseConfig || {}));

  const companyName =
    brand.identity?.companyName ||
    (brand.identity as any)?.brandName ||
    (isMaster ? 'קושאן' : '');
  const slogan = brand.identity?.slogan || (isMaster ? 'כל אדם זה נכס' : '');
  const logoUrl = brand.identity?.logoUrl || (isMaster ? '/images/kosun-logo.svg' : '');
  const uvp = brand.audience?.mainUvp || brand.identity?.companyVision || slogan;
  const phone = brand.trust?.contactPhone || (isMaster ? '052-6968008' : '');
  const email = brand.trust?.contactEmail || (isMaster ? 'ovt5771@gmail.com' : '');
  const whatsapp = brand.trust?.whatsappSupportNumber || (isMaster ? '0526968008' : '');
  const address = brand.trust?.officeAddress || (isMaster ? 'דרך מנחם בגין 144, תל אביב' : '');
  const primaryColor = brand.designTokens?.primaryColor;
  const secondaryColor = brand.designTokens?.secondaryColor;
  const services = brand.ecosystem?.services || [];
  const commonObjections = brand.audience?.commonObjections || [];
  const uiVocab = brand.uiVocabulary || buildDefaultBrandUiVocabulary(brand);
  const headings = uiVocab.sectionHeadings || {};

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
      cloned.badge = headings.heroBadge || companyName;
      cloned.title = headings.heroTitle || (slogan ? `${companyName} - ${slogan}` : companyName);
      cloned.subtitle = headings.heroSubtitle || uvp;
      if (!cloned.description || cloned.description.includes('עצבו, ערכו ופרסמו דפי אינטרנט')) {
        cloned.description = headings.heroDescription || brand.identity?.shortVision || brand.identity?.companyVision || cloned.description;
      }
      if (!cloned.announcementBadge || cloned.announcementBadge.text === 'שחרור רשמי של גרסת 2026 זמין כעת') {
        cloned.announcementBadge = {
          text: headings.heroBadge || slogan || `${companyName} 2026`,
          url: '#about',
        };
      }
      if (!cloned.imageBadge || !cloned.imageBadge.text) {
        cloned.imageBadge = {
          visible: true,
          text: headings.heroBadge || slogan || companyName,
        };
      }
      if (!cloned.primaryButton || cloned.primaryButton.text === 'התחל עכשיו' || cloned.primaryButton.text === 'לפנייה ופרטים נוספים' || cloned.primaryButton.text === 'התחל עכשיו בחינם') {
        cloned.primaryButton = { text: uiVocab.primaryCta || 'לפרטים והצטרפות', url: '#contact' };
      }
      if (!cloned.secondaryButton || cloned.secondaryButton.text === 'שיחה מהירה ב-WhatsApp' || cloned.secondaryButton.text === 'צפה בהדגמה חיה') {
        cloned.secondaryButton = {
          text: uiVocab.whatsappCta || 'שיחה מהירה ב-WhatsApp',
          url: buildWhatsAppUrl(whatsapp, `שלום, הגעתי דרך האתר של ${companyName}`),
        };
      }
      break;
    }

    case 'contact': {
      cloned.title = headings.contactHeading || (companyName ? `יצירת קשר עם ${companyName}` : cloned.title);
      cloned.subtitle = headings.contactSubtitle || (slogan ? `${slogan} • נשמח לעמוד לשירותכם` : 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות');
      cloned.phone = phone;
      cloned.email = email;
      cloned.whatsapp = whatsapp;
      cloned.address = address;
      if (uiVocab.formSubmitText) cloned.submitText = uiVocab.formSubmitText;
      if (uiVocab.namePlaceholder) cloned.namePlaceholder = uiVocab.namePlaceholder;
      if (uiVocab.phonePlaceholder) cloned.phonePlaceholder = uiVocab.phonePlaceholder;
      if (uiVocab.emailPlaceholder) cloned.emailPlaceholder = uiVocab.emailPlaceholder;
      if (uiVocab.messagePlaceholder) cloned.messagePlaceholder = uiVocab.messagePlaceholder;
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

    case 'mainContent': {
      cloned.title = companyName ? `הצטרפו לתכנית ההכשרה והמומחיות מבית ${companyName}` : cloned.title;
      cloned.subtitle = slogan || 'הרשמה מוקדמת בתנאים מועדפים';
      cloned.badge = companyName ? `• ${companyName} ACADEMY •` : '• תכנית הדגל •';
      
      const featuresList: string[] = [];
      if (services.length > 0) {
        featuresList.push(`מומחיות ופרקטיקה ב-${typeof services[0] === 'string' ? services[0] : (services[0] as any).title}`);
        if (services.length > 1) {
          featuresList.push(`כלים יישומיים מתקדמים ב-${typeof services[1] === 'string' ? services[1] : (services[1] as any).title}`);
        }
      } else {
        featuresList.push(`ליווי אישי של מנטור צמוד מבית ${companyName}`);
        featuresList.push('פרויקטים מעשיים מהעולם האמיתי');
      }
      featuresList.push(`תעודת הסמכה וליווי לתוצאות מוכחות מבית ${companyName}`);
      featuresList.push(`גישה בלעדית לקהילת הבוגרים ומאגרי המידע`);
      cloned.features = featuresList;

      if (brand.identity?.vibeImages && brand.identity.vibeImages.length > 0) {
        cloned.imageSrc = brand.identity.vibeImages[0];
      } else if (brand.identity?.logoUrl) {
        cloned.imageSrc = brand.identity.logoUrl;
      }

      cloned.primaryButton = {
        text: 'שריינו מקום עכשיו',
        url: buildWhatsAppUrl(whatsapp, `שלום, אני מעוניין להירשם לתכנית של ${companyName}`),
      };
      if (primaryColor) {
        cloned.bottomStripeColor = primaryColor;
      }
      break;
    }

    case 'imageListing': {
      cloned.title = headings.galleryHeading || (companyName ? `גלריית ${companyName}` : cloned.title);
      cloned.subtitle = headings.gallerySubtitle || slogan || 'הצצה לעולם העשיר, ליצירה ולפרויקטים המובילים שלנו';
      cloned.badge = companyName ? `• ${companyName} SHOWCASE •` : '• גלריית מדיה •';
      if (brand.identity?.vibeImages && brand.identity.vibeImages.length > 0) {
        cloned.images = brand.identity.vibeImages.map((url, idx) => ({
          id: `brand-vibe-${idx + 1}`,
          imageUrl: url,
          title: `פרויקט ${idx + 1} • ${companyName}`,
          subtitle: slogan || 'תיעוד בלעדי מהשטח',
          tag: 'פרויקט נבחר',
        }));
      }
      break;
    }

    case 'faq': {
      cloned.title = headings.faqHeading || cloned.title || 'שאלות ותשובות נפוצות';
      cloned.subtitle = headings.faqSubtitle || `כל מה שחשוב לדעת על ${companyName}`;
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
      cloned.title = companyName ? `המדדים והתוצאות של ${companyName}` : 'התוצאות מדברות בעד עצמן';
      cloned.subtitle = slogan || 'היקף המחקרים, הקריאות והערך המקצועי';
      cloned.badge = companyName ? `• ${companyName} METRICS •` : '• מדדי ביצוע מובילים •';
      cloned.description = uvp || `הנתונים והמדדים המרכזיים שמניעים את ההצלחה והתוצאות המוכחות של ${companyName}.`;
      cloned.layout = cloned.layout || 'standard';
      cloned.viewMode = cloned.viewMode || 'grid-4';
      cloned.objectScale = cloned.objectScale || 'normal';
      cloned.buttonShape = cloned.buttonShape || 'rounded';
      cloned.buttonSize = cloned.buttonSize || 'md';
      if (primaryColor) {
        cloned.accentColor = primaryColor;
      }
      if (!Array.isArray(cloned.stats) || cloned.stats.length === 0) {
        cloned.stats = [
          { id: '1', number: '99.8', suffix: '%', label: 'שביעות רצון לקוחות', description: `מדד שירות מעולה מבית ${companyName}`, color: 'emerald', icon: 'Heart' },
          { id: '2', number: '12,500', prefix: '+', suffix: '', label: 'משתמשים פעילים', description: 'קהילה בצמיחה מתמדת', color: 'indigo', icon: 'Users' },
          { id: '3', number: '3.4', prefix: 'x', suffix: '', label: 'גידול ממוצע בהמרות', description: 'תוצאה מוכחת לכל לקוח', color: 'purple', icon: 'TrendingUp' },
          { id: '4', number: '24/7', suffix: '', label: 'תמיכה וליווי אישי', description: 'מענה אנושי מהיר בוואטסאפ', color: 'amber', icon: 'Sparkles' },
        ];
      }
      break;
    }

    case 'landingSection': {
      cloned.title = headings.landingHeading || (companyName ? `השאירו פרטים לקבלת מידע נוסף מ-${companyName}` : (cloned.title || 'השאירו פרטים לקבלת מידע נוסף'));
      cloned.subtitle = headings.landingSubtitle || slogan || cloned.subtitle || 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון';
      cloned.badge = companyName ? `• ${companyName} LEADS •` : (cloned.badge || '• קבלת מידע נוסף •');
      cloned.description = uvp || cloned.description || `מלאו את הפרטים הקצרים בטופס ונציג מקצועי מבית ${companyName || 'שלנו'} יחזור אליכם בהקדם האפשרי.`;
      cloned.buttonText = uiVocab.formSubmitText || cloned.buttonText || 'שליחת פרטים עכשיו';
      cloned.modalButtonText = cloned.modalButtonText || 'השאירו פרטים לקבלת מידע';
      cloned.layout = cloned.layout || 'standard';
      cloned.formPosition = cloned.formPosition || 'left';
      cloned.objectScale = cloned.objectScale || 'normal';
      cloned.buttonShape = cloned.buttonShape || 'rounded';
      cloned.buttonSize = cloned.buttonSize || 'md';
      if (primaryColor) {
        cloned.accentColor = primaryColor;
      }
      break;
    }

    case 'livePosts': {
      const tenantPreset = brand.designTokens?.defaultStylePreset;
      if (tenantPreset) {
        cloned.layout = tenantPreset as any;
      } else {
        cloned.layout = cloned.layout || 'standard';
      }
      cloned.title = companyName ? `עדכונים ואירועים אחרונים מ-${companyName}` : (cloned.title || 'עדכונים ואירועים אחרונים');
      cloned.subtitle = slogan || cloned.subtitle || 'כל מה שחדש וקורה בפעילות ובקהילה שלנו';
      cloned.description = uvp || cloned.description || 'הישארו מעודכנים בכל הפעילויות, ההרצאות, האירועים והחדשות.';
      cloned.ctaText = cloned.ctaText || 'לכל האירועים והחדשות';
      cloned.ctaUrl = buildWhatsAppUrl(whatsapp, `היי, קראתי על העדכונים של ${companyName} ואשמח לשמוע פרטים נוספים`);
      cloned.displayMode = cloned.displayMode || 'grid';
      cloned.objectScale = cloned.objectScale || 'normal';
      cloned.buttonShape = cloned.buttonShape || 'rounded';
      cloned.buttonSize = cloned.buttonSize || 'md';
      if (primaryColor) {
        cloned.accentColor = primaryColor;
      }
      break;
    }

    case 'testimonials': {
      cloned.title = headings.testimonialsHeading || `מה מספרים עלינו?`;
      cloned.subtitle = headings.testimonialsSubtitle || 'עדויות ומשובים מהשטח';
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

    case 'tiktokHero': {
      cloned.headline = companyName ? `${companyName} • ${slogan}` : 'חוויית וידאו יוקרתית';
      if (cloned.card) {
        cloned.card.tag = `• ${companyName} • ${slogan} •`;
        cloned.card.title = companyName;
        cloned.card.subtitle = uvp || (slogan ? `${slogan} • מענה מדויק ואיכותי לכל לקוח` : 'פתרון יוקרתי ומותאם אישית');
      }
      cloned.modalTitle = `השארת פרטים לקבלת הצעה • ${companyName}`;
      cloned.modalSubtitle = slogan ? `${slogan} • השאירו פרטים ונשוב אליכם בהקדם` : 'השאירו פרטים ונציגנו יחזרו אליכם בהקדם האפשרי';
      if (cloned.ctaButton) {
        cloned.ctaButton.text = 'השאירו פרטים לקבלת הצעה';
        cloned.ctaButton.actionType = 'modal_form';
      }
      break;
    }

    case 'flowPlayer':
    case 'kosvidio': {
      cloned.title = `${companyName} - צפו בסיפור שלנו`;
      cloned.headline = companyName;
      cloned.subheadline = slogan;
      cloned.ctaButtonText = 'לשיחה מהירה ב-WhatsApp';
      cloned.ctaButtonUrl = buildWhatsAppUrl(whatsapp, `היי, הגעתי דרך הווידאו של ${companyName}`);
      break;
    }

    case 'videoEngagement': {
      cloned.title = companyName ? `אינטראקציה, שיתוף ותגובות • ${companyName}` : cloned.title;
      cloned.videoTitle = companyName ? `הסרטון של ${companyName}` : cloned.videoTitle;
      cloned.shareTitle = companyName ? `צפו בסרטון מבית ${companyName}` : cloned.shareTitle;
      
      const brandTags: string[] = [];
      if (companyName) brandTags.push(companyName);
      if (services.length > 0) {
        services.slice(0, 3).forEach((s: any) => {
          const name = typeof s === 'string' ? s : s.title;
          if (name && !brandTags.includes(name)) brandTags.push(name);
        });
      }
      brandTags.push('וידאו', 'KOSUN');
      cloned.tags = brandTags;

      // Default is icons + tooltip without text label
      cloned.socialButtonsStyle = 'icons-only';
      cloned.showButtonLabels = false;
      cloned.layout = 'standard';

      if (primaryColor) {
        cloned.accentColor = primaryColor;
      }
      break;
    }

    case 'kosvidioGallery': {
      cloned.source = cloned.source || 'tenant_kosvidio';
      cloned.layout = cloned.layout || 'standard';
      cloned.viewMode = cloned.viewMode || 'spotlight-grid';
      cloned.objectScale = cloned.objectScale || 'normal';
      cloned.buttonShape = cloned.buttonShape || 'rounded';
      cloned.buttonSize = cloned.buttonSize || 'md';
      cloned.badge = companyName ? `• ${companyName} VIDEO •` : '• ספריית וידאו חכמה •';
      cloned.title = companyName ? `ספריית הוידאו והתוכן של ${companyName}` : 'ספריית הוידאו והתוכן';
      cloned.subtitle = slogan || 'סרטונים, הדרכות ותוכן בלעדי';
      cloned.description =
        uvp ||
        (companyName
          ? `צפו בסרטונים, בהדרכות ובתכנים המובילים של ${companyName}.`
          : 'סרטונים, הדרכות ותוכן בלעדי');
      cloned.channelName = companyName;
      cloned.channelSlogan = slogan;
      cloned.channelAvatarUrl = logoUrl;
      cloned.ctaButtonText = companyName ? `לכל הסרטונים של ${companyName}` : 'לכל הסרטונים וההדרכות';
      cloned.ctaButtonUrl = '/kosvidio';
      if (primaryColor) {
        cloned.accentColor = primaryColor;
      }
      // Keep existing configured video items intact
      cloned.items = Array.isArray(baseConfig?.items)
        ? baseConfig.items
        : Array.isArray(cloned.items)
          ? cloned.items
          : [];
      break;
    }

    case 'features': {
      cloned.title = headings.advantagesHeading || `למה לבחור ב-${companyName}?`;
      cloned.subtitle = headings.advantagesSubtitle || uvp || slogan;
      if (services.length > 0 && Array.isArray(cloned.items)) {
        cloned.items = cloned.items.map((it: any, idx: number) => {
          if (services[idx]) {
            return {
              ...it,
              title: services[idx],
              description: `פתרון מקצועי ואמין מבית ${companyName}.`,
            };
          }
          return it;
        });
      }
      break;
    }

    case 'about': {
      cloned.title = headings.aboutHeading || `אודות ${companyName}`;
      cloned.subtitle = headings.aboutSubtitle || slogan;
      if (uvp) cloned.description = uvp;
      break;
    }

    case 'richContent': {
      const companyVision = brand.identity?.companyVision;
      const shortVision = brand.identity?.shortVision;
      const orgPurpose = brand.identity?.organizationPurpose;
      const summary = (brand as any).brandSummaryParagraph;

      cloned.heading = headings.aboutHeading || (companyName ? `אודות ${companyName}` : 'אודותינו והחזון שלנו');
      cloned.subtitle = headings.aboutSubtitle || shortVision || slogan || 'החזון, הערכים והשליחות שלנו';

      if (brand.designTokens?.defaultStylePreset) {
        cloned.layout = brand.designTokens.defaultStylePreset;
      }

      const visionParagraph = companyVision || shortVision || orgPurpose;
      const purposeParagraph = orgPurpose || uvp || summary;

      if (visionParagraph || purposeParagraph) {
        const parts: string[] = [];
        if (visionParagraph) {
          parts.push(`<p class="text-lg font-semibold leading-relaxed"><strong>החזון שלנו:</strong> ${visionParagraph}</p>`);
        }
        if (purposeParagraph && purposeParagraph !== visionParagraph) {
          parts.push(`<p class="leading-relaxed">${purposeParagraph}</p>`);
        }
        if (slogan) {
          parts.push(`<blockquote class="border-r-4 border-amber-500 pr-4 italic my-3 text-slate-300">״${slogan}״</blockquote>`);
        }
        cloned.body = parts.join('');
      }

      if (primaryColor) {
        cloned.primaryButtonColor = primaryColor;
      }
      if (brand.designTokens?.textColorH1) {
        cloned.headingColor = brand.designTokens.textColorH1;
      }
      if (brand.designTokens?.textColor) {
        cloned.bodyColor = brand.designTokens.textColor;
      }

      if (services.length > 0 && Array.isArray(cloned.items) && cloned.items.length === 0) {
        cloned.items = services.slice(0, 3).map((srv, idx) => ({
          id: `item_brand_${idx}`,
          title: srv,
          text: `פתרון מקצועי ואיכותי מבית ${companyName}`,
          icon: idx === 0 ? 'Sparkles' : idx === 1 ? 'Shield' : 'Heart',
        }));
      }
      break;
    }

    case 'cta': {
      cloned.title = headings.painPointsHeading || `מוכנים להתקדם עם ${companyName}?`;
      cloned.subtitle = headings.painPointsSubtitle || slogan;
      cloned.buttonText = uiVocab.contactCta || uiVocab.primaryCta || 'צרו איתנו קשר עכשיו';
      cloned.buttonUrl = buildWhatsAppUrl(whatsapp, `שלום ${companyName}, אני מעוניין לשמוע פרטים נוספים`);
      break;
    }

    case 'footer': {
      cloned.copyrightText = `© ${new Date().getFullYear()} ${companyName}. כל הזכויות שמורות.`;
      cloned.companyName = companyName;
      cloned.phone = phone;
      cloned.email = email;
      cloned.whatsapp = whatsapp;
      cloned.address = address;
      break;
    }

    case 'eventRsvp': {
      cloned.organizer = companyName;
      cloned.contactPhone = phone;
      cloned.contactEmail = email;
      break;
    }

    case 'community': {
      cloned.title = headings.communityHeading || `קהילת ${companyName}`;
      cloned.subtitle = headings.communitySubtitle || slogan;
      cloned.ctaButtonText = uiVocab.whatsappCta || 'הצטרפות לקהילה';
      cloned.whatsappLink = buildWhatsAppUrl(whatsapp, `היי, אני רוצה להצטרף לקהילה של ${companyName}`);
      break;
    }

    case 'decorativeDivider': {
      cloned.stylePreset = (brand.designTokens?.defaultStylePreset as any) || cloned.stylePreset || 'standard';
      if (primaryColor) {
        cloned.iconColor = primaryColor;
        if (cloned.bgType === 'solid') cloned.solidColor = primaryColor;
        if (cloned.bgType === 'gradient') cloned.gradientFrom = primaryColor;
      }
      if (brand.designTokens?.textColorH1) {
        cloned.textColor = brand.designTokens.textColorH1;
      }
      break;
    }

    case 'futureContent2027': {
      cloned.source = cloned.source || 'tenant_pages';
      cloned.title = `העתיד של ${companyName}: תוכן ועשייה`;
      cloned.subtitle = slogan;
      if (services.length > 0 && Array.isArray(cloned.items)) {
        cloned.items = services.slice(0, 5).map((srv: any, idx: number) => ({
          id: `item-${idx + 1}`,
          title: srv.name || `פעילות ${idx + 1}`,
          subtitle: srv.description || slogan,
          description: srv.description || `השירות המוביל של ${companyName} בסטנדרט האיכות הגבוה ביותר.`,
          imageUrl: srv.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          category: srv.category || 'פעילות',
          tag: '• 2027 INNOVATION •',
          readTime: '3 דק׳ קריאה',
          audioDuration: '01:30',
          ctaText: 'גלה עוד',
          ctaUrl: buildWhatsAppUrl(whatsapp, `היי, אשמח לקבל פרטים על ${srv.name}`),
        }));
      }
      break;
    }

    case 'liveAnalytics': {
      cloned.title = cloned.title || `מדדי ביצועים ואנליטיקס בזמן אמת • ${companyName}`;
      cloned.subtitle =
        cloned.subtitle ||
        'נתוני צפייה, אינטראקציה, חיפוש אורגני מ-Google Search Console ותנועה ממנועי AI';
      cloned.showGa4StatusBadge = cloned.showGa4StatusBadge !== false;
      cloned.showGscStatusBadge = cloned.showGscStatusBadge !== false;
      cloned.showSearchConsoleCard = cloned.showSearchConsoleCard !== false;
      break;
    }

    case 'dynamicCategories': {
      cloned.title = headings.aboutHeading || (companyName ? `המתחמים והשירותים של ${companyName}` : 'המתחמים והקטגוריות שלנו');
      cloned.subtitle = headings.aboutSubtitle || slogan || 'גלו את מגוון השירותים, הפודקאסטים, ההכשרות והאירועים';
      cloned.badge = companyName ? `• ${companyName} •` : '• קטגוריות נבחרות •';

      // Zero Mock Data Policy: build categories from Brand DNA services, annualEvents, or default structure
      const catItems: any[] = [];
      if (services.length > 0) {
        services.slice(0, 4).forEach((srv: any, idx: number) => {
          const srvTitle = typeof srv === 'string' ? srv : srv.name || srv.title || `שירות ${idx + 1}`;
          const srvSub = typeof srv === 'object' && srv.description ? srv.description : `מענה מקצועי מבית ${companyName}`;
          const icons = ['Mic', 'Heart', 'Briefcase', 'MessageSquare'];
          catItems.push({
            id: `cat_brand_${idx}`,
            title: srvTitle,
            subtitle: srvSub,
            iconName: icons[idx % icons.length],
            linkUrl: '#',
          });
        });
      }

      if (catItems.length === 0) {
        // High-level brand categories matching the design pattern
        catItems.push(
          { id: 'cat_1', title: 'הפודקאסט שלנו', subtitle: 'שיחות עומק מרתקות', iconName: 'Mic', linkUrl: '#podcast' },
          { id: 'cat_2', title: 'כנסים ואירועים', subtitle: 'האירוע המכונן של השנה', iconName: 'Heart', linkUrl: '#events' },
          { id: 'cat_3', title: 'קורסים והכשרות', subtitle: 'בואו לבנות ולהבנות', iconName: 'Briefcase', linkUrl: '#courses' },
          { id: 'cat_4', title: 'מאמרים ושיעורים', subtitle: 'כנסו לעולם התוכן והידע', iconName: 'MessageSquare', linkUrl: '#articles' }
        );
      }
      cloned.categories = catItems;
      break;
    }

    case 'articlesListing': {
      cloned.title = companyName ? `מרכז הידע והתוכן של ${companyName}` : (headings.aboutHeading || 'מרכז הידע והתוכן');
      cloned.subtitle = slogan || 'מאמרים, שיעורים ומדריכים מעמיקים';
      cloned.badge = companyName ? `• ${companyName} •` : '• מאמרים אחרונים •';
      cloned.topCtaText = uiVocab.primaryCta || 'למרכז התוכן';
      cloned.topCtaUrl = '#content';
      cloned.cardCtaText = 'למאמר המלא';

      // Zero Mock Data Policy: build article items from Brand DNA services, vision or default articles
      const articleItems: any[] = [];
      if (services.length > 0) {
        services.slice(0, 4).forEach((srv: any, idx: number) => {
          const srvTitle = typeof srv === 'string' ? srv : srv.name || srv.title || `מאמר ${idx + 1}`;
          const srvAuthor = companyName || 'מערכת התוכן';
          const tags = ['כללי', 'הורות ומשפחה', 'העצמה וביטחון', 'זוגיות'];
          articleItems.push({
            id: `art_brand_${idx}`,
            title: srvTitle,
            subtitle: srvAuthor,
            tag: tags[idx % tags.length],
            imageUrl: typeof srv === 'object' && srv.imageUrl ? srv.imageUrl : '',
            linkUrl: '#',
            ctaText: 'למאמר המלא',
          });
        });
      }

      if (articleItems.length === 0) {
        articleItems.push(
          {
            id: 'art_1',
            title: '״כל משבריך וגליך עלי עברו״',
            subtitle: companyName || 'הרב אוהד תירוש',
            tag: 'כללי',
            imageUrl: '',
            linkUrl: '#article-1',
            ctaText: 'למאמר המלא',
          },
          {
            id: 'art_2',
            title: 'אחרי החגים',
            subtitle: companyName || 'הרב אוהד תירוש',
            tag: 'כללי',
            imageUrl: '',
            linkUrl: '#article-2',
            ctaText: 'למאמר המלא',
          },
          {
            id: 'art_3',
            title: 'מהחגים לחיים',
            subtitle: companyName || 'הרב אוהד תירוש',
            tag: 'כללי',
            imageUrl: '',
            linkUrl: '#article-3',
            ctaText: 'למאמר המלא',
          },
          {
            id: 'art_4',
            title: 'בנחת',
            subtitle: companyName || 'הרב אוהד תירוש',
            tag: 'הורות ומשפחה',
            imageUrl: '',
            linkUrl: '#article-4',
            ctaText: 'למאמר המלא',
          }
        );
      }

      cloned.items = articleItems;
      break;
    }

    case 'eventsListing': {
      cloned.title = headings.aboutHeading || (companyName ? `אירועים והכשרות מבית ${companyName}` : 'אירועים, קורסים והכשרות');
      cloned.subtitle = headings.aboutSubtitle || slogan || 'גלו את מגוון המפגשים, הסדנאות והאירועים הקרובים והבטיחו את מקומכם';
      cloned.badge = companyName ? `• אירועי ${companyName} •` : '• לוח אירועים והכשרות •';
      cloned.defaultCtaText = uiVocab.primaryCta || 'לפרטים והצטרפות';

      // Zero Mock Data Policy: derive starter items from Brand DNA services, vision or leave for dynamic page fetching
      const eventItems: any[] = [];
      if (services.length > 0) {
        services.slice(0, 3).forEach((srv: any, idx: number) => {
          const srvTitle = typeof srv === 'string' ? srv : srv.name || srv.title || `סדנה ומפגש ${idx + 1}`;
          const srvSub = typeof srv === 'object' && srv.description ? srv.description : `הכשרה מעשית ומעמיקה מבית ${companyName}`;
          eventItems.push({
            id: `evt_brand_${idx}`,
            title: srvTitle,
            subtitle: srvSub,
            badge: idx === 0 ? 'ההרשמה בעיצומה' : 'מחזור חדש',
            imageUrl: typeof srv === 'object' && srv.imageUrl ? srv.imageUrl : '',
            dayAndTime: 'בימי ראשון 20:00-22:30',
            locationFormat: address ? `היברידי: זום ו-${address}` : 'מפגש מקוון בזום',
            startDateText: 'בקרוב',
            sessionsCount: `${(idx + 1) * 4} מפגשים`,
            linkUrl: '#',
            ctaText: uiVocab.primaryCta || 'לפרטים והצטרפות',
          });
        });
      }
      cloned.items = eventItems;
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

  // Apply tenant default style preset if specified
  if (brand.designTokens?.defaultStylePreset) {
    applyStylePresetToSection(cloned, brand.designTokens.defaultStylePreset as any);
  }

  return cloned;
}

/**
 * Apply layout, shapes, heroStyle, buttonShape and styling of a style preset to a single section.
 * Preserves Header layout intact according to user configuration.
 */
export function applyStylePresetToSection(sec: any, preset: string): any {
  if (!sec) return sec;
  const sType = sec.type;

  // Never alter header layout when applying content style presets
  if (sType === 'header') {
    return sec;
  }

  // Hero style and button shapes
  if (sType === 'hero') {
    sec.layout = preset;
    if (preset === 'feminine') {
      sec.heroStyle = 'mesh-glow';
      sec.buttonShape = 'pill';
    } else if (preset === 'masculine') {
      sec.heroStyle = 'card';
      sec.buttonShape = 'rounded';
    } else if (preset === 'sharp') {
      sec.heroStyle = 'minimal';
      sec.buttonShape = 'square';
    } else if (preset === 'spiritual') {
      sec.heroStyle = 'mesh-glow';
      sec.buttonShape = 'pill';
    } else if (preset === 'analytical') {
      sec.heroStyle = 'modern';
      sec.buttonShape = 'rounded';
    } else {
      sec.heroStyle = 'classic';
      sec.buttonShape = 'auto';
    }
    return sec;
  }

  // Timer shapes
  if (sType === 'timer') {
    sec.layout = preset;
    if (preset === 'feminine') sec.boxShape = 'flower';
    else if (preset === 'masculine') sec.boxShape = 'shield';
    else if (preset === 'spiritual') sec.boxShape = 'lotus';
    else if (preset === 'sharp') sec.boxShape = 'sharp';
    else if (preset === 'analytical') sec.boxShape = 'hud';
    else sec.boxShape = 'rounded';
    return sec;
  }

  // DynamicListing layout & shapes
  if (sType === 'dynamicListing') {
    sec.stylePreset = preset;
    if (preset === 'feminine') {
      sec.layout = 'snap-carousel';
      sec.boxShape = 'flower';
      sec.effectStyle = 'glow-hover';
      sec.buttonShape = 'pill';
      sec.controlsOrder = 'categories-first';
    } else if (preset === 'masculine') {
      sec.layout = 'bento-showcase';
      sec.boxShape = 'shield';
      sec.effectStyle = 'border-beam';
      sec.buttonShape = 'rounded';
      sec.controlsOrder = 'search-first';
    } else if (preset === 'spiritual') {
      sec.layout = 'snap-carousel';
      sec.boxShape = 'lotus';
      sec.effectStyle = 'subtle';
      sec.buttonShape = 'pill';
      sec.controlsOrder = 'categories-first';
    } else if (preset === 'sharp') {
      sec.layout = 'masonry';
      sec.boxShape = 'sharp';
      sec.effectStyle = 'tilt-3d';
      sec.buttonShape = 'square';
      sec.controlsOrder = 'search-first';
    } else if (preset === 'analytical') {
      sec.layout = 'editorial-list';
      sec.boxShape = 'hud';
      sec.effectStyle = 'border-beam';
      sec.buttonShape = 'rounded';
      sec.controlsOrder = 'search-first';
    } else {
      sec.layout = 'bento-showcase';
      sec.boxShape = 'rounded';
      sec.effectStyle = 'border-beam';
      sec.buttonShape = 'auto';
      sec.controlsOrder = 'categories-first';
    }
    return sec;
  }

  // Standard compatible sections
  if (
    sType === 'contact' ||
    sType === 'faq' ||
    sType === 'richContent' ||
    sType === 'livePosts' ||
    sType === 'kosvidio' ||
    sType === 'videoGallery' ||
    sType === 'imageListing' ||
    sType === 'videoEngagement' ||
    sType === 'courseBanner'
  ) {
    sec.layout = preset;
    return sec;
  }

  // Testimonials layout
  if (sType === 'testimonials') {
    sec.layout = (preset === 'feminine' || preset === 'spiritual') ? 'carousel' : (preset === 'sharp' ? 'masonry' : 'grid');
    return sec;
  }

  // StatsBento layout
  if (sType === 'statsBento') {
    sec.layout = (preset === 'feminine' || preset === 'spiritual') ? 'cards-3' : (preset === 'masculine' ? 'row-4' : 'bento-4');
    return sec;
  }

  // Community layout
  if (sType === 'community') {
    sec.layout = (preset === 'feminine' || preset === 'spiritual') ? 'card' : (preset === 'masculine' ? 'classic' : 'modern');
    return sec;
  }

  // LandingSection layout
  if (sType === 'landingSection') {
    sec.layout = (preset === 'feminine' || preset === 'spiritual' || preset === 'masculine' || preset === 'sharp' || preset === 'analytical') ? preset : 'standard';
    return sec;
  }

  // DecorativeDivider stylePreset and effects
  if (sType === 'decorativeDivider') {
    sec.stylePreset = preset;
    if (preset === 'feminine') {
      sec.effectType = 'pulse-glow';
      sec.iconName = 'shape_fem_lotus';
    } else if (preset === 'masculine') {
      sec.effectType = 'shimmer-beam';
      sec.iconName = 'shape_masc_shield_crest';
    } else if (preset === 'spiritual') {
      sec.effectType = 'wave-drift';
      sec.iconName = 'shape_spir_sunburst_halo';
    } else if (preset === 'sharp') {
      sec.effectType = 'cyber-scan';
      sec.iconName = 'shape_sharp_crosshair_target';
    } else if (preset === 'analytical') {
      sec.effectType = 'rotate-slow';
      sec.iconName = 'shape_analyt_hex_core';
    } else {
      sec.effectType = 'float-bob';
      sec.iconName = 'shape_std_modern_dots';
    }
    return sec;
  }

  return sec;
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

  return hydrateSectionWithBrandDna(base, brand, type, tenantId);
}
