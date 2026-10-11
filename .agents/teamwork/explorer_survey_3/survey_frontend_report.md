# סקר אפיון פרונטנד, מיתוג קושאן 2026, AI Copilot ורישום מודול (Frontend Survey Report)

<div dir="rtl" style="text-align: right;">

## 1. תקציר מנהלים וזהות המודול (Executive Summary)

מסמך זה מרכז את ממצאי חקירת הפרונטנד, המיתוג, ממשק המשתמש (UI), מנוע ה-AI Copilot ורישום המודול עבור רכיב הדגל החדש:
- **שם רשמי בעברית:** "קושאן מייל אוטומטי"
- **שם רשמי באנגלית:** "KOSUN AM" (הנחיה חד-משמעית: kosun ולא cashwan!)
- **מזהה המודול ונתיב תיקייה:** `kosun-am` (`src/modules/kosun-am/`)
- **קידומת קולקציות:** `mod_kosun_am_` (`mod_kosun_am_campaigns`, `mod_kosun_am_templates`, `mod_kosun_am_automations`, `mod_kosun_am_logs`)
- **תפקיד מערכתי:** מרכז דיוור, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות (Email + WhatsApp Green API + CRM + Page Builder), המעוצב בסטנדרט 2026 של קושאן, ופועל כמערכת חיה ונושמת עם סוכן AI חכם (Kosai Email Copilot).

---

## 2. מיתוג קושאן 2026 (Kosun 2026 Branding Guidelines)

על פי סקיל המיתוג של קושאן (`cashwan-branding` / The Entity of Kosun) והעדכונים המחייבים:

### 2.1 שם המותג והיישות החיה (The Living & Breathing Persona)
- **שם המערכת והרכיב:** אך ורק **קושאן** בעברית ו-**kosun** באנגלית (איסור מוחלט על שימוש ב-cashwan).
- **קושאן כשותף אישי:** קושאן אינה תוכנה קרה אלא שותף אישי שלוקח אחריות ומסיר דאגות מבעל העסק.
- **טקסטים ו-Placeholders:** שימוש בשפה חמימה, צעירה ופרואקטיבית:
  - "קושאן דואג שהמייל יגיע ליעד בזמן"
  - "קושאן מכין את הקמפיין הבא שלך"
  - "קושאן מנתח את נתוני הפתיחה וההקלקות"
  - "תן לקושאן לנסח עבורך כותרת ממירה ב-AI"

### 2.2 טיפוגרפיה (Typography)
- גופן המערכת הבלעדי הוא **Heebo** (`font-heebo` / `font-sans`).
- הגופן כבר מוטמע באופן מלא ב-`index.html` (משקלים 300 עד 900) וב-`tailwind.config.js`.
- טיפוגרפיה סולידית ללא כותרות ענק המבזבזות שטח מסך.

### 2.3 פריסת בנטו גריד (Bento Grid Layout)
- חלוקת המידע במסך בכרטיסיות "בנטו" (Bento Cards) נקיות, שטוחות, בעלות פינות מעוגלות מודרניות (`rounded-3xl` או `rounded-2xl`).
- השארת מרחב נשימה (Negative Space / Air).
- מידע מורכב או מפורט מוצג במודאלים קופצים (Popups/Modals) ולא מעמיס על המסך הראשי.

### 2.4 ניווט עליון בלבד (Top Nav Only - Zero Sidebars)
- על פי חוק 2 במיתוג קושאן, **אין להשתמש בתפריטי צד (Sidebars / Sliders)**.
- כל הניווט מתבצע דרך תפריט הניווט העליון הראשי של המערכת (`CashwanTopNav.tsx`), ובתוך המודול דרך טאבים/ניווט עליון נקי (למשל: קמפיינים, תבניות, אוטומציות, אנשי קשר/קהלים).

### 2.5 תאימות יום/לילה וקונטרסט (Day & Night Mode)
- תמיכה מלאה ב-Light Mode (ברירת מחדל) וב-Dark Mode דרך Tailwind `dark:`.
- הקפדה מחמירה על קונטרסט ונגישות (Accessibility) - שום טקסט אינו דהוי או בלתי קריא באף אחד מהמצבים.

---

