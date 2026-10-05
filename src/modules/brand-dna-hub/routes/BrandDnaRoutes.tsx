import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrandDnaProvider } from '../context/BrandDnaContext';
import { BrandDnaContent } from '../StandaloneView';

export const BrandDnaRoutes: React.FC = () => {
  return (
    <BrandDnaProvider>
      <Routes>
        <Route path="" element={<BrandDnaContent initialTab="identity" />} />
        <Route path="identity" element={<BrandDnaContent initialTab="identity" />} />
        <Route path="voice" element={<BrandDnaContent initialTab="voice" />} />
        <Route path="audience" element={<BrandDnaContent initialTab="audience" />} />
        <Route path="design" element={<BrandDnaContent initialTab="design" />} />
        <Route path="trust" element={<BrandDnaContent initialTab="trust" />} />
        <Route path="*" element={<BrandDnaContent initialTab="identity" />} />
      </Routes>
    </BrandDnaProvider>
  );
};
