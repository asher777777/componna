/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 10: Module Barrel Export
 */

export * from './types';
export * from './config';
export * from './context/ModuleContext';
export * from './hooks/useBoardComposerData';
export * from './hooks/useBoardComposerActions';
export * from './services/geminiDashboardAiService';
export * from './services/dashboardFirestoreService';
export * from './api/functionsApi';
export * from './prompts';
export * from './routes/ModuleRoutes';
export * from './StandaloneView';

export { KosunBoardForgeView } from './components/KosunBoardForgeView';
export { DynamicCustomDashboardView } from './components/DynamicCustomDashboardView';
export { AudienceSelector } from './components/AudienceSelector';
export { ModuleCapabilityPicker } from './components/ModuleCapabilityPicker';
export { LiveCollectionMetricCard } from './components/LiveCollectionMetricCard';
export { QuickActionsWidget } from './components/QuickActionsWidget';
export { SubdomainPairingModal } from './components/SubdomainPairingModal';
