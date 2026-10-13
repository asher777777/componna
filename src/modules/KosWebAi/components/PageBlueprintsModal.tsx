import React, { useState } from 'react';
import { PAGE_BLUEPRINTS } from '../blueprints/pageBlueprints';
import { PageTemplateBlueprint } from '../types';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import {
  Sparkles,
  Zap,
  MapPin,
  GraduationCap,
  Users,
  Heart,
  X,
  Check,
  ArrowLeft,
  LayoutTemplate,
  Layers,
} from 'lucide-react';

import { hydrateBlueprintWithBrandDna } from '../blueprints/pageBlueprints';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';

interface PageBlueprintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlueprint: (blueprintConfig: PageBuilderConfig) => void;
}

export const PageBlueprintsModal: React.FC<PageBlueprintsModalProps> = ({
  isOpen,
  onClose,
  onSelectBlueprint,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = selectedCategory === 'all'
    ? PAGE_BLUEPRINTS
    : PAGE_BLUEPRINTS.filter((b) => b.category === selectedCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-emerald-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-pink-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      default:
        return <LayoutTemplate className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleApply = (blueprint: PageTemplateBlueprint) => {
    const hydrated = hydrateBlueprintWithBrandDna(blueprint.config, brandDna);
    const freshConfig: PageBuilderConfig = {
      ...hydrated,
      pageId: `page_bp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSelectBlueprint(freshConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#08090d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutTemplate className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">ספריית תבניות פרימיום (Page Blueprints)</h2>
              <p className="text-xs text-slate-400">
                5 תבניות ארכיטקטורה מוכנות מראש לטעינה בלחיצה אחת – כל תבנית כוללת שלד של 5-7 אזורים מחוברים.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-900/20 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'כל התבניות (5)' },
            { id: 'sales', label: 'מכירה והשקה' },
            { id: 'geo', label: 'שירות מקומי ו-SEO' },
            { id: 'authority', label: 'מאמר ידע וסמכות' },
            { id: 'community', label: 'קהילה והרשמה' },
            { id: 'campaign', label: 'קמפיין וגיוס' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((bp) => (
              <div
                key={bp.id}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                      {getIcon(bp.icon)}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                      {bp.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {bp.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {bp.description}
                  </p>

                  {/* Section Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {bp.sectionTypes.map((sec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {bp.sectionTypes.length} אזורים מחוברים
                  </span>

                  <button
                    type="button"
                    onClick={() => handleApply(bp)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all group-hover:scale-105 cursor-pointer"
                  >
                    <span>החל תבנית זו</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex justify-between items-center text-xs text-slate-400">
          <span>ניתן לערוך, להוסיף ולסדר מחדש כל אזור לאחר טעינת התבנית.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageBlueprintsModal;
