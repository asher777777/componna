/**
 * קולקציית פונקציות ה-CRM של KOSUN2026 עבור היועץ החכם (KosCrm Advisor Functions Collection)
 * 
 * מכיל מיפוי מקיף, תגיות חכמות, קטגוריות עסקיות, ומזהי פעולה (actionKeys)
 * המאפשרים ליועץ לשלוף את 4 האפשרויות הרלוונטיות ביותר בכל שאילתא / בקשה.
 */

export interface CrmFunctionItem {
  id: string;
  name: string;               // שם הפונקציה בקוד (למשל parseExcelWorkbook)
  title: string;              // כותרת בהירה בעברית למשתמש
  category: 
    | 'contact_ingestion'
    | 'contact_management'
    | 'messaging_engagement'
    | 'bulk_operations'
    | 'subscriptions_access'
    | 'analytics_bi';
  categoryLabel: string;
  summary: string;            // שורת סיכום תמציתית (שורת הסיכום המעטה)
  processStep: string;        // שלב קצר וממוקד בביצוע הפעולה על גבי הכרטיסיות
  actionKey: string;          // מפתח לטריגר מיידי מהכרטיסייה
  badge: string;              // תגית תצוגה מהירה
  icon: string;               // אייקון Lucide
  ctaText: string;            // כפתור פעולה ממוקד
  tags: string[];             // תגיות חכמות ומילות קישור מרובות
  targetLayout?: 'accordion_morph' | 'spotlight_stage' | 'glass_flip_overlay' | 'bento_asymmetric';
}

