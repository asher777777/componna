export interface ProductionTypeOption {
  id: string;
  name: string;
  category: 'marketing' | 'educational' | 'corporate' | 'creative';
  description: string;
  recommendedScenes: number;
  icon: string;
}

export const PRODUCTION_TYPES_CATALOG: ProductionTypeOption[] = [
  {
    id: 'landing_funnel',
    name: 'עמוד נחיתה ומשפך מכירות אינטראקטיבי',
    category: 'marketing',
    description: 'סצנות מתואמות עם מעברים, שכבות הסבר (Cards), כפתורי שיחת מכירה, טופס לידים ו-WhatsApp',
    recommendedScenes: 4,
    icon: 'Sparkles'
  },
  {
    id: 'b2b_brand',
    name: 'סרטון תדמית B2B עסקי וסמכותי',
    category: 'corporate',
    description: 'הצגת חברה, חזון עסקי, בידול בשוק והנעת מנהלים לשיחת היכרות',
    recommendedScenes: 5,
    icon: 'Building'
  },
  {
    id: 'ecommerce_product',
    name: 'סרטון הדגמת מוצר ומסחר (E-Commerce)',
    category: 'marketing',
    description: 'הבלטת פיצ׳רים, יתרונות, מחיר, תגית הנחה והנעה לרכישה מהירה בחנות',
    recommendedScenes: 4,
    icon: 'ShoppingBag'
  },
  {
    id: 'viral_reels',
    name: 'רילס / טיקטוק ויראלי קצר וסוחף',
    category: 'creative',
    description: 'הוק מהיר ב-3 שניות הראשונות, קצב גבוה, טיפים ממוקדים וקריאה לשיתוף',
    recommendedScenes: 3,
    icon: 'Flame'
  },
  {
    id: 'customer_testimonial',
    name: 'עדות לקוח, ביקורת ו-Case Study',
    category: 'marketing',
    description: 'הצגת הבעיה של הלקוח, הפתרון שקיבל והתוצאות המספריות המוכחות',
    recommendedScenes: 4,
    icon: 'Award'
  },
  {
    id: 'explainer_tutorial',
    name: 'הדרכה והסבר מערכת (Product Explainer)',
    category: 'educational',
    description: 'פירוט שלב-אחר-שלב של איך המערכת עובדת עם דגשים ויזואליים',
    recommendedScenes: 5,
    icon: 'Layers'
  },
  {
    id: 'course_lesson',
    name: 'שיעור קורס דיגיטלי והעברת ידע',
    category: 'educational',
    description: 'מבנה פדגוגי מובנה: מבוא, תרגול, סיכום נקודות מפתח ומשימה',
    recommendedScenes: 6,
    icon: 'GraduationCap'
  },
  {
    id: 'lead_magnet',
    name: 'משיכת לידים ומגנט תוכן (Lead Magnet)',
    category: 'marketing',
    description: 'הצגת מדריך / ספר / וובינר בחינם תמורת השארת פרטי יצירת קשר',
    recommendedScenes: 3,
    icon: 'Gift'
  },
  {
    id: 'real_estate',
    name: 'נדל״ן וסיור וירטואלי בנכס',
    category: 'corporate',
    description: 'הצגת יתרונות הנכס, מיקום, מפרט טכני ופרטי יצירת קשר עם המתווך/יזם',
    recommendedScenes: 5,
    icon: 'Home'
  },
  {
    id: 'feature_launch',
    name: 'טיזר והשקת פיצ׳ר / שירות חדש',
    category: 'marketing',
    description: 'הודעה מרגשת על יכולת חדשה, למה היא נולדה ואיך מתחילים להשתמש בה',
    recommendedScenes: 3,
    icon: 'Zap'
  },
  {
    id: 'founder_story',
    name: 'סיפור המייסד ומיתוג אישי',
    category: 'creative',
    description: 'חיבור רגשי ואישי: למה הקמתי את המיזם, האתגרים בדרך והשליחות',
    recommendedScenes: 4,
    icon: 'User'
  },
  {
    id: 'hr_recruitment',
    name: 'גיוס עובדים ומיתוג מעסיק (HR)',
    category: 'corporate',
    description: 'הצגת התרבות הארגונית, הווי הצוות, הטבות והזמנה להגיש קו״ח',
    recommendedScenes: 4,
    icon: 'Users'
  },
  {
    id: 'event_invitation',
    name: 'הזמנה לאירוע, כנס או וובינר',
    category: 'marketing',
    description: 'תאריך, מרצים מובילים, ערך מקצועי וטופס שריין מקום מוקדם',
    recommendedScenes: 3,
    icon: 'Calendar'
  },
  {
    id: 'investor_pitch',
    name: 'פיץ׳ גיוס משקיעים ופרזנטציה',
    category: 'corporate',
    description: 'בעיה, שוק יעד (TAM), מודל עסקי, טרקשן, צוות וסכום הגיוס המבוקש',
    recommendedScenes: 6,
    icon: 'TrendingUp'
  },
  {
    id: 'financial_insights',
    name: 'סקירה פיננסית, ייעוץ והשקעות',
    category: 'corporate',
    description: 'ניתוח מגמות שוק, אסטרטגיות חיסכון ומסלולי השקעה מומלצים',
    recommendedScenes: 4,
    icon: 'Coins'
  },
  {
    id: 'medical_clinic',
    name: 'רפואה, בריאות, קליניקות וטיפולים',
    category: 'corporate',
    description: 'הסבר רפואי מרגיע, מקצועיות המרפאה, תהליך הטיפול והזמנת תור',
    recommendedScenes: 4,
    icon: 'Activity'
  },
  {
    id: 'podcast_teaser',
    name: 'פרומו לפודקאסט ואירוח',
    category: 'creative',
    description: 'ציטוט השיא מהפרק, נושא הדיון וקישור להאזנה בספוטיפיי/יוטיוב',
    recommendedScenes: 3,
    icon: 'Mic'
  },
  {
    id: 'faq_objections',
    name: 'שאלות נפוצות וטיפול בהתנגדויות',
    category: 'marketing',
    description: 'מענה חד וברור לשאלות "האם זה מתאים לי?", "כמה זה עולה?" ועוד',
    recommendedScenes: 4,
    icon: 'HelpCircle'
  },
  {
    id: 'satire_humor',
    name: 'סרטון סאטירה, הומור והוק בידורי',
    category: 'creative',
    description: 'משחק תפקידים משעשע שמציף את התסכול של הלקוח ופותח בפתרון גאוני',
    recommendedScenes: 4,
    icon: 'Smile'
  },
  {
    id: 'vision_strategy',
    name: 'חזון, אסטרטגיה וסיכום רבעוני',
    category: 'corporate',
    description: 'סיכום הישגי החברה, יעדים עתידיים ומסר השראה לצוות וללקוחות',
    recommendedScenes: 5,
    icon: 'Target'
  }
];

