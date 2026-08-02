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

      // Check if it's a WhatsApp event
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message && message.type === 'text') {
          const from = message.from; // Sender's phone number (e.g. 88017XXXXXXXX)
          const userMessage = message.text?.body || ''; // Received text
          const phoneId = value?.metadata?.phone_number_id; // WhatsApp Phone ID

          if (userMessage && phoneId) {
            // Generate AI Response
            const aiReply = await getAIResponse(userMessage);

            // Send Reply back to user via WhatsApp API
            await sendWhatsAppMessage(phoneId, from, aiReply);
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

function getFallbackReply(userText) {
  const txt = (userText || '').toLowerCase();
  if (txt.includes('দাম') || txt.includes('price') || txt.includes('কত') || txt.includes('টাকা') || txt.includes('রেট') || txt.includes('rate')) {
    return 'আসসালামু আলাইকুম! 🌸 BOONDHON-এর কার্ডের মূল্য তালিকা:\n• Affordable: ৫০পিস ২,৭৫০৳ | ১০০পিস ৪,৫০০৳ | ২০০পিস ৭,০০০৳\n• Premium: ৫০পিস ৩,২৫০৳ | ১০০পিস ৫,৫০০৳ | ২০০পিস ৯,০০০৳\n🎁 ২০০+ পিসে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🥰';
  }
  if (txt.includes('অর্ডার') || txt.includes('order') || txt.includes('কিনব') || txt.includes('পছন্দ')) {
    return 'অর্ডার করতে ওয়েবসাইটের "অর্ডার" ফর্মে গিয়ে তথ্য দিন অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন: 01863586302 🌸 ৩০% বুকিং মানি দিয়ে অর্ডার কনফার্ম করতে হয়।';
  }
  if (txt.includes('ঠিকানা') || txt.includes('অফিস') || txt.includes('লোকেশন') || txt.includes('কোথায়') || txt.includes('কোথায়')) {
    return 'আমাদের অফিস: মানিকগঞ্জ। সারাদেশে ৫-৭ কর্মদিবসের মধ্যে সুন্দরবন/এসএ পরিবহনের মাধ্যমে ডেলিভারি দেওয়া হয়। 🌸';
  }
  if (txt.includes('পেমেন্ট') || txt.includes('বিকাশ') || txt.includes('নগদ') || txt.includes('রকেট') || txt.includes('টাকা পাঠাব')) {
    return 'আমাদের বিকাশ/নগদ/রকেট পারসোনাল নম্বর: 01682588856 💳 (৩০% অগ্রিম বুকিং ফি দিয়ে ডেমো ডিজাইন কনফার্ম করতে হয়)।';
  }
  if (txt.includes('ডেলিভারি') || txt.includes('সময়') || txt.includes('দিন')) {
    return 'অর্ডার কনফার্ম করার পর ডেমো ডিজাইন আপনার থেকে ওকে করিয়ে ৫-৭ কর্মদিবসের মধ্যে ডেলিভারি করা হয়। 🚚';
  }
  return 'আসসালামু আলাইকুম! 🌸 BOONDHON Printing House-এ আপনাকে স্বাগতম। আপনার পছন্দের কার্ডের মডেল বা পরিমাণ জানান, আমি এখনই তথ্য প্রদান করছি।🥰 Hotline: 01863586302';
}

// Helper to call Gemini AI with the official Sales persona
async function getAIResponse(userMsg) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return getFallbackReply(userMsg);

    const systemPrompt = `You are the official AI Sales Agent of BOONDHON Printing House, based in Manikganj, Bangladesh. Your name is "Ananya" (অনন্যা) — a warm, friendly, polite, highly converting Bengali sales executive.
Talk in Bengali (Bangladeshi colloquial style) mixed with some English words naturally. Keep responses short and friendly.
Highlight limited time offer: "২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🎁"
Advance payment rule: 30% advance on bKash/Nagad/Rocket (01682588856).

PRICE GUIDE:
50 pcs → Affordable: ২,৭৫০৳ | Premium: ৩,২৫০৳
100 pcs → Affordable: ৪,৫০০৳ | Premium: ৫,৫০০৳
200 pcs → Affordable: ৭,০০০৳ | Premium: ৯,০০০৳ | FREE নিকাহনামা 🎁

👉 Website Order Link: https://boondhon-platform-qr9a.vercel.app/order`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: userMsg }]
      }
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: 300, temperature: 0.8 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackReply(userMsg);
    }
  } catch (err) {
    console.error('Gemini call failed in WhatsApp handler:', err.message);
  }
  return getFallbackReply(userMsg);
}

// Helper to send text reply using WhatsApp Cloud API
async function sendWhatsAppMessage(phoneId, to, text) {
  const whatsappToken = process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD";

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    const res = await fetch(url, {
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

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send WhatsApp message: ${errText}`);
    }
  } catch (err) {
    console.error('Error in sendWhatsAppMessage:', err.message);
  }
}
