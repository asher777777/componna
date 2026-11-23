/**
 * ============================================================================
 * ⚠️ אזהרת שומר הסף (KOSUN26 GATE 3 - AI MONOPOLY) ⚠️
 * כל פרומפט בקובץ זה נשלח אך ורק לחוזה עם KOSAI הנמצא בתיקייה:
 * src/modules/KosAi/modelsAiService/webAiContract.ts
 * אין לשלוח לג'מיני בשום אופן ישירות! חל איסור מוחלט על שימוש ב-fetch מקומי!
 * ============================================================================
 */

import { kosaiWebAiContract, KosaiMarketingIdea } from '../../KosAi/modelsAiService';
import { executeKosaiAi } from '../../KosAi/modelsAiService/executeKosaiAi';

// ----------------------------------------------------------------------------
// 1. All Prompt Builders (Preserving Exact Trigger Signatures, Names & IDs)
// ----------------------------------------------------------------------------

export const GENERATE_MULTI_SECTION_PAGE_PROMPT = (context: {
  companyName: string;
  slogan?: string;
  targetAudience?: string;
  uvp?: string;
  voiceTone?: string;
  primaryColor?: string;
  backgroundColor?: string;
  userPrompt: string;
  generateImages?: boolean;
}) => `
You are an Award-Winning World-Class Lead UI/UX Architect, Creative Director, and Conversion Copywriter.
Your task is to build a high-impact, custom-tailored, multi-section web page for "${context.companyName}".

Brand Identity & Context:
- Company Name: "${context.companyName}"
- Brand Slogan: "${context.slogan || ''}"
- Target Audience: "${context.targetAudience || 'קהל יעד איכותי'}"
- Unique Value Proposition (UVP): "${context.uvp || 'מובילות ואיכות ללא פשרות'}"
- Tone & Voice: "${context.voiceTone || 'מקצועי, סמכותי, יצירתי, חם ומניע לפעולה'}"
- Color Accents: Primary ${context.primaryColor || '#6366f1'}, Background preference ${context.backgroundColor || '#090a0f'}

User Goal & Specific Request:
"${context.userPrompt}"

### MANDATORY ARCHITECTURAL & CREATIVE RULES:
1. NEVER output a generic or single-section page! You MUST output a vibrant, coherent story of 5 to 8 distinct sections.
2. DYNAMIC LAYOUTS & STYLING VARIETY:
   - Do NOT just stick to the same predictable order! Think like a bespoke web design agency.
   - For a sales page: hero (spatial/split) -> logoMarquee -> statsBento -> timer -> pricing -> testimonials -> faq -> contact.
   - For an educational/lead page: hero (centered/mesh) -> richContent (highlight-box) -> beforeAfter -> testimonials -> faq -> landingSection.
   - For a local service: hero (bento-hero) -> geoLocal -> statsBento -> testimonials -> faq -> contact.
   - For a community/club: hero -> community -> logoMarquee -> statsBento -> testimonials -> pricing -> contact.
   - For high-engagement reels / viral leads / recruiting: tiktokHero -> logoMarquee -> statsBento -> testimonials -> faq -> contact.
3. ADAPTIVE STYLING & EFFECTS:
   - Set section backgrounds with variety (e.g. subtle dark glass, dark slate, deep indigo hues, or matching brand accents).
   - Use effects: 'border-beam', 'hover-glow', 'hover-scale'.
4. NATIVE ISRAELI HEBREW COPYWRITING:
   - All text MUST be persuasive, natural, idiomatic, punchy Hebrew. Avoid robotic translations.
   - Testimonials must feel like genuine Israeli clients with realistic names and authentic quotes.
   - FAQ must answer real, sharp customer objections.
5. VISUAL INTEGRATION:
   - For hero, provide imagePrompt in English and set imageSrc.
### AVAILABLE SECTION TYPES & SCHEMAS:
1. "hero": layout ('split'|'fz'|'spatial'|'centered'|'bento-hero'), heroStyle ('mesh-glow'|'modern'|'classic'), title, subtitle, description, buttonsVisible (true), primaryButton {text, url}, secondaryButton {text, url}, announcementBadge {text, url}, socialProofAvatars {visible: true, ratingText, starsCount: 5}
3. "statsBento": layout ('bento-4'|'row-4'|'cards-3'), title, subtitle, stats [{id, number, label, description, suffix}]
4. "testimonials": layout ('grid'|'carousel'|'masonry'), title, subtitle, description, showRatingSummary: true, overallRating: 4.9, items [{id, name, role, company, content, rating: 5, isVerified: true, badge: 'מאומת'}]
5. "pricing": title, subtitle, description, showBillingToggle: true, packages [{id, name, priceMonthly, priceYearly, isFeatured, badge, description, features: string[], buttonText, actionType: 'kesher_checkout'|'smart_form'}]
6. "faq": title, subtitle, showSearchBar: true, items [{id, question, answer}]
7. "contact": title, subtitle, showForm: true, directWhatsappChat: true
8. "geoLocal": title, subtitle, city, serviceAreas: string[], openingHours: string[]
9. "logoMarquee": title, speed: 'slow'|'medium', logos [{id, name, logoUrl}]
10. "community": title, subtitle, description, quote, buttonText, layout: 'modern'|'card', showLiveChatPreview: true
11. "timer": title, subtitle, targetDate (ISO string), ctaText, ctaUrl, layout: 'boxed'|'cards'
12. "richContent": heading, subtitle, body, layout: 'standard'|'two-columns'|'highlight-box'
13. "beforeAfter": title, subtitle, description, beforeLabel, afterLabel
14. "tiktokHero": video {videoUrl, badgeText, durationText, seasonEpisodeText}, overlay {mode: 'gradient'|'solid', opacity: 40}, headline, card {enabled: true, tag, title, subtitle}, ctaButton {text, iconName: 'Sparkles', actionType: 'modal_form'}, modalTitle, modalSubtitle
15. "dynamicListing": title, subtitle, badge, layout ('bento-showcase'|'floating-grid'|'snap-carousel'|'editorial-list'|'masonry'), source ('custom'|'pages'|'kos_tube'|'campaigns'), categories: string[], items [{id, title, subtitle, excerpt, imageUrl, category, date, badge, price, actionType: 'modal'}]
16. "futureContent2027": title, subtitle, badge, activeMode ('prism-bento'|'kinetic-editorial'|'floating-islands'), allowVisitorSwitching: true, effectStyle ('prism-beam'|'fluid-glass'|'cyber-aura'), items [{id, title, subtitle, description, imageUrl, category, tag, readTime, audioDuration, metrics: [{label, value, trend}]}]

Return ONLY a valid JSON object with NO MARKDOWN ticks:
{
  "slug": "unique-page-slug",
  "pageTitle": "כותרת עמוד ייחודית ומושכת",
  "backgroundColor": "#090a0f",
  "textColor": "#f8fafc",
  "sections": [
    {
      "sectionType": "hero",
      "stepTitle": "שלב בנייה בעברית",
      "statusText": "פעולה חיה שה-AI מעצב כרגע בעברית",
      "data": { ... }
    }
  ]
}
`;

