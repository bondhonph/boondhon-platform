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
  "1vXwJ68j7x5qfpZdHkMkqLn0tvpblGDpl",
  "1GWw91oefwyYr9sHSQXjePTSX-KwPjy7I",
  "1_tnTz7HWDf4CVJHORPlani7pjEcLdm7X",
  "1OMy_r94N_iUqvPW1t5fAGa4Sv3C_MIqF",
  "1rXCxMziCgTImURvkahNp-AvneVljg-CW",
  "1k_hzTbXOxxJg9rJ2OW-tnIkzLNYUqkOf",
  "1bgYpcqh4pVLDy8yfwrS40X5ejtCFxmFv",
  "1tLW7C2gwOmlZzGXh3bw0o7xjAPKrudIA",
  "1ZEGHQfvuKNv-J5ZZadHKGfVAe4cvQnGq",
  "1WE3kfWsd-0nrptiQ0fWi3dsd4iEcdw3t",
  "1kLilyZRrhgrRfHn4aiTEcUBOu5fNDegs",
  "1Cf7jQxeb5pyXvnA6HzGg_dYk3ZBrJ9z5",
  "11UIRwmetqLkMU5qThwv5Vc7GnuASrZSa",
  "1eXUGJyYhnNBXZ7PFwDgXgY-ql8cYADsh",
  "1weNuPU3fBvPMkbFAGPiMm_ttEETSuQ9A",
  "1PyKeX16mmVGaqKuZCujRskmip1LyGEgo",
  "1luY2hOgpjUjXr_lGJbCQTumxKZFZrmJ4",
  "1XanrmX4aOoDmjxha6lr5bYzlkZHglsTZ",
  "1BBFuVKgKRUJV2pubIWiXgZlT3582Vcup",
  "1wvf3jJjpV1sPuiO_Vj509y0UJABxbnuB",
  "1TkCMzyPmSk9m2bIrRUInOm6epp2TQnV1",
  "1H5lEN0baeoMMWL693BIXVYjrtZVipooO",
  "14UHCDYmLowJbPfS-7Ve2Nx-tKno1MJU0",
  "1CsDarakKEaGyVe8JqT05Mff988RztJX",
  "1IDHV2uPD4AHjhsk75GJSETp9qQdpqPB4",
  "1VGLRJbDyatJqfX0VEr3yGkRJMI23yRiL",
  "1v1Fb2d2CP-v4N7Z2qVIqywIyph673I5Y",
  "1X5yEsU9S8oYeFMEc8bjEm4XecbrR6fWA",
  "1BkNP_edXf6c3wIP5lALPG2sjSp1C3d3z",
  "1qKDy730IKVUH3e7U3zgUK863ekoYNGVS",
  "1OVG52rNA1Ud-pG6gA-RtyRZkhE85tgkK",
  "1nKQgpTV5txr5SO-6MYL4wnMskhLvkJJn",
  "1lmdXd0R5pgyJqXhgGwYzzerX4NXPpOyZ",
  "1cDyh8T6RQ7cOMY_js8TxQYrDO8BPy4cS",
  "1eBePCdCDIMMvu6rZd-feOqvI8jPX44PU",
  "1EOVX2gwvUotLFdfO5gO0Px8MaJwon9dY",
  "1yA0KGGFMfYUQ8-9hpotpxNhagSSdp7xD",
  "1inPC5SKDpW5epcxa-fFgXp9C9jowISPO",
  "1WDJrtj_A5gk6KfolOju3TzfyVUm5Gt40",
  "1gDDPhlDVI5Fu-nBdUPsM964FiuHz0YoU",
  "18hlxoUBDiBuV_nxiqfPffkmW5mGmxdZA",
  "1g7WVBZC6EqVPjZGqwnyYpDU-ehayWqCf",
  "1jdh-o3_3_4xJGQbumQ258HN0fuc9qkZo",
  "19-H4R6pAVCbU-P9BvLInXkcY2OZ1bUzo",
  "1aqEN_fGQfJOYP4T1EdZuRbc-UpXJPTNj",
  "1TtkzWXQisd7UShIg46wdW6vmWYbpUjkk",
  "1vj8zzSFy1H_c7fAGi_REfMR-R8IPwTfK",
  "1Q_DJOcMXmZrR7P9szIw9LWQ5-dyRLO2y"
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
  "1zBBLQOfuAaPXhyr6At3tJ5DlTZ_nXfLy",
  "11GVK5OYU7bjf8YaHeNAAnAHPks3T1Jme",
  "1Kat8i9M3usZX8iX2xUCcX08RVocX9kKB",
  "1f327zMbxf9s_Z2WSYhA4cAIF_NBiveKW",
  "1T_pxOh0mn36N882wUMyYSsXKoZE4w1XA",
  "1OQqgPUW0j1C5Ggvh50oTnnw5VsgEQv5I",
  "15FGsZ0xdZd7DYZb4awafD8ysH_8g-A9O",
  "1KUI4gzdhT-1I_LpzCMCQL8Sgfy4dU_Im",
  "1amD4c_CLTODq8nca3N_H40vPiY53VTm",
  "1j2a0DIwsKoXWomTJ9RuJm1RncFH3mbqg",
  "1Cl0fyeCN4T4mUxt-mhEQe6z6ZzBXsQsK",
  "1Tpq2cCmWEooN2SYUIEgq-elk6tRK_5tV",
  "1wlnH6L9DQcYtHHRDtPmrLGz-u6bslOgl",
  "1ZrP-OujlWQGLEln1u8YTa4e3kjQY0yzI",
  "1U6HoCb65TnMZsfKmGQ9wujvvppKzD7HY",
  "1pbevqRrVV2_aYSNSMF8q7jMqnDMGpAUn",
  "1KTSwcHJmwu1XximtqvbgSnP4Zrskg8T_",
  "1ZG7hoRZgcj5F_UMCidzJSI2yAYoiUAf6",
  "1uMyZI2cVy_uABGNPNoe-pXul2pPPhC_U",
  "1gITGc6TLsrSjYkdMhURcUUNQH1y1GFpc",
  "1FTFe6klyuHyUBsOfLeN_QsZABlhF_I1U"
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

