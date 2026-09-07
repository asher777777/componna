import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Play,
  Copy,
  Trash2,
  Globe,
  Search,
  RefreshCw,
  Video,
  Layers,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { CampaignConfig } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { useFlowPlayerModule } from '../context/ModuleContext';
import { NewProjectModal } from './NewProjectModal';
import { PublishCampaignModal } from './PublishCampaignModal';

interface ProjectsHubViewProps {
  onSelectProject: (campaign: CampaignConfig) => void;
  activeCampaignSlug?: string;
}

export const ProjectsHubView: React.FC<ProjectsHubViewProps> = ({
  onSelectProject,
  activeCampaignSlug,
}) => {
  const { db, collections } = useFlowPlayerModule();

  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [publishTargetCampaign, setPublishTargetCampaign] = useState<CampaignConfig | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const list = await FirestoreService.listAllCampaigns(db as any, collections);
      setCampaigns(list);
    } catch (err) {
      console.warn('[ProjectsHubView] Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [db, collections]);

  const handleDelete = async (slug: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${name}" (${slug})?`)) {
      return;
    }

    setDeletingSlug(slug);
    try {
      await FirestoreService.deleteCampaign(db as any, collections, slug);
      setCampaigns((prev) => prev.filter((c) => (c.slug || c.id) !== slug));
    } catch (err) {
      console.warn('[ProjectsHubView] Delete error:', err);
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleDuplicate = async (campaign: CampaignConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = `${campaign.name} (עותק)`;
    const newSlug = `${(campaign.slug || campaign.id).slice(0, 18)}_copy_${Date.now().toString().slice(-4)}`;

    try {
      const duplicated = await FirestoreService.duplicateCampaign(
        db as any,
        collections,
        campaign,
        newName,
        newSlug
      );
      setCampaigns((prev) => [duplicated, ...prev]);
    } catch (err) {
      console.warn('[ProjectsHubView] Duplicate error:', err);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.slug || c.id || '').toLowerCase().includes(q)
    );
  });

  const totalNodesCount = campaigns.reduce(
    (acc, c) => acc + Object.keys(c.states || {}).length,
    0
  );
  const publishedCount = campaigns.filter((c) => c.isPublished).length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in" dir="rtl">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-500 flex items-center justify-center text-black font-black shadow-lg">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>מרכז הפרויקטים שלי (Projects Hub)</span>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2.5 py-0.5 rounded-full border border-yellow-500/30 font-medium">
                {campaigns.length} פרויקטים
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              נהל, ערוך, שכפל ופרסם את כל תהליכי הווידאו האינטראקטיביים שיצרת
            </p>
          </div>
        </div>

        {/* Action Button: New Project */}
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg shadow-yellow-500/10 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>צור פרויקט חדש</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">סה"כ פרויקטים פעילים</div>
            <div className="text-2xl font-bold text-white mt-1">{campaigns.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">פרויקטים מפורסמים לייב</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{publishedCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">סך צמתים / סצנות וידאו</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{totalNodesCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Refresh Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש פרויקט לפי שם, סלאג או תיאור..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <button
          onClick={loadAll}
          disabled={loading}
          title="רענן רשימה"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
          <p className="text-xs">טוען את כל הפרויקטים מ-Firestore ומ-LocalStorage...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 space-y-3">
          <Sparkles className="w-10 h-10 text-yellow-500/40 mx-auto" />
          <h3 className="text-sm font-bold text-white">לא נמצאו פרויקטים</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'לא נמצא פרויקט התואם לחיפוש הנוכחי. נסה מילת חיפוש אחרת.'
              : 'טרם נוצרו פרויקטים מותאמים. לחץ על הכפתור מטה להקמת הפרויקט הראשון!'}
          </p>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>הקם פרויקט חדש</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((camp) => {
            const slug = camp.slug || camp.id || 'unnamed';
            const isActive = activeCampaignSlug === slug;
            const nodes = Object.values(camp.states || {});
            const hasVideosCount = nodes.filter((n) => !!n.videoUrl).length;
            const formattedDate = camp.updatedAt
              ? new Date(camp.updatedAt).toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'עודכן לאחרונה';

            return (
              <div
                key={slug}
                onClick={() => onSelectProject(camp)}
                className={`group relative bg-slate-900/90 border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col justify-between ${
                  isActive
                    ? 'border-yellow-500 ring-1 ring-yellow-500/50 shadow-lg shadow-yellow-500/5'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-white truncate max-w-[170px]" title={camp.name}>
                          {camp.name}
                        </h3>
                        <span className="text-[10px] font-mono text-yellow-400/80 bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/20 truncate block max-w-[160px]">
                          /{slug}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {camp.isPublished ? (
                      <span className="flex-shrink-0 text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>לייב</span>
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        טיוטה
                      </span>
                    )}
                  </div>

                  {/* Nodes & Video Stats */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 text-[11px]">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{nodes.length} צמתים/סצנות</span>
                    </div>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-300">
                      <Video className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{hasVideosCount} סרטונים</span>
                    </div>
                  </div>

                  <div className="flex items-center text-[10px] text-slate-400 gap-1 mb-4">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  {/* Primary Open Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(camp);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black border border-yellow-500/40 text-xs font-bold flex items-center justify-center space-x-1 rtl:space-x-reverse transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>פתח בנגן</span>
                  </button>

                  {/* Publish Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPublishTargetCampaign(camp);
                    }}
                    title="פרסם וקבל קישור סלאג"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-900/50 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600 transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate Button */}
                  <button
                    onClick={(e) => handleDuplicate(camp, e)}
                    title="שכפל פרויקט"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-900/50 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-600 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(slug, camp.name, e)}
                    disabled={deletingSlug === slug}
                    title="מחק פרויקט"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={(newCamp) => {
          setCampaigns((prev) => [newCamp, ...prev]);
          onSelectProject(newCamp);
        }}
      />

      {/* Publish Modal for specific project */}
      {publishTargetCampaign && (
        <PublishCampaignModal
          isOpen={true}
          onClose={() => {
            setPublishTargetCampaign(null);
            loadAll();
          }}
          campaign={publishTargetCampaign}
          onCampaignUpdated={(updated) => {
            setCampaigns((prev) =>
              prev.map((c) => ((c.slug || c.id) === (updated.slug || updated.id) ? updated : c))
            );
          }}
        />
      )}
    </div>
  );
};
