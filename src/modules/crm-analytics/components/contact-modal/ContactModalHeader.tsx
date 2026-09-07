import React, { useState } from 'react';
import { 
  X, MessageSquare, Phone, Mail, Copy, Check 
} from 'lucide-react';
import { Contact } from '../../types';

interface Props {
  contact: Contact;
  onClose: () => void;
}

export const ContactModalHeader: React.FC<Props> = ({ contact, onClose }) => {
  const [copied, setCopied] = useState(false);

  const cleanPhone = contact.conta_phone?.replace(/\D/g, '') || '';
  const waUrl = cleanPhone.startsWith('972') 
    ? `https://wa.me/${cleanPhone}` 
    : cleanPhone.startsWith('0') 
      ? `https://wa.me/972${cleanPhone.slice(1)}` 
      : `https://wa.me/${cleanPhone}`;

  const handleCopyPhone = () => {
    if (contact.conta_phone) {
      navigator.clipboard.writeText(contact.conta_phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-r from-gray-50 to-indigo-50/40 dark:from-gray-900 dark:to-indigo-950/20 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          {contact.conta_name?.charAt(0) || 'U'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {contact.conta_name || 'איש קשר חדש'}
            </h2>
            {contact.total_spent && contact.total_spent > 5000 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                VIP 👑
              </span>
            ) : null}
            {contact.campaign_amount && contact.campaign_amount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                שגריר 🎯
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {contact.job_title ? `${contact.job_title} | ` : ''}{contact.company_name || 'ללא חברה'} {contact.mh_crm_city ? `• ${contact.mh_crm_city}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {contact.conta_phone && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        )}
        {contact.conta_phone && (
          <a
            href={`tel:${contact.conta_phone}`}
            className="p-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 transition"
            title="חייג"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="p-2 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 transition"
            title="שלח אימייל"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          onClick={handleCopyPhone}
          className="p-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
          title="העתק טלפון"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
