import React, { useState, useEffect } from 'react';
import { EventRsvpSectionConfig } from '../../types/sectionConfigs';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  Navigation,
  Calendar,
  CalendarPlus,
  BellRing,
  CheckCircle2,
  XCircle,
  Users,
  MapPin,
  Clock,
  ExternalLink,
  Sparkles,
  Send,
  Loader2,
  Check,
  Smartphone,
  PartyPopper,
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

interface EventRsvpSectionProps {
  config: EventRsvpSectionConfig;
}

export const EventRsvpSection: React.FC<EventRsvpSectionProps> = ({ config }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna();

  const {
    id: sectionId = 'event-rsvp-section',
    anchorId,
    title = 'אירוע חגיגי ואישור הגעה',
    subtitle = 'כל הפרטים החשובים במקום אחד – נווטו בקלות, סמנו ביומן והבטיחו את מקומכם',
    eventTitle = 'מפגש קהילה והשקה עסקית',
    eventDate = '2026-11-15',
    eventTime = '19:30',
    eventEndTime = '22:00',
    locationName = 'מתחם האירועים היוקרתי קושאן',
    locationAddress = 'דרך מנחם בגין 144, תל אביב',
    wazeQuery = 'דרך מנחם בגין 144 תל אביב',
    description = 'נשמח לראותכם באירוע המיוחד שלנו! כיבוד עשיר, הרצאת אורח והזדמנויות נטוורקינג מרתקות.',
    showWazeCard = true,
    wazeCardTitle = 'ניווט ב-Waze',
    wazeCardSubtitle = 'פתיחה ישירה של אפליקציית Waze להגעה נוחה',
    showCalendarCard = true,
    calendarCardTitle = 'הוסף ליומן',
    calendarCardSubtitle = 'סנכרון מיידי ל-Google Calendar או Apple Calendar',
    showWhatsappCard = true,
    whatsappCardTitle = 'תזכורת אוטומטית בוואטסאפ',
    whatsappCardSubtitle = 'קבלו תזכורת והודעת עדכון מתוזמנת ישירות לנייד',
    whatsappReminderTimeText = 'שעתיים לפני האירוע',
    showRsvpButtons = true,
    yesButtonText = 'מגיע/ה בשמחה',
    noButtonText = 'לא מתאפשר לי הפעם',
    yesCountInitial = 38,
    noCountInitial = 4,
    showAttendeeCounter = true,
    attendeeCounterLabel = 'אישרו הגעה עד כה',
  } = config;

  // Live RSVP Counts (Synced to Firestore with local fallback)
  const [yesCount, setYesCount] = useState<number>(yesCountInitial);
  const [noCount, setNoCount] = useState<number>(noCountInitial);
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);

  // WhatsApp Automation modal state
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [reminderSaved, setReminderSaved] = useState<boolean>(false);
  const [isSubmittingReminder, setIsSubmittingReminder] = useState<boolean>(false);

  // Dynamic tenant brand colors
  const primaryBrandColor = brandDna?.designTokens?.primaryColor || '#6366f1';
  const companyName = brandDna?.identity?.companyName || 'קושאן';

  // Read/Listen to live counter in Firestore
  useEffect(() => {
    if (!db || !tenantId) return;
    const rsvpDocRef = doc(db, 'tenants', tenantId, 'event_rsvp_stats', sectionId);

    const unsubscribe = onSnapshot(
      rsvpDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.yesCount === 'number') setYesCount(data.yesCount);
          if (typeof data.noCount === 'number') setNoCount(data.noCount);
        }
      },
      (err) => {
        console.warn('Live RSVP snapshot fallback to local state:', err);
      }
    );

    // Read local voter record to avoid duplicate voting from same browser
    const storedVote = localStorage.getItem(`rsvp_vote_${tenantId}_${sectionId}`);
    if (storedVote === 'yes' || storedVote === 'no') {
      setUserVote(storedVote);
    }

    return () => unsubscribe();
  }, [db, tenantId, sectionId]);

  // Handle RSVP Button Click (Yes / No)
  const handleRsvp = async (choice: 'yes' | 'no') => {
    if (userVote === choice || isVoting) return;
    setIsVoting(true);

    const previousVote = userVote;
    setUserVote(choice);
    localStorage.setItem(`rsvp_vote_${tenantId}_${sectionId}`, choice);

    // Optimistic local state update
    if (choice === 'yes') {
      setYesCount((prev) => prev + 1);
      if (previousVote === 'no') setNoCount((prev) => Math.max(0, prev - 1));
    } else {
      setNoCount((prev) => prev + 1);
      if (previousVote === 'yes') setYesCount((prev) => Math.max(0, prev - 1));
    }

    if (db && tenantId) {
      try {
        const rsvpDocRef = doc(db, 'tenants', tenantId, 'event_rsvp_stats', sectionId);
        const docSnap = await getDoc(rsvpDocRef);

        if (!docSnap.exists()) {
          await setDoc(rsvpDocRef, {
            yesCount: choice === 'yes' ? yesCountInitial + 1 : yesCountInitial,
            noCount: choice === 'no' ? noCountInitial + 1 : noCountInitial,
            updatedAt: new Date().toISOString(),
            eventTitle,
          });
        } else {
          const updates: any = {
            updatedAt: new Date().toISOString(),
          };
          if (choice === 'yes') {
            updates.yesCount = increment(1);
            if (previousVote === 'no') updates.noCount = increment(-1);
          } else {
            updates.noCount = increment(1);
            if (previousVote === 'yes') updates.yesCount = increment(-1);
          }
          await updateDoc(rsvpDocRef, updates);
        }
      } catch (err) {
        console.warn('Failed saving RSVP vote to Firestore:', err);
      }
    }
    setIsVoting(false);
  };

  // 1. Waze Link
  const handleOpenWaze = () => {
    const query = encodeURIComponent(wazeQuery || locationAddress || locationName);
    const wazeUrl = `https://waze.com/ul?q=${query}&navigate=yes`;
    window.open(wazeUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Google Calendar / iCal Links
  const handleAddToCalendar = () => {
    try {
      // Build Google Calendar format
      // Dates: YYYYMMDDTHHMMSSZ
      const cleanDate = eventDate.replace(/[^0-9]/g, '');
      const cleanStartTime = eventTime.replace(/[^0-9]/g, '') + '00';
      const cleanEndTime = eventEndTime.replace(/[^0-9]/g, '') + '00';

      const startDateTime = `${cleanDate}T${cleanStartTime}`;
      const endDateTime = `${cleanDate}T${cleanEndTime}`;

      const details = encodeURIComponent(description);
      const titleEncoded = encodeURIComponent(eventTitle);
      const locationEncoded = encodeURIComponent(`${locationName}, ${locationAddress}`);

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleEncoded}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${locationEncoded}`;
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    } catch {
      alert('לא ניתן לחשב את זמני היומן. אנא בדקו את הפורמט בהגדרות האירוע.');
    }
  };

  // 3. Save to WhatsApp Timed Automation
  const handleSaveWhatsappReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestPhone.trim() || !guestName.trim()) return;

    setIsSubmittingReminder(true);
    const cleanPhone = guestPhone.replace(/[^0-9]/g, '');

    if (db && tenantId) {
      try {
        const reminderRef = doc(
          db,
          'tenants',
          tenantId,
          'whatsapp_event_reminders',
          `${sectionId}_${cleanPhone}`
        );
        await setDoc(
          reminderRef,
          {
            name: guestName.trim(),
            phone: cleanPhone,
            eventTitle,
            eventDate,
            eventTime,
            locationName,
            locationAddress,
            reminderLeadText: whatsappReminderTimeText,
            status: 'scheduled_in_queue',
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not store whatsapp reminder:', err);
      }
    }

    setIsSubmittingReminder(false);
    setReminderSaved(true);
    setTimeout(() => {
      setIsWhatsappModalOpen(false);
      setReminderSaved(false);
      setGuestName('');
      setGuestPhone('');
    }, 2000);
  };

  return (
    <section
      id={anchorId || 'event-rsvp'}
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 text-white selection:bg-indigo-500 selection:text-white"
      dir="rtl"
    >
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>אירוע מבית {companyName}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            {eventTitle || title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {subtitle || description}
          </p>

          {/* Event Quick Time & Location Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{eventDate}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{eventTime} {eventEndTime ? `- ${eventEndTime}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{locationName} ({locationAddress})</span>
            </div>
          </div>
        </div>

        {/* 3 Designed Action Cards (Waze, Calendar, WhatsApp Reminder) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {/* Card 1: Waze Navigation */}
          {showWazeCard && (
            <div
              onClick={handleOpenWaze}
              className="group relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                  <Navigation className="w-7 h-7" />
                </div>
                <span className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                  {wazeCardTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {wazeCardSubtitle}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <span>לחצו לניווט מיידי</span>
                  <Navigation className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Calendar Integration */}
          {showCalendarCard && (
            <div
              onClick={handleAddToCalendar}
              className="group relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/20">
                  <CalendarPlus className="w-7 h-7" />
                </div>
                <span className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors mb-1.5">
                  {calendarCardTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {calendarCardSubtitle}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                  <span>שמירה ביומן האישי</span>
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Card 3: WhatsApp Timed Reminder */}
          {showWhatsappCard && (
            <div
              onClick={() => setIsWhatsappModalOpen(true)}
              className="group relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 shadow-lg shadow-emerald-500/20">
                  <BellRing className="w-7 h-7" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  אוטומציה
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors mb-1.5">
                  {whatsappCardTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {whatsappCardSubtitle} ({whatsappReminderTimeText})
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span>הגדרת תזכורת בוואטסאפ</span>
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RSVP Section (Yes / No Buttons + Live Attendees Counter) */}
        {showRsvpButtons && (
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col items-center text-center shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <PartyPopper className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              האם נזכה לראותכם בין האורחים?
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6">
              סמנו בלחיצה אחת לאישור השתתפותכם – המידע מתעדכן בלייב ועוזר לנו להיערך בצורה הטובה ביותר
            </p>

            {/* Yes / No Buttons synced to branding */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <button
                type="button"
                onClick={() => handleRsvp('yes')}
                disabled={isVoting}
                className={`w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                  userVote === 'yes'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30'
                }`}
                style={
                  userVote === 'yes' && primaryBrandColor
                    ? { backgroundColor: primaryBrandColor }
                    : undefined
                }
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{yesButtonText}</span>
                {userVote === 'yes' && <Check className="w-4 h-4 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => handleRsvp('no')}
                disabled={isVoting}
                className={`w-full sm:w-auto min-w-[180px] px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 border cursor-pointer ${
                  userVote === 'no'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700/60'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>{noButtonText}</span>
              </button>
            </div>

            {/* Live Attendee Counter Badge */}
            {showAttendeeCounter && (
              <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{attendeeCounterLabel}:</span>
                  <strong className="text-white text-base font-black px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700">
                    {yesCount}
                  </strong>
                </div>

                {noCount > 0 && (
                  <div className="text-slate-500 text-[11px]">
                    ({noCount} אינם מגיעים)
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Automation Registration Modal */}
      {isWhatsappModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" dir="rtl">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">תזכורת אוטומטית בוואטסאפ</h4>
                  <p className="text-[11px] text-slate-400">שליחת תזכורת מתוזמנת לקראת האירוע</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsappModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reminderSaved ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
                <span className="text-base font-bold text-white">נרשמת בהצלחה לתזכורת!</span>
                <p className="text-xs text-slate-400">ההודעה תשלח אליך ישירות לוואטסאפ {whatsappReminderTimeText}.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveWhatsappReminder} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">שם מלא</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="לדוגמה: ישראל ישראלי"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">מספר וואטסאפ לקבלת התזכורת</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="050-1234567"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>התזכורת תישלח {whatsappReminderTimeText} באמצעות מערכת WhatsApp האוטומטית של {companyName}.</span>
                </div>

                <div className="flex justify-end gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsWhatsappModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReminder}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    {isSubmittingReminder ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>שומר...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>הפעל תזכורת</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
export default EventRsvpSection;
