/**
 * lib/chat-store.js
 *
 * REWRITTEN for audit plan item P0-3 (durable conversation storage).
 *
 * WHAT CHANGED AND WHY
 * ---------------------
 * The original version of this file stored everything in a single JSON
 * file written to `/tmp/conversations_store.json` in production. On
 * Vercel serverless, `/tmp` is local to ONE function instance, is wiped
 * on cold start, and is never shared across concurrently-running
 * instances — so a customer's selected card, category, human-takeover
 * flag, and order-in-progress could silently reset mid-conversation any
 * time a new instance handled their next message (which happens
 * routinely under real traffic, after any idle period, or on every
 * redeploy). The file also had no locking, so two overlapping writes for
 * the same record could silently clobber each other (a classic
 * read-modify-write race).
 *
 * This version stores each customer's record in Vercel KV (Upstash
 * Redis under the hood) — a real, shared, durable key-value store that
 * every serverless instance reads from and writes to the same place.
 *
 * BACKWARD COMPATIBILITY
 * -----------------------
 * Every function this file exported before still exists, with the same
 * name and the same parameters, so messenger.js's calls didn't need to
 * be rewritten — only `await` needed to be added at each call site,
 * because reading/writing a real shared store is unavoidably an async
 * network operation (unlike a local synchronous file read). This is
 * flagged clearly in the delivery report as the one call-site-level
 * change needed everywhere this module is used.
 *
 * GRACEFUL FALLBACK (no hidden workaround, per ABSOLUTE RULE #6/#7)
 * --------------------------------------------------------------------
 * If Vercel KV isn't configured yet (no KV_REST_API_URL /
 * KV_REST_API_TOKEN env vars — e.g. running locally, or before the
 * owner has attached a KV store to the Vercel project), this module
 * falls back to the OLD file-based behavior so the bot still runs for
 * local development and so tests can run without real cloud credentials.
 * This fallback is NOT "production-safe" and a clear one-time warning is
 * logged so nobody mistakes it for the durable path. Production must
 * have KV configured — this is called out as a NOT FIXED / pending
 * credential item in the delivery report until you confirm it's attached.
 */

import fs from 'fs';
import path from 'path';

const STORE_PATH = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'conversations_store.json')
  : path.join(process.cwd(), 'scratch', 'conversations_store.json');

const KV_CONFIGURED = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

let warnedFallback = false;
function warnFallbackOnce() {
  if (!warnedFallback) {
    warnedFallback = true;
    console.warn(
      '[chat-store] Vercel KV is not configured (KV_REST_API_URL / KV_REST_API_TOKEN ' +
      'missing) — falling back to local-file storage. This is NOT durable across ' +
      'serverless instances/cold starts/redeploys. Attach a Vercel KV store to this ' +
      'project and set those env vars before relying on this in production.'
    );
  }
}

// ============================================================
// BACKEND: Vercel KV (durable, shared across all instances)
// ============================================================

let kvClientPromise = null;
async function getKv() {
  if (!kvClientPromise) {
    kvClientPromise = import('@vercel/kv').then(mod => mod.kv);
  }
  return kvClientPromise;
}

const RECORD_PREFIX = 'bondhon:conv:';
const INDEX_KEY = 'bondhon:conv:index';

const kvBackend = {
  async getRecord(phone) {
    const kv = await getKv();
    return (await kv.get(RECORD_PREFIX + phone)) || null;
  },
  async setRecord(phone, record) {
    const kv = await getKv();
    await kv.set(RECORD_PREFIX + phone, record);
    await kv.sadd(INDEX_KEY, phone);
  },
  async listPhones() {
    const kv = await getKv();
    return (await kv.smembers(INDEX_KEY)) || [];
  },
  async listAllRecords() {
    const phones = await this.listPhones();
    if (phones.length === 0) return [];
    const kv = await getKv();
    const records = await Promise.all(phones.map(p => kv.get(RECORD_PREFIX + p)));
    return records.filter(Boolean);
  },
  async clearAll() {
    const kv = await getKv();
    const phones = await this.listPhones();
    await Promise.all(phones.map(p => kv.del(RECORD_PREFIX + p)));
    await kv.del(INDEX_KEY);
  },
};

// ============================================================
// BACKEND: local JSON file (dev-only fallback, original behavior)
// ============================================================

function ensureStoreDir() {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating store directory:', err);
  }
}

function readWholeFile() {
  ensureStoreDir();
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch (err) {
    console.error('Error reading chat store:', err);
    return {};
  }
}

function writeWholeFile(store) {
  ensureStoreDir();
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing chat store:', err);
  }
}

