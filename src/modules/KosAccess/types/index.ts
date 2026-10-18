import {
  AccessibilityContrastMode,
  AccessibilityFontSize,
  AccessibilityCursorMode,
  AccessibilityUserPreferences,
  AccessibilityDeclarationDocument,
  AccessibilityFeedbackSubmission,
  KosAccessContract
} from '../../../core/contracts';

export type {
  AccessibilityContrastMode,
  AccessibilityFontSize,
  AccessibilityCursorMode,
  AccessibilityUserPreferences,
  AccessibilityDeclarationDocument,
  AccessibilityFeedbackSubmission,
  KosAccessContract
};

export type AccessibilityPresetId =
  | 'none'
  | 'motor_impaired'
  | 'blind_screen_reader'
  | 'color_blind'
  | 'dyslexia'
  | 'adhd_focus'
  | 'vision_impaired'
  | 'elderly';

export interface AccessibilityPreset {
  id: AccessibilityPresetId;
  title: string;
  description: string;
  iconName: string;
  preferences: Partial<AccessibilityUserPreferences>;
}

export interface ComplianceCheckItem {
  id: string;
  category: 'perceivable' | 'operable' | 'understandable' | 'robust' | 'legal';
  lawReference: string; // e.g. 'תקנה 35 / ת"י 5568 / WCAG 2.2 AA'
  title: string;
  description: string;
  mandatory: boolean;
  status: 'passed' | 'warning' | 'info';
}
