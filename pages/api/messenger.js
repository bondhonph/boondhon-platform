import { appendMessage, getConversation, setHumanTakeover, getUnseenImages, setCurrentCategory, getCurrentCategory } from '../../lib/chat-store';

const AFFORDABLE_IDS = [
  "1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD","1cOCFSa1ap-Z54Ldf2AuoUKlEaQ5Ccql-","1dbYH2L4QykEUhYXGQPzQZObEuHFdwKsT",
  "1HJTtR-zhhg6v2ph7MikdMDWI-LWJgG0z","1PRlMp4F1xnQJPURON535pl7t08_thXVA","1UEAeYYB3Bt5vMYEL-a7AcV1aV21Z04si",
  "1-_qTV4gq0oKMdfMRxlTZL3yUO98ZGAoi","15yHXRk2mHI6-cKeooRqT20XeHubRRrPN","1Yrcqj5g0sZDrL3QaEkfEmKnF12BEs6ir",
  "1vXwJ68j7x5qfpZdHkMkqLn0tvpblGDpl","1GWw91oefwyYr9sHSQXjePTSX-KwPjy7I","1_tnTz7HWDf4CVJHORPlani7pjEcLdm7X",
  "1OMy_r94N_iUqvPW1t5fAGa4Sv3C_MIqF","1rXCxMziCgTImURvkahNp-AvneVljg-CW","1k_hzTbXOxxJg9rJ2OW-tnIkzLNYUqkOf",
  "1bgYpcqh4pVLDy8yfwrS40X5ejtCFxmFv","1tLW7C2gwOmlZzGXh3bw0o7xjAPKrudIA","1ZEGHQfvuKNv-J5ZZadHKGfVAe4cvQnGq",
  "1WE3kfWsd-0nrptiQ0fWi3dsd4iEcdw3t","1kLilyZRrhgrRfHn4aiTEcUBOu5fNDegs","1Cf7jQxeb5pyXvnA6HzGg_dYk3ZBrJ9z5",
  "11UIRwmetqLkMU5qThwv5Vc7GnuASrZSa","1eXUGJyYhnNBXZ7PFwDgXgY-ql8cYADsh","1weNuPU3fBvPMkbFAGPiMm_ttEETSuQ9A",
  "1PyKeX16mmVGaqKuZCujRskmip1LyGEgo","1luY2hOgpjUjXr_lGJbCQTumxKZFZrmJ4","1XanrmX4aOoDmjxha6lr5bYzlkZHglsTZ",
  "1BBFuVKgKRUJV2pubIWiXgZlT3582Vcup","1wvf3jJjpV1sPuiO_Vj509y0UJABxbnuB","1TkCMzyPmSk9m2bIrRUInOm6epp2TQnV1",
  "1H5lEN0baeoMMWL693BIXVYjrtZVipooO","14UHCDYmLowJbPfS-7Ve2Nx-tKno1MJU0","1CsDarakKEaGyVe8JqT05pMff988RztJX",
  "1IDHV2uPD4AHjhsk75GJSETp9qQdpqPB4","1VGLRJbDyatJqfX0VEr3yGkRJMI23yRiL","1v1Fb2d2CP-v4N7Z2qVIqywIyph673I5Y",
  "1X5yEsU9S8oYeFMEc8bjEm4XecbrR6fWA","1BkNP_edXf6c3wIP5lALPG2sjSp1C3d3z","1qKDy730IKVUH3e7U3zgUK863ekoYNGVS",
  "1OVG52rNA1Ud-pG6gA-RtyRZkhE85tgkK","1nKQgpTV5txr5SO-6MYL4wnMskhLvkJJn","1lmdXd0R5pgyJqXhgGwYzzerX4NXPpOyZ",
  "1cDyh8T6RQ7cOMY_js8TxQYrDO8BPy4cS","1eBePCdCDIMMvu6rZd-feOqvI8jPX44PU","1EOVX2gwvUotLFdfO5gO0Px8MaJwon9dY",
  "1yA0KGGFMfYUQ8-9hpotpxNhagSSdp7xD","1inPC5SKDpW5epcxa-fFgXp9C9jowISPO","1WDJrtj_A5gk6KfolOju3TzfyVUm5Gt40",
  "1gDDPhlDVI5Fu-nBdUPsM964FiuHz0YoU","18hlxoUBDiBuV_nxiqfPffkmW5mGmxdZA","1g7WVBZC6EqVPjZGqwnyYpDU-ehayWqCf",
  "1jdh-o3_3_4xJGQbumQ258HN0fuc9qkZo","19-H4R6pAVCbU-P9BvLInXkcY2OZ1bUzo","1aqEN_fGQfJOYP4T1EdZuRbc-UpXJPTNj",
  "1TfPmZfUQ1VbIie-GPcG5eLoy1Uk9D5Xt","1w502s3qp0cnI4NEAyv9ybo-6qVhs5IT1","1NGoRC9vhfaTIjis1aW0k8LpaFZMzLCjA",
  "12QvRB7HhShW19jXuhN3BF6OFmGQLg0kR","1pJ5hgS89OF5cBTWVM6kbm1E3cMt1hcrT","1ygWRDCDH-dr7sI8TKtjAZkQ23bCTaqoG",
  "1u-3SZI9ymC7E18sROzUy3gSAAb45yqmW","1vo67fp6I8ZA3wOi9pTw6eUu3HJrvAfbB","1K0JWt7BnX1wDLZ7D7Db_cI5z-OazCANU",
  "10vyUHH9txFfzy6gTUXFsx95hDzH1rNE1","13_b1RSIwud_d2LvFwTc337ls-MfEmXRX","109AXjs6FKNUVfBfcQySBW_sqOzkcbrjV",
  "1WJu3rqnGe-aYs1FZymiGtV-SEP6W7i-m","1IWSDwW4uTrWlNWo14GfbHPn7Fq0g_nzL","1g800vKvxkKR_hUYKvv0-Gh1jNJrqnyaq",
  "11Uy_p33yXsQiMW0qy7l1b1qWvzQXLOEe","1PeaR16EDy3xXTJDbPuP9GHJiX3F2Ubea","1firMVBvk_QAfMfQONWCbvr1oo0dtK53F",
  "1RNSqAZ7kxJSQ3jwzRfreYejLGGeXCz2h","1r-JnbeHPGBO0Q9cceYh1bzSCLKBOJEN_","1TtkzWXQisd7UShIg46wdW6vmWYbpUjkk",
  "1vj8zzSFy1H_c7fAGi_REfMR-R8IPwTfK","1Q_DJOcMXmZrR7P9szIw9LWQ5-dyRLO2y","1OQQQN87UMWlaTcPnzFf9zwRTxxIqRO5-",
  "1Cw6AehAWgLFPCLedbh3LR1LMfCx2B4S3","10iZEj1UR_VCC0T2MLYhyT1hfO5zeoQFN","1pXnX_YraQ9SmZmttbcuaBJ6GfCbMxfL_",
  "1ierJrCWZ0kiommCWoUzsVEFC2VoOKIRt","1zCjZp5fZ7ocwB33-bBCs93kaHJ0EOl5r"
];

