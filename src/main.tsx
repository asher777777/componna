import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Cleanup script to remove old company names from localStorage and sessionStorage
const cleanupOldNames = () => {
  const oldNamesRegex = /Smart Pro Digital|סמארט פרו דיגיטאל|Componna|קושאן/i;
  
  // Clean localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key);
      if (oldNamesRegex.test(key) || (val && oldNamesRegex.test(val))) {
        localStorage.removeItem(key);
      }
    }
  }

  // Clean sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const val = sessionStorage.getItem(key);
      if (oldNamesRegex.test(key) || (val && oldNamesRegex.test(val))) {
        sessionStorage.removeItem(key);
      }
    }
  }
};

try {
  cleanupOldNames();
} catch (e) {
  console.error('Failed to cleanup old cache:', e);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
