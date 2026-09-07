import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft } from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { OverlayItem, OverlayAction } from '../types';

export const UiOverlayManager: React.FC = () => {
  const { currentNode, campaign, transitionTo, logEvent } = usePlayerMachine();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const overlays = currentNode?.overlays || [];

  const handleActionClick = (action: OverlayAction, overlay: OverlayItem) => {
    logEvent({
      type: 'overlay_action',
      actionId: action.id,
      details: {
        overlayId: overlay.id,
        targetNodeId: action.targetNodeId,
        label: action.label,
      },
    });

    transitionTo(action.targetNodeId, 'node_transition', {
      trigger: 'overlay_click',
      actionId: action.id,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent, overlay: OverlayItem) => {
    e.preventDefault();
    setFormSubmitted(true);
    logEvent({
      type: 'overlay_action',
      actionId: 'form_submit',
      details: {
        overlayId: overlay.id,
        formData,
      },
    });

    const targetEndpoint = currentNode?.formsApiEndpoint || campaign.formsApiEndpoint;
    if (targetEndpoint) {
      try {
        await fetch(targetEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignSlug: campaign.slug || campaign.id,
            nodeId: currentNode?.id,
            nodeName: currentNode?.name,
            formData,
            timestamp: Date.now(),
          }),
        });
      } catch (apiErr) {
        console.warn('[UiOverlayManager] Error dispatching to forms API endpoint:', apiErr);
      }
    }

    setTimeout(() => {
      const submitAction = overlay.actions?.[0];
      if (submitAction) {
        transitionTo(submitAction.targetNodeId, 'node_transition', { trigger: 'form_completed' });
      }
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none p-3 sm:p-4 flex flex-col justify-between overflow-hidden select-none" dir="rtl">
      {/* Top Overlays */}
      <div className="w-full flex justify-between items-start z-10">
        {overlays
          .filter((o) => o.position === 'top' || o.position === 'top-right')
          .map((overlay) => (
            <div
              key={overlay.id}
              className="pointer-events-auto bg-black/75 backdrop-blur-md border border-yellow-500/50 rounded-full px-3.5 py-1.5 flex items-center space-x-2 rtl:space-x-reverse shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-fade-in text-xs text-yellow-300"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="font-bold">{overlay.title}</span>
            </div>
          ))}
      </div>

      {/* Center & Above-Mic Overlays (Golden Carousel, Product Cards, Forms) */}
      {/* Notice mb-28 so cards are positioned cleanly ABOVE the bottom microphone */}
      <div className="w-full flex flex-col items-center justify-center my-auto mb-28 px-1">
        {overlays
          .filter((o) => o.position === 'center' || !o.position)
          .map((overlay) => {
            // 1. Golden Carousel with Images, Icons, and Titles
            if (overlay.type === 'carousel' && overlay.carouselItems && overlay.carouselItems.length > 0) {
              const items = overlay.carouselItems;
              const activeItem = items[carouselIndex % items.length];

              const nextSlide = (e: React.MouseEvent) => {
                e.stopPropagation();
                setCarouselIndex((prev) => (prev + 1) % items.length);
              };

              const prevSlide = (e: React.MouseEvent) => {
                e.stopPropagation();
                setCarouselIndex((prev) => (prev - 1 + items.length) % items.length);
              };

              return (
                <div
                  key={overlay.id}
                  className="pointer-events-auto w-full max-w-[340px] sm:max-w-[360px] bg-black/85 backdrop-blur-2xl border-2 border-yellow-500/80 rounded-3xl p-4 sm:p-5 shadow-[0_0_35px_rgba(234,179,8,0.35)] text-white animate-fade-in-up flex flex-col items-center relative"
                >
                  {/* Header Title */}
                  {overlay.title && (
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-yellow-400 font-bold text-sm mb-1 text-center">
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse flex-shrink-0" />
                      <span className="truncate">{overlay.title}</span>
                    </div>
                  )}
                  {overlay.subtitle && (
                    <p className="text-[11px] text-slate-300 text-center mb-3 line-clamp-1">{overlay.subtitle}</p>
                  )}

                  {/* Carousel Card with Left / Right Gold Navigation Arrows */}
                  <div className="w-full flex items-center justify-between gap-2 my-1">
                    {/* Previous Arrow (Right in RTL) */}
                    <button
                      onClick={prevSlide}
                      title="הקודם"
                      className="w-9 h-9 rounded-full border-2 border-yellow-500/80 bg-black/90 text-yellow-400 hover:bg-yellow-500 hover:text-black flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.4)] transition-all transform active:scale-90 flex-shrink-0 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Active Card Body */}
                    <div
                      onClick={() => transitionTo(activeItem.targetNodeId, 'node_transition', { reason: 'carousel_select', cardId: activeItem.id })}
                      className="flex-1 bg-gradient-to-b from-slate-900/95 to-black/95 border border-yellow-500/50 hover:border-yellow-400 rounded-2xl p-3.5 cursor-pointer text-center shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 group min-h-[140px] flex flex-col justify-between overflow-hidden"
                    >
                      {/* Image if available */}
                      {activeItem.imageUrl && (
                        <div className="w-full h-20 mb-2 rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
                          <img
                            src={activeItem.imageUrl}
                            alt={activeItem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          {activeItem.icon && <span className="text-base">{activeItem.icon}</span>}
                          {activeItem.badge && (
                            <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                              {activeItem.badge}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-yellow-300 group-hover:text-yellow-200 transition-colors leading-tight">
                          {activeItem.title}
                        </h4>

                        {activeItem.description && (
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {activeItem.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-center text-[10px] text-yellow-400/90 font-bold group-hover:text-yellow-300">
                        <span>לחץ לבחירה</span>
                        <ArrowLeft className="w-3 h-3 mr-1 transform group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Next Arrow (Left in RTL) */}
                    <button
                      onClick={nextSlide}
                      title="הבא"
                      className="w-9 h-9 rounded-full border-2 border-yellow-500/80 bg-black/90 text-yellow-400 hover:bg-yellow-500 hover:text-black flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.4)] transition-all transform active:scale-90 flex-shrink-0 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Dot Indicators */}
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse mt-3">
                    {items.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === carouselIndex % items.length
                            ? 'w-6 bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
                            : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            // 2. Product Card
            if (overlay.type === 'product_card') {
              return (
                <div
                  key={overlay.id}
                  className="pointer-events-auto w-full max-w-sm bg-black/85 backdrop-blur-xl border border-yellow-500/40 rounded-2xl p-5 shadow-2xl text-white transform transition-all hover:scale-[1.02] animate-fade-in-up"
                >
                  {overlay.title && <h3 className="text-lg font-bold text-yellow-300 mb-1">{overlay.title}</h3>}
                  {overlay.subtitle && <p className="text-xs text-slate-300 mb-3">{overlay.subtitle}</p>}
                  {overlay.price && (
                    <div className="text-2xl font-black text-yellow-400 mb-4 tracking-tight">{overlay.price}</div>
                  )}
                  <div className="flex flex-col space-y-2">
                    {overlay.actions?.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action, overlay)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                          action.variant === 'gold' || action.variant === 'primary'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            // 3. Lead Form
            if (overlay.type === 'form_input') {
              return (
                <div
                  key={overlay.id}
                  className="pointer-events-auto w-full max-w-sm bg-black/90 backdrop-blur-xl border border-yellow-500/40 rounded-2xl p-5 shadow-2xl text-white animate-fade-in-up"
                >
                  <h3 className="text-lg font-bold text-yellow-300 mb-1">{overlay.title}</h3>
                  <p className="text-xs text-slate-300 mb-4">{overlay.subtitle}</p>

                  {formSubmitted ? (
                    <div className="text-center py-4 space-y-2">
                      <div className="text-3xl">✨</div>
                      <div className="text-sm font-semibold text-yellow-400">הפרטים נשלחו בהצלחה!</div>
                      <div className="text-xs text-slate-400">מעביר לצומת הבא...</div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleFormSubmit(e, overlay)} className="space-y-3">
                      {overlay.formFields?.map((field) => (
                        <div key={field.key}>
                          <label className="block text-[11px] text-slate-300 mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            required
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                          />
                        </div>
                      ))}
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg transition-all active:scale-95 mt-2"
                      >
                        שלח פרטים
                      </button>
                    </form>
                  )}
                </div>
              );
            }

            return null;
          })}
      </div>

      {/* Bottom Overlays (Quick Replies) */}
      <div className="w-full flex flex-col items-center justify-end space-y-2 mb-24 z-10">
        {overlays
          .filter((o) => o.position === 'bottom' || o.position === 'bottom-left' || o.position === 'bottom-right')
          .map((overlay) => {
            if (overlay.type === 'quick_replies') {
              return (
                <div key={overlay.id} className="pointer-events-auto w-full flex flex-col items-center space-y-2">
                  {overlay.title && (
                    <div className="text-xs font-semibold text-slate-200 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-500/30">
                      {overlay.title}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
                    {overlay.actions?.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action, overlay)}
                        className="pointer-events-auto px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border transition-all transform active:scale-95 shadow-lg bg-black/80 hover:bg-yellow-500 hover:text-black text-yellow-300 border-yellow-500/50"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
      </div>
    </div>
  );
};