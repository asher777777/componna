/**
 * KosProjects - Client-side Document Extractor for PDF, DOCX, DOC & TXT
 * Zero external dependencies; preserves clean UTF-8 Hebrew text.
 */

export type UploadedDocumentKind = 'spreadsheet' | 'pdf' | 'docx' | 'text';

export interface ExtractedDocumentResult {
  kind: UploadedDocumentKind;
  fileName: string;
  baseName: string;
  textContent?: string;
  pdfBase64?: string;
  warnings: string[];
}

const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15MB

export function detectUploadedDocumentKind(file: File): UploadedDocumentKind {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
    return 'spreadsheet';
  }
  if (lower.endsWith('.pdf') || file.type === 'application/pdf') {
    return 'pdf';
  }
  if (
    lower.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  return 'text';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

async function inflateRawBytes(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('הדפדפן אינו תומך בפריסת קובץ DOCX ישירה.');
  }
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  const copy = new Uint8Array(compressed.byteLength);
  copy.set(compressed);
  writer.write(copy);
  writer.close();
  const out = await new Response(ds.readable).arrayBuffer();
  return new Uint8Array(out);
}

/**
 * Minimal ZIP reader targeting `word/document.xml` inside a `.docx` file.
 */
async function extractTextFromDocxBuffer(buffer: ArrayBuffer): Promise<string> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder('utf-8');

  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  const minOffset = Math.max(0, bytes.length - 65557);
  for (let i = bytes.length - 22; i >= minOffset; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('מבנה קובץ DOCX אינו תקין.');
  }

  const centralDirSize = view.getUint32(eocdOffset + 12, true);
  const centralDirOffset = view.getUint32(eocdOffset + 16, true);
  const endOfCd = centralDirOffset + centralDirSize;

  let offset = centralDirOffset;
  while (offset + 46 <= endOfCd && offset + 46 <= bytes.length) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;

    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);

    const fileName = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLen));

    if (fileName === 'word/document.xml') {
      const localNameLen = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const rawSlice = bytes.subarray(dataStart, dataStart + compressedSize);

      let xmlBytes: Uint8Array;
      if (compressionMethod === 0) {
        xmlBytes = rawSlice;
      } else if (compressionMethod === 8) {
        xmlBytes = await inflateRawBytes(rawSlice);
      } else {
        throw new Error('שיטת הדחיסה בקובץ DOCX אינה נתמכת.');
      }

      const xmlString = decoder.decode(xmlBytes);
      return xmlToPlainText(xmlString);
    }

    offset += 46 + nameLen + extraLen + commentLen;
  }

  throw new Error('לא נמצא תוכן טקסטואלי בתוך קובץ ה-DOCX.');
}

function xmlToPlainText(xml: string): string {
  // Preserve paragraph & table-row line breaks before stripping XML tags
  const withBreaks = xml
    .replace(/<\/w:p>/gi, '\n')
    .replace(/<\/w:tr>/gi, '\n')
    .replace(/<w:tab\/>/gi, ' ')
    .replace(/<w:br[^>]*\/>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return withBreaks
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractDocumentForProject(file: File): Promise<ExtractedDocumentResult> {
  const kind = detectUploadedDocumentKind(file);
  const baseName = file.name.replace(/\.(xlsx|xls|csv|pdf|docx|doc|txt|md)$/i, '').trim();
  const warnings: string[] = [];

  if (kind === 'pdf') {
    if (file.size > MAX_PDF_BYTES) {
      throw new Error('קובץ ה-PDF גדול מ-15MB. אנא העלה קובץ קטן יותר.');
    }
    const buffer = await file.arrayBuffer();
    const pdfBase64 = arrayBufferToBase64(buffer);
    return { kind: 'pdf', fileName: file.name, baseName, pdfBase64, warnings };
  }

  if (kind === 'docx') {
    const buffer = await file.arrayBuffer();
    const textContent = await extractTextFromDocxBuffer(buffer);
    if (!textContent) {
      warnings.push('לא זוהה טקסט קריא בתוך קובץ ה-DOCX.');
    }
    return { kind: 'docx', fileName: file.name, baseName, textContent, warnings };
  }

  // Fallback for .txt, .md, or legacy .doc
  const rawText = await file.text();
  const cleaned = rawText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, ' ').trim();
  if (file.name.toLowerCase().endsWith('.doc')) {
    warnings.push('קבצי .doc ישנים מומלץ לשמור כ-.docx או .pdf לדיוק מרבי בעברית.');
  }
  return {
    kind: 'text',
    fileName: file.name,
    baseName,
    textContent: cleaned.slice(0, 24000),
    warnings,
  };
}
