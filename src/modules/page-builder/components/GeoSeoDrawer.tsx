import React from 'react';
import { PageBuilderConfig, GeoSeoSettings } from '../types/pageBuilder.types';
import { PageBuilderInput } from '../ui/PageBuilderInput';
import { MapPin, X, Sparkles, CheckCircle2, Globe, Building, Clock, Phone } from 'lucide-react';

interface GeoSeoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: PageBuilderConfig;
  onSaveConfig: (updated: PageBuilderConfig) => void;
}

export const GeoSeoDrawer: React.FC<GeoSeoDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const geo: GeoSeoSettings = config.seoSettings?.geo || {
    enabled: true,
    targetCity: 'תל אביב',
    targetRegion: 'גוש דן והמרכז',
    targetCountry: 'ישראל',
    serviceAreas: ['תל אביב', 'רמת גן', 'הרצליה', 'פתח תקווה'],
    localBusinessName: config.globalSettings?.companyName || 'העסק המוביל',
    localBusinessType: 'LocalBusiness',
    businessAddress: config.globalSettings?.address || 'תל אביב, ישראל',
    businessPhone: config.globalSettings?.contactPhone || '03-1234567',
    businessEmail: config.globalSettings?.contactEmail || 'info@example.com',
    openingHours: 'Mo-Th 09:00-19:00, Fr 09:00-13:00',
  };

  const handleGeoChange = (field: keyof GeoSeoSettings, value: any) => {
    const updatedGeo: GeoSeoSettings = { ...geo, [field]: value };
    onSaveConfig({
      ...config,
      seoSettings: {
        ...(config.seoSettings || {}),
        geo: updatedGeo,
      },
    });
  };

  // Schema.org JSON-LD preview
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': geo.localBusinessType || 'LocalBusiness',
    name: geo.localBusinessName || config.pageTitle,
    description: config.seoSettings?.description || config.globalSettings?.slogan,
    address: {
      '@type': 'PostalAddress',
      streetAddress: geo.businessAddress,
      addressLocality: geo.targetCity,
      addressRegion: geo.targetRegion,
      addressCountry: geo.targetCountry || 'IL',
    },
    telephone: geo.businessPhone,
    email: geo.businessEmail,
    openingHours: geo.openingHours,
    areaServed: geo.serviceAreas,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-xl bg-slate-950 border-r border-slate-800 h-full overflow-y-auto p-6 flex flex-col gap-6 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">קידום מקומי (GEO SEO) ו-Schema.org</h3>
              <p className="text-xs text-slate-400">הגדרות אופטימיזציה לחיפוש מקומי במפות ובגוגל</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Enable GEO Switch */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">הפעלת קידום מקומי (GEO Metadata)</span>
            <span className="text-[11px] text-slate-400">הזרקת סכמת LocalBusiness ותגיות NAP ל-HTML</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={geo.enabled !== false}
              onChange={(e) => handleGeoChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Location Targeting */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-indigo-400">מיקוד גיאוגרפי וערים</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PageBuilderInput
              label="עיר יעד מרכזית"
              value={geo.targetCity || ''}
              onChange={(val) => handleGeoChange('targetCity', val)}
            />
            <PageBuilderInput
              label="מחוז / אזור פעילות"
              value={geo.targetRegion || ''}
              onChange={(val) => handleGeoChange('targetRegion', val)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">אזורי שירות נוספים (מופרדים בפסיקים)</label>
            <input
              type="text"
              value={(geo.serviceAreas || []).join(', ')}
              onChange={(e) =>
                handleGeoChange(
                  'serviceAreas',
                  e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="תל אביב, הרצליה, רמת גן, פתח תקווה"
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* NAP Business Details */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-indigo-400">פרטי עסק וסכמה (NAP & Schema)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PageBuilderInput
              label="שם העסק (לפי גוגל מפות)"
              value={geo.localBusinessName || ''}
              onChange={(val) => handleGeoChange('localBusinessName', val)}
            />
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">סוג העסק (Schema Type)</label>
              <select
                value={geo.localBusinessType || 'LocalBusiness'}
                onChange={(e) => handleGeoChange('localBusinessType', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="LocalBusiness">LocalBusiness (עסק מקומי כללי)</option>
                <option value="ProfessionalService">ProfessionalService (שירותים מקצועיים)</option>
                <option value="EducationalOrganization">EducationalOrganization (חינוך והדרכה)</option>
                <option value="NGO">NGO (עמותה / ארגון חברתי)</option>
                <option value="Store">Store (חנות / מסחר)</option>
                <option value="MedicalBusiness">MedicalBusiness (רפואה וטיפול)</option>
              </select>
            </div>
          </div>

          <PageBuilderInput
            label="כתובת פיזית מלאה"
            value={geo.businessAddress || ''}
            onChange={(val) => handleGeoChange('businessAddress', val)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PageBuilderInput
              label="טלפון ראשי לפניות"
              value={geo.businessPhone || ''}
              onChange={(val) => handleGeoChange('businessPhone', val)}
            />
            <PageBuilderInput
              label="אימייל לפניות"
              value={geo.businessEmail || ''}
              onChange={(val) => handleGeoChange('businessEmail', val)}
            />
          </div>

          <PageBuilderInput
            label="שעות פתיחה ופעילות"
            value={geo.openingHours || ''}
            onChange={(val) => handleGeoChange('openingHours', val)}
          />
        </div>

        {/* Live JSON-LD Schema Preview */}
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-xs font-bold text-slate-400">תצוגה מקדימה של סכמת ה-Schema.org שתוזרק לדף:</span>
          <pre className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-[11px] text-emerald-400 font-mono overflow-x-auto" dir="ltr">
            {JSON.stringify(jsonLdSchema, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
