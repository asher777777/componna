# CRM Groups & Communities Hub (קומפוננטת קהילות וקבוצות CRM)

מודול מלא, מבודד ועצמאי (Self-Contained Full-Stack Module) לניהול קהילות, קבוצות תגיות, סגמנטציה חכמה (Smart Dynamic Groups), עמודי נחיתה לשגרירי קהילות, ואינטגרציית WhatsApp (Green API).

## 🚀 שכבות ומבנה הקומפוננטה (10-Layer Architecture)

1. **`types/`**: טיפוסי נתונים, הגדרות חוקים (`GroupRule`), ממשקי קבוצות ואינטראקציות.
2. **`config/`**: קולקציות ברירת מחדל, עמודות טבלה, פלטת צבעים והגדרות אופרטורים.
3. **`context/`**: React Context Provider להזרקת תלויות (`firebaseApp`, `ownerId`, `greenApiCredentials`).
4. **`services/`**:
   - `firestoreService.ts`: קריאה, שמירה, מחיקה ועדכון Batch של קבוצות ותגיות אנשי קשר.
   - `whatsappService.ts`: חילוץ קבוצות, נרמול טלפונים בפורמט E.164, מניעת כפילויות ושליחת הודעות ישירה.
   - `groupsUtils.ts`: מנוע חישוב חוקים דינמיים וייצוא נתונים ל-CSV.
5. **`api/`**: קריאות שרת ופונקציות ענן.
6. **`prompts/`**: פרומפטים מובנים ל-Gemini AI לייצור חוקים חכמים, חזון קהילה וניסוח הודעות תפוצה.
7. **`routes/`**: ניתובים פנימיים (`/`, `*`).
8. **`components/`**: רכיבי UI מודולריים ומפוצלים (סרגל צד, טבלה רספונסיבית, מודאלים לעריכה, העברה, הוספת חברים, וייבוא וואטסאפ).
9. **`StandaloneView.tsx`**: רץ עצמאי לפיתוח ובדיקה בסביבת ה-Workbench.
10. **`index.ts`**: ייצוא ציבורי מלא ונקי.

## 🔒 אבטחה וכללי Firestore (Zero Collision)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /crm_groups/{groupId} {
      allow read, write: if request.auth != null;
    }
    match /contacts/{contactId} {
      allow read, write: if request.auth != null;
    }
    match /pages/{pageSlug} {
      allow read: if true; // Public community pages
      allow write: if request.auth != null;
    }
    match /interactions/{interactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
