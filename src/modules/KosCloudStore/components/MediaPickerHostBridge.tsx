import React, { useState, useEffect, useCallback } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract, MediaPickerOptions } from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';
import { MediaPickerModal } from './MediaPickerModal';
import { MediaItem, MediaType } from '../types';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export interface MediaPickerHostBridgeProps {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
}

export const MediaPickerHostBridge: React.FC<MediaPickerHostBridgeProps> = ({ firebaseApp: propFirebaseApp, db: propDb }) => {
  const systemConn = useSystemConnection();
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

  useEffect(() => {
    const implementation: MediaPickerContract = {
      openPicker,
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
  }, [openPicker, registerCapability, unregisterCapability]);

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
        resolver.resolve(items.map((i) => i.url));
      } else {
        resolver.resolve(items[0]?.url || null);
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
