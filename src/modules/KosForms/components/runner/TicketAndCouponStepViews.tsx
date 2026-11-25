import React, { useState, useMemo } from 'react';
import {
  AppliedCouponAnswer,
  FormStep,
  SmartFormDefinition,
  TicketBookingAnswer,
  TicketBookingItem,
} from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import {
  getAvailableCoupons,
  resolveOrderSubtotal,
  validateAndApplyCoupon,
} from '../../services/ticketCouponService';
import {
  Ticket,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  XCircle,
  Users,
  Sparkles,
} from 'lucide-react';

interface TicketBookingStepViewProps {
  step: FormStep;
  value?: TicketBookingAnswer;
  onChange: (val: TicketBookingAnswer) => void;
}

export const TicketBookingStepView: React.FC<TicketBookingStepViewProps> = ({
  step,
  value,
  onChange,
}) => {
  const tiers = step.ticketTiers || [];
  const collectNames = step.collectAttendeeNames !== false;

  const quantitiesMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of value?.items || []) {
      map[item.tierId] = item.quantity;
    }
    return map;
  }, [value]);

  const attendeeNamesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const item of value?.items || []) {
      map[item.tierId] = item.attendeeNames || [];
    }
    return map;
  }, [value]);

  const emitChange = (
    nextQuantities: Record<string, number>,
    nextNames: Record<string, string[]>
  ) => {
    const items: TicketBookingItem[] = [];
    let totalQuantity = 0;
    let subtotal = 0;
    const allAttendeeNames: string[] = [];

    for (const tier of tiers) {
      const qty = nextQuantities[tier.id] || 0;
      if (qty <= 0) continue;

      const existingNames = nextNames[tier.id] || [];
      const tierNames = Array.from({ length: qty }, (_, idx) => existingNames[idx] || '');
      items.push({
        tierId: tier.id,
        tierName: tier.name,
        unitPrice: tier.price,
        quantity: qty,
        attendeeNames: tierNames,
      });

      totalQuantity += qty;
      subtotal += qty * tier.price;
      allAttendeeNames.push(...tierNames.filter((n) => n.trim().length > 0));
    }

    const summaryText = items.map((i) => `${i.quantity} × ${i.tierName}`).join(', ');
    onChange({
      items,
      totalQuantity,
      subtotal: Math.round(subtotal * 100) / 100,
      attendeeNames: allAttendeeNames,
      summaryText,
    });
  };

  const handleQuantityChange = (tierId: string, delta: number) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) return;

    const current = quantitiesMap[tierId] || 0;
    const remaining =
      typeof tier.capacity === 'number' && tier.capacity > 0
        ? Math.max(0, tier.capacity - (tier.soldCount || 0))
        : 9999;
    const maxAllowed = Math.min(remaining, tier.maxPerOrder || 99);
    const nextQty = Math.max(0, Math.min(maxAllowed, current + delta));

    const nextQuantities = { ...quantitiesMap, [tierId]: nextQty };
    emitChange(nextQuantities, attendeeNamesMap);
  };

  const handleAttendeeNameChange = (tierId: string, idx: number, name: string) => {
    const currentNames = [...(attendeeNamesMap[tierId] || [])];
    currentNames[idx] = name;
    const nextNames = { ...attendeeNamesMap, [tierId]: currentNames };
    emitChange(quantitiesMap, nextNames);
  };

  if (tiers.length === 0) {
    return (
      <div className="w-full max-w-xl p-6 rounded-2xl bg-white/10 border border-slate-700 text-center text-sm text-slate-300">
        לא הוגדרו סוגי כרטיסים בשלב זה.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4 text-right" dir="rtl">
      <div className="space-y-3">
        {tiers.map((tier) => {
          const qty = quantitiesMap[tier.id] || 0;
          const hasCapacity = typeof tier.capacity === 'number' && tier.capacity > 0;
          const remaining = hasCapacity
            ? Math.max(0, (tier.capacity || 0) - (tier.soldCount || 0))
            : null;
          const isSoldOut = remaining !== null && remaining <= 0;
          const maxAllowed = Math.min(
            remaining !== null ? remaining : 9999,
            tier.maxPerOrder || 99
          );

          return (
            <div
              key={tier.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all backdrop-blur-xs ${
                qty > 0
                  ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'
              } ${isSoldOut ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                    <LuxuryIconRenderer
                      iconName={tier.iconName || 'Ticket'}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-extrabold text-base ${
                          qty > 0 ? 'text-white' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tier.name}
                      </span>
                      {remaining !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isSoldOut
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : remaining <= 10
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          }`}
                        >
                          {isSoldOut ? 'אזל המלאי' : `נותרו ${remaining} כרטיסים`}
                        </span>
                      )}
                    </div>
                    {tier.description && (
                      <p
                        className={`text-xs leading-relaxed ${
                          qty > 0 ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {tier.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Quantity Stepper */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-left">
                    <div
                      className={`text-lg font-black font-mono ${
                        qty > 0 ? 'text-amber-300' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tier.price === 0 ? 'חינם' : `₪${tier.price}`}
                    </div>
                    <div className="text-[10px] text-slate-400">לכרטיס</div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-xl p-1">
                    <button
                      type="button"
                      disabled={qty <= 0}
                      onClick={() => handleQuantityChange(tier.id, -1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      aria-label="הפחת כמות"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-7 text-center font-mono font-bold text-white text-sm">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={isSoldOut || qty >= maxAllowed}
                      onClick={() => handleQuantityChange(tier.id, 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-30 transition-colors"
                      aria-label="הוסף כמות"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Attendee Names */}
              {collectNames && qty > 0 && (
                <div className="mt-4 pt-3 border-t border-white/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Users className="w-3.5 h-3.5" />
                    <span>שמות המשתתפים עבור {tier.name}:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Array.from({ length: qty }).map((_, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={(attendeeNamesMap[tier.id] || [])[idx] || ''}
                        onChange={(e) =>
                          handleAttendeeNameChange(tier.id, idx, e.target.value)
                        }
                        placeholder={`שם מלא למשתתף ${idx + 1}`}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950/70 border border-slate-700 focus:border-amber-400 rounded-xl text-white placeholder:text-slate-400 outline-none"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Subtotal Summary */}
      {(value?.totalQuantity || 0) > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>סה"כ נבחרו {value?.totalQuantity} כרטיסים</span>
          </div>
          <div className="text-lg font-black font-mono text-amber-400">
            ₪{value?.subtotal || 0}
          </div>
        </div>
      )}
    </div>
  );
};

interface CouponCodeStepViewProps {
  step: FormStep;
  form?: SmartFormDefinition;
  value?: AppliedCouponAnswer;
  onChange: (val: AppliedCouponAnswer | undefined) => void;
  allAnswers?: Record<string, any>;
}

export const CouponCodeStepView: React.FC<CouponCodeStepViewProps> = ({
  step,
  form,
  value,
  onChange,
  allAnswers,
}) => {
  const [codeInput, setCodeInput] = useState<string>(value?.code || '');
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = resolveOrderSubtotal(allAnswers, 0);
  const availableCoupons = useMemo(() => {
    const fromForm = getAvailableCoupons(form);
    if (fromForm.length > 0) return fromForm;
    return step.coupons || [];
  }, [form, step.coupons]);

  const handleApply = () => {
    const outcome = validateAndApplyCoupon(codeInput, availableCoupons, subtotal);
    if (!outcome.valid || !outcome.result) {
      setCouponError(outcome.error || 'קוד קופון לא תקין');
      return;
    }
    setCouponError(null);
    onChange(outcome.result);
  };

  const handleClear = () => {
    setCodeInput('');
    setCouponError(null);
    onChange(undefined);
  };

  return (
    <div className="w-full max-w-xl space-y-4 text-right" dir="rtl">
      {/* Pre-discount Summary */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-sm text-slate-200">
        <span>סכום הזמנה לפני הנחה:</span>
        <span className="font-mono font-black text-base text-white">₪{subtotal}</span>
      </div>

      {/* Coupon Input Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            dir="ltr"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value.toUpperCase());
              setCouponError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
            placeholder={step.placeholder || 'הזן קוד קופון (למשל VIP20)'}
            className="w-full pr-10 pl-4 py-3.5 text-base font-mono font-bold uppercase bg-white/95 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-2xl text-slate-900 dark:text-white outline-none text-left"
          />
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm transition-colors shadow-md shrink-0"
        >
          החל קופון
        </button>
      </div>

      {couponError && (
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-950/50 border border-rose-800/70 px-4 py-2.5 rounded-xl">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{couponError}</span>
        </div>
      )}

      {value && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>קוד קופון {value.code} הופעל בהצלחה!</span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-300 hover:text-white underline"
            >
              הסר קופון
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/20">
            <span>
              הנחה (
              {value.discountType === 'percent'
                ? `${value.discountValue}%`
                : `₪${value.discountValue}`}
              ):
            </span>
            <span className="font-mono font-bold text-emerald-300">
              -₪{value.discountAmount}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-black">
            <span>סכום סופי לתשלום:</span>
            <span className="font-mono text-base text-amber-300 flex items-center gap-1">
              {value.isFree ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>₪0 (חינם - 100% הנחה)</span>
                </>
              ) : (
                `₪${value.finalAmount}`
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