const PREMIUM_IDS = [
  "182kOjBhoaqOTq7nr4ryI6re6fRuLITbH","1cTfbTDJDqBjsV-r7V1OjBZ-Z6tUAqwxj","1cA-MfI55Hh7ibreMQ4zPvt2i_LKxVHkR",
  "1fvtC5mT4slvV_kROIej7awAGmCRc7TUl","1rLVZUQ8lw6ilWM76xxARtbUreQ3JIkdi","15AQWI3wP2a57-3OxHZTCfSbskgvC5YvH",
  "1ahoubjUVdc9SJyi5n2rzZIsbugjCjHiz","1qlwwRe2Mr_gb8CZjkeG0-YxBSGmOHzZu","1oOdGtYFTz-xNmSLUO-VFS1YODqYZ74HJ",
  "1zBBLQOfuAaPXhyr6At3tJ5DlTZ_nXfLy","11GVK5OYU7bjf8YaHeNAAnAHPks3T1Jme","1Kat8i9M3usZX8iX2xUCcX08RVocX9kKB",
  "1f327zMbxf9s_Z2WSYhA4cAIF_NBiveKW","1T_pxOh0mn36N882wUMyYSsXKoZE4w1XA","1OQqgPUW0j1C5Ggvh50oTnnw5VsgEQv5I",
  "15FGsZ0xdZd7DYZb4awafD8ysH_8g-A9O","1KUI4gzdhT-1I_LpzCMCQL8Sgfy4dU_Im","1amD4c_CLTODq8nca3N_H40vPiYp53VTm",
  "1j2a0DIwsKoXWomTJ9RuJm1RncFH3mbqg","1Cl0fyeCN4T4mUxt-mhEQe6z6ZzBXsQsK","1Tpq2cCmWEooN2SYUIEgq-elk6tRK_5tV",
  "1wlnH6L9DQcYtHHRDtPmrLGz-u6bslOgl","1ZrP-OujlWQGLEln1u8YTa4e3kjQY0yzI","1U6HoCb65TnMZsfKmGQ9wujvvppKzD7HY",
  "1pbevqRrVV2_aYSNSMF8q7jMqnDMGpAUn","1KTSwcHJmwu1XximtqvbgSnP4Zrskg8T_","1ZG7hoRZgcj5F_UMCidzJSI2yAYoiUAf6",
  "1uMyZI2cVy_uABGNPNoe-pXul2pPPhC_U","1gITGc6TLsrSjYkdMhURcUUNQH1y1GFpc","1FTFe6klyuHyUBsOfLeN_QsZABlhF_I1U",
  "1n9SD-SDFTJMuW-J_9g-Sg3Pi9u4Q8VqZ","1PiYBXyjmd0jMff_0j9miNPSKsH549oOJ","1emx-RKETN5UkoPSIM66I9V6z8g4O6eL0",
  "1V9mGxsK3TFtLWGBnnfoQQ9tgnvmfOOKj","1zCSjLjQOnSeOechbnhxepJSKxbdE7MeI","1HarOxTDa8wdWYkAHdsYCUNp6-bdW-0aM",
  "1zIdOBb-MSqAEHDPmc_cJluX8dtgx5fkk","1V1JnATj5BVIrnhdP7FleskNC0RElJ0NZ","1liH9X1gZehPc1nmNoPrBMysviH-_AC_0",
  "1kS9lA4Rt0Ro1H4zWO_hNBzKPNvLkpb6G","1ML1TVAbIwOfV8g8V2jbFOnhupomDRuj5","15AnUgqE1IMBspLC7jCVveFXzNMVrvZUl",
  "16pVMXGt2O5OW0GnEH0vK_J7beXJOVTFG","1x_Ykz9171lN4T5AJzBpbHlqvPyM-JuJ4","1qj1usLPAzfw8y74c-KKF6MfbE6F_txEJ",
  "1oUNXIOVWfaYe_O1s0AZP7WZbz9PkJdER","1lKmVy2Xgs27j5IW6CzbzYYHzIPpPB7pF","10R18Piu79JTBPmWu7l1q_ht5yRddjZj_",
  "1C3AXVh-mfTMtcAFhrL044TvwklDIKYNa","1fZQ7kc9OkcDLMntxUqUnUh-eVfGPqfIm","1Zb-AwPI5Ta8GaDX8T2QSMesenxFBEpNw",
  "181vyiexE1YGUOav2BUEdLzWLn24qdvvm","1IUCMZwe292HN-OEcdnIbvWPuwGy6bgBG","1zyZ3QVHsOkTBADMm8jxJrk2ZIiiFE87F",
  "1vtMWO4Ah45nvFExeMq82sfZc2JRsIiHc","1S0Oefe3t9iTNkhY_kjNojyHbb7uY4qHE","1rDFVMBfbrEt76kjiJLES3bnA_jmedsyI",
  "119JxcFfIzDClqpTEC7ekWEMEPzH4_Hth","18roPGwQh8ImnrZ3ncIe8dt69JtUqrmwQ","147CRb0HLsfBA8aw9BNdO6dco7dQF6xNo",
  "1oBnPqo8kAxNk4D3cgxlJAaZGqmP5F2Mb","1NVkZtKt1EHXcCA0c_latgAtBdckWGi6t","1EZIR0WmtoYLGcR-mUebaCHYYCL9NNykR",
  "1zwQdkQRZVqXLvhRmHeuqNj3OtwFZ5xer","1p0cWNTy_cCV8_yrV3RuPp94stsaH8ZRm","1ntMdF0lJquZtJTYKc3t4WWGU-00DiYaM",
  "1L1RhTUFgN2ziAWpKaRwlZipkjehPXnWZ","1jgARDI1JIjh_4qRUbvdpG1p0RBp4if7b","1TGZcnR1aYmln_E_UxgD_uInfREnRXf9T",
  "1OKX94fxZ1BXqvDYY8SCQ22gR6Db2op2y","1J2_PY_Rk-x5ipzl_Ur5unrWCx2ZN7LvR","184YPeKcI8ilthW2VPvTcnJSTebj335-c",
  "1-7lrprKPJQ-JuiNVi_bUdzHr_7S0NmNn","1ZAk92jKEyUhpO_faXYdbz5PPXkmo5YQN","1_9oor-2oJ4dHHOBkERAije6pvr8zAqPJ",
  "1MX7rnQG2F0H8UX5ofGazO53knl7SUNE1","148EhK2GqvlP8Z-X-pK4Cp-Zb_sXqBLAu","1EuLjjvKMWIMkgbnK5PKOsKC5kHEG5H11"
];

