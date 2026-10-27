/**
 * AmbassadorsManagementTable: Admin management & ranking table for ambassadors
 */

import React, { useState } from 'react';
import {
  Users,
  Target,
  Trophy,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { Ambassador } from '../types';

interface AmbassadorsManagementTableProps {
  onSelectAmbassador?: (ambassador: Ambassador) => void;
}

export const AmbassadorsManagementTable: React.FC<AmbassadorsManagementTableProps> = ({
  onSelectAmbassador,
}) => {
  const { ambassadors, setIsAmbassadorModalOpen } = useCampaignModule();

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAmbassadors = ambassadors.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kosun.io';
    navigator.clipboard.writeText(`${origin}/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsApp = (amb: Ambassador) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kosun.io';
    const url = `${origin}/${amb.slug}`;
    const text = encodeURIComponent(
      `שלום! שותפים יקרים, הצטרפו לקהילת ${amb.name} בקמפיין השותפים: ${url}\nביחד נגיע ליעד של ₪${amb.targetGoal.toLocaleString()}!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dir-rtl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            ניהול שגרירים וקהילות
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            מעקב אחר {ambassadors.length} שגרירים ומובילי קהילות בקמפיין
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש שגריר או קהילה..."
              className="pr-9 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setIsAmbassadorModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            הוסף שגריר
          </button>
        </div>
      </div>

      {/* Ambassadors Grid */}
      <div className="pt-6">
        {filteredAmbassadors.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm font-semibold">לא נמצאו שגרירים התואמים את החיפוש</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAmbassadors.map((amb) => {
              const percent = amb.targetGoal > 0 ? Math.min(Math.round((amb.totalRaised / amb.targetGoal) * 100), 100) : 0;
              const isCopied = copiedId === amb.id;

              return (
                <div
                  key={amb.id}
                  className="rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-base font-black text-slate-900">{amb.name}</h4>
                        <span className="text-xs text-slate-500 block">מוביל: {amb.leaderName}</span>
                      </div>
                      <span className="text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {percent}%
                      </span>
                    </div>

                    {amb.message && (
                      <p className="text-xs text-slate-600 line-clamp-2 my-2 bg-slate-50 p-2 rounded-lg italic">
                        "{amb.message}"
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">
                          הושגו: <strong className="text-slate-900">₪{amb.totalRaised.toLocaleString()}</strong>
                        </span>
                        <span className="text-slate-400">יעד: ₪{amb.targetGoal.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 text-left">
                        {amb.donorCount} תורמים ושותפים
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopy(amb.slug, amb.id)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1 transition-all"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'הועתק!' : 'העתק קישור'}
                    </button>

                    <button
                      onClick={() => handleWhatsApp(amb)}
                      className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all"
                      title="שתף בוואטסאפ"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      וואטסאפ
                    </button>

                    {onSelectAmbassador && (
                      <button
                        onClick={() => onSelectAmbassador(amb)}
                        className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 transition-all"
                        title="צפה בעמוד"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        צפה
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
