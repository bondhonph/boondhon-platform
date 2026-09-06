import fs from 'fs';
import path from 'path';

// Use /tmp in serverless production environments (Vercel) so files can be written
const STORE_PATH = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'conversations_store.json')
  : path.join(process.cwd(), 'scratch', 'conversations_store.json');

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

const INITIAL_CONVERSATIONS = {};

export function readStore() {
  ensureStoreDir();
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(INITIAL_CONVERSATIONS, null, 2), 'utf-8');
      return INITIAL_CONVERSATIONS;
    }
    const data = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading chat store:', err);
    return INITIAL_CONVERSATIONS;
  }
}

export function writeStore(store) {
  ensureStoreDir();
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing chat store:', err);
  }
}

export function clearAllStore() {
  ensureStoreDir();
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify({}, null, 2), 'utf-8');
    return {};
  } catch (err) {
    console.error('Error clearing chat store:', err);
    return {};
  }
}

export function getConversations() {
  const store = readStore();
  const list = Object.values(store);
  list.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
  return list;
}

export function getConversation(phone) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  return store[cleanPhone] || null;
}

export function appendMessage(phone, sender, text, mediaUrl = null, extraName = '') {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');

  if (!store[cleanPhone]) {
    store[cleanPhone] = {
      phone: cleanPhone,
      name: extraName || `কাস্টমার (${cleanPhone.slice(-4)})`,
      humanTakeover: false,
      orderStatus: 'New',
      lastUpdated: Date.now(),
      messages: []
    };
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgObj = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sender, // 'customer' | 'bot' | 'admin'
    text,
    mediaUrl,
    time: timeStr,
    timestamp: Date.now()
  };

  store[cleanPhone].messages.push(msgObj);
  store[cleanPhone].lastUpdated = Date.now();
  if (extraName && (store[cleanPhone].name.startsWith('কাস্টমার') || !store[cleanPhone].name)) {
    store[cleanPhone].name = extraName;
  }

  writeStore(store);
  return store[cleanPhone];
}

export function setHumanTakeover(phone, status) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (store[cleanPhone]) {
    store[cleanPhone].humanTakeover = Boolean(status);
    if (status) {
      store[cleanPhone].lastAdminReplyTime = Date.now();
    }
    store[cleanPhone].lastUpdated = Date.now();
    writeStore(store);
    return store[cleanPhone];
  }
  return null;
}

export function setOrderStatus(phone, status) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (store[cleanPhone]) {
    store[cleanPhone].orderStatus = status;
    store[cleanPhone].lastUpdated = Date.now();
    writeStore(store);
    return store[cleanPhone];
  }
  return null;
}

// Get next batch of unseen, non-repeating images for this specific user with stats
export function getUnseenImagesWithStats(phone, allIdsList, count = 8) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');

  if (!store[cleanPhone]) {
    store[cleanPhone] = {
      phone: cleanPhone,
      name: `কাস্টমার (${cleanPhone.slice(-4)})`,
      humanTakeover: false,
      orderStatus: 'New',
      lastUpdated: Date.now(),
      messages: [],
      sentImages: [],
      currentCategory: null
    };
  }

  if (!Array.isArray(store[cleanPhone].sentImages)) {
    store[cleanPhone].sentImages = [];
  }

  const listSet = new Set(allIdsList);
  const sentSet = new Set(store[cleanPhone].sentImages);
  let available = allIdsList.filter(id => !sentSet.has(id));

  // If all images in catalog have already been seen by this user, reset history for this category
  if (available.length === 0) {
    store[cleanPhone].sentImages = store[cleanPhone].sentImages.filter(id => !listSet.has(id));
    available = [...allIdsList];
  }

  const selected = available.slice(0, count);

  // Record these images as sent
  store[cleanPhone].sentImages.push(...selected);
  store[cleanPhone].lastUpdated = Date.now();
  writeStore(store);

  const seenCount = store[cleanPhone].sentImages.filter(id => listSet.has(id)).length;
  const totalCount = allIdsList.length;

  return { batch: selected, seenCount, totalCount };
}

// Get next batch of unseen, non-repeating images (legacy helper)
export function getUnseenImages(phone, allIdsList, count = 4) {
  return getUnseenImagesWithStats(phone, allIdsList, count).batch;
}

// Set the currently active category for a customer ('affordable' | 'premium' | null)
export function setCurrentCategory(phone, category) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!store[cleanPhone]) {
    store[cleanPhone] = {
      phone: cleanPhone,
      name: `কাস্টমার (${cleanPhone.slice(-4)})`,
      humanTakeover: false,
      orderStatus: 'New',
      lastUpdated: Date.now(),
      messages: [],
      sentImages: [],
      currentCategory: null
    };
  }
  store[cleanPhone].currentCategory = category;
  store[cleanPhone].lastUpdated = Date.now();
  writeStore(store);
  return store[cleanPhone];
}

// Get the currently active category for a customer
export function getCurrentCategory(phone) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  return store[cleanPhone]?.currentCategory || null;
}

// Record sent card by Facebook message ID (mid)
export function recordSentCardMessage(phone, mid, cardId, category, url) {
  if (!mid) return;
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!store[cleanPhone]) {
    store[cleanPhone] = {
      phone: cleanPhone,
      name: `কাস্টমার (${cleanPhone.slice(-4)})`,
      humanTakeover: false,
      orderStatus: 'New',
      lastUpdated: Date.now(),
      messages: [],
      sentImages: [],
      sentCards: [],
      currentCategory: category || null
    };
  }
  if (!Array.isArray(store[cleanPhone].sentCards)) {
    store[cleanPhone].sentCards = [];
  }
  store[cleanPhone].sentCards.push({
    mid,
    cardId,
    category,
    url,
    timestamp: Date.now()
  });
  if (store[cleanPhone].sentCards.length > 50) {
    store[cleanPhone].sentCards = store[cleanPhone].sentCards.slice(-50);
  }
  if (category) {
    store[cleanPhone].currentCategory = category;
  }
  store[cleanPhone].lastUpdated = Date.now();
  writeStore(store);
}

// Find sent card info by mid
export function getSentCardByMid(phone, mid) {
  if (!mid) return null;
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  const userStore = store[cleanPhone];
  if (userStore && Array.isArray(userStore.sentCards)) {
    const found = userStore.sentCards.find(c => c.mid === mid);
    if (found) return found;
  }
  for (const u of Object.values(store)) {
    if (Array.isArray(u.sentCards)) {
      const found = u.sentCards.find(c => c.mid === mid);
      if (found) return found;
    }
  }
  return null;
}

// Track whether bot is awaiting payment last 4 digits from this customer
export function setUserAwaitingPayment(phone, status) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!store[cleanPhone]) {
    store[cleanPhone] = {
      phone: cleanPhone,
      name: `কাস্টমার (${cleanPhone.slice(-4)})`,
      humanTakeover: false,
      orderStatus: 'New',
      lastUpdated: Date.now(),
      messages: []
    };
  }
  store[cleanPhone].awaitingPaymentDigits = Boolean(status);
  store[cleanPhone].lastUpdated = Date.now();
  writeStore(store);
}

export function isUserAwaitingPayment(phone) {
  const store = readStore();
  const cleanPhone = String(phone).replace(/\D/g, '');
  return store[cleanPhone]?.awaitingPaymentDigits || false;
}


