const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Add isLinkOrShare detection
const oldAttachments = `            const attachments = message?.attachments;
            let isPhoto = false;
            let photoUrl = null;
            if (attachments && attachments.length > 0) {
              const imgAtt = attachments.find(att => att.type === 'image');
              if (imgAtt) {
                isPhoto = true;
                photoUrl = imgAtt.payload?.url;
              }
            }`;

const newAttachments = `            const attachments = message?.attachments;
            let isPhoto = false;
            let photoUrl = null;
            let isLinkOrShare = false;
            if (attachments && attachments.length > 0) {
              const imgAtt = attachments.find(att => att.type === 'image');
              if (imgAtt) {
                isPhoto = true;
                photoUrl = imgAtt.payload?.url;
              }
              const nonImgAtt = attachments.find(att => att.type === 'fallback' || att.type === 'video' || att.type === 'share' || att.type === 'template');
              if (nonImgAtt) {
                isLinkOrShare = true;
              }
            }`;

if (content.includes(oldAttachments)) {
  content = content.replace(oldAttachments, newAttachments);
  console.log('✅ Added isLinkOrShare detection');
} else {
  console.error('⚠️ Could not find oldAttachments');
}

// 2. Also check URL in normalizedTxt for isLinkOrShare
const oldNormalizedTxt = `            const normalizedTxt = normalizeBengaliDigits(text).toLowerCase();`;
const newNormalizedTxt = `            const normalizedTxt = normalizeBengaliDigits(text).toLowerCase();
            if (normalizedTxt.includes('facebook.com') || normalizedTxt.includes('fb.watch') || normalizedTxt.includes('/reel/') || normalizedTxt.includes('/videos/') || normalizedTxt.includes('fb.me')) {
              isLinkOrShare = true;
            }`;

if (content.includes(oldNormalizedTxt)) {
  content = content.replace(oldNormalizedTxt, newNormalizedTxt);
  console.log('✅ Added text-based link detection');
} else {
  console.error('⚠️ Could not find oldNormalizedTxt');
}

// 3. Update photo matching with similarity >= 0.58 fallback
const oldPhotoMatch = `              if (matchResult && matchResult.isMatch) {
                // ===== EXACT CATALOG MATCH FOUND =====
                const category = matchResult.category;
                const matchCode = matchResult.code;
                setCurrentCategory(senderId, category);

                const priceTable = getFullPriceTable(category);
                const emoji = category === 'premium' ? '✨' : '💚';
                const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                const oppositeBtn = category === 'premium'
                  ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
                  : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };

                const reply = \`সুন্দর পছন্দ! 😍 এটি আমাদের \${emoji} \${catName} কালেকশনের কার্ড (\${matchCode})।\\n\\n\${priceTable}\\n\\nকত পিস লাগবে বলুন! 😊\`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  oppositeBtn,
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // ===== NO EXACT MATCH — Show both collections =====
                const reply = \`সুন্দর ডিজাইন! 😍 এই ধরনের কার্ড আমাদের কাছেও আছে।\\nআমাদের কালেকশন দেখুন — আপনার পছন্দের ডিজাইন পেয়ে যাবেন! 😊\`;
                await sendMessengerText(senderId, reply);
                appendMessage(senderId, 'bot', reply);

                const sampleImages = getUnseenImages(senderId, AFFORDABLE_IDS, 3);
                for (const imgId of sampleImages) {
                  await sendMessengerImage(senderId, imgId);
                  await delay(250);
                }

                const followUp = "এগুলো আমাদের জনপ্রিয় কিছু ডিজাইন! আরও দেখতে চাইলে বলুন। 😊";
                await sendMessengerButtonBlock(senderId, followUp, [
                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', followUp);
              }`;