export const GENERATE_MARKETING_IDEAS_PROMPT = (context: {
  companyName: string;
  purpose?: string;
  targetAudiences?: string[];
  uvp?: string;
  objections?: Array<{ objection: string; rebuttal: string }>;
  personas?: Array<{ name: string; mainPain?: string; dreamOutcome?: string }>;
  existingPages?: Array<{ title: string; slug?: string; sectionTypes?: string[] }>;
}) => `הצע 6 רעיונות אסטרטגיים לדפי נחיתה עבור "${context.companyName}" (${context.uvp || context.purpose || 'פתרונות מובילים'}).
קהל יעד: ${context.targetAudiences?.slice(0, 2).join(', ') || 'לקוחות איכותיים'}.
החזר אך ורק מערך JSON תקני של 6 אובייקטים ללא שום markdown:
[
  {
    "id": "concept_id",
    "title": "כותרת קצרה בעברית (3-5 מילים)",
    "description": "הסבר שיווקי קצר (משפט אחד)",
    "prompt": "הנחיה ממוקדת לבניית הדף",
    "icon": "Zap",
    "targetObjective": "מכירות / לידים / סמכות / קהילה",
    "badge": "הכי ממיר / מומלץ"
  }
]
`;

export const REFINE_SECTION_PROMPT = (context: {
  sectionType: string;
  userPrompt: string;
  companyName: string;
  currentConfig: any;
}) => `
You are an expert UI/UX Designer and Copywriter.
Refine and upgrade the "${context.sectionType}" section for "${context.companyName}".
User Request: "${context.userPrompt}"
Current Config: ${JSON.stringify(context.currentConfig)}

Output ONLY a valid JSON object matching the section schema with the upgraded Hebrew copy and styling properties. No markdown.
`;

