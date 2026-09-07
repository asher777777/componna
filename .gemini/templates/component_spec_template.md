<div dir="rtl" style="text-align: right;">

# תבנית אפיון קומפוננטה (Component Specification)

## 1. פרטים כלליים (General Information)
- **שם הקומפוננטה (באנגלית, באותיות קטנות עם מקפים):** example-module
- **שם תצוגה בעברית:** מודול לדוגמה
- **תיאור ומטרת הקומפוננטה:** [הסבר קצר על מה הקומפוננטה עושה ומתי משתמשים בה]
- **קידומת אוספים ברירת מחדל (Default Collection Prefix):** mod_example_

---

## 2. מבנה נתוני Firestore (Collections & Data Schema)
פרט את האוספים, השדות וסוגי הנתונים:
- **אוסף ראשי 1:** items (יישמר בפועל כ-mod_example_items או תחת מיפוי מותאם)
  - id (string) - מזהה ייחודי
  - title (string) - כותרת
  - createdAt (timestamp) - תאריך יצירה
  - userId (string) - מזהה משתמש יוצר
  - status ('active' | 'archived') - סטטוס
- **תת-אוספים (Sub-collections - אם יש):**
  - items/{itemId}/logs

---

## 3. ממשק משתמש ומסכים (UI Views & Tailwind Layout)
- **מסך 1 (רשימה ראשית / Default View):**
  - תצוגת טבלה/כרטיסים של כל הפריטים.
  - כפתור ליצירת פריט חדש וסינון לפי סטטוס.
- **מסך 2 (יצירה / עריכה - Form View):**
  - טופס הזנת נתונים עם ולידציה.
- **מסך 3 (פרטים / Detail View):**
  - תצוגה מורחבת של פריט בודד.

---

## 4. ניתובים פנימיים (Internal Sub-routes)
- "" (נתיב ריק) -> תצוגת הרשימה הראשית.
- "new" -> תצוגת יצירת פריט חדש.
- ":id" -> תצוגת פרטי פריט.
- ":id/edit" -> תצוגת עריכת פריט.

---

## 5. שכבת API ופונקציות ענן (Firebase Cloud Functions / Backend)
- **שם הפונקציה / Endpoint:** processExampleAI
  - **Payload (קלט):** { itemId: string, prompt: string }
  - **Response (פלט):** { success: boolean, result: string }
  - **אופן אבטחה:** אימות משתמש מחובר (Auth Context).

---

## 6. פרומפטים והגדרות AI (Prompts & LLM Settings)
- **מטרת ה-AI בקומפוננטה:** [לדוגמה: סיכום טקסט / יצירת תובנות / ניתוח מידע]
- **System Prompt:**
  ```text
  You are an expert AI assistant helping users process their data.
  Analyze the provided input and return a structured JSON response.
  ```
- **משתני פרומפט דינמיים:** {itemTitle}, {itemContent}.

---

## 7. חוקי אבטחה של פיירבייס (Firestore Security Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mod_example_items/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 8. משתני סביבה נדרשים ב-.env
- VITE_FIREBASE_API_KEY=
- VITE_FIREBASE_AUTH_DOMAIN=
- VITE_FIREBASE_PROJECT_ID=
- VITE_FIREBASE_STORAGE_BUCKET=
- VITE_FIREBASE_MESSAGING_SENDER_ID=
- VITE_FIREBASE_APP_ID=
- VITE_FUNCTIONS_BASE_URL=

</div>