import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC011dhtJddDjLmTQ2HCvgVA0DPN8rKFwQ',
  projectId: 'glowmanage',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function buildBrandSystemContext(brand, moduleRole = 'אסטרטג שירותים, מומחה SEO/AIO וקופירייטר בכיר') {
  const { identity, voice, audience } = brand;
  const company = identity?.companyName || 'העסק';
  const summary = brand.brandSummaryParagraph?.trim() || '';
  const purpose = identity?.organizationPurpose || '';
  const slogan = identity?.slogan || '';
  const vision = identity?.companyVision || identity?.shortVision || '';
  const uvp = audience?.mainUvp || '';
  const audiences = (audience?.targetAudiences || []).join(', ');
  const personas = (audience?.personas || []).map((p) => `${p.name} (כאב: ${p.mainPain}, יעד: ${p.dreamOutcome})`).join('; ');

  const isFemale = voice?.genderAddressing === 'female';
  const addressingInstruction = isFemale
    ? 'פנייה מגדרית קריטית: חובה לכתוב בפנייה ישירה ומעצימה בלשון נקבה בלבד (נשים, אחיות, גלי, תוכלי, עבורך, בואי, מרחב נשי) בחמימות, אמפתיה וכבוד עמוק.'
    : voice?.genderAddressing === 'male'
      ? 'פנייה מגדרית: פנייה בלשון זכר.'
      : 'פנייה מגדרית: לשון רבים/פנייה משולבת ומכבדת.';

  const personalityInfo = voice?.personality
    ? `מדדי אישיות המותג: רשמיות ${voice.personality.formality}/5, חמימות ${voice.personality.warmth}/5, יוקרה ${voice.personality.luxury}/5, אנרגיה ${voice.personality.energy}/5.`
    : '';

  const sectorInfo = voice?.sectorCompliance && voice.sectorCompliance !== 'general'
    ? `רגישות מגזרית/ערכית: ${voice.sectorCompliance}.`
    : voice?.shabbatObservant
      ? 'רגישות מגזרית: שמירת שבת ומסורת ישראל, כבוד לעולם התורה והערכים היהודיים.'
      : '';

  return [
    `אתה פועל בתפקיד "${moduleRole}" עבור המותג "${company}".`,
    `תמצית המותג והחזון (Brand Essence):`,
    summary,
    purpose ? `תכלית ויעוד הארגון: ${purpose}` : '',
    slogan ? `סלוגן רשמי: "${slogan}"` : '',
    vision ? `חזון מעמיק: ${vision}` : '',
    uvp ? `הצעת ערך ייחודית (UVP): ${uvp}` : '',
    audiences ? `קהלי יעד מוגדרים: ${audiences}` : '',
    personas ? `פרסונות ליבה: ${personas}` : '',
    addressingInstruction,
    personalityInfo,
    sectorInfo,
    voice?.powerWords?.length ? `מילות עוצמה ומפתח חובה לשילוב טבעי: ${voice.powerWords.join(', ')}.` : '',
    voice?.forbiddenWords?.length ? `מילים וביטויים אסורים לשימוש: ${voice.forbiddenWords.join(', ')}.` : '',
    `\nדגש איכות עליון - קופירייטינג בטוב טעם (Taste & Brand Distinction):`,
    `1. כל כותרת, תגית, משפט ותיאור חייבים להיות מנוסחים בעברית רהוטה, עשירה ומעוררת השראה, התואמת ב-100% את רוח המותג ואת הגדרות המיתוג שלו.`,
    `2. איסור מוחלט על כותרות גנריות, מכניות ומנוכרות!`,
    `   - חל איסור מוחלט להשתמש בקלישאות שחוקות כמו: "למה לבחור בנו?", "היתרונות והמעלות של השירות", "היתרונות והמעלות של המוצר", "נקודות הכאב שלנו", "קהלי היעד שלנו", "מוצר מנצח", "חבילה מובילה".`,
    `   - במקום זאת, נסח כותרות ותגיות מלאות נשמה, יופי, בידול וחיבור אנושי המשקפות בטוב טעם את השליחות של ${company}.`,
  ].filter(Boolean).join('\n');
}