const fileBackend = {
  async getRecord(phone) {
    warnFallbackOnce();
    const store = readWholeFile();
    return store[phone] || null;
  },
  async setRecord(phone, record) {
    warnFallbackOnce();
    const store = readWholeFile();
    store[phone] = record;
    writeWholeFile(store);
  },
  async listPhones() {
    warnFallbackOnce();
    return Object.keys(readWholeFile());
  },
  async listAllRecords() {
    warnFallbackOnce();
    return Object.values(readWholeFile());
  },
  async clearAll() {
    warnFallbackOnce();
    writeWholeFile({});
  },
};

const backend = KV_CONFIGURED ? kvBackend : fileBackend;

// ============================================================
// RECORD SHAPE / DEFAULTS
// ============================================================

function cleanPhoneOf(phone) {
  return String(phone).replace(/\D/g, '');
}

function blankRecord(cleanPhone, extraName) {
  return {
    phone: cleanPhone,
    name: extraName || `কাস্টমার (${cleanPhone.slice(-4)})`,
    humanTakeover: false,
    lastAdminReplyTime: 0,
    orderStatus: 'New',
    paymentStatus: 'None',
    awaitingPaymentDigits: false,
    currentCategory: null,
    selectedCard: null,
    lastShownCards: [],
    conversationStage: 'browsing',
    // Tracks which single field (a WEDDING_FIELD_ORDER name, or 'quantity')
    // the bot's last outgoing message asked the customer for, so a bare
    // free-text reply with no explicit label/keyword can still be routed
    // to the right slot during one-field-at-a-time collection (STEP 6).
    // Cleared once that field is filled or on restart/cancel.
    awaitingField: null,
    order: {
      quantity: null,
      groomName: null,
      brideName: null,
      weddingDate: null,
      weddingTime: null,
      venue: null,
      phone: null,
      deliveryAddress: null,
    },
    sentImages: [],
    sentCards: [],
    messages: [],
    lastUpdated: Date.now(),
  };
}

/** Load a record, creating a blank one (NOT persisted yet) if it doesn't exist. */
async function loadOrInit(phone, extraName) {
  const cleanPhone = cleanPhoneOf(phone);
  const existing = await backend.getRecord(cleanPhone);
  if (existing) {
    // Backward-compat: fill in any new fields older records won't have yet.
    if (!existing.order) existing.order = blankRecord(cleanPhone).order;
    if (!existing.conversationStage) existing.conversationStage = 'browsing';
    if (!existing.lastShownCards) existing.lastShownCards = [];
    if (!existing.paymentStatus) existing.paymentStatus = 'None';
    if (existing.awaitingField === undefined) existing.awaitingField = null;
    return existing;
  }
  return blankRecord(cleanPhone, extraName);
}

async function save(cleanPhone, record) {
  record.lastUpdated = Date.now();
  await backend.setRecord(cleanPhone, record);
  return record;
}

// ============================================================
// PUBLIC API — same names/signatures as the original file, now async.
// ============================================================

export async function readStore() {
  const records = await backend.listAllRecords();
  const store = {};
  for (const r of records) store[r.phone] = r;
  return store;
}

export async function writeStore(store) {
  await Promise.all(Object.entries(store).map(([phone, record]) => backend.setRecord(phone, record)));
}

export async function clearAllStore() {
  await backend.clearAll();
  return {};
}

export async function getConversations() {
  const records = await backend.listAllRecords();
  records.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
  return records;
}

export async function getConversation(phone) {
  const cleanPhone = cleanPhoneOf(phone);
  return (await backend.getRecord(cleanPhone)) || null;
}

export async function appendMessage(phone, sender, text, mediaUrl = null, extraName = '') {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone, extraName);

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgObj = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sender,
    text,
    mediaUrl,
    time: timeStr,
    timestamp: Date.now(),
  };

  record.messages.push(msgObj);
  if (record.messages.length > 300) record.messages = record.messages.slice(-300);

  if (extraName && (record.name.startsWith('কাস্টমার') || !record.name)) {
    record.name = extraName;
  }

  return save(cleanPhone, record);
}

export async function setHumanTakeover(phone, status) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.humanTakeover = Boolean(status);
  if (status) record.lastAdminReplyTime = Date.now();
  return save(cleanPhone, record);
}

export async function setOrderStatus(phone, status) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.orderStatus = status;
  return save(cleanPhone, record);
}

export async function getUnseenImagesWithStats(phone, allIdsList, count = 8) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  if (!Array.isArray(record.sentImages)) record.sentImages = [];

  const listSet = new Set(allIdsList);
  const sentSet = new Set(record.sentImages);
  let available = allIdsList.filter(id => !sentSet.has(id));

  if (available.length === 0) {
    record.sentImages = record.sentImages.filter(id => !listSet.has(id));
    available = [...allIdsList];
  }

  const selected = available.slice(0, count);
  record.sentImages.push(...selected);
  await save(cleanPhone, record);

  const seenCount = record.sentImages.filter(id => listSet.has(id)).length;
  const totalCount = allIdsList.length;

  return { batch: selected, seenCount, totalCount };
}

