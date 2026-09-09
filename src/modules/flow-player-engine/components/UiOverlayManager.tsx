import React, { useState } from 'react';
import {
  Play,
  Pause,
  ChevronsRight,
  ChevronsLeft,
  User,
  Sparkles,
  ArrowLeft,
  Send,
  HelpCircle,
} from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { OverlayItem, OverlayAction } from '../types';
import { eventBus } from '../../../core/bridge/EventBus';
import { PremiumVectorIcon } from '../utils/premiumIcons';

export const UiOverlayManager: React.FC = () => {
  const {
    currentNode,
    campaign,
    transitionTo,
    logEvent,
    isPlaying,
    togglePlay,
  } = usePlayerMachine();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const overlays = currentNode?.overlays || [];
  const hasOverlays = overlays.length > 0;

  // Extract primary overlay types if available
  const carouselOverlay = overlays.find((o) => o.type === 'carousel' && o.carouselItems && o.carouselItems.length > 0);
  const formOverlay = overlays.find((o) => o.type === 'form_input');
  const productOverlay = overlays.find((o) => o.type === 'product_card');
  const quickRepliesOverlay = overlays.find((o) => o.type === 'quick_replies');
  const infoCardOverlay = overlays.find((o) => o.type === 'info_card' || (!o.type && (o.title || o.actions)));

  // Determine current active question title and subtitle
  let questionText = '';
  let subtitleText: string | undefined = undefined;
  let activeBadge: string | undefined = undefined;
  let activeIcon: string | undefined = undefined;
  let activeImageUrl: string | undefined = undefined;
  let activeActions: OverlayAction[] = [];
  let totalCarouselSlides = 0;

  if (carouselOverlay && carouselOverlay.carouselItems && carouselOverlay.carouselItems.length > 0) {
    const items = carouselOverlay.carouselItems;
    totalCarouselSlides = items.length;
    const activeItem = items[carouselIndex % items.length];
    questionText = activeItem.title || carouselOverlay.title || '';
    subtitleText = activeItem.description || carouselOverlay.subtitle;
    activeBadge = activeItem.badge;
    activeIcon = activeItem.icon;
    activeImageUrl = activeItem.imageUrl;
    activeActions = [
      {
        id: activeItem.id,
        label: 'בחר אפשרות זו ➔',
        targetNodeId: activeItem.targetNodeId,
        variant: 'gold',
      },
    ];
  } else if (quickRepliesOverlay) {
    questionText = quickRepliesOverlay.title || currentNode?.description || currentNode?.name || '';
    subtitleText = quickRepliesOverlay.subtitle;
    activeActions = quickRepliesOverlay.actions || [];
  } else if (infoCardOverlay) {
    questionText = infoCardOverlay.title || currentNode?.description || currentNode?.name || '';
    subtitleText = infoCardOverlay.subtitle;
    activeActions = infoCardOverlay.actions || [];
  } else if (productOverlay) {
    questionText = productOverlay.title || '';
    subtitleText = productOverlay.subtitle;
    if (productOverlay.price) {
      subtitleText = `${productOverlay.price} ${subtitleText ? `• ${subtitleText}` : ''}`;
    }
    activeActions = productOverlay.actions || [];
  }

  // Handle navigation chevrons for carousel
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carouselOverlay && carouselOverlay.carouselItems && carouselOverlay.carouselItems.length > 0) {
      setCarouselIndex((prev) => (prev + 1) % carouselOverlay.carouselItems!.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carouselOverlay && carouselOverlay.carouselItems && carouselOverlay.carouselItems.length > 0) {
      setCarouselIndex((prev) => (prev - 1 + carouselOverlay.carouselItems!.length) % carouselOverlay.carouselItems!.length);
    }
  };

  const handleActionClick = (action: OverlayAction, overlay?: OverlayItem) => {
    logEvent({
      type: 'overlay_action',
      actionId: action.id,
      details: {
        overlayId: overlay?.id,
        targetNodeId: action.targetNodeId,
        label: action.label,
      },
    });

    // Broadcast interaction to host and sibling modules
    eventBus.emit('player:interaction', {
      videoId: campaign.slug || campaign.id,
      eventType: action.id,
      timestamp: Date.now(),
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

    // Broadcast live lead to CRM Analytics module & EventBus
    eventBus.emit('crm:lead:created', {
      conta_name: formData.name || formData.fullName || 'ליד מנגן הווידאו',
      conta_phone: formData.phone || formData.tel || '',
      email: formData.email || undefined,
      source: `flow-player-engine:${campaign.slug || campaign.id}`,
      metadata: {
        ...formData,
        nodeId: currentNode?.id,
        nodeName: currentNode?.name,
      },
    });

    eventBus.emit('player:interaction', {
      videoId: campaign.slug || campaign.id,
      eventType: 'form_submit',
      timestamp: Date.now(),
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
    <div
      className="absolute inset-0 z-10 pointer-events-none p-3 sm:p-4 flex flex-col justify-between overflow-hidden select-none"
      dir="rtl"
    >
      {/* 1. Top Badges & Status */}
      <div className="w-full flex justify-between items-start z-10">
        {overlays
          .filter((o) => o.position === 'top' || o.position === 'top-right')
          .map((overlay) => (
            <div
              key={overlay.id}
              className="pointer-events-auto bg-black/75 backdrop-blur-md border border-amber-500/50 rounded-full px-3.5 py-1.5 flex items-center space-x-2 rtl:space-x-reverse shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-fade-in text-xs text-amber-300"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">{overlay.title}</span>
            </div>
          ))}
      </div>


      {/* 3. Capsule Question & Interaction Widget (Appears ONLY when overlays are configured on this node) */}
      {hasOverlays && (
        <div className="w-full flex flex-col items-center justify-end mb-24 z-10 px-2">
          {formOverlay ? (
            /* Lead Form Capsule */
            <div className="pointer-events-auto w-[92%] max-w-[350px] sm:max-w-[380px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-white animate-fade-in-up">
              <h3 className="text-base font-bold text-amber-400 mb-1 text-center">{formOverlay.title}</h3>
              {formOverlay.subtitle && (
                <p className="text-xs text-slate-300 mb-3 text-center">{formOverlay.subtitle}</p>
              )}

              {formSubmitted ? (
                <div className="text-center py-4 space-y-2">
                  <div className="text-2xl">✨</div>
                  <div className="text-sm font-semibold text-amber-400">הפרטים נשלחו בהצלחה!</div>
                  <div className="text-xs text-slate-400">מעביר לצומת הבא...</div>
                </div>
              ) : (
                <form onSubmit={(e) => handleFormSubmit(e, formOverlay)} className="space-y-2.5">
                  {formOverlay.formFields?.map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] text-slate-300 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        required
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg transition-all active:scale-95 mt-1 cursor-pointer"
                  >
                    שלח פרטים
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Sleek Capsule Pill Widget (Replacing Carousel, Cards & Quick Replies) */
            <div className="pointer-events-auto w-[92%] max-w-[340px] sm:max-w-[370px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[32px] sm:rounded-[38px] p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col items-center relative transition-all animate-fade-in-up">
              {/* Top Navigation Row */}
              <div className="w-full flex items-center justify-between px-1 mb-1">
                {/* Previous Chevrons (Visible if carousel has multiple items) */}
                {totalCarouselSlides > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="text-amber-400 hover:text-amber-300 hover:scale-110 p-1.5 transition transform active:scale-90 cursor-pointer"
                    title="הקודם"
                  >
                    <ChevronsRight className="w-7 h-7" />
                  </button>
                ) : (
                  <div className="w-7" />
                )}

                {/* Central Icon / Avatar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-11 h-11 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    {activeIcon ? (
                      <PremiumVectorIcon iconKey={activeIcon} className="w-6 h-6 text-amber-400" />
                    ) : (
                      <User className="w-6 h-6 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  {activeBadge && (
                    <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                      {activeBadge}
                    </span>
                  )}
                </div>

                {/* Next Chevrons (Visible if carousel has multiple items) */}
                {totalCarouselSlides > 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-amber-400 hover:text-amber-300 hover:scale-110 p-1.5 transition transform active:scale-90 cursor-pointer"
                    title="הבא"
                  >
                    <ChevronsLeft className="w-7 h-7" />
                  </button>
                ) : (
                  <div className="w-7" />
                )}
              </div>

              {/* Optional image if attached to active item */}
              {activeImageUrl && (
                <div className="w-full h-24 my-2 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
                  <img src={activeImageUrl} alt={questionText} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Question / Card Text Area */}
              {questionText && (
                <div className="w-full text-center mt-1 px-2">
                  <h3 className="text-amber-400 font-bold text-sm sm:text-base leading-relaxed break-words">
                    {questionText}
                  </h3>
                  {subtitleText && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {subtitleText}
                    </p>
                  )}
                </div>
              )}

              {/* Interactive Actions / Quick Replies Buttons */}
              {activeActions && activeActions.length > 0 && (
                <div className="w-full flex flex-wrap gap-2 justify-center mt-3 pt-2.5 border-t border-white/10">
                  {activeActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleActionClick(action)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Dot Indicators for Carousel Slides */}
              {totalCarouselSlides > 1 && (
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse mt-2.5">
                  {Array.from({ length: totalCarouselSlides }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === carouselIndex % totalCarouselSlides
                          ? 'w-5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};