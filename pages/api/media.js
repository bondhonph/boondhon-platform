// API route to proxy Meta WhatsApp media binaries securely for dashboard rendering
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const { mediaId, url: directUrl } = req.query;
  const whatsappToken = process.env.WHATSAPP_TOKEN;

  if (!whatsappToken) {
    return res.status(500).send('WHATSAPP_TOKEN missing');
  }

  try {
    let downloadUrl = directUrl;

    // 1. If mediaId is provided, retrieve the direct download URL from Graph API
    if (mediaId) {
      const metaRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${whatsappToken}`
        }
      });

      if (!metaRes.ok) {
        const err = await metaRes.text();
        console.error('Failed to fetch media URL from Meta:', err);
        return res.status(metaRes.status).send('Failed to fetch media metadata');
      }

      const metaData = await metaRes.json();
      downloadUrl = metaData.url;
    }

    if (!downloadUrl) {
      return res.status(400).send('Media ID or URL required');
    }

    // 2. Fetch the actual image binary with Authorization header
    const imageRes = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${whatsappToken}`
      }
    });

    if (!imageRes.ok) {
      return res.status(imageRes.status).send('Failed to download media binary');
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imageRes.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error proxying WhatsApp media:', err.message);
    return res.status(500).send(err.message);
  }
}
