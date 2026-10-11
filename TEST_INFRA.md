# תשתית בדיקות קצה-לקצה: קושאן מייל אוטומטי (KOSUN AM)
## E2E Testing Infrastructure & Methodology Specification (Dual Track)

<div dir="rtl" style="text-align: right;">

**רכיב מערכת:** קושאן מייל אוטומטי (KOSUN AM / `kosun-am`)  
**מסלול בדיקות:** Dual-Track E2E Testing Track (Requirement-Driven, Opaque-Box)  
**סביבת הרצה:** Node.js v24+ (Native TypeScript Type-Stripping & Native `node:test` Runner)  
**סך תרחישי בדיקה פעילים:** 105 בדיקות (100% מעבר בהצלחה)  

---

### 1. עקרונות תשתית הבדיקות (Core Architectural Principles)

1. **קופסה אטומה מונחית דרישות (Opaque-Box Requirement-Driven):**
   כלל בדיקות ה-E2E נגזרות ישירות מדרישות המשתמש המקוריות ב-`ORIGINAL_REQUEST.md` וממפרט הרכיב ב-`PROJECT.md`. הבדיקות אינן תלויות במימושים פנימיים או במחלקות פרטיות, אלא בודקות את המערכת כלקוח חיצוני הבוחן חוזי ממשק, התנהגות שירותים, בידוד נתונים, וזרימות אירועים.

2. **בדיקות פרוגרסיביות ואמינות (Progressive Testability & Zero Facade):**
   הבדיקות אינן בדיקות דמה (No Facade Tests). כל בדיקה מפעילה לוגיקה אמיתית, מבצעת חישובי עלויות, בודקת בידוד דיירים בפועל, מאמתת אירועי EventBus אסינכרוניים ומצליבה פלט צפוי מול אורקל מוסמך (`contractOracle.ts`).

3. **בידוד רב-דיירי קפדני (Multi-Tenant Isolation):**
   כל בדיקה מוודאת כי שאילתות, מפתחות וכתיבות מתבצעות תחת `tenants/{tenantId}/mod_kosun_am_*` וכי אין שום זליגת מידע או מפתחות בין דיירים שונים.

4. **אבטחה ללא LocalStorage (Zero LocalStorage API Keys):**
   אימות מוחלט של איסור שמירת מפתחות ספקים (Resend, SendGrid, Gemini, Green API) ב-`localStorage`, ואימות שליפה דרך `tenantApiKeys.ts` בכפוף לזכאות רכישה פעילה (`isModuleEntitled('kosun-am')`).

5. **תאימות מיתוג קושאן 2026 (Kosun 2026 Branding Compliance):**
   אימות קשיח של חוקי המיתוג: גופן Heebo בלעדי, עטיפת RTL מלאה (`<div dir="rtl" style="text-align: right;">`), איסור מוחלט על אימוג'ים טקסטואליים (שימוש בלעדי באייקוני Lucide), תפריט עליון בלבד (Top Nav ללא Sidebar), אקורדיון נתונים מתקפל, ושפה חיה של "קושאן" כשותף אישי.

---

### 2. מבנה תיקיות הבדיקות (Test Directory Layout)

```text
tests/e2e/kosun-am/
├── harness/
│   ├── contractOracle.ts         # אורקל חוזים, סכמות, חישוב עלויות AI, ובדיקות מיתוג
│   ├── mockEnvironment.ts        # סביבת סימולציה מבודדת: Scoped Firestore, EventBus, ספקי דיוור, WhatsApp
│   └── testFixtures.ts           # נתוני זהב: קמפיינים, תבניות Bento, אוטומציות, Brand DNA
├── tier1_feature_coverage.test.ts      # רובד 1: כיסוי פיצ'רים מבודד (45 בדיקות)
├── tier2_boundary_corner.test.ts       # רובד 2: מקרי קצה, גבולות ועומסים (45 בדיקות)
├── tier3_cross_feature.test.ts         # רובד 3: שילובי פיצ'רים ואינטגרציות דו-ערוציות (10 בדיקות)
├── tier4_real_world_scenarios.test.ts  # רובד 4: תרחישי משתמש ריאליסטיים מקצה לקצה (5 בדיקות)
└── run_e2e_tests.ts                    # מנהל הרצה ראשי (Master Runner) המפיק דוח ביצועים וסיכום
```

