export const delay = ms => new Promise(res => setTimeout(res, ms));

// Meta Graph API Call: Send Text
export async function sendWhatsAppMessage(phoneId, to, text) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const targetPhoneId = phoneId || process.env.WHATSAPP_PHONE_ID;
  if (!whatsappToken) {
    return { success: false, error: 'WHATSAPP_TOKEN environment variable missing' };
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
    
    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.error?.message || `Meta API Error (${res.status})`;
      console.error(`Failed to send WhatsApp text: ${errMsg}`);
      return { success: false, error: errMsg };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Error in sendWhatsAppMessage:', err.message);
    return { success: false, error: err.message };
  }
}

// Meta Graph API Call: Send Interactive Buttons
export async function sendWhatsAppButtons(phoneId, to, text, buttons) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const targetPhoneId = phoneId || process.env.WHATSAPP_PHONE_ID;
  if (!whatsappToken) return { success: false, error: 'WHATSAPP_TOKEN missing' };

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
    
    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.error?.message || `Meta API Error (${res.status})`;
      console.error(`Failed to send WhatsApp buttons: ${errMsg}`);
      return { success: false, error: errMsg };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Error in sendWhatsAppButtons:', err.message);
    return { success: false, error: err.message };
  }
}

// Meta Graph API Call: Send Image
export async function sendWhatsAppImage(phoneId, to, imageUrl) {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const targetPhoneId = phoneId || process.env.WHATSAPP_PHONE_ID;
  if (!whatsappToken) return { success: false, error: 'WHATSAPP_TOKEN missing' };

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

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.error?.message || `Meta API Error (${res.status})`;
      console.error(`Failed to send WhatsApp image: ${errMsg}`);
      return { success: false, error: errMsg };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Error in sendWhatsAppImage:', err.message);
    return { success: false, error: err.message };
  }
}
