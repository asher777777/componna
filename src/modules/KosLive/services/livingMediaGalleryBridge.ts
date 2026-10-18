import { Firestore, doc, setDoc } from 'firebase/firestore';
import { FirebaseStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { MediaPickerContract } from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';

export type GalleryMediaType = 'video' | 'image' | 'audio' | 'document';

export interface UploadToGalleryOptions {
  storage?: FirebaseStorage | null;
  db?: Firestore | null;
  tenantId?: string;
  folderId?: string;
  tags?: string[];
  onProgress?: (progressPct: number) => void;
}

/**
 * Opens the central Media Gallery Picker (`media-picker` / `KosCloudStore`)
 * via HostCapabilities contract with an EventBus fallback.
 */
export async function pickMediaFromGallery(
  getCapability: <T = any>(key: string) => T | null | undefined,
  mediaType: GalleryMediaType = 'image'
): Promise<string | null> {
  const acceptMap: Record<GalleryMediaType, string> = {
    video: 'video/*',
    image: 'image/*',
    audio: 'audio/*',
    document: '*/*'
  };
  const accept = acceptMap[mediaType] || '*/*';

  const picker =
    getCapability<MediaPickerContract>('media-picker') ||
    getCapability<MediaPickerContract>('KosCloudStore') ||
    getCapability<MediaPickerContract>('cloud-store');

  if (picker && typeof picker.openPicker === 'function') {
    try {
      const result = await picker.openPicker({ accept, multiple: false });
      if (!result) return null;
      return Array.isArray(result) ? result[0] || null : result;
    } catch (err) {
      console.warn('[livingMediaGalleryBridge] Picker capability error:', err);
    }
  }

  // Fallback via EventBus if bridge listener is active
  return new Promise<string | null>((resolve) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 60000);

    try {
      (eventBus.publish as any)('cloud_store:request_picker', {
        options: { accept, multiple: false },
        onSelect: (selected: string | string[] | null) => {
          if (!settled) {
            settled = true;
            clearTimeout(timeoutId);
            if (!selected) {
              resolve(null);
            } else {
              resolve(Array.isArray(selected) ? selected[0] || null : selected);
            }
          }
        }
      });
    } catch {
      clearTimeout(timeoutId);
      resolve(null);
    }
  });
}

/**
 * Uploads a file from the user's computer to Firebase Storage (`sdo_media_vault/...`)
 * AND registers the uploaded item in the Media Gallery Firestore collection (`sdo_media_items`)
 * so that every file uploaded in KosLive is automatically available in the Media Gallery.
 */
export async function uploadFileAndSyncToGallery(
  file: File | Blob,
  fileName: string,
  mediaType: GalleryMediaType,
  options: UploadToGalleryOptions = {}
): Promise<{ url: string; mediaId: string }> {
  const { storage, db, tenantId = 'default', tags = [], onProgress } = options;
  const timestamp = Date.now();
  const safeName = (fileName || `media_${timestamp}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const mediaId = `storage_${timestamp}_${safeName.replace(/\./g, '_')}`;

  // Fallback to local object URL if Firebase Storage is not initialized
  if (!storage) {
    const localUrl = URL.createObjectURL(file);
    if (onProgress) onProgress(100);
    return { url: localUrl, mediaId };
  }

  const storagePath = `sdo_media_vault/${timestamp}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  const downloadUrl = await new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });

  // Register the uploaded file inside the Media Gallery (`sdo_media_items`) in Firestore
  if (db) {
    try {
      const mimeType =
        (file as File).type ||
        (mediaType === 'video'
          ? 'video/mp4'
          : mediaType === 'image'
          ? 'image/jpeg'
          : mediaType === 'audio'
          ? 'audio/mpeg'
          : 'application/octet-stream');

      const galleryItemRecord = {
        id: mediaId,
        name: fileName || safeName,
        type: mediaType,
        mimeType,
        url: downloadUrl,
        thumbnailUrl: mediaType === 'image' ? downloadUrl : undefined,
        sizeBytes: file.size || 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        tenantId,
        tags: Array.from(
          new Set(['koslive', 'עמוד_חי', 'firebase_storage', mediaType === 'video' ? 'וידאו' : 'תמונה', ...tags])
        )
      };

      // Clean undefined fields
      const cleanRecord = JSON.parse(JSON.stringify(galleryItemRecord));
      await setDoc(doc(db, 'sdo_media_items', mediaId), cleanRecord, { merge: true });

      // Notify Media Gallery listeners if open
      try {
        (eventBus.publish as any)('media:item_uploaded', cleanRecord);
      } catch {}
    } catch (dbErr) {
      console.warn('[livingMediaGalleryBridge] Saved to Storage, Firestore gallery sync notice:', dbErr);
    }
  }

  return { url: downloadUrl, mediaId };
}
