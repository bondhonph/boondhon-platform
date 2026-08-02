const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD";

const SAMPLE_IMAGES = {
  affordable: "https://lh3.googleusercontent.com/d/1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD",
  premium: "https://lh3.googleusercontent.com/d/182kOjBhoaqOTq7nr4ryI6re6fRuLITbH"
};

// Send plain text message
async function sendWhatsAppMessage(phoneId, to, text) {
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    const res = await fetch(url, {
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

    if (!res.ok) {
      console.error(`Failed to send WhatsApp text message:`, await res.text());
    }
  } catch (err) {
    console.error('Error in sendWhatsAppMessage:', err.message);
  }
}

// Send interactive button message with optional image header
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
      console.warn('Interactive WhatsApp message failed, fallback to plain text:', await res.text());
      await sendWhatsAppMessage(phoneId, to, bodyText);
    }
  } catch (err) {
    console.error('Error sending interactive WhatsApp message:', err);
    await sendWhatsAppMessage(phoneId, to, bodyText);
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
          if (message.type === 'text') {
            rawMsg = message.text?.body || '';
          } else if (message.type === 'interactive') {
            rawMsg = message.interactive?.button_reply?.title || message.interactive?.button_reply?.id || message.interactive?.list_reply?.title || '';
          } else if (message.type === 'button') {
            rawMsg = message.button?.text || message.button?.payload || '';
          } else {
            rawMsg = message.caption || 'Hi';
          }

          const txt = rawMsg.toLowerCase();

          if (from && phoneId) {
            // Handle Affordable Button Click or Query
            if (txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল') || txt.includes('btn_affordable')) {
              const replyText = `🌸 BOONDHON Affordable Card Collection:\n\n• ৫০ পিস: ২,৭৫০৳ (প্রতি পিস ৫৫৳)\n• ১০০ পিস: ৪,৫০০৳ (প্রতি পিস ৪৫৳)\n• ২০০ পিস: ৭,০০০৳ (প্রতি পিস ৩৫৳)\n\n🎁 ২০০+ পিসে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি!\n\n📝 অনলাইন অর্ডার ফর্ম: https://boondhon-platform-qr9a.vercel.app/order\n📞 হটলাইন: 01863586302`;
              const buttons = [
                { id: 'btn_premium', title: '✨ Premium Card' },
                { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
              ];
              await sendWhatsAppInteractive(phoneId, from, replyText, buttons, SAMPLE_IMAGES.affordable);
            }
            // Handle Premium Button Click or Query
            else if (txt.includes('premium') || txt.includes('প্রিমিয়াম') || txt.includes('btn_premium')) {
              const replyText = `✨ BOONDHON Premium Royal Collection:\n\n• ৫০ পিস: ৩,২৫০৳ (প্রতি পিস ৬৫৳)\n• ১০০ পিস: ৫,৫০০৳ (প্রতি পিস ৫৫৳)\n• ২০০ পিস: ৯,০০০৳ (প্রতি পিস ৪৫৳)\n\n🎁 ২০০+ পিসে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি!\n\n📝 অনলাইন অর্ডার ফর্ম: https://boondhon-platform-qr9a.vercel.app/order\n📞 হটলাইন: 01863586302`;
              const buttons = [
                { id: 'btn_affordable', title: '💚 Affordable Card' },
                { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
              ];
              await sendWhatsAppInteractive(phoneId, from, replyText, buttons, SAMPLE_IMAGES.premium);
            }
            // Handle Policy & Address Button Click or Query
            else if (txt.includes('policy') || txt.includes('পলিসি') || txt.includes('ঠিকানা') || txt.includes('btn_policy') || txt.includes('অফিস') || txt.includes('পেমেন্ট')) {
              const replyText = `🚚 পেমেন্ট, ডেলিভারি ও ঠিকানা পলিসি:\n\n📍 অফিস ঠিকানা: মানিকগঞ্জ\n💳 পেমেন্ট পদ্ধতি: বিকাশ/নগদ/রকেট (01682588856)\n📝 অর্ডার নিয়ম: ৩০% অগ্রিম বুকিং ফি প্রদান করে ডেমো দেখে Approve করতে হয়।\n🚚 ডেলিভারি সময়: ৫-৭ কর্মদিবস (সুন্দরবন/এসএ পরিবহন)\n\n📝 অনলাইন অর্ডার ফর্ম: https://boondhon-platform-qr9a.vercel.app/order`;
              const buttons = [
                { id: 'btn_affordable', title: '💚 Affordable Card' },
                { id: 'btn_premium', title: '✨ Premium Card' }
              ];
              await sendWhatsAppInteractive(phoneId, from, replyText, buttons);
            }
            // Default Welcome Greeting with Buttons & Image Header
            else {
              const replyText = `আসসালামু আলাইকুম! আমি বন্ধন প্রিন্টিং হাউস থেকে অনন্যা বলছি। কেমন আছেন আপনি? 🌸\n\nএখন আমাদের একটা দারুণ ধামাকা অফার চলছে—**২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি!** 🎁\n\nআপনি কোন ক্যাটাগরির কার্ডের তথ্য জানতে চান নিচে বাটনে সিলেক্ট করুন:`;
              const buttons = [
                { id: 'btn_affordable', title: '💚 Affordable Card' },
                { id: 'btn_premium', title: '✨ Premium Card' },
                { id: 'btn_policy', title: '🚚 পলিসি ও ঠিকানা' }
              ];
              await sendWhatsAppInteractive(phoneId, from, replyText, buttons, SAMPLE_IMAGES.affordable);
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