const PAGE_ACCESS_TOKEN = (process.env.FB_PAGE_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "EAAWBQvtCODwBSLtk2AdCyKeIbTeiDuAEkxFrTjpIYOQnkmilCq1SbVZBFENCe70nXBXikgTm6lrNRvtpiDXoUrkuMEdCoYUy7ZAPoXgRZBVmKhLpuauaaw53c2VpwZAW9KjJwPm1OCLOv210ZAlQjxw4tp43p2zqCdquXoAQTEkALMxLvAH9gy8IS2svVg7dE9zMyNW4EpoZBr0hKSF7HbGTcwZBgAUun65syHH7sRTmJfZATPE8Dx8VqypsSnh9ucSQ0XFJO4emHih5a8bYUGaAZAZBbqcAZDZD").trim();

const ORDER_RULES_MSG = `📋 BOONDHON অর্ডার ও ডেলিভারি পলিসি:

১. অ্যাডভান্স পেমেন্ট:
অর্ডার কনফার্ম করতে হবে মোট মূল্যের ৩০% এডভান্স পেমেন্ট।
পেমেন্ট করতে পারবেন নিম্নলিখিত মাধ্যমে: বিকাশ, নগদ, রকেট (পার্সোনাল) নম্বর: 01682588856.

২. ডিজাইন প্রক্রিয়া:
আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে পাঠাবে।
আপনি ডিজাইন চূড়ান্ত করার পর আমরা প্রিন্ট প্রক্রিয়া শুরু করব।

৩. ডেলিভারি এবং পেমেন্ট:
প্রিন্ট শেষে কার্ড রেডি করে জেলা শহরে ক্যাশ অন ডেলিভারি-এর মাধ্যমে পাঠানো হবে।
কুরিয়ার ডেলিভারি গ্রহণের সময় বাকি ৭০% পেমেন্ট করতে হবে।
জেলা শহরের বাইরে ক্যাশ অন ডেলিভারি উপলব্ধ নয়।
এছাড়া সরাসরি আমাদের অফিস বা কারখানা থেকে সংগ্রহ করতে পারবেন।

৪. ডেলিভারি সময়:
কার্ড ডেলিভারি পেতে ৫ থেকে ৭ কর্মদিবস সময় লাগবে।`;

