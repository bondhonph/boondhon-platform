/**
 * lib/order-parser.js
 *
 * NEW module (audit plan items P0-4, P0-5, P1-1, P1-2, P2-2).
 *
 * All functions here are PURE and DETERMINISTIC (regex/heuristic based,
 * no network calls, no AI). Per STEP 26 / ABSOLUTE RULE #4 of the fix
 * plan: Gemini/AI is allowed to help with natural-language understanding
 * and reply generation, but it must never be the thing that decides a
 * price, a quantity, or an order's state — that has to stay deterministic
 * and testable offline. This file is that deterministic layer.
 *
 * Every function is independently unit-tested (see /tests) against the
 * exact example phrases from the fix-plan brief, without needing any
 * Facebook/Gemini credentials.
 */

import { normalizeBengaliDigits } from './bangla-digits.js';

// ============================================================
// UNICODE-SAFE WORD BOUNDARIES
// ============================================================
//
// CORRECTION discovered while testing this file (also true of the
// ORIGINAL messenger.js, which uses the exact same broken pattern in
// several places — see audit correction note in the delivery report):
// JavaScript's `\b` is defined purely via `\w` = [A-Za-z0-9_]. Bengali
// script characters are never `\w`, so `\b` NEVER matches immediately
// next to Bengali text. A pattern like /\bপিস\b/ can never match the
// literal word "পিস" anywhere, in any string — verified directly:
//   /\bপিস\b/.test('পিস')       -> false
//   /\bপিস\b/.test(' পিস ')     -> false
// This silently broke quantity detection for EVERY Bengali-unit
// quantity phrase in the original bot ("৫০ পিস", "১০০ পিস", "৫০ পিস
// লাগবে" all failed to extract a quantity — only a bare number with
// nothing else around it, like a message that is just "৫০", worked).
//
// Fix: use explicit separator-based boundaries instead of `\b`. Chat
// messages are naturally delimited by whitespace/punctuation/string
// edges, which is what we actually want here, and it's script-agnostic.
const SEP = ' \\t\\n,.!?।;:()\\-';
const LB = `(?:^|[${SEP}])`; // left boundary: start of string or a separator
const RB = `(?=[${SEP}]|$)`; // right boundary: a separator, or end of string

// ============================================================
// QUANTITY EXTRACTION
// ============================================================

// Bangla number-words for the quantities customers actually order in.
// (Extends the original digit-only detection — audit finding: "একশটা",
// "দুইশো পিস" etc. were never understood before.) Classifier suffixes
// (টা/টি) are frequently glued directly onto the number word with NO
// space ("একশ"+"টা"="একশটা"), so they're folded in as an optional,
// un-separated suffix rather than requiring a boundary before them.
const BANGLA_QTY_WORDS = [
  [`${LB}(?:আড়াইশো|আড়াই\\s*শ|আড়াইশ)(?:টা|টি)?${RB}`, 250],
  [`${LB}(?:দেড়শো|দেড়\\s*শ|দেড়শ)(?:টা|টি)?${RB}`, 150],
  [`${LB}(?:দুইশো|দুই\\s*শো|দুইশ|দুই\\s*শ|দুশো|দুশ)(?:টা|টি)?${RB}`, 200],
  [`${LB}(?:তিনশো|তিন\\s*শো|তিনশ|তিন\\s*শ)(?:টা|টি)?${RB}`, 300],
  [`${LB}(?:চারশো|চার\\s*শো|চারশ|চার\\s*শ)(?:টা|টি)?${RB}`, 400],
  [`${LB}(?:পাঁচশো|পাঁচ\\s*শো|পাঁচশ|পাঁচ\\s*শ)(?:টা|টি)?${RB}`, 500],
  [`${LB}(?:একশো|এক\\s*শো|একশ|এক\\s*শ)(?:টা|টি)?${RB}`, 100],
  [`${LB}(?:পঞ্চাশ)(?:টা|টি)?${RB}`, 50],
  [`${LB}(?:এক\\s*হাজার|হাজার)(?:টা|টি)?${RB}`, 1000],
].map(([pattern, val]) => [new RegExp(pattern, 'i'), val]);

const STANDARD_QTYS = [50, 60, 70, 75, 80, 100, 120, 150, 200, 250, 300, 350, 400, 500, 600, 700, 750, 800, 900, 1000, 1500, 2000];

export function isStandardCardQty(num) {
  if (!num || num < 50) return false;
  return STANDARD_QTYS.includes(num);
}