## 3. איסור אימוג'י טקסטואליים ועטיפת RTL מוחלטת

### 3.1 אפס אימוג'י טקסטואליים (Zero Textual Emojis)
- **איסור מוחלט** על אימוג'ים טקסטואליים (כגון 👋, 🚀, 🤖, ✉️, 📊, 💡, 🔥, ✨) בקוד, בכפתורים, בטקסטים, בסימולטורים או בתבניות ברירת מחדל.
- **שימוש בלעדי בספריית Lucide Icons (`lucide-react`)**:
  - `Mail` - מיילים וקמפיינים
  - `Send` - שיגור והפצה
  - `Sparkles` - יכולות AI / Kosai
  - `Workflow` / `GitFork` / `Zap` - אוטומציות וטריגרים
  - `Layout` / `Layers` - עורך תבניות ובנטו גריד
  - `Users` - קהלי יעד ואנשי קשר
  - `BarChart3` - נתונים סטטיסטיים
  - `Clock` - תזמונים והשהיות
  - `CheckCircle2` / `AlertCircle` - סטטוסים וחיוויי הצלחה/שגיאה

### 3.2 עטיפת RTL מחמירה (Strict RTL Wrapper)
- כל תצוגה, קומפוננטה ומודאל חייבים להיות עטופים ב:
  ```tsx
  <div dir="rtl" style={{ textAlign: 'right' }} className="font-heebo ...">
  ```
- שימוש מפורש ב-`dir="rtl"` ו-`style={{ textAlign: 'right' }}` מבטיח שמונחים באנגלית (כגון "KOSUN AM", "Gemini 3.8 Flash", "HTML", "EventBus") לא ישבשו את רצף וכיוון הקריאה בעברית.

---

## 4. אקורדיון סטטיסטיקות מתקפל וטולטיפים חכמים מזעריים

### 4.1 הסתרת סטטיסטיקות באקורדיון (Collapsible Stats Accordion)
- על פי חוק 7 במיתוג קושאן, כרטיסיות נתונים סטטיסטיים (כגון אחוזי פתיחה, שיעורי הקלקה, כמות נמענים, גרפי ביצועים של Recharts) **חייבות להיות מוסתרות כברירת מחדל**.
- הצגתן מתבצעת אך ורק דרך לשונית/אקורדיון מתקפל קומפקטי:
  - כותרת: "קושאן מציג נתונים וביצועים (לחץ לפתיחה)" עם אייקון `ChevronDown`.
  - בלחיצה נפתח הבנטו גריד של המדדים, ובלחיצה חוזרת הוא מתקפל.
  - הדבר שומר על ממשק שקט, ממוקד ונקי מהסחות דעת.

### 4.2 טולטיפים חכמים מזעריים (Smart Tooltip)
- שימוש בקומפוננטה המערכתית הקיימת:
  ```tsx
  import { SmartTooltip } from '../../components/Ui/SmartTooltip';
  ```
- מאפייני הטולטיפ:
  - אייקון `(i)` עדין ומזערי (גודל `w-4 h-4 text-[10px]`).
  - לחיצה פותחת פופאפ הסבר ממוקד, התומך במצב יום ולילה.
  - נסגר בלחיצה בכל מקום במסך (Click outside) או בלחיצה על כפתור הסגירה הפנימי `X`.
  - ביטול טקסטים ארוכים וכותרות ענק בגוף הטפסים.

---

## 5. מנוע הבינה המלאכותית: Kosai Email Copilot

### 5.1 מודלי Gemini Flash מורשים (Gemini 3.8 / 3.5 Flash)
על פי מדיניות ה-AI של קושאן וטבלת העלויות ב-`src/core/ai/geminiCostTracker.ts`:
- **מודל ראשי:** `gemini-3.8-flash`
- **מודל משני בשרשרת הנפילה (Cascade):** `gemini-3.5-flash`
- **מודל גיבוי שלישי:** `gemini-3.8-flash-lite`
- **איסור מוחלט על מודלים מומצאים** (כגון שמות לא קיימים או מודלים כבדים שאינם Flash ללא הצדקה).

