import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AccessibilityUserPreferences,
  AccessibilityPresetId,
  AccessibilityDeclarationDocument,
} from '../types';
import { DEFAULT_ACCESSIBILITY_PREFERENCES, ACCESSIBILITY_PRESETS } from '../config';
import { KosAccessFirestoreService } from '../services/kosAccessFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

interface KosAccessContextValue {
  preferences: AccessibilityUserPreferences;
  activePreset: AccessibilityPresetId;
  updatePreference: <K extends keyof AccessibilityUserPreferences>(
    key: K,
    value: AccessibilityUserPreferences[K]
  ) => void;
  resetPreferences: () => void;
  applyPreset: (presetId: AccessibilityPresetId) => void;

  // Modals & Panels
  isToolbarOpen: boolean;
  openToolbar: () => void;
  closeToolbar: () => void;
  toggleToolbar: () => void;

  isStatementOpen: boolean;
  openStatement: () => void;
  closeStatement: () => void;

  isFeedbackOpen: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;

  // Speech Assistance
  isSpeaking: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;

  // Declaration Document
  declaration: AccessibilityDeclarationDocument | null;
  reloadDeclaration: () => Promise<void>;
  tenantId: string;
}

const KosAccessContext = createContext<KosAccessContextValue | null>(null);

const STORAGE_KEY = 'kosun_accessibility_prefs_v1';

