import { comonaDb, kosunDb } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AreaCollectionSchema {
  areaId: string;
  componentName: string;
  pageId: string;
  parameters: Array<{
    key: string;
    label: string;
    currentValue: any;
    options?: Array<{ value: string; label: string; desc?: string }>;
  }>;
}

/**
 * חילוץ פלטת צבעים מלאה מתוך תמונת לוגו (Logo Color Extraction Engine)
 */
export async function extractPaletteFromLogoImage(dataUrlOrFile: string): Promise<{
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  humanName: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No context');

        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imgData = ctx.getImageData(0, 0, 100, 100).data;
        const colorCounts: Record<string, number> = {};

        // סריקת פיקסלים וסינון רקע שחור/לבן/שקוף
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 120) continue; // שקוף
          if (r > 245 && g > 245 && b > 245) continue; // לבן מוחלט
          if (r < 15 && g < 15 && b < 15) continue; // שחור מוחלט

          // עיגול לכפולות של 16 לקבלת גוונים דומיננטיים
          const qr = Math.round(r / 16) * 16;
          const qg = Math.round(g / 16) * 16;
          const qb = Math.round(b / 16) * 16;
          const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
        const primary = sortedColors[0] ? sortedColors[0][0] : '#00F0FF';
        const secondary = sortedColors[1] ? sortedColors[1][0] : '#38BDF8';
        const accent = sortedColors[2] ? sortedColors[2][0] : '#F59E0B';

        resolve({
          primary,
          secondary,
          accent,
          glow: `${primary}55`,
          humanName: `גווני מיתוג שחולצו מהלוגו (${primary})`
        });
      } catch (e) {
        resolve({
          primary: '#00F0FF',
          secondary: '#38BDF8',
          accent: '#F59E0B',
          glow: 'rgba(0, 240, 255, 0.4)',
          humanName: 'ציאן ניאון עתידני'
        });
      }
    };
    img.onerror = () => {
      resolve({
        primary: '#00F0FF',
        secondary: '#38BDF8',
        accent: '#F59E0B',
        glow: 'rgba(0, 240, 255, 0.4)',
        humanName: 'ציאן ניאון עתידני'
      });
    };
    img.src = dataUrlOrFile;
  });
}

export interface StyleColorTokens {
  pageBg: string;
  editorBg: string;
  cardBg: string;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  primaryColor: string;
  glowColor: string;
  accentBadge: string;
  activeBorder: string;
}

export type KosunDiscoveryLayoutMode =
  | 'accordion_morph'
  | 'spotlight_stage'
  | 'glass_flip_overlay'
  | 'bento_asymmetric'
  | 'swipe_action_deck';

export function resolveDiscoveryLayoutMode(
  layoutBudget?: string,
  fallbackMode: KosunDiscoveryLayoutMode = 'accordion_morph'
): KosunDiscoveryLayoutMode {
  if (!layoutBudget) return fallbackMode;
  switch (layoutBudget) {
    case 'accordion_morph':
    case 'four_rows':
      return 'accordion_morph';
    case 'spotlight_stage':
    case 'standard':
      return 'spotlight_stage';
    case 'glass_flip_overlay':
    case 'prominent_main':
      return 'glass_flip_overlay';
    case 'bento_asymmetric':
    case 'inverted':
    case 'bento':
      return 'bento_asymmetric';
    case 'swipe_action_deck':
    case 'deck':
      return 'swipe_action_deck';
    default:
      return fallbackMode;
  }
}

export interface StylePresetDefinition {
  value: string;
  label: string;
  shortLabel: string;
  desc?: string;
  marketAffinity: string[];
  defaultLayout: KosunDiscoveryLayoutMode | 'standard' | 'inverted' | 'four_rows' | 'prominent_main';
  fontSizeScale: 'compact' | 'normal' | 'large';
  titleFontWeight: string;
  fontFamily: string;
  // 1. מנגנון גילוי התוכן ב-60% (Content Discovery Mechanic)
  discovery: {
    mode: KosunDiscoveryLayoutMode;
    labelHe: string;
    activeRatio: string;
    revealTrigger: 'tap' | 'auto_cycle' | 'compass_select';
    transitionPreset: 'spring_snappy' | 'smooth_editorial' | 'kinetic_glow';
  };
  // 2. גיאומטריה וצורות (Shapes & Layout)
  geometry: {
    cardRadius: string;
    cardGap: string;
    borderStyle: 'none' | 'hairline_subtle' | 'accent_glow' | 'double_frame';
    paddingScale: 'compact' | 'balanced' | 'spacious';
  };
  // 3. אלמנטים ויזואליים, מדיה ואייקונים
  visuals: {
    surfaceMode: 'frosted_glass' | 'solid_matte' | 'media_full_bleed' | 'gradient_mesh';
    mediaPlacement: 'none' | 'background_cover' | 'side_avatar' | 'top_banner';
    mediaOverlayOpacity: number;
    iconStyle: 'glowing_orb' | 'minimal_outline' | 'watermark_giant' | 'pill_badge';
    badgePlacement: 'top_end' | 'inline_header' | 'floating_bottom';
    ambientEffect: 'none' | 'radial_aura' | 'mesh_pulse' | 'fine_grid';
  };
  // 4. סגנון הקפסולה העליונה (Interactive Capsule Styling)
  capsule: {
    variant: 'neon_floating_dock' | 'stealth_gold_minimal' | 'executive_command_bar' | 'organic_soft_pill' | 'kinetic_split_capsule';
    radius: string;
    showSoundwave?: boolean;
    tagLabel?: string;
    avatarIcon: string;
  };
  day: StyleColorTokens;
  night: StyleColorTokens;
}

