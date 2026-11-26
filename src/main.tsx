import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Auto-reload once with cache-busting if a stale hashed JS chunk fails to load after a new deploy
if (typeof window !== 'undefined') {
  const triggerCacheBustedReload = () => {
    try {
      const key = 'kosun_preload_reload_at';
      const lastReload = Number(sessionStorage.getItem(key) || '0');
      if (Date.now() - lastReload > 15000) {
        sessionStorage.setItem(key, String(Date.now()));
        const url = new URL(window.location.href);
        url.searchParams.set('_v', String(Date.now()));
        window.location.replace(url.toString());
      }
    } catch {
      window.location.reload();
    }
  };

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    triggerCacheBustedReload();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event?.reason?.message || event?.reason || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Expected a JavaScript-or-Wasm module script') ||
      msg.includes('error loading dynamically imported module')
    ) {
      triggerCacheBustedReload();
    }
  });
}

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
