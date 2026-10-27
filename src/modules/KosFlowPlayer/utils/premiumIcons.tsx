import React from 'react';
import {
  Mic,
  Radio,
  Sparkles,
  Bot,
  Headphones,
  MessageSquare,
  Zap,
  Flame,
  PhoneCall,
  Volume2,
  Play,
  Compass,
  ArrowRight,
  ArrowLeft,
  Heart,
  Video,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  CreditCard,
  TrendingUp,
  Briefcase,
  Award,
  Building,
  Landmark,
  Percent,
  PieChart,
  Coins,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Gift,
  Package,
  Store,
  Box,
  Ticket,
  Cpu,
  Globe,
  Terminal,
  Code2,
  Database,
  Wifi,
  Share2,
  Mail,
  Bell,
  Send,
  RotateCw,
  Search,
  Target,
  ExternalLink,
  User,
  UserCheck,
  Star,
  HelpCircle,
  Info,
  Lock,
  Eye,
  AlertCircle,
  Lightbulb,
  Rocket,
  Crown,
  Smile,
  ThumbsUp,
  MapPin,
  Calendar,
  Clock,
  Bookmark,
  Camera,
  Music,
} from 'lucide-react';

export type IconCategory =
  | 'all'
  | 'business_finance'
  | 'ai_tech'
  | 'communication_media'
  | 'ecommerce'
  | 'actions_nav'
  | 'badges_trust';

