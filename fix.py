with open('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppWebChatView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

s = r"className={whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium border transition cursor-pointer }"
r = r"className={whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium border transition cursor-pointer }"

c = c.replace(s, r)

with open('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppWebChatView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
