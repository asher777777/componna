import React, { useState } from 'react';
import { Lock, Mail, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useClientPlatform } from '../context/ClientPlatformContext';
import { UserRole } from '../types';

export const ClientAuthGate: React.FC = () => {
  const { login, settings } = useClientPlatform();
  const [email, setEmail] = useState('admin@client.co.il');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4 text-right" dir="rtl">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            {settings.clientName.charAt(0)}
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            פורטל הכניסה - {settings.clientName}
          </h1>
          <p className="text-xs text-gray-500">
            התחבר כדי לגשת לכלים ולמודולים הפעילים במערכת
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-500 mb-1">כתובת אימייל</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-9 pl-3 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1">סיסמה</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-9 pl-3 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1">בחר תפקיד התחברות (לצורך בדיקה):</label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'editor', 'viewer'] as UserRole[]).map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`py-1.5 rounded-lg border text-center font-semibold transition ${
                    selectedRole === r
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                      : 'border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition"
          >
            <span>כניסה למערכת</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t text-center text-[11px] text-gray-400">
          מאובטח ברמת פרוטוקול Auth & Firestore Security Rules
        </div>

      </div>
    </div>
  );
};