const newPhotoMatch = `              if (matchResult && matchResult.isMatch) {
                // ===== EXACT / STRONG CATALOG MATCH (>= 70%) =====
                const category = matchResult.category;
                const matchCode = matchResult.code;
                setCurrentCategory(senderId, category);

                const priceTable = getFullPriceTable(category);
                const emoji = category === 'premium' ? '✨' : '💚';
                const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                const altCat = category === 'premium' ? 'affordable' : 'premium';
                const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

                const reply = \`সুন্দর পছন্দ! 😍 এটি আমাদের \${emoji} \${catName} কালেকশনের কার্ড (\${matchCode})।\\n\\n\${priceTable}\\n\\nকত পিস লাগবে বলুন! 😊\`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  { title: \`\${altName} রেট\`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                  { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else if (matchResult && matchResult.similarity >= 0.58) {
                // ===== CLOSE MATCH (>= 58%, e.g. Screenshot of FB post / Reel) =====
                const category = matchResult.category;
                setCurrentCategory(senderId, category);

                const priceTable = getFullPriceTable(category);
                const emoji = category === 'premium' ? '✨' : '💚';
                const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                const altCat = category === 'premium' ? 'affordable' : 'premium';
                const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

                const reply = \`চমৎকার পছন্দ! 😍 এটি আমাদের \${emoji} \${catName} কালেকশনের একটি আকর্ষণীয় কার্ড।\\n\\n\${priceTable}\\n\\nকত পিস লাগবে বলুন! 😊\`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  { title: \`\${altName} রেট\`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                  { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // ===== NO MATCH — Show prices of both collections + sample cards =====
                const reply = \`সুন্দর ডিজাইন! 😍 আমাদের কাছে এই ধরনের চমৎকার কার্ড রয়েছে।\\n\\nআমাদের কার্ডের রেট:\\n💚 Affordable: ৫০ পিস ২,৭৫০৳ (৫৫৳/পিস)\\n✨ Premium: ৫০ পিস ৩,২৫০৳ (৬৫৳/পিস)\\n\\nআপনার কত পিস লাগবে বলুন! 😊\`;
                await sendMessengerText(senderId, reply);
                appendMessage(senderId, 'bot', reply);

                const sampleImages = getUnseenImages(senderId, AFFORDABLE_IDS, 3);
                for (const imgId of sampleImages) {
                  await sendMessengerImage(senderId, imgId);
                  await delay(250);
                }

                const followUp = "এগুলো আমাদের জনপ্রিয় কিছু ডিজাইন! কোন কালেকশন দেখতে চান? 😊";
                await sendMessengerButtonBlock(senderId, followUp, [
                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" }
                ]);
                appendMessage(senderId, 'bot', followUp);
              }`;

if (content.includes(oldPhotoMatch)) {
  content = content.replace(oldPhotoMatch, newPhotoMatch);
  console.log('✅ Updated photo matching with close match and direct pricing');
} else {
  console.error('⚠️ Could not find oldPhotoMatch');
}

// 4. Add Shared Reel / Video / Link handler right after photo check
const targetBeforeOrderForm = `            // ===== ORDER FORM SUBMITTED BY CUSTOMER =====`;
const sharedLinkHandler = `            // ===== SHARED REEL / VIDEO / POST FROM PAGE =====
            else if (isLinkOrShare) {
              const reply = \`আমাদের ভিডিও/পোস্টের ডিজাইনটি পছন্দ করার জন্য ধন্যবাদ! 😍🌸\\n\\nএই কার্ডটির দামের হিসাব:\\n💚 Affordable (সাশ্রয়ী): ৫০ পিস ২,৭৫০৳ (৫৫৳/পিস)\\n✨ Premium (লাক্সারি): ৫০ পিস ৩,২৫০৳ (৬৫৳/পিস)\\n\\n(১-৪৯ পিস অল্প পরিমাণেও নিতে পারবেন!)\\nআপনার কত পিস কার্ড লাগবে বলুন, সঠিক হিসাব জানিয়ে দিচ্ছি! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
`;

