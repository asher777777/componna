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

    return () => {
      unregisterCapability('media-picker');
      unregisterCapability('KosCloudStore');
      unregisterCapability('cloud-store');
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

  const handleClose = () => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(null);
      setResolver(null);
    }
  };

  const handleSelect = (items: MediaItem[]) => {
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
        <MediaPickerModal
          isOpen={true}
          onClose={handleClose}
          allowedTypes={undefined}
          maxSelectCount={options?.multiple ? options.maxFiles || 10 : 1}
          onSelectMedia={handleSelect}
          firebaseApp={firebaseApp}
          db={db}
        />
      )}
    </>
  );
};
