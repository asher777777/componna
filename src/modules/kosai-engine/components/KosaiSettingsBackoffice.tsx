import React, { useState, useEffect } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { kosaiRulesService } from '../services/kosaiFirestoreService';
import { KosaiRule } from '../types';
import { Bot, Plus, Save, Trash2, Edit } from 'lucide-react';

export const KosaiSettingsBackoffice: React.FC = () => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [rules, setRules] = useState<KosaiRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRules = async () => {
    setLoading(true);
    const r = await kosaiRulesService.getRules(db!, tenantId);
    setRules(r);
    setLoading(false);
  };

  useEffect(() => {
    loadRules();
  }, [db!, tenantId]);

  const handleCreateRule = async () => {
    const newRule: KosaiRule = {
      id: `rule_${Date.now()}`,
      name: 'כלל חדש',
      slugPattern: '/edit/*',
      systemPromptAddon: 'אתה מומחה UI...',
      enabledCapabilities: ['ADD_SECTION', 'UPDATE_SECTION'],
      isActive: true,
      createdAt: Date.now()
    };
    await kosaiRulesService.saveRule(db!, tenantId, newRule);
    loadRules();
  };

  const handleDelete = async (id: string) => {
    await kosaiRulesService.deleteRule(db!, tenantId, id);
    loadRules();
  };

  if (loading) return <div className="p-8 text-white">טוען חוקי KOSAI...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            הגדרות KOSAI Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">נהל את התנהגות מנוע ה-AI עבור מסכים שונים במערכת</p>
        </div>
        <button onClick={handleCreateRule} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus className="w-4 h-4" />
          כלל חדש
        </button>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">{rule.name}</h3>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 font-mono" dir="ltr">{rule.slugPattern}</span>
                {rule.isActive ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">פעיל</span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">כבוי</span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2 max-w-2xl">{rule.systemPromptAddon}</p>
              <div className="flex gap-2">
                {rule.enabledCapabilities.map(c => (
                  <span key={c} className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded-md border border-indigo-500/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(rule.id)} className="p-2 text-red-400 hover:text-white bg-red-950 hover:bg-red-900 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl border-dashed">
            <p className="text-slate-500">לא הוגדרו עדיין חוקים ל-KOSAI ב-Tenant זה.</p>
          </div>
        )}
      </div>
    </div>
  );
};
