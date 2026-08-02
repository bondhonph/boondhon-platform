const fs = require('fs');
const path = require('path');

const PRIMARY_DIR = path.join(process.cwd(), 'data');
const FALLBACK_DIR = '/tmp';
let ACTIVE_DIR = PRIMARY_DIR;
let FILE_PATH = path.join(ACTIVE_DIR, 'conversations.json');

if (!global.__boondhonConversationsCache) {
  global.__boondhonConversationsCache = {};
}
if (!global.__boondhonLastCustomerPhone) {
  global.__boondhonLastCustomerPhone = null;
}

function ensureDirectory() {
  try {
    if (!fs.existsSync(PRIMARY_DIR)) {
      fs.mkdirSync(PRIMARY_DIR, { recursive: true });
    }
    ACTIVE_DIR = PRIMARY_DIR;
  } catch (err) {
    try {
      if (!fs.existsSync(FALLBACK_DIR)) {
        fs.mkdirSync(FALLBACK_DIR, { recursive: true });
      }
      ACTIVE_DIR = FALLBACK_DIR;
    } catch (e) {
      console.error('Failed to create storage directory:', e);
    }
  }
  FILE_PATH = path.join(ACTIVE_DIR, 'conversations.json');
}

function loadData() {
  ensureDirectory();
  if (Object.keys(global.__boondhonConversationsCache).length > 0) {
    return global.__boondhonConversationsCache;
  }

  if (fs.existsSync(FILE_PATH)) {
    try {
      const raw = fs.readFileSync(FILE_PATH, 'utf8');
      global.__boondhonConversationsCache = JSON.parse(raw);
      return global.__boondhonConversationsCache;
    } catch (e) {
      console.error('Failed to read conversations.json:', e.message);
    }
  }

  global.__boondhonConversationsCache = {};
  return global.__boondhonConversationsCache;
}

function saveData() {
  ensureDirectory();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(global.__boondhonConversationsCache, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write conversations.json:', e.message);
  }
}

function checkExpiration(conv) {
  if (!conv) return;
  if (conv.human_active && conv.paused_until && Date.now() >= conv.paused_until) {
    conv.human_active = false;
    conv.paused_until = 0;
    saveData();
  }
}

export const conversationStore = {
  getConversations: () => {
    const data = loadData();
    const list = Object.values(data).map(conv => {
      checkExpiration(conv);
      return {
        phone: conv.phone,
        name: conv.name || `+${conv.phone}`,
        lastMessage: conv.lastMessage || '',
        lastTimestamp: conv.lastTimestamp || Date.now(),
        human_active: !!conv.human_active,
        paused_until: conv.paused_until || 0,
        unreadCount: conv.unreadCount || 0,
        phoneId: conv.phoneId || null
      };
    });

    return list.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  },

  getConversation: (phone) => {
    const data = loadData();
    const conv = data[phone];
    if (conv) {
      checkExpiration(conv);
      conv.unreadCount = 0;
      saveData();
    }
    return conv || null;
  },

  addMessage: (phone, { sender, text, image, type = 'text', timestamp = Date.now(), phoneId = null, messageId = null }) => {
    const data = loadData();
    if (!data[phone]) {
      data[phone] = {
        phone: phone,
        name: `+${phone}`,
        lastMessage: '',
        lastTimestamp: timestamp,
        human_active: false,
        paused_until: 0,
        unreadCount: 0,
        phoneId: phoneId,
        messages: []
      };
    }

    const conv = data[phone];
    checkExpiration(conv);

    if (phoneId) conv.phoneId = phoneId;

    const snippet = text || (image ? '📷 Photo' : 'Message');
    conv.lastMessage = snippet;
    conv.lastTimestamp = timestamp;

    if (sender === 'customer') {
      conv.unreadCount = (conv.unreadCount || 0) + 1;
      global.__boondhonLastCustomerPhone = phone; // Track last customer phone for easy quick-reply
    }

    const msgObj = {
      id: messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sender: sender,
      text: text || '',
      image: image || null,
      type: type,
      timestamp: timestamp
    };

    conv.messages.push(msgObj);

    if (conv.messages.length > 100) {
      conv.messages = conv.messages.slice(-100);
    }

    saveData();
    return conv;
  },

  setHumanTakeover: (phone, active, pauseDurationMinutes = 30) => {
    const data = loadData();
    if (!data[phone]) {
      data[phone] = {
        phone: phone,
        name: `+${phone}`,
        lastMessage: '',
        lastTimestamp: Date.now(),
        human_active: false,
        paused_until: 0,
        unreadCount: 0,
        messages: []
      };
    }

    const conv = data[phone];
    conv.human_active = !!active;
    conv.paused_until = active ? Date.now() + (pauseDurationMinutes * 60 * 1000) : 0;
    saveData();
    return conv;
  },

  isHumanActive: (phone) => {
    const data = loadData();
    const conv = data[phone];
    if (!conv) return false;
    checkExpiration(conv);
    return !!conv.human_active;
  },

  getLastCustomerPhone: () => {
    if (global.__boondhonLastCustomerPhone) {
      return global.__boondhonLastCustomerPhone;
    }
    const data = loadData();
    const list = Object.values(data).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    return list.length > 0 ? list[0].phone : null;
  }
};
