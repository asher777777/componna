import sys

file_path = 'src/modules/page-builder/services/aiPageGenerator.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

new_page_prompt = '''        const systemPrompt = 
You are an expert Web Page Architect and Conversion Rate Optimizer.
Brand Context:
- Company: ""
- Audience: 
- Core UVP: ""
- Goal: Create a high-converting, deeply immersive page. DO NOT output a generic one-section page. Build a rich page with 4-8 interconnected sections (like Hero -> Marquee -> Services -> Bento -> Testimonials -> FAQ -> Contact).

User Prompt: ""

### YOUR TASK:
1. Generate an English "slug" (e.g. "sales-funnel").
2. Pick "backgroundColor" and "textColor" that fit the brand vibe. DO NOT default to black! Use #hex.
3. Choose the best sequence of sections.
4. 

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
;\n\n        const response = await fetch'''

new_section_prompt = '''    const systemPrompt = 
You are an expert UI/UX Designer and Conversion Rate Optimizer.
The user wants to redesign a specific "" section for the company "".
User prompt: ""
Current section config: 

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
Output exactly ONE JSON object matching the required properties for the "" section.
Rewrite the text content in Hebrew to match the user's prompt.
;\n    try {\n      const response = await fetch'''

# 1. PageLive
idx_start = code.find('        const systemPrompt = ')
if idx_start != -1:
    idx_start = code.find('        const systemPrompt = ', idx_start + 10)
    if idx_start != -1:
        idx_end = code.find('        const response = await fetch', idx_start)
        if idx_end != -1:
            code = code[:idx_start] + new_page_prompt + code[idx_end + len('        const response = await fetch'):]
        else:
            print("fetch 1 not found")
    else:
        print("prompt 1b not found")
else:
    print("prompt 1 not found")

# 2. SectionLive
idx_start2 = code.find('    const systemPrompt = ')
if idx_start2 != -1:
    idx_start2 = code.find('    const systemPrompt = ', idx_start2 + 10) # 3rd one?
    idx_start2 = code.find('    const systemPrompt = ', idx_start2 + 10)
    if idx_start2 != -1:
        idx_end2 = code.find('    try {\n      const response = await fetch', idx_start2)
        if idx_end2 == -1:
             idx_end2 = code.find('    try {\r\n      const response = await fetch', idx_start2)
        if idx_end2 != -1:
            code = code[:idx_start2] + new_section_prompt + code[idx_end2 + len('    try {\n      const response = await fetch'):]
        else:
            print("fetch 2 not found")
    else:
        print("prompt 2b not found")
else:
    print("prompt 2 not found")

# 3. JSON PARSE FIX
fix_block = '''        let text = result.candidates[0].content.parts[0].text;
        text = text.trim();
        if (text.startswith('`')) {
          text = text.replace(/^`json\\s*/i, '').replace(/^`\\s*/, '').replace(/\\s*`$/, '').trim();
        }'''

code = code.replace('const text = result.candidates[0].content.parts[0].text;\n        return JSON.parse(text);',
                    fix_block + '\n        return JSON.parse(text);')

code = code.replace('const text = result.candidates[0].content.parts[0].text;\r\n        return JSON.parse(text);',
                    fix_block + '\r\n        return JSON.parse(text);')

code = code.replace('const text = result.candidates[0].content.parts[0].text;\n          aiResponse = JSON.parse(text);',
                    fix_block + '\n          aiResponse = JSON.parse(text);')

code = code.replace('const text = result.candidates[0].content.parts[0].text;\r\n          aiResponse = JSON.parse(text);',
                    fix_block + '\r\n          aiResponse = JSON.parse(text);')

code = code.replace('const text = result.candidates[0].content.parts[0].text;\n        const newConfig = JSON.parse(text);',
                    fix_block + '\n        const newConfig = JSON.parse(text);')

code = code.replace('const text = result.candidates[0].content.parts[0].text;\r\n        const newConfig = JSON.parse(text);',
                    fix_block + '\r\n        const newConfig = JSON.parse(text);')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Done substring replace")
