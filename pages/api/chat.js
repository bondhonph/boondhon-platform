function getFallbackReply(userText) {
  const txt = (userText || '').toLowerCase();

  if (txt.includes('দাম') || txt.includes('price') || txt.includes('কত') || txt.includes('টাকা') || txt.includes('রেট') || txt.includes('rate')) {
    return `আসসালামু আলাইকুম! 🌸 BOONDHON-এর কার্ডের মূল্য তালিকা:\n\n• Affordable: ৫০পিস ২,৭৫০৳ | ১০০পিস ৪,৫০০৳ | ২০০পিস ৭,০০০৳\n• Premium: ৫০পিস ৩,২৫০৳ | ১০০পিস ৫,৫০০৳ | ২০০পিস ৯,০০০৳\n\n🎁 ২০০+ পিসে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🥰\n\nআপনার কত পিস কার্ড প্রয়োজন এবং কোন ক্যাটাগরি বেশি পছন্দ—Affordable নাকি Premium? 😊`;
  }
  if (txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল') || txt.includes('সাশ্রয়ী')) {
    return `আমাদের Affordable ক্যাটাগরিতে ৮৫টির বেশি চমৎকার ও গর্জিয়াস বিয়ের কার্ড ডিজাইন রয়েছে! 🌸\n\nমূল্য তালিকা:\n• ৫০পিস: ২,৭৫০৳\n• ১০০পিস: ৪,৫০০৳\n• ২০০পিস: ৭,০০০৳\n\nআপনি কি আমাদের ওয়েবসাইট গ্যালারি থেকে ছবিগুলো দেখতে চান নাকি অর্ডার ফর্মে যাবেন? 😊`;
  }
  if (txt.includes('premium') || txt.includes('প্রিমিয়াম') || txt.includes('রাজকীয়')) {
    return `আমাদের Premium ক্যাটাগরিতে ৮৩টির বেশি রাজকীয় গোল্ড ফয়েল ও এম্বস কার্ড ডিজাইন রয়েছে! ✨\n\nমূল্য তালিকা:\n• ৫০পিস: ৩,২৫০৳\n• ১০০পিস: ৫,৫০০৳\n• ২০০পিস: ৯,০০০৳\n🎁 ২০০+ পিসে ১টি প্রিমিয়াম নিকাহনামা ফ্রি!\n\nআপনার কি কোনো নির্দিষ্ট ডিজাইন পছন্দ হয়েছে? 😊`;
  }
  if (txt.includes('অর্ডার') || txt.includes('order') || txt.includes('কিনব') || txt.includes('পছন্দ')) {
    return `অর্ডার করা অত্যন্ত সহজ! 📝\n\n১. আমাদের অনলাইন "অর্ডার" ফর্মে গিয়ে বর-কনের নাম ও ঠিকানা পূরণ করতে পারেন।\n২. অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে (01863586302) মেসেজ দিয়ে বুকিং দিতে পারেন। 🌸\n\n৩০% অগ্রিম পেমেন্টে আমরা ডেমো ডিজাইন তৈরি করে ওকে করিয়ে প্রিন্ট করি। আপনি কি এখন অর্ডার ফর্ম পূরণ করবেন? 😊`;
  }
  if (txt.includes('ঠিকানা') || txt.includes('অফিস') || txt.includes('লোকেশন') || txt.includes('কোথায়') || txt.includes('কোথায়')) {
    return `আমাদের প্রধান অফিস: মানিকগঞ্জ। 📍\n\nআমরা সুন্দরবন ও এসএ পরিবহনের মাধ্যমে সারা বাংলাদেশে ৫-৭ কর্মদিবসের মধ্যে ক্যাশ অন ডেলিভারি করি। 🚚\n\nআপনার ডেলিভারি জেলা কোনটি? 😊`;
  }
  if (txt.includes('পেমেন্ট') || txt.includes('বিকাশ') || txt.includes('নগদ') || txt.includes('রকেট') || txt.includes('টাকা পাঠাব')) {
    return `আমাদের বিকাশ/নগদ/রকেট পারসোনাল নম্বর: 01682588856 💳\n\n৩০% অগ্রিম বুকিং ফি দিয়ে ডেমো ডিজাইন কনফার্ম করতে হয়। ডেমো পছন্দ হলে তবেই প্রিন্ট শুরু হবে। আপনি কি পেমেন্ট পাঠিয়ে বুকিং দেবেন? 😊`;
  }
  if (txt.includes('ডেলিভারি') || txt.includes('সময়') || txt.includes('দিন')) {
    return `অর্ডার ও ডেমো ডিজাইন কনফার্ম করার ৫-৭ কর্মদিবসের মধ্যে আপনার জেলা শহরে ডেলিভারি পৌঁছে দেওয়া হয়। 🚚\n\nআপনার কি জরুরি ভিত্তিতে কার্ড প্রয়োজন? 😊`;
  }
  return `আসসালামু আলাইকুম! 🌸 BOONDHON Printing House-এ আপনাকে স্বাগতম, আমি অনন্যা।\n\nআপনার পছন্দের কার্ডের ক্যাটাগরি (Affordable/Premium) বা কত পিস কার্ড লাগবে জানান, আমি এখনই তথ্য ও গ্যালারি লিংক প্রদান করছি। 🥰 (হটলাইন: 01701016826)`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;
  const lastUserMsg = Array.isArray(messages) ? messages[messages.length - 1]?.content : '';

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.json({ reply: getFallbackReply(lastUserMsg) });
  }

  const systemText = `তুমি BOONDHON Printing House-এর স্মার্ট সহকারী 'অনন্যা'।
টোন: অত্যন্ত মিষ্টি, শালীন, আন্তরিক ও সাহায্যকারী সেলস এজেন্ট। প্রচুর ইমোজি ব্যবহার করবে।
প্রাইস: ৫০পিস Affordable=২৭৫০, Premium=৩২৫০। ১০০পিস Affordable=৪৫০০, Premium=৫৫০০। ২০০পিস Affordable=৭০০০, Premium=৯০০০।
২০০+ পিসে FREE প্রিমিয়াম নিকাহনামা।
হটলাইন কল: 01701016826 | WhatsApp বট চ্যাট: 01863586302।
Payment: bKash/Nagad/Rocket: 01682588856
অফিস: মানিকগঞ্জ। ডেলিভারি ৫-৭ কর্মদিবস (ক্যাশ অন ডেলিভারি)।
কখনো নিজেকে AI বলবে না, নাম বলবে 'অনন্যা'। বাংলায় কথা বলবে।
প্রতিটি প্রশ্নের উত্তর দেওয়ার পর কাস্টমারকে একটি মিষ্টি ও প্রাসঙ্গিক প্রশ্ন বা পরবর্তী পদক্ষেপের পরামর্শ (যেমন: "আপনার কত পিস কার্ড লাগবে?", "কোন ক্যাটাগরি পছন্দ?") জিজ্ঞেস করবে।`;

  const contents = (messages || []).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemText }] },
          generationConfig: { maxOutputTokens: 1000 }
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
