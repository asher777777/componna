import React, { useMemo } from 'react';
import { useKosLive } from '../context/KosLiveContext';
import { KosLiveHeader } from '../components/KosLiveHeader';
import { ProjectsListView } from '../components/ProjectsListView';
import { OneClickPageConverterModal } from '../components/OneClickPageConverterModal';
import { LivingTimelineEditor } from '../components/LivingTimelineEditor';
import { LivingPlayerContainer } from '../components/LivingPlayerContainer';
import { EmbedPublishModal } from '../components/EmbedPublishModal';
import { TeleprompterModal } from '../components/TeleprompterModal';
import { HeyGenAvatarModal } from '../components/HeyGenAvatarModal';
import { LivingCampaignContract, LivingSceneContract } from '../types';
import { DEFAULT_LIVING_CAMPAIGN } from '../config';

export const KosLiveStudioView: React.FC = () => {
  const { tab, activeProject, setActiveProject, activeCampaign, setActiveCampaign } = useKosLive();

  // Convert activeProject to campaign for preview if activeProject exists
  const previewCampaign = useMemo<LivingCampaignContract>(() => {
    if (!activeProject || !activeProject.scenes || activeProject.scenes.length === 0) {
      return activeCampaign || DEFAULT_LIVING_CAMPAIGN;
    }

    const scenesMap: Record<string, LivingSceneContract> = {};
    activeProject.scenes.forEach(s => {
      scenesMap[s.id] = {
        ...s,
        videoUrl: s.renderedVideoUrl || s.videoUrl || '',
        fallbackImageUrl: s.backgroundMediaUrl || s.fallbackImageUrl || ''
      };
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

  const handleCampaignUpdatedFromPlayer = (updatedCamp: LivingCampaignContract) => {
    setActiveCampaign(updatedCamp);
    if (activeProject) {
      const updatedScenes = Object.values(updatedCamp.scenes || {}).map((scn, idx) => ({
        ...(activeProject.scenes.find(s => s.id === scn.id) || {}),
        ...scn,
        sceneNumber: idx + 1,
        dialogueScript: scn.scriptText || '',
        scriptText: scn.scriptText || '',
        renderedVideoUrl: scn.videoUrl || '',
        videoUrl: scn.videoUrl || '',
        backgroundMediaUrl: scn.fallbackImageUrl || '',
        fallbackImageUrl: scn.fallbackImageUrl || ''
      }));
      setActiveProject({
        ...activeProject,
        title: updatedCamp.name || activeProject.title,
        campaignSlug: updatedCamp.slug || activeProject.campaignSlug,
        scenes: updatedScenes as any,
        updatedAt: new Date().toISOString()
      });
    }
  };

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
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            <div className="mb-3 text-center">
              <h2 className="text-lg font-black text-white">
                הנגן האינטראקטיבי וסטודיו סצנות, וידאו ותמונות
              </h2>
              <p className="text-xs text-slate-400">
                צרו וערכו סצנות, העלו או בחרו וידאו ותמונות מגלריית המדיה, הגדירו קרוסלת כרטיסים וטפסים בזמן אמת
              </p>
            </div>
            <LivingPlayerContainer
              initialCampaign={previewCampaign}
              aspectRatio="9:16"
              className="w-full"
              onCampaignUpdated={handleCampaignUpdatedFromPlayer}
            />
          </div>
        )}
        {tab === 'embed' && <EmbedPublishModal />}
      </main>

      {/* Studio Modals */}
      <TeleprompterModal />
      <HeyGenAvatarModal />
    </div>
  );
};
