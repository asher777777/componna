import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import {
  AuthPortalModuleConfig,
  UserProfileRecord,
  AuthViewMode,
  AuthPortalCollectionsConfig,
} from '../types';
import { resolveAuthCollections } from '../config';
import {
  AuthState,
  subscribeToAuth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginAnonymously,
  logoutUser,
  resetUserPassword,
  formatAuthError,
  ensureAnonymousAuth,
} from '../../../services/firebaseAuth';
import { FirestoreUserService } from '../services/firestoreUserService';
import { eventBus } from '../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { AuthSessionContract } from '../../../core/contracts';

interface AuthPortalContextValue {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  collections: Required<AuthPortalCollectionsConfig>;
  authState: AuthState;
  userProfile: UserProfileRecord | null;
  currentView: AuthViewMode;
  setCurrentView: (view: AuthViewMode) => void;
  isLoading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  clearMessages: () => void;
  handleEmailLogin: (email: string, pass: string) => Promise<User>;
  handleRegister: (email: string, pass: string, displayName?: string) => Promise<User>;
  handleGoogleLogin: () => Promise<User>;
  handleAnonymousLogin: () => Promise<User>;
  handleLogout: () => Promise<void>;
  handleResetPassword: (email: string) => Promise<void>;
}

const AuthPortalContext = createContext<AuthPortalContextValue | null>(null);

export const AuthPortalProvider: React.FC<{
  config?: AuthPortalModuleConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const firebaseApp = config?.firebaseApp;
  
  const db = useMemo(() => {
    if (config?.db) return config.db;
    if (firebaseApp) {
      const databaseId = config?.databaseId || import.meta.env.VITE_FIREBASE_DATABASE_ID;
      return databaseId && databaseId !== '(default)'
        ? getFirestore(firebaseApp, databaseId)
        : getFirestore(firebaseApp);
    }
    return undefined;
  }, [firebaseApp, config?.db, config?.databaseId]);

  const collections = useMemo(
    () => resolveAuthCollections(config?.collectionPrefix, config?.customCollections),
    [config?.collectionPrefix, config?.customCollections]
  );

  const [currentView, setCurrentView] = useState<AuthViewMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileRecord | null>(null);

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    role: 'viewer',
    isAuthenticated: false,
    isAnonymous: false,
    loading: true,
    error: null,
  });

  const { registerCapability, unregisterCapability } = useHostCapabilities();

  const clearMessages = useCallback(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, []);

  // Listen to Auth state and sync with Firestore profile & Host Capabilities & EventBus
  useEffect(() => {
    if (!firebaseApp) return;

    const unsub = subscribeToAuth(firebaseApp, async (state) => {
      setAuthState(state);
      
      const sessionContract: AuthSessionContract = {
        uid: state.uid || '',
        email: state.email || '',
        displayName: state.displayName || '',
        role: state.role || 'viewer',
        isAuthenticated: !!state.isAuthenticated,
      };

      // Broadcast globally across all listening modules
      eventBus.emit('auth:state_changed', sessionContract);
      registerCapability('auth-session', sessionContract);

      if (state.user) {
        if (db) {
          const profile = await FirestoreUserService.syncUserProfile(db, collections, state.user);
          setUserProfile(profile);
        }
        if (!state.user.isAnonymous) {
          setCurrentView('profile');
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      unsub();
      unregisterCapability('auth-session');
    };
  }, [firebaseApp, db, collections, registerCapability, unregisterCapability]);

  const handleEmailLogin = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    clearMessages();
    try {
      const user = await loginWithEmail(email, pass, firebaseApp);
      setSuccessMsg('התחברת בהצלחה!');
      if (db) {
        await FirestoreUserService.logAuthEvent(db, collections, user.uid, 'login_email');
      }
      if (config?.onLoginSuccess) config.onLoginSuccess(user);
      return user;
    } catch (err: any) {
      const msg = formatAuthError(err);
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, pass: string, displayName?: string): Promise<User> => {
    setIsLoading(true);
    clearMessages();
    try {
      const user = await registerWithEmail(email, pass, displayName, firebaseApp);
      setSuccessMsg('נרשמת בהצלחה למערכת!');
      if (db) {
        await FirestoreUserService.logAuthEvent(db, collections, user.uid, 'register_email', { displayName });
      }
      if (config?.onLoginSuccess) config.onLoginSuccess(user);
      return user;
    } catch (err: any) {
      const msg = formatAuthError(err);
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<User> => {
    setIsLoading(true);
    clearMessages();
    try {
      const user = await loginWithGoogle(firebaseApp);
      setSuccessMsg('התחברת בהצלחה באמצעות Google!');
      if (db) {
        await FirestoreUserService.logAuthEvent(db, collections, user.uid, 'login_google');
      }
      if (config?.onLoginSuccess) config.onLoginSuccess(user);
      return user;
    } catch (err: any) {
      const msg = formatAuthError(err);
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async (): Promise<User> => {
    setIsLoading(true);
    clearMessages();
    try {
      const user = await loginAnonymously(firebaseApp);
      setSuccessMsg('התחברת במצב מהיר (אנונימי)!');
      if (db) {
        await FirestoreUserService.logAuthEvent(db, collections, user.uid, 'login_anonymous');
      }
      if (config?.onLoginSuccess) config.onLoginSuccess(user);
      return user;
    } catch (err: any) {
      const msg = formatAuthError(err);
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    clearMessages();
    try {
      const prevUid = authState.uid;
      await logoutUser(firebaseApp);
      setSuccessMsg('התנתקת בהצלחה מהמערכת.');
      setUserProfile(null);
      setCurrentView('login');
      if (db && prevUid) {
        await FirestoreUserService.logAuthEvent(db, collections, prevUid, 'logout');
      }
      if (config?.onLogout) config.onLogout();
    } catch (err: any) {
      const msg = formatAuthError(err);
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    clearMessages();
    try {
      await resetUserPassword(email, firebaseApp);
      setSuccessMsg('קישור לאיפוס סיסמה נשלח בהצלחה לאימייל שלך!');
    } catch (err: any) {
      const msg = formatAuthError(err);
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPortalContext.Provider
      value={{
        firebaseApp,
        db,
        collections,
        authState,
        userProfile,
        currentView,
        setCurrentView,
        isLoading,
        errorMsg,
        successMsg,
        clearMessages,
        handleEmailLogin,
        handleRegister,
        handleGoogleLogin,
        handleAnonymousLogin,
        handleLogout,
        handleResetPassword,
      }}
    >
      {children}
    </AuthPortalContext.Provider>
  );
};

export function useAuthPortal(): AuthPortalContextValue {
  const ctx = useContext(AuthPortalContext);
  if (!ctx) {
    throw new Error('useAuthPortal must be used within an AuthPortalProvider');
  }
  return ctx;
}
