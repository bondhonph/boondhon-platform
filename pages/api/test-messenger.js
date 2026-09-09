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
    currentSalesBrainConfig: {
      temperature: 0.6,
      maxOutputTokens: 600,
      thinkingConfig: { thinkingBudget: 0 }
    },
    currentVisionConfig: {
      temperature: 0.3,
      maxOutputTokens: 400,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json"
    },
    thinkingBudgetOnly: {
      maxOutputTokens: 600,
      thinkingConfig: { thinkingBudget: 0 }
    },
    temperatureOnly: {
      temperature: 0.6,
      maxOutputTokens: 600
    },
    thinkingLevelLow: {
      maxOutputTokens: 600,
      thinkingConfig: { thinkingLevel: "LOW" }
    },
    cleanSalesBrainConfig: {
      maxOutputTokens: 600
    },
    cleanVisionConfig: {
      maxOutputTokens: 400,
      responseMimeType: "application/json"
    }
  };

  const model = 'gemini-3.6-flash';
  for (const [testName, genConfig] of Object.entries(testConfigs)) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello, respond with JSON: {"status":"ok"}' }] }],
          generationConfig: genConfig
        })
      });
      const data = await response.json();
      results[testName] = {
        httpStatus: response.status,
        ok: response.ok,
        data: data
      };
    } catch (err) {
      results[testName] = { error: err.message };
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
