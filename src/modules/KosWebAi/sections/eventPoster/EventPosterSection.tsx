import React from 'react';
import { EventPosterSectionConfig } from '../../types/sectionConfigs';
import { resolveEventPosterTheme } from '../../utils/stylePresetTheme';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { eventBus } from '../../../../core/bridge/EventBus';
import { Calendar, Clock, Coins, MapPin, Mic, Music, Sparkles } from 'lucide-react';

export interface EventPosterSectionProps {
  config: EventPosterSectionConfig;
  onLeadSubmit?: (formData: any) => void;
}

export const EventPosterSection: React.FC<EventPosterSectionProps> = ({
  config,
  onLeadSubmit,
}) => {
  const theme = resolveEventPosterTheme(config.stylePreset, config.semanticStyle);
  const priceLines = Array.isArray(config.priceLines) ? config.priceLines : [];
  const hasCustomBg = Boolean(config.posterBackgroundImageUrl);
  const isPrintExact = hasCustomBg && config.posterBackgroundMode === 'print_exact';
  const showEmbeddedForm = config.showEmbeddedForm !== false;

  return (
    <section
      id={config.anchorId || `section-${config.id}`}
      dir="rtl"
      className={`py-8 md:py-14 px-3 sm:px-6 transition-all ${config.mobileHidden ? 'hidden md:block' : ''}`}
      style={{
        backgroundColor: config.backgroundColor || 'transparent',
        fontFamily: "'Heebo', sans-serif",
      }}
    >
      {/* Main Poster Card */}
      <div
        className="relative max-w-[680px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-2"
        style={{
          backgroundColor: hasCustomBg ? 'transparent' : theme.surfaceColor,
          color: theme.textColor,
          borderColor: theme.frameBorderColor,
        }}
      >
        {isPrintExact ? (
          <img
            src={config.posterBackgroundImageUrl}
            alt={config.headline || 'פלייר'}
            className="w-full h-auto block"
          />
        ) : (
          <div
            className={`relative flex flex-col justify-between ${
              hasCustomBg ? 'min-h-[860px] sm:min-h-[960px] pb-14' : ''
            }`}
            style={{
              backgroundImage: hasCustomBg
                ? `url(${config.posterBackgroundImageUrl})`
                : undefined,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Top-Left Atmospheric Venue Backdrop (only when no full poster background is set) */}
            {!hasCustomBg && config.venueImageUrl && (
              <div
                className="absolute top-0 left-0 w-1/2 h-64 bg-cover bg-center opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `url(${config.venueImageUrl})`,
                  maskImage: 'linear-gradient(to bottom right, black 20%, transparent 80%)',
                  WebkitMaskImage: 'linear-gradient(to bottom right, black 20%, transparent 80%)',
                }}
              />
            )}

            {/* Decorative Draped Accent Corners (hidden when user supplies print background) */}
            {!hasCustomBg && (
              <>
                <div
                  className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-25 blur-2xl pointer-events-none"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div
                  className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div
                  className="absolute top-1/3 -left-12 w-44 h-80 rounded-full opacity-15 blur-2xl pointer-events-none"
                  style={{ backgroundColor: theme.accentColor }}
                />
              </>
            )}

            {/* Top Header: Logo (Right) */}
            <div className="relative z-10 px-6 sm:px-10 pt-5 flex items-start justify-between">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt="לוגו"
                  className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
                />
              ) : (
                <div className="h-6" />
              )}
            </div>

            {/* Ornate Headline + Gold Flourish + Date Pill */}
            <div className="relative z-10 px-6 sm:px-10 pt-1 pb-2 text-center space-y-2.5">
              <div
                className="w-48 h-[2px] mx-auto rounded-full opacity-80"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accentColor}, transparent)`,
                }}
              />

              <h1
                className="text-4xl sm:text-5xl font-black leading-[1.08] tracking-tight drop-shadow-xs"
                style={{ color: theme.primaryColor }}
              >
                {config.headline}
              </h1>

              <div
                className="w-64 h-[2px] mx-auto rounded-full opacity-80"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accentColor}, transparent)`,
                }}
              />

              {config.dateBadge && (
                <div className="flex items-center justify-center gap-3 pt-1">
                  <span className="h-[1.5px] w-12 sm:w-20" style={{ backgroundColor: theme.accentColor }} />
                  <span
                    className="px-6 py-1 rounded-full text-sm sm:text-base font-extrabold border-2 shadow-sm"
                    style={{
                      backgroundColor: hasCustomBg ? 'rgba(246, 227, 180, 0.92)' : theme.cardBgColor,
                      borderColor: theme.frameBorderColor,
                      color: theme.textColor,
                    }}
                  >
                    {config.dateBadge}
                  </span>
                  <span className="h-[1.5px] w-12 sm:w-20" style={{ backgroundColor: theme.accentColor }} />
                </div>
              )}

              {config.subtitle && (
                <p
                  className={`text-xl sm:text-2xl font-extrabold pt-1 ${
                    hasCustomBg ? 'text-right pr-2 sm:pr-6 max-w-md ml-auto' : 'text-center'
                  }`}
                  style={{ color: theme.primaryColor }}
                >
                  {config.subtitle}
                </p>
              )}
            </div>

            {/* Split Middle: Highlight Card (Right) + Optional Speaker Portrait (Left) */}
            <div className="relative z-10 px-6 sm:px-10 py-2 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-7 flex flex-col justify-center">
                <div
                  className={`p-4 sm:p-5 rounded-2xl ${
                    hasCustomBg ? 'border border-amber-600/30 shadow-sm' : 'border-2 shadow-md'
                  }`}
                  style={{
                    backgroundColor: hasCustomBg ? 'rgba(245, 227, 186, 0.78)' : theme.cardBgColor,
                    borderColor: theme.frameBorderColor,
                  }}
                >
                  <p
                    className="text-xl sm:text-2xl font-black leading-snug text-center"
                    style={{ color: theme.textColor }}
                  >
                    {config.highlightTitle}
                  </p>
                  {config.highlightSpeaker && (
                    <p
                      className="text-base sm:text-lg font-extrabold text-center mt-1"
                      style={{ color: theme.primaryColor }}
                    >
                      {config.highlightSpeaker}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-5 flex justify-center">
                {config.speakerImageUrl ? (
                  <div
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 shadow-xl"
                    style={{ borderColor: theme.frameBorderColor }}
                  >
                    <img
                      src={config.speakerImageUrl}
                      alt={config.highlightSpeaker || 'אורחת'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : !hasCustomBg ? (
                  <div
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-xs opacity-60"
                    style={{ borderColor: theme.frameBorderColor }}
                  >
                    <Sparkles className="w-7 h-7 mb-1" style={{ color: theme.accentColor }} />
                    <span>תמונת דוברת / אורחת</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Central Ornate Featured Banner */}
            {(config.featuredBannerTopText || config.featuredBannerTitle) && (
              <div className="relative z-10 px-6 sm:px-10 py-2">
                <div
                  className="relative rounded-3xl px-6 py-4 text-center border-2 shadow-xl flex flex-col sm:flex-row items-center justify-center gap-3"
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderColor: theme.frameBorderColor,
                    color: '#ffffff',
                  }}
                >
                  {!hasCustomBg && (
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderColor: theme.accentColor,
                      }}
                    >
                      <Mic className="w-5 h-5" style={{ color: theme.accentColor }} />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {config.featuredBannerTopText && (
                      <p className="text-sm sm:text-base font-bold opacity-95">
                        {config.featuredBannerTopText}
                      </p>
                    )}
                    {config.featuredBannerTitle && (
                      <p className="text-2xl sm:text-3xl font-black tracking-tight">
                        {config.featuredBannerTitle}
                      </p>
                    )}
                  </div>
                  {!hasCustomBg && (
                    <Music className="w-5 h-5 hidden sm:block opacity-80" style={{ color: theme.accentColor }} />
                  )}
                </div>
              </div>
            )}

            {/* Secondary Description & Hospitality Pill */}
            <div className="relative z-10 px-6 sm:px-10 py-2 text-center space-y-2.5">
              {config.featuredDescription && (
                <p
                  className="text-lg sm:text-xl font-extrabold whitespace-pre-line leading-relaxed"
                  style={{ color: theme.primaryColor }}
                >
                  {config.featuredDescription}
                </p>
              )}

              {config.hospitalityBadge && (
                <div className="flex items-center justify-center gap-3">
                  <span className="h-[1.5px] w-10 sm:w-16" style={{ backgroundColor: theme.accentColor }} />
                  <span
                    className="px-6 py-1 rounded-full text-sm sm:text-base font-extrabold border-2 shadow-xs"
                    style={{
                      backgroundColor: hasCustomBg ? 'rgba(246, 227, 180, 0.92)' : theme.cardBgColor,
                      borderColor: theme.frameBorderColor,
                      color: theme.textColor,
                    }}
                  >
                    {config.hospitalityBadge}
                  </span>
                  <span className="h-[1.5px] w-10 sm:w-16" style={{ backgroundColor: theme.accentColor }} />
                </div>
              )}
            </div>

            {/* 3-Column Gold-Bordered Event Details Strip */}
            <div className="relative z-10 px-6 sm:px-10 py-2">
              <div
                className="grid grid-cols-1 sm:grid-cols-3 rounded-2xl border-2 overflow-hidden shadow-sm"
                style={{
                  backgroundColor: hasCustomBg ? 'rgba(253, 246, 227, 0.88)' : theme.cardBgColor,
                  borderColor: theme.frameBorderColor,
                }}
              >
                <div
                  className="p-3.5 flex items-center justify-center gap-2 border-b sm:border-b-0 sm:border-l"
                  style={{ borderColor: theme.frameBorderColor }}
                >
                  <Calendar className="w-5 h-5 shrink-0" style={{ color: theme.accentColor }} />
                  <span className="font-extrabold text-sm whitespace-pre-line text-center">
                    {config.eventDateLabel}
                  </span>
                </div>

                <div
                  className="p-3.5 flex items-center justify-center gap-2 border-b sm:border-b-0 sm:border-l"
                  style={{ borderColor: theme.frameBorderColor }}
                >
                  <Clock className="w-5 h-5 shrink-0" style={{ color: theme.accentColor }} />
                  <span className="font-black text-xl sm:text-2xl font-mono">
                    {config.eventTimeLabel}
                  </span>
                </div>

                <div className="p-3.5 flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 shrink-0" style={{ color: theme.accentColor }} />
                  <div className="text-xs sm:text-sm font-extrabold leading-snug text-right">
                    {priceLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Closing Quote & Address */}
            <div className="relative z-10 px-6 sm:px-10 pt-2 pb-4 text-center space-y-1.5">
              {config.closingQuote && (
                <p
                  className="text-base sm:text-lg font-bold italic whitespace-pre-line leading-relaxed"
                  style={{ color: theme.textColor }}
                >
                  {config.closingQuote}
                </p>
              )}
              {config.addressText && (
                <div
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-extrabold pt-0.5"
                  style={{ color: theme.primaryColor }}
                >
                  <MapPin className="w-4 h-4" style={{ color: theme.accentColor }} />
                  <span>{config.addressText}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom KFS Smart Form Slot (Matching Flyer Palette 1:1) */}
        {showEmbeddedForm && (
          <div
            id="event-poster-kfs-form"
            className="relative z-10 px-4 sm:px-8 py-6 border-t-2"
            style={{
              borderColor: theme.frameBorderColor,
              backgroundColor: theme.surfaceColor,
              color: theme.textColor,
            }}
          >
            {(config.formTitle || config.formSubtitle) && (
              <div className="text-center mb-4 space-y-1">
                {config.formTitle && (
                  <h2
                    className="text-xl sm:text-2xl font-black"
                    style={{ color: theme.primaryColor }}
                  >
                    {config.formTitle}
                  </h2>
                )}
                {config.formSubtitle && (
                  <p className="text-xs sm:text-sm opacity-80">{config.formSubtitle}</p>
                )}
              </div>
            )}

            <CapabilitySlot
              name="form-renderer"
              props={{
                formId: config.formId || undefined,
                submitButtonText: config.submitButtonText || 'שמירת מקום והרשמה',
                submitButtonBgColor: theme.primaryColor,
                submitButtonTextColor: '#ffffff',
                themeOverride: {
                  primaryColor: theme.primaryColor,
                  accentColor: theme.accentColor,
                  cardBackground: theme.cardBgColor,
                  backgroundColor: theme.surfaceColor,
                  textColor: theme.textColor,
                  displayMode: 'standard_card',
                },
                onComplete: (answers: Record<string, any>, submissionId: string) => {
                  eventBus.publish('smart_form:submitted', {
                    formId: config.formId || `form_${config.id}`,
                    formTitle: config.formTitle || config.headline,
                    submissionId,
                    data: answers,
                    submittedAt: new Date().toISOString(),
                  });
                  onLeadSubmit?.(answers);
                },
              }}
              fallback={
                <div
                  className="p-6 rounded-2xl border text-center text-sm"
                  style={{
                    backgroundColor: theme.cardBgColor,
                    borderColor: theme.frameBorderColor,
                    color: theme.textColor,
                  }}
                >
                  בחר טופס KFS בהגדרות האזור כדי להציג כאן את טופס ההרשמה והסליקה.
                </div>
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};
