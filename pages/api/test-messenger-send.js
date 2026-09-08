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

    // 3. Test query for specific user
    const testUser = req.query.userId || "25012005838395062";
    let userConvData = null;
    try {
      const userConvRes = await fetch(`https://graph.facebook.com/v20.0/100208292579845/conversations?user_id=${testUser}&fields=messages.limit(3){from,created_time,message}&access_token=${token}`);
      userConvData = await userConvRes.json();
    } catch (e) {
      userConvData = { error: e.message };
    }

    return res.status(200).json({
      status: "API Online",
      timestamp: new Date().toISOString(),
      userConv: userConvData
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
