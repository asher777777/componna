<div dir="rtl" style="text-align: right;">

# מודול מרכז מיתוג גלובלי (Brand DNA Hub)

רכיב מודולרי אוטונומי בן 10 שכבות המהווה את מקור האמת הבלעדי לכל נתוני המיתוג, הזהות העסקית, שפת המותג (Tone & Voice), ערכי הליבה, פרסונות הלקוח וטוקני העיצוב (Design Tokens) של הארגון.

הרכיב מספק סנכרון בזמן אמת לכלל מודולי המערכת (Page Builder, Video Producer Studio, WhatsApp Green API Hub, Flow Player Engine ועוד) באמצעות Capability Contract ואירועי EventBus אסינכרוניים ללא תלות ישירה.

---

## 1. אנטומיית 10 השכבות של המודול (10-Layer Anatomy)

1. `types/index.ts` - הגדרות טיפוסים קפדניות ב-TypeScript עבור זהות, שפה, קהלי יעד, טוקני עיצוב ואמינות.
2. `config/index.ts` - מזהה מודול (`MODULE_ID = 'brand-dna-hub'`), שמות קולקציות מבודדות (`brand_dna_settings`), והגדרות ברירת מחדל.
3. `context/BrandDnaContext.tsx` - Context Provider המבצע רישום אוטומטי של ה-Capability ומפרסם אירועי עדכון.
4. `services/brandDnaFirestore.ts` - שכבת CRUD עצמאית עם סנכרון ל-Firestore ו-LocalStorage כ-Fallback.
5. `api/functionsApi.ts` - שלד קריאות שרת ו-Cloud Functions לעיבודי AI מאובטחים.
6. `prompts/index.ts` - מחולל הפרומפטים והקונטקסט של שפת המותג עבור Gemini AI (`buildBrandSystemContext`).
7. `routes/BrandDnaRoutes.tsx` - ניתוב פנימי מלא עבור תתי-מסכים (זהות, קול, קהל, עיצוב, אמינות) לתמיכה כמעטפת וכעצמאי.
8. `components/` - ממשק משתמש מלא ומעוצב ב-Tailwind CSS עם תמיכה מלאה ב-RTL ותצוגה מקדימה חיה ב-360 מעלות.
9. `StandaloneView.tsx` - סביבת בדיקה והרצה מבודדת עבור ה-Workbench וחנויות SaaS.
10. `index.ts` & `README.md` - נקודת ייצוא ציבורית נקייה ותיעוד ארכיטקטוני מלא.

---

## 2. חוזה ה-Capability הגלובלי (`BrandDnaContract`)

מודולים אחרים אינם מייבאים קבצים פנימיים מתוך רכיב זה. הם צורכים את השירות באמצעות `useHostCapabilities`:

```typescript
import { useHostCapabilities } from '@/core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '@/core/contracts';

const { getCapability } = useHostCapabilities();
const brandContract = getCapability<BrandDnaContract>('brand-dna');

if (brandContract) {
  const brandDna = brandContract.getBrandDna();
  const systemPrompt = brandContract.getSystemPrompt('קופירייטר שיווקי');
  const tokens = brandContract.getDesignTokens();
}
```

### ממשק החוזה:
```typescript
export interface BrandDnaContract {
  getBrandDna: () => BrandDna;
  getSystemPrompt: (moduleRole?: string) => string;
  getDesignTokens: () => BrandDesignTokens;
}
```

---

## 3. אירועי EventBus

בכל שמירה או איפוס של נתוני המיתוג, הרכיב מפרסם אירוע גלובלי:

```typescript
eventBus.publish('brand:updated', {
  brandDna: updatedBrandDna,
  updatedAt: new Date().toISOString(),
});
```

מודולים מאזינים יכולים להירשם לאירוע ולהתעדכן אוטומטית:

```typescript
useEffect(() => {
  const unsubscribe = eventBus.subscribe('brand:updated', ({ brandDna }) => {
    // עדכון מקומי של צבעים, לוגו או הנחיות AI
  });
  return unsubscribe;
}, []);
```

---

## 4. חוקי אבטחה ב-Firestore (Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // הגדרות Brand DNA
    match /settings/brand_dna {
      allow read: if true; // קריאה חופשית עבור דפי נחיתה ונגן
      allow write: if request.auth != null; // כתיבה רק למשתמשים מורשים
    }

    // קולקציה מבודדת מודולרית
    match /brand_dna_settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /brand_dna_snapshots/{snapshotId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 5. שימוש עצמאי או בתוך מעטפת

```tsx
import { BrandDnaProvider, BrandDnaRoutes } from './modules/brand-dna-hub';

// בתוך React Router של הפרויקט המארח:
<Route path="/brand-dna/*" element={<BrandDnaRoutes />} />
```

</div>
