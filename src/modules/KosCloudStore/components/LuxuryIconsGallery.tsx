import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Search,
  Sparkles,
  Check,
  Crown,
  Diamond,
  ShieldCheck,
  Award,
  Zap,
  Gem,
  Trophy,
  Flame,
  Heart,
  Flower2,
  Smile,
  Sun,
  Moon,
  Compass,
  Feather,
  Anchor,
  Layers,
  Scale,
  Brain,
  Microscope,
  Cpu,
  BarChart3,
  TrendingUp,
  FolderPlus,
  Loader2,
  Boxes,
  Shield,
  Palette,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useOptionalMediaGallery } from '../context/MediaGalleryContext';
import { TenantStylePreset } from '../../../core/contracts';

export type IconStyleArchetype =
  | 'all'
  | 'standard'
  | 'feminine'
  | 'masculine'
  | 'spiritual'
  | 'sharp'
  | 'analytical';

export interface LuxuryIconDef {
  name: string;
  labelHe: string;
  archetype: TenantStylePreset;
  category: 'luxury' | 'business' | 'trust' | 'tech' | 'nature' | 'wellness' | 'analytics';
  keywords?: string[];
}

export const LUXURY_ICONS_LIST: LuxuryIconDef[] = [
  // 1. FEMININE & SOFT (נשי ורך - עגלגלות, רגש, רוגע, טיפוח, יופי, הרמוניה, בית ואסתטיקה)
  { name: 'Sparkles', labelHe: 'ניצוצות זוהר', archetype: 'feminine', category: 'wellness', keywords: ['יופי', 'זוהר', 'טיפוח'] },
  { name: 'Heart', labelHe: 'לב אוהב', archetype: 'feminine', category: 'wellness', keywords: ['אהבה', 'רגש', 'נשי'] },
  { name: 'Flower2', labelHe: 'פרח מלבלב', archetype: 'feminine', category: 'nature', keywords: ['פריחה', 'טבע', 'רוך'] },
  { name: 'Feather', labelHe: 'נוצה עדינה', archetype: 'feminine', category: 'wellness', keywords: ['קלילות', 'רכות', 'עדינות'] },
  { name: 'Sun', labelHe: 'שמש חמימה', archetype: 'feminine', category: 'nature', keywords: ['אור', 'חמימות', 'בוקר'] },
  { name: 'Moon', labelHe: 'ירח שליו', archetype: 'feminine', category: 'wellness', keywords: ['לילה', 'שלווה', 'רוגע'] },
  { name: 'Gem', labelHe: 'אבן חן יוקרתית', archetype: 'feminine', category: 'luxury', keywords: ['תכשיט', 'קריסטל', 'יהלום'] },
  { name: 'Smile', labelHe: 'חיוך קורן', archetype: 'feminine', category: 'wellness', keywords: ['אושר', 'הרגשה טובה'] },
  { name: 'Palette', labelHe: 'פלטת איפור וצבע', archetype: 'feminine', category: 'luxury', keywords: ['איפור', 'אסתטיקה', 'אמנות'] },
  { name: 'Wine', labelHe: 'השקה אלגנטית', archetype: 'feminine', category: 'luxury', keywords: ['יין', 'אירוע', 'פינוק'] },
  { name: 'HeartHandshake', labelHe: 'אכפתיות וחיבור', archetype: 'feminine', category: 'trust', keywords: ['אמפתיה', 'קשר', 'הקשבה'] },
  { name: 'Crown', labelHe: 'כתר מלכותי', archetype: 'feminine', category: 'luxury', keywords: ['מלכות', 'פרימיום', 'ייחודית'] },
  { name: 'Sparkle', labelHe: 'נצנוץ פנינה', archetype: 'feminine', category: 'luxury', keywords: ['זוהר', 'פנינה', 'עידון'] },
  { name: 'Coffee', labelHe: 'אתנחתא רגועה', archetype: 'feminine', category: 'wellness', keywords: ['קפה', 'רוגע', 'פינוק'] },
  { name: 'CloudSun', labelHe: 'בוקר בהיר', archetype: 'feminine', category: 'nature', keywords: ['שמש', 'ענן', 'רוגע'] },
  { name: 'Gift', labelHe: 'מארז שי יוקרתי', archetype: 'feminine', category: 'luxury', keywords: ['מתנה', 'פינוק', 'הפתעה'] },
  { name: 'Baby', labelHe: 'עדינות וראשית', archetype: 'feminine', category: 'wellness', keywords: ['הורות', 'רכות', 'משפחה'] },
  { name: 'Music', labelHe: 'מנגינה עריבה', archetype: 'feminine', category: 'wellness', keywords: ['מוזיקה', 'שיר', 'הרמוניה'] },
  { name: 'Leaf', labelHe: 'עלה טבעי ורך', archetype: 'feminine', category: 'nature', keywords: ['בוטניקה', 'צמח', 'אורגני'] },
  { name: 'Sparkles', labelHe: 'טיפול קוסמטי זוהר', archetype: 'feminine', category: 'wellness', keywords: ['קוסמטיקה', 'ספא', 'טיפוח'] },
  { name: 'ShoppingBag', labelHe: 'בוטיק אופנה', archetype: 'feminine', category: 'luxury', keywords: ['סטייל', 'קניות', 'אופנה'] },
  { name: 'Shirt', labelHe: 'סטיילינג מוקפד', archetype: 'feminine', category: 'luxury', keywords: ['אופנה', 'בגד', 'לבוש'] },
  { name: 'GlassWater', labelHe: 'רוויה וטוהר', archetype: 'feminine', category: 'wellness', keywords: ['מים', 'טוהר', 'בריאות'] },
  { name: 'Sparkles', labelHe: 'מגע משי', archetype: 'feminine', category: 'wellness', keywords: ['משי', 'קטיפה', 'נעימות'] },
  { name: 'Flame', labelHe: 'נר ריחני', archetype: 'feminine', category: 'wellness', keywords: ['אווירה', 'ספא', 'ניחוח'] },
  { name: 'Cake', labelHe: 'אירוח וקונדיטוריה', archetype: 'feminine', category: 'luxury', keywords: ['עוגה', 'אירוח', 'מתיקות'] },
  { name: 'PartyPopper', labelHe: 'חגיגה ושמחה', archetype: 'feminine', category: 'luxury', keywords: ['שמחה', 'אירוע', 'הילולה'] },
  { name: 'SunDim', labelHe: 'תאורת אווירה רכה', archetype: 'feminine', category: 'wellness', keywords: ['אווירה', 'אינטימיות', 'עדינות'] },
  { name: 'SmilePlus', labelHe: 'שביעות רצון', archetype: 'feminine', category: 'wellness', keywords: ['הנאה', 'שירות', 'חיוך'] },
  { name: 'HeartPulse', labelHe: 'בריאות הלב והגוף', archetype: 'feminine', category: 'wellness', keywords: ['בריאות', 'חיוניות', 'דופק'] },

  // 2. MASCULINE & POWERFUL (גברי ועוצמתי - כוח, חוסן, הגנה, ניצחון, תשתיות והובלה)
  { name: 'Shield', labelHe: 'מגן פלדה חזק', archetype: 'masculine', category: 'trust', keywords: ['הגנה', 'עוצמה', 'ביטחון'] },
  { name: 'ShieldCheck', labelHe: 'מגן מאומת 100%', archetype: 'masculine', category: 'trust', keywords: ['אבטחה', 'אישור', 'ביטחון'] },
  { name: 'Trophy', labelHe: 'גביע ניצחון', archetype: 'masculine', category: 'luxury', keywords: ['הישג', 'אלוף', 'מקום ראשון'] },
  { name: 'Flame', labelHe: 'אש ולהבה מובילה', archetype: 'masculine', category: 'luxury', keywords: ['כוח', 'דרייב', 'מוטיבציה'] },
  { name: 'Dumbbell', labelHe: 'משקולת כושר', archetype: 'masculine', category: 'wellness', keywords: ['כושר', 'אימון', 'חוסן'] },
  { name: 'Sword', labelHe: 'חרב ניצחון', archetype: 'masculine', category: 'trust', keywords: ['קרב', 'הובלה', 'אומץ'] },
  { name: 'Award', labelHe: 'מדליית הוקרה', archetype: 'masculine', category: 'luxury', keywords: ['כבוד', 'הצטיינות'] },
  { name: 'Target', labelHe: 'פגיעה במטרה', archetype: 'masculine', category: 'business', keywords: ['דיוק', 'פוקוס', 'יעד'] },
  { name: 'Briefcase', labelHe: 'תיק מנהלים', archetype: 'masculine', category: 'business', keywords: ['עסקים', 'ניהול', 'מנהיגות'] },
  { name: 'Building2', labelHe: 'מגדל חברות', archetype: 'masculine', category: 'business', keywords: ['ארגון', 'נדלן', 'תאגיד'] },
  { name: 'Anchor', labelHe: 'עוגן יציבות', archetype: 'masculine', category: 'trust', keywords: ['יציבות', 'אמינות', 'קרקע מוצקה'] },
  { name: 'Rocket', labelHe: 'זינוק והמראה', archetype: 'masculine', category: 'business', keywords: ['עוצמה', 'זינוק', 'הצלחה'] },
  { name: 'Hammer', labelHe: 'עשייה ובנייה בשטח', archetype: 'masculine', category: 'business', keywords: ['בנייה', 'יצירה', 'פטיש'] },
  { name: 'Wrench', labelHe: 'תחזוקה ומיומנות', archetype: 'masculine', category: 'tech', keywords: ['כלים', 'תיקון', 'ביצוע'] },
  { name: 'Truck', labelHe: 'לוגיסטיקה ושינוע כבד', archetype: 'masculine', category: 'business', keywords: ['תובלה', 'הפצה', 'משאית'] },
  { name: 'Car', labelHe: 'רכב פרימיום', archetype: 'masculine', category: 'luxury', keywords: ['רכב', 'מהירות', 'ניידות'] },
  { name: 'Compass', labelHe: 'ניווט שטח', archetype: 'masculine', category: 'nature', keywords: ['מסע', 'שטח', 'מצפן'] },
  { name: 'HardHat', labelHe: 'בטיחות בעבודה', archetype: 'masculine', category: 'trust', keywords: ['בטיחות', 'קבלן', 'הנדסה'] },
  { name: 'Footprints', labelHe: 'עקבות של מנהיג', archetype: 'masculine', category: 'business', keywords: ['דרך', 'השפעה', 'מנהיגות'] },
  { name: 'BadgeAlert', labelHe: 'התרעת פיקוד', archetype: 'masculine', category: 'trust', keywords: ['כוננות', 'שליטה', 'פיקוד'] },
  { name: 'Crown', labelHe: 'שלטון והובלה', archetype: 'masculine', category: 'luxury', keywords: ['מלך', 'הובלה', 'עליונות'] },
  { name: 'Zap', labelHe: 'כוח מתפרץ', archetype: 'masculine', category: 'tech', keywords: ['אנרגיה', 'מהירות', 'עוצמה'] },
  { name: 'Activity', labelHe: 'ביצועים גבוהים', archetype: 'masculine', category: 'wellness', keywords: ['כושר', 'דופק', 'ספורט'] },
  { name: 'Medal', labelHe: 'עיטור גבורה', archetype: 'masculine', category: 'luxury', keywords: ['אות', 'גבורה', 'הצטיינות'] },
  { name: 'Watch', labelHe: 'שעון יוקרה מנהלים', archetype: 'masculine', category: 'luxury', keywords: ['זמן', 'יוקרה', 'סטטוס'] },
  { name: 'KeyRound', labelHe: 'מפתח שליטה', archetype: 'masculine', category: 'trust', keywords: ['גישה', 'ריבונות', 'סמכות'] },
  { name: 'Scale', labelHe: 'צדק וסמכות', archetype: 'masculine', category: 'trust', keywords: ['משפט', 'דין', 'צדק'] },
  { name: 'Megaphone', labelHe: 'קול ברור ועוצמתי', archetype: 'masculine', category: 'business', keywords: ['הכרזה', 'שיווק', 'נוכחות'] },
  { name: 'ShieldAlert', labelHe: 'קו הגנה קדמי', archetype: 'masculine', category: 'trust', keywords: ['מוכנות', 'שריון', 'ביטחון'] },
  { name: 'Flag', labelHe: 'כיבוש יעד ודגל', archetype: 'masculine', category: 'business', keywords: ['הישג', 'דגל', 'פסגה'] },

  // 3. SPIRITUAL & SERENE (רוחני ועדין - תודעה, ייעוד, הילה, נשימה, רוגע וטבע)
  { name: 'Infinity', labelHe: 'אינסוף אפשרויות', archetype: 'spiritual', category: 'luxury', keywords: ['אינסוף', 'זרימה', 'נצח'] },
  { name: 'Compass', labelHe: 'מצפן דרך וייעוד', archetype: 'spiritual', category: 'luxury', keywords: ['כיוון', 'הכוונה', 'ייעוד'] },
  { name: 'SunMedium', labelHe: 'הילה זוהרת', archetype: 'spiritual', category: 'nature', keywords: ['אור פנימי', 'תודעה', 'רוח'] },
  { name: 'Wind', labelHe: 'משב רוח מרפא', archetype: 'spiritual', category: 'nature', keywords: ['נשימה', 'שחרור', 'טבע'] },
  { name: 'Eye', labelHe: 'עין הראייה הפנימית', archetype: 'spiritual', category: 'trust', keywords: ['אינטואיציה', 'חזון', 'מודעות'] },
  { name: 'Flame', labelHe: 'נר רוחני ודלקת אור', archetype: 'spiritual', category: 'wellness', keywords: ['רוח', 'השראה', 'תפילה'] },
  { name: 'Sparkles', labelHe: 'אנרגיה קוסמית', archetype: 'spiritual', category: 'wellness', keywords: ['מיסטיקה', 'אנרגיה'] },
  { name: 'Trees', labelHe: 'שורשים וצמיחה', archetype: 'spiritual', category: 'nature', keywords: ['חיבור', 'אדמה', 'שורשים'] },
  { name: 'HeartHandshake', labelHe: 'חסד ונתינה', archetype: 'spiritual', category: 'trust', keywords: ['חיבור נשמות', 'נתינה'] },
  { name: 'Globe', labelHe: 'אחדות עולמית', archetype: 'spiritual', category: 'trust', keywords: ['הרמוניה', 'שלום', 'חיבור'] },
  { name: 'BookOpen', labelHe: 'ספר חוכמה ומודעות', archetype: 'spiritual', category: 'wellness', keywords: ['לימוד', 'חוכמה', 'ספר'] },
  { name: 'Sunrise', labelHe: 'זריחה והתחדשות', archetype: 'spiritual', category: 'nature', keywords: ['שחר', 'תקווה', 'התחלה חדשה'] },
  { name: 'Sunset', labelHe: 'שקיעה והתכנסות', archetype: 'spiritual', category: 'nature', keywords: ['הודיה', 'ערב', 'התבוננות'] },
  { name: 'CloudRain', labelHe: 'גשמי ברכה', archetype: 'spiritual', category: 'nature', keywords: ['שפע', 'ברכה', 'טיהור'] },
  { name: 'Mountain', labelHe: 'פסגת התעלות', archetype: 'spiritual', category: 'nature', keywords: ['הר', 'גובה', 'שקט'] },
  { name: 'Feather', labelHe: 'שחרור וקלילות', archetype: 'spiritual', category: 'wellness', keywords: ['נשמה', 'ריחוף', 'עדינות'] },
  { name: 'Rainbow', labelHe: 'קשת הברית והשלום', archetype: 'spiritual', category: 'nature', keywords: ['קשת', 'שמחה', 'הבטחה'] },
  { name: 'Sparkle', labelHe: 'ניצוץ אלוהי', archetype: 'spiritual', category: 'luxury', keywords: ['קדושה', 'אור', 'פלא'] },
  { name: 'Hourglass', labelHe: 'סבלנות וזמן עמוק', archetype: 'spiritual', category: 'wellness', keywords: ['סבלנות', 'זמן', 'מחזוריות'] },
  { name: 'Heart', labelHe: 'אהבה ללא תנאי', archetype: 'spiritual', category: 'wellness', keywords: ['חמלה', 'אהבה', 'קבלה'] },
  { name: 'Milestone', labelHe: 'תחנה במסע החיים', archetype: 'spiritual', category: 'luxury', keywords: ['דרך', 'התפתחות', 'מסע'] },
  { name: 'MoonStar', labelHe: 'ליל השראה וכוכבים', archetype: 'spiritual', category: 'nature', keywords: ['חלום', 'השראה', 'כוכב'] },
  { name: 'Waves', labelHe: 'גלי ריפוי וזרימה', archetype: 'spiritual', category: 'nature', keywords: ['ים', 'זרימה', 'שטיפה'] },
  { name: 'TreeDeciduous', labelHe: 'עץ החיים', archetype: 'spiritual', category: 'nature', keywords: ['צמיחה', 'חיים', 'שורשים'] },
  { name: 'Smile', labelHe: 'שלוות נפש', archetype: 'spiritual', category: 'wellness', keywords: ['רוגע', 'קבלה', 'שלום פנימי'] },
  { name: 'Scroll', labelHe: 'מגילת חוכמת קדומים', archetype: 'spiritual', category: 'wellness', keywords: ['מורשת', 'סוד', 'תורה'] },
  { name: 'Bell', labelHe: 'פעמון עוררות פנימית', archetype: 'spiritual', category: 'wellness', keywords: ['צליל', 'התעוררות', 'מדיטציה'] },
  { name: 'Crosshair', labelHe: 'התכווננות וכוונה', archetype: 'spiritual', category: 'luxury', keywords: ['כוונה', 'תפילה', 'ריכוז'] },
  { name: 'Sparkles', labelHe: 'ברכת שפע', archetype: 'spiritual', category: 'luxury', keywords: ['ברכה', 'שפע', 'טוב'] },
  { name: 'Lightbulb', labelHe: 'הארה פנימית', archetype: 'spiritual', category: 'wellness', keywords: ['תובנה', 'הארה', 'השראה'] },

  // 4. SHARP & TECH (חד וטכנולוגי - 0px רדיוס, קוד, חדות גיאומטרית, מהירות וסייבר)
  { name: 'Zap', labelHe: 'ברק מהירות שיא', archetype: 'sharp', category: 'tech', keywords: ['מהירות', 'זריזות', 'אנרגיה'] },
  { name: 'Terminal', labelHe: 'מסוף פקודות חדות', archetype: 'sharp', category: 'tech', keywords: ['קוד', 'פיתוח', 'הנדסה'] },
  { name: 'QrCode', labelHe: 'קוד דיגיטלי חד', archetype: 'sharp', category: 'tech', keywords: ['סריקה', 'טק', 'דיגיטל'] },
  { name: 'Layers', labelHe: 'שכבות גיאומטריות', archetype: 'sharp', category: 'tech', keywords: ['ארכיטקטורה', 'מבנה', 'גריד'] },
  { name: 'SlidersHorizontal', labelHe: 'בקרי דיוק', archetype: 'sharp', category: 'tech', keywords: ['שליטה', 'התאמה', 'בקרה'] },
  { name: 'Maximize2', labelHe: 'גבולות וחתכים חדים', archetype: 'sharp', category: 'tech', keywords: ['חיתוך', 'גריד', 'חדות'] },
  { name: 'Diamond', labelHe: 'צורת יהלום גיאומטרית', archetype: 'sharp', category: 'luxury', keywords: ['פאות', 'חדות', 'דיוק'] },
  { name: 'Lock', labelHe: 'הצפנה קשיחה', archetype: 'sharp', category: 'trust', keywords: ['אבטחה', 'סייבר', 'הצפנה'] },
  { name: 'Code2', labelHe: 'בלוקי קוד טהור', archetype: 'sharp', category: 'tech', keywords: ['פיתוח', 'סיסטם', 'ארכיטקט'] },
  { name: 'Smartphone', labelHe: 'מכשיר קצה חכם', archetype: 'sharp', category: 'tech', keywords: ['חומרה', 'מכשיר', 'חכם'] },
  { name: 'Cpu', labelHe: 'חומרת סיליקון', archetype: 'sharp', category: 'tech', keywords: ['מעבד', 'חומרה', 'שבב'] },
  { name: 'Server', labelHe: 'שרת ענן ייעודי', archetype: 'sharp', category: 'tech', keywords: ['שרת', 'ענן', 'תשתית'] },
  { name: 'Wifi', labelHe: 'רשת תקשורת חדה', archetype: 'sharp', category: 'tech', keywords: ['אינטרנט', 'חיבור', 'קליטה'] },
  { name: 'Database', labelHe: 'בסיס נתונים רלציוני', archetype: 'sharp', category: 'tech', keywords: ['דאטה', 'טבלאות', 'מסד'] },
  { name: 'Binary', labelHe: 'קוד בינארי', archetype: 'sharp', category: 'tech', keywords: ['01', 'ביטים', 'נתונים'] },
  { name: 'GitBranch', labelHe: 'ענפי פיתוח ו-Git', archetype: 'sharp', category: 'tech', keywords: ['פיצול', 'גרסאות', 'קוד'] },
  { name: 'Radio', labelHe: 'שידור אות דיגיטלי', archetype: 'sharp', category: 'tech', keywords: ['שידור', 'RF', 'אות'] },
  { name: 'Share2', labelHe: 'קישוריות צמתים', archetype: 'sharp', category: 'tech', keywords: ['שיתוף', 'צמתים', 'גרף'] },
  { name: 'ShieldAlert', labelHe: 'חומת אש Firewall', archetype: 'sharp', category: 'trust', keywords: ['הגנה', 'חסימה', 'סייבר'] },
  { name: 'Fingerprint', labelHe: 'סורק אבטחה ביומטרי', archetype: 'sharp', category: 'trust', keywords: ['אימות', 'טביעת אצבע'] },
  { name: 'FolderGit2', labelHe: 'מאגר פרויקט מסודר', archetype: 'sharp', category: 'tech', keywords: ['ריפו', 'פרויקט', 'תיקייה'] },
  { name: 'HardDrive', labelHe: 'אחסון קשיח מהיר SSD', archetype: 'sharp', category: 'tech', keywords: ['כונן', 'מהירות', 'אחסון'] },
  { name: 'Key', labelHe: 'מפתח API מוצפן', archetype: 'sharp', category: 'tech', keywords: ['API', 'אבטחה', 'טוקן'] },
  { name: 'Glasses', labelHe: 'משקפי מציאות רבודה', archetype: 'sharp', category: 'tech', keywords: ['VR', 'AR', 'עתיד'] },
  { name: 'SquareCode', labelHe: 'קוד מקור מודולרי', archetype: 'sharp', category: 'tech', keywords: ['קוד', 'תכנות', 'סקריפט'] },
  { name: 'Monitor', labelHe: 'מסך פיקוד מרובע', archetype: 'sharp', category: 'tech', keywords: ['מסך', 'מוניטור', 'תצוגה'] },
  { name: 'Braces', labelHe: 'סוגריים מסולסלים Syntax', archetype: 'sharp', category: 'tech', keywords: ['תחביר', 'שפת תכנות'] },
  { name: 'Bot', labelHe: 'בוט אוטונומי מהיר', archetype: 'sharp', category: 'tech', keywords: ['רובוט', 'אוטומציה', 'בוט'] },
  { name: 'Cable', labelHe: 'כבילה ותקשורת סיבים', archetype: 'sharp', category: 'tech', keywords: ['סיב אופטי', 'תקשורת'] },
  { name: 'Crosshair', labelHe: 'כוונת לייזר חדה', archetype: 'sharp', category: 'tech', keywords: ['דיוק', 'לייזר', 'פוקוס'] },

  // 5. ANALYTICAL & SCIENTIFIC (אנליטי ומדעי - דוחות, גרפים, חקר מעמיק, סטטיסטיקה ו-AI)
  { name: 'BarChart3', labelHe: 'גרף עמודות אנליטי', archetype: 'analytical', category: 'analytics', keywords: ['דוחות', 'סטטיסטיקה', 'גרפים'] },
  { name: 'TrendingUp', labelHe: 'מגמת עלייה ומדדים', archetype: 'analytical', category: 'analytics', keywords: ['מדדים', 'KPI', 'ביצועים'] },
  { name: 'LineChart', labelHe: 'גרף מגמה רציף', archetype: 'analytical', category: 'analytics', keywords: ['ניתוח', 'זמן', 'מדד'] },
  { name: 'PieChart', labelHe: 'פילוח נתונים מדעי', archetype: 'analytical', category: 'analytics', keywords: ['פילוח', 'אחוזים', 'חלוקה'] },
  { name: 'Scale', labelHe: 'מאזני דיוק ואיזון', archetype: 'analytical', category: 'analytics', keywords: ['איזון', 'שקילה', 'הערכה'] },
  { name: 'Brain', labelHe: 'מודל חשיבה ובינה', archetype: 'analytical', category: 'tech', keywords: ['AI', 'בינה', 'חשיבה'] },
  { name: 'Microscope', labelHe: 'מיקרוסקופ מחקר עמוק', archetype: 'analytical', category: 'analytics', keywords: ['חקר', 'בדיקה', 'מדע'] },
  { name: 'Cpu', labelHe: 'מעבד נתונים רב-עוצמה', archetype: 'analytical', category: 'tech', keywords: ['אלגוריתם', 'חישוב', 'עיבוד'] },
  { name: 'Boxes', labelHe: 'מבנה נתונים מודולרי', archetype: 'analytical', category: 'tech', keywords: ['נתונים', 'מודולים', 'מאגר'] },
  { name: 'Fingerprint', labelHe: 'זיהוי ביומטרי מדויק', archetype: 'analytical', category: 'trust', keywords: ['אימות', 'בדיקה מדעית'] },
  { name: 'Table', labelHe: 'טבלת נתונים מפורטת', archetype: 'analytical', category: 'analytics', keywords: ['נתונים', 'טבלה', 'שורות'] },
  { name: 'Activity', labelHe: 'ניטור פעילות בזמן אמת', archetype: 'analytical', category: 'analytics', keywords: ['טלמטריה', 'זמן אמת', 'דופק'] },
  { name: 'Calculator', labelHe: 'מחשבון פיננסי מדויק', archetype: 'analytical', category: 'analytics', keywords: ['חישוב', 'מתמטיקה', 'כספים'] },
  { name: 'ClipboardList', labelHe: 'צ\'ק-ליסט בדיקות איכות', archetype: 'analytical', category: 'analytics', keywords: ['ביקורת', 'משימות', 'בדיקה'] },
  { name: 'FileSpreadsheet', labelHe: 'גיליון נתונים Spreadsheet', archetype: 'analytical', category: 'analytics', keywords: ['אקסל', 'נוסחאות', 'דוח'] },
  { name: 'FileText', labelHe: 'דוח מחקר מקיף', archetype: 'analytical', category: 'analytics', keywords: ['מסמך', 'מחקר', 'ממצאים'] },
  { name: 'Gauge', labelHe: 'מד מהירות ועומסים', archetype: 'analytical', category: 'analytics', keywords: ['עומס', 'מדד', 'ספידומטר'] },
  { name: 'SearchCheck', labelHe: 'אימות נתונים Data Audit', archetype: 'analytical', category: 'analytics', keywords: ['ביקורת', 'אימות', 'בדיקה'] },
  { name: 'Filter', labelHe: 'מסנני נתונים מתקדמים', archetype: 'analytical', category: 'analytics', keywords: ['סינון', 'פילטר', 'פילוח'] },
  { name: 'Percent', labelHe: 'יחסי המרה ואחוזים', archetype: 'analytical', category: 'analytics', keywords: ['המרה', 'יחס', 'אחוז'] },
  { name: 'Binary', labelHe: 'ניתוח ביטים וקוד', archetype: 'analytical', category: 'tech', keywords: ['אלגוריתם', 'מחשב', 'נתונים'] },
  { name: 'Network', labelHe: 'רשת נוירונים וצמתים', archetype: 'analytical', category: 'tech', keywords: ['נוירונים', 'למידת מכונה', 'רשת'] },
  { name: 'ScanLine', labelHe: 'סריקת שגיאות וחריגות', archetype: 'analytical', category: 'analytics', keywords: ['דיבוג', 'סריקה', 'חריגות'] },
  { name: 'Stethoscope', labelHe: 'דיאגנוסטיקה ואבחון', archetype: 'analytical', category: 'wellness', keywords: ['רפואה', 'אבחון', 'בדיקה'] },
  { name: 'Atom', labelHe: 'חקר החלקיקים והפיזיקה', archetype: 'analytical', category: 'analytics', keywords: ['אטום', 'פיזיקה', 'גרעין'] },
  { name: 'Sparkles', labelHe: 'חיזוי מגמות ב-AI', archetype: 'analytical', category: 'tech', keywords: ['חיזוי', 'מודל', 'AI'] },
  { name: 'Coins', labelHe: 'אנליטיקה פיננסית ROI', archetype: 'analytical', category: 'analytics', keywords: ['רווח', 'השקעה', 'תשואה'] },
  { name: 'Sliders', labelHe: 'כוונון פרמטרים Hyperparameters', archetype: 'analytical', category: 'tech', keywords: ['כיול', 'פרמטרים', 'דיוק'] },
  { name: 'TrendingDown', labelHe: 'זיהוי ירידות ונשירה', archetype: 'analytical', category: 'analytics', keywords: ['נטישה', 'ירידה', 'סיכון'] },
  { name: 'Target', labelHe: 'רמת דיוק ו-Accuracy', archetype: 'analytical', category: 'analytics', keywords: ['דיוק', 'בנצ\'מרק', 'יעד'] },

  // 6. STANDARD & BALANCED (סטנדרטי ומאוזן - איכות פרימיום, יציבות, אמינות ותקן רשמי)
  { name: 'Star', labelHe: 'כוכב איכות פרימיום', archetype: 'standard', category: 'luxury', keywords: ['איכות', 'דירוג', 'סטנדרט'] },
  { name: 'BadgeCheck', labelHe: 'תו תקן רשמי', archetype: 'standard', category: 'trust', keywords: ['אמינות', 'תעודה', 'תקן'] },
  { name: 'CheckCircle2', labelHe: 'אישור מושלם', archetype: 'standard', category: 'trust', keywords: ['הצלחה', 'בדיקה', 'וי'] },
  { name: 'Coins', labelHe: 'מטבעות ומסחר מאוזן', archetype: 'standard', category: 'business', keywords: ['פיננסים', 'כסף', 'מסחר'] },
  { name: 'Users', labelHe: 'נבחרת מומחים מנוסה', archetype: 'standard', category: 'business', keywords: ['צוות', 'קהילה', 'מומחים'] },
  { name: 'Laptop', labelHe: 'עבודה עסקית מודרנית', archetype: 'standard', category: 'tech', keywords: ['מחשב', 'ענן', 'עבודה'] },
  { name: 'Landmark', labelHe: 'מוסד מוכר ויציב', archetype: 'standard', category: 'business', keywords: ['בנק', 'מוסד', 'מורשת'] },
  { name: 'Lightbulb', labelHe: 'רעיון ויוזמה עסקית', archetype: 'standard', category: 'tech', keywords: ['יצירתיות', 'פתרון'] },
  { name: 'CreditCard', labelHe: 'כרטיס תשלום בטוח', archetype: 'standard', category: 'business', keywords: ['תשלום', 'סליקה', 'כרטיס'] },
  { name: 'Wallet', labelHe: 'ארנק דיגיטלי מאובטח', archetype: 'standard', category: 'business', keywords: ['ארנק', 'חיסכון', 'כספים'] },
  { name: 'CircleDollarSign', labelHe: 'מחזור הכנסות', archetype: 'standard', category: 'business', keywords: ['דולר', 'הכנסה', 'רווח'] },
  { name: 'PhoneCall', labelHe: 'שירות לקוחות זמין', archetype: 'standard', category: 'trust', keywords: ['טלפון', 'שירות', 'זמינות'] },
  { name: 'Mail', labelHe: 'תקשורת במייל', archetype: 'standard', category: 'business', keywords: ['דואר', 'הודעה', 'פנייה'] },
  { name: 'MapPin', labelHe: 'מיקום וסניף ראשי', archetype: 'standard', category: 'trust', keywords: ['סניף', 'משרד', 'כתובת'] },
  { name: 'Clock', labelHe: 'עמידה בלוחות זמנים', archetype: 'standard', category: 'trust', keywords: ['זמן', 'דייקנות', 'שעות'] },
  { name: 'Calendar', labelHe: 'תיאום פגישה מראש', archetype: 'standard', category: 'business', keywords: ['יומן', 'פגישה', 'מועד'] },
  { name: 'Bookmark', labelHe: 'שמירה במועדפים', archetype: 'standard', category: 'luxury', keywords: ['מועדף', 'שמירה', 'סימניה'] },
  { name: 'Bell', labelHe: 'התראות ועדכונים', archetype: 'standard', category: 'tech', keywords: ['עדכון', 'הודעה', 'צלצול'] },
  { name: 'HelpCircle', labelHe: 'שאלות ותשובות נפוצות', archetype: 'standard', category: 'trust', keywords: ['עזרה', 'תמיכה', 'תשובה'] },
  { name: 'Info', labelHe: 'מידע שימושי', archetype: 'standard', category: 'trust', keywords: ['מידע', 'פרטים', 'הסבר'] },
  { name: 'Printer', labelHe: 'הדפסה והפקה רשמית', archetype: 'standard', category: 'business', keywords: ['מסמך', 'הדפסה', 'קובץ'] },
  { name: 'Home', labelHe: 'דף הבית והבסיס', archetype: 'standard', category: 'business', keywords: ['בית', 'ראשי', 'בסיס'] },
  { name: 'MessageSquare', labelHe: 'צ\'אט ישיר עם נציג', archetype: 'standard', category: 'trust', keywords: ['צ\'אט', 'הודעות', 'שיחה'] },
  { name: 'Camera', labelHe: 'גלריית תמונות', archetype: 'standard', category: 'luxury', keywords: ['צילום', 'תמונה', 'מדיה'] },
  { name: 'Video', labelHe: 'שיחת וידאו עסקית', archetype: 'standard', category: 'tech', keywords: ['פגישה', 'זום', 'וידאו'] },
  { name: 'LockKeyhole', labelHe: 'נעילה מאובטחת', archetype: 'standard', category: 'trust', keywords: ['הגנה', 'פרטיות', 'נעילה'] },
  { name: 'Check', labelHe: 'השלמה מוצלחת', archetype: 'standard', category: 'trust', keywords: ['בוצע', 'הצלחה', 'מאושר'] },
  { name: 'Compass', labelHe: 'מפת דרכים עסקית', archetype: 'standard', category: 'business', keywords: ['חזון', 'דרך', 'יעד'] },
  { name: 'Rocket', labelHe: 'השקת פרויקט', archetype: 'standard', category: 'business', keywords: ['השקה', 'פרויקט', 'התחלה'] },
  { name: 'Crown', labelHe: 'חבילת VIP', archetype: 'standard', category: 'luxury', keywords: ['פרימיום', 'VIP', 'יוקרה'] },
];

