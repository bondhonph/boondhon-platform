import { appendMessage, getConversation, setHumanTakeover, setOrderStatus, getUnseenImages, getUnseenImagesWithStats, setCurrentCategory, getCurrentCategory, recordSentCardMessage, getSentCardByMid, setUserAwaitingPayment, isUserAwaitingPayment } from '../../lib/chat-store';
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

const ORDER_RULES_MSG = `📋 বন্ধন-এ অর্ডার করার সহজ ৩টি ধাপ:

১️⃣ কার্ডের তথ্য পূরণ:
প্রথমে নিচের 'ফর্ম পূরণ' বাটনে চাপ দিয়ে বর-কনের নাম, পিতা-মাতার নাম, অনুষ্ঠানসূচী (হলুদ, বিবাহ, বৌ-ভাত) ইত্যাদি তথ্য লিখে আমাদের পাঠিয়ে দিন।

২️⃣ অ্যাডভান্স ও ডিজাইন প্রুফ:
তথ্য পাওয়ার পর অর্ডার কনফার্ম করতে ৩০% অ্যাডভান্স করতে হবে। অ্যাডভান্স পাওয়ার সাথে সাথে আমাদের অভিজ্ঞ ডিজাইনার আপনার কার্ড ডিজাইন করে আপনাকে মেসেঞ্জার/হোয়াটসঅ্যাপে প্রুফ চেক করাবে।

৩️⃣ চূড়ান্ত অনুমোদন ও ডেলিভারি:
ডিজাইন আপনার ১০০% পছন্দ ও ওকে হওয়ার পরই প্রিন্ট শুরু হবে এবং জেলা শহরে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি পৌঁছে যাবে! 🚚`;

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

// Evaluate customer bargaining offers and 50/100 tk discount requests (Owner authorized)
function evaluateBargain(rawText, category = 'affordable') {
  if (!rawText) return null;
  const norm = normalizeBengaliDigits(rawText).toLowerCase().replace(/,/g, '');
  
  const getBasePrice = (q, cat) => {
    if (cat === 'premium') {
      if (q >= 200) return q * 45;
      if (q >= 100) return q * 55;
      if (q >= 50) return 3250;
      return 1500;
    } else {
      if (q >= 200) return q * 35;
      if (q >= 100) return q * 45;
      if (q >= 50) return 2750;
      return 1000;
    }
  };

  const isBargainIntent = /(?:raikhen|rakhen|rakhben|rakhle|রাখেন|রাইখেন|রাখবেন|হবে|hobe|diben|দিবেন|দেন|den|কম|kom|ছাড়|ছাড়|char|chaar|discount|কমান|koman|nibo|নেব|নেবো|নিবো|নেওয়ার|নেয়ার)/i.test(norm);
  if (!isBargainIntent) return null;

  const numbers = (norm.match(/\d+/g) || []).map(Number);
  if (numbers.length === 0) return null;

  // Extract quantity
  let qty = null;
  const qtyMatch = norm.match(/(\d{2,4})\s*(?:pcs?|piece|পিস|পিসি|পিচ|টি|টা)?/i);
  if (qtyMatch) {
    const qCandidate = parseInt(qtyMatch[1], 10);
    if ([50, 100, 150, 200, 250, 300, 400, 500].includes(qCandidate)) {
      qty = qCandidate;
    }
  }

  // Look for offered price (typically >= 1000 and != qty)
  let offeredPrice = null;
  for (const n of numbers) {
    if (n >= 1000 && n <= 50000 && n !== qty) {
      offeredPrice = n;
      break;
    }
  }

  // Check direct 50/100 tk discount request
  const direct50or100Match = norm.match(/(?:50|100)\s*(?:টাকা|tk|taka)?\s*(?:কম|kom|ছাড়|ছাড়|char|chaar|discount|কমান|koman|কমিয়ে)/i) ||
                             norm.match(/(?:কম|kom|ছাড়|ছাড়|char|chaar|discount|কমান|koman)\s*(?:হবে\s*)?(?:50|100)/i);
  let directDiscount = null;
  if (direct50or100Match) {
    directDiscount = direct50or100Match[0].includes('100') ? 100 : 50;
  }

  if (!qty) qty = 50; // Default to 50 pcs

  const basePrice = getBasePrice(qty, category);

  let finalAcceptedPrice = null;
  let discountAmount = 0;

  if (offeredPrice) {
    const diff = basePrice - offeredPrice;
    if (diff > 0 && diff <= 150) { // Allowed 50 to 150 tk concession
      finalAcceptedPrice = offeredPrice;
      discountAmount = diff;
    } else if (diff === 0) {
      finalAcceptedPrice = basePrice;
      discountAmount = 0;
    }
  } else if (directDiscount) {
    discountAmount = directDiscount;
    finalAcceptedPrice = basePrice - discountAmount;
  }

  if (finalAcceptedPrice) {
    const advance30 = Math.round((finalAcceptedPrice * 0.3) / 10) * 10;
    return {
      accepted: true,
      qty,
      category,
      basePrice,
      finalPrice: finalAcceptedPrice,
      discountAmount,
      advance30
    };
  }

  return null;
}

