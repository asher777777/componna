# Vite Module Script & Chunk MIME-Type Safety Rules

<div dir="rtl" style="text-align: right;">

כל סוכן ומפתח במערכת חייבים לשמור על הכללים הבאים כדי למנוע שגיאת `Failed to load module script ... MIME type of "text/html"`:

1. **בסיס נתיבים מוחלט ב-Vite (`vite.config.ts`):**
   * חובה לשמור על `base: '/'` בהגדרות `defineConfig` ב-[vite.config.ts](file:///c:/comona/vite.config.ts). אין לשנות ל-`./` או להסיר, כדי שנתיבים מקוננים לא יבקשו `/subpath/assets/*.js`.
2. **הגנת 404 לנכסים ב-`ogMetaProxy` (`functions/src/index.ts`):**
   * אסור להסיר את חסימת ה-404 בראש `ogMetaProxy` עבור `/assets/`, `/src/` וסיומות קבצים סטטיות (`.js`, `.css`, `.wasm` וכו'). החזרת `200 text/html` עבור קובץ JS חסר גורמת ישירות לשגיאת Strict MIME checking.
3. **רענון אוטומטי עוקף-מטמון (`index.html` ו-`src/main.tsx`):**
   * אין להסיר את מאזיני `error`, `unhandledrejection` ו-`vite:preloadError` המבצעים רענון חד-פעמי עם פרמטר `_v=timestamp` במקרה של chunk ישן שנשאר במטמון הדפדפן לאחר פריסה חדשה.

</div>
