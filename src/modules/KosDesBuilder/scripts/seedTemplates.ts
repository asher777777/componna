import { INITIAL_DASHBOARD } from '../config';

/**
 * Seed script for default dashboard templates
 */
export async function seedDashboardTemplates() {
  console.log('[KosDesBuilder] Default dashboard template ready:', INITIAL_DASHBOARD.id);
  return INITIAL_DASHBOARD;
}
