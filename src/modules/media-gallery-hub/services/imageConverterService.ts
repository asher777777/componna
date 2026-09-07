import { ImageConversionOptions } from '../types';

export class ImageConverterService {
  /**
   * Convert an image File or Image URL to target format & quality using HTML Canvas
   */
  static async convertImage(
    source: File | string,
    options: ImageConversionOptions
  ): Promise<{ blob: Blob; dataUrl: string; objectUrl: string; sizeBytes: number }> {
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
        canvas.width = width;
        canvas.height = height;

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
   * Helper to trigger client-side download of a file/blob
   */
  static downloadMedia(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Format bytes into readable string (KB, MB, GB)
   */
  static formatBytes(bytes: number, decimals: number = 1): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}