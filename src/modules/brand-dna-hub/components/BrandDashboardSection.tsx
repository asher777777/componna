import React from 'react';
import { useBrandDna } from '../context/BrandDnaContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Globe, 
  Wand2, 
  Building2, 
  Megaphone,
  ArrowRight
} from 'lucide-react';

interface BrandDashboardSectionProps {
  onOpenWizard: () => void;
  onOpenScraper: () => void;
  onOpenStrategy: () => void;
  onSwitchToTab: (tabId: string) => void;
}

export const BrandDashboardSection: React.FC<BrandDashboardSectionProps> = ({
  onOpenWizard,
  onOpenScraper,
  onOpenStrategy,
  onSwitchToTab
}) => {
  const { brandDna, completenessScore, missingRecommendations } = useBrandDna();

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Top Banner: Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="36" className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="40" cy="40" r="36" 
                  className={`${completenessScore === 100 ? 'text-emerald-500' : 'text-indigo-500'} stroke-current transition-all duration-1000`} 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  fill="transparent" 
                  strokeDasharray={`${completenessScore * 2.26} 226`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">{completenessScore}%</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {completenessScore === 100 ? 'המותג שלך מוכן לפעולה! 🚀' : 'פרופיל ה-DNA בבנייה'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {completenessScore === 100 
                  ? 'כלל הנתונים מוגדרים. ה-AI יכול לייצר עבורך עמודים וטקסטים בדיוק מקסימלי.'
                  : `חסרים לך עדיין מספר פרטים כדי להגיע לדיוק מושלם של מערכות ה-AI.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <button
              onClick={onOpenWizard}
              className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4 text-indigo-100" />
              <span>הפעל אשף AI מהיר</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Proactive Tools & Missing Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Missing Recommendations & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-full">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              מה חסר לדיוק מושלם?
            </h3>
            
            {missingRecommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  כל הנתונים הושלמו במלואם.
                </span>
              </div>
            ) : (
              <ul className="space-y-3">
                {missingRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col: Proactive AI Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-500" />
              כלים אקטיביים ופעולות AI
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={onOpenStrategy}
                className="group flex flex-col items-start text-right p-5 rounded-3xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-950/50 dark:hover:bg-purple-500/10 border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">אסטרטגיית תוכן חכמה</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">צור עמודי שירות ומכירה מלאים מבוססי AI לפי ה-DNA של המותג שלך.</p>
              </button>

              <button 
                onClick={onOpenScraper}
                className="group flex flex-col items-start text-right p-5 rounded-3xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-950/50 dark:hover:bg-blue-500/10 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">שאיבה מאתר קיים</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">הזן כתובת אתר או פייסבוק ותן ל-AI לחלץ את המותג באופן אוטומטי.</p>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: DNA Snapshot Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            מבט על: נתוני הליבה
          </h3>
          <button 
            onClick={() => onSwitchToTab('identity')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
          >
            ערוך הכל ידנית <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => onSwitchToTab('identity')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500/50 transition-colors"
          >
            <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">שם המותג</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {brandDna.identity.companyName || 'לא הוגדר'}
            </div>
          </div>
          <div 
            onClick={() => onSwitchToTab('voice')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500/50 transition-colors"
          >
            <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">שפה וטון</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {brandDna.voice.powerWords.length > 0 ? brandDna.voice.powerWords.slice(0, 2).join(', ') + '...' : 'לא הוגדר'}
            </div>
          </div>
          <div 
            onClick={() => onSwitchToTab('audience')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500/50 transition-colors"
          >
            <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">קהלי יעד</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {brandDna.audience.targetAudiences.length > 0 ? brandDna.audience.targetAudiences[0] : 'לא הוגדר'}
            </div>
          </div>
          <div 
            onClick={() => onSwitchToTab('design')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500/50 transition-colors flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">צבע ראשי</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" dir="ltr">
                {brandDna.designTokens.primaryColor}
              </div>
            </div>
            <div 
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm shrink-0" 
              style={{ backgroundColor: brandDna.designTokens.primaryColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
