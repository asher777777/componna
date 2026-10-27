/**
 * KOSUN AM (קושאן מייל אוטומטי) - Module Barrel Export
 * 12-Layer Scaffolding Layer 10: Public API, Types, Services, Context & Components
 */

export * from './types';
export * from './config';
export * from './context/ModuleContext';
export * from './hooks/useKosunAmData';
export * from './hooks/useKosunAmActions';
export * from './services/emailFirestoreService';
export * from './services/emailDispatchService';
export * from './services/kosaiEmailAiService';
export * from './api/functionsApi';
export * from './prompts';
export * from './routes/ModuleRoutes';
export * from './StandaloneView';

// Public Components
export { KosunAmMainView } from './components/KosunAmMainView';
export { EmailEditorModal } from './components/EmailEditorModal';
export { AutomationBuilderView } from './components/AutomationBuilderView';
export { CampaignListCard } from './components/CampaignListCard';
export { DeliveryLogsDrawer } from './components/DeliveryLogsDrawer';
