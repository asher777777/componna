import React, { useState, useEffect } from 'react';
import { FlowPlayerSectionConfig } from '../../types/sectionConfigs';
import { FirestoreService } from '../../../flow-player-engine/services/firestoreService';
import { DEFAULT_CAMPAIGN_CONFIG, resolveCollections } from '../../../flow-player-engine/config';
import { CampaignConfig } from '../../../flow-player-engine/types';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import {
  PlayCircle,
  Video,
  Monitor,
  Sparkles,
  RefreshCw,
  Sliders,
  Eye,
  Mic,
  Image as ImageIcon,
} from 'lucide-react';

export const FlowPlayerEditor: React.FC<{
  config: FlowPlayerSectionConfig;
  onChange: (updated: FlowPlayerSectionConfig) => void;
}> = ({ config, onChange }) => {
  const { db } = useSystemConnection();
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const collections = resolveCollections('sdo_player_');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const list = await FirestoreService.listAllCampaigns(db as any, collections);
      setCampaigns(list);

      const targetSlug = config.campaignId || config.campaignSlug || DEFAULT_CAMPAIGN_CONFIG.id;
      const found = list.find((c) => c.slug === targetSlug || c.id === targetSlug) || list[0] || DEFAULT_CAMPAIGN_CONFIG;
      setSelectedCampaign(found);

      if (!config.campaignId && found) {
        onChange({ ...config, campaignId: found.slug || found.id });
      }
    } catch (err) {
      console.warn('[FlowPlayerEditor] Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [db]);

  const handleSelectCampaign = (slugOrId: string) => {
    onChange({ ...config, campaignId: slugOrId, campaignSlug: slugOrId });
    const found = campaigns.find((c) => c.slug === slugOrId || c.id === slugOrId) || null;
    setSelectedCampaign(found);
  };

  const update = <K extends keyof FlowPlayerSectionConfig>(field: K, value: FlowPlayerSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col gap-5 text-right" dir="rtl">
      {/* 1. Project Selection */}
      <PageBuilderAccordion
        title="פרויקט זרימה אינטראקטיבי להצגה"
        icon={<PlayCircle className="w-4 h-4 text-amber-400" />}
        defaultOpen={true}
        actionNode={
          <button
            type="button"
            onClick={fetchCampaigns}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="רענן רשימת פרויקטים"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-300">בחר פרויקט מהמערכת:</label>

          {loading ? (
            <div className="p-3 text-xs text-slate-400">טוען פרויקטים...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              לא נמצאו פרויקטים שמורים, מוצג פרויקט ברירת המחדל.
            </div>
          ) : (
            <select
              value={config.campaignId || config.campaignSlug || ''}
              onChange={(e) => handleSelectCampaign(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
            >
              {campaigns.map((camp) => (
                <option key={camp.slug || camp.id} value={camp.slug || camp.id}>
                  {camp.name || 'ללא שם'} ({Object.keys(camp.states || {}).length} סצנות • /{camp.slug || camp.id})
                </option>
              ))}
            </select>
          )}

          {/* Project Details Summary */}
          {selectedCampaign && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{selectedCampaign.name}</span>
                </span>
                <span className="text-[10px] font-mono text-yellow-400/90 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                  {Object.keys(selectedCampaign.states || {}).length} סצנות וידאו
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Mic className="w-3 h-3" />
                  <span>סוכן קולי ואינטראקציה פעילים</span>
                </span>
                <span className="font-mono text-slate-500">/{selectedCampaign.slug || selectedCampaign.id}</span>
              </div>
            </div>
          )}
        </div>
      </PageBuilderAccordion>

      {/* 2. Desktop-Only Background */}
      <PageBuilderAccordion
        title="רקע ייעודי לדסקטופ בלבד (Desktop Only)"
        icon={<Monitor className="w-4 h-4 text-cyan-400" />}
        defaultOpen={true}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            הרקע שנבחר כאן יוצג <strong>אך ורק במסכי מחשב ודסקטופ</strong> (מוסתר אוטומטית במובייל לחוויה חלקה ומהירה).
          </p>

          <PageBuilderImageUpload
            label="תמונת רקע לדסקטופ (מגלריית המדיה)"
            value={config.desktopBgImage}
            onChange={(url) => update('desktopBgImage', url)}
          />

          {config.desktopBgImage && (
            <div className="flex flex-col gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800 animate-in fade-in">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">סגנון תצוגת הרקע בדסקטופ</label>
                <select
                  value={config.desktopBgStyle || 'blur-ambient'}
                  onChange={(e) => update('desktopBgStyle', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="blur-ambient">הילת זוהר וטשטוש מודרני (Blur Ambient Glow)</option>
                  <option value="cover">פריסה מלאה (Cover)</option>
                  <option value="contain">התאמה למסגרת (Contain)</option>
                  <option value="pattern">דפוס חוזר (Pattern Repeat)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>עוצמת כהות שכבת הרקע</span>
                  <span className="font-mono text-cyan-400">{config.desktopBgOverlayOpacity ?? 40}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={config.desktopBgOverlayOpacity ?? 40}
                  onChange={(e) => update('desktopBgOverlayOpacity', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </PageBuilderAccordion>

      {/* 3. Titles & Header (Optional) */}
      <PageBuilderAccordion
        title="כותרות עליונות (אופציונלי)"
        icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
      >
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={config.showSectionHeader || false}
              onChange={(e) => update('showSectionHeader', e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span className="font-semibold text-white">הצג כותרת עליונה מעל הנגן</span>
          </label>

          {config.showSectionHeader && (
            <div className="flex flex-col gap-3 animate-in fade-in">
              <PageBuilderInput
                label="כותרת הסקשן בעמוד"
                value={config.sectionTitle || ''}
                onChange={(val) => update('sectionTitle', val)}
                placeholder="למשל: התנסו בנציג המכירות האינטראקטיבי שלנו"
              />
              <PageBuilderInput
                label="פסקת תיאור / כותרת משנה"
                value={config.sectionSubtitle || ''}
                onChange={(val) => update('sectionSubtitle', val)}
                placeholder="למשל: דברו בקולכם או לחצו על המסך"
              />
            </div>
          )}
        </div>
      </PageBuilderAccordion>

      {/* 4. Layout & Width */}
      <PageBuilderAccordion
        title="הגדרות פריסה ורוחב"
        icon={<Sliders className="w-4 h-4 text-pink-400" />}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">רוחב המיכל בעמוד</label>
            <select
              value={config.containerWidth || 'lg'}
              onChange={(e) => update('containerWidth', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="sm">ממוקד (max-w-xl)</option>
              <option value="md">בינוני (max-w-3xl)</option>
              <option value="lg">רחב ומרשים (max-w-5xl)</option>
              <option value="full">רוחב מלא (100%)</option>
            </select>
          </div>

          <PageBuilderColorPicker
            label="צבע רקע כללי לסקשן"
            value={config.backgroundColor || 'transparent'}
            onChange={(c) => update('backgroundColor', c)}
          />
        </div>
      </PageBuilderAccordion>
    </div>
  );
};
