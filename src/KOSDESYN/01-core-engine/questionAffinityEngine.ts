import { comonaDb, kosunDb } from '../../src/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { QuestionAffinityItem } from '../components/action-portal/cognitive-portal/QuestionExplorationView';

export interface ExplorationTreeResult {
  mainQuestion: string;
  mainAnswer: string;
  category: string;
  affinityScore: number;
  relatedQuestions: QuestionAffinityItem[];
}

/**
 * 📚 מאגר שאלות ותשובות דינמי עשיר (Knowledge Base Graph)
 * כל שאלה מקבלת מענה ייחודי + 3 שאלות קשורות עם אייקונים וסולם 80% / 50% / 25% לקראת הנעה לפעולה
 */
const KNOWLEDGE_BASE_GRAPH: Record<string, {
  answer: string;
  category: string;
  affinityScore: number;
  related: {
    question: string;
    affinityScore: number;
    category: string;
    icon: string;
    intentGoal: 'deep_dive' | 'differentiation' | 'intent_conversion';
    ctaLabel?: string;
  }[];
}> = {
  // 1. חבילות ומודולים באקוסיסטם KOSUN 2026
  'חבילות ומודולים': {
    answer: 'אקוסיסטם KOSUN 2026 כולל 3 מסלולים מודולריים עיקריים: מסלול Solo Focus ליזמים ועצמאיים (180 ₪/חודש), חבילת Executive Co-Pilot למנכ״לים ומובילי צוותים (490 ₪/חודש), ומערך KOSUN Enterprise לארגונים עם סנכרון רשת מחלקות ו-Firestore רב-טננטי.',
    category: 'חבילות ומודולים באקוסיסטם',
    affinityScore: 98,
    related: [
      {
        question: 'מה כולל מסלול Solo Focus ליזמים עצמאיים?',
        affinityScore: 80,
        category: 'פירוט חבילת Solo',
        icon: 'UserCheck',
        intentGoal: 'deep_dive'
      },
      {
        question: 'האם ניתן לשדרג או להחליף מסלול בכל עת?',
        affinityScore: 50,
        category: 'גמישות ושדרוג',
        icon: 'RefreshCw',
        intentGoal: 'differentiation'
      },
      {
        question: 'השאר פרטים עכשיו וקבל חודש ניסיון מלא',
        affinityScore: 25,
        category: 'הצטרפות מיידית',
        icon: 'CreditCard',
        intentGoal: 'intent_conversion',
        ctaLabel: 'התחל ניסיון ◀'
      }
    ]
  },

  'חבילות': {
    answer: 'אקוסיסטם KOSUN 2026 כולל 3 מסלולים מודולריים עיקריים: מסלול Solo Focus ליזמים ועצמאיים (180 ₪/חודש), חבילת Executive Co-Pilot למנכ״לים ומובילי צוותים (490 ₪/חודש), ומערך KOSUN Enterprise לארגונים עם סנכרון רשת מחלקות ו-Firestore רב-טננטי.',
    category: 'חבילות ומסלולים',
    affinityScore: 98,
    related: [
      {
        question: 'מה כולל מסלול Solo Focus ליזמים עצמאיים?',
        affinityScore: 80,
        category: 'פירוט חבילת Solo',
        icon: 'UserCheck',
        intentGoal: 'deep_dive'
      },
      {
        question: 'האם ניתן לשדרג או להחליף מסלול בכל עת?',
        affinityScore: 50,
        category: 'גמישות ושדרוג',
        icon: 'RefreshCw',
        intentGoal: 'differentiation'
      },
      {
        question: 'השאר פרטים עכשיו וקבל חודש ניסיון מלא',
        affinityScore: 25,
        category: 'הצטרפות מיידית',
        icon: 'CreditCard',
        intentGoal: 'intent_conversion',
        ctaLabel: 'התחל ניסיון ◀'
      }
    ]
  },

  'תמלול': {
    answer: 'המערכת כוללת מנוע זיהוי דיבור מתקדם מבוסס בינה מלאכותית המותאם במיוחד לעברית מדוברת, כולל סלנג מקצועי ומונחים טכניים. הקול מתומלל בזמן אמת ומפורק מיידית למיקרו-משימות ללא צורך בהקלדה.',
    category: 'טכנולוגיית תמלול וקול',
    affinityScore: 96,
    related: [
      {
        question: 'כיצד מתבצע הפירוק הקולי בעברית ל-15 דקות?',
        affinityScore: 80,
        category: 'מיקרו-פירוק',
        icon: 'Mic',
        intentGoal: 'deep_dive'
      },
      {
        question: 'האם ניתן להשתמש בהקלטה גם ללא חיבור לאינטרנט?',
        affinityScore: 50,
        category: 'זמינות ואבטחה',
        icon: 'ShieldCheck',
        intentGoal: 'differentiation'
      },
      {
        question: 'התחל שימוש קולי עכשיו במערכת KOSUN 2026',
        affinityScore: 25,
        category: 'התחלה מיידית',
        icon: 'Zap',
        intentGoal: 'intent_conversion',
        ctaLabel: 'נסה עכשיו ◀'
      }
    ]
  },

  // 2. מסלול Solo
  'solo': {
    answer: 'מסלול Solo Focus מיועד ליזמים ופרילנסרים המבקשים שקט מנטלי וביצוע יומי של 100%: הוא כולל ניהול The Big 3, מעבדת AI Decompose בלתי מוגבלת לפירוק משימות של 15 דקות, קלט קולי מלא בעברית, וטקס נעילת יום מודרך.',
    category: 'מסלול Solo Focus',
    affinityScore: 96,
    related: [
      {
        question: 'כיצד מתבצע הפירוק הקולי בעברית?',
        affinityScore: 80,
        category: 'טכנולוגיית קול',
        icon: 'Mic',
        intentGoal: 'deep_dive'
      },
      {
        question: 'במה Solo שונה מאפליקציות ניהול משימות רגילות?',
        affinityScore: 50,
        category: 'בידול וייחודיות',
        icon: 'Sparkles',
        intentGoal: 'differentiation'
      },
      {
        question: 'הצטרף עכשיו למסלול Solo במחיר השקה',
        affinityScore: 25,
        category: 'רכישת מנוי',
        icon: 'Zap',
        intentGoal: 'intent_conversion',
        ctaLabel: 'הצטרף עכשיו ◀'
      }
    ]
  },

  // 3. שיטת The Big 3
  'big 3': {
    answer: 'שיטת The Big 3 מבוססת על עקרון הפחתת העומס הקוגניטיבי: בחירה מודעת של עד 3 משימות קריטיות בכל יום, ופירוקן לשלבים קצרים של 15 דקות. כל שאר המשימות מופקדות בבנק ה-Inbox כדי לא להעמיס על הזיכרון הפעיל.',
    category: 'עקרונות פרודוקטיביות',
    affinityScore: 98,
    related: [
      {
        question: 'איך מתמודדים כשמגיעה משימה דחופה באמצע היום?',
        affinityScore: 80,
        category: 'ניהול עומס ישיר',
        icon: 'AlertTriangle',
        intentGoal: 'deep_dive'
      },
      {
        question: 'האם המערכת מבצעת תמלול קולי אוטומטי בעברית?',
        affinityScore: 50,
        category: 'טכנולוגיה ויתרון',
        icon: 'Mic',
        intentGoal: 'differentiation'
      },
      {
        question: 'צפה בחבילות ומסלולי KOSUN 2026 ושריין מקום',
        affinityScore: 25,
        category: 'רכישה והתחלה',
        icon: 'Layers',
        intentGoal: 'intent_conversion',
        ctaLabel: 'לכל החבילות ◀'
      }
    ]
  },

  // 4. משימה דחופה
  'דחופה': {
    answer: 'כשמגיעה משימה בלתי צפויה, פועל "פרוטוקול הסחת דעת": במקום לעצור את היום, רושמים או מקליטים אותה ישירות ל-Quick Capture Inbox. אם היא באמת קריטית, מחליפים אותה באחת מ-3 המשימות הקיימות – אך לעולם לא עוברים את רף ה-3!',
    category: 'ניהול בלת״מים',
    affinityScore: 95,
    related: [
      {
        question: 'איך לקבוע מה דחוף באמת ומה סתם רעש רקע?',
        affinityScore: 80,
        category: 'סינון ותעדוף',
        icon: 'Filter',
        intentGoal: 'deep_dive'
      },
      {
        question: 'איך מעבדת הפירוק מסייעת לבלת״מים של 15 דקות?',
        affinityScore: 50,
        category: 'מיקרו-פירוק',
        icon: 'Cpu',
        intentGoal: 'differentiation'
      },
      {
        question: 'תאם שיחת ייעוץ אישית עם מומחה פוקוס של קושאן',
        affinityScore: 25,
        category: 'ייעוץ מומחה',
        icon: 'Calendar',
        intentGoal: 'intent_conversion',
        ctaLabel: 'תאם ייעוץ ◀'
      }
    ]
  },

  // 5. טקס נעילת יום
  'נעיל': {
    answer: 'טקס נעילת היום אורך כ-5 דקות בלבד: עוברים על 3 משימות היום, חוגגים הצלחות, ומעבירים משימות שנותרו לתכנון המחר. ברגע שהכל מתועד ומוחזק במערכת, המוח משחרר מתח ונכנס לשינה שקטה ועמוקה.',
    category: 'שקט מנטלי ומיינדפולנס',
    affinityScore: 98,
    related: [
      {
        question: 'מה עושים אם לא הספקתי לסיים את משימות ה-Big 3?',
        affinityScore: 80,
        category: 'העמקה ופרקטיקה',
        icon: 'Clock',
        intentGoal: 'deep_dive'
      },
      {
        question: 'איך טקס הנעילה משפיע מדעית על איכות השינה והריכוז?',
        affinityScore: 50,
        category: 'מחקר וערך',
        icon: 'Moon',
        intentGoal: 'differentiation'
      },
      {
        question: 'הפעל את טקס הנעילה עכשיו והתחל ניסיון חינם',
        affinityScore: 25,
        category: 'התנסות וסגירה',
        icon: 'KeyRound',
        intentGoal: 'intent_conversion',
        ctaLabel: 'התחל שימוש ◀'
      }
    ]
  },

  // 6. תמלול קולי
  'קול': {
    answer: 'מנוע הקול של KOSUN מותאם ספציפית לעברית דבורה: הוא מתמלל שיחות, סיעורי מוחות ורעיונות ספונטניים בדיוק מרבי, ומחלץ מהם אוטומטית משימות, תאריכי יעד ופעולות מעשיות.',
    category: 'טכנולוגיית קול AI',
    affinityScore: 94,
    related: [
      {
        question: 'האם התמלול פועל גם מתוך רכב נוסע עם רעשי רקע?',
        affinityScore: 80,
        category: 'סינון רעשים',
        icon: 'Volume2',
        intentGoal: 'deep_dive'
      },
      {
        question: 'איך הקול הופך ישירות לכרטיסיות ומשימות של 15 דקות?',
        affinityScore: 50,
        category: 'המרה לנכסים',
        icon: 'Wand2',
        intentGoal: 'differentiation'
      },
      {
        question: 'נסה עכשיו את ההקלטה הקולית בלחיצה על המיקרופון',
        affinityScore: 25,
        category: 'התנסות חיה',
        icon: 'Mic',
        intentGoal: 'intent_conversion',
        ctaLabel: 'נסה עכשיו ◀'
      }
    ]
  }
};