export interface LuxuryIconsGalleryProps {
  onSelectIconSvg?: (svgDataUrl: string, iconName: string) => void;
  onSelectIcon?: (svgDataUrl: string, iconName: string) => void;
  selectedIconName?: string;
  className?: string;
}

export const ARCHETYPE_CONFIG: Record<
  TenantStylePreset,
  { label: string; subLabel: string; color: string; border: string; bg: string; iconBadge: string; shape: string }
> = {
  standard: {
    label: 'סטנדרטי ומאוזן',
    subLabel: 'Standard - נקי, אמין והרמוני',
    color: '#6366f1',
    border: 'border-indigo-500/40 hover:border-indigo-400',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    iconBadge: 'text-indigo-400',
    shape: 'rounded-2xl',
  },
  feminine: {
    label: 'נשי ורך',
    subLabel: 'Feminine - רכות, יופי, רוגע וזרימה',
    color: '#ec4899',
    border: 'border-pink-500/40 hover:border-pink-400',
    bg: 'bg-pink-500/10 hover:bg-pink-500/20',
    iconBadge: 'text-pink-400',
    shape: 'rounded-full',
  },
  masculine: {
    label: 'גברי ועוצמתי',
    subLabel: 'Masculine - כוח, חוסן, הגנה והובלה',
    color: '#2563eb',
    border: 'border-blue-500/40 hover:border-blue-400',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    iconBadge: 'text-blue-400',
    shape: 'rounded-xl',
  },
  spiritual: {
    label: 'רוחני ועדין',
    subLabel: 'Spiritual - השראה, תודעה, הילה ונצח',
    color: '#8b5cf6',
    border: 'border-purple-500/40 hover:border-purple-400',
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    iconBadge: 'text-purple-400',
    shape: 'rounded-3xl',
  },
  sharp: {
    label: 'חד וטכנולוגי',
    subLabel: 'Sharp - 0px רדיוס, גריד מהיר וחדות',
    color: '#06b6d4',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    iconBadge: 'text-cyan-400',
    shape: 'rounded-none',
  },
  analytical: {
    label: 'אנליטי ומדעי',
    subLabel: 'Analytical - נתונים, דיוק, מדע ומחקר',
    color: '#10b981',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    iconBadge: 'text-emerald-400',
    shape: 'rounded-lg',
  },
};

