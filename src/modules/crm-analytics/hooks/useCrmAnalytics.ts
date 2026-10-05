import { useCrmAnalyticsContext } from '../context/CrmAnalyticsContext';

/**
 * Custom hook to easily access CRM analytics context and state
 */
export function useCrmAnalytics() {
  return useCrmAnalyticsContext();
}
