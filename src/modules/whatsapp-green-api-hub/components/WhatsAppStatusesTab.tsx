import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Send, Image, Type, Eye, Clock, CheckCircle,
  AlertCircle, RefreshCw, Trash2, ExternalLink, Play, Film,
  Users, Palette, ChevronRight, ChevronLeft, ShieldCheck, Database,
  Search, Filter, Smartphone, CheckCheck, X, FolderOpen, Wand2,
  Tag, UserCheck, CheckSquare, Square, Layers, BookOpen, ShoppingBag,
  Megaphone, Lightbulb, Ticket, Flame, Crown, Zap, Check
} from 'lucide-react';
import { Firestore, collection, getDocs } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';
import { GreenApiService } from '../services/greenApiService';
import {
  GreenApiStatusFont,
  SavedWhatsAppStatus,
  GreenApiStatusStatisticItem
} from '../types';
import {
  saveStatusToArchive,
  loadStatusesFromArchive,
  updateStatusStatisticsInArchive,
  deleteStatusFromArchive
} from '../services/whatsappStatusService';
import {
  WhatsAppAiBotService,
  STATUS_PRESETS,
  STATUS_TONE_LABELS,
  StatusTone,
  StatusVariation
} from '../services/whatsappAiBotService';
import { normalizePhone } from '../services/whatsappCrmSyncService';
import { WhatsAppMediaPicker } from './WhatsAppMediaPicker';
import { WhatsAppImageStudio } from './WhatsAppImageStudio';
import { WhatsAppStatusAutomationsTab } from './WhatsAppStatusAutomationsTab';

interface MediaItem { id: string; url: string; type: string; name: string; description?: string; }

// Crisp Lucide Icon Mappings replacing raw emojis
const getToneIcon = (tone: StatusTone) => {
  switch (tone) {
    case 'chasidic':
      return <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case 'marketing':
      return <Megaphone className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    case 'official':
      return <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    case 'warm':
      return <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'viral':
      return <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
  }
};

const getPresetIcon = (presetId: string) => {
  switch (presetId) {
    case 'chasidic_sukkot':
      return <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'chasidic_parasha':
      return <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case 'flash_sale':
      return <ShoppingBag className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    case 'community_news':
      return <Megaphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    case 'value_tip':
      return <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
    case 'event_invite':
      return <Ticket className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    default:
      return <Flame className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
  }
};

interface Props {
  service: GreenApiService;
  db?: Firestore;
  firebaseApp?: FirebaseApp;
  collectionName?: string;
  isDark: boolean;
  connectedAccountName?: string;
  googleAiApiKey?: string;
}

const PRESET_COLORS = [
  '#075E54', '#128C7E', '#25D366', '#8E24AA',
  '#E91E63', '#FF5722', '#34B7F1', '#000000',
  '#1E293B', '#D32F2F', '#5C6BC0', '#F57C00'
];

const PRESET_FONTS: { id: GreenApiStatusFont; name: string; family: string }[] = [
  { id: 'SANS_SERIF', name: 'Sans-Serif (ברירת מחדל)', family: 'sans-serif' },
  { id: 'SERIF', name: 'Serif (קלאסי)', family: 'serif' },
  { id: 'NORICAN_REGULAR', name: 'Norican (קליגרפי)', family: 'cursive' },
  { id: 'BRYNDAN_WRITE', name: 'Bryndan (כתב יד)', family: 'cursive' },
  { id: 'OSWALD_HEAVY', name: 'Oswald (מודגש כותרת)', family: 'impact, sans-serif' },
];

interface CrmGroupInfo {
  id: string;
  name: string;
  memberCount?: number;
  color?: string;
}

interface CrmContactInfo {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  group?: string;
}

