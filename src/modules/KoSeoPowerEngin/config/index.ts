/**
 * KoSeoPowerEngin - Configuration & Defaults
 * KOSUN26 Modular Layer: Config
 * 
 * Clean production defaults without dummy mock data.
 */

import { DomainGoogleIntegrationsConfig, SearchConsoleQueryMetric, TrafficSourceMetric } from '../types';

export const DEFAULT_MASTER_DOMAIN = 'kosun.pro';

export const DEFAULT_SEO_POWER_CONFIG: DomainGoogleIntegrationsConfig = {
  masterDomain: DEFAULT_MASTER_DOMAIN,
  googleAnalyticsId: '',
  googleTagManagerId: 'GTM-WDDMHZJQ',
  googleSearchConsoleVerification: '',
  googleSearchConsolePropertyUrl: `sc-domain:${DEFAULT_MASTER_DOMAIN}`,
  autoCascadingToSubdomains: true,
  cookieDomainAuto: true,
  dnsTxtRecord: '',
  status: 'unconfigured',
};

// Clean empty array - populated only from real telemetry / GSC queries
export const DEFAULT_SEARCH_QUERIES: SearchConsoleQueryMetric[] = [];

// Clean initial distribution - populated from real traffic sources
export const DEFAULT_TRAFFIC_SOURCES: TrafficSourceMetric[] = [
  { name: 'Direct (ישיר)', sessions: 0, percentage: 0, color: 'bg-indigo-500' },
  { name: 'Organic Search (חיפוש אורגני)', sessions: 0, percentage: 0, color: 'bg-emerald-500' },
  { name: 'Social (רשתות חברתיות)', sessions: 0, percentage: 0, color: 'bg-blue-500' },
  { name: 'Referral (הפניות חיצוניות)', sessions: 0, percentage: 0, color: 'bg-purple-500' },
];
