import { appendMessage } from '../../lib/chat-store';

const AFFORDABLE_IDS = [
  "1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD","1cOCFSa1ap-Z54Ldf2AuoUKlEaQ5Ccql-","1dbYH2L4QykEUhYXGQPzQZObEuHFdwKsT",
  "1HJTtR-zhhg6v2ph7MikdMDWI-LWJgG0z","1PRlMp4F1xnQJPURON535pl7t08_thXVA","1UEAeYYB3Bt5vMYEL-a7AcV1aV21Z04si",
  "1-_qTV4gq0oKMdfMRxlTZL3yUO98ZGAoi","15yHXRk2mHI6-cKeooRqT20XeHubRRrPN","1Yrcqj5g0sZDrL3QaEkfEmKnF12BEs6ir",
  "1vXwJ68j7x5qfpZdHkMkqLn0tvpblGDpl","1GWw91oefwyYr9sHSQXjePTSX-KwPjy7I","1_tnTz7HWDf4CVJHORPlani7pjEcLdm7X",
  "1OMy_r94N_iUqvPW1t5fAGa4Sv3C_MIqF","1rXCxMziCgTImURvkahNp-AvneVljg-CW","1k_hzTbXOxxJg9rJ2OW-tnIkzLNYUqkOf"
];

const PREMIUM_IDS = [
  "182kOjBhoaqOTq7nr4ryI6re6fRuLITbH","1cTfbTDJDqBjsV-r7V1OjBZ-Z6tUAqwxj","1cA-MfI55Hh7ibreMQ4zPvt2i_LKxVHkR",
  "1fvtC5mT4slvV_kROIej7awAGmCRc7TUl","1rLVZUQ8lw6ilWM76xxARtbUreQ3JIkdi","15AQWI3wP2a57-3OxHZTCfSbskgvC5YvH",
  "1ahoubjUVdc9SJyi5n2rzZIsbugjCjHiz","1qlwwRe2Mr_gb8CZjkeG0-YxBSGmOHzZu","1oOdGtYFTz-xNmSLUO-VFS1YODqYZ74HJ",
  "1zBBLQOfuAaPXhyr6At3tJ5DlTZ_nXfLy","11GVK5OYU7bjf8YaHeNAAnAHPks3T1Jme","1Kat8i9M3usZX8iX2xUCcX08RVocX9kKB"
];

const driveUrl = (id) => `https://lh3.googleusercontent.com/d/${id}`;

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD";

const PRICE_LIST_MSG = `💰 আমাদের বিয়ের কার্ডের মূল্য তালিকা:

💚 Affordable Card:
• ৫০পিস: ২,৭৫০৳ | ১০০পিস: ৪,৫০০৳ | ২০০পিস: ৭,০০০৳

✨ Premium Card:
• ৫০পিস: ৩,২৫০৳ | ১০০পিস: ৫,৫০০৳ | ২০০পিস: ৯,০০০৳

🎁 ২০০+ পিস অর্ডারে ১টি ফ্রি নিকাহনামা সম্পূর্ণ ফ্রি!`;

// Deduplication map in memory
const processedEvents = new Set();

// Helper to send text message via Facebook Messenger API
async function sendMessengerText(recipientId, text, quickReplies = []) {
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const payload = {
    recipient: { id: recipientId },
    message: { text }
  };

  if (quickReplies.length > 0) {
    payload.message.quick_replies = quickReplies.map(qr => ({
      content_type: "text",
      title: qr.title,
      payload: qr.payload
    }));
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Error sending Messenger text:', err);
  }
}

