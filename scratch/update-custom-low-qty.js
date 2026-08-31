const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Add getLowQtyPrice helper after getCategoryPrice
const targetCategoryPrice = `  return \`\${label} কালেকশন:\\n\${bngDigits(qty)} পিসের দাম: \${bngDigits(total.toLocaleString('en-IN').replace(/,/g, ','))}৳ (পিস প্রতি \${bngDigits(perPiece)}৳)\${freeGift}\`;
}`;

const newCategoryPriceWithLowQty = `  return \`\${label} কালেকশন:\\n\${bngDigits(qty)} পিসের দাম: \${bngDigits(total.toLocaleString('en-IN').replace(/,/g, ','))}৳ (পিস প্রতি \${bngDigits(perPiece)}৳)\${freeGift}\`;
}

// Low quantity custom pricing (less than 50 pcs)
function getLowQtyPrice(qty) {
  let rateMsg = '';
  if (qty <= 5) {
    rateMsg = \`\${bngDigits(qty)} পিসের সর্বমোট দাম: ১,০০০৳ (কম পরিমাণে ফিক্সড ডাইস ও মেকিং চার্জ সহ)\`;
  } else if (qty <= 10) {
    rateMsg = \`\${bngDigits(qty)} পিসের সর্বমোট দাম: ১,৫০০৳ (ফিক্সড চার্জ)\`;
  } else if (qty <= 25) {
    const total = qty * 75;
    rateMsg = \`\${bngDigits(qty)} পিসের দাম: \${bngDigits(total.toLocaleString('en-IN'))}৳ (পিস প্রতি ৭৫৳)\`;
  } else {
    const total = qty * 65;
    rateMsg = \`\${bngDigits(qty)} পিসের দাম: \${bngDigits(total.toLocaleString('en-IN'))}৳ (পিস প্রতি ৬৫৳)\`;
  }

  return \`📦 \${bngDigits(qty)} পিস কার্ডের দামের হিসাব:\\n\\n\${rateMsg}\\n\\n💡 পরামর্শ: ৫০ পিস বা তার বেশি অর্ডার করলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\\n\\nঅর্ডার করতে চাইলে বলুন! 😊\`;
}`;

// 2. Replace quantity < 50 handling
const oldQtyHandler = `              if (quantity < 50) {
                const reply = \`আমাদের বিয়ের কার্ডের সর্বনিম্ন অর্ডার ৫০ পিস। 😊\\n৫০ পিসের নিচে কাস্টম প্রিন্ট করা সম্ভব হয় না।\\n\\n৫০ পিসের সর্বনিম্ন দাম:\\n💚 Affordable: ২,৭৫০৳ (৫৫৳/পিস)\\n✨ Premium: ৩,২৫০৳ (৬৫৳/পিস)\\n\\nআপনি কি ৫০ পিস অর্ডার করতে চান? 😊\`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "৫০ পিস অর্ডার", payload: "QTY_50" },
                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
                ]);
                appendMessage(senderId, 'bot', reply);
              }`;

const newQtyHandler = `              if (quantity < 50) {
                const reply = getLowQtyPrice(quantity);
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  { title: "৫০ পিস রেট", payload: "QTY_50" },
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              }`;

if (content.includes(targetCategoryPrice)) {
  content = content.replace(targetCategoryPrice, newCategoryPriceWithLowQty);
  console.log('✅ getLowQtyPrice helper added');
} else {
  console.error('❌ Could not find targetCategoryPrice');
}

if (content.includes(oldQtyHandler)) {
  content = content.replace(oldQtyHandler, newQtyHandler);
  console.log('✅ Low quantity handler updated');
} else {
  console.error('❌ Could not find oldQtyHandler');
}

fs.writeFileSync(filePath, content, 'utf-8');
