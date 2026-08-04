export default async function handler(req, res) {
  let { id } = req.query;
  if (!id) {
    return res.status(400).send('Missing image ID');
  }

  // Strip .jpg / .png extension if present
  id = id.replace(/\.jpg$/i, '').replace(/\.png$/i, '');

  const targetUrl = `https://lh3.googleusercontent.com/d/${id}`;

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.redirect(targetUrl);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Error proxying image for Meta:', err);
    return res.redirect(targetUrl);
  }
}
