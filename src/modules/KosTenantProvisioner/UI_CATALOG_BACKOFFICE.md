<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): ניהול סאב-דומיינים ודיירים (KosTenantProvisioner)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosTenantProvisioner](file:///c:/comona/src/modules/KosTenantProvisioner)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של ניהול סאב-דומיינים ודיירים (KosTenantProvisioner).
* **קבצים שנסרקו בשכבה זו (15):** [functionsApi.ts](file:///c:/comona/src/modules/KosTenantProvisioner/api/functionsApi.ts), [TenantComprehensiveEditModal.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx), [TenantCreateModal.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx), [TenantCredentialsModal.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx), [TenantEditModulesModal.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantEditModulesModal.tsx), [index.ts](file:///c:/comona/src/modules/KosTenantProvisioner/config/index.ts), [TenantProvisionerContext.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/context/TenantProvisionerContext.tsx), [useTenantProvisioner.ts](file:///c:/comona/src/modules/KosTenantProvisioner/hooks/useTenantProvisioner.ts), [index.ts](file:///c:/comona/src/modules/KosTenantProvisioner/index.ts), [TenantProvisionerRoutes.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/routes/TenantProvisionerRoutes.tsx), [tenantAuthService.ts](file:///c:/comona/src/modules/KosTenantProvisioner/services/tenantAuthService.ts), [tenantProvisionerService.ts](file:///c:/comona/src/modules/KosTenantProvisioner/services/tenantProvisionerService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosTenantProvisioner/types/index.ts), [TenantProvisionerView.tsx](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx)
* **סה"כ אלמנטים בשכבה זו:** 112 (אזורים/אקורדיונים: 4, כותרות: 19, פילטרים/טאבים: 7, פלייסהולדרים: 14, כפתורי CTA: 33, תוויות: 35)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (4)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **רכיבים מוטענים ()** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L458](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L458) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **הגדרות מפתחות API** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L582](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L582) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **מד טוקנים ושימוש AI (%)** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L880](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L880) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **פרטי דייר וגישה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1111](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1111) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (19)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **פתח סאב-דומיין בדפדפן** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L357](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L357) | כותרת ראשית של האזור / הכרטיס |
| **שמור שינויים שלא נשמרו** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L375](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L375) | כותרת ראשית של האזור / הכרטיס |
| **סגור** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L389](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L389) | כותרת ראשית של האזור / הכרטיס |
| **בחירת רכיבים מודולריים להפעלה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L482](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L482) | כותרת תצוגה (H4) במודאל (TenantComprehensiveEditModal) |
| **יצירת סאב-דומיין חדש והטענת רכיבים** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L136](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L136) | כותרת תצוגה (H2) במודאל (TenantCreateModal) |
| **הסאב-דומיין נוצר והוטען בהצלחה! 🎉** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L162](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L162) | כותרת תצוגה (H3) במודאל (TenantCreateModal) |
| **העתק כתובת** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L194](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L194) | כותרת ראשית של האזור / הכרטיס |
| **העתק סיסמה** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L222](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L222) | כותרת ראשית של האזור / הכרטיס |
| **1. הגדרת סאב-דומיין ופרטי העסק** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L256](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L256) | כותרת תצוגה (H3) במודאל (TenantCreateModal) |
| **2. פרטי כניסה ואבטחה למנהל הסאב-דומיין** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L341](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L341) | כותרת תצוגה (H3) במודאל (TenantCreateModal) |
| **3. בחירת רכיבים להטענה בסאב-דומיין ( נבחרו)** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L398](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L398) | כותרת תצוגה (H3) במודאל (TenantCreateModal) |
| **פרטי כניסה וניהול סאב-דומיין** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L51](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L51) | כותרת תצוגה (H3) במודאל (TenantCredentialsModal) |
| **העתק קישור** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L100](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L100) | כותרת ראשית של האזור / הכרטיס |
| **העתק סיסמה** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L159](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L159) | כותרת ראשית של האזור / הכרטיס |
| **עריכת רכיבים מוטענים:** | מודאל (TenantEditModulesModal) | [TenantEditModulesModal.tsx#L48](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantEditModulesModal.tsx#L48) | כותרת תצוגה (H3) במודאל (TenantEditModulesModal) |
| **ניהול סאב-דומיינים** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L25](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L25) | כותרת תצוגה (H1) בתצוגה ראשית / אזור (TenantProvisionerView) |
| **הצג / הסתר מחשבון טוקנים, תמחור API והקצאת מכסות** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L44](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L44) | כותרת ראשית של האזור / הכרטיס |
| **הצג / הסתר סרגל מדדים וסטטיסטיקה** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L60](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L60) | כותרת ראשית של האזור / הכרטיס |
| **רענן רשימת סאב-דומיינים** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L73](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L73) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (7)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **400 - חשבונית מס קבלה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L760](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L760) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **405 - קבלה על תרומה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L761](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L761) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **320 - חשבונית מס** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L762](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L762) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **פעיל (Active)** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1156](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1156) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מושעה (Suspended)** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1157](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1157) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מנוי חודשי** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L332](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L332) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מנוי שנתי (20% הנחה)** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L333](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L333) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (14)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **AIzaSy...** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L643](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L643) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם משתמש קשר** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L692](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L692) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **מפתח סודי קשר** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L721](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L721) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **טוקן חשבוניות** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L743](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L743) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **טוקן Green API** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L799](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L799) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://...** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L821](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L821) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **מפתח HeyGen סודי** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L845](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L845) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **שם העסק** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1140](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1140) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **owner@example.com** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1167](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1167) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **admin** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1195](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1195) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **client1** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L271](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L271) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לדוגמה: מרכז הפסיפס בע״מ** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L301](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L301) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **admin@kosun.pro** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L355](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L355) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הזן סיסמה או חולל אוטומטית** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L382](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L382) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (33)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] סגור** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L381](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L381) | סגור |
| **שמור וצא** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L407](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L407) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **צא ללא שמירה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L418](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L418) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **המשך עריכה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L432](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L432) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בחר הכל** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L491](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L491) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **נקה הכל** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L500](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L500) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור רכיבים מוטענים** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L564](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L564) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור הגדרות מפתחות** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L862](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L862) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הטען עכשיו** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1085](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1085) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור פרטי דייר וגישה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1228](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1228) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור חלון** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1252](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1252) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] העתק כתובת** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L186](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L186) | העתק כתובת |
| **[כפתור אייקון] העתק סיסמה** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L214](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L214) | העתק סיסמה |
| **סגור** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L241](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L241) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חולל סיסמה חזקה** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L369](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L369) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בחר הכל** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L408](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L408) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חבילת בסיס** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L415](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L415) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L470](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L470) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] העתק קישור** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L92](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L92) | העתק קישור |
| **הסתר / הצג סיסמה** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L130](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L130) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] העתק סיסמה** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L151](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L151) | העתק סיסמה |
| **ערוך שם משתמש וסיסמה** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L172](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L172) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בטל עריכה** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L180](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L180) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור פרטים** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L191](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L191) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L202](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L202) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **בחר הכל** | מודאל (TenantEditModulesModal) | [TenantEditModulesModal.tsx#L73](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantEditModulesModal.tsx#L73) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **נקה הכל** | מודאל (TenantEditModulesModal) | [TenantEditModulesModal.tsx#L80](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantEditModulesModal.tsx#L80) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (TenantEditModulesModal) | [TenantEditModulesModal.tsx#L134](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantEditModulesModal.tsx#L134) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור שינויים ברכיבים** | מודאל (TenantEditModulesModal) | [TenantEditModulesModal.tsx#L141](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantEditModulesModal.tsx#L141) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מחשבון טוקנים ועלויות AI** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L36](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L36) | הצג / הסתר מחשבון טוקנים, תמחור API והקצאת מכסות |
| **מדדים וסטטיסטיקה** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L52](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L52) | הצג / הסתר סרגל מדדים וסטטיסטיקה |
| **[כפתור אייקון] רענן רשימת סאב-דומיינים** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L68](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L68) | רענן רשימת סאב-דומיינים |
| **הקם סאב-דומיין חדש** | תצוגה ראשית / אזור (TenantProvisionerView) | [TenantProvisionerView.tsx#L79](file:///c:/comona/src/modules/KosTenantProvisioner/views/TenantProvisionerView.tsx#L79) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (35)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **שים לב: קיימים שינויים שלא נשמרו בהגדרות הדייר.** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L401](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L401) | תווית טקסט / חיווי מצב בממשק |
| **הגדרות מפתחות API** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L595](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L595) | תווית טקסט / חיווי מצב בממשק |
| **מדיניות מפתחות KOSUN26:** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L612](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L612) | תווית קבוצת פקדים בעורך / בממשק |
| **מפתח Google AI Gemini (Master AI Key)** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L633](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L633) | תווית טקסט / חיווי מצב בממשק |
| **מפתח מאסטר לכלל המערכת** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L635](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L635) | תווית טקסט / חיווי מצב בממשק |
| **סליקה וקבלות קשר (Kesher & EzCount)** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L678](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L678) | תווית טקסט / חיווי מצב בממשק |
| **ApiKey סודי** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L715](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L715) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סוג מסמך ברירת מחדל** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L752](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L752) | תווית שדה קלט בטופס או בפאנל העריכה |
| **וואטסאפ ובוטים (Green-API WhatsApp)** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L774](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L774) | תווית טקסט / חיווי מצב בממשק |
| **סטודיו וידאו ואווטאר (HeyGen API Key)** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L837](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L837) | תווית טקסט / חיווי מצב בממשק |
| **מד טוקנים כולל** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L907](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L907) | תווית טקסט / חיווי מצב בממשק |
| **0 טוקנים** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L940](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L940) | תווית טקסט / חיווי מצב בממשק |
| **פרטי דייר וגישה** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1124](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1124) | תווית טקסט / חיווי מצב בממשק |
| **שם העסק / הלקוח** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1135](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1135) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סטטוס סאב-דומיין** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1148](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1148) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אימייל בעל העסק** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1162](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1162) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טלפון בעל העסק** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1176](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1176) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם משתמש למנהל** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1190](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1190) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סיסמת כניסה למנהל** | מודאל (TenantComprehensiveEditModal) | [TenantComprehensiveEditModal.tsx#L1204](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantComprehensiveEditModal.tsx#L1204) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת הסאב-דומיין:** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L181](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L181) | תווית קבוצת פקדים בעורך / בממשק |
| **שם משתמש למנהל:** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L202](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L202) | תווית קבוצת פקדים בעורך / בממשק |
| **סיסמה:** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L209](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L209) | תווית קבוצת פקדים בעורך / בממשק |
| **כניסה ללוח הניהול של הסאב-דומיין** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L238](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L238) | תווית טקסט / חיווי מצב בממשק |
| **סאב-דומיין (באנגלית): *** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L264](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L264) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם העסק / הלקוח: *** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L295](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L295) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טלפון מנהל (וואטסאפ):** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L310](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L310) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תוכנית מנוי:** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L324](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L324) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם משתמש / אימייל: *** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L349](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L349) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סיסמת כניסה: *** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L366](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L366) | תווית שדה קלט בטופס או בפאנל העריכה |
| **יוצר ומטעין רכיבים...** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L486](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L486) | תווית טקסט / חיווי מצב בממשק |
| **צור והפעל סאב-דומיין** | מודאל (TenantCreateModal) | [TenantCreateModal.tsx#L491](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCreateModal.tsx#L491) | תווית טקסט / חיווי מצב בממשק |
| **שם העסק:** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L74](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L74) | תווית קבוצת פקדים בעורך / בממשק |
| **קישור לוח ניהול:** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L81](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L81) | תווית קבוצת פקדים בעורך / בממשק |
| **שם משתמש:** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L111](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L111) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סיסמה:** | מודאל (TenantCredentialsModal) | [TenantCredentialsModal.tsx#L126](file:///c:/comona/src/modules/KosTenantProvisioner/components/TenantCredentialsModal.tsx#L126) | תווית שדה קלט בטופס או בפאנל העריכה |

</div>
