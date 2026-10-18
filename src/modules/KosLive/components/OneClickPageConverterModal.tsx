import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Wand2, Globe, ShoppingBag, FileText, ArrowLeft, 
  CheckCircle2, Loader2, Play, ChevronLeft
} from 'lucide-react';
import { useKosLive } from '../context/KosLiveContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { pageBuilderFirestore } from '../../KosWebAi/services/pageBuilderFirestore';
import { PageBuilderConfig } from '../../KosWebAi/types/pageBuilder.types';
import { extractPageContentForLiving, convertSummaryToLivingCampaign } from '../services/pageToLivingConverter';
import { LivingStorageService } from '../services/livingStorageService';

export const OneClickPageConverterModal: React.FC = () => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { setActiveProject, setActiveCampaign, setTab } = useKosLive();

  const [pages, setPages] = useState<PageBuilderConfig[]>([]);
  const [loadingPages, setLoadingPages] = useState<boolean>(true);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionSuccess, setConversionSuccess] = useState<boolean>(false);

  // Manual fallback inputs
  const [sourceType, setSourceType] = useState<'page' | 'product' | 'text'>('page');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customContent, setCustomContent] = useState<string>('');

  useEffect(() => {
    async function fetchPages() {
      setLoadingPages(true);
      try {
        const list = await pageBuilderFirestore.getAllPages(db as any, tenantId);
        setPages(list);
        if (list.length > 0) {
          setSelectedPageId(list[0].pageId);
        }
      } catch (err) {
        console.warn('[OneClickPageConverterModal] Error fetching pages:', err);
      } finally {
        setLoadingPages(false);
      }
    }
    fetchPages();
  }, [db, tenantId]);

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      let pageData: any;

      if (sourceType === 'page') {
        const found = pages.find(p => p.pageId === selectedPageId);
        pageData = found || {
          pageId: 'page_custom_' + Date.now(),
          pageTitle: 'עמוד נחיתה אינטראקטיבי',
          slug: 'landing-living',
          sections: {
            hero: { type: 'hero', title: 'שירותי הפרימיום של קושאן', subtitle: 'פתרונות חכמים בהתאמה אישית' }
          }
        };
      } else {
        pageData = {
          pageId: 'page_manual_' + Date.now(),
          pageTitle: customTitle || 'מוצר / שירות נבחר',
          slug: 'product-living',
          sections: {
            hero: { 
              type: 'hero', 
              title: customTitle || 'המוצר המוביל שלנו', 
              subtitle: customContent || 'גלו את כל התכונות והיתרונות המיוחדים' 
            }
          }
        };
      }

      // Extract and convert
      const summary = extractPageContentForLiving(pageData);
      const { project, campaign } = convertSummaryToLivingCampaign(summary);

      // Save to Multi-Tenant Storage
      await LivingStorageService.saveProject(db as any, tenantId, project);
      await LivingStorageService.saveCampaign(db as any, tenantId, campaign);

      setActiveProject(project);
      setActiveCampaign(campaign);
      setConversionSuccess(true);

      setTimeout(() => {
        setConversionSuccess(false);
        setTab('preview');
      }, 1200);

    } catch (err) {
      console.warn('[OneClickPageConverterModal] Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans select-none" dir="rtl">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>טכנולוגיית עמודים חיים בלחיצה אחת</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            הפיכת עמוד, תוכן או מוצר לעמוד חי
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            ה-AI יסרוק את העמוד שבחרתם, יחלץ את הכותרות, היתרונות, התשובות לשאלות נפוצות והמחירים, 
            וייצר עבורכם סרטון אינטראקטיבי מלא עם פרזנטור וירטואלי, כפתורי החלטה, טפסים ומענה קולי.
          </p>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 shrink-0">
          <Wand2 className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      {/* Conversion Form Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-right">
        
        {/* Source Selector */}
        <div className="flex items-center gap-2 mb-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setSourceType('page')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              sourceType === 'page' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>עמוד קיים (KosWebAi)</span>
          </button>

          <button
            onClick={() => setSourceType('product')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              sourceType === 'product' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>מוצר או חבילה</span>
          </button>

          <button
            onClick={() => setSourceType('text')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              sourceType === 'text' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>הזנה חופשית</span>
          </button>
        </div>

        {/* Dynamic Content selection */}
        {sourceType === 'page' && (
          <div className="space-y-4 mb-6">
            <label className="block text-xs font-bold text-slate-300">
              בחרו את העמוד שברצונכם להפיח בו חיים:
            </label>
            {loadingPages ? (
              <div className="py-8 flex items-center justify-center text-slate-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>טוען עמודים קיימים...</span>
              </div>
            ) : pages.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 text-center">
                לא נמצאו עמודים שמורים. תוכלו ליצור עמוד הדגמה חי או להזין תוכן ידנית בלשונית 'הזנה חופשית'.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pages.map(page => (
                  <div
                    key={page.pageId}
                    onClick={() => setSelectedPageId(page.pageId)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-right ${
                      selectedPageId === page.pageId
                        ? 'bg-amber-500/10 border-amber-500 shadow-md text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{page.pageTitle}</span>
                      {selectedPageId === page.pageId && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">נתיב: /{page.slug || page.pageId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(sourceType === 'product' || sourceType === 'text') && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">כותרת המוצר / השירות:</label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="למשל: תוכנית ליווי אישית 1-על-1 לבעלי עסקים"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">תיאור, יתרונות או תסריט קצר:</label>
              <textarea
                rows={4}
                value={customContent}
                onChange={e => setCustomContent(e.target.value)}
                placeholder="פרטו מה השירות כולל, מה המחיר ומה הערך המרכזי..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>
        )}

        {/* Convert Action Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            ההמרה אורכת כ-3 שניות בלבד ויוצרת מכונת מצבים מלאה.
          </span>

          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>מייצר עמוד חי ב-AI...</span>
              </>
            ) : conversionSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>העמוד החי מוכן!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>הפוך לעמוד חי עכשיו ➔</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
