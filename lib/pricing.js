/**
 * lib/pricing.js
 *
 * SINGLE SOURCE OF TRUTH for all Bondhon wedding-card pricing.
 *
 * Fix for audit finding A10 / plan item P2-1: before this file existed,
 * the same numbers (55/45/35 taka per piece for Affordable, 65/55/45 for
 * Premium, etc.) were hardcoded independently in at least six places
 * across messenger.js (getCategoryPrice, getLowQtyPrice, getFullPriceTable,
 * evaluateBargain, the Gemini system prompt string, and the hardcoded
 * "both categories" reply). If the owner ever changes a price, every one
 * of those had to be found and edited correctly, or different customers
 * would see different prices depending on which code branch answered them.
 *
 * From now on: change a price ONLY here. Every consumer (deterministic
 * reply text, the bargaining evaluator, and the AI system prompt used by
 * generateAISalesResponse) reads from this file, so a price change takes
 * effect everywhere automatically.
 *
 * IMPORTANT (STEP 26 / ABSOLUTE RULE #4): this module is deterministic,
 * plain arithmetic. Gemini/AI never invents or overrides a price — the AI
 * layer only ever receives pre-computed numbers (via buildPricingBlurb())
 * to talk about in natural language; it cannot change what a customer is
 * actually charged.
 */

import { bngDigits } from './bangla-digits.js';

// ===== CORE RATE TABLE (the ONE place prices live) =====
// perPiece rates by category and quantity tier.
export const PRICING = {
  affordable: {
    label: '💚 সাশ্রয়ী (Affordable)',
    tiers: [
      { minQty: 200, perPiece: 35 },
      { minQty: 100, perPiece: 45 },
      { minQty: 50, perPiece: 55 },
    ],
    // Fixed-price bands for very small orders (< 50 pcs)
    lowQty: [
      { maxQty: 5, total: 1000, note: 'কম পরিমাণে ফিক্সড ডাইস ও মেকিং চার্জ সহ' },
      { maxQty: 10, total: 1500, note: 'ফিক্সড চার্জ' },
      { maxQty: 49, perPiece: 75, note: null },
    ],
  },
  premium: {
    label: '✨ প্রিমিয়াম (Premium)',
    tiers: [
      { minQty: 200, perPiece: 45 },
      { minQty: 100, perPiece: 55 },
      { minQty: 50, perPiece: 65 },
    ],
    lowQty: [
      { maxQty: 5, total: 1000, note: 'কম পরিমাণে ফিক্সড ডাইস ও মেকিং চার্জ সহ' },
      { maxQty: 10, total: 1500, note: 'ফিক্সড চার্জ' },
      { maxQty: 49, perPiece: 75, note: null },
    ],
  },
};

// Reference totals at the standard checkpoints — used for display tables
// and derived automatically from PRICING.tiers so they can never drift.
export const REFERENCE_QTYS = [50, 100, 200];

// Bargain/discount policy: how much a customer-requested discount can be
// automatically honored without a human, per the owner's own standing
// instruction ("50/100 taka off is pre-authorized").
export const BARGAIN_MAX_CONCESSION = 150; // taka
export const BARGAIN_ADVANCE_PCT = 0.3;

function normalizeCategory(category) {
  return category === 'premium' ? 'premium' : 'affordable';
}

/** Per-piece rate for a given category + quantity (>=50). */
export function getPerPieceRate(qty, category) {
  const cat = PRICING[normalizeCategory(category)];
  const tier = cat.tiers.find(t => qty >= t.minQty) || cat.tiers[cat.tiers.length - 1];
  return tier.perPiece;
}

/** Total price for qty >= 50. */
export function getTotalPrice(qty, category) {
  return qty * getPerPieceRate(qty, category);
}

/** Total price for qty < 50 (fixed-band / per-piece-75 pricing). */
export function getLowQtyTotal(qty, category) {
  const cat = PRICING[normalizeCategory(category)];
  for (const band of cat.lowQty) {
    if (qty <= band.maxQty) {
      return band.total != null ? band.total : qty * band.perPiece;
    }
  }
  // Fallback (shouldn't happen for qty<50 given bands cover 1-49)
  const last = cat.lowQty[cat.lowQty.length - 1];
  return last.total != null ? last.total : qty * last.perPiece;
}

/**
 * Total price for ANY quantity (dispatches to the >=50 tier pricing or the
 * <50 fixed-band pricing as appropriate). Use this — not getTotalPrice
 * directly — anywhere a real customer order's total/advance is being
 * computed, since the bot explicitly tells customers "১-৪৯ পিস অল্প
 * পরিমাণেও নিতে পারবেন!" (1-49 piece orders are a real, supported case,
 * not an edge case to special-case away as 0/null).
 */
