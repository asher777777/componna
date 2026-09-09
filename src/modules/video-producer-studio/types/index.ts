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
