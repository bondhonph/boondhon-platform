export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const folderId = req.query.folderId;
  if (!folderId) {
    return res.status(400).json({ error: 'folderId parameter is required' });
  }

  try {
    const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();

    const idRegex = /\/file\/d\/([a-zA-Z0-9_-]{25,})/g;
    const altRegex = /"([a-zA-Z0-9_-]{28,35})"/g;
    const foundIds = new Set();
    let match;

    while ((match = idRegex.exec(html)) !== null) {
      if (match[1] !== folderId) foundIds.add(match[1]);
    }

    if (foundIds.size === 0) {
      while ((match = altRegex.exec(html)) !== null) {
        const id = match[1];
        if (id !== folderId && !id.includes('drive') && !id.includes('google') && !id.includes('html') && !id.includes('utf') && !id.includes('http')) {
          foundIds.add(id);
        }
      }
    }

    const images = Array.from(foundIds).map(id => `https://lh3.googleusercontent.com/d/${id}`);

    // High performance CDN caching for Vercel
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ folderId, count: images.length, images });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
