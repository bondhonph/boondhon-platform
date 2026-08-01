// Helper for delay
export const delay = ms => new Promise(res => setTimeout(res, ms));

// Meta Graph API Call: Send Text
export async function sendWhatsAppMessage(phoneId, to, text) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const targetPhoneId = phoneId || process.env.WHATSAPP_PHONE_ID;
  if (!whatsappToken) {
    console.error('WHATSAPP_TOKEN is missing');
    return false;
  }

  const url = `https://graph.facebook.com/v20.0/${targetPhoneId}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: text }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send WhatsApp text message: ${errText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in sendWhatsAppMessage:', err.message);
    return false;
  }
}

// Meta Graph API Call: Send Interactive Buttons
export async function sendWhatsAppButtons(phoneId, to, text, buttons) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const targetPhoneId = phoneId || process.env.WHATSAPP_PHONE_ID;
  if (!whatsappToken) return false;

  const url = `https://graph.facebook.com/v20.0/${targetPhoneId}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: text },
          action: {
            buttons: buttons.map(b => ({
              type: "reply",
              reply: { id: b.id, title: b.title }
            }))
          }
        }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send WhatsApp buttons: ${errText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in sendWhatsAppButtons:', err.message);
    return false;
  }
}

// Meta Graph API Call: Send Image
export async function sendWhatsAppImage(phoneId, to, imageUrl) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const targetPhoneId = phoneId || process.env.WHATSAPP_PHONE_ID;
  if (!whatsappToken) return false;

  const url = `https://graph.facebook.com/v20.0/${targetPhoneId}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "image",
        image: { link: imageUrl }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send WhatsApp image [${imageUrl}]: ${errText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in sendWhatsAppImage:', err.message);
    return false;
  }
}