/**
 * 🎨 קולקציית 5 הסגנונות ומנגנוני גילוי התוכן של KOSUN 2026
 * הוספת סגנון חדש = הוספת אובייקט JSON כאן (או במסמך Firestore בקולקציית style_collections) ללא שינוי קוד!
 */
export const KOSUN_STYLE_PRESETS: Record<string, StylePresetDefinition> = {
  cyber_neon: {
    value: 'cyber_neon',
    label: '1. סייבר ניאון • אקורדיון חי (Accordion Morph)',
    shortLabel: 'סייבר אקורדיון',
    desc: '4 רצועות ניאון שמתרחבות בלחיצה וחושפות שכבת עומק וכפתור פעולה חי',
    marketAffinity: ['saas', 'digital_courses', 'automotive'],
    defaultLayout: 'accordion_morph',
    fontSizeScale: 'normal',
    titleFontWeight: 'font-black',
    fontFamily: 'font-sans',
    discovery: {
      mode: 'accordion_morph',
      labelHe: 'התרחבות אקורדיון חכמה',
      activeRatio: '52%',
      revealTrigger: 'tap',
      transitionPreset: 'kinetic_glow'
    },
    geometry: {
      cardRadius: '16px',
      cardGap: '8px',
      borderStyle: 'accent_glow',
      paddingScale: 'balanced'
    },
    visuals: {
      surfaceMode: 'frosted_glass',
      mediaPlacement: 'background_cover',
      mediaOverlayOpacity: 0.85,
      iconStyle: 'glowing_orb',
      badgePlacement: 'top_end',
      ambientEffect: 'radial_aura'
    },
    capsule: {
      variant: 'neon_floating_dock',
      radius: '20px',
      showSoundwave: true,
      tagLabel: 'AI LIVE CO-PILOT',
      avatarIcon: 'Bot'
    },
    night: {
      pageBg: '#040711',
      editorBg: '#070C18',
      cardBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 12, 22, 0.98))',
      textColor: '#FFFFFF',
      secondaryText: '#94A3B8',
      borderColor: 'rgba(0, 240, 255, 0.35)',
      primaryColor: '#00F0FF',
      glowColor: 'rgba(0, 240, 255, 0.3)',
      accentBadge: 'bg-cyan-500 text-black',
      activeBorder: 'border-cyan-400 shadow-cyan-500/30'
    },
    day: {
      pageBg: '#F0F9FF',
      editorBg: '#E0F2FE',
      cardBg: 'linear-gradient(135deg, #FFFFFF, #E0F2FE)',
      textColor: '#0F172A',
      secondaryText: '#334155',
      borderColor: 'rgba(2, 132, 199, 0.4)',
      primaryColor: '#0284C7',
      glowColor: 'rgba(2, 132, 199, 0.25)',
      accentBadge: 'bg-sky-600 text-white',
      activeBorder: 'border-sky-500 shadow-sky-400/25'
    }
  },
  luxury_gold: {
    value: 'luxury_gold',
    label: '2. יוקרה שקטה • במת זרקור (Spotlight Stage)',
    shortLabel: 'זרקור זהב',
    desc: 'במת זרקור מרכזית ענקית (55%) ו-3 קפסולות בחירה תחתונות שמתחלפות לזרקור בנגיעה',
    marketAffinity: ['real_estate', 'automotive', 'ecommerce'],
    defaultLayout: 'spotlight_stage',
    fontSizeScale: 'large',
    titleFontWeight: 'font-extrabold',
    fontFamily: 'font-sans',
    discovery: {
      mode: 'spotlight_stage',
      labelHe: 'במת זרקור (1 ראשי + 3 מתחלפים)',
      activeRatio: '56%',
      revealTrigger: 'tap',
      transitionPreset: 'smooth_editorial'
    },
    geometry: {
      cardRadius: '14px',
      cardGap: '8px',
      borderStyle: 'double_frame',
      paddingScale: 'spacious'
    },
    visuals: {
      surfaceMode: 'media_full_bleed',
      mediaPlacement: 'background_cover',
      mediaOverlayOpacity: 0.78,
      iconStyle: 'minimal_outline',
      badgePlacement: 'top_end',
      ambientEffect: 'radial_aura'
    },
    capsule: {
      variant: 'stealth_gold_minimal',
      radius: '14px',
      showSoundwave: false,
      tagLabel: 'VIP CONCIERGE',
      avatarIcon: 'Crown'
    },
    night: {
      pageBg: '#0C0A09',
      editorBg: '#141210',
      cardBg: 'linear-gradient(135deg, rgba(28, 25, 23, 0.96), rgba(12, 10, 9, 0.98))',
      textColor: '#FAFAF9',
      secondaryText: '#D6D3D1',
      borderColor: 'rgba(234, 179, 8, 0.45)',
      primaryColor: '#EAB308',
      glowColor: 'rgba(234, 179, 8, 0.35)',
      accentBadge: 'bg-amber-500 text-black',
      activeBorder: 'border-amber-400 shadow-amber-500/30'
    },
    day: {
      pageBg: '#FEFCE8',
      editorBg: '#FEF9C3',
      cardBg: 'linear-gradient(135deg, #FFFFFF, #FEF3C7)',
      textColor: '#292524',
      secondaryText: '#57534E',
      borderColor: 'rgba(202, 138, 4, 0.45)',
      primaryColor: '#CA8A04',
      glowColor: 'rgba(202, 138, 4, 0.25)',
      accentBadge: 'bg-amber-600 text-white',
      activeBorder: 'border-amber-600 shadow-amber-400/20'
    }
  },
  executive_slate: {
    value: 'executive_slate',
    label: '3. הנהלה נקייה • וילון זכוכית (Glass Flip)',
    shortLabel: 'וילון זכוכית',
    desc: 'רשת 2x2 ממוקדת שבה נגיעה בכרטיס מרימה וילון זכוכית חצי-שקוף עם המפרט והפעולה',
    marketAffinity: ['service_pros', 'clinics_health', 'saas'],
    defaultLayout: 'glass_flip_overlay',
    fontSizeScale: 'normal',
    titleFontWeight: 'font-bold',
    fontFamily: 'font-sans',
    discovery: {
      mode: 'glass_flip_overlay',
      labelHe: 'וילון זכוכית צף (Glass Flip)',
      activeRatio: '50%',
      revealTrigger: 'tap',
      transitionPreset: 'spring_snappy'
    },
    geometry: {
      cardRadius: '20px',
      cardGap: '8px',
      borderStyle: 'hairline_subtle',
      paddingScale: 'balanced'
    },
    visuals: {
      surfaceMode: 'frosted_glass',
      mediaPlacement: 'background_cover',
      mediaOverlayOpacity: 0.82,
      iconStyle: 'pill_badge',
      badgePlacement: 'inline_header',
      ambientEffect: 'fine_grid'
    },
    capsule: {
      variant: 'executive_command_bar',
      radius: '16px',
      showSoundwave: false,
      tagLabel: 'EXECUTIVE ⌘K',
      avatarIcon: 'ShieldCheck'
    },
    night: {
      pageBg: '#0B1120',
      editorBg: '#0F172A',
      cardBg: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
      textColor: '#F8FAFC',
      secondaryText: '#94A3B8',
      borderColor: 'rgba(56, 189, 248, 0.4)',
      primaryColor: '#38BDF8',
      glowColor: 'rgba(56, 189, 248, 0.3)',
      accentBadge: 'bg-sky-400 text-black',
      activeBorder: 'border-sky-400 shadow-sky-500/30'
    },
    day: {
      pageBg: '#F1F5F9',
      editorBg: '#E2E8F0',
      cardBg: 'linear-gradient(135deg, #FFFFFF, #E2E8F0)',
      textColor: '#0F172A',
      secondaryText: '#334155',
      borderColor: 'rgba(14, 165, 233, 0.4)',
      primaryColor: '#0284C7',
      glowColor: 'rgba(14, 165, 233, 0.2)',
      accentBadge: 'bg-sky-600 text-white',
      activeBorder: 'border-sky-500 shadow-sky-400/20'
    }
  },
  emerald_calm: {
    value: 'emerald_calm',
    label: '4. שלווה טבעית • פסיפס בנטו (Bento Mosaic)',
    shortLabel: 'פסיפס בנטו',
    desc: 'פסיפס בנטו אסימטרי מונחה-משקל: כרטיס גיבור רחב בראש, זוג כרטיסים באמצע ופס פעולה תחתון',
    marketAffinity: ['clinics_health', 'non_profit', 'fitness_coaches'],
    defaultLayout: 'bento_asymmetric',
    fontSizeScale: 'compact',
    titleFontWeight: 'font-semibold',
    fontFamily: 'font-sans',
    discovery: {
      mode: 'bento_asymmetric',
      labelHe: 'פסיפס בנטו אסימטרי',
      activeRatio: '45%',
      revealTrigger: 'tap',
      transitionPreset: 'spring_snappy'
    },
    geometry: {
      cardRadius: '24px',
      cardGap: '8px',
      borderStyle: 'hairline_subtle',
      paddingScale: 'compact'
    },
    visuals: {
      surfaceMode: 'gradient_mesh',
      mediaPlacement: 'side_avatar',
      mediaOverlayOpacity: 0.88,
      iconStyle: 'glowing_orb',
      badgePlacement: 'top_end',
      ambientEffect: 'mesh_pulse'
    },
    capsule: {
      variant: 'organic_soft_pill',
      radius: '9999px',
      showSoundwave: true,
      tagLabel: 'MINDFUL ASSISTANT',
      avatarIcon: 'Leaf'
    },
    night: {
      pageBg: '#022C22',
      editorBg: '#064E3B',
      cardBg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.94), rgba(2, 44, 34, 0.98))',
      textColor: '#ECFDF5',
      secondaryText: '#A7F3D0',
      borderColor: 'rgba(16, 185, 129, 0.45)',
      primaryColor: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      accentBadge: 'bg-emerald-500 text-black',
      activeBorder: 'border-emerald-400 shadow-emerald-500/30'
    },
    day: {
      pageBg: '#ECFDF5',
      editorBg: '#D1FAE5',
      cardBg: 'linear-gradient(135deg, #FFFFFF, #D1FAE5)',
      textColor: '#064E3B',
      secondaryText: '#047857',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      primaryColor: '#059669',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      accentBadge: 'bg-emerald-600 text-white',
      activeBorder: 'border-emerald-600 shadow-emerald-400/20'
    }
  },
  rose_kinetic: {
    value: 'rose_kinetic',
    label: '5. ולווט קינטי • חפיסת החלקה (Swipe Deck)',
    shortLabel: 'חפיסת 3D',
    desc: 'חפיסת כרטיסים אינטראקטיבית בעומק תלת-ממדי עם דפדוף מהיר ופעולה ישירה במרכז הבמה',
    marketAffinity: ['beauty_clinic', 'fitness_coaches', 'ecommerce'],
    defaultLayout: 'swipe_action_deck',
    fontSizeScale: 'normal',
    titleFontWeight: 'font-black',
    fontFamily: 'font-sans',
    discovery: {
      mode: 'swipe_action_deck',
      labelHe: 'חפיסת כרטיסים 3D (Swipe Deck)',
      activeRatio: '75%',
      revealTrigger: 'tap',
      transitionPreset: 'kinetic_glow'
    },
    geometry: {
      cardRadius: '28px',
      cardGap: '10px',
      borderStyle: 'accent_glow',
      paddingScale: 'spacious'
    },
    visuals: {
      surfaceMode: 'media_full_bleed',
      mediaPlacement: 'top_banner',
      mediaOverlayOpacity: 0.8,
      iconStyle: 'watermark_giant',
      badgePlacement: 'floating_bottom',
      ambientEffect: 'radial_aura'
    },
    capsule: {
      variant: 'kinetic_split_capsule',
      radius: '24px',
      showSoundwave: true,
      tagLabel: 'LIVE AI PULSE',
      avatarIcon: 'Zap'
    },
    night: {
      pageBg: '#120714',
      editorBg: '#1E0B24',
      cardBg: 'linear-gradient(135deg, rgba(46, 16, 53, 0.95), rgba(18, 7, 20, 0.98))',
      textColor: '#FDF2F8',
      secondaryText: '#FBCFE8',
      borderColor: 'rgba(236, 72, 153, 0.45)',
      primaryColor: '#EC4899',
      glowColor: 'rgba(236, 72, 153, 0.35)',
      accentBadge: 'bg-pink-500 text-black',
      activeBorder: 'border-pink-400 shadow-pink-500/30'
    },
    day: {
      pageBg: '#FDF2F8',
      editorBg: '#FCE7F3',
      cardBg: 'linear-gradient(135deg, #FFFFFF, #FCE7F3)',
      textColor: '#500724',
      secondaryText: '#9D174D',
      borderColor: 'rgba(219, 39, 119, 0.4)',
      primaryColor: '#DB2777',
      glowColor: 'rgba(219, 39, 119, 0.25)',
      accentBadge: 'bg-pink-600 text-white',
      activeBorder: 'border-pink-600 shadow-pink-400/20'
    }
  }
};

