const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Update ORDER_RULES_MSG to be short, clean, friendly, not overwhelming
const oldOrderRules = `const ORDER_RULES_MSG = \`📋 অর্ডার করার নিয়মাবলী:

১. অ্যাডভান্স পেমেন্ট:
> অর্ডার কনফার্ম করতে হবে মোট মূল্যের ৩০% এডভান্স পেমেন্ট।
> পেমেন্ট করতে পারবেন নিম্নলিখিত মাধ্যমে: বিকাশ, নগদ, রকেট (পার্সোনাল) নম্বর: 01682588856.

২. ডিজাইন প্রক্রিয়া:
> আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে পাঠাবে।
> আপনি ডিজাইন চূড়ান্ত করার পর আমরা প্রিন্ট প্রক্রিয়া শুরু করব।

৩. ডেলিভারি এবং পেমেন্ট:
> প্রিন্ট শেষে কার্ড রেডি করে জেলা শহরে ক্যাশ অন ডেলিভারি-এর মাধ্যমে পাঠানো হবে।
> কুরিয়ার ডেলিভারি গ্রহণের সময় বাকি ৭০% পেমেন্ট করতে হবে।
> জেলা শহরের বাইরে ক্যাশ অন ডেলিভারি উপলব্ধ নয়।
> এছাড়া সরাসরি আমাদের অফিস বা কারখানা থেকে সংগ্রহ করতে পারবেন।

৪. ডেলিভারি সময়:
কার্ড ডেলিভারি পেতে ৫ থেকে ৭ কর্মদিবস সময় লাগবে।\`;`;

const newOrderRules = `const ORDER_RULES_MSG = \`📋 অর্ডার করার সহজ নিয়মাবলী:
১. কার্ডের তথ্য পাঠাতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন।
২. অর্ডার কনফার্ম করতে মোট মূল্যের ৩০% অ্যাডভান্স পাঠান: বিকাশ/নগদ/রকেট (পার্সোনাল) 01682588856।
৩. আমাদের অভিজ্ঞ ডিজাইনার কার্ড ডিজাইন তৈরি করে আপনাকে প্রুফ চেক করাবে।
৪. আপনার চূড়ান্ত অনুমোদনের পর প্রিন্ট করে জেলা শহরে ক্যাশ অন ডেলিভারিতে পাঠানো হবে (৫-৭ কর্মদিবস)।\`;`;

if (content.includes(oldOrderRules)) {
  content = content.replace(oldOrderRules, newOrderRules);
  console.log('✅ ORDER_RULES_MSG simplified');
} else {
  console.error('⚠️ Could not find exact oldOrderRules');
}

// 2. Add normalizeBengaliDigits helper
const digitHelper = `function normalizeBengaliDigits(str) {
  if (!str) return '';
  return str.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
}
`;

if (!content.includes('function normalizeBengaliDigits')) {
  content = content.replace('// ===== HELPER FUNCTIONS =====', '// ===== HELPER FUNCTIONS =====\n' + digitHelper);
  console.log('✅ normalizeBengaliDigits helper added');
}

// 3. Update quantity parsing with normalizedTxt and handle "পিচ"
const oldQtyParsing = `            let quantity = null;
            if (payload.startsWith('QTY_')) {
              quantity = parseInt(payload.replace('QTY_', ''), 10);
            } else {
              const numMatch = txt.match(/\\b(\\d{1,5})\\s*(pcs?|piece|পিস|পিসি)?\\b/i);
              if (numMatch) {
                const num = parseInt(numMatch[1], 10);
                if (num > 0 && num < 10000) quantity = num;
              }
            }`;

