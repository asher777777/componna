import React from 'react';
import { MessageSquare, ExternalLink, Send } from 'lucide-react';
import { cleanPhoneDigits } from '../services/crmContactSyncService';

interface Props {
  phone?: string;
  clientName?: string;
  amount: number | string;
  receiptUrl?: string;
  transactionId?: string;
  companyName?: string;
  className?: string;
}

export const WhatsAppReceiptShareButton: React.FC<Props> = ({
  phone,
  clientName = 'לקוח יקר',
  amount,
  receiptUrl,
  transactionId,
  companyName = 'בית העסק',
  className = '',
}) => {
  if (!receiptUrl && !transactionId) return null;

  const handleShare = () => {
    let cleanPhone = cleanPhoneDigits(phone);
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '972' + cleanPhone.slice(1);
    }

    const message = [
      `שלום ${clientName}, תודה שבחרת בנו!`,
      `התקבל תשלום על סך ₪${amount} בהצלחה.`,
      transactionId ? `מספר אסמכתא: ${transactionId}` : '',
      receiptUrl ? `לצפייה והורדת הקבלה הדיגיטלית:\n${receiptUrl}` : '',
      `בברכה,\n${companyName}`
    ]
      .filter(Boolean)
      .join('\n\n');

    const encoded = encodeURIComponent(message);
    const targetUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer ${className}`}
    >
      <MessageSquare className="w-4 h-4 text-white" />
      <span>שלח קבלה בוואטסאפ</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
    </button>
  );
};
