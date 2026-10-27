<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועורך (Backoffice Editor): אזור ליסטינג אירועים דינמי (Events Listing)

* **שכבה:** באק-אופיס / פאנל עריכת האזור בבונה העמודים (Section Backoffice Editor)
* **תיקיית הרכיב:** [src/modules/KosWebAi/sections/eventsListing](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing)
* **תיאור:** כלל שמות האקורדיונים, הכותרות, התוויות, ארכיטיפי הסגנון, הפלייסהולדרים וכפתורי הפעולה ברכיב העריכה (Section Editor) של האזור ליסטינג אירועים דינמי (Events Listing).
* **קבצים שנסרקו בשכבה זו (1):** [EventsListingEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx)
* **סה"כ אלמנטים בשכבה זו:** 101 (אזורים/אקורדיונים: 6, כותרות: 27, פילטרים/טאבים: 18, פלייסהולדרים: 11, כפתורי CTA: 12, תוויות: 27)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (6)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגנונות עיצוב ומבנה פריסה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L208](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L208) | בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג וסגנון הכרטיס |
| **תוכן וטיפוגרפיה (Nested Accordion)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L353](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L353) | עריכת תוכן, כותרות, פונטים, עורך WYSIWYG וסוכן AI |
| **כותרת ראשית ותת-כותרת** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L375](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L375) | עריכת כותרת ראשית, גודל גופן, משקל, צבע ויישור |
| **תיאור מורחב (עורך WYSIWYG עשיר)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L605](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L605) | עורך WYSIWYG עשיר עם כפתור AI מובנה |
| **אירועים וזמנים ()** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L638](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L638) | ניהול רשימת האירועים, תאריכים, זמנים, מיקומים ומסכות תמונה (KOSCLOUD בלבד) |
| **צבעי רקע ומדיה מתוך KOSCLOUD** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L873](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L873) | הגדרת צבע רקע, גבולות ומדיית רקע מתוך KOSCLOUD |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (27)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **אירוע חדש** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L176](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L176) | כותרת ראשית של האזור / הכרטיס |
| **תיאור קצר ומזמין** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L177](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L177) | כותרת משנה של האזור / המודאל |
| **תמונה עליונה עם סרט הרשמה + כותרת + 3 עמודות נתונים (מתי / מיקום / תאריך)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L271](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L271) | כותרת ראשית של האזור / הכרטיס |
| **פיצול אופקי: טקסט ומפגשים בימין + מסכת קשת עם תמונה משמאל** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L286](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L286) | כותרת ראשית של האזור / הכרטיס |
| **הילת מותג** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L324](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L324) | כותרת ראשית של האזור / הכרטיס |
| **קרן אור** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L325](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L325) | כותרת ראשית של האזור / הכרטיס |
| **הטיית 3D** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L326](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L326) | כותרת ראשית של האזור / הכרטיס |
| **עריכת תוכן, כותרות, פונטים, עורך WYSIWYG וסוכן AI** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L357](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L357) | כותרת ראשית של האזור / הכרטיס |
| **עריכת כותרת ראשית, גודל גופן, משקל, צבע ויישור** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L379](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L379) | כותרת ראשית של האזור / הכרטיס |
| **שפר תגית באמצעות סוכן AI** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L408](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L408) | כותרת ראשית של האזור / הכרטיס |
| **שפר כותרת באמצעות סוכן AI** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L434](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L434) | כותרת ראשית של האזור / הכרטיס |
| **שפר תת-כותרת באמצעות סוכן AI** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L460](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L460) | כותרת ראשית של האזור / הכרטיס |
| **גודל גופן** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L485](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L485) | כותרת ראשית של האזור / הכרטיס |
| **הדגשה (Bold)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L512](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L512) | כותרת ראשית של האזור / הכרטיס |
| **נטוי (Italic)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L526](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L526) | כותרת ראשית של האזור / הכרטיס |
| **קו תחתון (Underline)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L540](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L540) | כותרת ראשית של האזור / הכרטיס |
| **יישור לימין** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L557](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L557) | כותרת ראשית של האזור / הכרטיס |
| **יישור למרכז** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L570](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L570) | כותרת ראשית של האזור / הכרטיס |
| **יישור לשמאל** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L583](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L583) | כותרת ראשית של האזור / הכרטיס |
| **עורך WYSIWYG עשיר עם כפתור AI מובנה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L609](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L609) | כותרת ראשית של האזור / הכרטיס |
| **ניהול רשימת האירועים, תאריכים, זמנים, מיקומים ומסכות תמונה (KOSCLOUD בלבד)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L642](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L642) | כותרת ראשית של האזור / הכרטיס |
| **שאיבה אוטומטית** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L666](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L666) | כותרת ראשית של האזור / הכרטיס |
| **בחירת עמודים** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L667](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L667) | כותרת ראשית של האזור / הכרטיס |
| **הזנה ידנית** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L668](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L668) | כותרת ראשית של האזור / הכרטיס |
| **הסר אירוע זה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L756](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L756) | כותרת ראשית של האזור / הכרטיס |
| **הוספת אירוע חדש לרשימה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L859](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L859) | כותרת ראשית של האזור / הכרטיס |
| **הגדרת צבע רקע, גבולות ומדיית רקע מתוך KOSCLOUD** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L877](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L877) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (18)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **כרטיס קלאסי (3 עמודות)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L262](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L262) | תמונה עליונה עם סרט הרשמה + כותרת + 3 עמודות נתונים (מתי / מיקום / תאריך) |
| **מפוצל עם קשת (Split Arch)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L277](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L277) | פיצול אופקי: טקסט ומפגשים בימין + מסכת קשת עם תמונה משמאל |
| **סטנדרטי ומאוזן (קרם וענבר)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L62](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L62) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **נשי ורך (ורוד/פסטל מעוגל)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L63](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L63) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **גברי ועוצמתי (שחור/כחול חד)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L64](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L64) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **רוחני ועדין (סגול/לוטוס)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L65](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L65) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **חד וטכנולוגי (0px קווים חדים)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L66](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L66) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **אנליטי ומדעי (מסגרות ירוקות)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L67](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L67) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **קשת עליונה (Arch)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L75](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L75) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **אליפסה שלמה (Oval)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L76](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L76) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **עלי כותרת (Flower)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L77](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L77) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **צורת לב עדינה (Heart)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L78](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L78) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **מעוגל קלאסי (Rounded)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L79](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L79) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **חד גיאומטרי (Sharp)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L80](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L80) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **מסגרת טכנולוגית (HUD)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L81](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L81) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג וסגנון הכרטיס** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L212](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L212) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **ציפה והרמה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L323](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L323) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **קטגוריה: • נתיב: /** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L727](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L727) | אפשרות בחירת סגנון / תצוגה / פילטר |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (11)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **תגית עליונה (באדג** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L398](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L398) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כותרת אזור האירועים...** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L424](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L424) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תת-כותרת והסבר קצר...** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L450](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L450) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם האירוע / הקורס...** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L768](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L768) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **סרט עליון (מחזור תשפ״ז...)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L775](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L775) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תיאור קצר או מנחה האירוע...** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L785](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L785) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **בימי ראשון 20:00** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L797](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L797) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **היברידי: זום ומרכז חיבה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L807](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L807) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כ״א חשון • 10 מפגשים** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L817](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L817) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **טקסט כפתור (לפרטים והצטרפות)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L841](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L841) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתובת קישור (URL / #sec-rsvp)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L848](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L848) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] שפר תגית באמצעות סוכן AI** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L401](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L401) | שפר תגית באמצעות סוכן AI |
| **[כפתור אייקון] שפר כותרת באמצעות סוכן AI** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L427](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L427) | שפר כותרת באמצעות סוכן AI |
| **[כפתור אייקון] שפר תת-כותרת באמצעות סוכן AI** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L453](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L453) | שפר תת-כותרת באמצעות סוכן AI |
| **[כפתור אייקון] הדגשה (Bold)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L494](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L494) | הדגשה (Bold) |
| **[כפתור אייקון] נטוי (Italic)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L517](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L517) | נטוי (Italic) |
| **[כפתור אייקון] קו תחתון (Underline)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L531](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L531) | קו תחתון (Underline) |
| **[כפתור אייקון] יישור לימין** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L548](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L548) | יישור לימין |
| **[כפתור אייקון] יישור למרכז** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L561](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L561) | יישור למרכז |
| **[כפתור אייקון] יישור לשמאל** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L574](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L574) | יישור לשמאל |
| **[כפתור אייקון] הסר אירוע זה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L752](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L752) | הסר אירוע זה |
| **הוסף אירוע חדש** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L855](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L855) | הוספת אירוע חדש לרשימה |
| **לפרטים והצטרפות** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L184](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L184) | כפתור הנעה לפעולה (ctaText) |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (27)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ההרשמה בעיצומה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L178](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L178) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **סגנונות עיצוב ומבנה פריסה** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L216](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L216) | תווית טקסט / חיווי מצב בממשק |
| **6 ארכיטיפי סגנון:** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L230](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L230) | תווית קבוצת פקדים בעורך / בממשק |
| **מבנה כרטיס האירוע:** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L260](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L260) | תווית קבוצת פקדים בעורך / בממשק |
| **כרטיס קלאסי (3 עמודות)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L274](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L274) | תווית טקסט / חיווי מצב בממשק |
| **מפוצל עם קשת (Split Arch)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L289](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L289) | תווית טקסט / חיווי מצב בממשק |
| **צורת מסכת התמונה (Image Mask Shape):** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L296](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L296) | תווית קבוצת פקדים בעורך / בממשק |
| **אפקט כרטיס:** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L320](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L320) | תווית קבוצת פקדים בעורך / בממשק |
| **תוכן וטיפוגרפיה (Nested Accordion)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L361](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L361) | תווית טקסט / חיווי מצב בממשק |
| **כותרת ראשית ותת-כותרת** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L381](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L381) | תווית טקסט / חיווי מצב בממשק |
| **צבע כותרת:** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L592](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L592) | תווית קבוצת פקדים בעורך / בממשק |
| **צבע כותרת** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L594](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L594) | תווית זיהוי לשדה או מדד |
| **תיאור מורחב (עורך WYSIWYG עשיר)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L611](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L611) | תווית טקסט / חיווי מצב בממשק |
| **מקור נתוני האזור:** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L661](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L661) | תווית קבוצת פקדים בעורך / בממשק |
| **שאיבה דינמית מעמודים והגדרות SEO** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L662](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L662) | תווית טקסט / חיווי מצב בממשק |
| **טוען רשימת עמודים...** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L702](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L702) | תווית טקסט / חיווי מצב בממשק |
| **לא נמצאו עמודים קיימים בטננט.** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L705](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L705) | תווית טקסט / חיווי מצב בממשק |
| **מתי (ימים ושעות):** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L792](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L792) | תווית קבוצת פקדים בעורך / בממשק |
| **מיקום / פורמט:** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L802](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L802) | תווית קבוצת פקדים בעורך / בממשק |
| **מתחילים ב / מפגשים:** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L812](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L812) | תווית קבוצת פקדים בעורך / בממשק |
| **תמונת אירוע (KOSCLOUD)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L831](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L831) | תווית זיהוי לשדה או מדד |
| **צבעי רקע ומדיה מתוך KOSCLOUD** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L881](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L881) | תווית טקסט / חיווי מצב בממשק |
| **צבע רקע לאזור** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L895](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L895) | תווית זיהוי לשדה או מדד |
| **צבע רקע לכרטיס** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L900](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L900) | תווית זיהוי לשדה או מדד |
| **צבע הדגשה / כפתור** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L908](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L908) | תווית זיהוי לשדה או מדד |
| **צבע גבולות** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L913](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L913) | תווית זיהוי לשדה או מדד |
| **מדיית רקע (KOSCLOUD)** | עורך הגדרות (EventsListingEditor) | [EventsListingEditor.tsx#L927](file:///c:/comona/src/modules/KosWebAi/sections/eventsListing/EventsListingEditor.tsx#L927) | תווית זיהוי לשדה או מדד |

</div>