export interface PremiumIconDef {
  id: string;
  label: string;
  category: IconCategory;
  aliases: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_LABELS: Record<IconCategory, string> = {
  all: '🌟 הכל',
  business_finance: '💰 עסקים וכספים',
  ai_tech: '🤖 AI וטכנולוגיה',
  communication_media: '🎙️ תקשורת ומדיה',
  ecommerce: '🛍️ מסחר ומוצרים',
  actions_nav: '🎯 פעולות וניווט',
  badges_trust: '👑 אמון והישגים',
};

export const EXTENSIVE_ICON_LIST: PremiumIconDef[] = [
  // 1. Business & Finance
  { id: 'coins', label: 'מטבעות וכסף', category: 'business_finance', aliases: ['💰', 'coins', 'money', 'כסף'], icon: Coins },
  { id: 'dollar', label: 'דולר', category: 'business_finance', aliases: ['💵', 'dollar', 'מחיר'], icon: DollarSign },
  { id: 'credit_card', label: 'כרטיס אשראי', category: 'business_finance', aliases: ['💳', 'card', 'תשלום'], icon: CreditCard },
  { id: 'trending_up', label: 'צמיחה ורווחים', category: 'business_finance', aliases: ['📈', 'growth', 'צמיחה'], icon: TrendingUp },
  { id: 'briefcase', label: 'תיק עסקים', category: 'business_finance', aliases: ['💼', 'business', 'עסקים'], icon: Briefcase },
  { id: 'award', label: 'פרס והצטיינות', category: 'business_finance', aliases: ['🏆', 'award', 'פרס'], icon: Award },
  { id: 'building', label: 'חברה / נדל"ן', category: 'business_finance', aliases: ['🏢', 'building', 'בניין'], icon: Building },
  { id: 'landmark', label: 'בנק ומוסד', category: 'business_finance', aliases: ['🏛️', 'bank', 'בנק'], icon: Landmark },
  { id: 'percent', label: 'הנחה ואחוזים', category: 'business_finance', aliases: ['🏷️', 'percent', 'הנחה'], icon: Percent },
  { id: 'pie_chart', label: 'דוחות ונתונים', category: 'business_finance', aliases: ['📊', 'chart', 'דוח'], icon: PieChart },

  // 2. AI & Technology
  { id: 'sparkles', label: 'קסם ו-AI', category: 'ai_tech', aliases: ['✨', 'sparkles', 'ai', 'magic'], icon: Sparkles },
  { id: 'bot', label: 'רובוט ועוזר', category: 'ai_tech', aliases: ['🤖', 'bot', 'robot'], icon: Bot },
  { id: 'cpu', label: 'מעבד ושבב', category: 'ai_tech', aliases: ['💻', 'cpu', 'tech'], icon: Cpu },
  { id: 'rocket', label: 'שיגור וסטארטאפ', category: 'ai_tech', aliases: ['🚀', 'rocket', 'שיגור'], icon: Rocket },
  { id: 'lightbulb', label: 'רעיון ויוזמה', category: 'ai_tech', aliases: ['💡', 'idea', 'רעיון'], icon: Lightbulb },
  { id: 'database', label: 'מסד נתונים', category: 'ai_tech', aliases: ['🗄️', 'db', 'data'], icon: Database },
  { id: 'code', label: 'קוד ותוכנה', category: 'ai_tech', aliases: ['🧑‍💻', 'code', 'תוכנה'], icon: Code2 },
  { id: 'terminal', label: 'טרמינל ופקודות', category: 'ai_tech', aliases: ['⌨️', 'cli', 'cmd'], icon: Terminal },
  { id: 'globe', label: 'אינטרנט גלובלי', category: 'ai_tech', aliases: ['🌐', 'globe', 'גלובלי'], icon: Globe },
  { id: 'wifi', label: 'חיבור רשת', category: 'ai_tech', aliases: ['📶', 'wifi', 'רשת'], icon: Wifi },

  // 3. Communication & Media
  { id: 'mic', label: 'מיקרופון אולפן', category: 'communication_media', aliases: ['🎙️', '🎤', 'mic'], icon: Mic },
  { id: 'radio', label: 'שידור חי', category: 'communication_media', aliases: ['📻', 'radio', 'broadcast'], icon: Radio },
  { id: 'headphones', label: 'אוזניות שמע', category: 'communication_media', aliases: ['🎧', 'headphones', 'audio'], icon: Headphones },
  { id: 'chat', label: 'בועת שיחה', category: 'communication_media', aliases: ['💬', 'chat', 'message', 'talk'], icon: MessageSquare },
  { id: 'phone', label: 'שיחה קולית', category: 'communication_media', aliases: ['📞', 'phone', 'call'], icon: PhoneCall },
  { id: 'volume', label: 'השמעת סאונד', category: 'communication_media', aliases: ['🔊', 'volume', 'sound'], icon: Volume2 },
  { id: 'music', label: 'מוזיקה וצלילים', category: 'communication_media', aliases: ['🎵', 'music', 'שיר'], icon: Music },
  { id: 'video', label: 'מצלמת וידאו', category: 'communication_media', aliases: ['🎥', 'video', 'מצלמה'], icon: Video },
  { id: 'camera', label: 'צילום תמונות', category: 'communication_media', aliases: ['📷', 'camera', 'תמונה'], icon: Camera },
  { id: 'mail', label: 'דואר אלקטרוני', category: 'communication_media', aliases: ['📧', 'mail', 'אימייל'], icon: Mail },
  { id: 'bell', label: 'התראות וצלצול', category: 'communication_media', aliases: ['🔔', 'bell', 'התראה'], icon: Bell },
  { id: 'send', label: 'שליחת הודעה', category: 'communication_media', aliases: ['📤', 'send', 'שלח'], icon: Send },
  { id: 'share', label: 'שיתוף', category: 'communication_media', aliases: ['🔗', 'share', 'שיתוף'], icon: Share2 },

  // 4. E-commerce & Shopping
  { id: 'shopping_bag', label: 'תיק קניות', category: 'ecommerce', aliases: ['🛍️', 'bag', 'קניות'], icon: ShoppingBag },
  { id: 'shopping_cart', label: 'עגלת קניות', category: 'ecommerce', aliases: ['🛒', 'cart', 'עגלה'], icon: ShoppingCart },
  { id: 'gift', label: 'מתנה והטבה', category: 'ecommerce', aliases: ['🎁', 'gift', 'מתנה'], icon: Gift },
  { id: 'tag', label: 'תגית ומבצע', category: 'ecommerce', aliases: ['🏷️', 'tag', 'מבצע'], icon: Tag },
  { id: 'store', label: 'חנות ומכירה', category: 'ecommerce', aliases: ['🏪', 'store', 'חנות'], icon: Store },
  { id: 'package', label: 'חבילה ומשלוח', category: 'ecommerce', aliases: ['📦', 'package', 'משלוח'], icon: Package },
  { id: 'box', label: 'ארגז מוצר', category: 'ecommerce', aliases: ['📦', 'box', 'מוצר'], icon: Box },
  { id: 'ticket', label: 'כרטיס / שובר', category: 'ecommerce', aliases: ['🎟️', 'ticket', 'שובר'], icon: Ticket },
  { id: 'flame', label: 'פופולרי / חם', category: 'ecommerce', aliases: ['🔥', 'flame', 'fire', 'hot'], icon: Flame },
  { id: 'heart', label: 'מועדפים ואהבה', category: 'ecommerce', aliases: ['❤️', 'heart', 'like'], icon: Heart },

  // 5. Actions & Navigation
  { id: 'play', label: 'ניגון וידאו', category: 'actions_nav', aliases: ['▶️', 'play', 'video'], icon: Play },
  { id: 'rotate', label: 'רענון וחזרה', category: 'actions_nav', aliases: ['🔄', 'refresh', 'חוזר'], icon: RotateCw },
  { id: 'target', label: 'מטרה ויעד', category: 'actions_nav', aliases: ['🎯', 'target', 'יעד'], icon: Target },
  { id: 'compass', label: 'ניווט ומסלול', category: 'actions_nav', aliases: ['🧭', 'compass', 'nav'], icon: Compass },
  { id: 'arrow', label: 'חץ המשך', category: 'actions_nav', aliases: ['➔', 'arrow', 'next'], icon: ArrowRight },
  { id: 'arrow_left', label: 'חץ חזרה', category: 'actions_nav', aliases: ['⬅️', 'back', 'חזרה'], icon: ArrowLeft },
  { id: 'search', label: 'חיפוש', category: 'actions_nav', aliases: ['🔍', 'search', 'מצא'], icon: Search },
  { id: 'link', label: 'קישור חיצוני', category: 'actions_nav', aliases: ['🔗', 'link', 'קישור'], icon: ExternalLink },
  { id: 'clock', label: 'שעון וזמן', category: 'actions_nav', aliases: ['⏰', 'clock', 'זמן'], icon: Clock },
  { id: 'calendar', label: 'יומן ופגישות', category: 'actions_nav', aliases: ['📅', 'calendar', 'יומן'], icon: Calendar },
  { id: 'map_pin', label: 'מיקום וסניף', category: 'actions_nav', aliases: ['📍', 'location', 'מיקום'], icon: MapPin },

  // 6. Badges, Trust & Identity
  { id: 'crown', label: 'כתר ו-VIP', category: 'badges_trust', aliases: ['👑', 'crown', 'vip'], icon: Crown },
  { id: 'star', label: 'כוכב ודירוג', category: 'badges_trust', aliases: ['⭐', 'star', 'כוכב'], icon: Star },
  { id: 'shield', label: 'אבטחה ואימות', category: 'badges_trust', aliases: ['🛡️', 'shield', 'secure'], icon: ShieldCheck },
  { id: 'check_circle', label: 'הצלחה ואישור', category: 'badges_trust', aliases: ['✅', 'check', 'אושר'], icon: CheckCircle2 },
  { id: 'user', label: 'פרופיל משתמש', category: 'badges_trust', aliases: ['👤', 'user', 'משתמש'], icon: User },
  { id: 'user_check', label: 'משתמש מאומת', category: 'badges_trust', aliases: ['🧑‍💼', 'verified', 'מאומת'], icon: UserCheck },
  { id: 'thumbs_up', label: 'המלצה ולייק', category: 'badges_trust', aliases: ['👍', 'like', 'מעולה'], icon: ThumbsUp },
  { id: 'smile', label: 'שביעות רצון', category: 'badges_trust', aliases: ['😊', 'smile', 'חיוך'], icon: Smile },
  { id: 'lock', label: 'נעול ומאובטח', category: 'badges_trust', aliases: ['🔒', 'lock', 'נעול'], icon: Lock },
  { id: 'info', label: 'מידע והסבר', category: 'badges_trust', aliases: ['ℹ️', 'info', 'מידע'], icon: Info },
  { id: 'help', label: 'עזרה ותמיכה', category: 'badges_trust', aliases: ['❓', 'help', 'עזרה'], icon: HelpCircle },
];

export const PREMIUM_ICONS = EXTENSIVE_ICON_LIST;

/**
 * Returns a sharp, scalable Lucide Vector Icon Component based on key or legacy emoji
 */
export function getPremiumIconComponent(iconKeyOrEmoji?: string): React.ComponentType<{ className?: string }> {
  if (!iconKeyOrEmoji) return Sparkles;

  const clean = iconKeyOrEmoji.trim().toLowerCase();
  const match = EXTENSIVE_ICON_LIST.find(
    (item) => item.id === clean || item.aliases.includes(clean) || item.aliases.includes(iconKeyOrEmoji)
  );

  return match ? match.icon : Sparkles;
}

/**
 * Renders the vector icon directly with high resolution, gold glow and proper scaling
 */
export const PremiumVectorIcon: React.FC<{
  iconKey?: string;
  className?: string;
  isGold?: boolean;
}> = ({ iconKey, className = 'w-6 h-6', isGold = true }) => {
  const IconComponent = getPremiumIconComponent(iconKey);

  return (
    <IconComponent
      className={`${className} ${
        isGold ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : ''
      }`}
    />
  );
};
