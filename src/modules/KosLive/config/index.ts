import { AvatarPreset, AspectRatioType, LivingCampaignContract } from '../types';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts';

export const KOS_LIVE_AVATARS: AvatarPreset[] = [
  {
    id: 'wayne_business',
    name: 'אלון - מנהל מכירות אלגנטי',
    gender: 'male',
    previewImageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-businessman-presenting-a-project-42861-large.mp4',
    voiceId: 'he-IL-Wavenet-B',
    recommendedFor: 'עמודי נחיתה עסקיים, ייעוץ פיננסי, B2B'
  },
  {
    id: 'sarah_warm',
    name: 'שירה - מנחה כריזמטית ומזמינה',
    gender: 'female',
    previewImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-explaining-business-ideas-42859-large.mp4',
    voiceId: 'he-IL-Wavenet-A',
    recommendedFor: 'קורסים, שירותים דיגיטליים, מנויים, בריאות'
  },
  {
    id: 'daniel_tech',
    name: 'דניאל - מומחה טכנולוגי ודיגיטל',
    gender: 'male',
    previewImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-presenting-a-dashboard-42864-large.mp4',
    voiceId: 'he-IL-Wavenet-C',
    recommendedFor: 'תוכנות SaaS, מוצרים מתקדמים, פינטק'
  },
  {
    id: 'maya_concierge',
    name: 'מאיה - מארחת שירות ומכירות אישית',
    gender: 'female',
    previewImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-customer-service-specialist-speaking-42862-large.mp4',
    voiceId: 'he-IL-Wavenet-D',
    recommendedFor: 'ווידג\'ט קונסיירז\' צף, סגירת לידים מהירה'
  }
];

export const HEBREW_TTS_VOICES = [
  { id: 'he-IL-Wavenet-A', name: 'שירה (קול נשי חם ויוקרתי)', gender: 'female' },
  { id: 'he-IL-Wavenet-B', name: 'אלון (קול גברי סמכותי ומדויק)', gender: 'male' },
  { id: 'he-IL-Wavenet-C', name: 'דניאל (קול גברי צעיר ודינמי)', gender: 'male' },
  { id: 'he-IL-Wavenet-D', name: 'מאיה (קול נשי שירותי ומזמין)', gender: 'female' },
];

export const DEFAULT_LIVING_CAMPAIGN: LivingCampaignContract = {
  id: 'demo-living-page',
  slug: 'demo-living-page',
  name: 'הדגמת עמוד חי אינטראקטיבי',
  description: 'עמוד חי המדגים קבלת פנים מאוואטר, הצגת יתרונות, שאלות נפוצות וטופס לידים',
  presenterId: 'sarah_warm',
  initialSceneId: 'scene_welcome',
  aspectRatio: '9:16',
  isPublished: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: {
    primaryColor: '#eab308', // Luxury Gold
    enableVoice: true,
    autoPlay: true,
    language: 'he-IL',
    displayMode: 'full_page'
  },
  scenes: {
    scene_welcome: {
      id: 'scene_welcome',
      sceneNumber: 1,
      title: 'ברוכים הבאים - קבלת פנים חיה',
      dialogueScript: 'שלום וברוכים הבאים! אני כאן כדי להציג לכם את השירותים שלנו באופן אישי ומדויק. מה תרצו לגלות קודם?',
      renderedVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-explaining-business-ideas-42859-large.mp4',
      backgroundMediaUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
      autoTransitionOnEnd: false,
      enableVoiceTrigger: true,
      allowedIntents: {
        'features': 'scene_features',
        'pricing': 'scene_pricing',
        'contact': 'scene_contact'
      },
      overlays: [
        {
          id: 'ov_welcome_actions',
          type: 'quick_replies',
          position: 'bottom',
          title: 'בחר כיצד להמשיך:',
          actions: [
            { id: 'act_feat', label: '🚀 מה כולל השירות?', targetSceneId: 'scene_features', variant: 'gold' },
            { id: 'act_price', label: '💎 כמה זה עולה?', targetSceneId: 'scene_pricing', variant: 'primary' },
            { id: 'act_talk', label: '📞 השארת פרטים מהירה', targetSceneId: 'scene_contact', variant: 'secondary' }
          ]
        }
      ]
    },
    scene_features: {
      id: 'scene_features',
      sceneNumber: 2,
      title: 'היתרונות המובילים שלנו',
      dialogueScript: 'אנחנו מציעים לכם מעטפת שלמה: מהירות ללא תחרות, התאמה אישית מלאה ותמיכה מסביב לשעון. תרצו לקבל הצעה מותאמת עכשיו?',
      renderedVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-businessman-presenting-a-project-42861-large.mp4',
      backgroundMediaUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80',
      autoTransitionOnEnd: false,
      enableVoiceTrigger: true,
      overlays: [
        {
          id: 'ov_feat_card',
          type: 'info_card',
          position: 'top',
          title: '3 יתרונות בלעדיים ללקוחותינו',
          subtitle: 'אינטגרציה תוך 60 שניות • אבטחת ענן תקנית • ליווי אישי 1-על-1'
        },
        {
          id: 'ov_feat_actions',
          type: 'quick_replies',
          position: 'bottom',
          title: 'השלב הבא:',
          actions: [
            { id: 'act_to_price', label: '💳 מעבר למחירים וחבילות', targetSceneId: 'scene_pricing', variant: 'gold' },
            { id: 'act_back_wel', label: '↩ חזרה להתחלה', targetSceneId: 'scene_welcome', variant: 'outline' }
          ]
        }
      ]
    },
    scene_pricing: {
      id: 'scene_pricing',
      sceneNumber: 3,
      title: 'מחירים וחבילות מותאמות אישית',
      dialogueScript: 'יש לנו מסלולים מגוונים המתאימים לעסקים בכל גודל. ללא התחייבות, עם שקיפות מלאה.',
      renderedVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-presenting-a-dashboard-42864-large.mp4',
      backgroundMediaUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
      autoTransitionOnEnd: false,
      overlays: [
        {
          id: 'ov_product_box',
          type: 'product_card',
          position: 'center',
          title: 'חבילת Living Pro',
          subtitle: 'כולל פרזנטור AI חכם, סוכן שיחה קולי וחיבור ישיר ל-CRM',
          price: '₪199 לחודש',
          actions: [
            { id: 'act_order_now', label: 'רכישה עכשיו ➔', targetSceneId: 'scene_contact', variant: 'gold' }
          ]
        }
      ]
    },
    scene_contact: {
      id: 'scene_contact',
      sceneNumber: 4,
      title: 'השארת פרטים ויצירת קשר',
      dialogueScript: 'מצוין! השאירו את פרטיכם בטופס שלפניכם, והצוות שלנו יחזור אליכם בהקדם האפשרי.',
      renderedVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-customer-service-specialist-speaking-42862-large.mp4',
      backgroundMediaUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
      autoTransitionOnEnd: false,
      overlays: [
        {
          id: 'ov_contact_form',
          type: 'form_input',
          position: 'center',
          title: 'קבלת פרטים והצעה אישית',
          subtitle: 'מלאו שם וטלפון וההצעה בדרך אליכם',
          formFields: [
            { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text' },
            { key: 'phone', label: 'מספר טלפון / וואטסאפ', placeholder: '050-0000000', type: 'tel' }
          ],
          actions: [
            { id: 'act_back_home', label: 'לסיום וחזרה לראשי', targetSceneId: 'scene_welcome', variant: 'primary' }
          ]
        }
      ]
    }
  }
};
