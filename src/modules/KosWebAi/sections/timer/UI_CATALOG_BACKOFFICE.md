<div dir="rtl" style="text-align: right;">

# 🛠️ קטלוג טקסטים ורכיבי UI - באק-אופיס ועורך (Backoffice Editor): אזור טיימר ספירה לאחור 2.0 (Timer)

* **שכבה:** באק-אופיס / פאנל עריכת האזור בבונה העמודים (Section Backoffice Editor)
* **תיקיית הרכיב:** [src/modules/KosWebAi/sections/timer](file:///c:/comona/src/modules/KosWebAi/sections/timer)
* **תיאור:** כלל שמות האקורדיונים, הכותרות, התוויות, ארכיטיפי הסגנון, הפלייסהולדרים וכפתורי הפעולה ברכיב העריכה (Section Editor) של האזור טיימר ספירה לאחור 2.0 (Timer).
* **קבצים שנסרקו בשכבה זו (1):** [TimerEditor.tsx](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx)
* **סה"כ אלמנטים בשכבה זו:** 91 (אזורים/אקורדיונים: 5, כותרות: 18, פילטרים/טאבים: 16, פלייסהולדרים: 5, כפתורי CTA: 13, תוויות: 34)

---

#### 1. שמות האזורים, המודאלים והלשוניות (Areas / Modals / Accordions) (5)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **1. בחירת פריסה ועיצוב כללי 6 סגנונות מותג מתקדמים לטיימר הספירה לאחור** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L552](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L552) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **2. רקע תמונה מתקדם לטקסט / אזור (Text Background) שכבת רקע עם 5 אפקטים עוברים מתקדמים** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L683](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L683) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **3. תאריך יעד, כותרות והנעה לפעולה הגדרת זמני הספירה לאחור וכפתור הרשמה / פעולה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L790](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L790) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **4. צורת תיבות הזמן וסדר הימים בחירת צורות מותאמות (פרח, לב, מגן, לוטוס, HUD) וכיוון הימים (ימין** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L914](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L914) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |
| **5. צבעים מותאמים אישית ומזהה עוגן צבעי רקע, ספרות, תוויות וניווט מהיר** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1088](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1088) | פתיחה/סגירה של אזור אקורדיון בעורך או במסך |

#### 2. כותרות וכותרות משנה (Headings & Subtitles) (18)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L70](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L70) | כותרת ראשית של האזור / הכרטיס |
| **תיבות זמן מעוצבות כפרח פורח או לב רומנטי, פלטת רוז-גולד ושמנת, זוהר עדין וטיפוגרפיה מעודנת** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L71](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L71) | כותרת משנה של האזור / המודאל |
| **ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L85](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L85) | כותרת ראשית של האזור / הכרטיס |
| **תיבות זמן בצורת מגן טקטי פלדה, כותרות ענק מודגשות, פחם כהה, זהב מתכתי וגבולות 2px כפולים** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L86](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L86) | כותרת משנה של האזור / המודאל |
| **ג. הפריסה העכשווית (סגנון Notion SaaS 2026)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L100](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L100) | כותרת ראשית של האזור / הכרטיס |
| **סקוורקל מעוגל 3XL נקי ומאוזן, אינדיגו וסגול מודרניים, צללים רכים ואווירת Mesh Glow** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L101](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L101) | כותרת משנה של האזור / המודאל |
| **ד. פריסה רוחנית (הרמונית, שלווה ומעוררת השראה)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L115](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L115) | כותרת ראשית של האזור / הכרטיס |
| **תיבות זמן בצורת עלי לוטוס קדוש, ירוק מרווה, טורקיז עמוק, זהב הילה ומעברים איטיים ורגועים** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L116](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L116) | כותרת משנה של האזור / המודאל |
| **ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L130](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L130) | כותרת ראשית של האזור / הכרטיס |
| **תיבות מלבן חד 90° ללא שום עיגול, מסגרת 2px מוצקה, צל מוסט קשיח 5px וטיפוגרפיה חותכת** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L131](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L131) | כותרת משנה של האזור / המודאל |
| **ו. פריסה אנליטית (מסוף HUD טכנולוגי ודיוק מדדי)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L145](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L145) | כותרת ראשית של האזור / הכרטיס |
| **תיבות זמן עם חיתוכי זוויות 45° chamfered, ציאן-כחול טלמטריה, רשת נקודות וחיווי סטטוס מדדי חי** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L146](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L146) | כותרת משנה של האזור / המודאל |
| **הספירה לאחור החלה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L226](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L226) | כותרת ראשית של האזור / הכרטיס |
| **אל תפספסו את ההזדמנות** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L227](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L227) | כותרת משנה של האזור / המודאל |
| **הספירה לאחור של החלה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L319](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L319) | כותרת ראשית של האזור / הכרטיס |
| **סנכרן כותרות ותאריכים מ-Brand DNA של המותג** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L408](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L408) | כותרת ראשית של האזור / הכרטיס |
| **סגור חלונית עריכה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L441](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L441) | כותרת ראשית של האזור / הכרטיס |
| **האם לצאת ללא שמירה?** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1206](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1206) | כותרת תצוגה (H4) בעורך הגדרות (TimerEditor) |

