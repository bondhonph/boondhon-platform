const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

const targetBeforeLocation = `            // ===== LOCATION / ADDRESS =====`;

const auditEnhancements = `            // ===== DIRECT CARD CODE QUERY (e.g. AFF-012, PREM-005, AFF 12) =====
            else if (txt.match(/\\b(aff|prem)[-_\\s]*(\\d{1,3})\\b/i)) {
              const codeMatch = txt.match(/\\b(aff|prem)[-_\\s]*(\\d{1,3})\\b/i);
              const prefix = codeMatch[1].toLowerCase() === 'prem' ? 'PREM' : 'AFF';
              const num = String(parseInt(codeMatch[2], 10)).padStart(3, '0');
              const cardCode = prefix + '-' + num;
              const category = prefix === 'PREM' ? 'premium' : 'affordable';
              setCurrentCategory(senderId, category);

              const priceTable = getFullPriceTable(category);
              const emoji = category === 'premium' ? '✨' : '💚';
              const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';

              const reply = 'আমাদের ' + emoji + ' ' + catName + ' কালেকশনের কার্ড (' + cardCode + '):\n\n' + priceTable + '\n\nকত পিস লাগবে বলুন! 😊';
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "দাম জানুন", payload: "BTN_PRICE" },
                { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== NIKAHNAMA GIFT QUERY =====
            else if (txt.match(/nikahnama|নিকাহনামা|নিকাহ নামা|gift|উপহার/i)) {
              const reply = "🎁 ফ্রি নিকাহনামা অফার:\n\nআমাদের ২০০ পিস বা তার বেশি যেকোনো কার্ড অর্ডার করলেই ১টি আকর্ষণীয় ফ্রি নিকাহনামা উপহার পাবেন! 😍\n\nঅর্ডার করতে চাইলে নিচের বাটনে চাপুন! 😊";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== CUSTOM DESIGN / PROOFING QUERY =====
            else if (txt.match(/custom|কাস্টম|ডিজাইন চেঞ্জ|ডিজাইনার|লেখা/i)) {
              const reply = "🎨 কাস্টম ডিজাইন সুবিধা:\n\nঅর্ডার কনফার্ম (৩০% অ্যাডভান্স) করার পর আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে হোয়াটসঅ্যাপ/মেসেঞ্জারে চেক করাবে।\n\nআপনার পছন্দ ও ওকে হওয়ার পরই প্রিন্ট শুরু হবে! 😊";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
`;

if (content.includes(targetBeforeLocation)) {
  content = content.replace(targetBeforeLocation, auditEnhancements + targetBeforeLocation);
  console.log('✅ Self-audit enhancements added successfully!');
} else {
  console.error('❌ Could not find targetBeforeLocation');
}

fs.writeFileSync(filePath, content, 'utf-8');
