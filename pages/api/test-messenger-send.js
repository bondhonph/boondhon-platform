export default async function handler(req, res) {
  const token = (process.env.FB_PAGE_ACCESS_TOKEN || "").trim();

  try {
    // 1. Fetch Page Details
    const pageRes = await fetch(`https://graph.facebook.com/v20.0/me?access_token=${token}`);
    const pageData = await pageRes.json();

    // 2. Fetch App Details
    let appData = null;
    try {
      const appRes = await fetch(`https://graph.facebook.com/v20.0/app?access_token=${token}`);
      appData = await appRes.json();
    } catch (e) {
      appData = { error: e.message };
    }

    return res.status(200).json({
      status: "API Online",
      timestamp: new Date().toISOString(),
      page: pageData,
      app: appData
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