export async function getUnseenImages(phone, allIdsList, count = 4) {
  return (await getUnseenImagesWithStats(phone, allIdsList, count)).batch;
}

export async function setCurrentCategory(phone, category) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.currentCategory = category;
  return save(cleanPhone, record);
}

export async function getCurrentCategory(phone) {
  const record = await getConversation(phone);
  return record?.currentCategory || null;
}

export async function recordSentCardMessage(phone, mid, cardId, category, url) {
  if (!mid) return;
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  if (!Array.isArray(record.sentCards)) record.sentCards = [];
  record.sentCards.push({ mid, cardId, category, url, timestamp: Date.now() });
  if (record.sentCards.length > 50) record.sentCards = record.sentCards.slice(-50);
  if (category) record.currentCategory = category;
  await save(cleanPhone, record);
}

export async function getSentCardByMid(phone, mid) {
  if (!mid) return null;
  const record = await getConversation(phone);
  if (record && Array.isArray(record.sentCards)) {
    const found = record.sentCards.find(c => c.mid === mid);
    if (found) return found;
  }
  // Fallback: search across all customers (matches original behavior —
  // needed because a quoted/replied-to message might have been sent to
  // a different PSID variant in edge cases).
  const all = await backend.listAllRecords();
  for (const u of all) {
    if (Array.isArray(u.sentCards)) {
      const found = u.sentCards.find(c => c.mid === mid);
      if (found) return found;
    }
  }
  return null;
}

export async function setUserAwaitingPayment(phone, status) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.awaitingPaymentDigits = Boolean(status);
  return save(cleanPhone, record);
}

export async function isUserAwaitingPayment(phone) {
  const record = await getConversation(phone);
  return record?.awaitingPaymentDigits || false;
}

export async function setSelectedCard(phone, cardInfo) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.selectedCard = cardInfo;
  return save(cleanPhone, record);
}

export async function getSelectedCard(phone) {
  const record = await getConversation(phone);
  return record?.selectedCard || null;
}

// ============================================================
// NEW — structured order state (audit plan P0-4/P0-5/STEP 4/5/6)
// ============================================================

/** Record the most recent gallery batch shown, so "৩ নম্বরটা চাই" style
 *  references can be resolved later (STEP 7/8). */
export async function setLastShownCards(phone, cardIds) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.lastShownCards = cardIds;
  return save(cleanPhone, record);
}

export async function getLastShownCards(phone) {
  const record = await getConversation(phone);
  return record?.lastShownCards || [];
}

export async function getConversationStage(phone) {
  const record = await getConversation(phone);
  return record?.conversationStage || 'browsing';
}

export async function setConversationStage(phone, stage) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.conversationStage = stage;
  return save(cleanPhone, record);
}

/** Which field (WEDDING_FIELD_ORDER name, or 'quantity') the bot's last question was asking for. */
export async function getAwaitingField(phone) {
  const record = await getConversation(phone);
  return record?.awaitingField || null;
}

export async function setAwaitingField(phone, field) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.awaitingField = field || null;
  return save(cleanPhone, record);
}

export async function getOrder(phone) {
  const record = await getConversation(phone);
  return record?.order || blankRecord(cleanPhoneOf(phone)).order;
}

/** Merge partial fields into the structured order — only overwrites fields actually passed in. */
export async function updateOrder(phone, partialFields) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.order = { ...record.order, ...partialFields };
  return save(cleanPhone, record);
}

export async function setPaymentStatus(phone, status) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.paymentStatus = status;
  return save(cleanPhone, record);
}

export async function getPaymentStatus(phone) {
  const record = await getConversation(phone);
  return record?.paymentStatus || 'None';
}

/**
 * Full state reset for a "restart" request (STEP 16). Clears selection,
 * category, order-in-progress, and conversation stage — but deliberately
 * KEEPS the message log (`messages`) intact for audit/history purposes,
 * per the instruction that reset means clearing state, not history.
 */
export async function resetCustomerState(phone) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.selectedCard = null;
  record.currentCategory = null;
  record.orderStatus = 'New';
  record.paymentStatus = 'None';
  record.awaitingPaymentDigits = false;
  record.conversationStage = 'browsing';
  record.lastShownCards = [];
  record.awaitingField = null;
  record.order = blankRecord(cleanPhone).order;
  return save(cleanPhone, record);
}
