export type {
  DashboardSectionType,
  DashboardStatItem,
  DashboardHeaderConfig,
  DashboardStatsConfig,
  DashboardTableColumn,
  DashboardTableConfig,
  DashboardActionButtonItem,
  DashboardQuickActionsConfig,
  DashboardFloatingDockItem,
  DashboardFloatingDockConfig,
  DashboardCommandMatrixItem,
  DashboardCommandMatrixConfig,
  DashboardSlotWidgetConfig,
  DashboardSectionConfig,
  DashboardSection,
  DashboardPageDocument,
  DashboardDataFeedContract,
  KosDesBuilderContract,
} from '../../../core/contracts';

export type BuilderPreviewDevice = 'desktop' | 'mobile';

export interface KosDesBuilderState {
  currentDashboard: import('../../../core/contracts').DashboardPageDocument | null;
  savedDashboards: import('../../../core/contracts').DashboardPageDocument[];
  selectedSectionId: string | null;
  previewDevice: BuilderPreviewDevice;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
