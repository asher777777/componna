import React, { useState } from 'react';
import { 
  ShoppingBag, Sparkles, Check, ArrowLeft, Zap, Shield, 
  Film, Cpu, TrendingUp, Layout, Image, PlayCircle, Database, CheckCircle2 
} from 'lucide-react';
import { useClientPlatform } from '../context/ClientPlatformContext';
import { MASTER_AVAILABLE_MODULES } from '../config';

interface ModuleMarketplaceItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  features: string[];
  priceMonthly: number;
  icon: any;
  color: string;
}

const MARKETPLACE_MODULES: ModuleMarketplaceItem[] = [
  {
    id: 'page-builder',
    name: 'יוצר עמודים ואתרים (Page Builder)',
    badge: 'בסיס המערכת',
    description: 'מערכת ויזואלית מתקדמת לבנייה, עריכה, עיצוב וסידור דפי נחיתה ואתרים מלאים בסאב-דומיין שלך.',
    features: ['עורך Live Visual Drag & Drop', 'התאמה מלאה למובייל ודסקטופ', 'סנכרון מיידי לעמוד הבית', 'טפסי איסוף לידים'],
    priceMonthly: 129,
    icon: Layout,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'crm-analytics',
    name: 'אנליטיקה ו-CRM מתקדם (360 Insights)',
    badge: 'הכי פופולרי',
    description: 'כרטיס לקוח 360 מועשר ב-AI, דשבורד מכירות, מעקב המרות בזמן אמת, ייצוא לאקסל וחיבור לוואטסאפ.',
    features: ['פילוח לקוחות חכם', 'תובנות AI לכל ליד', 'חיבור ישיר לוואטסאפ', 'גרפים אינטראקטיביים'],
    priceMonthly: 99,
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'video-producer-studio',
    name: 'סטודיו וידאו ואווטאר (HeyGen & Studio)',
    badge: 'AI מתקדם',
    description: 'הפקת סרטוני שיווק עם דמויות אווטאר מדברות ב-HeyGen, מחולל תסריטים ב-Gemini וטלפרומפטר.',
    features: ['הפקת אווטאר מותאם אישית', 'יצירת תסריטים אוטומטית', 'ציר סצנות ועריכה', 'הורדה ב-4K'],
    priceMonthly: 179,
    icon: Film,
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'media-gallery-hub',
    name: 'מנהל מדיה וגלריה (Cloud Storage)',
    badge: 'ניהול נכסים',
    description: 'אחסון ענן מהיר ומאובטח לתמונות וסרטונים, המרת פורמטים וחלוקה לתיקיות מותאמות.',
    features: ['אחסון מהיר ללא הגבלה', 'סנכרון אוטומטי לכל הדפים', 'חיתוך ודחיסה חכמה', 'ניהול תיקיות פרויקטים'],
    priceMonthly: 49,
    icon: Image,
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'flow-player-engine',
    name: 'נגן וידאו אינטראקטיבי (Interactive Flow)',
    badge: 'אינטראקטיבי',
    description: 'נגן וידאו המאפשר לצופה ללחוץ על כפתורים, לבחור מסלולים ולמלא טפסים ישירות בתוך הווידאו.',
    features: ['כפתורי הנעה לפעולה בווידאו', 'משפכי בחירה אינטראקטיביים', 'מעקב זמני צפייה', 'איסוף לידים בווידאו'],
    priceMonthly: 89,
    icon: PlayCircle,
    color: 'from-rose-600 to-red-600',
  },
  {
    id: 'auth-portal',
    name: 'פורטל אימות וכניסת משתמשים',
    badge: 'אבטחה וניהול',
    description: 'מערכת התחברות מאובטחת ללקוחות שלך עם Google Login, אימות SMS וניהול הרשאות.',
    features: ['התחברות ב-Google ו-SMS', 'אזור אישי ללקוחות הקצה', 'ניהול הרשאות גישה', 'הצפנה מלאה'],
    priceMonthly: 69,
    icon: Shield,
    color: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'db-connector-hub',
    name: 'מרכז חיבור וסנכרון DB (Universal Connector)',
    badge: 'למפתחים וארגונים',
    description: 'סנכרון ישיר של נתוני הסאב-דומיין למסדי נתונים חיצוניים ו-API צד שלישי.',
    features: ['סנכרון דו-כיווני בזמן אמת', 'חיבור ל-Webhooks חיצוניים', 'גיבוי אוטומטי', 'תמיכה ב-JSON Schema'],
    priceMonthly: 119,
    icon: Cpu,
    color: 'from-indigo-600 to-violet-600',
  },
];

export const ClientAddonMarketplaceView: React.FC = () => {
  const { settings, toggleModule, setActiveRoute } = useClientPlatform();
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [successModalModule, setSuccessModalModule] = useState<ModuleMarketplaceItem | null>(null);

  const handleInstantUpgrade = async (item: ModuleMarketplaceItem) => {
    setUpgradingId(item.id);
    // Simulate instantaneous upgrade & tenant activation
    setTimeout(() => {
      toggleModule(item.id, true);
      setUpgradingId(null);
      setSuccessModalModule(item);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>חנות רכיבים ושדרוגים (SaaS Marketplace)</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            הרחב את היכולות של הסאב-דומיין שלך
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            כל רכיב מופעל ישירות בסביבה המבודדת של <span className="font-mono font-bold text-amber-400">{settings.clientName}</span> ומסונכרן למסד הנתונים הייעודי שלך.
          </p>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MARKETPLACE_MODULES.map((item) => {
          const isEnabled = Boolean(settings.modules[item.id]?.isEnabled);
          const Icon = item.icon;
          const isUpgrading = upgradingId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl ${
                isEnabled
                  ? 'border-emerald-500/40 bg-slate-900/95 ring-1 ring-emerald-500/20'
                  : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="space-y-4">
                {/* Top Icon & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${item.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                    {isEnabled && (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        פעיל בחשבונך
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Name & Description */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 block">מה כולל הרכיב:</span>
                  {item.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Price & Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xl font-black text-white">{item.priceMonthly} ₪</span>
                  <span className="text-[10px] text-slate-400 block">לחודש</span>
                </div>

                {isEnabled ? (
                  <button
                    onClick={() => setActiveRoute(item.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition"
                  >
                    <span>פתח רכיב</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstantUpgrade(item)}
                    disabled={isUpgrading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition transform active:scale-95 disabled:opacity-50"
                  >
                    {isUpgrading ? (
                      <span>מפעיל רכיב...</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>שדרג והפעל עכשיו</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Success Notification Modal */}
      {successModalModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">
                הרכיב הופעל בהצלחה! 🎉
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                הרכיב <span className="font-bold text-amber-400">{successModalModule.name}</span> הוטמע בסביבת העבודה של הסאב-דומיין שלך ונוסף לתפריט הניהול.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  const targetId = successModalModule.id;
                  setSuccessModalModule(null);
                  setActiveRoute(targetId);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition"
              >
                כניסה לרכיב החדש עכשיו
              </button>
              <button
                onClick={() => setSuccessModalModule(null)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                המשך בחנות
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
