<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): ניהול קמפיינים ושגרירים (ambassador-campaigns-hub)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosCampaigns](file:///c:/comona/src/modules/KosCampaigns)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של ניהול קמפיינים ושגרירים (ambassador-campaigns-hub).
* **קבצים שנסרקו בשכבה זו (16):** [functionsApi.ts](file:///c:/comona/src/modules/KosCampaigns/api/functionsApi.ts), [AmbassadorModal.tsx](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx), [AmbassadorsManagementTable.tsx](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx), [CampaignDashboard.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx), [CampaignStudioEditor.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx), [CreateCampaignModal.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx), [index.ts](file:///c:/comona/src/modules/KosCampaigns/config/index.ts), [CampaignModuleContext.tsx](file:///c:/comona/src/modules/KosCampaigns/context/CampaignModuleContext.tsx), [index.ts](file:///c:/comona/src/modules/KosCampaigns/index.ts), [index.ts](file:///c:/comona/src/modules/KosCampaigns/prompts/index.ts), [CampaignModuleRoutes.tsx](file:///c:/comona/src/modules/KosCampaigns/routes/CampaignModuleRoutes.tsx), [campaignAiService.ts](file:///c:/comona/src/modules/KosCampaigns/services/campaignAiService.ts), [campaignBrandIntegrationService.ts](file:///c:/comona/src/modules/KosCampaigns/services/campaignBrandIntegrationService.ts), [campaignFirestoreService.ts](file:///c:/comona/src/modules/KosCampaigns/services/campaignFirestoreService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosCampaigns/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosCampaigns/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 156 (אזורים/אקורדיונים: 0, כותרות: 18, פילטרים/טאבים: 36, פלייסהולדרים: 19, כפתורי CTA: 24, תוויות: 59)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (18)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הקמת קהילה ויעד שגריר חדש** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L126](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L126) | כותרת תצוגה (H3) במודאל (AmbassadorModal) |
| **עמוד הקהילה הוקם בהצלחה!** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L249](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L249) | כותרת תצוגה (H3) במודאל (AmbassadorModal) |
| **ניהול שגרירים וקהילות** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L62](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L62) | כותרת תצוגה (H3) בטבלה / רשימת נתונים (AmbassadorsManagementTable) |
| **שתף בוואטסאפ** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L161](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L161) | כותרת ראשית של האזור / הכרטיס |
| **צפה בעמוד** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L171](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L171) | כותרת ראשית של האזור / הכרטיס |
| **רענן נתונים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L211](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L211) | כותרת ראשית של האזור / הכרטיס |
| **תצוגת טבלה (Table)** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L313](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L313) | כותרת ראשית של האזור / הכרטיס |
| **לא נמצאו קמפיינים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L336](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L336) | כותרת תצוגה (H3) ברכיב (CampaignDashboard) |
| **צפה בעמוד הדיגיטלי בסגנון Kampin** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L454](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L454) | כותרת ראשית של האזור / הכרטיס |
| **יומן תרומות והכנסות מלא** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L545](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L545) | כותרת תצוגה (H3) ברכיב (CampaignDashboard) |
| **אנליטיקה ופילוח קמפיינים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L613](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L613) | כותרת תצוגה (H3) ברכיב (CampaignDashboard) |
| **ערוך ועצב את הקמפיין (HomeEditor Studio)** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L656](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L656) | כותרת ראשית של האזור / הכרטיס |
| **סנכרון תמונות מגלריית המשתמש** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L630](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L630) | כותרת תצוגה (H4) בעורך הגדרות (CampaignStudioEditor) |
| **סרטון וידאו ראשי (YouTube / Vimeo / קישור ישיר)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L680](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L680) | כותרת תצוגה (H4) בעורך הגדרות (CampaignStudioEditor) |
| **מדרגת תרומה** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L316](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L316) | כותרת ראשית של האזור / הכרטיס |
| **הקמת קמפיין גיוס דיגיטלי** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L360](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L360) | כותרת תצוגה (H3) במודאל (CreateCampaignModal) |
| **צבע ראשי:** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L438](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L438) | כותרת ראשית של האזור / הכרטיס |
| **צבע משני:** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L443](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L443) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (36)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **חזור ללוח הבקרה והקאנבס** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L130](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L130) | סינון נתונים / בחירת תצוגה או סגנון |
| **קאנבס קמפיינים ()** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L151](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L151) | סינון נתונים / בחירת תצוגה או סגנון |
| **שגרירים וקהילות ()** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L163](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L163) | סינון נתונים / בחירת תצוגה או סגנון |
| **יומן תרומות ()** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L175](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L175) | סינון נתונים / בחירת תצוגה או סגנון |
| **אנליטיקה ומדדים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L192](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L192) | סינון נתונים / בחירת תצוגה או סגנון |
| **[כפתור אייקון] תצוגת כרטיסיות (Grid)** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L297](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L297) | תצוגת כרטיסיות (Grid) |
| **[כפתור אייקון] תצוגת טבלה (Table)** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L307](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L307) | תצוגת טבלה (Table) |
| **עמוד דיגיטלי** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L447](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L447) | צפה בעמוד הדיגיטלי בסגנון Kampin |
| **עמוד מלא** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L513](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L513) | סינון נתונים / בחירת תצוגה או סגנון |
| **כל הסטטוסים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L287](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L287) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **פעיל בלבד** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L288](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L288) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הושלם** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L289](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L289) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **טיוטה** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L290](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L290) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תצוגת כרטיסיות (Grid)** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L303](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L303) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **ערוך עיצוב עם עורך ה-Studio** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L441](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L441) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **כותרת ומד תנופה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L274](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L274) | סינון נתונים / בחירת תצוגה או סגנון |
| **מדרגות וסליקה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L284](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L284) | סינון נתונים / בחירת תצוגה או סגנון |
| **גלריית מדיה ווידאו** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L294](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L294) | סינון נתונים / בחירת תצוגה או סגנון |
| **לוח תורמים ותצוגה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L304](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L304) | סינון נתונים / בחירת תצוגה או סגנון |
| **סיפור וחזון** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L314](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L314) | סינון נתונים / בחירת תצוגה או סגנון |
| **עקומת קשת עולה עם חץ תנופה (סגנון Charidy)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L382](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L382) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מד אחוז התקדמות מעגלי** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L383](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L383) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **נתיב SVG מותאם אישית (Custom SVG Path)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L384](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L384) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **גרדיאנט יוקרתי (Indigo / Slate)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L409](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L409) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כהה עמוק (Dark Premium)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L410](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L410) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **בהיר ונקי (Light Clean)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L411](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L411) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שניהם: הוראת קבע (×12 חודשים) ותרומה חד פעמית** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L476](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L476) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הוראת קבע חודשית בלבד** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L477](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L477) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תרומה חד פעמית בלבד** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L478](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L478) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **זיהוי אוטומטי** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L704](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L704) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **קובץ וידאו ישיר (MP4)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L707](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L707) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **עמעום (Fade)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L717](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L717) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **גלילה (Slide)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L718](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L718) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **זום קולנועי (Zoom)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L719](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L719) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תרומות אחרונות (פיד חי)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L770](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L770) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תורמים מובילים (סכום גבוה ביותר)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L771](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L771) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (19)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **למשל: קהילת לב אחד - ירושלים** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L147](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L147) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם מלא** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L159](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L159) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **name@example.com** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L194](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L194) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **my-community-goal** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L208](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L208) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ספרו בכמה מילים על המטרה שלכם ועל חשיבות ההגעה ליעד...** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L220](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L220) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש שגריר או קהילה...** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L78](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L78) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **חיפוש קמפיין לפי שם או סלאג...** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L276](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L276) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **M 10 80 Q 100 10, 200 80 T 300 20** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L395](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L395) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם המדרגה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L506](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L506) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **סכום** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L515](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L515) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תיאור קצר של המדרגה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L532](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L532) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://www.youtube.com/watch?v=...** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L691](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L691) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתובת תמונה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L828](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L828) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **מיקוד נוסף לקמפיין (אופציונלי): למשל, שותפות שנתית, גיוס לפסח, חסד...** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L468](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L468) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **למשל: שותפים לחזון 2026** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L562](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L562) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **יחד בונים עתיד ומחברים קהילות** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L573](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L573) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **campaign-2026** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L600](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L600) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://... או בחר מגלריית המדיה** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L614](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L614) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ספרו על מהות הקמפיין, החזון, ולמה כל תרומה משפיעה ומקדמת את היעד...** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L711](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L711) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (24)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הועתק! / העתק** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L258](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L258) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שתף בוואטסאפ עכשיו** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L269](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L269) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור וחזור לקמפיין** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L277](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L277) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף שגריר** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L83](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L83) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הועתק! / העתק קישור** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L150](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L150) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **וואטסאפ** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L158](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L158) | שתף בוואטסאפ |
| **צפה** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L168](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L168) | צפה בעמוד |
| **[כפתור אייקון] רענן נתונים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L207](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L207) | רענן נתונים |
| **קמפיין AI ומיתוג** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L319](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L319) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הקמת קמפיין חדש עכשיו** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L341](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L341) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **עיצוב Studio** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L434](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L434) | ערוך עיצוב עם עורך ה-Studio |
| **[כפתור אייקון] ערוך ועצב את הקמפיין (HomeEditor Studio)** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L653](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L653) | ערוך ועצב את הקמפיין (HomeEditor Studio) |
| **הוסף מדרגה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L486](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L486) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בחר מגלריית המדיה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L582](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L582) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **גריד 2 עמודות** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L733](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L733) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **גריד 3 עמודות** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L742](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L742) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **רשימה מלאה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L751](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L751) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בחר מהגלריה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L831](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L831) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **לפי המיתוג ו-AI (Brand DNA) מומלץ** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L368](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L368) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בחירה עצמית (התאמה ידנית)** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L384](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L384) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פתח גלריית מדיה** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L617](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L617) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שניהם (הו"ק וחד-פעמי)** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L761](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L761) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוראת קבע בלבד** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L770](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L770) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חד פעמי בלבד** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L779](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L779) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (59)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **שם הקהילה / הצוות *** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L141](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L141) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם מוביל הקהילה** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L154](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L154) | תווית שדה קלט בטופס או בפאנל העריכה |
| **יעד אישי לגיוס (₪) *** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L164](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L164) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טלפון נייד לוואטסאפ** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L179](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L179) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת אימייל** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L189](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L189) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלאג מותאם לקישור (אופציונלי - אנגלית בלבד)** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L201](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L201) | תווית שדה קלט בטופס או בפאנל העריכה |
| **חזון הקהילה ומסר לשותפים** | מודאל (AmbassadorModal) | [AmbassadorModal.tsx#L215](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorModal.tsx#L215) | תווית שדה קלט בטופס או בפאנל העריכה |
| **לא נמצאו שגרירים התואמים את החיפוש** | טבלה / רשימת נתונים (AmbassadorsManagementTable) | [AmbassadorsManagementTable.tsx#L98](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorsManagementTable.tsx#L98) | תווית טקסט / חיווי מצב בממשק |
| **תצוגת עמוד דיגיטלי מלא** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L127](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L127) | תווית טקסט / חיווי מצב בממשק |
| **קמפיינים במערכת** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L225](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L225) | תווית טקסט / חיווי מצב בממשק |
| **מערך קמפיינים מבוזר** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L229](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L229) | תווית טקסט / חיווי מצב בממשק |
| **סה"כ גויס** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L234](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L234) | תווית טקסט / חיווי מצב בממשק |
| **מובילי קהילות ושגרירים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L247](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L247) | תווית טקסט / חיווי מצב בממשק |
| **עמודי שגרירים עצמאיים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L251](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L251) | תווית טקסט / חיווי מצב בממשק |
| **סה"כ תרומות** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L256](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L256) | תווית טקסט / חיווי מצב בממשק |
| **עסקאות שאושרו בהצלחה** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L260](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L260) | תווית טקסט / חיווי מצב בממשק |
| **עמוד דיגיטלי** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L457](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L457) | תווית טקסט / חיווי מצב בממשק |
| **פירוט כל התרומות שהתקבלו, אמצעי תשלום וקישורי קבלה** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L546](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L546) | תווית טקסט / חיווי מצב בממשק |
| **ממוצע תרומה** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L620](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L620) | תווית טקסט / חיווי מצב בממשק |
| **אחוז עמידה ביעד הכולל** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L630](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L630) | תווית טקסט / חיווי מצב בממשק |
| **תרומות שגויסו ע"י שגרירים** | רכיב (CampaignDashboard) | [CampaignDashboard.tsx#L640](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDashboard.tsx#L640) | תווית טקסט / חיווי מצב בממשק |
| **כותרת הקמפיין הראשי** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L335](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L335) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלוגן / תת-כותרת** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L345](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L345) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סכום יעד הקמפיין (₪)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L356](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L356) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סכום נוכחי שהושג (₪)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L365](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L365) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תבנית גרף SVG הטרנד (Visual Trend Preset)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L376](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L376) | תווית שדה קלט בטופס או בפאנל העריכה |
| **נתיב SVG מותאם (path d=...)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L390](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L390) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ערכת עיצוב (Branding Theme)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L403](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L403) | תווית שדה קלט בטופס או בפאנל העריכה |
| **צבע מיתוג ראשי** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L415](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L415) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סוגי תרומות מותרים בטופס** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L470](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L470) | תווית שדה קלט בטופס או בפאנל העריכה |
| **נוסח הודעת תודה והצלחה (תרומה הושלמה)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L571](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L571) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונת תודה מהגלריה:** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L581](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L581) | תווית קבוצת פקדים בעורך / בממשק |
| **נוסח תזכורת נטישה (לאחר 5 דק' בסטטוס ממתין)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L597](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L597) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונת תזכורת מהגלריה:** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L607](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L607) | תווית קבוצת פקדים בעורך / בממשק |
| **תמונות הקמפיין ()** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L651](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L651) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קישור לסרטון (Video URL)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L686](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L686) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סוג וידאו** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L698](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L698) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אפקט מעבר תמונות** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L711](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L711) | תווית שדה קלט בטופס או בפאנל העריכה |
| **פריסת כרטיסי תורמים (Card Layout)** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L731](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L731) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טאב ברירת מחדל בעת פתיחה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L764](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L764) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת הסקשן** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L802](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L802) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תוכן הסיפור וחזון הקמפיין** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L812](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L812) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונת באנר מהגלריה** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L822](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L822) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שינויי העיצוב מתעדכנים מיידית** | עורך הגדרות (CampaignStudioEditor) | [CampaignStudioEditor.tsx#L851](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStudioEditor.tsx#L851) | תווית טקסט / חיווי מצב בממשק |
| **לפי המיתוג ו-AI (Brand DNA)** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L378](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L378) | תווית טקסט / חיווי מצב בממשק |
| **ה-AI מנתח...** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L480](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L480) | תווית טקסט / חיווי מצב בממשק |
| **הפק המלצות AI** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L485](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L485) | תווית טקסט / חיווי מצב בממשק |
| **המלצה זו נבחרה** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L533](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L533) | תווית טקסט / חיווי מצב בממשק |
| **החל המלצה זו** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L537](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L537) | תווית טקסט / חיווי מצב בממשק |
| **כותרת הקמפיין המרכזי *** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L556](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L556) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלוגן / תת-כותרת שיווקית** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L568](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L568) | תווית שדה קלט בטופס או בפאנל העריכה |
| **יעד גיוס ראשי (₪) *** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L582](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L582) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מזהה סלאג אינטרנטי (URL)** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L595](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L595) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונת נושא ראשית (מסונכרן עם הגלריה)** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L608](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L608) | תווית שדה קלט בטופס או בפאנל העריכה |
| **בחירה מהירה:** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L630](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L630) | תווית קבוצת פקדים בעורך / בממשק |
| **סיפור הקמפיין והחזון הציבורי** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L706](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L706) | תווית שדה קלט בטופס או בפאנל העריכה |
| **צבע ראשי לקמפיין (Primary)** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L720](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L720) | תווית שדה קלט בטופס או בפאנל העריכה |
| **צבע משני / הדגשה (Accent)** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L738](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L738) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מסלולי תרומה מותרים** | מודאל (CreateCampaignModal) | [CreateCampaignModal.tsx#L759](file:///c:/comona/src/modules/KosCampaigns/components/CreateCampaignModal.tsx#L759) | תווית שדה קלט בטופס או בפאנל העריכה |

</div>
