import React, { useState } from 'react';
import { Layers, Briefcase, Box, Calendar, Users, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface ProductItem {
  id?: string;
  name: string;
  price?: string;
  description?: string;
  badge?: string;
}

export interface BrandingEcosystemConfig {
  title?: string;
  services?: string[];
  products?: ProductItem[];
  annualEvents?: string[];
  communities?: string[];
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
}

export const BrandingEcosystemSection: React.FC<{ config: BrandingEcosystemConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = config.title || 'מבנה שירותים, מוצרי דגל ואקוסיסטם';
  const services = config.services || ['ייעוץ שיווקי ואסטרטגי', 'בניית דפי נחיתה ומערכות CRM', 'אוטומציות WhatsApp חכמות'];
  const products = config.products || [
    { id: '1', name: 'חבילת צמיחה מלאה', price: '₪2,900/חודש', description: 'כלים, אוטומציה וליווי אישי', badge: 'הכי נמכר' },
    { id: '2', name: 'הטמעת בוט AI', price: '₪1,400', description: 'בוט אוטונומי לשיחות ומכירות' },
  ];
  const annualEvents = config.annualEvents || ['כנס עסקים שנתי', 'סדנת מכירות רבעונית'];
  const communities = config.communities || ['קהילת וואטסאפ לבעלי עסקים VIP'];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Primary Action */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              סל השירותים, מוצרי הפרימיום, אירועים קהילתיים ומודלי תמחור
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {config.secondaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.secondaryButtonAction || 'open_scraper', config.secondaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              {config.secondaryButtonText}
            </button>
          )}

          {config.primaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.primaryButtonAction || 'open_ai_wizard', config.primaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Core Offerings Summary Grid - Rule 7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        {/* Core Services Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-500" />
              שירותי ליבה ({services.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {services.slice(0, 3).map((service, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="font-medium truncate">{service}</span>
              </div>
            ))}
            {services.length > 3 && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                + עוד {services.length - 3} שירותים נוספים
              </span>
            )}
          </div>
        </div>

        {/* Flagship Product Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-blue-500" />
              מוצר דגל מוביל
            </span>
            {products[0]?.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                {products[0].badge}
              </span>
            )}
          </div>
          {products[0] ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-black text-slate-900 dark:text-white">{products[0].name}</span>
                {products[0].price && (
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                    {products[0].price}
                  </span>
                )}
              </div>
              {products[0].description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {products[0].description}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">טרם הוגדר מוצר דגל</p>
          )}
        </div>
      </div>

      {/* Rule 7: Expandable Details */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'הסתר פירוט אקוסיסטם מלא' : 'הצג את כל המוצרים, אירועים שנתיים וקהילות'}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            {/* Products Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Box className="w-4 h-4 text-blue-500" />
                כלל החבילות והמוצרים
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {products.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{p.name}</span>
                      {p.description && <span className="text-[10px] text-slate-500">{p.description}</span>}
                    </div>
                    {p.price && (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono shrink-0 mr-2">
                        {p.price}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Events & Communities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" /> אירועים שנתיים:
                </span>
                {annualEvents.map((ev, idx) => (
                  <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    {ev}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-500" /> קהילות לקוחות:
                </span>
                {communities.map((comm, idx) => (
                  <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    {comm}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
