<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועורך (Backoffice Editor): אזור אודות / תוכן מעוצב (Rich Content & WYSIWYG)

* **שכבה:** באק-אופיס / פאנל עריכת האזור בבונה העמודים (Section Backoffice Editor)
* **תיקיית הרכיב:** [src/modules/KosWebAi/sections/richContent](file:///c:/comona/src/modules/KosWebAi/sections/richContent)
* **תיאור:** כלל שמות האקורדיונים, הכותרות, התוויות, ארכיטיפי הסגנון, הפלייסהולדרים וכפתורי הפעולה ברכיב העריכה (Section Editor) של האזור אודות / תוכן מעוצב (Rich Content & WYSIWYG).
* **קבצים שנסרקו בשכבה זו (2):** [RichContentEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx), [RichContentWysiwygEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx)
* **סה"כ אלמנטים בשכבה זו:** 170 (אזורים/אקורדיונים: 6, כותרות: 44, פילטרים/טאבים: 27, פלייסהולדרים: 11, כפתורי CTA: 43, תוויות: 39)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (6)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגנונות פריסה, אופן תצוגת תוכן וגדלים סטנדרטי • קלאסי** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L471](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L471) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **כותרות, עורך תוכן WYSIWYG ושכתוב AI WYSIWYG 2026** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L634](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L634) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **עמודי תווך, ערכים ואבני דרך פריטים** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L715](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L715) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **רקע תמונה מאחורי הטקסט ואפקטי מעבר פעיל / כבוי** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L944](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L944) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **כפתורי הנעה לפעולה (CTA) פעיל / כבוי** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1051](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1051) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **צבעי מיתוג וכרטיסים** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1168](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1168) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (44)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **קווים מעוגלים, רוז-גולד, קשתות אלגנטיות ורוך ויזואלי** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L77](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L77) | כותרת משנה של האזור / המודאל |
| **כותרות ענק דרמטיות, שחור-פחם, זהב מתכתי וכרטיסי פלדה** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L85](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L85) | כותרת משנה של האזור / המודאל |
| **עיצוב SaaS 2026 נקי, אינדיגו וסלייט, מאוזן ואיכותי** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L93](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L93) | כותרת משנה של האזור / המודאל |
| **ירוק מרווה וטורקיז עמוק, זהב חם ואווירת עומק והשראה** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L101](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L101) | כותרת משנה של האזור / המודאל |
| **טיפוגרפיה חדה, פינות ישרות, ניגודיות שחור-לבן מינימליסטית** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L109](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L109) | כותרת משנה של האזור / המודאל |
| **אלמנטים עתידניים, ניאון ציאן, מסגרות HUD ודגש על נתונים** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L117](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L117) | כותרת משנה של האזור / המודאל |
| **אודות** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L327](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L327) | כותרת ראשית של האזור / הכרטיס |
| **החזון והשליחות שלנו** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L328](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L328) | כותרת משנה של האזור / המודאל |
| **ערך או עמוד תווך חדש** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L351](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L351) | כותרת ראשית של האזור / הכרטיס |
| **הגדרות אודות והחזון שלנו** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L408](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L408) | כותרת תצוגה (H2) בעורך הגדרות (RichContentEditor) |
| **סנכרן את הכותרות, החזון והסגנון מתוך ה-Brand DNA** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L433](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L433) | כותרת ראשית של האזור / הכרטיס |
| **סגור** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L460](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L460) | כותרת ראשית של האזור / הכרטיס |
| **איקון לצד הכותרת (אופקי)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L766](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L766) | כותרת ראשית של האזור / הכרטיס |
| **איקון מעל הכותרת (מיושר לימין)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L779](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L779) | כותרת ראשית של האזור / הכרטיס |
| **איקון מעל הכותרת (מרכז)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L792](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L792) | כותרת ראשית של האזור / הכרטיס |
| **פריסה א-סימטרית מדורגת (גבהים ופערים דינמיים בין כרטיסים)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L808](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L808) | כותרת ראשית של האזור / הכרטיס |
| **מחק ערך** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L920](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L920) | כותרת ראשית של האזור / הכרטיס |
| **שינויים לא נשמרו** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1246](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1246) | כותרת תצוגה (H3) בעורך הגדרות (RichContentEditor) |
| **סגנון פסקה וכותרות** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L315](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L315) | כותרת ראשית של האזור / הכרטיס |
| **מודגש (Ctrl+B)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L331](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L331) | כותרת ראשית של האזור / הכרטיס |
| **נטוי (Ctrl+I)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L340](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L340) | כותרת ראשית של האזור / הכרטיס |
| **קו תחתי (Ctrl+U)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L349](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L349) | כותרת ראשית של האזור / הכרטיס |
| **קו חוצה** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L358](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L358) | כותרת ראשית של האזור / הכרטיס |
| **יישור לימין (RTL)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L371](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L371) | כותרת ראשית של האזור / הכרטיס |
| **יישור למרכז** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L380](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L380) | כותרת ראשית של האזור / הכרטיס |
| **יישור לשמאל** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L389](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L389) | כותרת ראשית של האזור / הכרטיס |
| **יישור לשני הצדדים** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L398](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L398) | כותרת ראשית של האזור / הכרטיס |
| **רשימת תבליטים** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L411](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L411) | כותרת ראשית של האזור / הכרטיס |
| **רשימה ממוספרת** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L420](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L420) | כותרת ראשית של האזור / הכרטיס |
| **ציטוט חזון מעוצב (Blockquote)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L433](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L433) | כותרת ראשית של האזור / הכרטיס |
| **הוספת תיבת הדגשה** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L442](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L442) | כותרת ראשית של האזור / הכרטיס |
| **צבע זהב / אמבר** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L454](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L454) | כותרת ראשית של האזור / הכרטיס |
| **צבע אינדיגו** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L461](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L461) | כותרת ראשית של האזור / הכרטיס |
| **צבע רוז** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L468](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L468) | כותרת ראשית של האזור / הכרטיס |
| **צבע טורקיז** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L475](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L475) | כותרת ראשית של האזור / הכרטיס |
| **צבע לבן** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L482](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L482) | כותרת ראשית של האזור / הכרטיס |
| **הוספת קישור** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L494](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L494) | כותרת ראשית של האזור / הכרטיס |
| **נקה עיצוב** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L503](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L503) | כותרת ראשית של האזור / הכרטיס |
| **בטל (Undo)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L512](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L512) | כותרת ראשית של האזור / הכרטיס |
| **בצע שוב (Redo)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L521](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L521) | כותרת ראשית של האזור / הכרטיס |
| **שכתוב והשבחה עם KOSAI המחובר לחזון המותג** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L534](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L534) | כותרת ראשית של האזור / הכרטיס |
| **תצוגה ויזואלית (WYSIWYG)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L550](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L550) | כותרת ראשית של האזור / הכרטיס |
| **תצוגת קוד מקור HTML** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L562](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L562) | כותרת ראשית של האזור / הכרטיס |
| **צא ממסך מלא** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L573](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L573) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (27)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **קומפקטי (Compact)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L587](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L587) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **רגיל (Normal)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L588](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L588) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **גדול ומודגש (Large)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L589](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L589) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ענק (Massive)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L590](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L590) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **אוטומטי (לפי המיתוג)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L603](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L603) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **קפסולה עגולה (Pill)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L604](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L604) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מעוגל מודרני (Rounded)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L605](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L605) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **חד (Sharp)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L606](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L606) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **משופע (Chiseled)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L607](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L607) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **אוטומטי (לפי הפריסה)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L620](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L620) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **משמאל לטקסט** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L621](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L621) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מימין לטקסט** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L622](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L622) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מעל הטקסט** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L623](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L623) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מתחת לטקסט** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L624](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L624) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **זום עדין וזוהר (Zoom Glow)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1006](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1006) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ברק מתכתי (Shimmer Sweep)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1007](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1007) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ציפה פרלקסית (Float Parallax)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1008](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1008) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **חשיפה מטושטשת (Blur Reveal)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1009](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1009) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תנועת גרדיאנט (Gradient Shift)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1010](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1010) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **רק סביב כרטיס הטקסט** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1023](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1023) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **על פני כל שטח האזור** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1024](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1024) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **[כפתור אייקון] תצוגה ויזואלית (WYSIWYG)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L542](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L542) | תצוגה ויזואלית (WYSIWYG) |
| **[כפתור אייקון] תצוגת קוד מקור HTML** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L554](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L554) | תצוגת קוד מקור HTML |
| **פסקה רגילה** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L317](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L317) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **פסקת פתיחה (מודגשת)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L318](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L318) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כותרת H2** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L319](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L319) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כותרת משנה H3** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L320](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L320) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (11)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **אודות והחזון שלנו** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L667](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L667) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **השליחות, הערכים והשאיפה למצוינות** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L680](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L680) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כותרת הערך/השלב** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L906](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L906) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תיאור מורחב של הערך או שלב ההתפתחות...** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L931](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L931) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **טקסט כפתור (לדוגמה: קרא עוד עלינו)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1107](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1107) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **קישור URL (לדוגמה: #contact)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1121](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1121) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **טקסט כפתור משני (לדוגמה: הצטרפות לקהילה)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1142](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1142) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **קישור URL** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1156](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1156) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתבו כאן את תוכן האודות והחזון שלכם...** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L44](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L44) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **קוד HTML מעוצב...** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L597](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L597) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לדוגמה: הדגש 20 שנות ניסיון והתאם לקהל יעד צעיר והייטקי...** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L760](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L760) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (43)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **שחזר מחזון המותג** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L429](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L429) | סנכרן את הכותרות, החזון והסגנון מתוך ה-Brand DNA |
| **נשמר בהצלחה! / שמירה** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L440](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L440) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] סגור** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L456](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L456) | סגור |
| **סגנון** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L512](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L512) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף עמוד תווך** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L742](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L742) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] איקון לצד הכותרת (אופקי)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L757](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L757) | איקון לצד הכותרת (אופקי) |
| **[כפתור אייקון] איקון מעל הכותרת (מיושר לימין)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L770](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L770) | איקון מעל הכותרת (מיושר לימין) |
| **[כפתור אייקון] איקון מעל הכותרת (מרכז)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L783](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L783) | איקון מעל הכותרת (מרכז) |
| **א-סימטרי פעיל / רשת סימטרית** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L799](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L799) | פריסה א-סימטרית מדורגת (גבהים ופערים דינמיים בין כרטיסים) |
| **[כפתור אייקון] מחק ערך** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L916](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L916) | מחק ערך |
| **ביטול** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1225](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1225) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור שינויים** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1232](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1232) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור ללא שמירה** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1251](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1251) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור וסגור** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1261](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1261) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] מודגש (Ctrl+B)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L326](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L326) | מודגש (Ctrl+B) |
| **[כפתור אייקון] נטוי (Ctrl+I)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L335](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L335) | נטוי (Ctrl+I) |
| **[כפתור אייקון] קו תחתי (Ctrl+U)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L344](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L344) | קו תחתי (Ctrl+U) |
| **[כפתור אייקון] קו חוצה** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L353](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L353) | קו חוצה |
| **[כפתור אייקון] יישור לימין (RTL)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L366](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L366) | יישור לימין (RTL) |
| **[כפתור אייקון] יישור למרכז** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L375](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L375) | יישור למרכז |
| **[כפתור אייקון] יישור לשמאל** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L384](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L384) | יישור לשמאל |
| **[כפתור אייקון] יישור לשני הצדדים** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L393](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L393) | יישור לשני הצדדים |
| **[כפתור אייקון] רשימת תבליטים** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L406](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L406) | רשימת תבליטים |
| **[כפתור אייקון] רשימה ממוספרת** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L415](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L415) | רשימה ממוספרת |
| **[כפתור אייקון] ציטוט חזון מעוצב (Blockquote)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L428](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L428) | ציטוט חזון מעוצב (Blockquote) |
| **+ כרטיס הדגשה** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L437](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L437) | הוספת תיבת הדגשה |
| **[כפתור אייקון] צבע זהב / אמבר** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L449](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L449) | צבע זהב / אמבר |
| **[כפתור אייקון] צבע אינדיגו** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L456](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L456) | צבע אינדיגו |
| **[כפתור אייקון] צבע רוז** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L463](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L463) | צבע רוז |
| **[כפתור אייקון] צבע טורקיז** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L470](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L470) | צבע טורקיז |
| **[כפתור אייקון] צבע לבן** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L477](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L477) | צבע לבן |
| **[כפתור אייקון] הוספת קישור** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L489](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L489) | הוספת קישור |
| **[כפתור אייקון] נקה עיצוב** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L498](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L498) | נקה עיצוב |
| **[כפתור אייקון] בטל (Undo)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L507](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L507) | בטל (Undo) |
| **[כפתור אייקון] בצע שוב (Redo)** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L516](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L516) | בצע שוב (Redo) |
| **KOSAI חזון AI** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L530](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L530) | שכתוב והשבחה עם KOSAI המחובר לחזון המותג |
| **ניסוח חזון מלא לפי Brand DNA יצירת סיפור שליחות שלם ומרגש** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L675](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L675) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **עמודי תווך וערכים (4 עקרונות) פירוק החזון לרשימת עקרונות מעוצבת** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L692](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L692) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **תמצות למשפטי מפתח עוצמתיים מיקוד החזון ב-2 פסקאות מחץ** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L709](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L709) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוספת פסקת הנעה לפעולה חמה סגירה מזמינה להתחברות והצטרפות** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L726](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L726) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שכתב** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L763](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L763) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **נסה שוב** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L795](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L795) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **החל תוכן זה בעורך** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L802](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L802) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (39)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגנון מיתוג עיצובי (Brand Presets):** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L498](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L498) | תווית שדה קלט בטופס או בפאנל העריכה |
| **פריסת תוכן החזון והאודות (Content Layout):** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L540](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L540) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קנה מידה וטיפוגרפיה:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L579](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L579) | תווית שדה קלט בטופס או בפאנל העריכה |
| **צורת כפתורים:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L595](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L595) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מיקום תמונת נושא:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L612](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L612) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת ראשית:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L660](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L660) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תת כותרת (תגית עליונה):** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L673](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L673) | תווית שדה קלט בטופס או בפאנל העריכה |
| **גוף התוכן והחזון (עריכה ויזואלית עשירה):** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L688](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L688) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונת נושא / אודות:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L701](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L701) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מסגרת כרטיס:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L819](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L819) | תווית קבוצת פקדים בעורך / בממשק |
| **אוטומטי (לפי מיתוג)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L822](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L822) | תווית זיהוי לשדה או מדד |
| **מעוגל (Rounded 3XL)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L823](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L823) | תווית זיהוי לשדה או מדד |
| **חד (זווית 90°)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L824](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L824) | תווית זיהוי לשדה או מדד |
| **קפסולה / גלולה (Pill)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L825](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L825) | תווית זיהוי לשדה או מדד |
| **קשתי (Arched Top)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L826](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L826) | תווית זיהוי לשדה או מדד |
| **משופע דינמי (Chiseled)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L827](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L827) | תווית זיהוי לשדה או מדד |
| **אפקט מיתוגי:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L853](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L853) | תווית קבוצת פקדים בעורך / בממשק |
| **אוטומטי מיתוגי** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L856](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L856) | תווית זיהוי לשדה או מדד |
| **זוהר מיתוגי מועצם (Brand Glow)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L857](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L857) | תווית זיהוי לשדה או מדד |
| **זכוכית פרוסטד (Glassmorphism)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L858](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L858) | תווית זיהוי לשדה או מדד |
| **מסגרת הילוכית מודגשת (Border Beam)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L859](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L859) | תווית זיהוי לשדה או מדד |
| **מסגרת עבה מודגשת (Heavy Border)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L860](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L860) | תווית זיהוי לשדה או מדד |
| **תמונת רקע לטקסט:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L987](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L987) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אפקט מעבר בריחוף (Hover Effect):** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L998](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L998) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טווח פריסת הרקע:** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1015](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1015) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אטימות שכבת הרקע (Overlay):** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1031](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1031) | תווית קבוצת פקדים בעורך / בממשק |
| **כפתורי הנעה לפעולה (CTA)** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1058](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1058) | תווית טקסט / חיווי מצב בממשק |
| **צבעי מיתוג וכרטיסים** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1175](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1175) | תווית טקסט / חיווי מצב בממשק |
| **צבע רקע האזור** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1188](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1188) | תווית זיהוי לשדה או מדד |
| **צבע כותרת ראשית** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1193](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1193) | תווית זיהוי לשדה או מדד |
| **צבע גוף הטקסט** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1198](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1198) | תווית זיהוי לשדה או מדד |
| **צבע כפתור ראשי** | עורך הגדרות (RichContentEditor) | [RichContentEditor.tsx#L1203](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentEditor.tsx#L1203) | תווית זיהוי לשדה או מדד |
| **אנו מזמינים אתכם לקחת חלק במסע המשותף שלנו לעבר עתיד טוב ומשמעותי יותר.** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L162](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L162) | תווית טקסט / חיווי מצב בממשק |
| **צרו איתנו קשר עוד היום וגלו כיצד החזון שלנו מתחבר ישירות להצלחה שלכם.** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L193](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L193) | תווית טקסט / חיווי מצב בממשק |
| **עורך ויזואלי WYSIWYG פעיל** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L610](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L610) | תווית טקסט / חיווי מצב בממשק |
| **תמצית החזון הרשומה במיתוג:** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L662](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L662) | תווית קבוצת פקדים בעורך / בממשק |
| **בחרו פעולת AI מהירה:** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L671](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L671) | תווית שדה קלט בטופס או בפאנל העריכה |
| **או הזינו הנחיה מותאמת אישית ל-KOSAI:** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L747](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L747) | תווית שדה קלט בטופס או בפאנל העריכה |
| **KOSAI מעבד את תמצית המותג ומנסח מחדש...** | עורך הגדרות (RichContentWysiwygEditor) | [RichContentWysiwygEditor.tsx#L778](file:///c:/comona/src/modules/KosWebAi/sections/richContent/RichContentWysiwygEditor.tsx#L778) | תווית טקסט / חיווי מצב בממשק |

</div>
