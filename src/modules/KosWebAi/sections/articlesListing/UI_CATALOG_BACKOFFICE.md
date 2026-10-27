<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועורך (Backoffice Editor): אזור ליסטינג עמודי תוכן ומאמרים (Articles Listing)

* **שכבה:** באק-אופיס / פאנל עריכת האזור בבונה העמודים (Section Backoffice Editor)
* **תיקיית הרכיב:** [src/modules/KosWebAi/sections/articlesListing](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing)
* **תיאור:** כלל שמות האקורדיונים, הכותרות, התוויות, ארכיטיפי הסגנון, הפלייסהולדרים וכפתורי הפעולה ברכיב העריכה (Section Editor) של האזור ליסטינג עמודי תוכן ומאמרים (Articles Listing).
* **קבצים שנסרקו בשכבה זו (1):** [ArticlesListingEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx)
* **סה"כ אלמנטים בשכבה זו:** 84 (אזורים/אקורדיונים: 8, כותרות: 22, פילטרים/טאבים: 12, פלייסהולדרים: 9, כפתורי CTA: 11, תוויות: 22)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (8)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגנונות עיצוב מסונכרנים (6 Presets)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L147](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L147) | בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג |
| **תוכן, כפתורים וטיפוגרפיה (Nested Accordion)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L198](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L198) | עריכת כותרות, כפתורים, פונטים ועורך WYSIWYG |
| **כותרות וכפתור עליון** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L220](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L220) | כותרת, תת-כותרת וכפתור למרכז התוכן |
| **עריכת פונטים וטיפוגרפיה (אייקונים וטולטיפים בלבד)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L300](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L300) | שליטה מלאה בגודל, צבע, משקל ויישור פונטים |
| **עורך תוכן עשיר (WYSIWYG + AI)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L432](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L432) | עורך WYSIWYG עשיר לתיאור מורחב ומחובר ל-AI |
| **מקור נתונים דינמי וסינון** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L464](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L464) | בחירת מקור נתונים דינמי (עמודי טננט, שירותי מיתוג) והגדרות חיפוש |
| **כרטיסי מאמרים מותאמים אישית ()** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L569](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L569) | ניהול מאמרים ידני, תמונות מ-KOSCLOUD, תגיות וקישורים |
| **רקע האזור ומדיה מ-KOSCLOUD** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L668](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L668) | הגדרת צבעי רקע ומדיה מתוך KOSCLOUD |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (22)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **כותרת מאמר חדש** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L106](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L106) | כותרת ראשית של האזור / הכרטיס |
| **שם הכותב / המרצה** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L107](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L107) | כותרת משנה של האזור / המודאל |
| **עריכת כותרות, כפתורים, פונטים ועורך WYSIWYG** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L202](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L202) | כותרת ראשית של האזור / הכרטיס |
| **כותרת, תת-כותרת וכפתור למרכז התוכן** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L224](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L224) | כותרת ראשית של האזור / הכרטיס |
| **שפר כותרת עם AI** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L250](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L250) | כותרת ראשית של האזור / הכרטיס |
| **שפר תת-כותרת עם AI** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L269](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L269) | כותרת ראשית של האזור / הכרטיס |
| **טקסט כפתור עליון בצד שמאל** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L283](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L283) | כותרת ראשית של האזור / הכרטיס |
| **כתובת קישור של הכפתור העליון** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L291](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L291) | כותרת ראשית של האזור / הכרטיס |
| **שליטה מלאה בגודל, צבע, משקל ויישור פונטים** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L304](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L304) | כותרת ראשית של האזור / הכרטיס |
| **יישור לימין** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L327](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L327) | כותרת ראשית של האזור / הכרטיס |
| **יישור למרכז** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L338](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L338) | כותרת ראשית של האזור / הכרטיס |
| **יישור לשמאל** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L349](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L349) | כותרת ראשית של האזור / הכרטיס |
| **כתב מודגש (Bold)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L364](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L364) | כותרת ראשית של האזור / הכרטיס |
| **כתב נטוי (Italic)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L375](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L375) | כותרת ראשית של האזור / הכרטיס |
| **קו תחתון (Underline)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L386](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L386) | כותרת ראשית של האזור / הכרטיס |
| **גודל גופן:** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L405](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L405) | כותרת ראשית של האזור / הכרטיס |
| **עורך WYSIWYG עשיר לתיאור מורחב ומחובר ל-AI** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L436](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L436) | כותרת ראשית של האזור / הכרטיס |
| **הגדרת כמות הפוסטים או המאמרים שיוצגו בליסטינג** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L559](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L559) | כותרת ראשית של האזור / הכרטיס |
| **ניהול מאמרים ידני, תמונות מ-KOSCLOUD, תגיות וקישורים** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L573](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L573) | כותרת ראשית של האזור / הכרטיס |
| **מחק מאמר זה** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L601](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L601) | כותרת ראשית של האזור / הכרטיס |
| **הוספת כרטיס מאמר חדש** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L657](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L657) | כותרת ראשית של האזור / הכרטיס |
| **הגדרת צבעי רקע ומדיה מתוך KOSCLOUD** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L672](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L672) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סטנדרטי ומאוזן (מנטה/קורל)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L135](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L135) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **נשי ורך (ורוד/פסטל מעוגל)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L136](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L136) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **גברי ועוצמתי (שחור/כחול חד)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L137](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L137) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **רוחני ועדין (סגול/לוטוס)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L138](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L138) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **חד וטכנולוגי (0px זוויות חדות)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L139](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L139) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **אנליטי ומדעי (מסגרות HUD)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L140](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L140) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L151](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L151) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **בחירת מקור נתונים דינמי (עמודי טננט, שירותי מיתוג) והגדרות חיפוש** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L468](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L468) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **תאריך: מהחדש לישן** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L543](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L543) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שם: א' עד ת'** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L544](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L544) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שם: ת' עד א'** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L545](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L545) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סדר ברירת מחדל** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L546](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L546) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (9)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **כותרת ראשית (למשל: מרכז הידע והתוכן)...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L243](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L243) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תת-כותרת...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L262](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L262) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **טקסט כפתור עליון...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L281](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L281) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **קישור כפתור עליון (URL)...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L289](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L289) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תיאור מורחב על מאגר התוכן והחזון של המותג...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L453](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L453) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כותרת המאמר...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L613](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L613) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם הכותב / תת-כותרת...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L620](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L620) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תגית (למשל: כללי, הורות ומשפחה)...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L631](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L631) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתובת קישור (URL)...** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L638](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L638) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (11)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] שפר כותרת עם AI** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L246](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L246) | שפר כותרת עם AI |
| **[כפתור אייקון] שפר תת-כותרת עם AI** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L265](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L265) | שפר תת-כותרת עם AI |
| **[כפתור אייקון] יישור לימין** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L320](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L320) | יישור לימין |
| **[כפתור אייקון] יישור למרכז** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L331](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L331) | יישור למרכז |
| **[כפתור אייקון] יישור לשמאל** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L342](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L342) | יישור לשמאל |
| **[כפתור אייקון] כתב מודגש (Bold)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L357](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L357) | כתב מודגש (Bold) |
| **[כפתור אייקון] כתב נטוי (Italic)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L368](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L368) | כתב נטוי (Italic) |
| **[כפתור אייקון] קו תחתון (Underline)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L379](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L379) | קו תחתון (Underline) |
| **[כפתור אייקון] מחק מאמר זה** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L597](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L597) | מחק מאמר זה |
| **הוסף מאמר** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L653](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L653) | הוספת כרטיס מאמר חדש |
| **למאמר המלא** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L111](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L111) | כפתור הנעה לפעולה (ctaText) |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (22)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגנונות עיצוב מסונכרנים (6 Presets)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L155](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L155) | תווית טקסט / חיווי מצב בממשק |
| **תוכן, כפתורים וטיפוגרפיה (Nested Accordion)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L206](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L206) | תווית טקסט / חיווי מצב בממשק |
| **כותרות וכפתור עליון** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L226](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L226) | תווית טקסט / חיווי מצב בממשק |
| **עריכת פונטים וטיפוגרפיה (אייקונים וטולטיפים בלבד)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L306](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L306) | תווית טקסט / חיווי מצב בממשק |
| **צבע כותרת ראשית** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L416](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L416) | תווית זיהוי לשדה או מדד |
| **צבע כפתור מאמר (CTA)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L421](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L421) | תווית זיהוי לשדה או מדד |
| **עורך תוכן עשיר (WYSIWYG + AI)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L438](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L438) | תווית טקסט / חיווי מצב בממשק |
| **מקור נתונים דינמי וסינון** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L472](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L472) | תווית טקסט / חיווי מצב בממשק |
| **מקור הפריטים** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L486](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L486) | תווית טקסט / חיווי מצב בממשק |
| **דינמי משולב (עמודים ושירותים)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L489](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L489) | תווית זיהוי לשדה או מדד |
| **עמודי תוכן של הטננט בלבד** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L490](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L490) | תווית זיהוי לשדה או מדד |
| **שירותי ומוצרי המיתוג** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L491](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L491) | תווית זיהוי לשדה או מדד |
| **רשימה ידנית מותאמת** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L492](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L492) | תווית זיהוי לשדה או מדד |
| **הצג שורת חיפוש מהיר** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L520](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L520) | תווית טקסט / חיווי מצב בממשק |
| **הצג תגיות סינון** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L530](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L530) | תווית טקסט / חיווי מצב בממשק |
| **סדר הצגת הפריטים:** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L537](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L537) | תווית קבוצת פקדים בעורך / בממשק |
| **כמות מאמרים להצגה:** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L551](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L551) | תווית קבוצת פקדים בעורך / בממשק |
| **תמונת המאמר מתוך KOSCLOUD** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L645](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L645) | תווית זיהוי לשדה או מדד |
| **רקע האזור ומדיה מ-KOSCLOUD** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L676](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L676) | תווית טקסט / חיווי מצב בממשק |
| **מדיה רקע לאזור מתוך KOSCLOUD (תמונה / וידאו)** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L690](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L690) | תווית זיהוי לשדה או מדד |
| **צבע רקע האזור** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L701](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L701) | תווית זיהוי לשדה או מדד |
| **צבע רקע כרטיסי המאמר** | עורך הגדרות (ArticlesListingEditor) | [ArticlesListingEditor.tsx#L706](file:///c:/comona/src/modules/KosWebAi/sections/articlesListing/ArticlesListingEditor.tsx#L706) | תווית זיהוי לשדה או מדד |

</div>
