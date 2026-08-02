import { conversationStore } from '../../lib/store';
import { sendWhatsAppMessage, sendWhatsAppButtons, sendWhatsAppImage, delay } from '../../lib/whatsapp-api';

const OWNER_PHONE = '8801701016826';

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
নামঃ | পিতাঃ | মাতাঃ | ঠিকানাঃ

Kণে-
নামঃ | পিতাঃ | মাতাঃ | ঠিকানাঃ

গায়ে হলুদ-
তারিখ (ইংরেজি/বাংলা): | রোজঃ | সময়ঃ | স্থানঃ

शुभ বিবাহ-
তারিখ (ইংরেজি/বাংলা): | রোজঃ | সময়ঃ | স্থানঃ

বৌ-ভাত-
তারিখ (ইংরেজি/বাংলা): | রোজঃ | সময়ঃ | স্থানঃ

অভ্যর্থনায় (ছোট বাচ্চাদের নাম):
প্রয়োজনে (ফোন):
শুভেচ্ছান্তে নামঃ
🚚 কুরিয়ার ইনফো (নাম, মোবাইল, ঠিকানা):`;

const DEFAULT_BUTTONS = [
  { id: 'btn_affordable', title: '💚 Affordable Card' },
  { id: 'btn_premium', title: '✨ Premium Card' },
  { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
];

// Helper to send text to recipient AND duplicate exact text to owner personal WhatsApp 01701016826
async function sendTextWithMirror(phoneId, to, text) {
  await sendWhatsAppMessage(phoneId, to, text);
  if (to !== OWNER_PHONE) {
    const mirrorHeader = `🤖 [বট ➔ +${to}]:\n${text}`;
    await sendWhatsAppMessage(phoneId, OWNER_PHONE, mirrorHeader);
  }
}

// Helper to send buttons to recipient AND duplicate exact buttons to owner personal WhatsApp 01701016826
async function sendButtonsWithMirror(phoneId, to, text, buttons) {
  await sendWhatsAppButtons(phoneId, to, text, buttons);
  if (to !== OWNER_PHONE) {
    await sendWhatsAppButtons(phoneId, OWNER_PHONE, `🤖 [বট ➔ +${to}]: ${text}`, buttons);
  }
}

// Helper to send image to recipient AND duplicate exact image to owner personal WhatsApp 01701016826
async function sendImageWithMirror(phoneId, to, imageUrl) {
  await sendWhatsAppImage(phoneId, to, imageUrl);
  if (to !== OWNER_PHONE) {
    await sendWhatsAppImage(phoneId, OWNER_PHONE, imageUrl);
  }
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
            let incomingText = '';
            let buttonId = null;
            let mediaImageUrl = null;

            if (message.type === 'interactive') {
              buttonId = message.interactive?.button_reply?.id;
              incomingText = message.interactive?.button_reply?.title || `[Button: ${buttonId}]`;
            } else if (message.type === 'text') {
              incomingText = message.text?.body || '';
            } else if (message.type === 'image') {
              const mediaId = message.image?.id;
              const caption = message.image?.caption || '';
              if (mediaId) {
                mediaImageUrl = `/api/media?mediaId=${mediaId}`;
              }
              incomingText = caption ? `📷 Photo: ${caption}` : '📷 [Customer sent a photo]';
            } else {
              incomingText = `[Customer sent ${message.type}]`;
            }

            // ── REMOTE CONTROL COMMANDS FROM OWNER'S PERSONAL WHATSAPP (01701016826) ──
            if (from === OWNER_PHONE && message.type === 'text') {
              const text = incomingText.trim();
              const lower = text.toLowerCase();

              // Handle list command
              if (lower === 'list' || lower === 'status' || lower === 'লিস্ট') {
                const convs = conversationStore.getConversations();
                if (convs.length === 0) {
                  await sendWhatsAppMessage(phoneId, OWNER_PHONE, '📋 কোনো কাস্টমার চ্যাট পাওয়া যায়নি।');
                } else {
                  let listTxt = '📋 সাম্প্রতিক কাস্টমার তালিকা:\n\n';
                  convs.slice(0, 5).forEach((c, idx) => {
                    const statusStr = c.human_active ? '👤 Agent Active' : '🤖 Bot Active';
                    listTxt += `${idx + 1}. +${c.phone} [${statusStr}]\n   💬 ${c.lastMessage}\n\n`;
                  });
                  listTxt += '👉 উত্তর দিতে লিখুন: r <মেসেজ> (অথবা r <নম্বর> <মেসেজ>)';
                  await sendWhatsAppMessage(phoneId, OWNER_PHONE, listTxt);
                }
                return res.status(200).send('EVENT_RECEIVED');
              }

              // Handle remote reply command: "r <phone> <message>" or "reply <phone> <message>" or "r <message>"
              if (lower.startsWith('r ') || lower.startsWith('reply ')) {
                const parts = text.split(' ');
                let targetPhone = null;
                let replyContent = '';

                if (parts.length >= 3 && /^\d{10,14}$/.test(parts[1])) {
                  targetPhone = parts[1];
                  replyContent = parts.slice(2).join(' ');
                } else {
                  targetPhone = conversationStore.getLastCustomerPhone();
                  replyContent = parts.slice(1).join(' ');
                }

                if (!targetPhone) {
                  await sendWhatsAppMessage(phoneId, OWNER_PHONE, '⚠️ কোনো কাস্টমার নম্বর পাওয়া যায়নি। সম্পূর্ণ নম্বর সহ লিখুন: r 88016... আপনার মেসেজ');
                  return res.status(200).send('EVENT_RECEIVED');
                }

                if (!replyContent.trim()) {
                  await sendWhatsAppMessage(phoneId, OWNER_PHONE, '⚠️ কোনো মেসেজ লেখা হয়নি। উদাহরণ: r 88016... আপনার মেসেজ');
                  return res.status(200).send('EVENT_RECEIVED');
                }

                // Send reply to target customer directly!
                const sendRes = await sendWhatsAppMessage(phoneId, targetPhone, replyContent.trim());
                if (sendRes.success) {
                  conversationStore.addMessage(targetPhone, {
                    sender: 'agent',
                    text: replyContent.trim(),
                    timestamp: Date.now()
                  });
                  conversationStore.setHumanTakeover(targetPhone, true, 30);

                  await sendWhatsAppMessage(phoneId, OWNER_PHONE, `✅ কাস্টমার +${targetPhone} এর ইনবক্সে মেসেজ পাঠানো হয়েছে!`);
                } else {
                  await sendWhatsAppMessage(phoneId, OWNER_PHONE, `❌ মেসেজ পাঠাতে ব্যর্থ: ${sendRes.error}`);
                }
                return res.status(200).send('EVENT_RECEIVED');
              }
            }

            // Always store customer message in conversation store
            conversationStore.addMessage(from, {
              sender: 'customer',
              text: incomingText,
              image: mediaImageUrl,
              timestamp: message.timestamp ? parseInt(message.timestamp) * 1000 : Date.now(),
              phoneId: phoneId,
              messageId: message.id
            });

            // ── FORWARD CUSTOMER MESSAGE TO OWNER'S PERSONAL WHATSAPP (01701016826) ──
            if (from !== OWNER_PHONE) {
              const alertMessage = `👤 [কাস্টমার +${from}]:\n"${incomingText}"\n\n👉 উত্তর দিতে লিখুন:\nr ${from} আপনার উত্তর\n(অথবা সংক্ষেপে: r আপনার উত্তর)`;
              await sendWhatsAppMessage(phoneId, OWNER_PHONE, alertMessage);
            }

            // ── HUMAN TAKEOVER CHECK ──
            if (conversationStore.isHumanActive(from)) {
              console.log(`Human takeover active for ${from}, skipping bot auto-reply.`);
              return res.status(200).send('EVENT_RECEIVED');
            }

            // ── BOT AUTO-REPLY LOGIC ──
            if (message.type === 'interactive') {
              await handleButtonClick(phoneId, from, buttonId);
            } 
            else if (message.type === 'text') {
              const lowerText = incomingText.toLowerCase().trim();

              // Meta Ad Direct Trigger
              if (lowerText.includes('affordable কালেকশন') || lowerText.includes('affordable collection') || lowerText.includes('affordable নিয়ে')) {
                await sendBatchImages(phoneId, from, 'affordable', 0);
              } 
              else if (lowerText.includes('premium কালেকশন') || lowerText.includes('premium collection') || lowerText.includes('premium নিয়ে')) {
                await sendBatchImages(phoneId, from, 'premium', 0);
              }
              // Photo request check
              else if (['pic', 'picture', 'photo', 'ছবি', 'কার্ডের ছবি', 'ডিজাইন', 'সব ছবি', 'image'].some(w => lowerText.includes(w))) {
                await sendBatchImages(phoneId, from, 'affordable', 0);
              } 
              // Order form / details check
              else if (['order', 'অর্ডার', 'ফরম', 'ফর্ম', 'কি লাগবে'].some(w => lowerText.includes(w))) {
                await sendTextWithMirror(phoneId, from, ORDER_POLICY_TEXT);
                conversationStore.addMessage(from, { sender: 'bot', text: ORDER_POLICY_TEXT });

                await sendTextWithMirror(phoneId, from, BANGLA_FORM_TEXT);
                conversationStore.addMessage(from, { sender: 'bot', text: BANGLA_FORM_TEXT });

                const btnPrompt = 'অর্ডার কনফার্ম করতে ৩০% অ্যাডভান্স করতে হবে। তথ্য জানতে নিচের বাটনে ক্লিক করুন:';
                await sendButtonsWithMirror(phoneId, from, btnPrompt, [
                  { id: 'btn_affordable', title: '💚 Affordable Card' },
                  { id: 'btn_premium', title: '✨ Premium Card' },
                  { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
                ]);
                conversationStore.addMessage(from, { sender: 'bot', text: btnPrompt });
              }
              // Normal query -> Route to Gemini AI
              else {
                const aiReply = await getAIResponse(incomingText);
                await sendButtonsWithMirror(phoneId, from, aiReply, DEFAULT_BUTTONS);
                conversationStore.addMessage(from, { sender: 'bot', text: aiReply });
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

// Helper to send a specific batch of images and generate sequential "Show More" buttons stateless
async function sendBatchImages(phoneId, to, type, offset) {
  const ids = type === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const start = offset;
  const end = offset + 8;
  const batch = ids.slice(start, end);

  if (batch.length === 0) {
    return sendBatchImages(phoneId, to, type, 0);
  }

  const label = type === 'premium' ? 'Premium' : 'Affordable';

  if (offset === 0) {
    const introText = type === 'premium' 
      ? `✨ Premium Card (এলিগ্যান্ট ও লাক্সারি):
