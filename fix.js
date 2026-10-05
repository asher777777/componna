const fs = require('fs');
let code = fs.readFileSync('src/modules/page-builder/services/aiPageGenerator.ts', 'utf8');

const newPagePrompt =         const systemPrompt = \
You are an expert Web Page Architect and Conversion Rate Optimizer.
Brand Context:
- Company: "\\\"
- Audience: \\\
- Core UVP: "\\\"
- Voice/Tone: "\\\"
- Goal: Create a high-converting, deeply immersive page. DO NOT output a generic one-section page. Build a rich page with 4-8 interconnected sections (like Hero -> Marquee -> Services -> Bento -> Testimonials -> FAQ -> Contact).

User Prompt: "\\\"

### YOUR TASK:
1. Generate an English "slug" (e.g. "sales-funnel").
2. Pick "backgroundColor" and "textColor" that fit the brand vibe. DO NOT default to black! Use #hex.
3. Choose the best sequence of sections.
4. \\\

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
      "stepTitle": "כותרת קצרה בעברית",
      "statusText": "פעולה קצרה בעברית",
      "data": {
        "title": "Main title",
        "layout": "split",
        "heroStyle": "mesh-glow"
      }
    }
  ]
}
\;;

const newSectionPrompt =     const systemPrompt = \
You are an expert UI/UX Designer and Conversion Rate Optimizer.
The user wants to redesign a specific "\\\" section for the company "\\\".
User prompt: "\\\"
Current section config: \\\

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
Output exactly ONE JSON object matching the required properties for the "\\\" section.
Rewrite the text content in Hebrew to match the user's prompt.
\;;

// Replace using non-greedy regex
code = code.replace(/        const systemPrompt = \[\s\S]*?OUTPUT FORMAT:[\s\S]*?}\n\;/, newPagePrompt);
code = code.replace(/    const systemPrompt = \\nYou are an expert UI\/UX Designer\.[\s\S]*?Output exactly ONE JSON object\.\n\;/, newSectionPrompt);

const fixBlock =         let text = result.candidates[0].content.parts[0].text;
        text = text.trim();
        if (text.startsWith('\\\')) {
          text = text.replace(/^\\\json\\s*/i, '').replace(/^\\\\\s*/, '').replace(/\\s*\\\$/, '').trim();
        };

code = code.replace(/const text = result\.candidates\[0\]\.content\.parts\[0\]\.text;\s*return JSON\.parse\(text\);/g, fixBlock + '\n        return JSON.parse(text);');
code = code.replace(/const text = result\.candidates\[0\]\.content\.parts\[0\]\.text;\s*aiResponse = JSON\.parse\(text\);/g, fixBlock + '\n          aiResponse = JSON.parse(text);');
code = code.replace(/const text = result\.candidates\[0\]\.content\.parts\[0\]\.text;\s*const newConfig = JSON\.parse\(text\);/g, fixBlock + '\n        const newConfig = JSON.parse(text);');

fs.writeFileSync('src/modules/page-builder/services/aiPageGenerator.ts', code, 'utf8');
