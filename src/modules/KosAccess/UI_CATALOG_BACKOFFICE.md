<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): מערכת נגישות אתרים (KosAccess)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosAccess](file:///c:/comona/src/modules/KosAccess)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של מערכת נגישות אתרים (KosAccess).
* **קבצים שנסרקו בשכבה זו (16):** [index.ts](file:///c:/comona/src/modules/KosAccess/api/index.ts), [index.ts](file:///c:/comona/src/modules/KosAccess/components/index.ts), [index.ts](file:///c:/comona/src/modules/KosAccess/config/index.ts), [index.ts](file:///c:/comona/src/modules/KosAccess/context/index.ts), [KosAccessContext.tsx](file:///c:/comona/src/modules/KosAccess/context/KosAccessContext.tsx), [index.ts](file:///c:/comona/src/modules/KosAccess/hooks/index.ts), [useKosAccess.ts](file:///c:/comona/src/modules/KosAccess/hooks/useKosAccess.ts), [index.ts](file:///c:/comona/src/modules/KosAccess/index.ts), [index.ts](file:///c:/comona/src/modules/KosAccess/routes/index.ts), [KosAccessRoutes.tsx](file:///c:/comona/src/modules/KosAccess/routes/KosAccessRoutes.tsx), [index.ts](file:///c:/comona/src/modules/KosAccess/services/index.ts), [kosAccessFirestore.ts](file:///c:/comona/src/modules/KosAccess/services/kosAccessFirestore.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosAccess/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosAccess/types/index.ts), [index.ts](file:///c:/comona/src/modules/KosAccess/views/index.ts), [KosAccessAdminView.tsx](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx)
* **סה"כ אלמנטים בשכבה זו:** 52 (אזורים/אקורדיונים: 0, כותרות: 20, פילטרים/טאבים: 10, פלייסהולדרים: 5, כפתורי CTA: 4, תוויות: 13)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (20)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **מותאם לדיסלקציה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L47](file:///c:/comona/src/modules/KosAccess/config/index.ts#L47) | כותרת ראשית של האזור / הכרטיס |
| **עיוורון צבעים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L58](file:///c:/comona/src/modules/KosAccess/config/index.ts#L58) | כותרת ראשית של האזור / הכרטיס |
| **מוגבלות מוטורית ומקלדת** | קונפיגורציית ברירת מחדל (index) | [index.ts#L69](file:///c:/comona/src/modules/KosAccess/config/index.ts#L69) | כותרת ראשית של האזור / הכרטיס |
| **בני הגיל השלישי** | קונפיגורציית ברירת מחדל (index) | [index.ts#L80](file:///c:/comona/src/modules/KosAccess/config/index.ts#L80) | כותרת ראשית של האזור / הכרטיס |
| **תאימות לתקן ישראלי ת** | קונפיגורציית ברירת מחדל (index) | [index.ts#L97](file:///c:/comona/src/modules/KosAccess/config/index.ts#L97) | כותרת ראשית של האזור / הכרטיס |
| **חובת פרסום הצהרת נגישות נגישה ומעודכנת** | קונפיגורציית ברירת מחדל (index) | [index.ts#L106](file:///c:/comona/src/modules/KosAccess/config/index.ts#L106) | כותרת ראשית של האזור / הכרטיס |
| **נגישות מלאה ממקלדת (Keyboard Accessible)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L115](file:///c:/comona/src/modules/KosAccess/config/index.ts#L115) | כותרת ראשית של האזור / הכרטיס |
| **עקיפת בלוקים - קישור** | קונפיגורציית ברירת מחדל (index) | [index.ts#L124](file:///c:/comona/src/modules/KosAccess/config/index.ts#L124) | כותרת ראשית של האזור / הכרטיס |
| **יחס ניגודיות צבעים תקני (Contrast Ratio)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L133](file:///c:/comona/src/modules/KosAccess/config/index.ts#L133) | כותרת ראשית של האזור / הכרטיס |
| **שינוי גודל טקסט ללא שבירת פריסה (Reflow)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L142](file:///c:/comona/src/modules/KosAccess/config/index.ts#L142) | כותרת ראשית של האזור / הכרטיס |
| **עצירת הבהובים ואנימציות (Pause / Stop)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L151](file:///c:/comona/src/modules/KosAccess/config/index.ts#L151) | כותרת ראשית של האזור / הכרטיס |
| **גודל שטח מגע במובייל (Target Size)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L160](file:///c:/comona/src/modules/KosAccess/config/index.ts#L160) | כותרת ראשית של האזור / הכרטיס |
| **תאימות לקוראי מסך (WAI-ARIA)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L169](file:///c:/comona/src/modules/KosAccess/config/index.ts#L169) | כותרת ראשית של האזור / הכרטיס |
| **ניהול נגישות דיגיטלית - KosAccess** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L122](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L122) | כותרת תצוגה (H1) בתצוגה ראשית / אזור (KosAccessAdminView) |
| **פרטי הארגון והצהרת הנגישות** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L198](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L198) | כותרת תצוגה (H2) בתצוגה ראשית / אזור (KosAccessAdminView) |
| **פרטי רכז/ת הנגישות בארגון** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L256](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L256) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosAccessAdminView) |
| **הסדרי נגישות פיזיים (לסניפים ומשרדים)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L313](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L313) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosAccessAdminView) |
| **פירוט קריטריוני החוק והתקן המכוסים ברכיב** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L388](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L388) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosAccessAdminView) |
| **פניות גולשים על בעיות נגישות (דיווחים שהתקבלו)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L419](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L419) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosAccessAdminView) |
| **אין דיווחי נגישות פתוחים** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L436](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L436) | כותרת תצוגה (H4) בתצוגה ראשית / אזור (KosAccessAdminView) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ליקויי ראייה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L22](file:///c:/comona/src/modules/KosAccess/config/index.ts#L22) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **הפרעות קשב וריכוז (ADHD)** | קונפיגורציית ברירת מחדל (index) | [index.ts#L35](file:///c:/comona/src/modules/KosAccess/config/index.ts#L35) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **עריכת הצהרת נגישות תקנית** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L151](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L151) | סינון נתונים / בחירת תצוגה או סגנון |
| **לוח בקרת עמידה בתקן (Scorecard)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L163](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L163) | סינון נתונים / בחירת תצוגה או סגנון |
| **פניות ומשובי גולשים** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L175](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L175) | סינון נתונים / בחירת תצוגה או סגנון |
| **רמה AA (דרישת החוק בישראל)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L224](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L224) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **רמה AAA (מחמירה ומוגברת)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L225](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L225) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **רמה A (בסיסית)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L226](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L226) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תקן ישראלי ת"י 5568 (משרד התקשורת)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L237](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L237) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **W3C WCAG 2.2 AA (התקן העדכני בעולם)** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L238](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L238) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (5)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **לדוגמה: עמותת KOSUN / חברת קושאן** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L211](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L211) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם מלא** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L268](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L268) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **accessibility@example.com** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L280](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L280) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ימים א** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L304](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L304) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לדוגמה: קיימות חניות נכים מסומנות, כניסה נגישה לכיסא גלגלים, מעלית רחבה עם הכרזה קולית.** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L321](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L321) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (4)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **בדיקת סרגל נגישות חי** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L132](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L132) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **תצוגת הצהרת נגישות** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L138](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L138) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר שינויים... / שמירת הצהרת נגישות** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L336](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L336) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **רענן רשימה** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L422](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L422) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (13)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **שם הארגון / האתר** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L206](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L206) | תווית שדה קלט בטופס או בפאנל העריכה |
| **רמת תאימות לתקן** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L218](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L218) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תקן נגישות מוביל** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L231](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L231) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תאריך בדיקת תאימות אחרונה** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L244](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L244) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם רכז/ת הנגישות** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L263](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L263) | תווית שדה קלט בטופס או בפאנל העריכה |
| **דוא"ל רכז/ת הנגישות** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L275](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L275) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טלפון ישיר לפניות** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L287](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L287) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שעות מענה וזמינות** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L299](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L299) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ציון עמידה כולל** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L355](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L355) | תווית טקסט / חיווי מצב בממשק |
| **100% תקין** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L356](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L356) | תווית טקסט / חיווי מצב בממשק |
| **קריטריונים מחייבים** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L365](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L365) | תווית טקסט / חיווי מצב בממשק |
| **תקן משרד התקשורת** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L377](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L377) | תווית טקסט / חיווי מצב בממשק |
| **ת"י 5568 & WCAG 2.2** | תצוגה ראשית / אזור (KosAccessAdminView) | [KosAccessAdminView.tsx#L378](file:///c:/comona/src/modules/KosAccess/views/KosAccessAdminView.tsx#L378) | תווית טקסט / חיווי מצב בממשק |

</div>
