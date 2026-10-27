<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): נגן וידאו אינטראקטיבי (flow-player-engine)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosFlowPlayer](file:///c:/comona/src/modules/KosFlowPlayer)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של נגן וידאו אינטראקטיבי (flow-player-engine).
* **קבצים שנסרקו בשכבה זו (18):** [functionsApi.ts](file:///c:/comona/src/modules/KosFlowPlayer/api/functionsApi.ts), [geminiApi.ts](file:///c:/comona/src/modules/KosFlowPlayer/api/geminiApi.ts), [CampaignStudioModal.tsx](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx), [IconPickerModal.tsx](file:///c:/comona/src/modules/KosFlowPlayer/components/IconPickerModal.tsx), [NewProjectModal.tsx](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx), [ProjectsHubView.tsx](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx), [PublishCampaignModal.tsx](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx), [TelemetryDebugger.tsx](file:///c:/comona/src/modules/KosFlowPlayer/components/TelemetryDebugger.tsx), [index.ts](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts), [templates.ts](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts), [ModuleContext.tsx](file:///c:/comona/src/modules/KosFlowPlayer/context/ModuleContext.tsx), [index.ts](file:///c:/comona/src/modules/KosFlowPlayer/index.ts), [index.ts](file:///c:/comona/src/modules/KosFlowPlayer/prompts/index.ts), [ModuleRoutes.tsx](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx), [firestoreService.ts](file:///c:/comona/src/modules/KosFlowPlayer/services/firestoreService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosFlowPlayer/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosFlowPlayer/types/index.ts), [premiumIcons.tsx](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx)
* **סה"כ אלמנטים בשכבה זו:** 243 (אזורים/אקורדיונים: 0, כותרות: 33, פילטרים/טאבים: 11, פלייסהולדרים: 18, כפתורי CTA: 29, תוויות: 152)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (33)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **בחר אפשרות:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L205](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L205) | כותרת ראשית של האזור / הכרטיס |
| **בחר מתוך האפשרויות:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L257](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L257) | כותרת ראשית של האזור / הכרטיס |
| **לחץ על כרטיסייה להמשך** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L258](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L258) | כותרת משנה של האזור / המודאל |
| **כרטיסייה ראשונה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L262](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L262) | כותרת ראשית של האזור / הכרטיס |
| **סטודיו סרטונים והגדרת טריגרים לכל צומת** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L382](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L382) | כותרת תצוגה (H2) במודאל (CampaignStudioModal) |
| **הוסף צומת חדש** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L403](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L403) | כותרת ראשית של האזור / הכרטיס |
| **בחר אייקון לכפתור המיקרופון / טריגר ()** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L616](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L616) | כותרת ראשית של האזור / הכרטיס |
| **פתח ספריית אייקונים מלאה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L622](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L622) | כותרת ראשית של האזור / הכרטיס |
| **מחק כרטיסייה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L847](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L847) | כותרת ראשית של האזור / הכרטיס |
| **בחר תמונה מגלריית המדיה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L974](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L974) | כותרת ראשית של האזור / הכרטיס |
| **בחר אייקון וקטורי יוקרתי** | מודאל (IconPickerModal) | [IconPickerModal.tsx#L25](file:///c:/comona/src/modules/KosFlowPlayer/components/IconPickerModal.tsx#L25) | כותרת ראשית של האזור / הכרטיס |
| **יצירת פרויקט אינטראקטיבי חדש** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L271](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L271) | כותרת תצוגה (H2) במודאל (NewProjectModal) |
| **הפרויקטים של קושאן** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L118](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L118) | כותרת תצוגה (H1) בתצוגה ראשית / אזור (ProjectsHubView) |
| **רענן רשימה** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L186](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L186) | כותרת ראשית של האזור / הכרטיס |
| **אין פרויקטים להצגה** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L202](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L202) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (ProjectsHubView) |
| **פרסם** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L291](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L291) | כותרת ראשית של האזור / הכרטיס |
| **שכפל** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L298](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L298) | כותרת ראשית של האזור / הכרטיס |
| **מחק** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L306](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L306) | כותרת ראשית של האזור / הכרטיס |
| **פתח בלשונית חדשה** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L265](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L265) | כותרת ראשית של האזור / הכרטיס |
| **במה תרצה להתמקד כעת?** | קונפיגורציית ברירת מחדל (index) | [index.ts#L115](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L115) | כותרת ראשית של האזור / הכרטיס |
| **בחר מתוך האפשרויות הבאות להמשך החוויה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L116](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L116) | כותרת משנה של האזור / המודאל |
| **💰 חבילות ומחירים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L120](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L120) | כותרת ראשית של האזור / הכרטיס |
| **📞 השארת פרטים לנציג** | קונפיגורציית ברירת מחדל (index) | [index.ts#L127](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L127) | כותרת ראשית של האזור / הכרטיס |
| **🎙️ שאל שאלה קולית** | קונפיגורציית ברירת מחדל (index) | [index.ts#L134](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L134) | כותרת ראשית של האזור / הכרטיס |
| **🔄 התחל מחדש** | קונפיגורציית ברירת מחדל (index) | [index.ts#L141](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L141) | כותרת ראשית של האזור / הכרטיס |
| **חבילת Pro המובילה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L170](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L170) | כותרת ראשית של האזור / הכרטיס |
| **כולל אינטראקציות ללא הגבלה וסנכרון וידאו מלא** | קונפיגורציית ברירת מחדל (index) | [index.ts#L171](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L171) | כותרת משנה של האזור / המודאל |
| **השארת פרטים לנציג** | קונפיגורציית ברירת מחדל (index) | [index.ts#L199](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L199) | כותרת ראשית של האזור / הכרטיס |
| **הזן פרטים ונחזור אליך בהקדם** | קונפיגורציית ברירת מחדל (index) | [index.ts#L200](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L200) | כותרת משנה של האזור / המודאל |
| **בחר פעולה להמשך:** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L54](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L54) | כותרת ראשית של האזור / הכרטיס |
| **השאר פרטים ונחזור אליך תוך דקות** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L80](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L80) | כותרת ראשית של האזור / הכרטיס |
| **או שלח הודעת וואטסאפ ישירה** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L81](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L81) | כותרת משנה של האזור / המודאל |
| **בחר את המטרה העיקרית:** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L127](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L127) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (11)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **כרטיסייה חדשה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L295](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L295) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **🎯 אמצע המסך - טריגר לצומת הבאה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L653](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L653) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **🟡 מיקרופון זהב (מרכז/תחתית אוטומטי)** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L654](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L654) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **🔽 מיקרופון בתחתית המסך** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L655](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L655) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **🚫 מוסתר בצומת זה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L656](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L656) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **-- בחר צומת יעד למעבר --** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L697](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L697) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **-- ללא מעבר אוטומטי --** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L756](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L756) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **בחר אייקון לכרטיסייה ({card.title** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L930](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L930) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **נגן ועריכת תהליך** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L84](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L84) | סינון נתונים / בחירת תצוגה או סגנון |
| **עמוד נחיתה ומכירות (Landing Page)** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L96](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L96) | סינון נתונים / בחירת תצוגה או סגנון |
| **כל הפרויקטים** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L108](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L108) | סינון נתונים / בחירת תצוגה או סגנון |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (18)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **sales_rep_interactive_01** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L467](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L467) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://api.yourdomain.com/leads** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L475](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L475) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **עוקף את ה-API הכללי** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L508](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L508) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ללא** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L740](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L740) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לדוגמה: במה תרצה להתמקד כעת?** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L799](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L799) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לדוגמה: בחר מתוך האפשרויות הבאות** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L809](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L809) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם הכרטיסייה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L861](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L861) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הסבר קצר למשתמש** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L873](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L873) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **מומלץ / פופולרי / חדש** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L951](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L951) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://.../img.jpg** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L981](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L981) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://.../video.mp4** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1059](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1059) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חפש אייקון לפי שם, קטגוריה או מילת מפתח (כסף, מיקרופון, קניות, AI...)** | מודאל (IconPickerModal) | [IconPickerModal.tsx#L91](file:///c:/comona/src/modules/KosFlowPlayer/components/IconPickerModal.tsx#L91) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **לדוגמה: קמפיין מכירות קיץ 2026** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L322](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L322) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **summer-sales-2026** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L342](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L342) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש מהיר לפי שם פרויקט...** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L178](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L178) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **למשל: נציג מכירות אינטראקטיבי** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L189](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L189) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **sales-interactive-01** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L207](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L207) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ישראל ישראלי** | קונפיגורציית ברירת מחדל (index) | [index.ts#L202](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L202) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (29)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הוסף** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L400](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L400) | הוסף צומת חדש |
| **ספרייה מלאה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L611](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L611) | פתח ספריית אייקונים מלאה |
| **📝 פתח שדה טקסט** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L665](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L665) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **➡️ קישור לצומת** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L676](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L676) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף כרטיסייה חדשה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L821](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L821) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] מחק כרטיסייה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L843](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L843) | מחק כרטיסייה |
| **גלריה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L970](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L970) | בחר תמונה מגלריית המדיה |
| **בחר מגלריית המדיה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1046](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1046) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מחק צומת זה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1082](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1082) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1101](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1101) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **נקה** | מודאל (IconPickerModal) | [IconPickerModal.tsx#L96](file:///c:/comona/src/modules/KosFlowPlayer/components/IconPickerModal.tsx#L96) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **תבניות מוכנות (Templates)** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L288](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L288) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ייבא מסטודיו הווידאו ()** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L300](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L300) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **9:16 (מובייל / סטורי)** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L352](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L352) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **16:9 (מחשב / וידאו רחב)** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L365](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L365) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **1:1 (ריבועי / פיד)** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L378](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L378) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L509](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L509) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **צור פרויקט חדש +** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L128](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L128) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] רענן רשימה** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L183](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L183) | רענן רשימה |
| **הקם פרויקט ראשון** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L203](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L203) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ערוך** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L273](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L273) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] פרסם** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L285](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L285) | פרסם |
| **[כפתור אייקון] שכפל** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L295](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L295) | שכפל |
| **[כפתור אייקון] מחק** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L302](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L302) | מחק |
| **שתף ב-WhatsApp** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L273](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L273) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הסתר קוד הטמעה / קוד הטמעה (iFrame)** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L281](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L281) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הועתק! / העתק קוד** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L295](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L295) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L322](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L322) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פרויקט חדש** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L122](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L122) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (152)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **חזרה לפתיחה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L207](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L207) | תווית זיהוי לשדה או מדד |
| **חדש** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L266](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L266) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **הגדר הפעלה אוטומטית, ניגון בלופ, סאונד, טריגר לחיצה על מיקרופון ומעבר אוטומטי** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L383](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L383) | תווית טקסט / חיווי מצב בממשק |
| **הגדרות קמפיין ראשיות (Firestore Slug & Forms API)** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L446](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L446) | תווית טקסט / חיווי מצב בממשק |
| **שם הקמפיין הראשי** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L453](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L453) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלאג ייחודי לקולקציה (Slug ID)** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L462](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L462) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת API לקליטת INPUT מטפסים (Webhook)** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L472](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L472) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם הצומת / הסצנה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L487](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L487) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור קצר עבור ה-AI** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L496](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L496) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת API ייעודית לצומת (אופציונלי)** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L505](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L505) | תווית שדה קלט בטופס או בפאנל העריכה |
| **הגדרות טריגרים והפעלה לצומת זה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L520](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L520) | תווית טקסט / חיווי מצב בממשק |
| **הפעלה אוטומטית** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L529](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L529) | תווית טקסט / חיווי מצב בממשק |
| **נגן בלופ עד טריגר** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L543](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L543) | תווית טקסט / חיווי מצב בממשק |
| **הפעל סאונד** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L561](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L561) | תווית טקסט / חיווי מצב בממשק |
| **הגדרות וטריגר לחיצה על מיקרופון:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L577](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L577) | תווית קבוצת פקדים בעורך / בממשק |
| **אייקון הכפתור:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L582](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L582) | תווית קבוצת פקדים בעורך / בממשק |
| **מיקום ותצוגת המיקרופון:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L634](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L634) | תווית קבוצת פקדים בעורך / בממשק |
| **פעולת טריגר בלחיצה:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L662](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L662) | תווית קבוצת פקדים בעורך / בממשק |
| **מעבר אוטומטי לצומת הבא:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L717](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L717) | תווית קבוצת פקדים בעורך / בממשק |
| **בסיום שידור הווידאו** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L729](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L729) | תווית טקסט / חיווי מצב בממשק |
| **לאחר** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L735](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L735) | תווית טקסט / חיווי מצב בממשק |
| **שניות** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L745](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L745) | תווית טקסט / חיווי מצב בממשק |
| **צומת היעד:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L750](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L750) | תווית קבוצת פקדים בעורך / בממשק |
| **עריכת כרטיסיות וקרוסלה לצומת זה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L775](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L775) | תווית טקסט / חיווי מצב בממשק |
| **הפעל קרוסלת כרטיסיות בצומת זה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L785](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L785) | תווית טקסט / חיווי מצב בממשק |
| **כותרת ראשית לקרוסלה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L794](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L794) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תת-כותרת / הנחיה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L804](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L804) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת הכרטיסייה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L856](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L856) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור קצר** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L868](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L868) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קישור לצומת יעד** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L880](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L880) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אייקון כרטיסייה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L898](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L898) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תגית מיוחדת (Badge)** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L946](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L946) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונת כרטיסייה** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L958](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L958) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קובץ** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L962](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L962) | תווית טקסט / חיווי מצב בממשק |
| **סרטון הווידאו של הצומת** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1005](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1005) | תווית טקסט / חיווי מצב בממשק |
| **מעלה סרטון ושומר בגלריית המדיה (Firebase Storage)...** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1020](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1020) | תווית טקסט / חיווי מצב בממשק |
| **העלה סרטון מהמחשב (נשמר בגלריה)** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1037](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1037) | תווית טקסט / חיווי מצב בממשק |
| **או קישור:** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1055](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1055) | תווית קבוצת פקדים בעורך / בממשק |
| **נשמר ומופעל!** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1119](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1119) | תווית טקסט / חיווי מצב בממשק |
| **שומר...** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1122](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1122) | תווית טקסט / חיווי מצב בממשק |
| **שמור והפעל בנגן** | מודאל (CampaignStudioModal) | [CampaignStudioModal.tsx#L1126](file:///c:/comona/src/modules/KosFlowPlayer/components/CampaignStudioModal.tsx#L1126) | תווית טקסט / חיווי מצב בממשק |
| **בחר אייקון וקטורי חד ברזולוציה גבוהה (Lucide React)** | מודאל (IconPickerModal) | [IconPickerModal.tsx#L69](file:///c:/comona/src/modules/KosFlowPlayer/components/IconPickerModal.tsx#L69) | תווית טקסט / חיווי מצב בממשק |
| **בחר מקור, תבנית או פרויקט מסטודיו הווידאו** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L272](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L272) | תווית טקסט / חיווי מצב בממשק |
| **שם הפרויקט** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L317](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L317) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלאג ייחודי (URL Identifier)** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L328](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L328) | תווית שדה קלט בטופס או בפאנל העריכה |
| **יחס תצוגת הווידאו** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L350](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L350) | תווית שדה קלט בטופס או בפאנל העריכה |
| **בחר תבנית התחלתית** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L396](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L396) | תווית שדה קלט בטופס או בפאנל העריכה |
| **נבחר** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L436](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L436) | תווית טקסט / חיווי מצב בממשק |
| **לחץ לבחירה** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L439](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L439) | תווית טקסט / חיווי מצב בממשק |
| **בחר פרויקט מסטודיו הווידאו לייבוא מיידי:** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L449](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L449) | תווית שדה קלט בטופס או בפאנל העריכה |
| **נבחר לייבוא** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L487](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L487) | תווית טקסט / חיווי מצב בממשק |
| **לחץ לייבוא** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L490](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L490) | תווית טקסט / חיווי מצב בממשק |
| **יוצר פרויקט...** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L523](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L523) | תווית טקסט / חיווי מצב בממשק |
| **צור והפעל פרויקט** | מודאל (NewProjectModal) | [NewProjectModal.tsx#L527](file:///c:/comona/src/modules/KosFlowPlayer/components/NewProjectModal.tsx#L527) | תווית טקסט / חיווי מצב בממשק |
| **טוען נתונים מקושאן...** | תצוגה ראשית / אזור (ProjectsHubView) | [ProjectsHubView.tsx#L197](file:///c:/comona/src/modules/KosFlowPlayer/components/ProjectsHubView.tsx#L197) | תווית טקסט / חיווי מצב בממשק |
| **פרסום תהליך והגדרת סלאג (Slug)** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L159](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L159) | תווית טקסט / חיווי מצב בממשק |
| **שם התהליך / הקמפיין** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L182](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L182) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלאג ייחודי לנתיב ה-URL (Slug Identifier) באנגלית, אותיות, מספרים ומקפים** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L195](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L195) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סלאג ייחודי לנתיב ה-URL (Slug Identifier)** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L196](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L196) | תווית טקסט / חיווי מצב בממשק |
| **באנגלית, אותיות, מספרים ומקפים** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L197](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L197) | תווית טקסט / חיווי מצב בממשק |
| **כתובת הקישור החי (Public Live URL)** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L220](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L220) | תווית טקסט / חיווי מצב בממשק |
| **פורסם בהצלחה!** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L225](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L225) | תווית טקסט / חיווי מצב בממשק |
| **הועתק!** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L250](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L250) | תווית טקסט / חיווי מצב בממשק |
| **העתק** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L255](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L255) | תווית טקסט / חיווי מצב בממשק |
| **הטמע באתר שלך (HTML iFrame):** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L294](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L294) | תווית קבוצת פקדים בעורך / בממשק |
| **מפרסם ושומר...** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L339](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L339) | תווית טקסט / חיווי מצב בממשק |
| **עודכן ופורסם!** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L343](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L343) | תווית טקסט / חיווי מצב בממשק |
| **שמור ופרסם עכשיו** | מודאל (PublishCampaignModal) | [PublishCampaignModal.tsx#L348](file:///c:/comona/src/modules/KosFlowPlayer/components/PublishCampaignModal.tsx#L348) | תווית טקסט / חיווי מצב בממשק |
| **מומלץ** | קונפיגורציית ברירת מחדל (index) | [index.ts#L123](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L123) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **מהיר** | קונפיגורציית ברירת מחדל (index) | [index.ts#L130](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L130) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **השאר פרטים למסלול זה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L174](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L174) | תווית זיהוי לשדה או מדד |
| **חזרה להתחלה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L175](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L175) | תווית זיהוי לשדה או מדד |
| **שם מלא** | קונפיגורציית ברירת מחדל (index) | [index.ts#L202](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L202) | תווית זיהוי לשדה או מדד |
| **מספר טלפון** | קונפיגורציית ברירת מחדל (index) | [index.ts#L203](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L203) | תווית זיהוי לשדה או מדד |
| **התחל שיחה מחדש** | קונפיגורציית ברירת מחדל (index) | [index.ts#L206](file:///c:/comona/src/modules/KosFlowPlayer/config/index.ts#L206) | תווית זיהוי לשדה או מדד |
| **מומלץ** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L18](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L18) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **פופולרי** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L26](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L26) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **תיאום שיחת ייעוץ אישית 📅** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L58](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L58) | תווית זיהוי לשדה או מדד |
| **פנה בוואטסאפ עכשיו 💬** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L85](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L85) | תווית זיהוי לשדה או מדד |
| **אינטראקטיבי** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L100](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L100) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **אפשרות א: הגדלת מכירות 🚀** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L131](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L131) | תווית זיהוי לשדה או מדד |
| **אפשרות ב: חיסכון בזמן ואוטומציה ⚙️** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L137](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L137) | תווית זיהוי לשדה או מדד |
| **נקי** | קונפיגורציית ברירת מחדל (templates) | [templates.ts#L174](file:///c:/comona/src/modules/KosFlowPlayer/config/templates.ts#L174) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **טוען קמפיין אינטראקטיבי מעודכן מהשרת...** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L72](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L72) | תווית טקסט / חיווי מצב בממשק |
| **נגן ועריכת תהליך** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L93](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L93) | תווית טקסט / חיווי מצב בממשק |
| **עמוד נחיתה ומכירות (Landing Page)** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L105](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L105) | תווית טקסט / חיווי מצב בממשק |
| **כל הפרויקטים** | רכיב (ModuleRoutes) | [ModuleRoutes.tsx#L117](file:///c:/comona/src/modules/KosFlowPlayer/routes/ModuleRoutes.tsx#L117) | תווית טקסט / חיווי מצב בממשק |
| **מטבעות וכסף** | רכיב (premiumIcons) | [premiumIcons.tsx#L103](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L103) | תווית זיהוי לשדה או מדד |
| **דולר** | רכיב (premiumIcons) | [premiumIcons.tsx#L104](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L104) | תווית זיהוי לשדה או מדד |
| **כרטיס אשראי** | רכיב (premiumIcons) | [premiumIcons.tsx#L105](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L105) | תווית זיהוי לשדה או מדד |
| **צמיחה ורווחים** | רכיב (premiumIcons) | [premiumIcons.tsx#L106](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L106) | תווית זיהוי לשדה או מדד |
| **תיק עסקים** | רכיב (premiumIcons) | [premiumIcons.tsx#L107](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L107) | תווית זיהוי לשדה או מדד |
| **פרס והצטיינות** | רכיב (premiumIcons) | [premiumIcons.tsx#L108](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L108) | תווית זיהוי לשדה או מדד |
| **חברה / נדל** | רכיב (premiumIcons) | [premiumIcons.tsx#L109](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L109) | תווית זיהוי לשדה או מדד |
| **בנק ומוסד** | רכיב (premiumIcons) | [premiumIcons.tsx#L110](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L110) | תווית זיהוי לשדה או מדד |
| **הנחה ואחוזים** | רכיב (premiumIcons) | [premiumIcons.tsx#L111](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L111) | תווית זיהוי לשדה או מדד |
| **דוחות ונתונים** | רכיב (premiumIcons) | [premiumIcons.tsx#L112](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L112) | תווית זיהוי לשדה או מדד |
| **קסם ו-AI** | רכיב (premiumIcons) | [premiumIcons.tsx#L115](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L115) | תווית זיהוי לשדה או מדד |
| **רובוט ועוזר** | רכיב (premiumIcons) | [premiumIcons.tsx#L116](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L116) | תווית זיהוי לשדה או מדד |
| **מעבד ושבב** | רכיב (premiumIcons) | [premiumIcons.tsx#L117](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L117) | תווית זיהוי לשדה או מדד |
| **שיגור וסטארטאפ** | רכיב (premiumIcons) | [premiumIcons.tsx#L118](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L118) | תווית זיהוי לשדה או מדד |
| **רעיון ויוזמה** | רכיב (premiumIcons) | [premiumIcons.tsx#L119](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L119) | תווית זיהוי לשדה או מדד |
| **מסד נתונים** | רכיב (premiumIcons) | [premiumIcons.tsx#L120](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L120) | תווית זיהוי לשדה או מדד |
| **קוד ותוכנה** | רכיב (premiumIcons) | [premiumIcons.tsx#L121](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L121) | תווית זיהוי לשדה או מדד |
| **טרמינל ופקודות** | רכיב (premiumIcons) | [premiumIcons.tsx#L122](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L122) | תווית זיהוי לשדה או מדד |
| **אינטרנט גלובלי** | רכיב (premiumIcons) | [premiumIcons.tsx#L123](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L123) | תווית זיהוי לשדה או מדד |
| **חיבור רשת** | רכיב (premiumIcons) | [premiumIcons.tsx#L124](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L124) | תווית זיהוי לשדה או מדד |
| **מיקרופון אולפן** | רכיב (premiumIcons) | [premiumIcons.tsx#L127](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L127) | תווית זיהוי לשדה או מדד |
| **שידור חי** | רכיב (premiumIcons) | [premiumIcons.tsx#L128](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L128) | תווית זיהוי לשדה או מדד |
| **אוזניות שמע** | רכיב (premiumIcons) | [premiumIcons.tsx#L129](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L129) | תווית זיהוי לשדה או מדד |
| **בועת שיחה** | רכיב (premiumIcons) | [premiumIcons.tsx#L130](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L130) | תווית זיהוי לשדה או מדד |
| **שיחה קולית** | רכיב (premiumIcons) | [premiumIcons.tsx#L131](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L131) | תווית זיהוי לשדה או מדד |
| **השמעת סאונד** | רכיב (premiumIcons) | [premiumIcons.tsx#L132](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L132) | תווית זיהוי לשדה או מדד |
| **מוזיקה וצלילים** | רכיב (premiumIcons) | [premiumIcons.tsx#L133](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L133) | תווית זיהוי לשדה או מדד |
| **מצלמת וידאו** | רכיב (premiumIcons) | [premiumIcons.tsx#L134](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L134) | תווית זיהוי לשדה או מדד |
| **צילום תמונות** | רכיב (premiumIcons) | [premiumIcons.tsx#L135](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L135) | תווית זיהוי לשדה או מדד |
| **דואר אלקטרוני** | רכיב (premiumIcons) | [premiumIcons.tsx#L136](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L136) | תווית זיהוי לשדה או מדד |
| **התראות וצלצול** | רכיב (premiumIcons) | [premiumIcons.tsx#L137](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L137) | תווית זיהוי לשדה או מדד |
| **שליחת הודעה** | רכיב (premiumIcons) | [premiumIcons.tsx#L138](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L138) | תווית זיהוי לשדה או מדד |
| **שיתוף** | רכיב (premiumIcons) | [premiumIcons.tsx#L139](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L139) | תווית זיהוי לשדה או מדד |
| **תיק קניות** | רכיב (premiumIcons) | [premiumIcons.tsx#L142](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L142) | תווית זיהוי לשדה או מדד |
| **עגלת קניות** | רכיב (premiumIcons) | [premiumIcons.tsx#L143](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L143) | תווית זיהוי לשדה או מדד |
| **מתנה והטבה** | רכיב (premiumIcons) | [premiumIcons.tsx#L144](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L144) | תווית זיהוי לשדה או מדד |
| **תגית ומבצע** | רכיב (premiumIcons) | [premiumIcons.tsx#L145](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L145) | תווית זיהוי לשדה או מדד |
| **חנות ומכירה** | רכיב (premiumIcons) | [premiumIcons.tsx#L146](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L146) | תווית זיהוי לשדה או מדד |
| **חבילה ומשלוח** | רכיב (premiumIcons) | [premiumIcons.tsx#L147](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L147) | תווית זיהוי לשדה או מדד |
| **ארגז מוצר** | רכיב (premiumIcons) | [premiumIcons.tsx#L148](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L148) | תווית זיהוי לשדה או מדד |
| **כרטיס / שובר** | רכיב (premiumIcons) | [premiumIcons.tsx#L149](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L149) | תווית זיהוי לשדה או מדד |
| **פופולרי / חם** | רכיב (premiumIcons) | [premiumIcons.tsx#L150](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L150) | תווית זיהוי לשדה או מדד |
| **מועדפים ואהבה** | רכיב (premiumIcons) | [premiumIcons.tsx#L151](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L151) | תווית זיהוי לשדה או מדד |
| **ניגון וידאו** | רכיב (premiumIcons) | [premiumIcons.tsx#L154](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L154) | תווית זיהוי לשדה או מדד |
| **רענון וחזרה** | רכיב (premiumIcons) | [premiumIcons.tsx#L155](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L155) | תווית זיהוי לשדה או מדד |
| **מטרה ויעד** | רכיב (premiumIcons) | [premiumIcons.tsx#L156](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L156) | תווית זיהוי לשדה או מדד |
| **ניווט ומסלול** | רכיב (premiumIcons) | [premiumIcons.tsx#L157](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L157) | תווית זיהוי לשדה או מדד |
| **חץ המשך** | רכיב (premiumIcons) | [premiumIcons.tsx#L158](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L158) | תווית זיהוי לשדה או מדד |
| **חץ חזרה** | רכיב (premiumIcons) | [premiumIcons.tsx#L159](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L159) | תווית זיהוי לשדה או מדד |
| **חיפוש** | רכיב (premiumIcons) | [premiumIcons.tsx#L160](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L160) | תווית זיהוי לשדה או מדד |
| **קישור חיצוני** | רכיב (premiumIcons) | [premiumIcons.tsx#L161](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L161) | תווית זיהוי לשדה או מדד |
| **שעון וזמן** | רכיב (premiumIcons) | [premiumIcons.tsx#L162](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L162) | תווית זיהוי לשדה או מדד |
| **יומן ופגישות** | רכיב (premiumIcons) | [premiumIcons.tsx#L163](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L163) | תווית זיהוי לשדה או מדד |
| **מיקום וסניף** | רכיב (premiumIcons) | [premiumIcons.tsx#L164](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L164) | תווית זיהוי לשדה או מדד |
| **כתר ו-VIP** | רכיב (premiumIcons) | [premiumIcons.tsx#L167](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L167) | תווית זיהוי לשדה או מדד |
| **כוכב ודירוג** | רכיב (premiumIcons) | [premiumIcons.tsx#L168](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L168) | תווית זיהוי לשדה או מדד |
| **אבטחה ואימות** | רכיב (premiumIcons) | [premiumIcons.tsx#L169](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L169) | תווית זיהוי לשדה או מדד |
| **הצלחה ואישור** | רכיב (premiumIcons) | [premiumIcons.tsx#L170](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L170) | תווית זיהוי לשדה או מדד |
| **פרופיל משתמש** | רכיב (premiumIcons) | [premiumIcons.tsx#L171](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L171) | תווית זיהוי לשדה או מדד |
| **משתמש מאומת** | רכיב (premiumIcons) | [premiumIcons.tsx#L172](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L172) | תווית זיהוי לשדה או מדד |
| **המלצה ולייק** | רכיב (premiumIcons) | [premiumIcons.tsx#L173](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L173) | תווית זיהוי לשדה או מדד |
| **שביעות רצון** | רכיב (premiumIcons) | [premiumIcons.tsx#L174](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L174) | תווית זיהוי לשדה או מדד |
| **נעול ומאובטח** | רכיב (premiumIcons) | [premiumIcons.tsx#L175](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L175) | תווית זיהוי לשדה או מדד |
| **מידע והסבר** | רכיב (premiumIcons) | [premiumIcons.tsx#L176](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L176) | תווית זיהוי לשדה או מדד |
| **עזרה ותמיכה** | רכיב (premiumIcons) | [premiumIcons.tsx#L177](file:///c:/comona/src/modules/KosFlowPlayer/utils/premiumIcons.tsx#L177) | תווית זיהוי לשדה או מדד |

</div>
