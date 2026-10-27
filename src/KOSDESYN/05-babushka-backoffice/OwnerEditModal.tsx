import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors, EntityProduct, BranchInfo } from './types';
import { doc, setDoc } from 'firebase/firestore';
import { comonaDb } from '../../../../src/lib/firebase';
import { extractPaletteFromLogoImage, KOSUN_STYLE_PRESETS, StylePresetDefinition } from '../../../factory/areaCollectionManager';
import { getHumanColorName, getTerminology } from '../../../factory/pageTerminologyDictionary';
import { CloudStoreMediaPicker, CloudStoreMediaAsset } from './CloudStoreMediaPicker';
import { KosunUserAvatar } from './KosunUserAvatar';

export interface OwnerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string | null;
  categoryTitle: string;
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  tenantId: string;
  products: EntityProduct[];
  branches: BranchInfo[];
  onOpenAiAssist?: () => void;
  onLivePreviewChange?: (tempTheme: Partial<TenantThemeColors> | null) => void;
}

export const OwnerEditModal: React.FC<OwnerEditModalProps> = ({
  isOpen,
  onClose,
  targetId,
  categoryTitle,
  tenantProfile,
  tenantTheme,
  tenantId,
  products,
  branches,
  onOpenAiAssist,
  onLivePreviewChange
}) => {
  if (!isOpen || !targetId) return null;

  // 1. שאיבת סגנון העיצוב מהקולקציה (Style Preset Inheritance)
  const isDay = tenantTheme.colorMode === 'day';
  const activePresetKey = tenantTheme.stylePresetId || tenantProfile?.themeColors?.stylePresetId || 'cyber_neon';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleDef.day : styleDef.night;
  const brandColor = tenantTheme.micColor || tenantTheme.primary || modeColors.primaryColor || '#EAB308';
  const cardRadius = styleDef.geometry.cardRadius || '16px';

  // 2. שליפת טולטיפים וטקסטים בשפה עסקית ממילון המונחים של הטננט (Zero Server Jargon)
  const currentArchetype = tenantProfile?.category || tenantProfile?.archetypeId || 'saas';
  const customDictionary = (tenantProfile as any)?.customDictionary;

  const saveTooltip = getTerminology('owner_btn_tooltip_save', currentArchetype, customDictionary);
  const previewTooltip = getTerminology('owner_btn_tooltip_preview', currentArchetype, customDictionary);
  const aiAssistTooltip = getTerminology('owner_btn_tooltip_ai', currentArchetype, customDictionary);
  const revertTooltip = getTerminology('owner_btn_tooltip_revert', currentArchetype, customDictionary);
  const closeTooltip = getTerminology('owner_btn_tooltip_close', currentArchetype, customDictionary);
  const brandingSubtitle = getTerminology('owner_modal_subtitle_branding', currentArchetype, customDictionary);
  const publishingLiveText = getTerminology('owner_modal_publishing_live', currentArchetype, customDictionary);
  const successSavedText = getTerminology('owner_modal_status_saved', currentArchetype, customDictionary);

  // State מקומי לעריכת שדות
  const [tagline, setTagline] = useState(tenantProfile?.tagline || '');
  const [primaryColor, setPrimaryColor] = useState(tenantProfile?.themeColors?.primary || brandColor);
  const [pageBgColor, setPageBgColor] = useState(tenantProfile?.themeColors?.pageBg || modeColors.pageBg);
  const [titleColor, setTitleColor] = useState(tenantProfile?.themeColors?.titleColor || modeColors.textColor);
  const [textColor, setTextColor] = useState(tenantProfile?.themeColors?.textColor || modeColors.secondaryText);
  const [logoPreview, setLogoPreview] = useState<string | null>(tenantProfile?.logoUrl || null);
  const [extractedColors, setExtractedColors] = useState<Array<{ hex: string; name: string }>>([]);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [openingHours, setOpeningHours] = useState(tenantProfile?.openingHours || '');
  const [phone, setPhone] = useState(tenantProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(tenantProfile?.whatsapp || '');
  const [dailyNotice, setDailyNotice] = useState((tenantProfile as any)?.dailyNotice || '');
  const [mediaUrl, setMediaUrl] = useState(tenantProfile?.welcomeExperience?.mediaUrl || '');
  const [isCloudStorePickerOpen, setIsCloudStorePickerOpen] = useState(false);
  const [paletteTab, setPaletteTab] = useState<'palettes' | 'logo'>('palettes');

  const [selectedPresetId, setSelectedPresetId] = useState<string>(activePresetKey);

  // מאמר מקצועי ותוכן
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('מדריכים ומקצועיות');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleBody, setArticleBody] = useState('');

  // אירוע או סדנה קרובה
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventSeats, setEventSeats] = useState('25');
  const [eventCtaText, setEventCtaText] = useState('שריין מקום עכשיו');

  // סניפים
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchWaze, setNewBranchWaze] = useState('');

  // מחירון מהיר
  const [quickPrices, setQuickPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => { map[p.id] = p.price; });
    return map;
  });

  // 5 פלטות מותג חכמות - צבעים בלבד ללא שינוי פריסה!
  const BRAND_COLOR_PALETTES = [
    {
      id: 'cyber_neon',
      name: '1. ציאן ניאון עתידני (Cyber Neon)',
      desc: 'ציאן חשמלי מודרני (#00F0FF) עם נייבי סייבר',
      primary: '#00F0FF',
      pageBg: isDay ? '#F0F9FF' : '#040711',
      textColor: isDay ? '#0F172A' : '#FFFFFF',
      accent: '#38BDF8'
    },
    {
      id: 'luxury_gold',
      name: '2. זהב וענבר יוקרתי (Luxury Gold)',
      desc: 'זהב עמוק (#EAB308) וענבר אלגנטי שקט',
      primary: '#EAB308',
      pageBg: isDay ? '#FEFCE8' : '#0C0A09',
      textColor: isDay ? '#292524' : '#FAFAF9',
      accent: '#F59E0B'
    },
    {
      id: 'executive_slate',
      name: '3. כחול נייבי מנהלתי (Executive Slate)',
      desc: 'כחול שמיים (#38BDF8) ופלדת סלייט יציבה',
      primary: '#38BDF8',
      pageBg: isDay ? '#F1F5F9' : '#0B1120',
      textColor: isDay ? '#0F172A' : '#F8FAFC',
      accent: '#0284C7'
    },
    {
      id: 'emerald_calm',
      name: '4. אמרלד ושלווה טבעית (Emerald Calm)',
      desc: 'ירוק אמרלד (#10B981) טבעי, רגוע ונושם',
      primary: '#10B981',
      pageBg: isDay ? '#ECFDF5' : '#022C22',
      textColor: isDay ? '#064E3B' : '#ECFDF5',
      accent: '#059669'
    },
    {
      id: 'rose_kinetic',
      name: '5. ורוד פנינה וזוהר (Rose Kinetic)',
      desc: 'ורוד מג\'נטה (#F43F5E) עם עומק ולווט קינטי',
      primary: '#F43F5E',
      pageBg: isDay ? '#FDF2F8' : '#120714',
      textColor: isDay ? '#4A044E' : '#FDF2F8',
      accent: '#EC4899'
    }
  ];

  // פונקציית ביטול / חזרה ואיפוס שינויים
  const handleCancelAndRevert = () => {
    if (onLivePreviewChange) {
      onLivePreviewChange(null);
    }
    setIsPreviewing(false);
    onClose();
  };

  // החלת תצוגה מקדימה חיה (צבעים בלבד - שמירה על הפריסה הקיימת ללא התנגשויות!)
  const applyLiveColorPreview = (newPrimary: string, newBg: string, newTitle: string, newText: string, presetId?: string) => {
    setPrimaryColor(newPrimary);
    setPageBgColor(newBg);
    setTitleColor(newTitle);
    setTextColor(newText);
    if (presetId) setSelectedPresetId(presetId);
    if (onLivePreviewChange) {
      onLivePreviewChange({
        primary: newPrimary,
        micColor: newPrimary,
        pageBg: newBg,
        titleColor: newTitle,
        textColor: newText,
        accent: newPrimary,
        capsuleBorder: newPrimary,
        stylePresetId: presetId || selectedPresetId
      });
    }
  };

  // טופס מוצר חדש
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdSubtitle, setNewProdSubtitle] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');

  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // שמירה לשרת (comonaDb)
  const saveToFirestore = async (updates: Record<string, any>, successMsg: string) => {
    try {
      setIsSaving(true);
      await setDoc(doc(comonaDb, 'tenants', tenantId), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
      setNotification(`✓ ${successMsg}`);
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setNotification(`שגיאה בשמירה: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewProduct = async () => {
    if (!newProdTitle || !newProdPrice) {
      alert('נא להזין שם פריט ומחיר');
      return;
    }
    try {
      setIsSaving(true);
      const prodId = `prod_${Date.now()}`;
      const newProd: EntityProduct = {
        id: prodId,
        title: newProdTitle,
        subtitle: newProdSubtitle || 'שירות איכותי מותאם אישית',
        price: Number(newProdPrice) || 0,
        imageUrl: tenantProfile?.logoUrl || '/cloudstore/realestate_hero.webp',
        badgeText: 'חדש במלאי',
        isAvailable: true,
        status: 'active',
        specsGrid: [
          { id: '1', label: 'זמינות', value: 'מיידי', icon: 'Clock' },
          { id: '2', label: 'אחריות', value: 'מלאה', icon: 'ShieldCheck' }
        ]
      };

      await setDoc(doc(comonaDb, 'tenants', tenantId, 'products', prodId), newProd, { merge: true });
      setNotification(`✓ הפריט "${newProdTitle}" נוסף בהצלחה לקולקציה החיה!`);
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1200);
    } catch (e: any) {
      setNotification(`שגיאה: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAction = () => {
    if (targetId === 'brand_palette') {
      const updates: any = {
        themeColors: {
          ...tenantProfile?.themeColors,
          primary: primaryColor,
          micColor: primaryColor,
          accent: extractedColors[2]?.hex || primaryColor,
          secondary: extractedColors[1]?.hex || '#0072FF',
          pageBg: pageBgColor,
          titleColor: titleColor,
          textColor: textColor,
          stylePresetId: selectedPresetId
        }
      };
      if (logoPreview) {
        updates.logoUrl = logoPreview;
      }
      saveToFirestore(updates, successSavedText);
    } else if (targetId === 'brand_tagline') {
      saveToFirestore({ tagline }, successSavedText);
    } else if (targetId === 'brand_media') {
      saveToFirestore({ welcomeExperience: { ...tenantProfile?.welcomeExperience, mediaUrl, fallbackImageUrl: mediaUrl } }, successSavedText);
    } else if (targetId === 'prod_fast_add') {
      handleAddNewProduct();
    } else if (targetId === 'info_hours') {
      saveToFirestore({ openingHours }, successSavedText);
    } else if (targetId === 'info_contact') {
      saveToFirestore({ phone, whatsapp }, successSavedText);
    } else if (targetId === 'post_daily_news') {
      saveToFirestore({ dailyNotice }, successSavedText);
    } else if (targetId === 'post_article') {
      const artId = `art_${Date.now()}`;
      saveToFirestore({
        latestArticle: {
          id: artId,
          title: articleTitle || 'מאמר מקצועי ומדריך מעשי',
          category: articleCategory,
          summary: articleSummary,
          body: articleBody,
          updatedAt: new Date().toISOString()
        }
      }, 'המאמר המקצועי פורסם בהצלחה באתר חי!');
    } else if (targetId === 'post_event') {
      const evId = `ev_${Date.now()}`;
      saveToFirestore({
        upcomingEvent: {
          id: evId,
          title: eventTitle || 'סדנה / אירוע מיוחד',
          date: eventDate,
          location: eventLocation,
          seats: eventSeats,
          ctaText: eventCtaText,
          updatedAt: new Date().toISOString()
        }
      }, 'פרטי האירוע עודכנו ופורסמו בהצלחה!');
    } else if (targetId === 'info_branches') {
      const bId = `branch_${Date.now()}`;
      const updatedBranches = [
        ...branches,
        ...(newBranchName ? [{ id: bId, name: newBranchName, address: newBranchAddress, wazeUrl: newBranchWaze }] : [])
      ];
      saveToFirestore({ branches: updatedBranches }, 'פרטי הסניפים עודכנו בהצלחה!');
    } else if (targetId === 'prod_pricing') {
      saveToFirestore({ pricingLastUpdated: new Date().toISOString() }, 'מחירון הקטלוג עודכן בהצלחה!');
    } else {
      onClose();
    }
  };

  const modalContent = (
    <>
      {/* כפתור ציפה מהיר לחזרה מתוך תצוגה מקדימה כשהמודאל ממוזער */}
      {isPreviewing && (
        <div className="fixed top-3 left-3 z-[10000] flex items-center gap-2 animate-bounce">
          <button
            type="button"
            onClick={() => setIsPreviewing(false)}
            title="פתח חלון עריכה"
            className="w-10 h-10 rounded-xl bg-slate-900/95 text-amber-300 border border-amber-400/50 shadow-2xl flex items-center justify-center hover:bg-slate-800"
          >
            <Icons.SlidersHorizontal size={17} />
          </button>
          <button
            type="button"
            onClick={handleCancelAndRevert}
            title="בטל ושחזר שינויים"
            className="w-10 h-10 rounded-xl bg-rose-950/95 text-rose-300 border border-rose-500/50 shadow-2xl flex items-center justify-center hover:bg-rose-900"
          >
            <Icons.RotateCcw size={17} />
          </button>
        </div>
      )}

      {/* 🧭 מעטפת Backdrop מבודדת לחלוטין מכל אלמנט אחר בעמוד */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl transition-all duration-300 ${
          isPreviewing ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
        dir="rtl"
      >
        {/* 📱 מסגרת 9:16 מדויקת וממורכזת - Zero Scroll Viewport Contract */}
        <div
          className="w-full max-w-[430px] h-[92vh] max-h-[880px] my-auto flex flex-col justify-between rounded-3xl border p-3.5 shadow-2xl relative overflow-hidden select-none transition-all duration-300 font-sans"
          style={{
            backgroundColor: isDay ? 'rgba(240, 249, 255, 0.98)' : 'rgba(4, 7, 17, 0.98)',
            color: modeColors.textColor,
            borderColor: modeColors.borderColor,
            fontFamily: "'Heebo', sans-serif"
          }}
        >
          {/* הילת רקע זוהרת מותאמת לסגנון */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full blur-[90px] pointer-events-none opacity-25"
            style={{ backgroundColor: brandColor }}
          />

        {/* 🧭 Header עליון של החלון */}
        <div
          className="flex items-center justify-between pb-2.5 border-b shrink-0 z-20"
          style={{ borderColor: modeColors.borderColor }}
        >
          <div className="flex items-center gap-2">
            <KosunUserAvatar color={brandColor} glowColor={modeColors.glowColor} size={24} />
            <div>
              <h2 className="text-sm font-black leading-tight" style={{ color: modeColors.textColor }}>
                {categoryTitle}
              </h2>
              <span className="text-[10px]" style={{ color: modeColors.secondaryText }}>
                {brandingSubtitle}
              </span>
            </div>
          </div>

          <button
            onClick={handleCancelAndRevert}
            className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-sm"
            style={{
              borderColor: modeColors.borderColor,
              backgroundColor: isDay ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
              color: modeColors.textColor
            }}
            title={closeTooltip}
          >
            <Icons.X size={15} />
          </button>
        </div>

        {/* הודעת סטטוס שמירה */}
        {notification && (
          <div className="my-1.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fadeIn shrink-0 z-20">
            {notification}
          </div>
        )}

        {/* 🎛️ גוף התוכן של החלון - משתנה לפי הכרטיס שנבחר */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 scrollbar-thin z-20">
          
          {/* 1. עריכת צבעי מיתוג והעלאת לוגו לחילוץ צבעים - ללא שינוי פריסה וללא התנגשויות */}
          {targetId === 'brand_palette' && (
            <div className="h-full flex flex-col justify-between overflow-hidden">
              
              {/* סרגל בחירה עילי בין כרטיסיית לוגו לפלטות מותג */}
              <div
                className="flex items-center gap-1.5 p-1 border shrink-0 mb-2"
                style={{
                  borderRadius: cardRadius,
                  borderColor: modeColors.borderColor,
                  backgroundColor: isDay ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setPaletteTab('palettes')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paletteTab === 'palettes'
                      ? 'shadow-md font-black'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: paletteTab === 'palettes' ? brandColor : 'transparent',
                    color: paletteTab === 'palettes' ? '#000000' : modeColors.textColor
                  }}
                >
                  <Icons.Palette size={13} />
                  <span>5 פלטות צבעי מותג</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaletteTab('logo')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paletteTab === 'logo'
                      ? 'shadow-md font-black'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: paletteTab === 'logo' ? brandColor : 'transparent',
                    color: paletteTab === 'logo' ? '#000000' : modeColors.textColor
                  }}
                >
                  <Icons.Upload size={13} />
                  <span>העלאת לוגו וחילוץ צבעים</span>
                </button>
              </div>

              {/* תוכן כרטיסייה A: 5 פלטות מותג חכמות (צבעים בלבד - שמירה על הפריסה הקיימת ללא התנגשויות!) */}
              {paletteTab === 'palettes' ? (
                <div className="flex-1 flex flex-col justify-between gap-1.5 overflow-hidden animate-fadeIn">
                  {BRAND_COLOR_PALETTES.map((pal) => {
                    const isSelected = selectedPresetId === pal.id || primaryColor === pal.primary;
                    return (
                      <div
                        key={pal.id}
                        onClick={() => {
                          applyLiveColorPreview(pal.primary, pal.pageBg, pal.primary, pal.textColor, pal.id);
                        }}
                        className={`flex-1 rounded-2xl p-2.5 border cursor-pointer active:scale-95 transition-all flex items-center justify-between shadow-md relative overflow-hidden ${
                          isSelected
                            ? 'ring-2 ring-amber-400/50 shadow-lg'
                            : 'hover:border-white/30'
                        }`}
                        style={{
                          background: pal.pageBg,
                          borderColor: isSelected ? pal.primary : modeColors.borderColor
                        }}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md"
                            style={{ backgroundColor: `${pal.primary}20`, borderColor: pal.primary }}
                          >
                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.primary }} />
                          </div>

                          <div className="overflow-hidden">
                            <span className="text-[11px] font-black block truncate" style={{ color: pal.primary }}>
                              {pal.name}
                            </span>
                            <p className="text-[9px] line-clamp-1" style={{ color: pal.textColor }}>
                              {pal.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: pal.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: pal.pageBg }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: pal.textColor }} />
                        </div>
                      </div>
                    );
                  })}

                  <div
                    className="p-1.5 rounded-xl border text-center shrink-0 mt-1"
                    style={{
                      borderColor: modeColors.borderColor,
                      backgroundColor: isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <span className="text-[9.5px] font-mono" style={{ color: modeColors.secondaryText }}>
                      💡 בחירת פלטת צבעים אינה משנה את הפריסה (אקורדיון/זרקור/בנטו) – אפס התנגשויות!
                    </span>
                  </div>
                </div>
              ) : (
                /* תוכן כרטיסייה B: העלאת לוגו וחילוץ צבעים */
                <div
                  className="flex-1 flex flex-col justify-between p-3 border overflow-hidden animate-fadeIn"
                  style={{
                    borderRadius: cardRadius,
                    borderColor: modeColors.borderColor,
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: modeColors.textColor }}>העלאת לוגו העסק:</span>
                      <span className="text-[9px] font-mono" style={{ color: brandColor }}>Pixel Extraction Engine</span>
                    </div>

                    <p className="text-[10px] leading-tight" style={{ color: modeColors.secondaryText }}>
                      העלה לוגו • המערכת תסרוק את הפיקסלים, תחלץ את צבעי המותג ותחיל אותם על כל הדף!
                    </p>

                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCloudStorePickerOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-black cursor-pointer active:scale-95 transition-all shadow-md"
                        style={{
                          backgroundColor: `${brandColor}18`,
                          borderColor: brandColor,
                          color: brandColor
                        }}
                      >
                        <Icons.FolderOpen size={15} />
                        <span>{isExtractingColors ? 'מחלץ צבעים...' : 'בחר לוגו מ-CLOUDSTORE'}</span>
                      </button>

                      <label
                        className="p-2 rounded-xl border cursor-pointer active:scale-95 transition-all shrink-0"
                        style={{
                          borderColor: modeColors.borderColor,
                          backgroundColor: isDay ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                          color: modeColors.textColor
                        }}
                        title="העלאה מהמחשב"
                      >
                        <Icons.Upload size={15} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setIsExtractingColors(true);
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                              const dataUrl = ev.target?.result as string;
                              setLogoPreview(dataUrl);

                              const extracted = await extractPaletteFromLogoImage(dataUrl);
                              applyLiveColorPreview(extracted.primary, pageBgColor, extracted.primary, textColor);
                              setExtractedColors([
                                { hex: extracted.primary, name: getHumanColorName(extracted.primary) },
                                { hex: extracted.secondary, name: getHumanColorName(extracted.secondary) },
                                { hex: extracted.accent, name: getHumanColorName(extracted.accent) }
                              ]);
                              setIsExtractingColors(false);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      {logoPreview && (
                        <div
                          className="w-10 h-10 rounded-xl border p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner"
                          style={{ borderColor: modeColors.borderColor }}
                        >
                          <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* הצבעים שנדגמו מהלוגו */}
                  <div
                    className="p-2 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: modeColors.borderColor,
                      backgroundColor: isDay ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.3)'
                    }}
                  >
                    <span className="text-[10px] font-bold block" style={{ color: modeColors.textColor }}>
                      {extractedColors.length > 0 ? 'צבעים שנדגמו (לחץ להחלה):' : 'דגימת צבעים מהירה:'}
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {(extractedColors.length > 0 ? extractedColors : [
                        { hex: '#00F0FF', name: 'ציאן ניאון' },
                        { hex: '#EAB308', name: 'זהב יוקרתי' },
                        { hex: '#38BDF8', name: 'כחול נייבי' },
                        { hex: '#10B981', name: 'אמרלד' },
                        { hex: '#F43F5E', name: 'ורוד קינטי' }
                      ]).map((col) => (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => {
                            applyLiveColorPreview(col.hex, pageBgColor, col.hex, textColor);
                          }}
                          className={`flex-1 py-1 px-1.5 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                            primaryColor === col.hex ? 'ring-2 shadow-sm' : ''
                          }`}
                          style={{
                            borderColor: primaryColor === col.hex ? col.hex : modeColors.borderColor,
                            backgroundColor: isDay ? '#FFFFFF' : 'rgba(255,255,255,0.05)'
                          }}
                        >
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col.hex }} />
                          <span className="text-[9px] font-bold truncate" style={{ color: modeColors.textColor }}>
                            {col.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 2. עריכת סלוגן */}
          {targetId === 'brand_tagline' && (
            <div className="space-y-3">
              <label className="text-xs font-bold block" style={{ color: modeColors.textColor }}>
                סלוגן והבטחת המותג הראשית:
              </label>
              <textarea
                rows={3}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="הזן סלוגן ממיר..."
                className="w-full p-3 rounded-2xl border text-xs focus:outline-none"
                style={{
                  backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                  borderColor: modeColors.borderColor,
                  color: modeColors.textColor
                }}
              />
              <p className="text-[10px]" style={{ color: modeColors.secondaryText }}>
                הסלוגן מופיע בראש כל העמודים ובכרטיסיית האודות של המותג.
              </p>
            </div>
          )}

          {/* 3. בחירת והעלאת מדיה מ-CloudStore */}
          {targetId === 'brand_media' && (
            <div className="space-y-3">
              <label className="text-xs font-bold block" style={{ color: modeColors.textColor }}>
                וידאו רקע / תמונת כניסה מותאמת (CloudStore):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="נתיב מדיה מ-KOSCLOUD..."
                  className="flex-1 p-2.5 rounded-xl border text-xs font-mono"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setIsCloudStorePickerOpen(true)}
                  className="px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
                  style={{ backgroundColor: brandColor, color: '#000000' }}
                >
                  <Icons.FolderOpen size={14} />
                  <span>KOSCLOUD</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. הוספת מוצר/שירות מהירה */}
          {targetId === 'prod_fast_add' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>שם המוצר / השירות:</label>
                <input
                  type="text"
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  placeholder="לדוגמה: ייעוץ אסטרטגי פרימיום..."
                  className="w-full p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>תת-כותרת ותיאור קצר:</label>
                <input
                  type="text"
                  value={newProdSubtitle}
                  onChange={(e) => setNewProdSubtitle(e.target.value)}
                  placeholder="לדוגמה: ליווי ממוקד של 4 שבועות..."
                  className="w-full p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>מחיר (₪):</label>
                <input
                  type="number"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="לדוגמה: 490"
                  className="w-full p-2.5 rounded-xl border text-xs font-mono"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>
            </div>
          )}

          {/* 5. שעות פעילות */}
          {targetId === 'info_hours' && (
            <div className="space-y-3">
              <label className="text-xs font-bold block" style={{ color: modeColors.textColor }}>שעות פעילות וקבלת קהל:</label>
              <textarea
                rows={3}
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="א'-ה': 09:00 - 19:00..."
                className="w-full p-3 rounded-2xl border text-xs"
                style={{
                  backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                  borderColor: modeColors.borderColor,
                  color: modeColors.textColor
                }}
              />
            </div>
          )}

          {/* 6. פרטי התקשרות */}
          {targetId === 'info_contact' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>טלפון ראשי:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03-..."
                  className="w-full p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>מספר WhatsApp:</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="050-..."
                  className="w-full p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* 7. עדכון יומי */}
          {targetId === 'post_daily_news' && (
            <div className="space-y-3">
              <label className="text-xs font-bold block" style={{ color: modeColors.textColor }}>הודעת היום ללקוחות (מופיעה בקפסולת ה-AI):</label>
              <textarea
                rows={3}
                value={dailyNotice}
                onChange={(e) => setDailyNotice(e.target.value)}
                placeholder="הזן הודעת יום, מבצע או אירוע..."
                className="w-full p-3 rounded-2xl border text-xs"
                style={{
                  backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                  borderColor: modeColors.borderColor,
                  color: modeColors.textColor
                }}
              />
            </div>
          )}

          {/* 8. כתבת תוכן ומאמר מקצועי */}
          {targetId === 'post_article' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                  כותרת המאמר / המדריך המקצועי:
                </label>
                <input
                  type="text"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="לדוגמה: 5 עקרונות להשגת תוצאות שיא בעסק..."
                  className="w-full p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                    קטגוריה / נושא:
                  </label>
                  <input
                    type="text"
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value)}
                    placeholder="מדריכים ומקצועיות"
                    className="w-full p-2 rounded-xl border text-xs"
                    style={{
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                      borderColor: modeColors.borderColor,
                      color: modeColors.textColor
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                    זמן קריאה משוער:
                  </label>
                  <input
                    type="text"
                    defaultValue="3 דקות קריאה"
                    className="w-full p-2 rounded-xl border text-xs font-mono"
                    style={{
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                      borderColor: modeColors.borderColor,
                      color: modeColors.textColor
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                  תקציר מוביל לקפסולה ולכרטיסיות:
                </label>
                <textarea
                  rows={2}
                  value={articleSummary}
                  onChange={(e) => setArticleSummary(e.target.value)}
                  placeholder="תקציר תמציתי וממיר של המאמר..."
                  className="w-full p-2 rounded-xl border text-xs resize-none"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold block" style={{ color: modeColors.textColor }}>
                    גוף המאמר המלא:
                  </label>
                  {onOpenAiAssist && (
                    <button
                      type="button"
                      onClick={onOpenAiAssist}
                      className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Icons.Sparkles size={11} />
                      <span>נסח עם AI</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={articleBody}
                  onChange={(e) => setArticleBody(e.target.value)}
                  placeholder="כתוב את תוכן המאמר, הטיפים וההמלצות..."
                  className="w-full p-2.5 rounded-xl border text-xs resize-none"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>
            </div>
          )}

          {/* 9. פרסום אירוע או סדנה */}
          {targetId === 'post_event' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                  שם האירוע / הסדנה:
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="לדוגמה: כנס אסטרטגיות צמיחה 2026..."
                  className="w-full p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                    מועד ושעה:
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="יום ג', 15 בנובמבר • 19:30"
                    className="w-full p-2 rounded-xl border text-xs"
                    style={{
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                      borderColor: modeColors.borderColor,
                      color: modeColors.textColor
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                    מקומות זמינים:
                  </label>
                  <input
                    type="number"
                    value={eventSeats}
                    onChange={(e) => setEventSeats(e.target.value)}
                    className="w-full p-2 rounded-xl border text-xs font-mono"
                    style={{
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                      borderColor: modeColors.borderColor,
                      color: modeColors.textColor
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                  מיקום פיזי / קישור שידור:
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="מרכז הכנסים ת״א או שידור חי בזום..."
                  className="w-full p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                  טקסט כפתור הרשמה:
                </label>
                <input
                  type="text"
                  value={eventCtaText}
                  onChange={(e) => setEventCtaText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-bold"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
              </div>
            </div>
          )}

          {/* 10. רשימת פריטים פעילים במלאי */}
          {targetId === 'prod_list' && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="text-[11px] font-bold" style={{ color: modeColors.textColor }}>
                  {products.length} פריטים פעילים כרגע בקטלוג:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  זמינים באתר חי
                </span>
              </div>
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {products.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-2 rounded-xl border flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                      borderColor: modeColors.borderColor
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Icons.Package size={14} style={{ color: brandColor }} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold block truncate" style={{ color: modeColors.textColor }}>
                          {p.title}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: modeColors.secondaryText }}>
                          ₪{p.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                      פעיל ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. עדכון מחירים מהיר */}
          {targetId === 'prod_pricing' && (
            <div className="space-y-2 animate-fadeIn">
              <span className="text-[11px] font-bold block mb-1" style={{ color: modeColors.textColor }}>
                ערוך מחירים ישירות והפעל באתר חי:
              </span>
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-xl border flex items-center justify-between text-xs gap-2"
                    style={{
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                      borderColor: modeColors.borderColor
                    }}
                  >
                    <span className="font-bold truncate flex-1" style={{ color: modeColors.textColor }}>
                      {p.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono" style={{ color: modeColors.secondaryText }}>₪</span>
                      <input
                        type="number"
                        value={quickPrices[p.id] ?? p.price}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setQuickPrices((prev) => ({ ...prev, [p.id]: val }));
                        }}
                        className="w-20 p-1 rounded-lg border text-xs font-mono text-center font-bold"
                        style={{
                          backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                          borderColor: brandColor,
                          color: modeColors.textColor
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. סניפים ודרכי הגעה */}
          {targetId === 'info_branches' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {branches.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="p-2 rounded-xl border flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: isDay ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                      borderColor: modeColors.borderColor
                    }}
                  >
                    <div>
                      <span className="font-bold block" style={{ color: modeColors.textColor }}>{b.name}</span>
                      <span className="text-[10px]" style={{ color: modeColors.secondaryText }}>{b.address}</span>
                    </div>
                    {b.wazeUrl && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">
                        Waze ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold block" style={{ color: brandColor }}>
                  + הוספת סניף חדש:
                </span>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="שם הסניף (למשל: סניף תל אביב)..."
                  className="w-full p-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
                <input
                  type="text"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="כתובת מדויקת..."
                  className="w-full p-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                />
                <input
                  type="text"
                  value={newBranchWaze}
                  onChange={(e) => setNewBranchWaze(e.target.value)}
                  placeholder="קישור Waze..."
                  className="w-full p-2 rounded-xl border text-xs font-mono"
                  style={{
                    backgroundColor: isDay ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: modeColors.borderColor,
                    color: modeColors.textColor
                  }}
                  dir="ltr"
                />
              </div>
            </div>
          )}

        </div>

        {/* 🔻 סרגל לחצני תחתית: כפתורי אייקון עם טולטיפ מותאמים לסגנון הקולקציה */}
        <div
          className="pt-2.5 pb-1 border-t flex items-center justify-between gap-3 shrink-0 z-20"
          style={{ borderColor: modeColors.borderColor }}
        >
          {/* כפתורי פעולה משניים: אייקונים עם טולטיפ */}
          <div className="flex items-center gap-2">
            {/* כפתור ביטול ושחזור */}
            <button
              type="button"
              onClick={handleCancelAndRevert}
              title={revertTooltip}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-sm"
              style={{
                borderColor: modeColors.borderColor,
                backgroundColor: isDay ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                color: modeColors.textColor
              }}
            >
              <Icons.RotateCcw size={16} />
            </button>

            {/* כפתור תצוגה מקדימה חיה */}
            {targetId === 'brand_palette' && (
              <button
                type="button"
                onClick={() => setIsPreviewing(!isPreviewing)}
                title={previewTooltip}
                className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-sm"
                style={{
                  borderColor: brandColor,
                  backgroundColor: `${brandColor}18`,
                  color: brandColor
                }}
              >
                <Icons.Eye size={16} />
              </button>
            )}

            {/* כפתור סוכן AI */}
            {onOpenAiAssist && (
              <button
                type="button"
                onClick={onOpenAiAssist}
                title={aiAssistTooltip}
                className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-sm"
                style={{
                  borderColor: modeColors.borderColor,
                  backgroundColor: isDay ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                  color: brandColor
                }}
              >
                <Icons.Sparkles size={16} />
              </button>
            )}
          </div>

          {/* כפתור שמירה ופרסום באתר חי: אייקון בולט ומואר עם טולטיפ */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono opacity-70 hidden sm:inline" style={{ color: modeColors.secondaryText }}>
              {isSaving ? publishingLiveText : saveTooltip}
            </span>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAction}
              title={saveTooltip}
              className="w-11 h-11 rounded-xl font-black transition-all flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
              style={{
                backgroundColor: brandColor,
                color: '#000000',
                boxShadow: `0 4px 18px ${modeColors.glowColor}`
              }}
            >
              {isSaving ? (
                <Icons.Loader2 size={18} className="animate-spin text-black" />
              ) : (
                <Icons.Check size={20} className="text-black" />
              )}
            </button>
          </div>
        </div>

        </div>

      </div>

      {/* מודאל בחירת מדיה ישיר מ-CloudStore של COMONA */}
      {isCloudStorePickerOpen && (
        <CloudStoreMediaPicker
          isOpen={isCloudStorePickerOpen}
          onClose={() => setIsCloudStorePickerOpen(false)}
          tenantId={tenantId}
          allowedTypes={targetId === 'brand_palette' ? ['logo', 'image'] : ['image', 'video', 'logo']}
          title={targetId === 'brand_palette' ? 'בחר לוגו ממאגר CLOUDSTORE' : 'מאגר המדיה של CLOUDSTORE (Comona Firebase)'}
          onSelectMedia={async (asset: CloudStoreMediaAsset) => {
            setIsCloudStorePickerOpen(false);
            if (targetId === 'brand_palette') {
              setLogoPreview(asset.url);
              setIsExtractingColors(true);
              try {
                const extracted = await extractPaletteFromLogoImage(asset.url);
                applyLiveColorPreview(extracted.primary, pageBgColor, extracted.primary, textColor);
                setExtractedColors([
                  { hex: extracted.primary, name: getHumanColorName(extracted.primary) },
                  { hex: extracted.secondary, name: getHumanColorName(extracted.secondary) },
                  { hex: extracted.accent, name: getHumanColorName(extracted.accent) }
                ]);
                setNotification(`✓ הלוגו "${asset.name}" נטען והצבעים חולצו בהצלחה!`);
              } catch (err) {
                setNotification(`✓ נבחר לוגו: ${asset.name}`);
              } finally {
                setIsExtractingColors(false);
                setTimeout(() => setNotification(null), 2500);
              }
            } else {
              setMediaUrl(asset.url);
              setNotification(`✓ נבחרה מדיה מ-CLOUDSTORE: ${asset.name}`);
              setTimeout(() => setNotification(null), 2500);
            }
          }}
        />
      )}
    </>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
