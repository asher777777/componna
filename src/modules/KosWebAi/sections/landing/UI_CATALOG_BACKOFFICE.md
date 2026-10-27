<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועורך (Backoffice Editor): אזור דף נחיתה וטופס הרשמה (Landing Section)

* **שכבה:** באק-אופיס / פאנל עריכת האזור בבונה העמודים (Section Backoffice Editor)
* **תיקיית הרכיב:** [src/modules/KosWebAi/sections/landing](file:///c:/comona/src/modules/KosWebAi/sections/landing)
* **תיאור:** כלל שמות האקורדיונים, הכותרות, התוויות, ארכיטיפי הסגנון, הפלייסהולדרים וכפתורי הפעולה ברכיב העריכה (Section Editor) של האזור דף נחיתה וטופס הרשמה (Landing Section).
* **קבצים שנסרקו בשכבה זו (2):** [LandingEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx), [LandingFormDefaults.ts](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts)
* **סה"כ אלמנטים בשכבה זו:** 141 (אזורים/אקורדיונים: 8, כותרות: 30, פילטרים/טאבים: 8, פלייסהולדרים: 9, כפתורי CTA: 15, תוויות: 71)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (8)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **1. סגנונות פריסה, מיקום הטופס ומסגרת (Layout & Boundary)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L581](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L581) | הגדרות פריסה, תצוגת מודאל, מיקום כפתור ומסגרת פתוחה |
| **2. תוכן, טיפוגרפיה ועוזר AI (Nested Accordion)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L829](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L829) | עריכת כותרות, תיאור, פונטים וסוכן AI |
| **כותרת ראשית, תגית עליונה ועיצוב גופן** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L851](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L851) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **תת-כותרת, תיאור מורחב וכפתור שליחה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1044](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1044) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **3. תמונה, פריצה ממסגרת (Image Overflow) ומדיה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1146](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1146) | תמונה ראשית, גלישה מעבר למסגרת ופינות מעוגלות |
| **4. רקע תמונה מאחורי הטקסט ואפקטי מעבר** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1256](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1256) | רקע תמונה מרחף ואפקטי זום |
| **5. עריכת טופס KFS, שדות, סליקה והודעות WhatsApp** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1374](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1374) | עריכת טופס KFS, שדות, סליקה והודעות WhatsApp |
| **6. צבעי מיתוג וכרטיסים** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1410](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1410) | צבעי רקע ופלטת מיתוג |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (30)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **א. סגנון נשי יוקרתי** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L78](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L78) | כותרת ראשית של האזור / הכרטיס |
| **ב. סגנון גברי עוצמתי** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L99](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L99) | כותרת ראשית של האזור / הכרטיס |
| **ג. סגנון סטנדרטי (נוכחי) מודרני** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L120](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L120) | כותרת ראשית של האזור / הכרטיס |
| **ד. סגנון רוחני והוליסטי** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L141](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L141) | כותרת ראשית של האזור / הכרטיס |
| **ה. סגנון חד וטכנולוגי (Cyber/Sharp)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L162](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L162) | כותרת ראשית של האזור / הכרטיס |
| **ו. סגנון אנליטי ופיננסי (Data-First)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L183](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L183) | כותרת ראשית של האזור / הכרטיס |
| **סנכרן מ-Brand DNA** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L427](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L427) | כותרת ראשית של האזור / הכרטיס |
| **שמור שינויים שלא נשמרו** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L443](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L443) | כותרת ראשית של האזור / הכרטיס |
| **סגור** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L453](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L453) | כותרת ראשית של האזור / הכרטיס |
| **הגדרות פריסה, תצוגת מודאל, מיקום כפתור ומסגרת פתוחה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L585](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L585) | כותרת ראשית של האזור / הכרטיס |
| **מיקום כפתור:** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L670](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L670) | כותרת ראשית של האזור / הכרטיס |
| **יישור תוכן:** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L700](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L700) | כותרת ראשית של האזור / הכרטיס |
| **שפר טקסט כפתור באמצעות AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L732](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L732) | כותרת ראשית של האזור / הכרטיס |
| **עריכת כותרות, תיאור, פונטים וסוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L833](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L833) | כותרת ראשית של האזור / הכרטיס |
| **שפר תגית באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L883](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L883) | כותרת ראשית של האזור / הכרטיס |
| **שפר כותרת באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L909](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L909) | כותרת ראשית של האזור / הכרטיס |
| **גודל גופן** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L934](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L934) | כותרת ראשית של האזור / הכרטיס |
| **משקל גופן (עבה/רגיל)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L961](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L961) | כותרת ראשית של האזור / הכרטיס |
| **נטוי (Italic)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L975](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L975) | כותרת ראשית של האזור / הכרטיס |
| **קו תחתון** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L989](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L989) | כותרת ראשית של האזור / הכרטיס |
| **יישור לימין** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L998](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L998) | כותרת ראשית של האזור / הכרטיס |
| **יישור למרכז** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L999](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L999) | כותרת ראשית של האזור / הכרטיס |
| **יישור לשמאל** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1000](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1000) | כותרת ראשית של האזור / הכרטיס |
| **שפר תת-כותרת באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1076](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1076) | כותרת ראשית של האזור / הכרטיס |
| **שפר תיאור באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1102](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1102) | כותרת ראשית של האזור / הכרטיס |
| **שפר טקסט כפתור באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1128](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1128) | כותרת ראשית של האזור / הכרטיס |
| **תמונה ראשית, גלישה מעבר למסגרת ופינות מעוגלות** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1150](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1150) | כותרת ראשית של האזור / הכרטיס |
| **רקע תמונה מרחף ואפקטי זום** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1260](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1260) | כותרת ראשית של האזור / הכרטיס |
| **עריכת טופס KFS, שדות, סליקה והודעות WhatsApp** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1378](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1378) | כותרת ראשית של האזור / הכרטיס |
| **צבעי רקע ופלטת מיתוג** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1414](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1414) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (8)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ימין (התחלה)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L654](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L654) | שם טאב ניווט או כפתור סינון |
| **Heebo (היבו - ברירת מחדל)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1031](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1031) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Assistant (אסיסטנט)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1032](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1032) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Rubik (רוביק)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1033](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1033) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Alef (אלף)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1034](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1034) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **טלפון נייד** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L24](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L24) | שם טאב ניווט או כפתור סינון |
| **אימייל (אופציונלי)** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L35](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L35) | שם טאב ניווט או כפתור סינון |
| **הערות / הודעה** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L46](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L46) | שם טאב ניווט או כפתור סינון |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (9)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **השאירו פרטים לקבלת מידע** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L722](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L722) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תגית עליונה (באדג** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L873](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L873) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כותרת ראשית של האזור...** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L899](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L899) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תת-כותרת...** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1066](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1066) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תיאור מורחב / פסקה מקדימה...** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1092](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1092) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **טקסט כפתור שליחה...** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1118](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1118) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ישראל ישראלי** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L21](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L21) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **name@example.com** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L43](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L43) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **רשמו כאן פרטים נוספים...** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L54](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L54) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (15)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] סנכרן מ-Brand DNA** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L419](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L419) | סנכרן מ-Brand DNA |
| **[כפתור אייקון] סגור** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L449](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L449) | סגור |
| **שמור וסגור** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L466](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L466) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **צא ללא שמירה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L473](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L473) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L483](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L483) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] שפר טקסט כפתור באמצעות AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L725](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L725) | שפר טקסט כפתור באמצעות AI |
| **[כפתור אייקון] שפר תגית באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L876](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L876) | שפר תגית באמצעות סוכן AI |
| **[כפתור אייקון] שפר כותרת באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L902](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L902) | שפר כותרת באמצעות סוכן AI |
| **[כפתור אייקון] משקל גופן (עבה/רגיל)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L943](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L943) | משקל גופן (עבה/רגיל) |
| **[כפתור אייקון] נטוי (Italic)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L966](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L966) | נטוי (Italic) |
| **[כפתור אייקון] קו תחתון** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L980](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L980) | קו תחתון |
| **[כפתור אייקון] שפר תת-כותרת באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1069](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1069) | שפר תת-כותרת באמצעות סוכן AI |
| **[כפתור אייקון] שפר תיאור באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1095](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1095) | שפר תיאור באמצעות סוכן AI |
| **[כפתור אייקון] שפר טקסט כפתור באמצעות סוכן AI** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1121](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1121) | שפר טקסט כפתור באמצעות סוכן AI |
| **שליחת פרטים עכשיו** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L6](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L6) | כפתור הנעה לפעולה (submit_button_text) |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (71)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L92](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L92) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **• נתוני ביצועים וחוזק •** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L113](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L113) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **• צמיחה והתפתחות •** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L155](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L155) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **• ביצועים ותוצאות שיא •** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L176](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L176) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **• אנליטיקה ואינדקסים •** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L197](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L197) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **דף נחיתה וטופס הרשמה (Landing Section)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L409](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L409) | תווית טקסט / חיווי מצב בממשק |
| **תפריט סגנונות פריסה (רחף מעל אייקון לפירוט)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L499](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L499) | תווית טקסט / חיווי מצב בממשק |
| **1. סגנונות פריסה, מיקום הטופס ומסגרת (Layout & Boundary)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L589](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L589) | תווית טקסט / חיווי מצב בממשק |
| **אזור לא תחום (Unbounded Layout)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L604](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L604) | תווית טקסט / חיווי מצב בממשק |
| **מיקום תצוגת הטופס באזור (Form Placement)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L622](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L622) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טופס משמאל** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L625](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L625) | תווית זיהוי לשדה או מדד |
| **טופס מימין** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L626](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L626) | תווית זיהוי לשדה או מדד |
| **טופס למטה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L627](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L627) | תווית זיהוי לשדה או מדד |
| **פתיחה במודאל** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L628](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L628) | תווית זיהוי לשדה או מדד |
| **מיקום כפתור הפעולה (CTA Placement)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L651](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L651) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מרכז** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L655](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L655) | תווית זיהוי לשדה או מדד |
| **שמאל (סוף)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L656](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L656) | תווית זיהוי לשדה או מדד |
| **יישור טקסט ותוכן כללי** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L681](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L681) | תווית שדה קלט בטופס או בפאנל העריכה |
| **לימין** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L684](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L684) | תווית זיהוי לשדה או מדד |
| **לשמאל** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L686](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L686) | תווית זיהוי לשדה או מדד |
| **סקאלת גודל אובייקטים ומרווחים (Object Scale)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L746](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L746) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קומפקטי** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L749](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L749) | תווית זיהוי לשדה או מדד |
| **מאוזן** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L750](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L750) | תווית זיהוי לשדה או מדד |
| **מרווח** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L751](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L751) | תווית זיהוי לשדה או מדד |
| **צורת כפתורים ותגיות** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L774](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L774) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מעוגל** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L777](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L777) | תווית זיהוי לשדה או מדד |
| **קפסולה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L778](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L778) | תווית זיהוי לשדה או מדד |
| **חד 0px** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L779](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L779) | תווית זיהוי לשדה או מדד |
| **גודל כפתור שליחה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L799](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L799) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קטן** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L802](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L802) | תווית זיהוי לשדה או מדד |
| **בינוני** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L803](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L803) | תווית זיהוי לשדה או מדד |
| **גדול** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L804](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L804) | תווית זיהוי לשדה או מדד |
| **2. תוכן, טיפוגרפיה ועוזר AI (Nested Accordion)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L837](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L837) | תווית טקסט / חיווי מצב בממשק |
| **כותרת ראשית, תגית עליונה ועיצוב גופן** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L856](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L856) | תווית טקסט / חיווי מצב בממשק |
| **גופן כותרת:** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1025](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1025) | תווית קבוצת פקדים בעורך / בממשק |
| **תת-כותרת, תיאור מורחב וכפתור שליחה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1049](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1049) | תווית טקסט / חיווי מצב בממשק |
| **3. תמונה, פריצה ממסגרת (Image Overflow) ומדיה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1154](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1154) | תווית טקסט / חיווי מצב בממשק |
| **תמונה נלווית לצד הטופס (אך ורק מתוך KOSCLOUD)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1167](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1167) | תווית זיהוי לשדה או מדד |
| **תמונה שיוצאת מהמסגרת (Overlapping Image)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1177](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1177) | תווית טקסט / חיווי מצב בממשק |
| **כיוון פריצה מהמסגרת** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1196](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1196) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כלפי מעלה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1199](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1199) | תווית זיהוי לשדה או מדד |
| **כלפי מטה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1200](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1200) | תווית זיהוי לשדה או מדד |
| **לצדדים** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1201](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1201) | תווית זיהוי לשדה או מדד |
| **משולב (מעלה+צד)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1202](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1202) | תווית זיהוי לשדה או מדד |
| **עיגול פינות התמונה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1222](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1222) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ישר 0px** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1225](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1225) | תווית זיהוי לשדה או מדד |
| **מעוגל עדין** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1226](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1226) | תווית זיהוי לשדה או מדד |
| **מעוגל עשיר** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1227](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1227) | תווית זיהוי לשדה או מדד |
| **4. רקע תמונה מאחורי הטקסט ואפקטי מעבר** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1264](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1264) | תווית טקסט / חיווי מצב בממשק |
| **הפעל רקע תמונה אינטראקטיבי** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1283](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1283) | תווית טקסט / חיווי מצב בממשק |
| **תמונת רקע אינטראקטיבית (KOSCLOUD בלבד)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1289](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1289) | תווית זיהוי לשדה או מדד |
| **אפקט מעבר מרחף (Hover Effect)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1295](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1295) | תווית שדה קלט בטופס או בפאנל העריכה |
| **זום והילה (Zoom Glow)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1298](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1298) | תווית זיהוי לשדה או מדד |
| **ברק חולף (Shimmer)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1299](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1299) | תווית זיהוי לשדה או מדד |
| **ריחוף קל (Float)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1300](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1300) | תווית זיהוי לשדה או מדד |
| **מטושטש לחד (Blur)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1301](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1301) | תווית זיהוי לשדה או מדד |
| **מעבר צבע (Shift)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1302](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1302) | תווית זיהוי לשדה או מדד |
| **צבע שכבת כיסוי (Overlay Color)** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1323](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1323) | תווית זיהוי לשדה או מדד |
| **שקיפות שכבת כיסוי: %** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1329](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1329) | תווית שדה קלט בטופס או בפאנל העריכה |
| **היקף תחולת רקע התמונה** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1344](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1344) | תווית שדה קלט בטופס או בפאנל העריכה |
| **על כרטיס האזור בלבד** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1347](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1347) | תווית זיהוי לשדה או מדד |
| **על כל שטח האזור** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1348](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1348) | תווית זיהוי לשדה או מדד |
| **5. עריכת טופס KFS, שדות, סליקה והודעות WhatsApp** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1382](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1382) | תווית טקסט / חיווי מצב בממשק |
| **6. צבעי מיתוג וכרטיסים** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1418](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1418) | תווית טקסט / חיווי מצב בממשק |
| **צבע רקע כללי של האזור** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1432](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1432) | תווית זיהוי לשדה או מדד |
| **צבע רקע כרטיס הטופס** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1438](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1438) | תווית זיהוי לשדה או מדד |
| **צבע הדגשה / Accent** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1444](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1444) | תווית זיהוי לשדה או מדד |
| **צבע כותרת ראשית** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1450](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1450) | תווית זיהוי לשדה או מדד |
| **צבע תת-כותרת** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1456](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1456) | תווית זיהוי לשדה או מדד |
| **צבע תיאור מורחב** | עורך הגדרות (LandingEditor) | [LandingEditor.tsx#L1462](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingEditor.tsx#L1462) | תווית זיהוי לשדה או מדד |
| **שם מלא** | רכיב (LandingFormDefaults) | [LandingFormDefaults.ts#L13](file:///c:/comona/src/modules/KosWebAi/sections/landing/LandingFormDefaults.ts#L13) | תווית זיהוי לשדה או מדד |

</div>
