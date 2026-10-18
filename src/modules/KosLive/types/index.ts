import { 
  LivingDisplayMode, 
  LivingOverlayAction, 
  LivingOverlayItem, 
  LivingSceneContract, 
  LivingCampaignContract,
  KosLiveContract
} from '../../../core/contracts';

export type {
  LivingDisplayMode, 
  LivingOverlayAction, 
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

export interface LivingScene extends LivingSceneContract {
  visualPrompt?: string;
  characterDescription?: string;
  avatarPose?: 'half_body' | 'close_up' | 'full_body';
  heygenJobId?: string;
  heygenStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  videoProvider?: 'heygen' | 'veo' | 'custom';
  isPhotoAvatar?: boolean;
  customAvatarImageUrl?: string;
  
  // Google Cloud TTS Settings
  googleTtsVoiceName?: string;
  googleTtsLanguageCode?: string;
  googleTtsSsmlRate?: string;
  googleTtsSsmlPitch?: string;
  
  // Subtitles & Captions
  subtitleText?: string;
  subtitleStyle?: 'glow' | 'outline' | 'boxed' | 'minimal' | 'tiktok';
  
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
  slug: string;
  companyName?: string;
  slogan?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  services: Array<{ title: string; description?: string; badge?: string }>;
  faqItems: Array<{ question: string; answer: string; category?: string }>;
  testimonials: Array<{ name: string; content: string; rating?: number }>;
  pricingPackages: Array<{ name: string; price: string; features: string[] }>;
  stats: Array<{ number: string; label: string; description?: string }>;
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
  };
  formFields: Array<{ label: string; type: string }>;
  sectionsSummaryText: string;
}

export interface TelemetryEvent {
  id?: string;
  campaignId: string;
  sessionId: string;
  nodeId?: string;
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
