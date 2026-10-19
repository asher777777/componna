import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  User,
  UserCheck,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  Check,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { ContactRecord } from '../types';
import { MOCK_CONTACTS } from '../services/firestoreService';

interface LeaderContactAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  contacts?: ContactRecord[];
  onSelectContact?: (contact: ContactRecord) => void;
  placeholder?: string;
  disabled?: boolean;
}

function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/["'״׳`]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDigits(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('972')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

export const LeaderContactAutocomplete: React.FC<LeaderContactAutocompleteProps> = ({
  value,
  onChange,
  contacts = [],
  onSelectContact,
  placeholder = 'הקלד שם, טלפון או דוא״ל לחיפוש בטננט...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fallback to MOCK_CONTACTS if tenant contacts are not yet populated
  const availableContacts = useMemo(() => {
    if (contacts && contacts.length > 0) return contacts;
    return MOCK_CONTACTS;
  }, [contacts]);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    const query = value.trim();
    if (!query) {
      // Show first 8 tenant contacts on empty focus
      return availableContacts.slice(0, 8);
    }

    const normQuery = normalizeSearchText(query);
    const digitQuery = cleanDigits(query);
    const queryTokens = normQuery.split(' ').filter(Boolean);

    return availableContacts
      .filter((c) => {
        const name = normalizeSearchText(c.conta_name || c.fullName || c.name || '');
        const phone = cleanDigits(c.conta_phone || c.phone || c.mobile || '');
        const email = (c.email || '').toLowerCase();
        const city = normalizeSearchText(c.mh_crm_city || c.city || '');
        const company = normalizeSearchText(c.company_name || c.company || '');
        const role = normalizeSearchText(c.job_title || '');

        // Direct phone digits match
        if (digitQuery && phone.includes(digitQuery)) return true;

        // Email match
        if (email.includes(query.toLowerCase())) return true;

        // Name match
        if (name.includes(normQuery)) return true;

        // Multi-token match across all fields
        const combined = `${name} ${role} ${company} ${city}`;
        if (queryTokens.every((token) => combined.includes(token))) return true;

        return false;
      })
      .slice(0, 10);
  }, [value, availableContacts]);

  // Check if current value matches an existing contact
  const matchedContact = useMemo(() => {
    if (!value.trim()) return null;
    const norm = normalizeSearchText(value);
    return availableContacts.find(
      (c) => normalizeSearchText(c.conta_name || c.fullName || c.name || '') === norm
    ) || null;
  }, [value, availableContacts]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (contact: ContactRecord) => {
    const contactName = contact.conta_name || contact.fullName || contact.name || '';
    onChange(contactName);
    if (onSelectContact) {
      onSelectContact(contact);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredContacts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredContacts.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredContacts.length) {
        e.preventDefault();
        handleSelect(filteredContacts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full text-right" ref={containerRef} dir="rtl">
      {/* Input Field */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full h-10 pr-9 pl-9 rounded-2xl border text-xs transition-all focus:outline-none focus:ring-2 dark:text-white ${
            matchedContact
              ? 'border-indigo-300 dark:border-indigo-600/70 bg-indigo-50/20 dark:bg-indigo-950/20 focus:ring-indigo-500/30'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-indigo-500/20'
          }`}
          autoComplete="off"
        />

        {/* Right Icon: User or UserCheck */}
        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
          {matchedContact ? (
            <span title="איש קשר מקושר מהטננט">
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </span>
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>

        {/* Left Action: Clear Button or Dropdown Arrow */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1">
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="נקה שדה"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="פתח רשימת אנשי קשר"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1.5 right-0 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Dropdown Header */}
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>אנשי קשר בטננט</span>
            </span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
              {filteredContacts.length} תוצאות
            </span>
          </div>

          {/* Contacts List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 p-1">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, idx) => {
                const contactName = contact.conta_name || contact.fullName || contact.name || 'איש קשר ללא שם';
                const isSelected = matchedContact?.id === contact.id || value.trim() === contactName.trim();
                const isHighlighted = highlightedIndex === idx;
                const initialLetter = contactName.charAt(0) || '👤';

                return (
                  <div
                    key={contact.id || idx}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(contact)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 text-right ${
                      isHighlighted
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100'
                        : isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {initialLetter}
                      </div>

                      {/* Contact Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                            {contactName}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> נבחר
                            </span>
                          )}
                        </div>

                        {/* Secondary Info: Phone, Email, City/Company */}
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {contact.conta_phone && (
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span dir="ltr">{contact.conta_phone}</span>
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center gap-1 text-[10px] truncate max-w-[140px]">
                              <Mail className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{contact.email}</span>
                            </span>
                          )}
                          {(contact.mh_crm_city || contact.company_name) && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{contact.mh_crm_city || contact.company_name}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(contact);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shrink-0"
                    >
                      בחר
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  לא נמצא איש קשר תואם בטננט
                </p>
                <p className="text-[11px] text-slate-400">
                  הערך "{value}" יישמר כמנהל מותאם אישית (טקסט חופשי)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
