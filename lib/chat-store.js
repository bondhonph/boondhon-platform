/**
 * lib/chat-store.js
 *
 * Durable conversation storage backed by Upstash Redis (@upstash/redis).
 *
 * WHAT CHANGED AND WHY
 * ---------------------
 * In serverless environments like Vercel, `/tmp` filesystem storage is local to
 * a single ephemeral container instance and is wiped on cold start or redeployment.
 * Concurrently running function instances could not share state, causing lost
 * orders, lost selected cards, desynced human takeover flags, and wiped histories.
 *
 * This version uses Upstash Redis via REST API (@upstash/redis), providing:
 * 1. 100% durable, low-latency shared state across all Vercel serverless instances.
 * 2. Instant distributed Human Takeover synchronization using dedicated Redis TTL keys.
 * 3. Graceful fallback to local storage during local development if credentials
 *    are not yet configured.
 *
 * SUPPORTED ENVIRONMENT VARIABLES:
 * - UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN (from Upstash Console or Vercel Marketplace)
 * - KV_REST_API_URL & KV_REST_API_TOKEN (from Vercel KV integration)
 */

import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

const STORE_PATH = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'conversations_store.json')
  : path.join(process.cwd(), 'scratch', 'conversations_store.json');

const RECORD_PREFIX = 'bondhon:conv:';
const INDEX_KEY = 'bondhon:conv:index';
const TAKEOVER_PREFIX = 'bondhon:takeover:';
const TAKEOVER_TTL_SECONDS = 15 * 60; // 15 minutes

let redisClient = null;
let warnedFallback = false;

