import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Sparkles,
  Database,
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
  Info,
  UserPlus,
  Key,
  Play
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem } from '../../types';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../../core/contracts';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';

export const BentoGridLayout: React.FC = () => {
  const {
    filteredModules,
    moduleDocCounts,
    setSelectedModule,
    theme,
    setQuickLeadModalOpen,
    setQuickWhatsAppModalOpen
  } = useControlCenter();

  const { getCapability } = useHostCapabilities();
  const { openConnectorModal } = useSystemConnection();
  const navigate = useNavigate();
  const isLight = theme === 'light';

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
      {/* Main Bento Grid of Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredModules.map((mod: ControlCenterModuleItem) => {
          const Icon = getModuleIcon(mod.iconName);
          const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

          return (
            <div
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className={`rounded-3xl p-5 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group relative overflow-hidden border cursor-pointer ${
                isLight
                  ? 'bg-white/85 border-slate-200/90 shadow-sm hover:border-indigo-300 hover:bg-white'
                  : `bg-slate-900/60 border-slate-800/80 hover:border-slate-700 ${mod.colorScheme.bgHover}`
              }`}
            >
              {/* Top Row: Icon + Badge + Info Trigger */}
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${mod.colorScheme.from} ${mod.colorScheme.to} flex items-center justify-center text-white shadow-lg ${mod.colorScheme.glow} ring-1 ring-white/10 group-hover:rotate-3 transition`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mod.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800/90 text-slate-300 border-slate-700/80'
                      }`}>
                        {mod.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModule(mod);
                      }}
                      className={`p-1.5 rounded-xl transition ${
                        isLight
                          ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          : 'text-slate-500 hover:text-white hover:bg-slate-800'
                      }`}
                      title="פרטים טכניים ופעולות חיות"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className={`font-bold text-sm leading-snug mb-1 transition ${
                  isLight
                    ? 'text-slate-900 group-hover:text-indigo-600'
                    : 'text-white group-hover:text-indigo-300'
                }`}>
                  {mod.shortTitle}
                </h3>
                <p className={`text-[11px] leading-relaxed line-clamp-2 mb-3 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {mod.description}
                </p>

                {/* Direct Action Chips on the Card */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mod.id === 'whatsapp-green-api-hub' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickWhatsAppModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-green-500/10 hover:bg-green-600 hover:text-white text-green-700 border border-green-500/20 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>שיגור הודעה</span>
                    </button>
                  )}

                  {(mod.category === 'crm' || mod.id === 'smart-form-builder') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickLeadModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-500/20 transition cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ ליד</span>
                    </button>
                  )}

                  {mod.id === 'media-gallery-hub' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const mediaPicker = getCapability<MediaPickerContract>('media-picker');
                        if (mediaPicker) await mediaPicker.openPicker({ accept: '*/*' });
                        else navigate('/media-gallery-hub');
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-500/20 transition cursor-pointer"
                    >
                      <Image className="w-3 h-3" />
                      <span>העלאה</span>
                    </button>
                  )}

                  {mod.id === 'db-connector-hub' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openConnectorModal('apiKeys');
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-500/20 transition cursor-pointer"
                    >
                      <Key className="w-3 h-3" />
                      <span>מפתחות</span>
                    </button>
                  )}

                  {mod.features.slice(0, 2).map((feat, i) => (
                    <span
                      key={i}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border truncate max-w-[130px] ${
                        isLight
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800/80'
                      }`}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Real Data Count & Deep Launch */}
              <div className={`pt-3 border-t flex items-center justify-between mt-auto ${
                isLight ? 'border-slate-100' : 'border-slate-800/60'
              }`}>
                {/* Live Count */}
                <div className="text-[11px]">
                  {docCount !== undefined ? (
                    <span className={`flex items-center gap-1 font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{docCount}</span>
                      <span>פריטים</span>
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>מוכן לשימוש</span>
                  )}
                </div>

                {/* Direct Clean Launch Button (Without Dev Sidebar) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(mod.route);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-sm cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                      : 'bg-slate-800 hover:bg-indigo-600 text-white group-hover:shadow-indigo-600/30'
                  }`}
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
