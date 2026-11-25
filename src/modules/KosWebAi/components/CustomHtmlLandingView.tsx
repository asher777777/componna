import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import {
  CustomHtmlLandingPage,
  getCustomHtmlLandingPageBySlug,
  trackCustomHtmlLandingView,
} from '../services/customHtmlLandingService';
import { SmartFormDefinition } from '../../KosForms/types';
import { Loader2, AlertTriangle, Home } from 'lucide-react';

interface CustomHtmlWithFormRendererProps {
  htmlContent: string;
  formId?: string;
  inlineForm?: SmartFormDefinition | null;
  previewMode?: boolean;
}

const SLOT_REGEX = /<div\s+id=["']kosun-form-slot["'][^>]*>\s*<\/div>/i;

export const CustomHtmlWithFormRenderer: React.FC<CustomHtmlWithFormRendererProps> = ({
  htmlContent,
  formId,
  inlineForm,
  previewMode = false,
}) => {
  const [beforeHtml, afterHtml] = useMemo(() => {
    const match = htmlContent.match(SLOT_REGEX);
    if (!match || match.index === undefined) {
      return [htmlContent, ''];
    }
    return [
      htmlContent.slice(0, match.index),
      htmlContent.slice(match.index + match[0].length),
    ];
  }, [htmlContent]);

  return (
    <div dir="rtl" className="w-full min-h-screen" style={{ fontFamily: "'Heebo', sans-serif" }}>
      <div dangerouslySetInnerHTML={{ __html: beforeHtml }} />

      {(formId || inlineForm) && (
        <div id="kosun-form-slot" className="w-full max-w-3xl mx-auto px-4 py-8">
          <CapabilitySlot
            name="form-renderer"
            props={{
              formId: inlineForm ? undefined : formId,
              form: inlineForm || undefined,
              previewMode,
            }}
            fallback={
              <div className="p-6 rounded-2xl border border-slate-700 bg-slate-900/80 text-center text-sm text-slate-300">
                טוען טופס הרשמה...
              </div>
            }
          />
        </div>
      )}

      {afterHtml && <div dangerouslySetInnerHTML={{ __html: afterHtml }} />}
    </div>
  );
};

export interface CustomHtmlLandingViewProps {
  slug?: string;
}

export const CustomHtmlLandingView: React.FC<CustomHtmlLandingViewProps> = ({ slug: propSlug }) => {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = propSlug || routeSlug || '';
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [page, setPage] = useState<CustomHtmlLandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getCustomHtmlLandingPageBySlug(slug, db, tenantId)
      .then((found) => {
        if (!active) return;
        setPage(found);
        if (found?.id) {
          trackCustomHtmlLandingView(found.id, db, tenantId);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, db, tenantId]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center gap-3"
      >
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-sm font-bold">טוען דף נחיתה...</span>
      </div>
    );
  }

  if (!page) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center space-y-4"
      >
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h1 className="text-2xl font-black">דף הנחיתה לא נמצא</h1>
        <p className="text-sm text-slate-400 max-w-md">
          ייתכן שהקישור שגוי או שדף הנחיתה הוסר.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>חזרה לדף הבית</span>
        </Link>
      </div>
    );
  }

  return (
    <CustomHtmlWithFormRenderer
      htmlContent={page.htmlContent}
      formId={page.formId}
    />
  );
};
