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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-5 animate-fade-in font-sans" dir="rtl">
      {/* Top Banner (Cashwan 2026 Bento/Light Mode) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-900 shadow-sm">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>הפרויקטים של קושאן</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              נהל וערוך סרטונים אינטראקטיביים. מצאת מה שחיפשת?
            </p>
          </div>
        </div>

        {/* Action Button: New Project */}
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>צור פרויקט חדש +</span>
        </button>
      </div>

      {/* Metrics Row (Bento Grid Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500">פרויקטים פעילים</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{campaigns.length}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
            <FolderKanban className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500">פורסמו לייב</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{publishedCount}</div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100">
            <Globe className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500">סך סצנות וידאו</div>
            <div className="text-xl font-black text-amber-500 mt-0.5">{totalNodesCount}</div>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-500 border border-amber-100">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Refresh Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש מהיר לפי שם פרויקט..."
            className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-sm"
          />
        </div>

        <button
          onClick={loadAll}
          disabled={loading}
          title="רענן רשימה"
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer border border-slate-200 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">טוען נתונים מקושאן...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-3xl p-6 space-y-2 shadow-sm">
          <Sparkles className="w-8 h-8 text-amber-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">אין פרויקטים להצגה</h3>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>הקם פרויקט ראשון</span>
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
                  year: 'numeric'
                })
              : 'עודכן לאחרונה';

            return (
              <div
                key={slug}
                onClick={() => onSelectProject(camp)}
                className={`group relative bg-white border rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isActive
                    ? 'border-amber-400 ring-1 ring-amber-400/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors flex-shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate" title={camp.name}>
                          {camp.name}
                        </h3>
                      </div>
                    </div>
                    {camp.isPublished ? (
                      <span className="flex-shrink-0 text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        לייב
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                        טיוטה
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 my-3 text-[10px] font-medium text-slate-500">
                    <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {nodes.length} סצנות
                    </div>
                    <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                      <Video className="w-3 h-3 text-amber-400" />
                      {hasVideosCount} וידאו
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(camp);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    ערוך
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPublishTargetCampaign(camp);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition"
                      title="פרסם"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(camp, e)}
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition"
                      title="שכפל"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(slug, camp.name, e)}
                      disabled={deletingSlug === slug}
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="מחק"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isNewProjectModalOpen && (
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onProjectCreated={(newCamp) => {
            setCampaigns((prev) => [newCamp, ...prev]);
            onSelectProject(newCamp);
          }}
        />
      )}

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
