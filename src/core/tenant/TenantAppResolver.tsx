import React, { useState, useEffect } from 'react';
import { WorkbenchApp } from '../../workbench/WorkbenchApp';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { StorefrontService } from '../../modules/saas-storefront-composer/services/storefrontService';
import { TenantRecord } from '../../modules/saas-storefront-composer/types';
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const TenantAppResolver: React.FC = () => {
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(null);
  const [tenantRecord, setTenantRecord] = useState<TenantRecord | null>(null);

  useEffect(() => {
    // 1. Detect from URL query param (e.g. ?tenant=landing) or hostname (e.g. landing.domain.com)
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    const hostname = window.location.hostname;
    
    // Check if subdomain exists in hostname (ignore localhost / web.app standard root)
    let sub: string | null = null;
    if (tenantParam) {
      sub = tenantParam;
    } else if (!hostname.startsWith('localhost') && !hostname.startsWith('127.0.0.1') && !hostname.startsWith('comona') && !hostname.startsWith('glowmanage')) {
      const parts = hostname.split('.');
      if (parts.length > 2) {
        sub = parts[0];
      }
    }

    if (sub) {
      setTenantSubdomain(sub);
      const all = StorefrontService.getAllTenants();
      const found = all.find(t => t.subdomain.toLowerCase() === sub?.toLowerCase());
      if (found) {
        setTenantRecord(found);
      } else {
        // Fallback demo tenant for the requested subdomain
        const demoTenant: TenantRecord = {
          subdomain: sub,
          fullDomain: `${sub}.kosun.pro`,
          clientName: `מערכת דפי נחיתה (${sub})`,
          ownerEmail: `${sub}@kosun.pro`,
          ownerPhone: '050-1234567',
          activeModules: ['page-builder', 'media-gallery-hub', 'crm-analytics'],
          collectionPrefix: `tenant_${sub}_mod_`,
          billingPlan: 'annual',
          monthlyTotal: 129,
          paymentTransactionId: 'TXN-INIT-001',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTenantRecord(demoTenant);
      }
    } else {
      setTenantSubdomain(null);
      setTenantRecord(null);
    }
  }, []);

  // If a tenant is active on this subdomain
  if (tenantSubdomain && tenantRecord) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans" dir="rtl">
        {/* Top Subdomain Bar indicator */}
        <header className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-indigo-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white">סאב-דומיין פעיל:</span>
            <span className="font-mono text-indigo-300 bg-slate-800 px-2 py-0.5 rounded">
              {tenantRecord.fullDomain}
            </span>
            <span className="text-gray-400 hidden sm:inline">| קולקציות: <code className="text-emerald-400">{tenantRecord.collectionPrefix}*</code></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                window.location.href = window.location.origin;
              }}
              className="flex items-center gap-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1 rounded-lg transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>חזרה לחנות הראשית (Workbench)</span>
            </button>
          </div>
        </header>

        {/* Mount the client platform shell with only active modules */}
        <div className="flex-1">
          <ClientPlatformProvider>
            <DynamicClientShell />
          </ClientPlatformProvider>
        </div>
      </div>
    );
  }

  // Otherwise render the default Workbench (Marketplace + Dev Workbench)
  return <WorkbenchApp />;
};
