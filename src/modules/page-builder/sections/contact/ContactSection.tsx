import React, { useState } from 'react';
import { ContactSectionConfig } from '../../types/sectionConfigs';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { eventBus } from '../../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/aiPageGenerator';

export const ContactSection: React.FC<{ config: ContactSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const fallbackPhone = brandDna?.trust?.contactPhone || '052-6968008';
  const fallbackEmail = brandDna?.trust?.contactEmail || 'ovt5771@gmail.com';
  const fallbackAddress = brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';
  const fallbackWhatsapp = brandDna?.trust?.whatsappSupportNumber || '0526968008';

  const {
    anchorId,
    title = 'צרו איתנו קשר',
    subtitle = 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות',
    phone = fallbackPhone,
    email = fallbackEmail,
    address = fallbackAddress,
    whatsapp = fallbackWhatsapp,
    showForm = true,
    backgroundColor = 'transparent',
  } = config;

  // Filter out any stale dummy placeholders that might have been saved in earlier configs
  const isDummyPhone = (p?: string) => !p || p === '03-1234567' || p === '050-0000000';
  const isDummyEmail = (e?: string) => !e || e === 'contact@example.com' || e === 'info@example.com';
  const isDummyAddress = (a?: string) => !a || a === 'רחוב הרצל 1, תל אביב' || a === 'תל אביב, ישראל';

  const resolvedPhone = (!isDummyPhone(config.phone) ? config.phone : null) || fallbackPhone;
  const resolvedEmail = (!isDummyEmail(config.email) ? config.email : null) || fallbackEmail;
  const resolvedAddress = (!isDummyAddress(config.address) ? config.address : null) || fallbackAddress;
  const resolvedWhatsapp = config.whatsapp && config.whatsapp !== '0501234567' && config.whatsapp !== '972545947701' ? config.whatsapp : fallbackWhatsapp;

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Emit live lead event to EventBus / CRM module
    eventBus.emit('crm:lead:created', {
      conta_name: formData.name,
      conta_phone: formData.phone,
      email: formData.email || undefined,
      source: 'page-builder:contact-section',
      metadata: {
        message: formData.message,
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      },
    });

    eventBus.emit('form:submitted', {
      formId: 'page-builder-contact',
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      data: formData,
    });
  };

  return (
    <section
      id={anchorId || 'contact'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {resolvedPhone && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">טלפון ישיר</span>
                  <a href={`tel:${resolvedPhone}`} className="text-base font-bold text-white hover:text-indigo-400 transition-colors" dir="ltr">
                    {resolvedPhone}
                  </a>
                </div>
              </div>
            )}

            {resolvedWhatsapp && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">וואטסאפ לבירורים מהירים</span>
                  <a
                    href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    שלחו הודעה בוואטסאפ
                  </a>
                </div>
              </div>
            )}

            {resolvedEmail && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">דואר אלקטרוני</span>
                  <a href={`mailto:${resolvedEmail}`} className="text-base font-bold text-white hover:text-purple-400 transition-colors" dir="ltr">
                    {resolvedEmail}
                  </a>
                </div>
              </div>
            )}

            {resolvedAddress && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-right">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">כתובת ומיקום</span>
                  <span className="text-base font-bold text-white">{resolvedAddress}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Column */}
          {showForm && (
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-right">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-3 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">הודעתך נשלחה בהצלחה!</h3>
                  <p className="text-xs text-slate-400">נחזור אליך בהקדם האפשרי.</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-xl font-bold text-white mb-2">טופס פנייה ישיר</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">שם מלא *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="ישראל ישראלי"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">טלפון *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="050-0000000"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">אימייל</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">תוכן הפנייה *</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="כתבו לנו כאן..."
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>שלח פנייה</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
