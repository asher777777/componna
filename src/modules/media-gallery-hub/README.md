# 🗄️ Media Gallery Hub & AI Drive Vault (Universal Cloud Drive & AI Studio)

רכיב **`media-gallery-hub`** הינו כספת קבצים חכמה מודולרית (Universal Cloud Drive & AI Studio) המאפשרת ניהול, אחסון, עריכה, המרה ויצירה של כל סוגי הקבצים והמדיה בענן.

---

## 🏗️ ארכיטקטורת 10 השכבות (10-Layer Anatomy)
1. **`types/`**: הגדרות טיפוסים קפדניות עבור `MediaItem`, `MediaType` (תמונות, וידאו, מסמכים, PDF, טבלאות, שמע, ארכיונים, קוד), ופילטרים.
2. **`config/`**: קונפיגורציית קולקציות מבודדת ב-Firestore (`sdo_media_items`, `sdo_media_folders`).
3. **`context/`**: ניהול State גלובלי עם תמיכה בהפרדת משתמשים (`userId`), עבודה היברידית עם IndexedDB (תגובה מיידית ב-0ms), וסנכרון ענן מלא ל-Firebase Storage & Firestore.
4. **`hooks/`**: שכבת הוקים מודולרית לצריכה נוחה:
   - `useMediaGallery`: צריכת ה-Context המרכזי.
   - `useMediaUploader`: ניהול העלאות קבצים, דחיסה ובדיקת גדלים.
   - `useFileEditor`: חיתוך (Crop), סיבוב, היפוך, הוספת Watermark, והסרת רקע (Magic BG).
   - `useDocToLandingPage`: סריקת מסמכים ב-AI ויצירת דפי נחיתה אינטראקטיביים.
5. **`prompts/`**: ספרית פרומפטים מרוכזת ליצירת תמונות, תרגום עברית-אנגלית, חילוץ OCR, ומחולל עמודי נחיתה מקבצים.
6. **`api/`**: מעטפת קריאות צד-שרת (`FunctionsApi`) עבור Google Gemini 2.0/1.5 Flash ו-Gemini Vision.
7. **`routes/`**: ניתוב פנימי מודולרי (`MediaGalleryRoutes`).
8. **`components/`**: רכיבי ממשק משתמש ב-Tailwind CSS עם תמיכה מלאה ב-RTL ועברית:
   - `MediaGalleryGrid`: תצוגת רשת ורשימה, סרגל סינון קטגוריות מהיר, חיפוש ומיון.
   - `MediaDriveSidebar`: ניווט תיקיות וסיווג לפי סוגי קבצים.
   - `MediaFileInspector`: חלונית מידע טכני מפורט.
   - `DocumentViewerModal`: מציג PDF מובנה וכרטיסי מסמכים וטבלאות.
   - `QuickImageEditorModal`: עורך תמונות פנימי (סיבוב, חיתוך, מיתוג והסרת רקע).
   - `QuickTextEditorModal`: עורך פתקים ומסמכי טקסט מובנה בדרייב.
   - `DocToLandingPageModal`: מחולל עמודי נחיתה מבוסס AI.
   - `MobileMediaGalleryGrid`: חוויית מובייל מותאמת למסכי מגע.
   - `MobileMediaPreviewModal`: תצוגה מקדימה עם מחוות החלקה (Swipe) וזום (Pinch-to-zoom).
   - `MobileUploadFab`: כפתור צף לפעולות מהירות (מצלמה, סריקה, קובץ, סטודיו AI).
   - `MobileDriveBottomNav`: סרגל ניווט תחתון נגיש למובייל.
9. **`StandaloneView.tsx`**: סביבת ריצה עצמאית לבדיקה ב-Workbench.
10. **`index.ts`**: ייצוא ציבורי מסודר לכל המערכת.

---

## 🔌 חוזים ו-Capabilities (Host Contracts)
הרכיב צורך ומספק את החוזים הבאים דרך `src/core/contracts/index.ts`:

### Contracts מסופקים:
- **`MediaPickerContract`**:
  ```typescript
  const mediaService = getCapability<MediaPickerContract>('media-picker');
  const selectedUrl = await mediaService.openPicker({ accept: 'image/*', multiple: false });
  ```

### Contracts נצרכים (עם Graceful Degradation):
- **`BrandDnaContract`**: שליפת לוגו, צבעי מותג וטון כתיבה להזרקה לדפי הנחיתה שנוצרים ממסמכים ולהוספת Watermark לתמונות.

---

## 📡 אירועי EventBus
1. **`media:uploaded`**:
   משודר בעת השלמת העלאת קובץ ל-Firebase Storage.
2. **`landing_page:generated_from_doc`**:
   משודר בעת יצירת דף נחיתה ממסמך עבור מודול יוצר העמודים (`page-builder`):
   ```typescript
   eventBus.publish('landing_page:generated_from_doc', {
     sourceFileId: string,
     sourceFileName: string,
     pageTitle: string,
     sections: any[],
     brandStyles?: any,
     createdAt: string,
   });
   ```

---

## 🛡️ חוקי אבטחה ב-Firestore (Security Rules)
```javascript
match /sdo_media_items/{itemId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
}
match /sdo_media_folders/{folderId} {
  allow read, write: if request.auth != null;
}
```
