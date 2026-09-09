import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sparkles,
  UserPlus,
  HelpCircle,
  PlusSquare,
  Smartphone,
  Monitor,
  Square,
  Check,
} from 'lucide-react';
import { PROJECT_TEMPLATES, ProjectTemplate } from '../config/templates';
import { CampaignConfig, AspectRatioType, FlowNodeState } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { useFlowPlayerModule } from '../context/ModuleContext';
import { Film } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (campaign: CampaignConfig) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { db, collections } = useFlowPlayerModule();

  const [activeSourceTab, setActiveSourceTab] = useState<'templates' | 'video_studio'>('templates');
  const [studioProjects, setStudioProjects] = useState<any[]>([]);
  const [selectedStudioProjectId, setSelectedStudioProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('פרויקט אינטראקטיבי חדש');
  const [slug, setSlug] = useState<string>(() => `flow_project_${Date.now().toString().slice(-4)}`);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('sales_rep');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setProjectName('פרויקט אינטראקטיבי חדש');
      setSlug(`flow_project_${Date.now().toString().slice(-4)}`);
      setSelectedTemplateId('sales_rep');
      setAspectRatio('9:16');
      setIsCreating(false);

      // Load studio projects from local storage and firestore
      const loadStudioProjects = async () => {
        try {
          const local = localStorage.getItem('comona_video_studio_projects');
          const localList = local ? JSON.parse(local) : [];
          if (db) {
            const snap = await getDocs(collection(db, 'sdo_video_projects'));
            const fsList: any[] = [];
            snap.forEach(d => fsList.push({ id: d.id, ...d.data() }));
            setStudioProjects(fsList.length > 0 ? fsList : localList);
          } else {
            setStudioProjects(localList);
          }
        } catch (err) {
          console.warn('[NewProjectModal] Failed to load video studio projects:', err);
        }
      };
      loadStudioProjects();
    }
  }, [isOpen, db]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setProjectName(val);
    const latinOnly = val
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    if (latinOnly && latinOnly.length >= 2) {
      setSlug(latinOnly);
    }
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const safeName = projectName.trim() || 'פרויקט אינטראקטיבי חדש';
    
    let safeSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    if (!safeSlug) {
      safeSlug = `flow_${Date.now().toString().slice(-6)}`;
    }

    setIsCreating(true);
    try {
      if (activeSourceTab === 'video_studio' && selectedStudioProjectId) {
        const sp = studioProjects.find((p) => p.id === selectedStudioProjectId);
        if (sp && sp.scenes?.length > 0) {
          const initialId = sp.scenes[0]?.id || 'scene_1';
          const states: Record<string, FlowNodeState> = {};

          sp.scenes.forEach((scn: any, idx: number) => {
            const nextScn = sp.scenes[idx + 1];
            const overlays: any[] = [];

            if (scn.interactiveCards && scn.interactiveCards.length > 0) {
              overlays.push({
                id: `card_${scn.id}`,
                type: 'info_card',
                position: 'top',
                title: scn.interactiveCards[0].title,
                subtitle: scn.interactiveCards[0].description,
                badge: scn.interactiveCards[0].badge,
              });
            }

            if (scn.interactiveActions && scn.interactiveActions.length > 0) {
              overlays.push({
                id: `act_${scn.id}`,
                type: 'quick_replies',
                position: 'bottom',
                actions: scn.interactiveActions.map((a: any) => ({
                  id: a.id,
                  label: a.label,
                  targetNodeId: a.targetSceneId || nextScn?.id || scn.id,
                  variant: a.variant || 'primary',
                })),
              });
            } else if (nextScn) {
              overlays.push({
                id: `act_${scn.id}`,
                type: 'quick_replies',
                position: 'bottom',
                actions: [
                  {
                    id: `next_${scn.id}`,
                    label: idx === 0 ? '🚀 בוא נתחיל בהדגמה' : 'המשך לסצנה הבאה',
                    targetNodeId: nextScn.id,
                    variant: 'primary',
                  },
                ],
              });
            }

            const videoSrc =
              scn.renderedVideoUrl ||
              (scn.backgroundType === 'video' ? scn.backgroundMediaUrl : undefined) ||
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

            states[scn.id] = {
              id: scn.id,
              name: scn.title,
              description: scn.dialogueScript,
              videoUrl: videoSrc,
              fallbackVideoUrl: scn.backgroundMediaUrl || videoSrc,
              autoPlay: true,
              soundEnabled: true,
              loop: false,
              autoTransitionOnEnd: scn.autoTransitionOnEnd ?? (idx < sp.scenes.length - 1),
              autoTransitionDelaySec: scn.autoTransitionDelaySec || 0,
              autoTransitionTarget: scn.autoTransitionTargetSceneId || nextScn?.id || '',
              overlays,
              micPosition: scn.enableVoiceTrigger ? 'bottom' : 'hidden',
              micActionType: 'open_text_input',
            };
          });

          const newCampaign: CampaignConfig = {
            id: safeSlug,
            slug: safeSlug,
            name: safeName || sp.title,
            presenterId: sp.scenes[0]?.avatarId || 'avatar_wayne',
            initialNodeId: initialId,
            states,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isPublished: true,
            settings: {
              defaultAspectRatio: aspectRatio,
              autoPlay: true,
              primaryColor: '#EAB308',
              enableVoice: true,
              language: 'he-IL',
            },
          };

          await FirestoreService.saveCampaignConfig(db as any, collections, newCampaign);
          onProjectCreated(newCampaign);
          onClose();
          return;
        }
      }

      const template =
        PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId) || PROJECT_TEMPLATES[0];

      const initialId =
        template.config.initialNodeId || Object.keys(template.config.states || {})[0] || 'node_intro';

      const newCampaign: CampaignConfig = {
        id: safeSlug,
        slug: safeSlug,
        name: safeName,
        presenterId: template.config.presenterId || 'presenter_elena_vance_san_francisco_01',
        initialNodeId: initialId,
        states: template.config.states || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: false,
        settings: {
          ...(template.config.settings || {}),
          defaultAspectRatio: aspectRatio,
          autoPlay: true,
          primaryColor: '#EAB308',
          enableVoice: true,
          language: 'he-IL',
        },
      };

      // 1. Save to Firestore and LocalStorage
      await FirestoreService.saveCampaignConfig(db as any, collections, newCampaign);

      // 2. Notify parent listener
      onProjectCreated(newCampaign);

      // 3. Close modal
      onClose();
    } catch (err) {
      console.warn('[NewProjectModal] Create notice:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-yellow-400" />;
      case 'UserPlus':
        return <UserPlus className="w-5 h-5 text-emerald-400" />;
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5 text-indigo-400" />;
      case 'PlusSquare':
      default:
        return <PlusSquare className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <form
        onSubmit={handleCreate}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg text-black font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">יצירת פרויקט אינטראקטיבי חדש</h2>
              <p className="text-xs text-slate-400">בחר מקור, תבנית או פרויקט מסטודיו הווידאו</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Source Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setActiveSourceTab('templates')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeSourceTab === 'templates'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              תבניות מוכנות (Templates)
            </button>

            <button
              type="button"
              onClick={() => setActiveSourceTab('video_studio')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeSourceTab === 'video_studio'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>ייבא מסטודיו הווידאו ({studioProjects.length})</span>
            </button>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">שם הפרויקט</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="לדוגמה: קמפיין מכירות קיץ 2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                סלאג ייחודי (URL Identifier)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[\s_]+/g, '-')
                      .replace(/[^a-z0-9-]/g, '')
                  )
                }
                placeholder="summer-sales-2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-yellow-300 placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">יחס תצוגת הווידאו</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-yellow-500/15 border-yellow-500 text-yellow-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-bold">9:16 (מובייל / סטורי)</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-yellow-500/15 border-yellow-500 text-yellow-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-bold">16:9 (מחשב / וידאו רחב)</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  aspectRatio === '1:1'
                    ? 'bg-yellow-500/15 border-yellow-500 text-yellow-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Square className="w-5 h-5" />
                <span className="text-xs font-bold">1:1 (ריבועי / פיד)</span>
              </button>
            </div>
          </div>

          {/* Source Selection Content */}
          {activeSourceTab === 'templates' ? (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                בחר תבנית התחלתית
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-yellow-500/10 border-yellow-500 shadow-md ring-1 ring-yellow-500/50'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              {getTemplateIcon(tmpl.icon)}
                            </div>
                            <span className="font-bold text-xs text-white">{tmpl.name}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-500">
                          {Object.keys(tmpl.config.states || {}).length} צמתים / סצנות
                        </span>
                        {isSelected ? (
                          <span className="flex items-center text-yellow-400 font-bold gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>נבחר</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">לחץ לבחירה</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                בחר פרויקט מסטודיו הווידאו לייבוא מיידי:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                {studioProjects.map((proj) => {
                  const isSelected = selectedStudioProjectId === proj.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setSelectedStudioProjectId(proj.id);
                        handleNameChange(proj.title);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-white line-clamp-1">{proj.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                            {proj.scenes?.length || 0} סצנות
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {proj.description || 'ללא תיאור'}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-500">
                          {proj.aspectRatio || '16:9'}
                        </span>
                        {isSelected ? (
                          <span className="flex items-center text-purple-400 font-bold gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>נבחר לייבוא</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">לחץ לייבוא</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {studioProjects.length === 0 && (
                  <div className="col-span-2 p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    לא נמצאו פרויקטים בסטודיו הווידאו. צור תחילה פרויקט באשף הסטודיו.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            ביטול
          </button>

          <button
            type="submit"
            disabled={isCreating || !projectName.trim()}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black flex items-center space-x-2 rtl:space-x-reverse shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isCreating ? (
              <span>יוצר פרויקט...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>צור והפעל פרויקט</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
