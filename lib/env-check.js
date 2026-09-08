/**
 * lib/env-check.js
 *
 * STEP 20: startup/runtime environment validation.
 *
 * Rules this file must honor:
 *  - NEVER log the *value* of any environment variable (they may be
 *    tokens/secrets). Only log which variable NAMES are missing.
 *  - NEVER throw / crash the process. Missing optional config should
 *    degrade gracefully (this mirrors the existing pattern already used
 *    for GEMINI_API_KEY, FB_APP_SECRET, and KV_REST_API_URL/TOKEN
 *    elsewhere in the codebase) — a misconfigured bot should still start
 *    and serve whatever it can, not 500 on every request.
 *  - Only warn once per cold start, not once per request, so logs
 *    aren't spammed on every webhook call.
 *
 * Two tiers:
 *  - REQUIRED_VARS: without these the bot cannot do its core job
 *    (send/receive Messenger messages, verify the webhook handshake).
 *    Missing ones are logged as errors, but the module still loads —
 *    the actual send/verify calls already no-op or fail safely when
 *    these are blank (see PAGE_ACCESS_TOKEN / VERIFY_TOKEN checks in
 *    messenger.js), so a hard crash here would be a regression, not a
 *    safety improvement.
 *  - RECOMMENDED_VARS: features that degrade gracefully when absent
 *    (Gemini AI replies/vision, webhook signature verification, durable
 *    KV storage — each already has its own fallback path). Missing ones
 *    are logged as warnings only.
 */

const REQUIRED_VARS = ['FB_PAGE_ACCESS_TOKEN', 'VERIFY_TOKEN'];

const RECOMMENDED_VARS = [
  'GEMINI_API_KEY',
  'FB_APP_SECRET',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
];

let alreadyChecked = false;
let lastResult = null;

/**
 * Check that required/recommended environment variables are present.
 * Safe to call multiple times (e.g. once per cold start, or defensively
 * on every request) — after the first call it just returns the cached
 * result instead of re-logging.
 *
 * @returns {{ ok: boolean, missingRequired: string[], missingRecommended: string[] }}
 */
export function checkRequiredEnv() {
  if (alreadyChecked) return lastResult;
  alreadyChecked = true;

  try {
    const missingRequired = REQUIRED_VARS.filter((name) => !(process.env[name] || '').trim());
    const missingRecommended = RECOMMENDED_VARS.filter((name) => !(process.env[name] || '').trim());

    if (missingRequired.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `[env-check] Missing REQUIRED environment variable(s): ${missingRequired.join(', ')}. ` +
        `The bot will still start, but core messaging/webhook-verification will not work until these are set.`
      );
    }
    if (missingRecommended.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `[env-check] Missing recommended environment variable(s): ${missingRecommended.join(', ')}. ` +
        `Affected features will fall back to degraded/disabled behavior (see each feature's own fallback warning).`
      );
    }

    lastResult = {
      ok: missingRequired.length === 0,
      missingRequired,
      missingRecommended,
    };
  } catch (err) {
    // Validation itself must never crash the process.
    lastResult = { ok: true, missingRequired: [], missingRecommended: [], checkFailed: true };
  }

  return lastResult;
}
