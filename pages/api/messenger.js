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

const directCdnUrl = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;

const PAGE_ACCESS_TOKEN = (process.env.FB_PAGE_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD").trim();

const ORDER_RULES_MSG = `📋 BOONDHON অর্ডার ও ডেলিভারি পলিসি:

১. অ্যাডভান্স পেমেন্ট:
অর্ডার কনফার্ম করতে হবে মোট মূল্যের ৩০% এডভান্স পেমেন্ট।
পেমেন্ট করতে পারবেন নিম্নলিখিত মাধ্যমে: বিকাশ, নগদ, রকেট (পার্সোনাল) নম্বর: 01682588856.

২. ডিজাইন প্রক্রিয়া:
আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে পাঠাবে।
আপনি ডিজাইন চূড়ান্ত করার পর আমরা প্রিন্ট প্রক্রিয়া শুরু করব।

৩. ডেলিভারি এবং পেমেন্ট:
প্রিন্ট শেষে কার্ড রেডি করে জেলা শহরে ক্যাশ অন ডেলিভারি-এর মাধ্যমে পাঠানো হবে।
কুরিয়ার ডেলিভারি গ্রহণের সময় বাকি ৭০% পেমেন্ট করতে হবে।
জেলা শহরের বাইরে ক্যাশ অন ডেলিভারি উপলব্ধ নয়।
এছাড়া সরাসরি আমাদের অফিস বা কারখানা থেকে সংগ্রহ করতে পারবেন।

৪. ডেলিভারি সময়:
কার্ড ডেলিভারি পেতে ৫ থেকে ৭ কর্মদিবস সময় লাগবে।`;

const BANGLA_ORDER_FORM_TEXT = `📝 বিয়ের কার্ডের বাংলা ফর্ম: 🌸

বর-
নামঃ
পিতাঃ
মাতাঃ
ঠিকানাঃ

কনে-
নামঃ
পিতাঃ
মাতাঃ
ঠিকানাঃ

গায়ে হলুদ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

শুভ বিবাহ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

বৌ-ভাত-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

অভ্যর্থনায়-
(ছোট বাচ্চাদের নাম):
প্রয়োজনে (ফোন):
শুভেচ্ছান্তে নামঃ

🚚 কুরিয়ার ইনফো (নাম, মোবাইল, ঠিকানা):

(ফর্মটি কপি করে পূরণ করে পাঠান! 🥰)`;

const ENGLISH_ORDER_FORM_TEXT = `📝 Wedding Card English Order Form: 🌸

Groom-
Name:
Father:
Mother:
Address:

Bride-
Name:
Father:
Mother:
Address:

Gaye Holud-
Date (English):
Date (Bangla):
Day:
Time:
Venue:

Wedding-
Date (English):
Date (Bangla):
Day:
Time:
Venue:

Reception-
Date (English):
Date (Bangla):
Day:
Time:
Venue:

Regards / Compliments Name:
Kids Names:
Phone:

🚚 Courier Delivery Info (Name, Phone, Full Address):

(Please copy, fill up and send back! 🥰)`;

const PRICE_LIST_MSG = `💰 আমাদের বিয়ের কার্ডের মূল্য তালিকা:

💚 Affordable Card:
• ৫০পিস: ২,৭৫০৳ | ১০০পিস: ৪,৫০০৳ | ২০০পিস: ৭,০০০৳

✨ Premium Card:
• ৫০পিস: ৩,২৫০৳ | ১০০পিস: ৫,৫০০৳ | ২০০পিস: ৯,০০০৳

🎁 ২০০+ পিস অর্ডারে ১টি ফ্রি নিকাহনামা সম্পূর্ণ ফ্রি!`;

// Deduplication map in memory
const processedEvents = new Set();

// Helper to send text message with Buttons via Quick Replies or Button Template
async function sendMessengerText(recipientId, text, buttons = []) {
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  let payload;
  if (buttons.length > 3) {
    payload = {
      recipient: { id: recipientId },
      message: {
        text: text,
        quick_replies: buttons.map(b => ({
          content_type: "text",
          title: b.title.substring(0, 20),
          payload: b.payload
        }))
      }
    };
  } else if (buttons.length > 0) {
    payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: text,
            buttons: buttons.map(b => ({
              type: "postback",
              title: b.title.substring(0, 20),
              payload: b.payload
            }))
          }
        }
      }
    };
  } else {
    payload = {
      recipient: { id: recipientId },
      message: { text }
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Messenger Text Error:', JSON.stringify(data));
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: text }
        })
      });
    }
  } catch (err) {
    console.error('Error sending Messenger text:', err);
  }
}

// Send image message
async function sendMessengerImage(recipientId, imageUrl) {
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const payload = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "image",
        payload: { url: imageUrl, is_reusable: true }
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      console.error('Messenger Image Send Error:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('Error sending image:', err);
  }
}

// Send ALL 5 Buttons in 1 single message block!
async function send5MessengerButtons(recipientId, messageText) {
  const all5Buttons = [
    { title: "💚 Affordable Card", payload: "BTN_AFFORDABLE" },
    { title: "✨ Premium Card", payload: "BTN_PREMIUM" },
    { title: "💰 মূল্য তালিকা", payload: "BTN_PRICE" },
    { title: "📝 বাংলা ও Eng ফর্ম", payload: "BTN_FORM" },
    { title: "🚚 ডেলিভারি পলিসি", payload: "BTN_POLICY" }
  ];
  await sendMessengerText(recipientId, messageText, all5Buttons);
}

