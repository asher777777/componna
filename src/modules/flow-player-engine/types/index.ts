import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';

export type AspectRatioType = '9:16' | '16:9' | '1:1' | 'auto';

export interface OverlayAction {
  id: string;
  label: string;
  targetNodeId: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold';
  icon?: string;
  description?: string;
}

export interface CarouselCardItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  targetNodeId: string;
  badge?: string;
}

export interface OverlayItem {
  id: string;
  type: 'quick_replies' | 'info_card' | 'badge' | 'product_card' | 'form_input' | 'countdown' | 'carousel';
  position: 'top' | 'center' | 'bottom' | 'top-right' | 'bottom-right' | 'bottom-left';
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  price?: string;
  actions?: OverlayAction[];
  carouselItems?: CarouselCardItem[];
  formFields?: { key: string; label: string; placeholder?: string; type: 'text' | 'email' | 'tel' }[];
  style?: Record<string, string>;
  delayMs?: number;
  durationMs?: number;
}

export interface FlowNodeState {
  id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  fallbackVideoUrl?: string;

  // Triggers & Playback Configurations
  autoPlay?: boolean; // א. הפעלה אוטומטית או לא
  loop?: boolean; // נגן בלופ
  loopUntilTrigger?: boolean; // א. נגן בלופ עד הפעלת טריגר
  soundEnabled?: boolean; // ב. הפעל סאונד או לא
  autoTransitionOnEnd?: boolean; // ג. העבר אוטומטית לצומת הבא בסיום הווידאו
  autoTransitionDelaySec?: number; // ג. העבר אוטומטית לאחר X שניות
  autoTransitionTarget?: string; // ג. צומת היעד למעבר אוטומטי

  overlays?: OverlayItem[];
  allowedIntents?: Record<string, string>; // intentName -> targetNodeId
  systemInstructions?: string;
  micPosition?: 'center' | 'bottom' | 'screen_center_trigger' | 'hidden';
  micActionType?: 'open_text_input' | 'navigate_to_node';
  clickMicTargetNodeId?: string;
  micIcon?: string;
  formsApiEndpoint?: string; // כתובת ה-API עבור INPUT מטפסים
}

export interface SceneDocument {
  id: string;
  nodeId: string;
  name: string;
  description?: string;
  mediaAssets: {
    videoUrl?: string;
    fallbackVideoUrl?: string;
    thumbnailUrl?: string;
    cardImages?: string[];
  };
  triggers: {
    autoPlay?: boolean;
    loopUntilTrigger?: boolean;
    soundEnabled?: boolean;
    micPosition?: 'center' | 'bottom' | 'screen_center_trigger' | 'hidden';
    micIcon?: string;
    micActionType?: 'open_text_input' | 'navigate_to_node';
    clickMicTargetNodeId?: string;
    autoTransitionOnEnd?: boolean;
    autoTransitionDelaySec?: number;
    autoTransitionTarget?: string;
    allowedIntents?: Record<string, string>;
  };
  cardsAndOverlays: {
    overlays?: OverlayItem[];
  };
  formApiConfig?: {
    apiEndpoint?: string;
  };
  updatedAt: number;
}

export interface CampaignConfig {
  id: string;
  slug?: string; // סלאג ייחודי לקמפיין
  name: string;
  presenterId: string;
  initialNodeId: string;
  formsApiEndpoint?: string; // כתובת ה-API עבור INPUT מטפסים
  states: Record<string, FlowNodeState>;
  isPublished?: boolean;
  publishedAt?: number;
  settings?: {
    defaultAspectRatio?: AspectRatioType;
    autoPlay?: boolean;
    primaryColor?: string;
    enableVoice?: boolean;
    language?: string;
  };
  createdAt?: number;
  updatedAt?: number;
}

export interface SessionTelemetryEvent {
  timestamp: number;
  type:
    | 'session_start'
    | 'node_transition'
    | 'intent_detected'
    | 'voice_start'
    | 'voice_end'
    | 'voice_transcript'
    | 'overlay_action'
    | 'video_play'
    | 'video_ended'
    | 'error';
  from?: string;
  to?: string;
  intent?: string;
  transcript?: string;
  actionId?: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

export interface SessionRecord {
  sessionId: string;
  campaignId: string;
  createdAt: any;
  updatedAt?: any;
  events: SessionTelemetryEvent[];
  lastNodeId?: string;
  totalTransitions?: number;
  userLanguage?: string;
}

export interface FlowPlayerCollectionsConfig {
  campaignConfigs?: string;
  sessionEvents?: string;
  presenters?: string;
}

export interface FlowPlayerModuleConfig {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  databaseId?: string;
  collectionPrefix?: string;
  customCollections?: FlowPlayerCollectionsConfig;
  geminiApiKey?: string;
  functionsBaseUrl?: string;
  campaignId?: string;
  initialCampaign?: CampaignConfig;
  onNavigate?: (path: string) => void;
  onStateChange?: (node: FlowNodeState) => void;
  onEvent?: (event: SessionTelemetryEvent) => void;
}

export interface VoiceIntentPayload {
  campaignId: string;
  currentNodeId: string;
  userText: string;
  allowedIntents: Record<string, string>;
  currentNodeInfo?: string;
  apiKey?: string;
}

export interface VoiceIntentResponse {
  success: boolean;
  intent: string;
  nextNodeId: string;
  confidence?: number;
  rawText?: string;
  explanation?: string;
  error?: string;
}