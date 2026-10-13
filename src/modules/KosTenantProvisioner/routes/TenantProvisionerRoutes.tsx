import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TenantProvisionerView } from '../views/TenantProvisionerView';

export const TenantProvisionerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<TenantProvisionerView />} />
      <Route path="*" element={<TenantProvisionerView />} />
    </Routes>
  );
};
