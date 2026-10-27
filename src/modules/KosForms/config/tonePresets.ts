import { ToneStyle, FormThemeSettings } from '../types';

export interface TonePresetItem {
  id: ToneStyle;
  label: string;
  description: string;
  badge: string;
  suggestedTheme: Partial<FormThemeSettings>;
  promptDirective: string;
  defaultIcon: string;
}

export const TONE_PRESETS: TonePresetItem[] = [
  {
    id: 'executive_luxury',
    label: 'יוקרה ניהולית ומאופקת',
    description: 'סגנון מעודן, אלגנטי, מדויק ומכבד. פונה לבכירים ומשדר מקצועיות עילאית.',
    badge: 'Executive VIP',
    defaultIcon: 'Crown',
    promptDirective: 'שמור על טון מכובד, מאופק, שפה רהוטה ונקייה, שאלות ממוקדות ללא מלל מיותר, תחושת בלעדיות ודיסקרטיות.',
    suggestedTheme: {
      primaryColor: '#0F172A',
      accentColor: '#D97706',
      backgroundColor: '#F8FAFC',
      textColor: '#0F172A',
      cardBackground: '#FFFFFF',
      borderRadius: 'xl',
      luxuryBorder: true,
      buttonStyle: 'solid',
    },
  },
  {
    id: 'warm_consulting',
    label: 'ייעוץ חם ומזמין',
    description: 'סגנון אמפתי, פתוח ואישי, המעודד שיתוף פעולה ושיח בגובה העיניים.',
    badge: 'Warm & Advisory',
    defaultIcon: 'Heart',
    promptDirective: 'השתמש בשפה חמה, מעודדת, בגובה העיניים, יוצרת חיבור אישי ואמון.',
    suggestedTheme: {
      primaryColor: '#047857',
      accentColor: '#10B981',
      backgroundColor: '#F0FDF4',
      textColor: '#064E3B',
      cardBackground: '#FFFFFF',
      borderRadius: 'xl',
      luxuryBorder: false,
      buttonStyle: 'solid',
    },
  },
  {
    id: 'direct_professional',
    label: 'עסקי ישיר ותכליתי',
    description: 'שאלות חדות, תכליתיות, ממוקדות מטרה ויעילות בזמן לתוצאות מהירות.',
    badge: 'Fast & Direct',
    defaultIcon: 'Target',
    promptDirective: 'התמקד ביעילות מקסימלית, שאלות תמציתיות, שפה עסקית ברורה וחדה ללא גינונים עודפים.',
    suggestedTheme: {
      primaryColor: '#1E293B',
      accentColor: '#3B82F6',
      backgroundColor: '#F1F5F9',
      textColor: '#0F172A',
      cardBackground: '#FFFFFF',
      borderRadius: 'lg',
      luxuryBorder: true,
      buttonStyle: 'solid',
    },
  },
  {
    id: 'exclusive_vip',
    label: 'מועדון לקוחות VIP אקסקלוסיבי',
    description: 'חוויה יוקרתית עמוקה של שירות פרטי ומותאם אישית ברמה הגבוהה ביותר.',
    badge: 'Black & Gold VIP',
    defaultIcon: 'Gem',
    promptDirective: 'צור חוויה אקסקלוסיבית, תחושה של מועדון פרימיום סגור, התייחסות למשתמש כשותף בעל ערך עליון.',
    suggestedTheme: {
      primaryColor: '#18181B',
      accentColor: '#EAB308',
      backgroundColor: '#09090B',
      textColor: '#FAFAFA',
      cardBackground: '#18181B',
      borderRadius: 'xl',
      luxuryBorder: true,
      buttonStyle: 'gradient',
    },
  },
  {
    id: 'innovative_tech',
    label: 'חדשני וטכנולוגי',
    description: 'שפה מתקדמת, דיגיטלית, מובילה ומלאת השראה לתעשיות הייטק ודיגיטל.',
    badge: 'Tech & Modern',
    defaultIcon: 'Zap',
    promptDirective: 'השתמש במונחים מודרניים, שפה קולחת ודינמית, גישה חדשנית ומתקדמת.',
    suggestedTheme: {
      primaryColor: '#4F46E5',
      accentColor: '#818CF8',
      backgroundColor: '#EEF2FF',
      textColor: '#1E1B4B',
      cardBackground: '#FFFFFF',
      borderRadius: 'xl',
      luxuryBorder: false,
      buttonStyle: 'solid',
    },
  },
];