export const KosAccessProvider: React.FC<{
  tenantId?: string;
  children: React.ReactNode;
}> = ({ tenantId = '_master', children }) => {
  const { db } = useSystemConnection();

  const [preferences, setPreferences] = useState<AccessibilityUserPreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) return { ...DEFAULT_ACCESSIBILITY_PREFERENCES, ...JSON.parse(saved) };
      } catch {
        // Fallback to defaults
      }
    }
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  });

  const [activePreset, setActivePreset] = useState<AccessibilityPresetId>('none');
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [declaration, setDeclaration] = useState<AccessibilityDeclarationDocument | null>(null);

  // Sync declaration from tenant Firestore
  const reloadDeclaration = useCallback(async () => {
    if (!db || !tenantId) return;
    try {
      const docData = await KosAccessFirestoreService.getDeclaration(db, tenantId);
      if (docData) {
        setDeclaration(docData);
      }
    } catch (err) {
      console.warn('[KosAccessProvider] Failed loading declaration:', err);
    }
  }, [db, tenantId]);

  useEffect(() => {
    reloadDeclaration();
  }, [reloadDeclaration]);

  // Persist session preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch {
        // ignore
      }
    }
  }, [preferences]);

  // Update single preference
  const updatePreference = useCallback(
    <K extends keyof AccessibilityUserPreferences>(
      key: K,
      value: AccessibilityUserPreferences[K]
    ) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
      setActivePreset('none');
    },
    []
  );

  // Reset all preferences to default
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES);
    setActivePreset('none');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Apply predefined accessibility profile
  const applyPreset = useCallback(
    (presetId: AccessibilityPresetId) => {
      if (presetId === 'none') {
        resetPreferences();
        return;
      }
      const found = ACCESSIBILITY_PRESETS.find((p) => p.id === presetId);
      if (found) {
        setPreferences({
          ...DEFAULT_ACCESSIBILITY_PREFERENCES,
          ...found.preferences,
        });
        setActivePreset(presetId);
      }
    },
    [resetPreferences]
  );

  // Text-To-Speech
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('דפדפן זה אינו תומך בהקראה קולית מקומית');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    // Find Hebrew voice if available
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find((v) => v.lang.startsWith('he') || v.lang.includes('IL'));
    if (hebrewVoice) {
      utterance.voice = hebrewVoice;
      utterance.lang = 'he-IL';
    } else {
      utterance.lang = 'he';
    }

    utterance.rate = 0.95; // slightly slower for maximum comprehension
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Listen for selection speech trigger when Screen Reader Helper is active
  useEffect(() => {
    if (!preferences.screenReaderHelper || typeof window === 'undefined') return;

    const handleMouseUp = () => {
      const selected = window.getSelection()?.toString();
      if (selected && selected.trim().length > 1) {
        speakText(selected.trim());
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [preferences.screenReaderHelper, speakText]);

  // Global Keyboard Shortcuts (Alt+A to open/close toolbar, Alt+0 to reset, Esc to close)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ש')) {
        e.preventDefault();
        setIsToolbarOpen((prev) => !prev);
      } else if (e.altKey && e.key === '0') {
        e.preventDefault();
        resetPreferences();
      } else if (e.key === 'Escape') {
        if (isToolbarOpen) setIsToolbarOpen(false);
        if (isStatementOpen) setIsStatementOpen(false);
        if (isFeedbackOpen) setIsFeedbackOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isToolbarOpen, isStatementOpen, isFeedbackOpen, resetPreferences]);

  // Live CSS Dynamic Injection Engine
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let styleElement = document.getElementById('kos-access-dynamic-css') as HTMLStyleElement | null;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'kos-access-dynamic-css';
      document.head.appendChild(styleElement);
    }

    let css = `
      /* Universal Keyboard Focus Visible Indicator (WCAG 2.4.7 & 2.4.11) */
      *:focus-visible {
        outline: 3px solid #2563eb !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4) !important;
      }
    `;

    // 1. Font Size
    if (preferences.fontSize === 'large') {
      css += `
        html { font-size: 115% !important; }
      `;
    } else if (preferences.fontSize === 'larger') {
      css += `
        html { font-size: 130% !important; }
      `;
    } else if (preferences.fontSize === 'huge') {
      css += `
        html { font-size: 150% !important; }
      `;
    }

    // 2. High Contrast Modes
    if (preferences.contrast === 'dark') {
      css += `
        html, body, div:not(#kos-access-portal *), p, span, li, a {
          background-color: #121212 !important;
          color: #ffeb3b !important;
          border-color: #ffeb3b !important;
        }
        button:not(#kos-access-portal *) {
          background-color: #000000 !important;
          color: #ffff00 !important;
          border: 2px solid #ffff00 !important;
        }
      `;
    } else if (preferences.contrast === 'light') {
      css += `
        html, body, div:not(#kos-access-portal *), p, span, li, a {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #000000 !important;
        }
        button:not(#kos-access-portal *) {
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 2px solid #000000 !important;
        }
      `;
    } else if (preferences.contrast === 'monochrome') {
      css += `
        html {
          filter: grayscale(100%) contrast(120%) !important;
        }
      `;
    } else if (preferences.contrast === 'inverted') {
      css += `
        html {
          filter: invert(100%) hue-rotate(180deg) !important;
        }
        img, video, iframe, #kos-access-portal {
          filter: invert(100%) hue-rotate(180deg) !important;
        }
      `;
    }

    // 3. Dyslexic-Friendly Font
    if (preferences.dyslexicFont) {
      css += `
        * {
          font-family: 'OpenDyslexic', 'Segoe UI', Arial, sans-serif !important;
          letter-spacing: 0.04em !important;
          word-spacing: 0.08em !important;
        }
      `;
    }

    // 4. Text Spacing (WCAG 1.4.12)
    if (preferences.textSpacing) {
      css += `
        p, span, li, h1, h2, h3, h4, h5, h6, a, input, textarea, button {
          line-height: 1.85 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
        p {
          margin-bottom: 1.5em !important;
        }
      `;
    }

    // 5. Highlight Links
    if (preferences.highlightLinks) {
      css += `
        a:not(#kos-access-portal *) {
          text-decoration: underline !important;
          text-decoration-thickness: 3px !important;
          text-underline-offset: 4px !important;
          background-color: #fef08a !important;
          color: #1e3a8a !important;
          font-weight: 700 !important;
          padding: 1px 4px !important;
          border-radius: 2px !important;
        }
      `;
    }

    // 6. Highlight Headings
    if (preferences.highlightHeadings) {
      css += `
        h1, h2, h3, h4, h5, h6 {
          text-decoration: underline !important;
          text-decoration-color: #2563eb !important;
          text-underline-offset: 6px !important;
          border-right: 5px solid #2563eb !important;
          padding-right: 8px !important;
        }
      `;
    }

    // 7. Pause Animations (WCAG 2.2.2 & 2.3.1)
    if (preferences.pauseAnimations) {
      css += `
        *, *::before, *::after {
          animation-duration: 0.001s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001s !important;
          scroll-behavior: auto !important;
        }
      `;
    }

    // 8. Large Cursors
    if (preferences.largeCursor === 'large-black') {
      const blackCursorSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path fill="#000000" stroke="#ffffff" stroke-width="2" d="M3 3l10 28 4-10 10 4-2-6-10-4z"/></svg>`
      );
      css += `
        body, button, a, input, select, textarea {
          cursor: url('data:image/svg+xml;utf8,${blackCursorSvg}'), auto !important;
        }
      `;
    } else if (preferences.largeCursor === 'large-white') {
      const whiteCursorSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path fill="#ffffff" stroke="#000000" stroke-width="2" d="M3 3l10 28 4-10 10 4-2-6-10-4z"/></svg>`
      );
      css += `
        body, button, a, input, select, textarea {
          cursor: url('data:image/svg+xml;utf8,${whiteCursorSvg}'), auto !important;
        }
      `;
    }

    // 9. Hide Images
    if (preferences.hideImages) {
      css += `
        img:not(#kos-access-portal *), video:not(#kos-access-portal *), iframe:not(#kos-access-portal *), svg:not(#kos-access-portal *) {
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `;
    }

    styleElement.textContent = css;

    return () => {
      if (styleElement && styleElement.parentNode) {
        // Keep style tag or clean up
      }
    };
  }, [preferences]);

  const value = useMemo(
    () => ({
      preferences,
      activePreset,
      updatePreference,
      resetPreferences,
      applyPreset,
      isToolbarOpen,
      openToolbar: () => setIsToolbarOpen(true),
      closeToolbar: () => setIsToolbarOpen(false),
      toggleToolbar: () => setIsToolbarOpen((prev) => !prev),
      isStatementOpen,
      openStatement: () => setIsStatementOpen(true),
      closeStatement: () => setIsStatementOpen(false),
      isFeedbackOpen,
      openFeedback: () => setIsFeedbackOpen(true),
      closeFeedback: () => setIsFeedbackOpen(false),
      isSpeaking,
      speakText,
      stopSpeaking,
      declaration,
      reloadDeclaration,
      tenantId,
    }),
    [
      preferences,
      activePreset,
      updatePreference,
      resetPreferences,
      applyPreset,
      isToolbarOpen,
      isStatementOpen,
      isFeedbackOpen,
      isSpeaking,
      speakText,
      stopSpeaking,
      declaration,
      reloadDeclaration,
      tenantId,
    ]
  );

  return <KosAccessContext.Provider value={value}>{children}</KosAccessContext.Provider>;
};

export const useKosAccessContext = () => {
  const context = useContext(KosAccessContext);
  if (!context) {
    return {
      preferences: DEFAULT_ACCESSIBILITY_PREFERENCES,
      activePreset: 'none' as const,
      updatePreference: () => {},
      resetPreferences: () => {},
      applyPreset: () => {},
      isToolbarOpen: false,
      openToolbar: () => {},
      closeToolbar: () => {},
      toggleToolbar: () => {},
      isStatementOpen: false,
      openStatement: () => {},
      closeStatement: () => {},
      isFeedbackOpen: false,
      openFeedback: () => {},
      closeFeedback: () => {},
      isSpeaking: false,
      speakText: () => {},
      stopSpeaking: () => {},
      declaration: null,
      reloadDeclaration: async () => {},
      tenantId: '_master',
    };
  }
  return context;
};

export default KosAccessContext;
