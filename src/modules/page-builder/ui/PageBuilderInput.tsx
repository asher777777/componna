import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PageBuilderInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const PageBuilderInput: React.FC<PageBuilderInputProps> = ({
  label,
  helperText,
  error,
  prefixIcon,
  suffixIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full text-right" dir="rtl">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none shrink-0">
            {prefixIcon}
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full bg-slate-900/80 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-sm placeholder:text-slate-500',
              'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-150',
              prefixIcon && 'pr-9',
              suffixIcon && 'pl-9',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30',
              className
            )
          )}
          {...props}
        />
        {suffixIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none shrink-0">
            {suffixIcon}
          </div>
        )}
      </div>
      {error && <span className="text-[11px] text-rose-400 font-medium">{error}</span>}
      {!error && helperText && <span className="text-[11px] text-slate-500">{helperText}</span>}
    </div>
  );
};

export interface PageBuilderTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const PageBuilderTextarea: React.FC<PageBuilderTextareaProps> = ({
  label,
  helperText,
  error,
  className,
  id,
  rows = 3,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full text-right" dir="rtl">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={twMerge(
          clsx(
            'w-full bg-slate-900/80 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-sm placeholder:text-slate-500 resize-y',
            'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-150 custom-scrollbar',
            error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30',
            className
          )
        )}
        {...props}
      />
      {error && <span className="text-[11px] text-rose-400 font-medium">{error}</span>}
      {!error && helperText && <span className="text-[11px] text-slate-500">{helperText}</span>}
    </div>
  );
};
