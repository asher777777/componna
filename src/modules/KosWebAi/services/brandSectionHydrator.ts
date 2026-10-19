import { SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { DEFAULT_BRAND_DNA } from '../../KosBranding/types/brandDna';
import { createTenantInitialBrandDna } from '../../KosBranding/services/brandDnaFirestore';
import { resolveCurrentTenantId } from '../../../core/tenant';

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
      if (cleanIdentity.companyName === 'קושאן' || cleanIdentity.companyName === effTenant) {
        cleanIdentity.companyName = (provided.identity as any)?.brandName || '';
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
            if (cleanIdentity.companyName === 'קושאן' || cleanIdentity.companyName === effTenant) {
              cleanIdentity.companyName = parsed?.identity?.brandName || '';
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
          };
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  return loadedDna || baseDefault;
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
      cloned.title = companyName ? `גלריית ${companyName}` : cloned.title;
      cloned.subtitle = slogan || 'הצצה לעולם העשיר, ליצירה ולפרויקטים המובילים שלנו';
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
      cloned.title = `למה לבחור ב-${companyName}?`;
      cloned.subtitle = uvp || slogan;
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
      cloned.title = `אודות ${companyName}`;
      cloned.subtitle = slogan;
      if (uvp) cloned.description = uvp;
      break;
    }

    case 'cta': {
      cloned.title = `מוכנים להתקדם עם ${companyName}?`;
      cloned.subtitle = slogan;
      cloned.buttonText = 'צרו איתנו קשר עכשיו';
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
      cloned.title = `קהילת ${companyName}`;
      cloned.subtitle = slogan;
      cloned.whatsappLink = buildWhatsAppUrl(whatsapp, `היי, אני רוצה להצטרף לקהילה של ${companyName}`);
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
    sec.layout = (preset === 'feminine' || preset === 'spiritual') ? 'centered' : (preset === 'sharp' ? 'card' : 'split');
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
