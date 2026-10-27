/**
 * KOSUN2026 - Archetype & Design Tokens System
 * חוזה הטיפוסים המרכזי של מנוע הסגנונות הדינמי (Cloud & Local)
 */

export type ArchetypeId = 'lawyer' | 'feminine' | 'masculine' | 'wellness' | 'kosun_portal' | string;

export type BorderRadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ShadowToken = 'none' | 'soft' | 'medium' | 'strong' | 'glow';
export type FontFamilyToken = 'sans' | 'serif' | 'mono';
export type SpacingToken = 'compact' | 'comfortable' | 'spacious';

// 1. שכבת הרקע האטמוספרי (Dynamic Backdrop)
export type BackdropType = 'cosmos' | 'mesh_gradient' | 'aurora' | 'minimal_solid' | 'ambient_glow';

export interface ArchetypeBackdropConfig {
  type: BackdropType;
  primaryGlowColor?: string;   // צבע ההילה המרכזית (כמו כחול ה-KOSUN)
  secondaryGlowColor?: string; // הילת רקע משנית
  overlayOpacity?: number;     // רמת שקיפות
  showParticles?: boolean;     // כוכבים / נקודות אור זוהרות
}

// 2. שכבת האנימציות והמעברים (Motion & Transitions)
export type MotionPreset = 'stagger_glow' | 'gentle_spring' | 'sharp_fade' | 'breathe';

export interface ArchetypeMotionConfig {
  preset: MotionPreset;
  hoverScale: number;           // כוונון קנה מידה בהובר (1.0 - 1.05)
  transitionDurationMs: number; // משך המעבר במילישניות
  staggerDelayMs: number;       // דיליי מדורג בין כרטיס לכרטיס
}

// 3. שכבת הפריסה המומלצת (Layout Preset)
export type LayoutPreset = 'vertical_pills' | 'grid_2col' | 'grid_3col' | 'carousel_swipe';

// 4. שכבת העיצוב (Style Tokens)
export interface ArchetypeStyleConfig {
  primaryColor: string;
  secondaryColor?: string;
  surfaceBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  borderColor?: string;
  borderWidth: '0px' | '1px' | '2px';
  borderRadius: BorderRadiusToken;
  shadow: ShadowToken;
  fontFamily: FontFamilyToken;
  spacing: SpacingToken;
}

// 5. שכבת השפה והקופי (Tone of Voice & Copywriting Tokens)
export interface ArchetypeCopyConfig {
  ctaPrimary: string;
  ctaSecondary?: string;
  inquiryTitle: string;
  inquirySubtitle?: string;
  trustBadge?: string;
  contactSuccess: string;
  emptyStateText?: string;
}

// 6. שכבת קלט ברירת מחדל (Input Pattern)
export interface ArchetypeInputMode {
  type: 'calendar_picker' | 'step_wizard' | 'quick_contact' | 'conversational_form' | 'cart_checkout';
  requirePhone?: boolean;
  requireEmail?: boolean;
  allowFileUpload?: boolean;
  allowVoiceNote?: boolean;
  submitButtonText?: string;
}

// 7. שכבת פלט ברירת מחדל (Output Pattern)
export interface ArchetypeOutputMode {
  type: 'formal_document' | 'invitation_voucher' | 'live_tracker' | 'mindful_success' | 'instant_receipt';
  showConfetti?: boolean;
  addToCalendar?: boolean;
  enablePdfDownload?: boolean;
  shareToWhatsapp?: boolean;
}

// 8. סכמת שדות ייחודיים למוצר/שירות בתחום זה
export interface ArchetypeFieldSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'media';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

// 9. הגדרות סוכן AI מותאם סגנון
export interface ArchetypeAiPersona {
  roleDescription: string;
  tone: 'formal_legal' | 'caring_beauty' | 'direct_results' | 'calm_therapeutic';
  promptInstructions: string;
}

// המבנה הכולל של מסמך Preset בפיירסטור
export interface ArchetypePreset {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  backdrop: ArchetypeBackdropConfig;
  motion: ArchetypeMotionConfig;
  defaultLayout: LayoutPreset;
  style: ArchetypeStyleConfig;
  copy: ArchetypeCopyConfig;
  inputMode: ArchetypeInputMode;
  outputMode: ArchetypeOutputMode;
  itemSchema?: ArchetypeFieldSchema[];
  aiPersona?: ArchetypeAiPersona;
  updatedAt?: string | number;
}
