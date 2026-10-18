import React, { useState } from 'react';
import { ShieldCheck, Lock, Phone, Mail, FileCheck, ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface BrandingTrustConfig {
  title?: string;
  legalEntityId?: string;
  supportPhone?: string;
  supportEmail?: string;
  cancellationPolicyDays?: number;
  guaranteeHeadline?: string;
  sslCertified?: boolean;
  legalAddress?: string;
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
}

export const BrandingTrustSection: React.FC<{ config: BrandingTrustConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = config.title || 'אמינות, תאימות משפטית וסליקה בטוחה';
  const guarantee = config.guaranteeHeadline || '100% שביעות רצון מובטחת | אפשרות ביטול בהתאם לחוק הגנת הצרכן';
  const supportPhone = config.supportPhone || '03-1234567';
  const supportEmail = config.supportEmail || 'support@brand.co.il';
  const cancellationDays = config.cancellationPolicyDays || 14;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Primary Action */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              פרטי התקשרות, תקני אבטחת תשלום ותנאי ביטול המופיעים בדפי הסליקה
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
              onClick={() => runAction(config.primaryButtonAction || 'open_strategy', config.primaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Guarantee Highlight - Rule 7 */}
      <div className="mt-6 p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center gap-3">
        <Lock className="w-5 h-5 text-emerald-500 shrink-0" />
        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
          {guarantee}
        </span>
      </div>

      {/* Trust & Support Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 block">תקופת ביטול עסקה</span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-500" />
            {cancellationDays} ימים כחוק
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 block">טלפון שירות ייעודי</span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono" dir="ltr">
            <Phone className="w-4 h-4 text-emerald-500" />
            {supportPhone}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 block">דוא״ל שירות לקוחות</span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono truncate" dir="ltr">
            <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
            {supportEmail}
          </span>
        </div>
      </div>

      {/* Rule 7: Expandable Legal & Entity Details */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'הסתר פרטי רישום משפטי' : 'הצג פרטי ח.פ/עוסק מורשה, כתובת משפטית ותעודות אבטחה'}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">מספר ח.פ / ע.מ / עמותה:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {config.legalEntityId || '515000000'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">כתובת משפטית:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {config.legalAddress || 'רחוב הבונים 4, תל אביב'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
