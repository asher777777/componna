<div dir="rtl" style="text-align: right;">

# 🎨 קטלוג טקסטים ורכיבי UI - פרונט ותצוגה (Frontend): ניהול קמפיינים ושגרירים (ambassador-campaigns-hub)

* **שכבה:** פרונט / תצוגת לקוח ונגן (Frontend & Presentation)
* **תיקיית הרכיב:** [src/modules/KosCampaigns](file:///c:/comona/src/modules/KosCampaigns)
* **תיאור:** כלל הכותרות, התוויות, שמות הפילטרים, שמות האזורים, הפלייסהולדרים וכפתורי ה-CTA בשכבת הפרונט והתצוגה של ניהול קמפיינים ושגרירים (ambassador-campaigns-hub).
* **קבצים שנסרקו בשכבה זו (9):** [AmbassadorPublicPageView.tsx](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorPublicPageView.tsx), [CampaignDonorsWidget.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx), [CampaignHeaderWidget.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignHeaderWidget.tsx), [CampaignPublicLandingView.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignPublicLandingView.tsx), [CampaignStickyBar.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx), [CampaignTiersList.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignTiersList.tsx), [CampaignTiersWidget.tsx](file:///c:/comona/src/modules/KosCampaigns/components/CampaignTiersWidget.tsx), [DonationDrawer.tsx](file:///c:/comona/src/modules/KosCampaigns/components/DonationDrawer.tsx), [LiveDonationAlert.tsx](file:///c:/comona/src/modules/KosCampaigns/components/LiveDonationAlert.tsx)
* **סה"כ אלמנטים בשכבה זו:** 31 (אזורים/אקורדיונים: 0, כותרות: 5, פילטרים/טאבים: 6, פלייסהולדרים: 1, כפתורי CTA: 10, תוויות: 9)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (0)

_לא נמצאו אלמנטים בקטגוריה זו בשכבה זו._

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (5)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **אנונימי** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L214](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L214) | כותרת תצוגה (H4) בכרטיס / ווידג׳ט (CampaignDonorsWidget) |
| **חזון הקמפיין והמטרות** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L363](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L363) | כותרת תצוגה (H4) בכרטיס / ווידג׳ט (CampaignDonorsWidget) |
| **קמפיין גיוס תרומות** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L37](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L37) | כותרת ראשית של האזור / הכרטיס |
| **שתף קמפיין זה** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L57](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L57) | כותרת ראשית של האזור / הכרטיס |
| **תרומה מהירה באפליקציית Bit** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L80](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L80) | כותרת ראשית של האזור / הכרטיס |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (6)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **תורמים** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L111](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L111) | סינון נתונים / בחירת תצוגה או סגנון |
| **שגרירים ויעדים אישיים** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L125](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L125) | סינון נתונים / בחירת תצוגה או סגנון |
| **אודות הקמפיין** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L140](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L140) | סינון נתונים / בחירת תצוגה או סגנון |
| **האחרונים** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L170](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L170) | סינון נתונים / בחירת תצוגה או סגנון |
| **מובילים** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L181](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L181) | סינון נתונים / בחירת תצוגה או סגנון |
| **ערוך ועצב קמפיין זה (HomeEditor Studio)** | תצוגה ראשית / אזור (CampaignPublicLandingView) | [CampaignPublicLandingView.tsx#L184](file:///c:/comona/src/modules/KosCampaigns/components/CampaignPublicLandingView.tsx#L184) | אפשרות בחירת סגנון / תצוגה / פילטר |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (1)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **חיפוש לפי שם או הקדשה...** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L164](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L164) | טקסט ממלא מקום בשדה חיפוש וסינון מהיר |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (10)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **חזור ללוח הראשי** | תצוגה ראשית / אזור (AmbassadorPublicPageView) | [AmbassadorPublicPageView.tsx#L47](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorPublicPageView.tsx#L47) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הועתק! / העתק קישור** | תצוגה ראשית / אזור (AmbassadorPublicPageView) | [AmbassadorPublicPageView.tsx#L63](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorPublicPageView.tsx#L63) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שתף בוואטסאפ** | תצוגה ראשית / אזור (AmbassadorPublicPageView) | [AmbassadorPublicPageView.tsx#L71](file:///c:/comona/src/modules/KosCampaigns/components/AmbassadorPublicPageView.tsx#L71) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הועתק! / העתק קישור** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L313](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L313) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שתף** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L322](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L322) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הצטרף כמוביל קהילה והקם יעד אישי** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L337](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L337) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] ערוך ועצב קמפיין זה (HomeEditor Studio)** | תצוגה ראשית / אזור (CampaignPublicLandingView) | [CampaignPublicLandingView.tsx#L181](file:///c:/comona/src/modules/KosCampaigns/components/CampaignPublicLandingView.tsx#L181) | ערוך ועצב קמפיין זה (HomeEditor Studio) |
| **הועתק! / שתף** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L53](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L53) | שתף קמפיין זה |
| **bit תרומה ב- bit** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L76](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L76) | תרומה מהירה באפליקציית Bit |
| **תרום** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L90](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L90) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (9)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **אודות הקמפיין** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L149](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L149) | תווית טקסט / חיווי מצב בממשק |
| **לא נמצאו תרומות להצגה** | כרטיס / ווידג׳ט (CampaignDonorsWidget) | [CampaignDonorsWidget.tsx#L199](file:///c:/comona/src/modules/KosCampaigns/components/CampaignDonorsWidget.tsx#L199) | תווית טקסט / חיווי מצב בממשק |
| **גויסו עד כה** | כרטיס / ווידג׳ט (CampaignHeaderWidget) | [CampaignHeaderWidget.tsx#L147](file:///c:/comona/src/modules/KosCampaigns/components/CampaignHeaderWidget.tsx#L147) | תווית טקסט / חיווי מצב בממשק |
| **יעד:** | כרטיס / ווידג׳ט (CampaignHeaderWidget) | [CampaignHeaderWidget.tsx#L155](file:///c:/comona/src/modules/KosCampaigns/components/CampaignHeaderWidget.tsx#L155) | תווית קבוצת פקדים בעורך / בממשק |
| **נותרו ליעד:** | כרטיס / ווידג׳ט (CampaignHeaderWidget) | [CampaignHeaderWidget.tsx#L182](file:///c:/comona/src/modules/KosCampaigns/components/CampaignHeaderWidget.tsx#L182) | תווית קבוצת פקדים בעורך / בממשק |
| **תורמים** | כרטיס / ווידג׳ט (CampaignHeaderWidget) | [CampaignHeaderWidget.tsx#L190](file:///c:/comona/src/modules/KosCampaigns/components/CampaignHeaderWidget.tsx#L190) | תווית טקסט / חיווי מצב בממשק |
| **עמוד מוביל קהילה** | תצוגה ראשית / אזור (CampaignPublicLandingView) | [CampaignPublicLandingView.tsx#L112](file:///c:/comona/src/modules/KosCampaigns/components/CampaignPublicLandingView.tsx#L112) | תווית טקסט / חיווי מצב בממשק |
| **לקמפיין הראשי** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L69](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L69) | תווית טקסט / חיווי מצב בממשק |
| **תרומה ב-** | סרגל ניווט / כלים (CampaignStickyBar) | [CampaignStickyBar.tsx#L85](file:///c:/comona/src/modules/KosCampaigns/components/CampaignStickyBar.tsx#L85) | תווית טקסט / חיווי מצב בממשק |

</div>
