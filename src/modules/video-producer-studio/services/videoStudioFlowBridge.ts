import { Firestore, doc, setDoc } from 'firebase/firestore';
import { VideoProject, VideoScene } from '../types';
import { CampaignConfig, FlowNodeState, OverlayItem, AspectRatioType } from '../../flow-player-engine/types';

const PLAYER_CAMPAIGNS_COLLECTION = 'sdo_player_campaign_configs';

/**
 * Strips all undefined properties recursively so Firestore setDoc never rejects the payload
 */
function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

/**
 * Converts an SDO Video Project into a fully interactive Flow Player Engine Campaign
 */
export function convertVideoProjectToCampaign(project: VideoProject): CampaignConfig {
  const states: Record<string, FlowNodeState> = {};
  const scenes = project.scenes || [];
  const scenesCount = scenes.length;

  scenes.forEach((scene, index) => {
    const isFirst = index === 0;
    const isLast = index === scenesCount - 1;
    const nextScene = scenes[index + 1];

    const overlays: OverlayItem[] = [];

    // 1. Actions / CTAs
    if (scene.interactiveActions && scene.interactiveActions.length > 0) {
      overlays.push({
        id: `overlay_actions_${scene.id}`,
        type: 'quick_replies',
        position: 'bottom',
        title: 'בחר פעולה:',
        actions: scene.interactiveActions.map(act => ({
          id: act.id,
          label: act.label,
          targetNodeId: act.targetSceneId || nextScene?.id || scene.id,
          variant: act.variant === 'gold' ? 'gold' : 'primary'
        }))
      });
    }

    // 2. Info Cards
    if (scene.interactiveCards && scene.interactiveCards.length > 0) {
      const card = scene.interactiveCards[0];
      overlays.push({
        id: `overlay_card_${scene.id}`,
        type: 'info_card',
        position: 'top',
        title: card.title,
        subtitle: card.description
      });
    }

    // 3. Lead Generation Form overlay on closing scene
    if (scene.sceneRole === 'lead_closing' || isLast) {
      overlays.push({
        id: `overlay_lead_${scene.id}`,
        type: 'form_input',
        position: 'center',
        title: 'קבלו הצעה מותאמת אישית',
        subtitle: 'השאירו פרטים ונחזור אליכם בהקדם',
        formFields: [
          { key: 'fullName', label: 'שם מלא', type: 'text', placeholder: 'ישראל ישראלי' },
          { key: 'phone', label: 'טלפון נייד', type: 'tel', placeholder: '050-0000000' }
        ]
      });
    }

    const mediaUrl = scene.renderedVideoUrl || scene.backgroundMediaUrl || '';

    states[scene.id] = {
      id: scene.id,
      name: scene.title || `סצנה ${index + 1}`,
      description: scene.dialogueScript || '',
      videoUrl: mediaUrl,
      fallbackVideoUrl: scene.backgroundMediaUrl,
      autoPlay: true,
      soundEnabled: true,
      autoTransitionOnEnd: scene.autoTransitionOnEnd !== false,
      autoTransitionTarget: nextScene?.id,
      overlays: overlays.length > 0 ? overlays : undefined
    };
  });

  const slug = `sdo-funnel-${project.id.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  const initialId = scenes[0]?.id || 'node_1';

  const campaign: CampaignConfig = {
    id: project.id,
    slug,
    name: project.title,
    presenterId: scenes[0]?.avatarId || 'Wayne',
    initialNodeId: initialId,
    states,
    isPublished: true,
    publishedAt: Date.now(),
    settings: {
      defaultAspectRatio: (project.aspectRatio as AspectRatioType) || '16:9',
      autoPlay: true,
      primaryColor: '#9333ea',
      enableVoice: true,
      language: project.ttsLanguage || 'he-IL'
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return campaign;
}

/**
 * Saves and exports a video project as an interactive campaign ready for the Flow Player Engine
 */
export async function exportVideoProjectToFlowPlayer(
  project: VideoProject,
  db?: Firestore
): Promise<CampaignConfig> {
  const campaign = convertVideoProjectToCampaign(project);

  const cleanPayload = cleanForFirestore(campaign);

  // 1. Save to local storage for instant offline availability
  try {
    const localKey = 'comona_flow_player_campaigns';
    const existing = localStorage.getItem(localKey);
    const list: CampaignConfig[] = existing ? JSON.parse(existing) : [];
    const idx = list.findIndex(c => c.id === campaign.id || c.slug === campaign.slug);
    if (idx >= 0) {
      list[idx] = cleanPayload;
    } else {
      list.unshift(cleanPayload);
    }
    localStorage.setItem(localKey, JSON.stringify(list));
    localStorage.setItem('comona_active_flow_campaign_id', campaign.id);
  } catch (err) {
    console.warn('[VideoStudioFlowBridge] Local storage save notice:', err);
  }

  // 2. Save to Firestore
  if (db) {
    try {
      const docRef = doc(db, PLAYER_CAMPAIGNS_COLLECTION, campaign.id);
      await setDoc(docRef, cleanPayload, { merge: true });
      console.log(`[VideoStudioFlowBridge] Synced campaign to ${PLAYER_CAMPAIGNS_COLLECTION}:`, campaign.id);
    } catch (err) {
      console.warn('[VideoStudioFlowBridge] Firestore save notice:', err);
    }
  }

  return campaign;
}
