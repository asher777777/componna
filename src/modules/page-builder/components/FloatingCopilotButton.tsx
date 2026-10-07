import React from 'react';
import { useBuilderCopilot } from '../context/BuilderCopilotContext';
import { Bot, Sparkles } from 'lucide-react';

export const FloatingCopilotButton: React.FC = () => {
  const { isOpen, setIsOpen } = useBuilderCopilot();

  if (isOpen) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 left-6 z-[80] w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:scale-110 transition-transform group border border-indigo-400/50"
      title="פתח עוזר AI"
    >
      <Bot className="w-6 h-6 text-white" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500">
          <Sparkles className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </span>
      </span>
    </button>
  );
};
