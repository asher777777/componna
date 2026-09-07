import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, LogIn, UserPlus, User as UserIcon } from 'lucide-react';
import { useAuthPortal } from '../context/AuthPortalContext';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { ProfileView } from './ProfileView';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, authState, clearMessages } = useAuthPortal();

  useEffect(() => {
    if (isOpen) {
      clearMessages();
      if (authState.isAuthenticated && !authState.isAnonymous) {
        setCurrentView('profile');
      } else {
        setCurrentView('login');
      }
    }
  }, [isOpen, authState.isAuthenticated, authState.isAnonymous]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">אימות והתחברות למערכת</h2>
              <p className="text-xs text-slate-400">גישה מאובטחת ל-Firebase, Firestore ו-Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        {currentView !== 'forgot' && (
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1 text-xs">
            {authState.isAuthenticated && !authState.isAnonymous && (
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setCurrentView('profile');
                }}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  currentView === 'profile'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>הפרופיל שלי</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setCurrentView('login');
              }}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                currentView === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>כניסה</span>
            </button>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setCurrentView('register');
              }}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                currentView === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הרשמה חדשה</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {currentView === 'login' && <LoginView />}
          {currentView === 'register' && <RegisterView />}
          {currentView === 'forgot' && <ForgotPasswordView />}
          {currentView === 'profile' && <ProfileView />}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>אימות מאובטח Firebase Auth</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
