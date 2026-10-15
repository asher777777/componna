/**
 * Backward compatibility forwarding layer.
 * All core implementations are maintained in src/modules/KosCloudStore
 */
export * from '../KosCloudStore';
export {
  KosCloudStoreStandaloneView,
  KosCloudStoreStandaloneView as default,
  MediaGalleryHubStandaloneView,
} from '../KosCloudStore';