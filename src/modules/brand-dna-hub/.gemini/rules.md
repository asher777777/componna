# חוקי הרכיב: מרכז מיתוג גלובלי (`brand-dna-hub`)

רכיב זה מהווה את **המוח, הזהות וקול המותג (Brand Voice)** של הפרויקט כולו.
כל סוכן AI העובד על מודול זה מחויב לציית לכללי הבידוד, ה-Tenant Scope וחוזי התקשורת להלן:

---

## 🛑 1. חוקי בידוד ואפס Cross-Module Imports
1. **איסור מוחלט על ייבוא מודולים שכנים:**
   - אסור לייבא קבצים מ-`src/modules/page-builder`, `src/modules/crm-analytics`, `src/modules/whatsapp-green-api-hub` וכיו"ב.
   - כל הטיפוסים המשותפים (`BrandDna`, `BrandIdentity`, `BrandVoice` וכו') מיוצאים דרך `src/core/contracts/index.ts`.
2. **איסור סינגלטון פיירבייס:**
   - אין לייבא `db` מ-`src/services/firebase`. מופע ה-`db` מגיע מוזרק דרך `useSystemConnection()`.
3. **פולבק מקומי מבודד (Local Storage Fallback):**
   - במידה ו-Firestore אינו מחובר או נכשל, הרכיב נשמר ב-LocalStorage עם קידומת מבודדת לפי סאב-דומיין: `comona_{tenantId}_brand_dna_settings`.

---

## 🏛️ 2. חוק Multi-Tenant Scoped Subcollections (פרודקשן)
- **מסלול המסמך ב-Firestore:**
  כל הגדרות המיתוג של הלקוח חייבות להישמר אך ורק בתת-הקולקציה המבודדת של הטננט:
  ```
  tenants/{tenantId}/settings/brand_dna
  ```
- **איסור כתיבה לקולקציה גלובלית:**
  אסור לכתוב ישירות ל-`doc(db, 'settings', 'brand_dna')`. יש להעביר תמיד את ה-`tenantId` מתוך `useTenantScope()`.
- **הנתיב הראשי (Apex Domain):**
  במידה ואין סאב-דומיין בכתובת האתר, `tenantId` הוא אוטומטית `_master`.

---

## 🔌 3. חוזי תקשורת ויכולות מערכת (Host Capabilities & EventBus)

### היכולות שהמודול מספק (Provided Capability):
הרכיב רושם את עצמו ב-`HostCapabilitiesContext` תחת המפתח `'brand-dna'`:
```typescript
registerCapability('brand-dna', {
  getBrandDna: () => brandDna,
  getSystemPrompt: (moduleRole?: string) => buildBrandSystemContext(brandDna, moduleRole),
  getDesignTokens: () => brandDna.designTokens,
});
```
*כל שאר המודולים צורכים את המיתוג אך ורק דרך חוזה זה!*

### אירועי EventBus:
בעת שינוי ושמירה של ה-DNA, המודול מפרסם אירוע אסינכרוני:
```typescript
eventBus.publish('brand:updated', {
  brandDna,
  updatedAt: new Date().toISOString(),
});
```
*מודולים אחרים (כגון בונה העמודים, וואטסאפ ובונה הטפסים) מאזינים לאירוע זה ומעדכנים את העיצובים שלהם מיידית.*

---

## 🧪 4. אימות ובדיקת תקינות (Verification)
כל עריכה ברכיב חייבת לעבור קומפילציה נקייה:
```powershell
npm run build
```
קוד סיום 0 (`exit code 0`) ללא שגיאות TypeScript.
