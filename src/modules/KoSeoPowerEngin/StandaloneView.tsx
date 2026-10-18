/**
 * KoSeoPowerEngin - Standalone View
 * KOSUN26 Root Standalone Entrypoint
 */

import React from 'react';
import { KoSeoPowerProvider } from './context/KoSeoPowerContext';
import { KoSeoPowerHub } from './components/KoSeoPowerHub';

export interface KoSeoPowerEnginStandaloneViewProps {
  onBackToPages?: () => void;
}

export const KoSeoPowerEnginStandaloneView: React.FC<KoSeoPowerEnginStandaloneViewProps> = ({
  onBackToPages,
}) => {
  return (
    <KoSeoPowerProvider>
      <KoSeoPowerHub onBackToPages={onBackToPages} />
    </KoSeoPowerProvider>
  );
};

export default KoSeoPowerEnginStandaloneView;
