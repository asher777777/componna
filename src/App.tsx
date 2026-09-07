import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WorkbenchApp } from './workbench/WorkbenchApp';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <WorkbenchApp />
    </BrowserRouter>
  );
};

export default App;
