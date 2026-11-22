# 🔒 חוק ברזל: אבטחת מפתחות Gemini API ומניעת דליפות (Zero Browser Key Exposure)

<div dir="rtl" style="text-align: right;">

מסמך זה הוא **חוק אבטחה מחייב** במערכת KOSUN26 (`comona` / `glowmanage`).
כל סוכן AI ומפתח מחויבים לציית לו **ללא יוצא מן הכלל**.

---

## 1. איסור מוחלט על חשיפת מפתח Gemini בדפדפן או בקוד הקליינט
1. **איסור מוחלט על קריאות ישירות מהדפדפן ל-Gemini API:**
   - אסור לבצע `fetch` או כל קריאה ישירה ל-`generativelanguage.googleapis.com` משום קובץ תחת `src/`.
   - אסור לצרף `?key=...` לשום URL בקוד הקליינט.
2. **שער בלעדי בצד השרת (`geminiAiProxy`):**
   - **כל** קריאת בינה מלאכותית (יצירת טקסט/JSON, יצירת תמונות Imagen/Gemini Image, Context Caching, ובדיקת תקינות חיבור) חייבת לעבור אך ורק דרך ה-Cloud Function Proxy המאובטח:
     - `/api/ai/generate`
     - `/api/ai/image`
     - `/api/ai/cache`
     - `/api/ai/test`
   - השרת (`functions/src/index.ts` ← `geminiAiProxy`) הוא הגורם היחיד שקורא את מפתח ה-Gemini (מתוך `process.env.GEMINI_API_KEY` או `tenants/_master/settings/api_keys` דרך Admin SDK) ושולח אותו לגוגל באמצעות ה-Header `x-goog-api-key` (לעולם לא ב-URL).
3. **איסור מוחלט על `VITE_GEMINI_API_KEY`:**
   - אסור להגדיר, לקרוא או להעביר `VITE_GEMINI_API_KEY` (או כל משתנה `VITE_*` אחר שמכיל מפתח AI/סוד) ב-`.env`, ב-`.env.example`, ב-`src/vite-env.d.ts`, ב-GitHub Actions (`.github/workflows/firebase-deploy.yml`) או בקוד ה-Frontend.
   - כל משתנה `VITE_*` מוטמע בטקסט גלוי בתוך קובצי ה-JavaScript הציבוריים של האתר וגורם לחסימה מיידית של המפתח על ידי גוגל.

---

## 2. נעילת הרשאות Firestore (`firestore.rules`)
1. **איסור קריאת מפתח Master מהדפדפן של טננטים או אורחים:**
   - המסמך `/tenants/_master/settings/api_keys` פתוח אך ורק ל-`isMasterAdmin()` ול-Cloud Functions (Admin SDK).
   - אסור להעניק הרשאת `read` ל-`tenant_admin`, למשתמשים רגילים או לציבור על `/tenants/_master/settings/api_keys` או `/settings/api_keys`.
2. **איסור נפילה ל-`allow read: if true` גורף:**
   - ברירת המחדל בסוף `firestore.rules` חייבת להישאר `match /{document=**} { allow read, write: if false; }`.

---

## 3. הפרדת מפתח Firebase Web ממפתח Gemini
1. מפתח ה-Firebase Web (`VITE_FIREBASE_API_KEY`) מיועד אך ורק לזיהוי אפליקציית ה-Firebase ומוגבל ב-Google Cloud Console ל-APIs של Firebase בלבד (ללא `Generative Language API`).
2. אסור להשתמש במפתח Firebase כמפתח Gemini, ואסור לשמור מפתח Gemini בשום קובץ שנכנס ל-Git או לתיקיית `dist/`.

---

## 4. בדיקת שפיות חובה לפני כל Deploy / Commit
לפני כל פריסה או דחיפה ל-Git יש לוודא:
- `git grep "generativelanguage.googleapis.com" src/` מחזיר **0 תוצאות**.
- `git grep "VITE_GEMINI_API_KEY" src/ .github/ .env.example` מחזיר **0 תוצאות**.
- אין שום מפתח `AIzaSy...` חדש בקבצים הנדחפים ל-Git.

</div>
