import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { KosAccessWidget } from './components/KosAccessWidget';
import { KosAccessStatementModal } from './components/KosAccessStatementModal';
import { KosAccessAdminView } from './views/KosAccessAdminView';

// Register official UI Capabilities for KOSUN26
registerCapabilityUI('kos-accessibility-toolbar', KosAccessWidget);
registerCapabilityUI('kos-accessibility-widget', KosAccessWidget);
registerCapabilityUI('kos-accessibility-statement', KosAccessStatementModal);
registerCapabilityUI('kos-accessibility-admin', KosAccessAdminView);

export { KosAccessStandaloneView, default } from './StandaloneView';
export type { KosAccessStandaloneViewProps } from './StandaloneView';
export * from './types';
export * from './config';
export * from './services';
export * from './context';
export * from './hooks';
export * from './components';
export * from './views';
export * from './routes';
