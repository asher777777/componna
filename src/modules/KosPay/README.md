# 🛡️ kesher-payments-hub (קשר & EasyCount Hub v2.0)

מודול עצמאי לחלוטין (Self-Contained Module) לניהול עסקאות, סליקת כרטיסי אשראי, ביט, הוראות קבע (הו"ק), והפקת מסמכים חשבונאיים אוטומטיים וידניים (קבלה על תרומה סעיף 46, קבלה, חשבונית מס קבלה) באמצעות שילוב מערכת **קשר** (Kesher HK) ו-**EasyCount** (איזי קאונט).

---

## 📐 ארכיטקטורת 10 השכבות (10-Layer Anatomy)

1. **`types/`**: הגדרות טיפוסים קפדניות לסליקה, תקבולים, מסמכים והגדרות מסוף (`KesherSettings`, `CreditCardTransactionRequest`, `KesherDocumentType`, `KesherTransactionItem`).
2. **`config/`**: קונפיגורציית המודול (`KESHER_PAYMENTS_MODULE_CONFIG`), מזהה מודול, גרסה, ו-Collection Prefixes מבודדים (`kesher_transactions`, `kesher_receipt_glossary`).
3. **`context/`**: `KesherPaymentsContext` & `KesherPaymentsProvider` המספקים ניהול State אחוד, הזרקת תלות דינמית (DI) של Firestore ללא סינגלטונים, ומדדים פיננסיים חיים.
4. **`hooks/`**:
   - `useKesherPayments`: הוק נוח לגישה ל-Context הראשי.
   - `usePaymentTerminal`: הוק ניהול טופס מסוף סליקה, חישובי מע"מ ותשלומים.
   - `useReceiptGlossary`: הוק לחיפוש, סינון וניהול מילון פריטי קבלה.
5. **`services/`**:
   - `kesherService`: שירות תקשורת ישיר מול שרתי קשר ואיזי קאונט עם Fallback מקומי ב-LocalStorage.
   - `crmContactSyncService`: שירות התאמה וסנכרון אנשי קשר מבוסס חוזה ליבה `CrmContactSummary`.
   - `receiptGlossaryService`: שירות שמירה וטעינה של פריטי מילון קבלות.
6. **`api/`**: `kesherFunctionsApi` לעטיפת קריאות שרת (Cloud Functions) למניעת חשיפת מפתחות ופרטי אשראי רגישים.
7. **`routes/`**: `KesherPaymentsRoutes` לניהול ניתוב פנימי בין טרמינל, קבלות ידניות, יומן עסקאות ועזרים.
8. **`components/`**:
   - `KesherPaymentsMainView`: ממשק ראשי מלא ב-Tailwind RTL.
   - `KesherTerminalTab`: מסוף סליקה מהיר (J4/J5/תשלומים/הו"ק/ביט).
   - `KesherManualReceiptsTab`: הפקת קבלות וחשבוניות ידניות (מזומן, צ'קים, העברות בנקאיות).
   - `KesherTransactionsLogTab`: יומן עסקאות, חיפוש, סינון, וייצוא לאקסל (XLSX).
   - `MobileTerminalPad`: מקלדת קופה ניידת מהירה (Numpad) למסכי מגע.
   - `WhatsAppReceiptShareButton`: שיגור קבלה מהיר לוואטסאפ של הלקוח מיד לאחר אישור עסקה.
   - `QuickMetricsBar`: באנר מדדים פיננסיים מהיר (הכנסות היום, עסקאות שאושרו, ממוצע לעסקה, עסקאות שנכשלו).
9. **`StandaloneView.tsx`**: תצוגה עצמאית להרצה בסביבת הפיתוח וה-Workbench.
10. **`index.ts`**: ייצוא ציבורי מסודר של כל השכבות.

---

## 📑 סוגי מסמכים נתמכים (EasyCount Document Types)

| קוד מסמך | תיאור | שימוש עיקרי |
|---|---|---|
| **405** | קבלה על תרומה (מוכרת לפי סעיף 46) | עמותות, מוסדות ציבור וגיוס כספים |
| **400** | קבלה | תקבול כללי (מזומן, צ'ק, העברה, אשראי) |
| **320** | חשבונית מס קבלה | עוסק מורשה / חברה בע"מ בעת תשלום מיידי |
| **305** | חשבונית מס | חיוב לקוח (טרם תקבול או בהתאם לצורך) |
| **330** | חשבונית זיכוי | זיכוי כספי או ביטול עסקה |
| **310** | חשבונית עסקה | דרישת תשלום |

---

## ⚡ חוזי מערכת ואירועי EventBus

המודול **אינו תלוי** באף מודול אח (אפס Cross-Module Imports).
במקום זאת, הוא מפרסם אירוע אסינכרוני לליבה:

```typescript
import { eventBus } from 'src/core/bridge/EventBus';

// בעת השלמת תשלום בהצלחה:
eventBus.publish('payment:completed', {
  transactionId: 'tx_12345',
  amount: 250,
  clientName: 'ישראל ישראלי',
  phone: '0501234567',
  email: 'israel@example.com',
  tz: '012345678',
  paymentMethod: 'CreditCard',
  documentType: 405,
  receiptUrl: 'https://...',
  timestamp: '2026-10-05T19:00:00.000Z'
});
```

מודולים מאזינים (כגון `crm-analytics` או `whatsapp-hub`) יכולים להירשם לאירוע זה ולהגיב אליו באופן עצמאי.

---

## 📱 שיפורי Mobile-First

- **MobileTerminalPad**: Numpad מגע ייעודי עם כפתורי סכום מהירים (+50, +100, +200, +500) להקלדה מהירה בקופה פיזית או סמארטפון.
- **WhatsApp Instant Share**: יצירת קישור `wa.me` מעוצב בלחיצת כפתור לשליחת מסמך ה-PDF ישירות לוואטסאפ של הלקוח.
- **Quick Metrics Bar**: תצוגה עליונה מיידית של הפעילות היומית.
