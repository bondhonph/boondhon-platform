const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Update quantity regex
const oldRegex = `            let quantity = null;
            if (payload.startsWith('QTY_')) {
              quantity = parseInt(payload.replace('QTY_', ''), 10);
            } else {
              const numMatch = txt.match(/\\b(\\d{2,5})\\b/);
              if (numMatch) {
                const num = parseInt(numMatch[1], 10);
                if (num >= 20) quantity = num;
              }
            }`;

const newRegex = `            let quantity = null;
            if (payload.startsWith('QTY_')) {
              quantity = parseInt(payload.replace('QTY_', ''), 10);
            } else {
              const numMatch = txt.match(/\\b(\\d{1,5})\\s*(pcs?|piece|পিস|পিসি)?\\b/i);
              if (numMatch) {
                const num = parseInt(numMatch[1], 10);
                if (num > 0 && num < 10000) quantity = num;
              }
            }`;

// 2. Update quantity handler for min 50 pcs
const oldHandler = `            // ===== QUANTITY — Show price for CURRENT category only =====
            else if (quantity) {
              const currentCat = getCurrentCategory(senderId) || 'affordable';
              const reply = getCategoryPrice(quantity, currentCat) + "\\n\\nঅর্ডার করতে চাইলে বলুন! 😊";
              
              const oppositeBtn = currentCat === 'premium'
                ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
                : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };
              
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                oppositeBtn,
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }`;

const newHandler = `            // ===== QUANTITY — Show price for CURRENT category or Min 50 Pcs Warning =====
            else if (quantity) {
              if (quantity < 50) {
                const reply = \`আমাদের বিয়ের কার্ডের সর্বনিম্ন অর্ডার ৫০ পিস। 😊\\n৫০ পিসের নিচে কাস্টম প্রিন্ট করা সম্ভব হয় না।\\n\\n৫০ পিসের সর্বনিম্ন দাম:\\n💚 Affordable: ২,৭৫০৳ (৫৫৳/পিস)\\n✨ Premium: ৩,২৫০৳ (৬৫৳/পিস)\\n\\nআপনি কি ৫০ পিস অর্ডার করতে চান? 😊\`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "৫০ পিস অর্ডার", payload: "QTY_50" },
                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                const currentCat = getCurrentCategory(senderId) || 'affordable';
                const reply = getCategoryPrice(quantity, currentCat) + "\\n\\nঅর্ডার করতে চাইলে বলুন! 😊";
                
                const oppositeBtn = currentCat === 'premium'
                  ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
                  : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };
                
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  oppositeBtn,
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              }
            }`;

if (content.includes(oldRegex)) {
  content = content.replace(oldRegex, newRegex);
  console.log('✅ Quantity regex updated');
} else {
  console.error('❌ Could not find old regex pattern');
}

if (content.includes(oldHandler)) {
  content = content.replace(oldHandler, newHandler);
  console.log('✅ Quantity handler updated');
} else {
  console.error('❌ Could not find old handler pattern');
}

fs.writeFileSync(filePath, content, 'utf-8');