const BANGLA_ORDER_FORM_TEXT = `📝 বিয়ের কার্ডের বাংলা ফর্ম: 🌸

বর-
নামঃ
পিতাঃ
মাতাঃ
ঠিকানাঃ

কনে-
নামঃ
পিতাঃ
মাতাঃ
ঠিকানাঃ

গায়ে হলুদ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

শুভ বিবাহ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

বৌ-ভাত-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

অভ্যর্থনায়-
(ছোট বাচ্চাদের নাম):
প্রয়োজনে (ফোন):
শুভেচ্ছান্তে নামঃ

🚚 কুরিয়ার ইনফো (নাম, মোবাইল, ঠিকানা):

(ফর্মটি কপি করে পূরণ করে পাঠান! 🥰)`;

// Delay helper for sequential sending
const delay = ms => new Promise(r => setTimeout(r, ms));

// Helper to convert English digits to Bengali digits
const bngDigits = (num) => num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// Helper to calculate price for a SINGLE category only
function getCategoryPrice(qty, category) {
  const isAffordable = category === 'affordable';
  let perPiece;
  
  if (isAffordable) {
    perPiece = qty >= 200 ? 35 : qty >= 100 ? 45 : 55;
  } else {
    perPiece = qty >= 200 ? 45 : qty >= 100 ? 55 : 65;
  }

  const total = qty * perPiece;
  const freeGift = qty >= 200 ? "\n🎁 ২০০+ পিসে ১টি ফ্রি নিকাহনামা!" : "";
  const label = isAffordable ? "💚 সাশ্রয়ী (Affordable)" : "✨ প্রিমিয়াম (Premium)";

  return `${label} কালেকশন:\n${bngDigits(qty)} পিসের দাম: ${bngDigits(total.toLocaleString('en-IN').replace(/,/g, ','))}৳ (পিস প্রতি ${bngDigits(perPiece)}৳)${freeGift}`;
}

// Full price table for a single category
function getFullPriceTable(category) {
  const isAffordable = category === 'affordable';
  const label = isAffordable ? "💚 সাশ্রয়ী (Affordable)" : "✨ প্রিমিয়াম (Premium)";
  
  if (isAffordable) {
    return `${label} কালেকশনের রেট:\n• ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)\n• ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)\n• ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস + ১টি ফ্রি নিকাহনামা 🎁)`;
  } else {
    return `${label} কালেকশনের রেট:\n• ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)\n• ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)\n• ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস + ১টি ফ্রি নিকাহনামা 🎁)`;
  }
}

