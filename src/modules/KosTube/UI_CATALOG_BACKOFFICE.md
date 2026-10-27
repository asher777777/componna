<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): חיבור יוטיוב וקידום וידאו (KosTube)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosTube](file:///c:/comona/src/modules/KosTube)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של חיבור יוטיוב וקידום וידאו (KosTube).
* **קבצים שנסרקו בשכבה זו (25):** [functionsApi.ts](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts), [index.ts](file:///c:/comona/src/modules/KosTube/api/index.ts), [index.ts](file:///c:/comona/src/modules/KosTube/components/index.ts), [KosTubeAddVideoModal.tsx](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx), [KosTubeChannelModal.tsx](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx), [KosTubeContentReviewModal.tsx](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx), [KosTubeFullscreenModal.tsx](file:///c:/comona/src/modules/KosTube/components/KosTubeFullscreenModal.tsx), [KosTubeGenerationCurtain.tsx](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationCurtain.tsx), [KosTubeGenerationModal.tsx](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx), [KosTubeSettingsTab.tsx](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx), [index.ts](file:///c:/comona/src/modules/KosTube/config/index.ts), [index.ts](file:///c:/comona/src/modules/KosTube/context/index.ts), [KosTubeContext.tsx](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx), [index.ts](file:///c:/comona/src/modules/KosTube/hooks/index.ts), [useKosTubeData.ts](file:///c:/comona/src/modules/KosTube/hooks/useKosTubeData.ts), [index.ts](file:///c:/comona/src/modules/KosTube/index.ts), [promptToKosai.ts](file:///c:/comona/src/modules/KosTube/kosai/promptToKosai.ts), [index.ts](file:///c:/comona/src/modules/KosTube/prompts/index.ts), [index.ts](file:///c:/comona/src/modules/KosTube/routes/index.ts), [KosTubeRoutes.tsx](file:///c:/comona/src/modules/KosTube/routes/KosTubeRoutes.tsx), [index.ts](file:///c:/comona/src/modules/KosTube/services/index.ts), [kosTubeFirestore.ts](file:///c:/comona/src/modules/KosTube/services/kosTubeFirestore.ts), [kosTubePageSyncService.ts](file:///c:/comona/src/modules/KosTube/services/kosTubePageSyncService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosTube/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 142 (אזורים/אקורדיונים: 0, כותרות: 44, פילטרים/טאבים: 10, פלייסהולדרים: 12, כפתורי CTA: 34, תוויות: 42)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (44)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **רוצים לקחת את התוצאות צעד קדימה עם ?** | רכיב (functionsApi) | [functionsApi.ts#L354](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L354) | כותרת ראשית של האזור / הכרטיס |
| **פנו אלינו ונשמח לסייע לכם להגיע ליעדים העסקיים שלכם** | רכיב (functionsApi) | [functionsApi.ts#L355](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L355) | כותרת משנה של האזור / המודאל |
| **סרטון יוטיוב ()** | רכיב (functionsApi) | [functionsApi.ts#L409](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L409) | כותרת ראשית של האזור / הכרטיס |
| **כלים מעשיים לשליטה ויישום** | רכיב (functionsApi) | [functionsApi.ts#L622](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L622) | כותרת ראשית של האזור / הכרטיס |
| **דיוק ומיקוד בעבודת הנפש** | רכיב (functionsApi) | [functionsApi.ts#L627](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L627) | כותרת ראשית של האזור / הכרטיס |
| **מעטפת מקצועית וחיבור ל-** | רכיב (functionsApi) | [functionsApi.ts#L632](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L632) | כותרת ראשית של האזור / הכרטיס |
| **הוספת סרטון יוטיוב ישירות (בקישור)** | מודאל (KosTubeAddVideoModal) | [KosTubeAddVideoModal.tsx#L35](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx#L35) | כותרת ראשית של האזור / הכרטיס |
| **הזן קישור ישיר לכל סרטון יוטיוב אמיתי כדי למשוך את פרטיו ולהפיק עבורו עמוד SEO מקודם** | מודאל (KosTubeAddVideoModal) | [KosTubeAddVideoModal.tsx#L36](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx#L36) | כותרת משנה של האזור / המודאל |
| **הוספת סרטון אמיתי מיוטיוב** | מודאל (KosTubeAddVideoModal) | [KosTubeAddVideoModal.tsx#L43](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx#L43) | כותרת תצוגה (H3) במודאל (KosTubeAddVideoModal) |
| **חיבור וסנכרון ערוץ יוטיוב** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L25](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L25) | כותרת ראשית של האזור / הכרטיס |
| **חיבור ערוץ יוטיוב ל-KosTube** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L32](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L32) | כותרת תצוגה (H2) במודאל (KosTubeChannelModal) |
| **עיקרון מנחה חדש** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L333](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L333) | כותרת ראשית של האזור / הכרטיס |
| **סקירת תוכן, עריכה ושכתוב AI לפני פריסה ב-KWB** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L535](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L535) | כותרת ראשית של האזור / הכרטיס |
| **התאם אייקונים, שכתב תכנים ב-AI והשלם טקסטים חסרים לפני הפצת עמוד ה-KOSVIDIO לאוויר** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L536](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L536) | כותרת משנה של האזור / המודאל |
| **סורק את כל השדות וממלא אוטומטית ב-AI רק את מה שחסר, מבלי לדרוס עריכות קיימות** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L566](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L566) | כותרת ראשית של האזור / הכרטיס |
| **משכתב מחדש את כל התכנים בהתאמה מלאה לשפת המותג והסלוגן של הטננט** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L581](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L581) | כותרת ראשית של האזור / הכרטיס |
| **שכתב כותרת ראשית ב-AI לפי שפת המותג** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L705](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L705) | כותרת ראשית של האזור / הכרטיס |
| **שכתב כותרת ותיאור מטא ל-SEO באמצעות AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L758](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L758) | כותרת ראשית של האזור / הכרטיס |
| **שכתב תמצית מנהלים ב-AI בשפת המותג** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L843](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L843) | כותרת ראשית של האזור / הכרטיס |
| **בחר אייקון לתובנה** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L911](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L911) | כותרת ראשית של האזור / הכרטיס |
| **שכתב תובנה זו ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L929](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L929) | כותרת ראשית של האזור / הכרטיס |
| **מחק תובנה** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L941](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L941) | כותרת ראשית של האזור / הכרטיס |
| **שאלות ותשובות (מוזרקות לאזור ה-FAQ הייעודי ב-KWB)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L967](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L967) | כותרת תצוגה (H4) במודאל (KosTubeContentReviewModal) |
| **שכתב שאלה ותשובה זו ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1008](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1008) | כותרת ראשית של האזור / הכרטיס |
| **מחק שאלה** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1020](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1020) | כותרת ראשית של האזור / הכרטיס |
| **אזור הנעה לפעולה (CTA Section ב-KWB)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1051](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1051) | כותרת תצוגה (H4) במודאל (KosTubeContentReviewModal) |
| **שכתב את כל רכיבי ה-CTA ב-AI לפי המותג** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1060](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1060) | כותרת ראשית של האזור / הכרטיס |
| **סגור חלון** | מודאל (KosTubeFullscreenModal) | [KosTubeFullscreenModal.tsx#L52](file:///c:/comona/src/modules/KosTube/components/KosTubeFullscreenModal.tsx#L52) | כותרת ראשית של האזור / הכרטיס |
| **הגדרות הפקת עמוד SEO ב-AI** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L47](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L47) | כותרת ראשית של האזור / הכרטיס |
| **בחר את מצב העלות, שילוב המיתוג ומקור התוכן לעמוד ה-Kosvidio שלך** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L48](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L48) | כותרת משנה של האזור / המודאל |
| **הגדרות חיבור ערוץ יוטיוב ו-SEO** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L96](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L96) | כותרת תצוגה (H3) בלשונית תוכן (KosTubeSettingsTab) |
| **אודות וניתוח תוכן מקצועי** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L506](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L506) | כותרת ראשית של האזור / הכרטיס |
| **תובנות מרכזיות ונקודות מפתח** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L519](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L519) | כותרת ראשית של האזור / הכרטיס |
| **עיקרי הדברים והמסקנות החשובות מתוך הסרטון** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L520](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L520) | כותרת משנה של האזור / המודאל |
| **שאלות ותשובות נפוצות** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L547](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L547) | כותרת ראשית של האזור / הכרטיס |
| **תובנות מעמיקות ובירורים מתוך הסרטון** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L548](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L548) | כותרת משנה של האזור / המודאל |
| **ספריית סרטוני הערוץ** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L578](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L578) | כותרת ראשית של האזור / הכרטיס |
| **רוצים תוצאות דומות עם ?** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L624](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L624) | כותרת ראשית של האזור / הכרטיס |
| **השאירו פרטים ונשמח לסייע** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L625](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L625) | כותרת משנה של האזור / המודאל |
| **תובנה** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L778](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L778) | כותרת ראשית של האזור / הכרטיס |
| **קושאן** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L891](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L891) | כותרת משנה של האזור / המודאל |
| **רוצים תוצאות דומות עם {brandDna?.identity?.companyName** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L987](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L987) | כותרת ראשית של האזור / הכרטיס |
| **אינטראקציה, שיתוף ותגובות** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L998](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L998) | כותרת ראשית של האזור / הכרטיס |
| **סרטונים נוספים מהערוץ** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L1059](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L1059) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **עקרון הליבה של** | רכיב (functionsApi) | [functionsApi.ts#L617](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L617) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **1. כותרת ו-SEO** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L642](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L642) | סינון נתונים / בחירת תצוגה או סגנון |
| **2. תמצית ותובנות ()** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L655](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L655) | סינון נתונים / בחירת תצוגה או סגנון |
| **3. שאלות ותשובות ()** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L668](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L668) | סינון נתונים / בחירת תצוגה או סגנון |
| **4. הנעה לפעולה (CTA)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L681](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L681) | סינון נתונים / בחירת תצוגה או סגנון |
| **עיקרון מנחה חדש** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L457](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L457) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **סקירה כללית** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L45](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx#L45) | שם טאב ניווט או כפתור סינון |
| **סרטונים בערוץ** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L46](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx#L46) | שם טאב ניווט או כפתור סינון |
| **עמודי SEO** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L47](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx#L47) | שם טאב ניווט או כפתור סינון |
| **הגדרות** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L48](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx#L48) | שם טאב ניווט או כפתור סינון |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **https://www.youtube.com/watch?v=... או https://youtu.be/...** | מודאל (KosTubeAddVideoModal) | [KosTubeAddVideoModal.tsx#L58](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx#L58) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://youtube.com/@channelName או @MyChannel** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L49](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L49) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **AIzaSy... (הזן כאן מפתח Master ראשי)** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L88](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L88) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **e.g. struggles-self-control-tanya** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L739](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L739) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הוסף תגית...** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L796](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L796) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כותרת סוחפת לתובנה (לפי שפת המותג)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L918](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L918) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הסבר מעשי ותמציתי של התובנה...** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L951](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L951) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הזן שאלה...** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1029](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1029) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הזן תשובה מפורטת...** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1036](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1036) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הדבק כאן תמלול של הסרטון, נקודות מפתח או טקסט תוכן חלופי...** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L208](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L208) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לדוגמה: @MyChannelName או https://youtube.com/@channel** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L115](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L115) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **AIzaSy...** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L147](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L147) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (34)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **צרו קשר עכשיו** | רכיב (functionsApi) | [functionsApi.ts#L356](file:///c:/comona/src/modules/KosTube/api/functionsApi.ts#L356) | כפתור הנעה לפעולה (buttonText) |
| **רוצה להוסיף סרטון בקישור ללא מפתח? לחץ כאן** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L78](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L78) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **השלם טקסטים חסרים ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L562](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L562) | סורק את כל השדות וממלא אוטומטית ב-AI רק את מה שחסר, מבלי לדרוס עריכות קיימות |
| **שכתב הכל מחדש (AI)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L577](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L577) | משכתב מחדש את כל התכנים בהתאמה מלאה לשפת המותג והסלוגן של הטננט |
| **הועתק! / העתק** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L612](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L612) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שכתב כותרת ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L701](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L701) | שכתב כותרת ראשית ב-AI לפי שפת המותג |
| **שכתב מטא ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L754](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L754) | שכתב כותרת ותיאור מטא ל-SEO באמצעות AI |
| **הוסף** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L802](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L802) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שכתב תמצית ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L839](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L839) | שכתב תמצית מנהלים ב-AI בשפת המותג |
| **צור תובנה ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L873](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L873) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף ידנית** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L886](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L886) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] שכתב תובנה זו ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L924](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L924) | שכתב תובנה זו ב-AI |
| **[כפתור אייקון] מחק תובנה** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L937](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L937) | מחק תובנה |
| **צור שאלה ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L973](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L973) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] שכתב שאלה ותשובה זו ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1003](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1003) | שכתב שאלה ותשובה זו ב-AI |
| **[כפתור אייקון] מחק שאלה** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1016](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1016) | מחק שאלה |
| **שכתב CTA ב-AI** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1056](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1056) | שכתב את כל רכיבי ה-CTA ב-AI לפי המותג |
| **סיום וסגירה / ביטול** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1106](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1106) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **עדכן ופרוס מחדש ב-KWB / שמור, פרוס והפעל ב-KWB** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1114](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1114) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | מודאל (KosTubeFullscreenModal) | [KosTubeFullscreenModal.tsx#L48](file:///c:/comona/src/modules/KosTube/components/KosTubeFullscreenModal.tsx#L48) | סגור חלון |
| **מומלץ וחסכוני ⚡ חסכוני (Lite) Gemini 3.8 Flash Lite. עד 300 מילים. עלות אפסית (~0.002).** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L77](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L77) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סטנדרטי ⚖️ בינוני (Flash) Gemini 3.8 Flash. מאמר מאוזן של כ-450 מילים ועושר תוכן.** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L99](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L99) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מחקר מעמיק 🚀 עומק (Pro) Gemini 3.8 Pro. ניתוח עומק מקיף ומדעי של 700+ מילים.** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L121](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L121) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סריקת כותרת ותיאור הוידאו** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L176](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L176) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הדבקת תמלול / תוכן טקסט ישיר** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L188](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L188) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הפק עמוד Kosvidio עכשיו ב-AI** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L244](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L244) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מסנכרן... / סנכרן ערוץ זה** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L121](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L121) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר... / שמור הגדרות** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L220](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L220) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סנכרן סרטונים כעת** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L230](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L230) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **צרו קשר עכשיו** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L562](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L562) | כפתור הנעה לפעולה (buttonText) |
| **צרו קשר עכשיו** | רכיב (kosTubePageSyncService) | [kosTubePageSyncService.ts#L120](file:///c:/comona/src/modules/KosTube/services/kosTubePageSyncService.ts#L120) | כפתור הנעה לפעולה (buttonText) |
| **הוסף סרטון בקישור** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L73](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx#L73) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חבר ערוץ יוטיוב** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L86](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx#L86) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | תצוגה ראשית / אזור (StandaloneView) | [StandaloneView.tsx#L113](file:///c:/comona/src/modules/KosTube/StandaloneView.tsx#L113) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (42)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **קישור לסרטון יוטיוב (YouTube URL)** | מודאל (KosTubeAddVideoModal) | [KosTubeAddVideoModal.tsx#L51](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx#L51) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שולף נתוני סרטון אמיתיים...** | מודאל (KosTubeAddVideoModal) | [KosTubeAddVideoModal.tsx#L85](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx#L85) | תווית טקסט / חיווי מצב בממשק |
| **משוך סרטון והוסף למערכת** | מודאל (KosTubeAddVideoModal) | [KosTubeAddVideoModal.tsx#L90](file:///c:/comona/src/modules/KosTube/components/KosTubeAddVideoModal.tsx#L90) | תווית טקסט / חיווי מצב בממשק |
| **כתובת הערוץ או Handle (לדוגמה: @channelName)** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L42](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L42) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מפתח YouTube Data API v3 (הגדרת מפתח Master לכלל הטננטים)** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L75](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L75) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מסנכרן את נתוני הערוץ והסרטונים...** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L114](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L114) | תווית טקסט / חיווי מצב בממשק |
| **סנכרן וחבר ערוץ** | מודאל (KosTubeChannelModal) | [KosTubeChannelModal.tsx#L117](file:///c:/comona/src/modules/KosTube/components/KosTubeChannelModal.tsx#L117) | תווית טקסט / חיווי מצב בממשק |
| **סרטון מקור** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L547](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L547) | תווית טקסט / חיווי מצב בממשק |
| **מונה טוקנים לטננט:** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L594](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L594) | תווית קבוצת פקדים בעורך / בממשק |
| **עמוד ה-KOSVIDIO נוצר ונפרס בהצלחה ב-KWB!** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L604](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L604) | תווית טקסט / חיווי מצב בממשק |
| **העמוד זמין כעת לצפייה ציבורית בנתיב המותאם:** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L606](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L606) | תווית קבוצת פקדים בעורך / בממשק |
| **פתח עמוד** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L627](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L627) | תווית טקסט / חיווי מצב בממשק |
| **1. כותרת ו-SEO** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L652](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L652) | תווית טקסט / חיווי מצב בממשק |
| **4. הנעה לפעולה (CTA)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L691](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L691) | תווית טקסט / חיווי מצב בממשק |
| **כותרת ראשית (H1)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L700](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L700) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלאג באנגלית (Slug - יוצג בכתובת /kosvidio/)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L725](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L725) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת מטא ל-SEO (Meta Title - מומלץ 50-60 תווים)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L751](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L751) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור מטא (Meta Description - מומלץ 140-160 תווים)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L779](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L779) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תגיות ונושאים (Tags)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L792](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L792) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמצית מנהלים (על הסרטון בכמה מילים - 2-3 משפטים)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L836](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L836) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כרטיסי תובנות מפתח מהוידאו (Key Takeaways עם בחירת אייקון וכותרת מותאמת)** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L865](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L865) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת ה-CTA** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1073](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1073) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תת-כותרת / תיאור** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1083](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1083) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טקסט כפתור הנעה לפעולה** | מודאל (KosTubeContentReviewModal) | [KosTubeContentReviewModal.tsx#L1093](file:///c:/comona/src/modules/KosTube/components/KosTubeContentReviewModal.tsx#L1093) | תווית שדה קלט בטופס או בפאנל העריכה |
| **⚡ מצב חסכוני (Gemini 3.8 Flash Lite)** | רכיב (KosTubeGenerationCurtain) | [KosTubeGenerationCurtain.tsx#L88](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationCurtain.tsx#L88) | תווית זיהוי לשדה או מדד |
| **⚖️ מצב מאוזן (Gemini 3.8 Flash)** | רכיב (KosTubeGenerationCurtain) | [KosTubeGenerationCurtain.tsx#L90](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationCurtain.tsx#L90) | תווית זיהוי לשדה או מדד |
| **🚀 מצב עומק (Gemini 3.8 Pro)** | רכיב (KosTubeGenerationCurtain) | [KosTubeGenerationCurtain.tsx#L91](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationCurtain.tsx#L91) | תווית זיהוי לשדה או מדד |
| **העמוד הופק בהצלחה! פותח תצוגה מקדימה...** | רכיב (KosTubeGenerationCurtain) | [KosTubeGenerationCurtain.tsx#L222](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationCurtain.tsx#L222) | תווית טקסט / חיווי מצב בממשק |
| **סרטון נבחר** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L59](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L59) | תווית טקסט / חיווי מצב בממשק |
| **מצב הפקה וצמצום עלויות טוקנים** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L68](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L68) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ברירת מחדל חסכונית** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L72](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L72) | תווית טקסט / חיווי מצב בממשק |
| **חבר מיתוג טננט מלא (ברירת מחדל של KOSUN26)** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L157](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L157) | תווית טקסט / חיווי מצב בממשק |
| **מקור התוכן לניתוח ה-AI** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L170](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L170) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלאג עמוד באנגלית (SEO Slug)** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L221](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L221) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אופציונלי • נוצר ע"י AI אם ריק** | מודאל (KosTubeGenerationModal) | [KosTubeGenerationModal.tsx#L225](file:///c:/comona/src/modules/KosTube/components/KosTubeGenerationModal.tsx#L225) | תווית טקסט / חיווי מצב בממשק |
| **כתובת ערוץ יוטיוב או Handle** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L107](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L107) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מפתח YouTube Data API v3 (נדרש לסנכרון אוטומטי של כל סרטוני הערוץ)** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L140](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L140) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מדריך מהיר: איך להשיג מפתח YouTube Data API v3 בחינם (תוך 2 דקות)** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L162](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L162) | תווית טקסט / חיווי מצב בממשק |
| **מפתח YouTube Data API מוגדר אוטומטית ברמת המערכת (Master)** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L189](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L189) | תווית טקסט / חיווי מצב בממשק |
| **ההגדרות נשמרו בהצלחה ועודכנו בטננט.** | לשונית תוכן (KosTubeSettingsTab) | [KosTubeSettingsTab.tsx#L215](file:///c:/comona/src/modules/KosTube/components/KosTubeSettingsTab.tsx#L215) | תווית טקסט / חיווי מצב בממשק |
| **הזדמנות בלעדית** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L561](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L561) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **KOSVIDIO • גלריית סרטונים** | רכיב (KosTubeContext) | [KosTubeContext.tsx#L577](file:///c:/comona/src/modules/KosTube/context/KosTubeContext.tsx#L577) | תגית הדגשה (Badge) בראש האזור או הכרטיס |

</div>
