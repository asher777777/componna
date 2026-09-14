import React from 'react';
import {
  Briefcase,
  Building2,
  TrendingUp,
  Award,
  Crown,
  ShieldCheck,
  Scale,
  Gem,
  Landmark,
  DollarSign,
  Wallet,
  BadgePercent,
  LineChart,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  AtSign,
  Globe,
  Send,
  MessageSquare,
  PhoneCall,
  Smartphone,
  Sparkles,
  Star,
  Heart,
  ThumbsUp,
  CheckCircle2,
  Zap,
  Target,
  Flame,
  Trophy,
  Compass,
  Flag,
  Shield,
  Bookmark,
  FileText,
  ClipboardList,
  Layers,
  Sliders,
  Calendar,
  Clock,
  Hourglass,
  HelpCircle,
  Check,
  ArrowRight,
  Upload,
  Search,
  Filter,
  PenTool,
  CheckSquare,
  List,
  LucideIcon
} from 'lucide-react';

export interface LuxuryIconItem {
  name: string;
  label: string;
  category: 'business' | 'contact' | 'rating' | 'general' | 'time';
  icon: LucideIcon;
}

export const LUXURY_ICONS_REGISTRY: Record<string, LuxuryIconItem> = {
  // Business & Executive
  Crown: { name: 'Crown', label: 'כתר יוקרה', category: 'business', icon: Crown },
  Gem: { name: 'Gem', label: 'יהלום פרימיום', category: 'business', icon: Gem },
  Award: { name: 'Award', label: 'פרס ומצוינות', category: 'business', icon: Award },
  Trophy: { name: 'Trophy', label: 'גביע הצלחה', category: 'business', icon: Trophy },
  Briefcase: { name: 'Briefcase', label: 'עסקים ותיק עבודות', category: 'business', icon: Briefcase },
  Building2: { name: 'Building2', label: 'חברה וארגון', category: 'business', icon: Building2 },
  TrendingUp: { name: 'TrendingUp', label: 'צמיחה ורווחיות', category: 'business', icon: TrendingUp },
  Landmark: { name: 'Landmark', label: 'מוסד פיננסי / בנקאי', category: 'business', icon: Landmark },
  ShieldCheck: { name: 'ShieldCheck', label: 'ביטחון ואמינות', category: 'business', icon: ShieldCheck },
  Scale: { name: 'Scale', label: 'משפט ואיזון', category: 'business', icon: Scale },
  DollarSign: { name: 'DollarSign', label: 'תקציב והשקעה', category: 'business', icon: DollarSign },
  Wallet: { name: 'Wallet', label: 'ארנק ותשלומים', category: 'business', icon: Wallet },
  BadgePercent: { name: 'BadgePercent', label: 'אחוזים והנחות', category: 'business', icon: BadgePercent },
  LineChart: { name: 'LineChart', label: 'אנליטיקה ומדדים', category: 'business', icon: LineChart },
  BarChart3: { name: 'BarChart3', label: 'נתונים ותרשימים', category: 'business', icon: BarChart3 },

  // Contact & Personal
  User: { name: 'User', label: 'שם מלא / אישי', category: 'contact', icon: User },
  Users: { name: 'Users', label: 'צוות וקהילה', category: 'contact', icon: Users },
  Mail: { name: 'Mail', label: 'דואר אלקטרוני', category: 'contact', icon: Mail },
  Phone: { name: 'Phone', label: 'מספר טלפון', category: 'contact', icon: Phone },
  PhoneCall: { name: 'PhoneCall', label: 'שיחה ישירה', category: 'contact', icon: PhoneCall },
  Smartphone: { name: 'Smartphone', label: 'נייד וואטסאפ', category: 'contact', icon: Smartphone },
  MapPin: { name: 'MapPin', label: 'מיקום וכתובת', category: 'contact', icon: MapPin },
  Globe: { name: 'Globe', label: 'אתר אינטרנט / גלובלי', category: 'contact', icon: Globe },
  AtSign: { name: 'AtSign', label: 'תיוג וידית', category: 'contact', icon: AtSign },
  Send: { name: 'Send', label: 'שליחה ומסירה', category: 'contact', icon: Send },
  MessageSquare: { name: 'MessageSquare', label: 'הודעות ותוכן', category: 'contact', icon: MessageSquare },

  // Rating & Excellence
  Star: { name: 'Star', label: 'כוכב דירוג', category: 'rating', icon: Star },
  Sparkles: { name: 'Sparkles', label: 'ניצוץ ואיכות עליונה', category: 'rating', icon: Sparkles },
  Heart: { name: 'Heart', label: 'אהדה והעדפה', category: 'rating', icon: Heart },
  ThumbsUp: { name: 'ThumbsUp', label: 'שביעות רצון', category: 'rating', icon: ThumbsUp },
  Zap: { name: 'Zap', label: 'מהירות ואנרגיה', category: 'rating', icon: Zap },
  Target: { name: 'Target', label: 'יעד ומטרה', category: 'rating', icon: Target },
  Flame: { name: 'Flame', label: 'עוצמה ופופולריות', category: 'rating', icon: Flame },
  CheckCircle2: { name: 'CheckCircle2', label: 'השלמה מאושרת', category: 'rating', icon: CheckCircle2 },
  Shield: { name: 'Shield', label: 'הגנה ופרטיות', category: 'rating', icon: Shield },
  Bookmark: { name: 'Bookmark', label: 'שמירה וסימון', category: 'rating', icon: Bookmark },

  // Time & Planning
  Calendar: { name: 'Calendar', label: 'תאריך ויומן', category: 'time', icon: Calendar },
  Clock: { name: 'Clock', label: 'שעה וזמינות', category: 'time', icon: Clock },
  Hourglass: { name: 'Hourglass', label: 'תזמון ומשך', category: 'time', icon: Hourglass },
  Compass: { name: 'Compass', label: 'כיוון ואסטרטגיה', category: 'time', icon: Compass },
  Flag: { name: 'Flag', label: 'ציון דרך ויעד', category: 'time', icon: Flag },

  // General & Form Fields
  FileText: { name: 'FileText', label: 'מסמך וטקסט', category: 'general', icon: FileText },
  ClipboardList: { name: 'ClipboardList', label: 'רשימת שאלות', category: 'general', icon: ClipboardList },
  Layers: { name: 'Layers', label: 'שכבות ומודולים', category: 'general', icon: Layers },
  Sliders: { name: 'Sliders', label: 'התאמה והעדפות', category: 'general', icon: Sliders },
  Upload: { name: 'Upload', label: 'העלאת מסמך/קובץ', category: 'general', icon: Upload },
  PenTool: { name: 'PenTool', label: 'חתימה ועריכה', category: 'general', icon: PenTool },
  CheckSquare: { name: 'CheckSquare', label: 'בחירה מרובה', category: 'general', icon: CheckSquare },
  List: { name: 'List', label: 'בחירה מרשימה', category: 'general', icon: List },
  HelpCircle: { name: 'HelpCircle', label: 'עזרה ושאלות', category: 'general', icon: HelpCircle },
};

export const LUXURY_ICON_CATEGORIES = [
  { id: 'business', label: 'עסקים ויוקרה' },
  { id: 'contact', label: 'פרטי קשר ומיקום' },
  { id: 'rating', label: 'דירוג והישגים' },
  { id: 'time', label: 'זמנים ותאריכים' },
  { id: 'general', label: 'טפסים וכללי' },
];

export function getLuxuryIcon(name?: string): LucideIcon {
  if (name && LUXURY_ICONS_REGISTRY[name]) {
    return LUXURY_ICONS_REGISTRY[name].icon;
  }
  return Sparkles;
}
