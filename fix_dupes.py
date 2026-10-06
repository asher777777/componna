with open('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppStatusesTab.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_import = False
import_seen = False
for line in lines:
    if "import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';" in line:
        if import_seen:
            continue
        import_seen = True
    new_lines.append(line)

with open('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppStatusesTab.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)


with open('C:/comona/src/modules/page-builder/services/aiPageGenerator.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('dna.identity.brandPersonality', '(dna.identity as any).brandPersonality')

with open('C:/comona/src/modules/page-builder/services/aiPageGenerator.ts', 'w', encoding='utf-8') as f:
    f.write(c)

