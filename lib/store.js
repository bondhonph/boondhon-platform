const fs = require('fs');
const path = require('path');

const DRIVE_SYNC_URL = process.env.GOOGLE_DRIVE_SYNC_URL || 'https://script.google.com/macros/s/AKfycby6b6KtLfxxgeS6FdFt2pgpfegZoOAQ93_EYxRrgh9IVkU8E6BHocsm6tpxpdzxYI-d/exec';

const PRIMARY_DIR = path.join(process.cwd(), 'data');
const FALLBACK_DIR = '/tmp';
let ACTIVE_DIR = PRIMARY_DIR;
let FILE_PATH = path.join(ACTIVE_DIR, 'conversations.json');

if (!global.__boondhonConversationsCache) {
  global.__boondhonConversationsCache = null;
}
if (!global.__boondhonLastCustomerPhone) {
  global.__boondhonLastCustomerPhone = null;
}
let isSyncingToDrive = false;

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

async function loadDataFromDrive() {
  if (global.__boondhonConversationsCache !== null) {
    return global.__boondhonConversationsCache;
  }

  ensureDirectory();

  if (fs.existsSync(FILE_PATH)) {
    try {
      const raw = fs.readFileSync(FILE_PATH, 'utf8');
      global.__boondhonConversationsCache = JSON.parse(raw);
      if (global.__boondhonConversationsCache && Object.keys(global.__boondhonConversationsCache).length > 0) {
        return global.__boondhonConversationsCache;
      }
    } catch (e) {
      console.error('Failed to read local conversations.json:', e.message);
    }
  }

  try {
    const res = await fetch(DRIVE_SYNC_URL, { redirect: 'follow' });
    if (res.ok) {
      const driveData = await res.json();
      if (driveData && typeof driveData === 'object' && !driveData.test) {
        global.__boondhonConversationsCache = driveData;
        saveLocalFile(driveData);
        return global.__boondhonConversationsCache;
      }
    }
  } catch (err) {
    console.error('Failed to load data from Google Drive:', err.message);
  }

  global.__boondhonConversationsCache = {};
  return global.__boondhonConversationsCache;
}

function saveLocalFile(data) {
  ensureDirectory();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write local conversations.json:', e.message);
  }
}

function saveData(data) {
  saveLocalFile(data);

  if (!isSyncingToDrive && DRIVE_SYNC_URL) {
    isSyncingToDrive = true;
    fetch(DRIVE_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      redirect: 'follow'
    }).catch(err => {
      console.error('Async Google Drive sync error:', err.message);
    }).finally(() => {
      isSyncingToDrive = false;
    });
  }
}

function checkExpiration(conv) {
  if (!conv) return;
  if (conv.human_active && conv.paused_until && Date.now() >= conv.paused_until) {
    conv.human_active = false;
    conv.paused_until = 0;
    if (global.__boondhonConversationsCache) {
      saveData(global.__boondhonConversationsCache);
    }
  }
}

export const conversationStore = {
  getConversations: async () => {
    const data = await loadDataFromDrive();
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
        label: conv.label || 'New Customer',
        phoneId: conv.phoneId || null
      };
    });

    return list.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  },

  getConversation: async (phone) => {
    const data = await loadDataFromDrive();
    const conv = data[phone];
    if (conv) {
      checkExpiration(conv);
      conv.unreadCount = 0;
      saveData(data);
    }
    return conv || null;
  },

  addMessage: async (phone, { sender, text, image, type = 'text', timestamp = Date.now(), phoneId = null, messageId = null }) => {
    const data = await loadDataFromDrive();
    if (!data[phone]) {
      data[phone] = {
        phone: phone,
        name: `+${phone}`,
        lastMessage: '',
        lastTimestamp: timestamp,
        human_active: false,
        paused_until: 0,
        unreadCount: 0,
        label: 'New Customer',
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
      global.__boondhonLastCustomerPhone = phone;
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

    if (conv.messages.length > 150) {
      conv.messages = conv.messages.slice(-150);
    }

    saveData(data);
    return conv;
  },

  setHumanTakeover: async (phone, active, pauseDurationMinutes = 30) => {
    const data = await loadDataFromDrive();
    if (!data[phone]) {
      data[phone] = {
        phone: phone,
        name: `+${phone}`,
        lastMessage: '',
        lastTimestamp: Date.now(),
        human_active: false,
        paused_until: 0,
        unreadCount: 0,
        label: 'New Customer',
        messages: []
      };
    }

    const conv = data[phone];
    conv.human_active = !!active;
    conv.paused_until = active ? Date.now() + (pauseDurationMinutes * 60 * 1000) : 0;
    saveData(data);
    return conv;
  },

  updateLabel: async (phone, label) => {
    const data = await loadDataFromDrive();
    if (data[phone]) {
      data[phone].label = label;
      saveData(data);
      return data[phone];
    }
    return null;
  },

  isHumanActive: (phone) => {
    const data = global.__boondhonConversationsCache || {};
    const conv = data[phone];
    if (!conv) return false;
    checkExpiration(conv);
    return !!conv.human_active;
  },

  getLastCustomerPhone: () => {
    if (global.__boondhonLastCustomerPhone) {
      return global.__boondhonLastCustomerPhone;
    }
    const data = global.__boondhonConversationsCache || {};
    const list = Object.values(data).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    return list.length > 0 ? list[0].phone : null;
  }
};
