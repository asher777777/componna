/**
 * KOSUN AM (קושאן מייל אוטומטי) - Standalone View Runner
 * 12-Layer Scaffolding Layer 10: Standalone Workbench Entry Point & Provider Wrapper
 */

import React from 'react';
import { KosunAmProvider } from './context/ModuleContext';
import { KosunAmMainView } from './components/KosunAmMainView';
import { KosunAmModuleConfig } from './types';

export interface KosunAmStandaloneViewProps {
  config?: KosunAmModuleConfig;
}

export const KosunAmStandaloneView: React.FC<KosunAmStandaloneViewProps> = ({ config }) => {
  return (
    <div dir="rtl" style={{ textAlign: 'right' }} className="font-heebo">
      <KosunAmProvider config={config}>
        <KosunAmMainView />
      </KosunAmProvider>
    </div>
  );
};

export default KosunAmStandaloneView;
