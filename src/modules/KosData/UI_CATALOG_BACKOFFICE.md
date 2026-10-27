<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): סייר מאגרי מידע וקולקציות (db-collections-hub)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosData](file:///c:/comona/src/modules/KosData)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של סייר מאגרי מידע וקולקציות (db-collections-hub).
* **קבצים שנסרקו בשכבה זו (11):** [CredentialsBar.tsx](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx), [CredentialsModal.tsx](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx), [DocumentDetailModal.tsx](file:///c:/comona/src/modules/KosData/components/DocumentDetailModal.tsx), [DocumentEditorModal.tsx](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx), [index.ts](file:///c:/comona/src/modules/KosData/config/index.ts), [seedData.ts](file:///c:/comona/src/modules/KosData/config/seedData.ts), [DbContext.tsx](file:///c:/comona/src/modules/KosData/context/DbContext.tsx), [index.ts](file:///c:/comona/src/modules/KosData/index.ts), [firestoreAdminService.ts](file:///c:/comona/src/modules/KosData/services/firestoreAdminService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosData/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosData/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 72 (אזורים/אקורדיונים: 0, כותרות: 26, פילטרים/טאבים: 3, פלייסהולדרים: 9, כפתורי CTA: 22, תוויות: 12)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (26)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **מסד נתונים ראשי (default)** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L66](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L66) | כותרת ראשית של האזור / הכרטיס |
| **מסד נתונים aioffice** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L77](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L77) | כותרת ראשית של האזור / הכרטיס |
| **טוען אימות משתמש...** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L88](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L88) | כותרת ראשית של האזור / הכרטיס |
| **ייבא את כל נתוני הפרויקט ל-Firestore** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L146](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L146) | כותרת ראשית של האזור / הכרטיס |
| **האזנה לשינויים במסד הנתונים בזמן אמת** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L160](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L160) | כותרת ראשית של האזור / הכרטיס |
| **רענן מסמכים מקולקציה זו** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L171](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L171) | כותרת ראשית של האזור / הכרטיס |
| **אפס להגדרות המקוריות מ-.env** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L261](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L261) | כותרת ראשית של האזור / הכרטיס |
| **פרטי מסמך Firestore** | מודאל (DocumentDetailModal) | [DocumentDetailModal.tsx#L70](file:///c:/comona/src/modules/KosData/components/DocumentDetailModal.tsx#L70) | כותרת תצוגה (H2) במודאל (DocumentDetailModal) |
| **העתק תוכן JSON ללוח** | מודאל (DocumentDetailModal) | [DocumentDetailModal.tsx#L86](file:///c:/comona/src/modules/KosData/components/DocumentDetailModal.tsx#L86) | כותרת ראשית של האזור / הכרטיס |
| **שיחת היכרות והצגת נגן AI** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L139](file:///c:/comona/src/modules/KosData/config/seedData.ts#L139) | כותרת ראשית של האזור / הכרטיס |
| **טופס קבלת הדגמה - וידאו AI אינטראקטיבי** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L199](file:///c:/comona/src/modules/KosData/config/seedData.ts#L199) | כותרת ראשית של האזור / הכרטיס |
| **פרטים אישיים** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L206](file:///c:/comona/src/modules/KosData/config/seedData.ts#L206) | כותרת ראשית של האזור / הכרטיס |
| **סרטון תדמית והצגת עוזר AI אינטראקטיבי** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L250](file:///c:/comona/src/modules/KosData/config/seedData.ts#L250) | כותרת ראשית של האזור / הכרטיס |
| **דף נחיתה ראשי - Kosun Hub** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L608](file:///c:/comona/src/modules/KosData/config/seedData.ts#L608) | כותרת ראשית של האזור / הכרטיס |
| **פריט תבנית ראשון** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L788](file:///c:/comona/src/modules/KosData/config/seedData.ts#L788) | כותרת ראשית של האזור / הכרטיס |
| **שלום וברוכים הבאים!** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L810](file:///c:/comona/src/modules/KosData/config/seedData.ts#L810) | כותרת תצוגה (H1) בקונפיגורציית ברירת מחדל (seedData) |
| **מבצע קיץ מיוחד** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L838](file:///c:/comona/src/modules/KosData/config/seedData.ts#L838) | כותרת תצוגה (H2) בקונפיגורציית ברירת מחדל (seedData) |
| **קושאן** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L870](file:///c:/comona/src/modules/KosData/config/seedData.ts#L870) | כותרת ראשית של האזור / הכרטיס |
| **מערכת דיוור חכמה** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L870](file:///c:/comona/src/modules/KosData/config/seedData.ts#L870) | כותרת משנה של האזור / המודאל |
| **ברוכים הבאים לעולם של שיווק חכם** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L876](file:///c:/comona/src/modules/KosData/config/seedData.ts#L876) | כותרת ראשית של האזור / הכרטיס |
| **קושאן לוקח אחריות על תהליך הדיוור שלך** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L877](file:///c:/comona/src/modules/KosData/config/seedData.ts#L877) | כותרת משנה של האזור / המודאל |
| **מבצע מיוחד לחברי המועדון** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L910](file:///c:/comona/src/modules/KosData/config/seedData.ts#L910) | כותרת ראשית של האזור / הכרטיס |
| **אל תפספסו את ההזדמנות להגדיל מכירות** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L911](file:///c:/comona/src/modules/KosData/config/seedData.ts#L911) | כותרת משנה של האזור / המודאל |
| **שליחת מייל היכרות ראשוני** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L942](file:///c:/comona/src/modules/KosData/config/seedData.ts#L942) | כותרת ראשית של האזור / הכרטיס |
| **השהיה של 120 דקות** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L953](file:///c:/comona/src/modules/KosData/config/seedData.ts#L953) | כותרת ראשית של האזור / הכרטיס |
| **שליחת הודעת וואטסאפ Green API** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L960](file:///c:/comona/src/modules/KosData/config/seedData.ts#L960) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **String (טקסט)** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L296](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L296) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Number (מספר)** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L297](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L297) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **Boolean (בוליאני)** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L298](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L298) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (9)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **e.g. aioffice-1426f** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L154](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L154) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **e.g. aioffice or (default)** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L169](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L169) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **AIzaSy...** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L184](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L184) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **aioffice-1426f.firebaseapp.com** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L198](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L198) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **aioffice-1426f.firebasestorage.app** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L212](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L212) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **1:485069254738:web:...** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L226](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L226) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **e.g. campaign_sales_01 או השאר ריק** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L224](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L224) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם שדה (key)** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L287](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L287) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **ערך השדה (value)** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L306](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L306) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (22)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] מסד נתונים ראשי (default)** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L59](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L59) | מסד נתונים ראשי (default) |
| **[כפתור אייקון] מסד נתונים aioffice** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L70](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L70) | מסד נתונים aioffice |
| **מזין נתונים... / הזנת נתוני פרויקט ל-Firestore** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L138](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L138) | ייבא את כל נתוני הפרויקט ל-Firestore |
| **Live פעיל / כבוי** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L153](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L153) | האזנה לשינויים במסד הנתונים בזמן אמת |
| **רענן** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L167](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L167) | רענן מסמכים מקולקציה זו |
| **מפתחות פיירבייס** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L178](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L178) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **+ מסמך חדש** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L187](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L187) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בודק... / בדוק חיבור** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L132](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L132) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **איפוס לברירת מחדל (.env)** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L258](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L258) | אפס להגדרות המקוריות מ-.env |
| **סגור** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L274](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L274) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור מפתחות ב-UI** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L280](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L280) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הועתק! / העתק JSON** | מודאל (DocumentDetailModal) | [DocumentDetailModal.tsx#L83](file:///c:/comona/src/modules/KosData/components/DocumentDetailModal.tsx#L83) | העתק תוכן JSON ללוח |
| **מוחק... / מחק מסמך** | מודאל (DocumentDetailModal) | [DocumentDetailModal.tsx#L129](file:///c:/comona/src/modules/KosData/components/DocumentDetailModal.tsx#L129) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | מודאל (DocumentDetailModal) | [DocumentDetailModal.tsx#L139](file:///c:/comona/src/modules/KosData/components/DocumentDetailModal.tsx#L139) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ערוך מסמך** | מודאל (DocumentDetailModal) | [DocumentDetailModal.tsx#L145](file:///c:/comona/src/modules/KosData/components/DocumentDetailModal.tsx#L145) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **טופס שדות** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L187](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L187) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **יישר ועצב JSON** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L237](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L237) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף שדה** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L270](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L270) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L327](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L327) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר במסד... / צור מסמך ב-Firestore / עדכן מסמך** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L341](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L341) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **להתחלת העבודה** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L878](file:///c:/comona/src/modules/KosData/config/seedData.ts#L878) | כפתור הנעה לפעולה (buttonText) |
| **לפרטים נוספים** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L912](file:///c:/comona/src/modules/KosData/config/seedData.ts#L912) | כפתור הנעה לפעולה (buttonText) |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **פרויקט:** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L47](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L47) | תווית קבוצת פקדים בעורך / בממשק |
| **מתחבר...** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L116](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L116) | תווית טקסט / חיווי מצב בממשק |
| **שגיאת חיבור** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L122](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L122) | תווית טקסט / חיווי מצב בממשק |
| **חסרים מפתחות** | סרגל ניווט / כלים (CredentialsBar) | [CredentialsBar.tsx#L128](file:///c:/comona/src/modules/KosData/components/CredentialsBar.tsx#L128) | תווית טקסט / חיווי מצב בממשק |
| **Project ID (מזהה פרויקט)** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L146](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L146) | תווית שדה קלט בטופס או בפאנל העריכה |
| **Firestore Database ID (שם מסד נתונים)** | מודאל (CredentialsModal) | [CredentialsModal.tsx#L161](file:///c:/comona/src/modules/KosData/components/CredentialsModal.tsx#L161) | תווית שדה קלט בטופס או בפאנל העריכה |
| **(השאר ריק ליצירת מזהה אוטומטי ייחודי)** | מודאל (DocumentEditorModal) | [DocumentEditorModal.tsx#L217](file:///c:/comona/src/modules/KosData/components/DocumentEditorModal.tsx#L217) | תווית טקסט / חיווי מצב בממשק |
| **שם מלא** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L208](file:///c:/comona/src/modules/KosData/config/seedData.ts#L208) | תווית זיהוי לשדה או מדד |
| **מספר טלפון וואטסאפ** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L209](file:///c:/comona/src/modules/KosData/config/seedData.ts#L209) | תווית זיהוי לשדה או מדד |
| **כתובת אימייל** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L210](file:///c:/comona/src/modules/KosData/config/seedData.ts#L210) | תווית זיהוי לשדה או מדד |
| **קושאן דואג שהמסר השיווקי שלך יגיע בדיוק ליעד.** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L810](file:///c:/comona/src/modules/KosData/config/seedData.ts#L810) | תווית טקסט / חיווי מצב בממשק |
| **קושאן מכין לך הפתעות מיוחדות השבוע.** | קונפיגורציית ברירת מחדל (seedData) | [seedData.ts#L838](file:///c:/comona/src/modules/KosData/config/seedData.ts#L838) | תווית טקסט / חיווי מצב בממשק |

</div>