export function getOrderTotal(qty, category) {
  if (!qty || qty <= 0) return 0;
  return qty >= 50 ? getTotalPrice(qty, category) : getLowQtyTotal(qty, category);
}

/** Effective per-piece rate for ANY quantity, for display purposes (total / qty, rounded). */
export function getOrderPerPiece(qty, category) {
  if (!qty || qty <= 0) return 0;
  if (qty >= 50) return getPerPieceRate(qty, category);
  return Math.round(getOrderTotal(qty, category) / qty);
}

/** 30% advance, rounded to the nearest 10 taka (matches existing behavior). */
export function getAdvanceAmount(total) {
  return Math.round((total * BARGAIN_ADVANCE_PCT) / 10) * 10;
}

/** Reference price table object for the 50/100/200 checkpoints. */
export function getReferenceTable(category) {
  return REFERENCE_QTYS.map(qty => ({
    qty,
    total: getTotalPrice(qty, category),
    perPiece: getPerPieceRate(qty, category),
  }));
}

/**
 * Build a short, human-readable pricing summary block for a category.
 * Used both in deterministic bot replies AND fed into the Gemini system
 * prompt (generateAISalesResponse) so the AI never has to "remember" or
 * invent numbers — it only ever talks about numbers computed here.
 */
export function buildPriceTableText(category, fmt = bngDigits) {
  const cat = PRICING[normalizeCategory(category)];
  const lines = getReferenceTable(category)
    .map(r => `• ${fmt(r.qty)} পিস: ${fmt(r.total.toLocaleString('en-IN'))}৳ (${fmt(r.perPiece)}৳/পিস)`)
    .join('\n');
  return `${cat.label} কালেকশনের রেট:\n${lines}`;
}

export function buildBothCategoriesPriceText(fmt = bngDigits) {
  return (
    `আমাদের বিয়ের কার্ডের দামের তালিকা: 🌸\n\n` +
    `${buildPriceTableText('affordable', fmt)}\n\n` +
    `${buildPriceTableText('premium', fmt)}\n\n` +
    `(১-৪৯ পিস অল্প পরিমাণেও নিতে পারবেন!)`
  );
}

/** Full plain-language pricing blurb for the Gemini system prompt. */
export function buildPricingBlurbForAI(fmt = bngDigits) {
  return [
    `১. ${PRICING.affordable.label} — সাধারণ আর্ট কার্ড/ছোট সাইজের কার্ড:`,
    ...getReferenceTable('affordable').map(r => `   • ${fmt(r.qty)} পিস: ${fmt(r.total.toLocaleString('en-IN'))}৳ (${fmt(r.perPiece)}৳/পিস)`),
    `২. ${PRICING.premium.label} — বড় সাইজ, খিলান, ফয়েল, লেজার কাট, বক্স বা লাক্সারি কার্ড:`,
    ...getReferenceTable('premium').map(r => `   • ${fmt(r.qty)} পিস: ${fmt(r.total.toLocaleString('en-IN'))}৳ (${fmt(r.perPiece)}৳/পিস)`),
    `৩. অল্প পরিমাণ (১-৪৯ পিস): ১-৫ পিস ১,০০০৳, ৬-১০ পিস ১,৫০০৳, ১১-৪৯ পিস ৭৫৳/পিস।`,
  ].join('\n');
}