// Gemini Vision Analysis for Card Recognition
async function analyzeCardImage(photoUrl) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCVEkrtXT9hkllGpbyGIekH8TLgzFJvZ_I";
  try {
    const imgRes = await fetch(photoUrl);
    if (!imgRes.ok) return null;
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

    const prompt = `You are the AI Wedding Card Vision Specialist for "BOONDHON Printing House" (বন্ধন প্রিন্টিং হাউস), Manikganj, Bangladesh.
Analyze the customer's wedding card photo and accurately determine if it is "Affordable" or "Premium".

IMPORTANT CATALOG CRITERIA:
Note: Gold foil and floral motifs exist in BOTH Affordable and Premium categories. Distinguish by structure:

1. "Affordable" (💚 সাশ্রয়ী কালেকশন):
   - Single sheet flat card, standard single-fold cards, 2-fold standard art cardstock / offset paper.
   - Printed traditional borders, motifs, calligraphy or gold ink/foil on flat card without laser-cut outer jackets.
   - Price: 50 pcs = 2,750৳, 100 pcs = 4,500৳, 200 pcs = 7,000৳ (+ Free Nikahnama 🎁).

2. "Premium" (✨ প্রিমিয়াম / লাক্সারি কালেকশন):
   - Multi-layered / multi-piece luxury structure: Outer decorative jacket/folder with separate inner card insert.
   - Intricate laser-cut die-cuts (e.g. heart cutout, floral lace gatefold, arch opening), hardboard / heavy rigid structure, ribbons, tassels, or luxury 3D envelope jackets.
   - Price: 50 pcs = 3,250৳, 100 pcs = 5,500৳, 200 pcs = 9,000৳ (+ Free Nikahnama 🎁).

OUTPUT STRICT JSON ONLY:
{"category":"PREMIUM"|"AFFORDABLE","isExternal":false|true,"summary":"short description"}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType.split(';')[0],
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
      })
    });

    if (!geminiRes.ok) {
      console.error('Gemini Vision Error:', await geminiRes.text());
      return null;
    }

    const data = await geminiRes.json();
    const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = textOut.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Card Image Analysis Failed:', err);
    return null;
  }
}

// ===== GEMINI AI SALES BRAIN =====
async function generateAISalesResponse(senderId, customerMessage, conversationHistory) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCVEkrtXT9hkllGpbyGIekH8TLgzFJvZ_I";
  
  const systemPrompt = `তুমি "বন্ধন প্রিন্টিং হাউস" এর AI সেলস অ্যাসিস্ট্যান্ট। তুমি মানিকগঞ্জ থেকে বিয়ের কার্ড বিক্রি করো।
তোমার নাম: বন্ধন অ্যাসিস্ট্যান্ট।

🎯 তোমার মূল লক্ষ্য: কাস্টমারের সাথে বন্ধুত্বপূর্ণ কথা বলে তাদের অর্ডার কনফার্ম করানো (সেল ক্লোজ)।

📦 প্রোডাক্ট ক্যাটালগ:
১. 💚 Affordable (সাশ্রয়ী) কালেকশন:
   - সিম্পল, সুন্দর ডিজাইন। সিঙ্গেল শিট/ফোল্ড কার্ড।
   - ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)
   - ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)
   - ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস + ফ্রি নিকাহনামা 🎁)

২. ✨ Premium (প্রিমিয়াম/লাক্সারি) কালেকশন:
   - লেজার কাট, গোল্ড ফয়েল, হার্ডবোর্ড জ্যাকেট, রিবন।
   - ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)
   - ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)
   - ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস + ফ্রি নিকাহনামা 🎁)

💳 অর্ডার প্রক্রিয়া:
- ৩০% অ্যাডভান্স: বিকাশ/নগদ/রকেট 01682588856
- ডিজাইনার ডিজাইন তৈরি করে পাঠাবে
- ডেলিভারি: ৫-৭ কর্মদিবস
- জেলা শহরে ক্যাশ অন ডেলিভারি

🗣️ কথা বলার নিয়ম:
- বাংলায় কথা বলো, ইমোজি ব্যবহার করো
- ছোট ছোট বাক্যে কথা বলো, বেশি লম্বা করো না (সর্বোচ্চ ৩-৪ লাইন)
- কাস্টমার যা জিজ্ঞেস করে সরাসরি উত্তর দাও
- বিয়ের শুভেচ্ছা জানাও, উৎসাহ দাও
- কখনো ২টা ক্যাটাগরির দাম একসাথে বোলো না, আগে জানো কাস্টমার কোনটা চায়
- কাস্টমারকে কার্ড দেখতে বলো বা পিস সংখ্যা জিজ্ঞেস করো
- সবসময় একটা পরবর্তী পদক্ষেপ (next action) সাজেস্ট করো

