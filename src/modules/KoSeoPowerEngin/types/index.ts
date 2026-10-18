/**
 * KoSeoPowerEngin - Types Definition
 * KOSUN26 Modular Layer: Types
 */

export interface DomainGoogleIntegrationsConfig {
  masterDomain: string;
  googleAnalyticsId: string;
  googleSearchConsoleVerification: string;
  googleSearchConsolePropertyUrl?: string;
  googleTagManagerId?: string;
  autoCascadingToSubdomains: boolean;
  cookieDomainAuto: boolean;
  dnsTxtRecord?: string;
  lastVerifiedAt?: string;
  status: 'active' | 'pending' | 'unconfigured';
}

export interface SearchConsoleQueryMetric {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface TrafficSourceMetric {
  name: string;
  sessions: number;
  percentage: number;
  color: string;
}

export interface SubdomainCoverageItem {
  hostname: string;
  isRoot: boolean;
  pagesCount: number;
  status: 'active' | 'inherited' | 'custom';
  inheritedKey: string;
}

export interface SeoPowerTelemetry {
  views: number;
  uniqueVisitors: number;
  interactions: number;
  leads: number;
  searchImpressions: number;
  searchClicks: number;
  searchCtr: number;
  averagePosition: number;
}

export interface SeoPowerTestStatus {
  success: boolean;
  message: string;
  timestamp: string;
  details?: {
    gaScriptFound?: boolean;
    gtmScriptFound?: boolean;
    gscMetaFound?: boolean;
    activeDomain?: string;
  };
}
