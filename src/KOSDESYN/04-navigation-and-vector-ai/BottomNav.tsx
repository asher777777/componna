import { Home, Target, Inbox, Layers, Sparkles, Plus, Fingerprint } from 'lucide-react';
import { ActiveScreen } from '../types';
import { sound } from '../utils/audio';
import { KosunIconButton } from './KosunIconButton';
import { KosunAiAvatarButton } from './KosunAiAvatarButton';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  onOpenQuickCapture: () => void;
  onOpenAiAssistant?: () => void;
  inboxCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenQuickCapture,
  onOpenAiAssistant,
  inboxCount,
}) => {
  const tabs = [
    {
      id: 'home' as ActiveScreen,
      label: 'ראשי',
      icon: Home,
    },
    {
      id: 'today' as ActiveScreen,
      label: 'היום שלי',
      icon: Target,
    },
    {
      id: 'inbox' as ActiveScreen,
      label: 'תיק נכסים',
      icon: Inbox,
      badge: inboxCount > 0 ? inboxCount : undefined,
    },
    {
      id: 'branding' as ActiveScreen,
      label: 'מרכז מיתוג DNA',
      icon: Fingerprint,
    },
    {
      id: 'brainstorm' as ActiveScreen,
      label: 'בוט שיחה KOSUN',
      icon: Sparkles,
    },
    {
      id: 'decompose' as ActiveScreen,
      label: 'מעבדת פירוק',
      icon: Layers,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pb-safe">
      <div className="max-w-md mx-auto px-4 pb-3">
        <div className="relative bg-[#0D0E1F]/95 backdrop-blur-md rounded-full border border-[#1A2B4C] shadow-[0_10px_30px_rgba(0,0,0,0.6)] px-3 py-2 flex items-center justify-between text-[#F0F4FF]">
          {/* Main navigation icons with 1st-click Tooltip and 2nd-click Action */}
          <div className="flex-1 flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = activeScreen === tab.id;

              if (tab.id === 'brainstorm') {
                return (
                  <div key={tab.id} className="relative flex items-center justify-center">
                    <KosunAiAvatarButton
                      size="sm"
                      onClick={() => {
                        if (onOpenAiAssistant) onOpenAiAssistant();
                        else onSelectScreen('brainstorm');
                      }}
                      tooltipText="עוזר AI חכם וחיפוש פעולות"
                    />
                  </div>
                );
              }

              return (
                <KosunIconButton
                  key={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  badge={tab.badge}
                  variant={isActive ? 'cyan' : 'ghost'}
                  onClick={() => onSelectScreen(tab.id)}
                />
              );
            })}
          </div>

          {/* Quick Action "+" Icon Button */}
          <div className="pr-2 pl-2 border-r border-[#1A2B4C] flex items-center">
            <KosunIconButton
              icon={Plus}
              label="קליטה מהירה"
              variant="primary"
              onClick={onOpenQuickCapture}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
