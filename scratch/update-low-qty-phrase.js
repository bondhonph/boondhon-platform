const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Update getLowQtyPrice function (removed tier 4 #65tk, all 11-49 pcs are 75tk/pc)
const oldGetLowQtyPrice = `function getLowQtyPrice(qty) {
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

const newGetLowQtyPrice = `function getLowQtyPrice(qty) {
  let rateMsg = '';
  if (qty <= 5) {
    rateMsg = \`\${bngDigits(qty)} পিসের সর্বমোট দাম: ১,০০০৳ (কম পরিমাণে ফিক্সড ডাইস ও মেকিং চার্জ সহ)\`;
  } else if (qty <= 10) {
    rateMsg = \`\${bngDigits(qty)} পিসের সর্বমোট দাম: ১,৫০০৳ (ফিক্সড চার্জ)\`;
  } else {
    const total = qty * 75;
    rateMsg = \`\${bngDigits(qty)} পিসের দাম: \${bngDigits(total.toLocaleString('en-IN'))}৳ (পিস প্রতি ৭৫৳)\`;
  }

  return \`📦 \${bngDigits(qty)} পিস কার্ডের দামের হিসাব:\\n\\n\${rateMsg}\\n\\n💡 পরামর্শ: ৫০ পিস বা তার বেশি অর্ডার করলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\\n\\nঅর্ডার করতে চাইলে বলুন! 😊\`;
}`;

// 2. Add low quantity phrase detection before AFFORDABLE COLLECTION
const targetBeforeAffordable = `            // ===== QUANTITY — Show price for CURRENT category or Min 50 Pcs Warning =====`;

const lowQtyPhraseBlock = `            // ===== LOW QUANTITY PHRASE QUERY ("আমার অল্প লাগবে" / "olpo lagbe" / "kom lagbe") =====
            else if (txt.match(/olpo|অল্প|kom|কম|koyekta|কয়েকটা|কয়েকটি|কম পিস|olpo lagbe|kom lagbe|olpo pisi|kom pcs/i) && !txt.match(/কমপ্লিট|কমেন্ট|কম্পানি/i)) {
              const reply = \`জি, আমাদের কাছে অল্প পরিমাণেও (১-৪৯ পিস) বিয়ের কার্ড অর্ডার করতে পারবেন! 😊\\n\\nঅল্প পরিমাণের প্রাইসিং রেট:\\n• ১-৫ পিস: ১,০০০৳ (ফিক্সড মেকিং চার্জ সহ)\\n• ৬-১০ পিস: ১,৫০০৳ (ফিক্সড চার্জ)\\n• ১১-৪৯ পিস: পিস প্রতি ৭৫৳ (যেমন ২৫ পিস = ১,৮৭৫৳)\\n\\n💡 পরামর্শ: ৫০+ পিস নিলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\\n\\nআপনার কত পিস লাগবে বলুন! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "৫ পিস (১০০০৳)", payload: "QTY_5" },
                { title: "১০ পিস (১৫০০৳)", payload: "QTY_10" },
                { title: "২৫ পিস (১৮৭৫৳)", payload: "QTY_25" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
`;

if (content.includes(oldGetLowQtyPrice)) {
  content = content.replace(oldGetLowQtyPrice, newGetLowQtyPrice);
  console.log('✅ getLowQtyPrice updated (removed tier 4 #65tk)');
} else {
  console.error('❌ Could not find oldGetLowQtyPrice');
}

if (content.includes(targetBeforeAffordable)) {
  content = content.replace(targetBeforeAffordable, lowQtyPhraseBlock + targetBeforeAffordable);
  console.log('✅ Low quantity phrase block added');
} else {
  console.error('❌ Could not find targetBeforeAffordable');
}

fs.writeFileSync(filePath, content, 'utf-8');
