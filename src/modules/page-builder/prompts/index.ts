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
   - For a sales page: hero (spatial/split) -> logoMarquee -> services (bento) -> statsBento -> timer -> pricing -> testimonials -> faq -> contact.
   - For an educational/lead page: hero (centered/mesh) -> richContent (highlight-box) -> services -> beforeAfter -> testimonials -> faq -> landingSection.
   - For a local service: hero (bento-hero) -> geoLocal -> services -> statsBento -> testimonials -> faq -> contact.
   - For a community/club: hero -> community -> logoMarquee -> statsBento -> testimonials -> pricing -> contact.
3. ADAPTIVE STYLING & EFFECTS:
   - Set section backgrounds with variety (e.g. subtle dark glass, dark slate, deep indigo hues, or matching brand accents).
   - Use effects: 'border-beam', 'hover-glow', 'hover-scale'.
4. NATIVE ISRAELI HEBREW COPYWRITING:
   - All text MUST be persuasive, natural, idiomatic, punchy Hebrew. Avoid robotic translations.
   - Testimonials must feel like genuine Israeli clients with realistic names and authentic quotes.
   - FAQ must answer real, sharp customer objections.
5. VISUAL INTEGRATION:
   - For hero, provide imagePrompt in English and set imageSrc.
   - For services, provide unique icons (e.g. 'Zap', 'ShieldCheck', 'Sparkles', 'Rocket', 'Users', 'Target', 'Flame', 'TrendingUp', 'Star', 'Crown').

### AVAILABLE SECTION TYPES & SCHEMAS:
1. "hero": layout ('split'|'fz'|'spatial'|'centered'|'bento-hero'), heroStyle ('mesh-glow'|'modern'|'classic'), title, subtitle, description, buttonsVisible (true), primaryButton {text, url}, secondaryButton {text, url}, announcementBadge {text, url}, socialProofAvatars {visible: true, ratingText, starsCount: 5}
2. "services": layout ('bento'|'grid'|'cards'|'minimal'), effect ('border-beam'|'hover-glow'|'hover-scale'), title, subtitle, description, items [{id, title, description, icon, badge, span: '1'|'2', highlight: boolean, statNumber, statLabel}]
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
}) => `
You are a World-Class Chief Marketing Officer and Conversion Funnel Strategist conducting a deep architectural brainstorming session.
Brand Identity & DNA:
- Company Name: "${context.companyName}"
- Purpose / Mission: "${context.purpose || ''}"
- Target Audiences: "${context.targetAudiences?.join(', ') || 'קהל יעד איכותי'}"
- Unique Value Proposition (UVP): "${context.uvp || 'פתרונות מובילים'}"
- Deep Buyer Personas: ${context.personas && context.personas.length > 0 ? context.personas.map(p => `[${p.name}: כאב: "${p.mainPain || ''}", תוצאה נכספת: "${p.dreamOutcome || ''}"]`).join('; ') : 'לא הוגדרו פרסונות ספציפיות'}
- Key Customer Objections to Conquer: ${context.objections && context.objections.length > 0 ? context.objections.map(o => `[התנגדות: "${o.objection}", מענה: "${o.rebuttal}"]`).join('; ') : 'אין התנגדויות ידועות'}
- Existing Pages in the System: ${context.existingPages && context.existingPages.length > 0 ? context.existingPages.map(p => `"${p.title}" (/p/${p.slug || ''})`).join(', ') : 'אין עדיין עמודים קיימים'}

TASK:
Analyze the brand DNA, customer personas, objections, and existing pages to avoid cannibalization and find massive growth opportunities.
Generate exactly 6 distinctive, high-converting landing page concepts for this brand.
Each concept must address a different strategic angle that directly addresses the brand's personas and solves their pain points:
1. Sales & Launch Funnel (משפך מכירה ישירה ודחיפות)
2. Lead Magnet & Knowledge Guide (מגנט לידים להורדת מדריך / ידע בלעדי)
3. VIP Digital Course / Exclusive Offer (קורס / הדרכה בלעדית מותאמת לפרסונות)
4. Local GEO Authority (דף שירות אזורי מקומי עם מפה ו-WhatsApp)
5. Community & VIP Members Club (מועדון חברים וקהילת לקוחות)
6. Presale Countdown Campaign (השקת פריסייל דחופה עם ספירה לאחור)

Return ONLY a valid JSON array of 6 objects with NO MARKDOWN:
[
  {
    "id": "concept-id",
    "title": "כותרת מושכת בעברית (3-5 מילים)",
    "description": "הסבר שיווקי מתומצת המתייחס לכאבי הלקוח וה-DNA (1-2 משפטים בעברית)",
    "prompt": "פרומפט מפורט בעברית לבניית הדף כולו הכולל הנחיות מדויקות לסעיפי האתר",
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
