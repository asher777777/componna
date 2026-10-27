import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Wifi,
  Battery,
  ChevronLeft,
  Sparkles,
  Users,
  Layout,
  FileText,
  CreditCard,
  Layers
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem } from '../../types';

export const MobileSimulatorLayout: React.FC = () => {
  const {
    filteredModules,
    moduleDocCounts,
    metrics,
    mobileDevice,
    setMobileDevice,
    selectedCategory,
    setSelectedCategory,
    theme
  } = useControlCenter();

  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [currentTime] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  return (
    <div className="flex flex-col items-center justify-center py-4">
      
      {/* Device Viewport Selector Bar (Desktop control) */}
      <div className={`mb-6 flex items-center gap-2 p-1.5 rounded-2xl shadow-md border transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900/90 border-slate-800 shadow-lg'
      }`}>
        <span className={`text-[11px] px-2 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          רזולוציית מובייל:
        </span>
        <button
          onClick={() => setMobileDevice('iphone')}
          className={`px-3 py-1 text-xs rounded-xl transition cursor-pointer ${
            mobileDevice === 'iphone'
              ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          iPhone 16 Pro Max (מסגרת)
        </button>
        <button
          onClick={() => setMobileDevice('android')}
          className={`px-3 py-1 text-xs rounded-xl transition cursor-pointer ${
            mobileDevice === 'android'
              ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          Android Flat (מסגרת)
        </button>
        <button
          onClick={() => setMobileDevice('fluid')}
          className={`px-3 py-1 text-xs rounded-xl transition cursor-pointer ${
            mobileDevice === 'fluid'
              ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          מובייל רחב (Canvas)
        </button>
      </div>

      {/* Simulator Container */}
      <div
        className={`relative transition-all duration-300 ${
          mobileDevice === 'fluid'
            ? 'w-full max-w-md'
            : mobileDevice === 'android'
            ? 'w-[390px] h-[780px] rounded-[36px] p-3.5 bg-slate-800 border-4 border-slate-700 shadow-2xl'
            : 'w-[400px] h-[820px] rounded-[52px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10'
        }`}
      >
        {/* Device Inner Screen */}
        <div className={`w-full h-full flex flex-col justify-between overflow-hidden relative transition-colors ${
          isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0a0a0f] text-white'
        } ${
          mobileDevice === 'fluid' ? 'rounded-3xl border border-slate-200' : 'rounded-[42px]'
        }`}>
          
          {/* Mobile Status Bar with Dynamic Island */}
          {mobileDevice !== 'fluid' && (
            <div className={`pt-3 px-6 pb-2 flex items-center justify-between text-xs shrink-0 select-none ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <span className="font-semibold text-[13px] tracking-tight">{currentTime}</span>
              
              {/* Dynamic Island */}
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 border border-slate-800/80 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-slate-400 font-mono">Kosun</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Mobile Top Header */}
          <div className={`p-4 border-b shrink-0 backdrop-blur-md ${
            isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  C
                </div>
                <div>
                  <h3 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>לוח בקרה נייד</h3>
                  <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>מרכז השליטה במגע</p>
                </div>
              </div>

              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                {metrics.activeModulesCount} פעילים
              </span>
            </div>

            {/* Quick Metrics Bar in Mobile */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className={`p-2 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>לידים</div>
                <div className="font-bold text-emerald-600 font-mono text-sm">{metrics.totalLeadsCount}</div>
              </div>
              <div className={`p-2 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>עמודים</div>
                <div className="font-bold text-blue-600 font-mono text-sm">{metrics.totalPagesCount}</div>
              </div>
              <div className={`p-2 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>עסקאות</div>
                <div className="font-bold text-indigo-600 font-mono text-sm">{metrics.totalTransactionsCount}</div>
              </div>
            </div>
          </div>

          {/* Mobile Scrollable Module List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
            {filteredModules.map((mod: ControlCenterModuleItem) => {
              const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

              return (
                <div
                  key={mod.id}
                  onClick={() => navigate(mod.route)}
                  className={`active:scale-[0.98] transition p-3 rounded-2xl flex items-center justify-between cursor-pointer group border ${
                    isLight
                      ? 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${mod.colorScheme.from} ${mod.colorScheme.to} flex items-center justify-center text-white shrink-0 shadow-md`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className={`font-bold text-xs transition truncate ${
                        isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-300'
                      }`}>
                        {mod.shortTitle}
                      </div>
                      <div className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {docCount !== undefined ? `${docCount} מסמכים במסד` : mod.categoryTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-semibold text-indigo-600">פתח</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <div className={`p-2 border-t flex items-center justify-around text-[10px] shrink-0 ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-950/90 border-slate-800 text-slate-400'
          }`}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex flex-col items-center gap-0.5 p-1 ${selectedCategory === 'all' ? 'text-indigo-600 font-bold' : ''}`}
            >
              <Layers className="w-4 h-4" />
              <span>הכל</span>
            </button>
            <button
              onClick={() => setSelectedCategory('marketing')}
              className={`flex flex-col items-center gap-0.5 p-1 ${selectedCategory === 'marketing' ? 'text-blue-600 font-bold' : ''}`}
            >
              <Layout className="w-4 h-4" />
              <span>שיווק</span>
            </button>
            <button
              onClick={() => setSelectedCategory('crm')}
              className={`flex flex-col items-center gap-0.5 p-1 ${selectedCategory === 'crm' ? 'text-emerald-600 font-bold' : ''}`}
            >
              <Users className="w-4 h-4" />
              <span>CRM</span>
            </button>
            <button
              onClick={() => setSelectedCategory('finance')}
              className={`flex flex-col items-center gap-0.5 p-1 ${selectedCategory === 'finance' ? 'text-indigo-600 font-bold' : ''}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>סליקה</span>
            </button>
          </div>

          {/* Bottom Home Indicator Bar (iPhone) */}
          {mobileDevice === 'iphone' && (
            <div className="pb-1.5 flex justify-center shrink-0">
              <div className={`w-32 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-600'}`} />
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
