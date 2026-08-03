const AFFORDABLE_IDS = [
  "1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD","1cOCFSa1ap-Z54Ldf2AuoUKlEaQ5Ccql-","1dbYH2L4QykEUhYXGQPzQZObEuHFdwKsT",
  "1HJTtR-zhhg6v2ph7MikdMDWI-LWJgG0z","1PRlMp4F1xnQJPURON535pl7t08_thXVA","1UEAeYYB3Bt5vMYEL-a7AcV1aV21Z04si",
  "1-_qTV4gq0oKMdfMRxlTZL3yUO98ZGAoi","15yHXRk2mHI6-cKeooRqT20XeHubRRrPN","1Yrcqj5g0sZDrL3QaEkfEmKnF12BEs6ir",
  "1vXwJ68j7x5qfpZdHkMkqLn0tvpblGDpl","1GWw91oefwyYr9sHSQXjePTSX-KwPjy7I","1_tnTz7HWDf4CVJHORPlani7pjEcLdm7X",
  "1OMy_r94N_iUqvPW1t5fAGa4Sv3C_MIqF","1rXCxMziCgTImURvkahNp-AvneVljg-CW","1k_hzTbXOxxJg9rJ2OW-tnIkzLNYUqkOf",
  "1bgYpcqh4pVLDy8yfwrS40X5ejtCFxmFv","1tLW7C2gwOmlZzGXh3bw0o7xjAPKrudIA","1ZEGHQfvuKNv-J5ZZadHKGfVAe4cvQnGq",
  "1WE3kfWsd-0nrptiQ0fWi3dsd4iEcdw3t","1kLilyZRrhgrRfHn4aiTEcUBOu5fNDegs","1Cf7jQxeb5pyXvnA6HzGg_dYk3ZBrJ9z5",
  "11UIRwmetqLkMU5qThwv5Vc7GnuASrZSa","1eXUGJyYhnNBXZ7PFwDgXgY-ql8cYADsh","1weNuPU3fBvPMkbFAGPiMm_ttEETSuQ9A"
];

const PREMIUM_IDS = [
  "182kOjBhoaqOTq7nr4ryI6re6fRuLITbH","1cTfbTDJDqBjsV-r7V1OjBZ-Z6tUAqwxj","1cA-MfI55Hh7ibreMQ4zPvt2i_LKxVHkR",
  "1fvtC5mT4slvV_kROIej7awAGmCRc7TUl","1rLVZUQ8lw6ilWM76xxARtbUreQ3JIkdi","15AQWI3wP2a57-3OxHZTCfSbskgvC5YvH",
  "1ahoubjUVdc9SJyi5n2rzZIsbugjCjHiz","1qlwwRe2Mr_gb8CZjkeG0-YxBSGmOHzZu","1oOdGtYFTz-xNmSLUO-VFS1YODqYZ74HJ",
  "1zBBLQOfuAaPXhyr6At3tJ5DlTZ_nXfLy","11GVK5OYU7bjf8YaHeNAAnAHPks3T1Jme","1Kat8i9M3usZX8iX2xUCcX08RVocX9kKB",
  "1f327zMbxf9s_Z2WSYhA4cAIF_NBiveKW","1T_pxOh0mn36N882wUMyYSsXKoZE4w1XA","1OQqgPUW0j1C5Ggvh50oTnnw5VsgEQv5I",
  "15FGsZ0xdZd7DYZb4awafD8ysH_8g-A9O","1KUI4gzdhT-1I_LpzCMCQL8Sgfy4dU_Im","1amD4c_CLTODq8nca3N_H40vPiYp53VTm"
];

const driveUrl = (id) => `https://lh3.googleusercontent.com/d/${id}`;

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD";

const ORDER_RULES_MSG = `📋 অর্ডার করার নিয়মাবলী:
১. মোট মূল্যের ৩০% এডভান্স (পেমেন্ট) করে অর্ডার কনফার্ম করতে হবে।
২. পেমেন্ট নম্বর: বিকাশ/নগদ/রকেট (পারসোনাল): 01682588856
৩. আমাদের ডিজাইনার কার্ডের ডেমো ডিজাইন তৈরি করে আপনাকে পাঠাবে। চূড়ান্ত অনুমোদনের পর প্রিন্ট করা হবে।
৪. প্রিন্ট শেষে জেলা শহরে ক্যাশ অন ডেলিভারি দেওয়া হবে। গ্রহণের সময় বাকি ৭০% পেমেন্ট করতে হবে।
৫. ডেলিভারি পেতে ৫ থেকে ৭ কর্মদিবস সময় লাগবে।`;