export const LuxuryIconsGallery: React.FC<LuxuryIconsGalleryProps> = ({
  onSelectIconSvg,
  onSelectIcon,
  selectedIconName,
  className,
}) => {
  const gallery = useOptionalMediaGallery();
  const [search, setSearch] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<IconStyleArchetype>('all');
  const [activeFinishPreset, setActiveFinishPreset] = useState<TenantStylePreset>('standard');
  const [savingIconName, setSavingIconName] = useState<string | null>(null);
  const [successSavedName, setSuccessSavedName] = useState<string | null>(null);

  // Active finish style
  const currentArchetypeStyle = ARCHETYPE_CONFIG[activeFinishPreset];

  // Filtered icons
  const filtered = useMemo(() => {
    return LUXURY_ICONS_LIST.filter((icon) => {
      const matchArch = selectedArchetype === 'all' || icon.archetype === selectedArchetype;
      const matchSearch =
        !search.trim() ||
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.labelHe.includes(search) ||
        (icon.keywords && icon.keywords.some((k) => k.includes(search)));
      return matchArch && matchSearch;
    });
  }, [search, selectedArchetype]);

  const generateIconSvgDataUrl = (iconName: string, archetypeKey: TenantStylePreset = activeFinishPreset) => {
    const config = ARCHETYPE_CONFIG[archetypeKey];
    const hex = config.color;
    const IconComp = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
    let inner = '';
    try {
      const el = IconComp && (IconComp as any).render ? (IconComp as any).render({}, null) : null;
      if (el && el.props && Array.isArray(el.props.iconNode)) {
        inner = el.props.iconNode
          .map(([tag, attrs]: [string, Record<string, any>]) => {
            const attrStr = Object.entries(attrs)
              .filter(([k]) => k !== 'key')
              .map(([k, v]) => `${k}="${v}"`)
              .join(' ');
            return `<${tag} ${attrStr}/>`;
          })
          .join('');
      }
    } catch (err) {
      console.error('Error generating icon SVG:', iconName, err);
    }

    if (!inner) {
      inner = `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>`;
    }

    // Adapt shape background according to the archetype
    let shapeSvg = `<circle cx="12" cy="12" r="10" stroke="${hex}" stroke-opacity="0.25" fill="${hex}" fill-opacity="0.08"/>`;
    if (archetypeKey === 'feminine') {
      shapeSvg = `<circle cx="12" cy="12" r="10" stroke="${hex}" stroke-width="1.6" stroke-opacity="0.4" fill="${hex}" fill-opacity="0.12"/><circle cx="12" cy="12" r="7.5" stroke="${hex}" stroke-width="0.8" stroke-dasharray="1 1.5" stroke-opacity="0.35"/>`;
    } else if (archetypeKey === 'masculine') {
      shapeSvg = `<rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="${hex}" stroke-width="1.8" stroke-opacity="0.35" fill="${hex}" fill-opacity="0.08"/>`;
    } else if (archetypeKey === 'sharp') {
      shapeSvg = `<rect x="2" y="2" width="20" height="20" rx="0" stroke="${hex}" stroke-opacity="0.3" fill="${hex}" fill-opacity="0.08"/>`;
    } else if (archetypeKey === 'analytical') {
      shapeSvg = `<rect x="2.5" y="2.5" width="19" height="19" rx="3" stroke="${hex}" stroke-opacity="0.3" fill="${hex}" fill-opacity="0.08"/>`;
    } else if (archetypeKey === 'spiritual') {
      shapeSvg = `<circle cx="12" cy="12" r="10.5" stroke="${hex}" stroke-dasharray="2 1.5" stroke-opacity="0.35" fill="${hex}" fill-opacity="0.1"/>`;
    }

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="128" height="128" fill="none" stroke="${hex}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shapeSvg}<g transform="translate(4,4) scale(0.66)" stroke="${hex}" stroke-width="2">${inner}</g></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  };

  const handlePickIcon = (iconName: string, iconArchetype?: TenantStylePreset) => {
    // Priority: icon's own archetype -> active preset filter (if not 'all') -> active finish preset
    const targetArchetype =
      iconArchetype || (selectedArchetype !== 'all' ? (selectedArchetype as TenantStylePreset) : activeFinishPreset);
    const dataUrl = generateIconSvgDataUrl(iconName, targetArchetype);
    if (onSelectIconSvg) onSelectIconSvg(dataUrl, iconName);
    if (onSelectIcon) onSelectIcon(dataUrl, iconName);
  };

  const handleSaveIconToGallery = async (e: React.MouseEvent, item: LuxuryIconDef) => {
    e.stopPropagation();
    if (!gallery?.addMediaItems) return;

    setSavingIconName(item.name);
    try {
      const dataUrl = generateIconSvgDataUrl(item.name, item.archetype);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const timeStamp = Date.now();
      const fileName = `icon_${item.archetype}_${item.name.toLowerCase()}.svg`;

      await gallery.addMediaItems(
        [
          {
            id: `icon_${item.archetype}_${timeStamp}_${Math.random().toString(36).slice(2, 6)}`,
            name: fileName,
            type: 'image',
            mimeType: 'image/svg+xml',
            url: dataUrl,
            sizeBytes: blob.size,
            createdAt: timeStamp,
            updatedAt: timeStamp,
            sourceModule: 'luxury-icons',
            sourceModuleLabel: `אייקון סגנון ${ARCHETYPE_CONFIG[item.archetype].label}`,
            tags: ['אייקון', 'וקטורי', item.archetype, item.labelHe, 'branding_dna'],
          },
        ],
        [blob]
      );

      setSuccessSavedName(item.name);
      setTimeout(() => setSuccessSavedName(null), 2500);
    } catch (err) {
      console.error('[LuxuryIconsGallery] Save to gallery error:', err);
    } finally {
      setSavingIconName(null);
    }
  };

  return (
    <div
      className={clsx(
        'flex flex-col gap-3.5 p-3.5 sm:p-5 bg-slate-950/95 rounded-3xl border border-slate-800 text-right animate-in fade-in shadow-2xl',
        className
      )}
      dir="rtl"
    >
      {/* 1. Finish & Color Preset selector */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>סגנון גימור:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800/90 p-1 rounded-2xl overflow-x-auto max-w-full">
          {(Object.keys(ARCHETYPE_CONFIG) as TenantStylePreset[]).map((presetKey) => {
            const conf = ARCHETYPE_CONFIG[presetKey];
            const isActive = activeFinishPreset === presetKey;
            return (
              <button
                key={presetKey}
                type="button"
                onClick={() => setActiveFinishPreset(presetKey)}
                className={clsx(
                  'px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
                  isActive
                    ? 'bg-white/20 text-white shadow ring-1 ring-white/40'
                    : 'text-slate-400 hover:text-white'
                )}
                style={isActive ? { borderColor: conf.color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color }} />
                <span>{conf.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 6 Archetype Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setSelectedArchetype('all')}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer',
              selectedArchetype === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            )}
          >
            כל הסגנונות ({LUXURY_ICONS_LIST.length})
          </button>

          {(Object.keys(ARCHETYPE_CONFIG) as TenantStylePreset[]).map((archKey) => {
            const conf = ARCHETYPE_CONFIG[archKey];
            const count = LUXURY_ICONS_LIST.filter((i) => i.archetype === archKey).length;
            const isSelected = selectedArchetype === archKey;

            return (
              <button
                key={archKey}
                type="button"
                onClick={() => {
                  setSelectedArchetype(archKey);
                  setActiveFinishPreset(archKey);
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5',
                  isSelected
                    ? 'text-white border shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                )}
                style={isSelected ? { backgroundColor: `${conf.color}25`, borderColor: conf.color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color }} />
                <span>{conf.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center w-full sm:w-56 sm:mr-auto">
          <Search className="w-3.5 h-3.5 absolute right-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="חיפוש לפי שם, סגנון או משמעות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pr-9 pl-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* 3. Icons Grid with Hover Save to Gallery Button */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-[380px] overflow-y-auto custom-scrollbar p-1">
        {filtered.map((item) => {
          const IconComp = (LucideIcons as any)[item.name] || LucideIcons.Sparkles;
          const isSelected = selectedIconName === item.name;
          const conf = ARCHETYPE_CONFIG[item.archetype];
          const isSaving = savingIconName === item.name;
          const isSaved = successSavedName === item.name;

          return (
            <div
              key={`${item.archetype}_${item.name}`}
              onClick={() => handlePickIcon(item.name, item.archetype)}
              className={clsx(
                'p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between gap-2 group cursor-pointer text-center relative select-none hover:-translate-y-0.5',
                conf.bg,
                conf.border,
                isSelected && 'ring-2 ring-amber-400 shadow-xl scale-95 bg-amber-500/30'
              )}
              title={`${item.labelHe} - מתאים לסגנון ${conf.label}`}
            >
              {/* Top Quick Actions: Save directly to gallery */}
              {gallery?.addMediaItems && (
                <button
                  type="button"
                  onClick={(e) => handleSaveIconToGallery(e, item)}
                  disabled={isSaving}
                  className="absolute top-1.5 left-1.5 w-6 h-6 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="העלה ושמור קובץ SVG זה בכספת המדיה של הטננט"
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  ) : isSaved ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <FolderPlus className="w-3 h-3" />
                  )}
                </button>
              )}

              {/* Icon SVG Display inside Archetype Container Shape */}
              <div
                className={clsx(
                  'w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-115 duration-200 border border-white/10 shadow-sm mt-1',
                  conf.shape
                )}
                style={{ backgroundColor: `${conf.color}18`, color: conf.color }}
              >
                <IconComp className="w-5 h-5 drop-shadow-md" />
              </div>

              {/* Icon Label & Style Badge */}
              <div className="w-full flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-200 truncate w-full group-hover:text-white">
                  {item.labelHe}
                </span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.2 rounded-md mt-0.5"
                  style={{ backgroundColor: `${conf.color}25`, color: conf.color }}
                >
                  {conf.label.split(' ')[0]}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
