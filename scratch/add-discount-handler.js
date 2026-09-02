const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Update systemPrompt in generateAISalesResponse with bargaining rule
const oldRule = `- কাস্টমার নিজের পছন্দ বা কাস্টম ডিজাইন চাইলে বলো অ্যাডভান্সের পর আমাদের ডিজাইনার হোয়াটসঅ্যাপে ডিজাইন প্রুফ তৈরি করে দেখাবে।`;
const newRule = `- কাস্টমার নিজের পছন্দ বা কাস্টম ডিজাইন চাইলে বলো অ্যাডভান্সের পর আমাদের ডিজাইনার হোয়াটসঅ্যাপে ডিজাইন প্রুফ তৈরি করে দেখাবে।
- কাস্টমার দাম কমাতে বা ডিসকাউন্ট চাইলে বলো: "আমাদের দামগুলো সেরা মেটেরিয়াল ও পাইকারি রেটে নির্ধারিত। তবে ২০০+ পিস নিলে প্রতি পিসের দাম অনেক কমে আসবে এবং ফ্রি নিকাহনামা উপহার পাবেন!"`;

// 2. Add Bargaining Intent Handler right after CUSTOM DESIGN handler
const targetAfterCustom = `            // ===== LOCATION / ADDRESS =====`;

const bargainingHandler = `            // ===== BARGAINING / DISCOUNT QUERY =====
            else if (txt.match(/discount|ডিসকাউন্ট|ছাড়|ছাড়|কম রাখা|কমান|কিছু কম|একটু কম|কম হবে|kom hobe|kom dhen|kom rakh/i)) {
              const reply = \`আমাদের দামগুলো সেরা মেটেরিয়াল ও কোয়ালিটি নিশ্চিত করে পাইকারি রেটে নির্ধারিত। 😊\\n\\n💡 তবে আপনার জন্য পরামর্শ:\\n২০০ পিস বা তার বেশি অর্ডার করলে পিস প্রতি দাম অনেক কমে আসবে (Affordable: ৩৫৳, Premium: ৪৫৳) এবং সাথে ১টি চমৎকার ফ্রি নিকাহনামা উপহার পাবেন! 🎁\\n\\nআপনি কত পিস নিতে চাচ্ছেন বলুন, সেরা হিসাব করে দিচ্ছি! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "২০০ পিস অর্ডার", payload: "QTY_200" },
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
`;

if (content.includes(oldRule)) {
  content = content.replace(oldRule, newRule);
  console.log('✅ Bargaining rule added to AI system prompt');
} else {
  console.error('❌ Could not find oldRule');
}

if (content.includes(targetAfterCustom)) {
  content = content.replace(targetAfterCustom, bargainingHandler + targetAfterCustom);
  console.log('✅ Bargaining intent handler added to messenger.js');
} else {
  console.error('❌ Could not find targetAfterCustom');
}

fs.writeFileSync(filePath, content, 'utf-8');
