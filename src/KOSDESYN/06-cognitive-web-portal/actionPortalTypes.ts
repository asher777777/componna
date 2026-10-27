import { 
  ArchetypeBackdropConfig, 
  ArchetypeMotionConfig, 
  ArchetypeStyleConfig, 
  ArchetypeCopyConfig, 
  LayoutPreset 
} from '../../theme/types';

// פריט פעולה בודד ברשימה
export interface ActionPortalItem {
  id: string;
  indexBadge: string;       // למשל '01', '02', '03'
  title: string;            // 'לימוד והעשרה'
  subtitle?: string;        // תיאור משני אופציונלי
  primaryIconName: string;  // שם אייקון מ-Lucide (למשל 'GraduationCap', 'Eye', 'PenTool')
  secondaryIconName?: string; // אייקון משני המופיע ליד החץ
  actionType: string;       // סוג הפעולה למשל 'NAVIGATE', 'OPEN_MODAL', 'BUY_PRODUCT'
  payload?: Record<string, any>;
  badgeText?: string;       // תג 'חדש' או סטטוס
  disabled?: boolean;
}

// נתוני התוכן של הפורטל
export interface ActionPortalData {
  title: string;                 // 'אלו הם המוצרים שלנו'
  subtitle?: string;              // כותרת משנה
  logoUrl?: string;              // תמונת סמל עליון 3D של KOSUN
  agentAvatarUrl?: string;       // תמונת הסוכן התחתון (למשל הדמות המצוירת)
  items: ActionPortalItem[];     // רשימת הפריטים
}

// קונפיגורציית העיצוב המלאה של הפורטל (שנשמרת מה-Editor)
export interface ActionPortalStyleOverrides {
  layout?: LayoutPreset;
  backdrop?: Partial<ArchetypeBackdropConfig>;
  motion?: Partial<ArchetypeMotionConfig>;
  style?: Partial<ArchetypeStyleConfig>;
  copy?: Partial<ArchetypeCopyConfig>;
}

// Props עבור קובץ התצוגה (View)
export interface KosActionPortalViewProps {
  data?: ActionPortalData;
  styleOverrides?: ActionPortalStyleOverrides;
  onAction?: (actionType: string, payload?: any) => void;
  onVoiceInputSubmit?: (query: string) => void;
  slotTopHero?: React.ReactNode;
  slotBottomBar?: React.ReactNode;
  slotEmptyState?: React.ReactNode;
}

// Props עבור קובץ העריכה (Editor)
export interface KosActionPortalEditorProps {
  initialData: ActionPortalData;
  initialStyleOverrides: ActionPortalStyleOverrides;
  onSave: (data: ActionPortalData, styles: ActionPortalStyleOverrides) => void;
  onClose?: () => void;
}
