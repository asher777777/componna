import React, { useState, useEffect } from 'react';
import { 
  User, Sparkles, Tag, DollarSign, Target, Clock, Check, RefreshCw, Landmark, ChevronUp, ChevronDown, Maximize2, Minimize2, MessageCircle 
} from 'lucide-react';
import { Contact, CustomField } from '../types';
import { ContactModalHeader } from './contact-modal/ContactModalHeader';
import { ContactOverviewTab } from './contact-modal/ContactOverviewTab';
import { ContactAiCopilotTab } from './contact-modal/ContactAiCopilotTab';
import { ContactTagsTab } from './contact-modal/ContactTagsTab';
import { ContactFinancialTab } from './contact-modal/ContactFinancialTab';
import { ContactBankAndCheckTab } from './contact-modal/ContactBankAndCheckTab';
import { ContactCampaignsTab } from './contact-modal/ContactCampaignsTab';
import { ContactTimelineTab } from './contact-modal/ContactTimelineTab';
import { ContactWhatsAppTab } from './contact-modal/ContactWhatsAppTab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSave?: (updatedContact: Contact) => Promise<boolean>;
  customFields?: CustomField[];
}

export type TabType = 
  | 'overview' 
  | 'ai_copilot' 
  | 'tags_groups' 
  | 'financial' 
  | 'bank_and_checks' 
  | 'campaigns' 
  | 'timeline'
  | 'whatsapp';

export const Contact360Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  contact,
  onSave,
  customFields = [],
}) => {
  if (!isOpen || !contact) return null;

  const [formData, setFormData] = useState<Contact>({ ...contact });
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  useEffect(() => {
    setFormData({ ...contact });
  }, [contact]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFieldChange = (field: keyof Contact, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tag: string) => {
    const current = formData.tags || [];
    if (!current.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...current, tag] }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'פרופיל 360', icon: User },
    { id: 'ai_copilot', label: 'AI Copilot תובנות', icon: Sparkles },
    { id: 'tags_groups', label: 'תגיות וקהילות', icon: Tag, count: formData.tags?.length || 0 },
    { id: 'financial', label: 'עסקאות וכספים', icon: DollarSign },
    { id: 'bank_and_checks', label: 'פרטי בנק וצ\'קים', icon: Landmark },
    { id: 'campaigns', label: 'קמפיינים ושגריר', icon: Target },
    { id: 'whatsapp', label: 'אינטראקציות בוואטסאפ', icon: MessageCircle },
    { id: 'timeline', label: 'ציר זמן והערות', icon: Clock },
  ];

  return (
    <div 
      className={`fixed inset-0 z-50 flex ${
        isMobile ? 'items-end' : 'items-center justify-center p-3'
      } bg-black/60 backdrop-blur-sm transition-all duration-300`} 
      dir="rtl"
    >
      <div 
        className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden text-right transition-all duration-300 ${
          isMobile 
            ? isBottomSheetExpanded 
              ? 'h-[95vh] max-h-[95vh]' 
              : 'h-[75vh] max-h-[75vh]' 
            : 'max-h-[90vh]'
        }`}
      >
        {/* Mobile Swipe Grabber Bar */}
        {isMobile && (
          <div 
            onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
            className="w-full pt-3 pb-1 flex flex-col items-center justify-center cursor-pointer bg-gray-50/80 dark:bg-gray-900/80 hover:bg-gray-100 transition"
          >
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 font-semibold">
              {isBottomSheetExpanded ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>הקטן לחצי מסך</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>הגדל למסך מלא (Bottom Sheet)</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <ContactModalHeader contact={formData} onClose={onClose} />

        {/* Tab Navigation (Scrollable on Mobile) */}
        <div className="flex items-center gap-1 px-3 md:px-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar bg-gray-50/50 dark:bg-gray-900/40">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-2.5 md:px-3 text-xs font-medium border-b-2 transition shrink-0 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {activeTab === 'overview' && (
            <ContactOverviewTab formData={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'ai_copilot' && (
            <ContactAiCopilotTab formData={formData} onAddTag={handleAddTag} />
          )}
          {activeTab === 'tags_groups' && (
            <ContactTagsTab formData={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'financial' && (
            <ContactFinancialTab formData={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'bank_and_checks' && (
            <ContactBankAndCheckTab formData={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'campaigns' && (
            <ContactCampaignsTab formData={formData} />
          )}
          {activeTab === 'timeline' && (
            <ContactTimelineTab formData={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'whatsapp' && (
            <ContactWhatsAppTab formData={formData} />
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 md:p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition"
          >
            סגור
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>שמור שינויים</span>
          </button>
        </div>

      </div>
    </div>
  );
};
