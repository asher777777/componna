import React from 'react';
import { KosLiveProvider } from './context/KosLiveContext';
import { KosLiveRoutes } from './routes/KosLiveRoutes';

export interface KosLiveStandaloneViewProps {
  initialTab?: 'projects' | 'converter' | 'wizard' | 'timeline' | 'preview' | 'embed';
}

export const KosLiveStandaloneView: React.FC<KosLiveStandaloneViewProps> = () => {
  return (
    <KosLiveProvider>
      <KosLiveRoutes />
    </KosLiveProvider>
  );
};

export default KosLiveStandaloneView;
