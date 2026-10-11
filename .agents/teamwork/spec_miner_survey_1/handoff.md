# Handoff Report: Specification Survey for KOSUN AM (`kosun-am`)

<div dir="rtl" style="text-align: right;">

## 1. Observation
1. **הנחיות ותבנית הרכיב:**
   - קובץ `.gemini/templates/component_spec_template.md` מגדיר 8 פרקים מחייבים לאפיון מודול: פרטים כלליים, מבנה נתוני Firestore, ממשק משתמש ומסכים, ניתובים פנימיים, שכבת API ופונקציות ענן, פרומפטים והגדרות AI, חוקי אבטחה של פיירבייס, ומשתני סביבה.
2. **חמשת שערי הביקורת:**
   - קובץ `.gemini/rules/system_audit_workflow.md` שורות 27–95 מגדיר במפורש את חמשת שערי הביקורת:
     - שער 1: ארכיטקטורה וגבולות מודולריים (12 שכבות, Zero Cross-Imports, Capability-Based DI, EventBus).
     - שער 2: בידוד נתונים ו-Multi-Tenancy (`useTenantScope().getScopedCollectionRef`, סנכרון משולש של ה-DB Hub, איסור שמירת מפתחות ב-`localStorage`, שימוש ב-`tenantApiKeys.ts`).
     - שער 3: בינה מלאכותית ו-Gemini Standards (מודלים רשמיים בלבד: `gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.8-flash-lite`, שרשרת Fallback, וחישוב עלות דרך `calculateGeminiCost`).
     - שער 4: מיתוג קושאן וחוויית משתמש 2026 (Mobile First, Bento Grid, Top Nav בלבד, גופן Heebo, טולטיפים מזעריים `(i)`, נתונים סטטיסטיים באקורדיון מתקפל, אפס אימוג'ים טקסטואליים ושימוש בלעדי באייקוני Lucide, עטיפת RTL מלאה).
     - שער 5: יציבות ריצה, ביצועים ובדיקת Build (`ModuleErrorBoundary`, `Suspense`, `React.lazy()` ב-`moduleRegistry.ts`, ו-`npm run build` עם 0 שגיאות).
3. **אנטומיית 12 השכבות:**
   - קובץ `src/modules/_template/.gemini/rules.md` שורות 45–59 מגדיר את אנטומיית 12 השכבות: `types/`, `config/`, `context/`, `hooks/`, `services/`, `api/`, `prompts/`, `routes/`, `components/`, `StandaloneView.tsx + index.ts + README.md`, `.gemini/` (`rules.md` + `skills.md`), ו-`scripts/`.
4. **דרישות שמות ומיתוג רשמי:**
   - הוראת סנטינל ובעל הפרויקט (הודעת דיספאץ' מ-`2026-10-11T11:38:22Z`):
     - עברית: "קושאן מייל אוטומטי"
     - אנגלית: "KOSUN AM"
     - מזהה ותיקייה: `kosun-am` (`src/modules/kosun-am/`)
     - קידומת קולקציות: `mod_kosun_am_...` (`mod_kosun_am_campaigns`, `mod_kosun_am_templates`, `mod_kosun_am_automations`, `mod_kosun_am_logs`).
5. **בדיקת מצב הבילד הקיים:**
   - הרצת `npm run build` (משימה `task-155`) הסתיימה בהצלחה מלאה: `exit code 0`, זמן ריצה 18.18 שניות, אפס שגיאות קומפילציה.

---

## 2. Logic Chain
1. **שלב 1 (בידוד ארכיטקטוני):** מאחר ששער 1 אוסר על כל Cross-Imports, מודול `kosun-am` חייב לתקשר אך ורק באמצעות החוזים המשותפים ב-`src/core/contracts/` וה-EventBus.
2. **שלב 2 (בידוד נתונים ודיירים):** מאחר ששער 2 דורש Multi-Tenancy מוחלט דרך `useTenantScope()`, אסור לכתוב לקולקציות גלובליות. לכן כל 4 הקולקציות (`mod_kosun_am_*`) יישמרו תחת `tenants/{tenantId}/` ויסונכרנו משולשת: ב-`SYSTEM_COLLECTIONS`, ב-`PREDEFINED_COLLECTIONS`, וב-`PROJECT_SEED_DATA`.
3. **שלב 3 (עמידה במודלי AI):** כיוון ששער 3 מחייב מודלים פעילים רשמיים, סייען ה-AI של המודול (Kosai Email Copilot) ישתמש ב-`gemini-3.8-flash` כמודל דגל, עם שרשרת Fallback ל-`gemini-3.5-flash` ו-`gemini-3.8-flash-lite`, וחישוב עלויות דרך `calculateGeminiCost`.
4. **שלב 4 (מיתוג ושפת ממשק):** בהתאם לסקיל `cashwan-branding` והעדכונים האחרונים, הממשק חייב להיות Bento Grid נקי, ללא Sidebar (Top Nav בלבד), גופן Heebo בלעדי, טולטיפים `(i)` עדינים מ-`SmartTooltip.tsx`, הסתרת סטטיסטיקות באקורדיון מתקפל, אפס אימוג'ים, והתייחסות אל "קושאן" כשותף חי.
5. **שלב 5 (טעינה עצלה ויציבות):** בהתאם לשער 5, הרישום ב-`src/workbench/moduleRegistry.ts` חייב להתבצע באמצעות `React.lazy()`, והרכיב ייעטף ב-`ModuleErrorBoundary` וב-`Suspense`.

---

## 3. Caveats
- **אין Caveats טכניים מהותיים:** כל התשתיות (EventBus, HostCapabilities, TenantScope, TenantApiKeys, SmartTooltip, ModuleErrorBoundary) קיימות ופעילות במערכת.
- **הנחה מודעת לגבי שילוב ספקי דיוור (Email Providers):** בפיתוח מקומי ובהיעדר מפתחות Resend/SendGrid פעילים, השירות יפעל ב-Mock/Local Dispatch mode מלא, המדמה שיגור מוצלח ומתעד לוגים, בהתאם לכלל 4 של שירותי הבאקנד.

---

## 4. Conclusion
1. הסקר הושלם בהצלחה מלאה ומספק תמונת מצב אדריכלית מקיפה, הכוללת את כל טבלאות הפיצ'רים ומקרי הקצה הנדרשים.
2. המודול `kosun-am` ("קושאן מייל אוטומטי" / "KOSUN AM") מוכן למעבר ישיר לשלבי האפיון, הבאקנד והפרונטנד על פי 12 השכבות ו-5 שערי הביקורת.
3. הדוח המלא נשמר ב-`c:\comona\.agents\teamwork\spec_miner_survey_1\survey_spec_report.md`.

---

## 5. Verification Method
1. **אימות דוח הסקר והממצאים:**
   - בדיקת הקובץ `c:\comona\.agents\teamwork\spec_miner_survey_1\survey_spec_report.md` - וידוא קיום טבלאות Features Discovered ו-Edge Cases, אנטומיית 12 השכבות, ו-5 שערי הביקורת.
2. **אימות שלמות הבילד המערכתי:**
   - הרצת פקודת הקומפילציה הראשית:
     ```powershell
     npm run build
     ```
   - אימות יציאה בקוד 0 (`exit code 0`) ללא שגיאות קומפילציה.
3. **אימות אי-שינוי קוד מקור בזמן הסקר (Read-Only Compliance):**
   - בדיקת `git status` לוודא שלא שונו קבצי קוד מקור תחת `src/` על ידי סוכן הסקר.

</div>
