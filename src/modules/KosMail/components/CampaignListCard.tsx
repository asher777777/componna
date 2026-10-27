/**
 * KOSUN AM (קושאן מייל אוטומטי) - Campaign List Card (Bento Style)
 * 12-Layer Scaffolding Layer 9: Bento Grid Card for Campaigns
 */

import React from 'react';
import {
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Users,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import { EmailCampaign } from '../types';

export interface CampaignListCardProps {
  campaign: EmailCampaign;
  onDispatch?: (id: string) => void;
  onEdit?: (campaign: EmailCampaign) => void;
  onDelete?: (id: string) => void;
}

export const CampaignListCard: React.FC<CampaignListCardProps> = ({
  campaign,
  onDispatch,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            קושאן שלח בהצלחה
          </span>
        );
      case 'sending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
            <Send className="w-3.5 h-3.5" />
            קושאן משגר ברקע...
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            מתוזמן לשיגור
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            שיגור נכשל
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            <Edit3 className="w-3.5 h-3.5" />
            טיוטה בהכנה
          </span>
        );
    }
  };

  return (
    <div
      dir="rtl"
      style={{ textAlign: 'right' }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between font-heebo"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                {campaign.name}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {campaign.sentAt
                  ? `נשלח ב: ${new Date(campaign.sentAt).toLocaleDateString('he-IL')}`
                  : `נוצר ב: ${new Date(campaign.createdAt).toLocaleDateString('he-IL')}`}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-3 mb-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">נושא ההודעה:</p>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1">
            {campaign.subject}
          </p>
        </div>

        {/* Quick Micro-Metrics */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-100 dark:border-neutral-800 mb-4 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Users className="w-3 h-3" />
              <span>נמענים</span>
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white text-sm">
              {campaign.stats?.totalRecipients || 0}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Eye className="w-3 h-3" />
              <span>פתיחות</span>
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white text-sm">
              {campaign.stats?.openedCount || 0}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <MousePointerClick className="w-3 h-3" />
              <span>הקלקות</span>
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white text-sm">
              {campaign.stats?.clickedCount || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(campaign)}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition"
              title="עריכת קמפיין"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(campaign.id)}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
              title="מחיקת קמפיין"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {onDispatch && campaign.status !== 'sending' && (
          <button
            onClick={() => onDispatch(campaign.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            {campaign.status === 'sent' ? 'שגר שוב עם קושאן' : 'שגר עכשיו עם קושאן'}
          </button>
        )}
      </div>
    </div>
  );
};