// Send Messenger Native Carousel (Clean photos, NO prices under cards, NO online order button under cards, WITH "👉 আরও দেখুন" button!)
async function sendMessenger8CardGallery(recipientId, type = 'affordable', offset = 0) {
  const idsList = type === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const batch = idsList.slice(offset, offset + 8);
  const typeLabel = type === 'premium' ? 'Premium' : 'Affordable';
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const elements = batch.map((id, index) => ({
    title: `🌸 ${typeLabel} Card #${offset + index + 1}`,
    subtitle: `BOONDHON Printing House`,
    image_url: driveUrl(id)
  }));

  const payload = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
        }
      }
    }
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Error sending Messenger carousel:', err);
  }

  const nextOffset = offset + batch.length;
  const hasMore = nextOffset < idsList.length;

  const quickReplies = [];
  if (hasMore) {
    quickReplies.push({ title: "👉 আরও দেখুন", payload: `MORE_${type.toUpperCase()}_${nextOffset}` });
  }
  quickReplies.push({ title: type === 'premium' ? "💚 Affordable Card" : "✨ Premium Card", payload: type === 'premium' ? "BTN_AFFORDABLE" : "BTN_PREMIUM" });
  quickReplies.push({ title: "💰 মূল্য তালিকা", payload: "BTN_PRICE" });

  const text = `🌸 BOONDHON ${typeLabel} গ্যালারি (${offset + 1} - ${offset + batch.length} নম্বর ডিজাইন)\n\nআরও ডিজাইন দেখতে "👉 আরও দেখুন" বাটনে চাপ দিন:`;
  await sendMessengerText(recipientId, text, quickReplies);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.VERIFY_TOKEN || "BOONDHON_SECRET_2026";

    if (mode && token === verifyToken) {
      console.log('Messenger Webhook Verified!');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification Failed');
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'page') {
        res.status(200).send('EVENT_RECEIVED');

        body.entry?.forEach(entry => {
          const webhookEvent = entry.messaging?.[0];
          if (webhookEvent) {
            if (webhookEvent.delivery || webhookEvent.read || webhookEvent.message?.is_echo) return;

            const senderId = webhookEvent.sender?.id;
            if (!senderId) return;

            const messageId = webhookEvent.message?.mid || `${senderId}_${webhookEvent.timestamp}`;
            if (processedEvents.has(messageId)) return;
            processedEvents.add(messageId);
            if (processedEvents.size > 200) processedEvents.clear();

            const message = webhookEvent.message;
            const postback = webhookEvent.postback;

            let text = message?.text || postback?.payload || '';
            let payload = message?.quick_reply?.payload || postback?.payload || '';
            const txt = text.toLowerCase();

            appendMessage(senderId, 'customer', text);

            if (payload.startsWith('MORE_AFFORDABLE_')) {
              const offset = parseInt(payload.replace('MORE_AFFORDABLE_', '')) || 8;
              sendMessenger8CardGallery(senderId, 'affordable', offset);
            } else if (payload.startsWith('MORE_PREMIUM_')) {
              const offset = parseInt(payload.replace('MORE_PREMIUM_', '')) || 8;
              sendMessenger8CardGallery(senderId, 'premium', offset);
            } else if (payload === 'BTN_AFFORDABLE' || txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল')) {
              sendMessenger8CardGallery(senderId, 'affordable', 0);
            } else if (payload === 'BTN_PREMIUM' || txt.includes('premium') || txt.includes('প্রিমিয়াম')) {
              sendMessenger8CardGallery(senderId, 'premium', 0);
            } else if (payload === 'BTN_PRICE' || txt.includes('price') || txt.includes('দাম') || txt.includes('মূল্য') || txt.includes('কত')) {
              sendMessengerText(senderId, PRICE_LIST_MSG, [
                { title: "💚 Affordable Card", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium Card", payload: "BTN_PREMIUM" }
              ]);
            } else {
              const welcomeText = `আসসালামু আলাইকুম! আমি বন্ধন প্রিন্টিং হাউস থেকে অনন্যা বলছি। কেমন আছেন আপনি? 🌸\n\nএখন আমাদের একটা দারুণ ধামাকা অফার চলছে—২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🎁\n\nকার্ডের ডিজাইন দেখতে নিচের বাটনে ক্লিক করুন:`;
              const quickReplies = [
                { title: "💚 Affordable Card", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium Card", payload: "BTN_PREMIUM" },
                { title: "💰 মূল্য তালিকা", payload: "BTN_PRICE" }
              ];
              sendMessengerText(senderId, welcomeText, quickReplies);
            }
          }
        });
        return;
      }

      return res.status(404).send('Not a Messenger Event');
    } catch (err) {
      console.error('Error handling Messenger webhook:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
