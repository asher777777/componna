import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  PlayCircle,
  Activity,
  Gauge,
  UserCheck,
  Image,
  Folder,
  Tag,
  Layers,
  FileText,
  Users,
  Settings,
  Trash2,
  FolderPlus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Film,
  Video,
  Sparkles,
  Layout,
  FolderArchive,
  BarChart3,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { useDbContext } from '../context/DbContext';
import { CollectionCategory, CollectionMetadata } from '../types';

const CATEGORY_NAMES: Record<CollectionCategory, string> = {
  video_studio: '🎬 סטודיו וידאו ותסריטים',
  flow_player: '🎮 נגן זרימה אינטראקטיבי',
  media: '🖼️ מדיה וגלריה',
  page_builder: '📄 יוצר עמודים ואתרים',
  crm: '📊 אנליטיקה ו-CRM',
  client_platform: '📱 פלטפורמת מקלט לקוח',
  auth: '🔐 אימות ומשתמשים',
  system: '⚙️ מערכת ותבניות',
  custom: '📂 קולקציות מותאמות אישית',
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Film: <Film className="w-4 h-4 text-purple-400" />,
  Video: <Video className="w-4 h-4 text-pink-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-amber-400" />,
  PlayCircle: <PlayCircle className="w-4 h-4 text-amber-400" />,
  Activity: <Activity className="w-4 h-4 text-emerald-400" />,
  Gauge: <Gauge className="w-4 h-4 text-cyan-400" />,
  UserCheck: <UserCheck className="w-4 h-4 text-teal-400" />,
  Image: <Image className="w-4 h-4 text-indigo-400" />,
  Folder: <Folder className="w-4 h-4 text-amber-300" />,
  Tag: <Tag className="w-4 h-4 text-pink-400" />,
  Layout: <Layout className="w-4 h-4 text-blue-400" />,
  Layers: <Layers className="w-4 h-4 text-indigo-400" />,
  FolderArchive: <FolderArchive className="w-4 h-4 text-purple-300" />,
  Users: <Users className="w-4 h-4 text-teal-400" />,
  BarChart3: <BarChart3 className="w-4 h-4 text-emerald-400" />,
  FileText: <FileText className="w-4 h-4 text-slate-400" />,
  Smartphone: <Smartphone className="w-4 h-4 text-cyan-400" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
  Settings: <Settings className="w-4 h-4 text-slate-300" />,
  Database: <Database className="w-4 h-4 text-indigo-400" />,
};

const CATEGORY_ORDER: CollectionCategory[] = [
  'video_studio',
  'flow_player',
  'media',
  'page_builder',
  'crm',
  'client_platform',
  'auth',
  'system',
  'custom',
];

