import React from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { PageBuilderProvider, usePageBuilderContext } from '../context/PageBuilderContext';
import { PageBuilderEditor } from '../PageBuilderEditor';
import { PagesDashboardTab } from '../components/PagesDashboardTab';
import { PublicPageView } from '../components/PublicPageView';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { Loader2 } from 'lucide-react';

const PageEditorRouteWrapper: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { db } = useSystemConnection();
  const { currentPageConfig, setCurrentPageConfig } = usePageBuilderContext();
  const [loading, setLoading] = React.useState(!currentPageConfig || currentPageConfig.pageId !== pageId);

  React.useEffect(() => {
    if (pageId && (!currentPageConfig || currentPageConfig.pageId !== pageId)) {
      setLoading(true);
      pageBuilderFirestore.getPage(pageId, db).then((config) => {
        if (config) {
          setCurrentPageConfig(config);
        }
        setLoading(false);
      });
    }
  }, [pageId, db, currentPageConfig, setCurrentPageConfig]);

  if (loading || !currentPageConfig) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white gap-3" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-bold">טוען עורך עמודים...</span>
      </div>
    );
  }

  return (
    <PageBuilderEditor
      initialConfig={currentPageConfig}
      onGoToPagesList={() => navigate('/')}
      onClose={() => navigate('/')}
    />
  );
};

import { PageBuilderRenderer } from '../PageBuilderRenderer';

const PagePreviewRouteWrapper: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const { db } = useSystemConnection();
  const { currentPageConfig } = usePageBuilderContext();
  const [config, setConfig] = React.useState<PageBuilderConfig | null>(
    currentPageConfig?.pageId === pageId ? currentPageConfig : null
  );
  const [loading, setLoading] = React.useState(!config);

  React.useEffect(() => {
    if (pageId && !config) {
      setLoading(true);
      pageBuilderFirestore.getPage(pageId, db).then((fetched) => {
        if (fetched) setConfig(fetched);
        setLoading(false);
      });
    }
  }, [pageId, db, config]);

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white gap-3" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-bold">טוען תצוגה מקדימה...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <PageBuilderRenderer config={config} />
    </div>
  );
};

const DashboardRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { db } = useSystemConnection();
  const [pages, setPages] = React.useState<PageBuilderConfig[]>([]);
  const { currentPageConfig, setCurrentPageConfig } = usePageBuilderContext();

  const loadPages = React.useCallback(async () => {
    const list = await pageBuilderFirestore.getAllPages(db);
    setPages(list);
  }, [db]);

  React.useEffect(() => {
    loadPages();
  }, [loadPages]);

  return (
    <div className="min-h-screen bg-[#070709] text-white p-6 md:p-8" dir="rtl">
      <PagesDashboardTab
        pages={pages}
        activePageId={currentPageConfig?.pageId || ''}
        onSelectPage={(page) => {
          setCurrentPageConfig(page);
          navigate(`/edit/${page.pageId}`);
        }}
        onNewPage={() => {
          const freshId = `page_${Date.now()}`;
          navigate(`/edit/${freshId}`);
        }}
        onOpenAiBuilder={() => {
          const freshId = `page_${Date.now()}`;
          navigate(`/edit/${freshId}?ai=true`);
        }}
        onDeletePage={async (pageId) => {
          await pageBuilderFirestore.deletePage(pageId, db);
          loadPages();
        }}
        onDuplicatePage={async (page) => {
          const copy: PageBuilderConfig = {
            ...JSON.parse(JSON.stringify(page)),
            pageId: `page_${Date.now()}`,
            pageTitle: `${page.pageTitle} (העתק)`,
            slug: `${page.slug}-copy`,
            published: false,
          };
          await pageBuilderFirestore.savePage(copy, db);
          loadPages();
        }}
        onSetHomePage={async (pageId) => {
          await pageBuilderFirestore.setHomePage(pageId, db);
          loadPages();
        }}
        onTogglePublish={async (page) => {
          await pageBuilderFirestore.savePage({ ...page, published: !page.published }, db);
          loadPages();
        }}
        onOpenShortener={(page) => {
          window.open(`/#/p/${page.slug}`, '_blank');
        }}
      />
    </div>
  );
};

export const PageBuilderRoutes: React.FC = () => {
  return (
    <PageBuilderProvider>
      <Routes>
        <Route path="/" element={<DashboardRouteWrapper />} />
        <Route path="/edit/:pageId" element={<PageEditorRouteWrapper />} />
        <Route path="/preview/:pageId" element={<PagePreviewRouteWrapper />} />
      </Routes>
    </PageBuilderProvider>
  );
};

export default PageBuilderRoutes;
