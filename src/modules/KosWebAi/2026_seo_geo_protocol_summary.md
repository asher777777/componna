{
  "protocol_metadata": {
    "title": "פרוטוקול SEO, GEO ו-Agentic Web תמציתי",
    "version": "2026.4",
    "core_shift": "מעבר מדירוג מילות מפתח לציטוטים במנועי AI (Citation Share), תוספת מידע מקורית (Information Gain) ומוכנות לפעולות סוכנים אוטונומיים."
  },
  "1_technical_and_performance": {
    "primary_rules": [
      {
        "rule": "מגבלת משקל HTML",
        "requirement": "מתחת ל-2MB לקובץ HTML (גוגלבוט קוטע סריקה מעבר לכך). יש לנקות CSS/JS מוטמע מיותר."
      },
      {
        "rule": "Core Web Vitals (החמרת 2026)",
        "requirement": "INP מתחת ל-150ms (תגובה מיידית), LCP מתחת ל-2.5 שניות, CLS מתחת ל-0.1."
      },
      {
        "rule": "ארכיטקטורת מידע שטוחה",
        "requirement": "כל עמוד נגיש תוך מקסימום 3 קליקים מדף הבית, עם כתובות URL נקיות ותיאוריות."
      }
    ],
    "secondary_rules": [
      {
        "rule": "חסימת Back Button Hijacking",
        "requirement": "אכיפה מחמירה נגד סקריפטים או חלונות קופצים שמונעים חזרה אחורה בדפדפן."
      },
      {
        "rule": "סינון הייפ טכני",
        "requirement": "אין צורך בקובצי llms.txt או בגרסאות Markdown ייעודיות (גוגל הבהירה שאינה משתמשת בהם)."
      }
    ]
  },
  "2_content_and_geo_optimization": {
    "primary_rules": [
      {
        "rule": "עקרון ה-Information Gain",
        "requirement": "כל עמוד חייב להכיל נתונים מקוריים, מחקר עצמאי, תובנות מהשטח או זווית ייחודית. שכתוב תוכן קיים בעזרת AI נענש."
      },
      {
        "rule": "מבנה Answer-First",
        "requirement": "פתיחת כל מאמר וסעיף H2 בתשובה ישירה, חדה ומבוססת נתונים באורך 40–60 מילים לשאיבה קלה על ידי LLMs."
      },
      {
        "rule": "אשכולות נושא (Topic Clusters)",
        "requirement": "עמוד עוגן (Pillar) מקיף לכל נושא ליבה, מוקף ב-5 עד 10 עמודי עומק העונים על שאלות המשך (Query Fan-outs)."
      }
    ],
    "secondary_rules": [
      {
        "rule": "פורמטים קריאים למכונה",
        "requirement": "שילוב טבלאות השוואה, רשימות מובנות והגדרות ברורות כל 250–300 מילים."
      },
      {
        "rule": "רעננות תוכן (Freshness)",
        "requirement": "הצגת תאריך עדכון אחרון בולט ורענון נתונים תקופתי למניעת Content Decay."
      }
    ]
  },
  "3_entity_and_offsite_corroboration": {
    "primary_rules": [
      {
        "rule": "הטמעת סכמות JSON-LD",
        "requirement": "חובה להטמיע Organization, Person (פרופיל מחבר מומחה), Article, Product/Service ו-Event."
      },
      {
        "rule": "אימות חוץ-אתרי (Corroboration)",
        "requirement": "פרסום גרסת וידאו ב-YouTube לכל מדריך מרכזי (האות החזק ביותר לציטוטי AI), לצד נוכחות בקהילות (Reddit) וביקורות."
      }
    ],
    "secondary_rules": [
      {
        "rule": "עדכון סכמת FAQ",
        "requirement": "גוגל ביטלה את תצוגת ה-FAQ Rich Results; הסכמה משמשת כיום להבנת הקשר בלבד ולא לתפיסת שטח מסך."
      },
      {
        "rule": "עקביות פרטי יישות",
        "requirement": "התאמה מלאה בין פרטי הקשר והאישורים בפוטר האתר לבין הסכמות והפרופילים החיצוניים."
      }
    ]
  },
  "4_agentic_web_readiness": {
    "primary_rules": [
      {
        "rule": "נגישות להשלמת פעולות על ידי סוכנים",
        "requirement": "טפסים, תהליכי רכישה והרשמה חייבים להיות נקיים מחסמים, עם תגיות label ו-autocomplete תקניות."
      }
    ],
    "secondary_rules": [
      {
        "rule": "בדיקות סימולציית סוכן",
        "requirement": "הרצת סוכן AI מבוסס דפדפן לבדיקה שהוא מצליח להשאיר ליד, לרכוש או להוסיף אירוע ליומן."
      }
    ]
  },
  "5_ongoing_management_routine": {
    "daily": [
      "ניטור תקינות טכנית (אפס שגיאות 5xx).",
      "מעקב אחר אזכורי מותג וניהול סנטימנט ברשת ובקהילות."
    ],
    "weekly": [
      "פרסום 1–2 תכני עומק מבוססי ניסיון מעשי + סרטון YouTube תואם.",
      "חיזוק קישורים פנימיים מעמודים חזקים לחדשים ובדיקת דוח Search Console לשיפור CTR."
    ],
    "monthly": [
      "אודיט נראות AI: בדיקת נתח ציטוטים (Mention Share) ב-ChatGPT, Gemini ו-Perplexity על 20–30 שאלות ליבה.",
      "רענון תוכן מתיישן, איחוד עמודים חלשים ובניית אזכורים באתרי סמכות.",
      "מעקב תנועת הפניות מ-LLMs בתוך GA4."
    ],
    "during_algorithm_updates": [
      "הקפאת שינויים גורפים באתר לאורך כל תקופת ה-Rollout + שבוע המתנה נוסף.",
      "ניתוח השוואתי לפי קבוצות עמודים (ולא מילים בודדות) לזיהוי פערי ערך."
    ]
  }
}