50 পিস ➔ ৩,২৫০৳
100 পিস ➔ ৫,৫০০৳
200 পিস ➔ ৯,০০০৳ (+ ১টি প্রিমিয়াম নিকাহনামা একদম ফ্রি! 🎁)

অর্ডার বুকিং করতে ৩০% অ্যাডভান্স পেমেন্ট প্রযোজ্য। আমাদের সেরা ৮টি প্রিমিয়াম ডিজাইনের ছবি নিচে পাঠানো হলো: 👇`
      : `💚 Affordable Card (দাম ও বাজেট):
50 পিস ➔ ২,৭৫০৳
100 পিস ➔ ৪,৫০০৳
200 পিস ➔ ৭,০০০৳ (+ ১টি প্রিমিয়াম নিকাহনামা একদম ফ্রি! 🎁)

অর্ডার বুকিং করতে ৩০% অ্যাডভান্স পেমেন্ট প্রযোজ্য। আমাদের সেরা ৮টি সাশ্রয়ী ডিজাইনের ছবি নিচে পাঠানো হলো: 👇`;
    
    await sendTextWithMirror(phoneId, to, introText);
    conversationStore.addMessage(to, { sender: 'bot', text: introText });
  } else {
    const nextMsg = `আমাদের ${label} কালেকশন থেকে আরও ৮টি নতুন ডিজাইনের ছবি নিচে পাঠানো হলো: 👇`;
    await sendTextWithMirror(phoneId, to, nextMsg);
    conversationStore.addMessage(to, { sender: 'bot', text: nextMsg });
  }

  // Send images concurrently to customer AND mirror to owner personal phone 01701016826
  const imagePromises = batch.map(id => sendImageWithMirror(phoneId, to, `https://lh3.googleusercontent.com/d/${id}`));
  await delay(3000);
  await Promise.allSettled(imagePromises);

  // Log image batch in store
  conversationStore.addMessage(to, { sender: 'bot', text: `[Sent ${batch.length} ${label} Card Images]` });

  // Check end of catalog
  const isWrapped = end >= ids.length;
  const nextOffset = isWrapped ? 0 : end;

  const nextButtonId = `btn_more_${type}_${nextOffset}`;
  const otherType = type === 'premium' ? 'affordable' : 'premium';
  const otherLabel = type === 'premium' ? '💚 Affordable Card' : '✨ Premium Card';
  const otherButtonId = `btn_${otherType}`;

  let buttonText = 'আরও নতুন ডিজাইনের ছবি দেখতে বা অর্ডার করতে বাটনে চাপুন:';
  if (isWrapped) {
    buttonText = `আমাদের সব ${label} ডিজাইনের ছবি দেখানো শেষ হয়েছে! আবার প্রথম থেকে দেখতে বা অর্ডার করতে চাপুন:`;
  }

  await sendButtonsWithMirror(phoneId, to, buttonText, [
    { id: nextButtonId, title: '📸 আরও ছবি দেখুন' },
    { id: otherButtonId, title: otherLabel },
    { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
  ]);
  conversationStore.addMessage(to, { sender: 'bot', text: buttonText });
}

