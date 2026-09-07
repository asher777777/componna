import { CampaignConfig } from '../types';
import { DEFAULT_CAMPAIGN_CONFIG } from './index';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: string;
  config: Partial<CampaignConfig>;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'sales_rep',
    name: 'נציגת מכירות וירטואלית (ברירת מחדל)',
    description: 'תהליך מכירות מלא עם מסך כניסה, הצגת אינטראקציה, מענה לשאלות וקרוסלת כרטיסיות',
    badge: 'מומלץ',
    icon: 'Sparkles',
    config: DEFAULT_CAMPAIGN_CONFIG,
  },
  {
    id: 'lead_gen',
    name: 'איסוף לידים ותיאום פגישה (Lead Magnet)',
    description: 'סרטון פתיחה קצר, כפתורי בחירת התאמה, והפניה להשארת פרטים או וואטסאפ',
    badge: 'פופולרי',
    icon: 'UserPlus',
    config: {
      name: 'תהליך איסוף לידים ותיאום פגישות',
      initialNodeId: 'node_intro',
      settings: {
        defaultAspectRatio: '9:16',
        autoPlay: true,
        primaryColor: '#10B981',
        enableVoice: true,
        language: 'he-IL',
      },
      states: {
        node_intro: {
          id: 'node_intro',
          name: 'פתיח והזמנה לפגישה',
          description: 'הצגת ההצעה והזמנה ללחיצה על הכפתור',
          videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788087385571_scene_1_animated.mp4?alt=media',
          autoPlay: true,
          loopUntilTrigger: true,
          soundEnabled: true,
          micPosition: 'center',
          clickMicTargetNodeId: 'node_form',
          overlays: [
            {
              id: 'ov_lead_cta',
              type: 'quick_replies',
              position: 'bottom',
              title: 'בחר פעולה להמשך:',
              actions: [
                {
                  id: 'act_consult',
                  label: 'תיאום שיחת ייעוץ אישית 📅',
                  targetNodeId: 'node_form',
                  variant: 'gold',
                },
              ],
            },
          ],
        },
        node_form: {
          id: 'node_form',
          name: 'טופס איסוף פרטים',
          description: 'השארת פרטים או מעבר לוואטסאפ',
          videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788094281947_batty_talk-1.mp4?alt=media',
          autoPlay: true,
          loopUntilTrigger: true,
          soundEnabled: true,
          micPosition: 'bottom',
          overlays: [
            {
              id: 'ov_form_card',
              type: 'info_card',
              position: 'center',
              title: 'השאר פרטים ונחזור אליך תוך דקות',
              subtitle: 'או שלח הודעת וואטסאפ ישירה',
              actions: [
                {
                  id: 'act_wa',
                  label: 'פנה בוואטסאפ עכשיו 💬',
                  targetNodeId: 'node_intro',
                  variant: 'primary',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    id: 'quiz_flow',
    name: 'שאלון אינטראקטיבי / סקר',
    description: 'שאילת שאלות בווידאו, בחירת תשובות על ידי המשתמש וניתוב בהתאם לתשובה',
    badge: 'אינטראקטיבי',
    icon: 'HelpCircle',
    config: {
      name: 'שאלון התאמה אינטראקטיבי',
      initialNodeId: 'node_q1',
      settings: {
        defaultAspectRatio: '9:16',
        autoPlay: true,
        primaryColor: '#6366F1',
        enableVoice: true,
        language: 'he-IL',
      },
      states: {
        node_q1: {
          id: 'node_q1',
          name: 'שאלה 1 - מה המטרה העיקרית?',
          description: 'הצגת שאלה 1 עם 2 אפשרויות בחירה',
          videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788087385571_scene_1_animated.mp4?alt=media',
          autoPlay: true,
          loopUntilTrigger: true,
          soundEnabled: true,
          micPosition: 'bottom',
          overlays: [
            {
              id: 'ov_ans_actions',
              type: 'quick_replies',
              position: 'bottom',
              title: 'בחר את המטרה העיקרית:',
              actions: [
                {
                  id: 'act_sales',
                  label: 'אפשרות א: הגדלת מכירות 🚀',
                  targetNodeId: 'node_res_sales',
                  variant: 'gold',
                },
                {
                  id: 'act_auto',
                  label: 'אפשרות ב: חיסכון בזמן ואוטומציה ⚙️',
                  targetNodeId: 'node_res_automation',
                  variant: 'primary',
                },
              ],
            },
          ],
        },
        node_res_sales: {
          id: 'node_res_sales',
          name: 'תוצאה: פתרון מכירות',
          description: 'התאמת פתרון להגדלת מכירות',
          videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788094281947_batty_talk-1.mp4?alt=media',
          autoPlay: true,
          loopUntilTrigger: true,
          soundEnabled: true,
          micPosition: 'bottom',
          overlays: [],
        },
        node_res_automation: {
          id: 'node_res_automation',
          name: 'תוצאה: פתרון אוטומציה',
          description: 'התאמת פתרון לאוטומציה',
          videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788089036047_scene_3_animated.mp4?alt=media',
          autoPlay: true,
          loopUntilTrigger: true,
          soundEnabled: true,
          micPosition: 'bottom',
          overlays: [],
        },
      },
    },
  },
  {
    id: 'blank_project',
    name: 'פרויקט ריק מאפס (Blank Flow)',
    description: 'צומת פתיחה יחיד ונקי לעיצוב והעלאת סרטונים מותאמים אישית',
    badge: 'נקי',
    icon: 'PlusSquare',
    config: {
      name: 'פרויקט אינטראקטיבי חדש',
      initialNodeId: 'node_start',
      settings: {
        defaultAspectRatio: '9:16',
        autoPlay: true,
        primaryColor: '#EAB308',
        enableVoice: true,
        language: 'he-IL',
      },
      states: {
        node_start: {
          id: 'node_start',
          name: 'צומת התחלה',
          description: 'העלה סרטון והגדר כרטיסיות בסטודיו',
          videoUrl: '',
          autoPlay: true,
          loopUntilTrigger: true,
          soundEnabled: true,
          micPosition: 'center',
          overlays: [],
        },
      },
    },
  },
];
