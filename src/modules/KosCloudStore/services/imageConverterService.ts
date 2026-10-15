import { ImageConversionOptions } from '../types';
import { FileCompressionService, ZipFileInput } from './fileCompressionService';

export class ImageConverterService {
  /**
   * Convert an image File or Image URL to target format & quality using HTML Canvas
   */
  static async convertImage(
    source: File | Blob | string,
    options: ImageConversionOptions
  ): Promise<{ blob: Blob; dataUrl: string; objectUrl: string; sizeBytes: number; width?: number; height?: number }> {
    return FileCompressionService.convertAndCompressImage(source, options);
  }

  /**
   * Helper to create client-side ZIP archive
   */
  static async createZipArchive(files: ZipFileInput[]): Promise<Blob> {
    return FileCompressionService.createZipArchive(files);
  }

  /**
   * Helper to trigger client-side download of a file/blob
   */
  static downloadMedia(urlOrBlob: string | Blob, fileName: string) {
    FileCompressionService.downloadMedia(urlOrBlob, fileName);
  }

  /**
   * Format bytes into readable string (KB, MB, GB, TB)
   */
  static formatBytes(bytes: number, decimals: number = 1): string {
    return FileCompressionService.formatBytes(bytes, decimals);
  }
}