### 5.2 סנכרון עם זהות המותג (Brand DNA Integration)
- שליפת נתוני המותג מתבצעת ללא Cross-Import ישיר, דרך:
  1. `getCapability<BrandDnaContract>('brand-dna')` מתוך `core/contracts`.
  2. האזנה לאירוע `brand:updated` מתוך ה-`EventBus`.
  3. או שליפה בטוחה של מסמך `brand_dna` מקולקציית הטננט בעת הצורך.
- המידע המוזרק להנחיות המערכת (System Directive):
  - שם החברה והסלוגן (`companyName`, `slogan`).
  - טון הדיבור וסגנון התקשורת (`toneOfVoice`: רשמי, חם, צעיר, מניע לפעולה).
  - קהלי יעד ומאפייניהם (`targetAudiences`).
  - מילות כוח וביטויים מנצחים (`powerWords`).

### 5.3 יכולות ה-Copilot בתוך KOSUN AM
1. **מחולל כותרות ממירות (Subject Line Wizard):** ייצור 3-5 חלופות לכותרת המייל ותקציר ה-Preheader, מותאמות לפילוח A/B Testing.
2. **מחולל תוכן וניוזלטרים (Email Body Generator):** יצירת תוכן שיווקי באורך מבוקש (קצר ומניע לפעולה / ניוזלטר עשיר) בשפת המותג.
3. **הצעת סגמנטציה חכמה (Audience Segmentation):** המלצה אוטומטית אילו קבוצות מתוך ה-CRM או הקהילות בוואטסאפ מתאימות ביותר לקמפיין.
4. **מחולל בלוקי בנטו למייל:** יצירת מבנה ויזואלי של כרטיסיות תוכן, כפתורי הנעה לפעולה (CTA) ויתרונות מרכזיים.

### 5.4 מעקב טוקנים ועלויות (Token Tracking & Cost Calculation)
- שימוש ישיר בפונקציה המערכתית:
  ```typescript
  import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai/geminiCostTracker';
  
  const usageReport = calculateGeminiCost({
    model: 'gemini-3.8-flash',
    promptTokens: response.usageMetadata?.promptTokenCount,
    candidatesTokens: response.usageMetadata?.candidatesTokenCount,
  });
  ```
- הצגת סיכום צריכה שקוף וקומפקטי למשתמש (עלות בדולרים ובשקלים לפי שער 3.70).

### 5.5 מפל נפילה (Fallback Cascade) וגיבוי מקומי חכם
- אם ה-API נכשל או חורג מזמן התגובה (Timeout), השירות עובר מיידית למודל הבא במפל (`gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.8-flash-lite`).
- בהיעדר מפתח API או בעבודה במצב לא מקוון: ה-Copilot מייצר הצעות ברירת מחדל חכמות (Smart Mock Recommendations) מבוססות Brand DNA, כך שהממשק לעולם אינו נתקע או מחזיר שגיאה ריקה למשתמש.
- שליפת מפתחות מתבצעת אך ורק דרך `getModuleGeminiKey('kosun-am')` מתוך `tenantApiKeys.ts` (איסור מוחלט על `localStorage`).

---

## 6. רישום המודול ב-Workbench (`moduleRegistry.ts`)

### 6.1 טעינה עצלה (React.lazy)
ברישום המודול ב-`src/workbench/moduleRegistry.ts` חובה להשתמש בטעינה דינמית:
```typescript
const KosunAmStandaloneView = React.lazy(() =>
  import('../modules/kosun-am').then((m) => ({ default: m.KosunAmStandaloneView }))
);
```

### 6.2 הגדרת המודול במערך `REGISTERED_MODULES`
```typescript
{
  id: 'kosun-am',
  name: 'קושאן מייל אוטומטי - KOSUN AM',
  description: 'מערכת דיוור חכמה, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות עם שותף אישי שלוקח אחריות.',
  component: KosunAmStandaloneView,
  route: '/kosun-am',
  collectionPrefix: 'mod_kosun_am_',
}
```

### 6.3 עדכון אייקון ב-`CashwanTopNav.tsx`
בתוך מיפוי האייקונים `MODULE_ICONS`:
```typescript
'kosun-am': Mail,
```

---

## 7. ארכיטקטורת עורך הקמפיינים, התבניות והאוטומציות

