<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועורך (Backoffice Editor): אזור קטגוריות דינמיות ואינטראקטיביות (Dynamic Categories)

* **שכבה:** באק-אופיס / פאנל עריכת האזור בבונה העמודים (Section Backoffice Editor)
* **תיקיית הרכיב:** [src/modules/KosWebAi/sections/dynamicCategories](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories)
* **תיאור:** כלל שמות האקורדיונים, הכותרות, התוויות, ארכיטיפי הסגנון, הפלייסהולדרים וכפתורי הפעולה ברכיב העריכה (Section Editor) של האזור קטגוריות דינמיות ואינטראקטיביות (Dynamic Categories).
* **קבצים שנסרקו בשכבה זו (1):** [DynamicCategoriesEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx)
* **סה"כ אלמנטים בשכבה זו:** 92 (אזורים/אקורדיונים: 7, כותרות: 29, פילטרים/טאבים: 10, פלייסהולדרים: 7, כפתורי CTA: 11, תוויות: 28)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (7)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגנונות עיצוב מסונכרנים (6 Presets)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L257](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L257) | בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג |
| **תוכן וטיפוגרפיה (Nested Accordion)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L337](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L337) | עריכת תוכן, כותרות, פונטים ועורך WYSIWYG |
| **כותרות ושדרוג AI** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L359](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L359) | כותרת, תת-כותרת ותגית עם AI |
| **עריכת פונטים וטיפוגרפיה (אייקונים וטולטיפים בלבד)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L438](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L438) | שליטה מלאה בגודל, צבע, משקל ויישור פונטים |
| **עורך תוכן עשיר (WYSIWYG + AI)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L571](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L571) | עורך WYSIWYG עשיר לתיאור מורחב ומחובר ל-AI |
| **כרטיסי קטגוריות דינמיים ()** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L603](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L603) | ניהול והגדרת קטגוריות, קישורים ומדיה מ-KOSCLOUD |
| **רקע ומדיה מ-KOSCLOUD** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L765](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L765) | הגדרת צבעי רקע ומדיה מתוך KOSCLOUD |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (29)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **קטגוריה חדשה** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L218](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L218) | כותרת ראשית של האזור / הכרטיס |
| **תיאור קצר וממוקד** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L219](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L219) | כותרת משנה של האזור / המודאל |
| **קפיצה עדינה** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L308](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L308) | כותרת ראשית של האזור / הכרטיס |
| **פעימה רכה** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L309](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L309) | כותרת ראשית של האזור / הכרטיס |
| **ציפה וריחוף** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L310](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L310) | כותרת ראשית של האזור / הכרטיס |
| **נענוע קל** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L311](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L311) | כותרת ראשית של האזור / הכרטיס |
| **הגדלה במעבר** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L312](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L312) | כותרת ראשית של האזור / הכרטיס |
| **עריכת תוכן, כותרות, פונטים ועורך WYSIWYG** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L341](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L341) | כותרת ראשית של האזור / הכרטיס |
| **כותרת, תת-כותרת ותגית עם AI** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L363](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L363) | כותרת ראשית של האזור / הכרטיס |
| **שפר תגית באמצעות סוכן ה-AI של המותג** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L389](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L389) | כותרת ראשית של האזור / הכרטיס |
| **שפר כותרת באמצעות סוכן ה-AI של המותג** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L408](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L408) | כותרת ראשית של האזור / הכרטיס |
| **שפר תת-כותרת באמצעות סוכן ה-AI של המותג** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L427](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L427) | כותרת ראשית של האזור / הכרטיס |
| **שליטה מלאה בגודל, צבע, משקל ויישור פונטים** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L442](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L442) | כותרת ראשית של האזור / הכרטיס |
| **יישור לימין** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L466](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L466) | כותרת ראשית של האזור / הכרטיס |
| **יישור למרכז** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L477](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L477) | כותרת ראשית של האזור / הכרטיס |
| **יישור לשמאל** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L488](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L488) | כותרת ראשית של האזור / הכרטיס |
| **כתב מודגש (Bold)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L503](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L503) | כותרת ראשית של האזור / הכרטיס |
| **כתב נטוי (Italic)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L514](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L514) | כותרת ראשית של האזור / הכרטיס |
| **קו תחתון (Underline)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L525](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L525) | כותרת ראשית של האזור / הכרטיס |
| **גודל גופן:** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L544](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L544) | כותרת ראשית של האזור / הכרטיס |
| **עורך WYSIWYG עשיר לתיאור מורחב ומחובר ל-AI** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L575](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L575) | כותרת ראשית של האזור / הכרטיס |
| **ניהול והגדרת קטגוריות, קישורים ומדיה מ-KOSCLOUD** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L607](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L607) | כותרת ראשית של האזור / הכרטיס |
| **מחק קטגוריה זו** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L635](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L635) | כותרת ראשית של האזור / הכרטיס |
| **בחירת עמוד ארכיון לשיוך (ממלא אוטומטית כברירת מחדל את השם והתיאור הניתנים לעריכה)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L684](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L684) | כותרת ראשית של האזור / הכרטיס |
| **שם הקטגוריה (מוגדר כברירת מחדל לפי שם הארכיון וניתן לשינוי חופשי)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L705](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L705) | כותרת ראשית של האזור / הכרטיס |
| **כתובת קישור יעד (מתעדכנת אוטומטית בעת בחירת ארכיון וניתנת לשינוי)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L724](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L724) | כותרת ראשית של האזור / הכרטיס |
| **בחירת אייקון מובנה** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L730](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L730) | כותרת ראשית של האזור / הכרטיס |
| **הוספת כרטיס קטגוריה חדש** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L754](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L754) | כותרת ראשית של האזור / הכרטיס |
| **הגדרת צבעי רקע ומדיה מתוך KOSCLOUD** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L769](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L769) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **פודקאסט / מיקרופון** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L55](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L55) | שם טאב ניווט או כפתור סינון |
| **כנסים / לב** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L56](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L56) | שם טאב ניווט או כפתור סינון |
| **ארכיון מאמרים ותוכן (KOSINFO)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L78](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L78) | שם טאב ניווט או כפתור סינון |
| **סטנדרטי ומאוזן (כיפות עגולות)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L245](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L245) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **נשי ורך (ורוד/פסטל מעוגל)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L246](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L246) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **גברי ועוצמתי (שחור/כחול חד)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L247](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L247) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **רוחני ועדין (סגול/לוטוס)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L248](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L248) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **חד וטכנולוגי (0px קשתות חדות)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L249](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L249) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **אנליטי ומדעי (מסגרות HUD)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L250](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L250) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L261](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L261) | אפשרות בחירת סגנון / תצוגה / פילטר |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (7)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **תגית עליונה...** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L382](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L382) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כותרת ראשית ברורה...** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L401](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L401) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תת-כותרת מסבירה...** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L420](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L420) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תיאור מורחב של המתחמים והשירותים מתוך חזון המותג...** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L592](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L592) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם הארכיון / כותרת הקטגוריה...** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L703](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L703) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תת-כותרת / הסבר...** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L711](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L711) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתובת קישור (URL)...** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L722](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L722) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (11)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] שפר תגית באמצעות סוכן ה-AI של המותג** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L385](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L385) | שפר תגית באמצעות סוכן ה-AI של המותג |
| **[כפתור אייקון] שפר כותרת באמצעות סוכן ה-AI של המותג** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L404](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L404) | שפר כותרת באמצעות סוכן ה-AI של המותג |
| **[כפתור אייקון] שפר תת-כותרת באמצעות סוכן ה-AI של המותג** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L423](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L423) | שפר תת-כותרת באמצעות סוכן ה-AI של המותג |
| **[כפתור אייקון] יישור לימין** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L459](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L459) | יישור לימין |
| **[כפתור אייקון] יישור למרכז** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L470](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L470) | יישור למרכז |
| **[כפתור אייקון] יישור לשמאל** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L481](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L481) | יישור לשמאל |
| **[כפתור אייקון] כתב מודגש (Bold)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L496](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L496) | כתב מודגש (Bold) |
| **[כפתור אייקון] כתב נטוי (Italic)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L507](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L507) | כתב נטוי (Italic) |
| **[כפתור אייקון] קו תחתון (Underline)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L518](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L518) | קו תחתון (Underline) |
| **[כפתור אייקון] מחק קטגוריה זו** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L631](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L631) | מחק קטגוריה זו |
| **הוסף קטגוריה** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L750](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L750) | הוספת כרטיס קטגוריה חדש |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (28)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **קורסים / תיק** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L57](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L57) | תווית זיהוי לשדה או מדד |
| **מאמרים / שיעורים** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L58](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L58) | תווית זיהוי לשדה או מדד |
| **ספר / תוכן** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L59](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L59) | תווית זיהוי לשדה או מדד |
| **אירועים / יומן** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L60](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L60) | תווית זיהוי לשדה או מדד |
| **יוקרה / קסם** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L61](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L61) | תווית זיהוי לשדה או מדד |
| **אנליטיקה / דופק** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L62](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L62) | תווית זיהוי לשדה או מדד |
| **ארכיון כנסים ואירועים (KOSEVENT)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L87](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L87) | תווית זיהוי לשדה או מדד |
| **ארכיון קורסים והכשרות (KOSCOURSE)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L96](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L96) | תווית זיהוי לשדה או מדד |
| **ארכיון וידאו ושידורים (KOSVIDIO)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L105](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L105) | תווית זיהוי לשדה או מדד |
| **ארכיון קהילות ומועדון (KOSCOMMUNITY)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L114](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L114) | תווית זיהוי לשדה או מדד |
| **קמפיינים ותרומות (KOSFUNRISE)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L123](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L123) | תווית זיהוי לשדה או מדד |
| **ארכיון שירותים ומוצרים (KOSASS)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L132](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L132) | תווית זיהוי לשדה או מדד |
| **ארכיון פוסטים ועמודים כלליים (/p/)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L141](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L141) | תווית זיהוי לשדה או מדד |
| **מרכז מוצרים וסליקה (KOSCHECKOUT)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L150](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L150) | תווית זיהוי לשדה או מדד |
| **סגנונות עיצוב מסונכרנים (6 Presets)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L265](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L265) | תווית טקסט / חיווי מצב בממשק |
| **אפקט תנועת אייקונים:** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L305](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L305) | תווית קבוצת פקדים בעורך / בממשק |
| **תוכן וטיפוגרפיה (Nested Accordion)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L345](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L345) | תווית טקסט / חיווי מצב בממשק |
| **כותרות ושדרוג AI** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L365](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L365) | תווית טקסט / חיווי מצב בממשק |
| **עריכת פונטים וטיפוגרפיה (אייקונים וטולטיפים בלבד)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L444](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L444) | תווית טקסט / חיווי מצב בממשק |
| **צבע כותרת ראשית** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L555](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L555) | תווית זיהוי לשדה או מדד |
| **צבע כותרות כרטיסים** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L560](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L560) | תווית זיהוי לשדה או מדד |
| **עורך תוכן עשיר (WYSIWYG + AI)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L577](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L577) | תווית טקסט / חיווי מצב בממשק |
| **שיוך לעמוד ארכיון:** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L644](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L644) | תווית קבוצת פקדים בעורך / בממשק |
| **אייקון/מדיה מותאם מ-KOSCLOUD (אופציונלי)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L742](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L742) | תווית זיהוי לשדה או מדד |
| **רקע ומדיה מ-KOSCLOUD** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L773](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L773) | תווית טקסט / חיווי מצב בממשק |
| **מדיה רקע לאזור מתוך KOSCLOUD (תמונה / וידאו)** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L787](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L787) | תווית זיהוי לשדה או מדד |
| **צבע רקע האזור** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L798](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L798) | תווית זיהוי לשדה או מדד |
| **צבע הדגשה ראשי** | עורך הגדרות (DynamicCategoriesEditor) | [DynamicCategoriesEditor.tsx#L803](file:///c:/comona/src/modules/KosWebAi/sections/dynamicCategories/DynamicCategoriesEditor.tsx#L803) | תווית זיהוי לשדה או מדד |

</div>
