import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, Mic, LogOut, Smartphone, Sun, Moon } from 'lucide-react';
import { Task, InboxItem } from '../types';
import { sound } from '../services/soundService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
// Theme managed via KOSUN dark/light
import { KosunLogo, KosunKHandle } from './KosunLogo';
import { KosunIconButton } from './KosunIconButton';

interface SwipeHomeScreenProps {
  todayTasks: Task[];
  inboxItems: InboxItem[];
  onNavigateToToday: () => void;
  onNavigateToInbox: () => void;
  onNavigateToRitual: () => void;
  onOpenBrainstorm: () => void;
  onOpenQuickCapture: () => void;
  onOpenInstallModal: () => void;
}

export const SwipeHomeScreen: React.FC<SwipeHomeScreenProps> = ({
  todayTasks,
  inboxItems,
  onNavigateToToday,
  onNavigateToInbox,
  onNavigateToRitual,
  onOpenBrainstorm,
  onOpenQuickCapture,
  onOpenInstallModal,
}) => {
  const { auth } = useSystemConnection(); const user = auth?.currentUser; const logOut = () => auth?.signOut();
  const isDark = true; const toggleTheme = () => {};
  const completedToday = todayTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto relative select-none antialiased bg-[#070913] text-[#F0F4FF] overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-[100px] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(26, 43, 76, 0.3) 60%, transparent 80%)',
          }}
        />
        <div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(189, 0, 255, 0.35) 0%, rgba(13, 14, 31, 0.4) 60%, transparent 80%)',
          }}
        />
      </div>

      {/* TOP HEADER: Clean, No Distractions */}
      <header className="relative z-10 pt-2 flex flex-col items-center text-center shrink-0">
        <div className="w-full flex items-center justify-between mb-2 px-1">
          {/* Left Actions: Install App */}
          <KosunIconButton
            icon={Smartphone}
            label="׳”׳×׳§׳ ׳׳₪׳׳™׳§׳¦׳™׳”"
            variant="cyan"
            onClick={onOpenInstallModal}
          />

          {/* Right Actions: Day/Night Mode & Logout */}
          <div className="flex items-center gap-1.5">
            <KosunIconButton
              icon={isDark ? Sun : Moon}
              label={isDark ? '׳׳¦׳‘ ׳™׳•׳' : '׳׳¦׳‘ ׳׳™׳׳”'}
              variant="ghost"
              onClick={toggleTheme}
            />

            {user && (
              <KosunIconButton
                icon={LogOut}
                label="׳”׳×׳ ׳×׳§"
                variant="ghost"
                onClick={() => {
                  if (window.confirm('׳”׳׳ ׳׳”׳×׳ ׳×׳§?')) logOut();
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
        <div className="mt-1 text-sm font-bold font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-0.5 rounded-full border border-[#00F0FF]/30">
          {completedToday}/{todayTasks.length}
        </div>
      </header>

      {/* CENTER: THE 3 PURE SWIPE TRACKS (ADHD ZERO-CLUTTER) */}
      <main className="relative z-10 w-full flex flex-col gap-4 my-auto py-4">
        {/* Track 01: ׳”׳™׳•׳ ׳©׳׳™ */}
        <KosunSwipeTrack
          index="01"
          title="׳”׳™׳•׳ ׳©׳׳™"
          onSuccess={onNavigateToToday}
        />

        {/* Track 02: ׳×׳™׳§ ׳ ׳›׳¡׳™׳ */}
        <KosunSwipeTrack
          index="02"
          title="׳×׳™׳§ ׳ ׳›׳¡׳™׳"
          onSuccess={onNavigateToInbox}
        />

        {/* Track 03: ׳˜׳§׳¡ ׳ ׳¢׳™׳׳× ׳™׳•׳ */}
        <KosunSwipeTrack
          index="03"
          title="׳˜׳§׳¡ ׳¢׳¨׳‘"
          onSuccess={onNavigateToRitual}
        />
      </main>

      {/* BOTTOM BAR: Iconic Quick Capture + AI Chat */}
      <footer className="relative z-10 pt-4 pb-2 shrink-0 flex items-center justify-between gap-4 border-t border-[#1A2B4C]/80">
        {/* Quick Voice / Text Input */}
        <button
          onClick={() => {
            sound.playPop();
            onOpenQuickCapture();
          }}
          className="flex-1 min-h-[48px] px-5 rounded-full bg-[#0D0E1F] border border-[#1A2B4C] hover:border-[#00F0FF]/50 text-[#F0F4FF] transition-all flex items-center gap-3 text-base font-bold shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] cursor-pointer active:scale-98"
        >
          <Mic className="w-5 h-5 text-[#00F0FF]" />
          <span>׳§׳׳™׳˜׳”...</span>
        </button>

        {/* AI Chatbot Icon Button (1st click tooltip, 2nd click execute) */}
        <KosunIconButton
          icon={Sparkles}
          label="׳‘׳•׳˜ AI"
          variant="primary"
          iconSize={24}
          onClick={onOpenBrainstorm}
        />
      </footer>
    </div>
  );
};

interface KosunSwipeTrackProps {
  index: string;
  title: string;
  onSuccess: () => void;
}

const KosunSwipeTrack: React.FC<KosunSwipeTrackProps> = ({
  index,
  title,
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

      if (currentX >= maxDrag * 0.86) {
        triggerSuccess();
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      if (currentX < maxDrag * 0.86) {
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
        }, 500);
      }, 220);
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

  return (
    <div
      ref={trackRef}
      className={`relative h-[72px] w-full rounded-3xl flex items-center px-2 overflow-hidden transition-all duration-300 border ${
        isCompleted
          ? 'bg-[#0D1F38] border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.5)]'
          : 'bg-[#0D0E1F]/90 border-[#1A2B4C] hover:border-[#00F0FF]/40 shadow-inner'
      }`}
    >
      {/* Dynamic Cyber Cyan Gradient Fill as user drags */}
      <div
        ref={progressRef}
        className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#00F0FF]/40 via-[#00A3FF]/25 to-transparent pointer-events-none rounded-3xl"
        style={{ width: '0%' }}
      />

      {/* Central Title */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-16 pl-6 text-base sm:text-lg font-bold text-white tracking-wide">
        <ChevronLeft className="w-5 h-5 text-[#00F0FF] animate-pulse ml-1" />
        <span>{title}</span>
      </div>

      {/* 40-degree Styled "K" Capsule Handle */}
      <div
        ref={handleRef}
        className="absolute right-2 top-2 bottom-2 w-[60px] rounded-2xl bg-gradient-to-br from-[#12162B] to-[#1A2B4C] border-2 border-[#00F0FF] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(0,240,255,0.35)] z-10 touch-none select-none hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-shadow"
      >
        <KosunKHandle size={26} />
        <span className="absolute bottom-1 text-[9px] font-mono font-bold text-[#00F0FF]">
          {index}
        </span>
      </div>
    </div>
  );
};
