# סקיל רכיב: קושאן בורד (`kosun-board-composer`)

רכיב זה משמש כמחולל הראשי של מערכות מותאמות אישית ולוחות בקרה עבור כל סאב-דומיין באקוסיסטם של קושאן.

## תחומי אחריות עיקריים
1. **גילוי דינמי של רכיבי מערכת:** אינטרוספקציה של `REGISTERED_MODULES` והצגת כל רכיב חדש שנכנס למערכת ללא קידוד ידני.
2. **חוללות AI מבוססת Gemini:** פנייה ל-Google Gemini (`gemini-2.5-flash`, `gemini-3.8-flash`, `gemini-2.5-pro`) לייצור לוחות בקרה מותאמים אישית.
3. **סנכרון נתונים חי לטננט:** תצוגת מדדי אמת מקולקציות `tenants/{tenantId}/{collectionName}`.
4. **שידוך לסאב-דומיינים:** הגדרת לוח הבקרה שמוצג כברירת מחדל בכניסה של לקוח לסאב-דומיין שלו.

## צ'קליסט אימות לפני סגירת משימה
- [x] שכבה 1: `types/index.ts`
- [x] שכבה 2: `config/index.ts`
- [x] שכבה 3: `context/ModuleContext.tsx`
- [x] שכבה 4: `hooks/` (`useBoardComposerData.ts`, `useBoardComposerActions.ts`)
- [x] שכבה 5: `services/` (`geminiDashboardAiService.ts`, `dashboardFirestoreService.ts`)
- [x] שכבה 6: `api/functionsApi.ts`
- [x] שכבה 7: `prompts/index.ts`
- [x] שכבה 8: `routes/ModuleRoutes.tsx`
- [x] שכבה 9: `components/` (Bento Grid, Top Nav, RTL, Heebo, No Emojis)
- [x] שכבה 10: `StandaloneView.tsx`, `index.ts`, `README.md`
- [x] שכבה 11: `.gemini/rules.md`, `.gemini/skills.md`
- [x] שכבה 12: `scripts/`
