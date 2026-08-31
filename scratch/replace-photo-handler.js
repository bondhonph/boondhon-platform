const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const newBlock = [
  '            // ===== PHOTO UPLOADED — CATALOG EMBEDDING MATCH =====',
  '            if (isPhoto && photoUrl) {',
  '              let matchResult = null;',
  '',
  '              // Try embedding-based matching if catalog index is ready',
  '              if (isCatalogIndexReady()) {',
  '                try {',
  '                  const imgRes = await fetch(photoUrl);',
  '                  if (imgRes.ok) {',
  '                    const arrayBuffer = await imgRes.arrayBuffer();',
  '                    const base64Data = Buffer.from(arrayBuffer).toString(\'base64\');',
  '                    const mimeType = (imgRes.headers.get(\'content-type\') || \'image/jpeg\').split(\';\')[0];',
  '                    matchResult = await findCatalogMatch(base64Data, mimeType);',
  '                  }',
  '                } catch (matchErr) {',
  '                  console.error(\'Catalog match error:\', matchErr.message);',
  '                }',
  '              }',
  '',
  '              if (matchResult && matchResult.isMatch) {',
  '                // ===== EXACT CATALOG MATCH FOUND =====',
  '                const category = matchResult.category;',
  '                const matchCode = matchResult.code;',
  '                setCurrentCategory(senderId, category);',
  '',
  '                const priceTable = getFullPriceTable(category);',
  '                const emoji = category === \'premium\' ? \'✨\' : \'💚\';',
  '                const catName = category === \'premium\' ? \'Premium (লাক্সারি)\' : \'Affordable (সাশ্রয়ী)\';',
  '                const oppositeBtn = category === \'premium\'',
  '                  ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }',
  '                  : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };',
  '',
  '                const reply = `সুন্দর পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড (${matchCode})।\\n\\n${priceTable}\\n\\nকত পিস লাগবে বলুন! 😊`;',
  '                await sendMessengerButtonBlock(senderId, reply, [',
  '                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },',
  '                  oppositeBtn,',
  '                  { title: "দাম জানুন", payload: "BTN_PRICE" }',
  '                ]);',
  '                appendMessage(senderId, \'bot\', reply);',
  '              } else {',
  '                // ===== NO EXACT MATCH — Show both collections =====',
  '                const reply = `সুন্দর ডিজাইন! 😍 এই ধরনের কার্ড আমাদের কাছেও আছে।\\nআমাদের কালেকশন দেখুন — আপনার পছন্দের ডিজাইন পেয়ে যাবেন! 😊`;',
  '                await sendMessengerText(senderId, reply);',
  '                appendMessage(senderId, \'bot\', reply);',
  '',
  '                const sampleImages = getUnseenImages(senderId, AFFORDABLE_IDS, 3);',
  '                for (const imgId of sampleImages) {',
  '                  await sendMessengerImage(senderId, imgId);',
  '                  await delay(250);',
  '                }',
  '',
  '                const followUp = "এগুলো আমাদের জনপ্রিয় কিছু ডিজাইন! আরও দেখতে চাইলে বলুন। 😊";',
  '                await sendMessengerButtonBlock(senderId, followUp, [',
  '                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },',
  '                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },',
  '                  { title: "দাম জানুন", payload: "BTN_PRICE" }',
  '                ]);',
  '                appendMessage(senderId, \'bot\', followUp);',
  '              }',
  '            }',
];

// Replace lines 636-696 (1-indexed) = index 635-695
const before = lines.slice(0, 635);
const after = lines.slice(696);
const result = [...before, ...newBlock, ...after].join('\n');
fs.writeFileSync(filePath, result, 'utf-8');
console.log('Done! Replaced photo handler block (lines 636-696).');
console.log('New total lines:', result.split('\n').length);
