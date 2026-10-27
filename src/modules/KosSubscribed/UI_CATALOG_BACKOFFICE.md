<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): ניהול מנויי תוכן, חבילות ומבחנים (KosSubscribed)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosSubscribed](file:///c:/comona/src/modules/KosSubscribed)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של ניהול מנויי תוכן, חבילות ומבחנים (KosSubscribed).
* **קבצים שנסרקו בשכבה זו (22):** [functionsApi.ts](file:///c:/comona/src/modules/KosSubscribed/api/functionsApi.ts), [index.ts](file:///c:/comona/src/modules/KosSubscribed/api/index.ts), [index.ts](file:///c:/comona/src/modules/KosSubscribed/components/index.ts), [KosSubscribedModals.tsx](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx), [PackagesAndDiscountsTab.tsx](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx), [QuizzesFormsTab.tsx](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx), [SubscribersTrackingTab.tsx](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx), [SubscriptionAnalyticsTab.tsx](file:///c:/comona/src/modules/KosSubscribed/components/SubscriptionAnalyticsTab.tsx), [index.ts](file:///c:/comona/src/modules/KosSubscribed/config/index.ts), [index.ts](file:///c:/comona/src/modules/KosSubscribed/context/index.ts), [KosSubscribedContext.tsx](file:///c:/comona/src/modules/KosSubscribed/context/KosSubscribedContext.tsx), [index.ts](file:///c:/comona/src/modules/KosSubscribed/hooks/index.ts), [useKosSubscribed.ts](file:///c:/comona/src/modules/KosSubscribed/hooks/useKosSubscribed.ts), [index.ts](file:///c:/comona/src/modules/KosSubscribed/index.ts), [index.ts](file:///c:/comona/src/modules/KosSubscribed/routes/index.ts), [KosSubscribedRoutes.tsx](file:///c:/comona/src/modules/KosSubscribed/routes/KosSubscribedRoutes.tsx), [index.ts](file:///c:/comona/src/modules/KosSubscribed/services/index.ts), [kosSubscribedService.ts](file:///c:/comona/src/modules/KosSubscribed/services/kosSubscribedService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosSubscribed/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosSubscribed/types/index.ts), [index.ts](file:///c:/comona/src/modules/KosSubscribed/views/index.ts), [KosSubscribedMainView.tsx](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx)
* **סה"כ אלמנטים בשכבה זו:** 138 (אזורים/אקורדיונים: 0, כותרות: 21, פילטרים/טאבים: 21, פלייסהולדרים: 7, כפתורי CTA: 36, תוויות: 53)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (21)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **שאלות המבחן ()** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L684](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L684) | כותרת תצוגה (H3) ברכיב (KosSubscribedModals) |
| **קביעת הרשאות מנוי תוכן** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L897](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L897) | כותרת תצוגה (H3) ברכיב (KosSubscribedModals) |
| **חבילות תוכן חודשיות ושנתיות** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L46](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L46) | כותרת תצוגה (H2) בלשונית תוכן (PackagesAndDiscountsTab) |
| **ערוך חבילה** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L99](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L99) | כותרת ראשית של האזור / הכרטיס |
| **מחק חבילה** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L107](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L107) | כותרת ראשית של האזור / הכרטיס |
| **העתק קישור** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L171](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L171) | כותרת ראשית של האזור / הכרטיס |
| **קופונים והנחות למנויים** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L207](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L207) | כותרת תצוגה (H2) בלשונית תוכן (PackagesAndDiscountsTab) |
| **העתק קוד** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L258](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L258) | כותרת ראשית של האזור / הכרטיס |
| **מחק קופון** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L266](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L266) | כותרת ראשית של האזור / הכרטיס |
| **טפסים של מבחנים ושאלוני הסמכה למנויים** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L33](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L33) | כותרת תצוגה (H2) בלשונית תוכן (QuizzesFormsTab) |
| **ערוך מבחן** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L81](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L81) | כותרת ראשית של האזור / הכרטיס |
| **מחק מבחן** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L89](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L89) | כותרת ראשית של האזור / הכרטיס |
| **אנשי קשר ומעקב מנויים (מסונכרן בזמן אמת מול מונופול ה-CRM)** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L199](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L199) | כותרת תצוגה (H2) בלשונית תוכן (SubscribersTrackingTab) |
| **פתח עמוד תשלום** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L337](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L337) | כותרת ראשית של האזור / הכרטיס |
| **הסר מנוי** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L347](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L347) | כותרת ראשית של האזור / הכרטיס |
| **קבע הרשאות משתמש ומנוי תוכן (חסימת עריכה ו-AI)** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L385](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L385) | כותרת ראשית של האזור / הכרטיס |
| **צפה בלוח הבקרה האישי של המנוי (תוכן, תוכנית, קבלות)** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L398](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L398) | כותרת ראשית של האזור / הכרטיס |
| **אנליטיקת מנויים, גבייה וביצועי חבילות** | לשונית תוכן (SubscriptionAnalyticsTab) | [SubscriptionAnalyticsTab.tsx#L23](file:///c:/comona/src/modules/KosSubscribed/components/SubscriptionAnalyticsTab.tsx#L23) | כותרת תצוגה (H2) בלשונית תוכן (SubscriptionAnalyticsTab) |
| **ביצועים והכנסות לפי חבילת תוכן** | לשונית תוכן (SubscriptionAnalyticsTab) | [SubscriptionAnalyticsTab.tsx#L98](file:///c:/comona/src/modules/KosSubscribed/components/SubscriptionAnalyticsTab.tsx#L98) | כותרת תצוגה (H3) בלשונית תוכן (SubscriptionAnalyticsTab) |
| **יומן חיובים ותשלומי מנויים אחרונים** | לשונית תוכן (SubscriptionAnalyticsTab) | [SubscriptionAnalyticsTab.tsx#L142](file:///c:/comona/src/modules/KosSubscribed/components/SubscriptionAnalyticsTab.tsx#L142) | כותרת תצוגה (H3) בלשונית תוכן (SubscriptionAnalyticsTab) |
| **רענן נתונים מחוזה ה-CRM** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L91](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L91) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (21)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **פעיל (גישה מידית לתוכן)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L308](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L308) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **תקופת ניסיון** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L309](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L309) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ממתין להשלמת תשלום** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L310](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L310) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **חודשי מתחדש** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L444](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L444) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שנתי** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L445](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L445) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **חד פעמי** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L446](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L446) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **אחוז הנחה (%)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L548](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L548) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סכום קבוע בשקלים (₪)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L549](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L549) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כל אנשי הקשר והמנויים** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L159](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L159) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מנויים פעילים בלבד** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L160](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L160) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **בתקופת ניסיון** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L161](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L161) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **בפיגור תשלום** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L162](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L162) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מושהים** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L163](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L163) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מבוטלים** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L164](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L164) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ללא מנוי פעיל (פוטנציאל שידוך)** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L165](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L165) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כל החבילות** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L173](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L173) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **פעיל** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L324](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L324) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ניסיון** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L325](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L325) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **בפיגור** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L326](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L326) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מושהה** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L327](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L327) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מבוטל** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L328](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L328) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (7)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **לדוגמה: WELCOME20 או VIP50** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L293](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L293) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הערה פנימית על המנוי...** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L334](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L334) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **למשל: מסלול VIP - גישה מלאה לתוכן** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L384](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L384) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **VIP2026** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L533](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L533) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הנחה מיוחדת לנרשמים החודש...** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L585](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L585) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **למשל: מבחן הסמכה ליחידת הפרימיום** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L634](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L634) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש איש קשר לפי שם, טלפון, אימייל או שם חבילה...** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L148](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L148) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (36)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ביטול** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L341](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L341) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור ושדך לכרטיס איש הקשר** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L348](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L348) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מייצר ניסוח... / נסח תיאור ויתרונות עם KosAi** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L388](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L388) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור קופון** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L599](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L599) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף שאלה** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L685](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L685) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור וסנכרן עם KSF** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L780](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L780) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חשב ציון ושמור בכרטיס איש הקשר** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L868](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L868) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מנוי רגיל תוכן חבילה בסיסית** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L937](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L937) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מנוי VIP גישה מורחבת לתכנים** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L950](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L950) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מנוי ניסיון תקופת התנסות מוגבלת** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L963](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L963) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור הרשאות מנוי** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L1055](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L1055) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **יצירת חבילה חדשה** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L55](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L55) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] ערוך חבילה** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L92](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L92) | ערוך חבילה |
| **[כפתור אייקון] מחק חבילה** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L103](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L103) | מחק חבילה |
| **[כפתור אייקון] העתק קישור** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L167](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L167) | העתק קישור |
| **צור עמוד תשלום לחבילה (KosWebAi)** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L187](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L187) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **יצירת קופון הנחה** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L216](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L216) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] העתק קוד** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L254](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L254) | העתק קוד |
| **[כפתור אייקון] מחק קופון** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L262](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L262) | מחק קופון |
| **יצירת טופס מבחן חדש** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L42](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L42) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] ערוך מבחן** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L74](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L74) | ערוך מבחן |
| **[כפתור אייקון] מחק מבחן** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L85](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L85) | מחק מבחן |
| **תצוגת שקע KSF** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L132](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L132) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הפעל מבחן לאיש קשר** | לשונית תוכן (QuizzesFormsTab) | [QuizzesFormsTab.tsx#L143](file:///c:/comona/src/modules/KosSubscribed/components/QuizzesFormsTab.tsx#L143) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שדך חבילה לאיש קשר** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L181](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L181) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **גבה תשלום כעת** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L294](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L294) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] הסר מנוי** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L343](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L343) | הסר מנוי |
| **הרשאות** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L378](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L378) | קבע הרשאות משתמש ומנוי תוכן (חסימת עריכה ו-AI) |
| **לוח מנוי** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L391](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L391) | צפה בלוח הבקרה האישי של המנוי (תוכן, תוכנית, קבלות) |
| **שדך חבילה** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L404](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L404) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מבחן** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L417](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L417) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הגש מבחן ובדוק ציון** | רכיב (kosSubscribedService) | [kosSubscribedService.ts#L319](file:///c:/comona/src/modules/KosSubscribed/services/kosSubscribedService.ts#L319) | כפתור הנעה לפעולה (submit_button_text) |
| **[כפתור אייקון] רענן נתונים מחוזה ה-CRM** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L87](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L87) | רענן נתונים מחוזה ה-CRM |
| **הגדר חבילה חדשה** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L96](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L96) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שדך חבילה לאיש קשר** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L108](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L108) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הבנתי** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L137](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L137) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (53)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סגור חלון** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L235](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L235) | תווית זיהוי לשדה או מדד |
| **בחירת איש קשר מקולקציית ה-CRM** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L246](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L246) | תווית שדה קלט בטופס או בפאנל העריכה |
| **בחירת חבילת תוכן לשידוך** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L263](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L263) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קוד קופון / הנחה (אופציונלי)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L286](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L286) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סטטוס המנוי** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L300](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L300) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אמצעי תשלום מתועד** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L315](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L315) | תווית שדה קלט בטופס או בפאנל העריכה |
| **הערות לכרטיס איש הקשר** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L327](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L327) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם חבילת המנוי** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L377](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L377) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור החבילה** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L400](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L400) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מחיר מנוי לאחר הנחה (₪)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L412](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L412) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מחיר מקורי לפני הנחה (₪)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L424](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L424) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מחזור חיוב** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L436](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L436) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ציון מעבר מינימלי במבחן החבילה (%)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L451](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L451) | תווית שדה קלט בטופס או בפאנל העריכה |
| **יתרונות החבילה (כל יתרון בשורה נפרדת)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L463](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L463) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שמור חבילת מנוי** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L515](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L515) | תווית טקסט / חיווי מצב בממשק |
| **קוד קופון (באנגלית/מספרים)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L526](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L526) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סוג הנחה** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L540](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L540) | תווית שדה קלט בטופס או בפאנל העריכה |
| **גובה ההנחה ()** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L554](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L554) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מכסת שימושים מקסימלית** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L566](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L566) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור ההטבה** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L578](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L578) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת טופס המבחן** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L627](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L627) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ציון מעבר נדרש (%)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L640](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L640) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור והנחיות לנבחן** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L652](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L652) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שיוך לחבילת מנוי** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L664](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L664) | תווית שדה קלט בטופס או בפאנל העריכה |
| **בחירת איש קשר נבחן (הציון יישמר בכרטיס איש הקשר ב-CRM)** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L809](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L809) | תווית שדה קלט בטופס או בפאנל העריכה |
| **איש קשר / מנוי:** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L916](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L916) | תווית שדה קלט בטופס או בפאנל העריכה |
| **רמת מנוי (Subscriber Role):** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L933](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L933) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מנוי רגיל** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L946](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L946) | תווית טקסט / חיווי מצב בממשק |
| **תוכן חבילה בסיסית** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L947](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L947) | תווית טקסט / חיווי מצב בממשק |
| **מנוי VIP** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L959](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L959) | תווית טקסט / חיווי מצב בממשק |
| **גישה מורחבת לתכנים** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L960](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L960) | תווית טקסט / חיווי מצב בממשק |
| **מנוי ניסיון** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L972](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L972) | תווית טקסט / חיווי מצב בממשק |
| **תקופת התנסות מוגבלת** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L973](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L973) | תווית טקסט / חיווי מצב בממשק |
| **צפייה בתוכן נעול של החבילה** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L987](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L987) | תווית טקסט / חיווי מצב בממשק |
| **השתתפות במבחנים ושאלונים** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L1000](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L1000) | תווית טקסט / חיווי מצב בממשק |
| **צפייה בפירוט תשלומים והורדת קבלות** | רכיב (KosSubscribedModals) | [KosSubscribedModals.tsx#L1013](file:///c:/comona/src/modules/KosSubscribed/components/KosSubscribedModals.tsx#L1013) | תווית טקסט / חיווי מצב בממשק |
| **פתח עמוד** | לשונית תוכן (PackagesAndDiscountsTab) | [PackagesAndDiscountsTab.tsx#L181](file:///c:/comona/src/modules/KosSubscribed/components/PackagesAndDiscountsTab.tsx#L181) | תווית טקסט / חיווי מצב בממשק |
| **מנויים פעילים** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L81](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L81) | תווית טקסט / חיווי מצב בממשק |
| **הכנסה חודשית קבועה (MRR)** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L96](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L96) | תווית טקסט / חיווי מצב בממשק |
| **ממתינים לגבייה / בפיגור** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L111](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L111) | תווית טקסט / חיווי מצב בממשק |
| **אחוז מעבר מבחני תוכן** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L126](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L126) | תווית טקסט / חיווי מצב בממשק |
| **אין חבילת תוכן משודכת לאיש קשר זה** | לשונית תוכן (SubscribersTrackingTab) | [SubscribersTrackingTab.tsx#L250](file:///c:/comona/src/modules/KosSubscribed/components/SubscribersTrackingTab.tsx#L250) | תווית טקסט / חיווי מצב בממשק |
| **הכנסה חודשית חוזרת (MRR)** | לשונית תוכן (SubscriptionAnalyticsTab) | [SubscriptionAnalyticsTab.tsx#L36](file:///c:/comona/src/modules/KosSubscribed/components/SubscriptionAnalyticsTab.tsx#L36) | תווית טקסט / חיווי מצב בממשק |
| **התפלגות סטטוס מנויים** | לשונית תוכן (SubscriptionAnalyticsTab) | [SubscriptionAnalyticsTab.tsx#L49](file:///c:/comona/src/modules/KosSubscribed/components/SubscriptionAnalyticsTab.tsx#L49) | תווית טקסט / חיווי מצב בממשק |
| **הצלחה במבחני תוכן וערך לקוח** | לשונית תוכן (SubscriptionAnalyticsTab) | [SubscriptionAnalyticsTab.tsx#L82](file:///c:/comona/src/modules/KosSubscribed/components/SubscriptionAnalyticsTab.tsx#L82) | תווית טקסט / חיווי מצב בממשק |
| **שם מלא של הנבחן** | רכיב (kosSubscribedService) | [kosSubscribedService.ts#L289](file:///c:/comona/src/modules/KosSubscribed/services/kosSubscribedService.ts#L289) | תווית זיהוי לשדה או מדד |
| **טלפון נייד (לשמירת הציון בכרטיס איש הקשר)** | רכיב (kosSubscribedService) | [kosSubscribedService.ts#L296](file:///c:/comona/src/modules/KosSubscribed/services/kosSubscribedService.ts#L296) | תווית זיהוי לשדה או מדד |
| **לשונית המנויים ואנשי הקשר** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L49](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L49) | תווית זיהוי לשדה או מדד |
| **מונופול CRM** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L51](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L51) | תגית הדגשה (Badge) בראש האזור או הכרטיס |
| **חבילות חודשיות והנחות** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L53](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L53) | תווית זיהוי לשדה או מדד |
| **טפסים של מבחנים** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L54](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L54) | תווית זיהוי לשדה או מדד |
| **תצוגת תוכן נעולה** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L55](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L55) | תווית זיהוי לשדה או מדד |
| **אנליטיקה ומעקב תשלומים** | תצוגה ראשית / אזור (KosSubscribedMainView) | [KosSubscribedMainView.tsx#L56](file:///c:/comona/src/modules/KosSubscribed/views/KosSubscribedMainView.tsx#L56) | תווית זיהוי לשדה או מדד |

</div>
