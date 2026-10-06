import React from 'react';
import {
  Layers,
  Megaphone,
  Users,
  CreditCard,
  Video,
  Settings,
  Sparkles,
  UserPlus,
  Image,
  MessageCircle,
  FilePlus,
  Key
} from 'lucide-react';
import { useControlCenter } from '../context/ControlCenterContext';
import { CATEGORY_DEFINITIONS } from '../config';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useNavigate } from 'react-router-dom';

export const QuickActionsPillBar: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    setQuickLeadModalOpen,
  } = useControlCenter();

  const { getCapability } = useHostCapabilities();
  const { openConnectorModal } = useSystemConnection();
  const navigate = useNavigate();

  const handleOpenMediaPicker = async () => {
    const mediaPicker = getCapability<MediaPickerContract>('media-picker');
    if (mediaPicker) {
      await mediaPicker.openPicker({ accept: '*/*' });
    } else {
      navigate('/media-gallery-hub');
    }
  };

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'marketing': return Megaphone;
      case 'crm': return Users;
      case 'finance': return CreditCard;
      case 'media': return Video;
      case 'core': return Settings;
      default: return Layers;
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-slate-800/40">
      
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
        {Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => {
          const Icon = getCategoryIcon(key);
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{def.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800/80 text-slate-500'
              }`}>
                {def.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Global Quick Action Triggers */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
        <span className="text-[11px] text-slate-500 font-medium hidden lg:inline">פעולות ישירות:</span>

        {/* Quick Lead */}
        <button
          onClick={() => setQuickLeadModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium transition cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>הזנת ליד</span>
        </button>

        {/* Media Picker */}
        <button
          onClick={handleOpenMediaPicker}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/20 rounded-xl text-xs font-medium transition cursor-pointer shrink-0"
        >
          <Image className="w-3.5 h-3.5" />
          <span>העלאת מדיה</span>
        </button>

        {/* New Landing Page */}
        <button
          onClick={() => navigate('/page-builder')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-medium transition cursor-pointer shrink-0"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>עמוד נחיתה</span>
        </button>

        {/* API Keys */}
        <button
          onClick={() => openConnectorModal('apiKeys')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-medium transition cursor-pointer shrink-0"
        >
          <Key className="w-3.5 h-3.5" />
          <span>מפתחות מערכת</span>
        </button>
      </div>

    </div>
  );
};
