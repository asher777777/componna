import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainView } from '../components/MainView';
import { ItemForm } from '../components/ItemForm';
import { ItemDetail } from '../components/ItemDetail';

export const TemplateModuleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<MainView />} />
      <Route path="new" element={<ItemForm />} />
      <Route path=":id" element={<ItemDetail />} />
    </Routes>
  );
};