/**
 * שמירת קונפיגורציית אזור / עמוד ל-Firestore
 */
export async function saveAreaCollectionConfig(
  areaId: string,
  tenantId: string,
  configData: any
): Promise<void> {
  const db = comonaDb || kosunDb;
  const storageKey = `kos_area_config_${tenantId}_${areaId}`;
  
  // 1. שמירה מיידית ב-LocalStorage לגיבוי ועמידות מלאה ברענון
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(configData));
    }
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. שמירה ב-Firestore
  try {
    const docRef = doc(db, 'tenants', tenantId, 'page_configs', areaId);
    await setDoc(docRef, {
      ...configData,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore setDoc failed, cached in localStorage:', e);
  }
}

/**
 * משיכת מפרט הקולקציות הפעיל עבור עמוד השאלות
 * כולל שינויי פריסה מהותיים:
 * - standard: כרטיס שאלה עליון (60%) + 3 ריבועים תחתונים (31%)
 * - inverted: 3 שאלות עליונות (31%) + כרטיס תשובה מרכזי תחתון (60%)
 * - four_rows: 4 שורות אלגנטיות של שאלות/תשובות כשהרלוונטית מוגדלת ומודגשת
 * - compact_cards: גריד שווה ומאוזן
 */
export async function getAreaCollectionSchema(
  areaId: string,
  tenantId: string = 'kosun',
  marketType: string = 'saas'
): Promise<AreaCollectionSchema> {
  const db = comonaDb || kosunDb;
  
  let serverDoc: any = null;
  const storageKey = `kos_area_config_${tenantId}_${areaId}`;

  // בדיקת LocalStorage קודם (מיידי ואמין ברענון)
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        serverDoc = JSON.parse(cached);
      }
    }
  } catch (e) {}

  // משיכה מעודכנת מ-Firestore
  try {
    const docRef = doc(db, 'tenants', tenantId, 'page_configs', areaId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      serverDoc = { ...serverDoc, ...snap.data() };
    }
  } catch (e) {
    console.warn('Could not fetch server page config, falling back to blueprint:', e);
  }

  // תמיכה ייעודית לקולקציית כרטיסי הבית של CRM (crm_home_cards / area_crm_dynamic_groups)
  if (areaId === 'crm_home_cards' || areaId === 'area_crm_dynamic_groups') {
    return {
      areaId,
      componentName: 'KosCrmDynamicGroupsPage',
      pageId: 'crm_home',
      parameters: [
        {
          key: 'layoutBudget',
          label: 'מבנה הפריסה ומנגנון גילוי התוכן (5 Discovery Layouts)',
          currentValue: resolveDiscoveryLayoutMode(serverDoc?.layoutBudget, 'accordion_morph'),
          options: [
            { value: 'accordion_morph', label: '1. אקורדיון חי • 4 שורות מתרחבות', desc: '4 רצועות שבהן השורה הנבחרת מתרחבת' },
            { value: 'spotlight_stage', label: '2. במת זרקור • 1 ראשי + 3 קפסולות', desc: 'כרטיס זרקור מרכזי בראש ו-3 קפסולות תחתונות' },
            { value: 'glass_flip_overlay', label: '3. וילון זכוכית צף • רשת 2x2', desc: 'רשת 2x2 ממוקדת עם היפוך בלחיצה' },
            { value: 'bento_asymmetric', label: '4. פסיפס בנטו אסימטרי', desc: 'פסיפס מודרני מונחה-משקל' },
            { value: 'swipe_action_deck', label: '5. חפיסת כרטיסים 3D', desc: 'חפיסת כרטיסים אינטראקטיבית' },
          ],
        },
        {
          key: 'atmosphereTheme',
          label: 'סגנון אטמוספרי ומיתוג',
          currentValue: serverDoc?.atmosphereTheme || 'cyber_neon',
          options: Object.values(KOSUN_STYLE_PRESETS).map((p) => ({
            value: p.value,
            label: p.label,
            desc: p.desc,
          })),
        },
        {
          key: 'colorMode',
          label: 'מצב יום / לילה',
          currentValue: serverDoc?.colorMode || 'night',
          options: [
            { value: 'night', label: 'מצב לילה (Dark Mode)', desc: 'רקע כהה ושקט בעיניים' },
            { value: 'day', label: 'מצב יום (Light Mode)', desc: 'רקע בהיר וקריאות מקסימלית' },
          ],
        },
        // כרטיס א': הוספת נכסים
        {
          key: 'card_1_title',
          label: 'כרטיס א - כותרת',
          currentValue: serverDoc?.card_1_title || 'הצעות להוספת נכסים',
        },
        {
          key: 'card_1_badge',
          label: 'כרטיס א - תגית',
          currentValue: serverDoc?.card_1_badge || 'הרחבת נכסים',
        },
        {
          key: 'card_1_summary',
          label: 'כרטיס א - שורת סיכום',
          currentValue: serverDoc?.card_1_summary || 'פותח 4 כרטיסים עם הצעות להרחבת הנכסים האנושיים של הטננט',
        },
        {
          key: 'card_1_cta',
          label: 'כרטיס א - הנעה לפעולה',
          currentValue: serverDoc?.card_1_cta || '4 הצעות הרחבה ◀',
        },
        // כרטיס ב': הכנסות אחרונות
        {
          key: 'card_2_title',
          label: 'כרטיס ב - כותרת',
          currentValue: serverDoc?.card_2_title || 'צפייה בהכנסות האחרונות',
        },
        {
          key: 'card_2_badge',
          label: 'כרטיס ב - תגית',
          currentValue: serverDoc?.card_2_badge || 'נתוני הכנסות',
        },
        {
          key: 'card_2_summary',
          label: 'כרטיס ב - שורת סיכום',
          currentValue: serverDoc?.card_2_summary || 'פותח 4 כרטיסיות עם נתוני ההכנסות והעסקאות האחרונות של הטננט',
        },
        {
          key: 'card_2_cta',
          label: 'כרטיס ב - הנעה לפעולה',
          currentValue: serverDoc?.card_2_cta || '4 כרטיסי הכנסות ◀',
        },
        // כרטיס ג': לידים לטיפול
        {
          key: 'card_3_title',
          label: 'כרטיס ג - כותרת',
          currentValue: serverDoc?.card_3_title || 'לידים שדורשים טיפול',
        },
        {
          key: 'card_3_badge',
          label: 'כרטיס ג - תגית',
          currentValue: serverDoc?.card_3_badge || 'דורש טיפול',
        },
        {
          key: 'card_3_summary',
          label: 'כרטיס ג - שורת סיכום',
          currentValue: serverDoc?.card_3_summary || 'פותח 4 כרטיסיות של לידים פעילים בטננט הממתינים למענה',
        },
        {
          key: 'card_3_cta',
          label: 'כרטיס ג - הנעה לפעולה',
          currentValue: serverDoc?.card_3_cta || '4 לידים לטיפול ◀',
        },
        // כרטיס ד': מיון אנשי קשר
        {
          key: 'card_4_title',
          label: 'כרטיס ד - כותרת',
          currentValue: serverDoc?.card_4_title || 'מיון אנשי קשר',
        },
        {
          key: 'card_4_badge',
          label: 'כרטיס ד - תגית',
          currentValue: serverDoc?.card_4_badge || 'תיוג רב-משתתפים',
        },
        {
          key: 'card_4_summary',
          label: 'כרטיס ד - שורת סיכום',
          currentValue: serverDoc?.card_4_summary || 'פותח 4 כרטיסים עם פעולות תיוג ומיון רבות-משתתפים בקולקציה',
        },
        {
          key: 'card_4_cta',
          label: 'כרטיס ד - הנעה לפעולה',
          currentValue: serverDoc?.card_4_cta || '4 פעולות תיוג ◀',
        },
        // כותרת היועץ
        {
          key: 'advisor_hint',
          label: 'שורת רמז יועץ',
          currentValue: serverDoc?.advisor_hint || 'אולי השאלה הזו תעזור לך לפנות זמן? לחץ לבחירה או שאל בקול חופשי',
        },
        {
          key: 'advisor_title',
          label: 'כותרת יועץ עליון',
          currentValue: serverDoc?.advisor_title || 'היועץ העליון: לחץ לשיחה או בקש פריסת נתונים לפי דרישה',
        },
      ],
    };
  }

  // תמיכה ייעודית לקולקציית כרטיס לקוח 360 (crm_contact_360)
  if (areaId === 'crm_contact_360' || areaId === 'area_crm_contact_360') {
    return {
      areaId,
      componentName: 'Contact360Modal',
      pageId: 'contact_360',
      parameters: [
        {
          key: 'atmosphereTheme',
          label: 'סגנון אטמוספרי ומיתוג כרטיס',
          currentValue: serverDoc?.atmosphereTheme || 'cyber_neon',
          options: Object.values(KOSUN_STYLE_PRESETS).map((p) => ({
            value: p.value,
            label: p.label,
            desc: p.desc,
          })),
        },
        {
          key: 'colorMode',
          label: 'מצב יום / לילה',
          currentValue: serverDoc?.colorMode || 'night',
          options: [
            { value: 'night', label: 'מצב לילה (Dark Mode)', desc: 'רקע כהה ושקט בעיניים' },
            { value: 'day', label: 'מצב יום (Light Mode)', desc: 'רקע בהיר וקריאות מקסימלית' },
          ],
        },
        // 4 כרטיסי ליבה של הבבושקה (רמה 0 - שורש)
        {
          key: 'root_1_title',
          label: 'רצועה א - כותרת (פרופיל אישי וקשר)',
          currentValue: serverDoc?.root_1_title || 'פרופיל אישי וקשר',
        },
        {
          key: 'root_1_badge',
          label: 'רצועה א - תגית',
          currentValue: serverDoc?.root_1_badge || 'ליבה',
        },
        {
          key: 'root_1_icon',
          label: 'רצועה א - אייקון',
          currentValue: serverDoc?.root_1_icon || 'User',
        },
        {
          key: 'root_1_summary',
          label: 'רצועה א - שורת סיכום',
          currentValue: serverDoc?.root_1_summary || 'פרטים כלליים, טלפון, מייל ותגיות שיוך',
        },
        {
          key: 'root_2_title',
          label: 'רצועה ב - כותרת (עסקי וכספי)',
          currentValue: serverDoc?.root_2_title || 'פעילות עסקית וכספית',
        },
        {
          key: 'root_2_badge',
          label: 'רצועה ב - תגית',
          currentValue: serverDoc?.root_2_badge || 'עסקאות',
        },
        {
          key: 'root_2_icon',
          label: 'רצועה ב - אייקון',
          currentValue: serverDoc?.root_2_icon || 'CreditCard',
        },
        {
          key: 'root_2_summary',
          label: 'רצועה ב - שורת סיכום',
          currentValue: serverDoc?.root_2_summary || 'פרטי חברה, תשלומים, עסקאות ותקבולים',
        },
        {
          key: 'root_3_title',
          label: 'רצועה ג - כותרת (תקשורת וגיוס)',
          currentValue: serverDoc?.root_3_title || 'תקשורת ומעורבות',
        },
        {
          key: 'root_3_badge',
          label: 'רצועה ג - תגית',
          currentValue: serverDoc?.root_3_badge || 'אינטראקציה',
        },
        {
          key: 'root_3_icon',
          label: 'רצועה ג - אייקון',
          currentValue: serverDoc?.root_3_icon || 'MessageCircle',
        },
        {
          key: 'root_3_summary',
          label: 'רצועה ג - שורת סיכום',
          currentValue: serverDoc?.root_3_summary || 'WhatsApp, אימייל, טפסים ותהליכי גיוס',
        },
        {
          key: 'root_4_title',
          label: 'רצועה ד - כותרת (מנויים וטננט)',
          currentValue: serverDoc?.root_4_title || 'מנויים וניהול מערכת',
        },
        {
          key: 'root_4_badge',
          label: 'רצועה ד - תגית',
          currentValue: serverDoc?.root_4_badge || 'הרשאות',
        },
        {
          key: 'root_4_icon',
          label: 'רצועה ד - אייקון',
          currentValue: serverDoc?.root_4_icon || 'ShieldCheck',
        },
        {
          key: 'root_4_summary',
          label: 'רצועה ד - שורת סיכום',
          currentValue: serverDoc?.root_4_summary || 'חבילות מנוי פעילות, הרשאות תוכן וסאב-דומיין',
        },
      ],
    };
  }

  return {
    areaId,
    componentName: 'QuestionPageView',
    pageId: 'exploration',
    parameters: [
      {
        key: 'layoutBudget',
        label: 'מבנה הפריסה ומנגנון גילוי התוכן (5 Discovery Layouts)',
        currentValue: resolveDiscoveryLayoutMode(serverDoc?.layoutBudget, 'accordion_morph'),
        options: [
          { 
            value: 'accordion_morph', 
            label: '1. אקורדיון חי • 4 שורות מתרחבות (Accordion Morph)', 
            desc: '4 רצועות דינמיות שבהן השורה הנבחרת מתרחבת וחושפת שכבת עומק וכפתור פעולה חי' 
          },
          { 
            value: 'spotlight_stage', 
            label: '2. במת זרקור • 1 ראשי + 3 קפסולות (Spotlight Stage)', 
            desc: 'במת זרקור מרכזית ענקית בראש (58%) ו-3 קפסולות בחירה תחתונות שמתחלפות לזרקור בנגיעה' 
          },
          { 
            value: 'glass_flip_overlay', 
            label: '3. וילון זכוכית צף • רשת 2x2 (Glass Flip Overlay)', 
            desc: 'רשת 2x2 ממוקדת שבה נגיעה בכרטיס מרימה וילון זכוכית חצי-שקוף עם התשובה והפעולה' 
          },
          { 
            value: 'bento_asymmetric', 
            label: '4. פסיפס בנטו אסימטרי • 1+2+1 (Bento Mosaic)', 
            desc: 'פסיפס בנטו מונחה-משקל: כרטיס גיבור רחב בראש, זוג כרטיסי השוואה באמצע ורצועת פעולה בתחתית' 
          },
          { 
            value: 'swipe_action_deck', 
            label: '5. חפיסת כרטיסים 3D • דפדוף חי (Swipe Action Deck)', 
            desc: 'חפיסת כרטיסים אינטראקטיבית בעומק תלת-ממדי עם דפדוף מהיר ופעולה ישירה במרכז הבמה' 
          }
        ]
      },
      {
        key: 'intentGoal',
        label: 'כוונת המשפך העסקי (Intent Goal)',
        currentValue: serverDoc?.intentGoal || 'conversion',
        options: [
          { value: 'conversion', label: 'הנעה ישירה לפעולה ורכישה', desc: 'כרטיס ההמשך מציע רכישת מנוי או שריון מקום' },
          { value: 'authority', label: 'ביסוס סמכות ומקצועיות', desc: 'הפניה למאמר ומחקר מדעי' },
          { value: 'trust', label: 'בניית אמון והסרת חסמים', desc: 'התאמה אישית, תאימות ושאלות נפוצות' },
          { value: 'retention', label: 'הדרכה והצלחת לקוח', desc: 'טיפים וכלים לשגרת ערב' }
        ]
      },
      {
        key: 'languageStyle',
        label: 'שפה וטון שיווקי (Language Tone)',
        currentValue: serverDoc?.languageStyle || 'approachable',
        options: [
          { value: 'approachable', label: 'חם ומזמין (בגובה העיניים)', desc: 'פשוט, מסביר פנים ומרגיע' },
          { value: 'executive', label: 'מנהלתי ותוצאתי (Executive)', desc: 'חיסכון בזמן ותפוקה' },
          { value: 'inspirational', label: 'מעצים וחדשני (Visionary)', desc: 'הפיכת רעיונות לנכסים' },
          { value: 'minimal', label: 'אפס מילים מיותרות (Lean)', desc: 'פעולה ישירה בלבד' }
        ]
      },
      {
        key: 'atmosphereTheme',
        label: 'סגנון אטמוספרי ומיתוג (Atmosphere Preset)',
        currentValue: serverDoc?.atmosphereTheme || 'cyber_neon',
        options: Object.values(KOSUN_STYLE_PRESETS).map(preset => ({
          value: preset.value,
          label: preset.label,
          desc: preset.desc
        }))
      },
      {
        key: 'colorMode',
        label: 'מצב יום / לילה (Color Mode)',
        currentValue: serverDoc?.colorMode || 'night',
        options: [
          { value: 'night', label: 'מצב לילה (Dark Mode)', desc: 'רקע כהה, אלגנטיות ושקט בעיניים' },
          { value: 'day', label: 'מצב יום (Light Mode)', desc: 'רקע בהיר, קריאות גבוהה באור שמש' }
        ]
      }
    ]
  };
}

