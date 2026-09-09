export default async function handler(req, res) {
  const token = (process.env.FB_PAGE_ACCESS_TOKEN || '').trim();
  if (!token) {
    return res.status(500).json({ error: 'No FB_PAGE_ACCESS_TOKEN configured' });
  }

  try {
    // 1. Check current subscribed apps
    const checkRes = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?access_token=${token}`);
    const checkData = await checkRes.json();

    // 2. Subscribe with message_echoes
    const fields = 'messages,messaging_postbacks,message_reads,message_echoes';
    const subRes = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?subscribed_fields=${fields}&access_token=${token}`, {
      method: 'POST'
    });
    const subData = await subRes.json();

    // 3. Verify after subscribe
    const verifyRes = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?access_token=${token}`);
    const verifyData = await verifyRes.json();

    return res.status(200).json({
      success: true,
      previous: checkData,
      subscribeResult: subData,
      current: verifyData
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
