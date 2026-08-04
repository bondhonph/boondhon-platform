import { appendMessage } from '../../lib/chat-store';

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

const directCdnUrl = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;

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

const ENGLISH_ORDER_FORM_TEXT = `📝 Wedding Card English Order Form: 🌸

Groom-
Name:
Father:
Mother:
Address:

Bride-
Name:
Father:
Mother:
Address:

Gaye Holud-
Date (English):
Date (Bangla):
Day:
Time:
Venue:

Wedding-
Date (English):
Date (Bangla):
Day:
Time:
Venue:

Reception-
Date (English):
Date (Bangla):
Day:
Time:
Venue:

Regards / Compliments Name:
Kids Names:
Phone:

🚚 Courier Delivery Info (Name, Phone, Full Address):

(Please copy, fill up and send back! 🥰)`;

const PRICE_LIST_MSG = `💰 আমাদের বিয়ের কার্ডের মূল্য তালিকা:

💚 Affordable Card:
• ৫০পিস: ২,৭৫০৳ | ১০০পিস: ৪,৫০০৳ | ২০০পিস: ৭,০০০৳

✨ Premium Card:
• ৫০পিস: ৩,২৫০৳ | ১০০পিস: ৫,৫০০৳ | ২০০পিস: ৯,০০০৳

🎁 ২০০+ পিস অর্ডারে ১টি ফ্রি নিকাহনামা সম্পূর্ণ ফ্রি!`;

// Helper to send Native Button Template (Permanent vertical stacked buttons inside white bubble)
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

// Send ALL 5 Permanent Vertical Buttons in 2 Stacked White Bubble Cards!
async function send5PermanentButtons(recipientId, mainText) {
  const buttons1 = [
    { title: "💚 Affordable Card", payload: "BTN_AFFORDABLE" },
    { title: "✨ Premium Card", payload: "BTN_PREMIUM" },
    { title: "💰 মূল্য তালিকা", payload: "BTN_PRICE" }
  ];
  await sendMessengerButtonBlock(recipientId, mainText, buttons1);

  await new Promise(r => setTimeout(r, 300));

  const buttons2 = [
    { title: "📝 বাংলা ও Eng ফর্ম", payload: "BTN_FORM" },
    { title: "🚚 ডেলিভারি পলিসি", payload: "BTN_POLICY" }
  ];
  await sendMessengerButtonBlock(recipientId, "অর্ডার করতে বা অন্যান্য সার্ভিস দেখতে নিচের বাটন চাপুন:", buttons2);
}