// Send 8 Card Gallery Batch with 👉 আরও দেখুন pagination button!
async function sendMessenger8CardGallery(recipientId, type = 'affordable', offset = 0) {
  const idsList = type === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const batch = idsList.slice(offset, offset + 8);
  const typeLabel = type === 'premium' ? 'Premium' : 'Affordable';
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  // 1. Send Batch of 8 Card Images via Meta Generic Template Carousel!
  const elements = batch.map((id, index) => ({
    title: `🌸 ${typeLabel} Card #${offset + index + 1}`,
    subtitle: `BOONDHON Printing House`,
    image_url: directCdnUrl(id)
  }));

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "template",
            payload: { template_type: "generic", elements: elements }
          }
        }
      })
    });
  } catch (err) {
    console.error('Error sending carousel batch:', err);
  }

  await new Promise(r => setTimeout(r, 400));

  // 2. Build Buttons including 👉 আরও দেখুন if more images exist
  const nextOffset = offset + batch.length;
  const hasMore = nextOffset < idsList.length;

  const buttons = [];
  if (hasMore) {
    buttons.push({ title: "👉 আরও দেখুন", payload: `MORE_${type.toUpperCase()}_${nextOffset}` });
  }
  buttons.push({ title: type === 'premium' ? "💚 Affordable Card" : "✨ Premium Card", payload: type === 'premium' ? "BTN_AFFORDABLE" : "BTN_PREMIUM" });
  buttons.push({ title: "💰 মূল্য তালিকা", payload: "BTN_PRICE" });
  buttons.push({ title: "📝 বাংলা ও Eng ফর্ম", payload: "BTN_FORM" });
  buttons.push({ title: "🚚 ডেলিভারি পলিসি", payload: "BTN_POLICY" });

  const text = `🌸 BOONDHON ${typeLabel} গ্যালারি (${offset + 1} - ${offset + batch.length} নম্বর ডিজাইন)\n\nপরের ৮টি ছবি দেখতে "👉 আরও দেখুন" বাটন চাপুন:`;
  await sendMessengerText(recipientId, text, buttons);
  appendMessage(recipientId, 'bot', text);
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
        const entries = body.entry || [];

        for (const entry of entries) {
          const webhookEvent = entry.messaging?.[0];
          if (webhookEvent) {
            if (webhookEvent.delivery || webhookEvent.read) continue;

            if (webhookEvent.message?.is_echo && webhookEvent.message?.app_id === "2563899990649523") {
              continue;
            }

            const senderId = webhookEvent.sender?.id;
            if (!senderId) continue;

            const postbackPayload = webhookEvent.postback?.payload || '';
            const quickReplyPayload = webhookEvent.message?.quick_reply?.payload || '';
            const messageId = webhookEvent.message?.mid || `${senderId}_${webhookEvent.timestamp}_${postbackPayload || quickReplyPayload}`;

            if (processedEvents.has(messageId)) continue;
            processedEvents.add(messageId);
            if (processedEvents.size > 200) processedEvents.clear();

            const message = webhookEvent.message;
            const postback = webhookEvent.postback;

            let text = message?.text || postback?.payload || postback?.title || '';
            let payload = quickReplyPayload || postbackPayload || '';
            const txt = text.toLowerCase();

            appendMessage(senderId, 'customer', text);

            if (payload.startsWith('MORE_AFFORDABLE_')) {
              const offset = parseInt(payload.replace('MORE_AFFORDABLE_', '')) || 8;
              await sendMessenger8CardGallery(senderId, 'affordable', offset);
            } else if (payload.startsWith('MORE_PREMIUM_')) {
              const offset = parseInt(payload.replace('MORE_PREMIUM_', '')) || 8;
              await sendMessenger8CardGallery(senderId, 'premium', offset);
            } else if (payload === 'BTN_AFFORDABLE' || txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল')) {
              await sendMessenger8CardGallery(senderId, 'affordable', 0);
            } else if (payload === 'BTN_PREMIUM' || txt.includes('premium') || txt.includes('প্রিমিয়াম')) {
              await sendMessenger8CardGallery(senderId, 'premium', 0);
            } else if (payload === 'BTN_POLICY' || txt.includes('policy') || txt.includes('পলিসি') || txt.includes('ডেলিভারি') || txt.includes('কুরিয়ার')) {
              await send5MessengerButtons(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);
            } else if (payload === 'BTN_PRICE' || txt.includes('price') || txt.includes('দাম') || txt.includes('মূল্য') || txt.includes('কত')) {
              await send5MessengerButtons(senderId, PRICE_LIST_MSG);
              appendMessage(senderId, 'bot', PRICE_LIST_MSG);
            } else if (payload === 'BTN_FORM' || txt.includes('form') || txt.includes('ফর্ম')) {
              await sendMessengerText(senderId, BANGLA_ORDER_FORM_TEXT);
              await send5MessengerButtons(senderId, ENGLISH_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', BANGLA_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', ENGLISH_ORDER_FORM_TEXT);
            } else {
              const welcomeText = `আসসালামু আলাইকুম! আমি বন্ধন প্রিন্টিং হাউস থেকে অনন্যা বলছি। কেমন আছেন আপনি? 🌸\n\nএখন আমাদের একটা দারুণ ধামাকা অফার চলছে—২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🎁\n\nকার্ডের ডিজাইন ও সুবিধা দেখতে নিচের ৫টি বাটনের যেকোনো একটিতে ক্লিক করুন:`;
              await send5MessengerButtons(senderId, welcomeText);
              appendMessage(senderId, 'bot', welcomeText);
            }
          }
        });

        return res.status(200).send('EVENT_RECEIVED');
      }

      return res.status(404).send('Not a Messenger Event');
    } catch (err) {
      console.error('Error handling Messenger webhook:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
