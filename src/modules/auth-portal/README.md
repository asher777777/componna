# מודול פורטל אימות והתחברות (Auth Portal Module)

מודול עצמאי ומבודד לניהול התחברות משתמשים, רישום, אימות מהיר מול Google / Anonymous, ושמירת פרופילי משתמשים ב-Firestore.

## יכולות עיקריות
- **כניסה והרשמה במגוון שיטות**: Email & Password, Google Sign-In, Anonymous Auth.
- **שחזור ואיפוס סיסמה**: שליחת אימייל איפוס ישיר.
- **סנכרון פרופילים ב-Firestore**: עדכון אוטומטי של קולקציית `users` ומעקב אחר כניסות ב-`mod_auth_audit_logs`.
- **תצוגת Portal עצמאית + Modal צף עם React Portal**: תצוגה נקייה שלא נחסמת על ידי אלמנטים אחרים (`z-[99999]`).

## שימוש ב-Host Project

```tsx
import { AuthPortalProvider, AuthModal, LoginView } from './modules/auth-portal';

function App() {
  return (
    <AuthPortalProvider config={{ firebaseApp }}>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </AuthPortalProvider>
  );
}
```
