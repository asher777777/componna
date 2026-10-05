import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../brand-dna-hub/types/brandDna';

export interface GenerationStep {
  stepIndex: number;
  totalSteps: number;
  sectionType: SectionType;
  stepTitle: string;
  statusText: string;
  progressPercent: number;
}

export type OnStepCallback = (step: GenerationStep, partialConfig: PageBuilderConfig) => void;

export const aiPageGenerator = {
  presetPrompts: [
    {
      id: 'course-masterclass',
      title: 'קורס והכשרה מקצועית',
      description: 'דף נחיתה יוקרתי לקורס מאסטרקלס עם מחירון, ביקורות, שאלות נפוצות והרשמה.',
      icon: 'GraduationCap',
      prompt: 'דף נחיתה יוקרתי וממיר לקורס הכשרה מעשי בדיגיטל, כולל הישגי בוגרים, מחירון חבילות, שאלות נפוצות וטופס הרשמה מוקדמת. סגנון Layout: split.',
    },
    {
      id: 'saas-tech',
      title: 'מוצר SaaS וטכנולוגיה',
      description: 'עיצוב Bento Grid עתידני להשקת מערכת טכנולוגית, עם לוגואים נעים וטיימר השקה.',
      icon: 'Sparkles',
      prompt: 'דף השקה למערכת טכנולוגית חכמה מבוססת AI, בעיצוב Bento Grid מודרני, שורת שותפים, מדדי מפתח והנעה מהירה לפעולה.',
    },
    {
      id: 'fundraising-campaign',
      title: 'קמפיין גיוס תרומות וחסד',
      description: 'דף קמפיין שותפות עם מד גיוס חי, מדרגות תרומה ופיד תורמים בזמן אמת.',
      icon: 'Heart',
      prompt: 'קמפיין שותפות וגיוס תרומות לבניית מרכז קהילתי, עם מד גיוס שקוף, מדרגות תרומה מהירות וחיבור לקהילה.',
    },
    {
      id: 'local-business',
      title: 'עסק מקומי ושירותי VIP',
      description: 'דף שירותים ממוקד קידום מקומי (GEO SEO) עם מפה, שעות פתיחה וצ’אט וואטסאפ.',
      icon: 'MapPin',
      prompt: 'דף נחיתה מקצועי למשרד שירותי פרימיום במרכז הארץ, עם מפת הגעה, אזורי שירות, ביקורות לקוחות וטופס יצירת קשר מהיר.',
    },
  ],

  async generatePageLive(
    userPrompt: string,
    brandDna?: BrandDna | null,
    onStep?: OnStepCallback
  ): Promise<PageBuilderConfig> {
    const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
    const secondaryColor = brandDna?.designTokens?.secondaryColor || '#0ea5e9';
    const companyName = brandDna?.identity?.companyName || 'החברה המובילה';
    const slogan = brandDna?.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
    const logoUrl = brandDna?.identity?.logoUrl || '';
    const phone = brandDna?.trust?.contactPhone || '03-1234567';
    const email = brandDna?.trust?.contactEmail || 'contact@example.com';
    const whatsapp = brandDna?.trust?.whatsappSupportNumber || '0501234567';
    const address = brandDna?.trust?.officeAddress || 'תל אביב, ישראל';

    const pageId = `page_ai_${Date.now()}`;
    const slug = `launch-${Math.floor(Math.random() * 9000 + 1000)}`;

    const pageConfig: PageBuilderConfig = {
      pageId,
      pageTitle: `${companyName} - דף חכם`,
      slug,
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: `${companyName} | ${slogan}`,
        companyName,
        slogan,
        siteLogoUrl: logoUrl,
        theme: 'modern',
        headerLayout: 'floating-glass',
        headerSticky: true,
        isHeaderVisible: true,
        isFooterVisible: true,
        primaryColor,
        secondaryColor,
        backgroundColor: brandDna?.designTokens?.backgroundColor || '#0a0a0c',
        textColor: brandDna?.designTokens?.textColor || '#f8fafc',
        fontFamily: brandDna?.designTokens?.fontFamily || 'Heebo, sans-serif',
        borderRadius: brandDna?.designTokens?.borderRadius || 'md',
        buttonStyle: brandDna?.designTokens?.buttonStyle || 'gradient',
        contactWhatsApp: whatsapp,
        contactPhone: phone,
        contactEmail: email,
        address,
        brandDnaSynced: !!brandDna,
      },
      seoSettings: {
        title: `${companyName} - ${slogan}`,
        description: brandDna?.identity?.shortVision || `${companyName} מציגה פתרונות מתקדמים ואיכותיים ללא פשרות.`,
        keywords: ['שירותים מקצועיים', 'חדשנות', 'דיגיטל', companyName],
        geo: {
          enabled: true,
          targetCity: 'תל אביב',
          targetRegion: 'גוש דן והמרכז',
          targetCountry: 'ישראל',
          serviceAreas: ['כל הארץ'],
          localBusinessName: companyName,
          businessAddress: address,
          businessPhone: phone,
          businessEmail: email,
          openingHours: 'א-ה 09:00-18:00',
        },
      },
      sectionOrder: [],
      sections: {},
    };

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    
    let generatedSteps: any[] = [];
    
    if (!apiKey) {
      console.warn("No Gemini API key found, falling back to static dynamic logic.");
      generatedSteps = this.getFallbackSteps(userPrompt, companyName, brandDna);
    } else {
      try {
        const targetAudience = brandDna?.audience?.targetAudiences?.join(", ") || "לקוחות פוטנציאליים";
        const systemPrompt = `
You are an expert Web Page Layout Architect and UI/UX Designer.
Your goal is to design a high-converting, beautiful landing page for a company named "${companyName}".
The target audience is: ${targetAudience}.
The brand's main UVP is: "${brandDna?.audience?.mainUvp || 'איכות ושירות'}".
The user wants a page with the following description: "${userPrompt}"

### YOUR TASK:
1. Classify the page archetype based on the user's prompt (e.g., Sales Page, GEO/Local SEO Page, Info/Service Page, SaaS Launch).
2. Follow strict marketing and UX rules for the chosen archetype to sequence the sections correctly.
3. Configure each section's data, layout, style, and copy (in Hebrew) to match the brand and audience.

### ARCHETYPES & RULES:
- **Sales Page (עמוד מכירה):** Needs high conversion focus, urgency, and proof.
  -> *Flow:* 'hero' (bento-hero, split) -> 'videoGallery' -> 'services' (cards, emphasizing pain/solution) -> 'testimonials' (masonry) -> 'pricing' -> 'timer' (urgency) -> 'faq' -> 'contact'.
- **GEO / Local Business (עמוד שירות מקומי):** Needs trust, map, and immediate contact.
  -> *Flow:* 'hero' (centered or spatial) -> 'geoLocal' -> 'services' (grid) -> 'testimonials' (carousel) -> 'contact'.
- **Info / Corporate Service (עמוד תדמית ומידע):** Needs authority and clarity.
  -> *Flow:* 'hero' (modern, minimal) -> 'logoMarquee' -> 'services' (bento) -> 'statsBento' -> 'richContent' -> 'contact'.
- **SaaS / App Launch (השקת סטארטאפ):** Needs feature showcase and sleekness.
  -> *Flow:* 'hero' (mesh-glow) -> 'logoMarquee' -> 'services' (bento with border-beam) -> 'statsBento' -> 'pricing' -> 'contact'.

### DESIGN & LAYOUT OPTIONS TO CHOOSE FROM:
- **hero**: layout: 'fz' | 'spatial' | 'centered' | 'split' | 'bento-hero', heroStyle: 'classic' | 'modern' | 'minimal' | 'card' | 'mesh-glow'
- **services**: layout: 'grid' | 'bento' | 'cards' | 'minimal', effect: 'hover-scale' | 'hover-glow' | 'border-beam' | 'none'
- **testimonials**: layout: 'grid' | 'carousel' | 'masonry'
- **statsBento**: layout: 'bento-4' | 'row-4' | 'cards-3'
- **pricing**: Make sure to highlight the best option.
- **geoLocal**: Include the business city and address.
- **timer**: Use this if the prompt implies a launch, discount, or deadline.
- **contact**: Always include at the end or near the end.

### OUTPUT FORMAT:
Return ONLY a valid JSON array of section objects. NO markdown formatting.
Each object MUST have:
{
  "sectionType": "hero" | "logoMarquee" | "services" | "statsBento" | "testimonials" | "pricing" | "faq" | "contact" | "geoLocal" | "timer" | "videoGallery" | "richContent",
  "stepTitle": "A short description of this step in Hebrew (e.g. 'בניית אזור מסלולי תמחור')",
  "statusText": "A short action text in Hebrew (e.g. 'מגדיר חבילות מחיר עם תגית פופולרי...')",
  "data": { 
     "title": "Main title for the section in Hebrew",
     "layout": "The chosen layout",
     // ... include other relevant configuration fields (like items, subtitle, description, packages, stats, etc.) based on the section type.
  }
}
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const text = result.candidates[0].content.parts[0].text;
          generatedSteps = JSON.parse(text);
        } else {
          generatedSteps = this.getFallbackSteps(userPrompt, companyName, brandDna);
        }
      } catch (err) {
        console.error("AI Generation failed:", err);
        generatedSteps = this.getFallbackSteps(userPrompt, companyName, brandDna);
      }
    }

    // Stream through steps
    for (let i = 0; i < generatedSteps.length; i++) {
      const step = generatedSteps[i];
      // Ensure IDs are unique
      step.data.id = `${step.sectionType}_${Date.now()}_${i}`;
      step.data.type = step.sectionType;
      step.data.visible = true;

      pageConfig.sectionOrder.push(step.data.id);
      pageConfig.sections[step.data.id] = step.data;

      if (onStep) {
        onStep(
          {
            stepIndex: i + 1,
            totalSteps: generatedSteps.length,
            sectionType: step.sectionType,
            stepTitle: step.stepTitle || `בניית אזור ${step.sectionType}`,
            statusText: step.statusText || 'מייצר נתונים ועיצוב מותאם...',
            progressPercent: Math.round(((i + 1) / generatedSteps.length) * 100),
          },
          JSON.parse(JSON.stringify(pageConfig))
        );
      }

      // Small natural pause for real-time visual streaming experience
      await new Promise((r) => setTimeout(r, 600));
    }

    return pageConfig;
  },

  async generateSectionLive(
    sectionType: SectionType,
    userPrompt: string,
    brandDna?: BrandDna | null,
    currentConfig?: any
  ): Promise<any> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    if (!apiKey) {
      console.warn("No Gemini API key found, returning current config.");
      return currentConfig;
    }

    const companyName = brandDna?.identity?.companyName || 'החברה המובילה';
    const systemPrompt = `
You are an expert UI/UX Designer.
The user wants to redesign a specific "${sectionType}" section for the company "${companyName}".
User prompt: "${userPrompt}"
Current section config: ${JSON.stringify(currentConfig)}

Return ONLY a valid JSON object for the section "data" config. NO markdown.
For example, change layout to one of the available options (e.g. bento, grid, split, centered, spatial) or heroStyle (mesh-glow, modern, minimal) based on the user's prompt. Rewrite the text content in Hebrew to match.
Output exactly ONE JSON object.
`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        const newConfig = JSON.parse(text);
        // Ensure ID and Type are preserved
        if (currentConfig?.id) newConfig.id = currentConfig.id;
        newConfig.type = sectionType;
        return newConfig;
      }
    } catch (err) {
      console.error("AI Section Generation failed:", err);
    }
    return currentConfig;
  },

  getFallbackSteps(prompt: string, companyName: string, brandDna: any) {
    // If it's a sales/course page
    if (prompt.includes('מכירה') || prompt.includes('קורס')) {
      return [
        {
          sectionType: 'hero',
          stepTitle: 'בניית אזור מכירה ראשי',
          statusText: 'יוצר כותרת ענקית, אזור split ותחושת דחיפות...',
          data: { title: `ההזדמנות שלך עם ${companyName}`, subtitle: 'הצטרף עכשיו', description: 'אל תפספסו את ההזדמנות לשנות את החיים שלכם.', layout: 'split', heroStyle: 'mesh-glow', buttonsVisible: true, primaryButton: { text: 'הצטרפו עכשיו', url: '#pricing' } }
        },
        { sectionType: 'timer', stepTitle: 'הוספת טיימר השקה', statusText: 'מגדיר טיימר דחיפות...', data: { title: 'המבצע מסתיים בעוד:', targetDate: new Date(Date.now() + 86400000).toISOString() } },
        { sectionType: 'services', stepTitle: 'פירוט יתרונות הקורס', statusText: 'מעצב גריד כרטיסיות...', data: { title: 'מה תקבלו?', layout: 'cards', effect: 'hover-scale', items: [{id:'1', title: 'גישה לכל החיים'}, {id:'2', title: 'ליווי אישי'}] } },
        { sectionType: 'testimonials', stepTitle: 'הוכחה חברתית', statusText: 'מוסיף המלצות מבוגרים...', data: { title: 'בוגרים ממליצים', layout: 'masonry', items: [{id:'1', name:'ישראל', content:'שינה לי את החיים!', rating: 5}] } },
        { sectionType: 'pricing', stepTitle: 'מחירון ומסלולים', statusText: 'בונה חבילות תמחור...', data: { title: 'בחרו את המסלול שלכם', packages: [{id:'1', name:'VIP', priceMonthly:'₪990', isFeatured:true, buttonText:'הרשמה'}, {id:'2', name:'בסיסי', priceMonthly:'₪490', buttonText:'הרשמה'}] } },
      ];
    }
    
    // If GEO/Local
    if (prompt.includes('מקומי') || prompt.includes('שירות') || prompt.includes('אזור')) {
      return [
        {
          sectionType: 'hero',
          stepTitle: 'בניית אזור ראשי לוקאלי',
          statusText: 'מגדיר סגנון קלאסי וממוקד שירות...',
          data: { title: `שירות ${companyName} מנצח בעיר שלך`, description: 'המומחים שלנו בדרך אליכם תוך שעה בלבד.', layout: 'centered', heroStyle: 'modern', buttonsVisible: true, primaryButton: { text: 'חייגו עכשיו', url: 'tel:0500000000' } }
        },
        { sectionType: 'geoLocal', stepTitle: 'הוספת מפת הגעה ושירות', statusText: 'מטמיע אזורי שירות במפה...', data: { title: 'איפה אנחנו נמצאים?', businessName: companyName, address: brandDna?.trust?.officeAddress || 'תל אביב' } },
        { sectionType: 'testimonials', stepTitle: 'ביקורות מקומיות', statusText: 'מייבא ביקורות מלקוחות באזור...', data: { title: 'לקוחות באזורכם ממליצים', layout: 'carousel', items: [{id:'1', name:'לקוח מרוצה', content:'שירות מצוין ומהיר!', rating: 5}] } },
        { sectionType: 'contact', stepTitle: 'יצירת קשר מהירה', statusText: 'יוצר טופס לידים ישיר ל-WhatsApp...', data: { title: 'דברו איתנו בוואטסאפ', showForm: true, showMap: false } },
      ];
    }

    // Default Fallback
    return [
      {
        sectionType: 'hero',
        stepTitle: 'בניית אזור ראשי (Hero)',
        statusText: 'יוצר כותרת מרשימה...',
        data: { title: `הצעד הבא שלכם עם ${companyName}`, description: 'הפלטפורמה המובילה בארץ.', layout: 'bento-hero', heroStyle: 'mesh-glow', buttonsVisible: true, primaryButton: { text: 'התחילו עכשיו', url: '#contact' } }
      },
      {
        sectionType: 'services',
        stepTitle: 'בניית אזור שירותים (Bento)',
        statusText: 'מסדר שירותים בגריד חכם...',
        data: { title: 'כל מה שצריך במקום אחד', layout: 'bento', effect: 'border-beam', items: [{id:'1', title:'מהירות'},{id:'2', title:'אבטחה'},{id:'3', title:'עיצוב'}] }
      },
      {
        sectionType: 'contact',
        stepTitle: 'אזור צור קשר',
        statusText: 'מוסיף טופס יצירת קשר...',
        data: { title: 'יצירת קשר', showForm: true }
      }
    ];
  }
};
