import { appendMessage, getConversation, setHumanTakeover, getUnseenImages, getUnseenImagesWithStats, setCurrentCategory, getCurrentCategory } from '../../lib/chat-store';
import { VISUAL_CATALOG_RULES } from '../../lib/data';
import { findCatalogMatch, isCatalogIndexReady } from '../../lib/catalog-matcher';

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

const PAGE_ACCESS_TOKEN = (process.env.FB_PAGE_ACCESS_TOKEN || "").trim();

const ORDER_RULES_MSG = `📋 অর্ডার করার সহজ নিয়মাবলী:
১. কার্ডের তথ্য পাঠাতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন।
২. অর্ডার কনফার্ম করতে মোট মূল্যের ৩০% অ্যাডভান্স পাঠান: বিকাশ/নগদ/রকেট (পার্সোনাল) 01682588856।
৩. আমাদের অভিজ্ঞ ডিজাইনার কার্ড ডিজাইন তৈরি করে আপনাকে প্রুফ চেক করাবে।
৪. আপনার চূড়ান্ত অনুমোদনের পর প্রিন্ট করে জেলা শহরে ক্যাশ অন ডেলিভারিতে পাঠানো হবে (৫-৭ কর্মদিবস)।`;

const BANGLA_ORDER_FORM_TEXT = `📝 বিয়ের কার্ড তৈরির অর্ডার ফর্ম (বাংলা): 🌸
(ফর্মটি কপি করে তথ্যগুলো লিখে আমাদের পাঠিয়ে দিন)

📦 কার্ডের পরিমাণ (কত পিস লাগবে): 
🎨 পছন্দের কার্ড কোড/মডেল (যদি থাকে): 

🤵 বর সম্পর্কিত তথ্য:
• বরের পূর্ণ নাম: 
• পিতার নাম: 
• মাতার নাম: 
• বর্তমান/স্থায়ী ঠিকানা (গ্রাম/রোড, থানা, জেলা): 

👰 কনে সম্পর্কিত তথ্য:
• কনের পূর্ণ নাম: 
• পিতার নাম: 
• মাতার নাম: 
• বর্তমান/স্থায়ী ঠিকানা (গ্রাম/রোড, থানা, জেলা): 

📅 অনুষ্ঠানসূচী (যেগুলো কার্ডে থাকবে):
১. গায়ে হলুদ:
   - তারিখ: (ইংরেজি ও বাংলা)
   - বার / রোজ: 
   - সময়: 
   - স্থান / ভেন্যু: 

২. শুভ বিবাহ / আকদ:
   - তারিখ: (ইংরেজি ও বাংলা)
   - বার / রোজ: 
   - সময়: 
   - স্থান / ভেন্যু: 

৩. বৌ-ভাত / ওলিমা:
   - তারিখ: (ইংরেজি ও বাংলা)
   - বার / রোজ: 
   - সময়: 
   - স্থান / ভেন্যু: 

💌 আমন্ত্রণে ও সৌজন্যে:
• অভ্যর্থনায় (ছোটদের নাম): 
• শুভেচ্ছান্তে (বড়দের নাম/পরিবারবর্গ): 
• প্রয়োজনে যোগাযোগ (মোবাইল নম্বর): 

🚚 হোম ডেলিভারির জন্য কুরিয়ার তথ্য:
• প্রাপকের নাম: 
• সচল মোবাইল নম্বর: 
• ডেলিভারির পূর্ণ ঠিকানা (থানা ও জেলা সহ): 

💡 (ফর্মটি পূরণ করে পাঠালে আমাদের ডিজাইনার ডিজাইন রেডি করে আপনাকে প্রুফ দেখাবে! 🥰)`;

const ENGLISH_ORDER_FORM_TEXT = `📝 Wedding Card Order Form (English): ✨
(Please copy this form, fill in your details and send it back to us)

📦 Card Quantity (How many pcs): 
🎨 Preferred Card Code/Model (If any): 

🤵 Groom's Details:
• Groom's Full Name: 
• Father's Name: 
• Mother's Name: 
• Address (City/District): 

👰 Bride's Details:
• Bride's Full Name: 
• Father's Name: 
• Mother's Name: 
• Address (City/District): 

📅 Event Schedule:
1. Gaye Holud / Turmeric Ceremony:
   - Date: 
   - Day: 
   - Time: 
   - Venue: 

2. Wedding Ceremony / Nikah:
   - Date: 
   - Day: 
   - Time: 
   - Venue: 

3. Reception / Walima:
   - Date: 
   - Day: 
   - Time: 
   - Venue: 

💌 RSVP & Compliments:
• RSVP / Best Compliments: 
• Little Ones / Cordially Invited by: 
• Contact Phone: 

🚚 Courier Delivery Details:
• Receiver Name: 
• Active Mobile Number: 
• Full Delivery Address (with District & Thana): 

💡 (Once you send the filled form, our designer will draft your card proof for your review! 🥰)`;

// Delay helper for sequential sending
const delay = ms => new Promise(r => setTimeout(r, ms));

// Helper to convert Bengali digits to English digits
function normalizeBengaliDigits(str) {
  if (!str) return '';
  return str.toString().replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
}

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
  const freeGift = "";
  const label = isAffordable ? "💚 সাশ্রয়ী (Affordable)" : "✨ প্রিমিয়াম (Premium)";

  return `${label} কালেকশন:\n${bngDigits(qty)} পিসের দাম: ${bngDigits(total.toLocaleString('en-IN').replace(/,/g, ','))}৳ (পিস প্রতি ${bngDigits(perPiece)}৳)${freeGift}`;
}

