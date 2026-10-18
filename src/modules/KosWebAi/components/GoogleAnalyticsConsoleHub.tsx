/**
 * GoogleAnalyticsConsoleHub
 * Adapter delegating to the unified KoSeoPowerEngin module.
 */

import React from 'react';
import { KoSeoPowerEnginStandaloneView } from '../../KoSeoPowerEngin';

export interface GoogleAnalyticsConsoleHubProps {
  onBackToPages?: () => void;
}

export const GoogleAnalyticsConsoleHub: React.FC<GoogleAnalyticsConsoleHubProps> = ({
  onBackToPages,
}) => {
  return <KoSeoPowerEnginStandaloneView onBackToPages={onBackToPages} />;
};

export default GoogleAnalyticsConsoleHub;
