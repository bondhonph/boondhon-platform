import crypto from 'crypto';

function sha256(text) {
  if (!text) return null;
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
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

// Helper to call Gemini AI with the official Sales persona
async function getAIResponse(userMsg) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.error('GEMINI_API_KEY is missing in environment variables.');
      return 'আসসালামু আলাইকুম! আমি অনন্যা। আমাদের চ্যাট সার্ভিসটি সাময়িকভাবে বন্ধ আছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন। 😊';
    }

    const systemPrompt = `You are the official AI Sales Agent of BOONDHON Printing House, based in Manikganj, Bangladesh. Your name is "Ananya" (অনন্যা) — a warm, friendly, polite, highly converting Bengali sales executive.
Talk in Bengali (Bangladeshi colloquial style) mixed with some English words naturally. Keep responses short and friendly (2-3 sentences max).
Highlight limited time offer: "২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🎁"
Advance payment rule: 30% advance on bKash/Nagad/Rocket (01682588856).

PRICE GUIDE:
50 pcs → Affordable: ২,৭৫০৳ | Premium: ৩,২৫০৳
100 pcs → Affordable: ৪,৫০০৳ | Premium: ৫,৫০০৳
200 pcs → Affordable: ৭,০০০৳ | Premium: ৯,০০০৳ | FREE নিকাহনামা 🎁

👉 Website Order Link: https://project-bx7i1.vercel.app/order`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: userMsg }]
      }
    ];

    // Using gemini-3.5-flash as gemini-1.5-flash is deprecated
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: 1000, temperature: 0.8 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'আসসালামু আলাইকুম! আমি অনন্যা। আপনাকে কীভাবে সাহায্য করতে পারি? 😊';
    } else {
      const errData = await res.json();
      console.error('Gemini API Error in WhatsApp webhook:', errData);
    }
  } catch (err) {
    console.error('Gemini call failed in WhatsApp handler:', err.message);
  }
  return 'আসসালামু আলাইকুম! আমি অনন্যা। আপনার মেসেজটি পেয়েছি। অনুগ্রহ করে একটু অপেক্ষা করুন। 😊';
}

// Helper to send text reply using WhatsApp Cloud API
async function sendWhatsAppMessage(phoneId, to, text) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  if (!whatsappToken) {
    console.warn('WHATSAPP_TOKEN is not configured in Vercel environment variables.');
    return;
  }

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
