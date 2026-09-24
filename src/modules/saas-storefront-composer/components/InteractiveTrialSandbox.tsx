import React from 'react';
import { 
  Sparkles, ShoppingCart, ArrowRight, CheckCircle, Clock, 
  Flame, ShieldCheck, X, Zap
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';

// Import standalone previews
import { VideoProducerStudioView } from '../../video-producer-studio';
import { CrmAnalyticsStandaloneView } from '../../crm-analytics';
import { PageBuilderStandaloneView } from '../../page-builder';
import { SmartFormBuilderStandaloneView } from '../../smart-form-builder';
import { MediaGalleryHubStandaloneView } from '../../media-gallery-hub';
import { WhatsAppGreenApiStandaloneView } from '../../whatsapp-green-api-hub';
import { KesherPaymentsStandaloneView } from '../../kesher-payments-hub';
import { CrmGroupsHubStandaloneView } from '../../crm-groups-hub';
import { BrandDnaHubStandaloneView } from '../../brand-dna-hub';
import { FlowPlayerEngineStandaloneView } from '../../flow-player-engine';

export const InteractiveTrialSandbox: React.FC = () => {
  const { 
    trialActiveModule, 
    endTrial, 
    endTrialAndQuickBuy, 
    toggleCartItem, 
    isInCart, 
    settings,
    billingPlan 
  } = useStorefront();

  if (!trialActiveModule) return null;

  const currentPrice = billingPlan === 'annual' 
    ? trialActiveModule.annualMonthlyPrice 
    : trialActiveModule.monthlyPrice;

  const inCart = isInCart(trialActiveModule.id);

  const renderModuleLiveDemo = () => {
    switch (trialActiveModule.id) {
      case 'crm-analytics':
        return <CrmAnalyticsStandaloneView />;
      case 'page-builder':
        return <PageBuilderStandaloneView />;
      case 'smart-form-builder':
        return <SmartFormBuilderStandaloneView />;
      case 'media-gallery-hub':
        return <MediaGalleryHubStandaloneView />;
      case 'video-producer-studio':
        return <VideoProducerStudioView />;
      case 'whatsapp-green-api-hub':
        return <WhatsAppGreenApiStandaloneView />;
      case 'kesher-payments-hub':
        return <KesherPaymentsStandaloneView />;
      case 'crm-groups-hub':
        return <CrmGroupsHubStandaloneView />;
      case 'brand-dna-hub':
        return <BrandDnaHubStandaloneView />;
      case 'flow-player-engine':
        return <FlowPlayerEngineStandaloneView />;
      default:
        return (
          <div className="p-12 text-center text-gray-500">
            תצוגת הדגמה חיה של רכיב {trialActiveModule.name}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col" dir="rtl">
      
      {/* High-Converting Floating Top Bar (טריגר לקנייה מהירה) */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 px-4 py-3 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        
        {/* Left: Trial Status & Module Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={endTrial}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition"
          >
            <X className="w-4 h-4" />
            <span>יציאה מהדמו</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              התנסות חיה פעילה (Live Sandbox)
            </span>
            <span className="text-xs font-semibold text-gray-200 hidden sm:inline">
              | {trialActiveModule.name}
            </span>
          </div>
        </div>

        {/* Center: Urgency / Value Proposition Banner */}
        <div className="hidden lg:flex items-center gap-2 bg-indigo-900/50 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs text-indigo-200">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>אהבת את הרכיב? השינויים שביצעת יישמרו ישירות לסאב-דומיין שלך ברכישה!</span>
        </div>

        {/* Right: Quick Buy & Add to Cart Triggers */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-white">
              {currentPrice} {settings.currencySymbol}
              <span className="text-[10px] text-gray-400 font-normal"> / חודש</span>
            </div>
          </div>

          <button
            onClick={() => toggleCartItem(trialActiveModule)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
              inCart
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-gray-200 hover:bg-slate-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{inCart ? '✓ נוסף לעגלה' : 'הוסף לעגלה'}</span>
          </button>

          <button
            onClick={() => endTrialAndQuickBuy(trialActiveModule)}
            className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl shadow-lg shadow-indigo-500/30 transition transform active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>רכוש עכשיו והתקן בסאב-דומיין</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Demo Container */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {renderModuleLiveDemo()}
      </main>

      {/* Floating Bottom Conversion Trigger Banner (Sticky) */}
      <footer className="bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-lg text-xs">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>מוגן תחת הסאב-דומיין שלך עם שמירת נתונים ייעודית ומבודדת ב-Firestore</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => endTrialAndQuickBuy(trialActiveModule)}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>מעבר לקופה ובחירת סאב-דומיין</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

    </div>
  );
};
