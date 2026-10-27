<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): פתרונות סליקה וקבלות (kesher-payments-hub)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosPay](file:///c:/comona/src/modules/KosPay)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של פתרונות סליקה וקבלות (kesher-payments-hub).
* **קבצים שנסרקו בשכבה זו (22):** [functionsApi.ts](file:///c:/comona/src/modules/KosPay/api/functionsApi.ts), [index.ts](file:///c:/comona/src/modules/KosPay/api/index.ts), [CrmContactAutocomplete.tsx](file:///c:/comona/src/modules/KosPay/components/CrmContactAutocomplete.tsx), [KesherManualReceiptsTab.tsx](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx), [KesherTerminalTab.tsx](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx), [KesherTransactionsLogTab.tsx](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx), [KesherUtilitiesTab.tsx](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx), [ReceiptGlossaryManagerModal.tsx](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx), [ReceiptItemGlossaryAutocomplete.tsx](file:///c:/comona/src/modules/KosPay/components/ReceiptItemGlossaryAutocomplete.tsx), [index.ts](file:///c:/comona/src/modules/KosPay/config/index.ts), [KesherPaymentsContext.tsx](file:///c:/comona/src/modules/KosPay/context/KesherPaymentsContext.tsx), [index.ts](file:///c:/comona/src/modules/KosPay/hooks/index.ts), [useKesherPayments.ts](file:///c:/comona/src/modules/KosPay/hooks/useKesherPayments.ts), [usePaymentTerminal.ts](file:///c:/comona/src/modules/KosPay/hooks/usePaymentTerminal.ts), [useReceiptGlossary.ts](file:///c:/comona/src/modules/KosPay/hooks/useReceiptGlossary.ts), [index.ts](file:///c:/comona/src/modules/KosPay/index.ts), [KesherPaymentsRoutes.tsx](file:///c:/comona/src/modules/KosPay/routes/KesherPaymentsRoutes.tsx), [crmContactSyncService.ts](file:///c:/comona/src/modules/KosPay/services/crmContactSyncService.ts), [kesherService.ts](file:///c:/comona/src/modules/KosPay/services/kesherService.ts), [receiptGlossaryService.ts](file:///c:/comona/src/modules/KosPay/services/receiptGlossaryService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosPay/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosPay/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 155 (אזורים/אקורדיונים: 0, כותרות: 16, פילטרים/טאבים: 23, פלייסהולדרים: 16, כפתורי CTA: 26, תוויות: 74)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (16)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **בטל שיוך לאיש קשר** | רכיב (CrmContactAutocomplete) | [CrmContactAutocomplete.tsx#L132](file:///c:/comona/src/modules/KosPay/components/CrmContactAutocomplete.tsx#L132) | כותרת ראשית של האזור / הכרטיס |
| **פרטי התקבול והתורם (מסונכרן עם ה-CRM)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L479](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L479) | כותרת תצוגה (H3) בלשונית תוכן (KesherManualReceiptsTab) |
| **שמור או עדכן את פרטי הלקוח (כולל ת.ז/פרטי בנק/צ** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L503](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L503) | כותרת ראשית של האזור / הכרטיס |
| **עבור מה יצאה הקבלה / פירוט פריטים** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L628](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L628) | כותרת תצוגה (H3) בלשונית תוכן (KesherManualReceiptsTab) |
| **הסר שורה** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L744](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L744) | כותרת ראשית של האזור / הכרטיס |
| **פרטי המחאה (צ'ק)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L769](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L769) | כותרת תצוגה (H3) בלשונית תוכן (KesherManualReceiptsTab) |
| **פרטי העברה בנקאית** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L828](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L828) | כותרת תצוגה (H3) בלשונית תוכן (KesherManualReceiptsTab) |
| **פרטי חיוב ולקוח (מסונכרן עם ה-CRM)** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L441](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L441) | כותרת תצוגה (H3) בלשונית תוכן (KesherTerminalTab) |
| **שמור או עדכן את פרטי הלקוח (כולל ת.ז/טלפון/אימייל) בכרטיס ה-CRM** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L465](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L465) | כותרת ראשית של האזור / הכרטיס |
| **פרטי כרטיס אשראי** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L590](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L590) | כותרת תצוגה (H3) בלשונית תוכן (KesherTerminalTab) |
| **רענן רשימה** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L493](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L493) | כותרת ראשית של האזור / הכרטיס |
| **בדיקת כרטיס אשראי** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L69](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L69) | כותרת תצוגה (H3) בלשונית תוכן (KesherUtilitiesTab) |
| **פירוש קודי שגיאה (שב"א / קשר)** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L121](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L121) | כותרת תצוגה (H3) בלשונית תוכן (KesherUtilitiesTab) |
| **שליחת SMS ללקוח** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L169](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L169) | כותרת תצוגה (H3) בלשונית תוכן (KesherUtilitiesTab) |
| **גלוסרי פריטי קבלה ומחירון מובנה** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L89](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L89) | כותרת תצוגה (H3) במודאל (ReceiptGlossaryManagerModal) |
| **מחק מהגלוסרי** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L237](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L237) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (23)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **405 - קבלה על תרומה (סעיף 46)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L559](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L559) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **400 - קבלה כללית** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L560](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L560) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **320 - חשבונית מס קבלה** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L561](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L561) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **305 - חשבונית מס** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L562](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L562) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **405 - קבלה על תרומה (סעיף 46)** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L535](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L535) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **400 - קבלה רגילה** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L536](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L536) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **320 - חשבונית מס קבלה** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L537](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L537) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **305 - חשבונית מס** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L538](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L538) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הכל** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L526](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L526) | סינון נתונים / בחירת תצוגה או סגנון |
| **צ'קים** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L539](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L539) | סינון נתונים / בחירת תצוגה או סגנון |
| **העברות בנקאיות** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L553](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L553) | סינון נתונים / בחירת תצוגה או סגנון |
| **מזומן** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L567](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L567) | סינון נתונים / בחירת תצוגה או סגנון |
| **כרטיסי אשראי** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L595](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L595) | סינון נתונים / בחירת תצוגה או סגנון |
| **הכל (מפתיחת החשבון)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L469](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L469) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שנה אחרונה** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L470](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L470) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **3 חודשים** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L471](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L471) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שבוע אחרון** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L472](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L472) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ייצוא עסקאות ל-CSV** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L515](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L515) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **כל הסטטוסים** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L640](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L640) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **אושר (Approved)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L641](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L641) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **הצלחה (Success)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L642](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L642) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ממתין (Pending)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L643](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L643) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **נדחה (Declined)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L644](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L644) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (16)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ישראל ישראלי (הקלד לחיפוש מהיר ב-CRM)** | רכיב (CrmContactAutocomplete) | [CrmContactAutocomplete.tsx#L34](file:///c:/comona/src/modules/KosPay/components/CrmContactAutocomplete.tsx#L34) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **הקלד שם פרטי / משפחה / טלפון...** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L545](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L545) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **israel@gmail.com** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L596](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L596) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **12 (הפועלים)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L794](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L794) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **TRF_987654** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L841](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L841) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **10 (לאומי)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L853](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L853) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הקלד שם פרטי / משפחה / טלפון...** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L521](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L521) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **client@example.com** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L562](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L562) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש לפי שם לקוח, טלפון, סכום, מספר צ** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L629](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L629) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **הקלד מספר כרטיס אשראי...** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L81](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L81) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **מספר טלפון (050-0000000)** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L180](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L180) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **תוכן ההודעה (למשל: תודה על תרומתך, הקבלה נשלחה...)** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L190](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L190) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חפש בגלוסרי לפי שם פריט או קטגוריה...** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L108](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L108) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **לדוגמה: תרומה לפרויקט פשוט מושלם** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L138](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L138) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **פרויקטים / תרומות / חסד** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L163](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L163) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הקלד תיאור פריט / מטרה (לדוגמה: תרומה לפרויקט פשוט מושלם)...** | רכיב (ReceiptItemGlossaryAutocomplete) | [ReceiptItemGlossaryAutocomplete.tsx#L18](file:///c:/comona/src/modules/KosPay/components/ReceiptItemGlossaryAutocomplete.tsx#L18) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (26)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] בטל שיוך לאיש קשר** | רכיב (CrmContactAutocomplete) | [CrmContactAutocomplete.tsx#L125](file:///c:/comona/src/modules/KosPay/components/CrmContactAutocomplete.tsx#L125) | בטל שיוך לאיש קשר |
| **מזומן (Cash)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L435](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L435) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **המחאה / צ'ק** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L448](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L448) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **העברה בנקאית** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L461](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L461) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר ב-CRM... / שמור שינויים ב-CRM** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L498](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L498) | שמור או עדכן את פרטי הלקוח (כולל ת.ז/פרטי בנק/צ |
| **גלוסרי ומחירון פריטים** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L637](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L637) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **+ הוסף שורת פריט** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L646](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L646) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] הסר שורה** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L740](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L740) | הסר שורה |
| **כרטיס אשראי** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L354](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L354) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **אפליקציית Bit** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L367](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L367) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **רגיל (J4)** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L386](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L386) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **תשלומים** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L398](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L398) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הו"ק אשראי** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L410](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L410) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **תפיסה (J5)** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L422](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L422) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר ב-CRM... / שמור שינויים ב-CRM** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L460](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L460) | שמור או עדכן את פרטי הלקוח (כולל ת.ז/טלפון/אימייל) בכרטיס ה-CRM |
| **הסתר קופה ניידת / מקלדת קופה ניידת** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L480](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L480) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מסנכרן לקוחות ל-CRM... / סנכרן לקוחות ותקבולים ל-CRM** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L475](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L475) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] רענן רשימה** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L490](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L490) | רענן רשימה |
| **[כפתור אייקון] ייצוא עסקאות ל-CSV** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L510](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L510) | ייצוא עסקאות ל-CSV |
| **בדוק כרטיס עכשיו** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L86](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L86) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שולח... / שלח SMS עכשיו** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L197](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L197) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הוסף פריט חדש** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L114](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L114) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L170](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L170) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור בגלוסרי** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L177](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L177) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] מחק מהגלוסרי** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L234](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L234) | מחק מהגלוסרי |
| **סגור** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L252](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L252) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (74)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **חיפוש גמיש לפי שם פרטי / משפחה / טלפון / ת.ז** | רכיב (CrmContactAutocomplete) | [CrmContactAutocomplete.tsx#L171](file:///c:/comona/src/modules/KosPay/components/CrmContactAutocomplete.tsx#L171) | תווית טקסט / חיווי מצב בממשק |
| **אמצעי תשלום התקבול** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L433](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L433) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סכום שהתקבל (₪) *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L515](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L515) | תווית טקסט / חיווי מצב בממשק |
| **שם הלקוח / התורם * הקלד לחיפוש מהיר ב-CRM** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L535](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L535) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם הלקוח / התורם *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L536](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L536) | תווית טקסט / חיווי מצב בממשק |
| **הקלד לחיפוש מהיר ב-CRM** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L537](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L537) | תווית טקסט / חיווי מצב בממשק |
| **קוד מסמך להפקה באיזי קאונט** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L551](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L551) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תאריך קבלה** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L569](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L569) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טלפון נייד** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L579](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L579) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אימייל (לשליחת מסמך)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L590](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L590) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ת.ז / ח.פ** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L602](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L602) | תווית טקסט / חיווי מצב בממשק |
| **תיאור הפריט / מטרה * חיפוש מהיר בגלוסרי** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L692](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L692) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור הפריט / מטרה *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L693](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L693) | תווית טקסט / חיווי מצב בממשק |
| **חיפוש מהיר בגלוסרי** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L694](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L694) | תווית טקסט / חיווי מצב בממשק |
| **כמות** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L706](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L706) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מחיר יחידה (₪)** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L718](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L718) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סה"כ לשורה** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L733](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L733) | תווית טקסט / חיווי מצב בממשק |
| **מספר צ'ק *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L776](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L776) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר / שם בנק *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L788](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L788) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר סניף *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L800](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L800) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר חשבון *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L812](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L812) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר אסמכתא *** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L835](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L835) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר בנק** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L847](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L847) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סניף** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L858](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L858) | תווית שדה קלט בטופס או בפאנל העריכה |
| **חשבון מעביר** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L869](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L869) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מפיק מסמך בשרתי קשר ואיזי קאונט...** | לשונית תוכן (KesherManualReceiptsTab) | [KesherManualReceiptsTab.tsx#L892](file:///c:/comona/src/modules/KosPay/components/KesherManualReceiptsTab.tsx#L892) | תווית טקסט / חיווי מצב בממשק |
| **ערוץ תשלום** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L352](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L352) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סוג עסקת אשראי** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L384](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L384) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סכום לחיוב (₪) *** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L477](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L477) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם לקוח / תורם מלא * הקלד לחיפוש מהיר ב-CRM** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L511](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L511) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם לקוח / תורם מלא *** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L512](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L512) | תווית טקסט / חיווי מצב בממשק |
| **הקלד לחיפוש מהיר ב-CRM** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L513](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L513) | תווית טקסט / חיווי מצב בממשק |
| **סוג מסמך להפקה באיזי קאונט (Document Type)** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L527](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L527) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טלפון נייד** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L545](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L545) | תווית שדה קלט בטופס או בפאנל העריכה |
| **דואר אלקטרוני (לשליחת קבלה)** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L556](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L556) | תווית שדה קלט בטופס או בפאנל העריכה |
| **ת.ז / ח.פ** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L568](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L568) | תווית טקסט / חיווי מצב בממשק |
| **מספר כרטיס אשראי *** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L604](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L604) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תוקף (MM/YY) *** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L619](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L619) | תווית שדה קלט בטופס או בפאנל העריכה |
| **CVV (3 ספרות בגב) *** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L634](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L634) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מספר תשלומים:** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L651](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L651) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מבצע סליקה ומפיק מסמך דרך קשר...** | לשונית תוכן (KesherTerminalTab) | [KesherTerminalTab.tsx#L678](file:///c:/comona/src/modules/KosPay/components/KesherTerminalTab.tsx#L678) | תווית טקסט / חיווי מצב בממשק |
| **מזומן** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L69](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L69) | תווית זיהוי לשדה או מדד |
| **העברה בנקאית** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L85](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L85) | תווית זיהוי לשדה או מדד |
| **הוראת קבע** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L98](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L98) | תווית זיהוי לשדה או מדד |
| **400 (קבלה)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L116](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L116) | תווית זיהוי לשדה או מדד |
| **405 (תרומה)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L118](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L118) | תווית זיהוי לשדה או מדד |
| **320 (מס קבלה)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L120](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L120) | תווית זיהוי לשדה או מדד |
| **305 (חשבונית מס)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L122](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L122) | תווית זיהוי לשדה או מדד |
| **330 (חשבונית עסקה)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L124](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L124) | תווית זיהוי לשדה או מדד |
| **סה"כ עסקאות ותקבולים** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L436](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L436) | תווית טקסט / חיווי מצב בממשק |
| **מחזור כספי שנגבה** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L446](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L446) | תווית טקסט / חיווי מצב בממשק |
| **ייבוא / ייצוא נתונים** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L489](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L489) | תווית טקסט / חיווי מצב בממשק |
| **ייבוא לקוחות (Excel / CSV)** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L502](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L502) | תווית טקסט / חיווי מצב בממשק |
| **סינון מהיר:** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L525](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L525) | תווית קבוצת פקדים בעורך / בממשק |
| **הכל** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L535](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L535) | תווית טקסט / חיווי מצב בממשק |
| **צ'קים** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L549](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L549) | תווית טקסט / חיווי מצב בממשק |
| **העברות בנקאיות** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L563](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L563) | תווית טקסט / חיווי מצב בממשק |
| **כרטיסי אשראי** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L605](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L605) | תווית טקסט / חיווי מצב בממשק |
| **אין קישור** | לשונית תוכן (KesherTransactionsLogTab) | [KesherTransactionsLogTab.tsx#L745](file:///c:/comona/src/modules/KosPay/components/KesherTransactionsLogTab.tsx#L745) | תווית טקסט / חיווי מצב בממשק |
| **אימות ספרת ביקורת (Luhn) ומותג הכרטיס** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L70](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L70) | תווית טקסט / חיווי מצב בממשק |
| **מספר כרטיס לבדיקה** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L76](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L76) | תווית שדה קלט בטופס או בפאנל העריכה |
| **איתור משמעות קוד סירוב והנחיות לפתרון** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L122](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L122) | תווית טקסט / חיווי מצב בממשק |
| **קוד שגיאה (לדוגמה: 004, 033)** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L128](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L128) | תווית שדה קלט בטופס או בפאנל העריכה |
| **משמעות הקוד:** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L151](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L151) | תווית קבוצת פקדים בעורך / בממשק |
| **הצעה לפתרון:** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L155](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L155) | תווית קבוצת פקדים בעורך / בממשק |
| **שליחת קישור לתשלום או אישור קבלה** | לשונית תוכן (KesherUtilitiesTab) | [KesherUtilitiesTab.tsx#L170](file:///c:/comona/src/modules/KosPay/components/KesherUtilitiesTab.tsx#L170) | תווית טקסט / חיווי מצב בממשק |
| **ניהול שמות פריטים, מטרות תקבול וסכומים אוטומטיים** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L90](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L90) | תווית טקסט / חיווי מצב בממשק |
| **הוספת פריט חדש לגלוסרי** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L129](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L129) | תווית טקסט / חיווי מצב בממשק |
| **שם הפריט / מטרה *** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L133](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L133) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סכום ברירת מחדל (₪)** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L145](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L145) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קטגוריה** | מודאל (ReceiptGlossaryManagerModal) | [ReceiptGlossaryManagerModal.tsx#L158](file:///c:/comona/src/modules/KosPay/components/ReceiptGlossaryManagerModal.tsx#L158) | תווית שדה קלט בטופס או בפאנל העריכה |
| **בחירה ממלאת אוטומטית שם וסכום** | רכיב (ReceiptItemGlossaryAutocomplete) | [ReceiptItemGlossaryAutocomplete.tsx#L111](file:///c:/comona/src/modules/KosPay/components/ReceiptItemGlossaryAutocomplete.tsx#L111) | תווית טקסט / חיווי מצב בממשק |
| **הוראת קבע** | רכיב (kesherService) | [kesherService.ts#L904](file:///c:/comona/src/modules/KosPay/services/kesherService.ts#L904) | תווית זיהוי לשדה או מדד |
| **מזומן** | רכיב (kesherService) | [kesherService.ts#L919](file:///c:/comona/src/modules/KosPay/services/kesherService.ts#L919) | תווית זיהוי לשדה או מדד |

</div>
