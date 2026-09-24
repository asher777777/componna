import React, { useState, useEffect } from 'react';
import { WorkbenchApp } from '../../workbench/WorkbenchApp';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { StorefrontService } from '../../modules/saas-storefront-composer/services/storefrontService';
import { PublicStorefrontApp } from '../../modules/saas-storefront-composer/components/PublicStorefrontApp';
import { TenantRecord } from '../../modules/saas-storefront-composer/types';
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

import { TenantSubdomainView } from './TenantSubdomainView';

export const TenantAppResolver: React.FC = () => {
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(null);
  const [tenantRecord, setTenantRecord] = useState<TenantRecord | null>(null);
  const [isDevWorkbench, setIsDevWorkbench] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('dev') === 'true' || params.get('mode') === 'dev' || params.get('workbench') === 'true';
  });

  useEffect(() => {
    // 1. Detect from URL query param (e.g. ?tenant=landing) or hostname (e.g. landing.kosun.pro)
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    const hostname = window.location.hostname;
    
    // Check if subdomain exists in hostname (ignore localhost root / web.app standard root)
    let sub: string | null = null;
    if (tenantParam) {
      sub = tenantParam;
    } else if (!hostname.startsWith('localhost') && !hostname.startsWith('127.0.0.1') && !hostname.startsWith('comona') && !hostname.startsWith('glowmanage') && !hostname.startsWith('kosun.pro') && !hostname.startsWith('www.kosun.pro')) {
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
          clientName: `מערכת לקוח (${sub})`,
          ownerEmail: `${sub}@kosun.pro`,
          ownerPhone: '050-1234567',
          activeModules: ['page-builder'],
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

  // 1. Subdomain View (Public Landing Page by default + Owner Admin Control Panel)
  if (tenantSubdomain && tenantRecord) {
    return <TenantSubdomainView tenantRecord={tenantRecord} />;
  }

  // 2. Developer / Super-Admin Workbench Mode (If explicitly requested)
  if (isDevWorkbench) {
    return <WorkbenchApp />;
  }

  // 3. Default Public View for Kosun.pro (Clean Storefront + Customer Login Modal, No Dev Sidebar!)
  return (
    <PublicStorefrontApp
      onEnterDevWorkbench={() => setIsDevWorkbench(true)}
    />
  );
};