export const WhatsAppStatusesTab: React.FC<Props> = ({
  service,
  db,
  firebaseApp,
  collectionName = 'whatsapp_statuses',
  isDark,
  connectedAccountName = 'חשבון WhatsApp',
  googleAiApiKey,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDnaContract = getCapability<BrandDnaContract>('brand-dna');
  const brandDna = brandDnaContract ? brandDnaContract.getBrandDna() : null;

  // Mode: 'create' | 'archive'
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'archive' | 'automations'>('create');

  // Creator state
  const [statusType, setStatusType] = useState<'text' | 'media'>('text');
  const [textMessage, setTextMessage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#128C7E');
  const [font, setFont] = useState<GreenApiStatusFont>('SANS_SERIF');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('status.jpg');
  const [mediaCaption, setMediaCaption] = useState('');

  // Media Gallery Picker Modal state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  // Gemini AI Image Studio Modal state (PRO Feature)
  const [isAiImageStudioOpen, setIsAiImageStudioOpen] = useState(false);

  // Audience & CRM integration state
  const [targetAudience, setTargetAudience] = useState<'all' | 'crm_group' | 'crm_tag' | 'custom'>('all');
  const [customParticipantsInput, setCustomParticipantsInput] = useState('');
  const [crmGroups, setCrmGroups] = useState<CrmGroupInfo[]>([]);
  const [crmContacts, setCrmContacts] = useState<CrmContactInfo[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedCrmGroup, setSelectedCrmGroup] = useState<string>('');
  const [selectedCrmTag, setSelectedCrmTag] = useState<string>('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isLoadingCrmData, setIsLoadingCrmData] = useState(false);

  // AI Generator & Enhancer State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isEnhancingAi, setIsEnhancingAi] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState<StatusTone>('chasidic');
  const [generatedVariations, setGeneratedVariations] = useState<StatusVariation[]>([]);
  const [aiFeedbackMessage, setAiFeedbackMessage] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; msg: string; idMessage?: string } | null>(null);

  // Statuses storage list
  const [statuses, setStatuses] = useState<SavedWhatsAppStatus[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Story Viewer Modal
  const [viewingStory, setViewingStory] = useState<SavedWhatsAppStatus | null>(null);

  // Viewers Details Modal
  const [viewersModalStatus, setViewersModalStatus] = useState<SavedWhatsAppStatus | null>(null);

  // Filter & Search in Archive
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load archive on mount / when db changes
  useEffect(() => {
    setIsLoadingArchive(true);
    loadStatusesFromArchive(db, collectionName)
      .then((items) => {
        setStatuses(items);
      })
      .finally(() => {
        setIsLoadingArchive(false);
      });
  }, [db, collectionName]);

  // Load CRM Groups & Contacts for live audience selection
  useEffect(() => {
    if (!db) return;
    let isMounted = true;
    setIsLoadingCrmData(true);

    const fetchCrmData = async () => {
      try {
        // 1. Fetch CRM Groups
        const groupsSnap = await getDocs(collection(db, 'crm_groups')).catch(() => null);
        const loadedGroups: CrmGroupInfo[] = [];
        if (groupsSnap) {
          groupsSnap.forEach((docSnap) => {
            const data = docSnap.data();
            loadedGroups.push({
              id: docSnap.id,
              name: data.name || docSnap.id,
              memberCount: data.memberCount || 0,
              color: data.color || '#3b82f6',
            });
          });
        }

        // 2. Fetch CRM Contacts
        const contactsSnap = await getDocs(collection(db, 'contacts')).catch(() => null);
        const loadedContacts: CrmContactInfo[] = [];
        const tagSet = new Set<string>();

        if (contactsSnap) {
          contactsSnap.forEach((docSnap) => {
            const data = docSnap.data();
            const rawPhone = data.phone || data.conta_phone || data.mobile || data.phoneNumber || '';
            const normalized = normalizePhone(String(rawPhone));
            const name = data.name || data.conta_name || data.fullName || (normalized ? `0${normalized}` : 'איש קשר');
            const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
            tags.forEach((t) => tagSet.add(t));

            const groupName = data.group || data.community || data.sourceGroupName || '';
            if (groupName && !loadedGroups.some((g) => g.name === groupName)) {
              loadedGroups.push({
                id: `group_${groupName}`,
                name: groupName,
                memberCount: 1,
              });
            }

            if (normalized) {
              loadedContacts.push({
                id: docSnap.id,
                name,
                phone: normalized,
                tags,
                group: groupName,
              });
            }
          });
        }

        if (isMounted) {
          setCrmGroups(loadedGroups);
          setCrmContacts(loadedContacts);
          setAvailableTags(Array.from(tagSet));
          if (loadedGroups.length > 0 && !selectedCrmGroup) {
            setSelectedCrmGroup(loadedGroups[0].name);
          }
          if (tagSet.size > 0 && !selectedCrmTag) {
            setSelectedCrmTag(Array.from(tagSet)[0]);
          }
        }
      } catch (err) {
        console.warn('[WhatsAppStatusesTab] CRM fetch notice:', err);
      } finally {
        if (isMounted) setIsLoadingCrmData(false);
      }
    };

    fetchCrmData();
    return () => {
      isMounted = false;
    };
  }, [db]);

  // Active stories (created within last 24 hours)
  const now = Date.now();
  const activeStories = useMemo(() => {
    return statuses.filter((s) => s.expiresAt > now);
  }, [statuses, now]);

  const expiredStories = useMemo(() => {
    return statuses.filter((s) => s.expiresAt <= now);
  }, [statuses, now]);

  // Filtered statuses list for archive table/grid
  const filteredStatuses = useMemo(() => {
    return statuses.filter((s) => {
      const isActive = s.expiresAt > now;
      if (filterType === 'active' && !isActive) return false;
      if (filterType === 'expired' && isActive) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const msg = (s.message || s.caption || s.fileName || '').toLowerCase();
        const id = s.id.toLowerCase();
        if (!msg.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [statuses, filterType, searchTerm, now]);

  // Overall statistics KPI
  const totalViews = useMemo(() => {
    return statuses.reduce((acc, s) => acc + (s.viewersCount || 0), 0);
  }, [statuses]);

  // Derived target participants based on selected audience mode
  const derivedParticipants = useMemo<string[] | undefined>(() => {
    if (targetAudience === 'all') {
      return undefined;
    }

    if (targetAudience === 'crm_group' && selectedCrmGroup) {
      const groupContacts = crmContacts.filter(
        (c) => (c.group || '').toLowerCase().trim() === selectedCrmGroup.toLowerCase().trim()
      );
      return groupContacts
        .map((c) => (c.phone.startsWith('972') ? c.phone : `972${c.phone}`))
        .map((p) => `${p}@c.us`);
    }

    if (targetAudience === 'crm_tag' && selectedCrmTag) {
      const taggedContacts = crmContacts.filter((c) => c.tags.includes(selectedCrmTag));
      return taggedContacts
        .map((c) => (c.phone.startsWith('972') ? c.phone : `972${c.phone}`))
        .map((p) => `${p}@c.us`);
    }

    if (targetAudience === 'custom') {
      const manualPhones = customParticipantsInput
        .split(/[\n,;]+/)
        .map((p) => p.trim().replace(/\D/g, ''))
        .filter((p) => p.length >= 7)
        .map((p) => (p.startsWith('972') ? p : p.startsWith('0') ? `972${p.substring(1)}` : `972${p}`))
        .map((p) => `${p}@c.us`);

      const selectedCrmPhones = crmContacts
        .filter((c) => selectedContactIds.has(c.id))
        .map((c) => (c.phone.startsWith('972') ? c.phone : `972${c.phone}`))
        .map((p) => `${p}@c.us`);

      const combined = Array.from(new Set([...manualPhones, ...selectedCrmPhones]));
      return combined.length > 0 ? combined : undefined;
    }

    return undefined;
  }, [
    targetAudience,
    selectedCrmGroup,
    selectedCrmTag,
    customParticipantsInput,
    selectedContactIds,
    crmContacts,
  ]);

  // Refresh stats for all active statuses from GREEN-API
  const handleRefreshAllStatistics = async () => {
    if (!service.isConfigured()) return;
    setIsRefreshingStats(true);
    try {
      const updatedStatuses = [...statuses];
      for (const st of updatedStatuses) {
        if (st.id) {
          try {
            const stats = await service.getStatusStatistic(st.id);
            if (Array.isArray(stats)) {
              const viewersCount = stats.filter((s) => s.status === 'read').length;
              const deliveredCount = stats.filter((s) => s.status === 'delivered').length;
              const sentCount = stats.filter((s) => s.status === 'sent').length;

              st.statistics = stats;
              st.viewersCount = viewersCount;
              st.deliveredCount = deliveredCount;
              st.sentCount = sentCount;
              st.lastSyncedAt = Date.now();

              await updateStatusStatisticsInArchive(db, collectionName, st.id, stats);
            }
          } catch (err) {
            console.warn(`Failed to refresh stats for status ${st.id}:`, err);
          }
        }
      }
      setStatuses([...updatedStatuses]);
      if (viewersModalStatus) {
        const refreshedCurrent = updatedStatuses.find((s) => s.id === viewersModalStatus.id);
        if (refreshedCurrent) {
          setViewersModalStatus({ ...refreshedCurrent });
        }
      }
    } finally {
      setIsRefreshingStats(false);
    }
  };

  // Enhance / Polish Existing Text with AI
  const handleEnhanceWithAi = async () => {
    const currentText = statusType === 'text' ? textMessage.trim() : mediaCaption.trim();
    if (!currentText) {
      alert('נא להזין טקסט בסטטוס כדי שנוכל לשפר וללטש אותו עם AI');
      return;
    }

    setIsEnhancingAi(true);
    setAiFeedbackMessage(null);

    try {
      const result = await WhatsAppAiBotService.enhanceStatusText({
        apiKey: googleAiApiKey || '',
        originalText: currentText,
        tone: selectedTone,
      });

      if (statusType === 'text') {
        setTextMessage(result.text);
      } else {
        setMediaCaption(result.text);
      }

      setAiFeedbackMessage(
        result.costReport
          ? `✨ הטקסט שופר בהצלחה! (${result.costReport.formattedSummary})`
          : '✨ הטקסט שופר בהצלחה והותאם לסטורי בוואטסאפ!'
      );
      setTimeout(() => setAiFeedbackMessage(null), 5000);
    } catch (e: any) {
      alert(`שגיאה בשיפור הטקסט: ${e.message}`);
    } finally {
      setIsEnhancingAi(false);
    }
  };

  // Generate 3 Variations with AI from Topic or Preset
  const handleGenerateAiStatus = async (customTopic?: string) => {
    const topicToUse = (customTopic || aiPromptTopic).trim();
    if (!topicToUse) {
      alert('נא להקליד נושא לסטטוס או לבחור באחת התבניות המוכנות מטה');
      return;
    }

    setIsGeneratingAi(true);
    setAiFeedbackMessage(null);

    try {
      const result = await WhatsAppAiBotService.generateStatusVariations({
        apiKey: googleAiApiKey || '',
        topic: topicToUse,
        tone: selectedTone,
        brandDna: brandDna,
      });

      setGeneratedVariations(result.variations);

      // Auto-apply the first variation
      if (result.variations.length > 0) {
        if (statusType === 'text') {
          setTextMessage(result.variations[0].text);
        } else {
          setMediaCaption(result.variations[0].text);
        }
      }

      setAiFeedbackMessage(
        result.costReport
          ? `🎉 נוצרו ${result.variations.length} גרסאות שונות! (${result.costReport.formattedSummary})`
          : `🎉 נוצרו ${result.variations.length} גרסאות שונות לבחירתך!`
      );
      setTimeout(() => setAiFeedbackMessage(null), 6000);
    } catch (e: any) {
      alert(`שגיאה ביצירת סטטוס AI: ${e.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Apply a selected variation card
  const handleApplyVariation = (v: StatusVariation) => {
    if (statusType === 'text') {
      setTextMessage(v.text);
    } else {
      setMediaCaption(v.text);
    }
    setAiFeedbackMessage(`✓ גרסה "${v.title}" הוחלה על הסטטוס!`);
    setTimeout(() => setAiFeedbackMessage(null), 3000);
  };

  // Media Picker selection handler
  const handleSelectMediaFromGallery = (items: MediaItem[]) => {
    if (items && items.length > 0) {
      const selected = items[0];
      setMediaUrl(selected.url);
      setFileName(selected.name || 'status.jpg');
      if (selected.description && !mediaCaption) {
        setMediaCaption(selected.description);
      }
      setIsMediaPickerOpen(false);
    }
  };

  // Publish Status to WhatsApp
  const handlePublishStatus = async () => {
    if (!service.isConfigured()) {
      alert('GREEN-API אינו מחובר. אנא ודא חיבור ברכיב הסנכרון וההגדרות.');
      return;
    }

    if (statusType === 'text' && !textMessage.trim()) {
      alert('נא להזין תוכן לסטטוס הטקסט');
      return;
    }

    if (statusType === 'media' && !mediaUrl.trim()) {
      alert('נא להזין קישור ישיר לתמונה או לווידאו או לבחור מגלריית המדיה');
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    try {
      let res: any;
      let finalMediaUrl = mediaUrl.trim();
      let finalFileName = fileName.trim() || `status_${Date.now()}.png`;

      if (statusType === 'text') {
        res = await service.sendTextStatus({
          message: textMessage.trim(),
          backgroundColor,
          font,
          participants: derivedParticipants,
        });
      } else {
        // If mediaUrl is a base64 Data URL or Blob URL, upload to Firebase Cloud Storage first
        if ((finalMediaUrl.startsWith('data:') || finalMediaUrl.startsWith('blob:')) && firebaseApp) {
          try {
            let fileToUpload: Blob;
            if (finalMediaUrl.startsWith('data:')) {
              const [header, base64] = finalMediaUrl.split(',');
              const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
              const byteString = atob(base64);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              fileToUpload = new Blob([ab], { type: mime });
            } else {
              const blobRes = await fetch(finalMediaUrl);
              fileToUpload = await blobRes.blob();
            }

            const storageRef = ref(getStorage(firebaseApp), `whatsapp_statuses/${finalFileName}`);
            await uploadBytes(storageRef, fileToUpload);
            const storageUrl = await getDownloadURL(storageRef);
            finalMediaUrl = storageUrl;
            setMediaUrl(storageUrl);
          } catch (storageErr: any) {
            console.warn('Failed to upload status media to Firebase Storage:', storageErr);
          }
        }

        if (finalMediaUrl.startsWith('data:') || finalMediaUrl.startsWith('blob:')) {
          throw new Error('שליחת סטטוס מדיה דורשת קישור אינטרנטי ישיר. אנא ודא חיבור תקין ל-Firebase Storage או בחר תמונה מגלריית המדיה.');
        }

        res = await service.sendMediaStatus({
          urlFile: finalMediaUrl,
          fileName: finalFileName,
          caption: mediaCaption.trim() || undefined,
          participants: derivedParticipants,
        });
      }

      const idMessage = res?.idMessage || `status_${Date.now()}`;
      const publishedAt = Date.now();
      const expiresAt = publishedAt + 24 * 60 * 60 * 1000;

      const newSavedStatus: SavedWhatsAppStatus = {
        id: idMessage,
        type: statusType,
        message: statusType === 'text' ? textMessage.trim() : undefined,
        urlFile: statusType === 'media' ? finalMediaUrl : undefined,
        fileName: statusType === 'media' ? finalFileName : undefined,
        caption: statusType === 'media' ? mediaCaption.trim() : undefined,
        backgroundColor: statusType === 'text' ? backgroundColor : undefined,
        font: statusType === 'text' ? font : undefined,
        createdAt: publishedAt,
        expiresAt,
        accountName: connectedAccountName,
        viewersCount: 0,
        deliveredCount: 0,
        sentCount: 0,
        statistics: [],
        lastSyncedAt: publishedAt,
      };

      await saveStatusToArchive(db, collectionName, newSavedStatus);
      setStatuses((prev) => [newSavedStatus, ...prev]);

      setPublishResult({
        success: true,
        msg: 'הסטטוס פורסם בהצלחה בוואטסאפ ונשמר לצמיתות בארכיון!',
        idMessage,
      });

      if (statusType === 'text') {
        setTextMessage('');
      } else {
        setMediaUrl('');
        setMediaCaption('');
      }
    } catch (err: any) {
      setPublishResult({
        success: false,
        msg: `שגיאה בפרסום הסטטוס: ${err.message || 'שגיאת רשת'}`,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteStatus = async (statusId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('האם למחוק סטטוס זה מהארכיון השמור?')) return;
    await deleteStatusFromArchive(db, collectionName, statusId);
    setStatuses((prev) => prev.filter((s) => s.id !== statusId));
  };

  return (
    <div className="space-y-6 text-xs" dir="rtl">
      
      {/* Top Header & Analytics KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* KPI 1: Active Stories */}
        <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-sm flex items-center gap-2.5 sm:gap-3.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block">פעילים (24h)</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-black text-emerald-400">{activeStories.length}</span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">באוויר</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Views */}
        <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-sm flex items-center gap-2.5 sm:gap-3.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block">סך צפיות</span>
            <span className="text-lg sm:text-xl font-black text-indigo-400">{totalViews}</span>
          </div>
        </div>

        {/* KPI 3: Permanently Archived */}
        <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-sm flex items-center gap-2.5 sm:gap-3.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block">בארכיון קבוע</span>
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-black text-purple-400">{statuses.length}</span>
              <span className="text-[9px] text-slate-400 font-mono hidden xs:inline">Firestore</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Refresh Action */}
        <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-sm flex items-center justify-between gap-2 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block">מעקב צפיות</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500">בזמן אמת</span>
          </div>
          <button
            onClick={handleRefreshAllStatistics}
            disabled={isRefreshingStats}
            className="p-2 sm:p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl sm:rounded-2xl shadow transition cursor-pointer disabled:opacity-50"
            title="רענן נתוני צפיות מ-WhatsApp"
            aria-label="רענן נתוני צפיות מ-WhatsApp"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshingStats ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Create New Status vs Archive & Analytics */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('create')}
            className={`px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl font-black text-xs flex items-center gap-1.5 sm:gap-2 transition cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                : isDark ? 'text-slate-400 hover:text-white bg-slate-900' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
            title="פרסום ויצירת סטטוס חדש"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
            <span className="hidden sm:inline">פרסום ויצירת סטטוס חדש</span>
            <span className="sm:hidden">יצירת סטטוס</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('archive')}
            className={`px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl font-black text-xs flex items-center gap-1.5 sm:gap-2 transition cursor-pointer ${
              activeSubTab === 'archive'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
                : isDark ? 'text-slate-400 hover:text-white bg-slate-900' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
            title="ארכיון קבוע ומעקב צפיות מלא"
          >
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-300" />
            <span className="hidden sm:inline">ארכיון קבוע ומעקב צפיות</span>
            <span className="sm:hidden">ארכיון</span>
            <span className="font-mono text-[10px] opacity-80">({statuses.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CREATE NEW WHATSAPP STATUS */}
      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: Creator Settings (7 Cols) */}
          <div className={`lg:col-span-7 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Status Type Selector */}
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                <h3 className="font-black text-xs sm:text-sm">סטודיו סטטוסים</h3>
              </div>

              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusType('text')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    statusType === 'text'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="סטטוס טקסט עם צבע וגופן"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">טקסט</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusType('media')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    statusType === 'media'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="סטטוס מדיה (תמונה / וידאו)"
                >
                  <Image className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">מדיה</span>
                </button>
              </div>
            </div>

            {/* AI Generator & Enhancer Hub */}
            <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border space-y-3 ${
              isDark ? 'bg-gradient-to-b from-indigo-950/40 to-purple-950/20 border-indigo-800/40' : 'bg-gradient-to-b from-indigo-50 to-purple-50 border-indigo-200'
            }`}>
              
              {/* AI Top Bar & Tone Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-indigo-400 block">עוזר AI לכתיבת סטטוסים</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 hidden xs:block">מחולל תוכן חסידי, שיווקי וקהילתי</span>
                  </div>
                </div>

                {/* Tone Selector with Lucide icons */}
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
                  {(Object.keys(STATUS_TONE_LABELS) as StatusTone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTone(t)}
                      className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                        selectedTone === t
                          ? 'bg-indigo-600 text-white shadow'
                          : isDark ? 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300'
                      }`}
                      title={STATUS_TONE_LABELS[t].desc}
                      aria-label={STATUS_TONE_LABELS[t].label}
                    >
                      {getToneIcon(t)}
                      <span className="hidden md:inline">{STATUS_TONE_LABELS[t].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Quick Preset Topics with Lucide icons */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 mb-1.5 block">תבניות מהירות מוכנות:</span>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAiPromptTopic(preset.defaultTopic);
                        setSelectedTone(preset.tone);
                        handleGenerateAiStatus(preset.defaultTopic);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                        isDark ? 'bg-slate-900 hover:bg-indigo-900/60 border border-slate-800 text-slate-300 hover:text-white' : 'bg-white hover:bg-indigo-50 border border-slate-300 text-slate-700 hover:text-indigo-900 shadow-xs'
                      }`}
                      title={preset.defaultTopic}
                    >
                      {getPresetIcon(preset.id)}
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Prompt Input Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPromptTopic}
                  onChange={(e) => setAiPromptTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerateAiStatus();
                    }
                  }}
                  placeholder="כתוב נושא מותאם אישית (למשל: דבר תורה חסידי, מבצע, עדכון קהילה)..."
                  className={`flex-1 p-2 sm:p-2.5 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                
                <button
                  type="button"
                  onClick={() => handleGenerateAiStatus()}
                  disabled={isGeneratingAi}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50 shrink-0"
                  title="צור 3 גרסאות שונות לסטטוס בעזרת בינה מלאכותית"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">{isGeneratingAi ? 'מייצר...' : 'צור ב-AI'}</span>
                  <span className="xs:hidden">AI</span>
                </button>
              </div>

              {/* AI Feedback toast */}
              {aiFeedbackMessage && (
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold animate-fade-in flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{aiFeedbackMessage}</span>
                </div>
              )}

              {/* 3 Variations Selector Cards */}
              {generatedVariations.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-indigo-800/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-300">בחר אחת מ-3 הגרסאות שהופקו:</span>
                    <span className="text-[10px] text-slate-400">לחץ להחלה מידית</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {generatedVariations.map((v) => {
                      const isCurrentlyActive = (statusType === 'text' ? textMessage : mediaCaption).trim() === v.text.trim();
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleApplyVariation(v)}
                          className={`p-2.5 rounded-2xl border text-right cursor-pointer transition flex flex-col justify-between space-y-1.5 ${
                            isCurrentlyActive
                              ? 'bg-indigo-600/30 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                              : isDark ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-indigo-400">{v.title}</span>
                            {isCurrentlyActive && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <p className="text-[10px] text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                            {v.text}
                          </p>
                          <span className="text-[9px] text-slate-500 block pt-1 border-t border-slate-800/40">
                            {v.text.length} תווים
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Form Fields: Text Status */}
            {statusType === 'text' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-slate-300">תוכן הסטטוס (עד 500 תווים)</label>
                      
                      {/* "שפר עם AI" Button */}
                      <button
                        type="button"
                        onClick={handleEnhanceWithAi}
                        disabled={isEnhancingAi || !textMessage.trim()}
                        className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow cursor-pointer disabled:opacity-50 transition"
                        title="שפר, ערוך והתאם את הטקסט לסטטוס וואטסאפ בעזרת AI"
                      >
                        <Wand2 className={`w-3 h-3 ${isEnhancingAi ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isEnhancingAi ? 'משפר...' : 'שפר עם AI'}</span>
                        <span className="sm:hidden">{isEnhancingAi ? '...' : 'שפר'}</span>
                      </button>
                    </div>

                    <span className={`text-[10px] font-mono ${textMessage.length > 450 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {textMessage.length} / 500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    placeholder="הקלד כאן את תוכן הסטטוס לוואטסאפ או השתמש במחולל ה-AI מעלה..."
                    className={`w-full p-3 rounded-2xl border text-sm font-medium ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Color Palette Selector */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">צבע רקע לסטטוס</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBackgroundColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                          backgroundColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                      title="בחר צבע מותאם אישית"
                    />
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">גופן (Font Style)</label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value as GreenApiStatusFont)}
                    className={`w-full p-2.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {PRESET_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Form Fields: Media Status */}
            {statusType === 'media' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300">קובץ מדיה (תמונה / וידאו)</label>
                    
                    {/* Media Picker & AI Generator Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="px-2.5 sm:px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
                        title="בחר מתוך גלריית המדיה השמורה"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-black" />
                        <span className="hidden sm:inline">גלריה</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAiImageStudioOpen(true)}
                        className="px-2.5 sm:px-3 py-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
                        title="יצירת תמונה מותאמת לסטטוס ב-AI (פונקציה למנויים משודרגים)"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span className="hidden sm:inline">תמונת AI (PRO)</span>
                        <span className="sm:hidden">AI PRO</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg או בחר מגלריית המדיה מעלה..."
                    className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">שם הקובץ</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="status.jpg"
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300">כיתוב למדיה (Caption)</label>
                      <button
                        type="button"
                        onClick={handleEnhanceWithAi}
                        disabled={isEnhancingAi || !mediaCaption.trim()}
                        className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="שפר ונסח כיתוב מושלם ב-AI"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span className="hidden xs:inline">שפר כיתוב</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      placeholder="כיתוב שיופיע תחת המדיה..."
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Target Audience & CRM Groups Integration */}
            <div className="border-t border-slate-800/40 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>קהל יעד לצפייה (CRM)</span>
                </label>
                
                {derivedParticipants && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                    {derivedParticipants.length} נמענים
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  targetAudience === 'all'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'all'}
                    onChange={() => setTargetAudience('all')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">כל אנשי הקשר</span>
                  <span className="sm:hidden">כולם</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  targetAudience === 'crm_group'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'crm_group'}
                    onChange={() => setTargetAudience('crm_group')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">קבוצת CRM</span>
                  <span className="sm:hidden">קבוצה</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  targetAudience === 'crm_tag'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'crm_tag'}
                    onChange={() => setTargetAudience('crm_tag')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="hidden sm:inline">תגית CRM</span>
                  <span className="sm:hidden">תגית</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  targetAudience === 'custom'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'custom'}
                    onChange={() => setTargetAudience('custom')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">בחירה ידנית</span>
                  <span className="sm:hidden">ידני</span>
                </label>
              </div>

              {/* Sub-view: CRM Group selector */}
              {targetAudience === 'crm_group' && (
                <div className={`p-3 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className="block text-[11px] font-semibold text-slate-300">בחר קבוצת CRM:</label>
                  {crmGroups.length === 0 ? (
                    <p className="text-slate-500 text-xs">טרם הוגדרו קבוצות במערכת ה-CRM.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {crmGroups.map((g) => {
                        const count = crmContacts.filter((c) => (c.group || '').toLowerCase().trim() === g.name.toLowerCase().trim()).length;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setSelectedCrmGroup(g.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              selectedCrmGroup === g.name
                                ? 'bg-indigo-600 text-white shadow'
                                : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                            }`}
                          >
                            <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>{g.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-view: CRM Tag selector */}
              {targetAudience === 'crm_tag' && (
                <div className={`p-3 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className="block text-[11px] font-semibold text-slate-300">בחר תגית CRM לסינון:</label>
                  {availableTags.length === 0 ? (
                    <p className="text-slate-500 text-xs">טרם נוצרו תגיות לאנשי קשר ב-CRM.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const count = crmContacts.filter((c) => c.tags.includes(tag)).length;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedCrmTag(tag)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              selectedCrmTag === tag
                                ? 'bg-purple-600 text-white shadow'
                                : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                            }`}
                          >
                            <Tag className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>{tag}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-view: Custom manual input and fast CRM contact picker */}
              {targetAudience === 'custom' && (
                <div className={`p-3 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">הזן מספרי טלפון ישירות (מופרדים בפסיק או שורה חדשה):</label>
                    <textarea
                      rows={2}
                      value={customParticipantsInput}
                      onChange={(e) => setCustomParticipantsInput(e.target.value)}
                      placeholder="972501234567, 972521234567..."
                      className={`w-full p-2 rounded-xl border text-xs font-mono ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  {/* Fast pick from CRM Contacts */}
                  {crmContacts.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">או בחר מתוך אנשי הקשר ב-CRM:</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedContactIds(new Set(crmContacts.map((c) => c.id)))}
                            className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                          >
                            בחר הכל ({crmContacts.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedContactIds(new Set())}
                            className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                          >
                            נקה
                          </button>
                        </div>
                      </div>

                      <div className="max-h-36 overflow-y-auto divide-y divide-slate-800/30 custom-scrollbar border rounded-xl p-1 bg-slate-900/50">
                        {crmContacts.map((c) => {
                          const isChecked = selectedContactIds.has(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                const next = new Set(selectedContactIds);
                                if (isChecked) next.delete(c.id);
                                else next.add(c.id);
                                setSelectedContactIds(next);
                              }}
                              className="p-1.5 flex items-center justify-between hover:bg-slate-800/50 rounded-lg cursor-pointer text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
                                <span className="font-bold">{c.name}</span>
                                {c.group && <span className="text-[10px] text-slate-400">({c.group})</span>}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400" dir="ltr">0{c.phone}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Publish Feedback */}
            {publishResult && (
              <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 ${
                publishResult.success
                  ? isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                {publishResult.success ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                <div className="text-xs">
                  <p className="font-bold">{publishResult.msg}</p>
                  {publishResult.idMessage && (
                    <span className="text-[10px] font-mono opacity-80">מזהה הודעה: {publishResult.idMessage}</span>
                  )}
                </div>
              </div>
            )}

            {/* Publish Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePublishStatus}
                disabled={isPublishing}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="hidden xs:inline">{isPublishing ? 'מפרסם סטטוס לוואטסאפ...' : 'פרסם סטטוס לוואטסאפ כעת'}</span>
                <span className="xs:hidden">{isPublishing ? 'מפרסם...' : 'פרסם כעת'}</span>
              </button>
            </div>

          </div>

          {/* Right Live Smartphone Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>תצוגה מקדימה של הסטטוס (WhatsApp Story)</span>
            </span>

            {/* Smartphone Mockup Frame */}
            <div className="w-72 max-w-full h-[460px] sm:h-[480px] rounded-[36px] sm:rounded-[40px] border-4 border-slate-700 bg-slate-950 shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden">
              
              {/* Phone Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-3.5 sm:h-4 bg-slate-800 rounded-full z-20" />

              {/* Story Content Viewport */}
              <div
                className="w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden flex flex-col justify-between p-4 relative text-white"
                style={{
                  backgroundColor: statusType === 'text' ? backgroundColor : '#000000',
                  backgroundImage: statusType === 'media' && mediaUrl ? `url(${mediaUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Story Top Bar Progress Indicators */}
                <div className="w-full flex gap-1 z-10 pt-4">
                  <div className="h-1 bg-white rounded-full flex-1 animate-pulse" />
                </div>

                {/* Story Account Header */}
                <div className="flex items-center gap-2 z-10 pt-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs border border-white/40 shadow shrink-0">
                    WA
                  </div>
                  <div>
                    <span className="block font-bold text-xs leading-none drop-shadow">{connectedAccountName}</span>
                    <span className="text-[9px] text-white/80 drop-shadow">כרגע</span>
                  </div>
                </div>

                {/* Center Content: Text Message or Media Preview */}
                <div className="my-auto text-center px-2 z-10">
                  {statusType === 'text' ? (
                    <p
                      className="text-sm sm:text-base font-bold whitespace-pre-wrap leading-relaxed drop-shadow-md"
                      style={{
                        fontFamily: PRESET_FONTS.find((f) => f.id === font)?.family || 'sans-serif',
                      }}
                    >
                      {textMessage || 'הקלד טקסט או בחר תבנית AI להצגת תצוגה מקדימה'}
                    </p>
                  ) : (
                    !mediaUrl && (
                      <div className="flex flex-col items-center justify-center text-white/60 space-y-2">
                        <Image className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
                        <span className="text-xs">הזן קישור תמונה או וידאו</span>
                      </div>
                    )
                  )}
                </div>

                {/* Bottom Caption for Media Status */}
                {statusType === 'media' && mediaCaption && (
                  <div className="bg-black/60 backdrop-blur-sm p-2 rounded-xl text-center text-xs z-10 text-white">
                    <p className="line-clamp-2">{mediaCaption}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hint below phone */}
            <span className="text-[10px] text-slate-500 mt-2 text-center">
              כך ייראה הסטטוס על מסך הטלפון של אנשי הקשר שלך
            </span>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: PERMANENT ARCHIVE & FULL VIEWER TRACKING */}
      {activeSubTab === 'archive' && (
        <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-4 shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Header & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/40 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm">ארכיון סטטוסים ומעקב צפיות מלא</h3>
                <span className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block">
                  כל הסטטוסים, התמונות והצפיות נשמרים לצמיתות ב-Firestore גם לאחר 24 שעות
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="חפש בארכיון..."
                  className={`w-full sm:w-36 md:w-48 pr-8 pl-3 py-1.5 rounded-xl text-xs border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="כל הסטטוסים בארכיון"
                >
                  <Layers className="w-3 h-3" />
                  <span className="hidden sm:inline">הכל</span>
                  <span className="font-mono text-[10px]">({statuses.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('active')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    filterType === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="סטטוסים פעילים כרגע בוואטסאפ"
                >
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">פעילים</span>
                  <span className="font-mono text-[10px]">({activeStories.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('expired')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    filterType === 'expired' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="סטטוסים שהסתיימו בארכיון"
                >
                  <Database className="w-3 h-3 text-purple-400" />
                  <span className="hidden sm:inline">ארכיון</span>
                  <span className="font-mono text-[10px]">({expiredStories.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleRefreshAllStatistics}
                disabled={isRefreshingStats}
                className="px-2.5 sm:px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="סנכרן נתוני צפיות מעודכנים מוואטסאפ"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">סנכרן צפיות</span>
              </button>
            </div>
          </div>

          {/* Status List Grid */}
          {filteredStatuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
              <Smartphone className="w-10 h-10 opacity-30 text-emerald-400" />
              <p className="font-bold">לא נמצאו סטטוסים בארכיון</p>
              <p className="text-[11px] opacity-75">סטטוסים שתפרסם יישמרו כאן אוטומטית לצמיתות עם נתוני הצפיות שלהם</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredStatuses.map((st) => {
                const isActive = st.expiresAt > now;
                const remainingMs = Math.max(0, st.expiresAt - now);
                const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));

                return (
                  <div
                    key={st.id}
                    onClick={() => setViewingStory(st)}
                    className={`p-4 rounded-2xl border shadow-sm transition hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isDark ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Type & Lifetime status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'}`} />
                        <span>{isActive ? `פעיל בוואטסאפ (${remainingHours}h)` : 'בארכיון קבוע'}</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(st.createdAt).toLocaleDateString('he-IL', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div
                      className="h-28 rounded-xl flex items-center justify-center p-3 text-center text-white font-bold text-xs relative overflow-hidden shadow-inner"
                      style={{
                        backgroundColor: st.backgroundColor || '#128C7E',
                        backgroundImage: st.urlFile ? `url(${st.urlFile})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {st.type === 'text' ? (
                        <p className="line-clamp-3 whitespace-pre-wrap leading-tight drop-shadow">
                          {st.message}
                        </p>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white/80 group-hover:scale-125 transition-transform" />
                        </div>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-2 text-xs">
                      {/* Viewers Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewersModalStatus(st);
                        }}
                        className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                        title="צפה ברשימת האנשים שצפו בסטטוס"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{st.viewersCount || 0} צפיות</span>
                        <span className="text-[10px] text-slate-500">({st.deliveredCount || 0} נמסרו)</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteStatus(st.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="מחק מהארכיון"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* FULL-SCREEN WHATSAPP STORY VIEWER MODAL */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="w-full max-w-sm h-[90vh] sm:h-[600px] rounded-3xl sm:rounded-[36px] overflow-hidden flex flex-col justify-between p-4 sm:p-5 relative text-white shadow-2xl border border-slate-700"
            style={{
              backgroundColor: viewingStory.backgroundColor || '#075E54',
              backgroundImage: viewingStory.urlFile ? `url(${viewingStory.urlFile})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top Bar */}
            <div className="w-full space-y-2 z-10">
              <div className="h-1 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs border border-white shrink-0">
                    WA
                  </div>
                  <div>
                    <span className="block font-bold text-xs sm:text-sm leading-none drop-shadow">{connectedAccountName}</span>
                    <span className="text-[10px] text-white/80 drop-shadow">
                      {new Date(viewingStory.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingStory(null)}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Story Content */}
            <div className="my-auto text-center px-4 z-10">
              {viewingStory.type === 'text' && (
                <p
                  className="text-lg sm:text-xl font-bold whitespace-pre-wrap leading-relaxed drop-shadow-lg"
                  style={{
                    fontFamily: PRESET_FONTS.find((f) => f.id === viewingStory.font)?.family || 'sans-serif',
                  }}
                >
                  {viewingStory.message}
                </p>
              )}
            </div>

            {/* Bottom Bar: Views & Caption */}
            <div className="z-10 space-y-2">
              {viewingStory.caption && (
                <div className="bg-black/60 backdrop-blur-sm p-3 rounded-2xl text-center text-xs">
                  <p>{viewingStory.caption}</p>
                </div>
              )}

              <div
                onClick={() => {
                  setViewersModalStatus(viewingStory);
                }}
                className="bg-black/70 backdrop-blur-sm p-2.5 sm:p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-black/80 transition"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">{viewingStory.viewersCount || 0} צופים</span>
                </div>
                <span className="text-[11px] text-indigo-400 font-semibold underline">פרטי הצופים</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEWERS ACTIVITY DETAILS MODAL */}
      {viewersModalStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 max-h-[85vh] flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm">מעקב צפיות בסטטוס (WhatsApp Activity)</h3>
                  <span className="text-[10px] text-slate-400 font-mono">מזהה: {viewersModalStatus.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewersModalStatus(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewer Counts Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="block text-emerald-400 font-bold text-base sm:text-lg">{viewersModalStatus.viewersCount || 0}</span>
                <span className="text-[10px] font-sans">צפו (Read)</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="block text-indigo-400 font-bold text-base sm:text-lg">{viewersModalStatus.deliveredCount || 0}</span>
                <span className="text-[10px] font-sans">נמסרו (Delivered)</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <span className="block text-slate-300 font-bold text-base sm:text-lg">{viewersModalStatus.sentCount || 0}</span>
                <span className="text-[10px] font-sans">נשלחו (Sent)</span>
              </div>
            </div>

            {/* Viewers List with Lucide Icons */}
            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-800/20 max-h-64">
              {(!viewersModalStatus.statistics || viewersModalStatus.statistics.length === 0) ? (
                <div className="p-6 text-center text-slate-500 text-xs space-y-1">
                  <Eye className="w-8 h-8 mx-auto opacity-40 text-emerald-400 mb-1" />
                  <p className="font-bold">טרם נרשמו צפיות או שהנתונים טרם סונכרנו</p>
                  <p className="text-[11px] opacity-75">לחץ על כפתור הסנכרון כדי למשוך את שמות וזמני הצופים מ-GREEN-API</p>
                </div>
              ) : (
                viewersModalStatus.statistics.map((st, i) => (
                  <div key={i} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                        st.status === 'read' ? 'bg-emerald-600' : 'bg-indigo-600'
                      }`}>
                        {st.status === 'read' ? <CheckCheck className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        {(() => {
                          const crmContact = crmContacts.find(c => normalizePhone(c.phone) === normalizePhone(st.participant) || normalizePhone(c.phone) === normalizePhone(st.participant));
                          const displayName = crmContact?.name ? `${crmContact.name} (${st.participant})` : st.participant;
                          return <span className="font-mono font-bold block text-[11px]" dir="ltr">{displayName}</span>
                        })()}
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {st.status === 'read' ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400 inline" />
                              <span>צפה בסטטוס</span>
                            </>
                          ) : st.status === 'delivered' ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-indigo-400 inline" />
                              <span>נמסר למכשיר</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 text-slate-400 inline" />
                              <span>נשלח</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {st.timestamp
                        ? new Date(st.timestamp * 1000).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : ''}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800/40">
              <button
                type="button"
                onClick={() => setViewersModalStatus(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      
      {activeSubTab === "automations" && (
        <WhatsAppStatusAutomationsTab db={db} isDark={isDark} />
      )}

      {/* MEDIA GALLERY PICKER MODAL (Isolated to current logged in user) */}
      {isMediaPickerOpen && (
        <WhatsAppMediaPicker
          isOpen={true}
          onClose={() => setIsMediaPickerOpen(false)}
          title="בחר מדיה לסטטוס וואטסאפ מתוך הגלריה האישית"
          allowedTypes={['image', 'video']}
          maxSelectCount={1}
          onSelectMedia={handleSelectMediaFromGallery}
          db={db}
        />
      )}

      {/* GEMINI AI IMAGE STUDIO MODAL (PRO Feature) */}
      <WhatsAppImageStudio
        isOpen={isAiImageStudioOpen}
        onClose={() => setIsAiImageStudioOpen(false)}
        title="סטודיו יצירת תמונות AI לסטטוסים ו-Stories"
        subtitle="מחולל תמונות ופרומפטים מתקדם עם Gemini AI (פונקציה בלעדית למנויים משודרגים)"
        useButtonLabel="שבץ תמונה זו לסטטוס"
        defaultAspectRatio="9:16"
        onUseImage={(imageUrl, meta) => {
          setStatusType('media');
          setMediaUrl(imageUrl);
          setFileName(`${(meta.title || 'ai_status_image').replace(/[^\w\u0590-\u05FF]/g, '_')}.png`);
          if (!mediaCaption.trim()) {
            setMediaCaption(meta.title || meta.prompt || '');
          }
        }}
      />

    </div>
  );
};