const BANGLA_ORDER_FORM_TEXT = `📝 *বিয়ের কার্ডের বাংলা ফর্ম* 🌸

বর-
নাম:
পিতা:
মাতা:
ঠিকানা:

কনে-
নাম:
পিতা:
মাতা:
ঠিকানা:

গায়ে হলুদ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজ:
সময়:
স্থান:

শুভ বিবাহ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজ:
সময়:
স্থান:

বৌ-ভাত-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজ:
সময়:
স্থান:

ধন্যবাদান্তে
(ছোট সোনামণিদের নাম):
প্রয়োজনে (ফোন):
শুভেচ্ছান্তে নাম:

🚚 কুরিয়ার ইনফক্স (নাম, মোবাইল, ঠিকানা):

(লেখাটি কপি করে পূরণ করে পাঠান) 🌸`;

// Helper to send single image with caption
async function sendWhatsAppImage(phoneId, to, imageUrl, caption) {
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "image",
        image: { link: imageUrl, caption: caption || "" }
      })
    });
  } catch (err) {
    console.error('Error sending WhatsApp image:', err);
  }
}

// Helper to send text reply
async function sendWhatsAppMessage(phoneId, to, text) {
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: text }
      })
    });
  } catch (err) {
    console.error('Error in sendWhatsAppMessage:', err);
  }
}

// Helper to send interactive buttons
async function sendWhatsAppInteractive(phoneId, to, bodyText, buttons, imageUrl) {
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      footer: { text: "BOONDHON Printing House — মানিকগঞ্জ" },
      action: {
        buttons: buttons.map((b, i) => ({
          type: "reply",
          reply: { id: b.id || `btn_${i}`, title: b.title }
        }))
      }
    }
  };

  if (imageUrl) {
    payload.interactive.header = {
      type: "image",
      image: { link: imageUrl }
    };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      await sendWhatsAppMessage(phoneId, to, bodyText);
    }
  } catch (err) {
    await sendWhatsAppMessage(phoneId, to, bodyText);
  }
}

// Send batch of 8 card images sequentially and then send "আরও দেখুন" button
async function send8CardGallery(phoneId, to, type, offset = 0) {
  const idsList = type === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const batch = idsList.slice(offset, offset + 8);
  const typeLabel = type === 'premium' ? 'Premium' : 'Affordable';

  // Send 8 images sequentially with strict delay so Meta delivers all 8 images first
  for (let i = 0; i < batch.length; i++) {
    const id = batch[i];
    const itemNum = offset + i + 1;
    const caption = `🌸 ${typeLabel} Card #${itemNum} — BOONDHON`;
    await sendWhatsAppImage(phoneId, to, driveUrl(id), caption);
    await new Promise(r => setTimeout(r, 450));
  }

  // Wait 1 second AFTER all 8 images finish sending before sending the button message
  await new Promise(r => setTimeout(r, 1000));

  const nextOffset = offset + batch.length;
  const hasMore = nextOffset < idsList.length;

  const priceText = type === 'premium'
    ? '💰 Premium মূল্য তালিকা:\n• ৫০পিস: ৩,২৫০৳ | ১০০পিস: ৫,৫০০৳ | ২০০পিস: ৯,০০০৳\n🎁 ২০০+ পিসে ১টি ফ্রি নিকাহনামা!'
    : '💰 Affordable মূল্য তালিকা:\n• ৫০পিস: ২,৭৫০৳ | ১০০পিস: ৪,৫০০৳ | ২০০পিস: ৭,০০০৳\n🎁 ২০০+ পিসে ১টি ফ্রি নিকাহনামা!';

  const text = `🌸 BOONDHON ${typeLabel} গ্যালারি (${offset + 1} - ${offset + batch.length} নম্বর ডিজাইন)\n\n${priceText}\n\nআরও ডিজাইন দেখতে নিচে "👉 আরও দেখুন" বাটনে চাপ দিন:`;

  const buttons = [];
  if (hasMore) {
    buttons.push({ id: `more_${type}_${nextOffset}`, title: `👉 আরও দেখুন (${typeLabel})` });
  }
  buttons.push({ id: 'btn_order', title: '📝 অনলাইন অর্ডার' });
  buttons.push({ id: type === 'premium' ? 'btn_affordable' : 'btn_premium', title: type === 'premium' ? '💚 Affordable Card' : '✨ Premium Card' });

  await sendWhatsAppInteractive(phoneId, to, text, buttons);
}

// Send the exact text order form template from user's screenshot
async function sendTextOrderForm(phoneId, to) {
  await sendWhatsAppMessage(phoneId, to, ORDER_RULES_MSG);
  await sendWhatsAppMessage(phoneId, to, BANGLA_ORDER_FORM_TEXT);

  const buttonText = `অথবা সরাসরি ডিজিটাল ফর্মে তথ্য পূরণ করতে আমাদের ওয়েবসাইটে ভিসিট করুন:\n👉 https://boondhon-platform-qr9a.vercel.app/order`;
  const buttons = [
    { id: 'btn_affordable', title: '💚 Affordable Card' },
    { id: 'btn_premium', title: '✨ Premium Card' }
  ];
  await sendWhatsAppInteractive(phoneId, to, buttonText, buttons);
}

