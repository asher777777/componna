import { Firestore, doc, setDoc } from 'firebase/firestore';
import { VideoProject, VideoScene } from '../types';
import { CampaignConfig, FlowNodeState, OverlayItem, OverlayAction } from '../../flow-player-engine/types';

const PLAYER_CAMPAIGNS_COLLECTION = 'sdo_player_campaign_configs';

/**
 * Converts a Video Producer Studio project into an interactive Flow Player CampaignConfig
 */
export function convertVideoProjectToCampaign(project: VideoProject): CampaignConfig {
  const campaignSlug = project.campaignSlug || `campaign_${project.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const initialNodeId = project.scenes[0]?.id || 'scene_1';

  const states: Record<string, FlowNodeState> = {};

  project.scenes.forEach((scene, index) => {
    const nextScene = project.scenes[index + 1];
    const prevScene = project.scenes[index - 1];

    const overlays: OverlayItem[] = [];

    // 1. Info Cards / Product Cards / Feature Breakdown (הסברים)
    if (scene.interactiveCards && scene.interactiveCards.length > 0) {
      if (scene.interactiveCards.length === 1) {
        const card = scene.interactiveCards[0];
        overlays.push({
          id: `card_${scene.id}`,
          type: card.price ? 'product_card' : 'info_card',
          position: 'top',
          title: card.title,
          subtitle: card.description,
          price: card.price,
          imageUrl: card.imageUrl,
          actions: card.targetSceneId ? [
            {
              id: `act_card_${card.id}`,
              label: card.ctaLabel || 'גלה פרטים נוספים',
              targetNodeId: card.targetSceneId,
              variant: 'primary'
            }
          ] : undefined
        });
      } else {
        overlays.push({
          id: `carousel_${scene.id}`,
          type: 'carousel',
          position: 'top',
          title: 'הסברים ותכונות מרכזיות',
          carouselItems: scene.interactiveCards.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            imageUrl: c.imageUrl,
            targetNodeId: c.targetSceneId || (nextScene?.id || scene.id),
            badge: c.badge || (c.price ? `${c.price}` : undefined)
          }))
        });
      }
    }

    // 2. Interactive Actions & Sales Buttons (מעברים ושיחת מכירה)
    const sceneActions: OverlayAction[] = [];

    if (scene.interactiveActions && scene.interactiveActions.length > 0) {
      scene.interactiveActions.forEach(act => {
        sceneActions.push({
          id: act.id,
          label: act.label,
          targetNodeId: act.targetSceneId,
          variant: act.variant || 'primary',
          icon: act.icon
        });
      });
    } else {
      // Default smart navigation if none defined
      if (nextScene) {
        sceneActions.push({
          id: `next_${scene.id}`,
          label: index === 0 ? '🚀 בוא נתחיל בהדגמה' : 'המשך לסצנה הבאה',
          targetNodeId: nextScene.id,
          variant: 'primary'
        });
      }

      if (scene.sceneRole === 'sales_pitch' || scene.sceneRole === 'lead_closing') {
        if (project.scenes.length > 1) {
          sceneActions.push({
            id: `back_${scene.id}`,
            label: 'חזור להסבר הקודם',
            targetNodeId: prevScene?.id || initialNodeId,
            variant: 'outline'
          });
        }
      }
    }

    if (sceneActions.length > 0) {
      overlays.push({
        id: `actions_${scene.id}`,
        type: 'quick_replies',
        position: 'bottom',
        actions: sceneActions
      });
    }

    // 3. Lead Form Input (איסוף לידים וסגירת מכירה)
    if (scene.formFields && scene.formFields.length > 0) {
      overlays.push({
        id: `form_${scene.id}`,
        type: 'form_input',
        position: 'center',
        title: 'השאר פרטים ונחזור אליך מיד',
        subtitle: 'הזן את הפרטים לקבלת הצעת מחיר בלעדית',
        formFields: scene.formFields,
        actions: [
          {
            id: `submit_${scene.id}`,
            label: 'שלח פרטים עכשיו',
            targetNodeId: nextScene?.id || scene.id,
            variant: 'gold'
          }
        ]
      });
    }

    // 4. Voice Intents mapping
    const allowedIntents: Record<string, string> = {};
    if (scene.voicePromptExamples && scene.voicePromptExamples.length > 0) {
      scene.voicePromptExamples.forEach(p => {
        allowedIntents[p] = nextScene?.id || scene.id;
      });
    }
    if (nextScene) {
      allowedIntents['כן'] = nextScene.id;
      allowedIntents['המשך'] = nextScene.id;
      allowedIntents['רוצה לשמוע עוד'] = nextScene.id;
    }
    if (prevScene) {
      allowedIntents['חזור'] = prevScene.id;
      allowedIntents['לא הבנתי'] = prevScene.id;
    }

    const videoSrc = scene.renderedVideoUrl || 
      (scene.backgroundType === 'video' ? scene.backgroundMediaUrl : undefined) ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

    states[scene.id] = {
      id: scene.id,
      name: scene.title,
      description: scene.dialogueScript,
      videoUrl: videoSrc,
      fallbackVideoUrl: scene.backgroundMediaUrl || videoSrc,
      autoPlay: true,
      soundEnabled: true,
      loop: false,
      loopUntilTrigger: false,
      autoTransitionOnEnd: scene.autoTransitionOnEnd ?? (sceneActions.length === 0 && !!nextScene),
      autoTransitionDelaySec: scene.autoTransitionDelaySec ?? 0,
      autoTransitionTarget: scene.autoTransitionTargetSceneId || (nextScene?.id || ''),
      overlays,
      allowedIntents,
      micPosition: scene.enableVoiceTrigger ? 'bottom' : 'hidden',
      micActionType: 'open_text_input',
      systemInstructions: `אתה נציג מכירות אינטראקטיבי עבור ${project.title}. ענה בקצרה ובחיוביות.`
    };
  });

  return {
    id: project.id,
    slug: campaignSlug,
    name: project.title,
    presenterId: project.scenes[0]?.avatarId || 'avatar_wayne',
    initialNodeId,
    states,
    isPublished: true,
    publishedAt: Date.now(),
    settings: {
      defaultAspectRatio: project.aspectRatio === '9:16' ? '9:16' : project.aspectRatio === '1:1' ? '1:1' : '16:9',
      autoPlay: true,
      primaryColor: '#6366f1',
      enableVoice: true,
      language: 'he-IL'
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Saves the converted CampaignConfig to Firestore & Local Storage
 */
export async function exportVideoProjectToFlowPlayer(
  project: VideoProject,
  db?: Firestore
): Promise<CampaignConfig> {
  const campaign = convertVideoProjectToCampaign(project);

  // 1. Save to Local Storage for instant availability
  try {
    const localKey = 'comona_flow_player_campaigns';
    const existing = localStorage.getItem(localKey);
    const list: CampaignConfig[] = existing ? JSON.parse(existing) : [];
    const idx = list.findIndex(c => c.id === campaign.id || c.slug === campaign.slug);
    if (idx >= 0) {
      list[idx] = campaign;
    } else {
      list.unshift(campaign);
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
      await setDoc(docRef, campaign, { merge: true });
      console.log(`[VideoStudioFlowBridge] Synced campaign to ${PLAYER_CAMPAIGNS_COLLECTION}:`, campaign.id);
    } catch (err) {
      console.warn('[VideoStudioFlowBridge] Firestore save notice:', err);
    }
  }

  return campaign;
}