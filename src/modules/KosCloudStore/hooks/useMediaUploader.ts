import { useState, useCallback } from 'react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaItem, MediaType } from '../types';

export interface UploadOptions {
  folderId?: string | null;
  compressImages?: boolean;
  maxDimension?: number;
  quality?: number;
  targetFormat?: 'image/png' | 'image/jpeg' | 'image/webp';
  tags?: string[];
  sourceModule?: string;
  sourceModuleLabel?: string;
}

export function useMediaUploader() {
  const { addMediaItems } = useMediaGallery();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processAndUploadFiles = useCallback(
    async (files: FileList | File[], options: UploadOptions = {}) => {
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      setIsUploading(true);
      setErrorMessage(null);
      setTotalFiles(fileList.length);
      setCurrentFileIndex(0);
      setUploadProgress(0);

      try {
        const processedItems: MediaItem[] = [];
        const processedBlobs: (File | Blob)[] = [];

        for (let i = 0; i < fileList.length; i++) {
          setCurrentFileIndex(i + 1);
          const originalFile = fileList[i];
          const fileName = originalFile.name;
          const { type: detectedType, mimeType: detectedMime } =
            FileCompressionService.detectFileType(fileName, originalFile.type);

          const timeStamp = Date.now() + i;
          const ext = fileName.split('.').pop()?.toLowerCase() || '';

          let finalBlob: File | Blob = originalFile;
          let width: number | undefined;
          let height: number | undefined;

          // Check if compression is enabled for images
          if (options.compressImages && detectedType === 'image' && originalFile.size > 300 * 1024) {
            try {
              const comp = await FileCompressionService.convertAndCompressImage(originalFile, {
                targetFormat: options.targetFormat || 'image/webp',
                quality: options.quality || 0.85,
                maxWidth: options.maxDimension || 2400,
                maxHeight: options.maxDimension || 2400,
                preserveAspectRatio: true,
              });
              finalBlob = comp.blob;
              width = comp.width;
              height = comp.height;
            } catch (compErr) {
              console.warn('[useMediaUploader] Image compression fallback to original:', compErr);
            }
          }

          // Pre-generate thumbnail for images
          let thumbnailUrl: string | undefined;
          if (detectedType === 'image') {
            try {
              const thumb = await FileCompressionService.generateThumbnail(finalBlob);
              if (thumb?.dataUrl) {
                thumbnailUrl = thumb.dataUrl;
              }
            } catch (thumbErr) {
              console.warn('[useMediaUploader] Thumbnail generation note:', thumbErr);
            }
          }

          const localUrl = URL.createObjectURL(finalBlob);
          const newItem: MediaItem = {
            id: `upload_${timeStamp}_${Math.random().toString(36).slice(2, 8)}`,
            name: fileName,
            type: detectedType as MediaType,
            mimeType: finalBlob.type || detectedMime,
            url: localUrl,
            thumbnailUrl,
            sizeBytes: finalBlob.size,
            width,
            height,
            extension: ext,
            folderId: options.folderId ?? null,
            createdAt: timeStamp,
            updatedAt: Date.now(),
            tags: options.tags || ['upload', detectedType],
            sourceModule: options.sourceModule || 'media-gallery-hub',
            sourceModuleLabel: options.sourceModuleLabel || 'מאגר קבצים וכספת ענן',
          };

          processedItems.push(newItem);
          processedBlobs.push(finalBlob);
        }

        // Upload through Context
        await addMediaItems(processedItems, processedBlobs, (index, pct) => {
          setCurrentFileIndex(index + 1);
          setUploadProgress(pct);
        });

        setUploadProgress(100);
      } catch (err: any) {
        console.error('[useMediaUploader] Upload error:', err);
        setErrorMessage(err.message || 'שגיאה בהעלאת הקבצים');
      } finally {
        setIsUploading(false);
      }
    },
    [addMediaItems]
  );

  return {
    isUploading,
    uploadProgress,
    currentFileIndex,
    totalFiles,
    errorMessage,
    processAndUploadFiles,
  };
}