⚠️ গুরুত্বপূর্ণ:
- শুধু টেক্সট রিপ্লাই দাও, কোনো মার্কডাউন/কোড ফর্ম্যাট না
- ১৫০ শব্দের বেশি লিখো না
- কাস্টমার কাস্টম/নিজের ডিজাইন চাইলে বলো আমরা কাস্টম ডিজাইনও করি
- প্রতিযোগীদের নিয়ে নেতিবাচক কথা বোলো না`;

  try {
    // Build conversation context (last 10 messages)
    const recentMsgs = (conversationHistory || []).slice(-10).map(msg => ({
      role: msg.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: msg.text || '(media)' }]
    }));

    // Add current message
    recentMsgs.push({ role: 'user', parts: [{ text: customerMessage }] });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: recentMsgs,
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      })
    });

    if (!geminiRes.ok) {
      console.error('Gemini AI Brain Error:', await geminiRes.text());
      return null;
    }

    const data = await geminiRes.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.error('AI Sales Brain Error:', err);
    return null;
  }
}

// Helper to send Native Button Template (max 3 buttons per Meta's limit)
async function sendMessengerButtonBlock(recipientId, text, buttons = []) {
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const validButtons = buttons.slice(0, 3).map(b => ({
    type: "postback",
    title: b.title.substring(0, 20),
    payload: b.payload
  }));

  const payload = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: validButtons
        }
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Messenger Button Block Error:', JSON.stringify(data));
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: text }
        })
      });
    }
  } catch (err) {
    console.error('Error sending Messenger button block:', err);
  }
}

// Send Direct Full-Size Image Attachment
async function sendMessengerImage(recipientId, id) {
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  
  const primaryUrl = `https://boondhon-platform-qr9a.vercel.app/api/img/${id}.jpg`;
  const fallbackUrl = `https://lh3.googleusercontent.com/d/${id}`;

  const payload = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "image",
        payload: { url: primaryUrl }
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      console.error('Messenger Image Direct Send Primary Error:', JSON.stringify(data));

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            attachment: {
              type: "image",
              payload: { url: fallbackUrl }
            }
          }
        })
      });
    }
  } catch (err) {
    console.error('Error sending image:', err);
  }
}

// Send Plain Text Message
async function sendMessengerText(recipientId, text) {
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: text }
      })
    });
  } catch (err) {
    console.error('Error sending Messenger text:', err);
  }
}

