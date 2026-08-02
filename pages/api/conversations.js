import { conversationStore } from '../../lib/store';
import { QUICK_REPLIES } from '../../lib/quick-replies';
import { sendWhatsAppMessage, sendWhatsAppImage, delay } from '../../lib/whatsapp-api';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { phone } = req.query;
      if (phone) {
        const conv = await conversationStore.getConversation(phone);
        if (!conv) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
        return res.status(200).json({
          conversation: conv,
          quickReplies: QUICK_REPLIES
        });
      }

      const list = await conversationStore.getConversations();
      return res.status(200).json({
        conversations: list,
        quickReplies: QUICK_REPLIES
      });
    } catch (err) {
      console.error('Error fetching conversations:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, phone, text, imageUrl, quickReplyId, active, pauseDuration } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const conv = await conversationStore.getConversation(phone);
      const phoneId = conv?.phoneId || process.env.WHATSAPP_PHONE_ID;

      // 1. Manual Reply (Text / Image) from Dashboard App
      if (action === 'send_message') {
        let lastError = null;

        if (text && text.trim()) {
          const resText = await sendWhatsAppMessage(phoneId, phone, text.trim());
          if (resText.success) {
            await conversationStore.addMessage(phone, {
              sender: 'agent',
              text: text.trim(),
              timestamp: Date.now()
            });
          } else {
            lastError = resText.error;
          }
        }

        if (imageUrl && imageUrl.trim()) {
          if (!lastError) await delay(1000);
          const resImg = await sendWhatsAppImage(phoneId, phone, imageUrl.trim());
          if (resImg.success) {
            await conversationStore.addMessage(phone, {
              sender: 'agent',
              image: imageUrl.trim(),
              text: '',
              timestamp: Date.now()
            });
          } else {
            lastError = resImg.error;
          }
        }

        if (lastError) {
          return res.status(400).json({ error: `Meta WhatsApp API error: ${lastError}` });
        }

        await conversationStore.setHumanTakeover(phone, true, pauseDuration || 30);

        const updatedConv = await conversationStore.getConversation(phone);
        return res.status(200).json({ success: true, conversation: updatedConv });
      }

      // 2. Toggle Human Takeover / Resume Bot
      if (action === 'toggle_bot') {
        const isCurrentlyActive = active !== undefined ? active : !conversationStore.isHumanActive(phone);
        await conversationStore.setHumanTakeover(phone, isCurrentlyActive, pauseDuration || 30);

        const updatedConv = await conversationStore.getConversation(phone);
        return res.status(200).json({ success: true, conversation: updatedConv });
      }

      // 3. Quick Reply Shortcut Response
      if (action === 'send_quick_reply') {
        const qr = QUICK_REPLIES.find(q => q.id === quickReplyId);
        if (!qr) {
          return res.status(404).json({ error: 'Quick reply not found' });
        }

        let lastError = null;

        if (qr.text) {
          const resText = await sendWhatsAppMessage(phoneId, phone, qr.text);
          if (resText.success) {
            await conversationStore.addMessage(phone, {
              sender: 'agent',
              text: qr.text,
              timestamp: Date.now()
            });
          } else {
            lastError = resText.error;
          }
        }

        if (qr.images && Array.isArray(qr.images)) {
          for (const imgUrl of qr.images) {
            await delay(1200);
            const resImg = await sendWhatsAppImage(phoneId, phone, imgUrl);
            if (resImg.success) {
              await conversationStore.addMessage(phone, {
                sender: 'agent',
                image: imgUrl,
                text: '',
                timestamp: Date.now()
              });
            } else {
              lastError = resImg.error;
            }
          }
        }

        if (lastError) {
          return res.status(400).json({ error: `Meta WhatsApp API error: ${lastError}` });
        }

        await conversationStore.setHumanTakeover(phone, true, pauseDuration || 30);

        const updatedConv = await conversationStore.getConversation(phone);
        return res.status(200).json({ success: true, conversation: updatedConv });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (err) {
      console.error('Error in conversations handler:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
