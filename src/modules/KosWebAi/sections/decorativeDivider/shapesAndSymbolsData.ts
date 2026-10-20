import { TenantStylePreset } from '../../../../core/contracts';

export interface StyleShapeSymbolItem {
  id: string;
  name: string;
  titleHe: string;
  archetype: TenantStylePreset;
  category: 'shapes' | 'symbols' | 'flourishes' | 'dividers';
  keywords: string[];
  svgContent: string; // Inner SVG paths or full SVG template
  defaultStrokeColor: string;
  defaultFillColor: string;
  effect: 'pulse-glow' | 'float-bob' | 'shimmer-beam' | 'rotate-slow' | 'cyber-scan' | 'wave-drift';
}

export const SHAPES_AND_SYMBOLS_COLLECTION: StyleShapeSymbolItem[] = [
  // 1. FEMININE (סגנון נשי ורך - עגלגלות, רגש, רוגע, טיפוח, יופי, הרמוניה, בית ואסתטיקה)
  {
    id: 'shape_fem_lotus',
    name: 'פרח לוטוס רך',
    titleHe: 'פרח לוטוס רך ואור פנימי',
    archetype: 'feminine',
    category: 'symbols',
    keywords: ['לוטוס', 'פרח', 'רוך', 'נשי', 'יופי'],
    defaultStrokeColor: '#f43f5e',
    defaultFillColor: 'rgba(244,63,94,0.12)',
    effect: 'pulse-glow',
    svgContent: `<path d="M12 3C12 3 7 8 7 13C7 16.5 9.5 19 12 21C14.5 19 17 16.5 17 13C17 8 12 3 12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15"/>
<path d="M7 13C4 11 2 13.5 2 16C2 18.5 5 20.5 9 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M17 13C20 11 22 13.5 22 16C22 18.5 19 20.5 15 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  },
  {
    id: 'shape_fem_heart_flourish',
    name: 'עיטור לב ואינסוף',
    titleHe: 'סמל אהבה והכלה אינסופית',
    archetype: 'feminine',
    category: 'symbols',
    keywords: ['לב', 'אהבה', 'אינסוף', 'חום'],
    defaultStrokeColor: '#fb7185',
    defaultFillColor: 'rgba(251,113,133,0.15)',
    effect: 'pulse-glow',
    svgContent: `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/>
<circle cx="12" cy="10" r="2" fill="currentColor"/>`,
  },
  {
    id: 'shape_fem_soft_arch',
    name: 'קשת ארט-דקו רכה',
    titleHe: 'קשת אסתטית מעוגלת ורכה',
    archetype: 'feminine',
    category: 'shapes',
    keywords: ['קשת', 'ארט דקו', 'יוקרה', 'עיצוב פנים'],
    defaultStrokeColor: '#fda4af',
    defaultFillColor: 'rgba(253,164,175,0.1)',
    effect: 'pulse-glow',
    svgContent: `<path d="M4 22V10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M7 22V11C7 8.23858 9.23858 6 12 6C14.7614 6 17 8.23858 17 11V22" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" stroke-opacity="0.6"/>`,
  },
  {
    id: 'shape_fem_pearl_cluster',
    name: 'שושנת פנינים ועידון',
    titleHe: 'עיטור שושנת פנינים עדינה',
    archetype: 'feminine',
    category: 'flourishes',
    keywords: ['פנינה', 'עיטור', 'רוך', 'אלגנטי'],
    defaultStrokeColor: '#f43f5e',
    defaultFillColor: 'rgba(244,63,94,0.15)',
    effect: 'pulse-glow',
    svgContent: `<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/>
<circle cx="12" cy="5" r="2" fill="currentColor" fill-opacity="0.6"/>
<circle cx="12" cy="19" r="2" fill="currentColor" fill-opacity="0.6"/>
<circle cx="5" cy="12" r="2" fill="currentColor" fill-opacity="0.6"/>
<circle cx="19" cy="12" r="2" fill="currentColor" fill-opacity="0.6"/>`,
  },

  // 2. MASCULINE (סגנון גברי ועוצמתי - חד, עמוק, מסגרות מודגשות, ניגודיות גבוהה)
  {
    id: 'shape_masc_shield_crest',
    name: 'מגן עוצמה וביטחון',
    titleHe: 'חותם מגן איתן ועוצמתי',
    archetype: 'masculine',
    category: 'symbols',
    keywords: ['מגן', 'ביטחון', 'כוח', 'עוצמה'],
    defaultStrokeColor: '#f59e0b',
    defaultFillColor: 'rgba(245,158,11,0.1)',
    effect: 'shimmer-beam',
    svgContent: `<path d="M12 2L3 6V12C3 17.5 6.8 22.7 12 24C17.2 22.7 21 17.5 21 12V6L12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1"/>
<path d="M12 6L6 9V13C6 16.5 8.5 20 12 21C15.5 20 18 16.5 18 13V9L12 6Z" stroke="currentColor" stroke-width="1" stroke-opacity="0.5"/>`,
  },
  {
    id: 'shape_masc_bold_chevron',
    name: 'חצי תנופה וביצועים',
    titleHe: 'שברון כפול - תנופה והובלה',
    archetype: 'masculine',
    category: 'shapes',
    keywords: ['שברון', 'חיצים', 'ביצועים', 'הובלה'],
    defaultStrokeColor: '#10b981',
    defaultFillColor: 'rgba(16,185,129,0.15)',
    effect: 'shimmer-beam',
    svgContent: `<path d="M6 5L12 11L18 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 12L12 18L18 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'shape_masc_iron_crest',
    name: 'סמל ברזל מחושל',
    titleHe: 'יהלום פלדה מחוספס',
    archetype: 'masculine',
    category: 'shapes',
    keywords: ['ברזל', 'פלדה', 'חוזק', 'יהלום'],
    defaultStrokeColor: '#f59e0b',
    defaultFillColor: 'rgba(245,158,11,0.1)',
    effect: 'shimmer-beam',
    svgContent: `<path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="currentColor" fill-opacity="0.08"/>
<rect x="7" y="7" width="10" height="10" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.6"/>`,
  },
  {
    id: 'shape_masc_horizon_divider',
    name: 'מפריד שורת ברזל',
    titleHe: 'פס מפריד פלדה כפול עם חותם מרכזי',
    archetype: 'masculine',
    category: 'dividers',
    keywords: ['פס', 'מפריד', 'כפול', 'קו'],
    defaultStrokeColor: '#71717a',
    defaultFillColor: 'transparent',
    effect: 'shimmer-beam',
    svgContent: `<line x1="1" y1="12" x2="8" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<polygon points="12,7 16,12 12,17 8,12" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.3"/>
<line x1="16" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  },

  // 3. STANDARD (סגנון סטנדרטי ומאוזן - נקי, יציב, מודרני וניטרלי)
  {
    id: 'shape_std_modern_dots',
    name: 'שלישיית נקודות מאוזנת',
    titleHe: 'שלישיית אלמנטים מאוזנת ונקייה',
    archetype: 'standard',
    category: 'shapes',
    keywords: ['נקודות', 'נקי', 'מאוזן', 'SaaS'],
    defaultStrokeColor: '#6366f1',
    defaultFillColor: 'rgba(99,102,241,0.2)',
    effect: 'float-bob',
    svgContent: `<circle cx="4" cy="12" r="2.5" fill="currentColor"/>
<circle cx="12" cy="12" r="3.5" fill="currentColor"/>
<circle cx="20" cy="12" r="2.5" fill="currentColor"/>`,
  },
  {
    id: 'shape_std_clean_divider',
    name: 'פס מפריד מודרני',
    titleHe: 'פס הפרדה עדין עם נקודת מוקד',
    archetype: 'standard',
    category: 'dividers',
    keywords: ['מפריד', 'קו', 'עיצוב נקי', 'אלגנטי'],
    defaultStrokeColor: '#4f46e5',
    defaultFillColor: 'transparent',
    effect: 'float-bob',
    svgContent: `<line x1="1" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
<circle cx="12" cy="12" r="2" fill="currentColor"/>
<line x1="15" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>`,
  },
  {
    id: 'shape_std_balanced_rings',
    name: 'טבעות הרמוניה שזורות',
    titleHe: 'שתי טבעות הרמוניות משולבות',
    archetype: 'standard',
    category: 'symbols',
    keywords: ['טבעות', 'שילוב', 'הרמוניה', 'שותפות'],
    defaultStrokeColor: '#6366f1',
    defaultFillColor: 'rgba(99,102,241,0.1)',
    effect: 'float-bob',
    svgContent: `<circle cx="9" cy="12" r="6" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
<circle cx="15" cy="12" r="6" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>`,
  },

  // 4. SPIRITUAL (סגנון רוחני ועדין - שלווה, הילות רכות, השראה ואווירה פיוטית)
  {
    id: 'shape_spir_sunburst_halo',
    name: 'הילת שמש נצחית',
    titleHe: 'שמש רוחנית עם הילת קרניים עדינות',
    archetype: 'spiritual',
    category: 'symbols',
    keywords: ['שמש', 'הילה', 'רוחני', 'אור', 'נשמה'],
    defaultStrokeColor: '#10b981',
    defaultFillColor: 'rgba(16,185,129,0.15)',
    effect: 'wave-drift',
    svgContent: `<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.25"/>
<path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  },
  {
    id: 'shape_spir_crescent_radiance',
    name: 'סהר ירח והתחדשות',
    titleHe: 'סהר ירח עדין עם כוכב שחר',
    archetype: 'spiritual',
    category: 'symbols',
    keywords: ['ירח', 'סהר', 'התחדשות', 'כוכב', 'שלווה'],
    defaultStrokeColor: '#14b8a6',
    defaultFillColor: 'rgba(20,184,166,0.15)',
    effect: 'wave-drift',
    svgContent: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15"/>
<circle cx="17" cy="7" r="1.5" fill="currentColor"/>`,
  },
  {
    id: 'shape_spir_mandala_ring',
    name: 'מעגל מנדלה מדיטטיבי',
    titleHe: 'עיטור מנדלה קונצנטרי רוחני',
    archetype: 'spiritual',
    category: 'shapes',
    keywords: ['מנדלה', 'מעגל', 'רוחניות', 'איזון'],
    defaultStrokeColor: '#34d399',
    defaultFillColor: 'transparent',
    effect: 'wave-drift',
    svgContent: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" stroke-opacity="0.5"/>
<circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.2"/>
<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1" fill="currentColor" fill-opacity="0.2"/>`,
  },
  {
    id: 'shape_spir_wave_stream',
    name: 'זרימת מים חיים',
    titleHe: 'גלי הרמוניה וזרימה טבעית',
    archetype: 'spiritual',
    category: 'dividers',
    keywords: ['מים', 'גלים', 'זרימה', 'שקט'],
    defaultStrokeColor: '#059669',
    defaultFillColor: 'transparent',
    effect: 'wave-drift',
    svgContent: `<path d="M2 10C5 7 8 13 12 10C16 7 19 13 22 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2 14C5 11 8 17 12 14C16 11 19 17 22 14" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-opacity="0.6"/>`,
  },

  // 5. SHARP (סגנון חד וטכנולוגי - ללא רדיוס פינות 0px, גרידים גיאומטריים חדים)
  {
    id: 'shape_sharp_crosshair_target',
    name: 'כוונת דיוק 0px',
    titleHe: 'כוונת דיוק גיאומטרית חדה',
    archetype: 'sharp',
    category: 'symbols',
    keywords: ['כוונת', 'דיוק', 'חד', 'טכנולוגי', 'סייבר'],
    defaultStrokeColor: '#06b6d4',
    defaultFillColor: 'rgba(6,182,212,0.1)',
    effect: 'cyber-scan',
    svgContent: `<rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
<line x1="12" y1="1" x2="12" y2="6" stroke="currentColor" stroke-width="2"/>
<line x1="12" y1="18" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
<line x1="1" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="2"/>
<line x1="18" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>`,
  },
  {
    id: 'shape_sharp_diamond_matrix',
    name: 'מטריצת יהלום חדה',
    titleHe: 'רשת יהלומים חדה וזוויתית',
    archetype: 'sharp',
    category: 'shapes',
    keywords: ['יהלום', 'מטריצה', 'זווית', 'חד'],
    defaultStrokeColor: '#22d3ee',
    defaultFillColor: 'rgba(34,211,238,0.15)',
    effect: 'cyber-scan',
    svgContent: `<polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.1"/>
<polygon points="12,6 18,12 12,18 6,12" stroke="currentColor" stroke-width="1" stroke-dasharray="1 1"/>`,
  },
  {
    id: 'shape_sharp_cyber_brackets',
    name: 'סוגרי מסגרת סייבר',
    titleHe: 'סוגרי HUD טכנולוגיים חדים',
    archetype: 'sharp',
    category: 'shapes',
    keywords: ['סוגריים', 'HUD', 'סייבר', 'פיקסל'],
    defaultStrokeColor: '#06b6d4',
    defaultFillColor: 'transparent',
    effect: 'cyber-scan',
    svgContent: `<path d="M7 3H3V7M17 3H21V7M3 17V21H7M21 17V21H17" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>
<rect x="10" y="10" width="4" height="4" fill="currentColor"/>`,
  },
  {
    id: 'shape_sharp_grid_divider',
    name: 'פס סרגל חיתוך',
    titleHe: 'סרגל חלוקה טכנולוגי חד',
    archetype: 'sharp',
    category: 'dividers',
    keywords: ['סרגל', 'פס', 'חיתוך', 'חד'],
    defaultStrokeColor: '#06b6d4',
    defaultFillColor: 'currentColor',
    effect: 'cyber-scan',
    svgContent: `<line x1="1" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="1.5"/>
<rect x="3" y="10" width="2" height="4" fill="currentColor"/>
<rect x="7" y="9" width="2" height="6" fill="currentColor"/>
<rect x="11" y="8" width="2" height="8" fill="currentColor"/>
<rect x="15" y="9" width="2" height="6" fill="currentColor"/>
<rect x="19" y="10" width="2" height="4" fill="currentColor"/>`,
  },

  // 6. ANALYTICAL (סגנון אנליטי ומדעי - מסגרות טכנולוגיות חתוכות, מוניטורים והדגשת נתונים)
  {
    id: 'shape_analyt_hex_core',
    name: 'משושה נתונים ומבנה',
    titleHe: 'משושה מולקולרי אנליטי עם ליבת מידע',
    archetype: 'analytical',
    category: 'symbols',
    keywords: ['משושה', 'נתונים', 'אנליטיקה', 'בינה', 'מדע'],
    defaultStrokeColor: '#3b82f6',
    defaultFillColor: 'rgba(59,130,246,0.12)',
    effect: 'rotate-slow',
    svgContent: `<polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1"/>
<circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.6"/>
<line x1="12" y1="2" x2="12" y2="9" stroke="currentColor" stroke-width="1" stroke-opacity="0.5"/>
<line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" stroke-width="1" stroke-opacity="0.5"/>`,
  },
  {
    id: 'shape_analyt_radar_nodes',
    name: 'צומת רדאר ומדדים',
    titleHe: 'מערך נקודות ציריות ואנליטיקה',
    archetype: 'analytical',
    category: 'shapes',
    keywords: ['רדאר', 'צומת', 'מדדים', 'גרף'],
    defaultStrokeColor: '#60a5fa',
    defaultFillColor: 'rgba(96,165,250,0.1)',
    effect: 'rotate-slow',
    svgContent: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.4"/>
<line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="1" stroke-opacity="0.4"/>
<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1" stroke-opacity="0.4"/>
<circle cx="16" cy="8" r="1.5" fill="currentColor"/>`,
  },
  {
    id: 'shape_analyt_chip_circuit',
    name: 'מעגל שבב ומעבד',
    titleHe: 'מעגל שבב לוגי ומדעי',
    archetype: 'analytical',
    category: 'symbols',
    keywords: ['שבב', 'מעגל', 'לוגיקה', 'מחשב'],
    defaultStrokeColor: '#2563eb',
    defaultFillColor: 'rgba(37,99,235,0.15)',
    effect: 'rotate-slow',
    svgContent: `<rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.1"/>
<circle cx="12" cy="12" r="2.5" fill="currentColor"/>
<path d="M9 1V5M15 1V5M9 19V23M15 19V23M1 9H5M1 15H5M19 9H23M19 15H23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  },
  {
    id: 'shape_analyt_pulse_divider',
    name: 'קו דופק ואינדיקטור',
    titleHe: 'קו מוניטור אנליטי עם פולס אותות',
    archetype: 'analytical',
    category: 'dividers',
    keywords: ['דופק', 'מוניטור', 'אותות', 'אינדיקטור'],
    defaultStrokeColor: '#38bdf8',
    defaultFillColor: 'transparent',
    effect: 'rotate-slow',
    svgContent: `<path d="M1 12H7L9 6L13 18L15 10L17 12H23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
];

/**
 * Generates an SVG Data URI from a shape item with the given color
 */
export function buildShapeSvgDataUrl(
  shape: StyleShapeSymbolItem,
  color?: string,
  fillOpacity: number = 0.15
): string {
  const stroke = color || shape.defaultStrokeColor;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" color="${stroke}">${shape.svgContent}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
