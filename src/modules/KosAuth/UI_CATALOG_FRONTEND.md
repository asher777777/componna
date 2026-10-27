<div dir="rtl" style="text-align: right;">

# 🎨 קטלוג טקסטים ורכיבי UI - פרונט ותצוגה (Frontend): שער התחברות ואימות (auth-portal)

* **שכבה:** פרונט / תצוגת לקוח ונגן (Frontend & Presentation)
* **תיקיית הרכיב:** [src/modules/KosAuth](file:///c:/comona/src/modules/KosAuth)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הפרונט והתצוגה של שער התחברות ואימות (auth-portal).
* **קבצים שנסרקו בשכבה זו (5):** [AuthModal.tsx](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx), [ForgotPasswordView.tsx](file:///c:/comona/src/modules/KosAuth/components/ForgotPasswordView.tsx), [LoginView.tsx](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx), [RegisterView.tsx](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx), [AuthPortalContext.tsx](file:///c:/comona/src/modules/KosAuth/context/AuthPortalContext.tsx)
* **סה"כ אלמנטים בשכבה זו:** 28 (אזורים/אקורדיונים: 0, כותרות: 2, פילטרים/טאבים: 0, פלייסהולדרים: 4, כפתורי CTA: 10, תוויות: 12)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (2)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **אימות והתחברות למערכת** | מודאל (AuthModal) | [AuthModal.tsx#L46](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx#L46) | כותרת תצוגה (H2) במודאל (AuthModal) |
| **כניסה מהירה במצב אנונימי** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L121](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L121) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (4)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **name@example.com** | תצוגה ראשית / אזור (ForgotPasswordView) | [ForgotPasswordView.tsx#L57](file:///c:/comona/src/modules/KosAuth/components/ForgotPasswordView.tsx#L57) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **name@example.com** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L55](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L55) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ישראל ישראלי** | תצוגה ראשית / אזור (RegisterView) | [RegisterView.tsx#L67](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx#L67) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **name@example.com** | תצוגה ראשית / אזור (RegisterView) | [RegisterView.tsx#L82](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx#L82) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הפרופיל שלי** | מודאל (AuthModal) | [AuthModal.tsx#L62](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx#L62) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כניסה** | מודאל (AuthModal) | [AuthModal.tsx#L79](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx#L79) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הרשמה חדשה** | מודאל (AuthModal) | [AuthModal.tsx#L95](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx#L95) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | מודאל (AuthModal) | [AuthModal.tsx#L124](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx#L124) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שולח קישור... / שלח קישור לאיפוס סיסמה** | תצוגה ראשית / אזור (ForgotPasswordView) | [ForgotPasswordView.tsx#L62](file:///c:/comona/src/modules/KosAuth/components/ForgotPasswordView.tsx#L62) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חזרה למסך התחברות** | תצוגה ראשית / אזור (ForgotPasswordView) | [ForgotPasswordView.tsx#L71](file:///c:/comona/src/modules/KosAuth/components/ForgotPasswordView.tsx#L71) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שכחת סיסמה?** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L66](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L66) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מתחבר למערכת... / התחבר עכשיו** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L87](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L87) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כניסה מהירה** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L116](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L116) | כניסה מהירה במצב אנונימי |
| **יוצר חשבון... / צור חשבון והתחבר** | תצוגה ראשית / אזור (RegisterView) | [RegisterView.tsx#L117](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx#L117) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **גישה מאובטחת ל-Firebase, Firestore ו-Storage** | מודאל (AuthModal) | [AuthModal.tsx#L47](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx#L47) | תווית טקסט / חיווי מצב בממשק |
| **אימות מאובטח Firebase Auth** | מודאל (AuthModal) | [AuthModal.tsx#L123](file:///c:/comona/src/modules/KosAuth/components/AuthModal.tsx#L123) | תווית טקסט / חיווי מצב בממשק |
| **איפוס סיסמת משתמש** | תצוגה ראשית / אזור (ForgotPasswordView) | [ForgotPasswordView.tsx#L28](file:///c:/comona/src/modules/KosAuth/components/ForgotPasswordView.tsx#L28) | תווית טקסט / חיווי מצב בממשק |
| **הזן את כתובת האימייל שלך ונשלח אליך קישור מאובטח לאיפוס הסיסמה.** | תצוגה ראשית / אזור (ForgotPasswordView) | [ForgotPasswordView.tsx#L29](file:///c:/comona/src/modules/KosAuth/components/ForgotPasswordView.tsx#L29) | תווית טקסט / חיווי מצב בממשק |
| **כתובת אימייל** | תצוגה ראשית / אזור (ForgotPasswordView) | [ForgotPasswordView.tsx#L48](file:///c:/comona/src/modules/KosAuth/components/ForgotPasswordView.tsx#L48) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת אימייל** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L46](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L46) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סיסמה** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L62](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L62) | תווית שדה קלט בטופס או בפאנל העריכה |
| **או התחבר באמצעות:** | תצוגה ראשית / אזור (LoginView) | [LoginView.tsx#L99](file:///c:/comona/src/modules/KosAuth/components/LoginView.tsx#L99) | תווית קבוצת פקדים בעורך / בממשק |
| **שם מלא / כינוי** | תצוגה ראשית / אזור (RegisterView) | [RegisterView.tsx#L59](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx#L59) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת אימייל** | תצוגה ראשית / אזור (RegisterView) | [RegisterView.tsx#L73](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx#L73) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סיסמה (לפחות 6 תווים)** | תצוגה ראשית / אזור (RegisterView) | [RegisterView.tsx#L88](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx#L88) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אימות סיסמה** | תצוגה ראשית / אזור (RegisterView) | [RegisterView.tsx#L103](file:///c:/comona/src/modules/KosAuth/components/RegisterView.tsx#L103) | תווית שדה קלט בטופס או בפאנל העריכה |

</div>
