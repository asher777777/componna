import { Firestore } from 'firebase/firestore';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';
import { saveBrandDna } from '../../KosBranding/services/brandDnaFirestore';
import { eventBus } from '../../../core/bridge/EventBus';

export interface EnsureLegalPagesResult {
  termsPage: PageBuilderConfig;
  privacyPage: PageBuilderConfig;
  created: boolean;
}

/**
 * Builds the comprehensive "Terms of Use" page configuration (תנאי שימוש באתר ותקנון)
 * Fully compliant with Israeli Consumer Protection Law, Copyright Law, and Civil Law.
 */
export function buildTermsOfUsePageConfig(
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): PageBuilderConfig {
  const brand = resolveLiveBrandDna(brandDnaInput, tenantId);
  const isMaster = tenantId === '_master';

  const companyName =
    brand.identity?.companyName ||
    (brand.identity as any)?.brandName ||
    (isMaster ? 'קושאן' : `עסק ${tenantId}`);

  const orgType = brand.identity?.organizationType || 'חברה';
  const slogan = brand.identity?.slogan || '';
  const legalEntityId = brand.trust?.legalEntityId || '';
  const legalEntityDisplay = legalEntityId ? ` (ח.פ / מספר תאגיד: ${legalEntityId})` : '';
  const contactPhone = brand.trust?.contactPhone || '052-6968008';
  const contactEmail = brand.trust?.contactEmail || 'office@kosun.pro';
  const whatsapp = brand.trust?.whatsappSupportNumber || contactPhone;
  const officeAddress = brand.trust?.officeAddress || 'ישראל';
  const refundPolicy =
    brand.trust?.refundPolicySummary ||
    'ביטול עסקאות והחזרים כספיים מתבצעים בהתאם להוראות חוק הגנת הצרכן, התשמ"א-1981 ותקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010. הודעת ביטול תימסר בכתב באמצעות דוא"ל או טלפון שירות הלקוחות.';

  const primaryColor = brand.designTokens?.primaryColor || '#4f46e5';
  const secondaryColor = brand.designTokens?.secondaryColor || '#0ea5e9';
  const fontFamily = brand.designTokens?.fontFamily || 'Heebo, sans-serif';
  const logoUrl = brand.identity?.logoUrl || '';

  const pageId = `page_terms_${tenantId}`;
  const now = new Date().toISOString();

  const termsHtmlBody = `
    <div class="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-sans" dir="rtl">
      
      <!-- מבוא והגדרות -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>1.</span>
          <span>מבוא והגדרות כלליות</span>
        </h3>
        <p>
          ברוכים הבאים לאתר האינטרנט של <strong>${companyName}</strong>${legalEntityDisplay} (להלן: ״<strong>החברה</strong>״ או ״<strong>מפעילת האתר</strong>״), שכתובתה: <strong>${officeAddress}</strong>.
        </p>
        <p>
          השימוש באתר, בתכנים, במוצרים ובשירותים המוצעים בו (להלן יחד: ״<strong>השירותים</strong>״) כפוף לתנאי שימוש אלה (להלן: ״<strong>התקנון</strong>״). גלישה באתר, שימוש בכל אחד משירותיו, או השארת פרטים מהווים את הסכמתך המלאה, המפורשת והבלתי-חוזרת לכל תנאי התקנון. אם אינך מסכים/ה לאיזה מתנאי התקנון, הנך מתבקש/ת לחדול באופן מיידי מכל שימוש באתר.
        </p>
      </section>

      <!-- כשירות משפטית -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>2.</span>
          <span>כשירות משפטית ותנאי שימוש</span>
        </h3>
        <p>
          השימוש באתר מותר לכל אדם הכשיר לבצע פעולות משפטיות מחייבות בהתאם לדין הישראלי, אשר מלאו לו 18 שנים לפחות (או קטין הפועל בהסכמת אפוטרופסו החוקי). המשתמש מצהיר ומתחייב כי כל הפרטים הנמסרים על ידו במסגרת האתר הם נכונים, מדויקים ומלאים.
        </p>
      </section>

      <!-- שימוש מותר והגבלות -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>3.</span>
          <span>השימוש המורשה והתחייבויות המשתמש</span>
        </h3>
        <p>
          המשתמש מתחייב לעשות שימוש באתר אך ורק למטרות חוקיות, אישיות או עסקיות מורשות, ובהתאם לכל דין.
        </p>
        <ul class="list-disc list-inside space-y-1.5 pr-2">
          <li>חל איסור מוחלט לבצע סריקה אוטומטית (Web Scraping, Crawling, Bots) של תכני האתר ללא אישור כתוב ומפורש מהחברה.</li>
          <li>חל איסור לבצע הנדסה לאחור (Reverse Engineering), פירוק או שינוי של קוד המקור של האתר או המערכות המקושרות אליו.</li>
          <li>חל איסור לשבש, להעמיס או לפגוע בזמינות שרתי האתר, אבטחת המידע או חוויית הגלישה של משתמשים אחרים.</li>
          <li>חל איסור להעלות, להפיץ או לשדר תכנים פוגעניים, מזיקים, בלתי חוקיים או מפרים זכויות צד ג׳.</li>
        </ul>
      </section>

      <!-- קניין רוחני -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>4.</span>
          <span>קניין רוחני וזכויות יוצרים</span>
        </h3>
        <p>
          כל זכויות היוצרים, סימני המסחר, הפטנטים, המדגמים, עיצובי הממשק, הגרפיקות, הטקסטים, הסרטונים, קוד המקור, וכל תוכן המופיע באתר שייכים באופן בלעדי ל-<strong>${companyName}</strong> (או לצדדים שלישיים שהעניקו לחברה רישיון שימוש).
        </p>
        <p>
          אין להעתיק, לשכפל, להפיץ, לשדר, להציג בפומבי, למכור, להעביר או לבצע יצירה נגזרת מכל חלק מהאתר והתכנים ללא קבלת אישור מפורש מראש ובכתב מ-<strong>${companyName}</strong>.
        </p>
      </section>

      <!-- הגבלת אחריות -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>5.</span>
          <span>הגבלת אחריות והיעדר מצג (AS IS)</span>
        </h3>
        <p>
          תכני האתר והשירותים ניתנים לשימוש כפי שהם (״<strong>AS IS</strong>״ ו-״<strong>AS AVAILABLE</strong>״). החברה עושה כל מאמץ לספק מידע מדויק ועדכני, אולם אינה מתחייבת כי המידע יהיה חף מטעויות, שלם או נטול שיבושים.
        </p>
        <p>
          החברה, עובדיה, מנהליה ונציגיה לא יישאו בכל אחריות בגין כל נזק ישיר, עקיף, תוצאתי, דמי נזיקין מיוחדים או אובדן רווחים שייגרם למשתמש או לצד שלישי כתוצאה משימוש באתר, מאי-יכולת להשתמש בו, או מהסתמכות על תכניו.
        </p>
      </section>

      <!-- מדיניות ביטולים ורכישות -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>6.</span>
          <span>מדיניות ביטולים, החזרים ורכישות</span>
        </h3>
        <p>
          ביצוע רכישות, הזמנות שירותים וביטול עסקאות באמצעות האתר כפופים לחוק הגנת הצרכן, התשמ"א-1981 ותקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010.
        </p>
        <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 my-2">
          <strong class="block text-slate-900 dark:text-white mb-1">תמצית מדיניות הביטולים וההחזרים:</strong>
          <p class="text-sm">${refundPolicy}</p>
        </div>
        <p>
          הודעות ביטול יימסרו בכתב לכתובת הדוא"ל: <strong>${contactEmail}</strong> או באמצעות פנייה טלפונית למוקד: <strong>${contactPhone}</strong>.
        </p>
      </section>

      <!-- קישורים לצדדים שלישיים -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>7.</span>
          <span>קישורים ושירותי צד שלישי</span>
        </h3>
        <p>
          האתר עשוי להכיל קישורים (Links) לאתרים או שירותים של צדדים שלישיים. קישורים אלה נועדו לנוחות המשתמש בלבד, והחברה אינה נושאת בכל אחריות לתכניהם, למדיניות הפרטיות שלהם או לאמינות השירותים הניתנים בהם.
        </p>
      </section>

      <!-- עדכון התקנון -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>8.</span>
          <span>שינוי תנאי השימוש ועדכונם</span>
        </h3>
        <p>
          החברה שומרת לעצמה את הזכות לעדכן, לשנות או לתקן את הוראות תקנון זה מעת לעת, לפי שיקול דעתה הבלעדי וללא צורך במתן הודעה מוקדמת. הנוסח המעודכן יפורסם בעמוד זה ויכנס לתוקף מייד עם פרסומו.
        </p>
      </section>

      <!-- דין וסמכות שיפוט -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>9.</span>
          <span>ברירת דין וסמכות שיפוט בלעדית</span>
        </h3>
        <p>
          על תנאי שימוש אלה, על פרשנותם ועל כל סכסוך הנובע מהם או מהשימוש באתר, יחולו אך ורק דיני מדינת ישראל. סמכות השיפוט הבלעדית בכל עניין נתונה לבתי המשפט המוסמכים במחוז תל אביב-יפו / מרכז.
        </p>
      </section>

      <!-- יצירת קשר -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>10.</span>
          <span>יצירת קשר ובירורים</span>
        </h3>
        <p>
          בכל שאלה, הבהרה או פנייה הנוגעת לתנאי שימוש אלה, ניתן לפנות אל שירות הלקוחות של <strong>${companyName}</strong>:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-xs font-bold text-slate-500 block">דואר אלקטרוני:</span>
            <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold">${contactEmail}</span>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-xs font-bold text-slate-500 block">טלפון / מוקד מענה:</span>
            <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold">${contactPhone}</span>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:col-span-2">
            <span class="text-xs font-bold text-slate-500 block">כתובת משרדים:</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">${officeAddress}</span>
          </div>
        </div>
      </section>

    </div>
  `;

  return {
    pageId,
    pageTitle: 'תנאי שימוש באתר',
    slug: 'terms',
    pageCategory: 'info_content',
    published: true,
    publishedAt: now,
    viewsCount: 0,
    leadsCount: 0,
    globalSettings: {
      siteTitle: `${companyName} | תנאי שימוש באתר`,
      companyName,
      legalEntityId,
      slogan,
      siteLogoUrl: logoUrl,
      theme: 'modern',
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
      primaryColor,
      secondaryColor,
      backgroundColor: '#0a0a0c',
      textColor: '#f8fafc',
      buttonBgColor: primaryColor,
      fontFamily,
      contactWhatsApp: whatsapp,
      contactPhone,
      contactEmail,
      address: officeAddress,
      brandDnaSynced: true,
      cookieConsent: {
        enabled: true,
        position: 'bottom-banner',
        title: 'הודעת פרטיות ושימוש בקובצי עוגיות (Cookies)',
        acceptButtonText: 'מאשר/ת וממשיך/ה',
        declineButtonText: 'רק הכרחיות',
        privacyPolicyLinkText: 'מדיניות פרטיות',
        privacyPolicyUrl: '/privacy',
        termsLinkText: 'תנאי שימוש',
        termsUrl: '/terms',
      },
    },
    seoSettings: {
      title: `${companyName} | תנאי שימוש באתר ותקנון פעילות`,
      description: `תנאי השימוש, תקנון הפעילות וההנחיות המשפטיות של ${companyName}. מידע אודות שירותי האתר, זכויות יוצרים, ביטול עסקאות והגבלת אחריות.`,
      keywords: ['תנאי שימוש', 'תקנון האתר', 'מדיניות ביטולים', companyName, 'זכויות יוצרים'],
      author: companyName,
      canonicalUrl: `https://${tenantId}.kosun.pro/terms`,
      ogType: 'website',
      aiEntitySchemaType: 'Article',
      aiKnowledgeSummary: `תנאי השימוש של ${companyName}${legalEntityDisplay}. האתר מופעל ומנוהל על ידי ${companyName} בכתובת ${officeAddress}, טלפון ${contactPhone}, דוא"ל ${contactEmail}.`,
      aiTargetQuestions: [
        `מהם תנאי השימוש באתר ${companyName}?`,
        `כיצד ניתן לבטל עסקה או לפנות לשירות הלקוחות של ${companyName}?`,
        `מיהי החברה המפעילה את האתר ומהם פרטי הקשר?`,
      ],
      aiBotIndexingEnabled: true,
    },
    sectionOrder: ['header-1', 'legal-content', 'contact-1'],
    sections: {
      'header-1': {
        id: 'header-1',
        type: 'header',
        visible: true,
        anchorId: 'header',
        layout: 'capsule-floating',
        sticky: true,
        useBrandLogo: true,
        showLogoText: true,
        logoText: companyName,
        customLogoUrl: logoUrl,
        showLoginButton: true,
        showCtaButton: true,
        ctaButtonText: 'ליצירת קשר',
        ctaButtonUrl: '#contact',
        showPhone: Boolean(contactPhone),
        phone: contactPhone,
        showWhatsApp: Boolean(whatsapp),
        whatsApp: whatsapp,
        desktopMenuDisplay: 'hamburger',
      },
      'legal-content': {
        id: 'legal-content',
        type: 'richContent',
        visible: true,
        anchorId: 'terms',
        heading: 'תנאי שימוש באתר ותקנון פעילות',
        subtitle: `עודכן לאחרונה: ${new Date().toLocaleDateString('he-IL')}`,
        layout: 'standard',
        backgroundColor: 'transparent',
        body: termsHtmlBody,
        items: [
          {
            id: 'item-1',
            title: 'קניין רוחני מוגן',
            description: 'כל התכנים, סימני המסחר וקוד המקור שייכים בלעדית לחברה ומוגנים בזכויות יוצרים.',
            icon: 'ShieldCheck',
          },
          {
            id: 'item-2',
            title: 'מדיניות ביטולים כחוק',
            description: 'זכות ביטול עסקאות והחזר כספי בהתאם לחוק הגנת הצרכן ותקנות ביטול עסקה.',
            icon: 'CreditCard',
          },
          {
            id: 'item-3',
            title: 'שימוש הוגן ומאובטח',
            description: 'איסור על סריקה אוטומטית או שימוש זדוני המפר את תקינות המערכות.',
            icon: 'Lock',
          },
          {
            id: 'item-4',
            title: 'סמכות שיפוט ישראלית',
            description: 'התקנון כפוף לדיני מדינת ישראל וסמכות השיפוט הבלעדית בבתי המשפט המוסמכים.',
            icon: 'FileText',
          },
        ],
      },
      'contact-1': {
        id: 'contact-1',
        type: 'contact',
        visible: true,
        anchorId: 'contact',
        title: `יצירת קשר עם ${companyName}`,
        subtitle: 'שאלות, בירורים משפטיים או תמיכה טכנית',
        phone: contactPhone,
        email: contactEmail,
        whatsapp,
        address: officeAddress,
      },
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Builds the comprehensive "Privacy Policy" page configuration (מדיניות פרטיות ואבטחת מידע)
 * Fully compliant with Israeli Protection of Privacy Law (Amendment 13), Data Security Regulations 2017, and GDPR.
 */
export function buildPrivacyPolicyPageConfig(
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): PageBuilderConfig {
  const brand = resolveLiveBrandDna(brandDnaInput, tenantId);
  const isMaster = tenantId === '_master';

  const companyName =
    brand.identity?.companyName ||
    (brand.identity as any)?.brandName ||
    (isMaster ? 'קושאן' : `עסק ${tenantId}`);

  const slogan = brand.identity?.slogan || '';
  const legalEntityId = brand.trust?.legalEntityId || '';
  const legalEntityDisplay = legalEntityId ? ` (ח.פ / מספר תאגיד: ${legalEntityId})` : '';
  const contactPhone = brand.trust?.contactPhone || '052-6968008';
  const contactEmail = brand.trust?.contactEmail || 'privacy@kosun.pro';
  const whatsapp = brand.trust?.whatsappSupportNumber || contactPhone;
  const officeAddress = brand.trust?.officeAddress || 'ישראל';

  const primaryColor = brand.designTokens?.primaryColor || '#4f46e5';
  const secondaryColor = brand.designTokens?.secondaryColor || '#0ea5e9';
  const fontFamily = brand.designTokens?.fontFamily || 'Heebo, sans-serif';
  const logoUrl = brand.identity?.logoUrl || '';

  const pageId = `page_privacy_${tenantId}`;
  const now = new Date().toISOString();

  const privacyHtmlBody = `
    <div class="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-sans" dir="rtl">
      
      <!-- מבוא והתחייבות -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>1.</span>
          <span>מבוא והתחייבות לשמירה על פרטיות</span>
        </h3>
        <p>
          חברת <strong>${companyName}</strong>${legalEntityDisplay} (להלן: ״<strong>החברה</strong>״ או ״<strong>אנו</strong>״) מכבדת את פרטיותם של המשתמשים והמבקרים באתר האינטרנט שלה ושל מקבלי שירותיה (להלן: ״<strong>המשתמש</strong>״).
        </p>
        <p>
          מדיניות זו מפרטת את האופן שבו אנו אוספים, שומרים, משתמשים ומגנים על המידע האישי שלך, ומנוסחת בהתאם להוראות <strong>חוק הגנת הפרטיות, התשמ"א-1981</strong>, <strong>תיקון מס' 13 לחוק הגנת הפרטיות</strong>, <strong>תקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017</strong>, ותקנות בינלאומיות מובילות (GDPR).
        </p>
      </section>

      <!-- המידע הנאסף -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>2.</span>
          <span>סוגי המידע הנאספים</span>
        </h3>
        <p>במסגרת השימוש באתר אנו עשויים לאסוף שני סוגי מידע:</p>
        <div class="space-y-3 pr-2">
          <div>
            <strong class="text-slate-900 dark:text-white block">א. מידע הנמסר ביודעין ומרצון על ידי המשתמש:</strong>
            <p class="text-sm mt-0.5">
              שם מלא, מספר טלפון, כתובת דואר אלקטרוני, שם הארגון או העסק, תוכן הודעות ופניות בטפסים, ופרטי תשלום במידה ומבוצעת רכישה (פרטי אמצעי התשלום מעובדים באופן מוצפן על ידי ספקי סליקה מוסמכים בתקן PCI-DSS ואינם נשמרים בשרתינו).
            </p>
          </div>
          <div>
            <strong class="text-slate-900 dark:text-white block">ב. מידע טכנולוגי וסטטיסטי הנאסף באופן אוטומטי:</strong>
            <p class="text-sm mt-0.5">
              כתובת IP, סוג הדפדפן, מערכת ההפעלה, מזהי מכשיר, שעות ומשך השהייה באתר, דפי נחיתה שנצפו, ונתוני אינטראקציה טכניים הנאספים באמצעות קובצי עוגיות (Cookies) וטכנולוגיות מעקב מתקדמות.
            </p>
          </div>
        </div>
      </section>

      <!-- מטרות איסוף המידע -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>3.</span>
          <span>מטרות איסוף המידע והשימוש בו</span>
        </h3>
        <p>המידע האישי שנאסף ישמש אך ורק למטרות המפורטות להלן:</p>
        <ul class="list-disc list-inside space-y-1.5 pr-2">
          <li>מתן מענה לפניות, מתן שירות ותמיכה טכנית ללקוחות.</li>
          <li>אספקת השירותים, תפעול האתר והבטחת פעילותו התקינה והרציפה.</li>
          <li>שיפור חוויית המשתמש, אופטימיזציה של תכנים ואנליטיקה סטטיסטית.</li>
          <li>משלוח עדכונים, הודעות תפעוליות והודעות שיווקיות – <strong>בכפוף להסכמה מפורשת בלבד</strong> לפי סעיף 30א לחוק התקשורת ("חוק הספאם"). ניתן לבטל את ההסכמה ולהסיר את פרטיך מרשימת התפוצה בכל עת בלחיצה על כפתור ״הסר״ בהודעה או בפנייה אלינו.</li>
          <li>ציות להוראות כל דין, תקנה או צו שיפוטי של רשות מוסמכת.</li>
        </ul>
      </section>

      <!-- קובצי עוגיות Cookies -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>4.</span>
          <span>קובצי עוגיות (Cookies) וכלי ניהול הסכמה</span>
        </h3>
        <p>
          האתר עושה שימוש בקובצי עוגיות (Cookies), פיקסלים וטכנולוגיות דומות לצורך זיהוי הדפדפן, שמירת העדפותיך, אבטחת מידע, ומדידת ביצועי האתר.
        </p>
        <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 my-2 space-y-2 text-sm">
          <strong class="text-slate-900 dark:text-white block">קטגוריות העוגיות באתר:</strong>
          <ul class="list-disc list-inside space-y-1 pr-1">
            <li><strong>עוגיות הכרחיות (Essential):</strong> חיוניות לפעילות הבסיסית והאבטחה של האתר. לא ניתן לבטלן.</li>
            <li><strong>עוגיות פונקציונליות ואנליטיות:</strong> מסייעות ללמוד כיצד מבקרים מתקשרים עם האתר ולשפר את חוויית המשתמש.</li>
            <li><strong>עוגיות שיווקיות והתאמה אישית:</strong> מותאמות להצגת תכנים והצעות רלוונטיות.</li>
          </ul>
        </div>
        <p>
          באפשרותך לנהל את העדפותיך, לקבל או לדחות עוגיות בלתי-הכרחיות בכל עת באמצעות באנר אישור העוגיות המופיע באתר, וכן באמצעות הגדרות הדפדפן האישי שלך.
        </p>
      </section>

      <!-- שיתוף מידע עם צד שלישי -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>5.</span>
          <span>שיתוף מידע ומסירתו לצדדים שלישיים</span>
        </h3>
        <p>
          <strong>${companyName}</strong> אינה מוכרת, משכירה או סוחרת במידע האישי שלך לצדדים שלישיים לצרכיהם המסחריים.
        </p>
        <p>מסירת מידע לצדדים שלישיים תתבצע אך ורק במקרים הבאים:</p>
        <ul class="list-disc list-inside space-y-1.5 pr-2">
          <li>לספקי שירותים מוסמכים הפועלים מטעמנו (כגון שרתי ענן מאובטחים, מערכות CRM, שירותי דיוור וסליקה), בכפוף להסכמי סודיות ואבטחת מידע קפדניים.</li>
          <li>אם נחויב לעשות כן על פי צו שיפוטי, דרישת רשות מוסמכת או הוראות כל דין.</li>
          <li>במקרה של מחלוקת משפטית, טענה או תביעה בין המשתמש לבין החברה.</li>
          <li>במקרה של מיזוג, מכירה או העברת פעילות החברה לצד שלישי, ובלבד שהגורם הקולט יקבל על עצמו את הוראות מדיניות פרטיות זו.</li>
        </ul>
      </section>

      <!-- אבטחת מידע -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>6.</span>
          <span>אבטחת מידע והגנה בסייבר</span>
        </h3>
        <p>
          אנו מיישמים מערכות, נהלים ואמצעי אבטחת מידע מתקדמים (כולל הצפנת תקשורת ב-SSL/TLS, בקרת גישה מדורגת, גיבויים שוטפים וחומות אש) בהתאם לתקנות הגנת הפרטיות (אבטחת מידע). יחד עם זאת, אף מערכת אינה חסינה באופן מוחלט, והחברה אינה מתחייבת כי המערכות תהיינה מוגנות באופן הרמטי מכל חדירה או שימוש בלתי מורשה.
        </p>
      </section>

      <!-- זכויות המשתמש לעיון ותיקון -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>7.</span>
          <span>זכויות המשתמש: עיון, תיקון ומחיקת מידע</span>
        </h3>
        <p>
          בהתאם לסעיפים 13 ו-14 ל<strong>חוק הגנת הפרטיות, התשמ"א-1981</strong>, כל אדם זכאי לעיין בעצמו, או על ידי בא-כוחו המורשה בכתב, במידע שעליו המוחזק במאגר מידע.
        </p>
        <p>
          אדם שעיין במידע ומצא כי אינו נכון, שלם, ברור או מעודכן, רשאי לפנות לבעל מאגר המידע בבקשה לתקן את המידע או למוחקו.
        </p>
        <p>
          למימוש זכויות אלה, ניתן לפנות אל ממונה הגנת הפרטיות בחברה באמצעות דוא"ל: <strong>${contactEmail}</strong>, ואנו נטפל בפנייתך בתוך פרק הזמן הקבוע בחוק.
        </p>
      </section>

      <!-- עדכון המדיניות -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>8.</span>
          <span>עדכונים למדיניות הפרטיות</span>
        </h3>
        <p>
          החברה רשאית לשנות ולעדכן את מדיניות הפרטיות מעת לעת. במקרה של שינוי מהותי, תפורסם הודעה בולטת באתר או יישלח עדכון בדוא"ל. מומלץ לחזור ולעיין במדיניות זו מעת לעת.
        </p>
      </section>

      <!-- פרטי התקשרות -->
      <section class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>9.</span>
          <span>ממונה הגנת הפרטיות ופרטי התקשרות</span>
        </h3>
        <p>
          לכל בירור, שאלה, תלונה או מימוש זכויות לפי חוק הגנת הפרטיות, ניתן לפנות ישירות אל <strong>${companyName}</strong>:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-xs font-bold text-slate-500 block">דוא"ל ממונה פרטיות:</span>
            <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold">${contactEmail}</span>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-xs font-bold text-slate-500 block">טלפון / וואטסאפ:</span>
            <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold">${contactPhone}</span>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:col-span-2">
            <span class="text-xs font-bold text-slate-500 block">כתובת:</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">${officeAddress}</span>
          </div>
        </div>
      </section>

    </div>
  `;

  return {
    pageId,
    pageTitle: 'מדיניות פרטיות',
    slug: 'privacy',
    pageCategory: 'info_content',
    published: true,
    publishedAt: now,
    viewsCount: 0,
    leadsCount: 0,
    globalSettings: {
      siteTitle: `${companyName} | מדיניות פרטיות ואבטחת מידע`,
      companyName,
      legalEntityId,
      slogan,
      siteLogoUrl: logoUrl,
      theme: 'modern',
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
      primaryColor,
      secondaryColor,
      backgroundColor: '#0a0a0c',
      textColor: '#f8fafc',
      buttonBgColor: primaryColor,
      fontFamily,
      contactWhatsApp: whatsapp,
      contactPhone,
      contactEmail,
      address: officeAddress,
      brandDnaSynced: true,
      cookieConsent: {
        enabled: true,
        position: 'bottom-banner',
        title: 'הודעת פרטיות ושימוש בקובצי עוגיות (Cookies)',
        acceptButtonText: 'מאשר/ת וממשיך/ה',
        declineButtonText: 'רק הכרחיות',
        privacyPolicyLinkText: 'מדיניות פרטיות',
        privacyPolicyUrl: '/privacy',
        termsLinkText: 'תנאי שימוש',
        termsUrl: '/terms',
      },
    },
    seoSettings: {
      title: `${companyName} | מדיניות פרטיות ואבטחת מידע`,
      description: `מדיניות הפרטיות, אבטחת המידע והשימוש בעוגיות (Cookies) של ${companyName}. מידע על זכויות המשתמש, עיון במידע, מאגרי מידע ואבטחה לפי חוק הגנת הפרטיות.`,
      keywords: ['מדיניות פרטיות', 'אבטחת מידע', 'קובצי עוגיות', 'Cookies', companyName, 'זכות עיון'],
      author: companyName,
      canonicalUrl: `https://${tenantId}.kosun.pro/privacy`,
      ogType: 'website',
      aiEntitySchemaType: 'Article',
      aiKnowledgeSummary: `מדיניות הפרטיות של ${companyName}${legalEntityDisplay}. החברה אוספת מידע לצורך מתן שירותים בלבד, עומדת בחוק הגנת הפרטיות ותקנות אבטחת מידע, ומאפשרת זכות עיון ומחיקה. דוא"ל ממונה: ${contactEmail}.`,
      aiTargetQuestions: [
        `מהי מדיניות הפרטיות של ${companyName}?`,
        `כיצד פונים לעיון או מחיקת מידע ב-${companyName}?`,
        `האם האתר של ${companyName} משתמש בקובצי עוגיות (Cookies)?`,
      ],
      aiBotIndexingEnabled: true,
    },
    sectionOrder: ['header-1', 'privacy-content', 'contact-1'],
    sections: {
      'header-1': {
        id: 'header-1',
        type: 'header',
        visible: true,
        anchorId: 'header',
        layout: 'capsule-floating',
        sticky: true,
        useBrandLogo: true,
        showLogoText: true,
        logoText: companyName,
        customLogoUrl: logoUrl,
        showLoginButton: true,
        showCtaButton: true,
        ctaButtonText: 'ליצירת קשר',
        ctaButtonUrl: '#contact',
        showPhone: Boolean(contactPhone),
        phone: contactPhone,
        showWhatsApp: Boolean(whatsapp),
        whatsApp: whatsapp,
        desktopMenuDisplay: 'hamburger',
      },
      'privacy-content': {
        id: 'privacy-content',
        type: 'richContent',
        visible: true,
        anchorId: 'privacy',
        heading: 'מדיניות פרטיות ואבטחת מידע',
        subtitle: `עודכן לאחרונה: ${new Date().toLocaleDateString('he-IL')}`,
        layout: 'standard',
        backgroundColor: 'transparent',
        body: privacyHtmlBody,
        items: [
          {
            id: 'item-1',
            title: 'ציות מלא לחוק',
            description: 'עמידה בחוק הגנת הפרטיות, תיקון 13, תקנות אבטחת מידע ו-GDPR.',
            icon: 'ShieldCheck',
          },
          {
            id: 'item-2',
            title: 'שליטה בעוגיות (Cookies)',
            description: 'אפשרות מלאה לניהול העדפות, אישור או הגבלת עוגיות באמצעות באנר ייעודי.',
            icon: 'Cookie',
          },
          {
            id: 'item-3',
            title: 'אבטחת SSL/TLS',
            description: 'הצפנה מתקדמת, בקרות גישה הדוקות והגנה רב-שכבתית על הנתונים.',
            icon: 'Lock',
          },
          {
            id: 'item-4',
            title: 'זכות עיון ותיקון',
            description: 'זכות מלאה לפי סעיפים 13 ו-14 לעיין במידע, לתקנו או לבקש את מחיקתו.',
            icon: 'FileText',
          },
        ],
      },
      'contact-1': {
        id: 'contact-1',
        type: 'contact',
        visible: true,
        anchorId: 'contact',
        title: `ממונה הגנת הפרטיות • ${companyName}`,
        subtitle: 'למימוש זכויות, פניות ובירורים בנושאי אבטחה ופרטיות',
        phone: contactPhone,
        email: contactEmail,
        whatsapp,
        address: officeAddress,
      },
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Ensures that both Terms of Use and Privacy Policy pages exist for a tenant.
 * If either is missing, it is created dynamically using the tenant's live Brand DNA.
 */
export async function ensureDefaultLegalPages(
  db?: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<EnsureLegalPagesResult> {
  const effTenant = tenantId || '_master';
  const allPages = await pageBuilderFirestore.getAllPages(db, effTenant);

  // Check if terms page exists
  let termsPage = allPages.find((p) => {
    const s = (p.slug || '').toLowerCase().trim();
    const pid = (p.pageId || '').toLowerCase().trim();
    return s === 'terms' || s === 'terms-of-use' || s === 'kosinfo-terms' || pid.includes('terms');
  });

  // Check if privacy page exists
  let privacyPage = allPages.find((p) => {
    const s = (p.slug || '').toLowerCase().trim();
    const pid = (p.pageId || '').toLowerCase().trim();
    return s === 'privacy' || s === 'privacy-policy' || s === 'kosinfo-privacy' || pid.includes('privacy');
  });

  let createdAny = false;

  if (!termsPage) {
    termsPage = buildTermsOfUsePageConfig(effTenant, brandDnaInput);
    await pageBuilderFirestore.savePage(termsPage, db, effTenant);
    createdAny = true;
  }

  if (!privacyPage) {
    privacyPage = buildPrivacyPolicyPageConfig(effTenant, brandDnaInput);
    await pageBuilderFirestore.savePage(privacyPage, db, effTenant);
    createdAny = true;
  }

  return {
    termsPage,
    privacyPage,
    created: createdAny,
  };
}

/**
 * Synchronizes existing legal pages when Brand DNA is updated (Brand DNA -> Legal Pages).
 */
export async function syncLegalPagesWithBrandDna(
  db?: Firestore | null,
  tenantId: string = '_master',
  brandDnaInput?: BrandDna | null
): Promise<void> {
  const effTenant = tenantId || '_master';
  const brand = resolveLiveBrandDna(brandDnaInput, effTenant);
  const allPages = await pageBuilderFirestore.getAllPages(db, effTenant);

  const termsPage = allPages.find((p) => {
    const s = (p.slug || '').toLowerCase().trim();
    const pid = (p.pageId || '').toLowerCase().trim();
    return s === 'terms' || s === 'terms-of-use' || s === 'kosinfo-terms' || pid.includes('terms');
  });

  const privacyPage = allPages.find((p) => {
    const s = (p.slug || '').toLowerCase().trim();
    const pid = (p.pageId || '').toLowerCase().trim();
    return s === 'privacy' || s === 'privacy-policy' || s === 'kosinfo-privacy' || pid.includes('privacy');
  });

  const companyName = brand.identity?.companyName || (effTenant === '_master' ? 'קושאן' : `עסק ${effTenant}`);
  const legalEntityId = brand.trust?.legalEntityId || '';
  const phone = brand.trust?.contactPhone || '';
  const email = brand.trust?.contactEmail || '';
  const address = brand.trust?.officeAddress || '';
  const whatsapp = brand.trust?.whatsappSupportNumber || phone;
  const primaryColor = brand.designTokens?.primaryColor;

  if (termsPage && termsPage.globalSettings?.brandDnaSynced !== false) {
    const freshTerms = buildTermsOfUsePageConfig(effTenant, brand);
    const updatedTerms: PageBuilderConfig = {
      ...termsPage,
      pageTitle: termsPage.pageTitle || 'תנאי שימוש באתר',
      globalSettings: {
        ...termsPage.globalSettings,
        companyName,
        legalEntityId,
        contactPhone: phone || termsPage.globalSettings?.contactPhone,
        contactEmail: email || termsPage.globalSettings?.contactEmail,
        address: address || termsPage.globalSettings?.address,
        contactWhatsApp: whatsapp || termsPage.globalSettings?.contactWhatsApp,
        primaryColor: primaryColor || termsPage.globalSettings?.primaryColor,
        brandDnaSynced: true,
      },
      sections: {
        ...termsPage.sections,
        'legal-content': freshTerms.sections['legal-content'],
        'contact-1': {
          ...(termsPage.sections['contact-1'] || freshTerms.sections['contact-1']),
          phone,
          email,
          whatsapp,
          address,
        },
      },
      updatedAt: new Date().toISOString(),
    };
    await pageBuilderFirestore.savePage(updatedTerms, db, effTenant);
  }

  if (privacyPage && privacyPage.globalSettings?.brandDnaSynced !== false) {
    const freshPrivacy = buildPrivacyPolicyPageConfig(effTenant, brand);
    const updatedPrivacy: PageBuilderConfig = {
      ...privacyPage,
      pageTitle: privacyPage.pageTitle || 'מדיניות פרטיות',
      globalSettings: {
        ...privacyPage.globalSettings,
        companyName,
        legalEntityId,
        contactPhone: phone || privacyPage.globalSettings?.contactPhone,
        contactEmail: email || privacyPage.globalSettings?.contactEmail,
        address: address || privacyPage.globalSettings?.address,
        contactWhatsApp: whatsapp || privacyPage.globalSettings?.contactWhatsApp,
        primaryColor: primaryColor || privacyPage.globalSettings?.primaryColor,
        brandDnaSynced: true,
      },
      sections: {
        ...privacyPage.sections,
        'privacy-content': freshPrivacy.sections['privacy-content'],
        'contact-1': {
          ...(privacyPage.sections['contact-1'] || freshPrivacy.sections['contact-1']),
          phone,
          email,
          whatsapp,
          address,
        },
      },
      updatedAt: new Date().toISOString(),
    };
    await pageBuilderFirestore.savePage(updatedPrivacy, db, effTenant);
  }
}

/**
 * Synchronizes updates made within KWB settings or Legal pages back into Brand DNA (KWB -> Brand DNA).
 * This guarantees true bidirectional synchronization!
 */
export async function syncBrandDnaFromLegalSettings(
  db?: Firestore | null,
  tenantId: string = '_master',
  updates: {
    companyName?: string;
    legalEntityId?: string;
    contactPhone?: string;
    contactEmail?: string;
    officeAddress?: string;
    whatsappSupportNumber?: string;
    primaryColor?: string;
    secondaryColor?: string;
  } = {}
): Promise<boolean> {
  const effTenant = tenantId || '_master';
  const currentBrand = resolveLiveBrandDna(null, effTenant);

  const updatedDna: BrandDna = {
    ...currentBrand,
    identity: {
      ...currentBrand.identity,
      companyName: updates.companyName !== undefined ? updates.companyName : currentBrand.identity?.companyName,
    },
    trust: {
      ...currentBrand.trust,
      legalEntityId: updates.legalEntityId !== undefined ? updates.legalEntityId : currentBrand.trust?.legalEntityId,
      contactPhone: updates.contactPhone !== undefined ? updates.contactPhone : currentBrand.trust?.contactPhone,
      contactEmail: updates.contactEmail !== undefined ? updates.contactEmail : currentBrand.trust?.contactEmail,
      officeAddress: updates.officeAddress !== undefined ? updates.officeAddress : currentBrand.trust?.officeAddress,
      whatsappSupportNumber: updates.whatsappSupportNumber !== undefined ? updates.whatsappSupportNumber : currentBrand.trust?.whatsappSupportNumber,
    },
    designTokens: {
      ...currentBrand.designTokens,
      primaryColor: updates.primaryColor !== undefined ? updates.primaryColor : currentBrand.designTokens?.primaryColor,
      secondaryColor: updates.secondaryColor !== undefined ? updates.secondaryColor : currentBrand.designTokens?.secondaryColor,
    },
    updatedAt: new Date().toISOString(),
  };

  const saveRes = await saveBrandDna(updatedDna, db || undefined, effTenant);
  if (saveRes.success) {
    eventBus.emit('brand:updated', {
      brandDna: updatedDna,
      updatedAt: updatedDna.updatedAt!,
    });
    return true;
  }
  return false;
}
