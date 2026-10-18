/**
 * KoSeoPowerEngin - KOSUN26 Modular Component Entrypoint
 * מנוע SEO, גוגל קונסול ואנליטיקס לדומיין וסאב-דומיינים
 */

import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { KoSeoPowerHub } from './components/KoSeoPowerHub';

// Register official UI Capabilities for KOSUN26
registerCapabilityUI('seo-power-engine', KoSeoPowerHub);
registerCapabilityUI('koseo-power-hub', KoSeoPowerHub);
registerCapabilityUI('google-analytics-console', KoSeoPowerHub);

export { KoSeoPowerEnginStandaloneView, default } from './StandaloneView';
export type { KoSeoPowerEnginStandaloneViewProps } from './StandaloneView';

export * from './types';
export * from './config';
export * from './context';
export * from './hooks';
export * from './services';
export * from './components';
export * from './views';
export * from './routes';
export * from './scripts';
