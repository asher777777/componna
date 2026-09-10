import { ImageConversionOptions, MediaType } from '../types';

/**
 * CRC-32 table and calculation for client-side standard ZIP files
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileInput {
  name: string;
  data: Uint8Array | Blob | string;
}

export class FileCompressionService {
  /**
   * Client-side standard ZIP archive generator (Zero dependency, supports all browsers)
   */
  public static async createZipArchive(files: ZipFileInput[]): Promise<Blob> {
    const fileEntries: {
      nameBytes: Uint8Array;
      dataBytes: Uint8Array;
      crc32: number;
      offset: number;
    }[] = [];

    const textEncoder = new TextEncoder();
    let currentOffset = 0;
    const parts: Uint8Array[] = [];

    for (const file of files) {
      let dataBytes: Uint8Array;
      if (typeof file.data === 'string') {
        dataBytes = textEncoder.encode(file.data);
      } else if (file.data instanceof Blob) {
        const buffer = await file.data.arrayBuffer();
        dataBytes = new Uint8Array(buffer);
      } else {
        dataBytes = file.data;
      }

      const nameBytes = textEncoder.encode(file.name);
      const crc = calculateCrc32(dataBytes);

      // Local File Header (30 bytes + name length)
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(localHeader.buffer);

      view.setUint32(0, 0x04034b50, true); // Local header signature
      view.setUint16(4, 20, true); // Version needed to extract (2.0)
      view.setUint16(6, 0x0800, true); // General purpose bit flag (UTF-8)
      view.setUint16(8, 0, true); // Compression method (0 = STORE)
      view.setUint16(10, 0, true); // Last mod file time
      view.setUint16(12, 0, true); // Last mod file date
      view.setUint32(14, crc, true); // CRC-32
      view.setUint32(18, dataBytes.length, true); // Compressed size
      view.setUint32(22, dataBytes.length, true); // Uncompressed size
      view.setUint16(26, nameBytes.length, true); // File name length
      view.setUint16(28, 0, true); // Extra field length
      localHeader.set(nameBytes, 30);

      parts.push(localHeader);
      parts.push(dataBytes);

      fileEntries.push({
        nameBytes,
        dataBytes,
        crc32: crc,
        offset: currentOffset,
      });

      currentOffset += localHeader.length + dataBytes.length;
    }

    // Central Directory
    const cdOffset = currentOffset;
    let cdSize = 0;

    for (const entry of fileEntries) {
      const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
      const view = new DataView(cdHeader.buffer);

      view.setUint32(0, 0x02014b50, true); // Central directory signature
      view.setUint16(4, 20, true); // Version made by
      view.setUint16(6, 20, true); // Version needed to extract
      view.setUint16(8, 0x0800, true); // Bit flag (UTF-8)
      view.setUint16(10, 0, true); // Compression method
      view.setUint16(12, 0, true); // Time
      view.setUint16(14, 0, true); // Date
      view.setUint32(16, entry.crc32, true); // CRC-32
      view.setUint32(20, entry.dataBytes.length, true); // Compressed size
      view.setUint32(24, entry.dataBytes.length, true); // Uncompressed size
      view.setUint16(28, entry.nameBytes.length, true); // Name length
      view.setUint16(30, 0, true); // Extra field length
      view.setUint16(32, 0, true); // Comment length
      view.setUint16(34, 0, true); // Disk number start
      view.setUint16(36, 0, true); // Internal file attributes
      view.setUint32(38, 0, true); // External file attributes
      view.setUint32(42, entry.offset, true); // Relative offset of local header
      cdHeader.set(entry.nameBytes, 46);

      parts.push(cdHeader);
      cdSize += cdHeader.length;
    }

    // End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
    eocdView.setUint16(4, 0, true); // Disk number
    eocdView.setUint16(6, 0, true); // Disk with central directory
    eocdView.setUint16(8, fileEntries.length, true); // Entries on disk
    eocdView.setUint16(10, fileEntries.length, true); // Total entries
    eocdView.setUint32(12, cdSize, true); // Size of central directory
    eocdView.setUint32(16, cdOffset, true); // Offset of start of central directory
    eocdView.setUint16(20, 0, true); // Zip comment length

    parts.push(eocd);

    return new Blob(parts as any, { type: 'application/zip' });
  }

  /**
   * Convert an image File or Image URL to target format & quality using HTML Canvas
   */
  public static async convertAndCompressImage(
    source: File | Blob | string,
    options: ImageConversionOptions
  ): Promise<{ blob: Blob; dataUrl: string; objectUrl: string; sizeBytes: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (options.maxWidth && width > options.maxWidth) {
          if (options.preserveAspectRatio !== false) {
            height = Math.round((height * options.maxWidth) / width);
          }
          width = options.maxWidth;
        }

        if (options.maxHeight && height > options.maxHeight) {
          if (options.preserveAspectRatio !== false) {
            width = Math.round((width * options.maxHeight) / height);
          }
          height = options.maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Fill white background for transparent PNG to JPEG conversions
        if (options.targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const quality = options.quality ?? 0.85;
        const dataUrl = canvas.toDataURL(options.targetFormat, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to Blob'));
              return;
            }
            const objectUrl = URL.createObjectURL(blob);
            resolve({
              blob,
              dataUrl,
              objectUrl,
              sizeBytes: blob.size,
              width,
              height,
            });
          },
          options.targetFormat,
          quality
        );
      };

      img.onerror = (err) => {
        reject(new Error('Failed to load image for conversion: ' + err));
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(source);
      }
    });
  }

  /**
   * Convert JSON text to CSV string
   */
  public static jsonToCsv(jsonContent: string): string {
    try {
      const parsed = JSON.parse(jsonContent);
      const array = Array.isArray(parsed) ? parsed : [parsed];
      if (array.length === 0) return '';

      const headers = Object.keys(array[0]);
      const csvRows: string[] = [];
      csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

      for (const row of array) {
        const values = headers.map((header) => {
          const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    } catch (e: any) {
      throw new Error('שגיאה בהמרת JSON ל-CSV: ' + e.message);
    }
  }

  /**
   * Convert CSV text to JSON string
   */
  public static csvToJson(csvContent: string): string {
    try {
      const lines = csvContent.trim().split(/\r?\n/);
      if (lines.length < 2) return '[]';

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const result: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',').map((val) => val.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          obj[header] = currentLine[index] || '';
        });
        result.push(obj);
      }

      return JSON.stringify(result, null, 2);
    } catch (e: any) {
      throw new Error('שגיאה בהמרת CSV ל-JSON: ' + e.message);
    }
  }

  /**
   * Classify file into MediaType based on filename and mimeType
   */
  public static detectFileType(fileName: string, mimeType?: string): { type: MediaType; mimeType: string } {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mime = (mimeType || '').toLowerCase();

    // 1. Video
    if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', '3gp', 'wmv', 'flv'].includes(ext) || mime.startsWith('video/')) {
      return { type: 'video', mimeType: mime || 'video/mp4' };
    }

    // 2. Image
    if (
      ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'bmp', 'ico', 'tiff', 'heic'].includes(ext) ||
      mime.startsWith('image/')
    ) {
      return { type: 'image', mimeType: mime || 'image/png' };
    }

    // 3. Audio
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma', 'opus', 'mid'].includes(ext) || mime.startsWith('audio/')) {
      return { type: 'audio', mimeType: mime || 'audio/mp3' };
    }

    // 4. Document
    if (
      ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(ext) ||
      mime.includes('pdf') ||
      mime.includes('word') ||
      mime.includes('excel') ||
      mime.includes('presentation') ||
      mime.includes('officedocument')
    ) {
      return { type: 'document', mimeType: mime || 'application/pdf' };
    }

    // 5. Archive / Compressed
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'].includes(ext) || mime.includes('zip') || mime.includes('tar') || mime.includes('compressed')) {
      return { type: 'archive', mimeType: mime || 'application/zip' };
    }

    // 6. Code / Data
    if (
      ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'scss', 'py', 'sql', 'sh', 'xml', 'yaml', 'yml', 'md', 'csv'].includes(ext) ||
      mime.includes('javascript') ||
      mime.includes('json') ||
      mime.includes('xml') ||
      mime.includes('text/')
    ) {
      return { type: 'code', mimeType: mime || 'text/plain' };
    }

    return { type: 'other', mimeType: mime || 'application/octet-stream' };
  }

  /**
   * Helper to trigger client-side download of a file/blob
   */
  public static downloadMedia(urlOrBlob: string | Blob, fileName: string) {
    const a = document.createElement('a');
    let url: string;
    if (urlOrBlob instanceof Blob) {
      url = URL.createObjectURL(urlOrBlob);
    } else {
      url = urlOrBlob;
    }
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (urlOrBlob instanceof Blob) {
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }

  /**
   * Format bytes into readable string (Bytes, KB, MB, GB, TB)
   */
  public static formatBytes(bytes: number, decimals: number = 1): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
