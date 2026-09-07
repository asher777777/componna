import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams, useSearchParams } from 'react-router-dom';
import { PlayerContainer } from '../components/PlayerContainer';
import { ProjectsHubView } from '../components/ProjectsHubView';
import { PlayerMachineProvider } from '../context/PlayerMachineContext';
import { useFlowPlayerModule } from '../context/ModuleContext';
import { FirestoreService } from '../services/firestoreService';
import { DEFAULT_CAMPAIGN_CONFIG } from '../config';
import { CampaignConfig } from '../types';
import { Loader2, PlayCircle, FolderKanban, Plus } from 'lucide-react';
import { NewProjectModal } from '../components/NewProjectModal';

const CampaignPlayerView: React.FC = () => {
  const { campaignId } = useParams<{ campaignId?: string }>();
  const [searchParams] = useSearchParams();
  const isLive = searchParams.get('mode') === 'live' || searchParams.get('standalone') === 'true';

  const { db, collections, config } = useFlowPlayerModule();
  const [campaign, setCampaign] = useState<CampaignConfig>(
    () => config.initialCampaign || DEFAULT_CAMPAIGN_CONFIG
  );
  const [activeTab, setActiveTab] = useState<'player' | 'projects'>('player');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCampaign() {
      const targetId = campaignId || config.campaignId || DEFAULT_CAMPAIGN_CONFIG.id;

      if (db) {
        try {
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 2500)
          );
          const loadPromise = FirestoreService.getCampaignConfig(db, collections, targetId);
          const loaded = await Promise.race([loadPromise, timeoutPromise]);
          if (loaded && isMounted) {
            setCampaign(loaded);
            return;
          }
        } catch (err) {
          console.warn(
            '[ModuleRoutes] Failed to fetch campaign from Firestore, using default config:',
            err
          );
        }
      }
    }

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [campaignId, config.campaignId, config.initialCampaign, db, collections]);

  const handleSelectProjectFromHub = (selectedCampaign: CampaignConfig) => {
    setCampaign({ ...selectedCampaign });
    setActiveTab('player');
  };

  const handleNewProjectCreated = (newCamp: CampaignConfig) => {
    setCampaign(newCamp);
    setActiveTab('player');
  };

  if (loading || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
        <span className="text-sm">טוען קמפיין אינטראקטיבי מעודכן מהשרת...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center" dir="rtl">
      {/* Top Module Main Navigation Tabs (Hidden in Live/Standalone mode) */}
      {!isLive && (
        <div className="w-full max-w-5xl px-4 pt-3 pb-1 flex items-center justify-between flex-wrap gap-2">
          {/* Main Tabs Segmented Control */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-2xl p-1 shadow-md">
            <button
              onClick={() => setActiveTab('player')}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'player'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>נגן ועריכת תהליך</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>כל הפרויקטים (Projects Hub)</span>
            </button>
          </div>

          {/* Quick Action: New Project Modal Button */}
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-yellow-400" />
            <span>פרויקט חדש</span>
          </button>
        </div>
      )}

      {/* Tab 1: Interactive Player */}
      {activeTab === 'player' && (
        <PlayerMachineProvider
          key={`${campaign.id}_${campaign.slug || ''}_${campaign.updatedAt || '0'}`}
          initialCampaign={campaign}
        >
          <PlayerContainer
            onOpenProjectsTab={() => setActiveTab('projects')}
            onNewProjectCreated={handleNewProjectCreated}
          />
        </PlayerMachineProvider>
      )}

      {/* Tab 2: Projects Hub */}
      {activeTab === 'projects' && (
        <ProjectsHubView
          onSelectProject={handleSelectProjectFromHub}
          activeCampaignSlug={campaign.slug || campaign.id}
        />
      )}

      {/* Global New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={handleNewProjectCreated}
      />
    </div>
  );
};

export const FlowPlayerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<CampaignPlayerView />} />
      <Route path=":campaignId" element={<CampaignPlayerView />} />
    </Routes>
  );
};