const QTY_UNIT_WORDS = 'pcs?|piece|পিস|পিসি|পিচ|টি|টা|কপি|copy|copies';
const QTY_UNIT = new RegExp(`${LB}(?:${QTY_UNIT_WORDS})${RB}`, 'i');
// Digit directly followed by an (optionally space-separated) unit word.
const EXPLICIT_QTY_RE = new RegExp(`${LB}(\\d{1,5})\\s*(${QTY_UNIT_WORDS})${RB}`, 'i');

/**
 * Extract a quantity from free text. Handles:
 *  - digits + unit word ("৫০ পিস", "50 pcs", "২০০টা") — FIXED, see boundary
 *    note above; this never worked for Bengali units in the original bot.
 *  - Bangla number-words ("একশটা", "দুইশো পিস", "পঞ্চাশ পিস")
 *  - bare standard-quantity digits with no unit word ("৫০")
 * Returns { qty, hasUnit } or null.
 */
export function extractQuantity(text) {
  if (!text) return null;
  const norm = normalizeBengaliDigits(text).toLowerCase();

  // 1) Bangla number-words (checked first since "১০০" bare-digit path
  //    below wouldn't catch "একশ")
  for (const [re, val] of BANGLA_QTY_WORDS) {
    if (re.test(norm)) {
      return { qty: val, hasUnit: true, source: 'word' };
    }
  }

  // 2) digit + explicit unit word
  const explicitMatch = norm.match(EXPLICIT_QTY_RE);
  if (explicitMatch) {
    const num = parseInt(explicitMatch[1], 10);
    // BUG FIX: "টা" is a generic Bengali counter suffix used for BOTH card
    // quantities ("৫০টা কার্ড") AND clock time ("রাত ৮টা" = "8 o'clock at
    // night"). Without this check, a message that only mentions a time
    // (e.g. answering the wedding-time question with "রাত ৮টা") was
    // silently misread as a quantity of 8 and overwrote/derailed the
    // actual quantity field. Only reject this specific ambiguous case —
    // পিস/পিসি/পিচ/টি/pcs/piece/copy are never used for time, so they're
    // unaffected.
    const isAmbiguousTaaUnit = /^টা$/i.test(explicitMatch[2]) &&
      new RegExp(`(ভোর|সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|সন্ধা|রাত)\\s*${explicitMatch[1]}\\s*টা`, 'i').test(norm);
    if (!isAmbiguousTaaUnit && num > 0 && num < 10000) {
      return { qty: num, hasUnit: true, source: 'digit+unit' };
    }
  }

  // 3) bare digits alone (only trust if the whole message is just the number,
  //    to avoid grabbing phone numbers/dates/etc out of longer sentences)
  const trimmed = norm.trim();
  const pureDigits = trimmed.match(/^(\d{1,5})$/);
  if (pureDigits) {
    const num = parseInt(pureDigits[1], 10);
    if (num > 0 && (isStandardCardQty(num) || num < 50)) {
      return { qty: num, hasUnit: false, source: 'bare-digit' };
    }
  }

  return null;
}

export function hasQuantityUnit(text) {
  return QTY_UNIT.test(normalizeBengaliDigits(text || ''));
}

// ============================================================
// WEDDING-INFO FIELD EXTRACTION
// ============================================================

const BANGLA_MONTHS = 'জানুয়ারি|জানুয়ারী|ফেব্রুয়ারি|ফেব্রুয়ারী|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|অগাস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর';
const ENGLISH_MONTHS = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec';

const DATE_PATTERNS = [
  // "২৫ ডিসেম্বর", "25 December", "25 Dec, 2026"
  // NOTE: trailing boundary after the month name uses RB, not \b — a
  // Bengali month name is never followed by an ASCII \w character in
  // practice, so \b would never fire here either (see boundary note above).
  new RegExp(`${LB}(\\d{1,2})\\s*(?:তারিখ|st|nd|rd|th)?\\s*(${BANGLA_MONTHS}|${ENGLISH_MONTHS})${RB}(?:[,\\s]*\\d{4})?`, 'i'),
  // "২৫/১২/২০২৬", "25-12-2026", "25.12.26"
  /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/,
];

/** Extract a wedding date mention from free text. Returns the raw matched string (digits normalized to Bangla) or null. */
export function extractDate(text) {
  if (!text) return null;
  const norm = normalizeBengaliDigits(text);
  for (const re of DATE_PATTERNS) {
    const m = norm.match(re);
    if (m) return m[0].trim();
  }
  return null;
}

