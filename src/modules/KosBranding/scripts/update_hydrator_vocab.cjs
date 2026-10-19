const fs = require('fs');
const path = require('path');

const hydratorPath = path.resolve('src/modules/KosWebAi/services/brandSectionHydrator.ts');
let code = fs.readFileSync(hydratorPath, 'utf8');

// 1. Import buildDefaultBrandUiVocabulary
if (!code.includes('buildDefaultBrandUiVocabulary')) {
  code = code.replace(
    "import { resolveCurrentTenantId } from '../../../core/tenant';",
    "import { resolveCurrentTenantId } from '../../../core/tenant';\nimport { buildDefaultBrandUiVocabulary } from '../../KosBranding/services/brandCopilotService';"
  );
}

// 2. Add uiVocabulary to resolveLiveBrandDna (provided branch)
if (!code.includes('uiVocabulary: provided.uiVocabulary')) {
  code = code.replace(
    'voice: { ...baseDefault.voice, ...(provided.voice || {}) },\n    };',
    'voice: { ...baseDefault.voice, ...(provided.voice || {}) },\n      uiVocabulary: provided.uiVocabulary || (baseDefault as any).uiVocabulary,\n    };'
  );
}

// 3. Add uiVocabulary to resolveLiveBrandDna (localStorage branch)
if (!code.includes('uiVocabulary: parsed.uiVocabulary')) {
  code = code.replace(
    'voice: { ...baseDefault.voice, ...(parsed.voice || {}) },\n          };',
    'voice: { ...baseDefault.voice, ...(parsed.voice || {}) },\n            uiVocabulary: parsed.uiVocabulary || (baseDefault as any).uiVocabulary,\n          };'
  );
}

// 4. Inject uiVocab & headings at the start of hydrateSectionWithBrandDna
if (!code.includes('const uiVocab =')) {
  code = code.replace(
    'const commonObjections = brand.audience?.commonObjections || [];',
    `const commonObjections = brand.audience?.commonObjections || [];
  const uiVocab = brand.uiVocabulary || buildDefaultBrandUiVocabulary(brand);
  const headings = uiVocab.sectionHeadings || {};`
  );
}

// 5. Upgrade hero section
const oldHero = `    case 'hero': {
      cloned.badge = companyName;
      cloned.title = \`\${companyName} - \${slogan}\`;
      cloned.subtitle = uvp;
      if (!cloned.primaryButton || cloned.primaryButton.text === 'התחל עכשיו') {
        cloned.primaryButton = { text: 'לפנייה ופרטים נוספים', url: '#contact' };
      }
      if (!cloned.secondaryButton) {
        cloned.secondaryButton = {
          text: 'שיחה מהירה ב-WhatsApp',
          url: buildWhatsAppUrl(whatsapp, \`שלום, הגעתי דרך האתר של \${companyName}\`),
        };
      }
      break;
    }`;

const newHero = `    case 'hero': {
      cloned.badge = companyName;
      cloned.title = headings.heroTitle || (slogan ? \`\${companyName} - \${slogan}\` : companyName);
      cloned.subtitle = headings.heroSubtitle || uvp;
      if (!cloned.primaryButton || cloned.primaryButton.text === 'התחל עכשיו' || cloned.primaryButton.text === 'לפנייה ופרטים נוספים') {
        cloned.primaryButton = { text: uiVocab.primaryCta || 'לפרטים והצטרפות', url: '#contact' };
      }
      if (!cloned.secondaryButton || cloned.secondaryButton.text === 'שיחה מהירה ב-WhatsApp') {
        cloned.secondaryButton = {
          text: uiVocab.whatsappCta || 'שיחה מהירה ב-WhatsApp',
          url: buildWhatsAppUrl(whatsapp, \`שלום, הגעתי דרך האתר של \${companyName}\`),
        };
      }
      break;
    }`;

if (code.includes(oldHero)) {
  code = code.replace(oldHero, newHero);
}

// 6. Upgrade contact section
const oldContact = `    case 'contact': {
      cloned.title = \`יצירת קשר עם \${companyName}\`;
      cloned.subtitle = slogan ? \`\${slogan} • נשמח לעמוד לשירותכם\` : 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות';
      cloned.phone = phone;
      cloned.email = email;
      cloned.whatsapp = whatsapp;
      cloned.address = address;
      break;
    }`;

const newContact = `    case 'contact': {
      cloned.title = headings.contactHeading || (companyName ? \`יצירת קשר עם \${companyName}\` : cloned.title);
      cloned.subtitle = headings.contactSubtitle || (slogan ? \`\${slogan} • נשמח לעמוד לשירותכם\` : 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות');
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
    }`;

if (code.includes(oldContact)) {
  code = code.replace(oldContact, newContact);
}

// 7. Upgrade faq section
const oldFaq = `    case 'faq': {
      cloned.subtitle = \`כל מה שחשוב לדעת על \${companyName}\`;`;

const newFaq = `    case 'faq': {
      cloned.title = headings.faqHeading || cloned.title || 'שאלות ותשובות נפוצות';
      cloned.subtitle = headings.faqSubtitle || \`כל מה שחשוב לדעת על \${companyName}\`;`;

