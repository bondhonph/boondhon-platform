import { appendMessage } from '../../lib/chat-store';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, text, phoneId } = req.body;

  if (!phone || !text) {
    return res.status(400).json({ error: 'Phone number and message text are required' });
  }

  const targetPhoneId = phoneId || process.env.WHATSAPP_PHONE_ID || "364506300085449";
  const url = `https://graph.facebook.com/v20.0/${targetPhoneId}/messages`;

  try {
    // Send message to customer WhatsApp via Meta Graph API
    const metaRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: { body: text }
      })
    });

    const metaData = await metaRes.json();

    // Log message into persistent chat store as sender: 'admin'
    const updatedConv = appendMessage(phone, 'admin', text);

    return res.status(200).json({
      success: true,
      metaResponse: metaData,
      conversation: updatedConv
    });
  } catch (err) {
    console.error('Error sending WhatsApp Admin Manual Reply:', err);
    // Still log message locally
    const updatedConv = appendMessage(phone, 'admin', text);
    return res.status(200).json({
      success: true,
      error: err.message,
      conversation: updatedConv
    });
  }
}