// Helper to delay execution
const delay = ms => new Promise(res => setTimeout(res, ms));

// Helper to get random subset of image URLs up to a limit (default 12 for grid/album)
function getRandomImages(ids, count = 12) {
  const shuffled = [...ids].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, ids.length)).map(id => `https://lh3.googleusercontent.com/d/${id}`);
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
                await sendWhatsAppMessage(phoneId, from, 'আসসালামু আলাইকুম! বন্ধন প্রিন্টিং হাউজের আমাদের সেরা ১২টি চমৎকার ডিজাইনের ছবি নিচে অ্যালবাম আকারে দেওয়া হলো: 🥰');
                
                // Send 12 random images in parallel
                const randomImgs = getRandomImages(AFFORDABLE_IDS, 12);
                await Promise.all(randomImgs.map(imgUrl => sendWhatsAppImage(phoneId, from, imgUrl)));
                
                // Wait 2.5 seconds to ensure Meta processes and displays all images before the buttons!
                await delay(2500);

                // Prompt to see more images inside chat
                await sendWhatsAppButtons(phoneId, from, 'আমাদের কালেকশনের আরও চমৎকার ডিজাইন দেখতে নিচের যেকোনো বাটনে ক্লিক করুন:', [
                  { id: 'btn_more_affordable', title: '📸 আরও ছবি দেখুন' },
                  { id: 'btn_premium', title: '✨ Premium Card' },
                  { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
                ]);
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

অর্ডার বুকিং করতে ৩০% অ্যাডভান্স পেমেন্ট প্রযোজ্য। আমাদের সেরা ১২টি সাশ্রয়ী ডিজাইনের ছবি নিচে পাঠানো হলো: 👇`;
    await sendWhatsAppMessage(phoneId, to, text);
    
    // Send 12 Affordable images in parallel (instantly creates a beautiful grouped album on WhatsApp!)
    const randomImgs = getRandomImages(AFFORDABLE_IDS, 12);
    await Promise.all(randomImgs.map(imgUrl => sendWhatsAppImage(phoneId, to, imgUrl)));

    // Wait 2.5 seconds to ensure Meta processes and displays all images before the buttons!
    await delay(2500);

    // Next action buttons with "Show More" option
    await sendWhatsAppButtons(phoneId, to, 'আরও নতুন ডিজাইনের ছবি দেখতে বা অর্ডার করতে বাটনে চাপুন:', [
      { id: 'btn_more_affordable', title: '📸 আরও ছবি দেখুন' },
      { id: 'btn_premium', title: '✨ Premium Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
    ]);
  } 
  else if (buttonId === 'btn_more_affordable') {
    await sendWhatsAppMessage(phoneId, to, 'আমাদের গ্যালারি থেকে আরও ১২টি চমৎকার Affordable ডিজাইনের ছবি নিচে পাঠানো হলো: 👇');
    const randomImgs = getRandomImages(AFFORDABLE_IDS, 12);
    await Promise.all(randomImgs.map(imgUrl => sendWhatsAppImage(phoneId, to, imgUrl)));

    // Wait 2.5 seconds to ensure Meta processes and displays all images before the buttons!
    await delay(2500);

    await sendWhatsAppButtons(phoneId, to, 'আরও নতুন ডিজাইনের ছবি দেখতে বা অর্ডার করতে বাটনে চাপুন:', [
      { id: 'btn_more_affordable', title: '📸 আরও ছবি দেখুন' },
      { id: 'btn_premium', title: '✨ Premium Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
    ]);
  }
  else if (buttonId === 'btn_premium') {
    const text = `✨ Premium Card (এলিগ্যান্ট ও লাক্সারি):
50 পিস ➔ ৩,২৫০৳
100 পিস ➔ ৫,৫০০৳
200 পিস ➔ ৯,০০০৳ (+ ১টি প্রিমিয়াম নিকাহনামা একদম ফ্রি! 🎁)

অর্ডার বুকিং করতে ৩০% অ্যাডভান্স পেমেন্ট প্রযোজ্য। আমাদের সেরা ১২টি প্রিমিয়াম ডিজাইনের ছবি নিচে পাঠানো হলো: 👇`;
    await sendWhatsAppMessage(phoneId, to, text);

    // Send 12 Premium images in parallel
    const randomImgs = getRandomImages(PREMIUM_IDS, 12);
    await Promise.all(randomImgs.map(imgUrl => sendWhatsAppImage(phoneId, to, imgUrl)));

    // Wait 2.5 seconds to ensure Meta processes and displays all images before the buttons!
    await delay(2500);

    // Next action buttons with "Show More" option
    await sendWhatsAppButtons(phoneId, to, 'আরও নতুন ডিজাইনের ছবি দেখতে বা অর্ডার করতে বাটনে চাপুন:', [
      { id: 'btn_more_premium', title: '📸 আরও ছবি দেখুন' },
      { id: 'btn_affordable', title: '💚 Affordable Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
    ]);
  } 
  else if (buttonId === 'btn_more_premium') {
    await sendWhatsAppMessage(phoneId, to, 'আমাদের গ্যালারি থেকে আরও ১২টি এক্সক্লুসিভ Premium ডিজাইনের ছবি নিচে পাঠানো হলো: 👇');
    const randomImgs = getRandomImages(PREMIUM_IDS, 12);
    await Promise.all(randomImgs.map(imgUrl => sendWhatsAppImage(phoneId, to, imgUrl)));

    // Wait 2.5 seconds to ensure Meta processes and displays all images before the buttons!
    await delay(2500);

    await sendWhatsAppButtons(phoneId, to, 'আরও নতুন ডিজাইনের ছবি দেখতে বা অর্ডার করতে বাটনে চাপুন:', [
      { id: 'btn_more_premium', title: '📸 আরও ছবি দেখুন' },
      { id: 'btn_affordable', title: '💚 Affordable Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
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

👉 Website Products Link: https://project-bx7i1.vercel.app/products`;

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