// Send 8 Direct Full-Size Card Photos then Smart Buttons (opposite category switch + human support)
async function sendSequentialGallery(recipientId, type, text) {
  const idsList = type === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const batch = getUnseenImages(recipientId, idsList, 8);
  
  // Track current category
  setCurrentCategory(recipientId, type);
  
  for (const id of batch) {
    await sendMessengerImage(recipientId, id);
    await delay(250);
  }

  // Dynamic opposite-category switch button
  const switchBtn = type === 'premium'
    ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
    : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };

  // Meta allows max 3 buttons per template
  const buttons = [
    { title: "আরও দেখুন", payload: `MORE_${type.toUpperCase()}` },
    switchBtn,
    { title: "অর্ডার করবো", payload: "BTN_ORDER" }
  ];

  await sendMessengerButtonBlock(recipientId, text, buttons);
  appendMessage(recipientId, 'bot', text);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.VERIFY_TOKEN || "BOONDHON_SECRET_2026";

    if (mode && token === verifyToken) {
      console.log('Messenger Webhook Verified!');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification Failed');
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'page') {
        const entries = body.entry || [];

        for (const entry of entries) {
          const webhookEvent = entry.messaging?.[0];
          if (webhookEvent) {
            if (webhookEvent.delivery || webhookEvent.read) continue;

            // ===== ECHO DETECTION: Admin manual reply → auto-takeover =====
            if (webhookEvent.message?.is_echo) {
              const echoAppId = webhookEvent.message?.app_id;
              const BOT_APP_ID = "2563899990649523";
              
              if (echoAppId === BOT_APP_ID) {
                // Bot's own echo → skip silently
                continue;
              }
              
              // Admin/human replied from Page Inbox → activate human takeover
              const recipientId = webhookEvent.recipient?.id;
              if (recipientId) {
                setHumanTakeover(recipientId, true);
                appendMessage(recipientId, 'admin', webhookEvent.message?.text || '(admin reply)');
                console.log(`🙋 ADMIN TAKEOVER activated for ${recipientId} — admin replied manually`);
              }
              continue;
            }

            const senderId = webhookEvent.sender?.id;
            if (!senderId) continue;

            const postbackPayload = webhookEvent.postback?.payload || '';
            const quickReplyPayload = webhookEvent.message?.quick_reply?.payload || '';

            const message = webhookEvent.message;
            const postback = webhookEvent.postback;

            let text = message?.text || postback?.payload || postback?.title || '';
            let payload = quickReplyPayload || postbackPayload || '';
            const txt = text.toLowerCase();

            appendMessage(senderId, 'customer', text);

            // ===== HUMAN TAKEOVER CHECK WITH AUTO-RESUME =====
            const existingConv = getConversation(senderId);
            const AUTO_RESUME_MS = 15 * 60 * 1000; // 15 minutes
            
            if (existingConv && existingConv.humanTakeover === true) {
              const lastAdmin = existingConv.lastAdminReplyTime || 0;
              const elapsed = Date.now() - lastAdmin;
              
              if (elapsed > AUTO_RESUME_MS) {
                // Admin inactive > 15 min → auto-resume bot
                setHumanTakeover(senderId, false);
                console.log(`🤖 BOT AUTO-RESUMED for ${senderId} — admin inactive ${Math.round(elapsed/60000)} min`);
                // Fall through to bot logic below
              } else {
                // Admin still active → skip bot reply
                console.log(`🙋 Human Takeover ACTIVE for ${senderId}. Admin replied ${Math.round(elapsed/60000)} min ago. Skipping bot.`);
                continue;
              }
            }

            const attachments = message?.attachments;
            let isPhoto = false;
            let photoUrl = null;
            if (attachments && attachments.length > 0) {
              const imgAtt = attachments.find(att => att.type === 'image');
              if (imgAtt) {
                isPhoto = true;
                photoUrl = imgAtt.payload?.url;
              }
            }

            // Check if this is a button click (postback) or free-text
            const isButtonClick = !!(payload || postbackPayload || quickReplyPayload);

            let quantity = null;
            if (payload.startsWith('QTY_')) {
              quantity = parseInt(payload.replace('QTY_', ''), 10);
            } else {
              const numMatch = txt.match(/\b(\d{2,5})\b/);
              if (numMatch) {
                const num = parseInt(numMatch[1], 10);
                if (num >= 20) quantity = num;
              }
            }

            // ===== PHOTO UPLOADED — SMART CARD ANALYSIS =====
            if (isPhoto && photoUrl) {
              const analysis = await analyzeCardImage(photoUrl);
              const category = analysis ? (analysis.category === 'PREMIUM' ? 'premium' : 'affordable') : 'premium';
              const isExternal = analysis ? analysis.isExternal : false;
              
              // Track current category context
              setCurrentCategory(senderId, category);

              const oppositeBtn = category === 'premium'
                ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
                : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };

              if (!isExternal) {
                // ===== OUR DESIGN — Single category price only =====
                const priceTable = getFullPriceTable(category);
                const emoji = category === 'premium' ? '✨' : '💚';
                const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                
                const reply = `দারুণ পছন্দ! এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড। 😍\n\n${priceTable}\n\nআপনার কত পিস লাগবে বলুন? 😊`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  oppositeBtn,
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // ===== NOT OUR DESIGN — Suggest closest matches from detected category =====
                const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                const idsList = category === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
                
                const reply = `আপনার পাঠানো ডিজাইনটি আমাদের কালেকশনের নয়। 🤔\nতবে এর স্টাইলের সাথে কাছাকাছি আমাদের ${catName} কালেকশনের কয়েকটি ডিজাইন আছে।\n\nনিচে দেখুন: 👇`;
                await sendMessengerText(senderId, reply);
                appendMessage(senderId, 'bot', reply);

                // Send 3 closest unseen sample images
                const sampleImages = getUnseenImages(senderId, idsList, 3);
                for (const imgId of sampleImages) {
                  await sendMessengerImage(senderId, imgId);
                  await delay(300);
                }

                const followUp = "এই ডিজাইনগুলো কেমন লাগলো? আরও দেখতে চাইলে বলুন! 😊";
                await sendMessengerButtonBlock(senderId, followUp, [
                  { title: "আরও দেখুন", payload: `MORE_${category.toUpperCase()}` },
                  oppositeBtn,
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', followUp);
              }
            }
            // ===== QUANTITY — Show price for CURRENT category only =====
            else if (quantity) {
              const currentCat = getCurrentCategory(senderId) || 'affordable';
              const reply = getCategoryPrice(quantity, currentCat) + "\n\nঅর্ডার করতে চাইলে বলুন! 😊";
              
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
            // ===== AFFORDABLE COLLECTION =====
            else if (payload === 'BTN_AFFORDABLE' || payload === 'MORE_AFFORDABLE' || payload.startsWith('MORE_AFFORDABLE_') || txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল') || txt.includes('সাশ্রয়ী')) {
              await sendSequentialGallery(senderId, 'affordable', "এগুলো আমাদের চমৎকার 💚 সাশ্রয়ী ডিজাইন! 😍\nআরও দেখতে চাইলে বলুন। কত পিস লাগবে?");
            }
            // ===== PREMIUM COLLECTION =====
            else if (payload === 'BTN_PREMIUM' || payload === 'MORE_PREMIUM' || payload.startsWith('MORE_PREMIUM_') || txt.includes('premium') || txt.includes('প্রিমিয়াম') || txt.includes('লাক্সারি')) {
              await sendSequentialGallery(senderId, 'premium', "প্রিমিয়াম কালেকশনের সেরা ডিজাইন! ✨\nআরও দেখতে চাইলে বলুন। কত পিস লাগবে?");
            }
            // ===== PRICE — Context-aware single category =====
            else if (payload === 'BTN_PRICE' || txt.match(/price|দাম|কত|কতো|মূল্য|rate|koto|cost|dam|daam/)) {
              const currentCat = getCurrentCategory(senderId);
              
              if (currentCat) {
                // Show price for current active category only
                const priceTable = getFullPriceTable(currentCat);
                const reply = priceTable + "\n\nকত পিস লাগবে বলুন, সাথে সাথে হিসাব দিয়ে দিচ্ছি! 😊";
                
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
            }
            // ===== CATEGORY-SPECIFIC PRICE BUTTONS =====
            else if (payload === 'BTN_AFFORDABLE_PRICE') {
              setCurrentCategory(senderId, 'affordable');
              const reply = getFullPriceTable('affordable') + "\n\nকত পিস লাগবে বলুন! 😊";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "✨ Premium দাম", payload: "BTN_PREMIUM_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            else if (payload === 'BTN_PREMIUM_PRICE') {
              setCurrentCategory(senderId, 'premium');
              const reply = getFullPriceTable('premium') + "\n\nকত পিস লাগবে বলুন! 😊";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "💚 Affordable দাম", payload: "BTN_AFFORDABLE_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== ORDER =====
            else if (payload === 'BTN_ORDER' || txt.match(/অর্ডার|order|বুকিং|booking|কনফার্ম/)) {
              const reply = "দারুণ! 🎉 অর্ডার করতে:\n৩০% অ্যাডভান্স পাঠান: বিকাশ/নগদ/রকেট 01682588856\nতারপর এখানে স্ক্রিনশট পাঠান। 😊";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
                { title: "ডেলিভারি পলিসি", payload: "BTN_POLICY" },
                { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            else if (payload === 'BTN_FORM' || txt.match(/ফর্ম|form/)) {
              await sendMessengerText(senderId, BANGLA_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', BANGLA_ORDER_FORM_TEXT);
            }
            else if (payload === 'BTN_POLICY' || txt.match(/পলিসি|policy|ডেলিভারি|delivery|কুরিয়ার/)) {
              await sendMessengerText(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);
            }
            // ===== DEFAULT — Welcome or fallback =====
            else {
              const isGreeting = txt.match(/^(hi|hello|hey|হাই|হ্যালো|আসসালামু|assalamu|get started|start|শুরু)$/i);
              const isFirstTime = !existingConv || !existingConv.messages || existingConv.messages.length <= 1;

              if (isGreeting || isFirstTime || isButtonClick) {
                // Welcome message
                const reply = "আসসালামু আলাইকুম! 🌸\nবন্ধন প্রিন্টিং হাউসে স্বাগতম।\nআপনি কি বিয়ের কার্ড দেখতে চাইছেন?";
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // ===== AI SALES BRAIN — Smart conversational reply =====
                const currentCat = getCurrentCategory(senderId);
                const catBtn = currentCat === 'premium'
                  ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
                  : currentCat === 'affordable'
                    ? { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
                    : { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" };

                // Get AI response using conversation history
                const convHistory = existingConv?.messages || [];
                const aiReply = await generateAISalesResponse(senderId, text, convHistory);
                
                const reply = aiReply || "ধন্যবাদ! 😊 আমাদের কালেকশন দেখতে নিচের বাটনে ক্লিক করুন!";
                await sendMessengerButtonBlock(senderId, reply, [
                  catBtn,
                  { title: "দাম জানুন", payload: "BTN_PRICE" },
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" }
                ]);
                appendMessage(senderId, 'bot', reply);
              }
            }
          }
        }

        return res.status(200).send('EVENT_RECEIVED');
      }

      return res.status(404).send('Not a Messenger Event');
    } catch (err) {
      console.error('Error handling Messenger webhook:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
