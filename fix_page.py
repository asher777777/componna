with open('C:/comona/src/modules/page-builder/services/aiPageGenerator.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('dna.identity.brandPersonality', '(dna.identity as any).brandPersonality')

with open('C:/comona/src/modules/page-builder/services/aiPageGenerator.ts', 'w', encoding='utf-8') as f:
    f.write(c)
