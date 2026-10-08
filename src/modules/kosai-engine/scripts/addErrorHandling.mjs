import fs from 'fs';

let ka = fs.readFileSync('src/modules/kosai-engine/api/kosaiApi.ts', 'utf8');

ka = ka.replace(
  /let textData = typeof response\.data === 'string' \? response\.data\.trim\(\) : JSON\.stringify\(response\.data\);\n\s*if \(!textData \|\| textData === 'undefined'\) \{\n\s*textData = 'אתה עוזר AI מקצועי\. המטרה שלך היא לעזור למשתמש לנהל את המודול הנוכחי\.';\n\s*\}/,
  `if (!response.success || response.isFallback) {
    let errorReason = response.error || 'שגיאה לא ידועה';
    if (errorReason === 'NO_API_KEY_FOUND') {
      errorReason = 'חסר מפתח API של Google Gemini בהגדרות.';
    }
    return {
      prompt: \`[שגיאה בניסוח אוטומטי - אנא בדוק הגדרות] \nהסיבה: \${errorReason}\n\nאתה עוזר AI מקצועי. המטרה שלך היא לעזור למשתמש לנהל את המודול הנוכחי.\`,
      usage
    };
  }
  let textData = typeof response.data === 'string' ? response.data.trim() : JSON.stringify(response.data);`
);

fs.writeFileSync('src/modules/kosai-engine/api/kosaiApi.ts', ka);
