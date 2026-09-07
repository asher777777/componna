import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthPortal } from '../context/AuthPortalContext';
import { LoginView } from '../components/LoginView';
import { RegisterView } from '../components/RegisterView';
import { ForgotPasswordView } from '../components/ForgotPasswordView';
import { ProfileView } from '../components/ProfileView';
import { ShieldCheck, LogIn, UserPlus, User } from 'lucide-react';

const AuthMainPage: React.FC = () => {
  const { currentView, setCurrentView, authState, clearMessages } = useAuthPortal();

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100" dir="rtl">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">פורטל אימות וכניסה למערכת</h1>
              <p className="text-xs text-slate-400">ניהול חשבון, אימות מאובטח וסנכרון הרשאות</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        {currentView !== 'forgot' && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1 text-xs">
            {authState.isAuthenticated && !authState.isAnonymous && (
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setCurrentView('profile');
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  currentView === 'profile'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>הפרופיל שלי</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setCurrentView('login');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                currentView === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>כניסה למערכת</span>
            </button>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setCurrentView('register');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                currentView === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>הרשמה חדשה</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {currentView === 'login' && <LoginView />}
          {currentView === 'register' && <RegisterView />}
          {currentView === 'forgot' && <ForgotPasswordView />}
          {currentView === 'profile' && <ProfileView />}
        </div>
      </div>
    </div>
  );
};

export const AuthPortalRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<AuthMainPage />} />
      <Route path="*" element={<AuthMainPage />} />
    </Routes>
  );
};
