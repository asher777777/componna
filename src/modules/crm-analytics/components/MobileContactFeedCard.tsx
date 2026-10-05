import React, { useState } from 'react';
import { 
  Phone, MessageSquare, ChevronLeft, ChevronRight, User, Building, MapPin, 
  Tag, DollarSign, Calendar, Sparkles, Check, UserCheck 
} from 'lucide-react';
import { Contact } from '../types';
import { buildWaMeUrl, buildNativeWhatsAppAppUrl } from '../services/crmWhatsAppService';
import { downloadVCard } from '../services/vcardService';

interface Props {
  contact: Contact;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSelectContact: () => void;
  onUpdateStatus?: (newStatus: 'active' | 'trashed') => void;
  onSingleWhatsApp?: () => void;
}

export const MobileContactFeedCard: React.FC<Props> = ({
  contact,
  isSelected,
  onToggleSelect,
  onSelectContact,
  onUpdateStatus,
  onSingleWhatsApp,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [swipeActionTriggered, setSwipeActionTriggered] = useState<string | null>(null);

  const isLead = Boolean(contact.is_lead || contact.contact_type === 'lead');
  const cleanPhone = (contact.conta_phone || '').replace(/\D/g, '');
  const waUrl = buildWaMeUrl(contact.conta_phone || '');
  const nativeWaUrl = buildNativeWhatsAppAppUrl(contact.conta_phone || '');

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    // Limit swipe dampening
    if (Math.abs(diff) < 120) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 70) {
      // Swiped Right -> Open WhatsApp
      setSwipeActionTriggered('פתיחת WhatsApp');
      setTimeout(() => {
        setSwipeActionTriggered(null);
        if (onSingleWhatsApp) {
          onSingleWhatsApp();
        } else if (cleanPhone) {
          window.open(waUrl, '_blank');
        }
      }, 300);
    } else if (swipeOffset < -70) {
      // Swiped Left -> Select or Toggle status
      setSwipeActionTriggered('בחירה');
      onToggleSelect();
      setTimeout(() => setSwipeActionTriggered(null), 800);
    }
    setTouchStartX(null);
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
      {/* Background Swipe Action Hints */}
      <div className="absolute inset-0 flex items-center justify-between px-5 text-xs font-bold pointer-events-none">
        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <MessageSquare className="w-4 h-4" />
          <span>שליחת WhatsApp</span>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <Check className="w-4 h-4" />
          <span>סמן לבחירה</span>
        </div>
      </div>

      {/* Main Draggable Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        className={`relative z-10 bg-white dark:bg-gray-900 p-4 transition-transform duration-100 ${
          isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500' : ''
        }`}
      >
        {/* Top Line: Name, Tag Status, Checkbox */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <div 
              onClick={onSelectContact}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-600 transition">
                  {contact.conta_name || 'ללא שם'}
                </h4>
                {isLead ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    ליד
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    לקוח
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                {contact.company_name && <span>{contact.company_name}</span>}
                {contact.mh_crm_city && <span>• {contact.mh_crm_city}</span>}
              </p>
            </div>
          </div>

          {/* Amount / Value Pill */}
          <div className="text-left shrink-0">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              ₪{Number(contact.total_spent || 0).toLocaleString('he-IL')}
            </span>
            {Number(contact.campaign_amount || 0) > 0 && (
              <p className="text-[10px] text-emerald-600 font-medium">
                גייס: ₪{Number(contact.campaign_amount).toLocaleString('he-IL')}
              </p>
            )}
          </div>
        </div>

        {/* Tags Row */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {contact.tags.slice(0, 3).map((t, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {t}
              </span>
            ))}
            {contact.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400">
                +{contact.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom Actions Bar (Thumb-Friendly Click-to-Call & WhatsApp) */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {/* Native Click-to-Call */}
            {contact.conta_phone && (
              <a
                href={`tel:${contact.conta_phone}`}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>חייג</span>
              </a>
            )}

            {/* Native WhatsApp App or Web */}
            {contact.conta_phone && (
              <button
                type="button"
                onClick={() => {
                  if (onSingleWhatsApp) {
                    onSingleWhatsApp();
                  } else {
                    window.open(waUrl, '_blank');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            )}

            {/* vCard to phone contacts */}
            <button
              type="button"
              onClick={() => downloadVCard(contact)}
              className="p-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition"
              title="שמור לאנשי הקשר בטלפון"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Open full 360 card */}
          <button
            type="button"
            onClick={onSelectContact}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>פרופיל 360</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Swipe Feedback Overlay */}
        {swipeActionTriggered && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white text-xs font-bold animate-fadeIn">
            {swipeActionTriggered}
          </div>
        )}
      </div>
    </div>
  );
};
