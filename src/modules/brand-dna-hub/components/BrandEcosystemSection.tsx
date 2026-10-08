import React, { useState } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { Plus, Trash2, Box, Users, Calendar, Layers, Sparkles, Briefcase } from 'lucide-react';
import { generateAiEcosystemItems, generateAiBusinessPackages } from '../services/geminiBrandPrompt';
import { FlagshipProductsEditor } from './FlagshipProductsEditor';

export const BrandEcosystemSection: React.FC = () => {
  const { brandDna, setFullBrandDna } = useBrandDna();
  const eco = brandDna.ecosystem || { services: [], products: [], annualEvents: [], communities: [] };

  const [services, setServices] = useState<string[]>(eco.services || []);
  const [products, setProducts] = useState<any[]>(eco.products || []);
  const [events, setEvents] = useState<string[]>(eco.annualEvents || []);
  const [communities, setCommunities] = useState<string[]>(eco.communities || []);

  const handleSave = (key: 'services' | 'products' | 'annualEvents' | 'communities', val: string[]) => {
    setFullBrandDna({
      ...brandDna,
      ecosystem: {
        ...eco,
        [key]: val,
      }
    });
  };

  const ArrayEditor = ({ 
    title, 
    icon: Icon, 
    items, 
    setItems, 
    fieldKey, 
    placeholder 
  }: { 
    title: string; 
    icon: any; 
    items: string[]; 
    setItems: any; 
    fieldKey: 'services' | 'products' | 'annualEvents' | 'communities';
    placeholder: string;
  }) => {
    const [newVal, setNewVal] = useState('');

        const [isGenerating, setIsGenerating] = useState(false);

    const handleAiGenerate = async () => {
      setIsGenerating(true);
      const generated = await generateAiEcosystemItems(brandDna, title, items);
      if (generated && generated.length > 0) {
        const arr = [...items, ...generated];
        setItems(arr);
        handleSave(fieldKey, arr);
      }
      setIsGenerating(false);
    };

    const add = () => {
      if (newVal.trim()) {
        const arr = [...items, newVal.trim()];
        setItems(arr);
        handleSave(fieldKey, arr);
        setNewVal('');
      }
    };

    const remove = (idx: number) => {
      const arr = [...items];
      arr.splice(idx, 1);
      setItems(arr);
      handleSave(fieldKey, arr);
    };

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon className="w-4 h-4 text-indigo-500" />
              {title}
            </h3>
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'מייצר...' : 'הצע רעיונות עם AI'}
            </button>
          </div>
        
        <div className="space-y-3 mb-4">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 pr-2">{it}</span>
              <button onClick={() => remove(i)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-slate-400 text-center py-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              טרם נוספו פריטים
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={placeholder}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button onClick={add} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            הוסף
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">מבנה הארגון והשירותים (Ecosystem)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">אילו מוצרים, שירותים, אירועים וקהילות מרכיבים את הפעילות?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArrayEditor 
          title="שירותים מרכזיים" 
          icon={Sparkles} 
          items={services} 
          setItems={setServices} 
          fieldKey="services" 
          placeholder="לדוגמה: ייעוץ עסקי, ליווי אסטרטגי..." 
        />
        <FlagshipProductsEditor />
        <ArrayEditor 
          title="אירועי שיא (Annual Events)" 
          icon={Calendar} 
          items={events} 
          setItems={setEvents} 
          fieldKey="annualEvents" 
          placeholder="לדוגמה: כנס הקהל השנתי, סדנת קיץ..." 
        />
        <ArrayEditor 
          title="קהילות הארגון" 
          icon={Users} 
          items={communities} 
          setItems={setCommunities} 
          fieldKey="communities" 
          placeholder="לדוגמה: מועדון לקוחות VIP, קהילת בוגרים..." 
        />
  
            </div>

      {/* Business Packages Section */}
      <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              חבילות שירות לעסקים (Business Packages)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">חבילות פתרונות מותאמות אישית לקהלי היעד, המשלבות את היכולות שלנו ללקוחות עסקיים.</p>
          </div>
          <button
            onClick={async () => {
              const res = await generateAiBusinessPackages(brandDna);
              if (res && res.length > 0) {
                const current = brandDna.ecosystem?.businessPackages || [];
                setFullBrandDna({
                  ...brandDna,
                  ecosystem: {
                    ...brandDna.ecosystem,
                    services: brandDna.ecosystem?.services || [],
                    products: brandDna.ecosystem?.products || [],
                    annualEvents: brandDna.ecosystem?.annualEvents || [],
                    communities: brandDna.ecosystem?.communities || [],
                    businessPackages: [...current, ...res.map(pkg => ({ id: `pkg-${Date.now()}-${Math.random()}`, ...pkg }))]
                  }
                });
              }
            }}
            className="flex items-center gap-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors font-bold shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            הרכב חבילות באמצעות AI
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(eco.businessPackages || []).length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm">אין עדיין חבילות שירות לעסקים. לחץ על כפתור ה-AI כדי להרכיב חבילות מומלצות לפי ה-DNA של המותג!</p>
            </div>
          ) : (
            (eco.businessPackages || []).map((pkg) => (
              <div key={pkg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden group">
                <button 
                  onClick={() => {
                    const newPkgs = (eco.businessPackages || []).filter(p => p.id !== pkg.id);
                    setFullBrandDna({
                      ...brandDna,
                      ecosystem: { ...eco, businessPackages: newPkgs }
                    });
                  }}
                  className="absolute top-4 left-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 pr-2 border-r-4 border-indigo-500">{pkg.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">תיאור המוצר/החבילה</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.description}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">נקודת הכאב (Pain Point)</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.painPointsAddressed}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">מעלות על פני מתחרים</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.competitiveAdvantage}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">קהל יעד</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.targetAudience}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] text-indigo-500 dark:text-indigo-400 font-bold mb-1">הצעה עסקית וקריאה לפעולה (CTA)</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{pkg.callToAction}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
