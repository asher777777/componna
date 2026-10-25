import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { KosTimeStandaloneView } from './StandaloneView';
import { KosTimeMainView } from './views/KosTimeMainView';

// Register official UI Capabilities for KOSUN26
registerCapabilityUI('kostime-manager', KosTimeMainView);
registerCapabilityUI('kos-time-app', KosTimeMainView);

export { KosTimeStandaloneView, default } from './StandaloneView';
export type { KosTimeStandaloneViewProps } from './StandaloneView';
export * from './types';
export * from './services/kosTimeFirestoreService';
export * from './services/kosTimeAiService';
export * from './services/soundService';
export * from './context/KosTimeContext';
export * from './hooks/useKosTimeTenant';
export * from './views/KosTimeMainView';
export * from './routes/KosTimeRoutes';
