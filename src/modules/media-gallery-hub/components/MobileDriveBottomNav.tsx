import React from 'react';
import { Clock, Folder, FileText, Sparkles } from 'lucide-react';

export type MobileDriveTab = 'recents' | 'folders' | 'documents' | 'ai_studio';

interface MobileDriveBottomNavProps {
  activeTab: MobileDriveTab;
  onTabChange: (tab: MobileDriveTab) => void;
  theme?: 'dark' | 'light';
}

export const MobileDriveBottomNav: React.FC<MobileDriveBottomNavProps> = ({
  activeTab,
  onTabChange,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const tabs: { id: MobileDriveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'recents', label: 'אחרונים', icon: Clock },
    { id: 'folders', label: 'תיקיות', icon: Folder },
    { id: 'documents', label: 'מסמכים', icon: FileText },
    { id: 'ai_studio', label: 'סטודיו AI', icon: Sparkles },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 h-16 border-t md:hidden flex items-center justify-around z-30 transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-600 backdrop-blur-md'
          : 'bg-slate-900/95 border-slate-800 text-slate-400 backdrop-blur-md'
      }`}
      dir="rtl"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isActive
                ? 'text-amber-500 font-bold scale-105'
                : 'hover:text-slate-200 text-slate-400'
            }`}
          >
            <div className={`p-1 rounded-xl ${isActive ? 'bg-amber-500/10' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
