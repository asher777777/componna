<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): מחולל מערכות ולוחות בקרה (kosun-board-composer)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosBoard](file:///c:/comona/src/modules/KosBoard)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של מחולל מערכות ולוחות בקרה (kosun-board-composer).
* **קבצים שנסרקו בשכבה זו (16):** [functionsApi.ts](file:///c:/comona/src/modules/KosBoard/api/functionsApi.ts), [AudienceSelector.tsx](file:///c:/comona/src/modules/KosBoard/components/AudienceSelector.tsx), [KosunBoardForgeView.tsx](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx), [ModuleCapabilityPicker.tsx](file:///c:/comona/src/modules/KosBoard/components/ModuleCapabilityPicker.tsx), [SubdomainPairingModal.tsx](file:///c:/comona/src/modules/KosBoard/components/SubdomainPairingModal.tsx), [index.ts](file:///c:/comona/src/modules/KosBoard/config/index.ts), [ModuleContext.tsx](file:///c:/comona/src/modules/KosBoard/context/ModuleContext.tsx), [useBoardComposerActions.ts](file:///c:/comona/src/modules/KosBoard/hooks/useBoardComposerActions.ts), [useBoardComposerData.ts](file:///c:/comona/src/modules/KosBoard/hooks/useBoardComposerData.ts), [index.ts](file:///c:/comona/src/modules/KosBoard/index.ts), [index.ts](file:///c:/comona/src/modules/KosBoard/prompts/index.ts), [ModuleRoutes.tsx](file:///c:/comona/src/modules/KosBoard/routes/ModuleRoutes.tsx), [dashboardFirestoreService.ts](file:///c:/comona/src/modules/KosBoard/services/dashboardFirestoreService.ts), [geminiDashboardAiService.ts](file:///c:/comona/src/modules/KosBoard/services/geminiDashboardAiService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosBoard/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosBoard/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 85 (אזורים/אקורדיונים: 0, כותרות: 12, פילטרים/טאבים: 10, פלייסהולדרים: 3, כפתורי CTA: 16, תוויות: 44)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **מי קהל היעד של לוח הבקרה?** | רכיב (AudienceSelector) | [AudienceSelector.tsx#L47](file:///c:/comona/src/modules/KosBoard/components/AudienceSelector.tsx#L47) | כותרת תצוגה (H3) ברכיב (AudienceSelector) |
| **הגדרות מפתחות AI ב-DB Connector Hub** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L145](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L145) | כותרת ראשית של האזור / הכרטיס |
| **סיכום המערכת לקראת יצירה** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L296](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L296) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosunBoardForgeView) |
| **הגדרות מחולל ה-AI (Gemini)** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L332](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L332) | כותרת תצוגה (H4) בתצוגה ראשית / אזור (KosunBoardForgeView) |
| **טרם נוצר לוח בקרה מותאם** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L418](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L418) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosunBoardForgeView) |
| **לוחות בקרה שמורים ()** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L441](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L441) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosunBoardForgeView) |
| **שדך לסאב-דומיין** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L518](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L518) | כותרת ראשית של האזור / הכרטיס |
| **מחק לוח** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L528](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L528) | כותרת ראשית של האזור / הכרטיס |
| **שיוך לוחות בקרה לסאב-דומיינים של לקוחות** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L544](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L544) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosunBoardForgeView) |
| **פתיחת לוח הניהול של הסאב-דומיין בלשונית חדשה** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L588](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L588) | כותרת ראשית של האזור / הכרטיס |
| **שילוב רכיבי מערכת** | רכיב (ModuleCapabilityPicker) | [ModuleCapabilityPicker.tsx#L77](file:///c:/comona/src/modules/KosBoard/components/ModuleCapabilityPicker.tsx#L77) | כותרת תצוגה (H3) ברכיב (ModuleCapabilityPicker) |
| **שידוך לוח בקרה לסאב-דומיין לקוח** | מודאל (SubdomainPairingModal) | [SubdomainPairingModal.tsx#L81](file:///c:/comona/src/modules/KosBoard/components/SubdomainPairingModal.tsx#L81) | כותרת תצוגה (H3) במודאל (SubdomainPairingModal) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **מחולל AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L79](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L79) | סינון נתונים / בחירת תצוגה או סגנון |
| **לוח בקרה פעיל** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L92](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L92) | סינון נתונים / בחירת תצוגה או סגנון |
| **לוחות שמורים ()** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L108](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L108) | סינון נתונים / בחירת תצוגה או סגנון |
| **שיוך סאב-דומיינים** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L121](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L121) | סינון נתונים / בחירת תצוגה או סגנון |
| **מעבר למחולל ה-AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L424](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L424) | סינון נתונים / בחירת תצוגה או סגנון |
| **חולל לוח חדש** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L449](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L449) | סינון נתונים / בחירת תצוגה או סגנון |
| **הצג לוח** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L504](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L504) | סינון נתונים / בחירת תצוגה או סגנון |
| **Gemini 3.8 Flash (מומלץ ועדכני)** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L343](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L343) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Gemini 3.5 Flash (מהיר)** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L344](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L344) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Gemini 3.8 Flash Lite (חסכוני ומהיר)** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L345](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L345) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **לדוגמה: מקם את סכום הגבייה וההכנסות בראש הלוח, והצע שלוש פעולות מהירות להגדלת מכירות...** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L357](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L357) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש רכיב לפי שם או תיאור...** | רכיב (ModuleCapabilityPicker) | [ModuleCapabilityPicker.tsx#L123](file:///c:/comona/src/modules/KosBoard/components/ModuleCapabilityPicker.tsx#L123) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **client-name** | מודאל (SubdomainPairingModal) | [SubdomainPairingModal.tsx#L160](file:///c:/comona/src/modules/KosBoard/components/SubdomainPairingModal.tsx#L160) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (16)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **Gemini מחובר / הגדרת מפתח AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L137](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L137) | הגדרות מפתחות AI ב-DB Connector Hub |
| **1 ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-slate-200 dar** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L167](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L167) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **2 ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-slate-200 dar** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L187](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L187) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **3 יצירה ב-AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L207](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L207) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **המשך לבחירת רכיבים** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L239](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L239) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חזרה לקהל יעד** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L269](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L269) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **המשך ליצירת הלוח ב-AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L278](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L278) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **קושאן מחוללת את לוח הבקרה... / קושאן, חולל לוח בקרה מותאם אישית ב-AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L365](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L365) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חזרה לבחירת רכיבים** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L386](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L386) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] שדך לסאב-דומיין** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L514](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L514) | שדך לסאב-דומיין |
| **[כפתור אייקון] מחק לוח** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L524](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L524) | מחק לוח |
| **רכיבים מומלצים** | רכיב (ModuleCapabilityPicker) | [ModuleCapabilityPicker.tsx#L89](file:///c:/comona/src/modules/KosBoard/components/ModuleCapabilityPicker.tsx#L89) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בחר הכל** | רכיב (ModuleCapabilityPicker) | [ModuleCapabilityPicker.tsx#L98](file:///c:/comona/src/modules/KosBoard/components/ModuleCapabilityPicker.tsx#L98) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **נקה** | רכיב (ModuleCapabilityPicker) | [ModuleCapabilityPicker.tsx#L106](file:///c:/comona/src/modules/KosBoard/components/ModuleCapabilityPicker.tsx#L106) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגירה** | מודאל (SubdomainPairingModal) | [SubdomainPairingModal.tsx#L176](file:///c:/comona/src/modules/KosBoard/components/SubdomainPairingModal.tsx#L176) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **משדך... / אשר שידוך לוח בקרה** | מודאל (SubdomainPairingModal) | [SubdomainPairingModal.tsx#L197](file:///c:/comona/src/modules/KosBoard/components/SubdomainPairingModal.tsx#L197) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (44)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **נבחר:** | רכיב (AudienceSelector) | [AudienceSelector.tsx#L57](file:///c:/comona/src/modules/KosBoard/components/AudienceSelector.tsx#L57) | תווית קבוצת פקדים בעורך / בממשק |
| **מחולל AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L89](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L89) | תווית טקסט / חיווי מצב בממשק |
| **לוח בקרה פעיל** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L102](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L102) | תווית טקסט / חיווי מצב בממשק |
| **שיוך סאב-דומיינים** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L131](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L131) | תווית טקסט / חיווי מצב בממשק |
| **קהל יעד** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L181](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L181) | תווית טקסט / חיווי מצב בממשק |
| **יצירה ב-AI** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L219](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L219) | תווית טקסט / חיווי מצב בממשק |
| **קהל יעד נבחר:** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L303](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L303) | תווית קבוצת פקדים בעורך / בממשק |
| **רכיבים שיחוברו ללוח:** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L309](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L309) | תווית קבוצת פקדים בעורך / בממשק |
| **מודל AI:** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L337](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L337) | תווית קבוצת פקדים בעורך / בממשק |
| **הנחיות או דגשים מיוחדים לקושאן (אופציונלי):** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L351](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L351) | תווית שדה קלט בטופס או בפאנל העריכה |
| **חולל לוח חדש** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L458](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L458) | תווית טקסט / חיווי מצב בממשק |
| **משתמש בלוח הבקרה הסטנדרטי** | תצוגה ראשית / אזור (KosunBoardForgeView) | [KosunBoardForgeView.tsx#L577](file:///c:/comona/src/modules/KosBoard/components/KosunBoardForgeView.tsx#L577) | תווית טקסט / חיווי מצב בממשק |
| **בחר סאב-דומיין מתוך הלקוחות הקיימים:** | מודאל (SubdomainPairingModal) | [SubdomainPairingModal.tsx#L115](file:///c:/comona/src/modules/KosBoard/components/SubdomainPairingModal.tsx#L115) | תווית שדה קלט בטופס או בפאנל העריכה |
| **או הזן סאב-דומיין חדש ידנית:** | מודאל (SubdomainPairingModal) | [SubdomainPairingModal.tsx#L151](file:///c:/comona/src/modules/KosBoard/components/SubdomainPairingModal.tsx#L151) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קמפיין מייל חדש** | קונפיגורציית ברירת מחדל (index) | [index.ts#L95](file:///c:/comona/src/modules/KosBoard/config/index.ts#L95) | תווית זיהוי לשדה או מדד |
| **שיווק** | קונפיגורציית ברירת מחדל (index) | [index.ts#L95](file:///c:/comona/src/modules/KosBoard/config/index.ts#L95) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **בניית אוטומציה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L96](file:///c:/comona/src/modules/KosBoard/config/index.ts#L96) | תווית זיהוי לשדה או מדד |
| **רשימת תפוצה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L97](file:///c:/comona/src/modules/KosBoard/config/index.ts#L97) | תווית זיהוי לשדה או מדד |
| **נמענים פעילים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L100](file:///c:/comona/src/modules/KosBoard/config/index.ts#L100) | תווית זיהוי לשדה או מדד |
| **קמפיינים שנשלחו** | קונפיגורציית ברירת מחדל (index) | [index.ts#L101](file:///c:/comona/src/modules/KosBoard/config/index.ts#L101) | תווית זיהוי לשדה או מדד |
| **שליחת הודעת וואטסאפ** | קונפיגורציית ברירת מחדל (index) | [index.ts#L109](file:///c:/comona/src/modules/KosBoard/config/index.ts#L109) | תווית זיהוי לשדה או מדד |
| **וואטסאפ** | קונפיגורציית ברירת מחדל (index) | [index.ts#L109](file:///c:/comona/src/modules/KosBoard/config/index.ts#L109) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **תבניות הודעה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L110](file:///c:/comona/src/modules/KosBoard/config/index.ts#L110) | תווית זיהוי לשדה או מדד |
| **שיחות וואטסאפ פעילות** | קונפיגורציית ברירת מחדל (index) | [index.ts#L113](file:///c:/comona/src/modules/KosBoard/config/index.ts#L113) | תווית זיהוי לשדה או מדד |
| **קישור לתשלום מהיר** | קונפיגורציית ברירת מחדל (index) | [index.ts#L121](file:///c:/comona/src/modules/KosBoard/config/index.ts#L121) | תווית זיהוי לשדה או מדד |
| **סליקה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L121](file:///c:/comona/src/modules/KosBoard/config/index.ts#L121) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **הפקת חשבונית/קבלה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L122](file:///c:/comona/src/modules/KosBoard/config/index.ts#L122) | תווית זיהוי לשדה או מדד |
| **סה״כ הכנסות סליקה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L125](file:///c:/comona/src/modules/KosBoard/config/index.ts#L125) | תווית זיהוי לשדה או מדד |
| **עסקאות שאושרו** | קונפיגורציית ברירת מחדל (index) | [index.ts#L126](file:///c:/comona/src/modules/KosBoard/config/index.ts#L126) | תווית זיהוי לשדה או מדד |
| **טופס חכם חדש** | קונפיגורציית ברירת מחדל (index) | [index.ts#L134](file:///c:/comona/src/modules/KosBoard/config/index.ts#L134) | תווית זיהוי לשדה או מדד |
| **טפסים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L134](file:///c:/comona/src/modules/KosBoard/config/index.ts#L134) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **צפייה בלידים שהתקבלו** | קונפיגורציית ברירת מחדל (index) | [index.ts#L135](file:///c:/comona/src/modules/KosBoard/config/index.ts#L135) | תווית זיהוי לשדה או מדד |
| **לידים מטפסים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L138](file:///c:/comona/src/modules/KosBoard/config/index.ts#L138) | תווית זיהוי לשדה או מדד |
| **עריכת דף הבית** | קונפיגורציית ברירת מחדל (index) | [index.ts#L146](file:///c:/comona/src/modules/KosBoard/config/index.ts#L146) | תווית זיהוי לשדה או מדד |
| **אתר** | קונפיגורציית ברירת מחדל (index) | [index.ts#L146](file:///c:/comona/src/modules/KosBoard/config/index.ts#L146) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **דף נחיתה חדש** | קונפיגורציית ברירת מחדל (index) | [index.ts#L147](file:///c:/comona/src/modules/KosBoard/config/index.ts#L147) | תווית זיהוי לשדה או מדד |
| **עמודים מפורסמים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L150](file:///c:/comona/src/modules/KosBoard/config/index.ts#L150) | תווית זיהוי לשדה או מדד |
| **דוח ביצועים מקיף** | קונפיגורציית ברירת מחדל (index) | [index.ts#L158](file:///c:/comona/src/modules/KosBoard/config/index.ts#L158) | תווית זיהוי לשדה או מדד |
| **אנשי קשר ב-CRM** | קונפיגורציית ברירת מחדל (index) | [index.ts#L161](file:///c:/comona/src/modules/KosBoard/config/index.ts#L161) | תווית זיהוי לשדה או מדד |
| **קמפיין גיוס חדש** | קונפיגורציית ברירת מחדל (index) | [index.ts#L169](file:///c:/comona/src/modules/KosBoard/config/index.ts#L169) | תווית זיהוי לשדה או מדד |
| **קמפיין** | קונפיגורציית ברירת מחדל (index) | [index.ts#L169](file:///c:/comona/src/modules/KosBoard/config/index.ts#L169) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **סכום גיוס מצטבר** | קונפיגורציית ברירת מחדל (index) | [index.ts#L172](file:///c:/comona/src/modules/KosBoard/config/index.ts#L172) | תווית זיהוי לשדה או מדד |
| **הפקת תסריט וידאו AI** | קונפיגורציית ברירת מחדל (index) | [index.ts#L180](file:///c:/comona/src/modules/KosBoard/config/index.ts#L180) | תווית זיהוי לשדה או מדד |
| **סרטונים שהופקו** | קונפיגורציית ברירת מחדל (index) | [index.ts#L183](file:///c:/comona/src/modules/KosBoard/config/index.ts#L183) | תווית זיהוי לשדה או מדד |

</div>