// Low quantity custom pricing (less than 50 pcs)
function getLowQtyPrice(qty) {
  let rateMsg = '';
  if (qty <= 5) {
    rateMsg = `${bngDigits(qty)} পিসের সর্বমোট দাম: ১,০০০৳ (কম পরিমাণে ফিক্সড ডাইস ও মেকিং চার্জ সহ)`;
  } else if (qty <= 10) {
    rateMsg = `${bngDigits(qty)} পিসের সর্বমোট দাম: ১,৫০০৳ (ফিক্সড চার্জ)`;
  } else {
    const total = qty * 75;
    rateMsg = `${bngDigits(qty)} পিসের দাম: ${bngDigits(total.toLocaleString('en-IN'))}৳ (পিস প্রতি ৭৫৳)`;
  }

  return `📦 ${bngDigits(qty)} পিস কার্ডের দামের হিসাব:\n\n${rateMsg}\n\n💡 পরামর্শ: ৫০ পিস বা তার বেশি অর্ডার করলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
}

// Full price table for a single category
function getFullPriceTable(category) {
  const isAffordable = category === 'affordable';
  const label = isAffordable ? "💚 সাশ্রয়ী (Affordable)" : "✨ প্রিমিয়াম (Premium)";
  
  if (isAffordable) {
    return `${label} কালেকশনের রেট:\n• ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)\n• ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)\n• ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)`;
  } else {
    return `${label} কালেকশনের রেট:\n• ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)\n• ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)\n• ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস)`;
  }
}

// Gemini Vision Analysis for Card Recognition
async function analyzeCardImage(photoUrl) {
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured in environment variables');
    return null;
  }
  try {
    const imgRes = await fetch(photoUrl);
    if (!imgRes.ok) {
      console.error('Failed to fetch photoUrl from Messenger:', imgRes.status);
      return null;
    }
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];

    const prompt = `You are an expert AI Wedding Card specialist for "BOONDHON Printing House" (বন্ধন প্রিন্টিং হাউস), Manikganj, Bangladesh.
Your task is to analyze the customer's uploaded wedding card photo:

BUSINESS RULES:
${VISUAL_CATALOG_RULES.RULES.map(rule => `   - ${rule}`).join('\n')}

DIAGNOSTIC PROCESS:
- Check if the uploaded image represents a wedding card design belonging to the "BOONDHON" catalog.
- Since designs and materials are identical in both categories (Affordable vs Premium) and size cannot be judged from the photo, you do not need to guess the category size. Focus on whether this style matches our catalog (laser-cut khilan/arch dome cutouts, peacock/floral printed art cards, ribbon handles, hardboard gatefolds) vs an external design.
- If it is our design, set "isExternal" to false.
- If it is a design from another manufacturer (Pinterest, competitors), set "isExternal" to true.

Respond in strict JSON:
{
  "category": "MATCH",
  "isExternal": false | true,
  "confidence": 0.95,
  "reason": "ড্রাইভ ক্যাটালগের সাথে ম্যাচিংয়ের কারণ"
}`;

    const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
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
          console.log(`Gemini Vision succeeded with model: ${GEMINI_MODEL}`);
        }
      } else {
        console.warn(`Vision model ${GEMINI_MODEL} failed (${geminiRes.status}):`, await geminiRes.text());
      }
    } catch (callErr) {
      if (callErr.name === 'AbortError') {
        console.warn(`Vision model ${GEMINI_MODEL} timed out after 8 seconds`);
      } else {
        console.warn(`Vision model ${GEMINI_MODEL} call exception:`, callErr.message);
      }
    } finally {
      clearTimeout(timeoutId);
    }
    
    // Robust JSON extraction
    const jsonMatch = textOut.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Card Vision Analysis Result:', JSON.stringify(parsed));
      return {
        category: (parsed.category || '').toUpperCase().includes('PREM') ? 'PREMIUM' : 'AFFORDABLE',
        isExternal: Boolean(parsed.isExternal),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.90,
        reason: parsed.reason || ''
      };
    }
    return null;
  } catch (err) {
    console.error('Card Image Analysis Exception:', err);
    return null;
  }
}

// ===== GEMINI AI SALES BRAIN =====
async function generateAISalesResponse(senderId, customerMessage, conversationHistory) {
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
  if (!GEMINI_API_KEY) return null;
  
  const systemPrompt = `তুমি "বন্ধন প্রিন্টিং হাউস" এর অত্যন্ত অমায়িক ও চটপটে সেলস অ্যাসিস্ট্যান্ট। তোমার নাম "অনন্যা"।
তুমি মানিকগঞ্জ অফিস ও ঢাকার কারখানা (ফকিরাপুল, বাবুবাজার, বঙ্গবাজার) থেকে বিয়ের কার্ড বিক্রি করো।

🎯 তোমার মূল লক্ষ্য: কাস্টমারের সাথে একজন আসল মানুষের মতো আন্তরিকভাবে কথা বলে তাদের পছন্দ জানতে চাওয়া এবং অর্ডার কনফার্ম করানো (সেল ক্লোজ)।

📦 প্রোডাক্ট ক্যাটালগ ও প্রাইসিং:
⚠️ দুটো ক্যাটাগরির ডিজাইন ও মেটেরিয়াল হুবহু এক (লেজার কাট, ফয়েল, রিবন সবই থাকতে পারে), শুধু ফিজিক্যাল সাইজ আলাদা।

১. 💚 Affordable (সাশ্রয়ী) — ছোট সাইজ:
   - ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)
   - ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)
   - ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)

২. ✨ Premium (প্রিমিয়াম/লাক্সারি) — বড় সাইজ:
   - ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)
   - ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)
   - ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস)

৩. 🔹 অল্প পরিমাণের বিশেষ প্রাইসিং (১ - ৪৯ পিস):
   - ১-৫ পিস: ১,০০০৳ সর্বমোট (ফিক্সড মেকিং ও ডাইস চার্জ সহ)
   - ৬-১০ পিস: ১,৫০০৳ সর্বমোট (ফিক্সড চার্জ)
   - ১১-৪৯ পিস: পিস প্রতি ৭৫৳ (যেমন ২৫ পিস = ১,৮৭৫৳)

