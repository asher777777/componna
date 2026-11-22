import React, { useState, useEffect, useCallback } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract, MediaPickerOptions, SaveGeneratedMediaOptions } from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';
import { MediaPickerModal } from './MediaPickerModal';
import { MediaItem, MediaType } from '../types';
import { resolveSafeMediaUrl } from '../utils/mediaUrlSanitizer';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { FirebaseStorageMediaService } from '../services/firebaseStorageMediaService';
import { FirestoreMediaService } from '../services/firestoreMediaService';
import { resolveCurrentTenantId } from '../../../core/tenant/tenantResolver';
import { useTenantScope } from '../../../core/tenant';

export interface MediaPickerHostBridgeProps {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
}

export const MediaPickerHostBridge: React.FC<MediaPickerHostBridgeProps> = ({ firebaseApp: propFirebaseApp, db: propDb }) => {
  const systemConn = useSystemConnection();
  const { getScopedCollectionPath } = useTenantScope();
  const firebaseApp = propFirebaseApp || systemConn.firebaseApp;
  const db = propDb || systemConn.db;
  const { registerCapability, unregisterCapability } = useHostCapabilities();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<MediaPickerOptions | undefined>();
  const [resolver, setResolver] = useState<{
    resolve: (val: string | string[] | null) => void;
  } | null>(null);

  const openPicker = useCallback((opts?: MediaPickerOptions): Promise<string | string[] | null> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const saveGeneratedImage = useCallback(
    async (opts: SaveGeneratedMediaOptions): Promise<string | null> => {
      if (!opts?.imageUrl) return null;
      const activeTenant =
        (typeof window !== 'undefined' ? resolveCurrentTenantId() : '_master') || '_master';
      const safeName = (opts.name || `KosWebAi_${Date.now()}.png`).replace(/[^\u0590-\u05FFa-zA-Z0-9._-]/g, '_');
      const finalName = safeName.includes('.') ? safeName : `${safeName}.png`;

      let file: File | null = null;
      let mimeType = 'image/png';
      if (opts.imageUrl.startsWith('data:')) {
        try {
          const [meta, b64] = opts.imageUrl.split(',');
          const mimeMatch = meta.match(/data:([^;]+)/);
          mimeType = mimeMatch?.[1] || 'image/png';
          const byteChars = atob(b64);
          const byteNums = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNums[i] = byteChars.charCodeAt(i);
          }
          const blob = new Blob([new Uint8Array(byteNums)], { type: mimeType });
          file = new File([blob], finalName, { type: mimeType });
        } catch (err) {
          console.warn('[MediaPickerHostBridge] Failed converting dataUrl to File:', err);
        }
      }

      let storageUrl = opts.imageUrl;
      if (firebaseApp && file) {
        try {
          storageUrl = await FirebaseStorageMediaService.uploadFileToStorage(
            firebaseApp,
            file,
            finalName,
            undefined,
            undefined,
            activeTenant
          );
        } catch (storageErr) {
          console.warn('[MediaPickerHostBridge] Storage upload fallback:', storageErr);
        }
      }

      const newMediaItem: MediaItem = {
        id: `kosai_img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: finalName,
        type: 'image',
        mimeType,
        url: storageUrl,
        thumbnailUrl: storageUrl,
        sizeBytes: file ? file.size : 250000,
        width: opts.width || 1600,
        height: opts.height || 900,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description: opts.description || '',
        tags: opts.tags || ['AI', 'KosWebAi'],
        sourceModule: opts.sourceModule || 'KosWebAi',
        sourceModuleLabel: opts.sourceModuleLabel || 'יוצר עמודים AI',
        tenantId: activeTenant,
        metadata: {
          model: opts.model || 'gemini-3.1-flash-image',
          aspectRatio: opts.aspectRatio || '16:9',
          tenantId: activeTenant,
        },
      };

      if (db) {
        try {
          const targetCollections = {
            mediaItems: getScopedCollectionPath('sdo_media_items'),
            folders: getScopedCollectionPath('sdo_media_folders'),
          };
          await FirestoreMediaService.saveMediaItem(db, targetCollections, newMediaItem);
        } catch (fsErr) {
          console.warn('[MediaPickerHostBridge] Firestore media save notice:', fsErr);
        }
      }

      try {
        const storageKey =
          activeTenant === '_master'
            ? 'kosun_media_gallery_items'
            : `kosun_${activeTenant}_media_gallery_items`;
        const existing = localStorage.getItem(storageKey);
        const parsed: MediaItem[] = existing ? JSON.parse(existing) : [];
        if (!parsed.some((it) => it.id === newMediaItem.id)) {
          parsed.unshift(newMediaItem);
          localStorage.setItem(storageKey, JSON.stringify(parsed));
        }
      } catch {
        // ignore localStorage errors
      }

      return storageUrl;
    },
    [firebaseApp, db]
  );

  useEffect(() => {
    const implementation: MediaPickerContract = {
      openPicker,
      saveGeneratedImage,
    };
    registerCapability('media-picker', implementation);
    registerCapability('KosCloudStore', implementation);
    registerCapability('cloud-store', implementation);
    registerCapability('community-gallery', implementation);

    return () => {
      unregisterCapability('media-picker');
      unregisterCapability('KosCloudStore');
      unregisterCapability('cloud-store');
      unregisterCapability('community-gallery');
    };
  }, [openPicker, saveGeneratedImage, registerCapability, unregisterCapability]);

  useEffect(() => {
    const unsubPicker = eventBus.subscribe('media:request_picker', async (payload: any) => {
      const selected = await openPicker({ accept: 'image/*', multiple: false });
      if (selected && typeof payload?.onSelect === 'function') {
        payload.onSelect(selected);
      }
    });

    const unsubCloudStore = (eventBus.subscribe as any)('cloud_store:request_picker', async (payload: any) => {
      const selected = await openPicker(payload?.options || { accept: '*/*', multiple: false });
      if (selected && typeof payload?.onSelect === 'function') {
        payload.onSelect(selected);
      }
    });

    return () => {
      unsubPicker();
      unsubCloudStore();
    };
  }, [openPicker]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setValidationError(null);
    if (resolver) {
      resolver.resolve(null);
      setResolver(null);
    }
  };

  const handleSelect = (items: MediaItem[]) => {
    setValidationError(null);

    if (options?.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      const invalidType = items.find((item) => {
        const mime = (item.mimeType || '').toLowerCase();
        const ext = (item.extension || item.name || item.url || '').toLowerCase();
        const isJpgAllowed = options.allowedMimeTypes!.some((m) => m.includes('jpeg') || m.includes('jpg'));
        if (isJpgAllowed) {
          const isMimeJpg = mime === 'image/jpeg' || mime === 'image/jpg';
          const isExtJpg = /\.(jpg|jpeg)(\?.*)?$/i.test(ext);
          return !(isMimeJpg || isExtJpg);
        }
        return !options.allowedMimeTypes!.includes(mime);
      });

      if (invalidType) {
        setValidationError('שגיאה: יש לבחור קובץ בפורמט JPG בלבד (.jpg / .jpeg) עבור תמונת שיתוף ברשתות.');
        return;
      }
    }

    if (options?.maxSizeBytes && options.maxSizeBytes > 0) {
      const maxKb = Math.round(options.maxSizeBytes / 1024);
      const tooLarge = items.find((item) => item.sizeBytes && item.sizeBytes > options.maxSizeBytes!);
      if (tooLarge) {
        const actualKb = Math.round(tooLarge.sizeBytes / 1024);
        setValidationError(`שגיאה: הקובץ שנבחר שוקל ${actualKb}KB. המשקל המקסימלי המותר הוא עד ${maxKb}KB.`);
        return;
      }
    }

    setIsOpen(false);
    if (resolver) {
      if (options?.multiple) {
        resolver.resolve(items.map((i) => resolveSafeMediaUrl(i.url, i)));
      } else {
        const first = items[0];
        resolver.resolve(first ? resolveSafeMediaUrl(first.url, first) : null);
      }
      setResolver(null);
    }
  };

  // Allow all media types in picker so user can view/select images, videos and audio freely
  return (
    <>
      {isOpen && (
        <>
          {validationError && (
            <div
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rose-400 flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-3"
              dir="rtl"
            >
              <span>{validationError}</span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs"
              >
                סגור
              </button>
            </div>
          )}
          <MediaPickerModal
            isOpen={true}
            onClose={handleClose}
            allowedTypes={undefined}
            initialTab={options?.initialTab}
            maxSelectCount={options?.multiple ? options.maxFiles || 10 : 1}
            onSelectMedia={handleSelect}
            firebaseApp={firebaseApp}
            db={db}
          />
        </>
      )}
    </>
  );
};
