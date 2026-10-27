import React from 'react';
import { DbContextProvider } from './context/DbContext';
import { MainView } from './components/MainView';

export const DbCollectionsHubStandaloneView: React.FC = () => {
  return (
    <DbContextProvider>
      <MainView />
    </DbContextProvider>
  );
};