export const IMAGE_SYNTHESIS_PROMPT = (context: {
  companyName: string;
  sectionType: string;
  topic: string;
  brandColors?: string;
}) => `
Generate a hyper-descriptive, photographic image prompt in English for ${context.companyName} (${context.sectionType} section, topic: "${context.topic}").
Include details about lighting, modern minimal aesthetic, high production value, matching brand colors (${context.brandColors || 'vibrant professional'}).
`;

export const GENERATE_SEO_METADATA_PROMPT = (context: {
  pageTitle: string;
  company: string;
  slogan: string;
  topics: string;
}) => `
You are a World-Class Google Technical SEO & Generative Engine Optimization (GEO/AIO) Expert.
Analyze the website page and generate optimal Hebrew SEO & AI-bot citation metadata:
- Page Subject: "${context.pageTitle}"
- Brand / Company: "${context.company}"
- Slogan: "${context.slogan}"
- Topics: ${context.topics || 'דף אינטרנט עסקי ושיווקי'}

Strict Google SEO & AI Engine Optimization Criteria:
1. Meta Title: 50 to 60 characters long. Front-load primary high-intent keywords. Conclude with "| ${context.company}". No clickbait.
2. Meta Description: 140 to 160 characters long. Active value proposition, clear CTA (e.g. "היכנסו עכשיו", "גלו עוד").
3. Keywords: 6-10 focused, localized, high-intent Hebrew keywords.
4. Google SEO Audit: Score out of 100 and provide 3 actionable recommendations for ranking on Google.
5. AI Knowledge Summary (GEO/AIO): A crisp 2-3 sentence factual knowledge definition optimized for LLMs (ChatGPT, Gemini, Perplexity) to cite when answering user prompts.

Return ONLY a valid JSON object matching this schema:
{
  "title": "string",
  "description": "string",
  "keywords": ["string"],
  "author": "${context.company}",
  "ogType": "website",
  "twitterCard": "summary_large_image",
  "googleAuditScore": 95,
  "googleAuditRecommendations": ["rec1", "rec2", "rec3"],
  "aiKnowledgeSummary": "string",
  "aiTargetQuestions": ["q1", "q2", "q3"],
  "aiEntitySchemaType": "ProfessionalService",
  "aiBotIndexingEnabled": true
}
`;

// ----------------------------------------------------------------------------
// 2. Dispatchers Sending Prompts to KOSAI modelsAiService Monopoly Contract
// ----------------------------------------------------------------------------

