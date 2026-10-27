/**
 * ============================================================================
 * ⚠️ אזהרת שומר הסף (KOSUN26 GATE 3 - AI MONOPOLY) ⚠️
 * כל פרומפט בקובץ זה נשלח אך ורק לחוזה עם KOSAI הנמצא בתיקייה:
 * src/modules/KosAi/modelsAiService/webAiContract.ts
 * אין לשלוח לג'מיני בשום אופן ישירות! חל איסור מוחלט על שימוש ב-fetch מקומי!
 * ============================================================================
 */

import { kosaiWebAiContract, KosaiMarketingIdea } from '../../kosai-engine/modelsAiService';

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
