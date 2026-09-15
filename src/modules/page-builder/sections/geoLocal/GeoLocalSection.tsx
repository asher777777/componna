import React from 'react';
import { GeoLocalSectionConfig } from '../../types/sectionConfigs';
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation, Sparkles } from 'lucide-react';

export const GeoLocalSection: React.FC<{ config: GeoLocalSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'הסניף והפעילות המקומית שלנו',
    subtitle = 'שירות מקומי בפריסה רחבה',
    businessName = 'העסק המוביל',
    city = 'תל אביב',
    address = 'דרך מנחם בגין 144, תל אביב',
    phone = '03-1234567',
    email = 'contact@example.com',
    whatsapp = '0501234567',
    serviceAreas = ['תל אביב וגוש דן', 'ירושלים והסביבה', 'שרון והמרכז', 'צפון ודרום'],
    openingHours = ['א׳ - ה׳: 09:00 - 19:00', 'יום ו׳: 09:00 - 13:00', 'שבת: סגור'],
    mapEmbedUrl = 'https://maps.google.com/maps?q=Tel%20Aviv&t=&z=13&ie=UTF8&iwloc=&output=embed',
    directionsUrl = 'https://maps.google.com',
    backgroundColor = 'transparent',
  } = config;

  return (
    <section
      id={anchorId || 'location'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Info Card Column */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl text-right">
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold text-indigo-400 block mb-1">סניף מרכזי</span>
                <h3 className="text-2xl font-black text-white">{businessName}</h3>
                <p className="text-sm text-slate-300 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{address}</span>
                </p>
              </div>

              {/* Service Areas Pills */}
              {serviceAreas && serviceAreas.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-2">אזורי שירות מורשים:</span>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300"
                      >
                        📍 {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              {openingHours && openingHours.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>שעות פעילות וקבלת קהל:</span>
                  </span>
                  <div className="flex flex-col gap-1 text-xs text-slate-400">
                    {openingHours.map((hours, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-slate-800">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[130px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>שיחה בוואטסאפ</span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                  className="flex-1 min-w-[130px] py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                  <Phone className="w-4 h-4" />
                  <span>חיוג לסניף</span>
                </a>
              )}
            </div>
          </div>

          {/* Interactive Map Column */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl min-h-[380px] relative bg-slate-950">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
              className="w-full h-full filter invert-[0.88] hue-rotate-180 contrast-125"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
