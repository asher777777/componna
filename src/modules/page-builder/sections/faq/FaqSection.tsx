import React, { useState } from 'react';
import { FaqSectionConfig } from '../../types/sectionConfigs';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const FaqSection: React.FC<{ config: FaqSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'שאלות ותשובות נפוצות',
    subtitle = 'תשובות לכל השאלות שרציתם לשאול',
    backgroundColor = 'transparent',
    items = [
      { id: '1', question: 'איך מתחילים לעבוד עם המערכת?', answer: 'נרשמים בקלות, בוחרים תבנית עיצוב או מתחילים מאפס, ומעצבים את העמוד בעזרת עורך הבית הוויזואלי הנוח.' },
      { id: '2', question: 'האם ניתן לחבר דומיין מותאם אישית?', answer: 'בהחלט! המערכת תומכת בחיבור דומיין פרטי לכל עמוד, קמפיין או דף נחיתה שתקימו.' },
      { id: '3', question: 'איך עובד הסנכרון עם מערכת ה-CRM?', answer: 'כל פנייה דרך הטפסים בעמוד נשמרת ומוזרמת באופן אוטומטי לכרטיסיות הלידים במערכת ה-CRM.' },
    ],
  } = config;

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ '1': true });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id={anchorId || 'faq'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-1">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const isOpen = openItems[item.id];
            return (
              <div
                key={item.id}
                className={clsx(
                  'border rounded-2xl overflow-hidden transition-all duration-200',
                  isOpen
                    ? 'border-indigo-500/50 bg-slate-900/90 shadow-xl shadow-indigo-500/5'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-right cursor-pointer select-none transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-white pl-4">
                    {item.question}
                  </span>
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300',
                      isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/60 text-sm sm:text-base text-slate-300 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
