export default async function handler(req, res) {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  const whatsappToken = process.env.WHATSAPP_TOKEN;

  if (!token) {
    return res.status(200).json({
      status: "error",
      message: "FB_PAGE_ACCESS_TOKEN environment variable is MISSING in Vercel!",
      hasWhatsappToken: !!whatsappToken
    });
  }

  // Debug Page info call
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}`);
    const metaData = await metaRes.json();

    return res.status(200).json({
      status: metaRes.ok ? "success" : "token_error",
      tokenConfigured: true,
      metaResponse: metaData
    });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
}
