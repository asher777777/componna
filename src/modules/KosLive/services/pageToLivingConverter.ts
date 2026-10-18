import { Firestore, collection, getDocs } from 'firebase/firestore';
import { 
  ExtractedPageSummary, 
  LivingProject, 
  LivingScene, 
  LivingCampaignContract,
  LivingCarouselCardItem,
  LivingFormFieldConfig,
  AspectRatioType
} from '../types';
import { KOS_LIVE_AVATARS } from '../config';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts';
import { ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { cleanSubtitleText } from './subtitleService';

function resolveEffectiveTenant(tenantId?: string): string {
  if (!tenantId || tenantId === ROOT_TENANT_ID || tenantId === '_master') {
    return ROOT_TENANT_ID;
  }
  return tenantId;
}

/**
 * Fetches all KosWebAi pages for the current tenant directly from Firestore & LocalStorage
 * without any cross-module import.
 */
export async function fetchAllTenantPages(db: Firestore | undefined, tenantId?: string): Promise<any[]> {
  const eff = resolveEffectiveTenant(tenantId);
  const pagesMap = new Map<string, any>();

  // 1. Try Firestore Primary & Legacy Collections
  if (db) {
    const paths = [
      eff === ROOT_TENANT_ID ? `tenants/_master/${SYSTEM_COLLECTIONS.PAGES}` : `tenants/${eff}/${SYSTEM_COLLECTIONS.PAGES}`,
      eff === ROOT_TENANT_ID ? `tenants/_master/mod_pages_documents` : `tenants/${eff}/mod_pages_documents`,
    ];

    for (const path of paths) {
      try {
        const snap = await getDocs(collection(db, path));
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const id = data.pageId || docSnap.id;
          if (id && !pagesMap.has(id)) {
            pagesMap.set(id, { ...data, pageId: id });
          }
        });
      } catch (err) {
        console.warn(`[pageToLivingConverter] Notice reading ${path}:`, err);
      }
    }
  }

  // 2. Merge LocalStorage Fallbacks
  if (typeof window !== 'undefined') {
    const storageKeys = [
      `kosun_${eff}_pagebuilder_all_pages`,
      'kosun_pagebuilder_all_pages'
    ];
    for (const key of storageKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const list = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
          list.forEach((p: any) => {
            if (p && p.pageId && !pagesMap.has(p.pageId)) {
              pagesMap.set(p.pageId, p);
            }
          });
        }
      } catch {}
    }
  }

  return Array.from(pagesMap.values());
}

/**
 * Deeply extracts all structured marketing, product, pricing, FAQ, testimonial, and form data from a PageBuilder config
 */
