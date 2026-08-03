import crypto from 'crypto';

function sha256(text) {
  if (!text) return null;
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventName, value, currency, orderId, phone, email, url, testCode } = req.body;

  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '7392242574211491';
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD";

  // Get user client details
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // Hash phone and email for security matching
  const hashedPhone = phone ? sha256(phone.replace(/\D/g, '')) : null; // Remove non-digits
  const hashedEmail = email ? sha256(email) : null;

  const userData = {
    client_ip_address: ipAddress,
    client_user_agent: userAgent,
  };
  if (hashedPhone) userData.ph = [hashedPhone];
  if (hashedEmail) userData.em = [hashedEmail];

  const eventData = {
    event_name: eventName || 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: url || 'https://project-bx7i1.vercel.app/order',
    user_data: userData,
    custom_data: {
      value: Number(value) || 0,
      currency: currency || 'BDT',
    }
  };

  if (orderId) {
    eventData.event_id = orderId;
  }

  const payload = {
    data: [eventData],
  };

  // Add test code if testing in Events Manager
  const activeTestCode = testCode || process.env.FB_CAPI_TEST_CODE;
  if (activeTestCode) {
    payload.test_event_code = activeTestCode;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Meta CAPI Error:', result);
      return res.status(response.status).json({ error: 'Failed to send event to Meta', details: result });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Meta CAPI Request Exception:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