export default async function handler(req, res) {
  // ── 1. WEBHOOK VERIFICATION (GET REQUEST) ──
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.VERIFY_TOKEN || "BOONDHON_SECRET_2026";

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WhatsApp Webhook Verified Successfully!');
        return res.status(200).send(challenge);
      }
    }
    return res.status(403).send('Verification Failed');
  }

  // ── 2. HANDLE INCOMING MESSAGES (POST REQUEST) ──
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message) {
          const from = message.from;
          const phoneId = value?.metadata?.phone_number_id;

          let rawMsg = '';
          let btnId = '';

          if (message.type === 'text') {
            rawMsg = message.text?.body || '';
          } else if (message.type === 'interactive') {
            rawMsg = message.interactive?.button_reply?.title || '';
            btnId = message.interactive?.button_reply?.id || '';
          } else if (message.type === 'button') {
            rawMsg = message.button?.text || '';
            btnId = message.button?.payload || '';
          } else {
            rawMsg = message.caption || 'Hi';
          }

          const txt = rawMsg.toLowerCase();

          if (from && phoneId) {
            // Check for "আরও দেখুন" (More) batch clicks
            if (btnId.startsWith('more_affordable_') || txt.includes('more_affordable')) {
              const offset = parseInt(btnId.replace('more_affordable_', '')) || 8;
              await send8CardGallery(phoneId, from, 'affordable', offset);
            }
            else if (btnId.startsWith('more_premium_') || txt.includes('more_premium')) {
              const offset = parseInt(btnId.replace('more_premium_', '')) || 8;
              await send8CardGallery(phoneId, from, 'premium', offset);
            }
            // Affordable initial click
            else if (txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল') || btnId === 'btn_affordable') {
              await send8CardGallery(phoneId, from, 'affordable', 0);
            }
            // Premium initial click
            else if (txt.includes('premium') || txt.includes('প্রিমিয়াম') || btnId === 'btn_premium') {
              await send8CardGallery(phoneId, from, 'premium', 0);
            }
            // Order Form click or request -> Send exact Text Order Form from user screenshot
            else if (btnId === 'btn_order' || txt.includes('অর্ডার') || txt.includes('order') || txt.includes('ফর্ম') || txt.includes('form')) {
              await sendTextOrderForm(phoneId, from);
            }
            // Policy click
            else if (txt.includes('policy') || txt.includes('পলিসি') || txt.includes('ঠিকানা') || btnId === 'btn_policy' || txt.includes('অফিস')) {
              const replyText = `🚚 পেমেন্ট, ডেলিভারি ও ঠিকানা পলিসি:\n\n📍 অফিস ঠিকানা: মানিকগঞ্জ\n💳 পেমেন্ট পদ্ধতি: বিকাশ/নগদ/রকেট (01682588856)\n📝 অর্ডার নিয়ম: ৩০% অগ্রিম বুকিং ফি প্রদান করে ডেমো দেখে Approve করতে হয়।\n🚚 ডেলিভারি সময়: ৫-৭ কর্মদিবস (সুন্দরবন/এসএ পরিবহন)\n\n📝 অনলাইন অর্ডার ফর্ম: https://boondhon-platform-qr9a.vercel.app/order`;
              const buttons = [
                { id: 'btn_affordable', title: '💚 Affordable Card' },
                { id: 'btn_premium', title: '✨ Premium Card' }
              ];
              await sendWhatsAppInteractive(phoneId, from, replyText, buttons);
            }
            // Default Welcome Greeting
            else {
              const replyText = `আসসালামু আলাইকুম! আমি বন্ধন প্রিন্টিং হাউস থেকে অনন্যা বলছি। কেমন আছেন আপনি? 🌸\n\nএখন আমাদের একটা দারুণ ধামাকা অফার চলছে—**২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি!** 🎁\n\nকার্ডের ডিজাইন দেখতে নিচের বাটনে ক্লিক করুন:`;
              const buttons = [
                { id: 'btn_affordable', title: '💚 Affordable Card' },
                { id: 'btn_premium', title: '✨ Premium Card' },
                { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
              ];
              await sendWhatsAppInteractive(phoneId, from, replyText, buttons, driveUrl("1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD"));
            }
          }
        }
        return res.status(200).send('EVENT_RECEIVED');
      }

      return res.status(404).send('Not a WhatsApp Event');
    } catch (err) {
      console.error('Error handling WhatsApp message:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
