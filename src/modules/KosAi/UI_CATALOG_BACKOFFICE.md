<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): מנוע הבינה המלאכותית המרכזי (kosai-engine)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosAi](file:///c:/comona/src/modules/KosAi)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של מנוע הבינה המלאכותית המרכזי (kosai-engine).
* **קבצים שנסרקו בשכבה זו (26):** [kosaiApi.ts](file:///c:/comona/src/modules/KosAi/api/kosaiApi.ts), [KosaiSettingsBackoffice.tsx](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx), [index.ts](file:///c:/comona/src/modules/KosAi/config/index.ts), [kosaiModules.ts](file:///c:/comona/src/modules/KosAi/config/kosaiModules.ts), [kosaiTemplates.ts](file:///c:/comona/src/modules/KosAi/config/kosaiTemplates.ts), [moduleAgents.ts](file:///c:/comona/src/modules/KosAi/config/moduleAgents.ts), [KosaiContext.tsx](file:///c:/comona/src/modules/KosAi/context/KosaiContext.tsx), [index.ts](file:///c:/comona/src/modules/KosAi/index.ts), [brandAiContract.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/brandAiContract.ts), [circuitBreaker.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/circuitBreaker.ts), [crmAiContract.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/crmAiContract.ts), [emailAiContract.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/emailAiContract.ts), [executeKosaiAi.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/executeKosaiAi.ts), [index.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/index.ts), [kosTubeAiContract.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/kosTubeAiContract.ts), [togetherAiContract.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/togetherAiContract.ts), [types.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/types.ts), [webAiContract.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/webAiContract.ts), [whatsUpAiContract.ts](file:///c:/comona/src/modules/KosAi/modelsAiService/whatsUpAiContract.ts), [index.ts](file:///c:/comona/src/modules/KosAi/prompts/index.ts), [kosaiContactAutoSyncService.ts](file:///c:/comona/src/modules/KosAi/services/kosaiContactAutoSyncService.ts), [kosaiDataGroundingService.ts](file:///c:/comona/src/modules/KosAi/services/kosaiDataGroundingService.ts), [kosaiFirestoreService.ts](file:///c:/comona/src/modules/KosAi/services/kosaiFirestoreService.ts), [kosaiImageAgentService.ts](file:///c:/comona/src/modules/KosAi/services/kosaiImageAgentService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosAi/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosAi/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 79 (אזורים/אקורדיונים: 0, כותרות: 9, פילטרים/טאבים: 7, פלייסהולדרים: 4, כפתורי CTA: 18, תוויות: 41)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (9)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **מידע נוסף** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L65](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L65) | כותרת ראשית של האזור / הכרטיס |
| **חזרה לכל צוות הסוכנים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L407](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L407) | כותרת ראשית של האזור / הכרטיס |
| **סגור וחזור לצ** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L449](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L449) | כותרת ראשית של האזור / הכרטיס |
| **סגור חלון** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L916](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L916) | כותרת ראשית של האזור / הכרטיס |
| **)?.replace(/^סוכן\s*/,** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1056](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1056) | כותרת תצוגה (H3) ברכיב (KosaiSettingsBackoffice) |
| **KOSAI פעיל - לחץ להשהיה** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1073](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1073) | כותרת ראשית של האזור / הכרטיס |
| **מחק סוכן** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1133](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1133) | כותרת ראשית של האזור / הכרטיס |
| **לא נמצאו סוכנים תואמים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1148](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1148) | כותרת תצוגה (H2) ברכיב (KosaiSettingsBackoffice) |
| **עמוד** | רכיב (KosaiContext) | [KosaiContext.tsx#L140](file:///c:/comona/src/modules/KosAi/context/KosaiContext.tsx#L140) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (7)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **-- בחר רכיב מערכת משויך --** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L499](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L499) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תבניות AI מוכנות מראש...** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L639](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L639) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סוכנים פעילים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L942](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L942) | שם טאב ניווט או כפתור סינון |
| **מודולים שנרכשו** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L943](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L943) | שם טאב ניווט או כפתור סינון |
| **טוקנים החודש** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L944](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L944) | שם טאב ניווט או כפתור סינון |
| **עלות AI משוערת** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L945](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L945) | שם טאב ניווט או כפתור סינון |
| **כל המודולים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1010](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1010) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (4)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **למשל: סוכן CRM וניתוח לקוחות** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L480](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L480) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הסבר במילים פשוטות ל-Kosun איזה סוג סוכן אתה צריך שיהיה, או בחר תבנית...** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L650](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L650) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הוסף מילת מפתח להפעלת הסוכן (למשל: מחיר, עזרה, ליד)...** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L767](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L767) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש סוכן לפי שם או שיוך...** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L967](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L967) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (18)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **לכל הסוכנים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L403](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L403) | חזרה לכל צוות הסוכנים |
| **סוכן פעיל / סוכן מושהה** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L430](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L430) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] סגור וחזור לצ** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L445](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L445) | סגור וחזור לצ |
| **נסח לי פרומפט בעזרת AI** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L653](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L653) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף מילה** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L787](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L787) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מחק סוכן** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L842](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L842) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמירה וחזרה לצ'אט** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L859](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L859) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סוכן חדש** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L903](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L903) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] סגור חלון** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L912](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L912) | סגור חלון |
| **הסתר נתונים סטטיסטיים / הצג נתוני צריכה ועלויות AI** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L929](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L929) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הכל ()** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L982](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L982) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פעילים ()** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L989](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L989) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מושהים ()** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L996](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L996) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ערוך הגדרות סוכן** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1113](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1113) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] מחק סוכן** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1126](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1126) | מחק סוכן |
| **הוסף סוכן עכשיו** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1152](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1152) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פרטים נוספים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L260](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L260) | כפתור הנעה לפעולה (buttonText) |
| **שיחה עם נציג** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L261](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L261) | כפתור הנעה לפעולה (buttonText) |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (41)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הוספת אזורים ועיצובים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L31](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L31) | תווית זיהוי לשדה או מדד |
| **עריכת תוכן וסקשנים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L32](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L32) | תווית זיהוי לשדה או מדד |
| **הגדרות עיצוב ומיתוג** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L33](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L33) | תווית זיהוי לשדה או מדד |
| **הגדרות קידום ו-SEO** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L34](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L34) | תווית זיהוי לשדה או מדד |
| **יצירת גרפים ב-CRM** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L35](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L35) | תווית זיהוי לשדה או מדד |
| **הסרת תגיות גורפת** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L36](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L36) | תווית זיהוי לשדה או מדד |
| **כתיבת קוד** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L37](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L37) | תווית זיהוי לשדה או מדד |
| **קריאת מסמכים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L38](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L38) | תווית זיהוי לשדה או מדד |
| **חיפוש ברשת** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L39](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L39) | תווית זיהוי לשדה או מדד |
| **יצירת תמונות** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L40](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L40) | תווית זיהוי לשדה או מדד |
| **עריכת וידאו** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L41](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L41) | תווית זיהוי לשדה או מדד |
| **מחקר במאגרים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L42](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L42) | תווית זיהוי לשדה או מדד |
| **אוטומציית וואטסאפ** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L43](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L43) | תווית זיהוי לשדה או מדד |
| **אתרים ודפי נחיתה** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L53](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L53) | תווית זיהוי לשדה או מדד |
| **טפסים ושאלונים** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L54](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L54) | תווית זיהוי לשדה או מדד |
| **מאגר לקוחות (CRM)** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L55](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L55) | תווית זיהוי לשדה או מדד |
| **קהילות וקבוצות CRM** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L56](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L56) | תווית זיהוי לשדה או מדד |
| **שיחות וואטסאפ** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L57](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L57) | תווית זיהוי לשדה או מדד |
| **ספריית מדיה** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L58](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L58) | תווית זיהוי לשדה או מדד |
| **עסקאות והכנסות** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L59](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L59) | תווית זיהוי לשדה או מדד |
| **הגדרות מותג** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L60](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L60) | תווית זיהוי לשדה או מדד |
| **סרטי וידאו** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L61](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L61) | תווית זיהוי לשדה או מדד |
| **טוען את הגדרות הסוכן של קושאן...** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L378](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L378) | תווית טקסט / חיווי מצב בממשק |
| **סגירה** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L450](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L450) | תווית זיהוי לשדה או מדד |
| **הגדרת זיהוי במערכת** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L469](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L469) | תווית טקסט / חיווי מצב בממשק |
| **שם הסוכן** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L474](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L474) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שיוך לרכיב מערכת (Module)** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L487](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L487) | תווית שדה קלט בטופס או בפאנל העריכה |
| **יכולות ביצוע מורשות (Capabilities)** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L515](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L515) | תווית טקסט / חיווי מצב בממשק |
| **מאגרי מידע מחוברים (Data Sources)** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L572](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L572) | תווית טקסט / חיווי מצב בממשק |
| **הנחיות ייעודיות ופרומפט סוכן** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L630](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L630) | תווית טקסט / חיווי מצב בממשק |
| **סגנון שיחה והתנסחות** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L669](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L669) | תווית טקסט / חיווי מצב בממשק |
| **חברי וקליל** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L677](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L677) | תווית טקסט / חיווי מצב בממשק |
| **רשמי ומקצועי** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L679](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L679) | תווית טקסט / חיווי מצב בממשק |
| **קצר וממוקד** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L692](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L692) | תווית טקסט / חיווי מצב בממשק |
| **מפורט ומעמיק** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L694](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L694) | תווית טקסט / חיווי מצב בממשק |
| **סולידי ומדויק** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L707](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L707) | תווית טקסט / חיווי מצב בממשק |
| **יצירתי ונועז** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L709](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L709) | תווית טקסט / חיווי מצב בממשק |
| **הפעלת סוכן בוואטסאפ (Green API)** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L730](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L730) | תווית טקסט / חיווי מצב בממשק |
| **אינטגרציה ישירה לשירות לקוחות ומכירות** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L733](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L733) | תווית טקסט / חיווי מצב בממשק |
| **חיבור לוואטסאפ:** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L738](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L738) | תווית קבוצת פקדים בעורך / בממשק |
| **וואטסאפ פעיל** | רכיב (KosaiSettingsBackoffice) | [KosaiSettingsBackoffice.tsx#L1107](file:///c:/comona/src/modules/KosAi/components/KosaiSettingsBackoffice.tsx#L1107) | תווית טקסט / חיווי מצב בממשק |

</div>
