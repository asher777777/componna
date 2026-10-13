/**
 * Hebrew to Latin transliteration & speech text cleaners
 * Specifically built for domain slugs, subdomains and email addresses
 */

export const HEBREW_TO_LATIN_MAP: Record<string, string> = {
  'א': 'a',
  'ב': 'b',
  'ג': 'g',
  'ד': 'd',
  'ה': 'h',
  'ו': 'v',
  'ז': 'z',
  'ח': 'h',
  'ט': 't',
  'י': 'y',
  'כ': 'k',
  'ך': 'k',
  'ל': 'l',
  'מ': 'm',
  'ם': 'm',
  'נ': 'n',
  'ן': 'n',
  'ס': 's',
  'ע': 'a',
  'פ': 'p',
  'ף': 'p',
  'צ': 'tz',
  'ץ': 'tz',
  'ק': 'k',
  'ר': 'r',
  'ש': 'sh',
  'ת': 't',
};

/**
 * Converts Hebrew or mixed text into a valid English subdomain slug (a-z0-9-)
 * e.g. "מומו" -> "momo", "שירותי ענן" -> "shyrvty-aan"
 */
export function transliterateHebrewToSlug(input: string): string {
  if (!input) return '';
  let result = '';
  const lower = input.toLowerCase();

  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];
    if (HEBREW_TO_LATIN_MAP[char] !== undefined) {
      result += HEBREW_TO_LATIN_MAP[char];
    } else if (/[a-z0-9]/.test(char)) {
      result += char;
    } else if (char === ' ' || char === '_' || char === '-') {
      result += '-';
    }
  }

  // Remove consecutive hyphens and leading/trailing hyphens
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Cleans speech recognition transcript for email fields
 * Converts spoken Hebrew words ("שטרודל", "נקודה") into email syntax (@, .)
 * and transliterates Hebrew names to Latin letters.
 */
export function cleanEmailSpeech(transcript: string): string {
  if (!transcript) return '';
  let cleaned = transcript.toLowerCase();

  // Replace spoken terms
  cleaned = cleaned
    .replace(/שטרודל|שטרודעל|כרוכית|\bat\b/gi, '@')
    .replace(/נקודה|\bdot\b/gi, '.')
    .replace(/מקף/gi, '-')
    .replace(/קו תחתון/gi, '_')
    .replace(/\s+/g, '');

  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (HEBREW_TO_LATIN_MAP[char] !== undefined) {
      result += HEBREW_TO_LATIN_MAP[char];
    } else if (/[a-z0-9@._\-]/.test(char)) {
      result += char;
    }
  }

  return result.trim();
}
