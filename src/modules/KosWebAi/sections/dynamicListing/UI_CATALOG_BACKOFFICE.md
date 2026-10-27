<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועורך (Backoffice Editor): אזור ליסטינג תוכן וקולקציות דינמי (Dynamic Listing)

* **שכבה:** באק-אופיס / פאנל עריכת האזור בבונה העמודים (Section Backoffice Editor)
* **תיקיית הרכיב:** [src/modules/KosWebAi/sections/dynamicListing](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing)
* **תיאור:** כלל שמות האקורדיונים, הכותרות, התוויות, ארכיטיפי הסגנון, הפלייסהולדרים וכפתורי הפעולה ברכיב העריכה (Section Editor) של האזור ליסטינג תוכן וקולקציות דינמי (Dynamic Listing).
* **קבצים שנסרקו בשכבה זו (1):** [DynamicListingEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx)
* **סה"כ אלמנטים בשכבה זו:** 156 (אזורים/אקורדיונים: 5, כותרות: 20, פילטרים/טאבים: 37, פלייסהולדרים: 12, כפתורי CTA: 13, תוויות: 69)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (5)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגנון פריסה, צורות כרטיסים ומיתוג** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L742](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L742) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **מקור התוכן, סנכרון קולקציות ומאגר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1080](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1080) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **כותרות, תיבת חיפוש ופילטרים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1305](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1305) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **צבעים, רקעים ומיתוג ויזואלי** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1415](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1415) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **ניהול פריטי תוכן ידניים ( פריטים)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1470](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1470) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (20)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L93](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L93) | כותרת ראשית של האזור / הכרטיס |
| **כרטיסי פרח/לב מעוגלים בעדינות, פלטת רוז-גולד, קרוסלה חלקה וכפתורי קפסולה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L94](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L94) | כותרת משנה של האזור / המודאל |
| **ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L112](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L112) | כותרת ראשית של האזור / הכרטיס |
| **כרטיס מוביל Bento Spotlight, כרטיסי מגן כהים, זהב מתכתי וגבולות פלדה כפולים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L113](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L113) | כותרת משנה של האזור / המודאל |
| **ג. הפריסה העכשווית (Notion SaaS 2026)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L131](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L131) | כותרת ראשית של האזור / הכרטיס |
| **מבנה Bento מודרני ומאוזן, כרטיסים מעוגלים נקיים, אינדיגו ואמרלד** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L132](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L132) | כותרת משנה של האזור / המודאל |
| **ד. פריסה רוחנית (הרמונית, שלווה ומחוברת)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L150](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L150) | כותרת ראשית של האזור / הכרטיס |
| **כרטיסי לוטוס זורמים, קרוסלה אופקית שקטה, סגול-טורקיז עמוק והילה עוטפת** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L151](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L151) | כותרת משנה של האזור / המודאל |
| **ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L169](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L169) | כותרת ראשית של האזור / הכרטיס |
| **גריד Masonry חותך, זוויות ישרות 90°, גבולות 2px שחור/לבן וצללים קשים מוסטים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L170](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L170) | כותרת משנה של האזור / המודאל |
| **ו. פריסה אנליטית (מבוססת נתונים ודיוק HUD)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L188](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L188) | כותרת ראשית של האזור / הכרטיס |
| **רשימת מגזין Editorial List עם תמונה צפה, כרטיסי HUD טלמטריה וירוק אמרלד** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L189](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L189) | כותרת משנה של האזור / המודאל |
| **מאגר המידע, המדריכים והתוכן של** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L342](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L342) | כותרת ראשית של האזור / הכרטיס |
| **פריט תוכן חדש** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L387](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L387) | כותרת ראשית של האזור / הכרטיס |
| **פירוט קצר על הפריט...** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L388](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L388) | כותרת משנה של האזור / המודאל |
| **סנכרן מ-Brand DNA ומאגר הטננט** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L536](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L536) | כותרת ראשית של האזור / הכרטיס |
| **ספריית עיצובים פומביים ושמירת עיצוב לטננט פומבי** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L549](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L549) | כותרת ראשית של האזור / הכרטיס |
| **שמור שינויים שלא נשמרו** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L565](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L565) | כותרת ראשית של האזור / הכרטיס |
| **סגור** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L579](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L579) | כותרת ראשית של האזור / הכרטיס |
| **מחק פריט** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1573](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1573) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (37)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **1. Bento Showcase (כרטיס מוביל Spotlight + כרטיסי משנה)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L947](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L947) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **2. גריד זכוכית מרחף (Floating Glass Grid עם 3D Tilt)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L948](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L948) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **3. קרוסלה אופקית חלקה (Infinite Snap Carousel)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L949](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L949) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **4. רשימת מגזין יוקרתית (Editorial List עם תמונה צפה)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L950](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L950) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **5. גריד א-סימטרי פינטרסט (Asymmetric Masonry)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L951](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L951) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **6. שורות כסטריפים (Strip Rows - פריסה אופקית מרווחת)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L952](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L952) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **2 עמודות (רחב)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L970](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L970) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **3 עמודות (סטנדרט)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L971](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L971) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **4 עמודות (קומפקטי)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L972](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L972) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **16:9 (וידאו רחב)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L987](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L987) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **4:3 (קלאסי)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L988](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L988) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **1:1 (מרובע)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L989](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L989) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **9:16 (אנכי טיקטוק / סטורי)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L990](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L990) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Border Beam (הילת מסגרת נעה על כרטיס מוביל)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1008](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1008) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Glow Hover (זוהר עדין בריחוף)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1009](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1009) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Tilt 3D (הטיה תלת-ממדית עם תנועת העכבר)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1010](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1010) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **עדין ונקי (Subtle Minimal)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1011](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1011) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כל סוגי העמודים והנתיבים (All)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1119](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1119) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כל עמודי הקטגוריה בטננט (ללא התמקדות בעמוד בודד)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1158](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1158) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **עמודי תוכן, מאמרים ומדריכים (PAGES - ברירת מחדל)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1188](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1188) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **נתיבי הארכיונים והקטגוריות (Archives Hub)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1189](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1189) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הזנה ידנית מותאמת אישית (Custom Items)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1190](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1190) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ספריית המדיה והקבצים של הטננט (Media Hub Gallery)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1191](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1191) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סרטוני וידאו (KOS_TUBE)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1192](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1192) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **פרויקטים וקמפיינים (CAMPAIGNS)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1193](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1193) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כל נתיבי הארכיונים של הטננט (כולם)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1213](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1213) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תאריך: מהחדש ביותר לישן ביותר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1248](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1248) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תאריך: מהישן ביותר לחדש ביותר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1249](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1249) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שם פריט: מא' עד ת' (אלפביתי עולה)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1250](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1250) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שם פריט: מת' עד א' (אלפביתי יורד)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1251](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1251) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סדר ידני מותאם אישית** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1252](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1252) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הצג את כל הפריטים (ללא תנאי לוגי)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1271](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1271) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הצג רק פריטים בעלי תמונה ממשית (הסתר ריקים)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1272](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1272) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הצג רק פריטים מומלצים / מוצרי דגל (Featured Only)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1273](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1273) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הסתר פריטי טיוטה או פריטים שסומנו כמוסתרים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1274](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1274) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **-- בחר עמוד מהטננט --** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1693](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1693) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **⚡ אחר / כתובת URL חיצונית מותאמת אישית** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1699](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1699) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **לדוגמה: מרכז הידע • מאמרים ומדריכים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1327](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1327) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **מאגר המאמרים, המדריכים ומרכז הידע** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1334](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1334) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כל הכלים, התובנות והמדריכים המעשיים שיעזרו לכם לצמוח...** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1341](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1341) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש מהיר במאגר...** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1371](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1371) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **לדוגמה: לכל המאמרים והמדריכים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1388](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1388) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **/blog או #sec-contact** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1399](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1399) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כותרת המאמר / המוצר...** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1591](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1591) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שורת פירוט קצרה...** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1598](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1598) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תיאור מורחב על הפריט...** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1612](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1612) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לדוגמה: מדריכים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1621](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1621) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **מומלץ / חדש** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1628](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1628) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://... או #sec-contact** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1713](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1713) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (13)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] סנכרן מ-Brand DNA ומאגר הטננט** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L526](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L526) | סנכרן מ-Brand DNA ומאגר הטננט |
| **[כפתור אייקון] ספריית עיצובים פומביים ושמירת עיצוב לטננט פומבי** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L541](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L541) | ספריית עיצובים פומביים ושמירת עיצוב לטננט פומבי |
| **[כפתור אייקון] סגור** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L571](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L571) | סגור |
| **שמור וסגור** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L598](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L598) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **צא ללא שמירה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L605](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L605) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L619](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L619) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **1. קטגוריות בימין ⟵ חיפוש בשמאל (רגיל)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L875](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L875) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **2. חיפוש בימין ⟵ קטגוריות בשמאל (סדר הפוך)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L890](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L890) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **נקה בחירת עמוד** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1136](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1136) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף פריט חדש** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1494](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1494) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] מחק פריט** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1566](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1566) | מחק פריט |
| **הצג על גבי מודל צף** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1722](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1722) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מעבר ישיר לאתר / עמוד** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1737](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1737) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (69)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **בחירה מהירה לפי סגנון (רחף מעל אייקון לפירוט מלא)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L639](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L639) | תווית טקסט / חיווי מצב בממשק |
| **סגנון פריסה, צורות כרטיסים ומיתוג** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L749](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L749) | תווית טקסט / חיווי מצב בממשק |
| **בחר סגנון מותאם (רשימה מפורטת שורה תחת שורה):** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L762](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L762) | תווית שדה קלט בטופס או בפאנל העריכה |
| **צורת התיבות / הכרטיסים (Box Shape)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L830](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L830) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מעוגל קלאסי (Rounded)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L836](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L836) | תווית זיהוי לשדה או מדד |
| **פרח / לב נשי (Flower)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L837](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L837) | תווית זיהוי לשדה או מדד |
| **לב מיוחד (Heart)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L838](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L838) | תווית זיהוי לשדה או מדד |
| **מגן גברי (Shield)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L839](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L839) | תווית זיהוי לשדה או מדד |
| **לוטוס רוחני (Lotus)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L840](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L840) | תווית זיהוי לשדה או מדד |
| **חד 90° ברוטליסטי (Sharp)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L841](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L841) | תווית זיהוי לשדה או מדד |
| **אנליטי HUD טכנולוגי (HUD)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L842](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L842) | תווית זיהוי לשדה או מדד |
| **סדר הפקדים (קטגוריות מול חיפוש - מימין לשמאל / משמאל לימין)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L870](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L870) | תווית שדה קלט בטופס או בפאנל העריכה |
| **1. קטגוריות בימין ⟵ חיפוש בשמאל** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L886](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L886) | תווית טקסט / חיווי מצב בממשק |
| **(רגיל)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L887](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L887) | תווית טקסט / חיווי מצב בממשק |
| **2. חיפוש בימין ⟵ קטגוריות בשמאל** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L901](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L901) | תווית טקסט / חיווי מצב בממשק |
| **(סדר הפוך)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L902](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L902) | תווית טקסט / חיווי מצב בממשק |
| **צורת כפתורים (Button Shape)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L909](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L909) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אוטומטי לפי סגנון** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L912](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L912) | תווית זיהוי לשדה או מדד |
| **קפסולה מעוגלת (Pill)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L913](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L913) | תווית זיהוי לשדה או מדד |
| **מעוגל מודרני (Rounded)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L914](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L914) | תווית זיהוי לשדה או מדד |
| **מרובע חד (Square)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L915](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L915) | תווית זיהוי לשדה או מדד |
| **תצורת פריסה כללית (Layout)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L937](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L937) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר עמודות בדסקטופ** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L960](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L960) | תווית שדה קלט בטופס או בפאנל העריכה |
| **יחס גובה-רוחב לתמונה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L977](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L977) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אפקט ויזואלי וריחוף** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L998](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L998) | תווית שדה קלט בטופס או בפאנל העריכה |
| **עיצוב גובה הליסטינג** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1018](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1018) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אוטומטי (ברירת מחדל)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1028](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1028) | תווית זיהוי לשדה או מדד |
| **קומפקטי** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1029](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1029) | תווית זיהוי לשדה או מדד |
| **בינוני** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1030](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1030) | תווית זיהוי לשדה או מדד |
| **גבוה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1031](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1031) | תווית זיהוי לשדה או מדד |
| **מותאם אישית** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1032](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1032) | תווית זיהוי לשדה או מדד |
| **גובה בפיקסלים:** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1053](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1053) | תווית קבוצת פקדים בעורך / בממשק |
| **מקור התוכן, סנכרון קולקציות ומאגר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1087](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1087) | תווית טקסט / חיווי מצב בממשק |
| **נתיב קטגוריה בטננט (סינון נתיב)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1100](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1100) | תווית שדה קלט בטופס או בפאנל העריכה |
| **עמוד ספציפי מהטננט (משיכת נתונים אוטומטית לאזור)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1133](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1133) | תווית טקסט / חיווי מצב בממשק |
| **טוען עמודים זמינים...** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1147](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1147) | תווית טקסט / חיווי מצב בממשק |
| **סוג מקור התוכן** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1178](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1178) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סינון נתיב ארכיון ספציפי** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1200](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1200) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונה מותאמת לאזור (דריסת תמונת הרקע / כרטיס ראשי)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1227](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1227) | תווית זיהוי לשדה או מדד |
| **סדר הצגת הפריטים (סידור לפי תנאי)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1235](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1235) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סינון תנאי לוגי (הסתרה אוטומטית לפי כלל)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1258](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1258) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כמות פריטים מקסימלית להצגה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1279](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1279) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרות, תיבת חיפוש ופילטרים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1312](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1312) | תווית טקסט / חיווי מצב בממשק |
| **תגית עליונה (Badge)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1324](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1324) | תווית זיהוי לשדה או מדד |
| **כותרת ראשית של האזור** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1331](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1331) | תווית זיהוי לשדה או מדד |
| **תת-כותרת / תיאור קצר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1338](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1338) | תווית זיהוי לשדה או מדד |
| **הצג לשוניות סינון קטגוריות** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1352](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1352) | תווית טקסט / חיווי מצב בממשק |
| **הצג תיבת חיפוש מהיר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1362](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1362) | תווית טקסט / חיווי מצב בממשק |
| **טקסט ברירת מחדל לחיפוש (Placeholder)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1368](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1368) | תווית זיהוי לשדה או מדד |
| **כפתור הנעה לפעולה ראשי (בתחתית האזור)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1377](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1377) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טקסט הכפתור (ריק להסתרה)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1380](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1380) | תווית זיהוי לשדה או מדד |
| **קישור הכפתור (URL)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1391](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1391) | תווית זיהוי לשדה או מדד |
| **צבעים, רקעים ומיתוג ויזואלי** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1422](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1422) | תווית טקסט / חיווי מצב בממשק |
| **צבע רקע לאזור** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1435](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1435) | תווית זיהוי לשדה או מדד |
| **צבע רקע לכרטיסים** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1441](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1441) | תווית זיהוי לשדה או מדד |
| **צבע כותרת ראשית** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1447](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1447) | תווית זיהוי לשדה או מדד |
| **צבע הדגשה (Accent Color)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1453](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1453) | תווית זיהוי לשדה או מדד |
| **כותרת הפריט** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1588](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1588) | תווית זיהוי לשדה או מדד |
| **תת-כותרת / שורת תקציר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1595](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1595) | תווית זיהוי לשדה או מדד |
| **תקציר מלא (למודאל)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1602](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1602) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קטגוריה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1618](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1618) | תווית זיהוי לשדה או מדד |
| **תגית מיוחדת (Badge)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1625](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1625) | תווית זיהוי לשדה או מדד |
| **תאריך או מחיר** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1632](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1632) | תווית זיהוי לשדה או מדד |
| **תמונת הפריט** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1640](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1640) | תווית זיהוי לשדה או מדד |
| **שיוך לעמוד בטננט או כתובת אחרת בחירת עמוד תעדכן אוטומטית כותרת ותמונה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1648](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1648) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שיוך לעמוד בטננט או כתובת אחרת** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1649](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1649) | תווית טקסט / חיווי מצב בממשק |
| **בחירת עמוד תעדכן אוטומטית כותרת ותמונה** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1650](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1650) | תווית טקסט / חיווי מצב בממשק |
| **כתובת קישור מותאמת (URL)** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1710](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1710) | תווית זיהוי לשדה או מדד |
| **פעולת לחיצה על הפריט** | עורך הגדרות (DynamicListingEditor) | [DynamicListingEditor.tsx#L1720](file:///c:/comona/src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx#L1720) | תווית שדה קלט בטופס או בפאנל העריכה |

</div>
