import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Phone,
  Calendar,
  Clock,
  User,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { CommunityInteraction } from '../types';
import { fetchCommunityInteractionsList } from '../services/firestoreService';

export const GroupInteractionsTab: React.FC = () => {
  const { db, activeGroup } = useCrmGroups();
  const [interactions, setInteractions] = useState<CommunityInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadInteractions = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const res = await fetchCommunityInteractionsList(db, activeGroup.name);
      setInteractions(res);
    } catch (err) {
      console.warn('Error loading interactions:', err);
    } finally {
      setLoading(false);
    }
  }, [db, activeGroup.name]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>יומן אינטראקציות ופעילות: {activeGroup.name}</span>
          </h3>
          <p className="text-xs text-slate-400">
            היסטוריית שיחות, הודעות וואטסאפ ואירועים שתועדו מול חברי הקהילה.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInteractions}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          title="רענן יומן"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-semibold">טוען אינטראקציות מ-Firestore...</p>
        </div>
      ) : interactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <MessageCircle className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-600">אין אינטראקציות מתועדות עבור קבוצה זו</p>
          <p className="text-[11px] text-slate-400">
            הודעות וואטסאפ, שיחות טלפון ועדכונים יישמרו כאן אוטומטית.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((it) => {
            const isExpanded = expandedId === it.id;
            return (
              <div
                key={it.id}
                onClick={() => setExpandedId(isExpanded ? null : it.id)}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      {it.type === 'whatsapp' ? (
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : it.type === 'call' ? (
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                      ) : (
                        <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800">{it.contactName || 'איש קשר'}</span>
                      <span className="text-[10px] text-slate-400 font-mono block" dir="ltr">
                        {it.contactPhone || ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{it.date ? new Date(it.date).toLocaleDateString('he-IL') : '-'}</span>
                  </div>
                </div>

                <p className={`text-xs text-slate-700 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  {it.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
