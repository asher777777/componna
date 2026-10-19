const fs = require('fs');
const path = require('path');

const copilotPath = path.resolve('src/modules/KosBranding/services/brandCopilotService.ts');
let content = fs.readFileSync(copilotPath, 'utf8');

if (!content.includes('generateBrandUiVocabulary')) {
  // Update imports
  content = content.replace(
    "import { BrandDna, FlagshipSectionTitles } from '../types/brandDna';",
    "import { BrandDna, FlagshipSectionTitles, BrandUiVocabulary } from '../types/brandDna';"
  );

  content = content.replace(
    'dispatchAudienceAndPersonasFromEssenceToKosai,\n} from \'../kosai/promptToKosai\';',
    'dispatchAudienceAndPersonasFromEssenceToKosai,\n  dispatchBrandUiVocabularyToKosai,\n} from \'../kosai/promptToKosai\';'
  );

  const functionsCode = `
/**
 * מייצר ערכת שפת ממשק, כפתורים וכותרות אלגוריתמית באפס טוקנים (Zero-Token Heuristic UI Vocabulary)
 * מתאימה עצמה אוטומטית לפי לשון הפנייה (נקבה/זכר/רבים), שם המותג, הסלוגן והצעת הערך.
 */
export function buildDefaultBrandUiVocabulary(brand: BrandDna): BrandUiVocabulary {
  const companyName = brand.identity?.companyName || 'המותג';
  const slogan = brand.identity?.slogan || '';
  const uvp = brand.audience?.mainUvp || slogan || '';
  const gender = brand.voice?.genderAddressing || 'plural';

  if (gender === 'female') {
    return {
      primaryCta: 'בואי נתחיל',
      secondaryCta: 'לגלות עוד',
      whatsappCta: 'דברי איתנו ב-WhatsApp',
      contactCta: 'השאירי פרטים ונחזור אלייך',
      formSubmitText: 'שליחת פנייה',
      namePlaceholder: 'שמך המלא',
      phonePlaceholder: 'מספר הטלפון שלך',
      emailPlaceholder: 'כתובת האימייל שלך',
      messagePlaceholder: 'ספרי לנו, במה נוכל לסייע לך?',
      sectionHeadings: {
        heroTitle: slogan ? \`\${companyName} • \${slogan}\` : companyName,
        heroSubtitle: uvp || 'מרחב מותאם, אישי ומעצים במיוחד עבורך',
        aboutHeading: \`נעים להכיר, \${companyName}\`,
        aboutSubtitle: 'החזון, הערכים והשליחות שלנו למענך',
        advantagesHeading: 'למה כדאי לך לבחור בנו?',
        advantagesSubtitle: 'המעטפת האישית, המקצועיות והשקט הנפשי שלך',
        painPointsHeading: 'מרגישה שאת מחפשת את הדרך הנכונה?',
        painPointsSubtitle: 'את לא לבד – יחד נגיע לתוצאה המדויקת ביותר',
        targetAudiencesHeading: 'למי זה מיועד?',
        targetAudiencesSubtitle: 'המרחב מותאם לנשים שמחפשות צמיחה, עומק ואיכות',
        faqHeading: 'שאלות נפוצות ותשובות',
        faqSubtitle: 'כל מה שחשוב לך לדעת לפני שיוצאים לדרך',
        contactHeading: 'בואי נדבר',
        contactSubtitle: 'נשמח להקשיב, לענות וללוות אותך באהבה',
        communityHeading: 'הקהילה שלנו',
        communitySubtitle: 'מרחב חם של שיתוף, צמיחה והעצמה',
        testimonialsHeading: 'מה מספרות המשתתפות שלנו?',
        testimonialsSubtitle: 'מילים חמות וחוויות מהלב מנשים שהיו שם',
        galleryHeading: 'הצצה לעולם שלנו',
        gallerySubtitle: 'רגעים של עשייה, מפגשים ויצירה',
      },
    };
  }

  if (gender === 'male') {
    return {
      primaryCta: 'בוא נתחיל',
      secondaryCta: 'גלה עוד',
      whatsappCta: 'דבר איתנו ב-WhatsApp',
      contactCta: 'השאר פרטים ונחזור אליך',
      formSubmitText: 'שליחת פנייה',
      namePlaceholder: 'שמך המלא',
      phonePlaceholder: 'מספר הטלפון שלך',
      emailPlaceholder: 'כתובת האימייל שלך',
      messagePlaceholder: 'במה נוכל לסייע לך?',
      sectionHeadings: {
        heroTitle: slogan ? \`\${companyName} • \${slogan}\` : companyName,
        heroSubtitle: uvp || 'פתרונות מדויקים ומעטפת מקצועית עבורך',
        aboutHeading: \`אודות \${companyName}\`,
        aboutSubtitle: 'החזון, הערכים והניסיון המקצועי שלנו',
        advantagesHeading: 'למה לבחור בנו?',
        advantagesSubtitle: 'היתרונות המובילים והמעטפת המקצועית עבורך',
        painPointsHeading: 'מחפש את המענה הנכון ביותר עבורך?',
        painPointsSubtitle: 'הגעת למקום הנכון – מענה מוכח וממוקד מטרה',
        targetAudiencesHeading: 'למי השירות מתאים?',
        targetAudiencesSubtitle: 'מותאם במיוחד עבור צרכיך המקצועיים והאישיים',
        faqHeading: 'שאלות ותשובות נפוצות',
        faqSubtitle: 'כל המידע שחשוב לדעת',
        contactHeading: 'בוא נדבר',
        contactSubtitle: 'נשמח לענות על כל שאלה ולסייע לך להתקדם',
        communityHeading: 'הקהילה שלנו',
        communitySubtitle: 'מרחב משותף של קשרים, שותפויות ועשייה',
        testimonialsHeading: 'מה מספרים הלקוחות שלנו?',
        testimonialsSubtitle: 'המלצות וסיפורי הצלחה מהשטח',
        galleryHeading: 'גלריית עשייה ופרויקטים',
        gallerySubtitle: 'הצצה לפרויקטים ולפעילות המובילה שלנו',
      },
    };
  }

  // Plural & default
  return {
    primaryCta: 'לפרטים והצטרפות',
    secondaryCta: 'מידע נוסף',
    whatsappCta: 'שיחה ישירה ב-WhatsApp',
    contactCta: 'השאירו פרטים ונחזור אליכם',
    formSubmitText: 'שליחת פנייה',
    namePlaceholder: 'שם מלא',
    phonePlaceholder: 'מספר טלפון',
    emailPlaceholder: 'כתובת אימייל',
    messagePlaceholder: 'במה נוכל לסייע לכם?',
    sectionHeadings: {
      heroTitle: slogan ? \`\${companyName} • \${slogan}\` : companyName,
      heroSubtitle: uvp || 'פתרונות מתקדמים ומעטפת שירות אישית ומקיפה',
      aboutHeading: \`נעים להכיר, \${companyName}\`,
      aboutSubtitle: 'החזון, הערכים והמחויבות הבלתי מתפשרת שלנו',
      advantagesHeading: 'למה לבחור בנו?',
      advantagesSubtitle: 'היתרונות המובילים והמעטפת המקצועית שלנו',
      painPointsHeading: 'האתגרים שלכם, הפתרונות שלנו',
      painPointsSubtitle: 'מענה מקיף ומדויק לכל שלב בדרך',
      targetAudiencesHeading: 'למי השירות מתאים?',
      targetAudiencesSubtitle: 'מותאם במיוחד לצרכים הייחודיים שלכם',
      faqHeading: 'שאלות נפוצות ותשובות',
      faqSubtitle: 'כל מה שחשוב לדעת לפני שיוצאים לדרך',
      contactHeading: 'בואו נדבר',
      contactSubtitle: 'נשמח לשמוע מכם ולעמוד לשירותכם לכל עניין',
      communityHeading: 'הקהילה שלנו',
      communitySubtitle: 'מרחב של שיתוף, צמיחה והזדמנויות',
      testimonialsHeading: 'מה הלקוחות מספרים עלינו?',
      testimonialsSubtitle: 'סיפורי הצלחה וחוויות של לקוחות מרוצים',
      galleryHeading: 'גלריית עשייה ופרויקטים',
      gallerySubtitle: 'הצצה לפעילות וליצירה שלנו',
    },
  };
}

/**
 * מפיק ערכת שפת ממשק, כפתורים וכותרות אזורים (Brand UI Vocabulary) באמצעות KOSAI (Gemini)
 * עם גיבוי אלגוריתמי מלא למקרה של היעדר מפתח / שגיאה
 */
export async function generateBrandUiVocabulary(
  brand: BrandDna,
  apiKey?: string
): Promise<{ success: boolean; vocabulary: BrandUiVocabulary; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const res = await dispatchBrandUiVocabularyToKosai(brand, { apiKey: activeKey });
    if (res && (res.primaryCta || res.sectionHeadings)) {
      const fallback = buildDefaultBrandUiVocabulary(brand);
      return {
        success: true,
        vocabulary: {
          primaryCta: res.primaryCta || fallback.primaryCta,
          secondaryCta: res.secondaryCta || fallback.secondaryCta,
          whatsappCta: res.whatsappCta || fallback.whatsappCta,
          contactCta: res.contactCta || fallback.contactCta,
          formSubmitText: res.formSubmitText || fallback.formSubmitText,
          namePlaceholder: res.namePlaceholder || fallback.namePlaceholder,
          phonePlaceholder: res.phonePlaceholder || fallback.phonePlaceholder,
          emailPlaceholder: res.emailPlaceholder || fallback.emailPlaceholder,
          messagePlaceholder: res.messagePlaceholder || fallback.messagePlaceholder,
          sectionHeadings: {
            ...fallback.sectionHeadings,
            ...(res.sectionHeadings || {}),
          },
        },
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] AI UI Vocabulary failed, using heuristic fallback:', err);
  }

  return {
    success: true,
    vocabulary: buildDefaultBrandUiVocabulary(brand),
  };
}
`;

  content += '\n' + functionsCode;
  fs.writeFileSync(copilotPath, content, 'utf8');
  console.log('Updated brandCopilotService.ts');
} else {
  console.log('Already updated');
}
