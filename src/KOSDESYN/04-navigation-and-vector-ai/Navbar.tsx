import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, X, LogOut, Smartphone, ArrowRight, Sun, Moon } from 'lucide-react';
import { sound } from '../utils/audio';
import { User } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import { KosunVectorIcon } from './KosunLogo';
import { KosunIconButton } from './KosunIconButton';

interface NavbarProps {
  completedCount: number;
  totalCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartRitual: () => void;
  user: User | null;
  onLogOut: () => void;
  onOpenInstallModal: () => void;
  onNavigateHome?: () => void;
  showBackHome?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  onStartRitual,
  user,
  onLogOut,
  onOpenInstallModal,
  onNavigateHome,
  showBackHome = false,
}) => {
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0D0E1F]/90 backdrop-blur-md border-b border-[#1A2B4C] px-4 py-2.5 text-[#F0F4FF]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackHome && onNavigateHome && (
              <KosunIconButton
                icon={ArrowRight}
                label="ראשי"
                variant="cyan"
                onClick={onNavigateHome}
              />
            )}

            <div className="cursor-pointer flex items-center" onClick={onNavigateHome}>
              <KosunVectorIcon size={30} />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Install App Icon */}
            <KosunIconButton
              icon={Smartphone}
              label="התקן אפליקציה"
              variant="secondary"
              onClick={onOpenInstallModal}
            />

            {/* Quick Evening Ritual Trigger Icon */}
            <KosunIconButton
              icon={Sparkles}
              label="טקס ערב"
              variant="primary"
              onClick={onStartRitual}
            />

            {/* Sound Toggle Icon */}
            <KosunIconButton
              icon={soundEnabled ? Volume2 : VolumeX}
              label={soundEnabled ? 'השתק' : 'צלילים'}
              variant="ghost"
              onClick={() => {
                onToggleSound();
                sound.playPop();
              }}
            />

            {/* Day / Night Mode Toggle Icon */}
            <KosunIconButton
              icon={isDark ? Sun : Moon}
              label={isDark ? 'מצב יום' : 'מצב לילה'}
              variant="ghost"
              onClick={toggleTheme}
            />

            {/* Help / Info Icon */}
            <KosunIconButton
              icon={HelpCircle}
              label="אודות"
              variant="ghost"
              onClick={() => {
                sound.playPop();
                setShowPhilosophyModal(true);
              }}
            />

            {/* Logout Icon */}
            {user && (
              <KosunIconButton
                icon={LogOut}
                label="התנתק"
                variant="ghost"
                onClick={() => {
                  if (window.confirm('האם להתנתק מהחשבון?')) {
                    onLogOut();
                  }
                }}
              />
            )}
          </div>
        </div>
      </header>

      {/* Minimal Philosophy Modal */}
      {showPhilosophyModal && (
        <div className="fixed inset-0 z-50 bg-[#070913]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0E1F] text-[#F0F4FF] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#1A2B4C] relative space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <KosunVectorIcon size={28} />
              <KosunIconButton
                icon={X}
                label="סגור"
                variant="ghost"
                onClick={() => setShowPhilosophyModal(false)}
              />
            </div>

            <p className="text-sm text-[#F0F4FF]/80 leading-relaxed text-center">
              KOSUN · חוק ה-3 לנכסים ממוקדים ללא הסחות דעת.
            </p>

            <button
              onClick={() => setShowPhilosophyModal(false)}
              className="w-full min-h-[44px] bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] rounded-full text-sm font-black transition-transform active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}
    </>
  );
};