const newQtyParsing = `            const normalizedTxt = normalizeBengaliDigits(text).toLowerCase();

            // Detect if this message is a filled wedding card order form
            const isFormSubmission = (
              (text.includes('বর') && text.includes('কনে')) ||
              (text.includes('নামঃ') && text.includes('পিতাঃ')) ||
              (text.includes('অনুষ্ঠানসূচী') || text.includes('ওয়ালিমা') || text.includes('গায়ে হলুদ') || text.includes('বউ-ভাত') || text.includes('কনের বাড়ি')) ||
              (text.includes('প্রিন্ট কার্ডের সংখ্যা') || text.includes('কার্ডের সংখ্যা'))
            );

            let quantity = null;
            if (payload.startsWith('QTY_')) {
              quantity = parseInt(payload.replace('QTY_', ''), 10);
            } else {
              const numMatch = normalizedTxt.match(/\\b(\\d{1,5})\\s*(pcs?|piece|পিস|পিসি|পিচ)?\\b/i);
              if (numMatch) {
                const num = parseInt(numMatch[1], 10);
                if (num > 0 && num < 10000) quantity = num;
              }
            }`;

if (content.includes(oldQtyParsing)) {
  content = content.replace(oldQtyParsing, newQtyParsing);
  console.log('✅ Quantity parsing updated with Bengali digits and form detection');
} else {
  console.error('⚠️ Could not find oldQtyParsing');
}

// 4. Update Low Quantity Phrase handler and insert Form Submission handler
const oldLowQtyHandler = `            // ===== LOW QUANTITY PHRASE QUERY ("আমার অল্প লাগবে" / "olpo lagbe" / "kom lagbe") =====
            else if (txt.match(/olpo|অল্প|kom|কম|koyekta|কয়েকটা|কয়েকটি|কম পিস|olpo lagbe|kom lagbe|olpo pisi|kom pcs/i) && !txt.match(/কমপ্লিট|কমেন্ট|কম্পানি/i)) {
              const reply = \`জি, আমাদের কাছে অল্প পরিমাণেও (১-৪৯ পিস) বিয়ের কার্ড অর্ডার করতে পারবেন! 😊\\n\\nঅল্প পরিমাণের প্রাইসিং রেট:\\n• ১-৫ পিস: ১,০০০৳ (ফিক্সড মেকিং চার্জ সহ)\\n• ৬-১০ পিস: ১,৫০০৳ (ফিক্সড চার্জ)\\n• ১১-৪৯ পিস: পিস প্রতি ৭৫৳ (যেমন ২৫ পিস = ১,৮৭৫৳)\\n\\n💡 পরামর্শ: ৫০+ পিস নিলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\\n\\nআপনার কত পিস লাগবে বলুন! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "৫ পিস (১০০০৳)", payload: "QTY_5" },
                { title: "১০ পিস (১৫০০৳)", payload: "QTY_10" },
                { title: "২৫ পিস (১৮৭৫৳)", payload: "QTY_25" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }`;

