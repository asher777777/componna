import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';

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
  async generatePageIdeas(brandDna?: BrandDna | null, providedApiKey?: string): Promise<Array<{id: string, title: string, description: string, prompt: string, icon: string}>> {
    const storedKeys = localStorage.getItem('comona_system_apikeys_config');
    const parsedKeys = storedKeys ? JSON.parse(storedKeys) : {};
    const apiKey = providedApiKey || parsedKeys.googleAiApiKey || import.meta.env.VITE_GEMINI_API_KEY as string;
    
    // Default fallback ideas
    const fallback = [
      { id: 'sales-funnel', title: '׳׳©׳₪׳ ׳׳›׳™׳¨׳•׳× ׳™׳•׳§׳¨׳×׳™', description: '׳“׳£ ׳ ׳—׳™׳×׳” ׳׳׳›׳™׳¨׳× ׳”׳©׳™׳¨׳•׳× ׳”׳׳¨׳›׳–׳™ ׳¢׳ ׳₪׳™׳¨׳•׳˜ ׳×׳•׳›׳ ׳™׳•׳× ׳•׳”׳•׳›׳—׳” ׳—׳‘׳¨׳×׳™׳×.', prompt: '׳“׳£ ׳ ׳—׳™׳×׳” ׳™׳•׳§׳¨׳×׳™ ׳•׳׳׳™׳¨ ׳׳׳›׳™׳¨׳× ׳”׳©׳™׳¨׳•׳× ׳”׳׳•׳‘׳™׳, ׳›׳•׳׳ ׳׳¡׳׳•׳׳™׳, ׳‘׳™׳§׳•׳¨׳•׳× ׳•׳”׳ ׳¢׳” ׳׳₪׳¢׳•׳׳” ׳‘׳¨׳•׳¨׳”.', icon: 'Zap' },
      { id: 'geo-local', title: '׳“׳£ ׳©׳™׳¨׳•׳× ׳׳§׳•׳׳™ (GEO)', description: '׳“׳£ ׳׳׳•׳§׳“ ׳׳–׳•׳¨ ׳₪׳¢׳™׳׳•׳× ׳¢׳ ׳׳₪׳”, ׳©׳¢׳•׳× ׳₪׳×׳™׳—׳” ׳•׳™׳¦׳™׳¨׳× ׳§׳©׳¨ ׳׳”׳™׳¨׳” ׳׳•׳•׳׳˜׳¡׳׳₪.', prompt: '׳“׳£ ׳©׳™׳¨׳•׳× ׳׳–׳•׳¨׳™ (GEO) ׳¢׳ ׳׳™׳§׳•׳“ ׳‘׳׳§׳•׳—׳•׳× ׳׳§׳•׳׳™׳™׳, ׳׳₪׳”, ׳©׳¢׳•׳× ׳₪׳¢׳™׳׳•׳× ׳•׳”׳•׳›׳—׳” ׳—׳‘׳¨׳×׳™׳× ׳׳׳•׳׳×׳×.', icon: 'MapPin' },
      { id: 'lead-gen', title: '׳§׳׳₪׳™׳™׳ ׳׳’׳ ׳˜ ׳׳™׳“׳™׳', description: '׳“׳£ ׳”׳©׳׳¨׳× ׳₪׳¨׳˜׳™׳ ׳§׳¦׳¨ ׳׳”׳•׳¨׳“׳× ׳׳“׳¨׳™׳ ׳׳• ׳”׳¨׳©׳׳” ׳׳•׳•׳‘׳™׳ ׳¨.', prompt: '׳“׳£ ׳ ׳—׳™׳×׳” ׳§׳¦׳¨ ׳•׳׳׳•׳§׳“ ׳׳׳™׳¡׳•׳£ ׳׳™׳“׳™׳, ׳”׳׳¦׳™׳¢ ׳׳“׳¨׳™׳ ׳—׳™׳ ׳׳™ ׳׳• ׳”׳¨׳©׳׳” ׳׳”׳¨׳¦׳׳” ׳§׳¨׳•׳‘׳”.', icon: 'Layers' },
    ];

    if (!apiKey) return fallback;

    const systemPrompt = `
You are an expert Marketing Strategist. 
The brand name is "${brandDna?.identity?.companyName || '׳”׳—׳‘׳¨׳”'}". 
Their purpose: "${brandDna?.identity?.organizationPurpose || ''}".
Their target audience: "${brandDna?.audience?.targetAudiences?.join(',') || '׳׳§׳•׳—׳•׳×'}".

Suggest 3 completely different landing page concepts/goals this brand should build right now to grow their business.
Output ONLY a valid JSON array of objects, each with:
- id: short english id (e.g. "webinar-funnel")
- title: short catchy title in Hebrew (e.g. "׳”׳¨׳©׳׳” ׳׳•׳•׳‘׳™׳ ׳¨ ׳§׳”׳™׳׳×׳™")
- description: short description in Hebrew
- prompt: a detailed prompt in Hebrew that the user can use to generate this page
- icon: one of these Lucide icon names: ['Zap', 'MapPin', 'Layers', 'Heart', 'Sparkles', 'GraduationCap', 'Star']
NO MARKDOWN. ONLY JSON.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.8, responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const result = await response.json();
        let text = result.candidates[0].content.parts[0].text;
        
        text = text.trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
        }

        return JSON.parse(text);
      } else {
        const errText = await response.text();
        console.error("Gemini API Error (generatePageIdeas):", response.status, errText);
      }
    } catch (err) {
      console.error("AI Page Ideas Generation failed:", err);
    }
    return fallback;
  },

  async generatePageLive(
    userPrompt: string,
    brandDna?: BrandDna | null,
    onStep?: OnStepCallback,
    options?: { generateImages?: boolean; apiKey?: string }
  ): Promise<PageBuilderConfig> {
    const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
    const secondaryColor = brandDna?.designTokens?.secondaryColor || '#0ea5e9';
    const companyName = brandDna?.identity?.companyName || '׳”׳—׳‘׳¨׳” ׳”׳׳•׳‘׳™׳׳”';
    const slogan = brandDna?.identity?.slogan || '׳—׳“׳©׳ ׳•׳×, ׳׳™׳›׳•׳× ׳•׳¦׳׳™׳—׳” ׳׳×׳׳“׳×';
    const logoUrl = brandDna?.identity?.logoUrl || '';
    const phone = brandDna?.trust?.contactPhone || '03-1234567';
    const email = brandDna?.trust?.contactEmail || 'contact@example.com';
    const whatsapp = brandDna?.trust?.whatsappSupportNumber || '0501234567';
    const address = brandDna?.trust?.officeAddress || '׳×׳ ׳׳‘׳™׳‘, ׳™׳©׳¨׳׳';

    const pageId = `page_ai_${Date.now()}`;
    
    // Initial config shell, will be updated by AI response
    let pageConfig: PageBuilderConfig = {
      pageId,
      pageTitle: `${companyName} - ׳“׳£ ׳—׳›׳`,
      slug: 'launch',
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
        backgroundColor: brandDna?.designTokens?.backgroundColor || '#ffffff',
        textColor: brandDna?.designTokens?.textColor || '#0f172a',
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
        description: brandDna?.identity?.shortVision || `${companyName} ׳׳¦׳™׳’׳” ׳₪׳×׳¨׳•׳ ׳•׳× ׳׳×׳§׳“׳׳™׳ ׳•׳׳™׳›׳•׳×׳™׳™׳ ׳׳׳ ׳₪׳©׳¨׳•׳×.`,
        keywords: ['׳©׳™׳¨׳•׳×׳™׳ ׳׳§׳¦׳•׳¢׳™׳™׳', '׳—׳“׳©׳ ׳•׳×', '׳“׳™׳’׳™׳˜׳', companyName],
        geo: {
          enabled: true,
          targetCity: '׳×׳ ׳׳‘׳™׳‘',
          targetRegion: '׳’׳•׳© ׳“׳ ׳•׳”׳׳¨׳›׳–',
          targetCountry: '׳™׳©׳¨׳׳',
          serviceAreas: ['׳›׳ ׳”׳׳¨׳¥'],
          localBusinessName: companyName,
          businessAddress: address,
          businessPhone: phone,
          businessEmail: email,
          openingHours: '׳-׳” 09:00-18:00',
        },
      },
      sectionOrder: [],
      sections: {},
    };

    const storedKeys = localStorage.getItem('comona_system_apikeys_config');
    const parsedKeys = storedKeys ? JSON.parse(storedKeys) : {};
    const apiKey = options?.apiKey || parsedKeys.googleAiApiKey || import.meta.env.VITE_GEMINI_API_KEY as string;
    
    let aiResponse: any = null;
    
    if (!apiKey) {
      console.warn("No Gemini API key found, falling back to static dynamic logic.");
      aiResponse = {
        slug: 'welcome',
        backgroundColor: '#0a0a0c',
        textColor: '#f8fafc',
        sections: this.getFallbackSteps(userPrompt, companyName, brandDna)
      };
    } else {
      try {
        const targetAudience = brandDna?.audience?.targetAudiences?.join(", ") || "׳׳§׳•׳—׳•׳× ׳₪׳•׳˜׳ ׳¦׳™׳׳׳™׳™׳";
        const brandColors = `Primary: ${primaryColor}, BG: ${brandDna?.designTokens?.backgroundColor || '#ffffff'}`;
        
        const systemPrompt = `
You are an expert Web Page Architect and Conversion Rate Optimizer.
Brand Context:
- Company: "${companyName}"
- Audience: ${targetAudience}
- Core UVP: "${brandDna?.audience?.mainUvp || '׳”׳—׳‘׳¨׳” ׳”׳׳•׳‘׳™׳׳”'}"
- Goal: Create a high-converting, deeply immersive page. DO NOT output a generic one-section page. Build a rich page with 4-8 interconnected sections (like Hero -> Marquee -> Services -> Bento -> Testimonials -> FAQ -> Contact).

User Prompt: "${userPrompt}"

### YOUR TASK:
1. Generate an English "slug" (e.g. "sales-funnel").
2. Pick "backgroundColor" and "textColor" that fit the brand vibe. DO NOT default to black! Use #hex.
3. Choose the best sequence of sections.
4. ${options?.generateImages ? 'For sections needing images, add "imagePrompt" (in English, for AI generation) and "imageAlt" (Hebrew). DO NOT add "imageSrc".' : 'Do not generate images.'}

### AVAILABLE SECTIONS AND REQUIRED "data" PROPERTIES (Use EXACT property names):
- hero: layout ('fz'|'spatial'|'centered'|'split'|'bento-hero'), heroStyle ('classic'|'modern'|'mesh-glow'), title, description, primaryButton {text, url}
- services: layout ('grid'|'bento'|'cards'|'minimal'), title, description, items [{title, description, icon}]
- testimonials: layout ('grid'|'carousel'|'masonry'), title, items [{name, role, quote}]
- statsBento: layout ('bento-4'|'row-4'|'cards-3'), title, stats [{number, label}]
- richContent: layout ('standard'|'two-columns'), heading, body
- pricing: title, packages [{name, priceMonthly, features: []}]
- geoLocal: title, subtitle, city, address, serviceAreas: []
- faq: title, items [{question, answer}] (Ensure questions are highly relevant and solve real user objections!)
- contact: title, subtitle, phone, email, address, showForm (boolean), directWhatsappChat (boolean)
- logoMarquee: title, speed ('slow'|'medium'), logos [{name}]
- smartForm: sectionTitle, sectionSubtitle, formId (leave empty string to auto-generate), formMode ('lead'|'contact')

### STRICT JSON OUTPUT FORMAT (NO COMMENTS inside JSON!):
{
  "slug": "page-slug",
  "backgroundColor": "#ffffff",
  "textColor": "#0f172a",
  "sections": [
    {
      "sectionType": "hero",
      "stepTitle": "׳›׳•׳×׳¨׳× ׳§׳¦׳¨׳” ׳‘׳¢׳‘׳¨׳™׳×",
      "statusText": "׳₪׳¢׳•׳׳” ׳§׳¦׳¨׳” ׳‘׳¢׳‘׳¨׳™׳×",
      "data": {
        "title": "Main title",
        "layout": "split",
        "heroStyle": "mesh-glow"
      }
    }
  ]
}
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
          let text = result.candidates[0].content.parts[0].text;
          
          text = text.trim();
          if (text.startsWith('```')) {
            text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
          }

          aiResponse = JSON.parse(text);
        } else {
          const errText = await response.text();
          console.error("Gemini API Error (generatePageLive):", response.status, errText);
          aiResponse = { slug: 'page', backgroundColor: '#0a0a0c', textColor: '#f8fafc', sections: this.getFallbackSteps(userPrompt, companyName, brandDna) };
        }
      } catch (err) {
        console.error("AI Generation failed:", err);
        aiResponse = { slug: 'page', backgroundColor: '#0a0a0c', textColor: '#f8fafc', sections: this.getFallbackSteps(userPrompt, companyName, brandDna) };
      }
    }

    // Apply global generated settings
    if (aiResponse.slug) pageConfig.slug = aiResponse.slug;
    if (aiResponse.backgroundColor) pageConfig.globalSettings.backgroundColor = aiResponse.backgroundColor;
    if (aiResponse.textColor) pageConfig.globalSettings.textColor = aiResponse.textColor;

    const generatedSteps = aiResponse.sections || [];

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
            stepTitle: step.stepTitle || `׳‘׳ ׳™׳™׳× ׳׳–׳•׳¨ ${step.sectionType}`,
            statusText: step.statusText || '׳׳™׳™׳¦׳¨ ׳ ׳×׳•׳ ׳™׳ ׳•׳¢׳™׳¦׳•׳‘ ׳׳•׳×׳׳...',
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
    currentConfig?: any,
    providedApiKey?: string
  ): Promise<any> {
    const storedKeys = localStorage.getItem('comona_system_apikeys_config');
    const parsedKeys = storedKeys ? JSON.parse(storedKeys) : {};
    const apiKey = providedApiKey || parsedKeys.googleAiApiKey || import.meta.env.VITE_GEMINI_API_KEY as string;

    if (!apiKey) {
      console.warn("No Gemini API key found, returning current config.");
      return currentConfig;
    }

    const companyName = brandDna?.identity?.companyName || '׳”׳—׳‘׳¨׳” ׳”׳׳•׳‘׳™׳׳”';
    const systemPrompt = `
You are an expert UI/UX Designer and Conversion Rate Optimizer.
The user wants to redesign a specific "${sectionType}" section for the company "${companyName}".
User prompt: "${userPrompt}"
Current section config: ${JSON.stringify(currentConfig)}

### AVAILABLE SECTIONS AND REQUIRED "data" PROPERTIES (Use EXACT property names):
- hero: layout ('fz'|'spatial'|'centered'|'split'|'bento-hero'), heroStyle ('classic'|'modern'|'mesh-glow'), title, description, primaryButton {text, url}
- services: layout ('grid'|'bento'|'cards'|'minimal'), title, description, items [{title, description, icon}]
- testimonials: layout ('grid'|'carousel'|'masonry'), title, items [{name, role, quote}]
- statsBento: layout ('bento-4'|'row-4'|'cards-3'), title, stats [{number, label}]
- richContent: layout ('standard'|'two-columns'), heading, body
- pricing: title, packages [{name, priceMonthly, features: []}]
- geoLocal: title, subtitle, city, address, serviceAreas: []
- faq: title, items [{question, answer}] (Ensure questions are highly relevant and solve real user objections!)
- contact: title, subtitle, phone, email, address, showForm (boolean), directWhatsappChat (boolean)
- logoMarquee: title, speed ('slow'|'medium'), logos [{name}]
- smartForm: sectionTitle, sectionSubtitle, formId (leave empty string to auto-generate), formMode ('lead'|'contact')

Return ONLY a valid JSON object for the section "data" config. NO markdown. NO COMMENTS inside the JSON.
Output exactly ONE JSON object matching the required properties for the "${sectionType}" section.
Rewrite the text content in Hebrew to match the user's prompt.
`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const result = await response.json();
        let text = result.candidates[0].content.parts[0].text;
        
        text = text.trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
        }

        const newConfig = JSON.parse(text);
        // Ensure ID and Type are preserved
        if (currentConfig?.id) newConfig.id = currentConfig.id;
        newConfig.type = sectionType;
        return newConfig;
      } else {
        const errText = await response.text();
        console.error("Gemini API Error (generateSectionLive):", response.status, errText);
      }
    } catch (err) {
      console.error("AI Section Generation failed:", err);
    }
    return currentConfig;
  },

  getFallbackSteps(prompt: string, companyName: string, brandDna: any) {
    if (prompt.includes('׳׳›׳™׳¨׳”') || prompt.includes('׳§׳•׳¨׳¡')) {
      return [
        {
          sectionType: 'hero',
          stepTitle: '׳‘׳ ׳™׳™׳× ׳׳–׳•׳¨ ׳׳›׳™׳¨׳” ׳¨׳׳©׳™',
          statusText: '׳™׳•׳¦׳¨ ׳›׳•׳×׳¨׳× ׳¢׳ ׳§׳™׳×, ׳׳–׳•׳¨ split ׳•׳×׳—׳•׳©׳× ׳“׳—׳™׳₪׳•׳×...',
          data: { title: `׳”׳”׳–׳“׳׳ ׳•׳× ׳©׳׳ ׳¢׳ ${companyName}`, subtitle: '׳”׳¦׳˜׳¨׳£ ׳¢׳›׳©׳™׳•', description: '׳׳ ׳×׳₪׳¡׳₪׳¡׳• ׳׳× ׳”׳”׳–׳“׳׳ ׳•׳× ׳׳©׳ ׳•׳× ׳׳× ׳”׳—׳™׳™׳ ׳©׳׳›׳.', layout: 'split', heroStyle: 'mesh-glow', buttonsVisible: true, primaryButton: { text: '׳”׳¦׳˜׳¨׳₪׳• ׳¢׳›׳©׳™׳•', url: '#pricing' } }
        },
        { sectionType: 'pricing', stepTitle: '׳׳—׳™׳¨׳•׳ ׳•׳׳¡׳׳•׳׳™׳', statusText: '׳‘׳•׳ ׳” ׳—׳‘׳™׳׳•׳× ׳×׳׳—׳•׳¨...', data: { title: '׳‘׳—׳¨׳• ׳׳× ׳”׳׳¡׳׳•׳ ׳©׳׳›׳', packages: [{id:'1', name:'VIP', priceMonthly:'ג‚×990', isFeatured:true, buttonText:'׳”׳¨׳©׳׳”'}] } },
      ];
    }
    return [
      {
        sectionType: 'hero',
        stepTitle: '׳‘׳ ׳™׳™׳× ׳׳–׳•׳¨ ׳¨׳׳©׳™ (Hero)',
        statusText: '׳™׳•׳¦׳¨ ׳›׳•׳×׳¨׳× ׳׳¨׳©׳™׳׳”...',
        data: { title: `׳”׳¦׳¢׳“ ׳”׳‘׳ ׳©׳׳›׳ ׳¢׳ ${companyName}`, description: '׳”׳₪׳׳˜׳₪׳•׳¨׳׳” ׳”׳׳•׳‘׳™׳׳” ׳‘׳׳¨׳¥.', layout: 'bento-hero', heroStyle: 'mesh-glow', buttonsVisible: true, primaryButton: { text: '׳”׳×׳—׳™׳׳• ׳¢׳›׳©׳™׳•', url: '#contact' } }
      }
    ];
  }
};