export const CollectionListSidebar: React.FC = () => {
  const {
    collections,
    selectedCollectionId,
    setSelectedCollectionId,
    addCustomCollection,
    removeCustomCollection,
    collectionStats,
    scanAllCollections,
  } = useDbContext();

  const [search, setSearch] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('comona_db_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('comona_db_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleScan = async () => {
    setScanning(true);
    await scanAllCollections();
    setScanning(false);
  };

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<CollectionCategory, CollectionMetadata[]>>(
    (acc, col) => {
      if (!acc[col.category]) acc[col.category] = [];
      acc[col.category].push(col);
      return acc;
    },
    {
      video_studio: [],
      flow_player: [],
      media: [],
      page_builder: [],
      crm: [],
      client_platform: [],
      auth: [],
      system: [],
      custom: [],
    }
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    addCustomCollection(newCollectionName.trim());
    setNewCollectionName('');
    setShowAddInput(false);
  };

  return (
    <div
      className={`bg-slate-950/95 border-l border-slate-800/80 flex flex-col h-full select-none transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className={`border-b border-slate-800/80 flex items-center ${isCollapsed ? 'p-3 flex-col gap-2 justify-center' : 'p-4 justify-between'}`}>
        <div className="flex items-center gap-2">
          <div
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={`w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 ${
              isCollapsed ? 'cursor-pointer hover:bg-indigo-600/30' : ''
            }`}
            title={isCollapsed ? 'פתח סרגל קולקציות' : 'קולקציות מסד הנתונים'}
          >
            <Database className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h3 className="font-bold text-white text-xs truncate">קולקציות הפרויקט</h3>
              <p className="text-[10px] text-slate-400 font-mono truncate">Firestore Realtime API</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-900 rounded-lg transition cursor-pointer"
            title="סרוק מסמכים בכל הקולקציות"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {!isCollapsed && (
            <button
              onClick={() => setShowAddInput(!showAddInput)}
              className="flex items-center gap-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-lg transition cursor-pointer"
              title="הוסף קולקציה מותאמת אישית לצפייה"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוספה</span>
            </button>
          )}

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title={isCollapsed ? 'הרחב סרגל קולקציות' : 'מזער סרגל קולקציות'}
          >
            {isCollapsed ? (
              <ChevronLeft className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Add Custom Collection Box (Expanded only) */}
      {!isCollapsed && showAddInput && (
        <form onSubmit={handleAddSubmit} className="p-3 bg-slate-900 border-b border-slate-800 space-y-2 animate-in fade-in">
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            שם קולקציה במסד הנתונים:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="e.g. sdo_custom_feed"
              autoFocus
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1 rounded-lg font-semibold transition cursor-pointer"
            >
              פתח
            </button>
          </div>
        </form>
      )}

      {/* Search Input (Expanded only) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש קולקציה..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
      )}

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {CATEGORY_ORDER.map((categoryKey) => {
          const list = grouped[categoryKey];
          if (!list || list.length === 0) return null;

          return (
            <div key={categoryKey} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 tracking-wider uppercase flex items-center justify-between">
                  <span>{CATEGORY_NAMES[categoryKey]}</span>
                  <span className="bg-slate-900 text-slate-500 text-[10px] px-1.5 py-0.2 rounded font-mono">
                    {list.length}
                  </span>
                </div>
              )}

              {list.map((col) => {
                const isSelected = selectedCollectionId === col.id;
                const icon = ICON_MAP[col.icon || 'Database'] || <Database className="w-4 h-4 text-indigo-400" />;
                const stats = collectionStats[col.id];
                const count = stats?.count;

                if (isCollapsed) {
                  return (
                    <div
                      key={col.id}
                      onClick={() => setSelectedCollectionId(col.id)}
                      className="group relative flex justify-center py-1"
                    >
                      <button
                        type="button"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {icon}
                        {count !== undefined && count > 0 && (
                          <span className="absolute -top-1 -left-1 bg-emerald-500 text-black text-[9px] font-bold px-1 rounded-full min-w-[16px] text-center shadow">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </button>

                      {/* Tooltip on Hover */}
                      <div className="fixed hidden group-hover:flex flex-col gap-0.5 bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl shadow-2xl z-50 pointer-events-none whitespace-nowrap min-w-[180px] text-right"
                           style={{ right: '70px' }}>
                        <div className="font-bold text-white flex items-center justify-between gap-2">
                          <span>{col.name}</span>
                          {count !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">
                              {count} מסמכים
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-mono">{col.id}</div>
                        <div className="text-[10px] text-slate-400">{col.description}</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedCollectionId(col.id)}
                    className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition border text-right ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/60 text-white shadow-sm'
                        : 'bg-slate-900/40 border-transparent hover:bg-slate-900 hover:border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{icon}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {col.name}
                        </span>
                        {count !== undefined && count > 0 ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded shrink-0">
                            {count}
                          </span>
                        ) : count === 0 ? (
                          <span className="text-[10px] bg-slate-800 text-slate-500 font-mono px-1.5 py-0.2 rounded shrink-0">
                            0
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {col.id}
                      </div>
                    </div>

                    {col.category === 'custom' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomCollection(col.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition rounded cursor-pointer"
                        title="הסר קולקציה מותאמת"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
