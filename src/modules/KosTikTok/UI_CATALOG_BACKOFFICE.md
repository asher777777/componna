<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): פרסום סרטונים ולידים מטיקטוק (KosTikTok)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosTikTok](file:///c:/comona/src/modules/KosTikTok)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של פרסום סרטונים ולידים מטיקטוק (KosTikTok).
* **קבצים שנסרקו בשכבה זו (20):** [functionsApi.ts](file:///c:/comona/src/modules/KosTikTok/api/functionsApi.ts), [index.ts](file:///c:/comona/src/modules/KosTikTok/api/index.ts), [index.ts](file:///c:/comona/src/modules/KosTikTok/components/index.ts), [KosTikTokAccountModal.tsx](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx), [KosTikTokEventsTab.tsx](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx), [KosTikTokLeadsTab.tsx](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokLeadsTab.tsx), [KosTikTokPublishModal.tsx](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx), [KosTikTokSettingsTab.tsx](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx), [index.ts](file:///c:/comona/src/modules/KosTikTok/config/index.ts), [index.ts](file:///c:/comona/src/modules/KosTikTok/context/index.ts), [TikTokContext.tsx](file:///c:/comona/src/modules/KosTikTok/context/TikTokContext.tsx), [index.ts](file:///c:/comona/src/modules/KosTikTok/hooks/index.ts), [useTikTok.ts](file:///c:/comona/src/modules/KosTikTok/hooks/useTikTok.ts), [index.ts](file:///c:/comona/src/modules/KosTikTok/index.ts), [index.ts](file:///c:/comona/src/modules/KosTikTok/routes/index.ts), [TikTokRoutes.tsx](file:///c:/comona/src/modules/KosTikTok/routes/TikTokRoutes.tsx), [index.ts](file:///c:/comona/src/modules/KosTikTok/services/index.ts), [kosTikTokFirestore.ts](file:///c:/comona/src/modules/KosTikTok/services/kosTikTokFirestore.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosTikTok/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 60 (אזורים/אקורדיונים: 0, כותרות: 17, פילטרים/טאבים: 10, פלייסהולדרים: 3, כפתורי CTA: 16, תוויות: 14)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (17)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **טיפ מנצח לקידום קמפיינים ממומנים ב-2026 🚀** | רכיב (functionsApi) | [functionsApi.ts#L137](file:///c:/comona/src/modules/KosTikTok/api/functionsApi.ts#L137) | כותרת ראשית של האזור / הכרטיס |
| **איך לבנות דף נחיתה שממיר ב-40% יותר?** | רכיב (functionsApi) | [functionsApi.ts#L151](file:///c:/comona/src/modules/KosTikTok/api/functionsApi.ts#L151) | כותרת ראשית של האזור / הכרטיס |
| **חיבור חשבון TikTok חדש** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L21](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L21) | כותרת ראשית של האזור / הכרטיס |
| **הזדהות OAuth 2.0 מאובטחת לסנכרון פרופיל, העלאת סרטונים וקליטת לידים** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L22](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L22) | כותרת משנה של האזור / המודאל |
| **אימות מאובטח (OAuth 2.0 PKCE)** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L30](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L30) | כותרת תצוגה (H3) במודאל (KosTikTokAccountModal) |
| **הרשאות שיתבקשו מהמשתמש** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L53](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L53) | כותרת תצוגה (H4) במודאל (KosTikTokAccountModal) |
| **אירועי המרה - TikTok Events API v1.3** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L42](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L42) | כותרת תצוגה (H2) בלשונית תוכן (KosTikTokEventsTab) |
| **בדיקת שליחת אירוע המרה (Test Event)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L53](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L53) | כותרת תצוגה (H3) בלשונית תוכן (KosTikTokEventsTab) |
| **אבטחה ו-Deduplication** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L118](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L118) | כותרת תצוגה (H3) בלשונית תוכן (KosTikTokEventsTab) |
| **לידים מקמפיינים ממומנים ב-TikTok** | לשונית תוכן (KosTikTokLeadsTab) | [KosTikTokLeadsTab.tsx#L13](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokLeadsTab.tsx#L13) | כותרת תצוגה (H2) בלשונית תוכן (KosTikTokLeadsTab) |
| **אין עדיין לידים בטננט זה** | לשונית תוכן (KosTikTokLeadsTab) | [KosTikTokLeadsTab.tsx#L36](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokLeadsTab.tsx#L36) | כותרת תצוגה (H3) בלשונית תוכן (KosTikTokLeadsTab) |
| **פרסום סרטון חדש ל-TikTok** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L39](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L39) | כותרת ראשית של האזור / הכרטיס |
| **מפרסם לחשבון: {activeAccount?.displayName** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L40](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L40) | כותרת משנה של האזור / המודאל |
| **הגדרות אינטגרציית TikTok** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L21](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L21) | כותרת תצוגה (H2) בלשונית תוכן (KosTikTokSettingsTab) |
| **חשבונות מחוברים בטננט זה** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L105](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L105) | כותרת תצוגה (H3) בלשונית תוכן (KosTikTokSettingsTab) |
| **נתק חשבון** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L153](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L153) | כותרת ראשית של האזור / הכרטיס |
| **כתובות להגדרה ב-TikTok Developer Portal** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L167](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L167) | כותרת תצוגה (H3) בלשונית תוכן (KosTikTokSettingsTab) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **רכישה הושלמה (CompletePayment)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L64](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L64) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ליד חדש (Lead)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L65](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L65) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הוספה לסל (AddToCart)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L66](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L66) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **התחלת תשלום (InitiateCheckout)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L67](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L67) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **צפייה בתוכן (ViewContent)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L68](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L68) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סקירה כללית** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L38](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L38) | שם טאב ניווט או כפתור סינון |
| **סרטונים ופרסום** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L39](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L39) | שם טאב ניווט או כפתור סינון |
| **לידים מטפסים** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L40](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L40) | שם טאב ניווט או כפתור סינון |
| **מעקב המרות (API)** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L41](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L41) | שם טאב ניווט או כפתור סינון |
| **הגדרות וחיבור** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L42](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L42) | שם טאב ניווט או כפתור סינון |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הזן Client Key או לחץ על חיבור מהיר** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L46](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L46) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://storage.googleapis.com/.../video.mp4** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L55](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L55) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתוב תיאור מושך לסרטון הטיקטוק שלך... #fyp #marketing** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L74](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L74) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (16)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ביטול** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L71](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L71) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מתחבר לטיקטוק... / התחבר לחשבון TikTok** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L78](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L78) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שלח אירוע המרה ל-TikTok** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L92](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L92) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **רענן לידים** | לשונית תוכן (KosTikTokLeadsTab) | [KosTikTokLeadsTab.tsx#L19](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokLeadsTab.tsx#L19) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ציבורי לכולם גלוי לכל משתמשי טיקטוק** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L86](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L86) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חברים בלבד רק עוקבים הדדיים** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L102](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L102) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פרטי בלבד גלוי אך ורק ליוצר** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L118](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L118) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L173](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L173) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שולח ומפרסם ב-TikTok... / פרסם סרטון ל-TikTok** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L180](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L180) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חבר חשבון TikTok נוסף** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L27](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L27) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ערוך מפתחות בהגדרות מערכת (Master)** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L69](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L69) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הגדר כפעיל** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L143](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L143) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] נתק חשבון** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L150](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L150) | נתק חשבון |
| **חבר חשבון** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L68](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L68) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פרסם סרטון ל-TikTok** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L78](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L78) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הבנתי** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L99](file:///c:/comona/src/modules/KosTikTok/StandaloneView.tsx#L99) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (14)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **מפתח לקוח TikTok (Client Key) - אופציונלי לבדיקות Staging** | מודאל (KosTikTokAccountModal) | [KosTikTokAccountModal.tsx#L38](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokAccountModal.tsx#L38) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם האירוע (Standard Event)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L58](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L58) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שווי העסקה (ILS)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L73](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L73) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אימייל לקוח (מוצפן SHA-256 בשליחה)** | לשונית תוכן (KosTikTokEventsTab) | [KosTikTokEventsTab.tsx#L83](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokEventsTab.tsx#L83) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קישור לקובץ הווידאו (MP4 / H.264)** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L46](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L46) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת הסרטון ותיאור (כולל האשטאגים)** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L63](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L63) | תווית שדה קלט בטופס או בפאנל העריכה |
| **רמת פרטיות לפרסום** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L81](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L81) | תווית שדה קלט בטופס או בפאנל העריכה |
| **חסום תגובות לסרטון זה** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L141](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L141) | תווית טקסט / חיווי מצב בממשק |
| **חסום דואטים (Duet)** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L151](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L151) | תווית טקסט / חיווי מצב בממשק |
| **חסום סטיץ' (Stitch)** | מודאל (KosTikTokPublishModal) | [KosTikTokPublishModal.tsx#L161](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokPublishModal.tsx#L161) | תווית טקסט / חיווי מצב בממשק |
| **מפתחות מאסטר פלטפורמה (Master Platform Keys)** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L52](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L52) | תווית טקסט / חיווי מצב בממשק |
| **סנכרון סאב-דומיינים** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L94](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L94) | תווית טקסט / חיווי מצב בממשק |
| **ירושה אוטומטית מ-Master** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L97](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L97) | תווית טקסט / חיווי מצב בממשק |
| **אין חשבונות מחוברים כרגע.** | לשונית תוכן (KosTikTokSettingsTab) | [KosTikTokSettingsTab.tsx#L108](file:///c:/comona/src/modules/KosTikTok/components/KosTikTokSettingsTab.tsx#L108) | תווית טקסט / חיווי מצב בממשק |

</div>
