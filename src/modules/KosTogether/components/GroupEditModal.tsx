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
  Building2,
  Layers,
  Palette,
  Sliders,
  ExternalLink,
  Edit3,
  Phone,
  Mail,
  User,
  Heart,
  Eye,
  CheckCircle2,
  Info,
  Star,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { SmartGroup, GroupRule, GroupRuleField, GroupRuleOperator, ContactRecord } from '../types';
import { PRESET_COLORS, RULE_FIELD_OPTIONS, RULE_OPERATOR_OPTIONS } from '../config';
import { isContactInGroup } from '../services/groupsUtils';
import { generateCommunityVision } from '../services/togetherCopilotService';
import { LeaderContactAutocomplete } from './LeaderContactAutocomplete';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import {
  MediaPickerContract,
  CommunityGalleryContract,
  CommunityBrandContract,
  CommunityBrandProfile,
  CommunityWebPageContract,
} from '../../../core/contracts';

export type CommunityTab = 'identity' | 'services' | 'design' | 'page' | 'rules';

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

  // Contracts through HostCapabilities (Zero cross-module imports)
  const mediaPicker = getCapability<MediaPickerContract>('media-picker') || getCapability<MediaPickerContract>('community-gallery');
  const communityBrandContract = getCapability<CommunityBrandContract>('community-brand');
  const communityWebPageContract = getCapability<CommunityWebPageContract>('community-webpage');

  const [activeTab, setActiveTab] = useState<CommunityTab>('identity');
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Form State - Identity
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [selectedLeaderContact, setSelectedLeaderContact] = useState<ContactRecord | null>(null);
  const [purpose, setPurpose] = useState('');
  const [vision, setVision] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSelectLeaderContact = (contact: ContactRecord) => {
    setSelectedLeaderContact(contact);
    const chosenName = contact.conta_name || contact.fullName || contact.name || '';
    setLeaderName(chosenName);

    // Auto-fill phone and email from selected tenant contact if empty
    if (contact.conta_phone && !contactPhone.trim()) {
      setContactPhone(contact.conta_phone);
    }
    if (contact.email && !contactEmail.trim()) {
      setContactEmail(contact.email);
    }
  };

  // Form State - Services & Ecosystem
  const [services, setServices] = useState<string[]>([]);
  const [newServiceText, setNewServiceText] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Form State - Visual Tokens & Colors
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [secondaryColor, setSecondaryColor] = useState('#818cf8');

  // Form State - Web Page (/to/slug)
  const [createPage, setCreatePage] = useState(false);
  const [pageSlug, setPageSlug] = useState('');

  // Form State - Campaign
  const [targetGoal, setTargetGoal] = useState<number | ''>(5000);
  const [mainCampaignId, setMainCampaignId] = useState('');

  // Form State - Smart Segmentation Rules
  const [type, setType] = useState<'manual' | 'smart'>('manual');
  const [matchType, setMatchType] = useState<'all' | 'any'>('all');
  const [rules, setRules] = useState<GroupRule[]>([]);
  const [isGeneratingVision, setIsGeneratingVision] = useState(false);

  const handleGenerateVisionWithAi = async () => {
    if (!name.trim()) {
      alert('נא להזין קודם את שם הקהילה או הקבוצה');
      return;
    }
    try {
      setIsGeneratingVision(true);
      const res = await generateCommunityVision({
        communityName: name.trim(),
        theme: purpose.trim() || undefined,
        targetGoal: targetGoal ? Number(targetGoal) : undefined,
      });
      if (res.vision) setVision(res.vision);
      if (res.purpose && !purpose.trim()) setPurpose(res.purpose);
    } catch (err) {
      console.error('Failed to generate community vision:', err);
    } finally {
      setIsGeneratingVision(false);
    }
  };

  // Load Initial Data + Remote Community Brand Contract Data
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (editingGroup) {
        setName(editingGroup.name || '');
        const currentLeader = editingGroup.leaderName || '';
        setLeaderName(currentLeader);
        if (currentLeader) {
          const matched = contacts.find(
            (c) =>
              (c.conta_name || c.name || c.fullName) === currentLeader ||
              (editingGroup.leaderContactId && c.id === editingGroup.leaderContactId)
          );
          if (matched) setSelectedLeaderContact(matched);
          else setSelectedLeaderContact(null);
        } else {
          setSelectedLeaderContact(null);
        }
        setColor(editingGroup.color || PRESET_COLORS[0]);
        setSecondaryColor(editingGroup.secondaryColor || '#818cf8');
        setDescription(editingGroup.description || '');
        setVision(editingGroup.vision || '');
        setPurpose(editingGroup.purpose || '');
        setLogoUrl(editingGroup.logoUrl || '');
        setContactPhone(editingGroup.contactPhone || '');
        setContactEmail(editingGroup.contactEmail || '');
        setServices(editingGroup.services || ['מפגשים ואירועים', 'שיתוף ידע ותמיכה']);
        setGallery(editingGroup.gallery || []);
        setTargetGoal(editingGroup.targetGoal !== undefined ? editingGroup.targetGoal : 5000);
        setMainCampaignId(editingGroup.mainCampaignId || '');
        setPageSlug(editingGroup.pageSlug || editingGroup.pageId || '');
        const isComm = Boolean(editingGroup.isCommunity || editingGroup.pageSlug || editingGroup.pageUrl);
        setCreatePage(isComm);
        setType(editingGroup.type || 'manual');
        setMatchType(editingGroup.matchType || 'all');
        setRules(editingGroup.rules || []);
        setActiveTab(editingGroup.type === 'smart' ? 'rules' : 'identity');

        // Check if there is an isolated brand profile in KosBrandingTo
        if (communityBrandContract && editingGroup.id) {
          try {
            const brandProfile = await communityBrandContract.getCommunityBrand(editingGroup.id);
            if (brandProfile && mounted) {
              if (brandProfile.purpose) setPurpose(brandProfile.purpose);
              if (brandProfile.vision) setVision(brandProfile.vision);
              if (brandProfile.logoUrl) setLogoUrl(brandProfile.logoUrl);
              if (brandProfile.services && brandProfile.services.length > 0) setServices(brandProfile.services);
              if (brandProfile.gallery && brandProfile.gallery.length > 0) setGallery(brandProfile.gallery);
              if (brandProfile.colors?.primaryColor) setColor(brandProfile.colors.primaryColor);
              if (brandProfile.colors?.secondaryColor) setSecondaryColor(brandProfile.colors.secondaryColor);
              if (brandProfile.leaderName) {
                setLeaderName(brandProfile.leaderName);
                const matched = contacts.find(
                  (c) =>
                    (c.conta_name || c.name || c.fullName) === brandProfile.leaderName ||
                    (brandProfile.leaderContactId && c.id === brandProfile.leaderContactId)
                );
                if (matched) setSelectedLeaderContact(matched);
              }
              if (brandProfile.contactPhone) setContactPhone(brandProfile.contactPhone);
              if (brandProfile.contactEmail) setContactEmail(brandProfile.contactEmail);
            }
          } catch (e) {
            console.warn('[KosTogether] Load community brand profile error:', e);
          }
        }
      } else {
        setName('');
        setLeaderName('');
        setSelectedLeaderContact(null);
        setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
        setSecondaryColor('#818cf8');
        setDescription('');
        setVision('');
        setPurpose('');
        setLogoUrl('');
        setContactPhone('');
        setContactEmail('');
        setServices(['מפגשים ואירועים', 'שיתוף ידע']);
        setGallery([]);
        setTargetGoal(5000);
        setMainCampaignId('');
        setPageSlug('');
        if (initialMode === 'community') {
          setCreatePage(true);
          setType('manual');
          setRules([]);
          setActiveTab('identity');
        } else if (initialMode === 'smart') {
          setCreatePage(false);
          setType('smart');
          setRules([{ field: 'total_spent', operator: 'gte', value: 500 }]);
          setActiveTab('rules');
        } else {
          setCreatePage(false);
          setType('manual');
          setRules([]);
          setActiveTab('identity');
        }
      }
    }

    if (isOpen) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [editingGroup, initialMode, isOpen, communityBrandContract]);

  // Completeness Score Calculation (Style of KosBranding)
  const completenessScore = useMemo(() => {
    let score = 0;
    if (name.trim()) score += 20;
    if (purpose.trim() || vision.trim()) score += 20;
    if (logoUrl) score += 15;
    if (services.length > 0) score += 15;
    if (createPage && pageSlug.trim()) score += 15;
    if (leaderName.trim() || contactPhone.trim()) score += 15;
    return Math.min(100, score);
  }, [name, purpose, vision, logoUrl, services, createPage, pageSlug, leaderName, contactPhone]);

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

  // Media Picker Trigger (Enhanced KOSUN26 Gallery Contract)
  const handlePickLogo = async () => {
    if (mediaPicker?.openPicker) {
      try {
        const selected = await mediaPicker.openPicker({
          accept: 'image/*',
          multiple: false,
          initialTab: 'icons',
        });
        if (selected) {
          const rawUrl = Array.isArray(selected) ? selected[0] : (typeof selected === 'string' ? selected : (selected as any)?.url);
          if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim()) {
            setLogoUrl(rawUrl.trim());
          }
        }
      } catch (err) {
        console.warn('[GroupEditModal] Logo picker error:', err);
      }
    }
  };

  const handlePickGallery = async () => {
    if (mediaPicker?.openPicker) {
      try {
        const selected = await mediaPicker.openPicker({
          accept: 'image/*',
          multiple: true,
          maxFiles: 12,
          initialTab: 'gallery',
        });
        if (selected) {
          const rawList = Array.isArray(selected) ? selected : [selected];
          const urls = rawList
            .map((item) => (typeof item === 'string' ? item : (item as any)?.url))
            .filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
          if (urls.length > 0) {
            setGallery((prev) => [...prev, ...urls]);
          }
        }
      } catch (err) {
        console.warn('[GroupEditModal] Gallery picker error:', err);
      }
    }
  };

  const handleSetMainGalleryImage = (idx: number) => {
    if (idx <= 0 || idx >= gallery.length) return;
    setGallery((prev) => {
      const target = prev[idx];
      const remaining = prev.filter((_, i) => i !== idx);
      return [target, ...remaining];
    });
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddService = () => {
    if (newServiceText.trim()) {
      setServices((prev) => [...prev, newServiceText.trim()]);
      setNewServiceText('');
    }
  };

  const handleRemoveService = (idx: number) => {
    setServices((prev) => prev.filter((_, i) => i !== idx));
  };

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

  // Generate clean slug from name or input
  const cleanCalculatedSlug = useMemo(() => {
    const raw = pageSlug || name;
    return raw
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'community';
  }, [pageSlug, name]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('נא להזין שם לקבוצה או לקהילה');
      return;
    }

    try {
      setSubmitting(true);
      const chosenCamp = campaigns.find((c) => c.id === mainCampaignId);
      const effectiveSlug = createPage ? cleanCalculatedSlug : '';
      const communityId = editingGroup?.id || `comm_${Date.now()}`;

      // 1. Save to KosTogether CRM Groups
      const res = await saveGroup({
        id: editingGroup?.id || communityId,
        previousName: editingGroup?.name,
        name: name.trim(),
        leaderName: leaderName.trim(),
        leaderContactId: selectedLeaderContact?.id || editingGroup?.leaderContactId,
        color,
        secondaryColor,
        logoUrl,
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        services,
        description: description.trim(),
        vision: vision.trim(),
        purpose: purpose.trim(),
        gallery,
        targetGoal: targetGoal === '' ? 5000 : Number(targetGoal),
        mainCampaignId: createPage ? mainCampaignId : '',
        campaignTitle: createPage ? chosenCamp?.title : '',
        pageSlug: effectiveSlug,
        pageUrl: effectiveSlug ? `/to/${effectiveSlug}` : '',
        createPage,
        isCommunity: initialMode === 'community' || createPage || Boolean(editingGroup?.isCommunity),
        category: (initialMode === 'community' || createPage || Boolean(editingGroup?.isCommunity)) ? 'community' : 'group',
        type,
        matchType,
        rules: type === 'smart' ? rules : [],
      });

      const finalId = res?.id || communityId;

      // 2. Save Community Brand Contract to KosBrandingTo (Monopoly Rule)
      if (communityBrandContract) {
        const brandProfile: CommunityBrandProfile = {
          communityId: finalId,
          name: name.trim(),
          purpose: purpose.trim() || description.trim(),
          vision: vision.trim(),
          logoUrl,
          coverImageUrl: gallery[0] || '',
          services,
          gallery,
          colors: {
            primaryColor: color,
            secondaryColor,
            backgroundColor: '#ffffff',
            textColor: '#0f172a',
          },
          leaderName: leaderName.trim(),
          leaderContactId: selectedLeaderContact?.id || editingGroup?.leaderContactId,
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          websiteUrl: effectiveSlug ? `/to/${effectiveSlug}` : '',
        };
        await communityBrandContract.saveCommunityBrand(brandProfile);
      }

      // 3. Create or Update Web Page in KosWebAi via Contract (Slug /to/:slug)
      if (createPage && communityWebPageContract && effectiveSlug) {
        await communityWebPageContract.createOrUpdateCommunityPage({
          communityId: finalId,
          slug: effectiveSlug,
          pageTitle: name.trim(),
          description: purpose.trim() || vision.trim() || description.trim(),
          brandProfile: {
            communityId: finalId,
            name: name.trim(),
            purpose: purpose.trim(),
            vision: vision.trim(),
            logoUrl,
            coverImageUrl: gallery[0] || '',
            services,
            gallery,
            colors: {
              primaryColor: color,
              secondaryColor,
            },
            leaderName: leaderName.trim(),
            leaderContactId: selectedLeaderContact?.id || editingGroup?.leaderContactId,
            contactPhone: contactPhone.trim(),
            contactEmail: contactEmail.trim(),
          },
          gallery,
          isPublished: true,
        });
      }

      setSaveSuccessNotice(true);
      setTimeout(() => {
        setSaveSuccessNotice(false);
        onClose();
      }, 700);
    } catch (err: any) {
      alert('שגיאה בשמירת כרטיס הקהילה: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPageBuilder = () => {
    if (communityWebPageContract) {
      const pId = `to_${editingGroup?.id || 'new'}`;
      communityWebPageContract.openPageBuilderForCommunity(pId);
    } else {
      window.location.href = `/KosWebAi`;
    }
  };

  const TAB_ITEMS: Array<{ id: CommunityTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'identity', label: '1. זהות עסקית ומטרה', icon: Building2 },
    { id: 'services', label: '2. שירותים ופעילויות', icon: Layers },
    { id: 'design', label: '3. שפה חזותית וצבעים', icon: Palette },
    { id: 'page', label: '4. עמוד אינטרנט (/to/)', icon: Globe },
    { id: 'rules', label: '5. סגמנטציה חכמה', icon: Sliders },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950/80 backdrop-blur-md overflow-y-auto flex flex-col items-center justify-start p-2 sm:p-6" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-right animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Pinned Top Bar: Luxury Header (Style of KosBranding) */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {editingGroup ? `כרטיס נתונים: ${editingGroup.name}` : 'פתיחת קהילה חדשה (KosBrandingTo)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] text-indigo-700 dark:text-indigo-300 font-bold font-mono">
                  KosBrandingTo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ניהול זהות, מיתוג עצמאי, שירותים ועמוד אינטרנט תחת /to/
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Completeness Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors border ${
                completenessScore >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : completenessScore >= 50
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}
              title="ציון שלמות כרטיס הקהילה"
            >
              <span>{completenessScore}%</span>
              <span className="text-[10px] font-normal hidden sm:inline">שלמות</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Style of KosBranding) */}
        <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success Notice */}
        {saveSuccessNotice && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>כרטיס נתוני הקהילה נשמר וסונכרן בהצלחה בכל החוזים!</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 max-h-[64vh]">

          {/* TAB 1: זהות עסקית ומטרה */}
          {activeTab === 'identity' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    שם הקהילה <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="לדוגמה: קהילת יזמי ירושלים, בוגרי מחזור כ״ד"
                    className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    מוביל הקהילה / מנהל ראשי
                  </label>
                  <LeaderContactAutocomplete
                    value={leaderName}
                    onChange={(val) => {
                      setLeaderName(val);
                      if (selectedLeaderContact && (selectedLeaderContact.conta_name || selectedLeaderContact.name) !== val) {
                        setSelectedLeaderContact(null);
                      }
                    }}
                    contacts={contacts}
                    onSelectContact={handleSelectLeaderContact}
                    placeholder="הקלד שם, טלפון או דוא״ל לחיפוש בטננט..."
                  />

                  {/* Connected CRM Contact Badge & Quick Sync Actions */}
                  {selectedLeaderContact && (
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-bold">איש קשר מקושר מהטננט:</span>
                        <span className="truncate font-semibold">
                          {selectedLeaderContact.conta_name || selectedLeaderContact.fullName || selectedLeaderContact.name}
                        </span>
                        {selectedLeaderContact.conta_phone && (
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]" dir="ltr">
                            ({selectedLeaderContact.conta_phone})
                          </span>
                        )}
                      </div>
                      {((selectedLeaderContact.conta_phone && contactPhone !== selectedLeaderContact.conta_phone) ||
                        (selectedLeaderContact.email && contactEmail !== selectedLeaderContact.email)) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedLeaderContact.conta_phone) setContactPhone(selectedLeaderContact.conta_phone);
                            if (selectedLeaderContact.email) setContactEmail(selectedLeaderContact.email);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition-colors cursor-pointer shrink-0 shadow-sm"
                          title="עדכן את מס' הטלפון והמייל של הקהילה לפי פרטי איש הקשר הנבחר"
                        >
                          סנכרן טלפון ומייל לקהילה
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Logo / Brand Symbol */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">לוגו או סמל הקהילה</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">יוצג בעמודי הקהילה, בהודעות ובלוח הבקרה</span>
                  </div>
                  {mediaPicker && (
                    <button
                      type="button"
                      onClick={handlePickLogo}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>בחר מסמלי יוקרה או מספריית המדיה</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative group w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-sm">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="הסר לוגו"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="הדבק קישור ישיר ללוגו (URL) או בחר מהגלריה..."
                    className="flex-1 h-10 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Purpose & Vision */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">הגדרת תוכן הקהילה</span>
                  <button
                    type="button"
                    onClick={handleGenerateVisionWithAi}
                    disabled={isGeneratingVision}
                    className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 border border-indigo-200/60 dark:border-indigo-800/60 transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingVision ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingVision ? 'KOSAI מנסח חזון ומטרות...' : 'נסח חזון ומטרה עם KOSAI'}</span>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    מטרת הקהילה (Purpose) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={2}
                    placeholder="מה המטרה המרכזית לשמה הוקמה הקהילה ומה הערך לחבריה..."
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    חזון הקהילה ותיאור מורחב (Vision)
                  </label>
                  <textarea
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    rows={3}
                    placeholder="החזון ארוך הטווח, ערכי היסוד של הקהילה ומה אנחנו שואפים להשיג יחד..."
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none dark:text-white"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    טלפון ליצירת קשר עם הקהילה
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="050-1234567"
                      className="w-full h-10 pr-9 pl-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    דוא״ל ליצירת קשר
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="community@org.co.il"
                      className="w-full h-10 pr-9 pl-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white font-mono"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: שירותים ופעילויות */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Services List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      שירותי ופעילויות הקהילה (Services Ecosystem)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      אילו פעילויות, תכנים או שירותים הקהילה מעניקה לחבריה
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newServiceText}
                    onChange={(e) => setNewServiceText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    placeholder="הוסף שירות או פעילות (לדוגמה: סדנאות חודשיות, מנטורינג, קבוצת ריצה)..."
                    className="flex-1 h-10 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="h-10 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center gap-2"
                    >
                      <span>{srv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-indigo-400 hover:text-rose-500 transition-colors"
                        title="הסר שירות"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <span className="text-xs text-slate-400 italic">לא הוגדרו עדיין שירותים ספציפיים</span>
                  )}
                </div>
              </div>

              {/* Community Media Gallery (KosCloudStore Contract & UI) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          גלריית תמונות מהפעילות
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                          {gallery.length} תמונות
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        תמונות מהשטח, אירועים וכנסים שיוצגו בעמוד הקהילה ובפורטל
                      </span>
                    </div>
                  </div>

                  {mediaPicker && (
                    <button
                      type="button"
                      onClick={handlePickGallery}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>הוסף תמונות מ-KosCloudStore</span>
                    </button>
                  )}
                </div>

                {gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                    {gallery.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}_${idx}`}
                        className="relative group rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs"
                      >
                        <img src={imgUrl} alt={`קהילה ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Primary Badge */}
                        {idx === 0 && (
                          <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-indigo-600/95 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs pointer-events-none">
                            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                            <span>תמונה ראשית</span>
                          </div>
                        )}

                        {/* Action Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainGalleryImage(idx)}
                              className="px-2 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold flex items-center gap-1 transition-transform hover:scale-105"
                              title="הגדר כתמונה ראשית של הקהילה"
                            >
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>הגדר כראשית</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-transform hover:scale-105"
                            title="הסר תמונה מהגלריה"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePickGallery}
                    className="w-full h-32 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 transition-all gap-2 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        בחר תמונות מספריית המדיה KosCloudStore
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        תמונות מאירועים, כנסים, מפגשים ותיעוד מהשטח עבור עמוד הקהילה
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: שפה חזותית וצבעים */}
          {activeTab === 'design' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  צבע ראשי של הקהילה (Primary Color)
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        color === c ? 'scale-125 ring-4 ring-indigo-500/30' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  צבע משני להדגשות (Secondary Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-28 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono dark:text-white"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">תצוגה מקדימה של כרטיס המיתוג</span>
                <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: `${color}15`, borderRight: `4px solid ${color}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: color }}>
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : (name[0] || 'K')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{name || 'שם הקהילה'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{purpose || 'מטרת הקהילה תופיע כאן...'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold text-white shadow-xs" style={{ backgroundColor: secondaryColor }}>
                    קהילה פעילה
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: עמוד אינטרנט /to/ */}
          {activeTab === 'page' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-100 block">עמוד אינטרנט רשמי לקהילה</span>
                  <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    מוקם ומנוהל עצמאית תחת KWB בסלאג /to/
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createPage}
                    onChange={(e) => setCreatePage(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {createPage && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      כתובת אינטרנט ציבורית (Slug) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5" dir="ltr">
                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                        <span>https://domain.com/to/</span>
                      </div>
                      <input
                        type="text"
                        value={pageSlug}
                        onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder={cleanCalculatedSlug}
                        className="flex-1 h-10 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
                        dir="ltr"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      הכתובת המלאה לעמוד הקהילה תהיה: <strong className="font-mono text-indigo-600 dark:text-indigo-400">/to/{cleanCalculatedSlug}</strong>
                    </span>
                  </div>

                  {/* Actions Bar for Web Page */}
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={`/to/${cleanCalculatedSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      <span>צפייה בעמוד הציבורי</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    <button
                      type="button"
                      onClick={handleOpenPageBuilder}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>עריכה מלאה ב-KWB</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: סגמנטציה חכמה */}
          {activeTab === 'rules' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div>
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-100 block">הפעלת סגמנטציה חכמה</span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300">
                    אנשי קשר יצטרפו ויוסרו אוטומטית לפי חוקים מוגדרים מראש
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setType('manual')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      type === 'manual' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ידנית
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('smart')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      type === 'smart' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    חכמה
                  </button>
                </div>
              </div>

              {type === 'smart' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">התאמה לתנאים:</span>
                      <select
                        value={matchType}
                        onChange={(e) => setMatchType(e.target.value as any)}
                        className="h-8 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="all">כל התנאים (AND)</option>
                        <option value="any">אחד התנאים (OR)</option>
                      </select>
                    </div>

                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      התאמות בזמן אמת: {liveSmartMatchingCount} אנשי קשר
                    </span>
                  </div>

                  <div className="space-y-2">
                    {rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <select
                          value={rule.field}
                          onChange={(e) => handleUpdateRule(idx, 'field', e.target.value)}
                          className="h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                        >
                          {RULE_FIELD_OPTIONS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={rule.operator}
                          onChange={(e) => handleUpdateRule(idx, 'operator', e.target.value)}
                          className="h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        >
                          {RULE_OPERATOR_OPTIONS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => handleUpdateRule(idx, 'value', e.target.value)}
                          placeholder="ערך..."
                          className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveRule(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                          title="מחק חוק"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף תנאי חכם</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ביטול
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span>שומר ומסנכרן...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>שמור וסנכרן כרטיס נתונים</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
