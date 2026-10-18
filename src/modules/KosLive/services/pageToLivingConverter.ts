import { ExtractedPageSummary, LivingProject, LivingScene, LivingCampaignContract } from '../types';
import { KOS_LIVE_AVATARS } from '../config';

/**
 * Extracts structured marketing data from a KosWebAi PageBuilder config
 */
export function extractPageContentForLiving(page: any): ExtractedPageSummary {
  const sections = page?.sections || {};
  const order: string[] = page?.sectionOrder || Object.keys(sections);

  let heroHeadline = '';
  let heroSubheadline = '';
  let heroCtaText = '';
  const services: Array<{ title: string; description?: string; badge?: string }> = [];
  const faqItems: Array<{ question: string; answer: string; category?: string }> = [];
  const testimonials: Array<{ name: string; content: string; rating?: number }> = [];
  const pricingPackages: Array<{ name: string; price: string; features: string[] }> = [];
  const stats: Array<{ number: string; label: string; description?: string }> = [];
  const formFields: Array<{ label: string; type: string }> = [];
  const textBlocks: string[] = [];

  textBlocks.push(`=== עמוד: ${page?.pageTitle || 'עמוד ראשי'} ===`);

  order.forEach((secId) => {
    const sec = sections[secId];
    if (!sec || sec.visible === false) return;

    switch (sec.type) {
      case 'hero':
        heroHeadline = sec.title || '';
        heroSubheadline = sec.subtitle || sec.description || '';
        heroCtaText = sec.primaryButton?.text || '';
        textBlocks.push(`[Hero] כותרת: ${sec.title}. משנה: ${sec.subtitle || ''}`);
        break;

      case 'services':
        (sec.items || []).forEach((item: any) => {
          services.push({
            title: item.title,
            description: item.description,
            badge: item.badge,
          });
        });
        break;

      case 'faq':
        (sec.items || []).forEach((item: any) => {
          faqItems.push({
            question: item.question,
            answer: item.answer,
          });
        });
        break;

      case 'testimonials':
        (sec.items || []).forEach((item: any) => {
          testimonials.push({
            name: item.name,
            content: item.content,
            rating: item.rating,
          });
        });
        break;

      case 'pricing':
        (sec.packages || []).forEach((pkg: any) => {
          pricingPackages.push({
            name: pkg.name,
            price: pkg.priceMonthly || pkg.priceYearly || '',
            features: pkg.features || [],
          });
        });
        break;

      case 'landingSection':
      case 'smartForm':
        (sec.fields || []).forEach((f: any) => {
          formFields.push({ label: f.label || 'שדה', type: f.type || 'text' });
        });
        break;
    }
  });

  const contact = {
    phone: sections.contact?.phone || page?.globalSettings?.contactPhone,
    email: sections.contact?.email || page?.globalSettings?.contactEmail,
    whatsapp: sections.contact?.whatsapp || page?.globalSettings?.contactWhatsApp,
  };

  return {
    pageId: page?.pageId || 'page_' + Date.now(),
    pageTitle: page?.pageTitle || 'עמוד נחיתה אינטראקטיבי',
    slug: page?.slug || 'page-' + Date.now(),
    companyName: page?.globalSettings?.companyName,
    slogan: page?.globalSettings?.slogan,
    heroHeadline,
    heroSubheadline,
    heroCtaText,
    services,
    faqItems,
    testimonials,
    pricingPackages,
    stats,
    contact,
    formFields,
    sectionsSummaryText: textBlocks.join('\n'),
  };
}

/**
 * Automatically converts an extracted page summary into an interactive Living Page Campaign
 */