export function extractPageContentForLiving(page: any): ExtractedPageSummary {
  const sections = page?.sections || {};
  const order: string[] = page?.sectionOrder || Object.keys(sections);

  let heroHeadline = '';
  let heroSubheadline = '';
  let heroCtaText = '';
  let heroImageUrl = '';
  let heroVideoUrl = '';

  const services: Array<{ title: string; description?: string; badge?: string; imageUrl?: string; icon?: string; price?: string }> = [];
  const products: Array<{ title: string; description?: string; price?: string; imageUrl?: string; badge?: string }> = [];
  const faqItems: Array<{ question: string; answer: string; category?: string }> = [];
  const testimonials: Array<{ name: string; content: string; rating?: number; role?: string; avatarUrl?: string }> = [];
  const pricingPackages: Array<{ name: string; price: string; features: string[]; badge?: string }> = [];
  const stats: Array<{ number: string; label: string; description?: string }> = [];
  const formFields: Array<{ key: string; label: string; type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number'; placeholder?: string; required?: boolean }> = [];
  let smartFormId: string | undefined = undefined;
  let formTitle: string | undefined = undefined;
  let formSubtitle: string | undefined = undefined;
  const textBlocks: string[] = [];

  textBlocks.push(`=== כותרת העמוד: ${page?.pageTitle || 'עמוד ראשי'} (${page?.slug || ''}) ===`);
  if (page?.globalSettings?.companyName) {
    textBlocks.push(`שם החברה / מותג: ${page.globalSettings.companyName}`);
  }
  if (page?.globalSettings?.slogan) {
    textBlocks.push(`סלוגן: ${page.globalSettings.slogan}`);
  }

  order.forEach((secId) => {
    const sec = sections[secId];
    if (!sec || sec.visible === false) return;

    switch (sec.type) {
      case 'hero':
      case 'tiktokHero':
      case 'campaignHeader':
        if (!heroHeadline) heroHeadline = sec.title || sec.headline || '';
        if (!heroSubheadline) heroSubheadline = sec.subtitle || sec.description || '';
        if (!heroCtaText) heroCtaText = sec.primaryButton?.text || sec.ctaText || '';
        if (!heroImageUrl) heroImageUrl = sec.backgroundImageUrl || sec.imageUrl || sec.heroImage || '';
        if (!heroVideoUrl) heroVideoUrl = sec.videoUrl || sec.backgroundVideoUrl || '';
        textBlocks.push(`\n[סקשן ראשי / Hero]: כותרת: ${sec.title || ''}. משנה: ${sec.subtitle || sec.description || ''}. CTA: ${sec.primaryButton?.text || ''}`);
        break;

      case 'services':
      case 'mainContent':
      case 'richContent':
        if (sec.title) textBlocks.push(`\n[שירותים ותוכן מרכזי]: ${sec.title} - ${sec.subtitle || ''}`);
        (sec.items || sec.features || sec.cards || []).forEach((item: any, idx: number) => {
          if (typeof item === 'string') {
            services.push({
              title: item,
              description: sec.subtitle || 'יתרון מרכזי מבית המותג',
              icon: 'sparkles'
            });
            textBlocks.push(`• ${item}`);
          } else if (item && (item.title || item.name)) {
            services.push({
              title: item.title || item.name,
              description: item.description || item.subtitle || item.text || '',
              badge: item.badge || item.tag,
              imageUrl: item.imageUrl || item.image,
              icon: item.icon || (idx % 2 === 0 ? 'sparkles' : 'award'),
              price: item.price
            });
            textBlocks.push(`• ${item.title || item.name}: ${item.description || ''} ${item.price ? `[מחיר: ${item.price}]` : ''}`);
          }
        });
        break;

      case 'dynamicListing':
      case 'imageListing':
      case 'campaignTiers':
        if (sec.title) textBlocks.push(`\n[קטלוג מוצרים / מדרגות]: ${sec.title}`);
        (sec.items || sec.listings || sec.tiers || []).forEach((item: any) => {
          const title = item.title || item.name || 'מוצר נבחר';
          const desc = item.description || item.subtitle || '';
          const price = item.price || (item.amount ? `₪${item.amount}` : undefined);
          const imageUrl = item.imageUrl || item.image || '';
          const badge = item.badge || item.category || '';
          products.push({ title, description: desc, price, imageUrl, badge });
          services.push({ title, description: desc, price, imageUrl, badge, icon: 'shopping_bag' });
          textBlocks.push(`🛍️ מוצר/חבילה: ${title} - ${desc} ${price ? `(${price})` : ''}`);
        });
        break;

      case 'pricing':
        textBlocks.push(`\n[חבילות ומחירים / Pricing]:`);
        (sec.packages || sec.plans || []).forEach((pkg: any) => {
          const priceStr = pkg.priceMonthly || pkg.priceYearly || pkg.price || '';
          pricingPackages.push({
            name: pkg.name || pkg.title || 'חבילה',
            price: String(priceStr),
            features: Array.isArray(pkg.features) ? pkg.features : [],
            badge: pkg.badge || (pkg.isPopular ? '⭐ מומלץ' : undefined)
          });
          products.push({
            title: pkg.name || pkg.title || 'חבילה',
            description: Array.isArray(pkg.features) ? pkg.features.slice(0, 3).join(' • ') : '',
            price: String(priceStr),
            badge: pkg.badge || (pkg.isPopular ? '⭐ מומלץ' : '💎 חבילה')
          });
          textBlocks.push(`💎 חבילה: ${pkg.name} | מחיר: ${priceStr} | יתרונות: ${(pkg.features || []).join(', ')}`);
        });
        break;

      case 'faq':
        textBlocks.push(`\n[שאלות נפוצות ותשובות / FAQ]:`);
        (sec.items || []).forEach((item: any) => {
          if (item.question && item.answer) {
            faqItems.push({
              question: item.question,
              answer: item.answer,
              category: item.category,
            });
            textBlocks.push(`❓ שאלה: ${item.question}\n   תשובה: ${item.answer}`);
          }
        });
        break;

      case 'testimonials':
        textBlocks.push(`\n[המלצות לקוחות / Testimonials]:`);
        (sec.items || []).forEach((item: any) => {
          testimonials.push({
            name: item.name || item.author || 'לקוח מרוצה',
            content: item.content || item.text || item.quote || '',
            rating: item.rating || 5,
            role: item.role || item.company,
            avatarUrl: item.avatarUrl || item.image
          });
          textBlocks.push(`⭐ ${item.name}: "${item.content}"`);
        });
        break;

      case 'statsBento':
      case 'liveAnalytics':
        (sec.stats || sec.items || []).forEach((st: any) => {
          stats.push({
            number: `${st.number || st.value || ''}${st.suffix || ''}`,
            label: st.label || st.title || '',
            description: st.description || '',
          });
          textBlocks.push(`📊 נתון: ${st.number || st.value || ''}${st.suffix || ''} - ${st.label || st.title || ''}`);
        });
        break;

      case 'landingSection':
      case 'smartForm':
      case 'eventRsvp':
        if (sec.title && !formTitle) formTitle = sec.title;
        if (sec.subtitle && !formSubtitle) formSubtitle = sec.subtitle;
        if (sec.formId || sec.smartFormId) smartFormId = sec.formId || sec.smartFormId;
        (sec.fields || sec.formConfig?.fields || []).forEach((f: any, idx: number) => {
          const rawType = String(f.type || 'text').toLowerCase();
          const validType: LivingFormFieldConfig['type'] = 
            ['text', 'email', 'tel', 'textarea', 'select', 'number'].includes(rawType)
              ? (rawType as LivingFormFieldConfig['type'])
              : 'text';
          formFields.push({
            key: f.map_to || f.key || f.name || `field_${idx + 1}`,
            label: f.label || `שדה ${idx + 1}`,
            type: validType,
            placeholder: f.placeholder || f.label || '',
            required: f.required !== false
          });
        });
        textBlocks.push(`\n[טופס לידים בעמוד]: ${sec.title || 'טופס יצירת קשר'} (${formFields.length} שדות)`);
        break;

      case 'contact':
        textBlocks.push(`\n[פרטי יצירת קשר]: טלפון: ${sec.phone || ''}, וואטסאפ: ${sec.whatsapp || ''}, אימייל: ${sec.email || ''}`);
        break;
    }
  });

  const contact = {
    phone: sections.contact?.phone || page?.globalSettings?.contactPhone || page?.globalSettings?.floatingContactWidget?.phone,
    email: sections.contact?.email || page?.globalSettings?.contactEmail || page?.globalSettings?.floatingContactWidget?.email,
    whatsapp: sections.contact?.whatsapp || page?.globalSettings?.contactWhatsApp || page?.globalSettings?.floatingContactWidget?.whatsapp,
    address: sections.contact?.address || page?.globalSettings?.address,
  };

  return {
    pageId: page?.pageId || 'page_' + Date.now(),
    pageTitle: page?.pageTitle || 'עמוד נחיתה אינטראקטיבי',
    slug: page?.slug || 'page-' + Date.now(),
    companyName: page?.globalSettings?.companyName,
    slogan: page?.globalSettings?.slogan,
    logoUrl: page?.globalSettings?.siteLogoUrl,
    primaryColor: page?.globalSettings?.primaryColor,
    heroHeadline,
    heroSubheadline,
    heroCtaText,
    heroImageUrl,
    heroVideoUrl,
    services,
    products,
    faqItems,
    testimonials,
    pricingPackages,
    stats,
    contact,
    formFields,
    smartFormId,
    formTitle,
    formSubtitle,
    sectionsSummaryText: textBlocks.join('\n'),
  };
}

/**
 * Generates an exact number of Carousel Cards (`cardCount`) populated from the extracted page data
 * (or realistic defaults if no page is attached).
 */
export function buildCardsFromPageSummary(
  summary?: ExtractedPageSummary | null,
  cardCount: number = 3,
  defaultTargetSceneId: string = 'scene_lead'
): LivingCarouselCardItem[] {
  const safeCount = Math.min(Math.max(cardCount, 0), 12);
  if (safeCount === 0) return [];

  const pool: LivingCarouselCardItem[] = [];

  if (summary) {
    // 1. Services & Features
    summary.services.forEach((srv, idx) => {
      pool.push({
        id: `card_srv_${idx}_${Date.now()}`,
        title: srv.title,
        description: srv.description || 'פתרון מקצועי מותאם אישית לצרכים שלכם',
        badge: srv.badge || (srv.price ? `מחיר: ${srv.price}` : '✨ שירות מוביל'),
        price: srv.price,
        imageUrl: srv.imageUrl || summary.heroImageUrl,
        icon: srv.icon || (idx % 3 === 0 ? 'sparkles' : idx % 3 === 1 ? 'award' : 'rocket'),
        targetSceneId: defaultTargetSceneId,
        actionLabel: 'לפרטים והזמנה ➔'
      });
    });

    // 2. Pricing Packages
    summary.pricingPackages.forEach((pkg, idx) => {
      pool.push({
        id: `card_pkg_${idx}_${Date.now()}`,
        title: pkg.name,
        description: pkg.features.slice(0, 3).join(' • ') || 'חבילה מקיפה ומשתלמת',
        badge: pkg.badge || '💎 חבילה מומלצת',
        price: pkg.price,
        imageUrl: summary.heroImageUrl,
        icon: 'crown',
        targetSceneId: defaultTargetSceneId,
        actionLabel: 'בחר חבילה זו ➔'
      });
    });

    // 3. Stats
    summary.stats.forEach((st, idx) => {
      pool.push({
        id: `card_stat_${idx}_${Date.now()}`,
        title: `${st.number} - ${st.label}`,
        description: st.description || 'נתוני אמת מוכחים של לקוחותינו',
        badge: '📊 נתון מוכח',
        icon: 'trending_up',
        targetSceneId: defaultTargetSceneId,
        actionLabel: 'גלה איך ➔'
      });
    });

    // 4. Testimonials
    summary.testimonials.forEach((testi, idx) => {
      pool.push({
        id: `card_testi_${idx}_${Date.now()}`,
        title: `המלצה: ${testi.name}`,
        description: `"${testi.content}"`,
        badge: '⭐ לקוח ממליץ',
        imageUrl: testi.avatarUrl,
        icon: 'star',
        targetSceneId: defaultTargetSceneId,
        actionLabel: 'הצטרפו להצלחה ➔'
      });
    });

    // 5. FAQs
    summary.faqItems.forEach((faq, idx) => {
      pool.push({
        id: `card_faq_${idx}_${Date.now()}`,
        title: faq.question,
        description: faq.answer,
        badge: '❓ שאלה נפוצה',
        icon: 'help',
        targetSceneId: defaultTargetSceneId,
        actionLabel: 'שאל שאלה נוספת ➔'
      });
    });
  }

  // Fallback templates if pool has fewer items than requested `safeCount`
  const defaultFallbacks = [
    { title: 'ליווי מקצועי ואישי 1-על-1', description: 'התאמה מדויקת לצרכי העסק והמטרות שלכם', badge: '👑 VIP', icon: 'crown' },
    { title: 'חיסכון בזמן ותוצאות מהירות', description: 'מערכת חכמה שמייצרת תוצאות מוכחות מהיום הראשון', badge: '🚀 מהיר', icon: 'rocket' },
    { title: 'אחריות מלאה ושקט נפשי', description: 'ביטחון מלא בכל שלב עם תמיכה זמינה בוואטסאפ ובטלפון', badge: '🛡️ אחריות', icon: 'shield' },
    { title: 'הגדלת אחוזי ההמרה והמכירות', description: 'הפיכת מתעניינים ללקוחות משלמים בחוויה אינטראקטיבית', badge: '📈 צמיחה', icon: 'trending_up' },
    { title: 'הטבה מיוחדת למצטרפים היום', description: 'שריינו עכשיו את התנאים המועדפים לזמן מוגבל', badge: '🎁 הטבה', icon: 'gift' },
  ];

  while (pool.length < safeCount) {
    const fb = defaultFallbacks[pool.length % defaultFallbacks.length];
    pool.push({
      id: `card_auto_${pool.length + 1}_${Date.now()}`,
      title: fb.title,
      description: fb.description,
      badge: fb.badge,
      icon: fb.icon,
      imageUrl: summary?.heroImageUrl,
      targetSceneId: defaultTargetSceneId,
      actionLabel: 'לתיאום ופרטים ➔'
    });
  }

  return pool.slice(0, safeCount);
}

/**
 * Extracts or builds the Lead Form fields from the page summary
 */
export function buildFormFieldsFromPageSummary(summary?: ExtractedPageSummary | null): LivingFormFieldConfig[] {
  if (summary && summary.formFields && summary.formFields.length > 0) {
    return summary.formFields.map((f, idx) => ({
      key: f.key || `field_${idx + 1}`,
      label: f.label,
      type: f.type || 'text',
      placeholder: f.placeholder || f.label,
      required: f.required !== false
    }));
  }

  return [
    { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text', required: true },
    { key: 'phone', label: 'מספר טלפון נייד / וואטסאפ', placeholder: '050-0000000', type: 'tel', required: true },
    { key: 'email', label: 'דואר אלקטרוני (אופציונלי)', placeholder: 'name@company.com', type: 'email', required: false }
  ];
}

/**
 * Converts an ExtractedPageSummary into a complete, multi-scene LivingProject & LivingCampaignContract
 * with full Carousel Cards (matching `cardCountPerScene`), Lead Forms, Quick Replies, and Subtitles.
 */
export function convertSummaryToLivingCampaign(
  summary: ExtractedPageSummary,
  options?: {
    sceneCount?: number;
    cardCountPerScene?: number;
    includeLeadForm?: boolean;
    smartFormId?: string;
    formsApiEndpoint?: string;
    aspectRatio?: AspectRatioType;
    primaryColor?: string;
  }
): {
  project: LivingProject;
  campaign: LivingCampaignContract;
} {
  const cardCount = options?.cardCountPerScene ?? 3;
  const includeLeadForm = options?.includeLeadForm !== false;
  const aspectRatio: AspectRatioType = options?.aspectRatio || '9:16';
  const primaryColor = options?.primaryColor || summary.primaryColor || '#eab308';

  const projectId = 'live_' + summary.pageId.replace(/[^a-zA-Z0-9]/g, '_');
  const slug = `living-${summary.slug || projectId}`;
  const defaultAvatar = KOS_LIVE_AVATARS[1]; // Shira Warm

  const scenes: Record<string, LivingScene> = {};
  const scenesList: LivingScene[] = [];

  const allCards = buildCardsFromPageSummary(summary, Math.max(cardCount * 2, 6), 'scene_lead');
  const formFields = buildFormFieldsFromPageSummary(summary);

  // Scene 1: Welcome & Hook
  const scene1Id = 'scene_welcome';
  const hookScript = summary.heroHeadline 
    ? `[warm] שלום! שמחים שהגעתם ל-${summary.companyName || summary.pageTitle}. [pause] ${summary.heroHeadline}. ${summary.heroSubheadline ? summary.heroSubheadline : 'אנחנו כאן כדי לתת לכם את המענה הטוב ביותר.'} [excited] בחרו בכרטיסיות או בכפתורים למטה מה תרצו לבדוק עכשיו!`
    : `[warm] שלום וברוכים הבאים! אני כאן כדי להציג לכם את כל מה שיש ל-${summary.pageTitle} להציע. [excited] כיצד אוכל לעזור לכם היום?`;

  const scene1Overlays: any[] = [];
  if (cardCount > 0) {
    scene1Overlays.push({
      id: 'ov_welcome_carousel',
      type: 'carousel',
      position: 'center',
      title: summary.heroHeadline || `הפתרונות המובילים של ${summary.companyName || summary.pageTitle}`,
      subtitle: summary.heroSubheadline || 'דפדפו בין הכרטיסיות ולחצו לפרטים',
      cards: allCards.slice(0, cardCount)
    });
  }
  scene1Overlays.push({
    id: 'ov_welcome_actions',
    type: 'quick_replies',
    position: 'bottom',
    title: 'בחרו מסלול להתאמה אישית:',
    actions: [
      { id: 'act_srv', label: '🚀 מה כוללים השירותים?', targetSceneId: 'scene_services', variant: 'gold', icon: 'rocket' },
      ...(summary.pricingPackages.length > 0 || summary.products.length > 0
        ? [{ id: 'act_prc', label: '💳 חבילות ומחירים', targetSceneId: 'scene_pricing', variant: 'primary' as const, icon: 'credit_card' }] 
        : []),
      { id: 'act_faq', label: '❓ שאלות נפוצות', targetSceneId: 'scene_faq', variant: 'outline', icon: 'help' },
      { id: 'act_lead', label: '📞 השארת פרטים מהירה', targetSceneId: 'scene_lead', variant: 'secondary', icon: 'phone' },
    ],
  });

  const scene1: LivingScene = {
    id: scene1Id,
    sceneNumber: 1,
    title: 'קבלת פנים ומבוא אישי',
    dialogueScript: hookScript,
    subtitleText: cleanSubtitleText(hookScript),
    subtitleStyle: 'boxed',
    subtitleAnimation: 'word',
    subtitleFontSize: 18,
    subtitlePosition: 'bottom',
    renderedVideoUrl: summary.heroVideoUrl || defaultAvatar.previewVideoUrl,
    backgroundMediaUrl: summary.heroImageUrl || defaultAvatar.previewImageUrl,
    avatarId: defaultAvatar.id,
    voiceId: defaultAvatar.voiceId,
    sceneRole: 'welcome_hook',
    autoPlay: true,
    loopUntilTrigger: true,
    soundEnabled: true,
    micPosition: 'bottom',
    micIcon: 'mic',
    micActionType: 'open_text_input',
    autoTransitionOnEnd: false,
    enableVoiceTrigger: true,
    whatsappNumber: summary.contact.whatsapp || summary.contact.phone,
    allowedIntents: {
      'services': 'scene_services',
      'pricing': 'scene_pricing',
      'faq': 'scene_faq',
      'contact': 'scene_lead',
    },
    overlays: scene1Overlays,
  };
  scenes[scene1Id] = scene1;
  scenesList.push(scene1);

  // Scene 2: Services & Features Carousel
  const scene2Id = 'scene_services';
  const serviceHighlights = summary.services.slice(0, 4).map(s => s.title).join(', ');
  const serviceScript = summary.services.length > 0
    ? `[excited] הנה הדברים העיקריים שאנחנו מתמחים בהם ב-${summary.companyName || summary.pageTitle}: [pause] ${serviceHighlights}. כל פתרון מותאם בדיוק לצרכים שלכם.`
    : `[warm] אנחנו מעניקים שירות מקצועי, יסודי ומהיר עם דגש על שביעות רצון מלאה ותוצאות מוכחות.`;

  const scene2Cards = buildCardsFromPageSummary(summary, Math.max(cardCount, 3), 'scene_lead');
  const scene2: LivingScene = {
    id: scene2Id,
    sceneNumber: 2,
    title: 'שירותים, מוצרים ויתרונות',
    dialogueScript: serviceScript,
    subtitleText: cleanSubtitleText(serviceScript),
    subtitleStyle: 'boxed',
    subtitleAnimation: 'word',
    subtitleFontSize: 18,
    subtitlePosition: 'bottom',
    renderedVideoUrl: KOS_LIVE_AVATARS[0].previewVideoUrl,
    backgroundMediaUrl: summary.services[0]?.imageUrl || summary.heroImageUrl || KOS_LIVE_AVATARS[0].previewImageUrl,
    avatarId: KOS_LIVE_AVATARS[0].id,
    voiceId: KOS_LIVE_AVATARS[0].voiceId,
    sceneRole: 'feature_explainer',
    autoPlay: true,
    loopUntilTrigger: true,
    soundEnabled: true,
    micPosition: 'bottom',
    micIcon: 'sparkles',
    autoTransitionOnEnd: false,
    enableVoiceTrigger: true,
    overlays: [
      ...(cardCount > 0 ? [{
        id: 'ov_srv_carousel',
        type: 'carousel' as const,
        position: 'center' as const,
        title: `השירותים והמוצרים של ${summary.companyName || summary.pageTitle}`,
        subtitle: 'בחרו כרטיסייה למידע נוסף או מעבר להזמנה',
        cards: scene2Cards
      }] : []),
      {
        id: 'ov_srv_actions',
        type: 'quick_replies',
        position: 'bottom',
        title: 'לאן להמשיך מכאן?',
        actions: [
          { id: 'act_to_lead', label: '✨ קבל הצעה מותאמת אישית', targetSceneId: 'scene_lead', variant: 'gold', icon: 'sparkles' },
          { id: 'act_to_faq', label: '❓ שאלות נפוצות', targetSceneId: 'scene_faq', variant: 'primary', icon: 'help' },
          { id: 'act_back_1', label: '↩ חזרה להתחלה', targetSceneId: 'scene_welcome', variant: 'outline', icon: 'arrow_left' },
        ],
      },
    ],
  };
  scenes[scene2Id] = scene2;
  scenesList.push(scene2);

  // Scene 3: Pricing / Products (if pricing or products exist, or general sales pitch)
  const scene3Id = 'scene_pricing';
  const topPkg = summary.pricingPackages[0] || summary.products[0];
  const pricingScript = topPkg
    ? `[warm] יש לנו מסלולים וחבילות מעולות עבורכם! למשל ${(topPkg as any).name || (topPkg as any).title} ${topPkg.price ? `במחיר ${topPkg.price}` : ''}. [excited] בחרו את המסלול המתאים לכם בכרטיסיות שלפניכם!`
    : `[warm] אנו מציעים תמחור שקוף, הוגן ומשתלם עם החזר השקעה מקסימלי. בואו נתאים לכם את החבילה המדויקת!`;

  const pricingCards: LivingCarouselCardItem[] = summary.pricingPackages.length > 0
    ? summary.pricingPackages.slice(0, Math.max(cardCount, 2)).map((pkg, idx) => ({
        id: `card_price_${idx}`,
        title: pkg.name,
        description: pkg.features.join(' • ') || 'חבילה מלאה כולל ליווי ותמיכה',
        price: pkg.price,
        badge: pkg.badge || '💎 מסלול מוביל',
        icon: 'crown',
        targetSceneId: 'scene_lead',
        actionLabel: 'בחר מסלול זה ➔'
      }))
    : buildCardsFromPageSummary(summary, Math.max(cardCount, 2), 'scene_lead');

  const scene3: LivingScene = {
    id: scene3Id,
    sceneNumber: 3,
    title: 'חבילות, מוצרים ומחירים',
    dialogueScript: pricingScript,
    subtitleText: cleanSubtitleText(pricingScript),
    subtitleStyle: 'boxed',
    subtitleAnimation: 'word',
    subtitleFontSize: 18,
    subtitlePosition: 'bottom',
    renderedVideoUrl: KOS_LIVE_AVATARS[2].previewVideoUrl,
    backgroundMediaUrl: summary.heroImageUrl || KOS_LIVE_AVATARS[2].previewImageUrl,
    avatarId: KOS_LIVE_AVATARS[2].id,
    voiceId: KOS_LIVE_AVATARS[2].voiceId,
    sceneRole: 'sales_pitch',
    autoPlay: true,
    loopUntilTrigger: true,
    soundEnabled: true,
    micPosition: 'bottom',
    overlays: [
      ...(cardCount > 0 ? [{
        id: 'ov_pricing_carousel',
        type: 'carousel' as const,
        position: 'center' as const,
        title: 'מסלולים וחבילות לבחירתכם',
        subtitle: 'לחיצה על כל כרטיס תעביר אתכם לתיאום מהיר',
        cards: pricingCards
      }] : []),
      {
        id: 'ov_pricing_actions',
        type: 'quick_replies',
        position: 'bottom',
        actions: [
          { id: 'act_p_lead', label: '💳 שריין חבילה / הצעת מחיר', targetSceneId: 'scene_lead', variant: 'gold', icon: 'credit_card' },
          { id: 'act_p_faq', label: '❓ יש לי שאלה לפני החלטה', targetSceneId: 'scene_faq', variant: 'primary', icon: 'help' },
          { id: 'act_p_home', label: '↩ חזרה לראשי', targetSceneId: 'scene_welcome', variant: 'outline' }
        ]
      }
    ]
  };
  scenes[scene3Id] = scene3;
  scenesList.push(scene3);

  // Scene 4: FAQ & Testimonials
  const scene4Id = 'scene_faq';
  const topFaq = summary.faqItems[0];
  const faqScript = topFaq
    ? `[calm] שאלה נפוצה שאנחנו נשאלים לעיתים קרובות: ${topFaq.question}. [pause] והתשובה היא: ${topFaq.answer}. [warm] יש לכם שאלה נוספת? דפדפו בכרטיסיות או שאלו אותי בקול!`
    : `[calm] הנה התשובות לשאלות הנפוצות ביותר של לקוחותינו. כל התהליך שלנו שקוף, פשוט ומאובטח לחלוטין.`;

  const faqCards: LivingCarouselCardItem[] = summary.faqItems.length > 0
    ? summary.faqItems.slice(0, Math.max(cardCount, 3)).map((f, idx) => ({
        id: `card_faq_item_${idx}`,
        title: f.question,
        description: f.answer,
        badge: '❓ שאלה ותשובה',
        icon: 'help',
        targetSceneId: 'scene_lead',
        actionLabel: 'דברו איתנו ➔'
      }))
    : buildCardsFromPageSummary(summary, Math.max(cardCount, 2), 'scene_lead');

  const scene4: LivingScene = {
    id: scene4Id,
    sceneNumber: 4,
    title: 'שאלות נפוצות וביטחון לקוחות',
    dialogueScript: faqScript,
    subtitleText: cleanSubtitleText(faqScript),
    subtitleStyle: 'boxed',
    subtitleAnimation: 'word',
    subtitleFontSize: 18,
    subtitlePosition: 'bottom',
    renderedVideoUrl: KOS_LIVE_AVATARS[3].previewVideoUrl,
    backgroundMediaUrl: summary.heroImageUrl || KOS_LIVE_AVATARS[3].previewImageUrl,
    avatarId: KOS_LIVE_AVATARS[3].id,
    voiceId: KOS_LIVE_AVATARS[3].voiceId,
    sceneRole: 'objection_handler',
    autoPlay: true,
    loopUntilTrigger: true,
    soundEnabled: true,
    micPosition: 'bottom',
    enableVoiceTrigger: true,
    overlays: [
      ...(cardCount > 0 ? [{
        id: 'ov_faq_carousel',
        type: 'carousel' as const,
        position: 'center' as const,
        title: 'שאלות ותשובות נפוצות',
        subtitle: 'הכל בשקיפות מלאה',
        cards: faqCards
      }] : []),
      {
        id: 'ov_faq_actions',
        type: 'quick_replies',
        position: 'bottom',
        title: 'הצעד הבא:',
        actions: [
          { id: 'act_f_lead', label: '📞 דברו איתי עכשיו', targetSceneId: 'scene_lead', variant: 'gold', icon: 'phone' },
          { id: 'act_f_home', label: '🏠 לתחילת העמוד', targetSceneId: 'scene_welcome', variant: 'outline' },
        ],
      },
    ],
  };
  scenes[scene4Id] = scene4;
  scenesList.push(scene4);

  // Scene 5: Lead Form & Direct WhatsApp Closing
  const scene5Id = 'scene_lead';
  const leadScript = `[warm] נפלא! כדי שנוכל להתקדם ולהעניק לכם את ההצעה הטובה ביותר עבור ${summary.companyName || summary.pageTitle}, [excited] מלאו את הטופס הקצר שעל המסך או שלחו לנו הודעה ישירה בוואטסאפ!`;

  const leadOverlays: any[] = [];
  if (includeLeadForm) {
    leadOverlays.push({
      id: 'ov_lead_form',
      type: 'form_input',
      position: 'center',
      title: summary.formTitle || `קבלת הצעה מ-${summary.companyName || summary.pageTitle}`,
      subtitle: summary.formSubtitle || 'השאירו פרטים ונחזור אליכם בהקדם ללא התחייבות',
      formFields,
      smartFormId: options?.smartFormId || summary.smartFormId,
      webhookUrl: options?.formsApiEndpoint,
      submitButtonText: summary.heroCtaText || 'שליחה וקבלת ההצעה ➔',
      actions: [
        { id: 'act_finish', label: 'תודה! חזרה לראשי', targetSceneId: 'scene_welcome', variant: 'primary' },
      ],
    });
  }

  const cleanWa = (summary.contact.whatsapp || summary.contact.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanWa
    ? `https://wa.me/${cleanWa.startsWith('0') ? '972' + cleanWa.slice(1) : cleanWa}?text=${encodeURIComponent(`שלום, הגעתי מהעמוד החי של ${summary.pageTitle} ואשמח לפרטים!`)}`
    : undefined;

  leadOverlays.push({
    id: 'ov_lead_bottom_actions',
    type: 'quick_replies',
    position: 'bottom',
    actions: [
      ...(waUrl ? [{
        id: 'act_wa_direct',
        label: '💬 שלח הודעה מהירה בוואטסאפ',
        targetSceneId: 'scene_welcome',
        variant: 'whatsapp' as const,
        actionType: 'open_whatsapp' as const,
        externalUrl: waUrl
      }] : []),
      { id: 'act_lead_back', label: '↩ חזרה לתחילת העמוד', targetSceneId: 'scene_welcome', variant: 'outline' }
    ]
  });

  const scene5: LivingScene = {
    id: scene5Id,
    sceneNumber: 5,
    title: 'טופס השארת פרטים וסגירה',
    dialogueScript: leadScript,
    subtitleText: cleanSubtitleText(leadScript),
    subtitleStyle: 'boxed',
    subtitleAnimation: 'word',
    subtitleFontSize: 18,
    subtitlePosition: 'bottom',
    renderedVideoUrl: defaultAvatar.previewVideoUrl,
    backgroundMediaUrl: summary.heroImageUrl || defaultAvatar.previewImageUrl,
    avatarId: defaultAvatar.id,
    voiceId: defaultAvatar.voiceId,
    sceneRole: 'lead_closing',
    autoPlay: true,
    loopUntilTrigger: true,
    soundEnabled: true,
    micPosition: 'hidden',
    autoTransitionOnEnd: false,
    whatsappNumber: summary.contact.whatsapp || summary.contact.phone,
    overlays: leadOverlays,
  };
  scenes[scene5Id] = scene5;
  scenesList.push(scene5);

  const campaign: LivingCampaignContract = {
    id: projectId,
    slug,
    name: `עמוד חי: ${summary.pageTitle}`,
    description: `עמוד חי אינטראקטיבי שנוצר מ-${summary.pageTitle}`,
    presenterId: defaultAvatar.id,
    initialSceneId: scene1Id,
    scenes,
    sourcePageId: summary.pageId,
    isPublished: true,
    publishedAt: Date.now(),
    aspectRatio,
    settings: {
      primaryColor,
      enableVoice: true,
      autoPlay: true,
      language: 'he-IL',
      displayMode: 'full_page',
      formsApiEndpoint: options?.formsApiEndpoint,
      smartFormId: options?.smartFormId || summary.smartFormId
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const project: LivingProject = {
    id: projectId,
    title: `עמוד חי: ${summary.pageTitle}`,
    description: `עמוד חי שנוצר מתוכן העמוד ${summary.pageTitle} (${summary.services.length} שירותים, ${summary.faqItems.length} שאלות ותשובות)`,
    aspectRatio,
    cardCountPerScene: cardCount,
    includeLeadForm,
    smartFormId: options?.smartFormId || summary.smartFormId,
    formsApiEndpoint: options?.formsApiEndpoint,
    scenes: scenesList,
    sourcePageId: summary.pageId,
    sourcePageTitle: summary.pageTitle,
    displayMode: 'full_page',
    status: 'published',
    campaignSlug: slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    publishedAt: Date.now(),
    salesPhone: summary.contact.whatsapp || summary.contact.phone,
    leadFormEmail: summary.contact.email
  };

  return { project, campaign };
}
