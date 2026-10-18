import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { eventBus } from '../../../core/bridge/EventBus';
import { KosTubeSeoPage, KosTubeVideo } from '../types';
import { extractCompellingTitle } from '../api/functionsApi';

export class KosTubePageSyncService {
  private static isInitialized = false;

  /**
   * Initializes real-time listener for bidirectional page-to-tube synchronization
   */
  static initAutoSync(db: Firestore | null | undefined): () => void {
    if (this.isInitialized || typeof window === 'undefined') {
      return () => {};
    }
    this.isInitialized = true;

    const unsub = eventBus.subscribe('pagebuilder:page_saved', async (data: any) => {
      const page = data?.page;
      const tenantId = data?.tenantId || '_master';
      if (!page || !db) return;

      const isVideoPage =
        page.pageCategory === 'youtube_post' ||
        Boolean(page.sections?.['kosvidio-1'] || page.sections?.kosvidio) ||
        (page.pageId && page.pageId.startsWith('page_kosvidio_')) ||
        (page.slug && page.slug.startsWith('kosvidio'));

      if (isVideoPage) {
        await this.syncPageToTube(page, db, tenantId);
      }
    });

    return () => {
      unsub();
      this.isInitialized = false;
    };
  }

  /**
   * Syncs data from PageBuilderConfig into KosTube tube_pages & tube_videos collections
   */
  static async syncPageToTube(
    page: any,
    db: Firestore | null | undefined,
    tenantId: string = '_master'
  ): Promise<void> {
    if (!db || !page) return;

    try {
      const effTenant = tenantId || '_master';
      const playerSec = page.sections?.['kosvidio-1'] || page.sections?.kosvidio || {};
      const engagementSec = page.sections?.['videoEngagement-1'] || page.sections?.videoEngagement || {};
      const aboutSec = page.sections?.['about-1'] || page.sections?.about || {};
      const takeawaysSec = page.sections?.['sec-takeaways'] || {};
      const faqSec = page.sections?.['sec-faq'] || page.sections?.faq || {};
      const ctaSec = page.sections?.['sec-cta'] || page.sections?.cta || {};

      const youtubeVideoId = (playerSec.youtubeVideoId || '').trim();
      if (!youtubeVideoId) return;

      const cleanSlug = (page.slug || '').replace(/^\/?kosvidio[-/]/i, '') || youtubeVideoId;
      const pageId = page.pageId || `page_kosvidio_${youtubeVideoId}`;

      const keyTakeaways = Array.isArray(takeawaysSec.items)
        ? takeawaysSec.items.map((i: any) => ({
            title: i.title || '',
            text: i.description || i.text || i.title || '',
            icon: i.icon || 'CheckCircle2',
          })).filter((i: any) => i.title || i.text)
        : [];

      const faqs = Array.isArray(faqSec.items)
        ? faqSec.items.map((f: any) => ({
            question: f.question || '',
            answer: f.answer || '',
          })).filter((f: any) => f.question)
        : [];

      const tags = Array.isArray(engagementSec.tags) && engagementSec.tags.length > 0
        ? engagementSec.tags
        : page.seoSettings?.keywords || ['וידאו', 'יוטיוב', 'SEO', 'AISEO'];

      const title = playerSec.title || page.pageTitle || '';
      const h1 = aboutSec.heading || title;
      const executiveSummary = aboutSec.subtitle || '';
      const articleContent = aboutSec.body || '';

      const viewCount = Number(playerSec.viewsCount || engagementSec.viewsCount || page.viewsCount || 0);
      const likeCount = Number(engagementSec.likesCount || playerSec.likesCount || 0);

      // 1. Update KosTube SEO Page in Firestore
      const tubePagesRef = collection(db, 'tenants', effTenant, SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      const pageDocRef = doc(tubePagesRef, pageId);

      const updatedSeoPage: Partial<KosTubeSeoPage> = {
        id: pageId,
        youtubeVideoId,
        slug: cleanSlug,
        metaTitle: page.seoSettings?.title || title,
        metaDescription: page.seoSettings?.description || executiveSummary.slice(0, 160),
        h1,
        executiveSummary,
        articleContent,
        keyTakeaways,
        faqs,
        callToAction: {
          title: ctaSec.title || `רוצים תוצאות דומות?`,
          subtitle: ctaSec.description || '',
          buttonText: ctaSec.buttonText || 'צרו קשר עכשיו',
          buttonLink: '#sec-cta',
          showLeadForm: true,
        },
        viewCount,
        likeCount,
        tags,
        publicUrl: page.publicUrl || `/kosvidio/${cleanSlug}`,
        pageBuilderPageId: pageId,
        isPublished: Boolean(page.published),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(pageDocRef, updatedSeoPage, { merge: true });

      // 2. Update corresponding video in tube_videos
      const tubeVideosRef = collection(db, 'tenants', effTenant, SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
      const existingVideosSnap = await getDocs(tubeVideosRef);
      for (const d of existingVideosSnap.docs) {
        const vData = d.data() as KosTubeVideo;
        if (vData.youtubeVideoId === youtubeVideoId || vData.id === playerSec.videoId) {
          await updateDoc(d.ref, {
            title: title || vData.title,
            viewCount: viewCount || vData.viewCount,
            likeCount: likeCount || vData.likeCount,
            status: 'processed',
            seoPageId: pageId,
            seoPageSlug: cleanSlug,
            updatedAt: new Date().toISOString(),
          });
          break;
        }
      }

      // 3. Emit real-time synchronization event
      eventBus.publish('kostube:synced_from_page', {
        pageId,
        youtubeVideoId,
        slug: cleanSlug,
        seoPage: updatedSeoPage,
      });
    } catch (err) {
      console.warn('[KosTubePageSyncService] syncPageToTube error:', err);
    }
  }

  /**
   * Syncs data from KosTubeSeoPage into PageBuilder page config in Firestore
   */
  static async syncTubeToPage(
    seoPage: KosTubeSeoPage,
    db: Firestore | null | undefined,
    tenantId: string = '_master'
  ): Promise<void> {
    if (!db || !seoPage) return;

    try {
      const effTenant = tenantId || '_master';
      const pageId = seoPage.pageBuilderPageId || `page_kosvidio_${seoPage.youtubeVideoId}`;
      const pagesRef = collection(db, 'tenants', effTenant, SYSTEM_COLLECTIONS.PAGES);
      const pageDocRef = doc(pagesRef, pageId);

      const existingSnap = await getDoc(pageDocRef);
      if (!existingSnap.exists()) return;

      const pageConfig = existingSnap.data() as any;

      // Update sections with KosTube data
      if (pageConfig.sections?.['kosvidio-1']) {
        pageConfig.sections['kosvidio-1'] = {
          ...pageConfig.sections['kosvidio-1'],
          title: seoPage.h1 || seoPage.metaTitle || pageConfig.sections['kosvidio-1'].title,
          viewsCount: Number(seoPage.viewCount || pageConfig.sections['kosvidio-1'].viewsCount || 0),
          likesCount: Number(seoPage.likeCount || pageConfig.sections['kosvidio-1'].likesCount || 0),
        };
      }

      if (pageConfig.sections?.['about-1']) {
        const summaryHtml = seoPage.executiveSummary
          ? `<div class="p-5 mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium leading-relaxed shadow-xs"><div class="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">תמצית התוכן והסרטון:</div>${seoPage.executiveSummary}</div>`
          : '';
        const bodyContent = `<div class="kosvidio-rich-content space-y-4 font-normal leading-relaxed text-slate-800 dark:text-slate-200">${summaryHtml}${seoPage.articleContent || ''}</div>`;

        pageConfig.sections['about-1'] = {
          ...pageConfig.sections['about-1'],
          heading: seoPage.h1 || pageConfig.sections['about-1'].heading,
          subtitle: seoPage.executiveSummary || pageConfig.sections['about-1'].subtitle,
          body: bodyContent,
        };
      }

      if (pageConfig.sections?.['sec-takeaways'] && Array.isArray(seoPage.keyTakeaways)) {
        const brandName = pageConfig.globalSettings?.companyName || 'קושאן';
        pageConfig.sections['sec-takeaways'].items = seoPage.keyTakeaways.map((point: any, idx: number) => {
          let title = '';
          let text = '';
          if (typeof point === 'object' && point !== null) {
            const rawTitle = (point.title || '').trim();
            const rawText = (point.text || point.description || '').trim();
            const isGeneric = !rawTitle || rawTitle.startsWith('תובנה מרכזית') || rawTitle.startsWith('תובנה ');
            title = isGeneric ? extractCompellingTitle(rawText || rawTitle, idx + 1, brandName) : rawTitle;
            text = rawText || rawTitle;
          } else if (typeof point === 'string') {
            const clean = point.trim();
            if (clean.includes(':')) {
              const parts = clean.split(':');
              const head = parts[0].trim();
              const tail = parts.slice(1).join(':').trim();
              if (head.length >= 3 && head.length <= 40 && !head.startsWith('תובנה מרכזית') && !head.startsWith('תובנה ')) {
                title = head;
                text = tail || head;
              }
            }
            if (!title) {
              title = extractCompellingTitle(clean, idx + 1, brandName);
              text = clean;
            }
          } else {
            title = `עיקרון מנחה ${idx + 1}`;
            text = String(point);
          }

          return {
            id: `takeaway_${idx + 1}`,
            title,
            text,
            description: text,
            icon: point.icon || 'CheckCircle2',
          };
        });
      }

      if (pageConfig.sections?.['sec-faq'] && Array.isArray(seoPage.faqs)) {
        pageConfig.sections['sec-faq'].items = seoPage.faqs.map((f, idx) => ({
          id: `faq_${idx + 1}`,
          question: f.question,
          answer: f.answer,
          icon: 'HelpCircle',
        }));
      }

      if (pageConfig.sections?.['sec-cta'] && seoPage.callToAction) {
        pageConfig.sections['sec-cta'] = {
          ...pageConfig.sections['sec-cta'],
          title: seoPage.callToAction.title || pageConfig.sections['sec-cta'].title,
          description: seoPage.callToAction.subtitle || pageConfig.sections['sec-cta'].description,
          buttonText: seoPage.callToAction.buttonText || pageConfig.sections['sec-cta'].buttonText,
        };
      }

      if (pageConfig.sections?.['videoEngagement-1']) {
        pageConfig.sections['videoEngagement-1'] = {
          ...pageConfig.sections['videoEngagement-1'],
          likesCount: Number(seoPage.likeCount || 0),
          viewsCount: Number(seoPage.viewCount || 0),
          tags: seoPage.tags || pageConfig.sections['videoEngagement-1'].tags,
        };
      }

      pageConfig.seoSettings = {
        ...pageConfig.seoSettings,
        title: seoPage.metaTitle || pageConfig.seoSettings?.title,
        description: seoPage.metaDescription || pageConfig.seoSettings?.description,
        keywords: seoPage.tags || seoPage.focusKeywords || pageConfig.seoSettings?.keywords,
      };

      pageConfig.updatedAt = new Date().toISOString();

      await setDoc(pageDocRef, pageConfig, { merge: true });

      eventBus.publish('kosvidio:page_updated', {
        pageId,
        youtubeVideoId: seoPage.youtubeVideoId,
        slug: pageConfig.slug,
        pageConfig,
      });
    } catch (err) {
      console.warn('[KosTubePageSyncService] syncTubeToPage error:', err);
    }
  }
}
