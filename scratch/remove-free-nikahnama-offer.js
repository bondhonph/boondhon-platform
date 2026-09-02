const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Remove freeGift in getCategoryPrice
content = content.replace(
  'const freeGift = qty >= 200 ? "\\n🎁 ২০০+ পিসে ১টি ফ্রি নিকাহনামা!" : "";',
  'const freeGift = "";'
);

// 2. Remove free gift from getFullPriceTable
content = content.replace(
  '• ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস + ১টি ফ্রি নিকাহনামা 🎁)',
  '• ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)'
);

content = content.replace(
  '• ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস + ১টি ফ্রি নিকাহনামা 🎁)',
  '• ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস)'
);

// 3. Remove free gift from systemPrompt in generateAISalesResponse
content = content.replace(
  '- ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস + ১টি ফ্রি নিকাহনামা 🎁)',
  '- ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)'
);

content = content.replace(
  '- ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস + ১টি ফ্রি নিকাহনামা 🎁)',
  '- ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস)'
);

content = content.replace(
  'এবং ফ্রি নিকাহনামা উপহার পাবেন!',
  '!'
);

// 4. Update NIKAHNAMA GIFT QUERY handler
const oldNikahnamaQuery = `            // ===== NIKAHNAMA GIFT QUERY =====
            else if (txt.match(/nikahnama|নিকাহনামা|নিকাহ নামা|gift|উপহার/i)) {
              const reply = \`🎁 ফ্রি নিকাহনামা অফার:

আমাদের ২০০ পিস বা তার বেশি যেকোনো কার্ড অর্ডার করলেই ১টি আকর্ষণীয় ফ্রি নিকাহনামা উপহার পাবেন! 😍

অর্ডার করতে চাইলে নিচের বাটনে চাপুন! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }`;

const newNikahnamaQuery = `            // ===== NIKAHNAMA QUERY =====
            else if (txt.match(/nikahnama|নিকাহনামা|নিকাহ নামা/i)) {
              const reply = \`📜 নিকাহনামা তথ্য:\\n\\nনিকাহনামা সার্ভিস সম্পর্কে জানতে বা আলাদাভাবে নিকাহনামা প্রিন্ট করতে আমাদের হটলাইনে কল বা হোয়াটসঅ্যাপ করুন! 😊\\n\\n📞 হটলাইন: 01701016826\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }`;

if (content.includes(oldNikahnamaQuery)) {
  content = content.replace(oldNikahnamaQuery, newNikahnamaQuery);
  console.log('✅ Nikahnama query handler updated');
} else {
  console.error('⚠️ Could not find exact oldNikahnamaQuery, checking substring...');
}

// 5. Update BARGAINING / DISCOUNT QUERY handler
content = content.replace(
  ' এবং সাথে ১টি চমৎকার ফ্রি নিকাহনামা উপহার পাবেন! 🎁',
  ''
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Free Nikahnama offer removed from all locations!');