// Gemini Vision Analysis for Customer-Uploaded Images
async function analyzeCardImage({ photoUrl, base64Data, mimeType, customerCaption = '', topCandidate = null }) {
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured in environment variables');
    return null;
  }
  try {
    let imgBase64 = base64Data;
    let imgMime = mimeType || 'image/jpeg';

    if (!imgBase64 && photoUrl) {
      const imgRes = await fetch(photoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!imgRes.ok) {
        console.error('Failed to fetch photoUrl from Messenger:', imgRes.status);
        return null;
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      imgBase64 = Buffer.from(arrayBuffer).toString('base64');
      imgMime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
    }

    if (!imgBase64) return null;

    const captionContext = customerCaption && customerCaption.trim().length > 0
      ? `কাস্টমার ছবির সাথে এই টেক্সট/ক্যাপশন লিখেছে: "${customerCaption.trim()}"`
      : `কাস্টমার ছবির সাথে কোনো অতিরিক্ত টেক্সট লেখেনি।`;

    const candidateHint = topCandidate && topCandidate.code
      ? `ড্রাইভ ক্যাটালগের সাথে সম্ভাব্য মিল: ${topCandidate.code} (ক্যাটাগরি: ${topCandidate.category}, সাদৃশ্য: ${(topCandidate.similarity * 100).toFixed(0)}%)`
      : `কোনো নির্দিষ্ট ড্রাইভ কার্ড মেলেনি।`;

    const prompt = `তুমি "বন্ধন প্রিন্টিং হাউস" (BOONDHON Printing House, Manikganj & Dhaka)-এর একজন অত্যন্ত অভিজ্ঞ ও অমায়িক সিনিয়র সেলস কনসালট্যান্ট "অনন্যা"।
কাস্টমার মেসেঞ্জারে একটি ছবি পাঠিয়েছে।
${captionContext}
${candidateHint}

আমাদের বিয়ের কার্ডের দুটি প্রধান ক্যাটাগরি ও প্রাইসিং:
১. 💚 সাশ্রয়ী (Affordable) — ছোট সাইজ:
   • ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)
   • ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)
   • ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)
২. ✨ প্রিমিয়াম (Premium / লাক্সারি) — বড় সাইজ:
   • ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)
   • ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)
   • ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস)
৩. অল্প পরিমাণ (১-৪৯ পিস): ১-৫ পিস ১,০০০৳, ৬-১০ পিস ১,৫০০৳, ১১-৪৯ পিস ৭৫৳/পিস।

তোমার কাজ:
১. ছবিটি মনোযোগ দিয়ে দেখো:
   - এটি কি কোনো বিয়ের কার্ড? (লেজার কাট, খিলান, ফ্লোরাল, আর্ট কার্ড, বক্স কার্ড, গেটফোল্ড ইত্যাদি)
   - নাকি বিকাশ/নগদের টাকা পাঠানোর স্ক্রিনশট / রিসিট?
   - নাকি সম্পূর্ণ অপ্রাসঙ্গিক কোনো ছবি?

২. যদি বিয়ের কার্ড হয়:
   - ড্রাইভ ক্যাটালগ বা কার্ডের ধরণ দেখে প্রথমে নির্দিষ্ট ক্যাটাগরি নিশ্চিত করো (Affordable নাকি Premium)।
     (সাধারণ সাইজ/আর্ট কার্ড হলে Affordable, বড় লাক্সারি/খিলান/ফয়েল/বক্স কার্ড হলে Premium)।
   - প্রথমে কাস্টমারকে কার্ডের প্রশংসা করে ক্যাটাগরি স্পষ্ট করে জানাও (যেমন: "এটি আমাদের সাশ্রয়ী/প্রিমিয়াম কালেকশনের কার্ড...")।
   - তারপর সরাসরি সেই ক্যাটাগরির সঠিক দামের তালিকা (৫০, ১০০, ২০০ পিসের রেট) জানিয়ে দাও।
   - যদি কাস্টমার কোনো নির্দিষ্ট পিস (যেমন ১০০ পিস) জানতে চায়, সরাসরি সেই পিসের হিসাব বলো।
   - কোনো বিভ্রান্তি রাখবে না এবং রোবোটিক উত্তর দেবে না।

৩. যদি পেমেন্ট স্ক্রিনশট হয়:
   - আন্তরিক ধন্যবাদ জানিয়ে বিকাশ/নগদের শেষ ৪টি ডিজিট লিখে দিতে বলো (আমাদের অ্যাকাউন্টস টিম চেক করে দ্রুত নিশ্চিত করবে)।

৪. যদি অপ্রাসঙ্গিক ছবি হয়:
   - ভদ্রভাবে ধন্যবাদ জানিয়ে জানতে চাও তিনি কি বিয়ের কার্ড দেখতে চাইছেন কিনা।

STRICT JSON format:
{
  "type": "WEDDING_CARD" | "PAYMENT_RECEIPT" | "OTHER",
  "detectedCategory": "affordable" | "premium",
  "reply": "বাংলায় তোমার স্পষ্ট ও আন্তরিক সেলস উত্তর (ক্যাটাগরি ও দাম সহ)"
}`;

    const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let textOut = '';
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
                    mime_type: imgMime,
                    data: imgBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 400,
            thinkingConfig: {
              thinkingBudget: 0
            },
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

    if (textOut) {
      const jsonMatch = textOut.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: parsed.type || 'WEDDING_CARD',
          detectedCategory: (parsed.detectedCategory || '').toLowerCase().includes('prem') ? 'premium' : 'affordable',
          reply: parsed.reply || ''
        };
      }
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
  
  const systemPrompt = `তুমি "বন্ধন প্রিন্টিং হাউস" (BOONDHON Printing House)-এর একজন অত্যন্ত অভিজ্ঞ, অমায়িক ও চটপটে সিনিয়র সেলস ও কাস্টমার রিলেশনশিপ এক্সপার্ট। তোমার নাম "অনন্যা"।

তোমার দায়িত্ব: কাস্টমার যখনই সাধারণ কোনো বাটন বা কিওয়ার্ড ছাড়া নিজের ভাষায় যেকোনো কিছু জানতে চাইবে, দ্বিধাদ্বন্দ্বে থাকবে বা অপ্রাসঙ্গিক/অস্পষ্ট কথা বলবে, তখন তুমি একজন রক্ত-মাংসের দক্ষ সেলস প্রফেশনালের মতো আন্তরিক ও সাবলীল ভঙ্গিতে কথা বলে তাদের মনের কথা বুঝে অর্ডার পর্যন্ত এগিয়ে নেবে।

🧠 তোমার চিন্তাভাবনা ও কথা বলার ধরন (Expert Sales Psychology):
১. মানুষের মতো স্বাভাবিক প্রতিক্রিয়া ও ইমোশন:
   - কাস্টমারের মেসেজের ভেতরের অনুভূতি, দ্বিধা, ব্যস্ততা বা আনন্দ বুঝে সেই অনুযায়ী কথা শুরু করো। কখনোই রোবোটিক, মুখস্থ বা স্ক্রিপ্ট-বাঁধা উত্তর দেবে না।
   - বিয়ে একটি আনন্দের উপলক্ষ—প্রাসঙ্গিক হলে আন্তরিক শুভেচ্ছা ও শুভকামনা জানাও।
২. কাস্টমার দ্বিধাদ্বন্দ্বে (Confused) বা সিদ্ধান্তহীনতায় থাকলে:
   - সেলসম্যান যেমন বন্ধুসুলভ পরামর্শ দিয়ে পথ সহজ করে দেয়, ঠিক সেভাবে তাকে সাহায্য করো। যেমন: "বাজেট কি একটু সাশ্রয়ীর মধ্যে খুঁজছেন নাকি প্রিমিয়াম লাক্সারি লুক পছন্দ? কত পিস লাগতে পারে জানালে আমি সেরা অপশনটা সাজেস্ট করতে পারি!"
৩. অস্পষ্ট, সংক্ষিপ্ত বা পরোক্ষ (Indirect) কথা বললে — নো ডেড-এন্ড (NO Dead-ends):
   - কখনোই "আমি বুঝতে পারিনি", "আমি এআই বট" বা "আপনার কথা স্পষ্ট নয়" জাতীয় কোনো নিষ্প্রাণ উত্তর দেবে না।
   - একজন দক্ষ সেলসম্যান যেভাবে বুদ্ধি খাটিয়ে কাস্টমারের উদ্দেশ্য আন্দাজ করে প্রশ্ন করে বা অপশন এগিয়ে দেয়, সেভাবে কথা এগিয়ে নাও।
৪. তথ্যের স্বাভাবিক উপস্থাপন (Natural Product Blend):
   - প্রাইস, সাইজ, ডেলিভারি বা পেমেন্টের তথ্যগুলো জোর করে পুরো লিস্ট ধরিয়ে না দিয়ে, কাস্টমার যেটুকু জানতে চেয়েছে সেটার সাথে মিলিয়ে প্রাসঙ্গিকভাবে ১-৩ লাইনে বলো।
   - উত্তর সবসময় সংক্ষিপ্ত ও প্রমিত বাংলায় (১-৩ লাইন) রাখবে, যাতে কাস্টমার পড়তে স্বাচ্ছন্দ্যবোধ করে।
৫. কার্ডের পরিমাণের তারতম্যে দামের যুক্তি (Sales Logic for Quantity):
   - কাস্টমার যদি প্রশ্ন করে "১টা কার্ডের কমবেশিতে এত পার্থক্য কেন?", "৪৯ আর ৫০ এ এত ব্যবধান কেন?", বা "কম নিলে বেশি রেট কেন?":
   - কাস্টমারকে সহজ ও মিষ্টি করে বুঝিয়ে বলো: প্রিন্টিং কারখানায় প্রতিটি কার্ডের জন্য কাটিং ডাইস, ফয়েল ব্লক ও স্ক্রিন প্রিন্টিংয়ের প্লেট তৈরির একটি নির্দিষ্ট ফিক্সড সেটআপ খরচ থাকে—যা ১টি কার্ড হলেও করতে হয়, ১০০টি বানালেও একই সেটআপ লাগে। তাই ৫০ বা ১০০ পিস বানালে সেই সেটআপ খরচটি ভাগ হয়ে প্রতি পিসের খরচ অনেক কমে যায় (৫৫৳ বা ৪৫৳)। কিন্তু ১-৪৯ পিসের ক্ষেত্রে ফিক্সড খরচের কারণে প্রতি পিস ৭৫৳ বা ফিক্সড মেকিং চার্জ পড়ে। তাই ৫০ পিস নেওয়া অনেক বেশি লাভজনক ও সাশ্রয়ী!
৬. 💰 দাম নিয়ে আপত্তি ও হ্যান্ডলিং (Price Objection Handling):
   যখন কাস্টমার দাম নিয়ে আপত্তি করবে, নিচের কৌশলটি অনুসরণ করবে (ফ্ল্যাট ডিসকাউন্ট কখনো নিজে থেকে দেবে না):
   • ১. সাধারণ অভিযোগ — "দাম বেশি" / "price beshi" (প্রতিযোগীর নির্দিষ্ট রেফারেন্স ছাড়া):
     - সহানুভূতিশীল (empathetic) হয়ে বাজেট জিজ্ঞেস করো এবং ম্যাটেরিয়াল ও প্রিন্টিং কোয়ালিটির ভ্যালু তুলে ধরো।
     - যেমন: "আপনার budget বুঝতে পারছি। আমাদের দামে material ও printing quality-তে compromise নাই — laser cut, foil সব premium গ্রেডের। আপনি কত পিস আর কী budget ভাবছেন বললে, best option বের করে দিচ্ছি।"
     - ফ্ল্যাট ডিসকাউন্ট অফার না করে কাস্টমারের আসল budget ও quantity বের করার দিকে আলোচনা এগিয়ে নাও।
   • ২. অন্য পেজের সাথে তুলনা — "অন্য জায়গায় কম দামে পাচ্ছি" / "onno page e kom":
     - সরাসরি দামের লড়াই বা বিতর্কে না গিয়ে "হিডেন কস্ট" (hidden cost) এর দিকটি সুন্দর করে তুলে ধরো।
     - বিনয়ের সাথে জিজ্ঞেস করো—ওই দামে প্রিন্টিং চার্জ বা প্লেট খরচ আলাদা কিনা?
     - বুঝিয়ে বলো যে BOONDHON-এর দামে কার্ডের নিখুঁত প্রিন্টিং + ডেলিভারি সাপোর্ট + রিপ্রিন্ট গ্যারান্টি (কোনো ভুল হলে নিজ দায়িত্বে সমাধান) সব অন্তর্ভুক্ত থাকে, তাই সামগ্রিক হিসাব তুলনা করলে আমাদের সার্ভিস সমান বা আরও ভালো ও নিরাপদ পড়বে।
   • ৩. সরাসরি ছাড় বা ডিসকাউন্ট চাইলে ("কিছু ছাড় দেন" / "discount হবে?"):
     - আন্তরিকতার সাথে বলো যে প্রিমিয়াম মেটেরিয়াল ও মেকিং কস্ট ফিক্সড থাকায় ফ্ল্যাট ডিসকাউন্ট সম্ভব না (দুঃখ প্রকাশসহ)।
     - কিন্তু বেশি পরিমাণ (যেমন: ১০০ পিস বা ২০০+ পিস) নিলে যে প্রতি পিসের রেট অনেক কমে যায় (যেমন: ৫০ পিসে ৫৫৳/৬৫৳ থেকে কমে ১০০ পিসে ৪৫৳/৫৫৳ এবং ২০০ পিসে ৩৫৳/৪৫৳ ও ফ্রি নিকাহনামা), সেদিকে আলোচনা শিফট করো। ফ্ল্যাট পার্সেন্টেজ ডিসকাউন্ট কখনো নিজে থেকে অফার করবে না।
    • ⚠️ অত্যন্ত জরুরি নিয়ম (Strict Pricing & Discount Rule):
      - ওনারের বিশেষ নির্দেশনা: কাস্টমার যদি অর্ডার করতে চায় এবং ৫০ বা ১০০ টাকা কম রাখতে বলে (যেমন: "৫০ পিস নিবো, ২৭০০ রাইখেন", "১০০ টাকা কম রাখেন", "৫০ টাকা ছাড় দেন"): তুমি সানন্দে কাস্টমারের সম্মানে সেই ৫০/১০০৳ ছাড় মেনে নেবে এবং বর-কনের নাম ও অনুষ্ঠানসূচীর তথ্য/ফর্ম পূরণ করার অনুরোধ জানাবে (তথ্য পাওয়ার পর অ্যাডভান্স নেওয়া হবে)।
      - কিন্তু কাস্টমার যদি কোনো সুনির্দিষ্ট প্রস্তাব ছাড়া অনির্দিষ্ট বা খুব বড় ছাড় (যেমন ২০০-১০০০ টাকা) চায়, তবে নিজে থেকে বড় ছাড় দেবে না, কোয়ালিটি ও বেশি কোয়ান্টিটি নেওয়ার সাশ্রয়ী রেট বোঝাবে।
৭. কঠোর আউটপুট নিয়ম (STRICT Output Rules):
    - সবসময় খাঁটি, সাবলীল ও আন্তরিক বাংলায় (১-৩ লাইন) উত্তর দেবে।
    - কোনো অবস্থাতেই ইংরেজি শিরোনাম, সিস্টেম নির্দেশনা, চিন্তা ভাবনা বা মেটা-প্ল্যানিং টেক্সট (যেমন: Provide a Simple Sales Logic, Explain why, Thought, Here is the response ইত্যাদি) উত্তরে লিখবে না। শুধুমাত্র কাস্টমারকে সরাসরি পাঠানোর চূড়ান্ত মেসেজটি লিখবে।

🏢 বন্ধন প্রিন্টিং হাউসের ব্যবসায়িক তথ্য ও জ্ঞানভাণ্ডার:
• অবস্থান: মানিকগঞ্জ অফিস (২/১-২, ভূমি অফিস লেন, মানিকগঞ্জ, ঢাকা) এবং ঢাকার কারখানা (ফকিরাপুল, বাবুবাজার, বঙ্গবাজার)।
• প্রোডাক্ট ক্যাটালগ:
  - দুটো ক্যাটাগরির ডিজাইন ও মেটেরিয়াল হুবহু এক (লেজার কাট, খিলান নকশা, ফয়েল, রিবন ইত্যাদি), কেবল সাইজের পার্থক্য:
  1. 💚 Affordable (সাশ্রয়ী) — ছোট সাইজ: ৫০ পিস ২,৭৫০৳ (৫৫৳/পিস), ১০০ পিস ৪,৫০০৳ (৪৫৳/পিস), ২০০ পিস ৭,০০০৳ (৩৫৳/পিস)।
  2. ✨ Premium (লাক্সারি) — বড় সাইজ: ৫০ পিস ৩,২৫০৳ (৬৫৳/পিস), ১০০ পিস ৫,৫০০৳ (৫৫৳/পিস), ২০০ পিস ৯,০০০৳ (৪৫৳/পিস)।
  3. 🔹 অল্প পরিমাণ (১-৪৯ পিস): ১-৫ পিস ১,০০০৳, ৬-১০ পিস ১,৫০০৳ (ফিক্সড মেকিং চার্জ সহ), ১১-৪৯ পিস ৭৫৳/পিস।
• অর্ডার ও ডেলিভারি প্রক্রিয়া (সহজ ৩টি ধাপ):
  - ধাপ ১: প্রথমে কাস্টমার অর্ডার ফর্ম পূরণ করে বর-কনের নাম, অনুষ্ঠানসূচী ইত্যাদি তথ্য লিখে পাঠাবে।
  - ধাপ ২: তথ্য পাওয়ার পর অর্ডার কনফার্ম করতে ৩০% অগ্রিম (বিকাশ/নগদ/রকেট: 01682588856) নেওয়া হবে। অগ্রিমের পর আমাদের ডিজাইনার কাস্টমারের তথ্য দিয়ে ডিজাইন তৈরি করে মেসেঞ্জার/হোয়াটসঅ্যাপে প্রুফ চেক করাবে।
  - ধাপ ৩: কাস্টমার ডিজাইন 'ওকে' করার পরই কেবল প্রিন্ট হবে। সারা দেশে জেলা শহরে ক্যাশ অন ডেলিভারি (৫-৭ কর্মদিবস)।
  - ⚠️ নিয়ম: শুরুতেই হুট করে পেমেন্ট নম্বর ধরিয়ে দেবে না। আগে অর্ডার সিস্টেম ও ফর্ম পূরণ করতে বলবে, ফর্মের তথ্য পাওয়ার পর ৩০% অ্যাডভান্স চাইবে।
• হটলাইন: 01701016826 (বন্ধন হটলাইন)।

🎯 তোমার লক্ষ্য: কাস্টমারকে আপন করে নেওয়া, তাদের দ্বিধা দূর করা এবং হাসিমুখে অর্ডারের দিকে এগিয়ে নিয়ে যাওয়া।`;

  try {
    // Build conversation context (last 10 messages)
    const recentMsgs = (conversationHistory || []).slice(-10).map(msg => ({
      role: msg.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: msg.text || '(media)' }]
    }));

    // Add current message
    recentMsgs.push({ role: 'user', parts: [{ text: customerMessage }] });

    const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
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
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 600,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const candidate = data?.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        
        // Filter out any parts marked as thought
        const textParts = parts.filter(p => !p.thought && p.text && typeof p.text === 'string');
        let reply = (textParts.length > 0 ? textParts.map(p => p.text).join('\n') : (parts[0]?.text || '')).trim();

        // Sanitize reply: strip any leaked thought tags, reasoning prefixes, or meta-labels
        if (reply) {
          reply = reply
            .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
            .replace(/^\*?(?:Provide a Simple Sales Logic|Explain why|Thought|Here is the response|Response):?\*?\s*/gi, '')
            .replace(/\*(?:Provide a Simple Sales Logic|Explain why|Thought|Response)\*?:?\s*/gi, '')
            .trim();
        }

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

