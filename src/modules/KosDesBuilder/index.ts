import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { DashboardPageRenderer } from './components/DashboardPageRenderer';

// Register official UI Capabilities for KOSUN26
registerCapabilityUI('dashboard-renderer', DashboardPageRenderer);
registerCapabilityUI('dashboard-builder', DashboardPageRenderer);

export { KosDesBuilderStandaloneView, default } from './StandaloneView';
export type { KosDesBuilderStandaloneViewProps } from './StandaloneView';
export * from './types';
export * from './config';
export * from './services';
export * from './context';
export * from './hooks';
export * from './components';
export * from './views';
export * from './routes';
export * from './sections/sectionRegistry';
