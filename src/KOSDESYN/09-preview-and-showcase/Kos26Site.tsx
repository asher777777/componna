import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { KosCognitivePortal } from './components/action-portal/cognitive-portal/KosCognitivePortal';
import { MARKET_BLUEPRINTS } from './factory/marketBlueprints';

interface Kos26SiteProps {
  onBackToApp?: () => void;
}

/**
 * 🌟 KOS26 - אתר ואפליקציית הפורטל הקוגניטיבי המלא של KOSUN
 * תומך כעת בבחירת טננט דינמית (URL Parameter: ?tenant=... או בורר שווקים חי בראש המסך)
 */
export const Kos26Site: React.FC<Kos26SiteProps> = ({ onBackToApp }) => {
  const getInitialTenant = (): string => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tenant');
      if (t) return t;
    }
    return 'kosun';
  };

  const [activeTenant, setActiveTenant] = useState<string>(getInitialTenant);
  const [isMarketSelectorOpen, setIsMarketSelectorOpen] = useState(false);

  // רשימת טננטים ושווקים זמינים במערכת
  const availableTenants = [
    { id: 'kosun', name: 'KOSUN AI • Interactions into Assets', market: 'SaaS & Productivity', color: '#00F0FF' },
    { id: 'turbo_motors', name: 'טורבו מוטורס • סוכנות רכבי יוקרה וספורט', market: 'Automotive VIP', color: '#F59E0B' },
    { id: 'kesem', name: 'קסם של קהילה • מוסדות וקהילות', market: 'Community', color: '#10B981' },
    { id: 'rachelgal', name: 'רחלי גל • קוסמטיקה ואסתטיקה', market: 'Beauty & Clinic', color: '#EC4899' },
    { id: 'mlea', name: 'בית מדרש לאה • מרכז לימוד', market: 'Education', color: '#8B5CF6' },
  ];

  const currentTenantMeta = availableTenants.find(t => t.id === activeTenant) || {
    id: activeTenant,
    name: activeTenant,
    market: 'Custom Tenant',
    color: '#00F0FF'
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden"
      dir="rtl"
    >
      {/* 🌌 רקע זוהר ניאון עתידני של KOSUN */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25 -z-10"
        style={{ background: `radial-gradient(circle, ${currentTenantMeta.color} 0%, rgba(0,0,0,0) 70%)` }}
      />
      <div 
        className="fixed bottom-0 right-10 w-[500px] h-[300px] rounded-full blur-[160px] pointer-events-none opacity-20 -z-10"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, rgba(0,0,0,0) 70%)' }}
      />

      {/* 🧭 שורת כותרת וניווט קומפקטית עליונה עם בורר שווקים חי */}
      <div className="w-full max-w-md px-4 pt-3 pb-1 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-colors"
            style={{ 
              backgroundColor: `${currentTenantMeta.color}15`, 
              border: `1.5px solid ${currentTenantMeta.color}` 
            }}
          >
            <span className="font-mono font-black text-sm" style={{ color: currentTenantMeta.color }}>K</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white tracking-wider font-['Orbitron',sans-serif]">
                KOSUN AI
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                2026
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block font-medium truncate max-w-[160px]">
              {currentTenantMeta.market}
            </span>
          </div>
        </div>

        {/* בורר שווקים / טננטים מהיר וכפתור חזרה */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMarketSelectorOpen(!isMarketSelectorOpen)}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-white bg-slate-900/90 hover:bg-slate-800 border border-white/10 transition-colors shadow flex items-center gap-1"
            title="החלף שוק / טננט חי"
          >
            <Icons.Layers size={13} style={{ color: currentTenantMeta.color }} />
            <span>החלף שוק</span>
            <Icons.ChevronDown size={11} className={isMarketSelectorOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-white/10 transition-colors shadow"
            >
              חזרה לאפליקציה ◀
            </button>
          )}
        </div>
      </div>

      {/* דרופ-דאון בורר שווקים וטננטים */}
      {isMarketSelectorOpen && (
        <div className="w-full max-w-md px-4 z-30 mb-1 animate-fadeIn">
          <div className="p-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block px-2 mb-1">
              בחר טננט חי מהקולקציה לבדיקה:
            </span>
            {availableTenants.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTenant(t.id);
                  setIsMarketSelectorOpen(false);
                }}
                className={`w-full text-right p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTenant === t.id
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span>{t.name}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">{t.market}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 📱 הקומפוננטה המודולרית של KOSUN2026 ביחס 9:16 המדויק */}
      <div className="w-full max-w-md flex-1 p-2 flex items-center justify-center my-auto">
        <div className="w-full h-[740px] max-h-[92vh] rounded-[38px] overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.22)] relative bg-slate-950 flex flex-col">
          <KosCognitivePortal 
            key={activeTenant}
            tenantId={activeTenant} 
            targetProject="comona" 
            defaultAudience="guest" 
          />
        </div>
      </div>

    </div>
  );
};
