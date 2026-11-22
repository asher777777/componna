import { dispatchImageTextExtractionToKosai } from '../kosai/promptToKosai';

export interface IngestedSourceItem {
  id: string;
  type: 'file' | 'url' | 'text';
  label: string;
  extractedText: string;
  charCount: number;
  warning?: string;
}

const MAX_SOURCE_CHARS = 6000;

/**
 * Strips HTML tags and normalizes whitespace into clean readable text.
 */
export function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts readable text from an uploaded file (TXT, MD, HTML, CSV, PDF, DOCX, PNG, JPG, JPEG, WEBP).
 * Images are processed via KOSAI Vision Monopoly (Master key) without direct API calls.
 */
export async function extractTextFromUploadedFile(
  file: File,
  options?: { tenantId?: string }
): Promise<IngestedSourceItem> {
  const id = `src_file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  try {
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || file.type.startsWith('image/')) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });
      const [, base64] = dataUrl.split(',');
      const mimeType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg');
      if (base64) {
        try {
          const extracted = await dispatchImageTextExtractionToKosai(base64, mimeType, {
            tenantId: options?.tenantId,
          });
          const cleaned = extracted.trim().slice(0, MAX_SOURCE_CHARS);
          if (cleaned) {
            return {
              id,
              type: 'file',
              label: `${file.name} (תמונה)`,
              extractedText: cleaned,
              charCount: cleaned.length,
            };
          }
        } catch (visionErr) {
          console.warn('[sourceIngestionService] Vision extraction notice:', visionErr);
        }
      }
      return {
        id,
        type: 'file',
        label: `${file.name} (תמונה)`,
        extractedText: `[קובץ תמונה מצורף: ${file.name}]`,
        charCount: 0,
        warning: 'התמונה צורפה, אך לא ניתן היה לחלץ ממנה טקסט אוטומטית.',
      };
    }

    if (['txt', 'md', 'csv', 'json', 'log'].includes(ext)) {
      const raw = await file.text();
      const cleaned = raw.trim().slice(0, MAX_SOURCE_CHARS);
      return {
        id,
        type: 'file',
        label: file.name,
        extractedText: cleaned,
        charCount: cleaned.length,
      };
    }

    if (['html', 'htm'].includes(ext)) {
      const raw = await file.text();
      const cleaned = stripHtmlToText(raw).slice(0, MAX_SOURCE_CHARS);
      return {
        id,
        type: 'file',
        label: file.name,
        extractedText: cleaned,
        charCount: cleaned.length,
      };
    }

    // For PDF / DOC / DOCX: extract readable Hebrew/English/numeric runs safely
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawUtf8 = decoder.decode(buffer);

    // For DOCX XML or uncompressed PDF text streams, extract meaningful sentences
    let extracted = '';
    if (ext === 'docx' || ext === 'xml') {
      extracted = stripHtmlToText(rawUtf8);
    } else {
      // Extract PDF parenthesized text literals or readable Hebrew/Latin runs
      const pdfTextMatches = rawUtf8.match(/\(([^()]{3,200})\)/g);
      if (pdfTextMatches && pdfTextMatches.length > 5) {
        extracted = pdfTextMatches
          .map((m) => m.slice(1, -1))
          .filter((s) => /[\u0590-\u05FFa-zA-Z0-9]{2,}/.test(s))
          .join(' ');
      }
    }

    // Clean control characters
    extracted = extracted
      .replace(/[^\u0590-\u05FFa-zA-Z0-9\s.,:;!?'"()\-\/%₪$]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_SOURCE_CHARS);

    if (extracted.length < 40) {
      return {
        id,
        type: 'file',
        label: file.name,
        extractedText: `[קובץ מצורף: ${file.name}]`,
        charCount: 0,
        warning:
          'קובץ זה דחוס או סרוק כתמונה. מומלץ להעתיק ולהדביק כאן את עיקרי הטקסט כדי שה-AI ישתמש בנתונים המדויקים.',
      };
    }

    return {
      id,
      type: 'file',
      label: file.name,
      extractedText: extracted,
      charCount: extracted.length,
    };
  } catch (err) {
    return {
      id,
      type: 'file',
      label: file.name,
      extractedText: '',
      charCount: 0,
      warning: 'לא ניתן היה לקרוא את הקובץ ישירות. ניתן להדביק את התוכן בשדה הטקסט.',
    };
  }
}

/**
 * Scans a website URL to extract grounding content (title, headings, key facts).
 * Uses Jina Reader (CORS-friendly markdown extraction) with direct fetch fallback.
 */
export async function scanWebsiteUrlForGrounding(rawUrl: string): Promise<IngestedSourceItem> {
  const id = `src_url_${Date.now()}`;
  const normalizedUrl = /^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : `https://${rawUrl.trim()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Try CORS-friendly reader first
    let text = '';
    try {
      const readerRes = await fetch(`https://r.jina.ai/${normalizedUrl}`, {
        signal: controller.signal,
        headers: { Accept: 'text/plain' },
      });
      if (readerRes.ok) {
        text = await readerRes.text();
      }
    } catch {
      // Fallback to direct fetch if CORS allows
      const directRes = await fetch(normalizedUrl, { signal: controller.signal });
      if (directRes.ok) {
        const html = await directRes.text();
        text = stripHtmlToText(html);
      }
    }

    clearTimeout(timeoutId);

    const cleaned = text.replace(/\s+/g, ' ').trim().slice(0, MAX_SOURCE_CHARS);
    if (!cleaned) {
      return {
        id,
        type: 'url',
        label: normalizedUrl,
        extractedText: '',
        charCount: 0,
        warning: 'האתר חסם סריקה אוטומטית (CORS). ניתן להדביק את הטקסט מהאתר ישירות בתיבת הטקסט.',
      };
    }

    return {
      id,
      type: 'url',
      label: normalizedUrl,
      extractedText: cleaned,
      charCount: cleaned.length,
    };
  } catch {
    return {
      id,
      type: 'url',
      label: normalizedUrl,
      extractedText: '',
      charCount: 0,
      warning: 'לא הצלחנו לסרוק את הכתובת כרגע. ניתן להדביק את התוכן ידנית.',
    };
  }
}