### 7.1 עורך קמפיינים ויזואלי (Visual Campaign Studio)
- מודאל או מסך בנטו הכולל שלבים אינטואיטיביים:
  1. **פרטי קמפיין:** שם הקמפיין, כותרת נושא (Subject), טקסט מקדים (Preheader), שם השולח וכתובת מענה.
  2. **בחירת קהל יעד:** שילוב קבוצות CRM, אנשי קשר לפי תגיות, או רשימות תפוצה.
  3. **עריכת תוכן ותבנית:** בחירה מתבניות קיימות או עריכה בו-זמנית בעורך הוויזואלי.
  4. **שיגור ותזמון:** שליחה מיידית, תזמון לתאריך עתידי, או הפעלה כמסע אוטומטי מתמשך.

### 7.2 עורך תבניות מייל מודולרי (Bento Email Builder)
- תאימות מלאה למבנה הבלוקים של ה-Page Builder:
  - מבנה נתונים מבוסס מקטעים: `sectionOrder: string[]`, `sections: Record<string, EmailBlockConfig>`.
  - סוגי בלוקים נתמכים:
    * `header`: לוגו, קישור מקוון לתצוגת דפדפן
    * `hero`: כותרת גדולה, תת-כותרת, תמונת באנר וכפתור ראשי
    * `bento-grid`: 2-3 כרטיסיות תוכן נקיות עם תמונה, כותרת וטקסט
    * `rich-text`: פסקאות טקסט מעוצבות
    * `button-cta`: כפתור הנעה לפעולה מעוצב המפנה לדף נחיתה מה-Page Builder
    * `whatsapp-link`: כפתור פנייה ישירה לוואטסאפ (Green API)
    * `footer`: פרטי עסק, קישורי מדיה חברתית וקישור הסרה מחייב (Unsubscribe)
- **מחולל HTML ריספונסיבי:** פונקציית המרה נקייה המייצרת HTML תואם לכל לקוחות המייל (Outlook, Gmail, Apple Mail, Mobile) עם טבלאות מותאמות וסגנונות Inlined.

### 7.3 בונה אוטומציות רב-ערוצי (Visual Automation Workflow Builder)
- ממשק Pipeline ויזואלי ונקי המציג שרשרת פעולות:
  - **טריגרים (Triggers):**
    * `crm:lead:created` - ליד חדש נוצר במערכת ה-CRM
    * `smart_form:submitted` - טופס חכם מולא בבונה הטפסים
    * `campaign:ambassador:created` - שגריר חדש הצטרף לקמפיין גיוס
    * `manual:subscribed` - הצטרפות ידנית לרשימת דיוור
  - **תנאים וסינונים (Conditions):**
    * בדיקת תגית ליד, מקור הגעה, שעה ביום, או סטטוס קיים
  - **פעולות רב-ערוציות (Actions):**
    * שליחת מייל מקמפיין/תבנית מוגדרת
    * שליחת הודעת וואטסאפ תואמת דרך WhatsApp Green API Hub
    * עדכון סטטוס ליד ב-CRM
    * הוספת השהיה (Delay / Wait): המתנה של X שעות/ימים בין שלב לשלב
- חיווי ויזואלי של כמות הנמענים שנמצאים בכל שלב באוטומציה (Active, Completed, Failed).

---

## 8. סיכום תאימות ואי-תלות בין מודולים (Zero Cross-Imports)

- **מניעת Cross-Imports:** המודול `kosun-am` לא מייבא שום קובץ ישירות מתוך מודולים אחים (`crm-groups-hub`, `whatsapp-green-api-hub`, `brand-dna-hub`, `page-builder`).
- **אינטגרציה חוקית:**
  - שימוש ב-`src/core/contracts` (אירועי EventBus ו-Contracts כגון `BrandDnaContract`).
  - שימוש ב-`src/core/connection/tenantApiKeys.ts` לשליפת מפתחות API.
  - שימוש ב-`src/core/tenant` לבידוד Multi-Tenancy מוחלט.
  - שימוש ב-`src/components/Ui/SmartTooltip.tsx` לטולטיפים.
- **תוצאת הסקר:** המפרט מוכן ובשל להטמעה מלאה על ידי ארכיטקט האפיון ומהנדסי הפיתוח.

</div>
