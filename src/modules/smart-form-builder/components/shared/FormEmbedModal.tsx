import React, { useState } from 'react';
import { SmartFormDefinition } from '../../types';
import { Copy, Check, X, Code2, Link, Globe, Layers } from 'lucide-react';
import { LuxuryIconRenderer } from './LuxuryIconRenderer';

export interface FormEmbedModalProps {
  isOpen: boolean;
  form: SmartFormDefinition | null;
  onClose: () => void;
}

export const FormEmbedModal: React.FC<FormEmbedModalProps> = ({
  isOpen,
  form,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'react' | 'iframe'>('link');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !form) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://comona.app';
  const shareUrl = `${baseUrl}/#/smart-forms/runner/${form.id}`;
  
  const reactSnippet = `import { SmartFormRunner } from '@/modules/smart-form-builder';

export function MyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <SmartFormRunner 
        formId="${form.id}" 
        onComplete={(answers, subId) => console.log('Submitted:', answers)} 
      />
    </div>
  );
}`;

  const iframeSnippet = `<iframe 
  src="${shareUrl}?embed=true" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" 
  allow="camera; microphone"
></iframe>`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        dir="rtl"
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <LuxuryIconRenderer iconName="Globe" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                הטמעה ושיתוף הטופס
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {form.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 gap-1">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'link'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            קישור שיתוף ישיר
          </button>
          <button
            onClick={() => setActiveTab('react')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'react'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            רכיב React (מערכתי)
          </button>
          <button
            onClick={() => setActiveTab('iframe')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'iframe'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            קוד HTML / Iframe
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'link' && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                קישור מותאם לשיתוף ברשתות, וואטסאפ או אימייל:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs text-slate-700 dark:text-slate-200 select-all font-mono"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedKey === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'link' ? 'הועתק!' : 'העתק'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'react' && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                הטמעה ישירה בכל עמוד או מודול במערכת:
              </label>
              <div className="relative">
                <pre
                  dir="ltr"
                  className="p-3.5 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800"
                >
                  {reactSnippet}
                </pre>
                <button
                  onClick={() => copyToClipboard(reactSnippet, 'react')}
                  className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'react' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'iframe' && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                קוד להטמעה באתרי וורדפרס, וויקס או אתרים חיצוניים:
              </label>
              <div className="relative">
                <pre
                  dir="ltr"
                  className="p-3.5 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800"
                >
                  {iframeSnippet}
                </pre>
                <button
                  onClick={() => copyToClipboard(iframeSnippet, 'iframe')}
                  className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'iframe' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium text-xs"
          >
            סיום
          </button>
        </div>
      </div>
    </div>
  );
};
