import React, { useState } from 'react';
import { Palette, Type, Maximize2, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface BrandingDesignTokensConfig {
  title?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  buttonStyle?: string;
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
}

export const BrandingDesignTokensSection: React.FC<{ config: BrandingDesignTokensConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = config.title || 'שפה חזותית, צבעים וטיפוגרפיה';
  const primaryColor = config.primaryColor || '#6366f1';
  const secondaryColor = config.secondaryColor || '#0ea5e9';
  const backgroundColor = config.backgroundColor || '#0f172a';
  const fontFamily = config.fontFamily || 'Heebo, sans-serif';
  const borderRadius = config.borderRadius || 'rounded-xl';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Ambient background glow matching primary color */}
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header & Primary Action */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <Palette className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              פלטת צבעי המותג, עיגול פינות וגופן מוביל המוזרקים לכלל העמודים
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {config.secondaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.secondaryButtonAction || 'open_scraper', config.secondaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              {config.secondaryButtonText}
            </button>
          )}

          {config.primaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.primaryButtonAction || 'open_ai_wizard', config.primaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Color Swatches & Specs - Rule 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        {/* Primary Color Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl shadow-inner border border-black/10 shrink-0"
            style={{ backgroundColor: primaryColor }}
          />
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">צבע ראשי מוביל</span>
            <span className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">{primaryColor}</span>
          </div>
        </div>

        {/* Secondary Color Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl shadow-inner border border-black/10 shrink-0"
            style={{ backgroundColor: secondaryColor }}
          />
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">צבע משני והדגשות</span>
            <span className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">{secondaryColor}</span>
          </div>
        </div>

        {/* Typography & Radius Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 block">גופן נבחר</span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Type className="w-4 h-4 text-indigo-500" />
            {fontFamily.split(',')[0]}
          </span>
        </div>
      </div>

      {/* Live Preview of Button Style */}
      <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          תצוגה חיה של כפתור מותג:
        </span>
        <button
          type="button"
          className="px-5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
          style={{
            backgroundColor: primaryColor,
            borderRadius: borderRadius === 'full' ? '9999px' : borderRadius === 'none' ? '0px' : '12px',
          }}
        >
          דוגמת כפתור מותג
        </button>
      </div>

      {/* Rule 7: Expandable Deep Token Details */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'הסתר מפרט טכני מלא' : 'הצג פלטות מוכנות, קודי Hex מלאים והגדרות מעטפת'}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">רקע עמוד כהה:</span>
                <span className="font-mono font-bold">{backgroundColor}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">רדיוס פינות:</span>
                <span className="font-mono font-bold">{borderRadius}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">סגנון לחצנים:</span>
                <span className="font-bold">{config.buttonStyle || 'מלא עם צל (Solid)'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
