import React, { useState, useEffect } from 'react';
import { useKosai } from '../context/KosaiContext';
import { Sparkles, Bot, ShieldCheck } from 'lucide-react';

export const FloatingKosaiButton: React.FC = () => {
  const { isOpen, setIsOpen, isLoggedIn } = useKosai();

  if (isOpen) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 left-6 z-[80] w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-slate-900 to-indigo-600 shadow-2xl shadow-indigo-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group border border-indigo-400/40 cursor-pointer p-2 overflow-hidden"
      title={isLoggedIn ? 'קושאן AI - מעצב האתרים והמערכת' : 'קושאן AI - שירות לקוחות ומידע'}
      aria-label="קושאן AI צ׳אט"
    >
      {/* Kosun Official Symbol from public gallery */}
      <img
        src="/images/kosun-symbol.svg"
        alt="קושאן AI"
        onError={(e) => {
          // Fallback to official logo if symbol SVG is unavailable
          (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
        }}
        className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
      />

      {/* Status Badge */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-white absolute" />
        </span>
      </span>
    </button>
  );
};

