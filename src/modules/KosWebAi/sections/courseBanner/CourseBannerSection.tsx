import React from 'react';
import {
  CourseBannerSectionConfig,
  CourseBannerLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  CheckCircle2,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Shield,
  Compass,
  Crosshair,
  Activity,
  Layers,
  MessageCircle,
  Award,
  Users,
} from 'lucide-react';
import { clsx } from 'clsx';

export const CourseBannerSection: React.FC<{ config: CourseBannerSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  // Destructure config
  const {
    anchorId = 'mainContent',
    title,
    subtitle,
    badge,
    titleColor,
    subtitleColor,
    badgeColor,
    cardBackgroundColor,
    imageSrc,
    imageAlt,
    imagePosition = 'left',
    features = [],
    buttonsVisible = true,
    primaryButton,
    secondaryButton,
    backgroundColor = 'transparent',
    bottomStripeColor,
    layout = 'standard',
    objectScale = 'normal',
    buttonShape = 'auto',
    buttonSize = 'normal',
    textBgEnabled = false,
    textBgImageUrl,
    textBgOverlayColor = '#000000',
    textBgOverlayOpacity = 0.6,
    textBgEffect = 'zoom-glow',
    textBgScope = 'card',
  } = config;

  // Derive Brand DNA defaults if fields are missing
  const companyName = brandDna?.identity?.companyName || '';
  const brandSlogan = brandDna?.identity?.slogan || '';
  const brandVibeImages = brandDna?.identity?.vibeImages || [];
  const brandLogo = brandDna?.identity?.logoUrl || '';
  const brandPhone = brandDna?.trust?.contactPhone || '';
  const brandWhatsapp = brandDna?.trust?.whatsappSupportNumber || brandPhone || '';
  const brandServices = brandDna?.ecosystem?.services || [];

  const effectiveTitle =
    title ||
    (companyName
      ? `הצטרפו לתכנית ההכשרה והמומחיות של ${companyName}`
      : 'הצטרפו למחזור ההכשרה המקצועי הקרוב');

  const effectiveSubtitle =
    subtitle || (brandSlogan ? `${brandSlogan} • הרשמה מוקדמת` : 'הרשמה מוקדמת בהנחה מיוחדת');

  const effectiveBadge =
    badge || (companyName ? `• ${companyName} ACADEMY •` : '• תכנית הדגל המקצועית •');

  const effectiveImage =
    imageSrc ||
    brandVibeImages[0] ||
    brandLogo ||
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80';

  const defaultFeatures = [
    companyName ? `ליווי אישי של מנטור צמוד מבית ${companyName}` : 'ליווי אישי של מנטור צמוד',
    'פרויקטים מעשיים מהעולם האמיתי',
    'תעודת הסמכה וליווי לתוצאות',
    'גישה לכל החיים להקלטות ומאגרי הידע',
  ];

  const effectiveFeatures =
    features && features.length > 0
      ? features
      : brandServices.length > 0
        ? [
            `מומחיות מעשית ב-${typeof brandServices[0] === 'string' ? brandServices[0] : (brandServices[0] as any).title}`,
            `כלים יישומיים ב-${typeof brandServices[1] === 'string' ? brandServices[1] : (brandServices[1] as any)?.title || 'פרקטיקה בשטח'}`,
            `תעודת הסמכה וליווי מבית ${companyName || 'המערכת'}`,
            'גישה בלעדית לקהילת הבוגרים ומאגרי המידע',
          ]
        : defaultFeatures;

  // Scale settings
  const getScaleClasses = () => {
    switch (objectScale) {
      case 'compact':
        return {
          cardP: 'p-6 sm:p-8',
          title: 'text-xl sm:text-2xl lg:text-3xl font-bold',
          sub: 'text-xs sm:text-sm',
          featureText: 'text-xs',
          featureGap: 'gap-2',
          imageSize: 'max-w-xs',
        };
      case 'large':
        return {
          cardP: 'p-10 sm:p-14 lg:p-16',
          title: 'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight',
          sub: 'text-base sm:text-lg',
          featureText: 'text-sm sm:text-base font-semibold',
          featureGap: 'gap-4',
          imageSize: 'max-w-md',
        };
      case 'massive':
        return {
          cardP: 'p-12 sm:p-16 lg:p-20',
          title: 'text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter',
          sub: 'text-lg sm:text-xl font-medium',
          featureText: 'text-base sm:text-lg font-bold',
          featureGap: 'gap-5',
          imageSize: 'max-w-lg',
        };
      case 'normal':
      default:
        return {
          cardP: 'p-8 sm:p-12',
          title: 'text-2xl sm:text-3xl lg:text-4xl font-extrabold',
          sub: 'text-sm sm:text-base',
          featureText: 'text-sm font-medium',
          featureGap: 'gap-3',
          imageSize: 'max-w-sm',
        };
    }
  };
  const scale = getScaleClasses();

  // Button Shape styling
  const getButtonShapeClass = () => {
    if (buttonShape === 'round') return 'rounded-full';
    if (buttonShape === 'pill') return 'rounded-full px-7';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'square') return 'rounded-lg';
    switch (layout) {
      case 'feminine':
        return 'rounded-full px-7';
      case 'masculine':
        return 'rounded-xl';
      case 'sharp':
        return 'rounded-none';
      case 'spiritual':
        return 'rounded-full px-7';
      case 'analytical':
        return 'rounded-md';
      default:
        return 'rounded-2xl';
    }
  };

  const getButtonSizeClass = () => {
    switch (buttonSize) {
      case 'compact':
        return 'px-4 py-2 text-xs';
      case 'large':
        return 'px-8 py-4 text-base font-black';
      case 'normal':
      default:
        return 'px-6 py-3 text-sm font-bold';
    }
  };

  // Text Background effect class
  const getTextBgEffectClass = (effect: HeroTextBgEffect) => {
    switch (effect) {
      case 'zoom-glow':
        return 'group-hover/bg:scale-105 group-hover/bg:brightness-110 transition-all duration-700';
      case 'shimmer-sweep':
        return 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:-translate-x-full group-hover/bg:after:translate-x-full after:transition-transform after:duration-1000';
      case 'float-parallax':
        return 'group-hover/bg:-translate-y-2 group-hover/bg:scale-[1.02] transition-all duration-500';
      case 'blur-reveal':
        return 'blur-[2px] group-hover/bg:blur-0 transition-all duration-500';
      case 'gradient-shift':
        return 'group-hover/bg:contrast-125 transition-all duration-700';
      default:
        return 'transition-transform duration-500 group-hover/bg:scale-105';
    }
  };

  // Render specific layout content
  const renderLayoutContent = () => {
    switch (layout) {
      case 'feminine':
        return renderFeminine();
      case 'masculine':
        return renderMasculine();
      case 'spiritual':
        return renderSpiritual();
      case 'sharp':
        return renderSharp();
      case 'analytical':
        return renderAnalytical();
      case 'standard':
      default:
        return renderStandard();
    }
  };

  // ----------------------------------------------------
  // LAYOUT 1: FEMININE (רך, אלגנטי, קשתות ורוז-גולד)
  // ----------------------------------------------------
  const renderFeminine = () => {
    const isImageRight = imagePosition === 'right';
    return (
      <div
        className={clsx(
          'relative rounded-[3rem] border border-rose-200/70 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/80 via-white to-pink-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-rose-950/30 shadow-2xl overflow-hidden',
          scale.cardP
        )}
        style={{ backgroundColor: cardBackgroundColor }}
      >
        {/* Top delicate badge */}
        <div className="flex justify-start mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-950/70 border border-rose-300/60 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs font-serif font-medium shadow-sm"
            style={{ color: badgeColor }}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>{effectiveBadge}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text & Features Column */}
          <div
            className={clsx(
              'flex flex-col gap-6 text-right',
              isImageRight ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-7 lg:order-2'
            )}
          >
            {effectiveSubtitle && (
              <span
                className={clsx(scale.sub, 'text-rose-600 dark:text-rose-300 font-serif tracking-wide block')}
                style={{ color: subtitleColor }}
              >
                {effectiveSubtitle}
              </span>
            )}

            <h2
              className={clsx(scale.title, 'font-serif text-stone-900 dark:text-rose-50 leading-tight')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>

            {/* Checklist items */}
            {effectiveFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
                {effectiveFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-300 shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className={clsx(scale.featureText, 'text-stone-700 dark:text-rose-100/90 leading-snug')}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {buttonsVisible && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 shadow-lg shadow-rose-500/20 bg-rose-600 hover:bg-rose-500 text-white transition-all hover:scale-105 cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                    style={{ backgroundColor: primaryButton.color }}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 bg-white/60 dark:bg-stone-900/60 hover:bg-rose-50 transition-all cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                  >
                    <MessageCircle className="w-4 h-4 text-rose-500" />
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Arched Boutique Image Column */}
          <div
            className={clsx(
              'w-full flex justify-center',
              isImageRight ? 'lg:col-span-5 lg:order-2' : 'lg:col-span-5 lg:order-1'
            )}
          >
            <div
              className={clsx(
                'relative rounded-t-[4rem] rounded-b-3xl overflow-hidden border-2 border-rose-200/80 dark:border-rose-900/50 shadow-2xl aspect-[4/5] w-full',
                scale.imageSize
              )}
            >
              <img
                src={effectiveImage}
                alt={imageAlt || effectiveTitle}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Bottom stripe */}
        <div
          className="absolute bottom-0 inset-x-0 h-1.5"
          style={{ backgroundColor: bottomStripeColor || '#f43f5e' }}
        />
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 2: MASCULINE (עוצמתי, פחם, זהב פליז מטאלי)
  // ----------------------------------------------------
  const renderMasculine = () => {
    const isImageRight = imagePosition === 'right';
    return (
      <div
        className={clsx(
          'relative rounded-2xl border-2 border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black shadow-2xl overflow-hidden text-white',
          scale.cardP
        )}
        style={{ backgroundColor: cardBackgroundColor }}
      >
        {/* Top Shield Badge */}
        <div className="flex justify-start mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider"
            style={{ color: badgeColor }}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>{effectiveBadge}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div
            className={clsx(
              'flex flex-col gap-6 text-right',
              isImageRight ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-7 lg:order-2'
            )}
          >
            {effectiveSubtitle && (
              <span
                className={clsx(scale.sub, 'text-zinc-400 font-mono tracking-wide uppercase block')}
                style={{ color: subtitleColor }}
              >
                {effectiveSubtitle}
              </span>
            )}

            <h2
              className={clsx(scale.title, 'font-black uppercase tracking-tight text-white leading-tight')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>

            {/* Checklist items */}
            {effectiveFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
                {effectiveFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className={clsx(scale.featureText, 'text-zinc-200 font-bold')}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {buttonsVisible && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                    style={{ backgroundColor: primaryButton.color }}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 border border-zinc-700 text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 transition-all cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                  >
                    <MessageCircle className="w-4 h-4 text-amber-400" />
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Solid Heavy Image */}
          <div
            className={clsx(
              'w-full flex justify-center',
              isImageRight ? 'lg:col-span-5 lg:order-2' : 'lg:col-span-5 lg:order-1'
            )}
          >
            <div
              className={clsx(
                'relative rounded-xl overflow-hidden border-2 border-zinc-800 hover:border-amber-500/60 shadow-2xl aspect-[4/3] sm:aspect-square w-full transition-colors',
                scale.imageSize
              )}
            >
              <img
                src={effectiveImage}
                alt={imageAlt || effectiveTitle}
                className="w-full h-full object-cover contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Metallic Gold Stripe */}
        <div
          className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"
          style={{ backgroundColor: bottomStripeColor }}
        />
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 3: SPIRITUAL (שלווה, מרווה, מנטה, הרמוני)
  // ----------------------------------------------------
  const renderSpiritual = () => {
    const isImageRight = imagePosition === 'right';
    return (
      <div
        className={clsx(
          'relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-emerald-950/20 shadow-2xl overflow-hidden text-emerald-50',
          scale.cardP
        )}
        style={{ backgroundColor: cardBackgroundColor }}
      >
        <div className="flex justify-start mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-light tracking-wide shadow-sm"
            style={{ color: badgeColor }}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span>{effectiveBadge}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div
            className={clsx(
              'flex flex-col gap-6 text-right',
              isImageRight ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-7 lg:order-2'
            )}
          >
            {effectiveSubtitle && (
              <span
                className={clsx(scale.sub, 'text-emerald-300/80 font-light tracking-wide block')}
                style={{ color: subtitleColor }}
              >
                {effectiveSubtitle}
              </span>
            )}

            <h2
              className={clsx(scale.title, 'font-medium text-emerald-50 leading-tight')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>

            {effectiveFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
                {effectiveFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className={clsx(scale.featureText, 'text-emerald-100/90 font-light leading-relaxed')}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {buttonsVisible && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xl shadow-emerald-900/30 transition-all hover:scale-105 cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                    style={{ backgroundColor: primaryButton.color }}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 border border-emerald-500/40 text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 transition-all cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div
            className={clsx(
              'w-full flex justify-center',
              isImageRight ? 'lg:col-span-5 lg:order-2' : 'lg:col-span-5 lg:order-1'
            )}
          >
            <div
              className={clsx(
                'relative rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-2xl aspect-square w-full',
                scale.imageSize
              )}
            >
              <img
                src={effectiveImage}
                alt={imageAlt || effectiveTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-1.5"
          style={{ backgroundColor: bottomStripeColor || '#10b981' }}
        />
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 4: SHARP (חד, הייטק, מונוכרום, ציאן, 90 מעלות)
  // ----------------------------------------------------
  const renderSharp = () => {
    const isImageRight = imagePosition === 'right';
    return (
      <div
        className={clsx(
          'relative rounded-none border border-zinc-800 bg-black shadow-2xl overflow-hidden text-white font-mono',
          scale.cardP
        )}
        style={{ backgroundColor: cardBackgroundColor }}
      >
        {/* HUD Corner Accents */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />

        <div className="flex justify-start mb-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-cyan-950/80 border border-cyan-500/60 text-cyan-400 text-xs font-mono uppercase tracking-widest"
            style={{ color: badgeColor }}
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>{effectiveBadge}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div
            className={clsx(
              'flex flex-col gap-6 text-right',
              isImageRight ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-7 lg:order-2'
            )}
          >
            {effectiveSubtitle && (
              <span
                className={clsx(scale.sub, 'text-cyan-400/90 font-mono tracking-widest block uppercase')}
                style={{ color: subtitleColor }}
              >
                {`// ${effectiveSubtitle}`}
              </span>
            )}

            <h2
              className={clsx(scale.title, 'font-mono font-bold tracking-tighter text-white uppercase leading-tight')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>

            {effectiveFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                {effectiveFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 border border-zinc-800 bg-zinc-950/80">
                    <span className="text-cyan-400 font-mono text-xs font-bold">[✓]</span>
                    <span className={clsx(scale.featureText, 'text-zinc-300 font-mono leading-tight')}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {buttonsVisible && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold uppercase tracking-wider transition-all cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                    style={{ backgroundColor: primaryButton.color }}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 border border-cyan-500/40 text-cyan-400 bg-black hover:bg-cyan-950/40 font-mono text-xs transition-all cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div
            className={clsx(
              'w-full flex justify-center',
              isImageRight ? 'lg:col-span-5 lg:order-2' : 'lg:col-span-5 lg:order-1'
            )}
          >
            <div
              className={clsx(
                'relative rounded-none overflow-hidden border border-cyan-500/50 shadow-2xl aspect-video sm:aspect-square w-full filter contrast-105',
                scale.imageSize
              )}
            >
              <img
                src={effectiveImage}
                alt={imageAlt || effectiveTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-1 bg-cyan-400"
          style={{ backgroundColor: bottomStripeColor }}
        />
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 5: ANALYTICAL (אנליטי, אינדקס נתונים, סדר קטלוגי)
  // ----------------------------------------------------
  const renderAnalytical = () => {
    const isImageRight = imagePosition === 'right';
    return (
      <div
        className={clsx(
          'relative rounded-2xl border border-slate-700 bg-slate-900/90 shadow-2xl overflow-hidden text-white',
          scale.cardP
        )}
        style={{ backgroundColor: cardBackgroundColor }}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold font-mono"
            style={{ color: badgeColor }}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>{effectiveBadge}</span>
          </div>

          <span className="text-xs font-mono text-slate-400">
            תכנית הכשרה מאומתת • {effectiveFeatures.length} יתרונות ליבה
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div
            className={clsx(
              'flex flex-col gap-6 text-right',
              isImageRight ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-7 lg:order-2'
            )}
          >
            {effectiveSubtitle && (
              <span
                className={clsx(scale.sub, 'text-slate-400 font-mono tracking-wide block')}
                style={{ color: subtitleColor }}
              >
                {effectiveSubtitle}
              </span>
            )}

            <h2
              className={clsx(scale.title, 'font-bold text-white leading-tight')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>

            {/* Numbered Index Features */}
            {effectiveFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                {effectiveFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800"
                  >
                    <span className="font-mono text-xs font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className={clsx(scale.featureText, 'text-slate-200')}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {buttonsVisible && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all hover:scale-105 cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                    style={{ backgroundColor: primaryButton.color }}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 border border-slate-700 text-slate-300 bg-slate-800/80 hover:bg-slate-700 transition-all cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                  >
                    <MessageCircle className="w-4 h-4 text-indigo-400" />
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div
            className={clsx(
              'w-full flex justify-center',
              isImageRight ? 'lg:col-span-5 lg:order-2' : 'lg:col-span-5 lg:order-1'
            )}
          >
            <div
              className={clsx(
                'relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl aspect-video sm:aspect-square w-full',
                scale.imageSize
              )}
            >
              <img
                src={effectiveImage}
                alt={imageAlt || effectiveTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-1.5"
          style={{ backgroundColor: bottomStripeColor || '#6366f1' }}
        />
      </div>
    );
  };

  // ----------------------------------------------------
  // LAYOUT 6: STANDARD (הפריסה המקורית של KOSUN)
  // ----------------------------------------------------
  const renderStandard = () => {
    const isImageRight = imagePosition === 'right';
    return (
      <div
        className={clsx(
          'relative max-w-6xl mx-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden',
          scale.cardP
        )}
        style={{ backgroundColor: cardBackgroundColor }}
      >
        {/* Top Accent Badge */}
        {effectiveSubtitle && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-6">
            <GraduationCap className="w-4 h-4" />
            <span>{effectiveSubtitle}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div
            className={clsx(
              'flex flex-col gap-6 text-right',
              isImageRight ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-7 lg:order-2'
            )}
          >
            <h2
              className={clsx(scale.title, 'text-slate-900 dark:text-white leading-tight')}
              style={{ color: titleColor }}
            >
              {effectiveTitle}
            </h2>

            {effectiveFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
                {effectiveFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className={clsx(scale.featureText, 'text-slate-700 dark:text-slate-300')}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {buttonsVisible && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {primaryButton?.text && (
                  <a
                    href={primaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                    style={{ backgroundColor: primaryButton.color }}
                  >
                    <span>{primaryButton.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
                {secondaryButton?.text && (
                  <a
                    href={secondaryButton.url || '#'}
                    className={clsx(
                      'inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 transition-all cursor-pointer',
                      getButtonShapeClass(),
                      getButtonSizeClass()
                    )}
                  >
                    <MessageCircle className="w-4 h-4 text-indigo-500" />
                    <span>{secondaryButton.text}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div
            className={clsx(
              'w-full flex justify-center',
              isImageRight ? 'lg:col-span-5 lg:order-2' : 'lg:col-span-5 lg:order-1'
            )}
          >
            <div
              className={clsx(
                'rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full aspect-video sm:aspect-square',
                scale.imageSize
              )}
            >
              <img
                src={effectiveImage}
                alt={imageAlt || effectiveTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom decorative stripe */}
        <div
          className="absolute bottom-0 inset-x-0 h-1.5"
          style={{ backgroundColor: bottomStripeColor || '#4f46e5' }}
        />
      </div>
    );
  };

  return (
    <section
      id={anchorId || 'mainContent'}
      className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Background Image behind entire section scope */}
      {textBgEnabled && textBgImageUrl && textBgScope === 'section' && (
        <div className="group/bg absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={textBgImageUrl}
            alt="section background"
            className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: textBgOverlayColor,
              opacity: textBgOverlayOpacity,
            }}
          />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Background Image behind card scope */}
        {textBgEnabled && textBgImageUrl && textBgScope === 'card' ? (
          <div className="group/bg relative rounded-3xl overflow-hidden">
            <img
              src={textBgImageUrl}
              alt="card background"
              className={clsx('absolute inset-0 w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: textBgOverlayColor,
                opacity: textBgOverlayOpacity,
              }}
            />
            <div className="relative z-10">{renderLayoutContent()}</div>
          </div>
        ) : (
          renderLayoutContent()
        )}
      </div>
    </section>
  );
};
