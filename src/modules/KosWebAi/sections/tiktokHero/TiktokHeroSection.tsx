import React, { useState, useRef } from 'react';
import { TiktokHeroSectionConfig } from '../../types/sectionConfigs';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  Volume2,
  VolumeX,
  X,
  Video as VideoIcon,
  Clock,
  Loader2,
} from 'lucide-react';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { resolveLiveBrandDna } from '../../generators/pageGenerator';
import { DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { clsx } from 'clsx';

export const TiktokHeroSection: React.FC<{ config: TiktokHeroSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const {
    anchorId,
    video = {},
    overlay = { mode: 'gradient', opacity: 40 },
    // Background behind video
    backgroundType = 'solid',
    backgroundColor = 'transparent',
    backgroundGradientFrom = '#0f172a',
    backgroundGradientTo = '#020617',
    backgroundGradientDirection = 'to-b',
    backgroundImageUrl,
    ambientGlow = true,
    ambientGlowColor = '#3b82f6',
    ambientGlowOpacity = 20,

    // Headline
    showHeadline = true,
    headline = 'מחפש עבודה',
    headlinePosition = 'above-card',
    headlineAlign = 'center',
    headlineColor = '#ffffff',
    headlineSize = 'xl',
    headlineWeight = 'extrabold',
    headlineShadow = true,
    headlineMarginBottom = 'md',

    // Floating Card
    card = {
      enabled: true,
      position: 'bottom',
      width: 'normal',
      textAlign: 'center',
      tag: 'קושאן – מערכת חכמה',
      title: 'קושאן – כל אדם זה נכס',
      subtitle: 'מערכת פרימיום מתקדמת המעניקה מענה מדויק, מהיר ומותאם אישית לכל צורך עסקי.',
      style: 'solid',
      shape: 'rounded',
      titleSize: 'md',
      subtitleSize: 'sm',
      tagSize: 'xs',
      padding: 'normal',
    },

    // CTA Button over video
    ctaButton = {
      text: 'מצא עכשיו',
      iconName: 'Sparkles',
      showIcon: true,
      iconPosition: 'left',
      iconSize: 'md',
      buttonSize: 'normal',
      widthMode: 'auto',
      fontSize: 'sm',
      paddingY: 'normal',
      position: 'below-card',
      align: 'stretch',
      bgColor: '#0284c7',
      textColor: '#ffffff',
      shape: 'rounded',
      pulseEffect: true,
      actionType: 'modal_form',
    },

    // Modal settings
    modalTitle = 'השארת פרטים לקבלת הצעה',
    modalSubtitle = 'מלאו את הפרטים ונחזור אליכם בהקדם האפשרי',
    modalButtonText = 'שליחת הטופס',
    modalButtonSize = 'normal',
    modalButtonFontSize = 'sm',
    modalButtonBgColor,
    modalButtonTextColor,
    modalButtonShape = 'rounded',
    modalShape = 'rounded-3xl',
    modalEffect = 'glass',
    modalBgColor,
    modalBackdropBlur = 'md',
    modalMaxWidth = 'lg',

    // Forms delegation
    formId,
    form: propForm,
  } = config;

  // Video playback & mute states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(video.muted ?? true);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ctaButton.actionType === 'link' && ctaButton.linkUrl) {
      window.open(ctaButton.linkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setIsModalOpen(true);
  };

  // Video fallback sample
  const effectiveVideoUrl =
    video.videoUrl ||
    'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4';
  const effectivePosterUrl = video.posterUrl || undefined;

  // Headline sizing classes
  const headlineClass = clsx(
    'tracking-tight font-sans drop-shadow-md transition-all',
    headlineAlign === 'right' && 'text-right',
    headlineAlign === 'center' && 'text-center',
    headlineAlign === 'left' && 'text-left',
    headlineSize === 'xs' && 'text-xl sm:text-2xl',
    headlineSize === 'sm' && 'text-2xl sm:text-3xl',
    headlineSize === 'md' && 'text-3xl sm:text-4xl',
    headlineSize === 'lg' && 'text-4xl sm:text-5xl',
    headlineSize === 'xl' && 'text-4xl sm:text-5xl md:text-6xl',
    headlineSize === '2xl' && 'text-5xl sm:text-6xl md:text-7xl',
    headlineSize === '3xl' && 'text-6xl sm:text-7xl md:text-8xl',
    headlineWeight === 'bold' && 'font-bold',
    headlineWeight === 'extrabold' && 'font-extrabold',
    headlineWeight === 'black' && 'font-black',
    headlineShadow && 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]',
    headlineMarginBottom === 'sm' && 'mb-2',
    headlineMarginBottom === 'md' && 'mb-3.5',
    headlineMarginBottom === 'lg' && 'mb-5'
  );

  // Modal styling classes
  const shapeClass = {
    'rounded-3xl': 'rounded-3xl',
    'rounded-2xl': 'rounded-2xl',
    'rounded-capsule': 'rounded-[36px] sm:rounded-[44px]',
    'rounded-asymmetric': 'rounded-tr-[44px] rounded-bl-[44px] rounded-tl-2xl rounded-br-2xl',
    'rounded-sharp': 'rounded-lg',
  }[modalShape] || 'rounded-3xl';

  const blurClass = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }[modalBackdropBlur] || 'backdrop-blur-md';

  const effectClass = {
    glass: 'bg-white/95 dark:bg-slate-900/95 border border-white/30 dark:border-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl',
    neon: 'bg-slate-950 border-2 border-indigo-500 shadow-[0_0_35px_rgba(99,102,241,0.4)] text-white',
    aura: 'bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-950 border border-indigo-500/40 shadow-[0_0_45px_rgba(79,70,229,0.3)] text-white',
    'shadow-luxury': 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_30px_70px_rgba(0,0,0,0.45)]',
    flat: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl',
    'gradient-border': 'bg-slate-900 border-2 border-transparent bg-clip-padding shadow-2xl relative',
  }[modalEffect] || 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl';

  const maxWidthClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[modalMaxWidth] || 'max-w-xl';

  // Section background behind video style
  const sectionBgStyle: React.CSSProperties = {
    backgroundColor:
      backgroundType === 'solid' && backgroundColor !== 'transparent'
        ? backgroundColor
        : undefined,
    backgroundImage:
      backgroundType === 'image' && backgroundImageUrl
        ? `url(${backgroundImageUrl})`
        : backgroundType === 'gradient'
        ? `linear-gradient(${
            backgroundGradientDirection === 'to-t'
              ? 'to top'
              : backgroundGradientDirection === 'to-r'
              ? 'to right'
              : backgroundGradientDirection === 'to-l'
              ? 'to left'
              : backgroundGradientDirection === 'to-br'
              ? 'to bottom right'
              : 'to bottom'
          }, ${backgroundGradientFrom}, ${backgroundGradientTo})`
        : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  // CTA Button Sizing & Positioning Classes (Requirements א + ג)
  const ctaSizeClasses = clsx(
    // Height & Padding
    ctaButton.buttonSize === 'compact' && 'py-1.5 px-3.5',
    ctaButton.buttonSize === 'normal' && 'py-2.5 px-5',
    ctaButton.buttonSize === 'spacious' && 'py-3.5 px-7',
    ctaButton.buttonSize === 'huge' && 'py-4.5 px-9',
    ctaButton.buttonSize === 'fullWidth' && 'py-3.5 w-full',
    // Width Mode
    ctaButton.widthMode === 'full' && 'w-full',
    ctaButton.widthMode === 'auto' && 'w-auto max-w-full',
    // Font size
    ctaButton.fontSize === 'xs' && 'text-xs',
    ctaButton.fontSize === 'sm' && 'text-xs sm:text-sm',
    ctaButton.fontSize === 'md' && 'text-sm sm:text-base',
    ctaButton.fontSize === 'lg' && 'text-base sm:text-lg',
    ctaButton.fontSize === 'xl' && 'text-lg sm:text-xl',
    // Shape
    ctaButton.shape === 'capsule' && 'rounded-full',
    ctaButton.shape === 'square' && 'rounded-none',
    (!ctaButton.shape || ctaButton.shape === 'rounded') && 'rounded-2xl',
    ctaButton.pulseEffect && 'animate-pulse hover:animate-none'
  );

  const iconSizeClass = clsx(
    ctaButton.iconSize === 'sm' && 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    ctaButton.iconSize === 'lg' && 'w-5 h-5 sm:w-6 sm:h-6',
    (!ctaButton.iconSize || ctaButton.iconSize === 'md') && 'w-4 h-4 sm:w-5 sm:h-5'
  );

  return (
    <section
      id={anchorId || 'tiktok-hero'}
      className="relative w-full py-8 md:py-16 px-4 sm:px-6 overflow-hidden flex flex-col items-center justify-center min-h-[600px] md:min-h-[850px]"
      style={sectionBgStyle}
      dir="rtl"
    >
      {/* 1. Ambient Glow Backdrop Behind Video (דרישה ד: רקע מאחורי הוידאו) */}
      {ambientGlow && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[600px] sm:h-[800px] rounded-full blur-[100px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${ambientGlowColor} 0%, transparent 70%)`,
              opacity: (ambientGlowOpacity ?? 20) / 100,
            }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full blur-[90px] pointer-events-none"
            style={{
              backgroundColor: ambientGlowColor,
              opacity: ((ambientGlowOpacity ?? 20) * 0.75) / 100,
            }}
          />
        </>
      )}

      {/* Top Headline Outside Frame (אם הוגדר מיקום top) */}
      {(showHeadline ?? true) && headline && headlinePosition === 'top' && (
        <div className="w-full max-w-2xl px-4 z-20 mb-4 sm:mb-6">
          <h1 className={headlineClass} style={{ color: headlineColor }}>
            {headline}
          </h1>
        </div>
      )}

      {/* 2. TikTok 9:16 Frame Container */}
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] md:max-w-[430px] aspect-[9/16] rounded-[32px] sm:rounded-[38px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[3px] sm:border-[4px] border-slate-800/80 bg-black flex flex-col justify-between p-4 sm:p-5 select-none transition-transform duration-300 hover:shadow-indigo-500/10">
        
        {/* Video Element */}
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          poster={effectivePosterUrl}
          autoPlay={video.autoplay ?? true}
          loop={video.loop ?? true}
          muted={isMuted}
          playsInline
          onCanPlay={() => setIsVideoLoaded(true)}
          onPlaying={() => setIsVideoLoaded(true)}
          onLoadedData={() => setIsVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* KOSUN Luxury Animated Video Preloader */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 z-[2] bg-gradient-to-b from-slate-950 via-slate-900 to-black flex flex-col items-center justify-center gap-3 select-none animate-in fade-in transition-opacity duration-700">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-400/30 to-indigo-500/20 animate-ping absolute" />
              <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center relative backdrop-blur-md">
                <img
                  src="/images/kosun-symbol.svg"
                  alt="KOSUN"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
                  }}
                  className="w-9 h-9 object-contain drop-shadow-md animate-pulse"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span className="text-[11px] font-bold text-slate-200">קושאן • טוען סרטון...</span>
            </div>
          </div>
        )}

        {/* Overlay Layer (דרישה ד: שכבת רקע וציפוי לפני הוידאו - Foreground Overlay) */}
        {overlay.mode !== 'none' && (
          <div
            className={clsx(
              'absolute inset-0 z-[1] pointer-events-none transition-opacity',
              overlay.blur === 'sm' && 'backdrop-blur-xs',
              overlay.blur === 'md' && 'backdrop-blur-sm',
              overlay.blur === 'lg' && 'backdrop-blur-md',
              overlay.mode === 'vignette' && 'bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]',
              overlay.mode === 'gradient' &&
                (overlay.gradientDirection === 'to-t'
                  ? 'bg-gradient-to-t from-black/90 via-black/30 to-black/60'
                  : overlay.gradientDirection === 'to-r'
                  ? 'bg-gradient-to-r from-black/80 via-transparent to-black/80'
                  : overlay.gradientDirection === 'to-l'
                  ? 'bg-gradient-to-l from-black/80 via-transparent to-black/80'
                  : 'bg-gradient-to-b from-black/70 via-black/20 to-black/90')
            )}
            style={{
              backgroundColor: overlay.mode === 'solid' ? overlay.solidColor || '#000000' : undefined,
              backgroundImage: overlay.mode === 'image' && overlay.imageUrl ? `url(${overlay.imageUrl})` : undefined,
              opacity: (overlay.opacity ?? 40) / 100,
            }}
          />
        )}

        {/* TOP LAYER: Authentic TikTok/Reels Badges & Controls */}
        <div className="relative z-10 flex flex-col gap-2 w-full pt-1">
          <div className="flex items-center justify-between w-full">
            {/* Top Left: Sound Toggle & Optional Video Tag */}
            <div className="flex items-center gap-2">
              {(video.showMuteButton ?? true) && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs backdrop-blur-md border border-white/20 transition cursor-pointer"
                  title={isMuted ? 'בטל השתקה' : 'השתק'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              )}
              {video.showTopBadges && (video.showBadge ?? true) && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-md border border-blue-400/30">
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>{video.badgeText || 'VIDEO'}</span>
                </div>
              )}
            </div>

            {/* Top Right: Optional Timer & Episode Pill */}
            {video.showTopBadges && (
              <div className="flex items-center gap-1.5">
                {video.durationText && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 text-slate-200 text-[10px] font-mono backdrop-blur-md border border-white/10">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{video.durationText}</span>
                  </div>
                )}
                {video.seasonEpisodeText && (
                  <div className="px-2 py-0.5 rounded-full bg-purple-600/80 text-white text-[10px] font-bold backdrop-blur-md border border-purple-400/30">
                    {video.seasonEpisodeText}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Headline Inside Top Position */}
          {(showHeadline ?? true) && headline && headlinePosition === 'inside-top' && (
            <h1 className={headlineClass} style={{ color: headlineColor }}>
              {headline}
            </h1>
          )}
        </div>

        {/* MIDDLE LAYER: Central Elements, Floating Card & Attached CTA Button */}
        <div
          className={clsx(
            'relative z-10 flex flex-col items-center w-full gap-3 transition-all',
            card?.position === 'top' && 'mt-2 mb-auto',
            card?.position === 'center' && 'my-auto',
            (!card?.position || card?.position === 'bottom') && 'mt-auto mb-2'
          )}
        >
          {/* Main Headline Above Card Position */}
          {(showHeadline ?? true) && headline && headlinePosition === 'above-card' && (
            <h1 className={headlineClass} style={{ color: headlineColor }}>
              {headline}
            </h1>
          )}

          {/* Combined Card Container */}
          <div
            className={clsx(
              'w-full flex flex-col items-center',
              card?.width === 'compact' && 'max-w-[80%]',
              card?.width === 'wide' && 'max-w-[96%]',
              card?.width === 'full' && 'max-w-full',
              (!card?.width || card?.width === 'normal') && 'max-w-[92%]'
            )}
          >
            {/* Floating Card */}
            {(card?.enabled ?? true) && (
              (() => {
                const isCardImageVisible = (card?.showImage ?? true) && !!card?.imageUrl;
                const isCardTagVisible = (card?.showTag ?? true) && !!card?.tag;
                const isCardTextVisible = (card?.showText ?? true) && (!!card?.title || !!card?.subtitle);
                const hasCardContent = isCardImageVisible || isCardTagVisible || isCardTextVisible;

                if (!hasCardContent) return null;

                return (
                  <div
                    style={{
                      backgroundColor: card.bgColor || undefined,
                      borderColor: card.borderColor || undefined,
                    }}
                    className={clsx(
                      'w-full text-right backdrop-blur-xl transition-all shadow-xl',
                      // Shape
                      card.shape === 'capsule' && 'rounded-[32px]',
                      card.shape === 'square' && 'rounded-none',
                      card.shape === 'asymmetric' && 'rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg',
                      (!card.shape || card.shape === 'rounded') && 'rounded-2xl',
                      // Padding
                      card.padding === 'compact' && 'p-2.5 sm:p-3',
                      card.padding === 'spacious' && 'p-5 sm:p-6',
                      (!card.padding || card.padding === 'normal') && 'p-3.5 sm:p-4',
                      // Style
                      card?.style === 'glass'
                        ? 'bg-white/85 dark:bg-slate-900/85 border border-white/40 dark:border-slate-700/60 text-slate-900 dark:text-white'
                        : card?.style === 'bordered'
                        ? 'bg-slate-950/85 border-2 border-indigo-500/60 text-white'
                        : 'bg-white text-slate-900 border border-slate-100 shadow-2xl',
                      // Alignment
                      card.textAlign === 'center' && 'text-center',
                      card.textAlign === 'left' && 'text-left',
                      (!card.textAlign || card.textAlign === 'right') && 'text-right'
                    )}
                  >
                    {isCardImageVisible && (
                      <div className="flex items-center justify-center mb-2.5 overflow-hidden rounded-xl">
                        <img
                          src={card.imageUrl}
                          alt={card.title || 'תמונת כרטיס'}
                          className="max-h-28 sm:max-h-36 w-auto object-cover rounded-xl"
                        />
                      </div>
                    )}
                    {isCardTagVisible && (
                      <div
                        className={clsx(
                          'flex mb-2',
                          card.textAlign === 'center' && 'justify-center',
                          card.textAlign === 'left' && 'justify-start',
                          (!card.textAlign || card.textAlign === 'right') && 'justify-end'
                        )}
                      >
                        <span
                          style={{
                            color: card.tagColor || undefined,
                            backgroundColor: card.tagBgColor || undefined,
                          }}
                          className={clsx(
                            'inline-block px-3 py-0.5 rounded-full font-semibold border',
                            card.tagSize === 'sm' && 'text-xs',
                            card.tagSize === 'md' && 'text-sm',
                            (!card.tagSize || card.tagSize === 'xs') && 'text-[11px]',
                            !card.tagBgColor && 'bg-blue-50 text-blue-700 border-blue-200/60'
                          )}
                        >
                          {card.tag}
                        </span>
                      </div>
                    )}
                    {isCardTextVisible && (
                      <>
                        {card?.title && (
                          <h3
                            style={{ color: card.titleColor || undefined }}
                            className={clsx(
                              'font-black leading-snug',
                              card.titleSize === 'xs' && 'text-xs sm:text-sm',
                              card.titleSize === 'sm' && 'text-sm sm:text-base',
                              card.titleSize === 'lg' && 'text-lg sm:text-xl',
                              card.titleSize === 'xl' && 'text-xl sm:text-2xl',
                              (!card.titleSize || card.titleSize === 'md') && 'text-base sm:text-lg',
                              !card.titleColor && 'text-slate-900 dark:text-white'
                            )}
                          >
                            {card.title}
                          </h3>
                        )}
                        {card?.subtitle && (
                          <p
                            style={{ color: card.subtitleColor || undefined }}
                            className={clsx(
                              'mt-1.5 leading-relaxed font-normal',
                              card.subtitleSize === 'xs' && 'text-[11px] sm:text-xs',
                              card.subtitleSize === 'md' && 'text-xs sm:text-sm',
                              (!card.subtitleSize || card.subtitleSize === 'sm') && 'text-[12px] sm:text-xs',
                              !card.subtitleColor && 'text-slate-600 dark:text-slate-300'
                            )}
                          >
                            {card.subtitle}
                          </p>
                        )}
                      </>
                    )}

                    {/* Inside-Card CTA Button Placement */}
                    {ctaButton.position === 'inside-card' && (
                      <div className="mt-3.5 pt-2 border-t border-slate-100/30 flex justify-center w-full">
                        <button
                          type="button"
                          onClick={handleCtaClick}
                          style={{
                            backgroundColor: ctaButton.bgColor || '#0284c7',
                            color: ctaButton.textColor || '#ffffff',
                            width: ctaButton.widthMode === 'fixed' && ctaButton.customWidthPx ? `${ctaButton.customWidthPx}px` : undefined,
                          }}
                          className={clsx(
                            'font-black tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
                            ctaSizeClasses
                          )}
                        >
                          {ctaButton.showIcon && ctaButton.iconPosition === 'right' && (
                            ctaButton.customIconUrl ? (
                              <img src={ctaButton.customIconUrl} alt="icon" className={clsx(iconSizeClass, 'object-contain shrink-0 rounded')} />
                            ) : (
                              <DynamicIcon name={ctaButton.iconName || 'Sparkles'} className={clsx(iconSizeClass, 'shrink-0')} />
                            )
                          )}
                          <span className="leading-tight">{ctaButton.text || 'מצא עכשיו'}</span>
                          {ctaButton.showIcon && ctaButton.iconPosition !== 'right' && (
                            ctaButton.customIconUrl ? (
                              <img src={ctaButton.customIconUrl} alt="icon" className={clsx(iconSizeClass, 'object-contain shrink-0 rounded')} />
                            ) : (
                              <DynamicIcon name={ctaButton.iconName || 'Sparkles'} className={clsx(iconSizeClass, 'shrink-0')} />
                            )
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}

            {/* Below-Card or Standard Attached CTA Button Placement (סעיף ג: קביעת גודל הכפתור שנמצא מעל הוידאו) */}
            {ctaButton.position !== 'inside-card' && (
              <div
                className={clsx(
                  'w-full px-[14px] z-20 flex',
                  ctaButton.align === 'center' && 'justify-center',
                  ctaButton.align === 'right' && 'justify-end',
                  ctaButton.align === 'left' && 'justify-start',
                  (!ctaButton.align || ctaButton.align === 'stretch') && 'justify-center w-full',
                  (card?.enabled ?? true) &&
                    (((card?.showImage ?? true) && card?.imageUrl) ||
                      ((card?.showTag ?? true) && card?.tag) ||
                      ((card?.showText ?? true) && (card?.title || card?.subtitle)))
                    ? '-mt-3'
                    : 'mt-2'
                )}
              >
                <button
                  type="button"
                  onClick={handleCtaClick}
                  style={{
                    backgroundColor: ctaButton.bgColor || '#0284c7',
                    color: ctaButton.textColor || '#ffffff',
                    width: ctaButton.widthMode === 'fixed' && ctaButton.customWidthPx ? `${ctaButton.customWidthPx}px` : undefined,
                  }}
                  className={clsx(
                    'font-black tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
                    ctaSizeClasses
                  )}
                >
                  {/* Icon on Right Side */}
                  {ctaButton.showIcon && ctaButton.iconPosition === 'right' && (
                    ctaButton.customIconUrl ? (
                      <img src={ctaButton.customIconUrl} alt="icon" className={clsx(iconSizeClass, 'object-contain shrink-0 rounded')} />
                    ) : (
                      <DynamicIcon name={ctaButton.iconName || 'Sparkles'} className={clsx(iconSizeClass, 'shrink-0')} />
                    )
                  )}

                  <span className="leading-tight">{ctaButton.text || 'מצא עכשיו'}</span>

                  {/* Icon on Left Side */}
                  {ctaButton.showIcon && ctaButton.iconPosition !== 'right' && (
                    ctaButton.customIconUrl ? (
                      <img src={ctaButton.customIconUrl} alt="icon" className={clsx(iconSizeClass, 'object-contain shrink-0 rounded')} />
                    ) : (
                      <DynamicIcon name={ctaButton.iconName || 'Sparkles'} className={clsx(iconSizeClass, 'shrink-0')} />
                    )
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM LAYER: Sound Equalizer */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-full pb-2">
          {(video.showSoundWaveAnimation ?? true) && (
            <div className="flex items-center justify-center gap-1 w-full pt-1 opacity-70">
              <span className="w-1 h-3 bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-5 bg-white/90 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2.5 bg-white/70 rounded-full animate-bounce [animation-delay:-0.4s]" />
              <span className="w-1 h-4 bg-white/80 rounded-full animate-bounce" />
              <span className="w-1 h-3 bg-white/70 rounded-full animate-bounce [animation-delay:-0.2s]" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Popup Lead Form Modal - 100% Delegated to KSF via CapabilitySlot (סעיף ב) */}
      {isModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 ${blurClass} animate-in fade-in duration-200`}>
          <div
            style={modalBgColor ? { backgroundColor: modalBgColor } : undefined}
            className={`relative w-full ${maxWidthClass} max-h-[92vh] overflow-y-auto ${shapeClass} ${effectClass} p-6 sm:p-8 text-right animate-in zoom-in-95 duration-200`}
            dir="rtl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{modalTitle}</h2>
              {modalSubtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{modalSubtitle}</p>}
            </div>

            {/* Form Execution via KSF CapabilitySlot - Zero cross-import & Zero hardcoded form runner (סעיף ב) */}
            <CapabilitySlot
              name="form-renderer"
              props={{
                formId,
                form: propForm,
                submitButtonText: modalButtonText,
                submitButtonSize: modalButtonSize,
                submitButtonFontSize: modalButtonFontSize,
                submitButtonBgColor: modalButtonBgColor,
                submitButtonTextColor: modalButtonTextColor,
                submitButtonShape: modalButtonShape,
                onComplete: () => {
                  setTimeout(() => {
                    setIsModalOpen(false);
                  }, 1800);
                },
              }}
              fallback={
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-2xl">
                  טוען טופס KSF...
                </div>
              }
            />
          </div>
        </div>
      )}
    </section>
  );
};