if (code.includes(oldFaq)) {
  code = code.replace(oldFaq, newFaq);
}

// 8. Upgrade features & statsBento
const oldFeatures = `    case 'features': {
      cloned.title = \`למה לבחור ב-\${companyName}?\`;
      cloned.subtitle = uvp || slogan;`;

const newFeatures = `    case 'features': {
      cloned.title = headings.advantagesHeading || \`למה לבחור ב-\${companyName}?\`;
      cloned.subtitle = headings.advantagesSubtitle || uvp || slogan;`;

if (code.includes(oldFeatures)) {
  code = code.replace(oldFeatures, newFeatures);
}

const oldStatsBento = `    case 'statsBento': {
      cloned.title = \`היתרונות המובילים של \${companyName}\`;
      cloned.description = uvp;`;

const newStatsBento = `    case 'statsBento': {
      cloned.title = headings.advantagesHeading || \`היתרונות המובילים של \${companyName}\`;
      cloned.description = headings.advantagesSubtitle || uvp;`;

if (code.includes(oldStatsBento)) {
  code = code.replace(oldStatsBento, newStatsBento);
}

// 9. Upgrade about & cta & testimonials & community & imageListing
const oldAbout = `    case 'about': {
      cloned.title = \`אודות \${companyName}\`;
      cloned.subtitle = slogan;
      if (uvp) cloned.description = uvp;
      break;
    }`;

const newAbout = `    case 'about': {
      cloned.title = headings.aboutHeading || \`אודות \${companyName}\`;
      cloned.subtitle = headings.aboutSubtitle || slogan;
      if (uvp) cloned.description = uvp;
      break;
    }`;

if (code.includes(oldAbout)) {
  code = code.replace(oldAbout, newAbout);
}

const oldCta = `    case 'cta': {
      cloned.title = \`מוכנים להתקדם עם \${companyName}?\`;
      cloned.subtitle = slogan;
      cloned.buttonText = 'צרו איתנו קשר עכשיו';
      cloned.buttonUrl = buildWhatsAppUrl(whatsapp, \`שלום \${companyName}, אני מעוניין לשמוע פרטים נוספים\`);
      break;
    }`;

const newCta = `    case 'cta': {
      cloned.title = headings.painPointsHeading || \`מוכנים להתקדם עם \${companyName}?\`;
      cloned.subtitle = headings.painPointsSubtitle || slogan;
      cloned.buttonText = uiVocab.contactCta || uiVocab.primaryCta || 'צרו איתנו קשר עכשיו';
      cloned.buttonUrl = buildWhatsAppUrl(whatsapp, \`שלום \${companyName}, אני מעוניין לשמוע פרטים נוספים\`);
      break;
    }`;

if (code.includes(oldCta)) {
  code = code.replace(oldCta, newCta);
}

const oldTestimonials = `    case 'testimonials': {
      cloned.title = \`מה הלקוחות מספרים על \${companyName}?\`;
      cloned.trustBadgeText = \`לקוחות מאומתים של \${companyName}\`;`;

const newTestimonials = `    case 'testimonials': {
      cloned.title = headings.testimonialsHeading || \`מה מספרים עלינו?\`;
      cloned.subtitle = headings.testimonialsSubtitle || 'עדויות ומשובים מהשטח';
      cloned.trustBadgeText = \`לקוחות מאומתים של \${companyName}\`;`;

if (code.includes(oldTestimonials)) {
  code = code.replace(oldTestimonials, newTestimonials);
}

const oldCommunity = `    case 'community': {
      cloned.title = \`קהילת \${companyName}\`;
      cloned.subtitle = slogan;
      cloned.whatsappLink = buildWhatsAppUrl(whatsapp, \`היי, אני רוצה להצטרף לקהילה של \${companyName}\`);
      break;
    }`;

const newCommunity = `    case 'community': {
      cloned.title = headings.communityHeading || \`קהילת \${companyName}\`;
      cloned.subtitle = headings.communitySubtitle || slogan;
      cloned.ctaButtonText = uiVocab.whatsappCta || 'הצטרפות לקהילה';
      cloned.whatsappLink = buildWhatsAppUrl(whatsapp, \`היי, אני רוצה להצטרף לקהילה של \${companyName}\`);
      break;
    }`;

if (code.includes(oldCommunity)) {
  code = code.replace(oldCommunity, newCommunity);
}

const oldImageListing = `    case 'imageListing': {
      cloned.title = companyName ? \`גלריית \${companyName}\` : cloned.title;
      cloned.subtitle = slogan || 'הצצה לעולם העשיר, ליצירה ולפרויקטים המובילים שלנו';`;

const newImageListing = `    case 'imageListing': {
      cloned.title = headings.galleryHeading || (companyName ? \`גלריית \${companyName}\` : cloned.title);
      cloned.subtitle = headings.gallerySubtitle || slogan || 'הצצה לעולם העשיר, ליצירה ולפרויקטים המובילים שלנו';`;

if (code.includes(oldImageListing)) {
  code = code.replace(oldImageListing, newImageListing);
}

fs.writeFileSync(hydratorPath, code, 'utf8');
console.log('brandSectionHydrator.ts updated successfully');