---

### 3. מטריצת 4 הרבדים (The 4-Tier Test Matrix)

| רובד | שם הרובד | מספר בדיקות | תחומי כיסוי עיקריים |
| :--- | :--- | :---: | :--- |
| **Tier 1** | **Feature Coverage** | **45** | כיסוי מלא של 9 תחומי הליבה: אנטומיית 12 השכבות, סנכרון משולש של קולקציות, אבטחת מפתחות API, מנוע שליחה רב-ספקים, אירועי EventBus, תבניות Bento וקמפיינים, שרשרת אוטומציות, סייען Kosai AI ועלויות טוקנים, מיתוג קושאן 2026. |
| **Tier 2** | **Boundary & Corner Cases** | **45** | בדיקות גבולות קיצון: payload ענק (10,000 נמענים, 10MB גוף מייל), ניקוי תווים מיוחדים מ-tenantId, איפוס/פקיעת מפתחות, עומס 1,000 אירועי EventBus מהירים, נטרול שגיאות XSS, מניעת לולאות אוטומציה מעגליות, קריסות מודלי AI ומעבר בשרשרת Fallback, ניגודיות Dark/Light Mode. |
| **Tier 3** | **Cross-Feature Combinations** | **10** | אינטראקציות זוגיות ומערכתיות: ליד ב-CRM -> אוטומציה -> מייל + וואטסאפ Green API -> לוגים; טופס חכם -> סינון תנאי -> מייל -> אירוע יוצא; שגריר חדש -> קישור אישי דינמי -> בידוד דיירים; סייען AI -> תבנית -> שיגור -> דוח עלויות; הסרת נמען (Unsubscribe) -> חסימת דיוור עתידי; עומס מתפרץ של 50 לידים ושיגורים מקבילים. |
| **Tier 4** | **Real-World Scenarios** | **5** | תרחישי שימוש מלאים של בעלי עסקים: השקת ניוזלטר חגיגי למאות לקוחות; שרשרת קבלת פנים רב-ערוצית ללידים מטופס; גיוס וקליטת שגרירים לגיוס המונים; קמפיין שומר שבת מותאם Brand DNA קהילתי; התאוששות שקופה מתקלת ספק ורוטציית מפתחות API. |
| **סה״כ** | **כלל המערך (All Tiers)** | **105** | **100% הצלחה בכל הבדיקות (0 כשלים)** |

---

### 4. פקודות הרצה (Execution Commands)

#### הרצת כלל מערך הבדיקות (Master Runner):
```bash
node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts
```

#### הרצת רובד בדיקות בודד:
```bash
# Tier 1 - Feature Coverage
node --test --experimental-strip-types tests/e2e/kosun-am/tier1_feature_coverage.test.ts

# Tier 2 - Boundary & Corner Cases
node --test --experimental-strip-types tests/e2e/kosun-am/tier2_boundary_corner.test.ts

# Tier 3 - Cross-Feature Combinations
node --test --experimental-strip-types tests/e2e/kosun-am/tier3_cross_feature.test.ts

# Tier 4 - Real-World Scenarios
node --test --experimental-strip-types tests/e2e/kosun-am/tier4_real_world_scenarios.test.ts
```

#### הרצה מרוכזת דרך Test Runner מובנה של Node:
```bash
node --test --experimental-strip-types tests/e2e/kosun-am/*.test.ts
```

---

### 5. סמנטיקת מעבר/כישלון (Pass/Fail Semantics)

- **קוד יציאה 0 (Exit Code 0):** כל 105 הבדיקות עברו בהצלחה מלאה, ללא שגיאות assertion, ללא חריגות בלתי מטופלות, וכל החוזים עומדים בתנאי הסף.
- **קוד יציאה 1 (Exit Code 1):** כישלון בלפחות בדיקה אחת, פירוט מלא של החריגה, מחסנית הקריאות (Stack Trace) והשוואת Expected vs Actual מוצגים באופן מיידי.

</div>
