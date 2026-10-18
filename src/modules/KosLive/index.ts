import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { LivingPlayerContainer } from './components/LivingPlayerContainer';
import { FloatingConciergeWidget } from './components/FloatingConciergeWidget';
import { KosLiveStudioView } from './views/KosLiveStudioView';

// Register official UI Capabilities for KOSUN26
registerCapabilityUI('living-page-player', LivingPlayerContainer);
registerCapabilityUI('flow-player', LivingPlayerContainer); // Backward compatibility for legacy flow player slots
registerCapabilityUI('living-avatar-concierge', FloatingConciergeWidget);
registerCapabilityUI('living-page-studio', KosLiveStudioView);

export { KosLiveStandaloneView, default } from './StandaloneView';
export type { KosLiveStandaloneViewProps } from './StandaloneView';
export * from './types';
export * from './config';
export * from './services/livingStorageService';
export * from './services/pageToLivingConverter';
export * from './services/leadDispatchService';
export * from './context/LivingPlayerContext';
export * from './context/KosLiveContext';
export * from './components/LivingPlayerContainer';
export * from './components/FloatingConciergeWidget';
export * from './components/PageUiSettingsEditor';
export * from './components/LivingVideoLayer';
export * from './components/LivingOverlayManager';
export * from './components/LivingVoiceBubble';
export * from './views/KosLiveStudioView';
export * from './views/LivingPagePublicView';