export interface VisualStyleOption {
  id: string;
  name: string;
  description: string;
  badge: string;
  visualPromptPrefix: string;
}

export const VISUAL_STYLES_CATALOG: VisualStyleOption[] = [
  {
    id: 'cinematic_dramatic',
    name: 'קולנועי דרמטי (Cinematic 8K)',
    description: 'תאורת אולפן דרמטית, עדשת 85mm, עומק שדה רדוד, צבעי קולנוע',
    badge: '🎬 מומלץ',
    visualPromptPrefix: 'Cinematic 8K masterpiece, shallow depth of field, dramatic anamorphic studio rim lighting, Arri Alexa style'
  },
  {
    id: 'commercial_polished',
    name: 'פרסומת יוקרתית מלוטשת (High-End Ad)',
    description: 'תאורה רכה ונקייה, רקע אולפן מודרני, מראה פרמיום מבריק',
    badge: '⭐ פרימיום',
    visualPromptPrefix: 'High-end luxury commercial advertisement, pristine clean lighting, ultra-modern corporate studio, crisp 4k'
  },
  {
    id: 'playful_kids',
    name: 'ילדותי, צבעוני ומצויר (Kids Animation)',
    description: 'צבעים עזים ומשמחים, סגנון איור חם ומזמין לילדים ולמשפחה',
    badge: '🎈 צבעוני',
    visualPromptPrefix: 'Whimsical and vibrant children illustration style, warm pastel tones, friendly, joyful atmosphere, Disney Pixar inspired'
  },
  {
    id: 'cyberpunk_future',
    name: 'עתידני וסייברפאנק (Futuristic Cyberpunk)',
    description: 'אורות ניאון זוהרים, הולוגרמות, גשם לילה ואווירה טכנולוגית',
    badge: '⚡ סייבר',
    visualPromptPrefix: 'Cyberpunk futuristic metropolis, neon cyan and magenta glow, holographic HUD overlays, rainy reflective surfaces, ultra-detailed'
  },
  {
    id: 'documentary_raw',
    name: 'תיעודי אותנטי (Authentic Documentary)',
    description: 'תאורה טבעית, תחושת שטח אמיתית, צילום דוקומנטרי אמין',
    badge: '📹 אותנטי',
    visualPromptPrefix: 'Award-winning National Geographic documentary style, natural sunlight, authentic candid camera, raw realistic textures'
  },
  {
    id: 'tech_minimal',
    name: 'הייטקי ומינימליסטי נקי (Tech Minimalist)',
    description: 'עיצוב נקי, גווני לבן-אפור-כחול, אלמנטים גיאומטריים מדויקים',
    badge: '💻 הייטק',
    visualPromptPrefix: 'Minimalist Silicon Valley tech studio, subtle soft lighting, frosted glass UI accents, sleek modern aesthetics'
  },
  {
    id: 'pop_art',
    name: 'פופ-ארט וצבעוני ססגוני (Vibrant Pop Art)',
    description: 'ניגודיות צבעים חזקה, קווי מתאר בולטים ואנרגיה צעירה',
    badge: '🎨 פופ-ארט',
    visualPromptPrefix: 'Andy Warhol pop-art explosion, bold halftone patterns, vibrant saturated primary colors, dynamic energetic composition'
  },
  {
    id: 'synthwave_80s',
    name: 'רטרו שנות ה-80 ניאון (80s Synthwave)',
    description: 'שמש שוקעת וקטורית, רשתות ניאון, פלטת סגול-טורקיז',
    badge: '🕹️ רטרו',
    visualPromptPrefix: '80s retro synthwave aesthetic, glowing wireframe grid horizon, neon purple and teal sunset, nostalgic chrome lettering'
  },
  {
    id: 'photorealistic_studio',
    name: 'ריאליזם פוטוגרפי אולפני (Hyper-Photorealism)',
    description: 'צילום פורטרט מדויק ברמת Hasselblad, טקסטורות עור אמיתיות',
    badge: '📸 ריאליסטי',
    visualPromptPrefix: 'Hyper-photorealistic Hasselblad 100MP studio portrait, natural skin pores, octabox soft diffused lighting, photoreal 8k'
  },
  {
    id: 'anime_manga',
    name: 'אנימה ואיור יפני (Anime / Makoto Shinkai)',
    description: 'ציור אנימה מרהיב, שמיים מפורטים, קרני אור קסומות',
    badge: '🌸 אנימה',
    visualPromptPrefix: 'Breathtaking Makoto Shinkai anime style, glowing golden hour volumetric godrays, detailed celestial skies, studio Ghibli aesthetic'
  },
  {
    id: 'luxury_gold',
    name: 'יוקרתי, שחור וזהב (Luxury Black & Gold)',
    description: 'אלגנטיות מושלמת למותגי יוקרה, תכשיטים, רכב ונדל״ן',
    badge: '👑 יוקרתי',
    visualPromptPrefix: 'Ultra-luxurious matte obsidian black and metallic brushed gold accents, elegant velvet textures, premium cinematic lighting'
  },
  {
    id: 'comic_superhero',
    name: 'קומיקס וגיבורי-על (Comic Book Style)',
    description: 'פאנלים דינמיים, אפקטי אקשן וטקסטורות קומיקס',
    badge: '💥 קומיקס',
    visualPromptPrefix: 'Marvel graphic novel style, dynamic action lines, cross-hatching ink textures, heroic low angle framing'
  },
  {
    id: 'direct_response',
    name: 'שיווק ישיר וסוחף (Direct Response Dynamic)',
    description: 'חיתוכי זום מהירים, תגיות מחיר בולטות ואנרגיית מכירה גבוהה',
    badge: '🔥 מכירות',
    visualPromptPrefix: 'High-energy direct response sales video, sharp crisp focus, vivid attention-grabbing elements, dynamic zoom aesthetic'
  },
  {
    id: 'warm_lifestyle',
    name: 'חם ומשפחתי לייפסטייל (Warm & Cozy Lifestyle)',
    description: 'אווירה ביתית, תאורת בוקר נעימה, גווני עץ ואור שמש',
    badge: '☕ לייפסטייל',
    visualPromptPrefix: 'Warm and cozy Scandinavian home lifestyle, soft morning golden sunlight through curtains, organic natural earth tones'
  },
  {
    id: 'urban_streetwear',
    name: 'אורבני ורחוב בועט (Urban & Streetwear)',
    description: 'צילום גרפיטי, אופנת רחוב, לוק עדשת עין-הדג ותנועה מהירה',
    badge: '🛹 אורבני',
    visualPromptPrefix: 'Gritty urban street style, concrete textures, dynamic fisheye lens perspective, authentic street culture aesthetic'
  },
  {
    id: '3d_claymation',
    name: 'תלת-מימד סגנון פיקסאר (3D Pixar / Claymation)',
    description: 'דמויות תלת-ממדיות עגלגלות ומתוקות, תאורה רכה ומזמינה',
    badge: '🧸 תלת-מימד',
    visualPromptPrefix: 'Adorable Pixar 3D animated character render, soft claymation textures, Octane 3D render, subsurface scattering'
  },
  {
    id: 'papercraft',
    name: 'נייר חתוך וקולאז׳ (Papercraft & Collage)',
    description: 'שכבות נייר גזורות, עומק רב-שכבתי ועיצוב ייחודי בלתי נשכח',
    badge: '✂️ יצירתי',
    visualPromptPrefix: 'Intricate layered papercraft art style, tangible paper cutouts casting realistic drop shadows, creative stop-motion collage'
  },
  {
    id: 'film_noir',
    name: 'פילם נואר שחור-לבן (Classic Film Noir)',
    description: 'צללים חדים, תריסים ונציאניים, אווירת מסתורין קלאסית',
    badge: '🕶️ נואר',
    visualPromptPrefix: 'Classic 1940s film noir, high-contrast black and white photography, venetian blind shadows, moody atmospheric fog'
  },
  {
    id: 'infographic_science',
    name: 'מדעי ואינפוגרפיקה (Scientific Infographic)',
    description: 'גרפים הולוגרפיים, דיאגרמות מדעיות ועיצוב אקדמי מרשים',
    badge: '🔬 מדעי',
    visualPromptPrefix: 'Sophisticated scientific data visualization, futuristic holographic charts, clean medical blue glowing interface, 4k'
  },
  {
    id: 'mystical_fantasy',
    name: 'מיסטי ופנטזיה (Mystical Fantasy)',
    description: 'חלקיקים זוהרים, ערפל קסום, אווירת אגדות ורוחניות',
    badge: '✨ פנטזיה',
    visualPromptPrefix: 'Enchanted mystical fantasy forest, ethereal glowing spore particles, dreamlike aurora lighting, majestic magical ambiance'
  }
];