// In-memory cache for sent card lookups by Facebook message ID (mid)
const sentCardsCache = new Map();
function cacheSentCard(mid, cardId, category, url) {
  if (!mid) return;
  sentCardsCache.set(mid, { cardId, category, url, timestamp: Date.now() });
  if (sentCardsCache.size > 1000) {
    const firstKey = sentCardsCache.keys().next().value;
    sentCardsCache.delete(firstKey);
  }
}
function getCachedSentCard(mid) {
  if (!mid) return null;
  return sentCardsCache.get(mid) || null;
}
function getSentCardInfo(phone, mid) {
  if (!mid) return null;
  const mem = getCachedSentCard(mid);
  if (mem) return mem;
  return getSentCardByMid(phone, mid);
}

// In-memory set for tracking users who clicked "পেমেন্ট করেছি" and are about to send last 4 digits
const awaitingPaymentSet = new Set();
function setCustomerAwaitingPayment(senderId, status) {
  if (status) {
    awaitingPaymentSet.add(senderId);
  } else {
    awaitingPaymentSet.delete(senderId);
  }
  setUserAwaitingPayment(senderId, status);
}
function checkCustomerAwaitingPayment(senderId) {
  if (awaitingPaymentSet.has(senderId)) return true;
  return isUserAwaitingPayment(senderId);
}

