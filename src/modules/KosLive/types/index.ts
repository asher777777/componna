import { 
  LivingDisplayMode, 
  LivingOverlayAction, 
  LivingCarouselCardItem,
  LivingFormFieldConfig,
  LivingOverlayItem, 
  LivingSceneContract, 
  LivingCampaignContract,
  KosLiveContract
} from '../../../core/contracts';

export type {
  LivingDisplayMode, 
  LivingOverlayAction, 
  LivingCarouselCardItem,
  LivingFormFieldConfig,
  LivingOverlayItem, 
  LivingSceneContract, 
  LivingCampaignContract,
  KosLiveContract
};

export type AspectRatioType = '16:9' | '9:16' | '1:1' | 'auto';

export type SceneRoleType = 
  | 'welcome_hook' 
  | 'feature_explainer' 
  | 'sales_pitch' 
  | 'objection_handler' 
  | 'lead_closing' 
  | 'custom';

export type SubtitleStyle = 'glow' | 'outline' | 'boxed' | 'minimal' | 'tiktok' | 'karaoke';
export type SubtitleStylePreset = SubtitleStyle;
export type SubtitleAnimation = 'word' | 'pop' | 'fade' | 'line';
export type SubtitleAnimationType = SubtitleAnimation;
export type TransitionEffectType = 'cut' | 'fade' | 'zoom' | 'slide' | 'whip_pan' | 'glitch';
export type MicPosition = 'center' | 'bottom' | 'screen_center_trigger' | 'hidden';
export type MicActionType = 'open_text_input' | 'navigate_to_node';
export type OutputDeliverablePreference = 'script_prompts' | 'script_tts' | 'script_images' | 'full_production';

export interface ProjectOverview {
  concept: string;
  characterBible: string;
  visualGuide: string;
  narrativeArc: string;
  toneAndStyle: string;
  targetKpi: string;
  bananaConsistencySeed?: string;
}

export interface ChatMessageContext {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ClarificationQuestionItem {
  id: string;
  question: string;
  hint?: string;
  suggestedAnswer?: string;
}

export interface ClarificationResult {
  questions: ClarificationQuestionItem[];
  analysisSummary?: string;
  conversationId: string;
}

export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender: 'male' | 'female' | 'neutral';
  preview_image_url: string;
  preview_video_url?: string;
}

export interface HeyGenVoice {
  voice_id: string;
  name: string;
  language: string;
  gender: string;
  preview_audio?: string;
}

export interface HeyGenGenerateJobResult {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

export interface LivingScene extends LivingSceneContract {
  visualPrompt?: string;
  characterDescription?: string;
  avatarPose?: 'half_body' | 'close_up' | 'full_body';
  heygenJobId?: string;
  heygenStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  videoProvider?: 'heygen' | 'veo' | 'custom';
  isPhotoAvatar?: boolean;
  customAvatarImageUrl?: string;
  transition?: 'cut' | 'fade' | 'slide' | 'zoom';
  
  // Google Cloud TTS & Gemini Speech Settings
  googleTtsVoiceName?: string;
  googleTtsLanguageCode?: string;
  googleTtsSsmlRate?: string;
  googleTtsSsmlPitch?: string;
  googleTtsEmphasis?: 'none' | 'strong' | 'moderate' | 'reduced';
  
  // Subtitles & Captions
  subtitleText?: string;
  subtitleStyle?: SubtitleStyle;
  subtitleAnimation?: SubtitleAnimation;
  subtitleFontSize?: number;
  subtitlePosition?: 'top' | 'center' | 'bottom';
  
  // Role & Conversion
  sceneRole?: SceneRoleType;
  whatsappNumber?: string;
  whatsappMessage?: string;
  voicePromptExamples?: string[];
}

export interface LivingProject {
  id: string;
  title: string;
  description: string;
  aspectRatio: AspectRatioType;
  targetAudience?: string;
  marketingHook?: string;
  productionType?: string;
  visualStyle?: string;
  ttsLanguage?: string;
  outputPreference?: OutputDeliverablePreference;
  cardCountPerScene?: number;
  includeLeadForm?: boolean;
  smartFormId?: string;
  formsApiEndpoint?: string;
  projectOverview?: ProjectOverview;
  conversationId?: string;
  conversationHistory?: ChatMessageContext[];
  scenes: LivingScene[];
  sourcePageId?: string;
  sourcePageTitle?: string;
  sourceProductId?: string;
  displayMode: LivingDisplayMode;
  status: 'draft' | 'scripted' | 'rendering' | 'published';
  campaignSlug?: string;
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
  publishedAt?: number;
  salesPhone?: string;
  leadFormEmail?: string;
}

export interface ExtractedPageSummary {
  pageId: string;
  pageTitle: string;
  heroTitle?: string;
  slug: string;
  companyName?: string;
  slogan?: string;
  logoUrl?: string;
  primaryColor?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  services: Array<{ title: string; description?: string; badge?: string; imageUrl?: string; icon?: string; price?: string }>;
  products: Array<{ title: string; description?: string; price?: string; imageUrl?: string; badge?: string }>;
  faqItems: Array<{ question: string; answer: string; category?: string }>;
  testimonials: Array<{ name: string; content: string; rating?: number; role?: string; avatarUrl?: string }>;
  pricingPackages: Array<{ name: string; price: string; features: string[]; badge?: string }>;
  stats: Array<{ number: string; label: string; description?: string }>;
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
  };
  formFields: Array<{ key: string; label: string; type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number'; placeholder?: string; required?: boolean }>;
  smartFormId?: string;
  formTitle?: string;
  formSubtitle?: string;
  sectionsSummaryText: string;
}

export interface TelemetryEvent {
  id?: string;
  campaignId: string;
  sessionId: string;
  nodeId?: string;
  from?: string;
  to?: string;
  transcript?: string;
  latencyMs?: number;
  type: 'session_start' | 'node_view' | 'node_transition' | 'overlay_click' | 'form_submit' | 'voice_start' | 'voice_intent' | 'voice_end' | 'error';
  timestamp: number;
  details?: Record<string, any>;
  durationSec?: number;
}

export interface AvatarPreset {
  id: string;
  name: string;
  gender: 'female' | 'male';
  previewImageUrl: string;
  previewVideoUrl?: string;
  voiceId: string;
  recommendedFor: string;
}

export interface ConciergePageUiConfig {
  /** א. האם ה-UI של האווטאר/העמוד החי גלוי בעמוד או נסתר (כברירת מחדל: false = נסתר) */
  isVisibleOnPage: boolean;
  /** ב. הטקסט שמופיע ליד תמונת האווטאר (ניתן לעריכה בתוך אזור העריכה) */
  greetingText: string;
  /** הסתרת הטקסט שמופיע ליד תמונת האווטאר במובייל (כברירת מחדל: true) */
  hideTextOnMobile: boolean;
  /** הצגת הטקסט ליד תמונת האווטאר במחשב (כברירת מחדל: true) */
  showTextOnDesktop: boolean;
  /** מזהה האווטאר שמוצג בבועה */
  avatarId: string;
  /** תמונת אווטאר מותאמת אישית (אופציונלי) */
  customAvatarImageUrl?: string;
  /** מיקום הבועה בעמוד */
  position: 'bottom-left' | 'bottom-right';
  /** קמפיין/פרויקט משויך לניגון בלחיצה */
  activeCampaignId?: string;
}

