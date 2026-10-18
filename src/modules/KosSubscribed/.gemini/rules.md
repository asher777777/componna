<div dir="rtl" style="text-align: right;">

# חוקי ארכיטקטורה ומונופול - KosSubscribed

1. **מונופול ה-CRM הבלעדי:** כל נתוני אנשי הקשר, המנויים, החבילות, הקופונים וציוני המבחנים נשמרים ומנוהלים אך ורק תחת מונופול רכיב `crm-analytics` ובסקופ הטננט של הסאב-דומיין (`useTenantScope`).
2. **חיבור דרך חוזה בלבד:** קובץ ה-Service (`src/modules/KosSubscribed/services/kosSubscribedService.ts`) אינו פונה ישירות ל-Firestore אלא מפנה את כל הפעולות לחוזה `CrmSubscriptionsContract` (`crm-subscriptions`).
3. **הפרדה מרכיב מנהל הסאב-דומיינים:** רכיב זה פועל עבור כלל הסאב-דומיינים תחת הטננט שלהם, ללא שום ערבוב עם `KosTenantProvisioner` המיועד לטננט המאסטר בלבד.
4. **אפס ייבוא הדדי:** חל איסור מוחלט לייבא קבצים ממודולים שכנים. חיבורי UI מתבצעים דרך `<CapabilitySlot />` בלבד.

</div>
