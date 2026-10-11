# חוקי הפרויקט והבידוד לרכיב: קושאן מייל אוטומטי (`kosun-am`)

קובץ זה נוצר עבור רכיב הדגל "קושאן מייל אוטומטי" (KOSUN AM) ומגדיר את חוקי הברזל, גבולות הבידוד, והחוזים המחייבים עבור כל סוכן AI שעובד על רכיב זה.

---

## [1] חוקי בידוד מוחלטים (Isolation Rules)
1. **אפס ייבואים צולבים (Zero Cross-Module Imports):**
   - **חל איסור מוחלט** לייבא קבצים, קומפוננטות או טיפוסים מתוך מודולים שכנים (`from '../other-module/...'`).
   - כל שיתוף מידע, טיפוסים וחוזים מתבצע אך ורק דרך `src/core/contracts/index.ts`.
2. **איסור ייבוא סינגלטונים גלובליים וקולקציות שטוחות:**
   - **חל איסור** לייבא את `db` ישירות מתוך `src/services/firebase`.
   - יש להשתמש ב-`useSystemConnection()` וב-`useTenantScope().getScopedCollectionRef(...)` תחת `tenants/{tenantId}/`.
   - איסור מוחלט על קולקציות שטוחות גלובליות.
3. **חיבור ישיר ל-DB אמיתי (Zero Mock Data, Zero LocalStorage):**
   - **חל איסור מוחלט על Mock Data** או נתוני דמה. הכל מחובר תמיד ישירות ל-Firestore האמיתי.
   - קולקציה ריקה מחזירה מערך ריק `[]` ללא המצאת נתונים.
4. **אבטחת מפתחות API ללא LocalStorage:**
   - איסור מוחלט על שמירה או קריאה מ-`localStorage` / `sessionStorage`.
   - כל מפתחות ה-API נשלפים אך ורק דרך `src/core/connection/tenantApiKeys.ts` (`getModuleApiKeys('kosun-am')`).
5. **בידוד סקריפטים בתיקיית הרכיב (Module Scripts Isolation):**
   - כל סקריפט אימות, תחזוקה או בדיקה של הרכיב חייב לחיות אך ורק תחת `src/modules/kosun-am/scripts/`.
   - איסור מוחלט על יצירת או השארת סקריפטים בתיקיית השורש `scripts/`!

---

## [2] חוקי מיתוג קושאן 2026 (Kosun 2026 Branding)
1. **זהות חיה ונושמת:** קושאן היא יישות חיה שלוקחת אחריות אישית ומסירה דאגות מבעל העסק ("קושאן דואג", "קושאן מכין").
2. **ניווט עליון בלבד (Top Nav Only):** איסור מוחלט על שימוש בתפריטי צד (Sidebars / Sliders).
3. **Bento Grid Layout:** כרטיסיות נקיות, שטוחות, עם פינות מעוגלות מודרניות (`rounded-3xl` / `rounded-2xl`).
4. **גופן Heebo בלבד:** שימוש אקסקלוסיבי ב-`font-heebo`.
5. **איסור מוחלט על אימוג'י טקסטואליים:** שימוש בלעדי באייקוני Lucide (`Mail`, `Send`, `Sparkles`, `Workflow` וכו').
6. **עטיפת RTL מוחלטת:** עטיפה מחייבת ב-`<div dir="rtl" style="text-align: right;">`.
7. **הסתרת נתונים סטטיסטיים באקורדיון מתקפל:** גרפים ונתונים מוסתרים בברירת מחדל ונפתחים רק לפי בקשת המשתמש.
8. **טולטיפים חכמים מזעריים `(i)`:** שימוש ב-`SmartTooltip.tsx` הנסגר בלחיצה מחוצה לו.

---

## [3] חוזים ויכולות מערכת (Host Capabilities & EventBus)

### 1. אירועי תקשורת אסינכרונית (EventBus)
כל תקשורת רקע עם מודולים אחרים מתבצעת ב-Pub/Sub דרך ה-EventBus:
- **אירועים שהמודול מאזין להם:**
  - `crm:lead:created`: קליטת ליד חדש והפעלת אוטומציות מייל.
  - `smart_form:submitted`: קליטת הגשת טופס חכם והפעלת מענה אוטומטי.
  - `campaign:ambassador:created`: שגריר חדש הצטרף לקמפיין.
  - `payment:completed`: תשלום הושלם בהצלחה.
- **אירועים שהמודול מפרסם:**
  - `email:campaign:sent` / `kosun_am:campaign:sent`
  - `email:automation:triggered`
  - `email:delivery:failed`

---

## [4] אנטומיית הרכיב (12 השכבות)
1. `types/index.ts` - הגדרות טיפוסים קפדניות ללא `any`.
2. `config/index.ts` - קונפיגורציית מודול, קידומות אחסון (`mod_kosun_am_`), וקולקציות.
3. `context/ModuleContext.tsx` - ניהול State מרכזי והזרקת תלויות.
4. `hooks/` - הוקים מותאמים לשימוש פנימי (`useKosunAmData.ts`, `useKosunAmActions.ts`).
5. `services/` - שירותי נתונים עם תמיכה ב-Mock Data מקומי (`emailFirestoreService.ts`, `emailDispatchService.ts`, `kosaiEmailAiService.ts`).
6. `api/functionsApi.ts` - עטיפת קריאות שרת / Cloud Functions / Gemini.
7. `prompts/index.ts` - ספריית פרומפטים מודולרית עבור Kosai Copilot.
8. `routes/ModuleRoutes.tsx` - ניתוב פנימי מודולרי.
9. `components/` - קומפוננטות UI עם תמיכה מלאה ב-RTL ובנטו גריד.
10. `StandaloneView.tsx`, `index.ts` & `README.md` - תצוגה עצמאית ל-Workbench, barrel export ומסמך אפיון מלא.
11. `.gemini/rules.md` & `.gemini/skills.md` - חוקי הרכיב והסקילים לסוכנים.
12. `scripts/` - שכבת התחזוקה והתיקונים המקומית.

---

## [5] חובת בדיקת תקינות (Verification)
לפני סיום כל שינוי, יש לוודא שהפרויקט מתקמפל באופן נקי:
```powershell
npm run build
```
הבילד חייב להסתיים בהצלחה עם קוד 0 (`exit code 0`).
