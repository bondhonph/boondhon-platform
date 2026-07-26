const AFFORDABLE_IDS = [
  "1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD",
  "1cOCFSa1ap-Z54Ldf2AuoUKlEaQ5Ccql-",
  "1dbYH2L4QykEUhYXGQPzQZObEuHFdwKsT",
  "1HJTtR-zhhg6v2ph7MikdMDWI-LWJgG0z",
  "1PRlMp4F1xnQJPURON535pl7t08_thXVA",
  "1UEAeYYB3Bt5vMYEL-a7AcV1aV21Z04si",
  "1-_qTV4gq0oKMdfMRxlTZL3yUO98ZGAoi",
  "15yHXRk2mHI6-cKeooRqT20XeHubRRrPN",
  "1Yrcqj5g0sZDrL3QaEkfEmKnF12BEs6ir",
  "1vXwJ68j7x5qfpZdHkMkqLn0tvpblGDpl"
];

const PREMIUM_IDS = [
  "182kOjBhoaqOTq7nr4ryI6re6fRuLITbH",
  "1cTfbTDJDqBjsV-r7V1OjBZ-Z6tUAqwxj",
  "1cA-MfI55Hh7ibreMQ4zPvt2i_LKxVHkR",
  "1fvtC5mT4slvV_kROIej7awAGmCRc7TUl",
  "1rLVZUQ8lw6ilWM76xxARtbUreQ3JIkdi",
  "15AQWI3wP2a57-3OxHZTCfSbskgvC5YvH",
  "1ahoubjUVdc9SJyi5n2rzZIsbugjCjHiz",
  "1qlwwRe2Mr_gb8CZjkeG0-YxBSGmOHzZu",
  "1oOdGtYFTz-xNmSLUO-VFS1YODqYZ74HJ",
  "1zBBLQOfuAaPXhyr6At3tJ5DlTZ_nXfLy"
];

const ORDER_POLICY_TEXT = `🛍️ অর্ডার করার নিয়মাবলী:
১. মোট মূল্যের ৩০% এডভান্স পেমেন্ট করে অর্ডার কনফার্ম করতে হবে।
২. পেমেন্ট নম্বর: বিকাশ/নগদ/রকেট (পার্সোনাল): 01682588856
৩. আমাদের ডিজাইনার কার্ডের ডেমো ডিজাইন তৈরি করে আপনাকে পাঠাবে। চূড়ান্ত অনুমোদনের পর প্রিন্ট করা হবে।
৪. প্রিন্ট শেষে জেলা শহরে ক্যাশ অন ডেলিভারি দেওয়া হবে। গ্রহণের সময় বাকি ৭০% পেমেন্ট করতে হবে।
৫. ডেলিভারি পেতে ৫ থেকে ৭ কর্মদিবস সময় লাগবে।`;

const DELIVERY_POLICY_TEXT = `🚚 ডেলিভারি ও পলিসি:
📍 অফিস: Manikganj
🏭 কারখানা: ফকিরাপুল, লালবাগকেল্লা, বাংলাবাজার, বাবুবাজার

📋 নিয়মাবলী:
১. বিলের ৩০% অ্যাডভান্স (01682588856)
২. ডেমো ডিজাইন approve করার পর print
৩. জেলা শহরে ক্যাশ অন ডেলিভারি
৪. ৫-৭ কর্মদিবসে ডেলিভারি
📞 হটলাইন: 01701016826 (WhatsApp)`;

