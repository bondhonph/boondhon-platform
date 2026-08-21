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

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  const results = {};

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello, respond with JSON: {"status":"ok"}' }] }]
        })
      });
      const data = await response.json();
      results[model] = {
        httpStatus: response.status,
        data: data
      };
    } catch (err) {
      results[model] = { error: err.message };
    }
  }

  // Debug Page info call
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}`);
    const metaData = await metaRes.json();

    return res.status(200).json({
      status: metaRes.ok ? "success" : "token_error",
      geminiKeyConfigured: Boolean(key),
      geminiKeyPrefix: key ? key.substring(0, 8) + '...' : 'none',
      geminiResults: results,
      metaResponse: metaData
    });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
}
