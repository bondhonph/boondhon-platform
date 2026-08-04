export default async function handler(req, res) {
  const token = (process.env.FB_PAGE_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD").trim();

  try {
    // 1. Fetch Page Details
    const pageRes = await fetch(`https://graph.facebook.com/v20.0/me?access_token=${token}`);
    const pageData = await pageRes.json();

    // 2. Fetch Subscribed Apps
    const subRes = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?access_token=${token}`);
    const subData = await subRes.json();

    // 3. Optional Auto Subscribe
    let autoSub = null;
    if (req.query.subscribe === 'true') {
      const autoSubRes = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reads&access_token=${token}`, {
        method: 'POST'
      });
      autoSub = await autoSubRes.json();
    }

    return res.status(200).json({
      status: "API Online",
      timestamp: new Date().toISOString(),
      page: pageData,
      subscriptions: subData,
      autoSub: autoSub
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