export async function dispatchMarketingIdeasToKosai(
  context: Parameters<typeof GENERATE_MARKETING_IDEAS_PROMPT>[0],
  options?: { cacheKey?: string; skipCache?: boolean; apiKey?: string; tenantId?: string }
): Promise<KosaiMarketingIdea[]> {
  const prompt = GENERATE_MARKETING_IDEAS_PROMPT(context);
  const result = await kosaiWebAiContract.generateMarketingIdeas(prompt, options?.cacheKey, {
    skipCache: options?.skipCache,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

export async function dispatchPageStructureToKosai(
  context: Parameters<typeof GENERATE_MULTI_SECTION_PAGE_PROMPT>[0],
  options?: { apiKey?: string; tenantId?: string }
): Promise<any> {
  const prompt = GENERATE_MULTI_SECTION_PAGE_PROMPT(context);
  const result = await kosaiWebAiContract.generatePageStructure(prompt, undefined, options);
  return result.data;
}

export async function dispatchSectionEnhancementToKosai(
  context: Parameters<typeof REFINE_SECTION_PROMPT>[0],
  options?: { apiKey?: string; tenantId?: string }
): Promise<any> {
  const prompt = REFINE_SECTION_PROMPT(context);
  const result = await kosaiWebAiContract.enhanceSection(prompt, options);
  return result.data;
}

export async function dispatchSeoMetadataToKosai(
  context: Parameters<typeof GENERATE_SEO_METADATA_PROMPT>[0],
  options?: { cacheKey?: string; apiKey?: string; tenantId?: string }
): Promise<any> {
  const prompt = GENERATE_SEO_METADATA_PROMPT(context);
  const result = await kosaiWebAiContract.generateSeoMetadata(prompt, options?.cacheKey, options);
  return result.data;
}

// ----------------------------------------------------------------------------
// 3. Dedicated Structured Draft Prompt (Zero Schema Conflict + Full Brand DNA + GEO 2026.4)
// ----------------------------------------------------------------------------

export interface StructuredDraftPromptContext {
  pageTypeTitle: string;
  pageEssenceAndFlow: string;
  selectedSections: string[];
  userTopic: string;
  groundingFacts?: string;
  authorName?: string;
  targetQuestion?: string;
  companyName: string;
  slogan?: string;
  uvp?: string;
  voiceTone?: string;
  powerWords?: string[];
  targetAudiences?: string[];
  commonObjections?: Array<{ objection: string; rebuttal: string }>;
  ecosystemServices?: string[];
  stylePreset?: string;
  uiVocabulary?: {
    primaryCta?: string;
    whatsappCta?: string;
    formSubmitText?: string;
  };
  eventDetails?: {
    eventDate?: string;
    eventTime?: string;
    locationName?: string;
    locationAddress?: string;
  };
  campaignDetails?: {
    targetGoal?: number;
    totalRaised?: number;
    campaignCause?: string;
  };
  pricingInput?: Array<{ name: string; priceMonthly: number; description?: string }>;
  geoDetails?: {
    targetCity?: string;
    serviceAreas?: string[];
  };
}

export const GENERATE_STRUCTURED_DRAFT_PROMPT = (ctx: StructuredDraftPromptContext) => `
You are an Elite Israeli Brand Copywriter, Conversion Architect, and 2026.4 GEO/SEO Specialist.
CRITICAL RULE: You MUST write 100% NEW, ORIGINAL Hebrew copy strictly tailored to the User's Core Topic and Grounding Sources below.
Use Brand DNA ONLY for: (1) Tone & Style, (2) Target Audience profile & pain points, and (3) Company Name & CTA style.
NEVER copy, repeat, or substitute copy about OTHER unrelated services or products! Focus 100% on the User's Core Topic.

### 1. USER'S CORE TOPIC & PAGE ARCHITECTURE (PRIMARY FOCUS):
- Core Topic & Goal: "${ctx.userTopic}"
- Page Type: ${ctx.pageTypeTitle}
- Conversion & UX Flow: ${ctx.pageEssenceAndFlow}
- Active Sections: ${ctx.selectedSections.join(', ')}

### 2. TARGET AUDIENCE & BRAND VOICE (STYLE & PERSONA ONLY):
- Company: "${ctx.companyName}"
- Slogan: "${ctx.slogan || ''}"
- Target Audiences: ${ctx.targetAudiences?.slice(0, 4).join(', ') || 'קהל יעד ממוקד'}
- Tone & Style Preset: "${ctx.voiceTone || 'מקצועי, סמכותי ומניע לפעולה'}" (Style: ${ctx.stylePreset || 'standard'})
- Power Words to weave naturally: ${ctx.powerWords?.slice(0, 8).join(', ') || 'איכות, תוצאות, ליווי אישי'}
- Audience Objections to address (adapt to the Core Topic): ${
  ctx.commonObjections?.slice(0, 4).map((o) => `"${o.objection}"`).join(' | ') || 'אין'
}
- Preferred Brand CTAs: Primary="${ctx.uiVocabulary?.primaryCta || 'השאירו פרטים'}", WhatsApp="${ctx.uiVocabulary?.whatsappCta || 'שיחה בוואטסאפ'}"

### 3. HARD FACTS & GROUNDING SOURCES (DO NOT HALLUCINATE OR CONTRADICT):
${ctx.groundingFacts ? `- Uploaded Docs / Scanned Site / Brief:\n"""\n${ctx.groundingFacts.slice(0, 4500)}\n"""` : '- No external doc provided; rely strictly on Brand DNA and Topic.'}
${ctx.eventDetails ? `- Event Hard Facts: Date=${ctx.eventDetails.eventDate}, Time=${ctx.eventDetails.eventTime}, Location=${ctx.eventDetails.locationName}, Address=${ctx.eventDetails.locationAddress}` : ''}
${ctx.campaignDetails ? `- Campaign Hard Facts: Goal=₪${ctx.campaignDetails.targetGoal}, Raised=₪${ctx.campaignDetails.totalRaised}, Cause=${ctx.campaignDetails.campaignCause}` : ''}
${ctx.pricingInput?.length ? `- User Pricing Plans (KEEP EXACT PRICES): ${ctx.pricingInput.map((p) => `${p.name}: ₪${p.priceMonthly}`).join(', ')}` : ''}
${ctx.geoDetails?.targetCity ? `- Local SEO City: ${ctx.geoDetails.targetCity}, Areas: ${ctx.geoDetails.serviceAreas?.join(', ') || ''}` : ''}

### 4. MANDATORY 2026.4 SEO & GEO PROTOCOL RULES:
1. Information Gain: Use concrete details, numbers, and insights from the Grounding Sources & Brand DNA. Never write generic AI fluff.
2. Answer-First Structure: In "richContent.body", start the first paragraph and each <h2> section with a sharp, direct, data-backed 40-60 word answer for LLM extraction, followed by structured <ul><li> lists or a comparison block.
3. No Placeholder Clichés: NEVER use generic names like "ישראל ישראלי", "דניאל כהן", or "רעות מזרחי" if real context is available; craft authentic, realistic Israeli testimonials tailored to this exact niche.
4. SEO/GEO Metadata: Provide "seoGeo" with meta title (50-60 chars), meta description (140-160 chars), "aiKnowledgeSummary" (2-3 factual sentences), and 3 "aiTargetQuestions"${ctx.targetQuestion ? ` (must include: "${ctx.targetQuestion}")` : ''}.
5. Clean English URL Slug: Provide "slugSuffix" in clean lowercase English kebab-case (2 to 5 descriptive words matching the Core Topic, e.g. "enterprise-project-management" or "digital-marketing-guide"). English letters, numbers, and hyphens ONLY.

Return ONLY valid JSON (no markdown ticks) matching this exact schema:
{
  "pageTitle": "כותרת עמוד ממירה ומדויקת",
  "slugSuffix": "english-seo-slug-matching-topic",
  "hero": {
    "title": "כותרת H1 חדה וממוקדת תועלת",
    "subtitle": "תת-כותרת משכנעת (Answer-First) באורך 1-2 משפטים",
    "badge": "תגית מיתוג קצרה",
    "ctaPrimaryText": "טקסט כפתור ראשי מותאם מותג",
    "ctaSecondaryText": "טקסט כפתור משני"
  },
  "richContent": {
    "heading": "כותרת H2 מרכזית",
    "body": "<p><strong>תשובה ישירה (40-60 מילים):</strong> ...</p><h2>...</h2><ul><li>...</li></ul>"
  },
  "stats": [
    { "number": "98", "suffix": "%", "label": "מדד רלוונטי לתחום", "description": "הסבר קצר מבוסס נתון" },
    { "number": "1,200", "suffix": "+", "label": "מדד שני", "description": "הסבר קצר" },
    { "number": "24", "suffix": "ש׳", "label": "מדד שלישי", "description": "הסבר קצר" }
  ],
  "beforeAfter": {
    "title": "השינוי שאנחנו מביאים",
    "subtitle": "לפני ואחרי העבודה איתנו",
    "beforeLabel": "המצב לפני (כאב מרכזי)",
    "afterLabel": "התוצאה אחרי (פתרון)"
  },
  "testimonials": [
    { "name": "שם ישראלי אמין", "role": "תפקיד רלוונטי", "company": "שם עסק/תחום", "content": "המלצה ספציפית לנושא העמוד", "rating": 5 },
    { "name": "שם ישראלי אמין 2", "role": "תפקיד רלוונטי", "company": "שם עסק/תחום", "content": "המלצה ספציפית לנושא העמוד", "rating": 5 }
  ],
  "pricing": {
    "title": "מסלולים וחבילות",
    "subtitle": "בחרו את המסלול המתאים עבורכם",
    "plans": [
      { "name": "שם מסלול", "priceMonthly": 490, "description": "תיאור תועלת", "features": ["יתרון 1", "יתרון 2", "יתרון 3"], "isFeatured": false }
    ]
  },
  "faqs": [
    { "question": "שאלה נפוצה אמיתית של הלקוח", "answer": "תשובה חדה ומקצועית (Answer-First)" },
    { "question": "שאלת התנגדות שנייה", "answer": "תשובה שמסירה חסם" },
    { "question": "שאלת התחלה / מחיר", "answer": "תשובה ברורה ומניעה לפעולה" }
  ],
  "contact": {
    "title": "כותרת אזור יצירת קשר מותאמת לעמוד",
    "subtitle": "משפט הנעה לפעולה"
  },
  "seoGeo": {
    "title": "Meta Title 50-60 chars | ${ctx.companyName}",
    "description": "Meta Description 140-160 chars with CTA",
    "keywords": ["מילת מפתח 1", "מילת מפתח 2", "מילת מפתח 3", "מילת מפתח 4"],
    "aiKnowledgeSummary": "סיכום עובדתי בן 2-3 משפטים לשאיבה על ידי ChatGPT/Gemini/Perplexity",
    "aiTargetQuestions": ["שאלה 1", "שאלה 2", "שאלה 3"],
    "author": "${ctx.authorName || ctx.companyName}"
  }
}
`;

export async function dispatchStructuredDraftToKosai(
  context: StructuredDraftPromptContext,
  options?: { apiKey?: string; tenantId?: string }
): Promise<any> {
  const prompt = GENERATE_STRUCTURED_DRAFT_PROMPT(context);
  const result = await kosaiWebAiContract.generatePageStructure(
    prompt,
    'You are an Elite Israeli Brand Copywriter & 2026.4 GEO/SEO Architect. Always return pure valid JSON matching the requested schema.',
    options
  );
  return result.data;
}

/**
 * Ultra-low-token micro-AI helper for single wizard questions (<= 180 output tokens, flash-lite).
 */
export async function microAssistWizardStepWithKosai(
  params: {
    stepId: 'topic_and_goal' | 'seo_geo_focus';
    companyName: string;
    pageTypeTitle: string;
    currentInput: string;
    uvp?: string;
  },
  options?: { apiKey?: string; tenantId?: string }
): Promise<string> {
  const prompt =
    params.stepId === 'topic_and_goal'
      ? `שפר וחדד למשפט שיווקי אחד חד בעברית (עד 30 מילים) עבור "${params.companyName}" (${params.pageTypeTitle}). הצעת ערך: ${params.uvp || ''}. טיוטת משתמש: "${params.currentInput || params.pageTypeTitle}". החזר רק את המשפט המשופר ללא מרכאות.`
      : `הצע שאלת חיפוש אחת קצרה בעברית שגולשים שואלים ב-ChatGPT/Google לגבי "${params.currentInput || params.pageTypeTitle}" של "${params.companyName}". החזר רק את השאלה.`;

  const res = await executeKosaiAi<string>('KosWebAi', prompt, {
    model: 'gemini-3.8-flash-lite',
    maxOutputTokens: 180,
    temperature: 0.6,
    customApiKey: options?.apiKey,
    tenantId: options?.tenantId,
    category: 'content',
  });

  return typeof res.data === 'string' ? res.data.trim().replace(/^["']|["']$/g, '') : '';
}

/**
 * Synthesizes a rich, brand-aligned visual image prompt uniting the user's page goal & Brand DNA.
 */
export async function synthesizeHeroImagePromptWithKosai(
  params: {
    pageTopic: string;
    pageTypeTitle: string;
    companyName: string;
    targetAudience?: string;
    voiceTone?: string;
    primaryColor?: string;
    secondaryColor?: string;
    stylePreset?: string;
    width: number;
    height: number;
    aspectRatio: string;
  },
  options?: { apiKey?: string; tenantId?: string }
): Promise<string> {
  const prompt = `אתה Art Director מומחה. כתוב פרומפט ויזואלי אחד עשיר ומפורט ליצירת תמונת Hero לאתר, המאחד בין מטרת העמוד לבין ה-Brand DNA:
- מטרת העמוד והמוצר: "${params.pageTopic}" (${params.pageTypeTitle})
- שם המותג: "${params.companyName}"
- קהל יעד: "${params.targetAudience || 'קהל עסקי ומקצועי'}"
- אופי וסגנון מיתוג: "${params.voiceTone || params.stylePreset || 'מודרני ויוקרתי'}"
- פלטת צבעים: ראשי ${params.primaryColor || '#2563eb'}, משני ${params.secondaryColor || '#0ea5e9'}
- מידות: ${params.width}x${params.height} (${params.aspectRatio})

דרישות: תאר סצנה ויזואלית קונקרטית, תאורה, קומפוזיציה ואווירה המבטאים את המוצר והמותג. ללא טקסט או אותיות בתמונה. החזר משפט אחד רציף בעברית (עד 55 מילים) בלבד.`;

  const res = await executeKosaiAi<string>('KosWebAi', prompt, {
    model: 'gemini-3.8-flash-lite',
    maxOutputTokens: 220,
    temperature: 0.7,
    customApiKey: options?.apiKey,
    tenantId: options?.tenantId,
    category: 'content',
  });

  return typeof res.data === 'string' ? res.data.trim().replace(/^["']|["']$/g, '') : '';
}

/**
 * Generates 10 GEO/SEO Questions & Answers grounded in all collected wizard materials + Brand DNA.
 */
export async function generate10GeoFaqsWithKosai(
  params: {
    pageTopic: string;
    pageTypeTitle: string;
    groundingFacts?: string;
    targetQuestion?: string;
    companyName: string;
    targetAudience?: string;
    commonObjections?: Array<{ objection: string; rebuttal: string }>;
  },
  options?: { apiKey?: string; tenantId?: string }
): Promise<Array<{ id: string; question: string; answer: string }>> {
  const prompt = `אתה מומחה SEO/GEO 2026.4 וקופירייטר בכיר.
בהתבסס על כל החומרים שנאספו עבור העמוד, צור בדיוק 10 שאלות ותשובות מקיפות בעברית טבעית ומקצועית (Answer-First: כל תשובה נפתחת במענה ישיר וחד, באורך 2-3 משפטים).

נתוני העמוד:
- נושא העמוד והמוצר: "${params.pageTopic}" (${params.pageTypeTitle})
- שם המותג: "${params.companyName}"
- קהל יעד: "${params.targetAudience || 'לקוחות רלוונטיים'}"
${params.targetQuestion ? `- שאלת ליבה שחובה לכלול ראשונה: "${params.targetQuestion}"` : ''}
${params.commonObjections?.length ? `- התנגדויות נפוצות של קהל היעד: ${params.commonObjections.slice(0, 4).map((o) => o.objection).join(' | ')}` : ''}
${params.groundingFacts ? `- מקורות מידע וחומרי גלם:\n"""\n${params.groundingFacts.slice(0, 3500)}\n"""` : ''}

החזר אך ורק מערך JSON תקני של 10 אובייקטים (ללא markdown):
[
  { "question": "שאלה 1", "answer": "תשובה חדה ומקצועית 1" },
  ...
]`;

  const res = await executeKosaiAi<any>('KosWebAi', prompt, {
    model: 'gemini-3.8-flash-lite',
    maxOutputTokens: 2800,
    responseMimeType: 'application/json',
    temperature: 0.65,
    customApiKey: options?.apiKey,
    tenantId: options?.tenantId,
    category: 'content',
  });

  let parsed = res.data;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
    } catch {
      const start = parsed.indexOf('[');
      const end = parsed.lastIndexOf(']');
      if (start >= 0 && end > start) {
        parsed = JSON.parse(parsed.slice(start, end + 1));
      }
    }
  }

  const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.faqs) ? parsed.faqs : [];
  return list.slice(0, 10).map((item: any, idx: number) => ({
    id: `geo_faq_${Date.now()}_${idx + 1}`,
    question: String(item.question || item.q || '').trim(),
    answer: String(item.answer || item.a || '').trim(),
  })).filter((x: any) => x.question && x.answer);
}

export async function dispatchImageTextExtractionToKosai(
  imageBase64: string,
  imageMimeType: string,
  options?: { apiKey?: string; tenantId?: string }
): Promise<string> {
  const res = await kosaiWebAiContract.extractTextFromImage(imageBase64, imageMimeType, options);
  return typeof res.data === 'string' ? res.data.trim() : '';
}

export async function dispatchHeroImageToKosai(
  params: { prompt: string; aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16' },
  options?: { tenantId?: string }
): Promise<string | null> {
  const res = await kosaiWebAiContract.generateHeroImage(params, options);
  return res.data || null;
}

export interface KoswebModelPromptContext {
  title: string;
  description: string;
  goal: string;
  extractedDocumentText?: string;
  formRequirement: 'auto' | 'none' | 'registration' | 'payment';
  paymentAmount?: number;
  companyName: string;
  voiceTone?: string;
  stylePreset: string;
  primaryColor?: string;
  availableBrandIcons: Array<{ name: string; labelHe: string; category: string }>;
  availableCrmFields: Array<{ crmFieldKey: string; labelHe: string }>;
}

export const GENERATE_KOSWEB_MODEL_PAGE_PROMPT = (ctx: KoswebModelPromptContext) => `
אתה אדריכל דפי נחיתה ומומחה קופירייטינג עברי עבור המותג "${ctx.companyName}".
סגנון המיתוג של העסק: "${ctx.stylePreset}" | טון דיבור: "${ctx.voiceTone || 'מקצועי, ברור ומניע לפעולה'}".

פרטי הקלט מהמשתמש:
- כותרת מבוקשת: "${ctx.title}"
- תיאור: "${ctx.description}"
- מטרת העמוד: "${ctx.goal}"
- דרישת טופס: "${ctx.formRequirement}"${ctx.paymentAmount ? ` (סכום מוצע לתשלום: ₪${ctx.paymentAmount})` : ''}
${ctx.extractedDocumentText ? `\nתוכן שחולץ ממסמך / תמונה שצורפו:\n"""\n${ctx.extractedDocumentText.slice(0, 4500)}\n"""\n` : ''}

רשימת האיקונים המאושרים מתוך סגנון המיתוג ב-KOSCLOUD (חובה לבחור שמות איקונים אך ורק מתוך רשימה זו!):
${ctx.availableBrandIcons.map((ic) => `- "${ic.name}" (${ic.labelHe})`).join('\n')}

רשימת מזהי השדות המסונכרנים מול ה-CRM (חובה לבחור מתוך מפתחות אלה בלבד במידה ויש טופס):
${ctx.availableCrmFields.map((f) => `- "${f.crmFieldKey}" (${f.labelHe})`).join('\n')}

הנחיות פלט מחייבות:
1. צור אזור הירו (Hero) חד, מושך וברור בעברית טבעית עם כותרת, תת-כותרת, תיאור קצר, תגית עליונה, כפתור פעולה ראשי, ו-imagePrompt קצר באנגלית.
2. צור רשימת 4 עד 6 פריטי מידע/יתרונות של העמוד ("iconDetails"), כאשר לכל פריט נבחר איקון מתוך רשימת האיקונים של KOSCLOUD שלמעלה (שם ה-icon חייב להיות זהה במדויק לאחד השמות ברשימה).
3. קבע האם העמוד כולל טופס הרשמה או טופס תשלום:
   - אם formRequirement הוא "registration" או "payment" — חובה לכלול טופס מסוג זה.
   - אם formRequirement הוא "auto" — כלול טופס אם המטרה/התיאור/המסמך מזכירים הרשמה, השארת פרטים, לידים, תיאום, רכישה או תשלום.
   - אם formRequirement הוא "none" — אל תכלול טופס (includeForm: false).
   - בכל טופס שנכלל, ספק מערך crmFieldKeys מתוך מזהי ה-CRM המורשים למעלה (כולל לפחות kosun_crm_name ו-kosun_crm_phone, ובטופס תשלום גם kosun_crm_email ו-kosun_crm_gov_id לפי הצורך).

החזר אובייקט JSON תקני בלבד ללא סימני markdown:
{
  "pageTitle": "כותרת העמוד",
  "slug": "english-kebab-slug",
  "hero": {
    "badge": "תגית קצרה",
    "title": "כותרת הירו ראשית",
    "subtitle": "תת כותרת משלימה",
    "description": "פסקת פתיחה ממירה ומדויקת",
    "ctaPrimaryText": "טקסט כפתור ראשי",
    "ctaSecondaryText": "טקסט כפתור משני",
    "imagePrompt": "Clean modern editorial hero visual matching the topic"
  },
  "iconDetails": {
    "badge": "תגית מקטע",
    "title": "כותרת מקטע פרטי העמוד",
    "subtitle": "משפט הסבר קצר למקטע האיקונים",
    "items": [
      {
        "icon": "IconNameFromKoscloudList",
        "number": "01",
        "title": "כותרת הפריט",
        "description": "הסבר תמציתי וברור מתוך פרטי העמוד והמסמך"
      }
    ]
  },
  "form": {
    "includeForm": true,
    "formMode": "registration",
    "sectionTitle": "כותרת הטופס",
    "sectionSubtitle": "תת כותרת לטופס",
    "submitButtonText": "טקסט כפתור שליחה",
    "paymentAmount": 0,
    "paymentItemTitle": "",
    "crmFieldKeys": ["kosun_crm_name", "kosun_crm_phone", "kosun_crm_email"]
  }
}
`;

export async function dispatchKoswebModelPageToKosai(
  ctx: KoswebModelPromptContext,
  options?: { apiKey?: string; tenantId?: string }
): Promise<any> {
  const prompt = GENERATE_KOSWEB_MODEL_PAGE_PROMPT(ctx);
  const res = await kosaiWebAiContract.generatePageStructure(
    prompt,
    'אתה מנוע בניית דפים של KOSWEB הפועל דרך KOSAI. החזר אך ורק JSON תקני.',
    options
  );
  return res.data;
}
