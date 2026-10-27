import React, { useState } from 'react';
import { X, Loader2, ChevronDown, ChevronLeft } from 'lucide-react';
import { KosActionItem, KosActionMenuSheetProps } from './types';
import { KosDynamicIcon } from './KosCloudStoreIconPicker';

export const KosActionMenuSheet: React.FC<KosActionMenuSheetProps> = ({
  isOpen,
  onClose,
  profile,
  headerTitle,
  headerSubtitle,
  items,
  onItemClick,
  openTabId: controlledOpenTabId,
  onToggleTab: controlledOnToggleTab,
  slotHeaderExtra,
  slotFooterExtra,
  className = '',
}) => {
  // ברירת מחדל: כל הלשוניות סגורות (null), לכל היותר אחת פתוחה
  const [internalOpenTabId, setInternalOpenTabId] = useState<string | null>(null);

  const activeTabId = controlledOpenTabId !== undefined ? controlledOpenTabId : internalOpenTabId;

  const toggleTab = (id: string) => {
    const nextId = activeTabId === id ? null : id;
    if (controlledOnToggleTab) {
      controlledOnToggleTab(nextId);
    } else {
      setInternalOpenTabId(nextId);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* מעטפת הכרטיס המרכזי בעיצוב Cyberpunk / Cashwan Dark Glow */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md bg-[#0A0D18] border border-[#1A233A] rounded-[28px] p-4 sm:p-5 shadow-2xl text-right overflow-hidden flex flex-col max-h-[92vh] ${className}`}
        style={{
          boxShadow: '0 0 35px -5px rgba(0, 240, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* כותרת עליונה קבועה עם פרטי פרופיל וכפתור סגירה */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1A233A]/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור תפריט"
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3
                className="text-lg font-bold tracking-wide font-sans"
                style={{ color: '#F0F4FF' }}
              >
                {profile?.name || headerTitle || 'הגדרות'}
              </h3>
              {(profile?.emailOrSubtext || headerSubtitle) && (
                <p
                  className="text-xs font-mono tracking-tight mt-0.5"
                  style={{ color: '#00F0FF' }}
                >
                  {profile?.emailOrSubtext || headerSubtitle}
                </p>
              )}
            </div>

            {profile?.avatarUrl ? (
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.avatarAlt || profile.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-500/20"
                />
                {profile.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-cyan-400 border-2 border-[#0A0D18] rounded-full shadow-sm shadow-cyan-400" />
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-cyan-500/20 border border-white/20">
                {(profile?.name || headerTitle || 'K')[0]}
              </div>
            )}
          </div>
        </div>

        {slotHeaderExtra && <div className="mt-2.5 shrink-0">{slotHeaderExtra}</div>}

        {/* רשימת שורות ואקורדיון לשוניות - ברירת מחדל הכל סגור, מקסימום אחת פתוחה */}
        <div className="mt-3 space-y-2 overflow-y-auto pl-1 pr-1 flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isDanger = item.variant === 'danger';
            const hasSubContent = Boolean(item.description || item.subItems?.length || item.slotContent);
            const isTabOpen = activeTabId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isDanger
                    ? 'border-red-500/30 bg-[#1C0E16]/90'
                    : isTabOpen
                    ? 'border-cyan-500/50 bg-[#10172B] shadow-md shadow-cyan-950/30'
                    : 'border-[#1C2744] bg-[#0E1424]/90 hover:border-cyan-500/30'
                }`}
              >
                {/* כותרת הפריט הראשית (Header Row) */}
                <button
                  type="button"
                  disabled={item.disabled || item.isLoading}
                  onClick={() => {
                    if (hasSubContent) {
                      toggleTab(item.id);
                    }
                    onItemClick(item.id, item);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 text-right cursor-pointer transition-all ${
                    item.disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.99]'
                  }`}
                >
                  {/* צד שמאל: תגית פעולה + חץ פתיחה/סגירה אם יש לשונית */}
                  <div className="flex items-center gap-2">
                    {item.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : item.badgeText ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          isDanger
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-cyan-400 bg-cyan-500/10'
                        }`}
                        style={{ color: isDanger ? '#F87171' : '#00F0FF' }}
                      >
                        {item.badgeText}
                      </span>
                    ) : null}

                    {hasSubContent && (
                      <ChevronDown
                        className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${
                          isTabOpen ? 'rotate-180 text-cyan-300' : 'text-white/40'
                        }`}
                      />
                    )}
                  </div>

                  {/* צד ימין: אייקון מעוצב + כותרת ותיאור תמציתי */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <h4
                        className="text-sm font-bold tracking-tight transition-colors"
                        style={{ color: isDanger ? '#FCA5A5' : '#F0F4FF' }}
                      >
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p
                          className="text-xs mt-0.5"
                          style={{
                            color: isDanger ? 'rgba(252, 165, 165, 0.7)' : 'rgba(240, 244, 255, 0.65)',
                          }}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {item.icon && (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                          isDanger
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
                        }`}
                      >
                        <KosDynamicIcon icon={item.icon} className="w-5 h-5 text-cyan-400" />
                      </div>
                    )}
                  </div>
                </button>

                {/* תוכן הלשונית הנפתחת (Accordion Body) - שוליים פנימיים מוקפדים (p-3 sm:p-3.5) */}
                {hasSubContent && isTabOpen && (
                  <div className="p-3 sm:p-3.5 border-t border-[#1C2744] bg-[#070A14]/90 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                    {/* תיאור / הערות דינמיות */}
                    {item.description && (
                      <p
                        className="text-xs leading-relaxed text-[#A0AEC0] bg-[#0A0E1C] p-2.5 rounded-xl border border-white/5"
                        style={{ color: '#BAC7D5' }}
                      >
                        {item.description}
                      </p>
                    )}

                    {/* תת-פריטים דינמיים בלשונית (Sub-items) */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {item.subItems.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sub.onClick?.();
                              onItemClick(sub.id, {
                                id: sub.id,
                                title: sub.title,
                                subtitle: sub.subtitle,
                                icon: sub.icon,
                                badgeText: sub.badgeText,
                              });
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all text-right cursor-pointer"
                          >
                            {sub.badgeText && (
                              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                                {sub.badgeText}
                              </span>
                            )}
                            <div className="flex items-center gap-2.5">
                              <div>
                                <div className="text-xs font-bold" style={{ color: '#F0F4FF' }}>
                                  {sub.title}
                                </div>
                                {sub.subtitle && (
                                  <div className="text-[10px] text-white/50">{sub.subtitle}</div>
                                )}
                              </div>
                              {sub.icon && (
                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
                                  <KosDynamicIcon icon={sub.icon} className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* שקע תוכן מותאם לסוכנים הבאים */}
                    {item.slotContent && <div className="pt-1">{item.slotContent}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {slotFooterExtra && <div className="mt-2.5 shrink-0">{slotFooterExtra}</div>}
      </div>
    </div>
  );
};
