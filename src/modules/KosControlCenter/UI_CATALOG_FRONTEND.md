<div dir="rtl" style="text-align: right;">

# 🎨 קטלוג טקסטים ורכיבי UI - פרונט ותצוגה (Frontend): מרכז שליטה ובקרה (control-center-hub)

* **שכבה:** פרונט / תצוגת לקוח ונגן (Frontend & Presentation)
* **תיקיית הרכיב:** [src/modules/KosControlCenter](file:///c:/comona/src/modules/KosControlCenter)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הפרונט והתצוגה של מרכז שליטה ובקרה (control-center-hub).
* **קבצים שנסרקו בשכבה זו (6):** [ControlCenterMainView.tsx](file:///c:/comona/src/modules/KosControlCenter/components/ControlCenterMainView.tsx), [BentoGridLayout.tsx](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx), [CommandMatrixLayout.tsx](file:///c:/comona/src/modules/KosControlCenter/components/layouts/CommandMatrixLayout.tsx), [ExecutiveKpiLayout.tsx](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx), [MobileSimulatorLayout.tsx](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx), [WorkflowPipelineLayout.tsx](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx)
* **סה"כ אלמנטים בשכבה זו:** 60 (אזורים/אקורדיונים: 0, כותרות: 29, פילטרים/טאבים: 7, פלייסהולדרים: 0, כפתורי CTA: 12, תוויות: 12)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (29)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **פרטים טכניים ופעולות חיות** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L114](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L114) | כותרת ראשית של האזור / הכרטיס |
| **כניסה ישירה אל ללא סיידבר** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L233](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L233) | כותרת ראשית של האזור / הכרטיס |
| **צפה בפרטים טכניים** | רכיב (CommandMatrixLayout) | [CommandMatrixLayout.tsx#L138](file:///c:/comona/src/modules/KosControlCenter/components/layouts/CommandMatrixLayout.tsx#L138) | כותרת ראשית של האזור / הכרטיס |
| **כניסה נקייה ללא סיידבר** | רכיב (CommandMatrixLayout) | [CommandMatrixLayout.tsx#L146](file:///c:/comona/src/modules/KosControlCenter/components/layouts/CommandMatrixLayout.tsx#L146) | כותרת ראשית של האזור / הכרטיס |
| **טפסים ושאלונים מקוונים** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L45](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L45) | כותרת ראשית של האזור / הכרטיס |
| **עסקאות קשר ואיזיקאונט** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L55](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L55) | כותרת ראשית של האזור / הכרטיס |
| **פריטי מדיה ב-Storage** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L65](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L65) | כותרת ראשית של האזור / הכרטיס |
| **קהילות וקבוצות CRM** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L75](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L75) | כותרת ראשית של האזור / הכרטיס |
| **חטיבת שיווק וצמיחה דיגיטלית** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L87](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L87) | כותרת ראשית של האזור / הכרטיס |
| **דפי נחיתה, מחוללי טפסים, והמרת לקוחות** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L87](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L87) | כותרת משנה של האזור / המודאל |
| **חטיבת לקוחות, קהילות ותקשורת** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L88](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L88) | כותרת ראשית של האזור / הכרטיס |
| **אנליטיקה, סגמנטים של אנשי קשר ואוטומציית וואטסאפ** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L88](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L88) | כותרת משנה של האזור / המודאל |
| **חטיבת כספים, סליקה וחשבונאות** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L89](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L89) | כותרת ראשית של האזור / הכרטיס |
| **סליקת אשראי ו-Bit, הוראות קבע והפקת מסמכים** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L89](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L89) | כותרת משנה של האזור / המודאל |
| **חטיבת מדיה, וידאו ותוכן AI** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L90](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L90) | כותרת ראשית של האזור / הכרטיס |
| **אולפן וידאו HeyGen, גלריית ענן ונגן זרימה אינטראקטיבי** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L90](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L90) | כותרת משנה של האזור / המודאל |
| **חטיבת תשתיות, מיתוג ומסדי נתונים** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L91](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L91) | כותרת ראשית של האזור / הכרטיס |
| **זהות מותג DNA, מחבר מסד מרכזי ואימות** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L91](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L91) | כותרת משנה של האזור / המודאל |
| **לוח בקרה נייד** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L126](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L126) | כותרת תצוגה (H3) ברכיב (MobileSimulatorLayout) |
| **דפי נחיתה, טפסים ומכירות SaaS** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L28](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L28) | כותרת משנה של האזור / המודאל |
| **קהילות, לידים ואוטומציית וואטסאפ** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L36](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L36) | כותרת משנה של האזור / המודאל |
| **סליקה והכנסות** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L43](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L43) | כותרת ראשית של האזור / הכרטיס |
| **תשלומים, הוראות קבע וחשבוניות** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L44](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L44) | כותרת משנה של האזור / המודאל |
| **הפקת תוכן ומדיה** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L51](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L51) | כותרת ראשית של האזור / הכרטיס |
| **וידאו AI, גלריית אחסון ונגן חכם** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L52](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L52) | כותרת משנה של האזור / המודאל |
| **תשתיות ו-DNA** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L59](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L59) | כותרת ראשית של האזור / הכרטיס |
| **זהות מותג, מחבר מסד ואימות משתמשים** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L60](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L60) | כותרת משנה של האזור / המודאל |
| **צינור זרימת העבודה המערכתי (Business Lifecycle Pipeline)** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L76](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L76) | כותרת תצוגה (H3) ברכיב (WorkflowPipelineLayout) |
| **מידע** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L144](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L144) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (7)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סך לידים במאגר ה-CRM** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L25](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L25) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **עמודי נחיתה פעילים** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L35](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L35) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **הכל** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L203](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L203) | סינון נתונים / בחירת תצוגה או סגנון |
| **שיווק** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L210](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L210) | סינון נתונים / בחירת תצוגה או סגנון |
| **סליקה** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L224](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L224) | סינון נתונים / בחירת תצוגה או סגנון |
| **משיכה ושיווק** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L27](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L27) | אפשרות בחירת סגנון / תצוגה / פילטר |
| **אינטראקציה וקשר** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L35](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L35) | אפשרות בחירת סגנון / תצוגה / פילטר |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **[כפתור אייקון] פרטים טכניים ופעולות חיות** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L104](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L104) | פרטים טכניים ופעולות חיות |
| **שיגור הודעה** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L138](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L138) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **+ ליד** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L151](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L151) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מפתחות** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L179](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L179) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **כניסה** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L223](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L223) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] צפה בפרטים טכניים** | רכיב (CommandMatrixLayout) | [CommandMatrixLayout.tsx#L131](file:///c:/comona/src/modules/KosControlCenter/components/layouts/CommandMatrixLayout.tsx#L131) | צפה בפרטים טכניים |
| **הפעל** | רכיב (CommandMatrixLayout) | [CommandMatrixLayout.tsx#L143](file:///c:/comona/src/modules/KosControlCenter/components/layouts/CommandMatrixLayout.tsx#L143) | כניסה נקייה ללא סיידבר |
| **iPhone 16 Pro Max (מסגרת)** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L47](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L47) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **Android Flat (מסגרת)** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L57](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L57) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **מובייל רחב (Canvas)** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L67](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L67) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] מידע** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L141](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L141) | מידע |
| **הפעל** | רכיב (WorkflowPipelineLayout) | [WorkflowPipelineLayout.tsx#L162](file:///c:/comona/src/modules/KosControlCenter/components/layouts/WorkflowPipelineLayout.tsx#L162) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (12)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **תקן 11 שכבות מודולרי** | תצוגה ראשית / אזור (ControlCenterMainView) | [ControlCenterMainView.tsx#L83](file:///c:/comona/src/modules/KosControlCenter/components/ControlCenterMainView.tsx#L83) | תווית טקסט / חיווי מצב בממשק |
| **עצמאי לחלוטין** | תצוגה ראשית / אזור (ControlCenterMainView) | [ControlCenterMainView.tsx#L85](file:///c:/comona/src/modules/KosControlCenter/components/ControlCenterMainView.tsx#L85) | תווית טקסט / חיווי מצב בממשק |
| **העלאה** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L174](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L174) | תווית טקסט / חיווי מצב בממשק |
| **פריטים** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L215](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L215) | תווית טקסט / חיווי מצב בממשק |
| **מוכן לשימוש** | רכיב (BentoGridLayout) | [BentoGridLayout.tsx#L218](file:///c:/comona/src/modules/KosControlCenter/components/layouts/BentoGridLayout.tsx#L218) | תווית טקסט / חיווי מצב בממשק |
| **מדדי ביצוע עסקיים (Executive Overview)** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L104](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L104) | תווית טקסט / חיווי מצב בממשק |
| **כניסה לרכיב** | רכיב (ExecutiveKpiLayout) | [ExecutiveKpiLayout.tsx#L158](file:///c:/comona/src/modules/KosControlCenter/components/layouts/ExecutiveKpiLayout.tsx#L158) | תווית טקסט / חיווי מצב בממשק |
| **מרכז השליטה במגע** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L127](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L127) | תווית טקסט / חיווי מצב בממשק |
| **פתח** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L191](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L191) | תווית טקסט / חיווי מצב בממשק |
| **הכל** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L208](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L208) | תווית טקסט / חיווי מצב בממשק |
| **שיווק** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L215](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L215) | תווית טקסט / חיווי מצב בממשק |
| **סליקה** | רכיב (MobileSimulatorLayout) | [MobileSimulatorLayout.tsx#L229](file:///c:/comona/src/modules/KosControlCenter/components/layouts/MobileSimulatorLayout.tsx#L229) | תווית טקסט / חיווי מצב בממשק |

</div>
