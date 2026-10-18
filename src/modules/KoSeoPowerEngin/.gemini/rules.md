# חוקי הפרויקט והבידוד לרכיב: KoSeoPowerEngin (`KoSeoPowerEngin`)

קובץ זה מגדיר את חוקי הברזל, גבולות הבידוד, והחוזים המחייבים עבור רכיב זה.

---

## 🛑 חוקי בידוד מוחלטים (Isolation Rules)
1. **אפס ייבואים צולבים (Zero Cross-Module Imports):**
   - חל איסור מוחלט לייבא קבצים, קומפוננטות או טיפוסים מתוך מודולים שכנים.
   - כל שיתוף מידע, טיפוסים וחוזים מתבצע אך ורק דרך `src/core/contracts/index.ts`.
2. **איסור ייבוא סינגלטונים גלובליים:**
   - חל איסור לייבא את `db` ישירות מתוך `src/services/firebase`.
   - יש לקבל את מופע ה-Firestore דרך `useSystemConnection()` או דרך ה-Context הפנימי של המודול.
3. **הגנת פולבק (Graceful Degradation):**
   - המודול עובד בצורה מלאה גם במצב לא מקוון / Mock Data כאשר מסד הנתונים או המפתחות אינם מוגדרים.

---

## 🔌 חוזים ויכולות מערכת (Host Capabilities & Contracts)
- **ספק יכולת ממשק (UI Capability Provider):**
  - הרכיב רושם את עצמו כ-`seo-power-engine`, `koseo-power-hub`, ו-`google-analytics-console`.
- **סקופ טננט:** שימוש בלעדי ב-`useTenantScope` לבידוד מוחלט.

---

## 🧱 אנטומיית הרכיב
רכיב זה מכיל את כל השכבות:
1. `types/index.ts` - הגדרות טיפוסים קפדניות.
2. `config/index.ts` - קונפיגורציית מודול ונתוני ברירת מחדל.
3. `context/KoSeoPowerContext.tsx` - ניהול State מרכזי.
4. `hooks/useKoSeoPower.ts` - הוק לשימוש פנימי.
5. `services/seoPowerStorageService.ts` - שירותי אחסון, אימות ובדיקות דפדפן.
6. `api/index.ts` - שכבת API.
7. `routes/KoSeoPowerRoutes.tsx` - ניתוב פנימי מודולרי.
8. `components/` - קומפוננטות ממשק עם תמיכה מלאה ב-RTL.
9. `views/` - תצוגות ראשיות.
10. `StandaloneView.tsx`, `index.ts` & `README.md` - תצוגה עצמאית ל-Workbench וייצוא ציבורי.
11. `.gemini/rules.md` & `.gemini/skills.md` - חוקי הרכיב והסקילים.
12. `scripts/` - סקריפטים לתחזוקה ואוטומציה.