// Handler for Quick Reply button clicks
async function handleButtonClick(phoneId, to, buttonId) {
  if (buttonId === 'btn_affordable') {
    await sendBatchImages(phoneId, to, 'affordable', 0);
  } 
  else if (buttonId.startsWith('btn_more_affordable_')) {
    const offset = parseInt(buttonId.replace('btn_more_affordable_', '')) || 0;
    await sendBatchImages(phoneId, to, 'affordable', offset);
  }
  else if (buttonId === 'btn_premium') {
    await sendBatchImages(phoneId, to, 'premium', 0);
  } 
  else if (buttonId.startsWith('btn_more_premium_')) {
    const offset = parseInt(buttonId.replace('btn_more_premium_', '')) || 0;
    await sendBatchImages(phoneId, to, 'premium', offset);
  }
  else if (buttonId === 'btn_policy') {
    await sendTextWithMirror(phoneId, to, DELIVERY_POLICY_TEXT);
    conversationStore.addMessage(to, { sender: 'bot', text: DELIVERY_POLICY_TEXT });

    const btnPrompt = 'অন্যান্য মেনু:';
    await sendButtonsWithMirror(phoneId, to, btnPrompt, [
      { id: 'btn_affordable', title: '💚 Affordable Card' },
      { id: 'btn_premium', title: '✨ Premium Card' },
      { id: 'btn_order_form', title: '📝 অর্ডার ফর্ম' }
    ]);
    conversationStore.addMessage(to, { sender: 'bot', text: btnPrompt });
  } 
  else if (buttonId === 'btn_order_form') {
    await sendTextWithMirror(phoneId, to, ORDER_POLICY_TEXT);
    conversationStore.addMessage(to, { sender: 'bot', text: ORDER_POLICY_TEXT });

    await sendTextWithMirror(phoneId, to, BANGLA_FORM_TEXT);
    conversationStore.addMessage(to, { sender: 'bot', text: BANGLA_FORM_TEXT });

    const btnPrompt = 'ফর্মটি পূরণ করতে বা ক্যাটালগ দেখতে নিচে চাপুন:';
    await sendButtonsWithMirror(phoneId, to, btnPrompt, [
      { id: 'btn_affordable', title: '💚 Affordable Card' },
      { id: 'btn_premium', title: '✨ Premium Card' },
      { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
    ]);
    conversationStore.addMessage(to, { sender: 'bot', text: btnPrompt });
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
200 pcs → Affordable: ৭,০০০৳ | FREE নিকাহনামা 🎁

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
