export default async function handler(req, res) {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const key = (process.env.GEMINI_API_KEY || "").trim();

  if (!token) {
    return res.status(200).json({
      status: "error",
      message: "FB_PAGE_ACCESS_TOKEN environment variable is MISSING in Vercel!",
      hasWhatsappToken: !!whatsappToken
    });
  }

  let availableModels = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const listData = await listRes.json();
    availableModels = listData.models ? listData.models.map(m => m.name.replace('models/', '')) : listData;
  } catch (lErr) {
    availableModels = { error: lErr.message };
  }

  // Debug Page info call
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}`);
    const metaData = await metaRes.json();

    return res.status(200).json({
      status: metaRes.ok ? "success" : "token_error",
      geminiKeyConfigured: Boolean(key),
      geminiKeyPrefix: key ? key.substring(0, 8) + '...' : 'none',
      availableModels: availableModels,
      metaResponse: metaData
    });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
}
