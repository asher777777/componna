<div dir="rtl" style="text-align: right;">

# 🎨 קטלוג טקסטים ורכיבי UI - פרונט ותצוגה (Frontend): מערכת טפסים שלביים חכמים (KSF)

* **שכבה:** פרונט / תצוגת לקוח ונגן (Frontend & Presentation)
* **תיקיית הרכיב:** [src/modules/KosForms](file:///c:/comona/src/modules/KosForms)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הפרונט והתצוגה של מערכת טפסים שלביים חכמים (KSF).
* **קבצים שנסרקו בשכבה זו (8):** [CampaignTiersList.tsx](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx), [DonationDrawer.tsx](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx), [FormCompletionScreen.tsx](file:///c:/comona/src/modules/KosForms/components/runner/FormCompletionScreen.tsx), [ProgressBar.tsx](file:///c:/comona/src/modules/KosForms/components/runner/ProgressBar.tsx), [SmartFormRunner.tsx](file:///c:/comona/src/modules/KosForms/components/runner/SmartFormRunner.tsx), [StepRenderer.tsx](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx), [LuxuryIconRenderer.tsx](file:///c:/comona/src/modules/KosForms/components/shared/LuxuryIconRenderer.tsx), [useFormRunnerState.ts](file:///c:/comona/src/modules/KosForms/hooks/useFormRunnerState.ts)
* **סה"כ אלמנטים בשכבה זו:** 46 (אזורים/אקורדיונים: 0, כותרות: 19, פילטרים/טאבים: 0, פלייסהולדרים: 3, כפתורי CTA: 10, תוויות: 14)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (19)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **מתחילה בברכה** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L10](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L10) | כותרת ראשית של האזור / הכרטיס |
| **₪180 לחודש ל-12 חודשים** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L10](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L10) | כותרת משנה של האזור / המודאל |
| **מכפילה הצלחה** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L11](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L11) | כותרת ראשית של האזור / הכרטיס |
| **₪360 לחודש ל-12 חודשים** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L11](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L11) | כותרת משנה של האזור / המודאל |
| **מרחיבה את הכלי** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L12](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L12) | כותרת ראשית של האזור / הכרטיס |
| **₪550 לחודש ל-12 חודשים** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L12](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L12) | כותרת משנה של האזור / המודאל |
| **פותחת שפע** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L13](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L13) | כותרת ראשית של האזור / הכרטיס |
| **₪770 לחודש ל-12 חודשים** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L13](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L13) | כותרת משנה של האזור / המודאל |
| **פורצת דרך** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L14](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L14) | כותרת ראשית של האזור / הכרטיס |
| **₪1,500 לחודש ל-12 חודשים** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L14](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L14) | כותרת משנה של האזור / המודאל |
| **שלב א: בחירת סכום** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L484](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L484) | כותרת תצוגה (H4) במגירה צדדית (DonationDrawer) |
| **שלב ב: פרטים אישיים** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L669](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L669) | כותרת תצוגה (H4) במגירה צדדית (DonationDrawer) |
| **שלב ג: תשלום מאובטח** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L852](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L852) | כותרת תצוגה (H4) במגירה צדדית (DonationDrawer) |
| **בקשת התשלום נשלחה ל-Bit בהצלחה! 📲** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L995](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L995) | כותרת תצוגה (H4) במגירה צדדית (DonationDrawer) |
| **תשלום מהיר ומאובטח באפליקציית Bit** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L1038](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L1038) | כותרת תצוגה (H4) במגירה צדדית (DonationDrawer) |
| **תודה רבה על תרומתך! ❤️** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L1250](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L1250) | כותרת תצוגה (H3) במגירה צדדית (DonationDrawer) |
| **הקלטה פעילה - לחץ לעצירה** | רכיב (StepRenderer) | [StepRenderer.tsx#L234](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L234) | כותרת ראשית של האזור / הכרטיס |
| **סליקה מאובטחת באמצעות מסוף קשר** | רכיב (StepRenderer) | [StepRenderer.tsx#L596](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L596) | כותרת תצוגה (H4) ברכיב (StepRenderer) |
| **שדה חובה** | רכיב (StepRenderer) | [StepRenderer.tsx#L641](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L641) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (3)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **למשל: משפחת כהן** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L717](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L717) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **name@example.com** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L762](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L762) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **לזכות, לרפואת, או ברכה מכל הלב...** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L801](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L801) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **הוראת קבע (הו״ק)** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L560](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L560) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **תרומה חד פעמית** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L575](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L575) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **המשך לפרטים אישיים** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L635](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L635) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חזור לבחירת סכום** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L655](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L655) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **חזור לעריכת פרטים** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L837](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L837) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כרטיס אשראי** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L947](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L947) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **אישרתי את התשלום באפליקציית Bit ✓** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L1015](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L1015) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **העתק קישור** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L1307](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L1307) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מילוי טופס נוסף** | רכיב (FormCompletionScreen) | [FormCompletionScreen.tsx#L78](file:///c:/comona/src/modules/KosForms/components/runner/FormCompletionScreen.tsx#L78) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הקודם** | רכיב (SmartFormRunner) | [SmartFormRunner.tsx#L342](file:///c:/comona/src/modules/KosForms/components/runner/SmartFormRunner.tsx#L342) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (14)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סכום** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L178](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L178) | תווית טקסט / חיווי מצב בממשק |
| **אחר** | טבלה / רשימת נתונים (CampaignTiersList) | [CampaignTiersList.tsx#L179](file:///c:/comona/src/modules/KosForms/components/donation/CampaignTiersList.tsx#L179) | תווית טקסט / חיווי מצב בממשק |
| **🧪 מצב טסט פעיל (Sandbox)** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L872](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L872) | תווית טקסט / חיווי מצב בממשק |
| **מבצע סליקה מאובטחת...** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L1206](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L1206) | תווית טקסט / חיווי מצב בממשק |
| **צפה בקבלה שהופקה (PDF)** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L1273](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L1273) | תווית טקסט / חיווי מצב בממשק |
| **שתפו והפיצו את הבשורה:** | מגירה צדדית (DonationDrawer) | [DonationDrawer.tsx#L1286](file:///c:/comona/src/modules/KosForms/components/donation/DonationDrawer.tsx#L1286) | תווית קבוצת פקדים בעורך / בממשק |
| **טוען טופס...** | רכיב (SmartFormRunner) | [SmartFormRunner.tsx#L86](file:///c:/comona/src/modules/KosForms/components/runner/SmartFormRunner.tsx#L86) | תווית טקסט / חיווי מצב בממשק |
| **שולח...** | רכיב (SmartFormRunner) | [SmartFormRunner.tsx#L399](file:///c:/comona/src/modules/KosForms/components/runner/SmartFormRunner.tsx#L399) | תווית טקסט / חיווי מצב בממשק |
| **הבא** | רכיב (SmartFormRunner) | [SmartFormRunner.tsx#L408](file:///c:/comona/src/modules/KosForms/components/runner/SmartFormRunner.tsx#L408) | תווית טקסט / חיווי מצב בממשק |
| **כתובת המערכת:** | רכיב (StepRenderer) | [StepRenderer.tsx#L125](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L125) | תווית קבוצת פקדים בעורך / בממשק |
| **עבור:** | רכיב (StepRenderer) | [StepRenderer.tsx#L571](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L571) | תווית קבוצת פקדים בעורך / בממשק |
| **הקדשה:** | רכיב (StepRenderer) | [StepRenderer.tsx#L577](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L577) | תווית קבוצת פקדים בעורך / בממשק |
| **סכום לתשלום:** | רכיב (StepRenderer) | [StepRenderer.tsx#L603](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L603) | תווית קבוצת פקדים בעורך / בממשק |
| **מקליט ומפענח את קולך כעת... דבר ברור** | רכיב (StepRenderer) | [StepRenderer.tsx#L660](file:///c:/comona/src/modules/KosForms/components/runner/StepRenderer.tsx#L660) | תווית טקסט / חיווי מצב בממשק |

</div>