export interface TtsLanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const TTS_LANGUAGES: TtsLanguageOption[] = [
  { code: 'he-IL', name: 'עברית (Hebrew - Israel)', flag: '🇮🇱' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'ru-RU', name: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'ar-XA', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'it-IT', name: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Português (Portuguese - Brazil)', flag: '🇧🇷' },
  { code: 'zh-CN', name: '中文 (Chinese Mandarin)', flag: '🇨🇳' },
  { code: 'ja-JP', name: '日本語 (Japanese)', flag: '🇯🇵' }
];

export interface OutputDeliverableOption {
  id: 'script_prompts' | 'script_tts' | 'script_images' | 'full_production';
  title: string;
  description: string;
  badge: string;
}

export const OUTPUT_DELIVERABLES: OutputDeliverableOption[] = [
  {
    id: 'script_prompts',
    title: 'תסריט ופרומפטים לתמונות בלבד',
    description: 'טקסט קריינות מלא לכל סצנה + פרומפטים עקביים מותאמים ל-Banana Pro',
    badge: '📝 תסריט'
  },
  {
    id: 'script_tts',
    title: 'תסריט + קריינות ודיבוב קולי (TTS)',
    description: 'הפקת תסריט מלא יחד עם קובצי שמע ודיבוב קולי בשפה הנבחרת',
    badge: '🎙️ שמע'
  },
  {
    id: 'script_images',
    title: 'תסריט + תמונות ורקעים AI עקביים',
    description: 'תסריט מלא עם הפקת תמונות רקע מבוססות Banana Pro עקביות',
    badge: '🖼️ תמונות'
  },
  {
    id: 'full_production',
    title: 'הפקה מלאה: תסריט + TTS + תמונות + אווטאר',
    description: 'חבילת הפקה מושלמת הכוללת פרזנטור AI (HeyGen), דיבוב, רקעים ואינטראקטיביות',
    badge: '🚀 מלא'
  }
];

export interface AudienceOption {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export const TARGET_AUDIENCE_CATALOG: AudienceOption[] = [
  { id: 'b2b_execs', name: 'בעלי עסקים, יזמים ומנכ"לים (B2B)', category: 'עסקי', icon: 'Building' },
  { id: 'marketing_cmo', name: 'מנהלי שיווק, סמנכ"לי צמיחה ו-CMO', category: 'שיווק', icon: 'Target' },
  { id: 'ecommerce_shoppers', name: 'צרכני איקומרס וקונים אונליין (B2C)', category: 'צרכנות', icon: 'ShoppingBag' },
  { id: 'freelancers_creators', name: 'פרילנסרים, יועצים ויוצרי תוכן', category: 'עצמאיים', icon: 'User' },
  { id: 'tech_developers', name: 'מפתחים, אנשי טכנולוגיה וצוותי R&D', category: 'טכנולוגיה', icon: 'Code' },
  { id: 'parents_families', name: 'הורים, משפחות וילדים', category: 'משפחה', icon: 'Users' },
  { id: 'gen_z_students', name: 'סטודנטים, צעירים ודור ה-Z (Gen Z)', category: 'צעירים', icon: 'Smartphone' },
  { id: 'investors_vc', name: 'משקיעים, קרנות הון סיכון ואנג\'לים', category: 'פיננסים', icon: 'TrendingUp' },
  { id: 'real_estate_buyers', name: 'רוכשי דירות, משקיעי נדל"ן ושוכרים', category: 'נדל"ן', icon: 'Home' },
  { id: 'hr_managers', name: 'מנהלי משאבי אנוש (HR) ומגייסים', category: 'ארגוני', icon: 'Briefcase' },
  { id: 'luxury_affluent', name: 'לקוחות פרימיום ועשירון עליון (Luxury)', category: 'יוקרה', icon: 'Crown' },
  { id: 'wellness_fitness', name: 'חובבי בריאות, כושר ואיכות חיים (Wellness)', category: 'בריאות', icon: 'Activity' },
  { id: 'community_leaders', name: 'מנהלי קהילות ומובילי דעה ברשת', category: 'קהילות', icon: 'MessageCircle' },
  { id: 'professionals_law_acc', name: 'בעלי מקצועות חופשיים (עורכי דין, רו"ח, אדריכלים)', category: 'מקצועי', icon: 'FileText' },
  { id: 'educators_teachers', name: 'מורים, מרצים ומדריכים בקורסים', category: 'חינוך', icon: 'GraduationCap' },
  { id: 'sales_agents', name: 'אנשי מכירות, מנהלי תיקי לקוחות ומוקדנים', category: 'מכירות', icon: 'PhoneCall' },
  { id: 'local_consumers', name: 'צרכנים מקומיים ותושבי האזור', category: 'מקומי', icon: 'MapPin' },
  { id: 'ops_procurement', name: 'מנהלי רכש, תפעול ולוגיסטיקה (Operations)', category: 'תפעול', icon: 'Truck' },
  { id: 'seniors_60plus', name: 'גיל הזהב ופנסיונרים (60+)', category: 'גיל הזהב', icon: 'Heart' },
  { id: 'gamers_geeks', name: 'גיימרים, חובבי גאדג\'טים וחדשנות דיגיטלית', category: 'גיימינג', icon: 'Gamepad2' }
];

export interface MarketingHookOption {
  id: string;
  name: string;
  category: string;
  badge: string;
}

export const MARKETING_HOOKS_CATALOG: MarketingHookOption[] = [
  { id: 'sales_boost_30', name: 'להגדיל את המכירות ב-30% בעזרת סרטוני וידאו מותאמים אישית', category: 'המרות', badge: '📈 מכירות' },
  { id: 'save_10_hours', name: 'לחסוך מעל 10 שעות עבודה שבועיות באוטומציה מבוססת AI', category: 'חיסכון', badge: '⏱️ זמן' },
  { id: 'triple_whatsapp_leads', name: 'להכפיל את כמות הלידים החמים ישירות לוואטסאפ תוך 24 שעות', category: 'לידים', badge: '🔥 וואטסאפ' },
  { id: 'guarantee_14_days', name: 'תוצאות מוכחות תוך 14 יום או החזר כספי מלא ללא שאלות', category: 'אחריות', badge: '🛡️ ביטחון' },
  { id: 'exclusive_24h_discount', name: 'הנחה בלעדית וקופון סודי ל-24 שעות הקרובות בלבד', category: 'דחיפות', badge: '⚡ מבצע' },
  { id: 'top_1_percent_secret', name: 'השיטה הסודית שחברות ה-Top 1% משתמשות בה כדי לצמוח', category: 'סקרנות', badge: '💎 סודי' },
  { id: 'stop_wasting_ad_budget', name: 'להפסיק לבזבז כסף על קמפיינים ופרסום שלא מביא לקוחות', category: 'כאב', badge: '🛑 כאב' },
  { id: 'free_strategy_session', name: 'לקבל שיחת ייעוץ ואבחון אסטרטגי ראשוני 100% חינם', category: 'הצעה', badge: '🎁 מתנה' },
  { id: 'exclusive_inner_circle', name: 'להצטרף לקהילה סגורה ואקסקלוסיבית של מובילי התעשייה', category: 'מעמד', badge: '👑 מועדון' },
  { id: 'reveal_3_deadly_mistakes', name: 'לחשוף את 3 הטעויות הנפוצות ביותר שעולות לך הון תועפות', category: 'חינוך', badge: '⚠️ אזהרה' },
  { id: 'convert_cold_traffic_60s', name: 'להפוך גולשים קרים ללקוחות משלמים תוך פחות מ-60 שניות', category: 'מהירות', badge: '🚀 מיידי' },
  { id: 'double_roas_ads', name: 'להכפיל את ה-ROAS וההחזר על ההשקעה בפרסום הממומן', category: 'רווחיות', badge: '💰 ROAS' },
  { id: 'founders_early_pricing', name: 'לשריין מקום בהשקה המוקדמת במחיר מייסדים מיוחד', category: 'השקה', badge: '🏷️ מייסדים' },
  { id: 'instant_beta_access', name: 'לקבל גישה מיידית לגרסת הבטא לפני כולם', category: 'חדשנות', badge: '✨ בטא' },
  { id: 'one_click_simplicity', name: 'להפוך תהליך מורכב ומייגע לפעולה פשוטה בקליק אחד', category: 'פשטות', badge: '👌 קל ופשוט' },
  { id: 'free_toolkit_download', name: 'מדריך מקצועי, צ\'קליסט וכלים מעשיים להורדה ללא עלות', category: 'מגנט', badge: '📥 הורדה' },
  { id: 'authority_branding_boost', name: 'לשדרג את המיתוג האישי ולהפוך לאוטוריטה הבלתי מעורערת בתחום', category: 'מיתוג', badge: '🌟 אוטוריטה' },
  { id: 'zero_risk_peace_of_mind', name: 'ביטחון ושקט נפשי עם אחריות מלאה וליווי צמוד', category: 'ליווי', badge: '🤝 שקט נפשי' },
  { id: 'outshine_all_competitors', name: 'להתבלט מעל כל המתחרים ולייצר בידול שאי אפשר להתעלם ממנו', category: 'בידול', badge: '🏆 מקום 1' },
  { id: 'tailored_live_demo', name: 'הדגמה חיה ואישית של המערכת המותאמת ספציפית לעסק שלך', category: 'הדגמה', badge: '🎥 הדגמה' }
];