const newFormAndLowQtyHandler = `            // ===== ORDER FORM SUBMITTED BY CUSTOMER =====
            else if (isFormSubmission) {
              let qtyNote = '';
              if (quantity) {
                qtyNote = \`\\n📦 আপনার উল্লেখিত কার্ড সংখ্যা: \${bngDigits(quantity)} পিস।\`;
              }

              const reply = \`আলহামদুলিল্লাহ! আপনার কার্ডের তথ্যগুলো আমরা সুন্দরভাবে পেয়েছি। 🌸\${qtyNote}\\n\\nঅর্ডারটি কনফার্ম করে ডিজাইনের কাজ শুরু করার নিয়ম:\\n১. ৩০% অ্যাডভান্স পেমেন্ট পাঠান:\\n   📲 বিকাশ / নগদ / রকেট (পার্সোনাল): 01682588856\\n২. পেমেন্ট সম্পন্ন করে লাস্ট ৪ ডিজিট বা স্ক্রিনশট এখানে পাঠিয়ে দিন।\\n\\nআমাদের অভিজ্ঞ ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে মেসেঞ্জার/হোয়াটসঅ্যাপে প্রুফ চেক করাবে। আপনার ফাইনাল অনুমোদনের পরই কেবল প্রিন্ট হবে! 😊\`;

              await sendMessengerButtonBlock(senderId, reply, [
                { title: "পেমেন্ট করেছি", payload: "BTN_PAID" },
                { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
                { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== LOW QUANTITY PHRASE QUERY ("আমার অল্প লাগবে" / "olpo lagbe" / "kom lagbe") =====
            else if (!isFormSubmission && text.length < 60 && (
              /\\b(olpo\\s*lagbe|kom\\s*lagbe|olpo\\s*pisi|kom\\s*pcs|kom\\s*pisi)\\b/i.test(txt) ||
              /(^|\\s)(অল্প|কম)\\s*(লাগবে|হবে|পিস|কার্ড|পরিমাণ|কিছু)/.test(txt) ||
              /^(আমার\\s*)?(অল্প|কম)(\\s*লাগবে|\\s*হবে)?$/i.test(txt.trim())
            ) && !/(কমিউনিটি|কম্পিউটার|কম্পানি|কমপ্লিট|কমেন্ট|ইনকাম|স্বাগতম)/i.test(txt)) {
              const reply = \`জি, আমাদের কাছে অল্প পরিমাণেও (১-৪৯ পিস) বিয়ের কার্ড অর্ডার করতে পারবেন! 😊\\n\\nঅল্প পরিমাণের প্রাইসিং রেট:\\n• ১-৫ পিস: ১,০০০৳ (ফিক্সড মেকিং চার্জ সহ)\\n• ৬-১০ পিস: ১,৫০০৳ (ফিক্সড চার্জ)\\n• ১১-৪৯ পিস: পিস প্রতি ৭৫৳ (যেমন ২৫ পিস = ১,৮৭৫৳)\\n\\n💡 পরামর্শ: ৫০+ পিস নিলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\\n\\nআপনার কত পিস লাগবে বলুন! 😊\`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "৫ পিস (১০০০৳)", payload: "QTY_5" },
                { title: "১০ পিস (১৫০০৳)", payload: "QTY_10" },
                { title: "২৫ পিস (১৮৭৫৳)", payload: "QTY_25" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }`;

if (content.includes(oldLowQtyHandler)) {
  content = content.replace(oldLowQtyHandler, newFormAndLowQtyHandler);
  console.log('✅ Form submission handler and strict low quantity filter added');
} else {
  console.error('⚠️ Could not find oldLowQtyHandler');
}

// 5. Add BTN_PAID and BTN_HOTLINE handlers
const targetAfterLocation = `            // ===== PAYMENT / BKASH NUMBER =====`;

const paidAndHotlineHandlers = `            // ===== PAYMENT CONFIRMATION BY USER =====
            else if (payload === 'BTN_PAID' || txt.match(/পেমেন্ট করেছি|টাকা পাঠিয়েছি|টাকা পাঠাইছি|paid|advance paid/i)) {
              const reply = \`অনেক ধন্যবাদ! আপনার পেমেন্টের স্ক্রিনশট বা বিকাশ/নগদ লাস্ট ৪ ডিজিট এখানে লিখে দিন। 😊\\nআমাদের টিম দ্রুত যাচাই করে আপনার অর্ডারটি নিশ্চিত করবে এবং ডিজাইনার কাজ শুরু করবে! 🌸\`;
              await sendMessengerText(senderId, reply);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== HOTLINE BUTTON =====
            else if (payload === 'BTN_HOTLINE') {
              const reply = \`📞 আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন:\\n01701016826 (বন্ডহন হটলাইন)\\n\\nআমরা সার্বক্ষণিক সহায়তায় আছি! 😊\`;
              await sendMessengerText(senderId, reply);
              appendMessage(senderId, 'bot', reply);
            }
`;

if (content.includes(targetAfterLocation)) {
  content = content.replace(targetAfterLocation, paidAndHotlineHandlers + targetAfterLocation);
  console.log('✅ BTN_PAID and BTN_HOTLINE handlers added');
} else {
  console.error('⚠️ Could not find targetAfterLocation');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('🎉 All fixes applied successfully!');
