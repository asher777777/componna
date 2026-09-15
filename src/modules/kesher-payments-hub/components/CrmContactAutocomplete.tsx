import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Search, 
  Check, 
  X, 
  Sparkles, 
  Phone, 
  Mail, 
  CreditCard, 
  Building2, 
  FileText,
  UserCheck
} from 'lucide-react';
import { Contact } from '../../crm-analytics/types';
import { crmContactSyncService } from '../services/crmContactSyncService';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelectContact: (contact: Contact) => void;
  selectedContact: Contact | null;
  onClearSelection?: () => void;
  placeholder?: string;
  required?: boolean;
}

export const CrmContactAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onSelectContact,
  selectedContact,
  onClearSelection,
  placeholder = 'ישראל ישראלי (הקלד לחיפוש מהיר ב-CRM)',
  required = true,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to live contacts
  useEffect(() => {
    const unsub = crmContactSyncService.subscribe((list) => {
      setContacts(list);
    });
    return unsub;
  }, []);

  // Filter contacts based on current input
  const filteredContacts = value.trim()
    ? crmContactSyncService.search(value)
    : contacts.slice(0, 8); // show recent/first 8 on empty focus

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (contact: Contact) => {
    onSelectContact(contact);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredContacts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredContacts.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredContacts.length) {
        e.preventDefault();
        handleSelect(filteredContacts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef} dir="rtl">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full bg-slate-900 border rounded-xl px-4 py-3 pl-10 text-sm text-white focus:outline-none transition-all placeholder:text-slate-600 ${
            selectedContact
              ? 'border-indigo-500/80 bg-indigo-950/20 shadow-sm shadow-indigo-500/10'
              : 'border-slate-700 focus:border-indigo-500'
          }`}
          placeholder={placeholder}
          required={required}
        />

        {/* Action icons / Status inside input */}
        <div className="absolute left-3 flex items-center gap-1.5 pointer-events-auto">
          {selectedContact ? (
            <button
              type="button"
              onClick={() => {
                if (onClearSelection) onClearSelection();
                onChange('');
                inputRef.current?.focus();
              }}
              title="בטל שיוך לאיש קשר"
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-slate-500 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Connected CRM Contact Chip */}
      {selectedContact && (
        <div className="mt-1.5 flex items-center justify-between text-[11px] px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 animate-in fade-in">
          <div className="flex items-center gap-1.5 truncate">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold truncate">
              מחובר ל-CRM: {selectedContact.conta_name}
            </span>
            {selectedContact.tg1 && (
              <span className="text-slate-400 shrink-0">
                (ת.ז: {selectedContact.tg1})
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            נתונים סונכרנו ✓
          </span>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-[#0f1422] border border-slate-700 rounded-2xl shadow-2xl z-50 p-1.5 divide-y divide-slate-800/80 backdrop-blur-xl">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 flex items-center justify-between bg-slate-900/60 rounded-xl mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {value.trim() ? `תוצאות חירופש ב-CRM (${filteredContacts.length})` : 'אנשי קשר אחרונים מה-CRM'}
            </span>
            <span className="text-[10px] text-slate-500">חיפוש גמיש לפי שם פרטי / משפחה / טלפון / ת.ז</span>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              לא נמצא איש קשר תואם ב-CRM ל-"<span className="text-white font-medium">{value}</span>".
              <div className="text-[11px] text-slate-500 mt-1">
                תוכל להמשיך להקליד כרגיל והפרטים יישמרו אוטומטית כאיש קשר חדש.
              </div>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filteredContacts.map((contact, index) => {
                const isSelected = selectedContact?.id === contact.id;
                const isHighlighted = highlightedIndex === index;
                const tz = contact.tg1 || (contact as any).tz || (contact as any).idNumber || '';
                const phone = contact.conta_phone || (contact as any).phone || '';

                return (
                  <div
                    key={contact.id || index}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(contact)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 text-right ${
                      isSelected
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                        : isHighlighted
                        ? 'bg-slate-800/90 text-white'
                        : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                          <span>{contact.conta_name || 'איש קשר'}</span>
                          {contact.company_name && (
                            <span className="text-[10px] text-slate-400 font-normal truncate">
                              • {contact.company_name}
                            </span>
                          )}
                          {contact.is_lead && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-medium">
                              ליד
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                          {phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5 text-slate-500" />
                              {phone}
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-2.5 h-2.5 text-slate-500" />
                              {contact.email}
                            </span>
                          )}
                          {tz && (
                            <span className="text-slate-500 font-mono text-[10px]">
                              ת.ז: {tz}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {contact.total_spent ? (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          ₪{Number(contact.total_spent).toLocaleString('he-IL')}
                        </span>
                      ) : null}
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
