import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  Sparkles,
  Smartphone,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  Settings,
  User,
  ShieldCheck,
  Palette,
  Layers,
  Heart,
  Star,
  Bell,
  Mail,
  Share2,
  Download,
  Folder,
  Database,
  Loader2,
} from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase';

// ספריית אייקוני ברירת מחדל של CloudStore / KOSUN
export const CLOUDSTORE_DEFAULT_ICONS = [
  'Smartphone', 'Sparkles', 'Volume2', 'VolumeX', 'Sun', 'Moon',
  'ShieldCheck', 'Palette', 'Layers', 'HelpCircle', 'Settings', 'User',
  'Bell', 'Mail', 'Folder', 'Database', 'Download', 'Share2', 'Heart',
  'Star', 'CheckCircle2', 'Award', 'Crown', 'Zap', 'Target', 'Compass',
  'Globe', 'Clock', 'Calendar', 'BookOpen', 'GraduationCap', 'Lightbulb',
  'Home', 'Phone', 'MessageCircle', 'TrendingUp', 'Lock', 'Briefcase', 'LogOut'
];

export interface KosCloudStoreIconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon?: string;
  onSelectIcon: (iconName: string) => void;
  title?: string;
  /**
   * אפשרות לטעינה דינמית של אוסף אייקונים מתוך Firestore
   */
  firestoreCollection?: string;
}

export const KosDynamicIcon: React.FC<{ icon?: string | React.ReactNode; className?: string }> = ({
  icon,
  className = 'w-5 h-5',
}) => {
  if (!icon) return null;
  if (typeof icon !== 'string') return <>{icon}</>;

  // בדיקת URL (נכסי מדיה ו-SVG מ-CloudStore / Storage)
  if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/') || icon.startsWith('data:image')) {
    return <img src={icon} alt="" className={`${className} object-contain`} />;
  }

  // מיפוי לאייקון מוכר
  const iconMap: Record<string, any> = {
    Smartphone, Sparkles, Volume2, VolumeX, Sun, Moon,
    ShieldCheck, Palette, Layers, HelpCircle, Settings, User,
    Bell, Mail, Folder, Database, Download, Share2, Heart,
    Star, LogOut
  };

  const IconComp = iconMap[icon];
  if (IconComp) {
    return <IconComp className={className} />;
  }

  return <Sparkles className={className} />;
};

export const KosCloudStoreIconPicker: React.FC<KosCloudStoreIconPickerProps> = ({
  isOpen,
  onClose,
  selectedIcon,
  onSelectIcon,
  title = 'ספריית אייקונים (CloudStore / Firestore)',
  firestoreCollection = 'cloudstore_icons',
}) => {
  const [search, setSearch] = useState('');
  const [icons, setIcons] = useState<string[]>(CLOUDSTORE_DEFAULT_ICONS);
  const [isLoading, setIsLoading] = useState(false);

  // משיכת אייקונים דינמית מ-Firestore במידה וקיימים
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchFirestoreIcons = async () => {
      try {
        setIsLoading(true);
        const colRef = collection(db, firestoreCollection);
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty && isMounted) {
          const fetched = snapshot.docs.map(d => d.data().name || d.id);
          setIcons(Array.from(new Set([...fetched, ...CLOUDSTORE_DEFAULT_ICONS])));
        }
      } catch (err) {
        // במידה והאוסף עדיין לא מאוכלס, משתמש בספריית הליבה
        console.info('[CloudStore] Using built-in CloudStore icon asset catalog');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFirestoreIcons();
    return () => {
      isMounted = false;
    };
  }, [isOpen, firestoreCollection]);

  if (!isOpen) return null;

  const filteredIcons = icons.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-all animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0A0D18] border border-[#1A233A] rounded-[24px] p-5 shadow-2xl flex flex-col max-h-[85vh] text-right"
        style={{
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
        }}
      >
        {/* כותרת וסגירה */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1A233A]">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{title}</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* חיפוש */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="חפש אייקון ב-CloudStore..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#05070E] border border-[#1C2744] focus:border-cyan-400 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder-white/40 outline-none"
          />
          <Search className="w-4 h-4 text-white/40 absolute right-3 top-2.5" />
        </div>

        {/* גריד אייקונים */}
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2.5 overflow-y-auto flex-1 p-1 [scrollbar-width:thin] [scrollbar-color:#00F0FF_#0A0D18]">
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-cyan-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">סורק נכסי CloudStore מ-Firestore...</span>
            </div>
          ) : (
            filteredIcons.map((iconName) => {
              const isSelected = selectedIcon === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onSelectIcon(iconName);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-[#0E1424] border-[#1C2744] text-white/70 hover:border-cyan-500/40 hover:text-white'
                  }`}
                >
                  <KosDynamicIcon icon={iconName} className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] truncate w-full text-white/80">{iconName}</span>
                  {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
