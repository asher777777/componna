import { useState, useEffect, useCallback } from 'react';

export type KosWebDesignMode = 'classic' | 'kosdesyn';

const STORAGE_KEY = 'kosweb_design_mode';
const EVENT_NAME = 'kosweb_design_mode_changed';

export function useKosWebDesignMode() {
  const getSavedMode = (): KosWebDesignMode => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'kosdesyn' || saved === 'classic') {
        return saved;
      }
    } catch {}
    return 'classic';
  };

  const [designMode, setDesignMode] = useState<KosWebDesignMode>(getSavedMode);

  // Sync across tabs and other components via custom event and storage listener
  useEffect(() => {
    const handleCustomChange = (e: any) => {
      const newMode = e?.detail?.mode;
      if (newMode === 'classic' || newMode === 'kosdesyn') {
        setDesignMode(newMode);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const val = e.newValue;
        if (val === 'classic' || val === 'kosdesyn') {
          setDesignMode(val);
        }
      }
    };

    window.addEventListener(EVENT_NAME, handleCustomChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setSpecificMode = useCallback((mode: KosWebDesignMode) => {
    setDesignMode(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { mode } }));
  }, []);

  const toggleDesignMode = useCallback(() => {
    setDesignMode((prev) => {
      const next: KosWebDesignMode = prev === 'classic' ? 'kosdesyn' : 'classic';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { mode: next } }));
      return next;
    });
  }, []);

  return {
    designMode,
    isKosdesyn: designMode === 'kosdesyn',
    isClassic: designMode === 'classic',
    toggleDesignMode,
    setSpecificMode,
  };
}
