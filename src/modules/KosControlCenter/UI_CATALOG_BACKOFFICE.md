<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): מרכז שליטה ובקרה (control-center-hub)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosControlCenter](file:///c:/comona/src/modules/KosControlCenter)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של מרכז שליטה ובקרה (control-center-hub).
* **קבצים שנסרקו בשכבה זו (15):** [functionsApi.ts](file:///c:/comona/src/modules/KosControlCenter/api/functionsApi.ts), [HeaderControlBar.tsx](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx), [ModuleDetailsDrawer.tsx](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx), [QuickLeadModal.tsx](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx), [QuickWhatsAppModal.tsx](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx), [QuickActionsPillBar.tsx](file:///c:/comona/src/modules/KosControlCenter/components/QuickActionsPillBar.tsx), [index.ts](file:///c:/comona/src/modules/KosControlCenter/config/index.ts), [ControlCenterContext.tsx](file:///c:/comona/src/modules/KosControlCenter/context/ControlCenterContext.tsx), [useLiveModuleStats.ts](file:///c:/comona/src/modules/KosControlCenter/hooks/useLiveModuleStats.ts), [index.ts](file:///c:/comona/src/modules/KosControlCenter/index.ts), [index.ts](file:///c:/comona/src/modules/KosControlCenter/prompts/index.ts), [ModuleRoutes.tsx](file:///c:/comona/src/modules/KosControlCenter/routes/ModuleRoutes.tsx), [controlCenterFirestore.ts](file:///c:/comona/src/modules/KosControlCenter/services/controlCenterFirestore.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosControlCenter/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosControlCenter/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 75 (אזורים/אקורדיונים: 0, כותרות: 9, פילטרים/טאבים: 0, פלייסהולדרים: 6, כפתורי CTA: 19, תוויות: 41)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (9)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **חזרה לעמוד הבית הראשי** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L63](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L63) | כותרת ראשית של האזור / הכרטיס |
| **החלף לפריסת** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L86](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L86) | כותרת ראשית של האזור / הכרטיס |
| **החלף למצב לילה (Dark Mode)** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L106](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L106) | כותרת ראשית של האזור / הכרטיס |
| **רענן ספירות חיים מ-Firestore** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L120](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L120) | כותרת ראשית של האזור / הכרטיס |
| **הוסף ליד ישירות למסד הנתונים** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L129](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L129) | כותרת ראשית של האזור / הכרטיס |
| **הגדרות קולקציות ומסד נתונים (Firestore Collections)** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L143](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L143) | כותרת ראשית של האזור / הכרטיס |
| **ניהול מפתחות API וחיבורים** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L156](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L156) | כותרת ראשית של האזור / הכרטיס |
| **הזנת ליד מהיר למסד** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L100](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L100) | כותרת תצוגה (H3) במודאל (QuickLeadModal) |
| **שיגור הודעת וואטסאפ פעילה** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L94](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L94) | כותרת תצוגה (H3) במודאל (QuickWhatsAppModal) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (6)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **למשל: דניאל כהן** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L141](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L141) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **למשל: 050-1234567** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L159](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L159) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **name@example.com** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L176](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L176) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **פרטים נוספים לגבי הליד...** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L193](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L193) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **050-1234567 או 972501234567** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L139](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L139) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתוב כאן את תוכן ההודעה...** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L157](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L157) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (19)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] רענן ספירות חיים מ-Firestore** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L112](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L112) | רענן ספירות חיים מ-Firestore |
| **+ ליד מהיר** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L126](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L126) | הוסף ליד ישירות למסד הנתונים |
| **[כפתור אייקון] הגדרות קולקציות ומסד נתונים (Firestore Collections)** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L136](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L136) | הגדרות קולקציות ומסד נתונים (Firestore Collections) |
| **[כפתור אייקון] ניהול מפתחות API וחיבורים** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L149](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L149) | ניהול מפתחות API וחיבורים |
| **שיגור הודעת וואטסאפ מהירה** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L95](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L95) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוספת ליד חדש למסד** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L111](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L111) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **העלאת קובץ למאגר המדיה** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L127](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L127) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הגדרת מפתחות API ומסד** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L140](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L140) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פתיחת המודול המלא (ללא סיידבר)** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L155](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L155) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כניסה ישירה לרכיב (ללא סיידבר)** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L253](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L253) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L203](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L203) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר... / שמור ליד במסד** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L212](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L212) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L167](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L167) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **משגר... / שגר לוואטסאפ** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L176](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L176) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הזנת ליד** | סרגל ניווט / כלים (QuickActionsPillBar) | [QuickActionsPillBar.tsx#L106](file:///c:/comona/src/modules/KosControlCenter/components/QuickActionsPillBar.tsx#L106) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שיגור וואטסאפ** | סרגל ניווט / כלים (QuickActionsPillBar) | [QuickActionsPillBar.tsx#L119](file:///c:/comona/src/modules/KosControlCenter/components/QuickActionsPillBar.tsx#L119) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **העלאת מדיה** | סרגל ניווט / כלים (QuickActionsPillBar) | [QuickActionsPillBar.tsx#L132](file:///c:/comona/src/modules/KosControlCenter/components/QuickActionsPillBar.tsx#L132) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **עמוד נחיתה** | סרגל ניווט / כלים (QuickActionsPillBar) | [QuickActionsPillBar.tsx#L145](file:///c:/comona/src/modules/KosControlCenter/components/QuickActionsPillBar.tsx#L145) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מפתחות מערכת** | סרגל ניווט / כלים (QuickActionsPillBar) | [QuickActionsPillBar.tsx#L158](file:///c:/comona/src/modules/KosControlCenter/components/QuickActionsPillBar.tsx#L158) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (41)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **בנטו יוקרתי** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L38](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L38) | תווית זיהוי לשדה או מדד |
| **מטריצת שליטה** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L39](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L39) | תווית זיהוי לשדה או מדד |
| **מדדים ניהוליים** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L40](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L40) | תווית זיהוי לשדה או מדד |
| **צינור תהליכים** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L41](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L41) | תווית זיהוי לשדה או מדד |
| **סימולטור מובייל** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L42](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L42) | תווית זיהוי לשדה או מדד |
| **עמוד הבית** | סרגל ניווט / כלים (HeaderControlBar) | [HeaderControlBar.tsx#L66](file:///c:/comona/src/modules/KosControlCenter/components/HeaderControlBar.tsx#L66) | תווית טקסט / חיווי מצב בממשק |
| **⚡ פעולות חיות להפעלה מיידית:** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L89](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L89) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור ומטרת הרכיב** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L176](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L176) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תחום עסקי** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L193](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L193) | תווית טקסט / חיווי מצב בממשק |
| **שלב צינור עבודה** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L199](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L199) | תווית טקסט / חיווי מצב בממשק |
| **קולקציית Firestore:** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L211](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L211) | תווית קבוצת פקדים בעורך / בממשק |
| **מסמכים פעילים (אמת):** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L221](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L221) | תווית קבוצת פקדים בעורך / בממשק |
| **יכולות מפתח של המודול** | מגירה צדדית (ModuleDetailsDrawer) | [ModuleDetailsDrawer.tsx#L234](file:///c:/comona/src/modules/KosControlCenter/components/modals/ModuleDetailsDrawer.tsx#L234) | תווית טקסט / חיווי מצב בממשק |
| **שמירה ישירה לקולקציית contacts** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L101](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L101) | תווית טקסט / חיווי מצב בממשק |
| **הליד נשמר בהצלחה במסד הנתונים וספירות הלוח עודכנו!** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L118](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L118) | תווית טקסט / חיווי מצב בממשק |
| **שם מלא *** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L133](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L133) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר טלפון / וואטסאפ *** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L151](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L151) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת אימייל (אופציונלי)** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L169](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L169) | תווית שדה קלט בטופס או בפאנל העריכה |
| **הערות (אופציונלי)** | מודאל (QuickLeadModal) | [QuickLeadModal.tsx#L186](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickLeadModal.tsx#L186) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ההודעה שוגרה לוואטסאפ ונרשמה במסד הנתונים!** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L116](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L116) | תווית טקסט / חיווי מצב בממשק |
| **מספר טלפון / וואטסאפ נמען *** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L131](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L131) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תוכן ההודעה *** | מודאל (QuickWhatsAppModal) | [QuickWhatsAppModal.tsx#L149](file:///c:/comona/src/modules/KosControlCenter/components/modals/QuickWhatsAppModal.tsx#L149) | תווית שדה קלט בטופס או בפאנל העריכה |
| **חדש** | קונפיגורציית ברירת מחדל (index) | [index.ts#L17](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L17) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **חיוני** | קונפיגורציית ברירת מחדל (index) | [index.ts#L69](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L69) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **קהילות** | קונפיגורציית ברירת מחדל (index) | [index.ts#L143](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L143) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **דוחות חיים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L167](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L167) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **קשר + איזיקאונט** | קונפיגורציית ברירת מחדל (index) | [index.ts#L217](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L217) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **גיוס ושגרירים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L241](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L241) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **אחסון ענן** | קונפיגורציית ברירת מחדל (index) | [index.ts#L291](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L291) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **אינטראקטיבי** | קונפיגורציית ברירת מחדל (index) | [index.ts#L315](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L315) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **DNA מרכזי** | קונפיגורציית ברירת מחדל (index) | [index.ts#L341](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L341) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **חיבורים ו-API** | קונפיגורציית ברירת מחדל (index) | [index.ts#L365](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L365) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **סייר נתונים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L389](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L389) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **אבטחה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L413](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L413) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **שלד לקוח** | קונפיגורציית ברירת מחדל (index) | [index.ts#L437](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L437) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **כל הרכיבים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L452](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L452) | תווית זיהוי לשדה או מדד |
| **שיווק וצמיחה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L453](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L453) | תווית זיהוי לשדה או מדד |
| **קהילות ו-CRM** | קונפיגורציית ברירת מחדל (index) | [index.ts#L454](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L454) | תווית זיהוי לשדה או מדד |
| **פיננסים וסליקה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L455](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L455) | תווית זיהוי לשדה או מדד |
| **מדיה ו-AI** | קונפיגורציית ברירת מחדל (index) | [index.ts#L456](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L456) | תווית זיהוי לשדה או מדד |
| **תשתיות וליבה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L457](file:///c:/comona/src/modules/KosControlCenter/config/index.ts#L457) | תווית זיהוי לשדה או מדד |

</div>