// Send Direct Full-Size Image Attachment with Message ID Tracking
async function sendMessengerImage(recipientId, id, category = null) {
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
    const data = await res.json();
    if (res.ok && data?.message_id) {
      cacheSentCard(data.message_id, id, category, primaryUrl);
      recordSentCardMessage(recipientId, data.message_id, id, category, primaryUrl);
    } else {
      console.error('Messenger Image Direct Send Primary Error:', JSON.stringify(data));

      const fbRes = await fetch(url, {
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
      const fbData = await fbRes.json();
      if (fbRes.ok && fbData?.message_id) {
        cacheSentCard(fbData.message_id, id, category, fallbackUrl);
        recordSentCardMessage(recipientId, fbData.message_id, id, category, fallbackUrl);
      }
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
  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  const typeName = type === 'premium' ? '✨ প্রিমিয়াম' : '💚 সাশ্রয়ী';
  const altTypeName = type === 'premium' ? '💚 সাশ্রয়ী (Affordable)' : '✨ প্রিমিয়াম (Premium)';
  const switchBtn = type === 'premium'
    ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
    : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };

  // If customer has ALREADY seen all cards in this category, DO NOT LOOP!
  if (offset >= totalCount) {
    const finishMsg = `আমাদের মোট ${bngDigits(totalCount)}টি ${typeName} ডিজাইনের সবকটি আপনি ইতিমধ্যে দেখে ফেলেছেন! 🎉😍\n\nকোন কার্ডটি আপনার সবচেয়ে পছন্দ হয়েছে? কত পিস লাগবে বলুন, সুন্দরভাবে বানিয়ে দেবো! 😊\n(অথবা ${altTypeName} কালেকশন দেখতে পারেন)`;
    await sendMessengerButtonBlock(recipientId, finishMsg, [
      switchBtn,
      { title: "দাম জানুন", payload: "BTN_PRICE" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    appendMessage(recipientId, 'bot', finishMsg);
    return;
  }

  const batch = idsList.slice(offset, offset + 8);
  const seenCount = Math.min(offset + batch.length, totalCount);
  const isFinished = seenCount >= totalCount;
  const nextOffset = offset + batch.length;

  // Track current category
  setCurrentCategory(recipientId, type);
  
  for (const id of batch) {
    await sendMessengerImage(recipientId, id, type);
    await delay(180);
  }

  await delay(400);

  let progressText = '';
  let buttons = [];

  if (isFinished) {
    // All cards in this collection have been shown! NO LOOP! NO "আরও দেখুন" BUTTON!
    progressText = `আমাদের মোট ${bngDigits(totalCount)}টি ${typeName} ডিজাইনের সবকটি আপনি দেখে ফেলেছেন! 🎉😍\n\nকোন কার্ডটি আপনার সবচেয়ে পছন্দ হয়েছে? কত পিস লাগবে বলুন, নিখুঁতভাবে বানিয়ে দেবো! 😊\n(অথবা ${altTypeName} কালেকশন দেখতে পারেন)`;

    buttons = [
      switchBtn,
      { title: "দাম জানুন", payload: "BTN_PRICE" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ];
  } else {
    // Still more cards remaining
    progressText = `আমাদের মোট ${bngDigits(totalCount)}টি ${typeName} ডিজাইনের মধ্যে আপনি ${bngDigits(seenCount)}টি দেখেছেন। 😍\n\nআরও দেখতে 'আরও দেখুন' বাটনে চাপুন। কত পিস লাগবে আপনার? 😊`;
    const morePayload = `MORE_${type.toUpperCase()}_${nextOffset}`;

    buttons = [
      { title: "আরও দেখুন", payload: morePayload },
      switchBtn,
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ];
  }

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

            const replyTo = message?.reply_to;
            const isQuotedReply = !!replyTo;
            let quotedCard = null;

            if (replyTo) {
              // 1. Direct image attachment in reply_to object
              if (replyTo.attachments && Array.isArray(replyTo.attachments)) {
                const qImg = replyTo.attachments.find(att => (att.type === 'image' || att.image_data) && !att.payload?.sticker_id);
                if (qImg?.payload?.url) {
                  photoUrl = qImg.payload.url;
                  isPhoto = true;
                } else if (qImg?.image_data?.url) {
                  photoUrl = qImg.image_data.url;
                  isPhoto = true;
                }
              }

              // 2. Check if reply_to.mid matches a card sent by our bot
              if (replyTo.mid) {
                quotedCard = getSentCardInfo(senderId, replyTo.mid);
                if (quotedCard) {
                  if (quotedCard.url && !photoUrl) {
                    photoUrl = quotedCard.url;
                  }
                  isPhoto = true;
                }
              }

              // 3. If still no image and we have reply_to.mid, try querying Meta Graph API
              if (!isPhoto && replyTo.mid && PAGE_ACCESS_TOKEN) {
                try {
                  const graphMidUrl = `https://graph.facebook.com/v20.0/${replyTo.mid}?fields=attachments,message&access_token=${PAGE_ACCESS_TOKEN}`;
                  const midRes = await fetch(graphMidUrl, {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(2000)
                  });
                  if (midRes.ok) {
                    const midData = await midRes.json();
                    const atts = midData?.attachments?.data || midData?.attachments || [];
                    const foundImg = Array.isArray(atts) ? atts.find(a => a.image_data?.url || a.file_url || (a.type === 'image' && a.payload?.url)) : null;
                    const fetchedUrl = foundImg?.image_data?.url || foundImg?.file_url || foundImg?.payload?.url;
                    if (fetchedUrl) {
                      photoUrl = fetchedUrl;
                      isPhoto = true;
                    }
                  }
                } catch (e) {
                  console.warn('Could not fetch reply_to message from Graph API:', e.message);
                }
              }
            }

            const referral = webhookEvent.referral || webhookEvent.message?.referral || null;
            const isAdReferral = !!(referral && (referral.source === 'ADS' || referral.ad_id || referral.ads_context_data)) ||
              (text && (text.includes('গোল্ড ফয়েল') || text.includes('হ্যান্ড-ফিনিশড ডিজাইন') || text.includes('#WeddingCard') || (text.includes('WhatsApp:') && text.includes('01701016826'))));

            const isSticker = !!(message?.sticker_id || (attachments && attachments.some(att => att.payload?.sticker_id)));
            const isLikeThumbsUp = isSticker || /^(👍|👍🏻|👍🏼|👍🏽|👍🏾|👍🏿|\(like\)|like)$/i.test(text.trim());

            if (attachments && attachments.length > 0 && !isSticker && !isLikeThumbsUp && !isAdReferral) {
              const imgAtt = attachments.find(att => att.type === 'image' && !att.payload?.sticker_id);
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

            // If sending a photo or replying to a card, preserve caption/text
            const customerPhotoCaption = isPhoto ? (text || '').trim() : '';
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

            // Standard card quantities (50, 100, 150, 200, 250, 300, etc.)
            const isStandardCardQty = (num) => {
              if (!num || num < 50) return false;
              return [50, 60, 70, 75, 80, 100, 120, 150, 200, 250, 300, 350, 400, 500, 600, 700, 750, 800, 900, 1000, 1500, 2000].includes(num);
            };

            const hasQtyUnit = /\b(pcs?|piece|পিস|পিসি|পিচ|টি|টা|কপি|copy|copies)\b/i.test(normalizedTxt);
            const anyDigitsMatch = normalizedTxt.match(/\b\d{3,8}\b/);
            const pureDigitsMatch = normalizedTxt.trim().match(/^(\d{3,8})$/);
            const pureDigitsNum = pureDigitsMatch ? parseInt(pureDigitsMatch[1], 10) : null;
            const awaitingPayment = checkCustomerAwaitingPayment(senderId);

            // Check if user says they already paid / sent money (past tense):
            const isPaymentDonePhrase = (
              /(?:পেমেন্ট|টাকা|advance|এডভান্স|payment|paid|bKash|bkash|বিকাশ|nagad|নগদ|rocket|রকেট|taka)\s*(?:করেছি|করছি|দিলাম|দিছি|পাঠালাম|পাঠাইছি|পাঠিয়েছি|দিয়েছি|হয়েছে|হইছে|হলো|done|completed|send|sent|disi|diasi|dilam|pathaisi|pathalam|koresi|korsi|korechi)/i.test(normalizedTxt) ||
              /\b(paid|payment\s*done|taka\s*send|advance\s*done|payment\s*completed|money\s*sent|advance\s*paid)\b/i.test(normalizedTxt) ||
              normalizedTxt.match(/^(?:পেমেন্ট\s*করেছি|টাকা\s*পাঠিয়েছি|টাকা\s*পাঠাইছি|paid|advance\s*paid)$/i) !== null
            );

            // Mentioned last digits / last number / transaction:
            const mentionsLastDigits = /(?:লাস্ট|last|শেষের|লাস্টের|শেষ|shesh|sesh)\s*(?:৪|4)?\s*(?:ডিজিট|digit|নম্বর|নাম্বার|number|no|num)?/i.test(normalizedTxt) ||
              /(?:ডিজিট|digit|trx\s*id|transaction\s*id|ট্রানজেকশন|পেমেন্ট\s*কোড|trx)/i.test(normalizedTxt);

            // Detect if this message is payment confirmation / transaction info (e.g. "payment koresi last number 5874", "last 4 digit 1234", "4532", "trxid 9XYZ...")
            const isPaymentInfoSubmission = !hasQtyUnit && (
              (mentionsLastDigits && anyDigitsMatch !== null) ||
              (isPaymentDonePhrase && anyDigitsMatch !== null) ||
              (awaitingPayment && anyDigitsMatch !== null) ||
              (pureDigitsMatch !== null && (pureDigitsMatch[1].length === 4 || !isStandardCardQty(pureDigitsNum))) ||
              /trx\s*id|transaction\s*id|ট্রানজেকশন|পেমেন্ট\s*কোড/i.test(normalizedTxt)
            );

            // Detect if message is a price objection, competitor comparison, or discount request
            const isPriceObjectionOrDiscount = (
              /(?:দাম|dam|price|rate).*?(?:বেশি|beshi|besi|high)|(?:বেশি|beshi|besi|high).*?(?:দাম|dam|price)|eto\s*da+m|এত\s*দাম|খুব\s*বেশি|khub\s*besi|অনেক\s*দাম|onek\s*da+m/i.test(normalizedTxt) ||
              /(?:অন্য|onno|other).*?(?:পেজ|page|জায়গা|জায়গা|jayga|jaiga|দোকান|shop|কম|kom)|অন্যত্র\s*কম/i.test(normalizedTxt) ||
              /discount|ডিসকাউন্ট|ছাড়|ছাড়|\bchar\b|\bchaar\b|কম\s*রাখা|কমান|কিছু\s*কম|একটু\s*কম|কম\s*হবে|kom\s*hobe|kom\s*dhen|kom\s*rakh|komano|raikhen|rakhen|rakhben|রাইখেন|রাখেন|রাখলে/i.test(normalizedTxt)
            );

            // Check if customer is making an acceptable 50-100 tk bargain offer
            const bargainOffer = evaluateBargain(text, getCurrentCategory(senderId) || 'affordable');

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
              const explicitQtyMatch = normalizedTxt.match(/\b(\d{1,5})\s*(pcs?|piece|পিস|পিসি|পিচ|টি|টা)\b/i);
              if (explicitQtyMatch) {
                const num = parseInt(explicitQtyMatch[1], 10);
                if (num > 0 && num < 10000) quantity = num;
              } else if (pureDigitsNum !== null && (isStandardCardQty(pureDigitsNum) || pureDigitsNum < 50)) {
                quantity = pureDigitsNum;
              }
            }

            // ===== PHOTO UPLOADED OR QUOTED CARD REPLY =====
            if (isPhoto && (photoUrl || quotedCard)) {
              // Case 1: Exact card already identified via quoted/swiped message
              if (quotedCard) {
                const category = quotedCard.category || 'affordable';
                setCurrentCategory(senderId, category);

                const priceTable = getFullPriceTable(category);
                const emoji = category === 'premium' ? '✨' : '💚';
                const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                const altCat = category === 'premium' ? 'affordable' : 'premium';
                const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

                let reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${priceTable}\n\nআপনার কত পিস লাগবে বলুন! 😊`;

                if (customerPhotoCaption) {
                  const capQtyMatch = customerPhotoCaption.match(/\b(\d{1,5})\s*(pcs?|piece|পিস|পিসি|পিচ)?\b/i);
                  if (capQtyMatch) {
                    const q = parseInt(capQtyMatch[1], 10);
                    if (q >= 50 && q < 10000) {
                      reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${getCategoryPrice(q, category)}\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
                    }
                  }
                }

                await sendMessengerButtonBlock(senderId, reply, [
                  { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                  { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                  { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
                ]);
                appendMessage(senderId, 'bot', reply);
              } else {
                // Case 2: photoUrl available (fresh upload or external quote)
                let photoBase64 = null;
                let photoMime = 'image/jpeg';
                try {
                  const imgRes = await fetch(photoUrl, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                  });
                  if (imgRes.ok) {
                    const arrayBuffer = await imgRes.arrayBuffer();
                    photoBase64 = Buffer.from(arrayBuffer).toString('base64');
                    photoMime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
                  } else {
                    console.error('Failed to fetch photo from Messenger:', imgRes.status);
                  }
                } catch (fetchErr) {
                  console.error('Error fetching photo from Messenger:', fetchErr.message);
                }

                let matchResult = null;
                if (photoBase64 && isCatalogIndexReady()) {
                  try {
                    matchResult = await findCatalogMatch(photoBase64, photoMime);
                  } catch (matchErr) {
                    console.error('Catalog match error:', matchErr.message);
                  }
                }

                // Check if catalog match is confident (>= 0.70 similarity with a Drive catalog card)
                if (matchResult && matchResult.similarity >= 0.70) {
                  const category = matchResult.category;
                  const matchCode = matchResult.code;
                  setCurrentCategory(senderId, category); // Save category so "eita koto" knows!

                  const priceTable = getFullPriceTable(category);
                  const emoji = category === 'premium' ? '✨' : '💚';
                  const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                  const altCat = category === 'premium' ? 'affordable' : 'premium';
                  const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

                  let reply = `দারুণ পছন্দ! 😍 এটি আমাদের ড্রাইভ ক্যাটালগের ${emoji} ${catName} কালেকশনের কার্ড (${matchCode})।\n\n${priceTable}\n\nআপনার কত পিস কার্ড লাগবে বলুন! 😊`;

                  if (customerPhotoCaption) {
                    const capQtyMatch = customerPhotoCaption.match(/\b(\d{1,5})\s*(pcs?|piece|পিস|পিসি|পিচ)?\b/i);
                    if (capQtyMatch) {
                      const q = parseInt(capQtyMatch[1], 10);
                      if (q >= 50 && q < 10000) {
                        reply = `দারুণ পছন্দ! 😍 এটি আমাদের ড্রাইভ ক্যাটালগের ${emoji} ${catName} কালেকশনের কার্ড (${matchCode})।\n\n${getCategoryPrice(q, category)}\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
                      }
                    }
                  }

                  await sendMessengerButtonBlock(senderId, reply, [
                    { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                    { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                    { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
                  ]);
                  appendMessage(senderId, 'bot', reply);
                } else {
                  // Low similarity (< 0.70) or external card — Gemini 3.6 Vision analyzes the image + candidate
                  const visionRes = await analyzeCardImage({
                    photoUrl,
                    base64Data: photoBase64,
                    mimeType: photoMime,
                    customerCaption: customerPhotoCaption,
                    topCandidate: matchResult
                  });

                  if (visionRes?.type === 'PAYMENT_RECEIPT') {
                    setCustomerAwaitingPayment(senderId, true);
                    setHumanTakeover(senderId, true); // Hand over to human agent for manual check
                    const reply = visionRes.reply || `অনেক ধন্যবাদ! আপনার টাকা পাঠানোর স্ক্রিনশটটি আমরা পেয়েছি। 🌸\n\nঅনুগ্রহ করে আপনার বিকাশ/নগদ নম্বরের শেষ ৪টি ডিজিট লিখে দিন। আমাদের অ্যাকাউন্টস টিম স্টেটমেন্ট দেখে পেমেন্টটি চেক করে কিছুক্ষণের মধ্যেই আপনাকে নিশ্চিত করবে।`;
                    await sendMessengerButtonBlock(senderId, reply, [
                      { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
                      { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" },
                      { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" }
                    ]);
                    appendMessage(senderId, 'bot', reply);
                  } else if (visionRes?.type === 'OTHER') {
                    const reply = visionRes.reply || `ছবিটির জন্য ধন্যবাদ! 🌸 আপনি কি কোনো নির্দিষ্ট ডিজাইনের বিয়ের কার্ড তৈরি করতে চাইছেন? আমাদের কালেকশন দেখতে পারেন অথবা আপনার পছন্দের কার্ডের ছবি বা কত পিস লাগবে জানাতে পারেন!`;
                    await sendMessengerButtonBlock(senderId, reply, [
                      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                      { title: "দাম জানুন", payload: "BTN_PRICE" }
                    ]);
                    appendMessage(senderId, 'bot', reply);
                  } else {
                    // Wedding Card — Category identified by Vision
                    const detectedCat = (visionRes?.detectedCategory || matchResult?.category || 'affordable').toLowerCase().includes('prem') ? 'premium' : 'affordable';
                    setCurrentCategory(senderId, detectedCat); // Save so future questions know the category!

                    const emoji = detectedCat === 'premium' ? '✨' : '💚';
                    const catName = detectedCat === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
                    const altCat = detectedCat === 'premium' ? 'affordable' : 'premium';
                    const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

                    // Strictly quote ONLY that specific category's price table
                    let reply = `অনেক সুন্দর একটি ডিজাইন পছন্দ করেছেন! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের সাথে মানানসই।\n\n${getFullPriceTable(detectedCat)}\n\nআপনার মোট কত পিস কার্ড লাগবে বলুন! 😊`;

                    if (customerPhotoCaption) {
                      const capQtyMatch = customerPhotoCaption.match(/\b(\d{1,5})\s*(pcs?|piece|পিস|পিসি|পিচ)?\b/i);
                      if (capQtyMatch) {
                        const q = parseInt(capQtyMatch[1], 10);
                        if (q >= 50 && q < 10000) {
                          reply = `অনেক সুন্দর একটি ডিজাইন পছন্দ করেছেন! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${getCategoryPrice(q, detectedCat)}\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
                        }
                      }
                    }

                    await sendMessengerButtonBlock(senderId, reply, [
                      { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                      { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                      { title: "কার্ড দেখুন", payload: detectedCat === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
                    ]);
                    appendMessage(senderId, 'bot', reply);
                  }
                }
              }
            }
            // ===== QUOTED/SWIPED CARD REPLY (FALLBACK IF NO DIRECT IMAGE URL ATTACHED) =====
            else if (isQuotedReply && (
              normalizedTxt.match(/\b(pp|p|dp|prc|pr|price|rate|cost|dam|daam|koto)\b/i) ||
              normalizedTxt.match(/দাম|কত|কতো|মূল্য|রেট|টাকা|খরচ|পিস|eita|aita|etar|eitar/i) ||
              normalizedTxt === 'pp' || normalizedTxt === 'pp?' || normalizedTxt === 'p?'
            )) {
              const cat = getCurrentCategory(senderId) || 'affordable';
              setCurrentCategory(senderId, cat);

              const priceTable = getFullPriceTable(cat);
              const emoji = cat === 'premium' ? '✨' : '💚';
              const catName = cat === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
              const altCat = cat === 'premium' ? 'affordable' : 'premium';
              const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

              let reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${priceTable}\n\nআপনার কত পিস লাগবে বলুন! 😊`;

              const qtyMatch = normalizedTxt.match(/\b(\d{1,5})\s*(pcs?|piece|পিস|পিসি|পিচ)?\b/i);
              if (qtyMatch) {
                const q = parseInt(qtyMatch[1], 10);
                if (q >= 50 && q < 10000) {
                  reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${getCategoryPrice(q, cat)}\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
                }
              }

              await sendMessengerButtonBlock(senderId, reply, [
                { title: "অর্ডার করবো", payload: "BTN_ORDER" },
                { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
                { title: "কার্ড দেখুন", payload: cat === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== FACEBOOK AD / POST REFERRAL ENTRY =====
            else if (isAdReferral && (!payload || payload === '' || payload === 'BTN_AD_ENTRY' || !text || text.includes('গোল্ড ফয়েল') || text.includes('WhatsApp:'))) {
              const reply = `আসসালামু আলাইকুম! 🌸 বন্ধন প্রিন্টিং হাউসে স্বাগতম।\nআমাদের গোল্ড ফয়েল ও প্রিমিয়াম বিয়ের কার্ডের বিজ্ঞাপনটি দেখে যোগাযোগ করার জন্য ধন্যবাদ! আপনি কি এই ধরনের কার্ডের কালেকশন দেখতে চাইছেন?`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== LIKE / THUMBS UP STICKER OR EMOJI =====
            else if (isLikeThumbsUp) {
              const reply = `লাইক দেওয়ার জন্য অনেক ধন্যবাদ! 🌸😊\nবন্ধন প্রিন্টিং হাউসে স্বাগতম। আপনি কি কোনো নির্দিষ্ট ডিজাইনের বিয়ের কার্ড দেখতে চাইছেন?`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
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
            // ===== LOW QUANTITY / MINIMUM ORDER QUERY ("আমার অল্প লাগবে" / "ন্যূনতম অর্ডার পরিমাণ" / "minimum order") =====
            else if (!isFormSubmission && text.length < 70 && (
              /\b(olpo\s*lagbe|kom\s*lagbe|olpo\s*pisi|kom\s*pcs|kom\s*pisi|minimum|min\s*order)\b/i.test(txt) ||
              /(^|\s)(অল্প|কম|ন্যূনতম|নূন্যতম|মিনিমাম|কমপক্ষে)\s*(লাগবে|হবে|পিস|কার্ড|পরিমাণ|অর্ডার|কিছু)/.test(txt) ||
              /^(আমার\s*)?(অল্প|কম|ন্যূনতম|নূন্যতম)(\s*লাগবে|\s*হবে|\s*অর্ডার|\s*পরিমাণ)?$/i.test(txt.trim()) ||
              txt.includes('ন্যূনতম') || txt.includes('নূন্যতম') || txt.includes('মিনিমাম') || txt.includes('minimum')
            ) && !/(কমিউনিটি|কম্পিউটার|কম্পানি|কমপ্লিট|কমেন্ট|ইনকাম|স্বাগতম)/i.test(txt)) {
              const reply = `জি, আমাদের কাছে অল্প পরিমাণেও (১-৪৯ পিস) বিয়ের কার্ড অর্ডার করতে পারবেন! 😊\n\nঅল্প পরিমাণের প্রাইসিং রেট:\n• ১-৫ পিস: ১,০০০৳ (ফিক্সড মেকিং চার্জ সহ)\n• ৬-১০ পিস: ১,৫০০৳ (ফিক্সড চার্জ)\n• ১১-৪৯ পিস: পিস প্রতি ৭৫৳ (যেমন ২৫ পিস = ১,৮৭৫৳)\n\n💡 পরামর্শ: ৫০+ পিস নিলে পিস প্রতি দাম অনেক কমে আসে (Affordable: ৫৫৳, Premium: ৬৫৳)।\n\nআপনার কত পিস লাগবে বলুন! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "৫ পিস (১০০০৳)", payload: "QTY_5" },
                { title: "১০ পিস (১৫০০৳)", payload: "QTY_10" },
                { title: "২৫ পিস (১৮৭৫৳)", payload: "QTY_25" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== PAYMENT LAST DIGITS / CONFIRMATION SUBMITTED BY USER =====
            else if (isPaymentInfoSubmission) {
              const digitsMatch = normalizedTxt.match(/\b\d{3,8}\b/);
              const digits = digitsMatch ? digitsMatch[0] : '';
              const digitsText = digits ? ` (${bngDigits(digits)})` : '';

              setCustomerAwaitingPayment(senderId, false);
              setOrderStatus(senderId, 'Payment_Submitted');
              setHumanTakeover(senderId, true); // Hand over to human agent for manual check

              const reply = `অনেক ধন্যবাদ! আপনার পেমেন্টের লাস্ট ৪ ডিজিট${digitsText} আমরা পেয়েছি। 🌸\n\nঅনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন। আমাদের অ্যাকাউন্টস টিম স্টেটমেন্ট দেখে পেমেন্টটি চেক করে কিছুক্ষণের মধ্যেই আপনাকে নিশ্চিত করবে।\n\nপেমেন্ট নিশ্চিত হওয়ামাত্রই আমাদের ডিজাইনার আপনার কার্ডের কাজ শুরু করে দেবে! 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
                { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" },
                { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== PAYMENT CLAIMED (NO DIGITS YET) OR BTN_PAID CLICKED =====
            else if (payload === 'BTN_PAID' || isPaymentDonePhrase) {
              setCustomerAwaitingPayment(senderId, true);
              const reply = `অনেক ধন্যবাদ! আপনার পেমেন্টের স্ক্রিনশট বা বিকাশ/নগদ লাস্ট ৪ ডিজিট এখানে লিখে দিন। 😊\nআমাদের টিম দ্রুত যাচাই করে আপনার অর্ডারটি নিশ্চিত করবে এবং ডিজাইনার কাজ শুরু করবে! 🌸`;
              await sendMessengerText(senderId, reply);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== 50/100 TK CONCESSION / BARGAIN ACCEPTANCE (OWNER AUTHORIZED) =====
            else if (bargainOffer && bargainOffer.accepted) {
              const diffText = bargainOffer.discountAmount > 0 ? `${bngDigits(bargainOffer.discountAmount)}৳ কমিয়ে ` : '';
              const reply = `জি ঠিক আছে ভাইয়া! আপনার সম্মানে আমরা ${diffText}${bngDigits(bargainOffer.finalPrice)}৳-তেই রাখছি! 🎉🤝\n\nতাহলে আপনার ${bngDigits(bargainOffer.qty)} পিস কার্ডের অর্ডারটি কনফার্ম করার জন্য এগিয়ে নিচ্ছি।\n\n📋 অর্ডার করার সহজ ৩টি ধাপ:\n১️⃣ তথ্য পূরণ: প্রথমে নিচের 'ফর্ম পূরণ' বাটনে চাপ দিয়ে বর-কনের নাম ও অনুষ্ঠানসূচী লিখে পাঠান।\n২️⃣ অ্যাডভান্স: তথ্য পাওয়ার পর ৩০% অ্যাডভান্স (${bngDigits(bargainOffer.advance30)}৳) দিতে হবে।\n৩️⃣ ডিজাইন ও প্রিন্ট: ডিজাইনার আপনাকে ড্রাফট প্রুফ দেখাবে। পছন্দ হলে প্রিন্ট হবে!\n\n👇 অর্ডারটি শুরু করতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন:`;

              await sendMessengerButtonBlock(senderId, reply, [
                { title: "📝 ফর্ম পূরণ করুন", payload: "BTN_FORM" },
                { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
                { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== QUANTITY — Show price for CURRENT category or Min 50 Pcs Warning =====
            else if (quantity && !isPriceObjectionOrDiscount) {
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
            // ===== GENERAL DESIGN / CARD VIEW REQUEST ("কার্ড দেখতে চাই", "ডিজাইন দেখতে চাই", "কালেকশন") =====
            else if (
              !txt.includes('affordable') && !txt.includes('premium') && !txt.includes('সাশ্রয়ী') && !txt.includes('প্রিমিয়াম') &&
              (txt.match(/(?:কার্ড|card|ডিজাইন|design|কালেকশন|collection).*?(?:দেখব|দেখবো|দেখতে|দেখান|দেখা|show|ছবি|pic)/i) ||
               txt.match(/^(কার্ড\s*দেখব|কার্ড\s*দেখবো|কার্ড\s*দেখতে\s*চাই|কার্ডের\s*ডিজাইন\s*দেখতে\s*চাই|ডিজাইন\s*দেখব|ডিজাইন\s*দেখতে\s*চাই|কালেকশন\s*দেখব|কালেকশন\s*দেখতে\s*চাই|ডিজাইন\s*গুলো\s*দেখতে\s*চাই)$/i))
            ) {
              const reply = `আমাদের বিয়ের কার্ডের দুটি চমৎকার কালেকশন রয়েছে: 🌸\n\n💚 সাশ্রয়ী (Affordable) — সেরা বাজেটে আধুনিক লেজার-কাট ডিজাইন\n✨ প্রিমিয়াম (Premium) — বড় সাইজের লাক্সারি ও রাজকীয় লুক\n\nআপনি কোন কালেকশনের ডিজাইন দেখতে চান? 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', reply);
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
            else if ((
              payload === 'BTN_PRICE' ||
              txt.match(/\b(pp|p|dp|prc|pr|price|rate|cost|dam|daam|koto|koto\s*tk)\b/i) ||
              txt.match(/দাম|কত|কতো|মূল্য|রেট|টাকা|খরচ|পিস\s*কত|eita\s*koto|aita\s*koto|etar\s*dam|eitar\s*dam|atar\s*dam/i) ||
              txt === 'pp' || txt === 'pp?' || txt === 'p?' || txt === 'দাম' || txt === 'দাম?' || txt === 'কত?' || txt === 'কতো?'
            ) && !isPriceObjectionOrDiscount) {
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

              const followUp = "কার্ডের তথ্য পাঠাতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন! 👇";
              await sendMessengerButtonBlock(senderId, followUp, [
                { title: "📝 ফর্ম পূরণ করুন", payload: "BTN_FORM" },
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
            // ===== DELIVERY TIMELINE QUERY ("ডেলিভারি সময় কত", "কতদিন লাগে", "কবে পাব") =====
            else if (txt.match(/ডেলিভারি\s*(সময়|সময়|কতদিন|কবে)|কত\s*দিন\s*(লাগবে|লাগে)|কতদিনে\s*(পাব|পৌঁছাবে)|কবে\s*(পাব|পৌঁছাবে)|delivery\s*(time|koto|din)/i)) {
              const reply = `🚚 আমাদের ডেলিভারি সময় ও প্রক্রিয়া:\n\n• ডিজাইন ও প্রুফ চেক: কার্ডের তথ্য পাওয়ার পর ১-২ দিনের মধ্যে ডিজাইনার প্রুফ দেখাবে।\n• প্রিন্ট ও ডেলিভারি: আপনার ডিজাইন ওকে হওয়ার পর ৫-৭ কর্মদিবসের মধ্যে জেলা শহরে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি পৌঁছে যাবে!\n\n(জরুরি প্রয়োজনে মানিকগঞ্জ অফিস বা ঢাকার নির্দিষ্ট কারখানা থেকেও সংগ্রহ করতে পারবেন) 😊`;
              await sendMessengerButtonBlock(senderId, reply, [
                { title: "দাম জানুন", payload: "BTN_PRICE" },
                { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "অর্ডার করবো", payload: "BTN_ORDER" }
              ]);
              appendMessage(senderId, 'bot', reply);
            }
            else if (payload === 'BTN_POLICY' || txt.match(/পলিসি|policy|কুরিয়ার/)) {
              await sendMessengerText(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);

              const followUp = "কার্ডের তথ্য পাঠাতে নিচের বাটনে চাপুন: 👇";
              await sendMessengerButtonBlock(senderId, followUp, [
                { title: "📝 ফর্ম পূরণ করুন", payload: "BTN_FORM" },
                { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
                { title: "দাম জানুন", payload: "BTN_PRICE" }
              ]);
              appendMessage(senderId, 'bot', followUp);
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
            // ===== HOTLINE BUTTON =====
            else if (payload === 'BTN_HOTLINE') {
              const reply = `📞 আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন:\n01701016826 (বন্ধন হটলাইন)\n\nআমরা সার্বক্ষণিক সহায়তায় আছি! 😊`;
              await sendMessengerText(senderId, reply);
              appendMessage(senderId, 'bot', reply);
            }
            // ===== PAYMENT / BKASH NUMBER QUERY =====
            else if (txt.match(/bkash|bKash|বিকাশ|nagad|নগদ|rocket|রকেট|payment|পেমেন্ট|এডভান্স|advance/i) && !isPaymentDonePhrase) {
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
                
                let fallbackMsg = "ধন্যবাদ! 😊 আমাদের কালেকশন দেখতে নিচের বাটনে ক্লিক করুন!";
                if (isPriceObjectionOrDiscount) {
                  fallbackMsg = "আপনার বাজেট ও দিকটা বুঝতে পারছি। আমাদের কার্ডগুলোতে প্রিমিয়াম মেটেরিয়াল ও নিখুঁত ফিনিশিং নিশ্চিত করা হয়। আপনি মোট কত পিস নিতে চাইছেন আর কেমন বাজেট ভাবছেন জানালে, সেরা অপশনটি বের করে দিচ্ছি! 😊";
                }
                const reply = aiReply || fallbackMsg;
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
