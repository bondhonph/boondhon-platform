/**
 * lib/logger.js
 *
 * Structured error logging (STEP 21 / Rule: "never unnecessarily log
 * sensitive customer data").
 *
 * Design goals:
 *  - One consistent JSON shape for every logged error so logs are greppable
 *    in Vercel's dashboard: { level, timestamp, route, eventId, customerId, error, stack }.
 *  - NEVER log the actual customer message text, card selections, phone
 *    numbers, addresses, or any other PII/order content. Only the
 *    customerId (a Facebook PSID, which is already an opaque platform
 *    identifier used for support/debugging, not the customer's real
 *    identity) plus the error itself are logged.
 *  - Never throw. Logging must never be the thing that crashes a request.
 *  - No secrets (env var values, tokens, API keys) are ever accepted as
 *    input here in the first place, so there's nothing to accidentally
 *    redact — callers only ever pass {route, eventId, customerId, error}.
 */

/**
 * Log a structured error entry to stdout/stderr (captured by Vercel's log
 * pipeline). Safe to call with partial/undefined fields.
 *
 * @param {Object} params
 * @param {string} [params.route]      - logical route/handler name, e.g. 'messenger.webhook'
 * @param {string} [params.eventId]    - the messaging event's mid or a synthetic id, for correlating retries
 * @param {string} [params.customerId] - the sender PSID (opaque platform id, not a real name/phone)
 * @param {*} [params.error]           - an Error instance or a plain string/description
 */
export function logError({ route, eventId, customerId, error } = {}) {
  try {
    const entry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      route: route || 'unknown',
      eventId: eventId || null,
      customerId: customerId || null,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  } catch (loggingFailure) {
    // Logging must never throw / must never block the caller.
    try {
      // eslint-disable-next-line no-console
      console.error('logError failed:', loggingFailure && loggingFailure.message);
    } catch (_) {
      /* truly nothing more we can do */
    }
  }
}

/**
 * Optional lightweight info-level logger for non-error operational events
 * (e.g. "KV not configured, falling back to file storage"). Kept separate
 * from logError so error-log greps/alerts aren't polluted by routine
 * informational messages.
 */
export function logInfo(message, extra = {}) {
  try {
    const entry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message: String(message),
      ...extra,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  } catch (_) {
    /* never throw from logging */
  }
}
