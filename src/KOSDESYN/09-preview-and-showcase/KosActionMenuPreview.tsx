import React, { useState } from 'react';
import { KosActionMenuSheet, KosActionItem, KosUserProfile } from '../components/action-menu';
import { Sparkles, Play } from 'lucide-react';

export const KosActionMenuPreview: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [lastAction, setLastAction] = useState<string>('טרם בוצעה פעולה');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // נתוני פרופיל מונחים לפי התמונה שסיפקת
  const profile: KosUserProfile = {
    name: 'אשר משולם',
    emailOrSubtext: 'ovt5771@gmail.com',
    avatarUrl: '/kosun-user.webp',
    isOnline: true,
  };

  // שורות פעולה דינמיות - תואמות במדויק לתמונה 1:1 אך מוזנות כולן מנתונים
  const items: KosActionItem[] = [
    {
      id: 'install_app',
      title: 'התקן אפליקציה למכשיר',
      subtitle: 'התקנת PWA לגישה מהירה',
      icon: 'Smartphone',
      badgeText: 'פתח',
      badgeVariant: 'cyan',
    },
    {
      id: 'evening_ritual',
      title: 'טקס ערב לסגירת יום',
      subtitle: 'סיכום הישגים ושחרור מנטלי',
      icon: 'Sparkles',
      badgeText: 'התחל',
      badgeVariant: 'cyan',
    },
    {
      id: 'toggle_sound',
      title: 'צלילים ואפקטים קוליים',
      subtitle: soundEnabled ? 'צלילים פעילים' : 'צלילים מושתקים',
      icon: 'Volume2',
      badgeText: soundEnabled ? 'פעיל' : 'כבוי',
      badgeVariant: 'cyan',
    },
    {
      id: 'toggle_theme',
      title: 'מצב תצוגה (יום / לילה)',
      subtitle: isDarkMode ? 'מצב לילה פעיל' : 'מצב יום פעיל',
      icon: 'Sun',
      badgeText: isDarkMode ? 'מצב לילה' : 'מצב יום',
      badgeVariant: 'cyan',
    },
    {
      id: 'kosun_guide',
      title: 'אודות ומדריך קושאן',
      subtitle: 'חוק ה-3 והמתודה העסקית',
      icon: 'HelpCircle',
      badgeText: 'מידע',
      badgeVariant: 'cyan',
    },
    {
      id: 'user_logout',
      title: 'התנתק מהחשבון',
      subtitle: 'יציאה מאובטחת',
      icon: 'LogOut',
      badgeText: 'יציאה',
      variant: 'danger',
    },
  ];

  const handleItemClick = (itemId: string, item: KosActionItem) => {
    setLastAction(`נלחץ פריט: [${itemId}] - "${item.title}"`);

    // הדגמת תגובתיות דינמית
    if (itemId === 'toggle_sound') {
      setSoundEnabled((prev) => !prev);
    }
    if (itemId === 'toggle_theme') {
      setIsDarkMode((prev) => !prev);
    }
    if (itemId === 'user_logout') {
      alert('הדגמת יציאה מאובטחת!');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#060810] text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full text-center space-y-4 mb-6">
        <h1 className="text-2xl font-bold tracking-wider text-cyan-400 font-['Orbitron',sans-serif]">
          KOSUN2026 - ACTION MENU PREVIEW
        </h1>
        <p className="text-sm text-white/60">
          בדיקת קומפוננטת תפריט הפעולות הדינמי מול נתונים חיים
        </p>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-300 font-mono">
          {lastAction}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          פתח תפריט מחדש
        </button>
      </div>

      <KosActionMenuSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        profile={profile}
        items={items}
        onItemClick={handleItemClick}
      />
    </div>
  );
};
