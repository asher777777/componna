export interface CognitiveNodeModel {
  id: string;
  tenantId: string;
  parentId: string | null;
  indexBadge: string;
  audience: 'guest' | 'owner' | 'onboarding';
  contentPurpose: 'product_showcase' | 'service_consultation' | 'landing_page' | 'event_invitation' | 'main_hub' | 'campaign_funding';
  questionText: string;
  shortAnswer: string;
  primaryIcon: string;
  secondaryIcon?: string;
  stats?: { usageCount: number; lastInteractedAt: number };
  voiceKeywords?: string[];
  navigation?: {
    type: 'DRILL_DOWN' | 'DIRECT_ACTION' | 'ENTITY_VIEW' | string;
    targetNodeId?: string;
    actionType?: string;
    actionPayload?: Record<string, any>;
  };
}

export interface BranchInfo {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  wazeQuery: string;
  parking: string;
  highlights: string;
}

export interface TenantThemeColors {
  primary: string;
  secondary?: string;
  micColor: string;
  micGlow: string;
  capsuleBg: string;
  capsuleBorder: string;
  accent: string;
  pageBg?: string;
  titleColor?: string;
  textColor?: string;
  colorMode?: 'day' | 'night';
  secondaryText?: string;
  cardBg?: string;
  borderColor?: string;
  stylePresetId?: string;
}

export type DiscoveryMechanicMode =
  | 'accordion_morph'
  | 'spotlight_stage'
  | 'glass_flip_overlay'
  | 'bento_asymmetric'
  | 'swipe_action_deck';

export type KosunArchetypeEngineId =
  | 'quad_hero'
  | 'funnel_accordion'
  | 'compass_catalog'
  | 'interactive_step_form'
  | 'community_crm';


export interface TenantProfile {
  id: string;
  name: string;
  tagline: string;
  category: string;
  archetypeId?: string;
  themeColors?: Partial<TenantThemeColors>;
  phone: string;
  whatsapp: string;
  address: string;
  branches?: BranchInfo[];
  wazeUrl: string;
  openingHours: string;
  agentName: string;
  agentAvatarUrl: string;
  logoUrl: string;
  welcomeExperience?: {
    type: 'video' | 'image';
    mediaUrl: string;
    fallbackImageUrl?: string;
    title: string;
    subtitle: string;
    badgeText: string;
    ctaText: string;
  };
  aboutStory?: {
    title?: string;
    badge?: string;
    quote?: string;
    paragraphs?: string[];
    stats?: Array<{ label: string; value: string; icon?: string }>;
    pillars?: Array<{ title: string; desc: string; icon?: string }>;
    signature?: string;
    heroImage?: string;
  };
  compassConfig?: {
    up?: { action: string; tooltip: string; filterPrompt: string };
    down?: { action: string; tooltip: string; filterPrompt: string };
    left?: { action: string; tooltip: string; filterPrompt: string };
    right?: { action: string; tooltip: string; filterPrompt: string };
  };
}

export interface EntityProduct {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  price: number;
  currency?: string;
  year?: number;
  mileage?: number;
  engine?: string;
  gearbox?: string;
  color?: string;
  imageUrl: string;
  badgeText?: string;
  status?: string;
  isAvailable?: boolean;
  uiConfig?: any;
  specsGrid?: Array<{ id: string; label: string; value: string; icon: string }>;
  detailsCards?: Array<{ id: string; title: string; subtitle: string; icon: string; badge: string; highlightColor: string }>;
}

export interface KosCognitivePortalProps {
  tenantId?: string;
  targetProject?: 'comona' | 'kosun';
  defaultAudience?: 'guest' | 'owner';
  onActionDispatched?: (actionType: string, payload: any) => void;
}
