import { useState, useCallback } from 'react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { BackgroundRemovalService, BackgroundRemovalOptions } from '../services/backgroundRemovalService';
import { MediaItem } from '../types';

export interface ImageCropArea {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

export function useFileEditor() {
  const { replaceMediaItem, addMediaItems } = useMediaGallery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Apply image transformations: Rotate, Flip, Crop, Watermark, and save as new or replace
   */
  const transformImage = useCallback(
    async (
      item: MediaItem,
      options: {
        rotation?: number; // 0, 90, 180, 270
        flipH?: boolean;
        flipV?: boolean;
        crop?: ImageCropArea;
        watermarkUrl?: string;
        watermarkOpacity?: number;
        watermarkPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
        asNewItem?: boolean;
      }
    ) => {
      setIsProcessing(true);
      setError(null);

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('טעינת התמונה לעריכה נכשלה'));
          img.src = item.url;
        });

        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        const rotation = (options.rotation || 0) % 360;
        const isSwapped = rotation === 90 || rotation === 270;

        const canvas = document.createElement('canvas');
        canvas.width = isSwapped ? origH : origW;
        canvas.height = isSwapped ? origW : origH;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('לא ניתן לאתחל Canvas 2D');

        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
        ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
        ctx.restore();

        // Apply Crop if specified
        let finalCanvas = canvas;
        if (options.crop) {
          const cropCanvas = document.createElement('canvas');
          const cropX = (options.crop.x / 100) * canvas.width;
          const cropY = (options.crop.y / 100) * canvas.height;
          const cropW = (options.crop.width / 100) * canvas.width;
          const cropH = (options.crop.height / 100) * canvas.height;

          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cropCtx = cropCanvas.getContext('2d');
          if (cropCtx) {
            cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            finalCanvas = cropCanvas;
          }
        }

        // Apply Watermark if specified
        if (options.watermarkUrl) {
          try {
            const wmImg = new Image();
            wmImg.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
              wmImg.onload = resolve;
              wmImg.onerror = resolve; // don't block if watermark fails
              wmImg.src = options.watermarkUrl!;
            });

