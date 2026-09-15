import React, { useState } from 'react';
import { FaqSectionConfig } from '../../types/sectionConfigs';
import { ChevronDown, Search, Sparkles, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const FaqSection: React.FC<{ config: FaqSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'שאלות ותשובות נפוצות',
    subtitle = 'כל מה שחשוב לדעת',
    showSearchBar = true,
    showContactCard = true,
    whatsappContact,
    backgroundColor = 'transparent',
    items = [],
  } = config;

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id={anchorId || 'faq'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
        </div>

        {/* Quick Search Filter */}
        {showSearchBar && (
          <div className="relative max-w-xl mx-auto w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש שאלה או מילת מפתח..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl backdrop-blur-md"
            />
          </div>
        )}

        {/* Notion-Style Clean Accordion Items */}
        <div className="flex flex-col gap-3">
          {filteredItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id || index}
                className={clsx(
                  'rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md',
                  isOpen
                    ? 'bg-slate-900/90 border-indigo-500/40 shadow-xl'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white"
                >
                  <span>{item.question}</span>
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300',
                      isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-800/60 pt-4 animate-in slide-in-from-top-2">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Direct Contact Card */}
        {showContactCard && (
          <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div>
              <h4 className="text-base font-bold text-white">יש לכם שאלה שלא מופיעה כאן?</h4>
              <p className="text-xs text-slate-400 mt-0.5">הצוות המקצועי שלנו זמין עבורכם לכל מענה ישיר.</p>
            </div>
            {whatsappContact && (
              <a
                href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>שאלו אותנו בוואטסאפ</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
