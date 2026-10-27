import React from 'react';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors } from './types';
import { OwnerCategoryView } from './OwnerCategorySubView';

interface OwnerDashboardRowsProps {
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  onOpenCategory: (category: OwnerCategoryView) => void;
}

export const OwnerDashboardRows: React.FC<OwnerDashboardRowsProps> = ({
  tenantProfile,
  tenantTheme,
  onOpenCategory
}) => {
  const brandColor = tenantTheme.micColor || tenantTheme.primary || '#F59E0B';
  const category = tenantProfile?.category || 'general';

  // ניסוח דינמי בסגנון ובשפה של הטננט הנוכחי!
  const getBrandingCardTexts = () => {
    switch (category) {
      case 'beauty_clinic':
        return {
          title: 'חדד את המיתוג בוויזואל ובשפה',
          subtitle: 'דיוק שפת הטיפוח, פלטת הוורוד-ניאון, תמונות טיפולים וקול המותג',
          badge: 'סטודיו מיתוג ו-DNA',
          bgImage: '/cloudstore/beauty_hero.webp',
          icon: 'Sparkles',
          gradient: 'from-pink-950/90 via-slate-900/80 to-transparent'
        };
      case 'real_estate':
        return {
          title: 'חדד את המיתוג בוויזואל ובשפה',
          subtitle: 'דיוק פנטהאוזים, גווני הזהב והאבן, תיאורי נכסים ומיצוב פרימיום',
          badge: 'סטודיו מיתוג ו-DNA',
          bgImage: '/cloudstore/realestate_hero.webp',
          icon: 'Building',
          gradient: 'from-amber-950/90 via-slate-900/80 to-transparent'
        };
      case 'legal':
      case 'legal_firm':
        return {
          title: 'חדד את המיתוג בוויזואל ובשפה',
          subtitle: 'דיוק שפת החוזים, דיסקרטיות, גווני כחול עמוק והגנה על זכויות',
          badge: 'סטודיו מיתוג ו-DNA',
          bgImage: '/cloudstore/legal_hero.webp',
          icon: 'Scale',
          gradient: 'from-sky-950/90 via-slate-900/80 to-transparent'
        };
      case 'community':
      case 'education':
        return {
          title: 'חדד את המיתוג בוויזואל ובשפה',
          subtitle: 'דיוק שפת החיבור, ערבות הדדית, תמונות מפגשים וסגנון מזמין',
          badge: 'סטודיו מיתוג ו-DNA',
          bgImage: '/cloudstore/community_hero.webp',
          icon: 'Heart',
          gradient: 'from-emerald-950/90 via-slate-900/80 to-transparent'
        };
      case 'automotive':
        return {
          title: 'חדד את המיתוג בוויזואל ובשפה',
          subtitle: 'דיוק כוחות סוס, מפרטי קרבון, גווני ענבר ואקסקלוסיביות',
          badge: 'סטודיו מיתוג ו-DNA',
          bgImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
          icon: 'Gauge',
          gradient: 'from-amber-950/90 via-slate-900/80 to-transparent'
        };
      case 'saas_productivity':
      default:
        return {
          title: 'חדד את המיתוג בוויזואל ובשפה',
          subtitle: 'דיוק אפס עומס מחשבתי, ניאון ציאן עתידני, מילות כוח והצעת ערך',
          badge: 'סטודיו מיתוג ו-DNA',
          bgImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          icon: 'Palette',
          gradient: 'from-cyan-950/90 via-slate-900/80 to-transparent'
        };
    }
  };

  const getProductCardTexts = () => {
    switch (category) {
      case 'beauty_clinic':
        return {
          title: 'צור / ערוך שירות או מוצר',
          subtitle: 'הגדרת טכנולוגיה, זמני טיפול, מחירון, תוצאות צפויות ושאלות לקפסולה',
          badge: 'שירותים ומוצרים',
          bgImage: '/cloudstore/beauty_glow.webp',
          icon: 'Sparkles',
          gradient: 'from-rose-950/90 via-slate-900/80 to-transparent'
        };
      case 'real_estate':
        return {
          title: 'צור / ערוך שירות או מוצר',
          subtitle: 'הזנת מ״ר, חדרים, מחיר, תנאי תשלום וכרטיסיות מפרט מלאות',
          badge: 'שירותים ומוצרים',
          bgImage: '/cloudstore/realestate_penthouse.webp',
          icon: 'Home',
          gradient: 'from-amber-950/90 via-slate-900/80 to-transparent'
        };
      case 'legal':
      case 'legal_firm':
        return {
          title: 'צור / ערוך שירות או מוצר',
          subtitle: 'הגדרת היקף טיפול, שכר טרחה, שלבי ביצוע ושאלות ייעוץ לקפסולה',
          badge: 'שירותים ומוצרים',
          bgImage: '/cloudstore/legal_contract.webp',
          icon: 'FileText',
          gradient: 'from-blue-950/90 via-slate-900/80 to-transparent'
        };
      case 'community':
      case 'education':
        return {
          title: 'צור / ערוך שירות או מוצר',
          subtitle: 'הגדרת מועדים, מרצים, דמי השתתפות סמליים ותוכנית מפורטת',
          badge: 'שירותים ומוצרים',
          bgImage: '/cloudstore/community_event.webp',
          icon: 'Calendar',
          gradient: 'from-emerald-950/90 via-slate-900/80 to-transparent'
        };
      case 'automotive':
        return {
          title: 'צור / ערוך שירות או מוצר',
          subtitle: 'הגדרת שנתון, ק״מ, כ״ס, מחיר מיוחד וכרטיסיות חבילות ביצועים',
          badge: 'שירותים ומוצרים',
          bgImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
          icon: 'Car',
          gradient: 'from-blue-950/90 via-slate-900/80 to-transparent'
        };
      case 'saas_productivity':
      default:
        return {
          title: 'צור / ערוך שירות או מוצר',
          subtitle: 'הגדרת חבילות Big 3, מחיר מנוי, פירוט מודולים ושאלות עוזר AI',
          badge: 'שירותים ומוצרים',
          bgImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
          icon: 'Package',
          gradient: 'from-cyan-950/90 via-slate-900/80 to-transparent'
        };
    }
  };

  const getInfoCardTexts = () => {
    return {
      title: 'הוסף מידע כללי',
      subtitle: 'עדכון סניפים, דרכי הגעה ב-Waze, חניה, שעות קבלת קהל ופרטי קשר',
      badge: 'מידע ותשתיות',
      bgImage: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
      icon: 'MapPin',
      gradient: 'from-sky-950/90 via-slate-900/80 to-transparent'
    };
  };

  const getArticleEventTexts = () => {
    return {
      title: 'פרסם כתבה / אירוע / תוכן אינפורמטיבי',
      subtitle: 'העלאת דירוג ה-SEO ומנועי AI (GEO) עם הודעה שמופיעה בעוזר',
      badge: 'קידום ו-SEO 2026',
      bgImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
      icon: 'TrendingUp',
      gradient: 'from-indigo-950/90 via-slate-900/80 to-transparent'
    };
  };

  const cards = [
    {
      id: 'branding' as OwnerCategoryView,
      data: getBrandingCardTexts(),
      badgeNumber: 'א'
    },
    {
      id: 'products' as OwnerCategoryView,
      data: getProductCardTexts(),
      badgeNumber: 'ב'
    },
    {
      id: 'info' as OwnerCategoryView,
      data: getInfoCardTexts(),
      badgeNumber: 'ג'
    },
    {
      id: 'article_event' as OwnerCategoryView,
      data: getArticleEventTexts(),
      badgeNumber: 'ד'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2 py-0.5" dir="rtl">
      {cards.map((card) => {
        return (
          <div
            key={card.id}
            onClick={() => onOpenCategory(card.id)}
            className="relative flex-1 w-full rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-400 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-end p-2.5 sm:p-3"
            style={{ minHeight: '76px' }}
          >
            {/* תמונת רקע הירו אותנטית ומסוגננת מהקולקציה / CloudStore */}
            <img 
              src={card.data.bgImage} 
              alt={card.data.title} 
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
            />

            {/* שכבת גרדיאנט חזקה לקריאות מושלמת */}
            <div className={`absolute inset-0 bg-gradient-to-t ${card.data.gradient} via-black/75 to-black/40`} />

            {/* תוכן הכרטיסייה: אות, כותרת מנוסחת היטב ותת-כותרת */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              
              <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                {/* אייקון בורדר זוהר עם אות הכרטיסייה (א, ב, ג, ד) */}
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderColor: '#F59E0B',
                    color: '#F59E0B'
                  }}
                >
                  <span className="font-black text-xs">{card.badgeNumber}</span>
                </div>

                <div className="flex flex-col text-right overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-black text-xs sm:text-[13px] text-white group-hover:text-amber-300 transition-colors truncate">
                      {card.data.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[7.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      {card.data.badge}
                    </span>
                  </div>

                  <p className="text-[9.5px] text-slate-300 line-clamp-1 font-medium leading-tight">
                    {card.data.subtitle}
                  </p>
                </div>
              </div>

              {/* חץ ואינדיקציית כניסה ל-4 הכרטיסים הפנימיים */}
              <div className="flex items-center gap-1 shrink-0 text-amber-400 group-hover:-translate-x-1 transition-transform">
                <span className="text-[9px] font-black hidden sm:inline">4 כרטיסים ◀</span>
                <Icons.ChevronLeft size={16} />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