function buildCoreServicePrompt(idea, brand) {
  const systemContext = buildBrandSystemContext(brand);
  const userPrompt = `בהתבסס על תמצית המותג ועל שירות היעד שהזין המשתמש:
"${idea}"

צור פרופיל שירות מרכזי (Core Service) שלם, עשיר, ייחודי ומעמיק בעברית רהוטה.
אין צורך לציין אייקונים (המערכת תקצה אייקונים כברירת מחדל).
חובה לכתוב תוכן מגוון, שונה ומובחן לכל סעיף – חל איסור מוחלט על חזרות, העתקות או כפילויות של תוכן בין השדות!

החזר את התשובה אך ורק בפורמט הטקסט המובנה הבא, עם התגיות המדויקות:

===NAME_AND_SLOGAN===
[שם השירות + סלוגן מושך ומדויק]

===SHORT_DESCRIPTION===
[תיאור קצר וקולע ב-1-2 משפטים שמסביר את השירות והתועלת המיידית שלו]

===LONG_DESCRIPTION===
[תיאור ארוך, עשיר ומפורט (4-6 משפטים) עבור אזור התוכן/אודות בעמוד הנחיתה, המספר את סיפור השירות, החוויה והערך העמוק שהוא מעניק]

===SECTION_HEADINGS===
ABOUT_SUBTITLE: [תגית/סאב-טייטל מעודן לאזור האודות, לדוגמה: "מפגש חי עם פנימיות התורה" או "החיבור הפנימי שלך"]
ABOUT_HEADING: [כותרת ראשית מעצימה לאזור האודות, לדוגמה: "לצלול אל מעיינות החכמה והנפש"]
PAIN_POINTS_SUBTITLE: [תגית מעודנת לאזור האתגרים והמענה, לדוגמה: "עוגן בתוך שגרת החול" או "מענה לעומס היומיומי"]
PAIN_POINTS_HEADING: [כותרת ראשית חמה ומלאת אמפתיה, ללא המילים 'נקודות כאב', לדוגמה: "האתגרים שאנו פוגשות ופותרות יחד"]
TARGET_AUDIENCES_SUBTITLE: [תגית מזמינה לאזור ההתאמה, לדוגמה: "המרחב שמחכה לך"]
TARGET_AUDIENCES_HEADING: [כותרת ראשית מחבקת לקהל היעד, לדוגמה: "למי נתפר המסע הייחודי הזה?"]
ADVANTAGES_SUBTITLE: [תגית יוקרתית ומעודנת (חל איסור מוחלט על 'למה לבחור בנו?'), לדוגמה: "הבשורה שלנו עבורך" או "עוגנים של שקט וביטחון"]
ADVANTAGES_HEADING: [כותרת ראשית מעצימה ומנוסחת בטוב טעם (חל איסור מוחלט על 'היתרונות והמעלות של השירות/המוצר'), לדוגמה: "המעלות והעוצמה הייחודית של המרחב שלנו"]
FAQ_SUBTITLE: [תגית לאזור השאלות, לדוגמה: "בגובה העיניים וברוגע"]
FAQ_HEADING: [כותרת ראשית לאזור השאלות והתשובות, לדוגמה: "כל מה שחשוב לך לדעת לקראת היציאה לדרך"]
CONTACT_SUBTITLE: [תגית לאזור יצירת הקשר, לדוגמה: "צעד ראשון של התחדשות"]
CONTACT_HEADING: [כותרת ראשית מזמינה ומחבקת, לדוגמה: "מוזמנת לפתוח דלת וליצור איתנו קשר אישי"]

===PAIN_POINTS===
1. [כותרת קצרה של נקודת כאב 1 שהשירות פותר] | [פירוט מעמיק ב-2 משפטים כיצד השירות פותר את הכאב הזה]
2. [כותרת נקודת כאב שונה 2] | [פירוט מעמיק ב-2 משפטים]
3. [כותרת נקודת כאב שונה 3] | [פירוט מעמיק ב-2 משפטים]
4. [כותרת נקודת כאב שונה 4] | [פירוט מעמיק ב-2 משפטים]
5. [כותרת נקודת כאב שונה 5] | [פירוט מעמיק ב-2 משפטים]
6. [כותרת נקודת כאב שונה 6] | [פירוט מעמיק ב-2 משפטים]

===TARGET_AUDIENCES===
1. [קהל יעד ספציפי 1 לשירות] | [פירוט מעמיק למה השירות מתאים לו ומה התועלת עבורו]
2. [קהל יעד שונה 2] | [פירוט מעמיק]
3. [קהל יעד שונה 3] | [פירוט מעמיק]

===COMPETITIVE_ADVANTAGES===
1. [יתרון תחרותי ייחודי 1 של השירות] | [פירוט המעלה על פני כל חלופה אחרת בשוק]
2. [יתרון תחרותי שונה 2] | [פירוט המעלה]
3. [יתרון תחרותי שונה 3] | [פירוט המעלה]
4. [יתרון תחרותי שונה 4] | [פירוט המעלה]
5. [יתרון תחרותי שונה 5] | [פירוט המעלה]
6. [יתרון תחרותי שונה 6] | [פירוט המעלה]

===FAQS===
1. [שאלה נפוצה 1 בנושא מהות השירות?] | [תשובה מפורטת, מרגיעה ומשכנעת]
2. [שאלה נפוצה 2 בנושא התאמה?] | [תשובה מפורטת]
3. [שאלה נפוצה 3 בנושא מחיר ועלויות?] | [תשובה מפורטת]
4. [שאלה נפוצה 4 בנושא לוחות זמנים?] | [תשובה מפורטת]
5. [שאלה נפוצה 5 בנושא תהליך העבודה?] | [תשובה מפורטת]
6. [שאלה נפוצה 6 בנושא תמיכה ושירות?] | [תשובה מפורטת]
7. [שאלה נפוצה 7 בנושא בידול ממתחרים?] | [תשובה מפורטת]
8. [שאלה נפוצה 8 בנושא אחריות ובטחון?] | [תשובה מפורטת]
9. [שאלה נפוצה 9 בנושא תוצאות צפויות?] | [תשובה מפורטת]
10. [שאלה נפוצה 10 בנושא צעדים ראשונים?] | [תשובה מפורטת]

===SEO===
SLUG: [סלאג קצר ותמציתי באנגלית באותיות קטנות בלבד המייצג את השירות בלבד כגון inner-anchor-circle, ללא שם החברה וללא שום קידומת]
META_TITLE: כותרת מטא לגוגל (עד 60 תווים)
META_DESCRIPTION: תיאור מטא שיווקי לגוגל (עד 160 תווים)
KEYWORDS: מילת מפתח 1, מילת מפתח 2, מילת מפתח 3, מילת מפתח 4
AI_SUMMARY: תמצית ידע עובדתית ב-3 משפטים שמנועי AI יצטטו ישירות לגבי השירות
AI_QUESTIONS: שאלה 1? | שאלה 2? | שאלה 3? | שאלה 4? | שאלה 5?`.trim();

  return { systemContext, userPrompt };
}

async function main() {
  const keySnap = await getDoc(doc(db, 'tenants', '_master', 'settings', 'api_keys'));
  const apiKey = keySnap.data()?.googleAiApiKey;
  if (!apiKey) throw new Error('Missing apiKey');

  const mleaSnap = await getDoc(doc(db, 'tenants', 'mlea', 'settings', 'kos_branding_dna'));
  const brand = mleaSnap.data();

  const { systemContext, userPrompt } = buildCoreServicePrompt(
    "מעגל 'עוגן פנימי': תוכנית ליווי אישית חודשית המשלבת ייעוץ רוחני פרטני, מפגשי חסידות חודשיים ומעטפת קהילתית תומכת",
    brand
  );

  console.log('Sending prompt to Gemini...');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemContext }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 3500,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('\n=== GEMINI OUTPUT ===\n');
  console.log(rawText);
}

main().catch(console.error);
