import React, { useState, useEffect } from 'react';
import { User, LogIn, ShieldCheck, Zap, LogOut } from 'lucide-react';
import { FirebaseApp } from 'firebase/app';
import {
  AuthState,
  subscribeToAuth,
  getOrCreateAuth,
} from '../../services/firebaseAuth';
import { AuthModal } from './AuthModal';

export const UserMenuButton: React.FC<{ firebaseApp?: FirebaseApp }> = ({ firebaseApp }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const auth = getOrCreateAuth(firebaseApp);
      if (auth.currentUser) {
        return {
          user: auth.currentUser,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
          role: 'admin',
          isAuthenticated: true,
          isAnonymous: auth.currentUser.isAnonymous,
          loading: false,
          error: null,
        };
      }
    } catch {}
    return {
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
    };
  });

  const syncCurrentAuth = () => {
    try {
      const auth = getOrCreateAuth(firebaseApp);
      const cur = auth.currentUser;
      if (cur) {
        setAuthState((prev) => ({
          ...prev,
          user: cur,
          uid: cur.uid,
          email: cur.email,
          displayName: cur.displayName,
          photoURL: cur.photoURL,
          isAuthenticated: true,
          isAnonymous: cur.isAnonymous,
          loading: false,
          error: null,
        }));
      }
    } catch {}
  };

  useEffect(() => {
    syncCurrentAuth();
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-white shadow-sm"
        title={authState.isAuthenticated ? `${authState.email || authState.displayName || 'משתמש מחובר'} (${authState.role})` : 'התחבר למערכת'}
      >
        {authState.isAuthenticated ? (
          <>
            <div className="w-5 h-5 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
              {authState.displayName ? authState.displayName[0].toUpperCase() : (authState.email ? authState.email[0].toUpperCase() : 'U')}
            </div>
            <span className="max-w-[100px] truncate text-slate-200">
              {authState.displayName || (authState.email ? authState.email.split('@')[0] : (authState.isAnonymous ? 'אנונימי' : 'מחובר'))}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              authState.role === 'admin'
                ? 'bg-amber-500/20 text-yellow-300 border border-yellow-500/40'
                : authState.role === 'editor'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {authState.role === 'admin' ? 'מנהל 👑' : authState.role === 'editor' ? 'משתמש ✍️' : 'צופה 👁️'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </>
        ) : (
          <>
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 font-bold">התחבר למערכת</span>
          </>
        )}
      </button>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          syncCurrentAuth();
        }}
        firebaseApp={firebaseApp}
      />
    </>
  );
};
