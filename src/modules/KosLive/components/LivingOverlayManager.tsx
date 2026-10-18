import React, { useState, useEffect } from 'react';
import {
  Send, CheckCircle2, Sparkles, ShoppingBag, PhoneCall,
  ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';
import { useLivingPlayer } from '../context/LivingPlayerContext';
import { LivingOverlayItem, LivingOverlayAction, LivingCarouselCardItem } from '../types';
import { PremiumVectorIcon } from '../utils/premiumIcons';

export const LivingOverlayManager: React.FC = () => {
  const { currentScene, transitionTo, submitLead, logTelemetry } = useLivingPlayer();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);

  // Reset carousel index when scene changes
  useEffect(() => {
    setActiveCardIdx(0);
    setIsSubmitted(false);
  }, [currentScene?.id]);

  const overlays: LivingOverlayItem[] = currentScene?.overlays || [];

  const handleActionClick = (act: LivingOverlayAction) => {
    logTelemetry('quick_reply', `לחיצה על כפתור "${act.label}"`);
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

  const handleCardClick = (card: LivingCarouselCardItem) => {
    logTelemetry('card_click', `לחיצה על כרטיס "${card.title}"`);
    if (card.externalUrl) {
      window.open(card.externalUrl, '_blank');
      return;
    }
    if (card.targetSceneId) {
      transitionTo(card.targetSceneId, 'carousel_card');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent, overlay: LivingOverlayItem) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await submitLead(formData, {
        smartFormId: overlay.smartFormId,
        webhookUrl: overlay.webhookUrl
      });
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

  if (overlays.length === 0 && !currentScene?.onScreenText) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden select-none" dir="rtl">
      {/* 1. Top Section - On-Screen Headline & Info Badges */}
      <div className="w-full flex flex-col gap-2 pointer-events-auto mt-10">
        {currentScene?.onScreenText && (
          <div className="bg-black/70 backdrop-blur-md border border-amber-500/40 rounded-2xl px-3.5 py-2 shadow-xl text-white self-start max-w-xs animate-fade-in">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-black text-xs text-amber-300">{currentScene.onScreenText}</span>
            </div>
          </div>
        )}

        {overlays
          .filter(o => o.position === 'top' || o.position === 'top-right')
          .map(overlay => (
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

      {/* 2. Center Section - Sleek Capsule Carousel, Lead Forms & Product Cards */}
      <div className="w-full flex flex-col items-center justify-center my-auto gap-3 pointer-events-auto">
        {overlays
          .filter(o => o.position === 'center' || o.type === 'carousel' || o.type === 'form_input' || o.type === 'product_card')
          .map(overlay => {
            // A. SLEEK CAPSULE CAROUSEL
            if (overlay.type === 'carousel' && overlay.cards && overlay.cards.length > 0) {
              const cards = overlay.cards;
              const safeIdx = Math.min(activeCardIdx, cards.length - 1);
              const activeCard = cards[safeIdx];

              return (
                <div key={overlay.id} className="w-full max-w-sm flex flex-col items-center gap-2 animate-scale-up">
                  {overlay.title && (
                    <span className="text-[11px] font-black text-amber-300 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 shadow">
                      {overlay.title} ({safeIdx + 1}/{cards.length})
                    </span>
                  )}

                  <div className="relative w-full flex items-center gap-1.5">
                    {/* Prev Arrow (RTL Right) */}
                    {cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveCardIdx((safeIdx - 1 + cards.length) % cards.length)}
                        className="w-8 h-8 rounded-full bg-black/75 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/20 flex items-center justify-center shadow-lg transition shrink-0 cursor-pointer"
                        title="כרטיס קודם"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Capsule Card */}
                    <div
                      onClick={() => handleCardClick(activeCard)}
                      className="flex-1 bg-slate-950/90 backdrop-blur-xl border border-amber-500/50 hover:border-amber-400 rounded-3xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.75)] text-white transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Card Image or Luxury Icon */}
                        {activeCard.imageUrl ? (
                          <img
                            src={activeCard.imageUrl}
                            alt={activeCard.title}
                            className="w-14 h-14 rounded-2xl object-cover border border-amber-500/40 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                            <PremiumVectorIcon iconKey={activeCard.icon || 'sparkles'} className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-sm font-black text-white group-hover:text-amber-300 truncate">
                              {activeCard.title}
                            </h4>
                            {(activeCard.price || activeCard.badge) && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                {activeCard.price || activeCard.badge}
                              </span>
                            )}
                          </div>

                          {activeCard.subtitle && (
                            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
                              {activeCard.subtitle}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleCardClick(activeCard);
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                          >
                            <span>{activeCard.ctaText || 'לפרטים והמשך'}</span>
                            {activeCard.externalUrl ? (
                              <ExternalLink className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronLeft className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Next Arrow (RTL Left) */}
                    {cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveCardIdx((safeIdx + 1) % cards.length)}
                        className="w-8 h-8 rounded-full bg-black/75 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/20 flex items-center justify-center shadow-lg transition shrink-0 cursor-pointer"
                        title="כרטיס הבא"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Pagination Dots */}
                  {cards.length > 1 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {cards.map((c, idx) => (
                        <button
                          key={c.id || idx}
                          type="button"
                          onClick={() => setActiveCardIdx(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === safeIdx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // B. DYNAMIC LEAD FORM OVERLAY
            if (overlay.type === 'form_input') {
              return (
                <div
                  key={overlay.id}
                  className="w-full max-w-sm bg-slate-950/90 backdrop-blur-xl border border-amber-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl text-white animate-scale-up max-h-[75vh] overflow-y-auto"
                >
                  {overlay.title && (
                    <h3 className="text-sm sm:text-base font-black text-amber-300 mb-1 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{overlay.title}</span>
                    </h3>
                  )}
                  {overlay.subtitle && <p className="text-[11px] text-slate-300 mb-3">{overlay.subtitle}</p>}

                  {isSubmitted ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                      <p className="text-sm font-bold text-emerald-300">הפרטים התקבלו בהצלחה!</p>
                      <p className="text-xs text-slate-400 mt-1">נציג אישי יחזור אליכם בהקדם</p>
                    </div>
                  ) : (
                    <form onSubmit={e => handleFormSubmit(e, overlay)} className="flex flex-col gap-2.5">
                      {(
                        overlay.formFields || [
                          { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text', required: true },
                          { key: 'phone', label: 'מספר טלפון', placeholder: '050-0000000', type: 'tel', required: true }
                        ]
                      ).map(field => (
                        <div key={field.key} className="flex flex-col gap-1 text-right">
                          <label className="text-[11px] font-bold text-slate-300">
                            {field.label} {field.required !== false && <span className="text-amber-400">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              rows={2}
                              placeholder={field.placeholder}
                              required={field.required !== false}
                              value={formData[field.key] || ''}
                              onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                            />
                          ) : field.type === 'select' && field.options ? (
                            <select
                              required={field.required !== false}
                              value={formData[field.key] || ''}
                              onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                            >
                              <option value="">בחרו...</option>
                              {(Array.isArray(field.options)
                                ? field.options
                                : field.options.split(',').map(s => s.trim()).filter(Boolean)
                              ).map((opt: string) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type || 'text'}
                              placeholder={field.placeholder}
                              required={field.required !== false}
                              value={formData[field.key] || ''}
                              onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                            />
                          )}
                        </div>
                      ))}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-1.5 w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'שולח...' : overlay.submitButtonText || 'שליחה והמשך'}</span>
                      </button>
                    </form>
                  )}
                </div>
              );
            }

            // C. SINGLE PRODUCT CARD
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
                  {overlay.actions &&
                    overlay.actions.map(act => (
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
      <div className="w-full flex flex-col gap-2 pointer-events-auto mt-auto pb-1">
        {overlays
          .filter(o => o.type === 'quick_replies' || (o.position === 'bottom' && o.actions && o.actions.length > 0))
          .map(overlay => (
            <div key={overlay.id} className="flex flex-col gap-2">
              {overlay.title && (
                <p className="text-[11px] font-bold text-slate-200 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full self-center border border-white/10 shadow-sm">
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
                      className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer min-w-[130px] ${
                        isGold
                          ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-amber-500/30 hover:brightness-110'
                          : isOutline
                          ? 'bg-black/65 backdrop-blur-md border border-white/30 text-white hover:bg-white/20'
                          : isSecondary
                          ? 'bg-slate-800/90 backdrop-blur-md border border-slate-600 text-slate-200 hover:bg-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                      }`}
                    >
                      <span>{act.label}</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
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