/**
 * 🤖 מנוע התאמת שפה ומיתוג על ידי AI
 */
export async function generateBrandAdaptationAi(params: {
  tenantId: string;
  marketType: string;
  tenantProfile: any;
  areaId: string;
  userPrompt?: string;
}): Promise<{
  generatedToneTitle: string;
  mainQuestion: string;
  mainAnswer: string;
  funnelCards: Array<{ question: string; icon: string; intentGoal: 'deep_dive' | 'differentiation' | 'intent_conversion' }>;
}> {
  const brandName = params.tenantProfile?.name || 'KOSUN';
  const market = params.marketType || 'saas';

  let generatedResult: any;

  if (market === 'automotive') {
    generatedResult = {
      generatedToneTitle: `מיתוג יוקרה מוטורית עבור ${brandName}`,
      mainQuestion: `איך שירות ה-VIP של ${brandName} מתאים לך את רכב החלומות בדיוק מושלם?`,
      mainAnswer: `אנו משלבים יבוא מקביל, בדיקות מקיפות וליווי אישי מקיף כדי להבטיח חוויית נהיגה ללא פשרות במחיר המשתלם ביותר.`,
      funnelCards: [
        { question: 'אילו דגמים ייחודיים זמינים במלאי מיידי?', icon: 'Car', intentGoal: 'deep_dive' },
        { question: 'האם יש אפשרות לטרייד-אין בערך מחירון מלא?', icon: 'Repeat', intentGoal: 'differentiation' },
        { question: 'תאם נסיעת מבחן VIP וקבל הצעת מימון מותאמת', icon: 'Key', intentGoal: 'intent_conversion' }
      ]
    };
  } else if (market === 'beauty' || market === 'beauty_clinic') {
    generatedResult = {
      generatedToneTitle: `קול הטיפוח והאסתטיקה של ${brandName}`,
      mainQuestion: `כיצד מותאם פרוטוקול הטיפול האישי לעורך בקליניקת ${brandName}?`,
      mainAnswer: `אבחון עמוק ומדויק המשלב טכנולוגיה רפואית מתקדמת וחומרים פעילים מהשורה הראשונה לתוצאות טבעיות וקורנות.`,
      funnelCards: [
        { question: 'מהו שלב האבחון המקדים לפני כל טיפול?', icon: 'Scan', intentGoal: 'deep_dive' },
        { question: 'האם הטיפולים מתאימים לכל סוגי העור ועונות השנה?', icon: 'ShieldCheck', intentGoal: 'differentiation' },
        { question: 'שרייני פגישת אבחון אישית ללא התחייבות', icon: 'Calendar', intentGoal: 'intent_conversion' }
      ]
    };
  } else {
    generatedResult = {
      generatedToneTitle: `שפת הפוקוס והנכסים של ${brandName}`,
      mainQuestion: `כיצד שיטת The Big 3 מבית ${brandName} ממירה רעיונות לתוצאות מוכחות?`,
      mainAnswer: `באמצעות צמצום קוגניטיבי מבוקר ל-3 משימות יומיות ופירוקן לשלבי ביצוע של 15 דקות, תוך שקט נפשי ו-100% שליטה בזמן.`,
      funnelCards: [
        { question: 'איך מתמודדים כשמגיעה משימה דחופה באמצע היום?', icon: 'AlertTriangle', intentGoal: 'deep_dive' },
        { question: 'האם המערכת מבצעת תמלול קולי אוטומטי בעברית?', icon: 'Mic', intentGoal: 'differentiation' },
        { question: 'צפה בחבילות ומסלולי 2026 ושריין את מקומך', icon: 'Layers', intentGoal: 'intent_conversion' }
      ]
    };
  }

  try {
    const db = comonaDb || kosunDb;
    const tenantDocRef = doc(db, 'tenants', params.tenantId, 'page_configs', params.areaId);
    await setDoc(tenantDocRef, {
      ...generatedResult,
      updatedAt: Date.now(),
      generatedByAi: true
    }, { merge: true });

    const marketDocRef = doc(db, 'market_templates', market, 'area_presets', params.areaId);
    await setDoc(marketDocRef, {
      ...generatedResult,
      lastTenantContributor: params.tenantId,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not persist AI adaptation to Firestore:', e);
  }

  return generatedResult;
}
