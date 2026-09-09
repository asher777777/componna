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
  Heart,
  Video,
  ShieldCheck,
} from 'lucide-react';

export interface PremiumIconDef {
  id: string;
  label: string;
  aliases: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export const PREMIUM_ICONS: PremiumIconDef[] = [
  { id: 'mic', label: 'מיקרופון סטודיו', aliases: ['🎙️', '🎤', 'mic'], icon: Mic },
  { id: 'radio', label: 'שידור חי', aliases: ['📻', 'radio', 'broadcast'], icon: Radio },
  { id: 'sparkles', label: 'קסם ו-AI', aliases: ['✨', 'sparkles', 'ai', 'magic'], icon: Sparkles },
  { id: 'bot', label: 'רובוט ועוזר', aliases: ['🤖', 'bot', 'robot'], icon: Bot },
  { id: 'headphones', label: 'אוזניות שמע', aliases: ['🎧', 'headphones', 'audio'], icon: Headphones },
  { id: 'chat', label: 'בועת שיחה', aliases: ['💬', 'chat', 'message', 'talk'], icon: MessageSquare },
  { id: 'zap', label: 'טריגר מהיר', aliases: ['⚡', 'zap', 'lightning', 'fast'], icon: Zap },
  { id: 'flame', label: 'פופולרי / אש', aliases: ['🔥', 'flame', 'fire', 'hot'], icon: Flame },
  { id: 'phone', label: 'שיחה קולית', aliases: ['📞', 'phone', 'call'], icon: PhoneCall },
  { id: 'volume', label: 'השמעת סאונד', aliases: ['🔊', 'volume', 'sound'], icon: Volume2 },
  { id: 'play', label: 'ניגון וידאו', aliases: ['▶️', 'play', 'video'], icon: Play },
  { id: 'compass', label: 'ניווט ומסלול', aliases: ['🧭', 'compass', 'nav'], icon: Compass },
  { id: 'arrow', label: 'חץ המשך', aliases: ['➔', 'arrow', 'next'], icon: ArrowRight },
  { id: 'heart', label: 'מועדפים ואהבה', aliases: ['❤️', 'heart', 'like'], icon: Heart },
  { id: 'video', label: 'מצלמת וידאו', aliases: ['🎥', 'video_camera', 'camera'], icon: Video },
  { id: 'shield', label: 'אבטחה ואימות', aliases: ['🛡️', 'shield', 'secure'], icon: ShieldCheck },
];

/**
 * Returns a sharp, scalable Lucide Vector Icon Component based on key or legacy emoji
 */
export function getPremiumIconComponent(iconKeyOrEmoji?: string): React.ComponentType<{ className?: string }> {
  if (!iconKeyOrEmoji) return Mic;

  const clean = iconKeyOrEmoji.trim().toLowerCase();
  const match = PREMIUM_ICONS.find(
    (item) => item.id === clean || item.aliases.includes(clean) || item.aliases.includes(iconKeyOrEmoji)
  );

  return match ? match.icon : Mic;
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