// Send 8 Card Gallery Batch WITHOUT repeating Welcome Message!
async function sendMessenger8CardGallery(recipientId, type = 'affordable', offset = 0) {
  const idsList = type === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const currentOffset = (isNaN(offset) || offset >= idsList.length) ? 0 : offset;
  const batch = idsList.slice(currentOffset, currentOffset + 8);
  const typeLabel = type === 'premium' ? 'Premium' : 'Affordable';
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  // 1. Send Batch of 8 Card Images via Meta Generic Template Carousel!
  const elements = batch.map((id, index) => ({
    title: `🌸 ${typeLabel} Card #${currentOffset + index + 1}`,
    subtitle: `BOONDHON Printing House`,
    image_url: directCdnUrl(id)
  }));

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "template",
            payload: { template_type: "generic", elements: elements }
          }
        }
      })
    });
  } catch (err) {
    console.error('Error sending carousel batch:', err);
  }

  await new Promise(r => setTimeout(r, 400));

  // 2. Build PERMANENT VERTICAL BUTTONS attached inside the white message bubble!
  let nextOffset = currentOffset + batch.length;
  if (nextOffset >= idsList.length) {
    nextOffset = 0;
  }

  const buttons1 = [
    { title: "👉 আরও দেখুন", payload: `MORE_${type.toUpperCase()}_${nextOffset}` },
    { title: type === 'premium' ? "💚 Affordable Card" : "✨ Premium Card", payload: type === 'premium' ? "BTN_AFFORDABLE" : "BTN_PREMIUM" },
    { title: "💰 মূল্য তালিকা", payload: "BTN_PRICE" }
  ];

  const text1 = `🌸 BOONDHON ${typeLabel} গ্যালারি (${currentOffset + 1} - ${currentOffset + batch.length} / ${idsList.length} নম্বর ডিজাইন)\n\nপরের ৮টি ছবি দেখতে "👉 আরও দেখুন" চাপুন:`;
  await sendMessengerButtonBlock(recipientId, text1, buttons1);

  await new Promise(r => setTimeout(r, 300));

  const buttons2 = [
    { title: "📝 বাংলা ও Eng ফর্ম", payload: "BTN_FORM" },
    { title: "🚚 ডেলিভারি পলিসি", payload: "BTN_POLICY" }
  ];
  await sendMessengerButtonBlock(recipientId, "অর্ডার করতে বা ডেলিভারি পলিসি দেখতে নিচের বাটন চাপুন:", buttons2);

  appendMessage(recipientId, 'bot', text1);
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

            if (webhookEvent.message?.is_echo && webhookEvent.message?.app_id === "2563899990649523") {
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

            if (payload.startsWith('MORE_AFFORDABLE_')) {
              const rawOffset = payload.replace('MORE_AFFORDABLE_', '');
              const offset = parseInt(rawOffset, 10);
              await sendMessenger8CardGallery(senderId, 'affordable', isNaN(offset) ? 0 : offset);
            } else if (payload.startsWith('MORE_PREMIUM_')) {
              const rawOffset = payload.replace('MORE_PREMIUM_', '');
              const offset = parseInt(rawOffset, 10);
              await sendMessenger8CardGallery(senderId, 'premium', isNaN(offset) ? 0 : offset);
            } else if (payload === 'BTN_AFFORDABLE' || txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল')) {
              await sendMessenger8CardGallery(senderId, 'affordable', 0);
            } else if (payload === 'BTN_PREMIUM' || txt.includes('premium') || txt.includes('প্রিমিয়াম')) {
              await sendMessenger8CardGallery(senderId, 'premium', 0);
            } else if (payload === 'BTN_POLICY' || txt.includes('policy') || txt.includes('পলিসি') || txt.includes('ডেলিভারি') || txt.includes('কুরিয়ার')) {
              await send5PermanentButtons(senderId, ORDER_RULES_MSG);
              appendMessage(senderId, 'bot', ORDER_RULES_MSG);
            } else if (payload === 'BTN_PRICE' || txt.includes('price') || txt.includes('দাম') || txt.includes('মূল্য') || txt.includes('কত')) {
              await send5PermanentButtons(senderId, PRICE_LIST_MSG);
              appendMessage(senderId, 'bot', PRICE_LIST_MSG);
            } else if (payload === 'BTN_FORM' || txt.includes('form') || txt.includes('ফর্ম')) {
              await sendMessengerText(senderId, BANGLA_ORDER_FORM_TEXT);
              await send5PermanentButtons(senderId, ENGLISH_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', BANGLA_ORDER_FORM_TEXT);
              appendMessage(senderId, 'bot', ENGLISH_ORDER_FORM_TEXT);
            } else {
              // Welcome message is ONLY sent ONCE when starting conversation or greeting!
              const welcomeText = `আসসালামু আলাইকুম! আমি বন্ধন প্রিন্টিং হাউস থেকে অনন্যা বলছি। কেমন আছেন আপনি? 🌸\n\nএখন আমাদের একটা দারুণ ধামাকা অফার চলছে—২০০ পিস কার্ডের সাথে ১টি প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি! 🎁\n\nকার্ডের ডিজাইন ও সুবিধা দেখতে নিচের ৫টি বাটনের যেকোনো একটিতে ক্লিক করুন:`;
              await send5PermanentButtons(senderId, welcomeText);
              appendMessage(senderId, 'bot', welcomeText);
            }
          }
        });

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
