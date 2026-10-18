import React, { useMemo } from 'react';
import { useKosLive } from '../context/KosLiveContext';
import { KosLiveHeader } from '../components/KosLiveHeader';
import { ProjectsListView } from '../components/ProjectsListView';
import { OneClickPageConverterModal } from '../components/OneClickPageConverterModal';
import { LivingTimelineEditor } from '../components/LivingTimelineEditor';
import { LivingPlayerContainer } from '../components/LivingPlayerContainer';
import { EmbedPublishModal } from '../components/EmbedPublishModal';
import { LivingCampaignContract, LivingSceneContract } from '../types';
import { DEFAULT_LIVING_CAMPAIGN } from '../config';

export const KosLiveStudioView: React.FC = () => {
  const { tab, activeProject, activeCampaign } = useKosLive();

  // Convert activeProject to campaign for preview if activeProject exists
  const previewCampaign = useMemo<LivingCampaignContract>(() => {
    if (!activeProject || !activeProject.scenes || activeProject.scenes.length === 0) {
      return activeCampaign || DEFAULT_LIVING_CAMPAIGN;
    }

    const scenesMap: Record<string, LivingSceneContract> = {};
    activeProject.scenes.forEach(s => {
      scenesMap[s.id] = s;
    });

    const initialId = activeProject.scenes[0]?.id || 'scene_1';

    return {
      id: activeProject.id,
      slug: activeProject.campaignSlug || `campaign-${activeProject.id}`,
      name: activeProject.title,
      description: activeProject.description,
      initialSceneId: initialId,
      scenes: scenesMap,
      aspectRatio: activeProject.aspectRatio || '9:16',
      isPublished: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        primaryColor: '#eab308',
        enableVoice: true,
        autoPlay: true,
        language: 'he-IL'
      }
    };
  }, [activeProject, activeCampaign]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none" dir="rtl">
      
      {/* Top Header */}
      <KosLiveHeader />

      {/* Main Content Body */}
      <main className="flex-1 py-6 px-3 sm:px-6 overflow-y-auto">
        {tab === 'projects' && <ProjectsListView />}
        {tab === 'converter' && <OneClickPageConverterModal />}
        {tab === 'timeline' && <LivingTimelineEditor />}
        {tab === 'preview' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-black text-white">סימולטור בדיקה חיה של העמוד החי</h2>
              <p className="text-xs text-slate-400">
                התנסו בנגיעה בכפתורי ההסתעפות, מילוי טופס הלידים או שיחה קולית עם הפרזנטור
              </p>
            </div>
            <LivingPlayerContainer
              initialCampaign={previewCampaign}
              aspectRatio="9:16"
              className="w-full"
            />
          </div>
        )}
        {tab === 'embed' && <EmbedPublishModal />}
      </main>

    </div>
  );
};