const BANGLA_FORM_TEXT = `📝 বিয়ের কার্ডের বাংলা ফর্ম: 🌸

বর-
নামঃ
পিতাঃ
মাতাঃ
ঠিকানাঃ

কণে-
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

शुभ বিবাহ-
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

const DEFAULT_BUTTONS = [
  { id: 'btn_affordable', title: '💚 Affordable Card' },
  { id: 'btn_premium', title: '✨ Premium Card' },
  { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
];

// Helper to get random subset of image URLs
function getRandomImages(ids, count) {
  const shuffled = [...ids].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(id => `https://lh3.googleusercontent.com/d/${id}`);
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

  // ── 2. HANDLE INCOMING EVENTS (POST REQUEST) ──
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message) {
          const from = message.from; // Sender's phone number
          const phoneId = value?.metadata?.phone_number_id; // WhatsApp Phone ID

          if (phoneId && from) {
            // A. Handle Interactive Button Clicks
            if (message.type === 'interactive') {
              const buttonId = message.interactive?.button_reply?.id;
              await handleButtonClick(phoneId, from, buttonId);
            } 
            // B. Handle Text Messages
            else if (message.type === 'text') {
              const userMessage = message.text?.body || '';
              const lowerText = userMessage.toLowerCase().trim();

              // Check if user is asking for photos/images/designs
              const isPhotoReq = ['pic', 'picture', 'photo', 'ছবি', 'কার্ডের ছবি', 'ডিজাইন', 'সব ছবি', 'image'].some(w => lowerText.includes(w));
              
              if (isPhotoReq) {
                await sendWhatsAppMessage(phoneId, from, 'আসসালামু আলাইকুম! বন্ধন প্রিন্টিং হাউজের ৫টি র্যান্ডম ডিজাইনের ছবি নিচে দেওয়া হলো: 🥰');
                // Send 5 random images
                const randomImgs = getRandomImages(AFFORDABLE_IDS, 5);
                for (const imgUrl of randomImgs) {
                  await sendWhatsAppImage(phoneId, from, imgUrl);
                }
                // Send menu buttons
                await sendWhatsAppButtons(phoneId, from, 'আরো ক্যাটাগরির কার্ড ও দাম দেখতে নিচের বাটনে ক্লিক করুন:', DEFAULT_BUTTONS);
              } 
              // Check if user is asking for order details/forms
              else if (['order', 'অর্ডার', 'ফরম', 'ফর্ম', 'কি লাগবে'].some(w => lowerText.includes(w))) {
                await sendWhatsAppMessage(phoneId, from, ORDER_POLICY_TEXT);
                await sendWhatsAppMessage(phoneId, from, BANGLA_FORM_TEXT);
                await sendWhatsAppButtons(phoneId, from, 'অর্ডার কনফার্ম করতে ৩০% অ্যাডভান্স করতে হবে। তথ্য জানতে নিচের বাটনে ক্লিক করুন:', [
                  { id: 'btn_affordable', title: '💚 Affordable Card' },
                  { id: 'btn_premium', title: '✨ Premium Card' },
                  { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
                ]);
              }
              // Normal query -> Route to Gemini AI
              else {
                const aiReply = await getAIResponse(userMessage);
                await sendWhatsAppButtons(phoneId, from, aiReply, DEFAULT_BUTTONS);
              }
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

// Handler for Quick Reply button clicks
async function handleButtonClick(phoneId, to, buttonId) {
  if (buttonId === 'btn_affordable') {
    const text = `💚 Affordable Card (দাম ও বাজেট):
50 পিস ➔ ২,৭৫০৳
100 পিস ➔ ৪,৫০০৳
200 পিস ➔ ৭,০০০৳ (+ ১টি প্রিমিয়াম নিকাহনামা একদম ফ্রি! 🎁)

অর্ডার বুকিং করতে ৩০% অ্যাডভান্স পেমেন্ট প্রযোজ্য। আমাদের ৫টি র্যান্ডম ডিজাইনের ছবি নিচে পাঠানো হলো: 👇`;
    await sendWhatsAppMessage(phoneId, to, text);
    
    // Send 5 random Affordable images
    const randomImgs = getRandomImages(AFFORDABLE_IDS, 5);
    for (const imgUrl of randomImgs) {
      await sendWhatsAppImage(phoneId, to, imgUrl);
    }
    
    // Next actions buttons
    await sendWhatsAppButtons(phoneId, to, 'পরবর্তী করণীয় নির্বাচন করুন:', [
      { id: 'btn_premium', title: '✨ Premium Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' },
      { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
    ]);
  } 
  else if (buttonId === 'btn_premium') {
    const text = `✨ Premium Card (এলিগ্যান্ট ও লাক্সারি):
50 পিস ➔ ৩,২৫০৳
100 পিস ➔ ৫,৫০০৳
200 পিস ➔ ৯,০০০৳ (+ ১টি প্রিমিয়াম নিকাহনামা একদম ফ্রি! 🎁)

অর্ডার বুকিং করতে ৩০% অ্যাডভান্স পেমেন্ট প্রযোজ্য। আমাদের ৫টি র্যান্ডম প্রিমিয়াম কালেকশনের ছবি নিচে পাঠানো হলো: 👇`;
    await sendWhatsAppMessage(phoneId, to, text);

    // Send 5 random Premium images
    const randomImgs = getRandomImages(PREMIUM_IDS, 5);
    for (const imgUrl of randomImgs) {
      await sendWhatsAppImage(phoneId, to, imgUrl);
    }

    // Next actions buttons
    await sendWhatsAppButtons(phoneId, to, 'পরবর্তী করণীয় নির্বাচন করুন:', [
      { id: 'btn_affordable', title: '💚 Affordable Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' },
      { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
    ]);
  } 
  else if (buttonId === 'btn_policy') {
    await sendWhatsAppMessage(phoneId, to, DELIVERY_POLICY_TEXT);
    await sendWhatsAppButtons(phoneId, to, 'অন্যান্য মেনু:', [
      { id: 'btn_affordable', title: '💚 Affordable Card' },
      { id: 'btn_premium', title: '✨ Premium Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
    ]);
  } 
  else if (buttonId === 'btn_order_form') {
    await sendWhatsAppMessage(phoneId, to, ORDER_POLICY_TEXT);
    await sendWhatsAppMessage(phoneId, to, BANGLA_FORM_TEXT);
    await sendWhatsAppButtons(phoneId, to, 'ফর্মটি পূরণ করতে বা ক্যাটালগ দেখতে নিচে চাপুন:', [
      { id: 'btn_affordable', title: '💚 Affordable Card' },
      { id: 'btn_premium', title: '✨ Premium Card' },
      { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
    ]);
  }
}

// Call Gemini AI for natural chat queries
async function getAIResponse(userMsg) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return 'আসসালামু আলাইকুম! আমি অনন্যা। বন্ধন প্রিন্টিং হাউজ থেকে বলছি। কীভাবে সাহায্য করতে পারি? 😊';

    const systemPrompt = `You are the official AI Sales Agent of BOONDHON Printing House, based in Manikganj, Bangladesh. Your name is "Ananya" (অনন্যা) — a warm, friendly, polite, highly converting Bengali sales executive.
Talk in Bengali (Bangladeshi colloquial style) mixed with some English words naturally. Keep responses short and friendly (2-3 sentences max).
Highlight limited time offer: "২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🎁"
Advance payment rule: 30% advance on bKash/Nagad/Rocket (01682588856).

PRICE GUIDE:
50 pcs → Affordable: ২,৭৫০৳ | Premium: ৩,২৫০৳
100 pcs → Affordable: ৪,৫০০৳ | Premium: ৫,৫০০৳
200 pcs → Affordable: ৭,০০০৳ | Premium: ৯,০০০৳ | FREE নিকাহনামা 🎁

👉 Website Order Link: https://project-bx7i1.vercel.app/order`;

    const contents = [{ role: 'user', parts: [{ text: userMsg }] }];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: 500, temperature: 0.8 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'আসসালামু আলাইকুম! আমি অনন্যা। আপনাকে কীভাবে সাহায্য করতে পারি? 😊';
    }
  } catch (err) {
    console.error('Gemini call failed in WhatsApp handler:', err.message);
  }
  return 'আসসালামু আলাইকুম! আমি অনন্যা। বন্ধন প্রিন্টিং হাউজে আপনাকে স্বাগতম। নিচে দেওয়া বাটনগুলোতে ক্লিক করে দাম বা ছবি দেখতে পারেন। 😊';
}

// Meta Graph API Call: Send Text
async function sendWhatsAppMessage(phoneId, to, text) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  if (!whatsappToken) return;

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
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
    console.error('Error in sendWhatsAppMessage:', err.message);
  }
}

// Meta Graph API Call: Send Interactive Buttons
async function sendWhatsAppButtons(phoneId, to, text, buttons) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  if (!whatsappToken) return;

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: text },
          action: {
            buttons: buttons.map(b => ({
              type: "reply",
              reply: { id: b.id, title: b.title }
            }))
          }
        }
      })
    });
  } catch (err) {
    console.error('Error in sendWhatsAppButtons:', err.message);
  }
}

// Meta Graph API Call: Send Image
async function sendWhatsAppImage(phoneId, to, imageUrl) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  if (!whatsappToken) return;

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "image",
        image: { link: imageUrl }
      })
    });
  } catch (err) {
    console.error('Error in sendWhatsAppImage:', err.message);
  }
}
