import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CrmGroupsProvider } from '../context/CrmGroupsContext';
import { CrmGroupsMainView } from '../components/CrmGroupsMainView';
import { CrmGroupsModuleProps } from '../types';

export const CrmGroupsRoutes: React.FC<CrmGroupsModuleProps> = (props) => {
  return (
    <CrmGroupsProvider {...props}>
      <Routes>
        <Route path="/" element={<CrmGroupsMainView />} />
        <Route path="*" element={<CrmGroupsMainView />} />
      </Routes>
    </CrmGroupsProvider>
  );
};
