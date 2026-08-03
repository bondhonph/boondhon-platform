import { getConversations, getConversation, setHumanTakeover, setOrderStatus, appendMessage } from '../../lib/chat-store';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { phone } = req.query;
    if (phone) {
      const conv = getConversation(phone);
      return res.status(200).json({ conversation: conv });
    }
    const conversations = getConversations();
    return res.status(200).json({ conversations });
  }

  if (req.method === 'POST') {
    const { action, phone, humanTakeover, orderStatus, text, sender, name } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (action === 'toggle_bot') {
      const updated = setHumanTakeover(phone, humanTakeover);
      return res.status(200).json({ success: true, conversation: updated });
    }

    if (action === 'update_status') {
      const updated = setOrderStatus(phone, orderStatus);
      return res.status(200).json({ success: true, conversation: updated });
    }

    if (action === 'append_msg') {
      const updated = appendMessage(phone, sender || 'admin', text, null, name);
      return res.status(200).json({ success: true, conversation: updated });
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