function getRedis() {
  if (redisClient) return redisClient;

  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim();

  if (url && token) {
    try {
      redisClient = new Redis({
        url: url.replace(/^["']|["']$/g, ''),
        token: token.replace(/^["']|["']$/g, ''),
      });
      return redisClient;
    } catch (err) {
      console.error('[chat-store] Failed to initialize Upstash Redis client:', err.message);
      return null;
    }
  }

  return null;
}

function warnFallbackOnce() {
  if (!warnedFallback) {
    warnedFallback = true;
    console.warn(
      '[chat-store] Upstash Redis is not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN ' +
      'missing) — falling back to local file storage. This is NOT durable across serverless instances/cold starts. ' +
      'Add Upstash Redis credentials to your Vercel project environment variables for production.'
    );
  }
}

// ============================================================
// BACKEND: Upstash Redis (durable, shared across all instances)
// ============================================================

const redisBackend = {
  async getRecord(phone) {
    const redis = getRedis();
    if (!redis) {
      return fileBackend.getRecord(phone);
    }
    try {
      const data = await redis.get(RECORD_PREFIX + phone);
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (err) {
      console.error(`[chat-store] Redis getRecord error for ${phone}:`, err.message);
      return fileBackend.getRecord(phone);
    }
  },

  async setRecord(phone, record) {
    const redis = getRedis();
    if (!redis) {
      return fileBackend.setRecord(phone, record);
    }
    try {
      await redis.set(RECORD_PREFIX + phone, record);
      await redis.sadd(INDEX_KEY, phone);
    } catch (err) {
      console.error(`[chat-store] Redis setRecord error for ${phone}:`, err.message);
      return fileBackend.setRecord(phone, record);
    }
  },

  async listPhones() {
    const redis = getRedis();
    if (!redis) {
      return fileBackend.listPhones();
    }
    try {
      const phones = await redis.smembers(INDEX_KEY);
      return Array.isArray(phones) ? phones : [];
    } catch (err) {
      console.error('[chat-store] Redis listPhones error:', err.message);
      return fileBackend.listPhones();
    }
  },

  async listAllRecords() {
    const redis = getRedis();
    if (!redis) {
      return fileBackend.listAllRecords();
    }
    try {
      const phones = await this.listPhones();
      if (!phones || phones.length === 0) return [];
      const records = await Promise.all(phones.map(p => this.getRecord(p)));
      return records.filter(Boolean);
    } catch (err) {
      console.error('[chat-store] Redis listAllRecords error:', err.message);
      return fileBackend.listAllRecords();
    }
  },

  async clearAll() {
    const redis = getRedis();
    if (!redis) {
      return fileBackend.clearAll();
    }
    try {
      const phones = await this.listPhones();
      if (phones && phones.length > 0) {
        await Promise.all(phones.map(p => redis.del(RECORD_PREFIX + p)));
        await Promise.all(phones.map(p => redis.del(TAKEOVER_PREFIX + p)));
      }
      await redis.del(INDEX_KEY);
    } catch (err) {
      console.error('[chat-store] Redis clearAll error:', err.message);
    }
    return fileBackend.clearAll();
  },

  async setTakeover(phone, active, isExplicit = false, durationSeconds = TAKEOVER_TTL_SECONDS) {
    const redis = getRedis();
    if (!redis) {
      return fileBackend.setTakeover(phone, active, isExplicit, durationSeconds);
    }
    const key = TAKEOVER_PREFIX + phone;
    try {
      if (active) {
        const val = isExplicit ? 'explicit' : 'auto';
        await redis.set(key, val, { ex: durationSeconds });
      } else {
        await redis.del(key);
      }
    } catch (err) {
      console.error(`[chat-store] Redis setTakeover error for ${phone}:`, err.message);
    }
  },

  async getTakeoverState(phone) {
    const redis = getRedis();
    if (!redis) {
      return fileBackend.getTakeoverState(phone);
    }
    try {
      const val = await redis.get(TAKEOVER_PREFIX + phone);
      if (!val) return { active: false, isExplicitOff: false };
      return {
        active: true,
        isExplicitOff: String(val) === 'explicit',
      };
    } catch (err) {
      console.error(`[chat-store] Redis getTakeoverState error for ${phone}:`, err.message);
      return fileBackend.getTakeoverState(phone);
    }
  },

  async isTakeoverActive(phone) {
    const state = await this.getTakeoverState(phone);
    return state.active;
  },
};

// ============================================================
// BACKEND: local JSON file (dev-only fallback)
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
  async setTakeover(phone, active, isExplicit = false) {
    // Handled in record.humanTakeover and record.isExplicitOff
  },
  async getTakeoverState(phone) {
    const rec = await this.getRecord(phone);
    if (!rec || !rec.humanTakeover) return { active: false, isExplicitOff: false };
    const isExplicitOff = Boolean(rec.isExplicitOff);
    const ttl = isExplicitOff ? (24 * 3600 * 1000) : (TAKEOVER_TTL_SECONDS * 1000);
    const elapsed = Date.now() - (rec.lastAdminReplyTime || 0);
    if (elapsed < ttl) {
      return { active: true, isExplicitOff };
    }
    return { active: false, isExplicitOff: false };
  },
  async isTakeoverActive(phone) {
    const state = await this.getTakeoverState(phone);
    return state.active;
  },
};

const backend = redisBackend;

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
    isExplicitOff: false,
    lastAdminReplyTime: 0,
    orderStatus: 'New',
    paymentStatus: 'None',
    awaitingPaymentDigits: false,
    currentCategory: null,
    selectedCard: null,
    lastShownCards: [],
    conversationStage: 'browsing',
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
// PUBLIC API — fully async, backward compatible
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

export async function setHumanTakeover(phone, status, isExplicit = false) {
  const cleanPhone = cleanPhoneOf(phone);
  const record = await loadOrInit(cleanPhone);
  record.humanTakeover = Boolean(status);
  record.isExplicitOff = Boolean(status) && Boolean(isExplicit);
  if (status) {
    record.lastAdminReplyTime = Date.now();
  } else {
    record.isExplicitOff = false;
  }
  const ttl = isExplicit ? (24 * 3600) : TAKEOVER_TTL_SECONDS;
  await backend.setTakeover(cleanPhone, Boolean(status), Boolean(isExplicit), ttl);
  return save(cleanPhone, record);
}

export async function isRedisTakeoverActive(phone) {
  const cleanPhone = cleanPhoneOf(phone);
  return backend.isTakeoverActive(cleanPhone);
}

export async function getTakeoverState(phone) {
  const cleanPhone = cleanPhoneOf(phone);
  if (typeof backend.getTakeoverState === 'function') {
    return backend.getTakeoverState(cleanPhone);
  }
  const active = await backend.isTakeoverActive(cleanPhone);
  return { active, isExplicitOff: false };
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
