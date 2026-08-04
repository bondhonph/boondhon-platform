export default async function handler(req, res) {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!token) {
    return res.status(200).json({ error: "No FB_PAGE_ACCESS_TOKEN found" });
  }

  try {
    // 1. Check Subscribed Apps for Page
    const subRes = await fetch(`https://graph.facebook.com/v19.0/me/subscribed_apps?access_token=${token}`);
    const subData = await subRes.json();

    // 2. Check Page details
    const pageRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}`);
    const pageData = await pageRes.json();

    // 3. Auto-subscribe Page if not subscribed!
    let autoSubResult = null;
    if (req.query.subscribe === 'true') {
      const autoSubRes = await fetch(`https://graph.facebook.com/v19.0/me/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reads&access_token=${token}`, {
        method: 'POST'
      });
      autoSubResult = await autoSubRes.json();
    }

    return res.status(200).json({
      pageInfo: pageData,
      subscribedApps: subData,
      autoSubResult: autoSubResult
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