export const KOS_CRM_FUNCTIONS_COLLECTION: CrmFunctionItem[] = [
  // =========================================================================
  // 1. תהליך קליטה, ייבוא והזנת אנשי קשר (Contact Ingestion)
  // =========================================================================
  {
    id: 'fn_parse_excel_workbook',
    name: 'parseExcelWorkbook',
    title: 'טעינה ופירוק קובץ אקסל (Excel)',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'טעינת קובץ xlsx/xls, פירוק לגיליונות עבודה ובחירת גיליון לייבוא.',
    processStep: 'שלב 1: העלאת הקובץ במודאל ➔ בחירת הגיליון הפעיל.',
    actionKey: 'open_excel_import',
    badge: 'אקסל',
    icon: 'FileSpreadsheet',
    ctaText: 'טען קובץ אקסל ◀',
    tags: [
      'אקסל', 'excel', 'xlsx', 'xls', 'קובץ', 'גיליון', 'טבלה חיצונית', 
      'ייבוא קובץ', 'העלאת קובץ', 'טעינת אקסל', 'parseexcelworkbook', 'ספרדים'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_parse_sheet_data',
    name: 'parseSheetData',
    title: 'קריאת שורות ועמודות מאקסל',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'חילוץ כותרות העמודות ושורות הנתונים המלאות מתוך הגיליון הנבחר.',
    processStep: 'שלב 2: סריקת השורות ➔ תצוגה מקדימה של נתוני הטבלה.',
    actionKey: 'open_excel_import',
    badge: 'אקסל',
    icon: 'Sheet',
    ctaText: 'קרא נתוני גיליון ◀',
    tags: [
      'שורות', 'עמודות', 'קריאת שורות', 'פרסור', 'נתונים', 'טבלה', 
      'אקסל', 'sheet', 'parsesheetdata', 'הצגת עמודות'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_suggest_field_mapping',
    name: 'suggestFieldMapping',
    title: 'הצעת מיפוי שדות אוטומטית (אקסל ➔ CRM)',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'זיהוי חכם והתאמה אוטומטית בין שמות העמודות לשדות ה-CRM.',
    processStep: 'שלב 3: התאמה חכמה של שדות (שם, טלפון, עיר, מייל) בקליק אחד.',
    actionKey: 'open_excel_import',
    badge: 'מיפוי חכם',
    icon: 'Sparkles',
    ctaText: 'מפה שדות אוטומטית ◀',
    tags: [
      'מיפוי', 'התאמת שדות', 'mapping', 'הצעה אוטומטית', 'עמודות', 
      'זיהוי שדות', 'טלפון', 'שם מלא', 'אימייל', 'suggestfieldmapping'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_handle_field_mapping_change',
    name: 'handleFieldMappingChange',
    title: 'קביעת שיוך ידני של עמודת אקסל',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'הגדרה ידנית או התאמה אישית של עמודת אקסל לשדה ייעודי ב-CRM.',
    processStep: 'שלב 4: שינוי ידני של שדה מיפוי במידת הצורך.',
    actionKey: 'open_excel_import',
    badge: 'התאמה ידנית',
    icon: 'SlidersHorizontal',
    ctaText: 'שייך שדה ידנית ◀',
    tags: [
      'מיפוי ידני', 'שיוך שדה', 'שדה מותאם', 'עמודה מותאמת', 
      'שינוי מיפוי', 'custom fields', 'handlefieldmappingchange'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_map_row_to_contact',
    name: 'mapRowToContact',
    title: 'המרת שורת נתונים לאיש קשר תקני',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'ולידציה והמרת כל רשומת שורה לאובייקט לקוח/ליד תקני של KOSUN.',
    processStep: 'שלב 5: בדיקת תקינות המבנה ➔ המרה לאובייקט Contact.',
    actionKey: 'open_excel_import',
    badge: 'טרנספורמציה',
    icon: 'UserCheck',
    ctaText: 'בצע ולידציה לשורות ◀',
    tags: [
      'המרה', 'ולידציה', 'איש קשר', 'שורה', 'contact object', 
      'תקנון נתונים', 'maprowtocontact', 'אימות שדות'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_handle_execute_import',
    name: 'handleExecuteImport / batchUpdateContactsInDb',
    title: 'ייבוא מרוכז באצוות (Batch Import)',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'שמירה מהירה ב-Batches ישירות ל-Firestore עם מניעת כפילויות.',
    processStep: 'שלב 6: הרצת הייבוא הסופי במנות ➔ סיכום תוצאות מהיר.',
    actionKey: 'open_excel_import',
    badge: 'ביצוע ייבוא',
    icon: 'Database',
    ctaText: 'הרץ ייבוא אצוות ◀',
    tags: [
      'ביצוע ייבוא', 'ייבוא באצוות', 'batch update', 'batch import', 
      'שמירת אקסל', 'טעינה למסד', 'batchupdatecontactsindb', 'handlexecuteimport'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_extract_sheet_id',
    name: 'extractSheetId',
    title: 'אימות וחילוץ מזהה Google Sheet',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'פענוח קישור הגיליון מ-Google Drive ואימות תקינות ה-ID.',
    processStep: 'שלב 1 בסנכרון גוגל: הזנת כתובת ה-URL ➔ חילוץ ה-ID.',
    actionKey: 'open_google_sheets',
    badge: 'גוגל שיטס',
    icon: 'Link2',
    ctaText: 'חלץ מזהה גיליון ◀',
    tags: [
      'גוגל שיטס', 'google sheets', 'sheets id', 'url', 'קישור גיליון', 
      'חילוץ id', 'extractsheetid', 'דרייב'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_handle_save_to_gallery',
    name: 'handleSaveToGallery',
    title: 'שמירת קישור גיליון לגלריית המקורות',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'שמירת מזהה הגיליון בהגדרות הטננט לשימוש חוזר ולסנכרון בלחיצה.',
    processStep: 'שלב 2 בסנכרון גוגל: שמירת המקור בגלריה לשימוש עתידי.',
    actionKey: 'open_google_sheets',
    badge: 'גלריית מקורות',
    icon: 'Bookmark',
    ctaText: 'שמור גיליון לגלריה ◀',
    tags: [
      'שמירת מקור', 'גלריה', 'גיליונות שמורים', 'קישור קבוע', 
      'handlesavetogallery', 'הגדרות טננט', 'מקורות מידע'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_handle_sync_now',
    name: 'handleSyncNow',
    title: 'סנכרון חי ומיזוג מ-Google Sheets',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'משיכת שורות מעודכנות בזמן אמת, הצלבת טלפונים ועדכון ללא דריסה.',
    processStep: 'שלב 3 בסנכרון גוגל: לחיצה על "סנכרן כעת" ➔ מיזוג חי למאגר.',
    actionKey: 'open_google_sheets',
    badge: 'סנכרון חי',
    icon: 'RefreshCw',
    ctaText: 'סנכרן עכשיו מגוגל ◀',
    tags: [
      'סנכרון חי', 'סנכרון גוגל שיטס', 'handlesyncnow', 'מיזוג', 
      'עדכון אוטומטי', 'רענון שורות', 'sheets sync', 'ענן'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_fetch_tenant_whatsapp_credentials',
    name: 'fetchTenantWhatsAppCredentials / checkWhatsAppConnection',
    title: 'אימות חיבור WhatsApp (Green-API)',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'בדיקת סטטוס המופע ואישורי הגישה של הטננט ב-Green-API.',
    processStep: 'שלב 1 בווצאפ: אימות חיבור המופע ➔ קבלת ירוק לשליפה.',
    actionKey: 'open_groups_import',
    badge: 'ווטסאפ',
    icon: 'MessageSquare',
    ctaText: 'בדוק חיבור ווטסאפ ◀',
    tags: [
      'חיבור ווטסאפ', 'green api', 'whatsapp connection', 'אימות מופע', 
      'fetchtenantwhatsappcredentials', 'checkwhatsappconnection', 'אישורים'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_fetch_live_whatsapp_groups',
    name: 'fetchLiveWhatsAppGroups / fetchGroupParticipants',
    title: 'שליפת קבוצות ומשתתפים מ-WhatsApp',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'משיכת כל הקבוצות הפעילות של המשתמש ושליפת רשימת החברים.',
    processStep: 'שלב 2 בווצאפ: בחירת קבוצה ➔ טעינת רשימת המשתתפים.',
    actionKey: 'open_groups_import',
    badge: 'קבוצות ומשתתפים',
    icon: 'Users',
    ctaText: 'שלוף קבוצות פעילות ◀',
    tags: [
      'קבוצות ווטסאפ', 'משתתפי קבוצה', 'שליפת קבוצות', 'חברי קבוצה', 
      'fetchlivewhatsappgroups', 'fetchgroupparticipants', 'קהילות ווטסאפ'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_clean_contact_name_and_extract_tags',
    name: 'cleanContactNameAndExtractTags / normalizePhoneNumber',
    title: 'טיוב שמות ותקנון טלפונים מווצאפ',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'ניקוי אימוג\'ים וסימנים מיוחדים, תקנון למבנה טלפון אחיד וחילוץ תגיות.',
    processStep: 'שלב 3 בווצאפ: סינון ג\'יבריש ➔ תקנון לפורמט בינלאומי/מקומי.',
    actionKey: 'open_groups_import',
    badge: 'טיוב נתונים',
    icon: 'Sparkles',
    ctaText: 'טייב שמות ומספרים ◀',
    tags: [
      'טיוב טלפונים', 'ניקוי שמות', 'תקנון מספר', 'נרמול טלפון', 
      'cleancontactnameandextracttags', 'normalizephonenumber', 'סינון אימוגי'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_import_participants_to_crm_contacts',
    name: 'importParticipantsToCrmContacts',
    title: 'ייבוא משתתפי קבוצה לקולקציית ה-CRM',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'שמירת כל חברי הקבוצה ב-Batches עם תיוג שם הקבוצה והקהילה.',
    processStep: 'שלב 4 בווצאפ: אישור ייבוא ➔ הוספה כלידים/אנשי קשר מתויגים.',
    actionKey: 'open_groups_import',
    badge: 'ייבוא קבוצה',
    icon: 'UserPlus',
    ctaText: 'ייבא משתתפים ל-CRM ◀',
    tags: [
      'ייבוא משתתפים', 'הוספת קבוצה ל-crm', 'תיוג קהילה', 
      'importparticipantstocrmcontacts', 'שמירת לידים מווצאפ'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_parse_business_card_image',
    name: 'parseBusinessCardImage (dispatchBusinessCardToKosai)',
    title: 'סריקת כרטיס ביקור ב-AI / מצלמה',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'פענוח OCR ו-Vision של תמונת כרטיס ביקור וחילוץ שם, טלפון, תפקיד וחברה.',
    processStep: 'שלב 1 בסריקה: צילום/העלאת תמונה ➔ קבלת כרטיס לקוח מוכן תוך שניות.',
    actionKey: 'open_card_scan',
    badge: 'סריקת AI',
    icon: 'Camera',
    ctaText: 'סרוק כרטיס ביקור ◀',
    tags: [
      'סריקת כרטיס ביקור', 'מצלמה', 'כרטיס ביקור', 'ocr', 'ai vision', 
      'חילוץ כרטיס', 'תמונה', 'parsebusinesscardimage', 'סורק'
    ],
    targetLayout: 'spotlight_stage',
  },
  {
    id: 'fn_create_contact_manual',
    name: 'createContact / computeAnalyticsMetrics',
    title: 'הזנה ידנית של איש קשר חדש',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'פתיחת טופס הזנה מהיר, שמירת הרשומה ועדכון מחווני ה-CRM המרכזיים.',
    processStep: 'שלב ישיר: הזנת שם, טלפון ומייל ➔ לחיצה על שמור ועדכון מחוונים.',
    actionKey: 'open_new_contact',
    badge: 'איש קשר חדש',
    icon: 'PlusCircle',
    ctaText: 'הזן איש קשר חדש ◀',
    tags: [
      'איש קשר חדש', 'הזנה ידנית', 'הוספת לקוח', 'יצירת ליד', 
      'createcontact', 'כרטיס חדש', 'הוספה מהירה'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_sync_smart_form_submissions_to_contacts',
    name: 'handleSyncAllFormsToCrm / syncSmartFormSubmissionsToContacts',
    title: 'סנכרון אוטומטי מטפסים חכמים (Forms)',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'סריקת כל ההגשות מטפסי לידים במערכת והמרתן לאנשי קשר תוך מניעת כפילויות.',
    processStep: 'שלב ישיר: לחיצה על סנכרון טפסים ➔ עדכון מיידי של לידים חדשים.',
    actionKey: 'sync_smart_forms',
    badge: 'טפסים חכמים',
    icon: 'FileText',
    ctaText: 'סנכרן הגשות מטפסים ◀',
    tags: [
      'סנכרון טפסים', 'smart forms', 'טפסי לידים', 'הגשות טופס', 
      'handlesyncallformstocrm', 'syncsmartformsubmissionstocontacts', 'לידים אוטומטיים'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_tenant_contact_sync_service',
    name: 'TenantContactSyncService (syncTenantToContact / ensureAllTenantsSyncedToCrm)',
    title: 'סנכרון מנהלי סאב-דומיינים (Tenants)',
    category: 'contact_ingestion',
    categoryLabel: 'קליטה וייבוא אנשי קשר',
    summary: 'סנכרון אוטומטי של כל מנהלי הסאב-דומיינים והטננטים אל מאגר ה-CRM.',
    processStep: 'שלב ישיר: סריקת טננטים ➔ הקמת כרטיסי מנהל מאוחדים ב-CRM.',
    actionKey: 'sync_tenants',
    badge: 'טננטים ומנהלים',
    icon: 'Network',
    ctaText: 'סנכרן מנהלי טננטים ◀',
    tags: [
      'סנכרון טננטים', 'סאב דומיינים', 'מנהלי מערכת', 'טננטים', 
      'tenantcontactsyncservice', 'ensurealltenantssyncedtocrm', 'subdomains'
    ],
    targetLayout: 'accordion_morph',
  },

  // =========================================================================
  // 2. תהליך טיפול וניהול כרטיס לקוח 360 (Contact Management & AI Copilot)
  // =========================================================================
  {
    id: 'fn_generate_contact_summary',
    name: 'generateContactSummary (dispatchContactSummaryToKosai)',
    title: 'תחקור וניתוח לקוח 360 ב-AI',
    category: 'contact_management',
    categoryLabel: 'ניהול לקוח 360 ו-AI',
    summary: 'ניתוח עומק של הלקוח: סנטימנט, חום ליד, היסטוריית פעילות והמלצה לפעולה הבאה.',
    processStep: 'בכרטיס 360: כניסה לטאב AI Copilot ➔ קבלת תובנות פעולה מיידיות.',
    actionKey: 'open_contact_360',
    badge: 'AI Copilot 360',
    icon: 'Sparkles',
    ctaText: 'נתח לקוח ב-AI ◀',
    tags: [
      'ניתוח לקוח', 'סיכום לקוח', 'כרטיס 360', 'copilot', 'generatecontactsummary', 
      'חום ליד', 'סנטימנט', 'המלצה לפעולה', 'next best action', 'תחקור לקוח'
    ],
    targetLayout: 'spotlight_stage',
  },
  {
    id: 'fn_update_contact_field',
    name: 'updateContactField / handleSaveContact',
    title: 'עריכת פרטי לקוח ושמירה מהירה',
    category: 'contact_management',
    categoryLabel: 'ניהול לקוח 360 ו-AI',
    summary: 'עריכה מהירה בשורת הטבלה (Inline) או שמירה מלאה של נתוני כרטיס 360.',
    processStep: 'שלב ישיר: שינוי שדה בעמודה או בכרטיס ➔ שמירה מיידית ב-DB.',
    actionKey: 'open_contact_360',
    badge: 'עריכה מהירה',
    icon: 'Edit3',
    ctaText: 'ערוך פרטי לקוח ◀',
    tags: [
      'עריכת לקוח', 'עדכון שדה', 'שמירת כרטיס', 'inline edit', 
      'updatecontactfield', 'handlesavecontact', 'עדכון פרטים'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_generate_vcard',
    name: 'generateVCard / downloadVCard',
    title: 'ייצוא כרטיס איש קשר לסלולר (vCard)',
    category: 'contact_management',
    categoryLabel: 'ניהול לקוח 360 ו-AI',
    summary: 'הפקת קובץ vcf תקני והורדה מיידית ישירות לספר הטלפונים בטלפון.',
    processStep: 'שלב ישיר: לחיצה על אייקון כרטיס ביקור ➔ הורדת קובץ vcf לסמארטפון.',
    actionKey: 'export_vcard',
    badge: 'vCard סלולר',
    icon: 'Download',
    ctaText: 'הורד כרטיס לסלולר ◀',
    tags: [
      'vcard', 'vcf', 'אנשי קשר בטלפון', 'ייצוא לסלולר', 'הורדת איש קשר', 
      'generatevcard', 'downloadvcard', 'ספר טלפונים'
    ],
    targetLayout: 'glass_flip_overlay',
  },
  {
    id: 'fn_analyze_voice_debrief',
    name: 'analyzeVoiceDebrief (dispatchVoiceDebriefToKosai)',
    title: 'תיעוד שיחה קולית וסיכום פגישה (Voice Debrief)',
    category: 'contact_management',
    categoryLabel: 'ניהול לקוח 360 ו-AI',
    summary: 'הקלטה או תמלול שיחה, חילוץ משימות להמשך, תגיות מומלצות ועדכון סטטוס.',
    processStep: 'בכרטיס 360: הקלטת סיכום קולי ➔ חילוץ משימות וסיכום ב-AI.',
    actionKey: 'open_voice_debrief',
    badge: 'סיכום קולי',
    icon: 'Mic',
    ctaText: 'תעד שיחה קולית ◀',
    tags: [
      'סיכום קולי', 'תמלול שיחה', 'voice debrief', 'סיכום פגישה', 
      'חילוץ משימות', 'הקלטה', 'analyzevoicedebrief', 'פגישה'
    ],
    targetLayout: 'spotlight_stage',
  },

  // =========================================================================
  // 3. תהליך תקשורת ומעורבות לקוחות (WhatsApp & Messaging)
  // =========================================================================
  {
    id: 'fn_generate_smart_message_draft',
    name: 'generateSmartMessageDraft (dispatchDraftMessageToKosai)',
    title: 'ניסוח הודעת WhatsApp מותאמת אישית ב-AI',
    category: 'messaging_engagement',
    categoryLabel: 'תקשורת ו-WhatsApp',
    summary: 'התאמת נוסח הפנייה למטרת השיחה: חימום ליד, הזמנה לקמפיין, תזכורת תשלום.',
    processStep: 'בכרטיס הלקוח: בחירת מטרת פנייה ➔ יצירת נוסח מדויק בלחיצת כפתור.',
    actionKey: 'open_whatsapp_draft',
    badge: 'ניסוח AI',
    icon: 'Sparkles',
    ctaText: 'נסח הודעה ב-AI ◀',
    tags: [
      'ניסוח הודעה', 'ווטסאפ אישי', 'ניסוח ai', 'טיוטת הודעה', 
      'generatesmartmessagedraft', 'חימום ליד', 'תזכורת תשלום'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_send_whatsapp_message',
    name: 'CrmWhatsAppSenderService.sendMessage / sendFileByUrl',
    title: 'שליחה ישירה של הודעות ומסמכים ב-API',
    category: 'messaging_engagement',
    categoryLabel: 'תקשורת ו-WhatsApp',
    summary: 'שיגור מיידי ברקע דרך שרתי Green-API כולל קבצים, חשבוניות ומסמכים.',
    processStep: 'שלב ישיר: לחיצה על שיגור ➔ שליחה ישירה ללא פתיחת חלון נוסף.',
    actionKey: 'send_whatsapp_api',
    badge: 'API ישיר',
    icon: 'Send',
    ctaText: 'שלח הודעה ישירה ◀',
    tags: [
      'שליחת ווטסאפ', 'green api send', 'שליחת קבצים', 'crmwhatsappsenderservice', 
      'הודעה ישירה', 'sendfilebyurl', 'sendmessage'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_build_wa_me_url',
    name: 'buildWaMeUrl / buildNativeWhatsAppAppUrl',
    title: 'פתיחת שיחה באפליקציה (Click to Chat)',
    category: 'messaging_engagement',
    categoryLabel: 'תקשורת ו-WhatsApp',
    summary: 'פתיחה מיידית של WhatsApp Web או האפליקציה המקומית עם הטקסט המוכן.',
    processStep: 'שלב ישיר: קליק על כפתור WhatsApp ➔ פתיחת שיחה מיידית.',
    actionKey: 'open_whatsapp_chat',
    badge: 'Click to Chat',
    icon: 'ExternalLink',
    ctaText: 'פתח שיחה בווטסאפ ◀',
    tags: [
      'click to chat', 'wa.me', 'פתיחת שיחה', 'ווטסאפ ווב', 
      'buildwameurl', 'הודעה מוכנה', 'צ\'אט ישיר'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_bulk_whatsapp_campaign',
    name: 'CrmWhatsAppSenderService.sendMessage (Bulk Mode)',
    title: 'קמפיין שליחה מרוכזת (Bulk WhatsApp)',
    category: 'messaging_engagement',
    categoryLabel: 'תקשורת ו-WhatsApp',
    summary: 'שיגור קמפיין מבוקר למספר נמענים עם השהיות חכמות למניעת חסימות.',
    processStep: 'שלב 1: בחירת נמענים או קהילה ➔ שלב 2: ניסוח ➔ שלב 3: שיגור מבוקר במנות.',
    actionKey: 'open_bulk_whatsapp',
    badge: 'קמפיין המוני',
    icon: 'Send',
    ctaText: 'פתח קמפיין ווטסאפ ◀',
    tags: [
      'קמפיין ווטסאפ', 'שליחה מרוכזת', 'דיוור המוני', 'bulk whatsapp', 
      'הודעות לקבוצה', 'הפצת הודעות', 'crmwhatsappbulk'
    ],
    targetLayout: 'spotlight_stage',
  },

  // =========================================================================
  // 4. תהליך פעולות מרוכזות, טיוב נתונים ומיגרציה (Bulk Operations & Data Hygiene)
  // =========================================================================
  {
    id: 'fn_bulk_assign_group_to_contacts',
    name: 'bulkAssignGroupToContacts',
    title: 'שיוך מרוכז לקבוצה או קהילה',
    category: 'bulk_operations',
    categoryLabel: 'פעולות מרוכזות וטיוב',
    summary: 'צירוף מיידי של כל אנשי הקשר המסומנים לקבוצה עסקית או קהילה.',
    processStep: 'שלב ישיר: סימון אנשי קשר בטבלה ➔ בחירת קהילה ➔ החלה מיידית.',
    actionKey: 'bulk_assign_group',
    badge: 'שיוך קבוצתי',
    icon: 'Users',
    ctaText: 'שייך לקבוצה מרוכזת ◀',
    tags: [
      'שיוך קבוצתי', 'הוספה לקבוצה', 'שיוך מרוכז', 'קהילות', 
      'bulkassigngrouptocontacts', 'הוספת קהילה'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_bulk_add_tag_to_contacts',
    name: 'bulkAddTagToContacts',
    title: 'הוספת תגית מרוכזת לרשומות',
    category: 'bulk_operations',
    categoryLabel: 'פעולות מרוכזות וטיוב',
    summary: 'החלת תגית מותאמת (למשל "VIP", "כנס 2026") על כל הנבחרים.',
    processStep: 'שלב ישיר: הזנת שם התגית ➔ עדכון כל הרשומות הנבחרות.',
    actionKey: 'bulk_add_tag',
    badge: 'תיוג מרוכז',
    icon: 'Tag',
    ctaText: 'החל תגית מרוכזת ◀',
    tags: [
      'תיוג מרוכז', 'הוספת תגית', 'bulk tag', 'תגיות', 
      'bulkaddtagtocontacts', 'סימון לידים'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_bulk_delete_contacts',
    name: 'bulkDeleteContacts',
    title: 'מחיקה מרוכזת של אנשי קשר',
    category: 'bulk_operations',
    categoryLabel: 'פעולות מרוכזות וטיוב',
    summary: 'הסרה מרוכזת ומאובטחת של רשומות מסומנות ממסד הנתונים של הטננט.',
    processStep: 'שלב ישיר: סימון רשומות ➔ אישור מחיקה מאובטח ➔ הסרה מה-DB.',
    actionKey: 'bulk_delete',
    badge: 'מחיקה מרוכזת',
    icon: 'Trash2',
    ctaText: 'מחק נבחרים מרוכז ◀',
    tags: [
      'מחיקה מרוכזת', 'הסרת רשומות', 'bulk delete', 'מחיקת לידים', 
      'bulkdeletecontacts', 'ניקוי רשומות'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_merge_duplicate_contacts_in_db',
    name: 'mergeDuplicateContactsInDb',
    title: 'איתור ומיזוג כפילויות במאגר (Deduplication)',
    category: 'bulk_operations',
    categoryLabel: 'פעולות מרוכזות וטיוב',
    summary: 'איתור אוטומטי של טלפון או מייל זהה, איחוד תגיות ועסקאות ומחיקת כפולים.',
    processStep: 'שלב ישיר: לחיצה על "מיזוג כפילויות" ➔ סריקת המאגר ➔ איחוד רשומות.',
    actionKey: 'open_merge_duplicates',
    badge: 'מיזוג כפילויות',
    icon: 'GitMerge',
    ctaText: 'הפעל מיזוג כפילויות ◀',
    tags: [
      'כפילויות', 'מיזוג כפילויות', 'איחוד רשומות', 'מחיקת כפולים', 
      'deduplication', 'mergeduplicatecontactsindb', 'ניקוי בסיס נתונים'
    ],
    targetLayout: 'glass_flip_overlay',
  },
  {
    id: 'fn_sanitize_contact_names_in_db',
    name: 'sanitizeContactNamesInDb',
    title: 'ניקוי שמות וסדר במאגר (Sanitization)',
    category: 'bulk_operations',
    categoryLabel: 'פעולות מרוכזות וטיוב',
    summary: 'תיקון ג\'יבריש, הסרת תווים שבורים, סידור אותיות וחילוץ תגיות פנימיות.',
    processStep: 'שלב ישיר: הפעלת פונקציית טיוב ➔ ניקוי כל השמות במאגר הטננט.',
    actionKey: 'sanitize_names',
    badge: 'ניקוי שמות',
    icon: 'CheckCircle2',
    ctaText: 'נקה שמות וג\'יבריש ◀',
    tags: [
      'ניקוי שמות', 'תיקון גיבריש', 'סניטיזציה', 'sanitization', 
      'sanitizecontactnamesindb', 'סדר במאגר', 'טיוב שמות'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_crm_collection_migration',
    name: 'analyzeCrmCollectionMigration / executeCrmCollectionMigration',
    title: 'מיגרציית מבנה הנתונים ל-KOSUN26',
    category: 'bulk_operations',
    categoryLabel: 'פעולות מרוכזות וטיוב',
    summary: 'סריקה מקדימה (Dry Run) והעברת שדות ישנים לשדות התקניים kosun_crm_*.',
    processStep: 'שלב 1: הרצת ניתוח מקדים ➔ שלב 2: אישור וביצוע המיגרציה בפועל.',
    actionKey: 'run_crm_migration',
    badge: 'מיגרציה 2026',
    icon: 'RefreshCw',
    ctaText: 'הפעל מיגרציית KOSUN26 ◀',
    tags: [
      'מיגרציה', 'kosun26', 'עדכון מבנה', 'dry run', 
      'analyzecrmcollectionmigration', 'executecrmcollectionmigration', 'שדרוג שדות'
    ],
    targetLayout: 'accordion_morph',
  },

  // =========================================================================
  // 5. תהליך ניהול מנויים, הרשאות תוכן ומבחנים (Subscriptions & Content Access)
  // =========================================================================
  {
    id: 'fn_save_package',
    name: 'savePackage / deletePackage',
    title: 'הקמת וניהול חבילות מנוי ותמחור',
    category: 'subscriptions_access',
    categoryLabel: 'מנויים והרשאות תוכן',
    summary: 'הגדרת שם חבילה, תמחור, מחזור חיוב (חודשי/שנתי) וקישור פריטי תוכן.',
    processStep: 'שלב 1: פתיחת מסך חבילות ➔ שלב 2: הגדרת עלות ותכנים מקושרים.',
    actionKey: 'manage_subscription_packages',
    badge: 'חבילות ומחיר',
    icon: 'Package',
    ctaText: 'נהל חבילות מנוי ◀',
    tags: [
      'חבילות מנוי', 'תמחור', 'מחזור חיוב', 'הקמת חבילה', 
      'savepackage', 'deletepackage', 'תוכן מקושר'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_save_coupon',
    name: 'saveCoupon / deleteCoupon / validateCoupon',
    title: 'ניהול קופוני הנחה ומבצעים',
    category: 'subscriptions_access',
    categoryLabel: 'מנויים והרשאות תוכן',
    summary: 'יצירת קודי קופון, קביעת אחוזי הנחה, מכסות שימוש ובדיקת תוקף בקופה.',
    processStep: 'שלב ישיר: הזנת קוד קופון ואחוזי הנחה ➔ שמירה להחלה במעמד התשלום.',
    actionKey: 'manage_coupons',
    badge: 'קופונים ומבצעים',
    icon: 'Percent',
    ctaText: 'נהל קופוני הנחה ◀',
    tags: [
      'קופון', 'הנחה', 'מבצע', 'קוד קופון', 'מכסת שימוש', 
      'savecoupon', 'validatecoupon', 'הנחות מנויים'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_assign_package_to_contact',
    name: 'assignPackageToContact',
    title: 'שיוך מנוי ללקוח ופתיחת הרשאות',
    category: 'subscriptions_access',
    categoryLabel: 'מנויים והרשאות תוכן',
    summary: 'הפעלת מנוי בכרטיס הלקוח, הגדרת תאריך תפוגה וחיבור לתוכן הבלעדי.',
    processStep: 'בכרטיס 360: בחירת חבילה ➔ שיוך מיידי ועדכון תוקף.',
    actionKey: 'assign_package',
    badge: 'שיוך מנוי',
    icon: 'UserCheck',
    ctaText: 'שייך מנוי ללקוח ◀',
    tags: [
      'שיוך מנוי', 'הפעלת מנוי', 'חבילה ללקוח', 'פתיחת הרשאה', 
      'assignpackagetocontact', 'כרטיס מנוי'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_record_contact_subscription_payment',
    name: 'recordContactSubscriptionPayment',
    title: 'תיעוד תקבול ותשלום מנוי',
    category: 'subscriptions_access',
    categoryLabel: 'מנויים והרשאות תוכן',
    summary: 'רישום סכום ששולם, אמצעי תשלום והארכה אוטומטית של תקופת המנוי.',
    processStep: 'שלב ישיר: הזנת סכום ואסמכתא ➔ שמירת תקבול והארכת המנוי.',
    actionKey: 'record_payment',
    badge: 'תקבול מנוי',
    icon: 'CreditCard',
    ctaText: 'תעד תשלום מנוי ◀',
    tags: [
      'תשלום מנוי', 'תקבול', 'הארכת מנוי', 'רישום עסקה', 
      'recordcontactsubscriptionpayment', 'חידוש מנוי'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_update_contact_subscription_status',
    name: 'updateContactSubscriptionStatus / removeContactSubscription',
    title: 'ניהול סטטוס מנוי (הקפאה / ביטול / הסרה)',
    category: 'subscriptions_access',
    categoryLabel: 'מנויים והרשאות תוכן',
    summary: 'שינוי סטטוס מנוי לפעיל, מוקפא או מבוטל, או הסרה מוחלטת מכרטיס הלקוח.',
    processStep: 'בכרטיס הלקוח: בחירת סטטוס חדש ➔ עדכון מיידי של גישת הלקוח.',
    actionKey: 'update_sub_status',
    badge: 'סטטוס מנוי',
    icon: 'PauseCircle',
    ctaText: 'עדכן סטטוס מנוי ◀',
    tags: [
      'הקפאת מנוי', 'ביטול מנוי', 'סטטוס מנוי', 'הסרת מנוי', 
      'updatecontactsubscriptionstatus', 'removecontactsubscription'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_check_contact_content_access',
    name: 'checkContactContentAccess / updateSubscriberPermissions',
    title: 'בקרת גישה לתכנים ושיעורים בלעדיים',
    category: 'subscriptions_access',
    categoryLabel: 'מנויים והרשאות תוכן',
    summary: 'אימות שהמנוי של הלקוח בתוקף וכולל את התוכן המבוקש, ועדכון הרשאות.',
    processStep: 'שלב בדיקה: הזנת מזהה שיעור/תוכן ➔ קבלת סטטוס הרשאה פתוח/נעול.',
    actionKey: 'check_access',
    badge: 'בקרת גישה',
    icon: 'ShieldCheck',
    ctaText: 'בדוק הרשאת תוכן ◀',
    tags: [
      'בקרת גישה', 'הרשאת תוכן', 'גישה לשיעור', 'הרשאות מנוי', 
      'checkcontactcontentaccess', 'updatesubscriberpermissions', 'נעילת תוכן'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_record_contact_quiz_submission',
    name: 'recordContactQuizSubmission',
    title: 'מענה על מבחן והסמכת מנויים (Quiz)',
    category: 'subscriptions_access',
    categoryLabel: 'מנויים והרשאות תוכן',
    summary: 'בדיקת ציון מעבר של שאלון או מבחן ועדכון זכאות הלקוח לתעודה או שלב הבא.',
    processStep: 'שלב ישיר: קבלת הגשת מבחן ➔ חישוב ציון ➔ עדכון זכאות בכרטיס.',
    actionKey: 'record_quiz',
    badge: 'מבחנים והסמכות',
    icon: 'Award',
    ctaText: 'תעד הגשת מבחן ◀',
    tags: [
      'מבחן מנויים', 'שאלון', 'ציון מעבר', 'הסמכה', 'quiz submission', 
      'recordcontactquizsubmission', 'תעודת סיום'
    ],
    targetLayout: 'accordion_morph',
  },

  // =========================================================================
  // 6. תהליך תחקור, פילוח, גרפים ו-BI (Analytics & BI Engine)
  // =========================================================================
  {
    id: 'fn_use_contact_filters',
    name: 'useContactFilters / refresh',
    title: 'סינון, פילוח רב-שדות וחיפוש מהיר',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'חיפוש טקסטואלי, סינון לפי לידים/לקוחות, תגיות, ערים ומיון לפי עמודות.',
    processStep: 'שלב ישיר: פתיחת מסננים ➔ החלת תנאים מרובים ➔ פילוח הטבלה.',
    actionKey: 'open_filters',
    badge: 'סינון וחיפוש',
    icon: 'Filter',
    ctaText: 'סנן פלח לקוחות ◀',
    tags: [
      'סינון', 'פילוח', 'חיפוש לקוחות', 'תגיות', 'ערים', 
      'לידים בלבד', 'לקוחות משלמים', 'usecontactfilters', 'רענון'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_save_current_view',
    name: 'saveCurrentView / loadView / deleteView',
    title: 'שמירה וטעינה של תצוגות מותאמות (Saved Views)',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'שמירת שילוב העמודות והמסננים בשם מותאם ושחזור מיידי בלחיצה אחת.',
    processStep: 'שלב ישיר: לחיצה על שמור תצוגה ➔ בחירת שם ➔ מעבר מהיר מתפריט התצוגות.',
    actionKey: 'save_view',
    badge: 'תצוגות שמורות',
    icon: 'Bookmark',
    ctaText: 'שמור תצוגה נוכחית ◀',
    tags: [
      'תצוגה שמורה', 'saved views', 'שמירת מסננים', 'עמודות שמורות', 
      'savecurrentview', 'loadview', 'deleteview', 'תצוגות מותאמות'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_generate_chart_with_gemini_ai',
    name: 'generateChartWithGeminiAI / parseChartFromPromptHeuristically',
    title: 'יצירת גרף מותאם אישית ב-AI בשפה חופשית',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'הזנת בקשה מילולית ("פילוח לקוחות לפי ערים") והמרתה לגרף חי ב-BI.',
    processStep: 'שלב ישיר: הקלדת שאלה חופשית ➔ פענוח סוג הגרף ➔ הצגת הגרף בלוח.',
    actionKey: 'create_ai_chart',
    badge: 'גרף AI',
    icon: 'BarChart3',
    ctaText: 'צור גרף מילולי ב-AI ◀',
    tags: [
      'גרף ai', 'יצירת גרף', 'פילוח גרפי', 'גרף עוגה', 'גרף עמודות', 
      'gemini charts', 'generatechartwithgeminiai', 'שפה טבעית'
    ],
    targetLayout: 'spotlight_stage',
  },
  {
    id: 'fn_compute_chart_series',
    name: 'computeChartSeries / saveCustomChart / deleteCustomChart',
    title: 'חישוב מדדים ושמירת גרפים בלוח הבקרה',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'אגרגציה מתמטית לפי סכום כספי או כמות רשומות, ושמירה קבועה בלוח הטננט.',
    processStep: 'שלב ישיר: חישוב סדרות הנתונים ➔ נעיצה בלוח הבקרה הראשי.',
    actionKey: 'manage_custom_charts',
    badge: 'לוח מדדים',
    icon: 'PieChart',
    ctaText: 'נעץ גרף בלוח הבקרה ◀',
    tags: [
      'חישוב מדדים', 'אגרגציה', 'שמירת גרף', 'לוח מדדים', 
      'computechartseries', 'savecustomchart', 'הכנסות גרפיות'
    ],
    targetLayout: 'bento_asymmetric',
  },
  {
    id: 'fn_rank_contacts_dynamically',
    name: 'rankContactsDynamically / boostCrmEntityImportance',
    title: 'דירוג חשיבות לקוחות והקפצת הזדמנויות',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'חישוב ציון משוקלל לכל לקוח לפי שימוש והכנסות, והקפצה לראש סדר העדיפויות.',
    processStep: 'שלב ישיר: חישוב אלגוריתמי של ציון מעורבות ➔ הקפצת לידים חמים לראש.',
    actionKey: 'rank_contacts',
    badge: 'דירוג חכם',
    icon: 'TrendingUp',
    ctaText: 'דרג חשיבות לקוחות ◀',
    tags: [
      'דירוג לקוחות', 'ציון חשיבות', 'הקפצת לידים', 'rankcontactsdynamically', 
      'boostcrmentityimportance', 'אלגוריתם עדיפות'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_fetch_tenant_recent_revenues_on_demand',
    name: 'fetchTenantRecentRevenuesOnDemand',
    title: 'שליפת 4 נתוני הכנסות אחרונות (Revenues On-Demand)',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'משיכה מהירה מהשרת של 4 העסקאות האחרונות בטננט לצורך ניתוח מגמות.',
    processStep: 'בכרטיסיות: לחיצה על כרטיס הכנסות ➔ הצגת 4 העסקאות האחרונות.',
    actionKey: 'open_recent_revenues',
    badge: 'הכנסות אחרונות',
    icon: 'DollarSign',
    ctaText: 'הצג 4 עסקאות אחרונות ◀',
    tags: [
      'הכנסות', 'עסקאות אחרונות', 'כסף', 'תקבולים אחרונים', 
      'fetchtenantrecentrevenuesondemand', 'מגמת הכנסות'
    ],
    targetLayout: 'bento_asymmetric',
  },
  {
    id: 'fn_fetch_tenant_leads_requiring_care_on_demand',
    name: 'fetchTenantLeadsRequiringCareOnDemand',
    title: 'איתור 4 לידים חמים הממתינים למענה',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'שליפה ממוקדת של 4 לידים הדורשים טיפול מיידי על בסיס זמן פנייה וחום.',
    processStep: 'בכרטיסיות: לחיצה על כרטיס לידים ➔ שליפת 4 המתעניינים הדחופים ביותר.',
    actionKey: 'open_leads_care',
    badge: 'לידים לטיפול',
    icon: 'Flame',
    ctaText: 'שלוף 4 לידים דחופים ◀',
    tags: [
      'לידים לטיפול', 'לידים חמים', 'מענה דחוף', 'טיפול בלידים', 
      'fetchtenantleadsrequiringcareondemand', 'מתעניינים פתוחים'
    ],
    targetLayout: 'spotlight_stage',
  },
  {
    id: 'fn_query_advisor_cards_on_demand',
    name: 'queryAdvisorCardsOnDemand / executeTenantBulkTagActionOnDemand',
    title: 'היועץ החכם: פריסת 4 כרטיסים לפעולה מיידית',
    category: 'analytics_bi',
    categoryLabel: 'תחקור, גרפים ו-BI',
    summary: 'מענה שפה טבעית, התאמה לפונקציית הקוד המדויקת ושיגור פעולות ישירות מהכרטיס.',
    processStep: 'בשיחה עם היועץ: הקלדה או דיבור ➔ פריסת 4 כרטיסיות ממוקדות לפעולה.',
    actionKey: 'query_advisor',
    badge: 'יועץ עליון',
    icon: 'Brain',
    ctaText: 'הפעל יועץ חכם ◀',
    tags: [
      'יועץ חכם', 'יועץ עליון', 'queryadvisorcardsondemand', '4 כרטיסים', 
      'תובנות יועץ', 'בינה מלאכותית', 'המלצות לפעולה'
    ],
    targetLayout: 'accordion_morph',
  },
];

/**
 * פונקציית התאמה חכמה:
 * מקבלת שאילתת טקסט מהמשתמש ומחזירה בדיוק את 4 הפונקציות המתאימות ביותר
 * מתוך הקולקציה, ממוינות לפי ציון רלוונטיות (Relevance Score) יורד.
 */
export function matchCrmFunctionsForAdvisor(
  queryText: string
): Array<{ item: CrmFunctionItem; score: number; matchReasons: string[] }> {
  const clean = (queryText || '').trim().toLowerCase();
  if (!clean) {
    // ברירת מחדל אם אין שאילתא: מחזירים את 4 פונקציות המפתח הפופולריות ביותר
    const defaultIds = [
      'fn_parse_excel_workbook',
      'fn_parse_business_card_image',
      'fn_merge_duplicate_contacts_in_db',
      'fn_fetch_tenant_leads_requiring_care_on_demand',
    ];
    return defaultIds
      .map((id) => KOS_CRM_FUNCTIONS_COLLECTION.find((f) => f.id === id)!)
      .filter(Boolean)
      .map((item) => ({ item, score: 90, matchReasons: ['ברירת מחדל מומלצת'] }));
  }

  // פירוק מילות מפתח מהשאילתא
  const queryTokens = clean.split(/[\s,._\-+/]+/).filter((t) => t.length > 1);

  const scored = KOS_CRM_FUNCTIONS_COLLECTION.map((fn) => {
    let score = 0;
    const reasons: string[] = [];

    const lowerName = fn.name.toLowerCase();
    const lowerTitle = fn.title.toLowerCase();
    const lowerSummary = fn.summary.toLowerCase();

    // 1. התאמה מדויקת לשם הפונקציה באנגלית או עברית
    if (lowerName.includes(clean) || clean.includes(lowerName)) {
      score += 60;
      reasons.push('התאמת שם פונקציה');
    }
    if (lowerTitle.includes(clean) || clean.includes(lowerTitle)) {
      score += 50;
      reasons.push('התאמת כותרת מדויקת');
    }

    // 2. התאמת תגיות חכמות
    fn.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      if (clean === lowerTag) {
        score += 45;
        reasons.push(`תגית מדויקת: "${tag}"`);
      } else if (clean.includes(lowerTag) || lowerTag.includes(clean)) {
        score += 30;
        reasons.push(`תגית: "${tag}"`);
      } else {
        // התאמת טוקנים
        queryTokens.forEach((token) => {
          if (lowerTag.includes(token)) {
            score += 15;
            reasons.push(`מילת מפתח: "${token}"`);
          }
        });
      }
    });

    // 3. התאמת שורת סיכום
    queryTokens.forEach((token) => {
      if (lowerSummary.includes(token)) {
        score += 8;
      }
      if (lowerTitle.includes(token)) {
        score += 12;
      }
    });

    return {
      item: fn,
      score,
      matchReasons: Array.from(new Set(reasons)),
    };
  });

  // מיון יורד לפי ציון
  scored.sort((a, b) => b.score - a.score);

  // החזרת בדיוק 4 הראשונות
  return scored.slice(0, 4);
}
