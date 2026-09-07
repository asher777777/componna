import React from 'react';
import { PricingSectionConfig } from '../../types/sectionConfigs';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

export const PricingSection: React.FC<{ config: PricingSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'תוכניות ומחירים מותאמים',
    subtitle = 'בחרו את החבילה המתאימה ביותר לצרכים שלכם',
    backgroundColor = 'transparent',
    packages = [
      {
        id: '1',
        name: 'בסיסי',
        price: '₪99',
        period: '/ חודש',
        description: 'למשתמשים יחידים ומתחילים',
        features: ['עד 5 דפים מעוצבים', 'חיבור דומיין מותאם', 'טפסי לידים בסיסיים', 'תמיכה באימייל'],
        buttonText: 'התחל בחינם',
        buttonUrl: '#',
      },
      {
        id: '2',
        name: 'מקצועי (Pro)',
        price: '₪249',
        period: '/ חודש',
        description: 'לקהילות, מוסדות ועסקים בצמיחה',
        isFeatured: true,
        badge: 'הכי משתלם',
        features: ['דפים ועמודים ללא הגבלה', 'סנכרון מלא למערכת CRM', 'עוזר AI ליצירת תוכן ותמונות', 'תמיכת VIP 24/7 בוואטסאפ'],
        buttonText: 'בחר מסלול Pro',
        buttonUrl: '#',
      },
      {
        id: '3',
        name: 'ארגוני (Enterprise)',
        price: '₪590',
        period: '/ חודש',
        description: 'לארגונים ורשתות עם דרישות מתקדמות',
        features: ['פתרון מותאם אישית (Custom SLA)', 'מנהל חשבון אישי ייעודי', 'אינטגרציות API מתקדמות', 'הדרכות צוות פרונטליות'],
        buttonText: 'צור קשר להתאמה',
        buttonUrl: '#',
      },
    ],
  } = config;

  return (
    <section
      id={anchorId || 'pricing'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={clsx(
                'relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-md',
                pkg.isFeatured
                  ? 'bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 md:-translate-y-3 z-10'
                  : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700'
              )}
            >
              {pkg.badge && (
                <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-black shadow-lg">
                  {pkg.badge}
                </div>
              )}

              <div className="flex flex-col gap-6 text-right">
                <div>
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  {pkg.description && <p className="text-xs text-slate-400 mt-1">{pkg.description}</p>}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{pkg.price}</span>
                  {pkg.period && <span className="text-xs text-slate-400">{pkg.period}</span>}
                </div>

                <div className="h-px bg-slate-800" />

                <div className="flex flex-col gap-3">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href={pkg.buttonUrl || '#'}
                  className={clsx(
                    'w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
                    pkg.isFeatured
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  )}
                >
                  <span>{pkg.buttonText || 'בחר חבילה'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
