const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Add OK / Thanks acknowledgment blocks before DEFAULT
const targetDefault = `            // ===== DEFAULT — Welcome or fallback =====`;

const ackBlocks = `            // ===== ACKNOWLEDGEMENTS ("ok", "okay", "ঠিক আছে", "জি", "আচ্ছা", "হুম", "ধন্যবাদ") =====
            else if (txt.match(/^(ok|okay|ওকে|ঠিক আছে|জি|আচ্ছা|accha|acha|হুম|hum|thik ase|thik|হয়তো|থাক)$/i)) {
              const reply = "জি ধন্যবাদ! 😊 আমাদের বিয়ের কার্ড দেখতে বা অর্ডার করতে নিচের বাটনে চাপুন!";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            else if (txt.match(/^(thanks|thank you|ধন্যবাদ|ধন্যবাদ।)$/i)) {
              const reply = "আপনাকেও অনেক ধন্যবাদ! 🌸 বিয়ের কার্ড সংক্রান্ত যেকোনো দরকারে আমাদের জানাতে পারেন।";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
`;

// 2. Remove isFirstTime from forcing welcome message
const oldWelcomeCheck = `              const isGreeting = txt.match(/^(hi|hello|hey|হাই|হ্যালো|আসসালামু|assalamu|get started|start|শুরু)$/i);
              const isFirstTime = !existingConv || !existingConv.messages || existingConv.messages.length <= 1;

              if (isGreeting || isFirstTime || isButtonClick) {`;

const newWelcomeCheck = `              const isGreeting = txt.match(/^(hi|hello|hey|হাই|হ্যালো|আসসালামু|assalamu|get started|start|শুরু)$/i);

              if (isGreeting || isButtonClick) {`;

if (content.includes(targetDefault)) {
  content = content.replace(targetDefault, ackBlocks + targetDefault);
  console.log('✅ Acknowledgement handlers added (OK, Thanks)');
} else {
  console.error('❌ Could not find targetDefault');
}

if (content.includes(oldWelcomeCheck)) {
  content = content.replace(oldWelcomeCheck, newWelcomeCheck);
  console.log('✅ Welcome check fixed (removed isFirstTime forcing welcome message)');
} else {
  console.error('❌ Could not find oldWelcomeCheck');
}

fs.writeFileSync(filePath, content, 'utf-8');
