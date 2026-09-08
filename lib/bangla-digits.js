/**
 * lib/bangla-digits.js
 *
 * Extracted from the original inline helpers in messenger.js so both the
 * webhook handler and lib/pricing.js / lib/order-parser.js can share the
 * exact same digit-conversion logic (previously duplicated / would have
 * had to be duplicated again). Behavior is unchanged from the original.
 */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/** Convert Bengali numerals in a string to plain ASCII digits. */
export function normalizeBengaliDigits(str) {
  if (!str) return '';
  return str.toString().replace(/[০-৯]/g, d => BN_DIGITS.indexOf(d));
}

/** Convert a number (or numeric string) to Bengali numerals for display. */
export function bngDigits(num) {
  return num.toString().replace(/\d/g, d => BN_DIGITS[d]);
}
