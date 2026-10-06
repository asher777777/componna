import React, { useState } from 'react';
import { useMarketingIdeas } from '../hooks/useMarketingIdeas';
import { usePageBuilderContext } from '../context/PageBuilderContext';
import { MarketingIdea } from '../types';
import {
  Sparkles,
  Zap,
  MapPin,
  Layers,
  Heart,
  GraduationCap,
  Clock,
  Users,
  RefreshCw,
  X,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';

interface ContinuousMarketingIdeasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea: (prompt: string) => void;
}

export const ContinuousMarketingIdeasDrawer: React.FC<ContinuousMarketingIdeasDrawerProps> = ({
  isOpen,
  onClose,
  onSelectIdea,
}) => {
  const { brandDna } = usePageBuilderContext();
  const { ideas, loading, refreshIdeas } = useMarketingIdeas();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-emerald-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-orange-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-pink-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshIdeas();
    setIsRefreshing(false);
  };

  const companyName = brandDna?.identity?.companyName || 'המותג שלך';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#08090d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>זוויות שיווקיות רציפות מתוך ה-Brand DNA</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
                  חי ומסונכרן
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                הצעות מותאמות אישית עבור <strong className="text-slate-200">{companyName}</strong>, המבוססות על קהלי היעד, נקודות הכאב והבטחת המותג.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>רענן זוויות שיווקיות ב-AI</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Brand DNA Highlights Bar */}
        <div className="px-6 py-3 bg-indigo-950/20 border-b border-indigo-500/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">קהל יעד:</span>
            <span className="font-bold text-indigo-300">
              {brandDna?.audience?.targetAudiences?.[0] || 'לקוחות איכותיים'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">UVP מרכזי:</span>
            <span className="font-bold text-cyan-300 truncate max-w-xs">
              {brandDna?.audience?.mainUvp || 'פתרון מוביל בתחום'}
            </span>
          </div>
          <div className="mr-auto text-[11px] text-slate-500">
            לחיצה על כרטיס תייצר עמוד שלם בלחיצה אחת ⚡
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                      {getIcon(idea.icon)}
                    </div>
                    {idea.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                        {idea.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {idea.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {idea.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  {idea.targetObjective && (
                    <span className="text-[11px] text-slate-500">
                      יעד: <strong className="text-slate-400">{idea.targetObjective}</strong>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectIdea(idea.prompt);
                      onClose();
                    }}
                    className="mr-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all group-hover:scale-105 cursor-pointer"
                  >
                    <span>צור דף זה</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex justify-between items-center text-xs text-slate-400">
          <span>רוצים פרומפט חופשי? פתחו את מחולל ה-AI הראשי.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinuousMarketingIdeasDrawer;
