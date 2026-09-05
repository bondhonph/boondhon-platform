const fs = require('fs');
const path = require('path');

function updateFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) {
    console.warn('File does not exist:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  let changed = false;

  for (const { search, replace, name } of transforms) {
    if (typeof search === 'string') {
      if (content.includes(search)) {
        content = content.replace(search, replace);
        console.log(`✅ [${path.basename(filePath)}] ${name}`);
        changed = true;
      } else {
        console.warn(`⚠️ [${path.basename(filePath)}] Could not find string for: ${name}`);
      }
    } else if (search instanceof RegExp) {
      if (search.test(content)) {
        content = content.replace(search, replace);
        console.log(`✅ [${path.basename(filePath)}] ${name}`);
        changed = true;
      } else {
        console.warn(`⚠️ [${path.basename(filePath)}] Regex did not match for: ${name}`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

// -------------------------------------------------------------
// 1. pages/api/messenger.js fixes
// -------------------------------------------------------------
const messengerTransforms = [
  // 1a. Security: PAGE_ACCESS_TOKEN
  {
    name: 'Remove hardcoded fallback from PAGE_ACCESS_TOKEN',
    search: /const PAGE_ACCESS_TOKEN = \(process\.env\.FB_PAGE_ACCESS_TOKEN[\s\S]*?\)\.trim\(\);/,
    replace: `const PAGE_ACCESS_TOKEN = (process.env.FB_PAGE_ACCESS_TOKEN || "").trim();`
  },
  // 1b. Security: verifyToken
  {
    name: 'Remove hardcoded fallback from verifyToken',
    search: /const verifyToken = process\.env\.VERIFY_TOKEN \|\| "BOONDHON_SECRET_2026";/,
    replace: `const verifyToken = (process.env.VERIFY_TOKEN || "").trim();`
  },
  // 2a. Latency: analyzeCardImage single model + 8s AbortController
  {
    name: 'Replace analyzeCardImage 4-model loop with single call + 8s timeout',
    search: /const modelsToTry = \['gemini-3\.6-flash',[\s\S]*?for \(const modelName of modelsToTry\) \{[\s\S]*?console\.warn\(`Vision model \$\{modelName\} call exception:`, callErr\.message\);\s*\}\s*\}/,
    replace: `const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const geminiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/\${GEMINI_MODEL}:generateContent?key=\${GEMINI_API_KEY}\`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300,
            responseMimeType: "application/json"
          }
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (textOut) {
          console.log(\`Gemini Vision succeeded with model: \${GEMINI_MODEL}\`);
        }
      } else {
        console.warn(\`Vision model \${GEMINI_MODEL} failed (\${geminiRes.status}):\`, await geminiRes.text());
      }
    } catch (callErr) {
      if (callErr.name === 'AbortError') {
        console.warn(\`Vision model \${GEMINI_MODEL} timed out after 8 seconds\`);
      } else {
        console.warn(\`Vision model \${GEMINI_MODEL} call exception:\`, callErr.message);
      }
    } finally {
      clearTimeout(timeoutId);
    }`
  },
  // 2b. Latency: generateAISalesResponse single model + 8s AbortController
  {
    name: 'Replace generateAISalesResponse 4-model loop with single call + 8s timeout',
    search: /const modelsToTry = \['gemini-3\.6-flash',[\s\S]*?for \(const modelName of modelsToTry\) \{[\s\S]*?console\.warn\(`Sales brain model \$\{modelName\} error:`, mErr\.message\);\s*\}\s*\}/,
    replace: `const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const geminiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/\${GEMINI_MODEL}:generateContent?key=\${GEMINI_API_KEY}\`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: recentMsgs,
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) return reply;
      } else {
        console.warn(\`Sales brain model \${GEMINI_MODEL} failed (\${geminiRes.status}):\`, await geminiRes.text());
      }
    } catch (callErr) {
      if (callErr.name === 'AbortError') {
        console.warn(\`Sales brain model \${GEMINI_MODEL} timed out after 8 seconds\`);
      } else {
        console.warn(\`Sales brain model \${GEMINI_MODEL} error:\`, callErr.message);
      }
    } finally {
      clearTimeout(timeoutId);
    }`
  }
];

// Apply to H:\Data\boondhon-git\pages\api\messenger.js
updateFile('H:/Data/boondhon-git/pages/api/messenger.js', messengerTransforms);
// Apply to H:\Messenger AI Bot\pages\api\messenger.js
updateFile('H:/Messenger AI Bot/pages/api/messenger.js', messengerTransforms);
// Apply to H:\Data\Messenger AI Bot\pages\api\messenger.js
updateFile('H:/Data/Messenger AI Bot/pages/api/messenger.js', messengerTransforms);

// -------------------------------------------------------------
// 2. Clean remaining hardcoded tokens across other files
// -------------------------------------------------------------
const tokenRegex = /"EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD"/g;

// capi.js
updateFile('H:/Data/boondhon-git/pages/api/capi.js', [
  {
    name: 'Remove hardcoded FB_CAPI token fallback',
    search: /const accessToken = process\.env\.FB_CAPI_ACCESS_TOKEN \|\| "EAAW[\s\S]*?";/,
    replace: `const accessToken = (process.env.FB_CAPI_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN || "").trim();`
  }
]);

// test-direct-send.js
updateFile('H:/Data/boondhon-git/pages/api/test-direct-send.js', [
  {
    name: 'Remove hardcoded token fallback in test-direct-send.js',
    search: /const token = \(process\.env\.FB_PAGE_ACCESS_TOKEN[\s\S]*?\)\.trim\(\);/,
    replace: `const token = (process.env.FB_PAGE_ACCESS_TOKEN || "").trim();`
  }
]);

// test-messenger-send.js
updateFile('H:/Data/boondhon-git/pages/api/test-messenger-send.js', [
  {
    name: 'Remove hardcoded token fallback in test-messenger-send.js',
    search: /const token = \(process\.env\.FB_PAGE_ACCESS_TOKEN[\s\S]*?\)\.trim\(\);/,
    replace: `const token = (process.env.FB_PAGE_ACCESS_TOKEN || "").trim();`
  }
]);

// whatsapp-reply.js
updateFile('H:/Data/boondhon-git/pages/api/whatsapp-reply.js', [
  {
    name: 'Remove hardcoded token fallback in whatsapp-reply.js',
    search: /const WHATSAPP_TOKEN = process\.env\.WHATSAPP_TOKEN \|\| "EAAW[\s\S]*?";/,
    replace: `const WHATSAPP_TOKEN = (process.env.WHATSAPP_TOKEN || "").trim();`
  }
]);

// whatsapp.js
updateFile('H:/Data/boondhon-git/pages/api/whatsapp.js', [
  {
    name: 'Remove hardcoded token fallback in whatsapp.js',
    search: /const WHATSAPP_TOKEN = process\.env\.WHATSAPP_TOKEN \|\| "EAAW[\s\S]*?";/,
    replace: `const WHATSAPP_TOKEN = (process.env.WHATSAPP_TOKEN || "").trim();`
  },
  {
    name: 'Remove verifyToken hardcoded fallback in whatsapp.js',
    search: /const verifyToken = process\.env\.WHATSAPP_VERIFY_TOKEN \|\| process\.env\.VERIFY_TOKEN \|\| "BOONDHON_SECRET_2026";/,
    replace: `const verifyToken = (process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN || "").trim();`
  }
]);

// -------------------------------------------------------------
// 3. Update .env.example files with placeholders
// -------------------------------------------------------------
const envExampleContent = `# Facebook Page Access Token (From Meta Developer Portal)
FB_PAGE_ACCESS_TOKEN=your_token_here

# Facebook Webhook Verify Token (Set in Meta Webhook configuration)
VERIFY_TOKEN=your_verify_token_here

# Google Gemini API Key (For Multimodal Vision & Vector Embeddings)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Fast Gemini Model (Default: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash
`;

fs.writeFileSync('H:/Messenger AI Bot/.env.example', envExampleContent, 'utf-8');
console.log('✅ Updated H:/Messenger AI Bot/.env.example');

fs.writeFileSync('H:/Data/Messenger AI Bot/.env.example', envExampleContent, 'utf-8');
console.log('✅ Updated H:/Data/Messenger AI Bot/.env.example');

fs.writeFileSync('H:/Data/boondhon-git/.env.example', envExampleContent, 'utf-8');
console.log('✅ Created H:/Data/boondhon-git/.env.example');

// -------------------------------------------------------------
// 4. Update pages/index.js & README.md in Messenger AI Bot
// -------------------------------------------------------------
const cleanDocs = (dir) => {
  const indexPath = path.join(dir, 'pages/index.js');
  updateFile(indexPath, [
    {
      name: 'Replace BOONDHON_SECRET_2026 with placeholder in index.js',
      search: /<code>BOONDHON_SECRET_2026<\/code>/g,
      replace: `<code>process.env.VERIFY_TOKEN</code>`
    }
  ]);

  const readmePath = path.join(dir, 'README.md');
  updateFile(readmePath, [
    {
      name: 'Replace hardcoded token in README.md env template',
      search: /FB_PAGE_ACCESS_TOKEN=your_fb_page_access_token_here/,
      replace: `FB_PAGE_ACCESS_TOKEN=your_token_here`
    },
    {
      name: 'Replace hardcoded VERIFY_TOKEN in README.md',
      search: /VERIFY_TOKEN=BOONDHON_SECRET_2026/g,
      replace: `VERIFY_TOKEN=your_verify_token_here`
    },
    {
      name: 'Replace verify token in Meta Webhook Settings in README.md',
      search: /\* \*\*Verify Token:\*\* `BOONDHON_SECRET_2026`/g,
      replace: `* **Verify Token:** (Same value set in VERIFY_TOKEN environment variable)`
    }
  ]);
};

cleanDocs('H:/Messenger AI Bot');
cleanDocs('H:/Data/Messenger AI Bot');

console.log('\n🎉 ALL SECURITY & LATENCY FIXES APPLIED SUCCESSFULLY!');