const TIME_PATTERNS = [
  // "রাত ৮টা", "সকাল ১০টা", "বিকাল ৫টা", "সন্ধ্যা ৭টা", "দুপুর ২টা", with optional minutes
  new RegExp(`${LB}(ভোর|সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|সন্ধা|রাত)\\s*(\\d{1,2})(?:[:.]\\d{2})?\\s*টা(?:য়)?${RB}`, 'i'),
  // "8pm", "8:30 pm", "20:00"
  /\b(\d{1,2})(?:[:.]\d{2})?\s*(am|pm|AM|PM)\b/,
  /\b([01]?\d|2[0-3])[:.]\d{2}\b/,
];

export function extractTime(text) {
  if (!text) return null;
  const norm = normalizeBengaliDigits(text);
  for (const re of TIME_PATTERNS) {
    const m = norm.match(re);
    if (m) return m[0].trim();
  }
  return null;
}

const PHONE_PATTERN = /\b(?:\+?88)?0?1[3-9]\d{8}\b/;

export function extractPhone(text) {
  if (!text) return null;
  const norm = normalizeBengaliDigits(text);
  const m = norm.match(PHONE_PATTERN);
  return m ? m[0].trim() : null;
}

// Field labels as they literally appear in the business's own order-form
// template (BANGLA_ORDER_FORM_TEXT / ENGLISH_ORDER_FORM_TEXT in messenger.js).
// Extracting against these is the most reliable path, since the customer
// was told to copy this exact template.
const FORM_LABELS = {
  groomName: [/বরের\s*পূর্ণ\s*নাম\s*[:ঃ]\s*([^\n]+)/i, /groom'?s?\s*full\s*name\s*[:]\s*([^\n]+)/i],
  brideName: [/কনের\s*পূর্ণ\s*নাম\s*[:ঃ]\s*([^\n]+)/i, /bride'?s?\s*full\s*name\s*[:]\s*([^\n]+)/i],
  venue: [/স্থান\s*\/?\s*ভেন্যু\s*[:ঃ]\s*([^\n]+)/i, /venue\s*[:]\s*([^\n]+)/i],
  phone: [/(?:প্রয়োজনে\s*যোগাযোগ|সচল\s*মোবাইল\s*নম্বর|মোবাইল\s*নম্বর)\s*(?:\([^)]*\))?\s*[:ঃ]\s*([^\n]+)/i, /(?:contact\s*phone|active\s*mobile\s*number)\s*[:]\s*([^\n]+)/i],
  deliveryAddress: [/ডেলিভারির\s*পূর্ণ\s*ঠিকানা[^:ঃ]*[:ঃ]\s*([^\n]+)/i, /full\s*delivery\s*address[^:]*[:]\s*([^\n]+)/i],
};

function tryLabelExtract(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1] && m[1].trim()) return m[1].trim();
  }
  return null;
}

/**
 * Extract every wedding-info field this message contains, whether it's:
 *  - the full copy-pasted order form (label-based, most reliable), or
 *  - a single incremental field ("বর রাকিব", "কনের নাম মিম"), or
 *  - several fields in one free sentence
 *    ("বর রাকিব, কনে মিম, ২৫ ডিসেম্বর, রাত ৮টা, গুলশান কমিউনিটি সেন্টার")
 *
 * Only returns fields it actually found — never invents a value for a
 * field it didn't see (per STEP 5: "customer যা দিয়েছে শুধু সেটা save করবে").
 */
