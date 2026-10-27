<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): פלטפורמת קליטת לקוחות (client-receiver-platform)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosClientPlatform](file:///c:/comona/src/modules/KosClientPlatform)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של פלטפורמת קליטת לקוחות (client-receiver-platform).
* **קבצים שנסרקו בשכבה זו (7):** [ComponentRegistryTable.tsx](file:///c:/comona/src/modules/KosClientPlatform/components/ComponentRegistryTable.tsx), [ModuleConfigModal.tsx](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx), [index.ts](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts), [ClientPlatformContext.tsx](file:///c:/comona/src/modules/KosClientPlatform/context/ClientPlatformContext.tsx), [index.ts](file:///c:/comona/src/modules/KosClientPlatform/index.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosClientPlatform/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosClientPlatform/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 27 (אזורים/אקורדיונים: 0, כותרות: 4, פילטרים/טאבים: 3, פלייסהולדרים: 2, כפתורי CTA: 4, תוויות: 14)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (4)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **טבלת ניהול והפעלת רכיבי לקוח (Component Control Table)** | טבלה / רשימת נתונים (ComponentRegistryTable) | [ComponentRegistryTable.tsx#L36](file:///c:/comona/src/modules/KosClientPlatform/components/ComponentRegistryTable.tsx#L36) | כותרת תצוגה (H2) בטבלה / רשימת נתונים (ComponentRegistryTable) |
| **הגדר רכיב** | טבלה / רשימת נתונים (ComponentRegistryTable) | [ComponentRegistryTable.tsx#L135](file:///c:/comona/src/modules/KosClientPlatform/components/ComponentRegistryTable.tsx#L135) | כותרת ראשית של האזור / הכרטיס |
| **הגדרות רכיב:** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L49](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L49) | כותרת תצוגה (H3) במודאל (ModuleConfigModal) |
| **מפתחות גישה ואינטגרציות צד-שלישי:** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L99](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L99) | כותרת תצוגה (H4) במודאל (ModuleConfigModal) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **Viewer (צפייה בלבד)** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L90](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L90) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Editor (עריכה ויצירה)** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L91](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L91) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Admin (מנהל מערכת בלבד)** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L92](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L92) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (2)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **/my-slug** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L77](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L77) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הזן ...** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L109](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L109) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (4)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] הגדר רכיב** | טבלה / רשימת נתונים (ComponentRegistryTable) | [ComponentRegistryTable.tsx#L132](file:///c:/comona/src/modules/KosClientPlatform/components/ComponentRegistryTable.tsx#L132) | הגדר רכיב |
| **פתח** | טבלה / רשימת נתונים (ComponentRegistryTable) | [ComponentRegistryTable.tsx#L144](file:///c:/comona/src/modules/KosClientPlatform/components/ComponentRegistryTable.tsx#L144) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L122](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L122) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור הגדרות** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L125](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L125) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (14)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ללא מפתחות** | טבלה / רשימת נתונים (ComponentRegistryTable) | [ComponentRegistryTable.tsx#L126](file:///c:/comona/src/modules/KosClientPlatform/components/ComponentRegistryTable.tsx#L126) | תווית טקסט / חיווי מצב בממשק |
| **כבוי** | טבלה / רשימת נתונים (ComponentRegistryTable) | [ComponentRegistryTable.tsx#L152](file:///c:/comona/src/modules/KosClientPlatform/components/ComponentRegistryTable.tsx#L152) | תווית טקסט / חיווי מצב בממשק |
| **כותרת מותאמת בלוח הבקרה (Display Title)** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L62](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L62) | תווית שדה קלט בטופס או בפאנל העריכה |
| **נתיב גישה (Custom URL Slug)** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L72](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L72) | תווית שדה קלט בטופס או בפאנל העריכה |
| **הרשאת גישה מינימלית** | מודאל (ModuleConfigModal) | [ModuleConfigModal.tsx#L84](file:///c:/comona/src/modules/KosClientPlatform/components/ModuleConfigModal.tsx#L84) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מפתח HeyGen API** | קונפיגורציית ברירת מחדל (index) | [index.ts#L35](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L35) | תווית זיהוי לשדה או מדד |
| **מפתח Google Gemini API** | קונפיגורציית ברירת מחדל (index) | [index.ts#L36](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L36) | תווית זיהוי לשדה או מדד |
| **מפתח Google Gemini AI** | קונפיגורציית ברירת מחדל (index) | [index.ts#L57](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L57) | תווית זיהוי לשדה או מדד |
| **דומיין מותאם אישית** | קונפיגורציית ברירת מחדל (index) | [index.ts#L68](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L68) | תווית זיהוי לשדה או מדד |
| **שרת טלמטריה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L88](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L88) | תווית זיהוי לשדה או מדד |
| **שם משתמש קשר** | קונפיגורציית ברירת מחדל (index) | [index.ts#L136](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L136) | תווית זיהוי לשדה או מדד |
| **מפתח API / סיסמת קשר** | קונפיגורציית ברירת מחדל (index) | [index.ts#L137](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L137) | תווית זיהוי לשדה או מדד |
| **מספר פרויקט / מסוף** | קונפיגורציית ברירת מחדל (index) | [index.ts#L138](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L138) | תווית זיהוי לשדה או מדד |
| **טוקן איזי קאונט (EasyCount)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L139](file:///c:/comona/src/modules/KosClientPlatform/config/index.ts#L139) | תווית זיהוי לשדה או מדד |

</div>
