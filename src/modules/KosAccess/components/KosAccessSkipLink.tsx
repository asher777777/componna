import React from 'react';

interface KosAccessSkipLinkProps {
  targetId?: string;
  label?: string;
}

export const KosAccessSkipLink: React.FC<KosAccessSkipLinkProps> = ({
  targetId = 'main-content',
  label = 'דלג לתוכן מרכזי (עקיפת בלוקים)',
}) => {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId) || document.querySelector('main');
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[99999] focus:px-5 focus:py-3 focus:bg-blue-700 focus:text-white focus:text-sm focus:font-bold focus:rounded-lg focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-2 focus:border-white transition-all"
      aria-label="דילוג לתוכן המרכזי של העמוד"
    >
      {label}
    </a>
  );
};

export default KosAccessSkipLink;
