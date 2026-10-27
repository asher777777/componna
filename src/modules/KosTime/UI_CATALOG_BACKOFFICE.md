<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועריכה (Backoffice): ניהול זמן ומשימות חכם (KosTime)

* **שכבה:** באק-אופיס / ניהול, עריכה והגדרות (Backoffice & Editor)
* **תיקיית הרכיב:** [src/modules/KosTime](file:///c:/comona/src/modules/KosTime)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים/האקורדיונים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הניהול, העריכה והבאק-אופיס של ניהול זמן ומשימות חכם (KosTime).
* **קבצים שנסרקו בשכבה זו (21):** [index.ts](file:///c:/comona/src/modules/KosTime/api/index.ts), [BrainstormScreen.tsx](file:///c:/comona/src/modules/KosTime/components/BrainstormScreen.tsx), [DecomposeScreen.tsx](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx), [EveningRitualModal.tsx](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx), [InstallAppModal.tsx](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx), [QuickCaptureModal.tsx](file:///c:/comona/src/modules/KosTime/components/QuickCaptureModal.tsx), [RuleOf3WarningModal.tsx](file:///c:/comona/src/modules/KosTime/components/RuleOf3WarningModal.tsx), [index.ts](file:///c:/comona/src/modules/KosTime/config/index.ts), [KosTimeContext.tsx](file:///c:/comona/src/modules/KosTime/context/KosTimeContext.tsx), [useAudioRecorder.ts](file:///c:/comona/src/modules/KosTime/hooks/useAudioRecorder.ts), [useKosTimeTenant.ts](file:///c:/comona/src/modules/KosTime/hooks/useKosTimeTenant.ts), [usePWAInstall.ts](file:///c:/comona/src/modules/KosTime/hooks/usePWAInstall.ts), [index.ts](file:///c:/comona/src/modules/KosTime/index.ts), [KosTimeRoutes.tsx](file:///c:/comona/src/modules/KosTime/routes/KosTimeRoutes.tsx), [confettiService.ts](file:///c:/comona/src/modules/KosTime/services/confettiService.ts), [kosTimeAiService.ts](file:///c:/comona/src/modules/KosTime/services/kosTimeAiService.ts), [kosTimeFirestoreService.ts](file:///c:/comona/src/modules/KosTime/services/kosTimeFirestoreService.ts), [soundService.ts](file:///c:/comona/src/modules/KosTime/services/soundService.ts), [StandaloneView.tsx](file:///c:/comona/src/modules/KosTime/StandaloneView.tsx), [index.ts](file:///c:/comona/src/modules/KosTime/types/index.ts), [KosTimeMainView.tsx](file:///c:/comona/src/modules/KosTime/views/KosTimeMainView.tsx)
* **סה"כ אלמנטים בשכבה זו:** 48 (אזורים/אקורדיונים: 0, כותרות: 6, פילטרים/טאבים: 3, פלייסהולדרים: 5, כפתורי CTA: 15, תוויות: 19)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (6)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **׳”׳’׳“׳¨׳× ׳×׳•׳¦׳¨ ׳¨׳¦׳•׳™** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L62](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L62) | כותרת ראשית של האזור / הכרטיס |
| **׳‘׳™׳¦׳•׳¢ ׳”׳©׳׳‘ ׳”׳׳¢׳©׳™** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L63](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L63) | כותרת ראשית של האזור / הכרטיס |
| **התקנת אפליקציית KOSUN בנייד** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L77](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L77) | כותרת תצוגה (H3) במודאל (InstallAppModal) |
| **העתק קישור** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L116](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L116) | כותרת ראשית של האזור / הכרטיס |
| **חוק ה-3 הקדוש: אין מקום לנכס 4!** | מודאל (RuleOf3WarningModal) | [RuleOf3WarningModal.tsx#L52](file:///c:/comona/src/modules/KosTime/components/RuleOf3WarningModal.tsx#L52) | כותרת תצוגה (H3) במודאל (RuleOf3WarningModal) |
| **טקס נעילת יום (Evening Ritual)** | תצוגה ראשית / אזור (KosTimeMainView) | [KosTimeMainView.tsx#L173](file:///c:/comona/src/modules/KosTime/views/KosTimeMainView.tsx#L173) | כותרת תצוגה (H3) בתצוגה ראשית / אזור (KosTimeMainView) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **איסוף חומרים, הגדרת יעד ובדיקת רקע עבור** | רכיב (kosTimeAiService) | [kosTimeAiService.ts#L63](file:///c:/comona/src/modules/KosTime/services/kosTimeAiService.ts#L63) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **ביצוע הפעימה המרכזית וכתיבת טיוטה ראשונה** | רכיב (kosTimeAiService) | [kosTimeAiService.ts#L64](file:///c:/comona/src/modules/KosTime/services/kosTimeAiService.ts#L64) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **בדיקה סופית, ליטוש ומענה/שליחה ליעד** | רכיב (kosTimeAiService) | [kosTimeAiService.ts#L65](file:///c:/comona/src/modules/KosTime/services/kosTimeAiService.ts#L65) | אפשרות בחירת סגנון / תצוגה / פילטר |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (5)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **׳”׳§׳׳“ ׳›׳׳...** | רכיב (BrainstormScreen) | [BrainstormScreen.tsx#L306](file:///c:/comona/src/modules/KosTime/components/BrainstormScreen.tsx#L306) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **׳›׳•׳×׳¨׳×...** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L198](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L198) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **׳¦׳¢׳“...** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L225](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L225) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **נכס חדש למחר...** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L361](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L361) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **כתוב או הקלט...** | מודאל (QuickCaptureModal) | [QuickCaptureModal.tsx#L79](file:///c:/comona/src/modules/KosTime/components/QuickCaptureModal.tsx#L79) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (15)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **׳“׳³** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L232](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L232) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **׳©׳׳•׳¨** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L287](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L287) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הבא** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L219](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L219) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חזור** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L266](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L266) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סגור** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L295](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L295) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ד׳** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L379](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L379) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור וסיים** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L406](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L406) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **פתח בחלון עצמאי מלא** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L106](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L106) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] העתק קישור** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L114](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L114) | העתק קישור |
| **סגור** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L165](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L165) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור** | מודאל (QuickCaptureModal) | [QuickCaptureModal.tsx#L94](file:///c:/comona/src/modules/KosTime/components/QuickCaptureModal.tsx#L94) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **החלף עכשיו והעבר את המוחלף לתיק** | מודאל (RuleOf3WarningModal) | [RuleOf3WarningModal.tsx#L110](file:///c:/comona/src/modules/KosTime/components/RuleOf3WarningModal.tsx#L110) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **דחה למחר נשבץ אותו בטקס נעילת הערב כחלק מ-3 הנכסים של מחר** | מודאל (RuleOf3WarningModal) | [RuleOf3WarningModal.tsx#L131](file:///c:/comona/src/modules/KosTime/components/RuleOf3WarningModal.tsx#L131) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שמור בתיק הנכסים שמור כרעיון גולמי ונפרק אותו בהמשך במעבדה** | מודאל (RuleOf3WarningModal) | [RuleOf3WarningModal.tsx#L154](file:///c:/comona/src/modules/KosTime/components/RuleOf3WarningModal.tsx#L154) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **התחל עכשיו את טקס הערב** | תצוגה ראשית / אזור (KosTimeMainView) | [KosTimeMainView.tsx#L180](file:///c:/comona/src/modules/KosTime/views/KosTimeMainView.tsx#L180) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (19)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **׳׳™׳₪׳•׳¡ ׳©׳™׳—׳”** | רכיב (BrainstormScreen) | [BrainstormScreen.tsx#L162](file:///c:/comona/src/modules/KosTime/components/BrainstormScreen.tsx#L162) | תווית זיהוי לשדה או מדד |
| **׳׳×׳™׳§** | רכיב (BrainstormScreen) | [BrainstormScreen.tsx#L225](file:///c:/comona/src/modules/KosTime/components/BrainstormScreen.tsx#L225) | תווית זיהוי לשדה או מדד |
| **׳׳”׳™׳•׳** | רכיב (BrainstormScreen) | [BrainstormScreen.tsx#L236](file:///c:/comona/src/modules/KosTime/components/BrainstormScreen.tsx#L236) | תווית זיהוי לשדה או מדד |
| **׳₪׳™׳¨׳•׳§ ׳‘-AI** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L164](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L164) | תווית זיהוי לשדה או מדד |
| **׳׳—׳§** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L251](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L251) | תווית זיהוי לשדה או מדד |
| **׳”׳•׳¡׳£ ׳¦׳¢׳“** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L263](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L263) | תווית זיהוי לשדה או מדד |
| **׳ ׳©׳׳¨!** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L277](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L277) | תווית טקסט / חיווי מצב בממשק |
| **׳”׳™׳•׳** | רכיב (DecomposeScreen) | [DecomposeScreen.tsx#L281](file:///c:/comona/src/modules/KosTime/components/DecomposeScreen.tsx#L281) | תווית זיהוי לשדה או מדד |
| **סגור** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L116](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L116) | תווית זיהוי לשדה או מדד |
| **השלם** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L175](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L175) | תווית זיהוי לשדה או מדד |
| **למחר** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L185](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L185) | תווית זיהוי לשדה או מדד |
| **לתיק** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L195](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L195) | תווית זיהוי לשדה או מדד |
| **מחק** | מודאל (EveningRitualModal) | [EveningRitualModal.tsx#L205](file:///c:/comona/src/modules/KosTime/components/EveningRitualModal.tsx#L205) | תווית זיהוי לשדה או מדד |
| **למה זה התקין קודם את Google AI Studio?** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L90](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L90) | תווית טקסט / חיווי מצב בממשק |
| **או סרוק עם מצלמת הנייד לפתיחה מהירה:** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L133](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L133) | תווית קבוצת פקדים בעורך / בממשק |
| **התקנה עצמאית ומאובטחת** | מודאל (InstallAppModal) | [InstallAppModal.tsx#L162](file:///c:/comona/src/modules/KosTime/components/InstallAppModal.tsx#L162) | תווית טקסט / חיווי מצב בממשק |
| **סגור** | מודאל (QuickCaptureModal) | [QuickCaptureModal.tsx#L64](file:///c:/comona/src/modules/KosTime/components/QuickCaptureModal.tsx#L64) | תווית זיהוי לשדה או מדד |
| **אפשרות א': החלף אחד מ-3 הנכסים הקיימים (הישן יחזור לתיק)** | מודאל (RuleOf3WarningModal) | [RuleOf3WarningModal.tsx#L74](file:///c:/comona/src/modules/KosTime/components/RuleOf3WarningModal.tsx#L74) | תווית שדה קלט בטופס או בפאנל העריכה |
| **מסנכרן נכסים ומשימות מאובטחות...** | תצוגה ראשית / אזור (KosTimeMainView) | [KosTimeMainView.tsx#L95](file:///c:/comona/src/modules/KosTime/views/KosTimeMainView.tsx#L95) | תווית טקסט / חיווי מצב בממשק |

</div>