export function extractWeddingFields(rawText) {
  const text = (rawText || '').trim();
  if (!text) return {};

  const result = {};

  // 1) Label-based (full form paste) — most reliable, try first.
  for (const [field, patterns] of Object.entries(FORM_LABELS)) {
    const val = tryLabelExtract(text, patterns);
    if (val) result[field] = val;
  }

  // 2) Incremental single/multi-field free text — only look for fields
  //    not already found via labels above.
  if (!result.groomName) {
    const m = text.match(/(?:^|[,।\s])বর(?:ের\s*নাম|-?এর\s*নাম)?\s*[:ঃ]?\s*([^\n,।]+)/i) ||
              text.match(/groom(?:'?s)?\s*(?:name)?\s*[:]?\s*([^\n,]+)/i);
    if (m && m[1].trim() && !/(?:কনে|bride)/i.test(m[1])) result.groomName = m[1].trim();
  }
  if (!result.brideName) {
    const m = text.match(/(?:^|[,।\s])কনে(?:র\s*নাম)?\s*[:ঃ]?\s*([^\n,।]+)/i) ||
              text.match(/bride(?:'?s)?\s*(?:name)?\s*[:]?\s*([^\n,]+)/i);
    if (m && m[1].trim()) result.brideName = m[1].trim();
  }
  if (!result.weddingDate) {
    const d = extractDate(text);
    if (d) result.weddingDate = d;
  }
  if (!result.weddingTime) {
    const t = extractTime(text);
    if (t) result.weddingTime = t;
  }
  if (!result.phone) {
    const p = extractPhone(text);
    if (p) result.phone = p;
  }
  if (!result.venue) {
    const m = text.match(/(?:ভেন্যু|venue|স্থান)\s*[:ঃ]?\s*([^\n,।]+)/i);
    if (m && m[1].trim()) result.venue = m[1].trim();
  }
  if (!result.deliveryAddress) {
    const m = text.match(/ঠিকানা\s*[:ঃ]?\s*([^\n,।]+)/i) || text.match(/address\s*[:]?\s*([^\n,]+)/i);
    if (m && m[1].trim()) result.deliveryAddress = m[1].trim();
  }

  // 3) "One-liner with everything" heuristic: comma-separated clauses
  //    where a venue was NOT explicitly labeled — if we found a groom
  //    and/or bride name, a date, and a time from an unlabeled comma
  //    list, treat the one remaining un-classified clause as the venue.
  //    Example: "বর রাকিব, কনে মিম, ২৫ ডিসেম্বর, রাত ৮টা, গুলশান কমিউনিটি সেন্টার"
  if (!result.venue && text.includes(',')) {
    const clauses = text.split(/[,।]/).map(c => c.trim()).filter(Boolean);
    const claimed = new Set();
    // Compare with digits normalized on both sides — extractDate/extractTime
    // return their match with Bangla digits already converted to ASCII, so
    // comparing against the raw (un-normalized) clause text would otherwise
    // never match and every clause would wrongly look "unclaimed".
    const normResult = {
      groomName: result.groomName ? normalizeBengaliDigits(result.groomName) : null,
      brideName: result.brideName ? normalizeBengaliDigits(result.brideName) : null,
      weddingDate: result.weddingDate ? normalizeBengaliDigits(result.weddingDate) : null,
      weddingTime: result.weddingTime ? normalizeBengaliDigits(result.weddingTime) : null,
      phone: result.phone ? normalizeBengaliDigits(result.phone) : null,
    };
    for (const c of clauses) {
      const nc = normalizeBengaliDigits(c);
      if (normResult.groomName && nc.includes(normResult.groomName)) claimed.add(c);
      if (normResult.brideName && nc.includes(normResult.brideName)) claimed.add(c);
      if (normResult.weddingDate && nc.includes(normResult.weddingDate)) claimed.add(c);
      if (normResult.weddingTime && nc.includes(normResult.weddingTime)) claimed.add(c);
      if (normResult.phone && nc.includes(normResult.phone)) claimed.add(c);
      if (/^বর(?:\s|$)|^কনে(?:\s|$)|^groom|^bride/i.test(c)) claimed.add(c);
    }
    const leftover = clauses.filter(c => !claimed.has(c) && c.length >= 3);
    // Only accept the leftover as venue if there's exactly one candidate
    // AND at least one other field was found in this same message —
    // otherwise a lone unrelated clause (e.g. a stray "ধন্যবাদ") could be
    // wrongly captured as a venue.
    const foundOtherField = result.groomName || result.brideName || result.weddingDate || result.weddingTime;
    if (leftover.length === 1 && foundOtherField) {
      result.venue = leftover[0];
    }
  }

  return result;
}

export const WEDDING_FIELD_ORDER = ['groomName', 'brideName', 'weddingDate', 'weddingTime', 'venue', 'phone', 'deliveryAddress'];

export const WEDDING_FIELD_QUESTIONS = {
  groomName: 'বরের নামটা বলবেন? 😊',
  brideName: 'ধন্যবাদ! এবার কনের নামটা বলবেন?',
  weddingDate: 'বিয়ের তারিখটা জানাবেন? (যেমন: ২৫ ডিসেম্বর)',
  weddingTime: 'অনুষ্ঠানের সময়টা জানাবেন? (যেমন: রাত ৮টা)',
  venue: 'অনুষ্ঠানের ভেন্যু/স্থানটা বলবেন?',
  phone: 'যোগাযোগের মোবাইল নম্বরটা দিন।',
  deliveryAddress: 'কুরিয়ারের জন্য ডেলিভারির পূর্ণ ঠিকানা (থানা ও জেলাসহ) দিন।',
};

export const WEDDING_FIELD_LABELS_BN = {
  groomName: '🤵 বর',
  brideName: '👰 কনে',
  weddingDate: '📅 তারিখ',
  weddingTime: '⏰ সময়',
  venue: '📍 ভেন্যু',
  phone: '📞 যোগাযোগ',
  deliveryAddress: '🚚 ডেলিভারি ঠিকানা',
};

/** Given the fields already collected, return the name of the next missing one, or null if all present. */
export function nextMissingField(order) {
  for (const f of WEDDING_FIELD_ORDER) {
    if (!order[f]) return f;
  }
  return null;
}

/**
 * Full collection order including quantity (quantity is asked first, then
 * the wedding-info fields in WEDDING_FIELD_ORDER) — used to drive a single,
 * consistent "what do we still need?" walk instead of the wedding fields
 * and quantity being asked about independently of each other.
 */
export const ALL_ORDER_FIELDS = ['quantity', ...WEDDING_FIELD_ORDER];

/** Same as nextMissingField, but also considers quantity. Returns null once everything is present. */
export function nextMissingOrderField(order) {
  for (const f of ALL_ORDER_FIELDS) {
    if (!order[f]) return f;
  }
  return null;
}

/**
 * Guard used when we're about to accept a bare, unlabeled free-text reply
 * as the answer to whichever field we just asked about (STEP 6 — one
 * field at a time, natural replies with no keyword required). We must NOT
 * blindly swallow a message that is actually an intent (restart/handoff/
 * confirm/edit/cancel/confused), a greeting, or empty — those are handled
 * by their own higher-priority branches in messenger.js, but this is a
 * defense-in-depth check inside the parser itself in case call order ever
 * changes. Also rejects absurdly long input (almost certainly not a short
 * field answer) so it doesn't silently swallow an unrelated long message.
 */
export function isPlausibleBareFieldAnswer(text) {
  const t = (text || '').trim();
  if (!t) return false;
  if (t.length > 300) return false;
  if (
    isRestartIntent(t) || isHumanHandoffIntent(t) || isConfirmIntent(t) ||
    isEditIntent(t) || isCancelIntent(t) || isConfusedIntent(t) || isGreeting(t)
  ) return false;
  return true;
}

// ============================================================
// INTENT CLASSIFICATION (deterministic; used to route free text)
// ============================================================

export function isRestartIntent(text) {
  const t = (text || '').trim();
  return /^(শুরু|start|restart)$/i.test(t) ||
    /আবার\s*শুরু|শুরু\s*থেকে|নতুন\s*করে|reset\s*করেন|restart\s*করেন/i.test(t);
}

export function isHumanHandoffIntent(text) {
  if (!text) return false;
  const t = normalizeBengaliDigits(text).trim().toLowerCase();
  return (
    /^(?:admin|এডমিন|এ্যাডমিন|agent|এজেন্ট|human|মানুষ|\/admin|\/agent|\/human)$/i.test(t) ||
    /\b(?:admin|agent|human)\b/i.test(t) ||
    (/(?:admin|এডমিন|এ্যাডমিন|agent|এজেন্ট|মানুষ)/i.test(t) && /(?:কথা|চাই|হেল্প|help|লাগে|লাগবে|আছেন|দাও|দিন|প্লিজ|please|কানেক্ট|connect|যোগাযোগ|contact|call|নম্বর|number|ভাই)/i.test(t)) ||
    /মানুষ(?:ের)?\s*(?:সাথে)?\s*(?:কথা|চ্যাট)/i.test(t) ||
    /ম্যানুয়ালি|সরাসরি\s*(?:কথা|যোগাযোগ)|কাউকে\s*দিয়ে\s*কথা|ভাইয়ের\s*সাথে\s*কথা/i.test(t) ||
    /লাইভ\s*(?:সাপোর্ট|চ্যাট)|live\s*(?:support|chat)/i.test(t) ||
    /রিয়েল\s*(?:মানুষ|পারসন)|আসল\s*মানুষ/i.test(t)
  );
}

export function isConfirmIntent(text) {
  const t = (text || '').trim();
  return /^(✅|কনফার্ম করছি|কনফার্ম|confirm|হ্যাঁ ঠিক আছে|ঠিক আছে কনফার্ম|সব ঠিক আছে|ok confirm)$/i.test(t) ||
    /কনফার্ম\s*(?:করছি|করলাম|করব)/i.test(t);
}

export function isEditIntent(text) {
  const t = (text || '').trim();
  return /^(✏️|তথ্য ঠিক করতে চাই|ঠিক করতে চাই|এডিট|edit)$/i.test(t) ||
    /ভুল(?:\s*(?:হয়েছে|আছে|ছিল|হয়ে\s*গেছে))?|ঠিক\s*করতে\s*চাই|পরিবর্তন\s*করব|change\s*করব/i.test(t);
}

export function isCancelIntent(text) {
  const t = (text || '').trim();
  return /^(বাতিল|cancel|অর্ডার বাতিল)$/i.test(t) || /অর্ডার\s*বাতিল|বাতিল\s*করতে\s*চাই|cancel\s*(?:করতে|করব)/i.test(t);
}

/**
 * Detect a correction request naming a specific field, e.g.:
 *  "বরের নাম ভুল হয়েছে, রাকিব না, সাকিব" -> { field: 'groomName', newValue: 'সাকিব' }
 *  "৫০ না, ১০০ পিস" -> { field: 'quantity', newValue: 100 }
 *  "তারিখটা ভুল" -> { field: 'weddingDate', newValue: null }  (value not given yet, ask again)
 *  "এই কার্ডটা না, আগেরটা নেব" -> { field: 'card', newValue: null, reference: 'previous' }
 * Returns null if no correction intent is detected.
 */
export function detectCorrection(text) {
  const raw = (text || '').trim();
  if (!raw) return null;
  const norm = normalizeBengaliDigits(raw).toLowerCase();

  // Standalone "না" ("no"/"not") as its own token — NOT as a substring of
  // another word. Critical fix: "না" is a literal prefix of "নাম" (name),
  // so a naive /না/ search on "বরের নাম ভুল হয়েছে, রাকিব না, সাকিব" was
  // matching inside "নাম" itself and returning garbage ("ম ভুল হয়েছে...")
  // instead of the intended correction ("সাকিব"). Anchored with LB/RB so
  // it only matches "না" delimited by whitespace/punctuation/string edges.
  const NA_TOKEN = `${LB}না${RB}`;

  // Quantity correction: "৫০ না, ১০০ পিস" / "৫০ না ১০০"
  const qtyCorrection = norm.match(new RegExp(`(\\d{1,5})\\s*(?:পিস|pcs?)?\\s*${NA_TOKEN}\\s*,?\\s*(\\d{1,5})\\s*(?:পিস|pcs?)?`, 'i'));
  if (qtyCorrection) {
    const newQty = parseInt(qtyCorrection[2], 10);
    if (newQty > 0 && newQty < 10000) {
      return { field: 'quantity', newValue: newQty };
    }
  }

  // Card correction: "এই কার্ডটা না, আগেরটা নেব" / "অন্য কার্ড / অন্যটা"
  if (/কার্ড(?:টা)?\s*না|অন্য\s*(?:কার্ড|ডিজাইন)|ডিজাইন\s*(?:টা)?\s*না/i.test(raw)) {
    const wantsPrevious = /আগের\s*টা|আগেরটা/i.test(raw);
    return { field: 'card', newValue: null, reference: wantsPrevious ? 'previous' : 'ambiguous' };
  }

  // Named-field "X ভুল" correction, e.g. "বরের নাম ভুল হয়েছে", "তারিখটা ভুল"
  const fieldWordMap = [
    [/বর(?:ের)?\s*(?:নাম)?/i, 'groomName'],
    [/কনে(?:র)?\s*(?:নাম)?/i, 'brideName'],
    [/তারিখ/i, 'weddingDate'],
    [/সময়/i, 'weddingTime'],
    [/ভেন্যু|স্থান/i, 'venue'],
    [/ঠিকানা/i, 'deliveryAddress'],
    [/(?:মোবাইল|ফোন|নম্বর)/i, 'phone'],
  ];
  if (/ভুল(?:\s*(?:হয়েছে|আছে|ছিল|হয়ে\s*গেছে))?|ঠিক\s*করতে\s*চাই|পরিবর্তন\s*করব/i.test(raw)) {
    for (const [re, field] of fieldWordMap) {
      if (re.test(raw)) {
        // "রাকিব না, সাকিব" style new value after the field mention
        const valMatch = raw.match(new RegExp(`${NA_TOKEN}\\s*,?\\s*([^\\n,।]+)`, 'i'));
        return { field, newValue: valMatch ? valMatch[1].trim() : null };
      }
    }
  }

  // "X না, Y" generic pattern without an explicit "ভুল" word, e.g.
  // "রাকিব না, সাকিব" said right after being asked for the groom's name —
  // messenger.js resolves the *which field* part using conversationStage
  // (it knows which field was last asked), this function just extracts Y.
  const genericNaPattern = raw.match(new RegExp(`^(.+?)\\s*${NA_TOKEN}\\s*,?\\s*(.+)$`, 'i'));
  if (genericNaPattern && !qtyCorrection) {
    return { field: null, newValue: genericNaPattern[2].trim() };
  }

  return null;
}

// ============================================================
// DESIGN-SELECTION-BY-WORDS (STEP 7 / STEP 8)
// ============================================================

/**
 * Detect that the customer is referring, in words, to a design/card they
 * were just shown, rather than by quoting/replying-to the photo message.
 * Needs `lastShownCards` (array of card ids/codes from the most recent
 * gallery batch this customer was sent, oldest-to-newest) to resolve an
 * ordinal reference ("৩ নম্বরটা চাই").
 *
 * Returns:
 *   { type: 'ordinal', index }        -- "৩ নম্বরটা চাই" (1-based index)
 *   { type: 'last' }                  -- "এইটা", "এই কার্ডটাই", "ওইটার মতো"
 *   { type: 'previous' }              -- "আগেরটা" (the one before the last shown)
 *   { type: 'take' }                  -- "এইটাই নিব" / "এই কার্ডটা নিব" (select + commit to order)
 *   null                              -- not a design reference
 */
export function detectDesignReference(text) {
  const raw = (text || '').trim();
  if (!raw) return null;
  const norm = normalizeBengaliDigits(raw);

  const ordinalMatch = norm.match(/(\d{1,2})\s*(?:নম্বর|no\.?|number)\s*(?:টা|টি)?/i);
  if (ordinalMatch) {
    const idx = parseInt(ordinalMatch[1], 10);
    if (idx >= 1 && idx <= 8) return { type: 'ordinal', index: idx };
  }

  const wantsTake = /নিব|নেব|নিবো|নেবো|চাই|লাগবে/i.test(raw);

  if (/আগেরটা|আগের\s*টা|আগের\s*কার্ড|আগের\s*ডিজাইন/i.test(raw)) {
    return { type: wantsTake ? 'take' : 'previous', ref: 'previous' };
  }

  if (/এই(?:টা|টাই|টি)?|ওই(?:টা|টাই|টি)|ওইটার\s*মতো|এইটার\s*মতো|এই\s*কার্ড(?:টা|টাই)?|এই\s*ডিজাইন(?:টা|টাই)?|ছবির\s*এই\s*কার্ডটা/i.test(raw)) {
    return { type: wantsTake ? 'take' : 'last', ref: 'last' };
  }

  // Plain approval right after a gallery/photo ("এইটা ভালো", "এইটা সুন্দর")
  if (/ভালো|সুন্দর|পছন্দ/i.test(raw) && raw.length < 40) {
    return { type: 'last', ref: 'last' };
  }

  return null;
}

// ============================================================
// PRICE-OBJECTION / BARGAIN INTENT CLASSIFICATION
// (used to correctly ROUTE a message before deciding numeric bargain terms
//  via pricing.js#evaluateBargain — fixes the "কম...হবে" vs "minimum
//  order quantity" misroute from the audit, A-side finding.)
// ============================================================

/** True if the message is asking the shop's minimum order size (not a price objection). */
export function isMinimumOrderQuery(text) {
  const t = (text || '').trim();
  if (t.length >= 70) return false;
  if (/(কমিউনিটি|কম্পিউটার|কম্পানি|কমপ্লিট|কমেন্ট|ইনকাম|স্বাগতম)/i.test(t)) return false;
  return (
    /\b(olpo\s*lagbe|kom\s*lagbe|olpo\s*pisi|kom\s*pcs|kom\s*pisi|minimum|min\s*order)\b/i.test(t) ||
    /(^|\s)(অল্প|ন্যূনতম|নূন্যতম|মিনিমাম|কমপক্ষে)\s*(লাগবে|হবে|পিস|কার্ড|পরিমাণ|অর্ডার|কিছু)/.test(t) ||
    /^(আমার\s*)?(অল্প|ন্যূনতম|নূন্যতম)(\s*লাগবে|\s*হবে|\s*অর্ডার|\s*পরিমাণ)?$/i.test(t) ||
    t.includes('ন্যূনতম') || t.includes('নূন্যতম') || t.includes('মিনিমাম') || /\bminimum\b/i.test(t) ||
    // bare "কম" combined with a quantity word, but NOT combined with "দাম/টাকা/হবে" (that's a price objection, see below)
    (/(^|\s)কম\s*(লাগবে|পিস|কার্ড|পরিমাণ|অর্ডার|কিছু)/.test(t) && !/দাম|টাকা|রেট|price/i.test(t))
  );
}

/** True if the message is negotiating/objecting to price (asking for it to be cheaper). */
export function isPriceObjectionOrDiscount(text) {
  const t = normalizeBengaliDigits(text || '');
  return (
    /(?:দাম|dam|price|rate).*?(?:বেশি|beshi|besi|high)|(?:বেশি|beshi|besi|high).*?(?:দাম|dam|price)|eto\s*da+m|এত\s*দাম|খুব\s*বেশি|khub\s*besi|অনেক\s*দাম|onek\s*da+m/i.test(t) ||
    /(?:অন্য|onno|other).*?(?:পেজ|page|জায়গা|jayga|jaiga|দোকান|shop|কম)|অন্যত্র\s*কম/i.test(t) ||
    /discount|ডিসকাউন্ট|ছাড়|\bchar\b|\bchaar\b|কম\s*রাখা|কমান|কিছু\s*কম|একটু\s*কম|আরেকটু\s*কম|কম\s*হবে|kom\s*hobe|kom\s*dhen|kom\s*rakh|komano|raikhen|rakhen|rakhben|রাইখেন|রাখেন|রাখলে|আরও\s*কম|দাম\s*কমান|শেষ\s*কত|বাজেট\s*কম/i.test(t)
  ) && !isMinimumOrderQuery(text);
}

// ============================================================
// MISCELLANEOUS SMALL-TALK / STATEMENT CLASSIFICATION
// (helps the fallback layer respond sensibly instead of crashing/silence)
// ============================================================

export function isGreeting(text) {
  return /^(hi|hello|hey|হাই|হ্যালো|আসসালামু|assalamu|get started|শুরু)$/i.test((text || '').trim());
}

export function isWaitOrDeferIntent(text) {
  const t = (text || '').trim();
  return /^(দাঁড়ান|দাড়ান|একটু\s*অপেক্ষা\s*করেন|অপেক্ষা\s*করেন|পরে\s*জানাব|পরে\s*বলব|পরে\s*দিব|পরে\s*দিচ্ছি)$/i.test(t) ||
    /পরে\s*(?:জানাব|বলব|দিব|দিচ্ছি|জানাচ্ছি)/i.test(t);
}

export function isConfusedIntent(text) {
  const t = (text || '').trim();
  return /বুঝি\s*নাই|বুঝি\s*নি|বুঝলাম\s*না|বুঝতে\s*পারিনি|clear\s*না|confusing/i.test(t);
}

/**
 * True if customer is asking about inner page layout, writing, or inside design.
 * e.g. "ভেতরের অংশ দেখতে চাই", "ভিতরে কি লেখা থাকে", "inner page design",
 * "vitorer design", "কার্ডের ভেতরে কি লেখা থাকে দেখতে পারি?", "ভেতরের পাতা"
 */
export function isInnerPageQuery(text) {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  return (
    /^(\/)?(inner|sample|inside)$/i.test(t) ||
    /^(ভেতর|ভিতর|ভেতরের|ভিতরের|ভেতরের\s*পাতা|ভিতরের\s*পাতা)$/i.test(t) ||
    /(ভেতর|ভিতর|bhetor|vitor|inner|inside).*?(পাতা|লেখা|ডিজাইন|design|অংশ|layout|format|নমুনা|sample|থাকে|দেখতে|দেখান|দেখব|দেখবো|পারি)/i.test(t) ||
    /(পাতা|লেখা|অংশ|নমুনা|sample).*?(ভেতর|ভিতর|bhetor|vitor|inner|inside)/i.test(t) ||
    /inner\s*(page|layout|design|sheet|paper)/i.test(t) ||
    /(vitorer|bhetorer)\s*(design|lekha|pata|ongsho|layout)/i.test(t) ||
    /(ভেতরের|ভিতরের)\s*(পাতা|অংশ|ডিজাইন|নকশা|লেখা|লেআউট)/i.test(t) ||
    /কার্ডের\s*(ভেতরে|ভিতরে)\s*(কি|কী)\s*লেখা\s*থাকে/i.test(t) ||
    /(ভেতরে|ভিতরে)\s*(কি|কী)\s*লেখা\s*থাকে/i.test(t)
  );
}

/**
 * True if customer is asking about wholesale / paikari / dealership / bulk resell.
 * e.g. "পাইকারি দেন?", "পাইকারি পাওয়া যাবে?", "wholesale rate koto", "পাইকারি বিক্রি করেন?"
 */
export function isWholesaleQuery(text) {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  return (
    /পাইকারি|পাইকারী|পাইকারিতে|paikari|paikary|wholesale|হোলসেল|ডিলার|ডিলারশিপ|dealership|dealer|রিসেলার|reseller/i.test(t)
  );
}


