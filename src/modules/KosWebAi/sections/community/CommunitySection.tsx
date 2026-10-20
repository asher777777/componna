import React, { useState } from 'react';
import { CommunitySectionConfig } from '../../types/sectionConfigs';
import {
  MessageCircle,
  Heart,
  Users,
  Sparkles,
  Calendar,
  Lock,
  Unlock,
  Video,
  Send,
  Shield,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { subscribeToAuth, AuthState } from '../../../../services/firebaseAuth';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';

export const CommunitySection: React.FC<{ config: CommunitySectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'קהילת הארגון',
    subtitle = 'מרחב המפגש, העדכונים וההווי המשותף',
    description = 'מקום המפגש המרכזי לחברי הקהילה. כאן מתעדכנים, לוקחים חלק במפגשים ויוצרים חיבורים בעלי ערך.',
    quote,
    imageSrc,
    badgeTitle = 'קהילה פעילה',
    badgeSubtitle = 'חברים רשומים בטננט',
    buttonText = 'הצטרפות לקבוצת הוואטסאפ',
    whatsappNumber,
    backgroundColor = 'transparent',
    buttonVisible = true,
    badgeVisible = true,
    blueprint,
    gateMode = 'auto',
    showEventsCalendar = true,
    showStoriesFeed = true,
  } = config;

  // Real auth or simulated preview
  const [currentUser, setCurrentUser] = useState<AuthState['user'] | null>(null);

  React.useEffect(() => {
    const unsubscribe = subscribeToAuth(undefined, (state: AuthState) => {
      setCurrentUser(state.user);
    });
    return () => unsubscribe();
  }, []);

  const isActuallyLoggedIn = !!currentUser;

  const isMember =
    gateMode === 'simulate-member'
      ? true
      : gateMode === 'simulate-guest'
      ? false
      : isActuallyLoggedIn;

  const [activeTab, setActiveTab] = useState<'hub' | 'events' | 'stories' | 'chat'>('hub');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    { id: '1', author: 'מנהל הקהילה', text: 'שלום לכולם! ברוכים הבאים למרחב המפגש הקהילתי שלנו.', time: '10:00' },
    { id: '2', author: 'חבר קהילה', text: 'שמח להיות כאן, מצפה למפגש הקרוב!', time: '10:15' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const events = blueprint?.events || [];
  const stories = blueprint?.stories || [];
  const visibility = blueprint?.visibility || {
    hideMeetingLinksFromGuests: true,
    hideLiveChatFromGuests: true,
    hideMembersDirectoryFromGuests: true,
    guestJoinCtaText: 'הצטרפות לקהילת הארגון',
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !isMember) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        author: currentUser?.displayName || 'אני',
        text: newMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMsg('');
  };

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('שלום, אשמח להצטרף לקהילה!')}`
    : null;

  return (
    <section
      id={anchorId || 'community'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-50 via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Header Bar: Status Badge & Gate Switcher Preview */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                {blueprint?.name || title}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMember ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>חבר קהילה מחובר</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>מצב אורח (חלק מהתכנים נעולים)</span>
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 py-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hub'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            מרכז הקהילה
          </button>

          {showEventsCalendar && (
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>מפגשים ואירועים ({events.length})</span>
            </button>
          )}

          {showStoriesFeed && (
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'stories'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>הווי וסיפורים ({stories.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>חדר מפגש וצ'אט חי</span>
          </button>
        </div>

        {/* Tab 1: Community Hub Overview */}
        {activeTab === 'hub' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 animate-in fade-in">
            <div className="lg:col-span-7 flex flex-col gap-5 text-right">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {blueprint?.name || title}
              </h2>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {blueprint?.mission || description}
              </p>

              {blueprint?.visionAndGoals && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block mb-1">
                    יעדי הקהילה וחזונה:
                  </span>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300">
                    {blueprint.visionAndGoals}
                  </p>
                </div>
              )}

              {quote && (
                <div className="border-r-4 border-indigo-500 pr-4 py-1 text-sm text-indigo-700 dark:text-indigo-300 italic">
                  {quote}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!isMember ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{visibility.guestJoinCtaText || 'הצטרפות לקהילת הארגון'}</span>
                    </button>

                    {buttonVisible && whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{buttonText}</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>אתם חברים רשומים בקהילה זו! כל התכנים והמפגשים פתוחים עבורכם.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Side Card: Next Event or Teaser */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {events.length > 0 ? (
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      המפגש הבא של הקהילה
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold">
                      {events[0].type === 'zoom' ? 'Zoom' : 'מפגש פיזי'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {events[0].title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {events[0].description}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{events[0].date} {events[0].time ? `בשעה ${events[0].time}` : ''}</span>
                  </div>

                  {isMember ? (
                    events[0].locationOrUrl ? (
                      <a
                        href={events[0].locationOrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>הצטרפות למפגש כעת</span>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-center text-slate-500 font-bold">
                        קישור המפגש ישלח לקראת המועד
                      </div>
                    )
                  ) : (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>קישור המפגש וההצטרפות פתוחים לחברי קהילה רשומים בלבד.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                  בקרוב יפורסם מועד המפגש הקהילתי הבא.
                </div>
              )}

              {badgeVisible && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {badgeTitle}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {badgeSubtitle}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Events List */}
        {activeTab === 'events' && (
          <div className="pt-6 space-y-4 animate-in fade-in">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              לוח המפגשים והאירועים
            </h3>
            {events.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                טרם פורסמו מפגשים בקהילה זו.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {evt.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                          {evt.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{evt.date} {evt.time ? `• ${evt.time}` : ''}</span>
                      </span>

                      {isMember ? (
                        evt.locationOrUrl ? (
                          <a
                            href={evt.locationOrUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                          >
                            <span>כניסה למפגש</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">קישור יישלח בסמוך למועד</span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <Lock className="w-3 h-3" />
                          <span>נעול לאורחים</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Stories & Culture */}
        {activeTab === 'stories' && (
          <div className="pt-6 space-y-4 animate-in fade-in">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              סיפורים משותפים והווי הקהילה
            </h3>
            {stories.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                טרם פורסמו סיפורים בקהילה זו.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                        {story.title}
                      </h4>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-2">
                        מאת: {story.authorName}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {story.storyContent}
                      </p>
                    </div>
                    {story.mediaUrl && (
                      <img
                        src={story.mediaUrl}
                        alt={story.title}
                        className="w-full h-32 object-cover rounded-xl mt-3 border border-slate-100 dark:border-slate-800"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Live Meeting Room & Chat */}
        {activeTab === 'chat' && (
          <div className="pt-6 animate-in fade-in">
            {isMember ? (
              <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        חדר שיח חי של חברי הקהילה
                      </span>
                      <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>מחובר בזמן אמת</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto p-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-right"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                          {msg.author}
                        </span>
                        <span className="text-[10px] text-slate-400">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="כתבו הודעה לקהילה..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                    title="שלח"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900 text-white text-center space-y-4 shadow-2xl border border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black">
                  חדר השיח והמפגש פתוח לחברי הקהילה בלבד
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  התחברו או הצטרפו כעת לקהילת הארגון כדי לקבל גישה מלאה לדיונים, להשתתף במפגשים ולקחת חלק פעיל.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger auth or join modal
                      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'register' } }));
                    }}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    {visibility.guestJoinCtaText || 'הצטרפות לקהילת הארגון'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
