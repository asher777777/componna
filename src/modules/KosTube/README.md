# KosTube - חיבור ערוץ יוטיוב וקידום SEO מבוסס AI (KOSUN26)

רכיב עצמאי ומבודד במערכת KOSUN26 המחבר ערוץ יוטיוב באמצעות AI, שואב את נתוני הערוץ והסרטונים, ומייצר לכל סרטון עמוד תוכן מקודם במנועי חיפוש (SEO) הכולל מאמר עומק, סכמת JSON-LD עשירה (VideoObject, Article, FAQPage), נגן מוטמע, וטופס לידים מחובר ל-CRM.

---

## 11 שכבות האנטומיה של הרכיב

1. **types/** - הגדרת מודלים וטיפוסי נתונים (`KosTubeChannel`, `KosTubeVideo`, `KosTubeSeoPage`).
2. **config/** - הגדרות מערכת, מדדי SEO, וטקסטים שירותיים.
3. **context/** - ספק המצב `KosTubeContext` ו-`useKosTube`.
4. **hooks/** - הוקים לסינון, חיפוש וסטטיסטיקות `useKosTubeData`.
5. **services/** - שירותי שמירה ושליפה מבוססי `useTenantScope` ו-`kosTubeFirestore`.
6. **api/** - קריאות ל-Cloud AI ללא fetch ישיר מהדפדפן וסנכרון נתוני יוטיוב.
7. **routes/** - ניתוב פנימי וציבורי (`/KosTube`, `/tube/:slug`).
8. **components/** - טאבים, מודאלים במסך מלא `KosNevModal`, ותצוגת עמוד ציבורי `PublicVideoSeoPageView`.
9. **scripts/** - סקריפטי בדיקה וסנכרון מקומיים.
10. **StandaloneView.tsx** - התצוגה המרכזית העצמאית הכוללת את `KosunUniversalDock`.
11. **.gemini/** - חוקי המונופול וסקילס הרכיב.

---

## עמידה בחוקי KOSUN26
- **איסור יבוא הדדי (Zero Cross-Import):** כל תקשורת בין רכיבים נעשית באמצעות חוזים מרכזיים ו-Capability Slots בלבד (`<CapabilitySlot name="form-renderer" />`).
- **בידוד טננט רב-דיירי (Multi-Tenant Scoping):** כל הנתונים מנוהלים תחת `tenants/{tenantId}/mod_kos_tube_*`.
- **מונופול AI מאובטח:** אפס קריאות ישירות ל-Gemini מהלקוח ואפס שרשראות פולבאק; שימוש ב-`executeCloudAi`.
- **ניווט וממשק:** עיצוב RTL מלא, שימוש בלעדי ב-`KosunUniversalDock` וללא תפריטים צפים עצמאיים.
