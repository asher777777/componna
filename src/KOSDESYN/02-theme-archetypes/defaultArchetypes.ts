import { ArchetypePreset } from './types';

/**
 * ברירות מחדל מקומיות מעוצבות (Fallback & Offline-First)
 * כולל הגדרות רקע אטמוספרי, פריסה ומעברים
 */
export const DEFAULT_ARCHETYPES: Record<string, ArchetypePreset> = {
  // 0. סגנון KOSUN Portal (זהה לחלוטין לתמונה המקורית!)
  kosun_portal: {
    id: 'kosun_portal',
    name: 'פורטל קושאן / חלל עתידני (KOSUN Cosmos)',
    category: 'tech_portal',
    isActive: true,
    backdrop: {
      type: 'cosmos',
      primaryGlowColor: '#00d2ff',
      secondaryGlowColor: '#3a7bd5',
      overlayOpacity: 0.85,
      showParticles: true
    },
    motion: {
      preset: 'stagger_glow',
      hoverScale: 1.02,
      transitionDurationMs: 250,
      staggerDelayMs: 90
    },
    defaultLayout: 'vertical_pills',
    style: {
      primaryColor: '#00c6ff',
      secondaryColor: '#0072ff',
      surfaceBg: '#e2e8f0',
      cardBg: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      borderColor: '#38bdf8',
      borderWidth: '2px',
      borderRadius: '2xl',
      shadow: 'glow',
      fontFamily: 'sans',
      spacing: 'comfortable'
    },
    copy: {
      ctaPrimary: 'צפייה במוצר',
      ctaSecondary: 'מידע נוסף',
      inquiryTitle: 'אלו הם המוצרים שלנו',
      inquirySubtitle: 'בחר קושאן או פעולה להמשך',
      trustBadge: 'מאומת ברשת KOSUN',
      contactSuccess: 'הפעולה נקלטה במערכת בהצלחה!',
      emptyStateText: 'אין מוצרים זמינים להצגה כרגע'
    },
    inputMode: {
      type: 'quick_contact',
      allowVoiceNote: true,
      submitButtonText: 'קליטה...'
    },
    outputMode: {
      type: 'invitation_voucher',
      showConfetti: true,
      addToCalendar: true
    }
  },

  // 1. משפטי / עורך דין / פיננסים
  lawyer: {
    id: 'lawyer',
    name: 'עורך דין / משפטי ופיננסי',
    category: 'professional',
    isActive: true,
    backdrop: {
      type: 'minimal_solid',
      primaryGlowColor: '#cbd5e1',
      overlayOpacity: 0.2,
      showParticles: false
    },
    motion: {
      preset: 'sharp_fade',
      hoverScale: 1.0,
      transitionDurationMs: 150,
      staggerDelayMs: 50
    },
    defaultLayout: 'vertical_pills',
    style: {
      primaryColor: '#0f172a',
      secondaryColor: '#c5a880',
      surfaceBg: '#f8fafc',
      cardBg: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      borderColor: '#e2e8f0',
      borderWidth: '1px',
      borderRadius: 'sm',
      shadow: 'soft',
      fontFamily: 'serif',
      spacing: 'comfortable'
    },
    copy: {
      ctaPrimary: 'תיאום פגישת ייעוץ',
      ctaSecondary: 'בדיקת היתכנות לתיק',
      inquiryTitle: 'מחלקות ושירותים משפטיים',
      inquirySubtitle: 'מענה מקצועי יינתן על ידי עורך דין בתוך יום עסקים',
      trustBadge: 'חיסיון עורך דין-לקוח מובטח על פי דין',
      contactSuccess: 'פנייתך התקבלה ונרשמה. צוות המשרד יצור עמך קשר בהקדם.',
      emptyStateText: 'לא נמצאו תיקים או שירותים להצגה'
    },
    inputMode: {
      type: 'step_wizard',
      requirePhone: true,
      requireEmail: true,
      allowFileUpload: true,
      submitButtonText: 'שליחת פרטים לבדיקה'
    },
    outputMode: {
      type: 'formal_document',
      enablePdfDownload: true,
      addToCalendar: true
    }
  },

  // 2. ביוטי / קוסמטיקה / נשי
  feminine: {
    id: 'feminine',
    name: 'ביוטי / קוסמטיקה ואופנה',
    category: 'lifestyle',
    isActive: true,
    backdrop: {
      type: 'aurora',
      primaryGlowColor: '#fda4af',
      secondaryGlowColor: '#f43f5e',
      overlayOpacity: 0.6,
      showParticles: true
    },
    motion: {
      preset: 'gentle_spring',
      hoverScale: 1.03,
      transitionDurationMs: 350,
      staggerDelayMs: 120
    },
    defaultLayout: 'grid_2col',
    style: {
      primaryColor: '#e11d48',
      secondaryColor: '#f43f5e',
      surfaceBg: '#fff1f2',
      cardBg: '#ffffff',
      textPrimary: '#881337',
      textSecondary: '#9f1239',
      borderColor: '#ffe4e6',
      borderWidth: '1px',
      borderRadius: '2xl',
      shadow: 'medium',
      fontFamily: 'sans',
      spacing: 'spacious'
    },
    copy: {
      ctaPrimary: 'שרייני לעצמך פינוק',
      ctaSecondary: 'להציץ בתוצאות',
      inquiryTitle: 'הטיפולים והפינוקים שלנו',
      inquirySubtitle: 'טיפולים מותאמים אישית באווירה רגועה ומפנקת',
      trustBadge: 'חומרים פרימיום מאושרים ומותאמים לעורך',
      contactSuccess: 'איזה כיף! שריינתי לך את הזמן, מחכה לראות אותך 💕',
      emptyStateText: 'הטיפולים יתעדכנו בקרוב...'
    },
    inputMode: {
      type: 'calendar_picker',
      requirePhone: true,
      submitButtonText: 'אישור תור מיידי'
    },
    outputMode: {
      type: 'invitation_voucher',
      showConfetti: true,
      addToCalendar: true,
      shareToWhatsapp: true
    }
  },

  // 3. הייטק / גברי / רכב
  masculine: {
    id: 'masculine',
    name: 'הייטק / גברי, כושר ורכב',
    category: 'tech_automotive',
    isActive: true,
    backdrop: {
      type: 'ambient_glow',
      primaryGlowColor: '#2563eb',
      secondaryGlowColor: '#1e1b4b',
      overlayOpacity: 0.9,
      showParticles: false
    },
    motion: {
      preset: 'sharp_fade',
      hoverScale: 1.01,
      transitionDurationMs: 180,
      staggerDelayMs: 60
    },
    defaultLayout: 'vertical_pills',
    style: {
      primaryColor: '#2563eb',
      secondaryColor: '#38bdf8',
      surfaceBg: '#09090b',
      cardBg: '#18181b',
      textPrimary: '#fafafa',
      textSecondary: '#a1a1aa',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderRadius: 'none',
      shadow: 'strong',
      fontFamily: 'sans',
      spacing: 'compact'
    },
    copy: {
      ctaPrimary: 'התחל עכשיו',
      ctaSecondary: 'מפרט טכני מלא',
      inquiryTitle: 'פתרונות ומודולים פעילים',
      inquirySubtitle: 'ביצועים מקסימליים ללא פשרות',
      trustBadge: 'ביטול בכל עת בלחיצת כפתור',
      contactSuccess: 'הבקשה אושרה! פרטי הגישה נשלחו אליך ישירות.',
      emptyStateText: 'אין פריטים פעילים במערכת'
    },
    inputMode: {
      type: 'quick_contact',
      requirePhone: true,
      submitButtonText: 'שליחה מיידית'
    },
    outputMode: {
      type: 'instant_receipt',
      showConfetti: false,
      shareToWhatsapp: true
    }
  },

  // 4. קליניקה / טיפולי / רפואה משלימה
  wellness: {
    id: 'wellness',
    name: 'קליניקה טיפולית / וולנס ואיזון',
    category: 'health_wellness',
    isActive: true,
    backdrop: {
      type: 'mesh_gradient',
      primaryGlowColor: '#86efac',
      secondaryGlowColor: '#6ee7b7',
      overlayOpacity: 0.4,
      showParticles: true
    },
    motion: {
      preset: 'breathe',
      hoverScale: 1.02,
      transitionDurationMs: 400,
      staggerDelayMs: 150
    },
    defaultLayout: 'grid_2col',
    style: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      surfaceBg: '#f0fdf4',
      cardBg: '#ffffff',
      textPrimary: '#064e3b',
      textSecondary: '#047857',
      borderColor: '#bbf7d0',
      borderWidth: '1px',
      borderRadius: 'xl',
      shadow: 'soft',
      fontFamily: 'sans',
      spacing: 'spacious'
    },
    copy: {
      ctaPrimary: 'בוא/י נשוחח',
      ctaSecondary: 'להכיר את השיטה',
      inquiryTitle: 'מרחבי ריפוי וסדנאות',
      inquirySubtitle: 'מפגש ראשוני ללא התחייבות בסביבה תומכת',
      trustBadge: 'מרחב מוגן, בטוח ומכיל',
      contactSuccess: 'תודה על פנייתך. נשמח להיפגש בקרוב בשלווה.',
      emptyStateText: 'הסדנאות יפורסמו בהמשך'
    },
    inputMode: {
      type: 'conversational_form',
      requirePhone: true,
      allowVoiceNote: true,
      submitButtonText: 'קביעת שיחת היכרות'
    },
    outputMode: {
      type: 'mindful_success',
      addToCalendar: true
    }
  }
};
