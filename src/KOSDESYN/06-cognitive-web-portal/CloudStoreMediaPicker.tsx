import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { comonaDb, comonaStorage } from '../../../../src/lib/firebase';

export interface CloudStoreMediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'logo' | 'icon';
  category: string;
  size?: number;
  uploadedAt: number;
}

export interface CloudStoreMediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (asset: CloudStoreMediaAsset) => void;
  tenantId?: string;
  allowedTypes?: Array<'image' | 'video' | 'logo' | 'icon'>;
  title?: string;
}

// נכסי ענן מובנים ב-CloudStore של COMONA
const DEFAULT_COMONA_ASSETS: CloudStoreMediaAsset[] = [
  { id: 'cs_1', name: 'וידאו פוקוס ראשי (Kosun Hero)', url: '/cloudstore/kosun_hero.webp', type: 'video', category: 'saas', uploadedAt: Date.now() },
  { id: 'cs_2', name: 'לוגו קושאן מקורי', url: '/cloudstore/kosun_logo.webp', type: 'logo', category: 'saas', uploadedAt: Date.now() },
  { id: 'cs_3', name: 'זוהר אסתטיקה וקליניקה', url: '/cloudstore/beauty_hero.webp', type: 'image', category: 'beauty', uploadedAt: Date.now() },
  { id: 'cs_4', name: 'טיפול לייזר מתקדם', url: '/cloudstore/beauty_laser.webp', type: 'image', category: 'beauty', uploadedAt: Date.now() },
  { id: 'cs_5', name: 'פנטהאוז נדל״ן יוקרתי', url: '/cloudstore/realestate_hero.webp', type: 'image', category: 'real_estate', uploadedAt: Date.now() },
  { id: 'cs_6', name: 'וילה ונוף פרימיום', url: '/cloudstore/realestate_villa.webp', type: 'image', category: 'real_estate', uploadedAt: Date.now() },
  { id: 'cs_7', name: 'אירוע קהילתי ומפגש', url: '/cloudstore/community_hero.webp', type: 'image', category: 'community', uploadedAt: Date.now() },
  { id: 'cs_8', name: 'משרד עורכי דין וחוזים', url: '/cloudstore/legal_hero.webp', type: 'image', category: 'legal', uploadedAt: Date.now() }
];

export const CloudStoreMediaPicker: React.FC<CloudStoreMediaPickerProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  tenantId = 'kosun',
  allowedTypes = ['image', 'video', 'logo'],
  title = 'מאגר המדיה של CLOUDSTORE (Comona Firebase)'
}) => {
  if (!isOpen) return null;

  const [assets, setAssets] = useState<CloudStoreMediaAsset[]>(DEFAULT_COMONA_ASSETS);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewAsset, setPreviewAsset] = useState<CloudStoreMediaAsset | null>(null);

  // משיכת מדיה מקולקציית CLOUDSTORE של COMONA ב-Firestore
  useEffect(() => {
    async function loadComonaAssets() {
      try {
        const snap = await getDocs(collection(comonaDb, 'cloudstore_assets'));
        const dbItems: CloudStoreMediaAsset[] = [];
        snap.forEach((d) => {
          dbItems.push({ id: d.id, ...d.data() } as CloudStoreMediaAsset);
        });
        if (dbItems.length > 0) {
          setAssets([...dbItems, ...DEFAULT_COMONA_ASSETS]);
        }
      } catch (e) {
        console.warn('Could not load from comona cloudstore_assets, using defaults:', e);
      }
    }
    loadComonaAssets();
  }, []);

  // העלאת מדיה ישירה ל-Storage ו-Firestore של COMONA
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const ext = file.name.split('.').pop() || 'webp';
      const fileId = `cs_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const storagePath = `tenants/${tenantId}/cloudstore/${fileId}.${ext}`;

      // העלאה ל-Firebase Storage של COMONA
      const storageRef = ref(comonaStorage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.warn('Storage upload error, falling back to local base64:', error);
          const reader = new FileReader();
          reader.onload = async (ev) => {
            const dataUrl = ev.target?.result as string;
            const newAsset: CloudStoreMediaAsset = {
              id: fileId,
              name: file.name,
              url: dataUrl,
              type: file.type.startsWith('video') ? 'video' : 'image',
              category: 'uploads',
              uploadedAt: Date.now()
            };
            setAssets((prev) => [newAsset, ...prev]);
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const newAsset: CloudStoreMediaAsset = {
            id: fileId,
            name: file.name,
            url: downloadUrl,
            type: file.type.startsWith('video') ? 'video' : 'image',
            category: 'uploads',
            size: file.size,
            uploadedAt: Date.now()
          };

          // שמירה ב-Firestore של COMONA
          try {
            await setDoc(doc(comonaDb, 'cloudstore_assets', fileId), newAsset);
          } catch (err) {
            console.warn('Firestore asset register warning:', err);
          }

          setAssets((prev) => [newAsset, ...prev]);
          setIsUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    const matchesSearch = !searchQuery || asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn" dir="rtl">
      
      {/* חלון מודאל 9:16 של CLOUDSTORE */}
      <div className="w-full max-w-[440px] h-[90vh] max-h-[820px] my-auto flex flex-col justify-between bg-black text-white rounded-3xl border border-cyan-400/30 p-3.5 shadow-2xl relative overflow-hidden select-none">
        
        {/* כותרת עליונה */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Icons.Cloud size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">{title}</h3>
              <span className="text-[9.5px] text-cyan-300 font-mono">COMONA Firebase Connected</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <Icons.X size={14} />
          </button>
        </div>

        {/* סרגל העלאה וחיפוש */}
        <div className="space-y-2 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Icons.Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש מדיה, תמונה או סרטון..."
                className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black text-xs font-black cursor-pointer active:scale-95 transition-all shadow-md shrink-0">
              <Icons.UploadCloud size={14} />
              <span>{isUploading ? `${uploadProgress}%` : 'העלאה'}</span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleUploadFile}
              />
            </label>
          </div>

          {/* פילטר סוג מדיה */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'הכל' },
              { id: 'image', label: 'תמונות' },
              { id: 'video', label: 'וידאו' },
              { id: 'logo', label: 'לוגואים' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedType === t.id
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* גלריית הנכסים של CLOUDSTORE */}
        <div className="flex-1 overflow-y-auto pr-0.5 my-1 grid grid-cols-2 gap-2 scrollbar-thin">
          {filteredAssets.map((asset) => {
            const isVideo = asset.type === 'video' || asset.url.endsWith('.mp4');

            return (
              <div
                key={asset.id}
                onClick={() => onSelectMedia(asset)}
                className="rounded-2xl p-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="w-full h-24 rounded-xl overflow-hidden bg-black/60 relative flex items-center justify-center">
                  {isVideo ? (
                    <div className="w-full h-full relative">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Icons.Play size={20} className="text-cyan-300 drop-shadow" />
                      </div>
                    </div>
                  ) : (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/70 text-cyan-300 uppercase">
                    {asset.type}
                  </span>
                </div>

                <div className="pt-1.5 px-0.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-white truncate max-w-[120px]">
                    {asset.name}
                  </span>
                  <Icons.Check size={12} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        {/* סרגל תחתון */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between shrink-0 text-[10px] text-slate-400">
          <span>{filteredAssets.length} קבצי מדיה זמינים</span>
          <span className="font-mono text-cyan-300">Firebase Storage: glowmanage</span>
        </div>

      </div>
    </div>
  );
};
