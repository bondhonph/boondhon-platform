const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

const brokenStr = `              const reply = 'আমাদের ' + emoji + ' ' + catName + ' কালেকশনের কার্ড (' + cardCode + '):\n\n' + priceTable + '\n\nকত পিস লাগবে বলুন! 😊';`;

const fixedStr = `              const reply = \`আমাদের \${emoji} \${catName} কালেকশনের কার্ড (\${cardCode}):\\n\\n\${priceTable}\\n\\nকত পিস লাগবে বলুন! 😊\`;`;

// Find substring around "আমাদের ' + emoji"
const idx = content.indexOf("const reply = 'আমাদের ' + emoji");
if (idx >= 0) {
  const endIdx = content.indexOf(";\n              await sendMessengerButtonBlock", idx);
  if (endIdx > idx) {
    content = content.substring(0, idx) + fixedStr + content.substring(endIdx + 1);
    console.log('✅ Fixed string concatenation in card code handler!');
  }
} else {
  console.log('Context:', content.substring(idx, idx + 100));
}

fs.writeFileSync(filePath, content, 'utf-8');
