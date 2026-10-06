# חוקי הפרויקט והבידוד לרכיב: {{MODULE_NAME}} (`{{MODULE_ID}}`)

קובץ זה נוצר אוטומטית בעת הקמת הרכיב ומגדיר את חוקי הברזל, גבולות הבידוד, והחוזים המחייבים עבור כל סוכן AI שעובד על רכיב זה.

---

## 🛑 חוקי בידוד מוחלטים (Isolation Rules)
1. **אפס ייבואים צולבים (Zero Cross-Module Imports):**
   - **חל איסור מוחלט** לייבא קבצים, קומפוננטות או טיפוסים מתוך מודולים שכנים (`from '../other-module/...'`).
   - כל שיתוף מידע, טיפוסים וחוזים מתבצע אך ורק דרך `src/core/contracts/index.ts`.
2. **איסור ייבוא סינגלטונים גלובליים:**
   - **חל איסור** לייבא את `db` ישירות מתוך `src/services/firebase`.
   - יש לקבל את מופע ה-Firestore וה-Auth דרך `useSystemConnection()` או דרך ה-Context הפנימי של המודול (`ModuleContext`).
3. **הגנת פולבק (Graceful Degradation):**
   - המודול חייב לדעת לעבוד בצורה מלאה במצב לא מקוון / Mock Data כאשר מסד הנתונים או המפתחות אינם מוגדרים.

---

## 🔌 חוזים ויכולות מערכת (Host Capabilities & Contracts)

### 1. יכולות שהמודול צורך (Consumed Capabilities)
אם הרכיב זקוק לפעולות ממודולים אחרים (למשל בחירת מדיה, שיגור וואטסאפ, או סליקה), עליו להשתמש ב-`useHostCapabilities`:
```tsx
const { getCapability } = useHostCapabilities();
// דוגמה לצריכת שירות מדיה:
const mediaPicker = getCapability<MediaPickerContract>('media-picker');
if (mediaPicker) {
  // שימוש ביכולת הגלובלית
} else {
  // חובה: פולבק מקומי (כגון <input type="file" />)
}
```

### 2. אירועי תקשורת אסינכרונית (EventBus)
כל תקשורת רקע עם מודולים אחרים (כגון יצירת ליד, סיום תשלום או עדכון סטטוס) מתבצעת ב-Pub/Sub דרך ה-EventBus ללא תלות ישירה:
- **אירועים שהמודול מפרסם:**
  ```typescript
  eventBus.publish('module:event_name', payload);
  ```
- **אירועים שהמודול מאזין להם:**
  הרשמה בתוך ה-`Context` או ה-`useEffect` וביטול הרשמה ב-Cleanup.

---

## 🧱 אנטומיית הרכיב (11 השכבות)
רכיב זה מחויב להכיל ולתחזק את כל 11 השכבות:
1. `types/index.ts` - הגדרות טיפוסים קפדניות (ללא `any`).
2. `config/index.ts` - קונפיגורציית מודול, קידומות אחסון (`mod_{{MODULE_ID}}_`), וקולקציות.
3. `context/ModuleContext.tsx` - ניהול State מרכזי והזרקת תלויות.
4. `hooks/` - הוקים מותאמים לשימוש פנימי.
5. `services/` - שירותי נתונים עם תמיכה ב-Mock Data מקומי.
6. `api/functionsApi.ts` - עטיפת קריאות שרת / Cloud Functions / Gemini.
7. `prompts/index.ts` - ספריית פרומפטים מודולרית (אם יש AI).
8. `routes/ModuleRoutes.tsx` - ניתוב פנימי מודולרי.
9. `components/` - קומפוננטות UI עם תמיכה מלאה ב-RTL (`dir="rtl"`).
10. `StandaloneView.tsx`, `index.ts` & `README.md` - תצוגה עצמאית ל-Workbench וייצוא ציבורי.
11. `.gemini/rules.md` & `.gemini/skills.md` - חוקי הרכיב והסקילים לסוכנים.

---

## ⚡ חובת בדיקת תקינות (Verification)
לפני סיום כל שינוי, יש לוודא שהפרויקט מתקמפל באופן נקי:
```powershell
npm run build
```
הבילד חייב להסתיים בהצלחה עם קוד 0 (`exit code 0`).