export function convertSummaryToLivingCampaign(summary: ExtractedPageSummary): {
  project: LivingProject;
  campaign: LivingCampaignContract;
} {
  const projectId = 'live_' + summary.pageId.replace(/[^a-zA-Z0-9]/g, '_');
  const slug = `living-${summary.slug || projectId}`;
  const defaultAvatar = KOS_LIVE_AVATARS[1]; // Shira Warm

  const scenes: Record<string, LivingScene> = {};
  const scenesList: LivingScene[] = [];

  // Scene 1: Welcome & Hook
  const scene1Id = 'scene_welcome';
  const hookScript = summary.heroHeadline 
    ? `שלום! שמחים שהגעתם ל-${summary.pageTitle}. ${summary.heroHeadline}. ${summary.heroSubheadline ? summary.heroSubheadline : 'אנחנו כאן כדי לתת לכם את המענה הטוב ביותר.'} מה תרצו לבדוק עכשיו?`
    : `שלום וברוכים הבאים! אני כאן כדי להציג לכם את כל מה שיש ל-${summary.pageTitle} להציע. כיצד אוכל לעזור לכם היום?`;

  const scene1: LivingScene = {
    id: scene1Id,
    sceneNumber: 1,
    title: 'קבלת פנים ומבוא אישי',
    dialogueScript: hookScript,
    renderedVideoUrl: defaultAvatar.previewVideoUrl,
    backgroundMediaUrl: defaultAvatar.previewImageUrl,
    avatarId: defaultAvatar.id,
    voiceId: defaultAvatar.voiceId,
    sceneRole: 'welcome_hook',
    autoTransitionOnEnd: false,
    enableVoiceTrigger: true,
    allowedIntents: {
      'services': 'scene_services',
      'pricing': 'scene_pricing',
      'faq': 'scene_faq',
      'contact': 'scene_lead',
    },
    overlays: [
      {
        id: 'ov_welcome_actions',
        type: 'quick_replies',
        position: 'bottom',
        title: 'בחר אפשרות להתאמה אישית:',
        actions: [
          { id: 'act_srv', label: '🚀 מה כוללים השירותים?', targetSceneId: 'scene_services', variant: 'gold' },
          ...(summary.pricingPackages.length > 0 
            ? [{ id: 'act_prc', label: '💳 חבילות ומחירים', targetSceneId: 'scene_pricing', variant: 'primary' as const }] 
            : []),
          { id: 'act_lead', label: '📞 השארת פרטים מהירה', targetSceneId: 'scene_lead', variant: 'secondary' },
        ],
      },
    ],
  };
  scenes[scene1Id] = scene1;
  scenesList.push(scene1);

  // Scene 2: Services & Features
  const scene2Id = 'scene_services';
  const serviceHighlights = summary.services.slice(0, 3).map(s => s.title).join(', ');
  const serviceScript = summary.services.length > 0
    ? `הנה הדברים העיקריים שאנחנו מתמחים בהם: ${serviceHighlights}. כל פתרון מותאם בדיוק לצרכים שלכם.`
    : `אנחנו מעניקים שירות מקצועי, יסודי ומהיר עם דגש על שביעות רצון מלאה.`;

  const scene2: LivingScene = {
    id: scene2Id,
    sceneNumber: 2,
    title: 'שירותים ותכונות מובילות',
    dialogueScript: serviceScript,
    renderedVideoUrl: KOS_LIVE_AVATARS[0].previewVideoUrl,
    backgroundMediaUrl: KOS_LIVE_AVATARS[0].previewImageUrl,
    avatarId: KOS_LIVE_AVATARS[0].id,
    sceneRole: 'feature_explainer',
    autoTransitionOnEnd: false,
    enableVoiceTrigger: true,
    overlays: [
      {
        id: 'ov_srv_info',
        type: 'info_card',
        position: 'top',
        title: summary.services[0]?.title || 'היתרונות המובילים',
        subtitle: summary.services[0]?.description || 'פתרון מקיף, איכותי ואמין לעסק שלכם',
      },
      {
        id: 'ov_srv_actions',
        type: 'quick_replies',
        position: 'bottom',
        title: 'לאן להמשיך מכאן?',
        actions: [
          { id: 'act_to_lead', label: '✨ קבל הצעה מותאמת אישית', targetSceneId: 'scene_lead', variant: 'gold' },
          { id: 'act_to_faq', label: '❓ שאלות נפוצות', targetSceneId: 'scene_faq', variant: 'primary' },
          { id: 'act_back_1', label: '↩ חזרה להתחלה', targetSceneId: 'scene_welcome', variant: 'outline' },
        ],
      },
    ],
  };
  scenes[scene2Id] = scene2;
  scenesList.push(scene2);

  // Scene 3: FAQ
  const scene3Id = 'scene_faq';
  const topFaq = summary.faqItems[0];
  const faqScript = topFaq
    ? `שאלה נפוצה שאנחנו נשאלים לעיתים קרובות: ${topFaq.question}. והתשובה היא: ${topFaq.answer}. יש לכם שאלה נוספת? אתם יכולים פשוט לשאול אותי בקול או להשאיר פרטים!`
    : `הנה כמה תשובות לשאלות נפוצות. כל התהליך שלנו שקוף, פשוט ומאובטח.`;

  const scene3: LivingScene = {
    id: scene3Id,
    sceneNumber: 3,
    title: 'שאלות נפוצות ותשובות',
    dialogueScript: faqScript,
    renderedVideoUrl: KOS_LIVE_AVATARS[2].previewVideoUrl,
    backgroundMediaUrl: KOS_LIVE_AVATARS[2].previewImageUrl,
    sceneRole: 'objection_handler',
    autoTransitionOnEnd: false,
    enableVoiceTrigger: true,
    overlays: [
      {
        id: 'ov_faq_card',
        type: 'info_card',
        position: 'top',
        title: topFaq?.question || 'מענה לשאלות נפוצות',
        subtitle: topFaq?.answer || 'אנחנו כאן לכל שאלה וליווי אישי',
      },
      {
        id: 'ov_faq_actions',
        type: 'quick_replies',
        position: 'bottom',
        title: 'הצעד הבא:',
        actions: [
          { id: 'act_f_lead', label: '📞 דברו איתי עכשיו', targetSceneId: 'scene_lead', variant: 'gold' },
          { id: 'act_f_home', label: '🏠 לתחילת העמוד', targetSceneId: 'scene_welcome', variant: 'outline' },
        ],
      },
    ],
  };
  scenes[scene3Id] = scene3;
  scenesList.push(scene3);

  // Scene 4: Lead Closing
  const scene4Id = 'scene_lead';
  const leadScript = `נפלא! כדי שנוכל להתקדם ולהעניק לכם את ההצעה הטובה ביותר, אנא מלאו את הטופס הקצר שעל המסך, ונציג מטעמנו יחזור אליכם בהקדם.`;

  const scene4: LivingScene = {
    id: scene4Id,
    sceneNumber: 4,
    title: 'קליטת ליד וסגירה',
    dialogueScript: leadScript,
    renderedVideoUrl: defaultAvatar.previewVideoUrl,
    backgroundMediaUrl: defaultAvatar.previewImageUrl,
    sceneRole: 'lead_closing',
    autoTransitionOnEnd: false,
    overlays: [
      {
        id: 'ov_lead_form',
        type: 'form_input',
        position: 'center',
        title: 'קבלת הצעה מותאמת אישית',
        subtitle: 'השאירו פרטים ונחזור אליכם ללא כל התחייבות',
        formFields: [
          { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text' },
          { key: 'phone', label: 'מספר טלפון', placeholder: '050-0000000', type: 'tel' },
        ],
        actions: [
          { id: 'act_finish', label: 'תודה! חזרה לראשי', targetSceneId: 'scene_welcome', variant: 'primary' },
        ],
      },
    ],
  };
  scenes[scene4Id] = scene4;
  scenesList.push(scene4);

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
    aspectRatio: '9:16',
    settings: {
      primaryColor: '#eab308',
      enableVoice: true,
      autoPlay: true,
      language: 'he-IL',
      displayMode: 'full_page',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const project: LivingProject = {
    id: projectId,
    title: `עמוד חי: ${summary.pageTitle}`,
    description: `עמוד חי שנוצר אוטומטית מתוכן העמוד ${summary.pageTitle}`,
    aspectRatio: '9:16',
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
  };

  return { project, campaign };
}
