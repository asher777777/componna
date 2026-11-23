import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';

export interface LiveDonationAlertConfig {
  id?: string;
  type?: 'liveDonationAlert';
  visible?: boolean;
  anchorId?: string;
  campaignId?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  displayDurationMs?: number;
  initialCount?: number;
  playSound?: boolean;
  showProgressBar?: boolean;
  enableDemoMode?: boolean;
  accentColor?: string;
}

interface DonationItem {
  id: string;
  donorName: string;
  amount: number;
  dedication?: string;
  ambassadorName?: string;
  isAnonymous?: boolean;
  createdAtMs: number;
}

function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.85);
    });
  } catch {
    // Autoplay policy may block audio before user gesture
  }
}

export const LiveDonationAlertSection: React.FC<{ config: LiveDonationAlertConfig }> = ({ config }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const {
    visible = true,
    campaignId = 'home',
    position = 'top-right',
    displayDurationMs = 3500,
    initialCount = 3,
    playSound = true,
    showProgressBar = true,
    enableDemoMode = false,
    accentColor = '#036846',
  } = config;

  const targetCampaignId = !campaignId || campaignId === 'default-campaign' ? 'home' : campaignId;

  const [currentDonation, setCurrentDonation] = useState<DonationItem | null>(null);
  const [queue, setQueue] = useState<DonationItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const hasInitializedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const showDonation = useCallback(
    (donation: DonationItem) => {
      setCurrentDonation(donation);
      setProgress(100);
      if (playSound) {
        playGentleChime();
      }
    },
    [playSound]
  );

  useEffect(() => {
    if (!visible || !db || !tenantId || !targetCampaignId) return;

    hasInitializedRef.current = false;
    seenIdsRef.current.clear();

    const donationsRef = collection(db, 'tenants', tenantId, 'mod_campaigns', targetCampaignId, 'donations');
    const unsub = onSnapshot(
      donationsRef,
      (snap) => {
        if (!hasInitializedRef.current) {
          hasInitializedRef.current = true;
          const all: DonationItem[] = snap.docs.map((docSnap) => {
            const d = docSnap.data();
            seenIdsRef.current.add(docSnap.id);
            const rawDate = d.createdAt || d.date || '';
            const ms = typeof rawDate === 'string' ? new Date(rawDate).getTime() || 0 : 0;
            return {
              id: docSnap.id,
              donorName: d.donorName || d.name || 'תורם יקר',
              amount: Number(d.amount || 0),
              dedication: d.dedication || d.message || d.notes || '',
              ambassadorName: d.ambassadorName || d.ambassador || '',
              isAnonymous: Boolean(d.isAnonymous),
              createdAtMs: ms,
            };
          });
          all.sort((a, b) => b.createdAtMs - a.createdAtMs);
          const initialSlice = all.slice(0, Math.max(0, initialCount));
          if (initialSlice.length > 0) {
            setTimeout(() => {
              setQueue((prev) => [...prev, ...initialSlice]);
            }, 900);
          }
          return;
        }

        snap.docChanges().forEach((change) => {
          if (change.type === 'added' && !seenIdsRef.current.has(change.doc.id)) {
            seenIdsRef.current.add(change.doc.id);
            const d = change.doc.data();
            const item: DonationItem = {
              id: change.doc.id,
              donorName: d.donorName || d.name || 'תורם יקר',
              amount: Number(d.amount || 0),
              dedication: d.dedication || d.message || d.notes || '',
              ambassadorName: d.ambassadorName || d.ambassador || '',
              isAnonymous: Boolean(d.isAnonymous),
              createdAtMs: Date.now(),
            };
            setQueue((prev) => [item, ...prev]);
          }
        });
      },
      (err) => console.warn('[LiveDonationAlertSection] snapshot warning:', err)
    );

    return () => unsub();
  }, [visible, db, tenantId, targetCampaignId, initialCount]);

  useEffect(() => {
    if (!currentDonation && queue.length > 0) {
      const t = setTimeout(() => {
        setQueue(([next, ...rest]) => {
          if (next) showDonation(next);
          return rest;
        });
      }, 450);
      return () => clearTimeout(t);
    }
  }, [currentDonation, queue.length, showDonation]);

  useEffect(() => {
    if (!currentDonation || isPaused) return;
    const duration = Math.max(1200, displayDurationMs);
    const step = 30;
    const decrement = 100 / (duration / step);

    const interval = setInterval(() => {
      setProgress((prev) => (prev - decrement > 0 ? prev - decrement : 0));
    }, step);
    const timer = setTimeout(() => {
      setCurrentDonation(null);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [currentDonation, isPaused, displayDurationMs]);

  if (!visible) return null;

  const positionClass =
    {
      'top-right': 'top-20 sm:top-24 right-3 sm:right-6',
      'top-left': 'top-20 sm:top-24 left-3 sm:left-6',
      'bottom-right': 'bottom-20 right-3 sm:right-6',
      'bottom-left': 'bottom-20 left-3 sm:left-6',
    }[position] || 'top-20 sm:top-24 right-3 sm:right-6';

  return (
    <div
      className={`fixed z-[9990] pointer-events-none ${positionClass} max-w-[260px] w-full`}
      dir="rtl"
      style={{ textAlign: 'right' }}
    >
      {enableDemoMode && (
        <div className="pointer-events-auto mb-1.5 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setQueue((prev) => [
                {
                  id: `demo-${Date.now()}`,
                  donorName: 'תרומה לדוגמה',
                  amount: 360,
                  dedication: 'לברכה והצלחה מרובה!',
                  createdAtMs: Date.now(),
                },
                ...prev,
              ]);
            }}
            className="text-[11px] bg-amber-500/90 text-slate-950 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>בדוק התראה</span>
          </button>
        </div>
      )}

      {currentDonation && (
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="pointer-events-auto relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3.5 overflow-hidden transition-all"
        >
          <button
            type="button"
            onClick={() => setCurrentDonation(null)}
            aria-label="סגור התראה"
            className="absolute top-2 left-2 w-6 h-6 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-2.5">
            <div
              className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 shadow"
              style={{ backgroundColor: accentColor }}
            >
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div className="flex-1 min-w-0 pl-4">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {currentDonation.isAnonymous ? 'אנונימי' : currentDonation.donorName}
                </span>
              </div>
              <div className="text-sm font-black mt-0.5" style={{ color: accentColor }}>
                תרם ₪{Number(currentDonation.amount || 0).toLocaleString()}
              </div>
              {currentDonation.ambassadorName && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  ע&quot;י {currentDonation.ambassadorName}
                </span>
              )}
              {currentDonation.dedication && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 italic">
                  &quot;{currentDonation.dedication}&quot;
                </p>
              )}
            </div>
          </div>

          {showProgressBar && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full transition-all duration-75"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
