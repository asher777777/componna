import React, { useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  Mic,
  LogOut,
  Smartphone,
  Sun,
  Moon,
  Clock,
  Layers,
  GraduationCap,
  BookOpen,
  Eye,
  PenTool,
  Edit3,
  Palette,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Task, InboxItem } from '../types';
import { sound } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { KosunLogo } from './KosunLogo';
import { KosunIconButton } from './KosunIconButton';
import { KosunAiAvatarButton } from './KosunAiAvatarButton';

interface SwipeHomeScreenProps {
  todayTasks: Task[];
  inboxItems: InboxItem[];
  onNavigateToToday: () => void;
  onNavigateToInbox: () => void;
  onNavigateToRitual?: () => void;
  onNavigateToBranding: () => void;
  onOpenBrainstorm: () => void;
  onOpenQuickCapture: () => void;
  onOpenInstallModal: () => void;
  onOpenAiAssistant?: () => void;
}

type ActiveModalType = 'create' | 'view' | 'academy' | null;

export const SwipeHomeScreen: React.FC<SwipeHomeScreenProps> = ({
  todayTasks,
  inboxItems,
  onNavigateToToday,
  onNavigateToInbox,
  onNavigateToBranding,
  onOpenBrainstorm,
  onOpenQuickCapture,
  onOpenInstallModal,
  onOpenAiAssistant,
}) => {
  const { user, logOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  const completedToday = todayTasks.filter((t) => t.completed).length;

  const handleOpenCreate = () => {
    sound.playPop();
    setActiveModal('create');
  };

  const handleOpenView = () => {
    sound.playPop();
    setActiveModal('view');
  };

  const handleOpenAcademy = () => {
    sound.playPop();
    setActiveModal('academy');
  };

  const handleCloseModal = () => {
    sound.playPop();
    setActiveModal(null);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto relative select-none antialiased overflow-x-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#070913] text-[#F0F4FF]' : 'bg-[#F4F6FB] text-[#0A0D18]'
      }`}
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-[100px] transition-opacity ${
            isDark ? 'opacity-25' : 'opacity-15'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(26, 43, 76, 0.3) 60%, transparent 80%)',
          }}
        />
        <div
          className={`absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-[100px] transition-opacity ${
            isDark ? 'opacity-20' : 'opacity-10'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(189, 0, 255, 0.35) 0%, rgba(13, 14, 31, 0.4) 60%, transparent 80%)',
          }}
        />
      </div>

      {/* TOP HEADER: Clean, No Distractions */}
      <header className="relative z-10 pt-2 flex flex-col items-center text-center shrink-0">
        <div className="w-full flex items-center justify-between mb-2 px-1">
          {/* Left Actions: Install App */}
          <div className="flex items-center gap-1.5">
            <KosunIconButton
              icon={Smartphone}
              label="התקן אפליקציה"
              variant="cyan"
              onClick={onOpenInstallModal}
            />
          </div>

          {/* Right Actions: Day/Night Mode & Logout */}
          <div className="flex items-center gap-1.5">
            <KosunIconButton
              icon={isDark ? Sun : Moon}
              label={isDark ? 'מצב יום' : 'מצב לילה'}
              variant="ghost"
              onClick={toggleTheme}
            />

            {user && (
              <KosunIconButton
                icon={LogOut}
                label="התנתק"
                variant="ghost"
                onClick={() => {
                  if (window.confirm('האם להתנתק?')) logOut();
                }}
              />
            )}
          </div>
        </div>

        {/* Flagship KOSUN Logo */}
        <div className="my-2">
          <KosunLogo size="lg" />
        </div>

        {/* Status indicator: minimal number */}
        <div
          className={`mt-1 text-sm font-bold font-mono px-3 py-0.5 rounded-full border transition-colors ${
            isDark
              ? 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30'
              : 'text-[#007A8A] bg-[#00F0FF]/15 border-[#00F0FF]/50'
          }`}
        >
          {completedToday}/{todayTasks.length}
        </div>
      </header>

      {/* CENTER: 3 REORDERED TRACKS WITH INTUITIVE ACTION ICONS */}
      <main className="relative z-10 w-full flex flex-col gap-4 my-auto py-3">
        {/* Track 01: לימוד והעשרה */}
        <KosunSwipeTrack
          index="01"
          title="לימוד והעשרה"
          icon={GraduationCap}
          isDark={isDark}
          onSuccess={handleOpenAcademy}
        />

        {/* Track 02: צפיה בקושאנים שלך */}
        <KosunSwipeTrack
          index="02"
          title="צפיה בקושאנים שלך"
          icon={Eye}
          isDark={isDark}
          onSuccess={handleOpenView}
        />

        {/* Track 03: יצירה ועריכה */}
        <KosunSwipeTrack
          index="03"
          title="יצירה ועריכה"
          icon={PenTool}
          isDark={isDark}
          onSuccess={handleOpenCreate}
        />
      </main>

      {/* BOTTOM BAR: Iconic Quick Capture + AI Chat */}
      <footer
        className={`relative z-10 pt-4 pb-2 shrink-0 flex items-center justify-between gap-4 border-t transition-colors ${
          isDark ? 'border-[#1A2B4C]/80' : 'border-[#CBD5E1]'
        }`}
      >
        {/* Quick Voice / Text Input */}
        <button
          onClick={() => {
            sound.playPop();
            onOpenQuickCapture();
          }}
          className={`flex-1 min-h-[48px] px-5 rounded-full border transition-all flex items-center gap-3 text-base font-bold cursor-pointer active:scale-98 ${
            isDark
              ? 'bg-[#0D0E1F] border-[#1A2B4C] hover:border-[#00F0FF]/50 text-[#F0F4FF] shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]'
              : 'bg-white border-[#CBD5E1] hover:border-[#00B4D8] text-[#0A0D18] shadow-xs'
          }`}
        >
          <Mic className="w-5 h-5 text-[#00F0FF]" />
          <span>קליטה...</span>
        </button>

        {/* Flagship KOSUN AI Avatar Button with Head Bobbing Animation */}
        <KosunAiAvatarButton
          onClick={onOpenAiAssistant || onOpenBrainstorm}
          size="md"
          tooltipText="עוזר AI חכם וחיפוש פעולות"
        />
      </footer>

      {/* MODAL: לימוד והעשרה (Headline: בקרוב) */}
      {activeModal === 'academy' && (
        <PortalModalWrapper
          title="לימוד והעשרה"
          isDark={isDark}
          onClose={handleCloseModal}
        >
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-[#00A3FF]/10 border border-[#00F0FF]/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <GraduationCap className="w-8 h-8 text-[#00F0FF]" />
            </div>

            {/* The required headline: בקרוב */}
            <h2 className="text-3xl font-black tracking-tight text-[#00F0FF] font-['Orbitron',sans-serif] drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              בקרוב
            </h2>

            <p className="mt-2 text-sm opacity-80 max-w-xs">
              האקדמיה ללימוד והעשרת נכסי קושאן דיגיטליים
            </p>

            <div className="mt-6 w-full">
              <button
                onClick={handleCloseModal}
                className="w-full py-3 px-4 rounded-xl font-bold bg-[#00F0FF] text-[#070913] hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                הבנתי
              </button>
            </div>
          </div>
        </PortalModalWrapper>
      )}

      {/* MODAL: צפיה בקושאנים שלך */}
      {activeModal === 'view' && (
        <PortalModalWrapper
          title="צפיה בקושאנים שלך"
          isDark={isDark}
          onClose={handleCloseModal}
        >
          <div className="flex flex-col gap-3 py-2">
            {/* Option 1: לצפיה בנכסי הזמן */}
            <button
              onClick={() => {
                sound.playTaskComplete();
                setActiveModal(null);
                onNavigateToInbox();
              }}
              className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between group transition-all cursor-pointer active:scale-98 ${
                isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] hover:bg-[#161B35]'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00B4D8] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-inherit">
                    לצפיה בנכסי הזמן
                  </div>
                  <div className="text-xs opacity-60">
                    עיון במשימות, אירועים ושעות ביומן
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-[#00F0FF] group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Option 2: לצפיה בנכסי המיתוג */}
            <button
              onClick={() => {
                sound.playTaskComplete();
                setActiveModal(null);
                onNavigateToBranding();
              }}
              className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between group transition-all cursor-pointer active:scale-98 ${
                isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] hover:bg-[#161B35]'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00B4D8] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-inherit">
                    לצפיה בנכסי המיתוג
                  </div>
                  <div className="text-xs opacity-60">
                    תצוגת DNA מותג, נכסי שיווק וטוקנים
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-[#00F0FF] group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </PortalModalWrapper>
      )}

      {/* MODAL: יצירה ועריכה */}
      {activeModal === 'create' && (
        <PortalModalWrapper
          title="יצירה ועריכה"
          isDark={isDark}
          onClose={handleCloseModal}
        >
          <div className="flex flex-col gap-3 py-2">
            {/* Option 1: יצירה ועריכה של נכסי זמן */}
            <button
              onClick={() => {
                sound.playTaskComplete();
                setActiveModal(null);
                onNavigateToToday();
              }}
              className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between group transition-all cursor-pointer active:scale-98 ${
                isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] hover:bg-[#161B35]'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00B4D8] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-inherit">
                    יצירה ועריכה של נכסי זמן
                  </div>
                  <div className="text-xs opacity-60">
                    הגדרת זמני מיקוד, משימות יומיות ותזמונים
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-[#00F0FF] group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Option 2: יצירה ועריכה של המיתוג */}
            <button
              onClick={() => {
                sound.playTaskComplete();
                setActiveModal(null);
                onNavigateToBranding();
              }}
              className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between group transition-all cursor-pointer active:scale-98 ${
                isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] hover:bg-[#161B35]'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00B4D8] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-inherit">
                    יצירה ועריכה של המיתוג
                  </div>
                  <div className="text-xs opacity-60">
                    אשפי גילוי AI, סגנון קולי, עיצוב ומערכת נכסים
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-[#00F0FF] group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </PortalModalWrapper>
      )}
    </div>
  );
};

interface KosunSwipeTrackProps {
  index: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isDark: boolean;
  onSuccess: () => void;
}

const KosunSwipeTrack: React.FC<KosunSwipeTrackProps> = ({
  index,
  title,
  icon: ActionIcon,
  isDark,
  onSuccess,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const handle = handleRef.current;
    const progress = progressRef.current;
    if (!track || !handle || !progress) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let maxDrag = 0;

    const updateBounds = () => {
      const trackWidth = track.clientWidth;
      const handleWidth = handle.clientWidth;
      maxDrag = trackWidth - handleWidth - 14;
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      updateBounds();
      isDragging = true;
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handle.style.transition = 'none';
      progress.style.transition = 'none';
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

      const delta = startX - clientX;
      currentX = Math.max(0, Math.min(delta, maxDrag));

      handle.style.transform = `translateX(-${currentX}px)`;
      const percentage = (currentX / maxDrag) * 100;
      progress.style.width = `${percentage}%`;

      if (currentX >= maxDrag * 0.82) {
        triggerSuccess();
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      if (currentX < maxDrag * 0.82) {
        handle.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        progress.style.transition = 'width 0.35s ease';
        handle.style.transform = 'translateX(0px)';
        progress.style.width = '0%';
      }
    };

    const triggerSuccess = () => {
      isDragging = false;
      handle.style.transform = `translateX(-${maxDrag}px)`;
      progress.style.width = '100%';

      setIsCompleted(true);
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      sound.playTaskComplete();

      setTimeout(() => {
        onSuccess();
        setTimeout(() => {
          handle.style.transition = 'transform 0.3s ease';
          progress.style.transition = 'width 0.3s ease';
          handle.style.transform = 'translateX(0px)';
          progress.style.width = '0%';
          setIsCompleted(false);
        }, 400);
      }, 200);
    };

    handle.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    handle.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    return () => {
      handle.removeEventListener('mousedown', onStart);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);

      handle.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [onSuccess]);

  // Click on track itself allows instant activation as well
  const handleTrackClick = (e: React.MouseEvent) => {
    // If not clicking the handle directly
    if (handleRef.current && handleRef.current.contains(e.target as Node)) {
      return;
    }
    sound.playTaskComplete();
    setIsCompleted(true);
    setTimeout(() => {
      onSuccess();
      setTimeout(() => setIsCompleted(false), 300);
    }, 150);
  };

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className={`relative h-[72px] w-full rounded-3xl flex items-center px-2 overflow-hidden transition-all duration-300 border cursor-pointer ${
        isDark
          ? isCompleted
            ? 'bg-[#0D1F38] border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.5)]'
            : 'bg-[#0D0E1F]/90 border-[#1A2B4C] hover:border-[#00F0FF]/50 shadow-inner'
          : isCompleted
          ? 'bg-[#E0F7FA] border-[#00B4D8] shadow-[0_0_20px_rgba(0,180,216,0.3)]'
          : 'bg-white border-[#CBD5E1] hover:border-[#00B4D8] shadow-xs'
      }`}
    >
      {/* Dynamic Cyber Cyan Gradient Fill as user drags */}
      <div
        ref={progressRef}
        className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#00F0FF]/40 via-[#00A3FF]/25 to-transparent pointer-events-none rounded-3xl"
        style={{ width: '0%' }}
      />

      {/* Central Title with Action Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-16 pl-6 text-base sm:text-lg font-bold tracking-wide gap-2.5">
        <ChevronLeft className="w-5 h-5 text-[#00F0FF] animate-pulse ml-1 shrink-0" />
        <ActionIcon className="w-5 h-5 text-[#00F0FF] shrink-0 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
        <span className={isDark ? 'text-white' : 'text-[#0A0D18]'}>{title}</span>
      </div>

      {/* Action-Specific Icon Capsule Handle */}
      <div
        ref={handleRef}
        className={`absolute right-2 top-2 bottom-2 w-[60px] rounded-2xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none select-none transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#12162B] to-[#1A2B4C] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]'
            : 'bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] border-[#00B4D8] shadow-sm hover:shadow-md'
        }`}
      >
        <ActionIcon className="w-6 h-6 text-[#00F0FF] mb-0.5 drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]" />
        <span className="text-[9px] font-mono font-bold text-[#00F0FF]">
          {index}
        </span>
      </div>
    </div>
  );
};

interface PortalModalWrapperProps {
  title: string;
  isDark: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PortalModalWrapper: React.FC<PortalModalWrapperProps> = ({
  title,
  isDark,
  onClose,
  children,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl border p-5 shadow-2xl relative animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#F0F4FF] shadow-[0_0_40px_rgba(0,0,0,0.8)]'
            : 'bg-white border-[#CBD5E1] text-[#0A0D18] shadow-xl'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-inherit/20 mb-3">
          <h3 className="text-lg font-black tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#12162B] border-[#1A2B4C] text-[#F0F4FF]/70 hover:text-white hover:border-[#00F0FF]'
                : 'bg-[#F1F5F9] border-[#CBD5E1] text-stone-600 hover:text-black hover:border-[#00B4D8]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
