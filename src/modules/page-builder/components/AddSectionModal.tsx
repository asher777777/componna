import React, { useState } from 'react';
import { SECTION_REGISTRY, SectionDefinition } from '../registry/sectionRegistry';
import { SectionType } from '../types/pageBuilder.types';
import { PageBuilderModal } from '../ui/PageBuilderModal';
import { Plus, Search, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (type: SectionType) => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const categories = [
    { id: 'all', label: 'כל האזורים' },
    { id: 'headers', label: 'כותרות ו-Hero' },
    { id: 'content', label: 'תוכן ושירותים' },
    { id: 'media', label: 'גלריות ומדיה' },
    { id: 'campaign', label: 'קמפיינים ותרומות' },
    { id: 'marketing', label: 'שיווק והנעה לפעולה' },
    { id: 'contact', label: 'צור קשר וקהילה' },
  ];

  const allSections = Object.values(SECTION_REGISTRY);

  const filteredSections = allSections.filter((def) => {
    const matchesCat = selectedCategory === 'all' || def.category === selectedCategory;
    const matchesSearch =
      def.name.toLowerCase().includes(search.toLowerCase()) ||
      def.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelect = (type: SectionType) => {
    onAddSection(type);
    onClose();
  };

  return (
    <PageBuilderModal
      isOpen={isOpen}
      onClose={onClose}
      title="הוספת אזור חדש לעמוד"
      subtitle="בחרו אזור מתוך הקטלוג העשיר להטמעה מיידית בדף"
      maxWidth="4xl"
    >
      <div className="flex flex-col gap-6 text-right" dir="rtl">
        {/* Search & Category Pills */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="חיפוש אזור לפי שם או תיאור..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Available Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSections.map((def) => {
            const Icon = def.icon;
            return (
              <div
                key={def.type}
                onClick={() => handleSelect(def.type)}
                className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {def.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {def.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {def.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף אזור זה</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </PageBuilderModal>
  );
};
