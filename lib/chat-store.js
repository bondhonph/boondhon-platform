import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'scratch', 'conversations_store.json');

// Ensure directory exists
function ensureStoreDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial sample seed dataset if store is empty
const INITIAL_CONVERSATIONS = {
  "8801712345678": {
    phone: "8801712345678",
    name: "তানভীর আহমেদ",
    humanTakeover: false,
    orderStatus: "New",
    lastUpdated: Date.now() - 600000,
    cardType: "Premium (১০০ পিস)",
    messages: [
      { id: "m1", sender: "customer", text: "আসসালামু আলাইকুম, কার্ডে কাস্টম গোল্ড ফয়েল প্রিন্টিং করা যাবে কি? দাম কত পড়বে?", time: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { id: "m2", sender: "bot", text: "আসসালামু আলাইকুম! 🌸 Premium ১০০ পিস গোল্ড ফয়েল কার্ডের দাম ৫,৫০০৳। ২০০+ পিসে ১টি ফ্রি নিকাহনামা! 🥰", time: new Date(Date.now() - 580000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]
  },
  "8801898765432": {
    phone: "8801898765432",
    name: "সাবরিনা ইসলাম",
    humanTakeover: true,
    orderStatus: "Replied",
    lastUpdated: Date.now() - 3600000,
    cardType: "Affordable (২০০ পিস)",
    messages: [
      { id: "m3", sender: "customer", text: "২০০ পিস অর্ডারের ফ্রি নিকাহনামা ডেমো ডিজাইনগুলো দেখতে চাই। কীভাবে পাব?", time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { id: "m4", sender: "admin", text: "ধন্যবাদ সাবরিনা আপু! আমাদের ২শ পিসে ফ্রি নিকাহনামা ল্যামিনেটেড করে ডেলিভারি দেওয়া হয়। আমি এখনই হোয়াটসঅ্যাপে অফার ডেমো ফটো পাঠিয়ে দিচ্ছি। 🌸", time: new Date(Date.now() - 3500000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]
  }
};

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
  if (extraName && store[cleanPhone].name.startsWith('কাস্টমার')) {
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
