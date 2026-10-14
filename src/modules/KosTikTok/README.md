# KosTikTok - קושאן טיקטוק

מודול עצמאי מבודד במערכת KOSUN26 לאינטגרציה מלאה עם פלטפורמת TikTok.

## יכולות מרכזיות
1. **אימות חשבונות (OAuth 2.0 PKCE):** חיבור וניהול ריבוי חשבונות יוצרים ועסקים פר טננט.
2. **פרסום תוכן (Content Posting API):** פרסום ישיר של סרטונים ואלבומי תמונות (Direct Post / Draft Upload).
3. **קליטת לידים (Lead Generation Webhooks):** סנכרון לידים מטופסי טיקטוק היישר ל-CRM המבודד של הטננט.
4. **מעקב המרות (TikTok Events API v1.3):** שליחת אירועי רכישה והרשמה בצד שרת עם הצפנת SHA-256.

## ארכיטקטורה ותקן KOSUN26
- **11 שכבות אנטומיות מלאות.**
- **בידוד טננט מוחלט:** שימוש ב-`useTenantScope` ו-`SYSTEM_COLLECTIONS.KOS_TIKTOK_*`.
- **Zero Cross-Imports:** חשיפה לשימוש שאר המודולים באמצעות חוזה `KosTikTokContract` ב-`HostCapabilitiesContext`.
- **עיצוב שפת Cashwan:** ללא Header עליון מסורתי, שימוש ב-`KosunUniversalDock`, מודאלים במסך מלא, ו-RTL מלא.
