export type SceneRoleType = 
  | 'welcome_hook' 
  | 'feature_explainer' 
  | 'sales_pitch' 
  | 'objection_handler' 
  | 'lead_closing' 
  | 'custom';

export interface InteractiveActionItem {
  id: string;
  label: string;
  targetSceneId: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'danger';
  icon?: string;
  actionType?: 'navigate' | 'open_whatsapp' | 'open_lead_form' | 'open_url';
  externalUrl?: string;
}

export interface InteractiveCardItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  imageUrl?: string;
  price?: string;
  ctaLabel?: string;
  targetSceneId?: string;
}

export interface VideoScene {
  id: string;
  sceneNumber: number;
  title: string;
  dialogueScript: string;
  visualPrompt: string;
  characterDescription?: string;
  avatarId?: string;
  avatarPose?: 'half_body' | 'close_up' | 'full_body';
  voiceId?: string;
  backgroundMediaUrl?: string;
  backgroundType?: 'image' | 'video' | 'color';
  renderedVideoUrl?: string;
  renderedAudioUrl?: string;
  heygenJobId?: string;
  heygenStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  durationSeconds?: number;
  musicBgmVolume?: number;
  transition?: 'none' | 'fade' | 'slide_left' | 'wipe';

  // Interactive Flow & Sales Engine
  sceneRole?: SceneRoleType;
  interactiveActions?: InteractiveActionItem[];
  interactiveCards?: InteractiveCardItem[];
  formFields?: { key: string; label: string; placeholder?: string; type: 'text' | 'email' | 'tel' }[];
  whatsappNumber?: string;
  whatsappMessage?: string;
  autoTransitionOnEnd?: boolean;
  autoTransitionDelaySec?: number;
  autoTransitionTargetSceneId?: string;
  enableVoiceTrigger?: boolean;
  voicePromptExamples?: string[];
}

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  targetAudience?: string;
  marketingHook?: string;
  scenes: VideoScene[];
  globalBgmUrl?: string;
  globalBgmVolume?: number;
  globalNarrationVolume?: number;
  globalTransition?: string;
  status: 'draft' | 'scripted' | 'rendering' | 'completed';
  createdAt: string;
  updatedAt: string;
  finalVideoUrl?: string;

  // Interactive Campaign Settings
  isInteractiveCampaign?: boolean;
  campaignSlug?: string;
  leadFormEmail?: string;
  salesPhone?: string;
}

export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
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
