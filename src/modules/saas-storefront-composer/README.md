# SaaS Storefront & Subdomain Composer Module

מודול מרקטפלייס וחנות SaaS להרכבה עצמית של פלטפורמת לקוח על גבי סאב-דומיין ייעודי.

## מאפיינים מרכזיים:
1. **חנות ומרקטפלייס רכיבים:** צפייה בכל הרכיבים, סינון לפי קטגוריות, תמחור חודשי ושנתי (עם הנחה), מחשבון חי.
2. **שימוש ניסיוני (Live Trial Sandbox):** התנסות חיה בכל רכיב עם סרגל המרה צף (Floating Conversion Bar) לרכישה מהירה.
3. **קופה ותשלום:** טופס פרטי לקוח ועסק, סליקת אשראי / Bit מאובטחת.
4. **בחירת סאב-דומיין (מילה ראשונה בלבד):** שדה עם סיומת נעולה (`.glowmanage.com`), בדיקת זמינות בזמן אמת ואימות GoDaddy DNS.
5. **ייצור אוטומטי של המערכת:** שמירת פרטי הדייר ב-Firestore תחת `sys_tenants` עם קידומת מבודדת `tenant_{subdomain}_mod_`.
6. **לוח ניהול מנהל מערכת (Admin):** שליטה על הסתרה/גילוי רכיבים בחנות, עדכון מחירים, תגיות שיווקיות ודומיין בסיס.

## Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sys_storefront_catalog/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /sys_tenants/{subdomain} {
      allow read: if true;
      allow create: if true; // Provisioned upon payment
      allow update, delete: if request.auth != null;
    }
  }
}
```