/** Low-quantity (<50 pcs) price message, matching the original wording. */
export function buildLowQtyPriceText(qty, category, fmt = bngDigits) {
  const cat = PRICING[normalizeCategory(category)];
  const total = getLowQtyTotal(qty, category);
  let rateMsg;
  if (qty <= 5) {
    rateMsg = `${fmt(qty)} পিসের সর্বমোট দাম: ${fmt(total.toLocaleString('en-IN'))}৳ (কম পরিমাণে ফিক্সড ডাইস ও মেকিং চার্জ সহ)`;
  } else if (qty <= 10) {
    rateMsg = `${fmt(qty)} পিসের সর্বমোট দাম: ${fmt(total.toLocaleString('en-IN'))}৳ (ফিক্সড চার্জ)`;
  } else {
    rateMsg = `${fmt(qty)} পিসের দাম: ${fmt(total.toLocaleString('en-IN'))}৳ (পিস প্রতি ৭৫৳)`;
  }
  return `📦 ${fmt(qty)} পিস কার্ডের দামের হিসাব:\n\n${rateMsg}\n\n💡 পরামর্শ: ৫০ পিস বা তার বেশি অর্ডার করলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
}

/** Standard category price message for qty >= 50, matching original wording. */
export function buildCategoryPriceText(qty, category, fmt = bngDigits) {
  const cat = PRICING[normalizeCategory(category)];
  const perPiece = getPerPieceRate(qty, category);
  const total = getTotalPrice(qty, category);
  return `${cat.label} কালেকশন:\n${fmt(qty)} পিসের দাম: ${fmt(total.toLocaleString('en-IN'))}৳ (পিস প্রতি ${fmt(perPiece)}৳)`;
}

// ===== BARGAIN / DISCOUNT EVALUATION =====
// Ported from the original messenger.js evaluateBargain(), unchanged in
// behavior, but now sourcing "base price" from the single PRICING table
// above instead of a second hardcoded copy (was previously a fourth
// independent hardcoding of these numbers — see A10).
//
// STEP 26 / ABSOLUTE RULE #4: this is plain deterministic logic. It does
// not call any AI. The Gemini layer is never allowed to grant a discount
// or invent a price on its own — only this function can, and only within
// the owner's pre-authorized band (BARGAIN_MAX_CONCESSION).
import { normalizeBengaliDigits } from './bangla-digits.js';

function getBasePriceForBargain(qty, category) {
  if (qty >= 50) return getTotalPrice(qty, category);
  return getLowQtyTotal(qty, category);
}

/**
 * Evaluate a free-text customer message for a bargain/discount request.
 * Returns null if the message isn't a recognizable bargain, or an object
 * describing the accepted deal if it is (within the pre-authorized band).
 */
export function evaluateBargain(rawText, category = 'affordable') {
  if (!rawText) return null;
  const norm = normalizeBengaliDigits(rawText).toLowerCase().replace(/,/g, '');

  const isBargainIntent = /(?:raikhen|rakhen|rakhben|rakhle|রাখেন|রাইখেন|রাখবেন|diben|দিবেন|দেন|den|কম|kom|ছাড়|char|chaar|discount|কমান|koman|nibo|নেব|নেবো|নিবো|নেওয়ার|নেয়ার|কম\s*হবে|kom\s*hobe)/i.test(norm);
  if (!isBargainIntent) return null;

  const numbers = (norm.match(/\d+/g) || []).map(Number);
  if (numbers.length === 0) return null;

  let qty = null;
  const qtyMatch = norm.match(/(\d{2,4})\s*(?:pcs?|piece|পিস|পিসি|পিচ|টি|টা)?/i);
  if (qtyMatch) {
    const qCandidate = parseInt(qtyMatch[1], 10);
    if ([50, 100, 150, 200, 250, 300, 400, 500].includes(qCandidate)) {
      qty = qCandidate;
    }
  }

  let offeredPrice = null;
  for (const n of numbers) {
    if (n >= 1000 && n <= 50000 && n !== qty) {
      offeredPrice = n;
      break;
    }
  }

  const direct50or100Match = norm.match(/(?:50|100)\s*(?:টাকা|tk|taka)?\s*(?:কম|kom|ছাড়|char|chaar|discount|কমান|koman|কমিয়ে)/i) ||
                             norm.match(/(?:কম|kom|ছাড়|char|chaar|discount|কমান|koman)\s*(?:হবে\s*)?(?:50|100)/i);
  let directDiscount = null;
  if (direct50or100Match) {
    directDiscount = direct50or100Match[0].includes('100') ? 100 : 50;
  }

  if (!qty) qty = 50;

  const basePrice = getBasePriceForBargain(qty, category);

  let finalAcceptedPrice = null;
  let discountAmount = 0;

  if (offeredPrice) {
    const diff = basePrice - offeredPrice;
    if (diff > 0 && diff <= BARGAIN_MAX_CONCESSION) {
      finalAcceptedPrice = offeredPrice;
      discountAmount = diff;
    } else if (diff === 0) {
      finalAcceptedPrice = basePrice;
      discountAmount = 0;
    }
  } else if (directDiscount) {
    discountAmount = directDiscount;
    finalAcceptedPrice = basePrice - discountAmount;
  }

  if (finalAcceptedPrice) {
    return {
      accepted: true,
      qty,
      category: normalizeCategory(category),
      basePrice,
      finalPrice: finalAcceptedPrice,
      discountAmount,
      advance30: getAdvanceAmount(finalAcceptedPrice),
    };
  }

  return null;
}
