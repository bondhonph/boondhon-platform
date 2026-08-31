const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

const targetAfterPolicy = `            else if (payload === 'BTN_POLICY' || txt.match(/পলিসি|policy|ডেলিভারি|delivery|কুরিয়ার/)) {
              await sendMessengerText(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);
            }`;

const newHandlers = `            else if (payload === 'BTN_POLICY' || txt.match(/পলিসি|policy|ডেলিভারি|delivery|কুরিয়ার/)) {
              await sendMessengerText(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);
            }
            // ===== LOCATION / ADDRESS =====
            else if (txt.match(/location|লোকেশন|ঠিকানা|address|kothay|কোথায়|কোথায়|office|অফিস|shop|দোকান|shoroom|শো-রুম|showroom/i)) {
              const reply = \`📍 আমাদের কারখানা ও অফিস ঠিকানা:\\nবন্ধন প্রিন্টিং হাউস, মানিকগঞ্জ, ঢাকা।\\n(মানিকগঞ্জ অফিসে এসে সরাসরি দেখা করতে পারবেন অথবা জেলা শহরের ভেতরে ক্যাশ অন ডেলিভারিতে অর্ডার নিতে পারবেন!)\\n\\n🗺️ গুগল ম্যাপ লিংক:\\nhttps://maps.app.goo.gl/CnyRST5KxHjWDAtd9\\n\\nকার্ড দেখতে বা অর্ডার করতে নিচের বাটনে চাপুন! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== PAYMENT / BKASH NUMBER =====
            else if (txt.match(/bkash|bKash|বিকাশ|nagad|নগদ|rocket|রকেট|payment|পেমেন্ট|এডভান্স|advance/i)) {
              const reply = \`💳 পেমেন্ট তথ্য:\\n\\nঅর্ডার কনফার্ম করতে ৩০% অ্যাডভান্স পেমেন্ট করতে হবে।\\n\\n📲 পেমেন্ট নম্বর (পার্সোনাল):\\n01682588856 (বিকাশ / নগদ / রকেট)\\n\\nপেমেন্ট করার পর এখানে স্ক্রিনশট বা ট্রানজেকশন আইডি পাঠান! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
                { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== CONTACT / PHONE / HOTLINE =====
            else if (txt.match(/phone|mobile|ফোন|মোবাইল|contact|যোগাযোগ|hotline|whatsapp|হোয়াটসঅ্যাপ|কথা বলব|call/i)) {
              const reply = \`📞 আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন:\\n01701016826 (বন্ডহন হটলাইন)\\n\\nআপনার যেকোনো প্রশ্নের জন্য আমরা রেডি আছি! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }`;

if (content.includes(targetAfterPolicy)) {
  content = content.replace(targetAfterPolicy, newHandlers);
  console.log('✅ Essential intent handlers (Location, Payment, Phone) added successfully!');
} else {
  console.error('❌ Could not find targetAfterPolicy');
}

fs.writeFileSync(filePath, content, 'utf-8');