#### 3. שמות הפילטרים, הטאבים וארכיטיפי הסגנון (Filters, Tabs & Styles) (16)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **אוטומטי (לפי הפריסה)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L651](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L651) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **קומפקטי ומדויק** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L652](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L652) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **סטנדרטי מאוזן** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L653](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L653) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **גדול ומודגש** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L654](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L654) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ענק ומסיבי (Eye-Catching)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L655](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L655) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **קפסולה עגולה (Pill)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L669](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L669) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מעוגל מודרני (Rounded)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L670](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L670) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **חד 90° (Sharp Brutalist)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L671](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L671) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **מסותת טקטי (Chiseled)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L672](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L672) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **זום וזוהר עדין (Zoom & Glow)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L760](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L760) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ברק נע מתכתי (Shimmer Sweep)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L761](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L761) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **ציפה תלת-ממדית (Float Parallax)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L762](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L762) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **חשיפה מטשטוש (Blur Reveal)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L763](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L763) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **שינוי גרדיאנט דינמי (Gradient Shift)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L764](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L764) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כרטיס התוכן והטיימר בלבד** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L777](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L777) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |
| **כל האזור מקצה לקצה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L778](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L778) | אפשרות בחירה בתפריט נגלל (Select / פילטר) |

#### 4. פלייסהולדרים בשדות קלט וחיפוש (Placeholders) (5)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **למשל: הספירה לאחור החלה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L819](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L819) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **למשל: אל תפספסו את ההזדמנות להצטרף** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L826](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L826) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **הבטיחו את מקומכם עכשיו** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L896](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L896) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **#contact או לינק חיצוני** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L902](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L902) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |
| **timer** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1156](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1156) | הנחיית קלט למשתמש בתוך שדה טופס / עריכה |

#### 5. כפתורי ה-CTA והפעולה (CTA & Action Buttons) (13)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **סנכרון DNA** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L405](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L405) | סנכרן כותרות ותאריכים מ-Brand DNA של המותג |
| **שומר... / שמור שינויים / שמור** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L421](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L421) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **[כפתור אייקון] סגור חלונית עריכה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L437](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L437) | סגור חלונית עריכה |
| **עוד 24 שעות** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L844](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L844) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **עוד 3 ימים** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L851](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L851) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **עוד שבוע** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L858](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L858) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **סוף שנה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L865](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L865) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **ביטול** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1182](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1182) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **שומר... / שמור והחל** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1190](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1190) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **המשך בעריכה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1213](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1213) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **צא ללא שמירה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1220](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1220) | כפתור הנעה לפעולה / ביצוע פעולה בממשק |
| **הבטיחו את מקומכם עכשיו** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L236](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L236) | כפתור הנעה לפעולה (ctaText) |
| **שריינו מקום עכשיו** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L321](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L321) | כפתור הנעה לפעולה (ctaText) |

#### 6. תוויות שדות, תגיות וטולטיפים (Labels & Badges) (34)

