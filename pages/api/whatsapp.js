import { getConversation, appendMessage } from '../../lib/chat-store';

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

const WHATSAPP_TOKEN = (process.env.WHATSAPP_TOKEN || "").trim();

const ORDER_RULES_MSG = `📋 অর্ডার করার নিয়মাবলী:
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

📦 কার্ডের পরিমাণ (কত পিস): 
🎨 পছন্দের কার্ড কোড (যদি থাকে): 

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

const ENGLISH_ORDER_FORM_TEXT = `📝 Wedding Card English Form: ✨

📦 Card Quantity (How many pcs): 
🎨 Preferred Card Code (If any): 

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

Holud-
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

Reception / Bou-Bhat-
Date (English):
Date (Bangla):
Day:
Time:
Venue:

RSVP / Welcome-
Children Names:
Contact Phone:
Regards:

🚚 Courier Info (Name, Mobile, Address):

(Please copy the form, fill it up and send here! 🥰)`;

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

  for (let i = 0; i < batch.length; i++) {
    const id = batch[i];
    const itemNum = offset + i + 1;
    const caption = `🌸 ${typeLabel} Card #${itemNum} — BOONDHON`;
    const imgUrl = driveUrl(id);
    await sendWhatsAppImage(phoneId, to, imgUrl, caption);
    appendMessage(to, 'bot', caption, imgUrl);
    await new Promise(r => setTimeout(r, 450));
  }

  await new Promise(r => setTimeout(r, 1000));

  const nextOffset = offset + batch.length;
  const hasMore = nextOffset < idsList.length;

  const text = `🌸 BOONDHON ${typeLabel} গ্যালারি (${offset + 1} - ${offset + batch.length} নম্বর ডিজাইন)\n\nআরও ডিজাইন দেখতে নিচে "👉 আরও দেখুন" বাটনে চাপ দিন:`;

  const buttons = [];
  if (hasMore) {
    buttons.push({ id: `more_${type}_${nextOffset}`, title: '👉 আরও দেখুন' });
  }
  buttons.push({ id: 'btn_order', title: '📝 অনলাইন অর্ডার' });
  buttons.push({ id: type === 'premium' ? 'btn_affordable' : 'btn_premium', title: type === 'premium' ? '💚 Affordable' : '✨ Premium' });

  await sendWhatsAppInteractive(phoneId, to, text, buttons);
  appendMessage(to, 'bot', text);
}

// Ask user whether they want Bangla or English Order Form
async function askWhatsAppFormLanguage(phoneId, to) {
  const text = `আপনার বিয়ের কার্ডটি কি বাংলায় হবে নাকি ইংরেজিতে? 🌸\nনিচের বাটন থেকে আপনার পছন্দের ফর্মটি বেছে নিন:`;
  const buttons = [
    { id: 'btn_form_bn', title: '🇧🇩 বাংলা ফর্ম' },
    { id: 'btn_form_en', title: '🇬🇧 English Form' }
  ];
  await sendWhatsAppInteractive(phoneId, to, text, buttons);
  appendMessage(to, 'bot', text);
}

// Send the exact text order form template based on selected language
async function sendWhatsAppForm(phoneId, to, lang = 'bn') {
  const formText = lang === 'en' ? ENGLISH_ORDER_FORM_TEXT : BANGLA_ORDER_FORM_TEXT;
  await sendWhatsAppMessage(phoneId, to, ORDER_RULES_MSG);
  await sendWhatsAppMessage(phoneId, to, formText);

  const buttonText = `অথবা সরাসরি ডিজিটাল ফর্মে তথ্য পূরণ করতে আমাদের ওয়েবসাইটে ভিসিট করুন:\n👉 https://boondhon-platform-qr9a.vercel.app/order`;
  const buttons = [
    { id: lang === 'en' ? 'btn_form_bn' : 'btn_form_en', title: lang === 'en' ? '🇧🇩 বাংলা ফর্ম' : '🇬🇧 English Form' },
    { id: 'btn_affordable', title: '💚 Affordable' },
    { id: 'btn_premium', title: '✨ Premium' }
  ];
  await sendWhatsAppInteractive(phoneId, to, buttonText, buttons);

  appendMessage(to, 'bot', ORDER_RULES_MSG);
  appendMessage(to, 'bot', formText);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = (process.env.VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || "").trim();

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WhatsApp Webhook Verified Successfully!');
        return res.status(200).send(challenge);
      }
    }
    return res.status(403).send('Verification Failed');
  }

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
            const senderName = value?.contacts?.[0]?.profile?.name || '';
            appendMessage(from, 'customer', rawMsg, null, senderName);

            const existingConv = getConversation(from);
            if (existingConv && existingConv.humanTakeover === true) {
              console.log(`Human Takeover ACTIVE for ${from}. Skipping AI Bot reply.`);
              return res.status(200).send('EVENT_RECEIVED_HUMAN_TAKEOVER');
            }

            if (btnId.startsWith('more_affordable_') || txt.includes('more_affordable')) {
              const offset = parseInt(btnId.replace('more_affordable_', '')) || 8;
              await send8CardGallery(phoneId, from, 'affordable', offset);
            }
            else if (btnId.startsWith('more_premium_') || txt.includes('more_premium')) {
              const offset = parseInt(btnId.replace('more_premium_', '')) || 8;
              await send8CardGallery(phoneId, from, 'premium', offset);
            }
            else if (txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল') || btnId === 'btn_affordable') {
              await send8CardGallery(phoneId, from, 'affordable', 0);
            }
            else if (txt.includes('premium') || txt.includes('প্রিমিয়াম') || btnId === 'btn_premium') {
              await send8CardGallery(phoneId, from, 'premium', 0);
            }
            else if (btnId === 'btn_form_bn' || txt.includes('bangla form') || (txt.includes('বাংলা') && (txt.includes('ফর্ম') || txt.includes('form')))) {
              await sendWhatsAppForm(phoneId, from, 'bn');
            }
            else if (btnId === 'btn_form_en' || txt.includes('english form') || ((txt.includes('english') || txt.includes('ইংরেজি') || txt.includes('ইংলিশ')) && (txt.includes('ফর্ম') || txt.includes('form')))) {
              await sendWhatsAppForm(phoneId, from, 'en');
            }
            else if (btnId === 'btn_order' || txt.includes('অর্ডার') || txt.includes('order') || txt.includes('ফর্ম') || txt.includes('form')) {
              await askWhatsAppFormLanguage(phoneId, from);
            }
            else if (txt.includes('policy') || txt.includes('পলিসি') || txt.includes('ঠিকানা') || btnId === 'btn_policy' || txt.includes('অফিস')) {
              await sendWhatsAppMessage(phoneId, from, ORDER_RULES_MSG);
            }
            else {
              const replyText = `আসসালামু আলাইকুম! আমি বন্ধন প্রিন্টিং হাউস থেকে অনন্যা বলছি। কেমন আছেন আপনি? 🌸\n\nএখন আমাদের একটা দারুণ ধামাকা অফার চলছে—**২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি!** 🎁\n\nকার্ডের ডিজাইন দেখতে নিচের বাটনে ক্লিক করুন:`;
              const buttons = [
                { id: 'btn_affordable', title: '💚 Affordable' },
                { id: 'btn_premium', title: '✨ Premium' },
                { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
              ];
              await sendWhatsAppInteractive(phoneId, from, replyText, buttons);
              appendMessage(from, 'bot', replyText);
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
