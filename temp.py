import re
with open('src/modules/page-builder/services/aiPageGenerator.ts', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('''const systemPrompt = \nYou are an expert Web Page Layout Architect and UI/UX Designer.
Company: "".
Audience: .
Brand UVP: "".
Brand Colors Context: .
User Prompt: ""

        const systemPrompt = \nYou are an expert Web Page Architect''', '''const systemPrompt = \nYou are an expert Web Page Architect''')
with open('src/modules/page-builder/services/aiPageGenerator.ts', 'w', encoding='utf-8') as f:
    f.write(c)