| טקסט / שם אלמנט | איזור ברכיב | מיקום בקוד (קובץ ושורה) | שימוש ותפקיד במערכת |
| :--- | :--- | :--- | :--- |
| **אוטומטי (לפי הפריסה)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L166](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L166) | תווית זיהוי לשדה או מדד |
| **פרח פורח (Flower)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L172](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L172) | תווית זיהוי לשדה או מדד |
| **לב רומנטי (Heart)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L178](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L178) | תווית זיהוי לשדה או מדד |
| **מגן טקטי (Shield)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L184](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L184) | תווית זיהוי לשדה או מדד |
| **לוטוס קדוש (Lotus)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L190](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L190) | תווית זיהוי לשדה או מדד |
| **מלבן חד 90° (Sharp Brutalist)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L196](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L196) | תווית זיהוי לשדה או מדד |
| **מסוף HUD טכנולוגי (HUD Chamfered)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L202](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L202) | תווית זיהוי לשדה או מדד |
| **סקוורקל מעוגל 3XL (Rounded Modern)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L208](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L208) | תווית זיהוי לשדה או מדד |
| **טיימר ספירה לאחור 2.0** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L391](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L391) | תווית טקסט / חיווי מצב בממשק |
| **פריסות וסגנון** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L455](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L455) | תווית זיהוי לשדה או מדד |
| **רקע תמונה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L461](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L461) | תווית זיהוי לשדה או מדד |
| **תאריך יעד והנעה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L467](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L467) | תווית זיהוי לשדה או מדד |
| **צורות תיבות וסדר** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L473](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L473) | תווית זיהוי לשדה או מדד |
| **צבעים ועוגן** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L479](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L479) | תווית זיהוי לשדה או מדד |
| **פלטת צבעים:** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L623](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L623) | תווית קבוצת פקדים בעורך / בממשק |
| **קנה מידה לאובייקטים (Object Scale)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L643](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L643) | תווית שדה קלט בטופס או בפאנל העריכה |
| **צורת כפתור הנעה לפעולה** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L660](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L660) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תמונת רקע** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L723](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L723) | תווית זיהוי לשדה או מדד |
| **צבע שכבת כיסוי (Overlay Color)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L730](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L730) | תווית זיהוי לשדה או מדד |
| **אטימות שכבת כיסוי: %** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L736](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L736) | תווית שדה קלט בטופס או בפאנל העריכה |
| **אפקט עובר (Hover / Reveal Effect)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L752](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L752) | תווית שדה קלט בטופס או בפאנל העריכה |
| **תחולת הרקע (Scope)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L769](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L769) | תווית שדה קלט בטופס או בפאנל העריכה |
| **כותרת הטיימר** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L816](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L816) | תווית זיהוי לשדה או מדד |
| **תת-כותרת** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L823](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L823) | תווית זיהוי לשדה או מדד |
| **תאריך ושעת יעד (Date & Time)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L832](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L832) | תווית זיהוי לשדה או מדד |
| **טקסט הכפתור** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L893](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L893) | תווית זיהוי לשדה או מדד |
| **קישור הכפתור (URL / עוגן / וואטסאפ)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L899](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L899) | תווית זיהוי לשדה או מדד |
| **צבע רקע תיבות** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1115](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1115) | תווית זיהוי לשדה או מדד |
| **צבע ספרות ומספרים** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1120](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1120) | תווית זיהוי לשדה או מדד |
| **צבע תוויות היחידות (ימים/שעות)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1128](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1128) | תווית זיהוי לשדה או מדד |
| **צבע רקע כללי לאזור** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1133](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1133) | תווית זיהוי לשדה או מדד |
| **צבע כותרת ראשית** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1141](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1141) | תווית זיהוי לשדה או מדד |
| **צבע תת-כותרת** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1146](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1146) | תווית זיהוי לשדה או מדד |
| **מזהה עוגן (Anchor ID)** | עורך הגדרות (TimerEditor) | [TimerEditor.tsx#L1153](file:///c:/comona/src/modules/KosWebAi/sections/timer/TimerEditor.tsx#L1153) | תווית זיהוי לשדה או מדד |

</div>
