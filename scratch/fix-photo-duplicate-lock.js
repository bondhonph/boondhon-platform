const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Update processedEvents & add userDebounce Map
const oldProcessedEvents = `// In-memory deduplication cache for Facebook Webhook retries
const processedEvents = new Map();
function isDuplicateEvent(eventId) {
  if (!eventId) return false;
  const now = Date.now();
  for (const [k, time] of processedEvents.entries()) {
    if (now - time > 120000) processedEvents.delete(k);
  }
  if (processedEvents.has(eventId)) {
    return true;
  }
  processedEvents.set(eventId, now);
  return false;
}`;

const newProcessedEvents = `// In-memory deduplication cache for Facebook Webhook retries
const processedEvents = new Map();
function isDuplicateEvent(eventId) {
  if (!eventId) return false;
  const now = Date.now();
  for (const [k, time] of processedEvents.entries()) {
    if (now - time > 120000) processedEvents.delete(k);
  }
  if (processedEvents.has(eventId)) {
    return true;
  }
  processedEvents.set(eventId, now);
  return false;
}

// User-level Debounce Lock (prevents rapid duplicate webhook triggers per user)
const userLastMsgMap = new Map();
function isUserDebounced(senderId, isPhoto) {
  const now = Date.now();
  const lastTime = userLastMsgMap.get(senderId) || 0;
  if (isPhoto) {
    userLastMsgMap.set(senderId, now);
    return false; // Always process photo
  }
  if (now - lastTime < 2000) {
    console.log(\`⏩ Debouncing rapid webhook event for \${senderId} (\${now - lastTime}ms since last event)\`);
    return true;
  }
  userLastMsgMap.set(senderId, now);
  return false;
}`;

// 2. Loop through all messaging events in entry.messaging
const oldEntryLoop = `        for (const entry of entries) {
          const webhookEvent = entry.messaging?.[0];
          if (webhookEvent) {`;

const newEntryLoop = `        for (const entry of entries) {
          const messagingEvents = entry.messaging || [];
          for (const webhookEvent of messagingEvents) {`;

// Close the inner loop:
const oldLoopEnd = `            }
          }
        }
        return res.status(200).send('EVENT_RECEIVED');`;

const newLoopEnd = `            } // end webhookEvent check
          } // end messagingEvents loop
        } // end entries loop
        return res.status(200).send('EVENT_RECEIVED');`;

// 3. Add debounce check and payload clearing for photo
const oldPhotoCheck = `            const attachments = message?.attachments;
            let isPhoto = false;
            let photoUrl = null;
            if (attachments && attachments.length > 0) {
              const imgAtt = attachments.find(att => att.type === 'image');
              if (imgAtt) {
                isPhoto = true;
                photoUrl = imgAtt.payload?.url;
              }
            }`;

const newPhotoCheck = `            const attachments = message?.attachments;
            let isPhoto = false;
            let photoUrl = null;
            if (attachments && attachments.length > 0) {
              const imgAtt = attachments.find(att => att.type === 'image');
              if (imgAtt) {
                isPhoto = true;
                photoUrl = imgAtt.payload?.url;
              }
            }

            // If user event is debounced (within 2s of previous event), skip
            if (isUserDebounced(senderId, isPhoto)) {
              continue;
            }

            // If sending a photo, clear text & payload to prevent text/price triggers
            if (isPhoto) {
              payload = '';
              text = '';
            }`;

if (content.includes(oldProcessedEvents)) {
  content = content.replace(oldProcessedEvents, newProcessedEvents);
  console.log('✅ User debounce lock function added');
} else {
  console.error('❌ Could not find oldProcessedEvents');
}

if (content.includes(oldEntryLoop)) {
  content = content.replace(oldEntryLoop, newEntryLoop);
  console.log('✅ messagingEvents loop updated');
} else {
  console.error('❌ Could not find oldEntryLoop');
}

if (content.includes(oldPhotoCheck)) {
  content = content.replace(oldPhotoCheck, newPhotoCheck);
  console.log('✅ Photo check & debounce lock applied');
} else {
  console.error('❌ Could not find oldPhotoCheck');
}

fs.writeFileSync(filePath, content, 'utf-8');
