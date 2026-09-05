export default async function handler(req, res) {
  const token = (process.env.FB_PAGE_ACCESS_TOKEN || "").trim();
  const recipientId = req.query.recipientId || "100208292579845";

  const imgId = "1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD";
  const proxyUrl = `https://boondhon-platform-qr9a.vercel.app/api/img/${imgId}.jpg`;
  const lh3Url = `https://lh3.googleusercontent.com/d/${imgId}`;
  const driveThumbUrl = `https://drive.google.com/thumbnail?id=${imgId}&sz=w1000`;

  const results = {};

  // Test 1: Send Proxy Image
  try {
    const res1 = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "image",
            payload: { url: proxyUrl }
          }
        }
      })
    });
    results.proxyUrlTest = { status: res1.status, body: await res1.json() };
  } catch (err) {
    results.proxyUrlTest = { error: err.message };
  }

  // Test 2: Send LH3 Image
  try {
    const res2 = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "image",
            payload: { url: lh3Url }
          }
        }
      })
    });
    results.lh3UrlTest = { status: res2.status, body: await res2.json() };
  } catch (err) {
    results.lh3UrlTest = { error: err.message };
  }

  // Test 3: Send Drive Thumbnail Image
  try {
    const res3 = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "image",
            payload: { url: driveThumbUrl }
          }
        }
      })
    });
    results.driveThumbUrlTest = { status: res3.status, body: await res3.json() };
  } catch (err) {
    results.driveThumbUrlTest = { error: err.message };
  }

  return res.status(200).json(results);
}
