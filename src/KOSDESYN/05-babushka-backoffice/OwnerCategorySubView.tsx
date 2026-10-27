import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors, EntityProduct, BranchInfo } from './types';
import { OwnerAiIntentType } from '../../../factory/dynamicPrompts';
import { OwnerEditModal } from './OwnerEditModal';
import { getTerminology, getHumanColorName, getHumanArchetypeName } from '../../../factory/pageTerminologyDictionary';

export type OwnerCategoryView = 'branding' | 'products' | 'info' | 'article_event';

interface OwnerCategorySubViewProps {
  categoryView: OwnerCategoryView;
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  tenantId: string;
  products: EntityProduct[];
  branches: BranchInfo[];
  onBack: () => void;
  onOpenAiStudio: (intent: OwnerAiIntentType) => void;
  onLivePreviewChange?: (tempTheme: Partial<TenantThemeColors> | null) => void;
}

export const OwnerCategorySubView: React.FC<OwnerCategorySubViewProps> = ({
  categoryView,
  tenantProfile,
  tenantTheme,
  tenantId,
  products,
  branches,
  onBack,
  onOpenAiStudio,
  onLivePreviewChange
}) => {
  const brandColor = tenantTheme.micColor || tenantTheme.primary || '#F59E0B';

  // State עבור פתיחת חלון העריכה המלא
  const [activeModalTarget, setActiveModalTarget] = useState<string | null>(null);
  const [activeModalTitle, setActiveModalTitle] = useState<string>('');

  // שליפת ניסוחים מספרית המונחים ההיררכית
  const currentArchetype = tenantProfile?.category || tenantProfile?.archetypeId || 'saas';
  const customDictionary = (tenantProfile as any)?.customDictionary;

  // 1. כרטיסים ייעודיים לכל קטגוריה (בדיוק 4 כרטיסים לכל נושא המגיעים כולם מהקולקציה!)
  const getSubCards = () => {
    switch (categoryView) {
      case 'branding':
        const humanColor = getHumanColorName(brandColor);
        const humanArchetype = getHumanArchetypeName(tenantProfile?.archetypeId || currentArchetype);

        return [
          {
            id: 'brand_palette',
            title: getTerminology('owner_brand_palette_title', currentArchetype, customDictionary),
            subtitle: `גוון ראשי: ${humanColor} • שוק: ${humanArchetype}`,
            icon: 'Palette',
            badge: 'ויזואל',
            actionText: 'ערוך בחלון',
            onAction: () => {
              setActiveModalTarget('brand_palette');
              setActiveModalTitle('עריכת צבעי מיתוג וסגנון ניאון');
            }
          },
          {
            id: 'brand_tagline',
            title: getTerminology('owner_brand_tagline_title', currentArchetype, customDictionary),
            subtitle: tenantProfile?.tagline || getTerminology('owner_brand_tagline_subtitle', currentArchetype, customDictionary),
            icon: 'Sparkles',
            badge: 'שפה ו-DNA',
            actionText: 'ערוך בחלון',
            onAction: () => {
              setActiveModalTarget('brand_tagline');
              setActiveModalTitle('עריכת סלוגן והבטחת המותג');
            }
          },
          {
            id: 'brand_media',
            title: getTerminology('owner_brand_media_title', currentArchetype, customDictionary),
            subtitle: tenantProfile?.welcomeExperience?.type === 'video' 
              ? 'וידאו רקע חווייתי באיכות גבוהה ממאגר KOSCLOUD' 
              : getTerminology('owner_brand_media_subtitle', currentArchetype, customDictionary),
            icon: 'Image',
            badge: 'CloudStore WEBP',
            actionText: 'בחר בחלון',
            onAction: () => {
              setActiveModalTarget('brand_media');
              setActiveModalTitle('בחירת מדיה מ-CloudStore');
            }
          },
          {
            id: 'brand_ai_refine',
            title: getTerminology('owner_brand_ai_title', currentArchetype, customDictionary),
            subtitle: getTerminology('owner_brand_ai_subtitle', currentArchetype, customDictionary),
            icon: 'Wand2',
            badge: 'עוזר AI',
            isAiTrigger: true,
            actionText: 'התייעץ עם AI',
            onAction: () => onOpenAiStudio('REFINE_STORY_AND_VISION')
          }
        ];

      case 'products':
        return [
          {
            id: 'prod_list',
            title: 'רשימת השירותים והמוצרים במלאי',
            subtitle: `${products.length} פריטים פעילים כרגע בקטלוג הטננט`,
            icon: 'Package',
            badge: `${products.length} פריטים`,
            actionText: 'פתח בחלון',
            onAction: () => {
              setActiveModalTarget('prod_list');
              setActiveModalTitle('רשימת פריטים פעילים במלאי');
            }
          },
          {
            id: 'prod_pricing',
            title: 'עדכון מחירים מהיר (בשרת)',
            subtitle: 'שינוי מחירים, זמינות ותגיות מבצע מיידית ללא צורך ב-AI',
            icon: 'DollarSign',
            badge: 'מחירון',
            actionText: 'ערוך בחלון',
            onAction: () => {
              setActiveModalTarget('prod_pricing');
              setActiveModalTitle('עריכת מחירון וזמינות');
            }
          },
          {
            id: 'prod_fast_add',
            title: 'הוספת פריט מהירה ישירה',
            subtitle: 'הזנת שם, מחיר ומפרט קצר ישירות ל-Firestore',
            icon: 'PlusCircle',
            badge: 'טופס ישיר',
            actionText: 'הוסף בחלון',
            onAction: () => {
              setActiveModalTarget('prod_fast_add');
              setActiveModalTitle('הוספת פריט חדש לקולקציה');
            }
          },
          {
            id: 'prod_ai_creator',
            title: 'מחולל שירותים ומפרטים ב-AI',
            subtitle: 'תאר את המוצר בדיבור/טקסט – וה-AI יבנה מפרט 2x2 ושאלות קפסולה',
            icon: 'Bot',
            badge: 'מחולל AI',
            isAiTrigger: true,
            actionText: 'צור עם AI',
            onAction: () => onOpenAiStudio('ADD_PRODUCT_OR_SERVICE')
          }
        ];

      case 'info':
        return [
          {
            id: 'info_hours',
            title: 'שעות פעילות וזמינות',
            subtitle: tenantProfile?.openingHours || 'א-ה: 09:00-19:00',
            icon: 'Clock',
            badge: 'שעות פתיחה',
            actionText: 'ערוך בחלון',
            onAction: () => {
              setActiveModalTarget('info_hours');
              setActiveModalTitle('עריכת שעות פעילות וקבלת קהל');
            }
          },
          {
            id: 'info_branches',
            title: 'סניפים, כתובות וניווט Waze',
            subtitle: `${branches.length} סניפים מוגדרים עם חניה ודרכי הגעה`,
            icon: 'MapPin',
            badge: `${branches.length} סניפים`,
            actionText: 'נהל בחלון',
            onAction: () => {
              setActiveModalTarget('info_branches');
              setActiveModalTitle('סניפים ודרכי הגעה');
            }
          },
          {
            id: 'info_contact',
            title: 'טלפונים ו-WhatsApp ללקוחות',
            subtitle: `טלפון: ${tenantProfile?.phone || 'לא הוגדר'} | WhatsApp: ${tenantProfile?.whatsapp || 'פעיל'}`,
            icon: 'PhoneCall',
            badge: 'יצירת קשר',
            actionText: 'ערוך בחלון',
            onAction: () => {
              setActiveModalTarget('info_contact');
              setActiveModalTitle('עריכת פרטי קשר ו-WhatsApp');
            }
          },
          {
            id: 'info_ai_seo',
            title: 'שדרוג סמנטי ו-SEO במנועי AI',
            subtitle: 'ה-AI יבנה מילות מפתח ממוקדות ו-FAQ Schema לדירוג שיא בגוגל',
            icon: 'TrendingUp',
            badge: 'GEO 2026',
            isAiTrigger: true,
            actionText: 'שדרג ב-AI',
            onAction: () => onOpenAiStudio('BOOST_SEO_AND_DISCOVERY')
          }
        ];

      case 'article_event':
      default:
        return [
          {
            id: 'post_daily_news',
            title: 'פרסום הודעה מיידית בקפסולת הסוכן',
            subtitle: 'הזרקת הודעה קולית וטקסטואלית המקבלת את פני המבקרים היום',
            icon: 'Bell',
            badge: 'הודעת היום',
            actionText: 'פרסם בחלון',
            onAction: () => {
              setActiveModalTarget('post_daily_news');
              setActiveModalTitle('פרסום הודעה יומית לקפסולה');
            }
          },
          {
            id: 'post_event',
            title: 'פרסום אירוע או סדנה קרובה',
            subtitle: 'הגדרת מועד אירוע, מקומות מוגבלים וכפתור הרשמה מהיר',
            icon: 'Calendar',
            badge: 'אירוע קרוב',
            actionText: 'הגדר בחלון',
            onAction: () => {
              setActiveModalTarget('post_event');
              setActiveModalTitle('הגדרת אירוע או סדנה קרובה');
            }
          },
          {
            id: 'post_article',
            title: 'כתבת תוכן ומאמר מקצועי',
            subtitle: 'פרסום מדריך קצר או טיפ מקצועי להעלאת הסמכותיות והאמון',
            icon: 'FileText',
            badge: 'מאמר מקצועי',
            actionText: 'ערוך בחלון',
            onAction: () => {
              setActiveModalTarget('post_article');
              setActiveModalTitle('כתיבת מאמר או תוכן מקצועי');
            }
          },
          {
            id: 'post_ai_writer',
            title: 'כותב תוכן שיווקי ומאמרים ב-AI',
            subtitle: 'ה-AI ינסח עבורך כתבה מרתקת או הודעת בזק מותאמת לקהל היעד',
            icon: 'Sparkles',
            badge: 'קופירייטר AI',
            isAiTrigger: true,
            actionText: 'נסח ב-AI',
            onAction: () => onOpenAiStudio('ADD_DAILY_UPDATE')
          }
        ];
    }
  };

  const cards = getSubCards();

  const getCategoryTitle = () => {
    switch (categoryView) {
      case 'branding': return 'א. חדד את המיתוג בוויזואל ובשפה';
      case 'products': return 'ב. צור / ערוך שירות או מוצר';
      case 'info': return 'ג. הוסף מידע כללי, שעות וסניפים';
      case 'article_event': return 'ד. פרסם כתבה / אירוע / תוכן אינפורמטיבי';
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden animate-fadeIn font-sans select-none relative" dir="rtl">
      
      {/* 🧭 Header עליון של תת-המסך */}
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-md"
            style={{ backgroundColor: `${brandColor}20`, border: `1px solid ${brandColor}` }}
          >
            <Icons.Layers size={14} style={{ color: brandColor }} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white">{getCategoryTitle()}</h3>
            <span className="text-[9px] text-slate-400">בחר כרטיס לעריכה בחלון ייעודי או ייעוץ AI</span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors flex items-center gap-1 active:scale-95"
        >
          <span>חזרה</span>
          <Icons.ChevronLeft size={13} />
        </button>
      </div>

      {/* 🎴 4 הכרטיסים של תת-הקטגוריה */}
      <div className="flex-1 flex flex-col justify-between gap-2 py-0.5 overflow-hidden my-auto">
        {cards.map((c) => {
          const IconCmp = (Icons as any)[c.icon] || Icons.Sparkles;

          return (
            <div
              key={c.id}
              onClick={c.onAction}
              className={`relative flex-1 w-full rounded-2xl overflow-hidden border p-2.5 sm:p-3 flex flex-col justify-between shadow-xl transition-all cursor-pointer group ${
                c.isAiTrigger
                  ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border-amber-500/40 hover:border-amber-400'
                  : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40'
              }`}
              style={{ minHeight: '74px' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: c.isAiTrigger ? 'rgba(245, 158, 11, 0.2)' : `${brandColor}20`,
                      color: c.isAiTrigger ? '#F59E0B' : brandColor,
                      border: `1px solid ${c.isAiTrigger ? '#F59E0B' : brandColor}`
                    }}
                  >
                    <IconCmp size={14} />
                  </div>

                  <div className="flex flex-col text-right overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-black text-xs text-white truncate group-hover:text-amber-300 transition-colors">
                        {c.title}
                      </span>
                      <span 
                        className="px-1.5 py-0.2 rounded text-[7.5px] font-bold shrink-0"
                        style={{
                          backgroundColor: c.isAiTrigger ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: c.isAiTrigger ? '#F59E0B' : '#94A3B8'
                        }}
                      >
                        {c.badge}
                      </span>
                    </div>

                    <p className="text-[9.5px] text-slate-300 line-clamp-1 font-medium">
                      {c.subtitle}
                    </p>
                  </div>
                </div>

                {/* כפתור הפעולה (פותח חלון מלא או AI) */}
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 transition-all flex items-center gap-1 shadow group-hover:scale-105 active:scale-95 ${
                    c.isAiTrigger
                      ? 'bg-amber-500 text-black shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
                  }`}
                >
                  <span>{c.actionText}</span>
                  {c.isAiTrigger ? <Icons.Sparkles size={11} /> : <Icons.ExternalLink size={11} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🖼️ חלון עריכה ייעודי ומלא (נפתח בחלון משלו!) */}
      <OwnerEditModal
        isOpen={Boolean(activeModalTarget)}
        onClose={() => setActiveModalTarget(null)}
        targetId={activeModalTarget}
        categoryTitle={activeModalTitle}
        tenantProfile={tenantProfile}
        tenantTheme={tenantTheme}
        tenantId={tenantId}
        products={products}
        branches={branches}
        onOpenAiAssist={() => {
          setActiveModalTarget(null);
          onOpenAiStudio('REFINE_STORY_AND_VISION');
        }}
        onLivePreviewChange={onLivePreviewChange}
      />

    </div>
  );
};
