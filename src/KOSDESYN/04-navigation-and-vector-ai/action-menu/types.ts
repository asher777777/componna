import React from 'react';

export type ActionItemVariant = 'default' | 'danger' | 'success' | 'warning' | 'primary';

export interface KosActionItem {
  id: string;
  title: string;
  subtitle?: string;
  /**
   * שם אייקון מסוג Lucide או נתיב מדיה/SVG
   */
  icon?: string | React.ReactNode;
  /**
   * תגית טקסט משמאל (למשל 'פתח', 'פעיל', 'מידע')
   */
  badgeText?: string;
  badgeVariant?: 'accent' | 'cyan' | 'danger' | 'muted';
  variant?: ActionItemVariant;
  isLoading?: boolean;
  disabled?: boolean;
  /**
   * תיאור מורחב / הערות דינמיות המוצגות בפתיחת הלשונית
   */
  description?: string;
  /**
   * תת-פריטים או שדות הגדרה בתוך הלשונית (למשל: בתוך לשונית "הגדרות")
   */
  subItems?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    icon?: string;
    badgeText?: string;
    onClick?: () => void;
  }>;
  /**
   * שקע תוכן מותאם אישית שנפתח בלשונית (Custom Accordion Slot)
   */
  slotContent?: React.ReactNode;
  payload?: Record<string, unknown>;
}

export interface KosUserProfile {
  name: string;
  emailOrSubtext?: string;
  avatarUrl?: string;
  avatarAlt?: string;
  isOnline?: boolean;
}

export interface KosActionMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: KosUserProfile;
  headerTitle?: string;
  headerSubtitle?: string;
  items: KosActionItem[];
  onItemClick: (itemId: string, item: KosActionItem) => void;
  /**
   * מזהה הלשונית הפתוחה (אקסקלוסיבי - לכל היותר אחת פתוחה)
   */
  openTabId?: string | null;
  /**
   * שינוי מצב הלשונית
   */
  onToggleTab?: (tabId: string | null) => void;
  slotHeaderExtra?: React.ReactNode;
  slotFooterExtra?: React.ReactNode;
  className?: string;
}