📍 ঠিকানা ও কারখানা:
- অফিস: ২/১-২, ভূমি অফিস লেন, মানিকগঞ্জ, ঢাকা (সরাসরি দেখা করে বা কুরিয়ারে ক্যাশ অন ডেলিভারিতে অর্ডার নেওয়া যাবে)
- কারখানা: ফকিরাপুল, বাবুবাজার, বঙ্গবাজার (ঢাকা)
- গুগল ম্যাপ লিংক: https://maps.app.goo.gl/CnyRST5KxHjWDAtd9

💳 পেমেন্ট ও কন্টাক্ট:
- ৩০% অ্যাডভান্স পেমেন্ট নম্বর: 01682588856 (বিকাশ, নগদ, রকেট পার্সোনাল)
- কল/হোয়াটসঅ্যাপ হটলাইন: 01701016826 (বন্ধন হটলাইন)

🗣️ কথা বলার নিয়ম (মানুষের মতো স্বাভাবিক রিঅ্যাকশন):
- বাংলায় কথা বলো, ইমোজি ব্যবহার করো
- রোবটের মতো দীর্ঘ প্যারা লিখবে না, ১-৩ লাইনে উত্তর দাও
- কাস্টমার "অল্প লাগবে" বা "কম পিস" বললে ১-৪৯ পিসের প্রাইসিং বুঝিয়ে বলো
- বিয়ের শুভেচ্ছা জানাও, তাদের পছন্দের ডিজাইন দেখতে সাহায্য করো
- কাস্টমার অর্ডার করতে চাইলে বা ফর্ম চাইলে: আগে জিজ্ঞেস করো কার্ডটি বাংলায় হবে নাকি ইংরেজিতে (আমাদের বাংলা ও ইংরেজি উভয় ফর্মই রয়েছে) এবং ফর্মে কার্ডের পরিমাণ (কত পিস) উল্লেখ করতে বলো।
- কাস্টমার নিজের পছন্দ বা কাস্টম ডিজাইন চাইলে বলো অ্যাডভান্সের পর আমাদের ডিজাইনার হোয়াটসঅ্যাপে ডিজাইন প্রুফ তৈরি করে দেখাবে।
- কাস্টমার দাম কমাতে বা ডিসকাউন্ট চাইলে বলো: "আমাদের দামগুলো সেরা মেটেরিয়াল ও পাইকারি রেটে নির্ধারিত। তবে ২০০+ পিস নিলে প্রতি পিসের দাম অনেক কমে আসবে !"`;

  try {
    // Build conversation context (last 10 messages)
    const recentMsgs = (conversationHistory || []).slice(-10).map(msg => ({
      role: msg.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: msg.text || '(media)' }]
    }));

    // Add current message
    recentMsgs.push({ role: 'user', parts: [{ text: customerMessage }] });

    const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
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
        console.warn(`Sales brain model ${GEMINI_MODEL} failed (${geminiRes.status}):`, await geminiRes.text());
      }
    } catch (callErr) {
      if (callErr.name === 'AbortError') {
        console.warn(`Sales brain model ${GEMINI_MODEL} timed out after 8 seconds`);
      } else {
        console.warn(`Sales brain model ${GEMINI_MODEL} error:`, callErr.message);
      }
    } finally {
      clearTimeout(timeoutId);
    }
    return null;
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

// In-memory deduplication cache for Facebook Webhook retries
const processedEvents = new Map();
function isDuplicateEvent(eventId) {
  if (!eventId) return false;
  const now = Date.now();
  for (const [k, time] of processedEvents.entries()) {
    if (now - time > 120000) processedEvents.delete(k);
  }
  if (processedEvents.has(eventId)) {
    return true;
  }
  processedEvents.set(eventId, now);
  return false;
}

// User-level Debounce Lock (prevents rapid duplicate webhook triggers per user)
const userLastMsgMap = new Map();
function isUserDebounced(senderId, isPhoto) {
  const now = Date.now();
  const lastTime = userLastMsgMap.get(senderId) || 0;
  if (isPhoto) {
    userLastMsgMap.set(senderId, now);
    return false; // Always process photo
  }
  if (now - lastTime < 2000) {
    console.log(`⏩ Debouncing rapid webhook event for ${senderId} (${now - lastTime}ms since last event)`);
    return true;
  }
  userLastMsgMap.set(senderId, now);
  return false;
}

// Send 8 Direct Full-Size Card Photos sequentially using guaranteed offset tracking
async function sendSequentialGallery(recipientId, type, requestedOffset = 0) {
  const idsList = type === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const totalCount = idsList.length;
  
  let offset = requestedOffset !== null ? parseInt(requestedOffset, 10) : 0;
  if (isNaN(offset) || offset >= totalCount || offset < 0) {
    offset = 0;
  }

  const batch = idsList.slice(offset, offset + 8);
  const nextOffset = (offset + 8 >= totalCount) ? 0 : (offset + 8);
  const seenCount = Math.min(offset + batch.length, totalCount);

  // Track current category
  setCurrentCategory(recipientId, type);
  
  for (const id of batch) {
    await sendMessengerImage(recipientId, id);
    await delay(180);
  }

  await delay(400);

  const typeName = type === 'premium' ? '✨ প্রিমিয়াম' : '💚 সাশ্রয়ী';
  const progressText = `আমাদের মোট ${bngDigits(totalCount)}টি ${typeName} ডিজাইনের মধ্যে আপনি ${bngDigits(seenCount)}টি দেখেছেন। 😍\n\nআরও দেখতে 'আরও দেখুন' বাটনে চাপুন। কত পিস লাগবে আপনার? 😊`;

  // Dynamic opposite-category switch button (starts at offset 0)
  const switchBtn = type === 'premium'
    ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
    : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };

  // Guaranteed sequential payload carrying nextOffset
  const morePayload = `MORE_${type.toUpperCase()}_${nextOffset}`;

  // Meta allows max 3 buttons per template
  const buttons = [
    { title: "আরও দেখুন", payload: morePayload },
    switchBtn,
    { title: "অর্ডার করবো", payload: "BTN_ORDER" }
  ];

  await sendMessengerButtonBlock(recipientId, progressText, buttons);
  appendMessage(recipientId, 'bot', progressText);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = (process.env.VERIFY_TOKEN || "").trim();

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
          const messagingEvents = entry.messaging || [];
          for (const webhookEvent of messagingEvents) {
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

            const eventId = webhookEvent.message?.mid || (webhookEvent.postback ? `${senderId}_${webhookEvent.timestamp}_${webhookEvent.postback.payload}` : null);
            if (eventId && isDuplicateEvent(eventId)) {
              console.log(`⏩ Duplicate webhook event skipped: ${eventId}`);
              continue;
            }

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
            }

            // If user event is debounced (within 2s of previous event), skip
            if (isUserDebounced(senderId, isPhoto)) {
              continue;
            }

            // If sending a photo, clear text & payload to prevent text/price triggers
            if (isPhoto) {
              payload = '';
              text = '';
            }

            // Check if this is a button click (postback) or free-text
            const isButtonClick = !!(payload || postbackPayload || quickReplyPayload);

            const normalizedTxt = normalizeBengaliDigits(text).toLowerCase();
            if (normalizedTxt.includes('facebook.com') || normalizedTxt.includes('fb.watch') || normalizedTxt.includes('/reel/') || normalizedTxt.includes('/videos/') || normalizedTxt.includes('fb.me')) {
              isLinkOrShare = true;
            }

            // Detect if this message is a filled wedding card order form
            const isFormSubmission = (
              (text.includes('বর') && text.includes('কনে')) ||
              (text.includes('নামঃ') && text.includes('পিতাঃ')) ||
              (text.includes('অনুষ্ঠানসূচী') || text.includes('ওয়ালিমা') || text.includes('গায়ে হলুদ') || text.includes('বউ-ভাত') || text.includes('কনের বাড়ি')) ||
              (text.includes('প্রিন্ট কার্ডের সংখ্যা') || text.includes('কার্ডের সংখ্যা') || text.includes('কার্ডের পরিমাণ')) ||
              ((normalizedTxt.includes('groom') || normalizedTxt.includes('bride')) && (normalizedTxt.includes('father') || normalizedTxt.includes('wedding') || normalizedTxt.includes('courier'))) ||
              (normalizedTxt.includes('wedding card') && (normalizedTxt.includes('courier') || normalizedTxt.includes('quantity'))) ||
              (normalizedTxt.includes('card quantity') || normalizedTxt.includes('how many pcs'))
            );

            // Detect if this message is payment confirmation / transaction info (e.g. "লাস্ট ডিজিট হলো : ১২১৩", "last 4 digit 1234", "trxid 9XYZ...")
            const isPaymentInfoSubmission = (
              normalizedTxt.match(/লাস্ট\s*(?:৪|4)?\s*ডিজিট|last\s*(?:4|৪)?\s*digit|ডিজিট\s*(?:হলো|হল|হচ্ছে|দিলাম|ঃ|:)|বিকাশ\s*লাস্ট|নগদ\s*লাস্ট|রকেট\s*লাস্ট|trx\s*id|transaction\s*id|ট্রানজেকশন|লাস্ট\s*নম্বর|পেমেন্ট\s*কোড|টাকা\s*পাঠাইছি|টাকা\s*পাঠিয়েছি/i) !== null ||
              (normalizedTxt.match(/(?:লাস্ট|last|digit|ডিজিট)[\s:ঃ]*\d{3,6}/i) !== null && !normalizedTxt.match(/পিস|pcs?|piece/i)) ||
              (normalizedTxt.match(/^(?:last\s*digit\s*)?(?:[:ঃ\s]*)?\d{3,6}$/i) !== null && !normalizedTxt.match(/পিস|pcs?|piece/i) && (existingConv?.messages?.slice(-4)?.some(m => m.text?.includes('লাস্ট ৪ ডিজিট') || m.text?.includes('পেমেন্ট'))))
            );

            let quantity = null;
            if (payload.startsWith('QTY_')) {
              quantity = parseInt(payload.replace('QTY_', ''), 10);
            } else if (isFormSubmission) {
              const formQtyMatch = normalizedTxt.match(/(?:কার্ডের\s*(?:পরিমাণ|সংখ্যা)|card\s*quantity|quantity|কত\s*পিস)\s*[:ঃ]?\s*(\d{1,5})/i) ||
                                  normalizedTxt.match(/\b(\d{1,5})\s*(pcs?|piece|পিস|পিসি|পিচ)\b/i);
              if (formQtyMatch) {
                const num = parseInt(formQtyMatch[1], 10);
                if (num > 0 && num < 10000) quantity = num;
              }
            } else if (!isPaymentInfoSubmission) {
              const numMatch = normalizedTxt.match(/\b(\d{1,5})\s*(pcs?|piece|পিস|পিসি|পিচ)?\b/i);
              if (numMatch) {
                const num = parseInt(numMatch[1], 10);
                if (num > 0 && num < 10000) quantity = num;
              }
            }

            // ===== PHOTO UPLOADED — CATALOG EMBEDDING MATCH =====
            if (isPhoto && photoUrl) {
              let matchResult = null;

              // Try embedding-based matching if catalog index is ready
              if (isCatalogIndexReady()) {
                try {
                  const imgRes = await fetch(photoUrl);
                  if (imgRes.ok) {
                    const arrayBuffer = await imgRes.arrayBuffer();
                    const base64Data = Buffer.from(arrayBuffer).toString('base64');
                    const mimeType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
                    matchResult = await findCatalogMatch(base64Data, mimeType);
                  }
                } catch (matchErr) {
                  console.error('Catalog match error:', matchErr.message);
                }
              }

              if (matchResult && matchResult.isMatch) {
                // ===== EXACT / STRONG CATALOG MATCH (>= 70%) =====
                const category = matchResult.category;
                const matchCode = matchResult.code;
                setCurrentCategory(senderId, category);

                const priceTable = getFullPriceTable(category);
                const emoji = category === 'premium' ? '✨' : '💚';
                const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                const altCat = category === 'premium' ? 'affordable' : 'premium';
                const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

                const reply = `সুন্দর পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড (${matchCode})।\n\n${priceTable}\n\nকত পিস লাগবে বলুন! 😊`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
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

                const reply = `চমৎকার পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের একটি আকর্ষণীয় কার্ড।\n\n${priceTable}\n\nকত পিস লাগবে বলুন! 😊`;
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                  { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // ===== NO MATCH — Show prices of both collections + sample cards =====
                const reply = `সুন্দর ডিজাইন! 😍 আমাদের কাছে এই ধরনের চমৎকার কার্ড রয়েছে।\n\nআমাদের কার্ডের রেট:\n💚 Affordable: ৫০ পিস ২,৭৫০৳ (৫৫৳/পিস)\n✨ Premium: ৫০ পিস ৩,২৫০৳ (৬৫৳/পিস)\n\nআপনার কত পিস লাগবে বলুন! 😊`;
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
              }
            }
            // ===== SHARED REEL / VIDEO / POST FROM PAGE =====
            else if (isLinkOrShare) {
              const reply = `আমাদের ভিডিও/পোস্টের ডিজাইনটি পছন্দ করার জন্য ধন্যবাদ! 😍🌸\n\nএই কার্ডটির দামের হিসাব:\n💚 Affordable (সাশ্রয়ী): ৫০ পিস ২,৭৫০৳ (৫৫৳/পিস)\n✨ Premium (লাক্সারি): ৫০ পিস ৩,২৫০৳ (৬৫৳/পিস)\n\n(১-৪৯ পিস অল্প পরিমাণেও নিতে পারবেন!)\nআপনার কত পিস কার্ড লাগবে বলুন, সঠিক হিসাব জানিয়ে দিচ্ছি! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== ORDER FORM SUBMITTED BY CUSTOMER =====
            else if (isFormSubmission) {
              let qtyNote = '';
              if (quantity) {
                qtyNote = `\n📦 আপনার উল্লেখিত কার্ডের পরিমাণ: ${bngDigits(quantity)} পিস।`;
              } else {
                qtyNote = `\n💡 আপনার মোট কত পিস কার্ড লাগবে তা দয়া করে জানিয়ে দিন (যেমন: ১০০ পিস বা ১৫০ পিস)।`;
              }

              const reply = `আলহামদুলিল্লাহ! আপনার কার্ডের তথ্যগুলো আমরা সুন্দরভাবে পেয়েছি। 🌸${qtyNote}\n\nঅর্ডারটি কনফার্ম করে ডিজাইনের কাজ শুরু করার নিয়ম:\n১. ৩০% অ্যাডভান্স পেমেন্ট পাঠান:\n   📲 বিকাশ / নগদ / রকেট (পার্সোনাল): 01682588856\n২. পেমেন্ট সম্পন্ন করে লাস্ট ৪ ডিজিট বা স্ক্রিনশট এখানে পাঠিয়ে দিন।\n\nআমাদের অভিজ্ঞ ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে মেসেঞ্জার/হোয়াটসঅ্যাপে প্রুফ চেক করাবে। আপনার ফাইনাল অনুমোদনের পরই কেবল প্রিন্ট হবে! 😊`;

              await sendMessengerButtonBlock(senderId, reply, [
                { title: "পেমেন্ট করেছি", payload: "BTN_PAID" },
                { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
                { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== LOW QUANTITY PHRASE QUERY ("আমার অল্প লাগবে" / "olpo lagbe" / "kom lagbe") =====
            else if (!isFormSubmission && text.length < 60 && (
              /\b(olpo\s*lagbe|kom\s*lagbe|olpo\s*pisi|kom\s*pcs|kom\s*pisi)\b/i.test(txt) ||
              /(^|\s)(অল্প|কম)\s*(লাগবে|হবে|পিস|কার্ড|পরিমাণ|কিছু)/.test(txt) ||
              /^(আমার\s*)?(অল্প|কম)(\s*লাগবে|\s*হবে)?$/i.test(txt.trim())
            ) && !/(কমিউনিটি|কম্পিউটার|কম্পানি|কমপ্লিট|কমেন্ট|ইনকাম|স্বাগতম)/i.test(txt)) {
              const reply = `জি, আমাদের কাছে অল্প পরিমাণেও (১-৪৯ পিস) বিয়ের কার্ড অর্ডার করতে পারবেন! 😊\n\nঅল্প পরিমাণের প্রাইসিং রেট:\n• ১-৫ পিস: ১,০০০৳ (ফিক্সড মেকিং চার্জ সহ)\n• ৬-১০ পিস: ১,৫০০৳ (ফিক্সড চার্জ)\n• ১১-৪৯ পিস: পিস প্রতি ৭৫৳ (যেমন ২৫ পিস = ১,৮৭৫৳)\n\n💡 পরামর্শ: ৫০+ পিস নিলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\n\nআপনার কত পিস লাগবে বলুন! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "৫ পিস (১০০০৳)", payload: "QTY_5" },
                { title: "১০ পিস (১৫০০৳)", payload: "QTY_10" },
                { title: "২৫ পিস (১৮৭৫৳)", payload: "QTY_25" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== QUANTITY — Show price for CURRENT category or Min 50 Pcs Warning =====
            else if (quantity) {
              if (quantity < 50) {
                const reply = getLowQtyPrice(quantity);
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  { title: "৫০ পিস রেট", payload: "QTY_50" },
                  { title: "দাম জানুন", payload: "BTN_PRICE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
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
            }
            // ===== AFFORDABLE COLLECTION =====
            else if (payload === 'BTN_AFFORDABLE' || payload === 'MORE_AFFORDABLE' || payload.startsWith('MORE_AFFORDABLE_') || txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল') || txt.includes('সাশ্রয়ী')) {
              let offset = 0;
              if (payload.startsWith('MORE_AFFORDABLE_')) {
                offset = parseInt(payload.replace('MORE_AFFORDABLE_', ''), 10) || 0;
              }
              await sendSequentialGallery(senderId, 'affordable', offset);
            }
            // ===== PREMIUM COLLECTION =====
            else if (payload === 'BTN_PREMIUM' || payload === 'MORE_PREMIUM' || payload.startsWith('MORE_PREMIUM_') || txt.includes('premium') || txt.includes('প্রিমিয়াম') || txt.includes('লাক্সারি')) {
              let offset = 0;
              if (payload.startsWith('MORE_PREMIUM_')) {
                offset = parseInt(payload.replace('MORE_PREMIUM_', ''), 10) || 0;
              }
              await sendSequentialGallery(senderId, 'premium', offset);
            }
            // ===== PRICE — Context-aware or complete price table (NO LOOPS!) =====
            else if (payload === 'BTN_PRICE' || txt.match(/price|দাম|কত|কতো|মূল্য|rate|koto|cost|dam|daam|eita koto/i)) {
              const currentCat = getCurrentCategory(senderId);
              
              if (currentCat) {
                const priceTable = getFullPriceTable(currentCat);
                const altCat = currentCat === 'premium' ? 'affordable' : 'premium';
                const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';
                const reply = `${priceTable}\n\n💡 (${altName} কালেকশনের দামও দেখতে পারেন)\nকত পিস লাগবে বলুন! 😊`;
                
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                  { title: "কার্ড দেখুন", payload: currentCat === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" },
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // Show BOTH categories clearly — NO AMBIGUITY, ZERO LOOPS!
                const reply = `আমাদের বিয়ের কার্ডের দামের তালিকা: 🌸\n\n💚 সাশ্রয়ী (Affordable):\n• ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)\n• ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)\n• ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)\n\n✨ প্রিমিয়াম (Premium):\n• ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)\n• ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)\n• ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস)\n\n(১-৪৯ পিস অল্প পরিমাণেও নিতে পারবেন!)\nআপনার কত পিস লাগবে বলুন? 😊`;
                
                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                  { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" }
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
                { title: "✨ Premium রেট", payload: "BTN_PREMIUM_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            else if (payload === 'BTN_PREMIUM_PRICE') {
              setCurrentCategory(senderId, 'premium');
              const reply = getFullPriceTable('premium') + "\n\nকত পিস লাগবে বলুন! 😊";
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "💚 Affordable রেট", payload: "BTN_AFFORDABLE_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== ORDER =====
            else if (payload === 'BTN_ORDER' || txt.match(/অর্ডার|order|বুকিং|booking|কনফার্ম/)) {
              await sendMessengerText(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);

              const followUp = "কার্ডের তথ্য পূরণ করতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন! 👇";
              await sendMessengerButtonBlock(senderId, followUp, [
                { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
                { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', followUp);
            }
            // ===== BOTH FORMS / ORDER FORM & INFORMATION REQUEST =====
            else if (payload === 'BTN_BOTH_FORMS' || (!isFormSubmission && (
              txt.match(/bangla\s*(and|&|\+|,|o|\s+)\s*english\s*form/i) ||
              txt.match(/english\s*(and|&|\+|,|o|\s+)\s*bangla\s*form/i) ||
              txt.match(/বাংলা\s*(এবং|ও|আর|\+|,)\s*(ইংরেজি|ইংলিশ)\s*(ফর্ম|ফরম)/i) ||
              txt.match(/(ইংরেজি|ইংলিশ)\s*(এবং|ও|আর|\+|,)\s*বাংলা\s*(ফর্ম|ফরম)/i) ||
              txt.match(/দুটো\s*ফর্ম|দুইটা\s*ফর্ম|উভয়\s*ফর্ম|both\s*forms?/i)
            ))) {
              // Send Bangla Form first, then English Form, followed by options
              await sendMessengerText(senderId, BANGLA_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', BANGLA_ORDER_FORM_TEXT);
              await delay(300);

              await sendMessengerText(senderId, ENGLISH_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', ENGLISH_ORDER_FORM_TEXT);
              await delay(300);

              const bothTipMsg = "উপরে বাংলা ও ইংরেজি দুটি ফর্মই দেওয়া হলো। 🌸\nযেকোনো একটি ফর্ম কপি করে আপনার কার্ডের তথ্য ও পরিমাণ (কত পিস লাগবে) লিখে পাঠিয়ে দিন! 🥰";
              await sendMessengerButtonBlock(senderId, bothTipMsg, [
                { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
                { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', bothTipMsg);
            }
            // ===== BANGLA ORDER FORM =====
            else if (payload === 'BTN_FORM_BN' || (!isFormSubmission && (
              txt.match(/bangla\s*form|বাংলা\s*ফর্ম|বাংলা\s*ফরম/i) ||
              (txt.match(/বাংলা|bangla/i) && txt.match(/ফর্ম|form|ফরম/i)) ||
              txt === 'বাংলা' || txt === 'বাংলায়' || txt === 'bangla' || txt === 'banglay' ||
              txt.match(/^(bangla\s*hobe|বাংলা\s*হবে|বাংলাতে)$/i)
            ))) {
              await sendMessengerText(senderId, BANGLA_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', BANGLA_ORDER_FORM_TEXT);

              const tipMsg = "উপরের ফর্মটি কপি করে তথ্য ও কার্ডের পরিমাণ (কত পিস লাগবে) লিখে পাঠিয়ে দিন! 🥰";
              await sendMessengerButtonBlock(senderId, tipMsg, [
                { title: "🇬🇧 English Form", payload: "BTN_FORM_EN" },
                { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', tipMsg);
            }
            // ===== ENGLISH ORDER FORM =====
            else if (payload === 'BTN_FORM_EN' || (!isFormSubmission && (
              txt.match(/english\s*form|ইংরেজি\s*ফর্ম|ইংলিশ\s*ফর্ম|ইংরেজি\s*ফরম|ইংলিশ\s*ফরম/i) ||
              (txt.match(/english|ইংরেজি|ইংলিশ/i) && txt.match(/ফর্ম|form|ফরম/i)) ||
              txt === 'english' || txt === 'ইংরেজি' || txt === 'ইংলিশ' || txt === 'ইংরেজিতে' ||
              txt.match(/^(english\s*hobe|ইংরেজিতে\s*হবে|ইংলিশে\s*হবে)$/i)
            ))) {
              await sendMessengerText(senderId, ENGLISH_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', ENGLISH_ORDER_FORM_TEXT);

              const tipMsgEn = "Please copy the form above, fill in the details & quantity, and send it here! 🥰";
              await sendMessengerButtonBlock(senderId, tipMsgEn, [
                { title: "🇧🇩 বাংলা ফর্ম", payload: "BTN_FORM_BN" },
                { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', tipMsgEn);
            }
            // ===== GENERAL FORM OR INFORMATION CHECKLIST QUERY =====
            else if (payload === 'BTN_FORM' || (!isFormSubmission && (
              txt.match(/ফর্ম|form|ফরম/i) ||
              txt.match(/তথ্য|information|info|ডিটেইলস|details|কি\s*কি\s*লাগবে|কী\s*কী\s*লাগবে|কি\s*লাগবে|কী\s*লাগবে|কি\s*তথ্য|কী\s*তথ্য|তথ্য\s*লাগবে|info\s*lagbe|information\s*lagbe/i)
            ))) {
              const infoNotice = `📋 বিয়ের কার্ড তৈরিতে যেসব তথ্য প্রয়োজন হয়:\n\n১. 📦 কার্ডের পরিমাণ (কত পিস লাগবে)\n২. 🤵 বরের নাম, পিতা, মাতা ও ঠিকানা\n৩. 👰 কনের নাম, পিতা, মাতা ও ঠিকানা\n৪. 📅 অনুষ্ঠানসূচী (হলুদ, বিবাহ, বৌ-ভাত: তারিখ, সময় ও স্থান)\n৫. 💌 আমন্ত্রণে (ছোটদের নাম, যোগাযোগ নম্বর)\n৬. 🚚 কুরিয়ার ডেলিভারি ঠিকানা ও মোবাইল\n\nআপনার কার্ডটি কি বাংলায় করবেন নাকি ইংরেজিতে? নিচের বাটন থেকে ফর্ম সিলেক্ট করুন: 👇`;
              await sendMessengerButtonBlock(senderId, infoNotice, [
                { title: "🇧🇩 বাংলা ফর্ম", payload: "BTN_FORM_BN" },
                { title: "🇬🇧 English Form", payload: "BTN_FORM_EN" },
                { title: "উভয় ফর্ম দেখুন", payload: "BTN_BOTH_FORMS" }
              ]);
              appendMessage(senderId, 'bot', infoNotice);
            }
            else if (payload === 'BTN_POLICY' || txt.match(/পলিসি|policy|ডেলিভারি|delivery|কুরিয়ার/)) {
              await sendMessengerText(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);
            }
            // ===== DIRECT CARD CODE QUERY (e.g. AFF-012, PREM-005, AFF 12) =====
            else if (txt.match(/\b(aff|prem)[-_\s]*(\d{1,3})\b/i)) {
              const codeMatch = txt.match(/\b(aff|prem)[-_\s]*(\d{1,3})\b/i);
              const prefix = codeMatch[1].toLowerCase() === 'prem' ? 'PREM' : 'AFF';
              const num = String(parseInt(codeMatch[2], 10)).padStart(3, '0');
              const cardCode = prefix + '-' + num;
              const category = prefix === 'PREM' ? 'premium' : 'affordable';
              setCurrentCategory(senderId, category);

              const priceTable = getFullPriceTable(category);
              const emoji = category === 'premium' ? '✨' : '💚';
              const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';

                            const reply = `আমাদের ${emoji} ${catName} কালেকশনের কার্ড (${cardCode}):\n\n${priceTable}\n\nকত পিস লাগবে বলুন! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "দাম জানুন", payload: "BTN_PRICE" },
                { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== NIKAHNAMA QUERY =====
            else if (txt.match(/nikahnama|নিকাহনামা|নিকাহ নামা/i)) {
              const reply = `📜 নিকাহনামা তথ্য:\n\nনিকাহনামা সার্ভিস সম্পর্কে জানতে বা আলাদাভাবে নিকাহনামা প্রিন্ট করতে আমাদের হটলাইনে কল বা হোয়াটসঅ্যাপ করুন! 😊\n\n📞 হটলাইন: 01701016826 (বন্ধন হটলাইন)`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== CUSTOM DESIGN / PROOFING QUERY =====
            else if (txt.match(/custom|কাস্টম|ডিজাইন চেঞ্জ|ডিজাইনার|লেখা/i)) {
              const reply = `🎨 কাস্টম ডিজাইন সুবিধা:

অর্ডার কনফার্ম (৩০% অ্যাডভান্স) করার পর আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে হোয়াটসঅ্যাপ/মেসেঞ্জারে চেক করাবে।

আপনার পছন্দ ও ওকে হওয়ার পরই প্রিন্ট শুরু হবে! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== BARGAINING / DISCOUNT QUERY =====
            else if (txt.match(/discount|ডিসকাউন্ট|ছাড়|ছাড়|কম রাখা|কমান|কিছু কম|একটু কম|কম হবে|kom hobe|kom dhen|kom rakh/i)) {
              const reply = `আমাদের দামগুলো সেরা মেটেরিয়াল ও কোয়ালিটি নিশ্চিত করে পাইকারি রেটে নির্ধারিত। 😊\n\n💡 তবে আপনার জন্য পরামর্শ:\n২০০ পিস বা তার বেশি অর্ডার করলে পিস প্রতি দাম অনেক কমে আসবে (Affordable: ৩৫৳, Premium: ৪৫৳)\n\nআপনি কত পিস নিতে চাচ্ছেন বলুন, সেরা হিসাব করে দিচ্ছি! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "২০০ পিস অর্ডার", payload: "QTY_200" },
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== LOCATION / ADDRESS =====
            else if (payload === 'BTN_LOCATION' || txt.match(/location|লোকেশন|ঠিকানা|address|kothay|কোথায়|কোথায়|office|অফিস|shop|দোকান|shoroom|শো-রুম|showroom|কারখানা|karkhana/i)) {
              const reply = `📍 আমাদের অফিস ও ঠিকানার তথ্য:\n\n🏢 অফিস: ২/১-২, ভূমি অফিস লেন, মানিকগঞ্জ, ঢাকা।\n🏭 কারখানা: ফকিরাপুল, বাবুবাজার, বঙ্গবাজার (ঢাকা)।\n\n🛒 অর্ডার প্রক্রিয়া:\nঅনলাইনে অথবা মানিকগঞ্জ অফিসে সরাসরি এসে অর্ডার করতে পারবেন।\n\n📦 প্রোডাক্ট ডেলিভারি/সংগ্রহ:\n• কুরিয়ারের মাধ্যমে (সারাদেশে হোম ডেলিভারি)\n• মানিকগঞ্জ অফিসে সরাসরি\n• অথবা কার্ডের ধরন অনুযায়ী ঢাকার নির্দিষ্ট কারখানা থেকেও সংগ্রহ করতে পারবেন!\n\n🗺️ গুগল ম্যাপ লিংক:\nhttps://maps.app.goo.gl/CnyRST5KxHjWDAtd9\n\nকার্ড দেখতে বা অর্ডার করতে নিচের বাটনে চাপুন! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== PAYMENT LAST DIGITS / CONFIRMATION SUBMITTED BY USER =====
            else if (isPaymentInfoSubmission) {
              const digitsMatch = normalizedTxt.match(/\b\d{3,6}\b/);
              const digitsText = digitsMatch ? ` (${bngDigits(digitsMatch[0])})` : '';
              const reply = `আলহামদুলিল্লাহ! আপনার পেমেন্টের লাস্ট ডিজিট${digitsText} আমরা পেয়েছি। 🌸\n\nআমাদের অ্যাকাউন্টস টিম পেমেন্টটি যাচাই করে দ্রুত অর্ডারটি কনফার্ম করবে এবং আমাদের অভিজ্ঞ ডিজাইনার আপনার কার্ডের ডিজাইন তৈরি করে আপনাকে প্রুফ চেক করাবে।\n\nআপনার চূড়ান্ত অনুমোদনের পরই প্রিন্ট করা হবে! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
                { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" },
                { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== PAYMENT CONFIRMATION BUTTON / QUERY =====
            else if (payload === 'BTN_PAID' || txt.match(/^(পেমেন্ট করেছি|টাকা পাঠিয়েছি|টাকা পাঠাইছি|paid|advance paid)$/i)) {
              const reply = `অনেক ধন্যবাদ! আপনার পেমেন্টের স্ক্রিনশট বা বিকাশ/নগদ লাস্ট ৪ ডিজিট এখানে লিখে দিন। 😊\nআমাদের টিম দ্রুত যাচাই করে আপনার অর্ডারটি নিশ্চিত করবে এবং ডিজাইনার কাজ শুরু করবে! 🌸`;
              await sendMessengerText(senderId, reply);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== HOTLINE BUTTON =====
            else if (payload === 'BTN_HOTLINE') {
              const reply = `📞 আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন:\n01701016826 (বন্ধন হটলাইন)\n\nআমরা সার্বক্ষণিক সহায়তায় আছি! 😊`;
              await sendMessengerText(senderId, reply);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== PAYMENT / BKASH NUMBER =====
            else if (txt.match(/bkash|bKash|বিকাশ|nagad|নগদ|rocket|রকেট|payment|পেমেন্ট|এডভান্স|advance/i)) {
              const reply = `💳 পেমেন্ট তথ্য:\n\nঅর্ডার কনফার্ম করতে ৩০% অ্যাডভান্স পেমেন্ট করতে হবে।\n\n📲 পেমেন্ট নম্বর (পার্সোনাল):\n01682588856 (বিকাশ / নগদ / রকেট)\n\nপেমেন্ট করার পর এখানে স্ক্রিনশট বা ট্রানজেকশন আইডি পাঠান! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
                { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== CONTACT / PHONE / HOTLINE =====
            else if (txt.match(/phone|mobile|ফোন|মোবাইল|contact|যোগাযোগ|hotline|whatsapp|হোয়াটসঅ্যাপ|কথা বলব|call/i)) {
              const reply = `📞 আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন:\n01701016826 (বন্ধন হটলাইন)\n\nআপনার যেকোনো প্রশ্নের জন্য আমরা রেডি আছি! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== ACKNOWLEDGEMENTS ("ok", "okay", "ঠিক আছে", "জি", "আচ্ছা", "হুম", "ধন্যবাদ") =====
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
            // ===== DEFAULT — Welcome or fallback =====
            else {
              const isGreeting = txt.match(/^(hi|hello|hey|হাই|হ্যালো|আসসালামু|assalamu|get started|start|শুরু)$/i);

              if (isGreeting || isButtonClick) {
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
