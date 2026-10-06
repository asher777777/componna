const fs = require('fs');
let c = fs.readFileSync('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppWebChatView.tsx', 'utf8');

const replacement =             {/* Smart Reply Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 px-3 pt-2 scrollbar-hide">
              {['תודה, נבדוק ונחזור אליך', 'באיזו שעה נוח לך לשוחח?', 'שלחתי לך קישור לפרטים'].map(chip => (
                <button
                  key={chip}
                  onClick={() => setInputMessage(chip)}
                  className={\whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium border transition cursor-pointer \\}
                >
                  {chip}
                </button>
              ))}
            </div>;

c = c.replace(/\{\/\* Smart Reply Chips \*\/\}[\s\S]*?<\/div>/, replacement);

fs.writeFileSync('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppWebChatView.tsx', c);
