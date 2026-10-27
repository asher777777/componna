import { FlowPlayerCollectionsConfig, CampaignConfig } from '../types';

export const DEFAULT_COLLECTION_PREFIX = 'sdo_player_';

export function resolveCollections(
  prefix: string = DEFAULT_COLLECTION_PREFIX,
  custom?: FlowPlayerCollectionsConfig
): Required<FlowPlayerCollectionsConfig> {
  return {
    campaignConfigs: custom?.campaignConfigs || `${prefix}campaign_configs`,
    sessionEvents: custom?.sessionEvents || `${prefix}session_events`,
    presenters: custom?.presenters || 'presenters',
  };
}

export const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
  id: 'sales_rep_interactive_01',
  name: 'נגן זרימה מבוסס טריגרים - מנוע אינטראקטיבי',
  presenterId: 'presenter_elena_vance_san_francisco_01',
  initialNodeId: 'node_intro',
  settings: {
    defaultAspectRatio: '9:16',
    autoPlay: true,
    primaryColor: '#EAB308',
    enableVoice: true,
    language: 'he-IL',
  },
  states: {
    // 1. מסך כניסה
    node_intro: {
      id: 'node_intro',
      name: 'מסך כניסה',
      description: 'מסך פתיחה עם מיקרופון זהב מרכזי',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788087385571_scene_1_animated.mp4?alt=media',
      fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: true, // א. נגן בלופ עד הפעלת טריגר
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionOnEnd: false, // ג. לא מעביר בסיום, ממתין לטריגר
      
      micPosition: 'center',
      clickMicTargetNodeId: 'node_interaction',
      overlays: [],
      allowedIntents: {
        start: 'node_interaction',
        interact: 'node_interaction',
      },
    },

    // 2. וידאו אינטראקציה
    node_interaction: {
      id: 'node_interaction',
      name: 'אינטראקציה',
      description: 'סרטון הצגת אינטראקציה שמתנגן פעם אחת ומעביר אוטומטית להמתנה לתשובה',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788094281947_batty_talk-1.mp4?alt=media',
      fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: false, // א. לא בלופ (מתנגן פעם אחת)
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionOnEnd: true, // ג. העבר אוטומטית לצומת הבא בסיום הווידאו
      autoTransitionTarget: 'node_waiting', // ג. צומת היעד: המתנה לתשובה
      
      micPosition: 'hidden',
      overlays: [],
    },

    // 3. המתנה לתשובה
    node_waiting: {
      id: 'node_waiting',
      name: 'המתנה לתשובה',
      description: 'מיקרופון זהב במרכז המסך להקשבה. במידה ואין תגובה תוך 15 שניות עוברים לאני עסוק',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788089036047_scene_3_animated.mp4?alt=media',
      fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: true, // א. נגן בלופ עד הפעלת טריגר
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionDelaySec: 15, // ג. העבר אוטומטית לאחר 15 שניות
      autoTransitionTarget: 'node_busy', // ג. צומת היעד: אני עסוק
      
      micPosition: 'center',
      allowedIntents: {
        ask_pricing: 'node_pricing',
        ask_busy: 'node_busy',
        ask_contact: 'node_contact',
        restart: 'node_intro',
      },
      overlays: [],
    },

    // 4. אני עסוק
    node_busy: {
      id: 'node_busy',
      name: 'אני עסוק',
      description: 'מציג קרוסלת תיבות בחירה עם חצים בולטים ומסגרות זהב לאחר 15 שניות ללא מענה',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788094281947_batty_talk-1.mp4?alt=media',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: true, // א. נגן בלופ עד הפעלת טריגר (בחירה בקרוסלה)
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionOnEnd: false, // ג. לא מעביר בסיום, ממתין לבחירת המשתמש
      
      micPosition: 'bottom',
      overlays: [
        {
          id: 'ov_busy_carousel',
          type: 'carousel',
          position: 'center',
          title: 'במה תרצה להתמקד כעת?',
          subtitle: 'בחר מתוך האפשרויות הבאות להמשך החוויה',
          carouselItems: [
            {
              id: 'card_pricing',
              title: '💰 חבילות ומחירים',
              description: 'צפה במגוון מסלולי המנוי והמחירים המותאמים עבורך',
              targetNodeId: 'node_pricing',
              badge: 'מומלץ',
            },
            {
              id: 'card_lead',
              title: '📞 השארת פרטים לנציג',
              description: 'השאר פרטים ונציג אישי ייצור איתך קשר במהירות',
              targetNodeId: 'node_contact',
              badge: 'מהיר',
            },
            {
              id: 'card_talk_again',
              title: '🎙️ שאל שאלה קולית',
              description: 'הפעל מחדש את המיקרופון ושוחח עם הסוכן',
              targetNodeId: 'node_waiting',
              badge: 'AI Live',
            },
            {
              id: 'card_restart',
              title: '🔄 התחל מחדש',
              description: 'חזרה למסך הפתיחה',
              targetNodeId: 'node_intro',
            },
          ],
        },
      ],
    },

    // 5. מחירונים
    node_pricing: {
      id: 'node_pricing',
      name: 'הצגת מחירונים ומסלולים',
      description: 'פירוט חבילות מנוי ומחירים מותאמים',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      micPosition: 'bottom',
      allowedIntents: {
        select_starter: 'node_contact',
        select_pro: 'node_contact',
        back_intro: 'node_intro',
      },
      overlays: [
        {
          id: 'ov_pricing_cards',
          type: 'product_card',
          position: 'center',
          title: 'חבילת Pro המובילה',
          subtitle: 'כולל אינטראקציות ללא הגבלה וסנכרון וידאו מלא',
          price: '₪299 / חודש',
          actions: [
            { id: 'act_choose_pro', label: 'השאר פרטים למסלול זה', targetNodeId: 'node_contact', variant: 'gold' },
            { id: 'act_back', label: 'חזרה להתחלה', targetNodeId: 'node_intro', variant: 'outline' },
          ],
        },
      ],
    },

    // 6. השארת פרטים
    node_contact: {
      id: 'node_contact',
      name: 'השארת פרטים ויצירת קשר',
      description: 'טופס לכידת ליד',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      micPosition: 'bottom',
      allowedIntents: {
        restart: 'node_intro',
      },
      overlays: [
        {
          id: 'ov_lead_form',
          type: 'form_input',
          position: 'center',
          title: 'השארת פרטים לנציג',
          subtitle: 'הזן פרטים ונחזור אליך בהקדם',
          formFields: [
            { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text' },
            { key: 'phone', label: 'מספר טלפון', placeholder: '050-0000000', type: 'tel' },
          ],
          actions: [
            { id: 'act_restart', label: 'התחל שיחה מחדש', targetNodeId: 'node_intro', variant: 'outline' },
          ],
        },
      ],
    },
  },
};