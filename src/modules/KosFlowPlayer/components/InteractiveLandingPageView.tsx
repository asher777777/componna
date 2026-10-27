import React, { useState } from 'react';
import { 
  Play, Sparkles, MessageCircle, Phone, Mail, CheckCircle2, 
  ArrowRight, ArrowLeft, Star, ShieldCheck, Zap, Users, Send,
  HelpCircle, ExternalLink, ChevronDown, Award
} from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { VideoLayer } from './VideoLayer';
import { UiOverlayManager } from './UiOverlayManager';
import { VoiceRecorderInteraction } from './VoiceRecorderInteraction';
import { TelemetryDebugger } from './TelemetryDebugger';

interface InteractiveLandingPageViewProps {
  onSwitchToFocusMode?: () => void;
}

export const InteractiveLandingPageView: React.FC<InteractiveLandingPageViewProps> = ({
  onSwitchToFocusMode
}) => {
  const { 
    campaign, 
    currentNode, 
    currentNodeId, 
    logEvent,
    transitionTo,
    setIsVoiceListening
  } = usePlayerMachine();

  const [leadForm, setLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.fullName || !leadForm.phone) return;
    setIsSubmitting(true);

    logEvent({
      type: 'overlay_action',
      actionId: 'landing_lead_form_submitted',
      details: { ...leadForm, fromNode: currentNodeId }
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 600);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `היי, ראיתי את עמוד הנחיתה של ${campaign.name} ואני מעוניין לשמוע פרטים נוספים!`
  )}`;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center" dir="rtl">
      
      {/* Top Sticky Header */}
      <header className="w-full sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-400 text-black font-extrabold flex items-center justify-center shadow-md shadow-yellow-500/20">
            {campaign.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">
              {campaign.name}
            </h1>
            <span className="text-[10px] text-yellow-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" />
              חוויית וידאו ושיחת מכירה אינטראקטיבית
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onSwitchToFocusMode && (
            <button
              onClick={onSwitchToFocusMode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <span>מצב נגן בלבד</span>
            </button>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>וואטסאפ ישיר</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-12">
        
        {/* Hero Section: Interactive Video Presenter & Quick Conversational Stage */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column (Text & Value Pitch) - 5 cols */}
          <div className="lg:col-span-5 space-y-5 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>הדגמה חיה בזמן אמת</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              הכירו את העתיד של <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">{campaign.name}</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {currentNode?.description || 'צפו בפרזנטור האינטראקטיבי שלנו, בחרו את המסלול המתאים לכם, שאלו שאלות בקולכם וקבלו הצעת מחיר מותאמת אישית.'}
            </p>

            {/* Quick interactive bullet highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>מעברי סצנות דינמיים לפי בחירתך</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>הסברים מפורטים עם שכבות מידע חכמות</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>מענה קולי מיידי וסגירת פניות בוואטסאפ</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsVoiceListening(true)}
                className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-yellow-500/20 cursor-pointer active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>דבר עם הפרזנטור עכשיו</span>
              </button>

              <a
                href="#lead-form-section"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 flex items-center gap-1.5 transition"
              >
                <span>השארת פרטים</span>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Video Player Stage - 7 cols */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-yellow-500/40 shadow-2xl shadow-yellow-500/10 bg-black">
              {/* Video Layer */}
              <VideoLayer />

              {/* Interactive Overlays Manager */}
              <UiOverlayManager />

              {/* Voice Interaction Widget Inside Player */}
              <VoiceRecorderInteraction />

              {/* Live Scene Badge */}
              <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentNode?.name || 'הדגמה חיה'}</span>
              </div>
            </div>
          </div>

        </section>

        {/* Section 2: Explanation Cards & Interactive Feature Grid (הסברים) */}
        <section className="space-y-6 pt-6 border-t border-slate-800/80">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
              הסברים ויכולות מוצר
            </span>
            <h3 className="text-xl sm:text-3xl font-bold text-white">
              כל מה שצריך לדעת במקום אחד
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              לחצו על כל שלב בכדי לעבור ישירות לסצנת ההסבר המתאימה בנגן הוידאו
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(campaign.states).map((state, idx) => {
              const isCurrent = state.id === currentNodeId;
              return (
                <div
                  key={state.id}
                  onClick={() => {
                    transitionTo(state.id, 'node_transition', { source: 'landing_grid_click' });
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-right space-y-2.5 ${
                    isCurrent
                      ? 'bg-gradient-to-b from-yellow-950/40 to-slate-900 border-yellow-500/80 shadow-xl shadow-yellow-500/10 scale-102'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 text-yellow-400 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-bold">
                        מתנגן כעת
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white">{state.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {state.description || 'לחץ לצפייה והסבר מפורט'}
                  </p>

                  <div className="pt-1 flex items-center gap-1 text-[11px] text-yellow-400 font-semibold">
                    <span>צפה בסצנה</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Sales Conversation, Lead Capture & WhatsApp (שיחת מכירה) */}
        <section id="lead-form-section" className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sales Text */}
            <div className="lg:col-span-6 space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                שיחת מכירה וסגירת פרטים
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                מוכנים להתקדם להצעת מחיר בלעדית?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                השאירו פרטים ונציג מומחה יחזור אליכם תוך מספר דקות, או פנו ישירות בוואטסאפ לשיחה מיידית עם צוות המכירות שלנו.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>שיחת WhatsApp מיידית</span>
                </a>
              </div>
            </div>

            {/* Lead Capture Form */}
            <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              {formSubmitted ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">הפרטים התקבלו בהצלחה!</h4>
                  <p className="text-xs text-slate-400">
                    תודה, ישראל. ניצור איתך קשר בהקדם להשלמת ההזמנה.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                  <h4 className="text-sm font-bold text-white mb-2">
                    השארת פרטים לקבלת הצעת מחיר
                  </h4>

                  <div>
                    <input
                      type="text"
                      required
                      value={leadForm.fullName}
                      onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                      placeholder="שם מלא *"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      required
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="טלפון נייד לחזרה *"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="כתובת אימייל (אופציונלי)"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'שולח...' : 'שלח פרטים לקבלת הצעה'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* Telemetry Debugger (Optional floating helper) */}
      <TelemetryDebugger />

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-slate-900 mt-12">
        <p>© {new Date().getFullYear()} {campaign.name} - כל הזכויות שמורות | מופעל באמצעות Flow Player Engine & SDO Video Studio</p>
      </footer>

    </div>
  );
};