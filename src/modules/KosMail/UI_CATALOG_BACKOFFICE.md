<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): מערכת דיוור ומייל אוטומטי (kosun-am)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosMail](file:///c:/comona/src/modules/KosMail)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של מערכת דיוור ומייל אוטומטי (kosun-am).
* **קבצים שנסרקו בשכבה זו (16):** [functionsApi.ts](file:///c:/comona/src/modules/KosMail/api/functionsApi.ts), [AutomationBuilderView.tsx](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx), [DeliveryLogsDrawer.tsx](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx), [EmailEditorModal.tsx](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx), [index.ts](file:///c:/comona/src/modules/KosMail/config/index.ts), [ModuleContext.tsx](file:///c:/comona/src/modules/KosMail/context/ModuleContext.tsx), [useKosunAmActions.ts](file:///c:/comona/src/modules/KosMail/hooks/useKosunAmActions.ts), [useKosunAmData.ts](file:///c:/comona/src/modules/KosMail/hooks/useKosunAmData.ts), [index.ts](file:///c:/comona/src/modules/KosMail/index.ts), [index.ts](file:///c:/comona/src/modules/KosMail/prompts/index.ts), [ModuleRoutes.tsx](file:///c:/comona/src/modules/KosMail/routes/ModuleRoutes.tsx), [emailDispatchService.ts](file:///c:/comona/src/modules/KosMail/services/emailDispatchService.ts), [emailFirestoreService.ts](file:///c:/comona/src/modules/KosMail/services/emailFirestoreService.ts), [kosaiEmailAiService.ts](file:///c:/comona/src/modules/KosMail/services/kosaiEmailAiService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosMail/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosMail/types/index.ts)
* **סה"כ אלמנטים בשכבה זו:** 121 (אזורים/אקורדיונים: 0, כותרות: 39, פילטרים/טאבים: 11, פלייסהולדרים: 9, כפתורי CTA: 32, תוויות: 30)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (39)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **השהיה של 30 דקות** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L139](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L139) | כותרת ראשית של האזור / הכרטיס |
| **שליחת הודעת וואטסאפ Green API** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L146](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L146) | כותרת ראשית של האזור / הכרטיס |
| **שליחת אימייל שיווקי** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L171](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L171) | כותרת ראשית של האזור / הכרטיס |
| **שיגור וואטסאפ (Green API)** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L183](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L183) | כותרת ראשית של האזור / הכרטיס |
| **השהיה חכמה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L194](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L194) | כותרת ראשית של האזור / הכרטיס |
| **תנאי סינון חכם** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L203](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L203) | כותרת ראשית של האזור / הכרטיס |
| **עדכון סטטוס ב-CRM** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L211](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L211) | כותרת ראשית של האזור / הכרטיס |
| **בונה האוטומציות הרב-ערוצי - KOSUN AM** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L274](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L274) | כותרת תצוגה (H2) בתצוגה ראשית / אזור (AutomationBuilderView) |
| **תהליכים מוגדרים ()** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L307](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L307) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (AutomationBuilderView) |
| **השהה אוטומציה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L338](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L338) | כותרת ראשית של האזור / הכרטיס |
| **מחק אוטומציה זו** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L406](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L406) | כותרת ראשית של האזור / הכרטיס |
| **יומן שיגור ומסירה של קושאן** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L97](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L97) | כותרת תצוגה (H2) במגירה צדדית (DeliveryLogsDrawer) |
| **ריענון לוגים** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L109](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L109) | כותרת ראשית של האזור / הכרטיס |
| **ברוכים הבאים לקושאן!** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L56](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L56) | כותרת ראשית של האזור / הכרטיס |
| **קושאן דואג שהמייל יגיע ליעד בזמן ובדיוק מושלם** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L57](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L57) | כותרת משנה של האזור / המודאל |
| **השקה מיוחדת לשנת 2026** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L70](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L70) | כותרת ראשית של האזור / הכרטיס |
| **כל הכלים המתקדמים במקום אחד** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L71](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L71) | כותרת משנה של האזור / המודאל |
| **חדשות מרגשות מקושאן** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L82](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L82) | כותרת ראשית של האזור / הכרטיס |
| **כותרת ראשית חדשה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L265](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L265) | כותרת ראשית של האזור / הכרטיס |
| **תת-כותרת להסבר** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L265](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L265) | כותרת משנה של האזור / המודאל |
| **תמונת מבצע מיוחד** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L274](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L274) | כותרת ראשית של האזור / הכרטיס |
| **פסקה חדשה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L284](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L284) | כותרת ראשית של האזור / הכרטיס |
| **ניסוח מקצועי מקושאן AI** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L374](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L374) | כותרת ראשית של האזור / הכרטיס |
| **עריכת קמפיין עם קושאן / קושאן מכין קמפיין חדש** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L438](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L438) | כותרת תצוגה (H2) במודאל (EmailEditorModal) |
| **הזז למעלה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L734](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L734) | כותרת ראשית של האזור / הכרטיס |
| **הזז למטה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L743](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L743) | כותרת ראשית של האזור / הכרטיס |
| **מחק בלוק** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L751](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L751) | כותרת ראשית של האזור / הכרטיס |
| **קושאן כותב עבורך** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L1019](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L1019) | כותרת תצוגה (H3) במודאל (EmailEditorModal) |
| **שלום וברוכים הבאים!** | קונפיגורציית ברירת מחדל (index) | [index.ts#L49](file:///c:/comona/src/modules/KosMail/config/index.ts#L49) | כותרת תצוגה (H1) בקונפיגורציית ברירת מחדל (index) |
| **מבצע קיץ מיוחד** | קונפיגורציית ברירת מחדל (index) | [index.ts#L73](file:///c:/comona/src/modules/KosMail/config/index.ts#L73) | כותרת תצוגה (H2) בקונפיגורציית ברירת מחדל (index) |
| **קושאן** | קונפיגורציית ברירת מחדל (index) | [index.ts#L101](file:///c:/comona/src/modules/KosMail/config/index.ts#L101) | כותרת ראשית של האזור / הכרטיס |
| **מערכת דיוור חכמה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L101](file:///c:/comona/src/modules/KosMail/config/index.ts#L101) | כותרת משנה של האזור / המודאל |
| **ברוכים הבאים לעולם של שיווק חכם** | קונפיגורציית ברירת מחדל (index) | [index.ts#L107](file:///c:/comona/src/modules/KosMail/config/index.ts#L107) | כותרת ראשית של האזור / הכרטיס |
| **קושאן לוקח אחריות על תהליך הדיוור שלך** | קונפיגורציית ברירת מחדל (index) | [index.ts#L108](file:///c:/comona/src/modules/KosMail/config/index.ts#L108) | כותרת משנה של האזור / המודאל |
| **מבצע מיוחד לחברי המועדון** | קונפיגורציית ברירת מחדל (index) | [index.ts#L137](file:///c:/comona/src/modules/KosMail/config/index.ts#L137) | כותרת ראשית של האזור / הכרטיס |
| **אל תפספסו את ההזדמנות להגדיל מכירות** | קונפיגורציית ברירת מחדל (index) | [index.ts#L138](file:///c:/comona/src/modules/KosMail/config/index.ts#L138) | כותרת משנה של האזור / המודאל |
| **שליחת מייל היכרות ראשוני** | קונפיגורציית ברירת מחדל (index) | [index.ts#L165](file:///c:/comona/src/modules/KosMail/config/index.ts#L165) | כותרת ראשית של האזור / הכרטיס |
| **השהיה של 120 דקות** | קונפיגורציית ברירת מחדל (index) | [index.ts#L176](file:///c:/comona/src/modules/KosMail/config/index.ts#L176) | כותרת ראשית של האזור / הכרטיס |
| **שליחת הודעת וואטסאפ Green API** | קונפיגורציית ברירת מחדל (index) | [index.ts#L183](file:///c:/comona/src/modules/KosMail/config/index.ts#L183) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (11)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **ליד חדש ב-CRM (crm:lead:created)** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L50](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L50) | שם טאב ניווט או כפתור סינון |
| **שליחת מייל ברוכים הבאים מיידי** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L129](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L129) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **כל הסטטוסים** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L141](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L141) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **נמסר** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L142](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L142) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **נפתח** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L143](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L143) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סימולציה** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L144](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L144) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **נכשל** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L145](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L145) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **פרטי שיגור** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L473](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L473) | סינון נתונים / בחירת תצוגה או סגנון |
| **עורך בלוקים ויזואלי ()** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L486](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L486) | סינון נתונים / בחירת תצוגה או סגנון |
| **קוד HTML ישיר** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L499](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L499) | סינון נתונים / בחירת תצוגה או סגנון |
| **תצוגה מקדימה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L512](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L512) | סינון נתונים / בחירת תצוגה או סגנון |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (9)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הזן נושא להודעה...** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L581](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L581) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הזן הודעת וואטסאפ (תומך במשתנים )...** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L613](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L613) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **חיפוש לפי אימייל או נושא...** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L130](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L130) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |
| **למשל: עדכון חודשי - קיץ 2026** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L541](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L541) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הזן נושא מסקרן ומניע לפעולה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L567](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L567) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **משפט קצר שיעודד פתיחה מיידית** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L600](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L600) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **user1@example.com, user2@example.com** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L639](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L639) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **https://...** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L791](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L791) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **למשל: השקת קורס מקצועי חדש עם 20% הנחה לנרשמים ראשונים...** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L1039](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L1039) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (32)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **קושאן מקים אוטומציה חדשה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L285](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L285) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **צור אוטומציה ראשונה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L371](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L371) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] מחק אוטומציה זו** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L402](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L402) | מחק אוטומציה זו |
| **קושאן שומר** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L411](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L411) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **+ אימייל** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L452](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L452) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **+ וואטסאפ (Green API)** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L461](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L461) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **+ השהיה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L470](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L470) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **+ תנאי סינון** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L479](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L479) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **קושאן שומר את האוטומציה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L659](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L659) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] ריענון לוגים** | מגירה צדדית (DeliveryLogsDrawer) | [DeliveryLogsDrawer.tsx#L106](file:///c:/comona/src/modules/KosMail/components/DeliveryLogsDrawer.tsx#L106) | ריענון לוגים |
| **קושאן כותב עבורך** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L453](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L453) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **קושאן מנסח כותרות... / הצע כותרות A/B עם קושאן** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L553](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L553) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כותרת** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L655](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L655) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **תמונת נושא** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L663](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L663) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פסקה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L671](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L671) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כפתור הנעה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L679](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L679) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מפריד** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L687](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L687) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כותרת תחתונה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L695](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L695) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] הזז למעלה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L729](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L729) | הזז למעלה |
| **[כפתור אייקון] הזז למטה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L738](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L738) | הזז למטה |
| **[כפתור אייקון] מחק בלוק** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L747](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L747) | מחק בלוק |
| **סנכרן מבלוקים ויזואליים** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L892](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L892) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מחשב שולחני (Desktop)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L921](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L921) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מכשיר נייד (Mobile)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L933](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L933) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L989](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L989) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **קושאן שומר את הקמפיין** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L997](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L997) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L1044](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L1044) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **קושאן מנסח... / צור ניסוח עכשיו** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L1051](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L1051) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **לפרטים נוספים והתנסות** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L96](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L96) | כפתור הנעה לפעולה (buttonText) |
| **מעבר לעמוד המוצר** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L292](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L292) | כפתור הנעה לפעולה (buttonText) |
| **להתחלת העבודה** | קונפיגורציית ברירת מחדל (index) | [index.ts#L109](file:///c:/comona/src/modules/KosMail/config/index.ts#L109) | כפתור הנעה לפעולה (buttonText) |
| **לפרטים נוספים** | קונפיגורציית ברירת מחדל (index) | [index.ts#L139](file:///c:/comona/src/modules/KosMail/config/index.ts#L139) | כפתור הנעה לפעולה (buttonText) |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (30)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **טופס חכם נשלח (smart_form:submitted)** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L55](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L55) | תווית זיהוי לשדה או מדד |
| **שגריר חדש נוצר (campaign:ambassador:created)** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L60](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L60) | תווית זיהוי לשדה או מדד |
| **תשלום הושלם בהצלחה (payment:completed)** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L65](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L65) | תווית זיהוי לשדה או מדד |
| **בחר לעריכה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L310](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L310) | תווית טקסט / חיווי מצב בממשק |
| **פעיל** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L343](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L343) | תווית טקסט / חיווי מצב בממשק |
| **מושהה** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L348](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L348) | תווית טקסט / חיווי מצב בממשק |
| **שם התהליך** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L389](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L389) | תווית שדה קלט בטופס או בפאנל העריכה |
| **סנכרון EventBus** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L430](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L430) | תווית טקסט / חיווי מצב בממשק |
| **נושא האימייל** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L559](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L559) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תבנית הודעת וואטסאפ (Green API)** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L591](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L591) | תווית שדה קלט בטופס או בפאנל העריכה |
| **השהה למשך:** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L622](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L622) | תווית שדה קלט בטופס או בפאנל העריכה |
| **דקות** | תצוגה ראשית / אזור (AutomationBuilderView) | [AutomationBuilderView.tsx#L639](file:///c:/comona/src/modules/KosMail/components/AutomationBuilderView.tsx#L639) | תווית טקסט / חיווי מצב בממשק |
| **שם הקמפיין הפנימי** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L533](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L533) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שורת הנושא (Subject)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L549](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L549) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טקסט מקדים (Preheader)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L592](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L592) | תווית שדה קלט בטופס או בפאנל העריכה |
| **שם השולח** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L607](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L607) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת אימייל שולח** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L618](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L618) | תווית שדה קלט בטופס או בפאנל העריכה |
| **רשימת נמענים ידנית (מופרדים בפסיק)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L631](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L631) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת עליונה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L763](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L763) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תת-כותרת** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L772](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L772) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קישור לתמונה (Image URL)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L786](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L786) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת תמונה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L797](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L797) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תיאור קצר** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L806](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L806) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת פסקה (אופציונלי)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L821](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L821) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תוכן הפסקה** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L830](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L830) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טקסט הכפתור** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L844](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L844) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כתובת יעד (URL)** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L853](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L853) | תווית שדה קלט בטופס או בפאנל העריכה |
| **טקסט זכויות יוצרים ומשפטי** | מודאל (EmailEditorModal) | [EmailEditorModal.tsx#L866](file:///c:/comona/src/modules/KosMail/components/EmailEditorModal.tsx#L866) | תווית שדה קלט בטופס או בפאנל העריכה |
| **קושאן דואג שהמסר השיווקי שלך יגיע בדיוק לנמענים הנכונים.** | קונפיגורציית ברירת מחדל (index) | [index.ts#L49](file:///c:/comona/src/modules/KosMail/config/index.ts#L49) | תווית טקסט / חיווי מצב בממשק |
| **קושאן מכין לך הפתעות מיוחדות השבוע.** | קונפיגורציית ברירת מחדל (index) | [index.ts#L73](file:///c:/comona/src/modules/KosMail/config/index.ts#L73) | תווית טקסט / חיווי מצב בממשק |

</div>
