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

  const models = ['gemini-3.6-flash'];
  const embedModels = ['gemini-embedding-2'];
  const results = {};
  const embedResults = {};

  const testConfigs = {
    salesBrainProductionConfig: {
      maxOutputTokens: 600,
      thinkingConfig: { thinkingLevel: "LOW" }
    }
  };

  const modelsToTest = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const mod of modelsToTest) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with JSON: {"status":"ok","model":"' + mod + '"}' }] }],
          generationConfig: { maxOutputTokens: 200 }
        })
      });
      const data = await response.json();
      results[mod] = {
        httpStatus: response.status,
        ok: response.ok,
        data: data
      };
    } catch (err) {
      results[mod] = { error: err.message };
    }
  }

  for (const model of embedModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: 'wedding card test' }] }
        })
      });
      const data = await response.json();
      embedResults[model] = {
        httpStatus: response.status,
        hasValues: !!data?.embedding?.values,
        error: data?.error
      };
    } catch (err) {
      embedResults[model] = { error: err.message };
    }
  }

  let catalogReady = false;
  let sampleMatch = null;
  try {
    const { isCatalogIndexReady, findCatalogMatch } = await import('../../lib/catalog-matcher');
    catalogReady = isCatalogIndexReady();
    if (req.body?.imageBase64) {
      sampleMatch = await findCatalogMatch(req.body.imageBase64, req.body.mimeType || 'image/jpeg');
    } else if (req.query.testMatch === '1') {
      const imgRes = await fetch('https://lh3.googleusercontent.com/d/1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD');
      const buf = Buffer.from(await imgRes.arrayBuffer());
      sampleMatch = await findCatalogMatch(buf.toString('base64'), 'image/jpeg');
    }
  } catch (cErr) {
    catalogReady = 'error: ' + cErr.message;
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
      embedResults: embedResults,
      catalogReady,
      sampleMatch,
      metaResponse: metaData
    });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
}
