# מודול יוצר עמודים ואתרים אוטונומי ב-AI (Page Builder 2.0)

<div dir="rtl" style="text-align: right;">

## 🌟 סקירה כללית
מודול ה-**Page Builder** הינו מנוע אוטונומי, מודולרי ועצמאי ב-100% ליצירה, עריכה, ניהול ופרסום של אתרי אינטרנט, משפכי שיווק, דפי נחיתה מקומיים (GEO SEO) ודפי קמפיין מרהיבים.
המודול בנוי לפי תקן **10 השכבות** (10-Layer Anatomy) ומקיים אפס תלויות ישירות (Zero Direct Cross-Module Imports) מול שאר המודולים במערכת.

---

## 🏛️ אנטומיית 10 השכבות (10-Layer Anatomy)

1. **`config/index.ts`** – מזהה המודול, גרסה, קידומות אחסון וקולקציות סקופיות (`mod_pages_documents`, `mod_pages_templates`, `mod_pages_analytics`).
2. **`types/index.ts`** – טיפוסי TypeScript אחידים ומלאים לכל חלקי המודול.
3. **`context/PageBuilderContext.tsx`** – ניהול State מרכזי, היסטוריית שינויים (Undo/Redo), ניהול אזורים, סנכרון עם ה-Brand DNA ושמירה.
4. **`hooks/`** – שכבת הוקים מודולרית:
   - `usePageBuilder`: צריכת ה-Context המרכזי.
   - `useSectionManager`: ניהול, הוספה, שכפול, מחיקה וסידור מחדש של אזורים.
   - `useAiPageGenerator`: הפעלת מנוע ה-Streaming ומעקב התקדמות באחוזים חיים.
   - `useMarketingIdeas`: גזירת זוויות שיווקיות רציפות מתוך ה-Brand DNA.
5. **`prompts/index.ts`** – ספריית פרומפטים מובנית ליצירה מרובת אזורים, רעיונות שיווקיים, שדרוג אזורים וסינתזת תמונות.
6. **`api/functionsApi.ts`** – שכבת תקשורת מוגנת ל-Gemini API עם **Smart Key Resolver** וטיפול עמיד בשגיאות רשת ו-CORS.
7. **`blueprints/pageBlueprints.ts`** – ספריית 5 תבניות פרימיום מובנות לטעינה בלחיצה אחת.
8. **`routes/PageBuilderRoutes.tsx`** – ניתוב פנימי מלא בין דשבורד דפים (`/`), עורך הדפים (`/edit/:pageId`) ותצוגה מקדימה חיה (`/preview/:pageId`).
9. **`components/` & `sections/`** – רכיבי ממשק מלוטשים ב-Tailwind עם תמיכה מלאה וקפדנית ב-RTL ועריכה ויזואלית.
10. **`index.ts` & `README.md`** – ייצוא ציבורי תקני ותיעוד ארכיטקטוני מלא.

---

## 🚀 מנוע ה-AI האוטונומי (Autonomous Multi-Section AI)

- **לעולם לא נוצר Hero בודד:** המנוע מייצר תמיד שלד שלם בן 4 עד 8 אזורים מקושרים וקוהרנטיים (Hero ➔ ServicesGrid ➔ StatsBento ➔ Testimonials ➔ FAQ ➔ Contact).
- **Smart Key Resolver:** בודק לפי סדר עדיפויות מוגדר: פרמטר ➔ `googleAiApiKey` ➔ `geminiApiKey` ➔ קונפיגורציית מערכת ➔ משתני סביבה (`VITE_GEMINI_API_KEY`).
- **Real-Time Visual Streaming:** מעקב אחוזים מדויק (0% עד 100%) וטעינה מדורגת חיה של האזורים.
- **Graceful Fallback:** גם ללא מפתח API זמין, נוצר שלד עשיר ומרהיב של 6 אזורים מלאים עם הודעה עדינה להזנת מפתח.

---

## 🧠 סנכרון שיווקי רציף עם ה-Brand DNA

- **`ContinuousMarketingIdeasDrawer`:** שואב אוטומטית מתוך ה-`BrandDnaContract` את קהלי היעד, נקודות הכאב, החזון וההבטחה השיווקית, ומציג 6 כרטיסיות שיווקיות מנצחות.
- **רענון זוויות שיווקיות:** לחיצה על "רענן זוויות שיווקיות ב-AI" מייצרת הצעות חדשות הנגזרות מהתנגדויות הלקוחות.
- **יצירה בלחיצה אחת:** לחיצה על כרטיסיית רעיון מפעילה את מחולל הדפים ישירות עם הפרומפט המדויק.

---

## 🖼️ סנכרון עם כספת המדיה (Media Vault & Visuals)

- שימוש ביכולת המערכת `getCapability<MediaPickerContract>('media-picker')` לפתיחת גלריית המדיה האחידה.
- Fallback מקומי מובנה להעלאת קבצים ישירה (`<input type="file" />`) ללא תלות ישירה במודול הגלריה.
- סינתזה חכמה של תמונות placeholder מקצועיות (Unsplash) מותאמות לתחום ולצבעי המותג.

---

## 📑 5 תבניות פרימיום מובנות (Page Blueprints)

1. **עמוד מכירה והשקה (Sales & Checkout Funnel):** Hero מפוצל, באנר לוגואים, כרטיסי יתרונות, מחירון חבילות, ביקורות לקוחות, טיימר דחיפות וטופס הצטרפות.
2. **עמוד שירות מקומי ו-SEO (Local Geo Authority Landing):** כותרת ממוקדת עיר, מפת פעילות, שירותים אזוריים, ביקורות מאומתות וחיוג/וואטסאפ מהיר.
3. **עמוד מאמר ידע וסמכות (Knowledge & Authority Page):** כותרת אלגנטית, תוכן עשיר עם ציטוטים, מדדי השפעה, מגנט לידים להורדת מדריך ושאלות נפוצות.
4. **עמוד קהילה והרשמה (Community Hub):** קאבר קהילתי, מונה חברים חי, הטבות בלעדיות, לוח אירועים וטופס הצטרפות מהיר.
5. **עמוד קמפיין וגיוס תרומות (Donation & Crowdfunding Campaign):** כותרת מרגשת, סרגל יעד דינמי, מסלולי תרומה עם סעיף 46, רשימת תורמים ואישורי מס.

---

## 🔒 ניתוק תלויות ספגטי וחוזים (Contracts & EventBus)

- **סליקה:** `KesherCheckoutModal` משדר אירוע `payment:completed` ואירוע `crm:lead:created` דרך ה-`eventBus`. אם מסוף סליקה אינו מותקן, המערכת מציגה איסוף ליד והעברה בנקאית חלקה.
- **טפסים חכמים:** משתמש ב-`FormBuilderContract` וב-`eventBus` (`smart_form:submitted`, `crm:lead:created`).
- **אפס ייבואים ישירים:** שום קובץ בתוך המודול אינו מייבא מ-`src/modules/*`!

</div>
