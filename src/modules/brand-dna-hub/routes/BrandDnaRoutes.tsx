import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrandDnaProvider } from '../context/BrandDnaContext';
import { BrandDnaContent } from '../StandaloneView';

export const BrandDnaRoutes: React.FC = () => {
  return (
    <BrandDnaProvider>
      <Routes>
        <Route path="" element={<BrandDnaContent initialMode="stepper" />} />
        <Route path="wizard" element={<BrandDnaContent initialMode="stepper" />} />
        <Route path="identity" element={<BrandDnaContent initialMode="tabs" initialTab="identity" />} />
        <Route path="voice" element={<BrandDnaContent initialMode="tabs" initialTab="voice" />} />
        <Route path="audience" element={<BrandDnaContent initialMode="tabs" initialTab="audience" />} />
        <Route path="design" element={<BrandDnaContent initialMode="tabs" initialTab="design" />} />
        <Route path="trust" element={<BrandDnaContent initialMode="tabs" initialTab="trust" />} />
        <Route path="*" element={<BrandDnaContent initialMode="stepper" />} />
      </Routes>

    </BrandDnaProvider>
  );
};
