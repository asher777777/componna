<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): שלד תבנית מודול (_template)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosTemplate](file:///c:/comona/src/modules/KosTemplate)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של שלד תבנית מודול (_template).
* **קבצים שנסרקו בשכבה זו (11):** [functionsApi.ts](file:///c:/comona/src/modules/KosTemplate/api/functionsApi.ts), [ItemForm.tsx](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx), [index.ts](file:///c:/comona/src/modules/KosTemplate/config/index.ts), [ModuleContext.tsx](file:///c:/comona/src/modules/KosTemplate/context/ModuleContext.tsx), [useTemplateItems.ts](file:///c:/comona/src/modules/KosTemplate/hooks/useTemplateItems.ts), [index.ts](file:///c:/comona/src/modules/KosTemplate/index.ts), [index.ts](file:///c:/comona/src/modules/KosTemplate/prompts/index.ts), [ModuleRoutes.tsx](file:///c:/comona/src/modules/KosTemplate/routes/ModuleRoutes.tsx), [firestoreService.ts](file:///c:/comona/src/modules/KosTemplate/services/firestoreService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosTemplate/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosTemplate/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 11 (אזורים/אקורדיונים: 0, כותרות: 1, פילטרים/טאבים: 2, פלייסהולדרים: 2, כפתורי CTA: 3, תוויות: 3)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (1)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **יצירת פריט חדש** | רכיב (ItemForm) | [ItemForm.tsx#L40](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L40) | כותרת תצוגה (H2) ברכיב (ItemForm) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (2)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **פעיל** | רכיב (ItemForm) | [ItemForm.tsx#L73](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L73) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הושלם** | רכיב (ItemForm) | [ItemForm.tsx#L74](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L74) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (2)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הזן כותרת...** | רכיב (ItemForm) | [ItemForm.tsx#L50](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L50) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הזן תיאור מפורט...** | רכיב (ItemForm) | [ItemForm.tsx#L61](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L61) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **חזרה לרשימה** | רכיב (ItemForm) | [ItemForm.tsx#L31](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L31) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | רכיב (ItemForm) | [ItemForm.tsx#L79](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L79) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר... / שמור פריט** | רכיב (ItemForm) | [ItemForm.tsx#L86](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L86) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **כותרת הפריט *** | רכיב (ItemForm) | [ItemForm.tsx#L44](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L44) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור ופרטים** | רכיב (ItemForm) | [ItemForm.tsx#L56](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L56) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סטטוס** | רכיב (ItemForm) | [ItemForm.tsx#L67](file:///c:/comona/src/modules/KosTemplate/components/ItemForm.tsx#L67) | תווית שדה קלט בטופס או בפאנל העריכה |

</div>