            if (wmImg.complete && wmImg.naturalWidth) {
              const wmCtx = finalCanvas.getContext('2d');
              if (wmCtx) {
                wmCtx.save();
                wmCtx.globalAlpha = options.watermarkOpacity ?? 0.8;

                const maxWmWidth = finalCanvas.width * 0.25;
                const aspect = wmImg.naturalHeight / wmImg.naturalWidth;
                const wmW = maxWmWidth;
                const wmH = maxWmWidth * aspect;
                const margin = finalCanvas.width * 0.03;

                let wx = margin;
                let wy = finalCanvas.height - wmH - margin;

                if (options.watermarkPosition === 'bottom-left') {
                  wx = margin;
                  wy = finalCanvas.height - wmH - margin;
                } else if (options.watermarkPosition === 'top-left') {
                  wx = margin;
                  wy = margin;
                } else if (options.watermarkPosition === 'top-right') {
                  wx = finalCanvas.width - wmW - margin;
                  wy = margin;
                } else if (options.watermarkPosition === 'center') {
                  wx = (finalCanvas.width - wmW) / 2;
                  wy = (finalCanvas.height - wmH) / 2;
                } else {
                  // bottom-right default
                  wx = finalCanvas.width - wmW - margin;
                  wy = finalCanvas.height - wmH - margin;
                }

                wmCtx.drawImage(wmImg, wx, wy, wmW, wmH);
                wmCtx.restore();
              }
            }
          } catch (wmErr) {
            console.warn('[useFileEditor] Watermark render note:', wmErr);
          }
        }

        // Create Blob and save
        const blob = await new Promise<Blob>((resolve) => {
          finalCanvas.toBlob((b) => resolve(b || new Blob()), 'image/png', 0.95);
        });

        const newObjectUrl = URL.createObjectURL(blob);
        const timeStamp = Date.now();

        if (options.asNewItem) {
          const newItem: MediaItem = {
            id: `edited_${timeStamp}_${Math.random().toString(36).slice(2, 6)}`,
            name: `ערוך_${item.name}`,
            type: 'image',
            mimeType: 'image/png',
            url: newObjectUrl,
            sizeBytes: blob.size,
            width: finalCanvas.width,
            height: finalCanvas.height,
            extension: 'png',
            createdAt: timeStamp,
            updatedAt: timeStamp,
            folderId: item.folderId,
            tags: [...(item.tags || []), 'עריכה'],
            sourceModule: item.sourceModule,
            sourceModuleLabel: item.sourceModuleLabel,
          };
          await addMediaItems([newItem], [blob]);
        } else {
          const updatedItem: MediaItem = {
            ...item,
            url: newObjectUrl,
            sizeBytes: blob.size,
            width: finalCanvas.width,
            height: finalCanvas.height,
            mimeType: 'image/png',
            updatedAt: timeStamp,
          };
          await replaceMediaItem(item.id, updatedItem, blob);
        }
      } catch (err: any) {
        console.error('[useFileEditor] Transformation failed:', err);
        setError(err.message || 'שגיאה בעריכת התמונה');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [replaceMediaItem, addMediaItems]
  );

  /**
   * Remove background using BackgroundRemovalService
   */
  const removeBackground = useCallback(
    async (item: MediaItem, options: BackgroundRemovalOptions = {}, asNewItem: boolean = true) => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await BackgroundRemovalService.removeBackground(item.url, options);
        const timeStamp = Date.now();

        if (asNewItem) {
          const newItem: MediaItem = {
            id: `nobg_${timeStamp}_${Math.random().toString(36).slice(2, 6)}`,
            name: `ללא_רקע_${item.name.replace(/\.[^/.]+$/, '')}.png`,
            type: 'image',
            mimeType: 'image/png',
            url: result.dataUrl,
            sizeBytes: result.blob.size,
            width: result.width,
            height: result.height,
            extension: 'png',
            createdAt: timeStamp,
            updatedAt: timeStamp,
            folderId: item.folderId,
            tags: [...(item.tags || []), 'ללא_רקע'],
            sourceModule: item.sourceModule,
          };
          await addMediaItems([newItem], [result.blob]);
        } else {
          const updatedItem: MediaItem = {
            ...item,
            url: result.dataUrl,
            sizeBytes: result.blob.size,
            width: result.width,
            height: result.height,
            mimeType: 'image/png',
            updatedAt: timeStamp,
          };
          await replaceMediaItem(item.id, updatedItem, result.blob);
        }
      } catch (err: any) {
        console.error('[useFileEditor] Remove background error:', err);
        setError(err.message || 'שגיאה בהסרת רקע');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [addMediaItems, replaceMediaItem]
  );

  /**
   * Save plain text / markdown file
   */
  const saveTextDocument = useCallback(
    async (
      title: string,
      content: string,
      folderId: string | null = null,
      existingId?: string
    ) => {
      setIsProcessing(true);
      setError(null);

      try {
        const cleanTitle = title.trim().endsWith('.txt') || title.trim().endsWith('.md')
          ? title.trim()
          : `${title.trim()}.txt`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const localUrl = URL.createObjectURL(blob);
        const timeStamp = Date.now();
        const ext = cleanTitle.split('.').pop() || 'txt';

        if (existingId) {
          const updatedItem: MediaItem = {
            id: existingId,
            name: cleanTitle,
            type: 'code',
            mimeType: 'text/plain',
            url: localUrl,
            sizeBytes: blob.size,
            extension: ext,
            extractedText: content,
            createdAt: timeStamp,
            updatedAt: timeStamp,
            folderId,
            tags: ['מסמך', 'טקסט'],
          };
          await replaceMediaItem(existingId, updatedItem, blob);
        } else {
          const newItem: MediaItem = {
            id: `doc_${timeStamp}_${Math.random().toString(36).slice(2, 6)}`,
            name: cleanTitle,
            type: 'code',
            mimeType: 'text/plain',
            url: localUrl,
            sizeBytes: blob.size,
            extension: ext,
            extractedText: content,
            createdAt: timeStamp,
            updatedAt: timeStamp,
            folderId,
            tags: ['מסמך', 'טקסט'],
            sourceModule: 'media-gallery-hub',
            sourceModuleLabel: 'עורך פתקים ומסמכים',
          };
          await addMediaItems([newItem], [blob]);
        }
      } catch (err: any) {
        console.error('[useFileEditor] Save text document error:', err);
        setError(err.message || 'שגיאה בשמירת המסמך');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [addMediaItems, replaceMediaItem]
  );

  return {
    isProcessing,
    error,
    transformImage,
    removeBackground,
    saveTextDocument,
  };
}
