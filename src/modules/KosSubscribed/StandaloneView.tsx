import React from 'react';
import { KosSubscribedProvider } from './context/KosSubscribedContext';
import { KosSubscribedMainView } from './views/KosSubscribedMainView';

export const KosSubscribedStandaloneView: React.FC = () => {
  return (
    <KosSubscribedProvider>
      <KosSubscribedMainView />
    </KosSubscribedProvider>
  );
};

export const StandaloneView = KosSubscribedStandaloneView;
export default KosSubscribedStandaloneView;
