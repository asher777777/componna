import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Globe,
  Tag,
  Zap,
  Target,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Link2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { SmartGroup, GroupRule, GroupRuleField, GroupRuleOperator } from '../types';
import { PRESET_COLORS, RULE_FIELD_OPTIONS, RULE_OPERATOR_OPTIONS } from '../config';
import { isContactInGroup } from '../services/groupsUtils';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';

interface GroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup?: SmartGroup | null;
  initialMode?: 'group' | 'community' | 'smart';
}

export const GroupEditModal: React.FC<GroupEditModalProps> = ({
  isOpen,
  onClose,
  editingGroup,
  initialMode = 'group',
}) => {
  const { contacts, campaigns, saveGroup, deleteCommunityPage } = useCrmGroups();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [activeTab, setActiveTab] = useState<'details' | 'page' | 'rules'>('details');
  const [submitting, setSubmitting] = useState(false);

  const handlePickFromGallery = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'image/*', multiple: true });
      if (selected) {
        const urls = Array.isArray(selected) ? selected : [selected];
        setGallery((prev) => [...prev, ...urls.filter(Boolean) as string[]]);
      }
    }
  };

  // Form Fields
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [description, setDescription] = useState('');
  const [vision, setVision] = useState('');
  const [purpose, setPurpose] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [targetGoal, setTargetGoal] = useState<number | ''>(5000);
  const [mainCampaignId, setMainCampaignId] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [createPage, setCreatePage] = useState(false);

  // Smart Rules
  const [type, setType] = useState<'manual' | 'smart'>('manual');
  const [matchType, setMatchType] = useState<'all' | 'any'>('all');
  const [rules, setRules] = useState<GroupRule[]>([]);

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name || '');
      setLeaderName(editingGroup.leaderName || '');
      setColor(editingGroup.color || PRESET_COLORS[0]);
      setDescription(editingGroup.description || '');
      setVision(editingGroup.vision || '');
      setPurpose(editingGroup.purpose || '');
      setGallery(editingGroup.gallery || []);
      setTargetGoal(editingGroup.targetGoal !== undefined ? editingGroup.targetGoal : 5000);
      setMainCampaignId(editingGroup.mainCampaignId || '');
      setPageSlug(editingGroup.pageSlug || editingGroup.pageId || '');
      const isComm = Boolean(editingGroup.isCommunity || editingGroup.pageSlug || editingGroup.pageUrl);
      setCreatePage(isComm);
      setType(editingGroup.type || 'manual');
      setMatchType(editingGroup.matchType || 'all');
      setRules(editingGroup.rules || []);
      setActiveTab(editingGroup.type === 'smart' ? 'rules' : isComm ? 'page' : 'details');
    } else {
      setName('');
      setLeaderName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setDescription('');
      setVision('');
      setPurpose('');
      setGallery([]);
      setTargetGoal(5000);
      setMainCampaignId('');
      setPageSlug('');
      if (initialMode === 'community') {
        setCreatePage(true);
        setType('manual');
        setRules([]);
        setActiveTab('page');
      } else if (initialMode === 'smart') {
        setCreatePage(false);
        setType('smart');
        setRules([{ field: 'total_spent', operator: 'gte', value: 500 }]);
        setActiveTab('rules');
      } else {
        setCreatePage(false);
        setType('manual');
        setRules([]);
        setActiveTab('details');
      }
    }
  }, [editingGroup, initialMode, isOpen]);

  // Live match counter for Smart Rules
  const liveSmartMatchingCount = useMemo(() => {
    if (type !== 'smart' || rules.length === 0) return 0;
    const tempGroup: SmartGroup = {
      id: 'temp',
      name,
      color,
      type: 'smart',
      rules,
      matchType,
    };
    return contacts.filter((c) => isContactInGroup(c, tempGroup)).length;
  }, [contacts, type, rules, matchType, name, color]);

  if (!isOpen) return null;

  const handleAddRule = () => {
    setRules((prev) => [...prev, { field: 'mh_crm_city', operator: 'eq', value: '' }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRule = (index: number, key: keyof GroupRule, val: any) => {
    setRules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const handleAddGalleryImage = () => {
    if (newImageUrl.trim()) {
      setGallery((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('נא להזין שם לקבוצה או לקהילה');
      return;
    }

    try {
      setSubmitting(true);
      const chosenCamp = campaigns.find((c) => c.id === mainCampaignId);

      await saveGroup({
        id: editingGroup?.id,
        previousName: editingGroup?.name,
        name: name.trim(),
        leaderName: leaderName.trim(),
        color,
        description: description.trim(),
        vision: vision.trim(),
        purpose: purpose.trim(),
        gallery,
        targetGoal: targetGoal === '' ? 5000 : Number(targetGoal),
        mainCampaignId: createPage ? mainCampaignId : '',
        campaignTitle: createPage ? chosenCamp?.title : '',
        pageSlug: createPage ? pageSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') : '',
        createPage,
        isCommunity: createPage,
        category: createPage ? 'community' : 'group',
        type,
        matchType,
        rules: type === 'smart' ? rules : [],
      });

      onClose();
    } catch (err: any) {
      alert('שגיאה בשמירת הקבוצה: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
            <div>
              <h3 className="text-base font-black text-slate-900">
                {editingGroup ? `עריכת ${createPage ? 'קהילה' : 'קבוצה'}` : `יצירת ${createPage ? 'קהילה חדשה' : 'קבוצה חדשה'}`}
              </h3>
              <p className="text-xs text-slate-400">הגדרת שם, חזון, יעדי גיוס, עמוד ציבורי וחוקים חכמים</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Sub-tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 bg-white gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>פרטים בסיסיים</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'page'
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>עמוד קהילה ויעד גיוס</span>
            {createPage && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>חוקי קבוצה חכמה</span>
            {type === 'smart' && (
              <span className="text-[10px] font-mono px-1.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {rules.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: Basic Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  שם הקבוצה או הקהילה <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="לדוגמה: קהילת ירושלים, תורמי זהב, לקוחות VIP"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  שם מוביל / שגריר הקהילה (אופציונלי)
                </label>
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="לדוגמה: אברהם כהן"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  צבע מזהה לתגית ולוח הבקרה
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        color === c ? 'scale-125 ring-3 ring-indigo-500/30' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  תיאור קצר או הערות פנימיות
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="תיאור מטרת הקבוצה או שיוך החברים..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Community Page & Goals */}
          {activeTab === 'page' && (
            <div className="space-y-4">
              {/* Toggle Public Page */}
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>הפעל עמוד קהילה ציבורי וקישור שגריר</span>
                  </h4>
                  <p className="text-[11px] text-indigo-800/80 mt-0.5">
                    מייצר עמוד אינטרנט ציבורי מעוצב עם אפשרות גיוס כספים, גלריה וחיבור לקמפיין ראשי.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={createPage}
                  onChange={(e) => setCreatePage(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {createPage && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        יעד גיוס כספי לקהילה (₪)
                      </label>
                      <input
                        type="number"
                        value={targetGoal}
                        onChange={(e) => setTargetGoal(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="5000"
                        className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        כתובת עמוד מותאמת (Slug באנגלית)
                      </label>
                      <input
                        type="text"
                        value={pageSlug}
                        onChange={(e) => setPageSlug(e.target.value)}
                        placeholder="comm-jerusalem"
                        className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Link to Campaign */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      שיוך לקמפיין גיוס ראשי
                    </label>
                    <select
                      value={mainCampaignId}
                      onChange={(e) => setMainCampaignId(e.target.value)}
                      className="w-full h-10 px-3 rounded-2xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">-- בחר קמפיין ראשי --</option>
                      {campaigns.map((camp) => (
                        <option key={camp.id} value={camp.id}>
                          {camp.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      חזון הקהילה
                    </label>
                    <textarea
                      value={vision}
                      onChange={(e) => setVision(e.target.value)}
                      rows={2}
                      placeholder="חזון הקהילה המוצג בעמוד הציבורי..."
                      className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      מטרות ויעדים
                    </label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={2}
                      placeholder="מטרות הקהילה והפעילות..."
                      className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Gallery List */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        גלריית תמונות לעמוד
                      </label>
                      <button
                        type="button"
                        onClick={handlePickFromGallery}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>בחר מגלריית המדיה</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="הדבק כתובת תמונה URL או בחר מהגלריה..."
                        className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={handlePickFromGallery}
                        className="h-9 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="פתח גלריית מדיה"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>גלריה</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        הוסף כתובת
                      </button>
                    </div>

                    {gallery.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {gallery.map((img, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            <img src={img} alt="gallery" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="absolute top-1 left-1 p-0.5 bg-rose-600 text-white rounded-md cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Smart Rules Builder */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>סגמנטציה דינמית (Smart Group)</span>
                  </h4>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                    קבוצה שמסננת אנשי קשר בזמן אמת לפי כללים וחוקים, ללא צורך בתיוג ידני.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">סוג:</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="h-8 rounded-xl border border-amber-300 bg-white text-xs font-bold px-2 focus:outline-none"
                  >
                    <option value="manual">קבוצה רגילה</option>
                    <option value="smart">קבוצה חכמה</option>
                  </select>
                </div>
              </div>

              {type === 'smart' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">תנאי התאמה:</span>
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setMatchType('all')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            matchType === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'text-slate-600'
                          }`}
                        >
                          וגם (ALL)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMatchType('any')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            matchType === 'any' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'text-slate-600'
                          }`}
                        >
                          או (ANY)
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
                      מתאימים כעת: <span className="font-mono">{liveSmartMatchingCount}</span> אנשי קשר
                    </div>
                  </div>

                  {/* Rules List */}
                  <div className="space-y-2">
                    {rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                      >
                        {/* Field */}
                        <select
                          value={rule.field}
                          onChange={(e) => handleUpdateRule(idx, 'field', e.target.value as GroupRuleField)}
                          className="flex-1 h-9 rounded-xl border border-slate-200 bg-white text-xs px-2 focus:outline-none"
                        >
                          {RULE_FIELD_OPTIONS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>

                        {/* Operator */}
                        <select
                          value={rule.operator}
                          onChange={(e) => handleUpdateRule(idx, 'operator', e.target.value as GroupRuleOperator)}
                          className="w-36 h-9 rounded-xl border border-slate-200 bg-white text-xs px-2 focus:outline-none"
                        >
                          {RULE_OPERATOR_OPTIONS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        {/* Value */}
                        {!['exists', 'not_exists'].includes(rule.operator) && (
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => handleUpdateRule(idx, 'value', e.target.value)}
                            placeholder="ערך..."
                            className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                          />
                        )}

                        {/* Delete Rule */}
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>הוסף תנאי חוק נוסף</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ביטול
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            {submitting ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>
    </div>
  );
};
