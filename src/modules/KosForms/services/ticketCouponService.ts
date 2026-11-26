import { doc, runTransaction, Firestore } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import {
  AppliedCouponAnswer,
  CouponDefinition,
  FormStep,
  SmartFormDefinition,
  TicketBookingAnswer,
} from '../types';
import { DEFAULT_FORMS_COLLECTION } from '../config/constants';
import { evaluateFormula } from '../utils/formulaEvaluator';

export interface CouponValidationOutcome {
  valid: boolean;
  error?: string;
  result?: AppliedCouponAnswer;
}

/**
 * Collect all coupon definitions configured on the form or on its coupon_code steps
 */
export function getAvailableCoupons(form?: SmartFormDefinition | null): CouponDefinition[] {
  if (!form) return [];
  const map = new Map<string, CouponDefinition>();
  for (const c of form.coupons || []) {
    if (c?.code) map.set(c.code.trim().toUpperCase(), c);
  }
  for (const step of form.steps || []) {
    if (step.fieldType === 'coupon_code' && Array.isArray(step.coupons)) {
      for (const c of step.coupons) {
        if (c?.code) map.set(c.code.trim().toUpperCase(), c);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Parse a numeric amount from a raw form answer (number, numeric string, or choice label/value).
 */
function parseNumericAmount(raw: any, sourceStep?: FormStep): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw >= 0 ? raw : null;
  }
  const str = String(raw).trim();
  const direct = Number(str.replace(/[₪,\s]/g, ''));
  if (Number.isFinite(direct) && direct >= 0 && str !== '') {
    return direct;
  }
  // If it's a choice field, check if the matching option label/value contains a number
  if (sourceStep?.options?.length) {
    const opt = sourceStep.options.find(
      (o) => o.value === str || o.label === str || o.id === str
    );
    if (opt) {
      const optValNum = Number(String(opt.value).replace(/[₪,\s]/g, ''));
      if (Number.isFinite(optValNum) && optValNum >= 0 && opt.value !== '') {
        return optValNum;
      }
      const match = opt.label.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const parsed = Number(match[1]);
        if (Number.isFinite(parsed) && parsed >= 0) return parsed;
      }
    }
  }
  const fallbackMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (fallbackMatch) {
    const parsed = Number(fallbackMatch[1]);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

/**
 * Resolve the pre-discount order subtotal from form answers
 */
export function resolveOrderSubtotal(
  allAnswers?: Record<string, any>,
  fallbackAmount = 0,
  paymentStep?: FormStep,
  allSteps?: FormStep[]
): number {
  if (!allAnswers) return fallbackAmount;

  // 1. Explicit price field configured on the payment step
  if (paymentStep?.paymentAmountSource === 'field' && paymentStep.paymentAmountFieldKey) {
    const fieldKey = paymentStep.paymentAmountFieldKey;
    const rawFromField = allAnswers[fieldKey];
    if (isTicketBookingAnswer(rawFromField)) {
      return rawFromField.subtotal;
    }
    const sourceStep = allSteps?.find((s) => (s.mappingKey || s.id) === fieldKey || s.id === fieldKey);
    if (sourceStep?.fieldType === 'calculated') {
      return Math.max(0, evaluateFormula(sourceStep.calcFormula, allAnswers, allSteps));
    }
    const parsed = parseNumericAmount(rawFromField, sourceStep);
    if (parsed !== null) {
      return parsed;
    }
    if (sourceStep?.fieldType === 'price' && sourceStep.defaultValue !== undefined) {
      const defNum = Number(sourceStep.defaultValue);
      if (Number.isFinite(defNum) && defNum >= 0) return defNum;
    }
    return fallbackAmount;
  }

  const ticketAnswer = findTicketBookingAnswer(allAnswers);
  if (ticketAnswer && typeof ticketAnswer.subtotal === 'number') {
    return ticketAnswer.subtotal;
  }

  // 2. Auto-detect a calculated step marked as isPriceField or a standalone price step
  const autoPriceCalc = allSteps?.find((s) => s.fieldType === 'calculated' && s.isPriceField);
  if (autoPriceCalc) {
    return Math.max(0, evaluateFormula(autoPriceCalc.calcFormula, allAnswers, allSteps));
  }
  const autoPriceStep = allSteps?.find((s) => s.fieldType === 'price');
  if (autoPriceStep) {
    const pKey = autoPriceStep.mappingKey || autoPriceStep.id;
    const pRaw = allAnswers[pKey] ?? autoPriceStep.defaultValue;
    const pNum = parseNumericAmount(pRaw, autoPriceStep);
    if (pNum !== null) return pNum;
  }

  const raw =
    allAnswers.payment_amount ??
    allAnswers.donation_amount ??
    allAnswers.amount ??
    fallbackAmount;
  const num = Number(raw);
  return Number.isFinite(num) && num >= 0 ? num : fallbackAmount;
}

const RECURRING_KEYWORDS = [
  'recurring',
  'recurring_monthly',
  'standing_order',
  'keva',
  'hk',
  'הוראת קבע',
  'הו"ק',
  'חודשי',
  'מנוי',
];

/**
 * Resolve whether the payment step should execute as a recurring standing order (הוראת קבע)
 * or a one-time payment (תשלום חד-פעמי).
 */
export function resolvePaymentIsRecurring(
  allAnswers?: Record<string, any>,
  paymentStep?: FormStep,
  allSteps?: FormStep[]
): boolean {
  if (paymentStep?.paymentFrequencyMode === 'recurring') {
    return true;
  }
  if (paymentStep?.paymentFrequencyMode === 'one_time') {
    return false;
  }
  if (paymentStep?.paymentFrequencyMode === 'from_field' && paymentStep.paymentFrequencyFieldKey) {
    const fieldKey = paymentStep.paymentFrequencyFieldKey;
    const rawVal = allAnswers?.[fieldKey];
    if (rawVal === undefined || rawVal === null || rawVal === '') {
      return false;
    }
    if (rawVal === true) return true;

    const strVal = String(rawVal).trim().toLowerCase();
    const sourceStep = allSteps?.find((s) => (s.mappingKey || s.id) === fieldKey || s.id === fieldKey);
    const matchedOpt = sourceStep?.options?.find(
      (o) => o.value === rawVal || o.label === rawVal || o.id === rawVal
    );
    const optLabel = matchedOpt?.label?.trim().toLowerCase() || '';

    if (paymentStep.paymentRecurringMatchValue) {
      const target = paymentStep.paymentRecurringMatchValue.trim().toLowerCase();
      return strVal === target || optLabel === target || matchedOpt?.value?.trim().toLowerCase() === target;
    }

    return RECURRING_KEYWORDS.some((kw) => strVal.includes(kw) || optLabel.includes(kw));
  }

  // Legacy fallback
  return (
    allAnswers?.donation_type === 'recurring_monthly' ||
    allAnswers?.is_recurring === true
  );
}

/**
 * Find the TicketBookingAnswer regardless of custom mappingKey
 */
export function findTicketBookingAnswer(
  allAnswers?: Record<string, any>
): TicketBookingAnswer | null {
  if (!allAnswers) return null;
  if (isTicketBookingAnswer(allAnswers.ticket_booking)) {
    return allAnswers.ticket_booking;
  }
  for (const val of Object.values(allAnswers)) {
    if (isTicketBookingAnswer(val)) return val;
  }
  return null;
}

/**
 * Find the AppliedCouponAnswer regardless of custom mappingKey
 */
export function findAppliedCouponAnswer(
  allAnswers?: Record<string, any>
): AppliedCouponAnswer | null {
  if (!allAnswers) return null;
  if (isAppliedCouponAnswer(allAnswers.coupon_code)) {
    return allAnswers.coupon_code;
  }
  for (const val of Object.values(allAnswers)) {
    if (isAppliedCouponAnswer(val)) return val;
  }
  return null;
}

function isTicketBookingAnswer(val: any): val is TicketBookingAnswer {
  return (
    Boolean(val) &&
    typeof val === 'object' &&
    Array.isArray(val.items) &&
    typeof val.subtotal === 'number' &&
    typeof val.totalQuantity === 'number'
  );
}

function isAppliedCouponAnswer(val: any): val is AppliedCouponAnswer {
  return (
    Boolean(val) &&
    typeof val === 'object' &&
    typeof val.code === 'string' &&
    typeof val.finalAmount === 'number' &&
    typeof val.discountAmount === 'number'
  );
}

/**
 * Validate a coupon code and compute discount + final amount
 */
export function validateAndApplyCoupon(
  rawCode: string,
  coupons: CouponDefinition[],
  subtotal: number,
  now: Date = new Date()
): CouponValidationOutcome {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, error: 'נא להזין קוד קופון' };
  }

  const coupon = coupons.find((c) => c.code.trim().toUpperCase() === normalized);
  if (!coupon) {
    return { valid: false, error: 'קוד הקופון שהוזן אינו קיים במערכת' };
  }

  if (coupon.active === false) {
    return { valid: false, error: 'קוד קופון זה אינו פעיל כרגע' };
  }

  const todayStr = now.toISOString().slice(0, 10);
  if (coupon.validFrom) {
    const fromStr = coupon.validFrom.slice(0, 10);
    if (todayStr < fromStr) {
      return { valid: false, error: `קוד הקופון יהיה בתוקף החל מתאריך ${fromStr}` };
    }
  }
  if (coupon.validUntil) {
    const untilStr = coupon.validUntil.slice(0, 10);
    if (todayStr > untilStr) {
      return { valid: false, error: 'פג תוקפו של קוד הקופון' };
    }
  }

  if (
    typeof coupon.maxUses === 'number' &&
    coupon.maxUses > 0 &&
    (coupon.usedCount || 0) >= coupon.maxUses
  ) {
    return { valid: false, error: 'קוד הקופון הגיע למכסת המימושים המקסימלית' };
  }

  if (
    typeof coupon.minOrderAmount === 'number' &&
    coupon.minOrderAmount > 0 &&
    subtotal < coupon.minOrderAmount
  ) {
    return {
      valid: false,
      error: `קוד הקופון תקף להזמנות מעל ${coupon.minOrderAmount} ₪`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    const pct = Math.max(0, Math.min(100, Number(coupon.discountValue) || 0));
    discountAmount = Math.round(((subtotal * pct) / 100) * 100) / 100;
  } else {
    const fixed = Math.max(0, Number(coupon.discountValue) || 0);
    discountAmount = Math.min(subtotal, fixed);
  }

  const finalAmount = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const isFree = finalAmount === 0;

  return {
    valid: true,
    result: {
      code: coupon.code.trim().toUpperCase(),
      couponId: coupon.id,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalAmount: subtotal,
      finalAmount,
      isFree,
    },
  };
}

/**
 * Resolve final payable amount considering ticket booking and applied coupon
 */
export function resolveFinalPaymentAmount(
  allAnswers?: Record<string, any>,
  fallbackAmount = 100,
  paymentStep?: FormStep,
  allSteps?: FormStep[]
): {
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  isFreeByCoupon: boolean;
  appliedCoupon: AppliedCouponAnswer | null;
  ticketBooking: TicketBookingAnswer | null;
} {
  const ticketBooking = findTicketBookingAnswer(allAnswers);
  const appliedCoupon = findAppliedCouponAnswer(allAnswers);
  const subtotal = resolveOrderSubtotal(allAnswers, fallbackAmount, paymentStep, allSteps);

  if (appliedCoupon) {
    // Re-compute against current subtotal in case user went back and changed tickets
    let discountAmount = appliedCoupon.discountAmount;
    if (appliedCoupon.discountType === 'percent') {
      const pct = Math.max(0, Math.min(100, Number(appliedCoupon.discountValue) || 0));
      discountAmount = Math.round(((subtotal * pct) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(subtotal, Math.max(0, Number(appliedCoupon.discountValue) || 0));
    }
    const finalAmount = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    return {
      subtotal,
      discountAmount,
      finalAmount,
      isFreeByCoupon: finalAmount === 0,
      appliedCoupon: {
        ...appliedCoupon,
        originalAmount: subtotal,
        discountAmount,
        finalAmount,
        isFree: finalAmount === 0,
      },
      ticketBooking,
    };
  }

  return {
    subtotal,
    discountAmount: 0,
    finalAmount: subtotal,
    isFreeByCoupon: false,
    appliedCoupon: null,
    ticketBooking,
  };
}

/**
 * Generate a unique ticket order code and individual ticket codes
 */
export function generateTicketOrderCodes(quantity: number): {
  orderCode: string;
  ticketCodes: string[];
} {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderCode = `TKT-${rand}`;
  const count = Math.max(1, quantity);
  const ticketCodes = Array.from({ length: count }, (_, idx) => `${orderCode}-${idx + 1}`);
  return { orderCode, ticketCodes };
}

/**
 * Atomically check and increment soldCount on ticket tiers and usedCount on applied coupon in Firestore
 */
export async function commitTicketAndCouponUsage(
  formId: string,
  ticketBooking: TicketBookingAnswer | null,
  appliedCoupon: AppliedCouponAnswer | null,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
): Promise<void> {
  if (!ticketBooking && !appliedCoupon) return;

  const targetDb = customFirestore || db;
  if (!targetDb) return;

  const formRef = doc(targetDb, collectionName, formId);

  await runTransaction(targetDb, async (tx) => {
    const snap = await tx.get(formRef);
    if (!snap.exists()) return;

    const formData = snap.data() as SmartFormDefinition;
    let modified = false;

    const updatedSteps = (formData.steps || []).map((step) => {
      let nextStep = { ...step };

      // 1. Update ticket tiers soldCount atomically
      if (
        ticketBooking &&
        step.fieldType === 'ticket_booking' &&
        Array.isArray(step.ticketTiers)
      ) {
        nextStep.ticketTiers = step.ticketTiers.map((tier) => {
          const item = ticketBooking.items.find((i) => i.tierId === tier.id);
          if (!item || item.quantity <= 0) return tier;

          const currentSold = tier.soldCount || 0;
          if (typeof tier.capacity === 'number' && tier.capacity > 0) {
            const remaining = tier.capacity - currentSold;
            if (item.quantity > remaining) {
              throw new Error(
                `המלאי עבור כרטיס "${tier.name}" אינו מספיק (נותרו ${Math.max(0, remaining)} כרטיסים)`
              );
            }
          }

          modified = true;
          return {
            ...tier,
            soldCount: currentSold + item.quantity,
          };
        });
      }

      // 2. Update step-level coupon usedCount atomically
      if (
        appliedCoupon &&
        step.fieldType === 'coupon_code' &&
        Array.isArray(step.coupons)
      ) {
        nextStep.coupons = step.coupons.map((c) => {
          if (c.code.trim().toUpperCase() !== appliedCoupon.code.trim().toUpperCase()) {
            return c;
          }
          const currentUsed = c.usedCount || 0;
          if (typeof c.maxUses === 'number' && c.maxUses > 0 && currentUsed >= c.maxUses) {
            throw new Error(`קוד הקופון "${c.code}" הגיע למכסת המימושים המקסימלית`);
          }
          modified = true;
          return {
            ...c,
            usedCount: currentUsed + 1,
          };
        });
      }

      return nextStep;
    });

    // 3. Update form-level coupon usedCount if present
    let updatedFormCoupons = formData.coupons;
    if (appliedCoupon && Array.isArray(formData.coupons)) {
      updatedFormCoupons = formData.coupons.map((c) => {
        if (c.code.trim().toUpperCase() !== appliedCoupon.code.trim().toUpperCase()) {
          return c;
        }
        const currentUsed = c.usedCount || 0;
        if (typeof c.maxUses === 'number' && c.maxUses > 0 && currentUsed >= c.maxUses) {
          throw new Error(`קוד הקופון "${c.code}" הגיע למכסת המימושים המקסימלית`);
        }
        modified = true;
        return {
          ...c,
          usedCount: currentUsed + 1,
        };
      });
    }

    if (modified) {
      const updatePayload: Record<string, any> = {
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };
      if (updatedFormCoupons !== undefined) {
        updatePayload.coupons = updatedFormCoupons;
      }
      tx.update(formRef, updatePayload);
    }
  });
}
