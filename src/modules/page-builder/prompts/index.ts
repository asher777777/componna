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
You are an Elite Web Architect and Conversion Rate Optimizer.
Brand Context:
- Company: "${context.companyName}"
- Slogan: "${context.slogan || ''}"
- Target Audience: "${context.targetAudience || 'לקוחות איכותיים'}"
- Core UVP: "${context.uvp || 'פתרונות מובילים ואיכותיים ללא פשרות'}"
- Tone & Voice: "${context.voiceTone || 'מקצועי, סמכותי, חם ומניע לפעולה'}"
- Color Scheme: Primary ${context.primaryColor || '#6366f1'}, Background ${context.backgroundColor || '#ffffff'}

User Goal / Directive:
"${context.userPrompt}"

### CRITICAL ARCHITECTURAL RULES:
1. NEVER output a single-section page! You MUST output a cohesive, high-converting sequence of 4 to 8 sections.
2. Structure recommended sequence:
   hero -> (services OR richContent) -> statsBento -> testimonials -> (pricing OR smartForm) -> faq -> contact
3. All Hebrew texts must be persuasive, native, grammatically flawless Israeli Hebrew.
4. Colors must respect the brand colors. Do not default to plain black backgrounds unless explicitly requested.
${context.generateImages ? '5. For sections requiring visual assets (hero, services, testimonials), include "imagePrompt" in rich descriptive English for AI generation and "imageAlt" in Hebrew.' : ''}

### AVAILABLE SECTIONS:
- hero: layout ('split'|'fz'|'spatial'|'centered'|'bento-hero'), heroStyle ('mesh-glow'|'modern'|'classic'), title, subtitle, description, buttonsVisible, primaryButton {text, url}, secondaryButton {text, url}
- services: layout ('grid'|'bento'|'cards'|'minimal'), title, subtitle, description, items [{id, title, description, icon}]
- statsBento: layout ('bento-4'|'row-4'|'cards-3'), title, subtitle, stats [{number, label, description}]
- testimonials: layout ('grid'|'carousel'|'masonry'), title, subtitle, items [{id, name, role, quote, rating, avatarUrl}]
- pricing: title, subtitle, packages [{id, name, priceMonthly, priceYearly, isFeatured, badge, description, features, buttonText, actionType}]
- richContent: layout ('standard'|'two-columns'), heading, subtitle, body, bullets []
- faq: title, subtitle, items [{question, answer}] (Address real customer doubts & objections!)
- contact: title, subtitle, phone, email, address, showForm (boolean), directWhatsappChat (boolean)
- logoMarquee: title, speed ('slow'|'medium'), logos [{name}]
- geoLocal: title, subtitle, city, address, serviceAreas: []
- community: title, subtitle, memberCount, benefits: []
- timer: title, subtitle, targetDate, ctaText

Return ONLY a valid JSON object with NO MARKDOWN formatting:
{
  "slug": "english-slug",
  "pageTitle": "כותרת עמוד מושכת",
  "backgroundColor": "#ffffff",
  "textColor": "#0f172a",
  "sections": [
    {
      "sectionType": "hero",
      "stepTitle": "כותרת קצרה של האזור בעברית",
      "statusText": "פעולה קצרה שהמנוע מבצע כרגע",
      "data": { ...section specific config properties... }
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
}) => `
You are a World-Class Chief Marketing Officer and Funnel Strategist.
Brand Identity:
- Company Name: "${context.companyName}"
- Purpose: "${context.purpose || ''}"
- Target Audiences: "${context.targetAudiences?.join(', ') || 'לקוחות פוטנציאליים'}"
- UVP: "${context.uvp || 'מובילות בתחום'}"
- Known Objections: "${context.objections?.map(o => o.objection).join('; ') || 'מחיר, חוסר זמן, אמון'}"

TASK:
Generate exactly 6 distinctive, high-converting landing page concepts for this brand.
Each concept must address a different strategic angle:
1. Sales & Launch Funnel (מכירה ישירה ודחיפות)
2. Lead Magnet & Knowledge Guide (מגנט לידים להורדת מדריך / ידע)
3. VIP Digital Course / Exclusive Offer (קורס / הדרכה בלעדית)
4. Local GEO Authority (דף שירות אזורי מקומי עם מפה ו-WhatsApp)
5. Community & VIP Members Club (מועדון חברים וקהילה)
6. Presale Countdown Campaign (השקה בלעדית עם ספירה לאחור)

Return ONLY a valid JSON array of 6 objects with NO MARKDOWN:
[
  {
    "id": "concept-id",
    "title": "כותרת מושכת בעברית (3-5 מילים)",
    "description": "הסבר שיווקי מתומצת (1-2 משפטים בעברית)",
    "prompt": "פרומפט מפורט בעברית לבניית הדף כולו",
    "icon": "Zap" | "MapPin" | "Layers" | "Heart" | "Sparkles" | "GraduationCap" | "Clock" | "Users",
    "targetObjective": "מכירות / לידים / סמכות / קהילה",
    "badge": "הכי מומלץ / המרה מהירה / סמכות"
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
