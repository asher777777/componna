import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Database,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Zap,
  MessageSquare,
  UserPlus,
  Image,
  Key,
  ExternalLink,
  Play
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../../core/contracts';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';

export const ModuleDetailsDrawer: React.FC = () => {
  const {
    selectedModule,
    setSelectedModule,
    moduleDocCounts,
    theme,
    setQuickLeadModalOpen,
    setQuickWhatsAppModalOpen
  } = useControlCenter();

  const { getCapability } = useHostCapabilities();
  const { openConnectorModal } = useSystemConnection();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  if (!selectedModule) return null;

  const docCount = selectedModule.collectionName ? moduleDocCounts[selectedModule.id] : undefined;

  const handleMediaUpload = async () => {
    const mediaPicker = getCapability<MediaPickerContract>('media-picker');
    if (mediaPicker) {
      await mediaPicker.openPicker({ accept: '*/*' });
    } else {
      setSelectedModule(null);
      navigate('/media-gallery-hub');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-md border-l p-6 flex flex-col justify-between shadow-2xl relative text-right transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          
          <div className="overflow-y-auto pr-1">
            {/* Drawer Header */}
            <div className={`flex items-center justify-between pb-4 border-b mb-6 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedModule.colorScheme.from} ${selectedModule.colorScheme.to} flex items-center justify-center text-white shadow-lg`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {selectedModule.name}
                  </h3>
                  <span className="text-[11px] font-mono text-indigo-500 font-semibold">
                    {selectedModule.route}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedModule(null)}
                className={`p-1.5 rounded-lg transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Buttons Directly Inside Drawer */}
            <div className="mb-5">
              <label className={`text-xs font-bold block mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                ⚡ פעולות חיות להפעלה מיידית:
              </label>
              
              <div className="grid grid-cols-1 gap-2">
                {selectedModule.id === 'whatsapp-green-api-hub' && (
                  <button
                    onClick={() => {
                      setSelectedModule(null);
                      setQuickWhatsAppModalOpen(true);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-green-500/10 hover:bg-green-600 hover:text-white text-green-700 border border-green-500/20 font-bold text-xs transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>שיגור הודעת וואטסאפ מהירה</span>
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {(selectedModule.category === 'crm' || selectedModule.id === 'smart-form-builder') && (
                  <button
                    onClick={() => {
                      setSelectedModule(null);
                      setQuickLeadModalOpen(true);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-500/20 font-bold text-xs transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>הוספת ליד חדש למסד</span>
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {selectedModule.id === 'media-gallery-hub' && (
                  <button
                    onClick={handleMediaUpload}
                    className="flex items-center justify-between p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-500/20 font-bold text-xs transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      <span>העלאת קובץ למאגר המדיה</span>
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {selectedModule.id === 'db-connector-hub' && (
                  <button
                    onClick={() => {
                      setSelectedModule(null);
                      openConnectorModal('apiKeys');
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-500/20 font-bold text-xs transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <span>הגדרת מפתחות API ומסד</span>
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedModule(null);
                    navigate(selectedModule.route);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-500/20 font-bold text-xs transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>פתיחת המודול המלא (ללא סיידבר)</span>
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4">
              
              {/* Description */}
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  תיאור ומטרת הרכיב
                </label>
                <p className={`text-xs leading-relaxed p-3.5 rounded-2xl border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}>
                  {selectedModule.description}
                </p>
              </div>

              {/* Categorization & Stage */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
                }`}>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>תחום עסקי</span>
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedModule.categoryTitle}</span>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
                }`}>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>שלב צינור עבודה</span>
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedModule.pipelineStageTitle}</span>
                </div>
              </div>

              {/* Firestore Collection Data */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <Database className="w-3.5 h-3.5 text-indigo-500" />
                    <span>קולקציית Firestore:</span>
                  </span>
                  <span className="font-mono text-emerald-600 font-semibold">
                    {selectedModule.collectionName || 'ללא קולקציה ייעודית'}
                  </span>
                </div>

                <div className={`flex items-center justify-between text-xs pt-1 border-t ${
                  isLight ? 'border-slate-200' : 'border-slate-800/60'
                }`}>
                  <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>מסמכים פעילים (אמת):</span>
                  <span className={`font-mono font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {docCount !== undefined ? docCount : 'לא רלוונטי'}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div>
                <label className={`text-xs font-semibold block mb-2 flex items-center gap-1.5 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>יכולות מפתח של המודול</span>
                </label>
                <ul className="space-y-1.5">
                  {selectedModule.features.map((feat, i) => (
                    <li key={i} className={`flex items-center gap-2 text-xs ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Bottom Launch Bar */}
          <div className={`pt-4 border-t mt-4 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <button
              onClick={() => {
                setSelectedModule(null);
                navigate(selectedModule.route);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <span>כניסה ישירה לרכיב (ללא סיידבר)</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