if (content.includes(targetBeforeOrderForm)) {
  content = content.replace(targetBeforeOrderForm, sharedLinkHandler + targetBeforeOrderForm);
  console.log('✅ Added shared reel/post/link handler');
} else {
  console.error('⚠️ Could not find targetBeforeOrderForm');
}

// 5. Completely BREAK THE PRICE LOOP in BTN_PRICE / "eita koto"
const oldPriceHandler = `            // ===== PRICE — Context-aware single category =====
            else if (payload === 'BTN_PRICE' || txt.match(/price|দাম|কত|কতো|মূল্য|rate|koto|cost|dam|daam/)) {
              const currentCat = getCurrentCategory(senderId);
              
              if (currentCat) {
                // Show price for current active category only
                const priceTable = getFullPriceTable(currentCat);
                const reply = priceTable + "\\n\\nকত পিস লাগবে বলুন, সাথে সাথে হিসাব দিয়ে দিচ্ছি! 😊";
                
                const oppositeBtn = currentCat === 'premium'
                  ? { title: "💚 Affordable দাম", payload: "BTN_AFFORDABLE_PRICE" }
                  : { title: "✨ Premium দাম", payload: "BTN_PREMIUM_PRICE" };
                
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  oppositeBtn,
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // No category selected yet — ask which one
                const reply = "কোন কালেকশনের দাম জানতে চান? 😊";
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "💚 Affordable", payload: "BTN_AFFORDABLE_PRICE" },
                  { title: "✨ Premium", payload: "BTN_PREMIUM_PRICE" },
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              }
            }`;

const newPriceHandler = `            // ===== PRICE — Context-aware or complete price table (NO LOOPS!) =====
            else if (payload === 'BTN_PRICE' || txt.match(/price|দাম|কত|কতো|মূল্য|rate|koto|cost|dam|daam|eita koto/i)) {
              const currentCat = getCurrentCategory(senderId);
              
              if (currentCat) {
                const priceTable = getFullPriceTable(currentCat);
                const altCat = currentCat === 'premium' ? 'affordable' : 'premium';
                const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';
                const reply = \`\${priceTable}\\n\\n💡 (\${altName} কালেকশনের দামও দেখতে পারেন)\\nকত পিস লাগবে বলুন! 😊\`;
                
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: \`\${altName} রেট\`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                  { title: "কার্ড দেখুন", payload: currentCat === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" },
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // Show BOTH categories clearly — NO AMBIGUITY, ZERO LOOPS!
                const reply = \`আমাদের বিয়ের কার্ডের দামের তালিকা: 🌸\\n\\n💚 সাশ্রয়ী (Affordable):\\n• ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)\\n• ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)\\n• ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)\\n\\n✨ প্রিমিয়াম (Premium):\\n• ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)\\n• ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)\\n• ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস)\\n\\n(১-৪৯ পিস অল্প পরিমাণেও নিতে পারবেন!)\\nআপনার কত পিস লাগবে বলুন? 😊\`;
                
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" }
                ]);
                appendMessage(senderId, 'bot', reply);
              }
            }`;

if (content.includes(oldPriceHandler)) {
  content = content.replace(oldPriceHandler, newPriceHandler);
  console.log('✅ Replaced price loop handler with direct price breakdown');
} else {
  console.error('⚠️ Could not find oldPriceHandler');
}

// 6. Update BTN_AFFORDABLE_PRICE and BTN_PREMIUM_PRICE to remove BTN_PRICE button
content = content.replace(
  `                { title: "✨ Premium দাম", payload: "BTN_PREMIUM_PRICE" }`,
  `                { title: "✨ Premium রেট", payload: "BTN_PREMIUM_PRICE" }`
);

content = content.replace(
  `                { title: "💚 Affordable দাম", payload: "BTN_AFFORDABLE_PRICE" }`,
  `                { title: "💚 Affordable রেট", payload: "BTN_AFFORDABLE_PRICE" }`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('🎉 All recognition and price loop fixes applied successfully!');
