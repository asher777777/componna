import React from 'react';
import { CommunitySectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { Users, MessageCircle, Sliders, Shield, Calendar, Heart, Eye } from 'lucide-react';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';

interface CommunityEditorProps {
  config: CommunitySectionConfig;
  onChange: (updated: CommunitySectionConfig) => void;
}

export const CommunityEditor: React.FC<CommunityEditorProps> = ({ config, onChange }) => {
  const update = <K extends keyof CommunitySectionConfig>(field: K, value: CommunitySectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const gateMode = config.gateMode || 'auto';

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      {/* Community Connection & Gate Simulation */}
      <PageBuilderAccordion
        title="חיבור קהילה והפרדת הרשאות (Gate)"
        icon={<Shield className="w-4 h-4 text-amber-500" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              בחר קהילה מתוך הטננט
            </label>
            <CapabilitySlot
              name="group-selector"
              props={{
                selectedGroupId: config.selectedCommunityId,
                onSelect: (group: any) => {
                  onChange({
                    ...config,
                    selectedCommunityId: group.id,
                    title: group.name || config.title,
                    description: group.blueprint?.mission || group.description || config.description,
                    blueprint: group.blueprint || config.blueprint,
                  });
                },
              }}
              fallback={
                <PageBuilderInput
                  label="מזהה קהילה (ID)"
                  value={config.selectedCommunityId || ''}
                  onChange={(e) => update('selectedCommunityId', e.target.value)}
                  placeholder="הזן מזהה קהילה מ-KosTogether"
                  dir="ltr"
                />
              }
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              מצב תצוגה מקדימה בעורך (Gate Simulation)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => update('gateMode', 'auto')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  gateMode === 'auto'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                אוטומטי (לפי משתמש)
              </button>

              <button
                type="button"
                onClick={() => update('gateMode', 'simulate-guest')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  gateMode === 'simulate-guest'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                הדמיית אורח (נעול)
              </button>

              <button
                type="button"
                onClick={() => update('gateMode', 'simulate-member')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  gateMode === 'simulate-member'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                הדמיית חבר רשום
              </button>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1.5">
              שליטה זו מאפשרת לך לבדוק בעורך כיצד הדף נראה לאורח לא מחובר לעומת חבר רשום.
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <span>הצגת לוח מפגשים ואירועים</span>
              <input
                type="checkbox"
                checked={config.showEventsCalendar ?? true}
                onChange={(e) => update('showEventsCalendar', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <span>הצגת סיפורים משותפים והווי</span>
              <input
                type="checkbox"
                checked={config.showStoriesFeed ?? true}
                onChange={(e) => update('showStoriesFeed', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
            </label>
          </div>
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="כותרות וטקסט קהילה" icon={<Users className="w-4 h-4 text-indigo-400" />} defaultOpen={false}>
        <PageBuilderInput
          label="כותרת ראשית"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: קהילת הארגון"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: מרחב המפגש וההווי המשותף"
        />
        <PageBuilderTextarea
          label="תיאור הקהילה"
          value={config.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
        />
        <PageBuilderInput
          label="ציטוט / משפט השראה"
          value={config.quote || ''}
          onChange={(e) => update('quote', e.target.value)}
          placeholder="ציטוט קהילתי..."
        />
      </PageBuilderAccordion>

      <PageBuilderAccordion title="כפתור וואטסאפ ותמונה" icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PageBuilderInput
            label="טקסט כפתור וואטסאפ"
            value={config.buttonText || ''}
            onChange={(e) => update('buttonText', e.target.value)}
            placeholder="למשל: הצטרפות לקבוצת הוואטסאפ"
          />
          <PageBuilderInput
            label="מספר וואטסאפ (כולל קידומת 972...)"
            value={config.whatsappNumber || ''}
            onChange={(e) => update('whatsappNumber', e.target.value)}
            placeholder="972545947701"
            dir="ltr"
          />
        </div>

        <PageBuilderImageUpload
          label="תמונת קהילה / מנהל"
          value={config.imageSrc}
          onChange={(url) => update('imageSrc', url)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <PageBuilderInput
            label="כותרת תגית (Badge)"
            value={config.badgeTitle || ''}
            onChange={(e) => update('badgeTitle', e.target.value)}
            placeholder="למשל: קהילה פעילה"
          />
          <PageBuilderInput
            label="תת-כותרת תגית"
            value={config.badgeSubtitle || ''}
            onChange={(e) => update('badgeSubtitle', e.target.value)}
            placeholder="למשל: חברים רשומים בטננט"
          />
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'community'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="community"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
