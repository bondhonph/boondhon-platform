function getFallbackReply(userText) {
  const txt = (userText || '').toLowerCase();
  if (txt.includes('দাম') || txt.includes('price') || txt.includes('কত') || txt.includes('টাকা') || txt.includes('রেট') || txt.includes('rate')) {
    return 'আসসালামু আলাইকুম! 🌸 BOONDHON-এর কার্ডের মূল্য তালিকা:\n• Affordable: ৫০পিস ২,৭৫০৳ | ১০০পিস ৪,৫০০৳ | ২০০পিস ৭,০০০৳\n• Premium: ৫০পিস ৩,২৫০৳ | ১০০পিস ৫,৫০০৳ | ২০০পিস ৯,০০০৳\n🎁 ২০০+ পিসে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🥰';
  }
  if (txt.includes('অর্ডার') || txt.includes('order') || txt.includes('কিনব') || txt.includes('পছন্দ')) {
    return 'অর্ডার করতে ওয়েবসাইটের "অর্ডার" ফর্মে গিয়ে তথ্য দিন অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন: 01863586302 🌸 ৩০% বুকিং মানি দিয়ে অর্ডার কনফার্ম করতে হয়।';
  }
  if (txt.includes('ঠিকানা') || txt.includes('অফিস') || txt.includes('লোকেশন') || txt.includes('কোথায়') || txt.includes('কোথায়')) {
    return 'আমাদের অফিস: মানিকগঞ্জ। সারাদেশে ৫-৭ কর্মদিবসের মধ্যে সুন্দরবন/এসএ পরিবহনের মাধ্যমে ডেলিভারি দেওয়া হয়। 🌸';
  }
  if (txt.includes('পেমেন্ট') || txt.includes('বিকাশ') || txt.includes('নগদ') || txt.includes('রকেট') || txt.includes('টাকা পাঠাব')) {
    return 'আমাদের বিকাশ/নগদ/রকেট পারসোনাল নম্বর: 01682588856 💳 (৩০% অগ্রিম বুকিং ফি দিয়ে ডেমো ডিজাইন কনফার্ম করতে হয়)।';
  }
  if (txt.includes('ডেলিভারি') || txt.includes('সময়') || txt.includes('দিন')) {
    return 'অর্ডার কনফার্ম করার পর ডেমো ডিজাইন আপনার থেকে ওকে করিয়ে ৫-৭ কর্মদিবসের মধ্যে ডেলিভারি করা হয়। 🚚';
  }
  return 'আসসালামু আলাইকুম! 🌸 BOONDHON Printing House-এ আপনাকে স্বাগতম। আপনার পছন্দের কার্ডের মডেল বা পরিমাণ জানান, আমি এখনই তথ্য প্রদান করছি।🥰 Hotline: 01863586302';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;
  const lastUserMsg = Array.isArray(messages) ? messages[messages.length - 1]?.content : '';

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.json({ reply: getFallbackReply(lastUserMsg) });
  }

  const systemText = `তুমি BOONDHON Printing House-এর AI Sales Agent 'Payel'।
টোন: অত্যন্ত মিষ্টি, আন্তরিক ও সেলস ক্লোজিংমুখী। প্রচুর ইমোজি ব্যবহার করবে।
প্রাইস: ৫০পিস Affordable=২৭৫০, Premium=৩২৫০। ১০০পিস Affordable=৪৫০০, Premium=৫৫০০। ২০০পিস Affordable=৭০০০, Premium=৯০০০।
২০০+ পিসে FREE নিকাহনামা।
হটলাইন: 01863586302 (WhatsApp)।
Payment: bKash/Nagad/Rocket: 01682588856
অফিস: মানিকগঞ্জ। ডেলিভারি ৫-৭ কর্মদিবস।
কখনো AI বলবে না। বাংলায় কথা বলবে।
সংক্ষিপ্ত ও কার্যকর উত্তর দেবে — ২-৩ বাক্যের বেশি নয়।`;

  const contents = (messages || []).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemText }] },
          generationConfig: { maxOutputTokens: 1000, temperature: 0.8 }
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API Error, using fallback:', data);
      return res.json({ reply: getFallbackReply(lastUserMsg) });
    }
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackReply(lastUserMsg);
    return res.json({ reply });
  } catch (err) {
    return res.json({ reply: getFallbackReply(lastUserMsg) });
  }
}
