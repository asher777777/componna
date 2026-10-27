export type QuestionPageArchetype = 'saas' | 'automotive' | 'real_estate' | 'beauty' | 'community' | 'legal';

export interface QuestionCardItem {
  id: string;
  question: string;
  shortAnswer?: string;
  fullAnswer?: string;
  icon?: string;
  intentGoal?: 'deep_dive' | 'differentiation' | 'intent_conversion';
  category?: string;
  ctaLabel?: string;
  badge?: string;
  isRecommended?: boolean;
}

export interface QuestionPageData {
  pageId?: string;
  tenantId?: string;
  categoryTitle?: string;
  mainQuestion: string;
  mainAnswer: string;
  relatedQuestions: QuestionCardItem[];
}

export interface QuestionPageStyleConfig {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  capsuleBg?: string;
  capsuleBorder?: string;
  cardRadius?: 'rounded-2xl' | 'rounded-3xl' | 'rounded-xl';
  layoutBudget?: '60_30' | '55_35' | '65_25';
  shimmerEffect?: boolean;
}

export interface QuestionPageViewProps {
  data: QuestionPageData;
  styleConfig?: QuestionPageStyleConfig;
  lang?: 'he' | 'en' | 'ar' | 'fr' | 'ru';
  archetypeId?: QuestionPageArchetype;
  tenantProfile?: any;
  customDictionary?: Record<string, string>;
  onSelectRelatedQuestion?: (question: QuestionCardItem) => void;
  onAction?: (actionType: string, payload?: any) => void;
  onOpenEditor?: () => void;
  isOwner?: boolean;
}

export interface QuestionPageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: QuestionPageData;
  initialStyle?: QuestionPageStyleConfig;
  archetypeId?: QuestionPageArchetype;
  tenantProfile?: any;
  onSave: (updatedData: QuestionPageData, updatedStyle: QuestionPageStyleConfig) => Promise<void> | void;
}