/**
 * 🌳 getCognitiveExplorationTree:
 * שולף ומחשב את עץ השאלה הנוכחית ומחליף את כל 4 השאלות והתשובה!
 */
export function getCognitiveExplorationTree(
  questionText: string,
  tenantProfile?: any
): ExplorationTreeResult {
  const normalized = (questionText || '').toLowerCase();

  // חיפוש התאמה במאגר הידע
  let matchKey = Object.keys(KNOWLEDGE_BASE_GRAPH).find(k => normalized.includes(k));

  const entry = matchKey ? KNOWLEDGE_BASE_GRAPH[matchKey] : KNOWLEDGE_BASE_GRAPH['big 3'];

  return {
    mainQuestion: questionText || 'שיטת The Big 3 הבלתי מתפשרת',
    mainAnswer: entry?.answer || 'שיטת The Big 3 מבוססת על צמצום קוגניטיבי מבוקר ל-3 משימות יומיות ופירוקן לשלבי ביצוע של 15 דקות.',
    category: entry?.category || 'עקרונות פרודוקטיביות',
    affinityScore: entry?.affinityScore || 98,
    relatedQuestions: (entry?.related || KNOWLEDGE_BASE_GRAPH['big 3'].related).map((r, i) => ({
      id: `rel_${matchKey || 'gen'}_${i}_${Date.now()}`,
      question: r.question,
      affinityScore: r.affinityScore,
      category: r.category,
      icon: r.icon,
      intentGoal: r.intentGoal,
      ctaLabel: r.ctaLabel
    }))
  };
}

/**
 * רישום קליק ועדכון משוקלל ב-Firestore
 */
export async function trackQuestionAffinityClick(
  tenantId: string, 
  questionId: string, 
  targetProject: 'comona' | 'kosun' = 'comona'
) {
  try {
    const db = targetProject === 'comona' ? comonaDb : kosunDb;
    const questionRef = doc(db, `tenants/${tenantId}/cognitive_nodes`, questionId);
    await updateDoc(questionRef, {
      userClicksCount: increment(1),
      lastInteractedAt: new Date().toISOString()
    });
  } catch (err) {
    // Graceful silent fallback
  }
}
