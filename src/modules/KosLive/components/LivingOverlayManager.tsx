import React, { useState } from 'react';
import { Send, CheckCircle2, Sparkles, ShoppingBag, PhoneCall, ChevronLeft, ArrowRight } from 'lucide-react';
import { useLivingPlayer } from '../context/LivingPlayerContext';
import { LivingOverlayItem, LivingOverlayAction } from '../types';

export const LivingOverlayManager: React.FC = () => {
  const { currentScene, transitionTo, submitLead } = useLivingPlayer();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const overlays: LivingOverlayItem[] = currentScene?.overlays || [];

  const handleActionClick = (act: LivingOverlayAction) => {
    if (act.actionType === 'open_whatsapp' && act.externalUrl) {
      window.open(act.externalUrl, '_blank');
      return;
    }
    if (act.actionType === 'open_url' && act.externalUrl) {
      window.open(act.externalUrl, '_blank');
      return;
    }
    if (act.targetSceneId) {
      transitionTo(act.targetSceneId, 'overlay_action');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent, overlay: LivingOverlayItem) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await submitLead(formData);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        const submitAction = overlay.actions?.[0];
        if (submitAction?.targetSceneId) {
          transitionTo(submitAction.targetSceneId, 'form_submitted');
        }
      }, 1500);
    } catch (err) {
      console.warn('[LivingOverlayManager] Form submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (overlays.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none p-4 flex flex-col justify-between overflow-hidden select-none" dir="rtl">
      
      {/* 1. Top Section - Info Cards & Badges */}
      <div className="w-full flex flex-col gap-2 pointer-events-auto">
        {overlays.filter(o => o.position === 'top' || o.position === 'top-right').map(overlay => (
          <div 
            key={overlay.id}
            className="bg-black/75 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3 shadow-xl text-white max-w-sm animate-fade-in"
          >
            {overlay.title && (
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <h4 className="font-bold text-sm text-amber-300">{overlay.title}</h4>
              </div>
            )}
            {overlay.subtitle && (
              <p className="text-xs text-slate-200 font-medium leading-relaxed">{overlay.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* 2. Center Section - Product Cards & Forms */}
      <div className="w-full flex flex-col items-center justify-center my-auto pointer-events-auto">
        {overlays.filter(o => o.position === 'center').map(overlay => {
          if (overlay.type === 'form_input') {
            return (
              <div 
                key={overlay.id}
                className="w-full max-w-sm bg-slate-950/90 backdrop-blur-xl border border-amber-500/50 rounded-3xl p-5 shadow-2xl text-white animate-scale-up"
              >
                {overlay.title && (
                  <h3 className="text-base sm:text-lg font-black text-amber-300 mb-1 flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-amber-400" />
                    {overlay.title}
                  </h3>
                )}
                {overlay.subtitle && (
                  <p className="text-xs text-slate-300 mb-4">{overlay.subtitle}</p>
                )}

                {isSubmitted ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-emerald-300">הפרטים התקבלו בהצלחה!</p>
                    <p className="text-xs text-slate-400 mt-1">נציג אישי יחזור אליכם בהקדם</p>
                  </div>
                ) : (
                  <form onSubmit={e => handleFormSubmit(e, overlay)} className="flex flex-col gap-2.5">
                    {(overlay.formFields || [
                      { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text' },
                      { key: 'phone', label: 'מספר טלפון', placeholder: '050-0000000', type: 'tel' }
                    ]).map(field => (
                      <div key={field.key} className="flex flex-col gap-1 text-right">
                        <label className="text-[11px] font-bold text-slate-300">{field.label}</label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          required
                          value={formData[field.key] || ''}
                          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>
                    ))}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-2 w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'שולח...' : 'שליחה והמשך'}</span>
                    </button>
                  </form>
                )}
              </div>
            );
          }

          if (overlay.type === 'product_card') {
            return (
              <div 
                key={overlay.id}
                className="w-full max-w-sm bg-slate-950/90 backdrop-blur-xl border border-amber-500/50 rounded-3xl p-5 shadow-2xl text-white animate-scale-up"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-amber-300">{overlay.title}</h3>
                </div>
                {overlay.subtitle && <p className="text-xs text-slate-300 mb-3">{overlay.subtitle}</p>}
                {overlay.price && (
                  <div className="text-lg font-black text-white bg-amber-500/10 border border-amber-500/30 rounded-xl py-2 px-3 text-center mb-3">
                    {overlay.price}
                  </div>
                )}
                {overlay.actions && overlay.actions.map(act => (
                  <button
                    key={act.id}
                    onClick={() => handleActionClick(act)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95 transition cursor-pointer"
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* 3. Bottom Section - Quick Replies Decision Tree Buttons */}
      <div className="w-full flex flex-col gap-2 pointer-events-auto mt-auto pb-2">
        {overlays.filter(o => o.position === 'bottom' || (!o.position && o.actions)).map(overlay => (
          <div key={overlay.id} className="flex flex-col gap-2">
            {overlay.title && (
              <p className="text-xs font-bold text-slate-200 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full self-center border border-white/10 shadow-sm">
                {overlay.title}
              </p>
            )}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2">
              {(overlay.actions || []).map(act => {
                const isGold = act.variant === 'gold';
                const isOutline = act.variant === 'outline';
                const isSecondary = act.variant === 'secondary';

                return (
                  <button
                    key={act.id}
                    onClick={() => handleActionClick(act)}
                    className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer min-w-[140px] ${
                      isGold
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-110'
                        : isOutline
                        ? 'bg-black/60 backdrop-blur-md border border-white/30 text-white hover:bg-white/20'
                        : isSecondary
                        ? 'bg-slate-800/90 backdrop-blur-md border border-slate-600 text-slate-200 hover:bg-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    <span>{act.label}</span>
                    <ChevronLeft className="w-4 h-4 rtl:rotate-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
