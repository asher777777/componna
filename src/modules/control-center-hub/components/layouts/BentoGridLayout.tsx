import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layout,
  ShoppingBag,
  Users,
  BarChart3,
  MessageSquare,
  CreditCard,
  Film,
  Image,
  PlayCircle,
  Layers,
  ShieldCheck,
  Smartphone,
  Info
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem } from '../../types';

export const BentoGridLayout: React.FC = () => {
  const { filteredModules, moduleDocCounts, setSelectedModule, metrics } = useControlCenter();
  const navigate = useNavigate();

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout': return Layout;
      case 'FileText': return FileText;
      case 'ShoppingBag': return ShoppingBag;
      case 'Users': return Users;
      case 'BarChart3': return BarChart3;
      case 'MessageSquare': return MessageSquare;
      case 'CreditCard': return CreditCard;
      case 'Film': return Film;
      case 'Image': return Image;
      case 'PlayCircle': return PlayCircle;
      case 'Sparkles': return Sparkles;
      case 'Database': return Database;
      case 'Layers': return Layers;
      case 'ShieldCheck': return ShieldCheck;
      case 'Smartphone': return Smartphone;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bento Highlight Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Highlight 1: Core System Overview */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl group hover:border-indigo-500/50 transition">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-300 tracking-wider uppercase font-mono">
                  מרכז הבקרה הפעיל
                </span>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                סנכרון חי: {metrics.lastSyncTime || 'זה עתה'}
              </span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5">
                כל רכיבי המערכת בממשק מודולרי אחיד
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                שליטה מלאה בכל 15 המודולים של Comona, ללא תלות בסיידבר, עם קריאה ישירה של נתוני אמת מ-Firestore ובידוד ארכיטקטוני קפדני.
              </p>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
                <div className="text-[11px] text-slate-400">לידים במסד</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{metrics.totalLeadsCount}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
                <div className="text-[11px] text-slate-400">עמודי נחיתה</div>
                <div className="text-lg font-bold text-blue-400 font-mono">{metrics.totalPagesCount}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
                <div className="text-[11px] text-slate-400">טפסים פעילים</div>
                <div className="text-lg font-bold text-amber-400 font-mono">{metrics.totalFormsCount}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
                <div className="text-[11px] text-slate-400">עסקאות קשר</div>
                <div className="text-lg font-bold text-indigo-400 font-mono">{metrics.totalTransactionsCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight 2: Architecture & Contracts Box */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">תקן איכות ובידוד</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              חוק הספגטי: שמור
            </span>
          </div>

          <div className="space-y-2 py-3">
            <div className="text-sm font-bold text-white">0 ייבויי UI צולבים</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              הרכיב מפעיל פונקציונליות מודולרית באמצעות חוזים גלובליים, EventBus, ו-Capabilities ללא שום שכפול קוד.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-[11px] space-y-1 font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">מודולים פעילים:</span>
              <span className="text-indigo-400">{filteredModules.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">שכבות למודול:</span>
              <span className="text-emerald-400">11 שכבות</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">תצוגה שולחנית:</span>
              <span className="text-sky-400">ללא סיידבר</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Bento Grid of Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredModules.map((mod: ControlCenterModuleItem) => {
          const Icon = getModuleIcon(mod.iconName);
          const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

          return (
            <div
              key={mod.id}
              className={`bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${mod.colorScheme.bgHover} group relative overflow-hidden`}
            >
              {/* Top Row: Icon + Badge + Info Trigger */}
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${mod.colorScheme.from} ${mod.colorScheme.to} flex items-center justify-center text-white shadow-lg ${mod.colorScheme.glow} ring-1 ring-white/10 group-hover:rotate-3 transition`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mod.badge && (
                      <span className="text-[10px] bg-slate-800/90 text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded-full font-medium">
                        {mod.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModule(mod);
                      }}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition"
                      title="פרטים טכניים על הרכיב"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-white text-sm leading-snug mb-1 group-hover:text-indigo-300 transition">
                  {mod.shortTitle}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-3">
                  {mod.description}
                </p>

                {/* Features Mini Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {mod.features.slice(0, 2).map((feat, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-950/60 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-800/80 truncate max-w-[140px]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Real Data Count & Deep Launch */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between mt-auto">
                {/* Live Count */}
                <div className="text-[11px]">
                  {docCount !== undefined ? (
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <span className="font-bold text-white">{docCount}</span>
                      <span>פריטים</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[10px] font-mono">מוכן לשימוש</span>
                  )}
                </div>

                {/* Direct Clean Launch Button (Without Dev Sidebar) */}
                <button
                  onClick={() => navigate(mod.route)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white transition shadow-sm group-hover:shadow-indigo-600/30 cursor-pointer"
                  title={`כניסה ישירה אל ${mod.name} ללא סיידבר`}
                >
                  <span>{mod.actionLabel || 'כניסה'}</span>
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
