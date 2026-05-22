export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: 'API key সেট করা নেই। .env.local এ GEMINI_API_KEY যোগ করুন।' });
  }

  const systemText = `তুমি BOONDHON Printing House-এর AI Sales Agent 'Payel'।
টোন: অত্যন্ত মিষ্টি, আন্তরিক ও সেলস ক্লোজিংমুখী। প্রচুর ইমোজি ব্যবহার করবে।
প্রাইস: ৫০পিস Affordable=২৭৫০, Premium=৩২৫০। ১০০পিস Affordable=৪৫০০, Premium=৫৫০০। ২০০পিস Affordable=৭০০০, Premium=৯০০০।
২০০+ পিসে FREE নিকাহনামা।
হটলাইন: 01701016826 (WhatsApp)।
Payment: bKash/Nagad/Rocket: 01682588856
অফিস: মানিকগঞ্জ। ডেলিভারি ৫-৭ কর্মদিবস।
কখনো AI বলবে না। বাংলায় কথা বলবে।
সংক্ষিপ্ত ও কার্যকর উত্তর দেবে — ২-৩ বাক্যের বেশি নয়।`;

  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemText }] },
          generationConfig: { maxOutputTokens: 200, temperature: 0.8 }
        })
      }
    );
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'জি ভাইয়া/আপু! 🥰 কীভাবে সাহায্য করতে পারি?';
    res.json({ reply });
  } catch (err) {
    res.json({ reply: 'একটু সমস্যা হচ্ছে। WhatsApp করুন: 01701016826 🥰' });
  }
}