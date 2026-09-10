import crypto from 'crypto';
import {
  appendMessage, getConversation, setHumanTakeover, setOrderStatus,
  getUnseenImagesWithStats, setCurrentCategory, getCurrentCategory,
  recordSentCardMessage, getSentCardByMid, setUserAwaitingPayment,
  isUserAwaitingPayment, setSelectedCard, getSelectedCard,
  setLastShownCards, getLastShownCards, getConversationStage, setConversationStage,
  getOrder, updateOrder, setPaymentStatus, resetCustomerState,
  getAwaitingField, setAwaitingField, isRedisTakeoverActive, getTakeoverState,
} from '../../lib/chat-store';
import { VISUAL_CATALOG_RULES, AFFORDABLE_IDS, PREMIUM_IDS, INNER_DESIGN_SAMPLE } from '../../lib/data';
import { findCatalogMatch, isCatalogIndexReady } from '../../lib/catalog-matcher';
import { bngDigits, normalizeBengaliDigits } from '../../lib/bangla-digits';
import {
  buildCategoryPriceText, buildLowQtyPriceText, buildPriceTableText,
  buildBothCategoriesPriceText, buildPricingBlurbForAI, evaluateBargain,
  getAdvanceAmount, getTotalPrice, getPerPieceRate, getOrderTotal, getOrderPerPiece,
} from '../../lib/pricing';
import * as Parser from '../../lib/order-parser';
import { logError } from '../../lib/logger';
import { checkRequiredEnv } from '../../lib/env-check';

// ============================================================
// FIX NOTE (audit plan P2-1 / A10): AFFORDABLE_IDS / PREMIUM_IDS and all
// pricing numbers used to be duplicated inline in this file (a second,
// independent copy of the exact same 74+75 Google-Drive ids, and six
// separate hardcodings of the 55/45/35 & 65/55/45 taka rates). Both are
// now imported from a single source (lib/data.js for the id lists,
// lib/pricing.js for every price computation/format), so a future price
// or catalog change only has to happen in one place.
// ============================================================

const PAGE_ACCESS_TOKEN = (process.env.FB_PAGE_ACCESS_TOKEN || "").trim();
const FB_APP_SECRET = (process.env.FB_APP_SECRET || "").trim();
const BOT_APP_ID = "2563899990649523";
const PAGE_ID = "100208292579845";

// STEP 20: validate environment once per cold start. Never throws, never
// logs secret values — see lib/env-check.js. Missing vars only affect
// which features are enabled; the handler below already has its own
// per-feature fallback for each of these (PAGE_ACCESS_TOKEN blank checks,
// GEMINI_API_KEY blank checks, FB_APP_SECRET blank -> signature check
// disabled, KV vars blank -> file-based storage fallback in chat-store.js).
checkRequiredEnv();

const ORDER_RULES_MSG = `📋 বন্ধন-এ অর্ডার করার সহজ ৩টি ধাপ:

১️⃣ কার্ডের তথ্য পূরণ:
প্রথমে নিচের 'ফর্ম পূরণ' বাটনে চাপ দিয়ে বর-কনের নাম, পিতা-মাতার নাম, অনুষ্ঠানসূচী (হলুদ, বিবাহ, বৌ-ভাত) ইত্যাদি তথ্য লিখে আমাদের পাঠিয়ে দিন।

২️⃣ অ্যাডভান্স ও ডিজাইন প্রুফ:
তথ্য পাওয়ার পর অর্ডার কনফার্ম করতে ৩০% অ্যাডভান্স করতে হবে। অ্যাডভান্স পাওয়ার সাথে সাথে আমাদের অভিজ্ঞ ডিজাইনার আপনার কার্ড ডিজাইন করে আপনাকে মেসেঞ্জার/হোয়াটসঅ্যাপে প্রুফ চেক করাবে।

৩️⃣ চূড়ান্ত অনুমোদন ও ডেলিভারি:
ডিজাইন আপনার ১০০% পছন্দ ও ওকে হওয়ার পরই প্রিন্ট শুরু হবে এবং জেলা শহরে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি পৌঁছে যাবে! 🚚`;

const BANGLA_ORDER_FORM_TEXT = `📝 বিয়ের কার্ড তৈরির অর্ডার ফর্ম (বাংলা): 🌸
(ফর্মটি কপি করে তথ্যগুলো লিখে আমাদের পাঠিয়ে দিন)

📸 পছন্দের কার্ডের ছবি: (ইনবক্সে যে কার্ডটির ছবি পাঠিয়েছেন)
📦 কার্ডের পরিমাণ (কত পিস লাগবে):

🤵 বর সম্পর্কিত তথ্য:
• বরের পূর্ণ নাম:
• পিতার নাম:
• মাতার নাম:
• বর্তমান/স্থায়ী ঠিকানা (গ্রাম/রোড, থানা, জেলা):

👰 কনে সম্পর্কিত তথ্য:
• কনের পূর্ণ নাম:
• পিতার নাম:
• মাতার নাম:
• বর্তমান/স্থায়ী ঠিকানা (গ্রাম/রোড, থানা, জেলা):

📅 অনুষ্ঠানসূচী (যেগুলো কার্ডে থাকবে):
১. গায়ে হলুদ:
   - তারিখ: (ইংরেজি ও বাংলা)
   - বার / রোজ:
   - সময়:
   - স্থান / ভেন্যু:

২. শুভ বিবাহ / আকদ:
   - তারিখ: (ইংরেজি ও বাংলা)
   - বার / রোজ:
   - সময়:
   - স্থান / ভেন্যু:

৩. বৌ-ভাত / ওলিমা:
   - তারিখ: (ইংরেজি ও বাংলা)
   - বার / রোজ:
   - সময়:
   - স্থান / ভেন্যু:

💌 আমন্ত্রণে ও সৌজন্যে:
• অভ্যর্থনায় (ছোটদের নাম):
• শুভেচ্ছান্তে (বড়দের নাম/পরিবারবর্গ):
• প্রয়োজনে যোগাযোগ (মোবাইল নম্বর):

🚚 হোম ডেলিভারির জন্য কুরিয়ার তথ্য:
• প্রাপকের নাম:
• সচল মোবাইল নম্বর:
• ডেলিভারির পূর্ণ ঠিকানা (থানা ও জেলা সহ):

💡 (ফর্মটি পূরণ করে পাঠালে আমাদের ডিজাইনার ডিজাইন রেডি করে আপনাকে প্রুফ দেখাবে! 🥰)`;

const ENGLISH_ORDER_FORM_TEXT = `📝 Wedding Card Order Form (English): ✨
(Please copy this form, fill in your details and send it back to us)

📸 Preferred Card: (Card photo sent in inbox)
📦 Card Quantity (How many pcs):

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

// ============================================================
// PRICING — thin wrappers kept so the rest of this file (and any
// external code referencing these function names) doesn't need to
// change; the actual numbers now live ONLY in lib/pricing.js (P2-1).
// ============================================================
function getCategoryPrice(qty, category) {
  return buildCategoryPriceText(qty, category, bngDigits);
}
function getLowQtyPrice(qty) {
  return buildLowQtyPriceText(qty, 'affordable', bngDigits); // rates are category-agnostic below 50pcs, matches original
}
function getFullPriceTable(category) {
  return buildPriceTableText(category, bngDigits);
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

    if (!imgBase64 && !customerCaption) return null;

    const captionContext = customerCaption && customerCaption.trim().length > 0
      ? `কাস্টমার ছবির সাথে এই টেক্সট/ক্যাপশন লিখেছে: "${customerCaption.trim()}"`
      : `কাস্টমার ছবির সাথে কোনো অতিরিক্ত টেক্সট লেখেনি।`;

    const candidateHint = topCandidate && topCandidate.code
      ? `ড্রাইভ ক্যাটালগে নিকটতম মিল: ${topCandidate.code} (ক্যাটাগরি: ${topCandidate.category}, সাদৃশ্য: ${(topCandidate.similarity * 100).toFixed(1)}%, ড্রাইভ ম্যাচ: ${topCandidate.isMatch ? 'হ্যাঁ' : 'না'})`
      : `ড্রাইভ ক্যাটালগে সরাসরি কোনো কার্ড মেলেনি।`;

    const prompt = `তুমি "বন্ধন প্রিন্টিং হাউস" (BOONDHON Printing House, Manikganj & Dhaka)-এর একজন অত্যন্ত অভিজ্ঞ ও অমায়িক সিনিয়র সেলস কনসালট্যান্ট "অনন্যা"।
কাস্টমার মেসেঞ্জারে একটি কার্ডের ছবি বা কার্ডের রেফারেন্স পাঠিয়েছে।
${captionContext}
${candidateHint}

আমাদের বিয়ের কার্ডের দুটি প্রধান ক্যাটাগরি ও অফিশিয়াল ড্রাইভ রেট:
${buildPricingBlurbForAI(bngDigits)}

তোমার কাজ:
১. ছবিটি মনোযোগ দিয়ে দেখো:
   - এটি কি কোনো বিয়ের কার্ড? (লেজার কাট, খিলান, ফ্লোরাল, আর্ট কার্ড, বক্স কার্ড, গেটফোল্ড ইত্যাদি)
   - নাকি বিকাশ/নগদের টাকা পাঠানোর স্ক্রিনশট / রিসিট?
   - নাকি সম্পূর্ণ অপ্রাসঙ্গিক কোনো ছবি?

২. যদি বিয়ের কার্ড হয়:
   - আমাদের ড্রাইভ ক্যাটালগের সাথে মিলিয়ে সবার আগে ক্যাটাগরি (Affordable নাকি Premium) নিশ্চিত করো।
   - ড্রাইভ ম্যাচ বা কার্ডের সাইজ ও ডিজাইন অনুযায়ী সঠিক ক্যাটাগরি সিলেক্ট করো।
   - ⚠️ কাস্টমার যদি ক্যাপশনে কোনো মন্তব্য, প্রশ্ন বা দরদাম/দামের প্রস্তাব করে থাকে (যেমন: "১০ টাকা করে ১০০০ টাকা দিবো", "কম রাখা যাবে?", "১০ টাকায় হবে?", "কোন কালার হবে?"):
     * কাস্টমার যা বলেছে বা জানতে চেয়েছে, সবার আগে অত্যন্ত অমায়িক ও আন্তরিকভাবে তার সেই কথার সরাসরি উত্তর দাও।
     * কাস্টমার যদি অবাস্তব কম দামের প্রস্তাব বা দরদাম করে (যেমন: "১০ টাকা করে ১০০০ টাকা দিবো", "১৫ টাকায় হবে?", "১০ টাকায় দেন"):
       - বিনয়ের সাথে মিষ্টি করে বুঝিয়ে বলো যে আমাদের উন্নত মানের বোর্ড/পেপার, ফয়েল প্রিন্টিং ও কাটিং সেটআপ খরচের কারণে এত কম রেটে (যেমন ১০ টাকায়) কার্ডটি তৈরি করা সম্ভব নয়।
       - এরপর আমাদের অফিশিয়াল সর্বনিম্ন রেট (যেমন ২০০ পিসে ৩৫৳/৪৫৳ এবং ২০০+ পিসে ১টি আকর্ষণীয় নিকাহনামা একদম ফ্রি উপহার) সুন্দরভাবে তুলে ধরো।
     * কাস্টমার যদি কালার, ডেলিভারি, ফরম বা অন্য কোনো প্রশ্ন করে, সরাসরি তার সদুত্তর দাও।
     * কাস্টমারের কথার উত্তর না দিয়ে কখনোই শুধু মুখস্থ দামের তালিকা ধরিয়ে দেবে না।
   - কাস্টমার যদি কোনো মন্তব্য না করে থাকে (শুধু ছবি পাঠায়): আন্তরিক প্রশংসা করে ক্যাটাগরির রেট জানাও এবং কত পিস লাগবে জানতে চাও।

৩. যদি পেমেন্ট স্ক্রিনশট হয়:
   - আন্তরিক ধন্যবাদ জানিয়ে বিকাশ/নগদের শেষ ৪টি ডিজিট লিখে দিতে বলো (আমাদের অ্যাকাউন্টস টিম চেক করে দ্রুত নিশ্চিত করবে)।

৪. যদি অপ্রাসঙ্গিক ছবি হয়:
   - ভদ্রভাবে ধন্যবাদ জানিয়ে জানতে চাও তিনি কি বিয়ের কার্ড দেখতে চাইছেন কিনা।

STRICT JSON format:
{
  "type": "WEDDING_CARD" | "PAYMENT_RECEIPT" | "OTHER",
  "detectedCategory": "affordable" | "premium",
  "reply": "বাংলায় তোমার স্পষ্ট, আন্তরিক ও সরাসরি সেলস উত্তর (কাস্টমারের কথার উত্তর সহ ১-৩ লাইনে)"
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
                ...(imgBase64 ? [{
                  inline_data: {
                    mime_type: imgMime,
                    data: imgBase64
                  }
                }] : [])
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 400,
            thinkingConfig: {
              thinkingLevel: "LOW"
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
// NOTE (STEP 26 / ABSOLUTE RULE #4): this function ONLY produces
// natural-language reply TEXT. It never sets a price, quantity, or any
// order/state field — those are all decided by deterministic code
// elsewhere in this file and in lib/pricing.js / lib/order-parser.js
// before this is ever called, or afterward when parsing this reply.
// This function's own output is treated as inert text to send, nothing more.
async function generateAISalesResponse(senderId, customerMessage, conversationHistory) {
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
  if (!GEMINI_API_KEY) return null;

  const systemPrompt = `তুমি "বন্ধন প্রিন্টিং হাউস" (BOONDHON Printing House)-এর একজন অত্যন্ত অভিজ্ঞ, অমায়িক ও চটপটে সিনিয়র সেলস ও কাস্টমার রিলেশনশিপ এক্সপার্ট। তোমার নাম "অনন্যা"।

তোমার দায়িত্ব: কাস্টমার যখনই সাধারণ কোনো বাটন বা কিওয়ার্ড ছাড়া নিজের ভাষায় যেকোনো কিছু জানতে চাইবে, দ্বিধাদ্বন্দ্বে থাকবে বা অপ্রাসঙ্গিক/অস্পষ্ট কথা বলবে, তখন তুমি একজন রক্ত-মাংসের দক্ষ সেলস প্রফেশনালের মতো আন্তরিক ও সাবলীল ভঙ্গিতে কথা বলে তাদের মনের কথা বুঝে অর্ডার পর্যন্ত এগিয়ে নেবে।

🧠 তোমার চিন্তাভাবনা ও কথা বলার ধরন (Expert Sales Psychology):
১. মানুষের মতো স্বাভাবিক প্রতিক্রিয়া ও ইমোশন:
   - কাস্টমারের মেসেজের ভেতরের অনুভূতি, দ্বিধা, ব্যস্ততা বা আনন্দ বুঝে সেই অনুযায়ী কথা শুরু করো। কখনোই রোবোটিক, মুখস্থ বা স্ক্রিপ্ট-বাঁধা উত্তর দেবে না।
   - বিয়ে একটি আনন্দের উপলক্ষ—প্রাসঙ্গিক হলে আন্তরিক শুভেচ্ছা ও শুভকামনা জানাও।
২. কাস্টমার দ্বিধাদ্বন্দ্বে (Confused) বা সিদ্ধান্তহীনতায় থাকলে:
   - সেলসম্যান যেমন বন্ধুসুলভ পরামর্শ দিয়ে পথ সহজ করে দেয়, ঠিক সেভাবে তাকে সাহায্য করো। যেমন: "বাজেট কি একটু সাশ্রয়ীর মধ্যে খুঁজছেন নাকি প্রিমিয়াম লাক্সারি লুক পছন্দ? কত পিস লাগতে পারে জানালে আমি সেরা অপশনটা সাজেস্ট করতে পারি!"
৩. অস্পষ্ট, সংক্ষিপ্ত বা পরোক্ষ (Indirect) কথা বললে — নো ডেড-এন্ড (NO Dead-ends):
   - কখনোই "আমি বুঝতে পারিনি", "আমি এআই বট" বা "আপনার কথা স্পষ্ট নয়" জাতীয় কোনো নিষ্প্রাণ উত্তর দেবে না।
   - একজন দক্ষ সেলসম্যান যেভাবে বুদ্ধি খাটিয়ে কাস্টমারের উদ্দেশ্য আন্দাজ করে প্রশ্ন করে বা অপশন এগিয়ে দেয়, সেভাবে কথা এগিয়ে নাও।
৪. তথ্যের স্বাভাবিক উপস্থাপন (Natural Product Blend):
   - প্রাইস, সাইজ, ডেলিভারি বা পেমেন্টের তথ্যগুলো জোর করে পুরো লিস্ট ধরিয়ে না দিয়ে, কাস্টমার যেটুকু জানতে চেয়েছে সেটার সাথে মিলিয়ে প্রাসঙ্গিকভাবে ১-৩ লাইনে বলো।
   - উত্তর সবসময় সংক্ষিপ্ত ও প্রমিত বাংলায় (১-৩ লাইন) রাখবে, যাতে কাস্টমার পড়তে স্বাচ্ছন্দ্যবোধ করে।
৫. কার্ডের পরিমাণের তারতম্যে দামের যুক্তি ও অফিশিয়াল মিনিমাম অর্ডার নীতি:
   - আমাদের বিয়ের কার্ডের অফিশিয়াল মিনিমাম অর্ডার ৫০ পিস থেকে শুরু।
   - কাস্টমার যখনই সাধারণ দাম জানতে চাইবে ("দাম কত", "প্রাইস কত", "রেট কত"): সবার আগে ৫০, ১০০ ও ২০০ পিসের দাম জানাবে। নিজে থেকে কখনোই ১-৪৯ পিসের কথা উল্লেখ করবে না।
   - কাস্টমার যদি নিজে থেকে ৫০ পিসের কম কার্ড চায় (যেমন: "১০ পিস লাগবে", "২০ পিস হবে?", "কম পিস নেওয়া যাবে?"):
     * সবার আগে ৫০, ১০০ ও ২০০ পিসের দাম তুলে ধরবে এবং বলবে যে আমাদের মিনিমাম অর্ডার ৫০ পিস থেকে শুরু, কারণ ৫০ বা ১০০ পিস বানালে ডাইস, প্লেট ও সেটআপ খরচ ভাগ হয়ে প্রতি পিস অনেক সাশ্রয়ী পড়ে।
     * এরপর জানাবে: তবে আপনার যদি নিতান্তই কম পিস প্রয়োজন হয়, বিশেষ ব্যবস্থায় ফিক্সড মেকিং ও ডাইস চার্জ সহ তৈরি করা যাবে (১-৫ পিস ১,০০০৳, ৬-১০ পিস ১,৫০০৳, ১১-৪৯ পিস প্রতি পিস ৭৫৳)।
     * কাস্টমারকে বুঝিয়ে বলবে যে ৫০ পিস নেওয়া সবচেয়ে লাভজনক ও সাশ্রয়ী।
   - কাস্টমার যদি প্রশ্ন করে "১টা কার্ডের কমবেশিতে এত পার্থক্য কেন?", "৪৯ আর ৫০ এ এত ব্যবধান কেন?", বা "কম নিলে বেশি রেট কেন?":
     * কাস্টমারকে সহজ ও মিষ্টি করে বুঝিয়ে বলো: প্রিন্টিং কারখানায় প্রতিটি কার্ডের জন্য কাটিং ডাইস, ফয়েল ব্লক ও স্ক্রিন প্রিন্টিংয়ের প্লেট তৈরির একটি নির্দিষ্ট ফিক্সড সেটআপ খরচ থাকে—যা ১টি কার্ড হলেও করতে হয়, ১০০টি বানালেও একই সেটআপ লাগে। তাই ৫০ বা ১০০ পিস বানালে সেই সেটআপ খরচটি ভাগ হয়ে প্রতি পিসের খরচ অনেক কমে যায় (৫৫৳ বা ৪৫৳)। কিন্তু ১-৪৯ পিসের ক্ষেত্রে ফিক্সড খরচের কারণে প্রতি পিস ৭৫৳ বা ফিক্সড মেকিং চার্জ পড়ে। তাই ৫০ পিস নেওয়া অনেক বেশি লাভজনক ও সাশ্রয়ী!
৬. 💰 দাম নিয়ে আপত্তি ও হ্যান্ডলিং (Price Objection Handling):
   যখন কাস্টমার দাম নিয়ে আপত্তি করবে, নিচের কৌশলটি অনুসরণ করবে (ফ্ল্যাট ডিসকাউন্ট কখনো নিজে থেকে দেবে না):
   • ১. সাধারণ অভিযোগ — "দাম বেশি" / "price beshi" (প্রতিযোগীর নির্দিষ্ট রেফারেন্স ছাড়া):
     - সহানুভূতিশীল (empathetic) হয়ে বাজেট জিজ্ঞেস করো এবং ম্যাটেরিয়াল ও প্রিন্টিং কোয়ালিটির ভ্যালু তুলে ধরো।
     - যেমন: "আপনার budget বুঝতে পারছি। আমাদের দামে material ও printing quality-তে compromise নাই — laser cut, foil সব premium গ্রেডের। আপনি কত পিস আর কী budget ভাবছেন বললে, best option বের করে দিচ্ছি।"
     - ফ্ল্যাট ডিসকাউন্ট অফার না করে কাস্টমারের আসল budget ও quantity বের করার দিকে আলোচনা এগিয়ে নাও।
   • ২. অন্য পেজের সাথে তুলনা — "অন্য জায়গায় কম দামে পাচ্ছি" / "onno page e kom":
     - সরাসরি দামের লড়াই বা বিতর্কে না গিয়ে "হিডেন কস্ট" (hidden cost) এর দিকটি সুন্দর করে তুলে ধরো।
     - বিনয়ের সাথে জিজ্ঞেস করো—ওই দামে প্রিন্টিং চার্জ বা প্লেট খরচ আলাদা কিনা?
     - বুঝিয়ে বলো যে BOONDHON-এর দামে কার্ডের নিখুঁত প্রিন্টিং + ডেলিভারি সাপোর্ট + রিপ্রিন্ট গ্যারান্টি (কোনো ভুল হলে নিজ দায়িত্বে সমাধান) সব অন্তর্ভুক্ত থাকে, তাই সামগ্রিক হিসাব তুলনা করলে আমাদের সার্ভিস সমান বা আরও ভালো ও নিরাপদ পড়বে।
   • ৩. সরাসরি ছাড় বা ডিসকাউন্ট চাইলে ("কিছু ছাড় দেন" / "discount হবে?"):
     - আন্তরিকতার সাথে বলো যে প্রিমিয়াম মেটেরিয়াল ও মেকিং কস্ট ফিক্সড থাকায় ফ্ল্যাট ডিসকাউন্ট সম্ভব না (দুঃখ প্রকাশসহ)।
     - কিন্তু বেশি পরিমাণ (যেমন: ১০০ পিস বা ২০০+ পিস) নিলে যে প্রতি পিসের রেট অনেক কমে যায় (যেমন: ৫০ পিসে ৫৫৳/৬৫৳ থেকে কমে ১০০ পিসে ৪৫৳/৫৫৳ এবং ২০০ পিসে ৩৫৳/৪৫৳), সেদিকে আলোচনা শিফট করো। ফ্ল্যাট পার্সেন্টেজ ডিসকাউন্ট কখনো নিজে থেকে অফার করবে না।
    • ⚠️ অত্যন্ত জরুরি নিয়ম (Strict Pricing & Discount Rule):
      - ওনারের বিশেষ নির্দেশনা: কাস্টমার যদি অর্ডার করতে চায় এবং ৫০ বা ১০০ টাকা কম রাখতে বলে (যেমন: "৫০ পিস নিবো, ২৭০০ রাইখেন", "১০০ টাকা কম রাখেন", "৫০ টাকা ছাড় দেন"): তুমি সানন্দে কাস্টমারের সম্মানে সেই ৫০/১০০৳ ছাড় মেনে নেবে এবং বর-কনের নাম ও অনুষ্ঠানসূচীর তথ্য/ফর্ম পূরণ করার অনুরোধ জানাবে (তথ্য পাওয়ার পর অ্যাডভান্স নেওয়া হবে)।
      - কিন্তু কাস্টমার যদি কোনো সুনির্দিষ্ট প্রস্তাব ছাড়া অনির্দিষ্ট বা খুব বড় ছাড় (যেমন ২০০-১০০০ টাকা) চায়, তবে নিজে থেকে বড় ছাড় দেবে না, কোয়ালিটি ও বেশি কোয়ান্টিটি নেওয়ার সাশ্রয়ী রেট বোঝাবে।
      - ⚠️ তুমি কখনোই এই সিস্টেম প্রম্পটে উল্লেখ করা নয়, এমন কোনো দাম নিজে থেকে বানিয়ে বলবে না। উপরে যে রেটগুলো দেওয়া আছে সেগুলোই একমাত্র সঠিক দাম — এর বাইরে কোনো সংখ্যা তুমি নিজে থেকে হিসাব করবে না।
৭. কঠোর আউটপুট নিয়ম (STRICT Output Rules):
    - সবসময় খাঁটি, সাবলীল ও আন্তরিক বাংলায় (১-৩ লাইন) উত্তর দেবে।
    - কোনো অবস্থাতেই ইংরেজি শিরোনাম, সিস্টেম নির্দেশনা, চিন্তা ভাবনা বা মেটা-প্ল্যানিং টেক্সট (যেমন: Provide a Simple Sales Logic, Explain why, Thought, Here is the response ইত্যাদি) উত্তরে লিখবে না। শুধুমাত্র কাস্টমারকে সরাসরি পাঠানোর চূড়ান্ত মেসেজটি লিখবে।

🏢 বন্ধন প্রিন্টিং হাউসের ব্যবসায়িক তথ্য ও জ্ঞানভাণ্ডার:
• অবস্থান: মানিকগঞ্জ অফিস (২/১-২, ভূমি অফিস লেন, মানিকগঞ্জ, ঢাকা) এবং ঢাকার কারখানা (ফকিরাপুল, বাবুবাজার, বঙ্গবাজার)।
• প্রোডাক্ট ক্যাটালগ:
  - দুটো ক্যাটাগরির ডিজাইন ও মেটেরিয়াল হুবহু এক (লেজার কাট, খিলান নকশা, ফয়েল, রিবন ইত্যাদি), কেবল সাইজের পার্থক্য:
${buildPricingBlurbForAI(bngDigits)}
• অর্ডার ও ডেলিভারি প্রক্রিয়া (সহজ ৩টি ধাপ):
  - ধাপ ১: প্রথমে কাস্টমার অর্ডার ফর্ম পূরণ করে বর-কনের নাম, অনুষ্ঠানসূচী ইত্যাদি তথ্য লিখে পাঠাবে।
  - ধাপ ২: তথ্য পাওয়ার পর অর্ডার কনফার্ম করতে ৩০% অগ্রিম (বিকাশ/নগদ/রকেট: 01682588856) নেওয়া হবে। অগ্রিমের পর আমাদের ডিজাইনার কাস্টমারের তথ্য দিয়ে ডিজাইন তৈরি করে মেসেঞ্জার/হোয়াটসঅ্যাপে প্রুফ চেক করাবে।
  - ধাপ ৩: কাস্টমার ডিজাইন 'ওকে' করার পরই কেবল প্রিন্ট হবে। সারা দেশে জেলা শহরে ক্যাশ অন ডেলিভারি (৫-৭ কর্মদিবস)।
  - ⚠️ নিয়ম: শুরুতেই হুট করে পেমেন্ট নম্বর ধরিয়ে দেবে না। আগে অর্ডার সিস্টেম ও ফর্ম পূরণ করতে বলবে, ফর্মের তথ্য পাওয়ার পর ৩০% অ্যাডভান্স চাইবে।
• ⚠️ পাইকারি/হোলসেল নীতি (Strict Retail Only Policy):
  - আমরা পাইকারি (Wholesale) বা ডিলার/রিসেলার হিসেবে কোনো কার্ড বিক্রি করি না।
  - আমরা শুধুমাত্র সরাসরি গ্রাহকদের বিয়ের অনুষ্ঠানের জন্য খুচরা (Retail) কার্ড ডিজাইন ও প্রিন্ট করে সরবরাহ করি।
  - কেউ পাইকারি কার্ড বা ডিলারশিপ চাইলে বিনয়ের সাথে স্পষ্ট জানিয়ে দেবে যে আমরা কোনো পাইকারি কার্ড দিই না, শুধুমাত্র খুচরা রিটেইল করি। কাস্টমারের নিজের জন্য কার্ড লাগলে কত পিস লাগবে জিজ্ঞেস করবে।
• হটলাইন: 01701016826 (বন্ধন হটলাইন)।

🎯 তোমার লক্ষ্য: কাস্টমারকে আপন করে নেওয়া, তাদের দ্বিধা দূর করা এবং হাসিমুখে অর্ডারের দিকে এগিয়ে নিয়ে যাওয়া।`;

  try {
    const recentMsgs = (conversationHistory || []).slice(-10).map(msg => ({
      role: msg.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: msg.text || '(media)' }]
    }));

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
            maxOutputTokens: 600,
            thinkingConfig: {
              thinkingLevel: "LOW"
            }
          }
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const candidate = data?.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        const textParts = parts.filter(p => !p.thought && p.text && typeof p.text === 'string');
        let reply = (textParts.length > 0 ? textParts.map(p => p.text).join('\n') : (parts[0]?.text || '')).trim();

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

// In-memory cache for sent card lookups by Facebook message ID (mid).
// KEPT as a perf optimization only — every write here is also written
// durably via recordSentCardMessage(), so losing this cache on a cold
// start just means one extra durable-store read, not lost data (unlike
// the original selectedCardMap/userCategoryMap/humanTakeoverMap, which
// WERE the only place some state lived and are removed below — P0-3).
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
async function getSentCardInfo(phone, mid) {
  if (!mid) return null;
  const mem = getCachedSentCard(mid);
  if (mem) return mem;
  return getSentCardByMid(phone, mid);
}

// Same rationale as sentCardsCache above: fast local cache in front of
// the durable setUserAwaitingPayment/isUserAwaitingPayment store calls.
const awaitingPaymentSet = new Set();
async function setCustomerAwaitingPayment(senderId, status) {
  if (status) {
    awaitingPaymentSet.add(senderId);
  } else {
    awaitingPaymentSet.delete(senderId);
  }
  await setUserAwaitingPayment(senderId, status);
}
async function checkCustomerAwaitingPayment(senderId) {
  if (awaitingPaymentSet.has(senderId)) return true;
  return isUserAwaitingPayment(senderId);
}

// Send Direct Full-Size Image Attachment with Message ID Tracking
async function sendMessengerImage(recipientId, id, category = null) {
  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const isDirectUrl = String(id).startsWith('http://') || String(id).startsWith('https://');
  const primaryUrl = isDirectUrl ? id : `https://boondhon-platform-qr9a.vercel.app/api/img/${id}.jpg`;
  const fallbackUrl = isDirectUrl ? id : `https://lh3.googleusercontent.com/d/${id}`;

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
      await recordSentCardMessage(recipientId, data.message_id, id, category, primaryUrl);
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
        await recordSentCardMessage(recipientId, fbData.message_id, id, category, fallbackUrl);
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

// In-memory deduplication cache for Facebook Webhook retries. This is the
// CORRECT dedup mechanism (keyed on Facebook's own unique message id) —
// unchanged from the original. See P1-4 for what changed around it.
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

// ============================================================
// FIX NOTE (P1-4 / STEP 18): the original file also had a *second*,
// time-based debounce (isUserDebounced) that silently DROPPED any text
// message arriving within 1.5s of the previous one, and any text
// arriving within 3s of a photo — with no queueing, no merging, just a
// silent `continue`. That's real customer messages disappearing with
// zero reply and zero indication anything happened, which is exactly
// what STEP 18 / ABSOLUTE RULE #7 says must never happen.
//
// isDuplicateEvent() above (keyed on Facebook's own unique message id)
// is the correct, sufficient guard against TRUE duplicate webhook
// deliveries. A caption sent in the same bubble as a photo already
// arrives as ONE event with both `attachments` and `text` populated
// (handled via `customerPhotoCaption` below) — a separate subsequent
// bubble is a genuinely distinct customer message and should just be
// processed normally. So the extra time-based debounce is removed
// entirely rather than "fixed", since it wasn't solving a real problem
// isDuplicateEvent doesn't already solve.
// ============================================================

// Fetch a customer's Facebook display name once, for admin usability
// (P1-7 / STEP 17). Gracefully falls back to the existing generic name
// (handled inside appendMessage/chat-store) if the call fails or the
// token lacks the permission.
async function fetchCustomerNameSafe(senderId) {
  if (!PAGE_ACCESS_TOKEN || !senderId) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${senderId}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
    return name || null;
  } catch (err) {
    console.warn('fetchCustomerNameSafe failed (non-fatal, falling back to generic name):', err.message);
    return null;
  }
}

// Human takeover wrappers — durable store (Vercel KV) is now the source
// of truth; a short in-memory cache sits in front purely to avoid a
// network round trip on every single message from an already-known
// takeover customer within the same warm instance (P0-3: NOT the primary
// store anymore, unlike the original selectedCardMap/humanTakeoverMap).
const humanTakeoverMemCache = new Map();
const TAKEOVER_DURATION_MS = 15 * 60 * 1000; // 15 minutes for natural/automatic takeover
const EXPLICIT_TAKEOVER_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours for explicit admin /off

async function setHumanTakeoverSafe(userId, active, isExplicit = false) {
  if (active) {
    humanTakeoverMemCache.set(userId, {
      time: Date.now(),
      isExplicitOff: Boolean(isExplicit)
    });
  } else {
    humanTakeoverMemCache.delete(userId);
  }
  await setHumanTakeover(userId, active, isExplicit);
}

async function getHumanTakeoverState(userId) {
  const now = Date.now();

  const mem = humanTakeoverMemCache.get(userId);
  if (mem) {
    const memTime = typeof mem === 'object' ? mem.time : mem;
    const isExplicitOff = typeof mem === 'object' ? Boolean(mem.isExplicitOff) : false;
    const ttl = isExplicitOff ? EXPLICIT_TAKEOVER_DURATION_MS : TAKEOVER_DURATION_MS;
    if (now - memTime < ttl) {
      return { active: true, isExplicitOff };
    } else {
      humanTakeoverMemCache.delete(userId);
    }
  }

  // 1. DISTRIBUTED CHECK: Upstash Redis instant takeover check across all instances
  try {
    const redisState = await getTakeoverState(userId);
    if (redisState && redisState.active) {
      humanTakeoverMemCache.set(userId, {
        time: now,
        isExplicitOff: Boolean(redisState.isExplicitOff)
      });
      return { active: true, isExplicitOff: Boolean(redisState.isExplicitOff) };
    }
  } catch (_) {}

  // 2. LIVE CHECK: Query Facebook Graph API directly for a human admin reply
  // from Page Inbox / Messenger app in the last 15 minutes (or 24h for explicit off).
  if (PAGE_ACCESS_TOKEN && userId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const url = `https://graph.facebook.com/v20.0/${PAGE_ID}/conversations?user_id=${userId}&fields=messages.limit(5){from,created_time,message,tags}&access_token=${PAGE_ACCESS_TOKEN}`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const messages = data?.data?.[0]?.messages?.data || [];

        for (const msg of messages) {
          if (msg.from?.id === PAGE_ID) {
            const msgTime = new Date(msg.created_time).getTime();
            const elapsed = now - msgTime;

            const msgContent = (msg.message || '').trim().toLowerCase();
            // If the admin's most recent message is a trigger command, immediately cancel takeover!
            if (['/active', 'active', '/bot', 'bot', '/on', 'on', '/start', 'start'].includes(msgContent)) {
              console.log(`🤖 Admin explicitly resumed bot with command "${msg.message}" for ${userId}. Takeover deactivated!`);
              humanTakeoverMemCache.delete(userId);
              await setHumanTakeoverSafe(userId, false);
              return { active: false, isExplicitOff: false };
            }

            // If the admin's most recent message is an explicit OFF command:
            if (['/off', 'off', '/pause', 'pause', '/stop', 'stop', '/admin', 'admin'].includes(msgContent)) {
              if (elapsed < EXPLICIT_TAKEOVER_DURATION_MS) {
                console.log(`🛑 Live Graph API detected EXPLICIT ADMIN /OFF for ${userId}`);
                humanTakeoverMemCache.set(userId, { time: msgTime, isExplicitOff: true });
                return { active: true, isExplicitOff: true };
              }
              break;
            }

            if (elapsed >= TAKEOVER_DURATION_MS) break;

            const tagNames = (msg.tags?.data || []).map(t => (t.name || '').toLowerCase());
            const isHumanReply = tagNames.includes('messenger') ||
                                 tagNames.includes('source:mobile') ||
                                 tagNames.includes('source:page_inbox');

            if (isHumanReply) {
              console.log(`🙋 LIVE HUMAN TAKEOVER confirmed from Facebook for ${userId}! Admin replied ${Math.round(elapsed / 1000)}s ago. Bot paused for 15 min.`);
              humanTakeoverMemCache.set(userId, { time: msgTime, isExplicitOff: false });
              return { active: true, isExplicitOff: false };
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error querying Facebook for human takeover:', err.message);
      }
    }
  }

  // 3. Durable store (source of truth)
  try {
    const conv = await getConversation(userId);
    if (conv && conv.humanTakeover === true) {
      const isExplicitOff = Boolean(conv.isExplicitOff);
      const lastAdmin = conv.lastAdminReplyTime || 0;
      const ttl = isExplicitOff ? EXPLICIT_TAKEOVER_DURATION_MS : TAKEOVER_DURATION_MS;
      if (now - lastAdmin < ttl) {
        humanTakeoverMemCache.set(userId, { time: lastAdmin, isExplicitOff });
        return { active: true, isExplicitOff };
      } else {
        await setHumanTakeover(userId, false);
        return { active: false, isExplicitOff: false };
      }
    }
  } catch (e) {}

  return { active: false, isExplicitOff: false };
}

async function isHumanTakeoverActive(userId) {
  const state = await getHumanTakeoverState(userId);
  return state.active;
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

  if (offset >= totalCount) {
    const finishMsg = `আমাদের মোট ${bngDigits(totalCount)}টি ${typeName} ডিজাইনের সবকটি আপনি ইতিমধ্যে দেখে ফেলেছেন! 🎉😍\n\nকোন কার্ডটি আপনার সবচেয়ে পছন্দ হয়েছে? কত পিস লাগবে বলুন, সুন্দরভাবে বানিয়ে দেবো! 😊\n(অথবা ${altTypeName} কালেকশন দেখতে পারেন)`;
    await sendMessengerButtonBlock(recipientId, finishMsg, [
      switchBtn,
      { title: "দাম জানুন", payload: "BTN_PRICE" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(recipientId, 'bot', finishMsg);
    return;
  }

  const batch = idsList.slice(offset, offset + 8);
  const seenCount = Math.min(offset + batch.length, totalCount);
  const isFinished = seenCount >= totalCount;
  const nextOffset = offset + batch.length;

  await setCurrentCategory(recipientId, type);
  // NEW (STEP 7/8): remember exactly which cards were just shown, in
  // order, so a later "৩ নম্বরটা চাই" / "এইটা ভালো" can be resolved
  // without the customer needing to reply-to/quote the specific photo.
  await setLastShownCards(recipientId, batch);

  for (const id of batch) {
    await sendMessengerImage(recipientId, id, type);
    await delay(180);
  }

  await delay(400);

  let progressText = '';
  let buttons = [];

  if (isFinished) {
    progressText = `আমাদের মোট ${bngDigits(totalCount)}টি ${typeName} ডিজাইনের সবকটি আপনি দেখে ফেলেছেন! 🎉😍\n\nকোন কার্ডটি আপনার সবচেয়ে পছন্দ হয়েছে? কত পিস লাগবে বলুন, নিখুঁতভাবে বানিয়ে দেবো! 😊\n(অথবা ${altTypeName} কালেকশন দেখতে পারেন)`;

    buttons = [
      switchBtn,
      { title: "দাম জানুন", payload: "BTN_PRICE" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ];
  } else {
    progressText = `আমাদের মোট ${bngDigits(totalCount)}টি ${typeName} ডিজাইনের মধ্যে আপনি ${bngDigits(seenCount)}টি দেখেছেন। 😍\n\nআরও দেখতে 'আরও দেখুন' বাটনে চাপুন। কত পিস লাগবে আপনার? 😊`;
    const morePayload = `MORE_${type.toUpperCase()}_${nextOffset}`;

    buttons = [
      { title: "আরও দেখুন", payload: morePayload },
      switchBtn,
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ];
  }

  await sendMessengerButtonBlock(recipientId, progressText, buttons);
  await appendMessage(recipientId, 'bot', progressText);
}

// ============================================================
// NEW (P0-4 / P0-5 / STEP 5/6/11/12/13/14): structured order collection,
// summary, and correction flow. All state transitions are deterministic
// (conversationStage + order fields in the durable store) — the AI layer
// is never consulted for any of this.
// ============================================================

/** Build the STEP 11-format order summary text from a customer's stored order + selection. */
function buildOrderSummaryText(order, selectedCard, category) {
  const catLabel = category === 'premium' ? '✨ Premium' : (category === 'affordable' ? '💚 Affordable' : '—');
  const cardLabel = selectedCard?.code || selectedCard?.cardId || catLabel;
  const qty = order.quantity;
  // FIX: previously only computed a price for qty>=50 and showed nothing
  // (null) for 1-49 piece orders, even though those are explicitly
  // supported (see getOrderTotal's doc comment). getOrderTotal/
  // getOrderPerPiece correctly dispatch to the low-qty fixed-band pricing
  // for those.
  const perPiece = qty ? getOrderPerPiece(qty, category || 'affordable') : null;
  const total = qty ? getOrderTotal(qty, category || 'affordable') : null;

  const lines = [
    `📋 আপনার অর্ডারের তথ্য:`,
    ``,
    `💌 কার্ড: ${cardLabel} (${catLabel})`,
    `📦 পরিমাণ: ${qty ? bngDigits(qty) + ' পিস' : '❓ (এখনও দেওয়া হয়নি)'}`,
  ];
  if (total) {
    lines.push(`💰 প্রতি পিস: ${bngDigits(perPiece)}৳`);
    lines.push(`💵 মোট: ${bngDigits(total.toLocaleString('en-IN'))}৳`);
  }
  lines.push(``);
  for (const field of Parser.WEDDING_FIELD_ORDER) {
    const label = Parser.WEDDING_FIELD_LABELS_BN[field];
    lines.push(`${label}: ${order[field] || '❓ (এখনও দেওয়া হয়নি)'}`);
  }
  lines.push(``);
  lines.push(`সব তথ্য ঠিক আছে?`);
  return lines.join('\n');
}

async function sendOrderSummary(senderId) {
  const order = await getOrder(senderId);
  const selectedCard = await getSelectedCard(senderId);
  const category = (await getCurrentCategory(senderId)) || selectedCard?.category || 'affordable';
  const qty = order?.quantity || 100;
  const total = qty ? getOrderTotal(qty, category) : 0;
  const advance = getAdvanceAmount(total);

  const text = buildOrderSummaryText(order, selectedCard, category);
  await setConversationStage(senderId, 'reviewing');
  await setAwaitingField(senderId, null);
  await sendMessengerButtonBlock(senderId, text, [
    { title: "✅ কনফার্ম করছি", payload: `BTN_CONFIRM_ORDER|${category}|${qty}|${advance}` },
    { title: "✏️ তথ্য ঠিক করতে চাই", payload: "BTN_EDIT_ORDER" },
    { title: "❌ বাতিল করব", payload: "BTN_CANCEL_ORDER" },
  ]);
  await appendMessage(senderId, 'bot', text);
}

const QUANTITY_QUESTION = 'মোট কত পিস কার্ড লাগবে সেটা বলবেন? (যেমন: ৫০ পিস)';

/**
 * Ask for whichever field is still missing, one at a time (STEP 6).
 * Quantity is treated as just another slot in the same walk (via
 * Parser.nextMissingOrderField) instead of being special-cased ahead of
 * every other field on every turn — that used to make the bot re-ask
 * "কত পিস লাগবে?" after EVERY answer until quantity specifically was
 * given, derailing collection of the other fields. Also records which
 * field this question is about (setAwaitingField) so a bare, keyword-free
 * reply to it can still be understood in handleWeddingInfoMessage below.
 */
async function askNextMissingField(senderId) {
  const order = await getOrder(senderId);
  const missing = Parser.nextMissingOrderField(order);
  if (!missing) {
    await sendOrderSummary(senderId);
    return;
  }
  await setAwaitingField(senderId, missing);
  const question = missing === 'quantity' ? QUANTITY_QUESTION : Parser.WEDDING_FIELD_QUESTIONS[missing];
  await setConversationStage(senderId, 'collecting_info');
  await sendMessengerText(senderId, question);
  await appendMessage(senderId, 'bot', question);
}

/**
 * Handle a message while we're actively collecting order info (or the
 * customer just pasted the whole form). Extracts whatever fields are
 * present (STEP 5/6 — full paste, single field, or several fields in one
 * line all work through the same extractor), saves them, and continues
 * to the next missing field or the summary. Returns true if it handled
 * the message (so the caller's big if/else chain can skip everything else).
 *
 * FIX: the previous version (a) re-asked for quantity on every single
 * turn until it was specifically given, even after other fields had just
 * been saved, breaking the natural one-field-at-a-time flow, and
 * (b) required quantity to be >= 50 to be accepted at all, silently
 * dropping legitimate low-quantity orders (the bot explicitly tells
 * customers "১-৪৯ পিস অল্প পরিমাণেও নিতে পারবেন!" elsewhere — 1-49 piece
 * orders are a real, supported case). Both are fixed here. It also now
 * falls back to Parser.getAwaitingField so a bare reply with no keyword
 * ("গুলশান কমিউনিটি সেন্টার" with nothing else) is still understood as
 * the answer to whichever single question was just asked, rather than
 * only working when the customer happens to repeat a label like "ভেন্যু:".
 */
async function handleWeddingInfoMessage(senderId, text) {
  const extracted = Parser.extractWeddingFields(text);
  const qtyResult = Parser.extractQuantity(text);

  const toSave = { ...extracted };
  const currentOrder = await getOrder(senderId);
  if (qtyResult && qtyResult.qty > 0) {
    // Only trust a quantity mention here if we don't already have a
    // confirmed one — avoids accidentally overwriting an already-set
    // quantity with an unrelated number mentioned in passing (a phone
    // number, an address house-number, etc). Deliberate quantity CHANGES
    // are handled separately by the dedicated quantity-change branch
    // before this function is ever reached.
    if (!currentOrder.quantity) toSave.quantity = qtyResult.qty;
  }

  if (Object.keys(toSave).length === 0) {
    // Nothing recognizable via labels/keywords — if we know exactly which
    // single field our last message asked about, treat this whole message
    // as a bare answer for THAT field (guarded so we never swallow an
    // intent/greeting/empty message as if it were field data).
    const awaiting = await getAwaitingField(senderId);
    if (awaiting && awaiting !== 'quantity' && Parser.isPlausibleBareFieldAnswer(text)) {
      toSave[awaiting] = text.trim();
    }
  }

  if (Object.keys(toSave).length === 0) {
    // Still nothing recognizable — re-ask the current question instead of
    // silently doing nothing (ABSOLUTE RULE #10: don't guess, don't go silent).
    const missing = Parser.nextMissingOrderField(currentOrder) || 'quantity';
    const msg = missing === 'quantity'
      ? `দুঃখিত, বুঝতে পারিনি। ${QUANTITY_QUESTION}`
      : `দুঃখিত, ঠিক বুঝতে পারিনি। ${Parser.WEDDING_FIELD_QUESTIONS[missing]}`;
    await sendMessengerText(senderId, msg);
    await appendMessage(senderId, 'bot', msg);
    return true;
  }

  await updateOrder(senderId, toSave);
  await askNextMissingField(senderId);
  return true;
}

// ============================================================
// Webhook signature verification & Raw Body extraction (P1-5)
// ============================================================
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBodyBuffer(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.rawBody === 'string') return Buffer.from(req.rawBody, 'utf8');
  if (Buffer.isBuffer(req.body)) return req.body;

  if (req.readableEnded || (req.complete && req.body && Object.keys(req.body).length > 0)) {
    return Buffer.from(JSON.stringify(req.body), 'utf8');
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', err => reject(err));
  });
}

function verifyWebhookSignature(req, rawBuffer) {
  if (!FB_APP_SECRET) {
    return { ok: true, skipped: true };
  }
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !signature.startsWith('sha256=')) {
    return { ok: false, reason: 'missing signature header' };
  }
  if (!rawBuffer || rawBuffer.length === 0) {
    return { ok: false, reason: 'empty raw body buffer' };
  }
  const cleanSecret = FB_APP_SECRET.replace(/^["']|["']$/g, '').trim();
  const expected = 'sha256=' + crypto.createHmac('sha256', cleanSecret).update(rawBuffer).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.warn(`[security] Signature mismatch. Received: ${signature.substring(0, 15)}..., Expected: ${expected.substring(0, 15)}...`);
    return { ok: false, reason: 'signature mismatch' };
  }
  return { ok: true, skipped: false };
}

let pageSubscriptionChecked = false;
async function ensurePageSubscribed() {
  if (pageSubscriptionChecked || !PAGE_ACCESS_TOKEN) return;
  pageSubscriptionChecked = true;
  try {
    const fields = 'messages,messaging_postbacks,message_reads,message_echoes';
    const res = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?subscribed_fields=${fields}&access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST'
    });
    const data = await res.json();
    console.log('[messenger] ensurePageSubscribed result:', JSON.stringify(data));
  } catch (err) {
    console.error('[messenger] ensurePageSubscribed error:', err.message);
  }
}

export default async function handler(req, res) {
  ensurePageSubscribed();

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
      const rawBuffer = await getRawBodyBuffer(req);
      const sigCheck = verifyWebhookSignature(req, rawBuffer);
      if (!sigCheck.ok) {
        logError({ route: 'messenger.webhook', error: `Rejected: ${sigCheck.reason}` });
        return res.status(403).send('Invalid signature');
      }
      if (sigCheck.skipped) {
        // Logged once per cold start, not per request, to avoid log spam.
        if (!globalThis.__boondhonWarnedNoAppSecret) {
          globalThis.__boondhonWarnedNoAppSecret = true;
          console.warn('[security] FB_APP_SECRET not set — webhook signature verification is DISABLED. Set FB_APP_SECRET to enable it.');
        }
      }

      let body = req.body;
      if (!body || Object.keys(body).length === 0) {
        try {
          const bodyStr = rawBuffer.toString('utf8');
          body = bodyStr ? JSON.parse(bodyStr) : {};
        } catch (jsonErr) {
          logError({ route: 'messenger.webhook', error: `JSON parse failed: ${jsonErr.message}` });
          return res.status(400).send('Invalid JSON');
        }
      }

      if (body.object === 'page') {
        const entries = body.entry || [];

        for (const entry of entries) {
          const messagingEvents = entry.messaging || [];
          for (const webhookEvent of messagingEvents) {
            // ============================================================
            // FIX (P0-2 / STEP 3): per-event isolation. Every event below
            // is now wrapped in its own try/catch so that one event
            // throwing (including any bug of the same shape as the
            // existingConv crash this replaces, P0-1) can NEVER prevent
            // the other events in this same webhook batch — which can
            // belong to a completely different customer — from being
            // processed and replied to.
            // ============================================================
            try {
              await processOneEvent(webhookEvent);
            } catch (evErr) {
              logError({
                route: 'messenger.webhook.event',
                eventId: webhookEvent?.message?.mid || null,
                customerId: webhookEvent?.sender?.id || null,
                error: evErr,
              });
              try {
                const fallbackSenderId = webhookEvent?.sender?.id;
                if (fallbackSenderId && fallbackSenderId !== PAGE_ID) {
                  await sendMessengerText(
                    fallbackSenderId,
                    'দুঃখিত, একটু সমস্যা হয়েছে। 🙏 আবার লিখুন, অথবা সরাসরি কল/হোয়াটসঅ্যাপ করুন: 📞 01701016826'
                  );
                }
              } catch (_) { /* best-effort only, never let the fallback itself crash the loop */ }
            }
          }
        }

        return res.status(200).send('EVENT_RECEIVED');
      }

      return res.status(404).send('Not a Messenger Event');
    } catch (err) {
      logError({ route: 'messenger.webhook', error: err });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
}

// Helper: When admin re-activates the bot via /active or /on,
// immediately reply to the customer's last pending message!
async function replyToLastCustomerMessage(recipientId) {
  if (!recipientId) return;

  let lastText = '';
  let lastAttachments = null;

  const triggerCommands = [
    '/on', 'on', '/active', 'active', '/bot', 'bot', '/start', 'start',
    '/off', 'off', '/pause', 'pause', '/stop', 'stop', '/admin', 'admin',
    '/card', '/cards', 'card', 'cards', '/affordable', 'affordable',
    '/premium', 'premium', '/rules', '/rule', '/policy', 'policy', 'rules',
    '/form', 'form', '/price', 'price', '/rate', '/dam', '/payment', '/advance'
  ];

  // 1. PRIMARY: Check live Facebook Graph API first (ground truth across all Vercel instances)
  if (PAGE_ACCESS_TOKEN) {
    try {
      const graphUrl = `https://graph.facebook.com/v20.0/me/conversations?user_id=${recipientId}&fields=messages.limit(10){from,created_time,message,attachments,tags}&access_token=${PAGE_ACCESS_TOKEN}`;
      const gRes = await fetch(graphUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        const msgs = gData?.data?.[0]?.messages?.data || [];

        // Scan all pending customer messages sent while waiting/since last bot reply
        const unrepliedCustomerMsgs = [];
        for (const m of msgs) {
          if (m.from?.id && String(m.from.id) === PAGE_ID) {
            const mText = (m.message || '').trim().toLowerCase();
            if (triggerCommands.includes(mText)) continue; // ignore admin trigger command
            const tags = (m.tags?.data || []).map(t => (t.name || '').toLowerCase());
            const isHuman = tags.includes('messenger') || tags.includes('source:mobile') || tags.includes('source:page_inbox');
            if (!isHuman) {
              // Bot already replied prior to this, stop scanning older messages
              break;
            }
          } else {
            // Customer message
            unrepliedCustomerMsgs.push(m);
          }
        }

        if (unrepliedCustomerMsgs.length > 0) {
          // Look for a substantive customer message (e.g. question, order query, quantity, photo)
          // rather than a generic greeting ("hi", "hello", "Get Started") that customer sent while waiting!
          const meaningfulMsg = unrepliedCustomerMsgs.find(m => {
            const t = (m.message || '').trim().toLowerCase();
            const hasAtt = m.attachments?.data && m.attachments.data.length > 0;
            return hasAtt || (t && !['hi', 'hello', 'hey', 'হাই', 'হ্যালো', 'get started', 'get_started', 'start', 'শুরু'].includes(t));
          });

          const targetMsg = meaningfulMsg || unrepliedCustomerMsgs[0];
          lastText = targetMsg.message || '';
          if (targetMsg.attachments?.data && Array.isArray(targetMsg.attachments.data)) {
            lastAttachments = targetMsg.attachments.data.map(att => ({
              type: att.mime_type?.startsWith('image') || att.image_data ? 'image' : 'fallback',
              payload: {
                url: att.image_data?.url || att.payload?.url || att.file_url || null
              }
            }));
          }
        } else {
          console.log(`Bot already replied to all pending customer messages for ${recipientId}. No replay needed.`);
          return false;
        }
      } else {
        console.warn('Graph API lookup returned non-ok status in replyToLastCustomerMessage:', gRes.status);
      }
    } catch (err) {
      console.warn('Graph API lookup error in replyToLastCustomerMessage:', err.message);
    }
  }

  // 2. FALLBACK: If Graph API returned nothing or had an error, check local store
  if ((!lastText || lastText.trim() === '') && !lastAttachments) {
    try {
      const conv = await getConversation(recipientId);
      const allMsgs = conv?.messages || [];
      // Find the last bot message index
      let lastBotIdx = -1;
      for (let i = allMsgs.length - 1; i >= 0; i--) {
        if (allMsgs[i].sender === 'bot') {
          lastBotIdx = i;
          break;
        }
      }
      const unrepliedInStore = allMsgs.slice(lastBotIdx + 1).filter(m => m.sender === 'customer');
      if (unrepliedInStore.length > 0) {
        const meaningful = unrepliedInStore.find(m => {
          const t = (m.text || '').trim().toLowerCase();
          return t && !['hi', 'hello', 'hey', 'হাই', 'হ্যালো', 'get started', 'get_started', 'start', 'শুরু'].includes(t);
        });
        const target = meaningful || unrepliedInStore[unrepliedInStore.length - 1];
        lastText = target.text || '';
      }
    } catch (storeErr) {
      console.warn('Fallback store error in replyToLastCustomerMessage:', storeErr.message);
    }
  }

  if ((!lastText || lastText.trim() === '') && !lastAttachments) {
    console.log(`No pending customer message found to replay for ${recipientId}.`);
    return false;
  }

  console.log(`🤖 Replaying customer's last message for ${recipientId}: "${lastText}"`);

  const syntheticEvent = {
    is_replay: true,
    sender: { id: recipientId },
    recipient: { id: PAGE_ID },
    timestamp: Date.now(),
    message: {
      mid: `replay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text: lastText,
      ...(lastAttachments ? { attachments: lastAttachments } : {})
    }
  };

  await processOneEvent(syntheticEvent);
  return true;
}

// ============================================================
// The full per-event handling logic, extracted into its own function so
// it can be wrapped in a try/catch per event (P0-2) without a giant
// nested try block inside the main loop.
// ============================================================
async function processOneEvent(webhookEvent) {
  if (webhookEvent.delivery || webhookEvent.read) return;

  // ===== ECHO DETECTION: Admin manual reply → auto-takeover =====
  if (webhookEvent.message?.is_echo) {
    const echoAppId = String(webhookEvent.message?.app_id || '');

    if (echoAppId === BOT_APP_ID) {
      return; // Bot's own echo → skip silently
    }

    const recipientId = webhookEvent.recipient?.id;
    if (recipientId) {
      const echoText = (webhookEvent.message?.text || '').trim();
      const lowerEcho = echoText.toLowerCase();

      // ============================================================
      // HYBRID MODEL: Admin Slash Commands directly from Messenger!
      // Admin can chat manually OR trigger rich bot features on-demand.
      // ============================================================

      // 1. RE-ACTIVATE / ON (Turns bot ON & immediately answers pending customer message)
      if (['/active', 'active', '/bot', 'bot', '/on', 'on', '/start', 'start'].includes(lowerEcho)) {
        humanTakeoverMemCache.delete(recipientId);
        await setHumanTakeoverSafe(recipientId, false);
        console.log(`🤖 ADMIN TRIGGERED "${echoText}": Bot RE-ACTIVATED immediately for ${recipientId}!`);

        try {
          const replied = await replyToLastCustomerMessage(recipientId);
          if (!replied) {
            const welcomeBack = "আসসালামু আলাইকুম! 🌸 বন্ধন প্রিন্টিং হাউসে স্বাগতম। আপনি কি বিয়ের কার্ড দেখতে চাইছেন?";
            await sendMessengerButtonBlock(recipientId, welcomeBack, [
              { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
              { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
              { title: "দাম জানুন", payload: "BTN_PRICE" }
            ]);
            await appendMessage(recipientId, 'bot', welcomeBack);
          }
        } catch (replayErr) {
          console.error('Error replying to customer last message on re-activation:', replayErr);
        }
        return;
      }

      // 2. TURN BOT OFF / PAUSE (Admin wants full manual control)
      if (['/off', 'off', '/pause', 'pause', '/stop', 'stop', '/admin', 'admin'].includes(lowerEcho)) {
        await setHumanTakeoverSafe(recipientId, true, true);
        console.log(`🛑 ADMIN EXPLICITLY TURNED BOT OFF for ${recipientId} (strict override active)`);
        return;
      }

      // 3. SEND AFFORDABLE CARD GALLERY (or /image)
      if (['/card', '/cards', '/affordable', '/সাশ্রয়ী', 'card', 'cards', '/image', '/images', '/ছবি', '/photo', '/pic', 'image'].includes(lowerEcho)) {
        console.log(`🤖 ADMIN COMMAND "${echoText}": Sending Affordable gallery to ${recipientId}`);
        await setHumanTakeoverSafe(recipientId, false); // allow bot to continue when customer reacts
        await sendSequentialGallery(recipientId, 'affordable', 0);
        return;
      }

      // 4. SEND PREMIUM CARD GALLERY
      if (['/premium', '/লাক্সারি', '/প্রিমিয়াম', 'premium'].includes(lowerEcho)) {
        console.log(`🤖 ADMIN COMMAND "${echoText}": Sending Premium gallery to ${recipientId}`);
        await setHumanTakeoverSafe(recipientId, false); // allow bot to continue when customer reacts
        await sendSequentialGallery(recipientId, 'premium', 0);
        return;
      }

      // 4b. SEND INNER PAGE DESIGN SAMPLE
      if (['/inner', '/sample', '/ভেতর', '/ভিতর', '/inside', '/পাতা', 'inner', 'sample'].includes(lowerEcho)) {
        console.log(`🤖 ADMIN COMMAND "${echoText}": Sending Inner Page sample to ${recipientId}`);
        await setHumanTakeoverSafe(recipientId, false);
        const sampleImg = INNER_DESIGN_SAMPLE?.url || INNER_DESIGN_SAMPLE?.driveId || "https://boondhon-platform-qr9a.vercel.app/samples/inner-sample-01.jpg";
        await sendMessengerImage(recipientId, sampleImg, 'inner_sample');

        const reply = "আমাদের কার্ডের ভেতরের পাতার স্ট্যান্ডার্ড লেআউট ডিজাইন এটি। 🌸\n\nধর্ম অনুযায়ী উপরের অংশ (ধর্মীয় ক্যালিগ্রাফি বা বাক্য যেমন 'বিসমিল্লাহির রাহমানির রাহিম' অথবা 'ওঁ শ্রী শ্রী গণেশায় নমঃ') এবং ভেতরের লেখা বর-কনের নাম ও অনুষ্ঠানসূচী দিয়ে সম্পূর্ণ কাস্টমাইজ করে দেওয়া হয়।\n\nআপনার কত পিস কার্ড প্রয়োজন জানালে কালেকশন দেখাতে পারি! 😊";
        await sendMessengerButtonBlock(recipientId, reply, [
          { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
          { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
          { title: "দাম জানুন", payload: "BTN_PRICE" }
        ]);
        await appendMessage(recipientId, 'bot', reply);
        return;
      }

      // 5. SEND ORDER RULES / POLICY
      if (['/rules', '/rule', '/policy', '/পলিসি', '/নিয়ম', '/niom', 'rules', 'policy'].includes(lowerEcho)) {
        console.log(`🤖 ADMIN COMMAND "${echoText}": Sending Order Rules to ${recipientId}`);
        await sendMessengerButtonBlock(recipientId, ORDER_RULES_MSG, [
          { title: "📝 ফর্ম পূরণ", payload: "BTN_FORM" },
          { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
          { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" }
        ]);
        await appendMessage(recipientId, 'bot', ORDER_RULES_MSG);
        return;
      }

      // 6. SEND ORDER FORM
      if (['/form', '/ফর্ম', 'form'].includes(lowerEcho)) {
        console.log(`🤖 ADMIN COMMAND "${echoText}": Sending Order Form to ${recipientId}`);
        await sendMessengerText(recipientId, BANGLA_ORDER_FORM_TEXT);
        await appendMessage(recipientId, 'bot', BANGLA_ORDER_FORM_TEXT);
        return;
      }

      // 7. SEND FULL PRICE TABLE
      if (['/price', '/দাম', '/rate', 'price', '/dam'].includes(lowerEcho)) {
        console.log(`🤖 ADMIN COMMAND "${echoText}": Sending Price Table to ${recipientId}`);
        const reply = `আমাদের বিয়ের কার্ডের অফিশিয়াল রেট চার্ট (মিনিমাম ৫০ পিস): 🌸\n\n${getFullPriceTable('affordable')}\n\n${getFullPriceTable('premium')}\n\n(১-৪৯ পিস অল্প পরিমাণেও ফিক্সড মেকিং চার্জ সহ অর্ডার করতে পারবেন!)\nআপনার কত পিস লাগবে বলুন? 😊`;
        await sendMessengerButtonBlock(recipientId, reply, [
          { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
          { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
          { title: "অর্ডার করবো", payload: "BTN_ORDER" }
        ]);
        await appendMessage(recipientId, 'bot', reply);
        return;
      }

      // 8. SEND SPECIFIC QUANTITY PRICING (e.g. /100, /50, /200, /150, /300, /qty 100)
      const qtyMatch = lowerEcho.match(/^\/(?:qty\s*)?(\d{2,4})$/);
      if (qtyMatch) {
        const q = parseInt(qtyMatch[1], 10);
        if (q > 0) {
          console.log(`🤖 ADMIN COMMAND: Sending ${q} pcs price to ${recipientId}`);
          if (q < 50) {
            const reply = getLowQtyPrice(q);
            await sendMessengerButtonBlock(recipientId, reply, [
              { title: "৫০ পিস অর্ডার", payload: "QTY_50" },
              { title: "অর্ডার করবো", payload: "BTN_ORDER" },
              { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" }
            ]);
            await appendMessage(recipientId, 'bot', reply);
          } else {
            const reply = `আমাদের ${bngDigits(q)} পিস কার্ডের দামের হিসাব: 🌸\n\n` +
              `💚 সাশ্রয়ী (Affordable): ${bngDigits(getOrderTotal(q, 'affordable'))}৳ (${bngDigits(getOrderPerPiece(q, 'affordable'))}৳/পিস)\n` +
              `✨ প্রিমিয়াম (Premium): ${bngDigits(getOrderTotal(q, 'premium'))}৳ (${bngDigits(getOrderPerPiece(q, 'premium'))}৳/পিস)\n` +
              (q >= 200 ? `🎁 ২০০+ পিসে ১টি আকর্ষণীয় নিকাহনামা একদম ফ্রি উপহার!\n\n` : `\n`) +
              `কোন কালেকশনের ডিজাইন দেখতে চান বলুন? 😊`;
            await sendMessengerButtonBlock(recipientId, reply, [
              { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
              { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
              { title: "অর্ডার করবো", payload: "BTN_ORDER" }
            ]);
            await appendMessage(recipientId, 'bot', reply);
          }
          return;
        }
      }

      // 9. SEND ADVANCE PAYMENT INSTRUCTIONS
      if (['/payment', '/advance', '/এডভান্স', '/অ্যাডভান্স', '/টাকা'].includes(lowerEcho)) {
        console.log(`🤖 ADMIN COMMAND: Sending Advance Payment info to ${recipientId}`);
        const reply = `অর্ডার কনফার্ম করার জন্য ৩০% অ্যাডভান্স পেমেন্ট পাঠাতে হবে:\n\n📲 বিকাশ / নগদ / রকেট (পার্সোনাল): 01682588856\n\nটাকা পাঠিয়ে অনুগ্রহ করে লাস্ট ৪ ডিজিট অথবা পেমেন্টের স্ক্রিনশট এখানে পাঠিয়ে দিন। আমরা সাথে সাথে অর্ডার কনফার্ম করে ডিজাইনারের সাথে কানেক্ট করে দেবো! 😊`;
        await sendMessengerButtonBlock(recipientId, reply, [
          { title: "পেমেন্ট করেছি", payload: "BTN_PAID" },
          { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
          { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" }
        ]);
        await appendMessage(recipientId, 'bot', reply);
        return;
      }

      // NORMAL ADMIN TEXT: Manual human chat → pauses bot for 15 mins (natural takeover)
      await appendMessage(recipientId, 'admin', echoText || '(admin reply)');
      await setHumanTakeoverSafe(recipientId, true, false);
      console.log(`🙋 NATURAL ADMIN TAKEOVER activated for ${recipientId} — bot OFF for 15 min (button click will release)`);
    }
    return;
  }

  const senderId = webhookEvent.sender?.id;
  if (!senderId) return;

  const eventId = webhookEvent.message?.mid || (webhookEvent.postback ? `${senderId}_${webhookEvent.timestamp}_${webhookEvent.postback.payload}` : null);
  if (eventId && isDuplicateEvent(eventId)) {
    console.log(`⏩ Duplicate webhook event skipped: ${eventId}`);
    return;
  }

  const postbackPayload = webhookEvent.postback?.payload || '';
  const quickReplyPayload = webhookEvent.message?.quick_reply?.payload || '';

  const message = webhookEvent.message;
  const postback = webhookEvent.postback;

  let text = message?.text || postback?.title || postback?.payload || '';
  let payload = quickReplyPayload || postbackPayload || '';
  const txt = text.toLowerCase();

  // P1-7 / STEP 17: capture the customer's real Facebook name on first
  // contact, gracefully falling back to the generic name if unavailable.
  const existingConvBeforeAppend = await getConversation(senderId);
  let extraName = '';
  if (!existingConvBeforeAppend) {
    const fetchedName = await fetchCustomerNameSafe(senderId);
    if (fetchedName) extraName = fetchedName;
  }

  if (!webhookEvent.is_replay) {
    await appendMessage(senderId, 'customer', text, null, extraName);
  }

  // ===== HUMAN TAKEOVER CHECK (in-memory cache + durable store + live Facebook Graph API check) =====
  const takeoverState = webhookEvent.is_replay
    ? { active: false, isExplicitOff: false }
    : await getHumanTakeoverState(senderId);

  const isResumeCmd = ['/on', 'on', '/bot', 'bot', '/active', 'active', '/start', 'start', 'get started', 'get_started', 'শুরু', 'চালু', 'বট'].includes(txt) ||
    payload === 'BTN_RESUME_BOT';

  const isButtonClick = !!(payload || postbackPayload || quickReplyPayload) || isResumeCmd;

  if (takeoverState.active) {
    if (takeoverState.isExplicitOff) {
      // STRICT OVERRIDE: Admin explicitly turned off the bot (/off, /pause, /stop, /admin).
      // Customer button clicks, resume commands, or text must NEVER wake up the bot!
      // Only the admin from Page Inbox sending /on, /active, /bot, /start can turn the bot back on.
      console.log(`🛑 Strict Admin /off is ACTIVE for ${senderId}. Bot is completely silent. Ignoring customer input (isButtonClick=${isButtonClick}).`);
      return;
    }

    // Natural / automatic takeover (admin manually chatted with customer)
    if (isButtonClick) {
      // Button clicks and resume commands break natural takeover immediately so customer is never stuck!
      humanTakeoverMemCache.delete(senderId);
      await setHumanTakeoverSafe(senderId, false);
      console.log(`🤖 Customer clicked button during natural takeover. Bot RESUMED for ${senderId}`);
    } else {
      // If customer explicitly asks for admin while natural takeover is already active, acknowledge instead of staying silent
      if (Parser.isHumanHandoffIntent(text)) {
        const waitMsg = "আপনার মেসেজটি আমাদের টিমকে জানানো হয়েছে। 🙏 আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে সরাসরি যোগাযোগ করবেন।\n\n📞 জরুরি প্রয়োজনে সরাসরি কল/হোয়াটসঅ্যাপ করতে পারেন: 01701016826";
        await sendMessengerButtonBlock(senderId, waitMsg, [
          { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
          { title: "🤖 বট চালু করুন", payload: "BTN_RESUME_BOT" },
          { title: "💚 কার্ড দেখুন", payload: "BTN_AFFORDABLE" }
        ]);
        await appendMessage(senderId, 'bot', waitMsg);
        return;
      }
      console.log(`🙋 Natural Human Takeover ACTIVE for ${senderId}. Skipping bot reply.`);
      return;
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
    if (replyTo.attachments && Array.isArray(replyTo.attachments)) {
      for (const att of replyTo.attachments) {
        if (att.payload?.sticker_id) continue;
        const u = att.payload?.url || att.image_data?.url || (att.payload?.elements?.[0]?.image_url);
        if (u) {
          photoUrl = u;
          isPhoto = true;
          break;
        }
      }
    }

    if (replyTo.mid) {
      quotedCard = await getSentCardInfo(senderId, replyTo.mid);
      if (quotedCard) {
        if (quotedCard.url && !photoUrl) {
          photoUrl = quotedCard.url;
        }
        isPhoto = true;
      }
    }

    if (!isPhoto && replyTo.mid && PAGE_ACCESS_TOKEN) {
      try {
        const graphMidUrl = `https://graph.facebook.com/v20.0/${replyTo.mid}?fields=attachments{id,mime_type,name,image_data,file_url,payload,target,generic_template,subattachments},message&access_token=${PAGE_ACCESS_TOKEN}`;
        const midRes = await fetch(graphMidUrl, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(3500)
        });
        if (midRes.ok) {
          const midData = await midRes.json();
          const atts = midData?.attachments?.data || midData?.attachments || [];
          if (Array.isArray(atts)) {
            for (const a of atts) {
              const u = a.image_data?.url || a.file_url || a.payload?.url || a.generic_template?.image_url ||
                (a.subattachments?.data && a.subattachments.data[0]?.image_data?.url) ||
                (a.subattachments?.data && a.subattachments.data[0]?.file_url);
              if (u) {
                photoUrl = u;
                isPhoto = true;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch reply_to message from Graph API:', e.message);
      }
    }

    // Fallback: If customer swiped/quoted a bot message or attachment, but no direct image URL could be found:
    // Check if the bot recently sent cards to this customer!
    if (!isPhoto && !photoUrl && !quotedCard) {
      try {
        const convRecord = await getConversation(senderId);
        if (convRecord && Array.isArray(convRecord.sentCards) && convRecord.sentCards.length > 0) {
          const lastCard = convRecord.sentCards[convRecord.sentCards.length - 1];
          if (lastCard && (Date.now() - (lastCard.timestamp || 0) < 86400000)) { // within 24 hours
            quotedCard = lastCard;
            if (lastCard.url) photoUrl = lastCard.url;
            isPhoto = true;
          }
        }
      } catch (e) {
        console.warn('Fallback sentCards lookup error:', e.message);
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

  // If sending a photo or replying to a card, preserve caption/text
  const customerPhotoCaption = (text || '').trim();
  if (isPhoto) {
    payload = '';
    // NOTE: Keep `text` intact so customer text/bargaining/questions are preserved for downstream handling!
  }

  const normalizedTxt = normalizeBengaliDigits(text).toLowerCase();
  if (normalizedTxt.includes('facebook.com') || normalizedTxt.includes('fb.watch') || normalizedTxt.includes('/reel/') || normalizedTxt.includes('/videos/') || normalizedTxt.includes('fb.me')) {
    isLinkOrShare = true;
  }

  const isFormSubmission = (
    (text.includes('বর') && text.includes('কনে')) ||
    (text.includes('নামঃ') && text.includes('পিতাঃ')) ||
    (text.includes('অনুষ্ঠানসূচী') || text.includes('ওয়ালিমা') || text.includes('গায়ে হলুদ') || text.includes('বউ-ভাত') || text.includes('কনের বাড়ি')) ||
    (text.includes('প্রিন্ট কার্ডের সংখ্যা') || text.includes('কার্ডের সংখ্যা') || text.includes('কার্ডের পরিমাণ')) ||
    ((normalizedTxt.includes('groom') || normalizedTxt.includes('bride')) && (normalizedTxt.includes('father') || normalizedTxt.includes('wedding') || normalizedTxt.includes('courier'))) ||
    (normalizedTxt.includes('wedding card') && (normalizedTxt.includes('courier') || normalizedTxt.includes('quantity'))) ||
    (normalizedTxt.includes('card quantity') || normalizedTxt.includes('how many pcs'))
  );

  // FIX (P0-4 / STEP 7): quantity + unit-word detection now goes through
  // lib/order-parser.js, which fixes a real bug discovered while
  // rebuilding this: JavaScript's `\b` word boundary never matches next
  // to Bengali script, so the ORIGINAL `/\b(...পিস|টা...)\b/` patterns
  // here could never actually match "৫০ পিস", "১০০ পিস", etc. — only a
  // bare, unit-less number worked before. See delivery report for detail.
  const hasQtyUnit = Parser.hasQuantityUnit(normalizedTxt);
  const anyDigitsMatch = normalizedTxt.match(/\b\d{3,8}\b/);
  const pureDigitsMatch = normalizedTxt.trim().match(/^(\d{3,8})$/);
  const pureDigitsNum = pureDigitsMatch ? parseInt(pureDigitsMatch[1], 10) : null;
  const awaitingPayment = await checkCustomerAwaitingPayment(senderId);

  const isPaymentDonePhrase = (
    /(?:পেমেন্ট|টাকা|advance|এডভান্স|payment|paid|bKash|bkash|বিকাশ|nagad|নগদ|rocket|রকেট|taka)\s*(?:করেছি|করছি|দিলাম|দিছি|পাঠালাম|পাঠাইছি|পাঠিয়েছি|দিয়েছি|হয়েছে|হইছে|হলো|done|completed|send|sent|disi|diasi|dilam|pathaisi|pathalam|koresi|korsi|korechi)/i.test(normalizedTxt) ||
    /\b(paid|payment\s*done|taka\s*send|advance\s*done|payment\s*completed|money\s*sent|advance\s*paid)\b/i.test(normalizedTxt) ||
    normalizedTxt.match(/^(?:পেমেন্ট\s*করেছি|টাকা\s*পাঠিয়েছি|টাকা\s*পাঠাইছি|paid|advance\s*paid)$/i) !== null
  );

  const mentionsLastDigits = /(?:লাস্ট|last|শেষের|লাস্টের|শেষ|shesh|sesh)\s*(?:৪|4)?\s*(?:ডিজিট|digit|নম্বর|নাম্বার|number|no|num)?/i.test(normalizedTxt) ||
    /(?:ডিজিট|digit|trx\s*id|transaction\s*id|ট্রানজেকশন|পেমেন্ট\s*কোড|trx)/i.test(normalizedTxt);

  const isPaymentInfoSubmission = !hasQtyUnit && (
    (mentionsLastDigits && anyDigitsMatch !== null) ||
    (isPaymentDonePhrase && anyDigitsMatch !== null) ||
    (awaitingPayment && anyDigitsMatch !== null) ||
    (pureDigitsMatch !== null && (pureDigitsMatch[1].length === 4 || !Parser.isStandardCardQty(pureDigitsNum))) ||
    /trx\s*id|transaction\s*id|ট্রানজেকশন|পেমেন্ট\s*কোড/i.test(normalizedTxt)
  );

  // FIX (P2-2 / audit A-side finding): "আরও কম হবে?" style price
  // negotiation was previously misrouted into the MINIMUM-ORDER-QUANTITY
  // branch because both shared the word "কম". isMinimumOrderQuery and
  // isPriceObjectionOrDiscount are now mutually exclusive (see
  // lib/order-parser.js) so this can't happen again.
  const isMinimumOrderQuery = Parser.isMinimumOrderQuery(txt);
  const isPriceObjectionOrDiscount = Parser.isPriceObjectionOrDiscount(normalizedTxt);
  const isWholesaleQuery = Parser.isWholesaleQuery(normalizedTxt) || Parser.isWholesaleQuery(text);

  const bargainOffer = evaluateBargain(text, (await getCurrentCategory(senderId)) || 'affordable');

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
    const qtyResult = Parser.extractQuantity(text);
    if (qtyResult) quantity = qtyResult.qty;
  }

  const existingConv = existingConvBeforeAppend; // FIX (P0-1): this is the crash this whole rewrite started from.
  const conversationStage = await getConversationStage(senderId);

  // ================================================================
  // NEW (P0-5 / STEP 12/13/14/15/16): high-priority intents that must be
  // recognized regardless of what stage the conversation is in — restart,
  // human handoff, and explicit corrections. Checked BEFORE the rest of
  // the routing so they can interrupt any in-progress flow, matching
  // "customer can go back / correct / restart at any time" (Part C).
  // ================================================================

  if (!isPhoto && (payload === 'BTN_RESUME_BOT' || ['/on', 'on', '/bot', 'bot', '/active', 'active', 'চালু', 'বট'].includes(txt))) {
    humanTakeoverMemCache.delete(senderId);
    await setHumanTakeoverSafe(senderId, false);
    const reply = "বট চালু করা হয়েছে! 🌸\nআসসালামু আলাইকুম! বন্ধন প্রিন্টিং হাউসে স্বাগতম। আপনি কি বিয়ের কার্ড দেখতে চাইছেন?";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
    return;
  }

  if (!isPhoto && Parser.isRestartIntent(text)) {
    await resetCustomerState(senderId);
    const reply = "ঠিক আছে, আবার নতুন করে শুরু করছি! 🌸\nআসসালামু আলাইকুম! বন্ধন প্রিন্টিং হাউসে স্বাগতম। আপনি কি বিয়ের কার্ড দেখতে চাইছেন?";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
    return;
  }

  if (!isPhoto && Parser.isHumanHandoffIntent(text)) {
    await setHumanTakeoverSafe(senderId, true);
    const reply = "জি অবশ্যই! 🙏 আপনাকে আমাদের এডমিন / সাপোর্ট টিমের সাথে সংযুক্ত করে দিচ্ছি। অনুগ্রহ করে একটু সময় দিন, আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে সরাসরি কথা বলবেন।\n\n📞 জরুরি প্রয়োজনে সরাসরি কল/হোয়াটসঅ্যাপ করতে পারেন: 01701016826";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
      { title: "🤖 আবার বট চালু করুন", payload: "BTN_RESUME_BOT" },
      { title: "💚 কার্ড দেখুন", payload: "BTN_AFFORDABLE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
    return;
  }

  if (!isPhoto && conversationStage === 'reviewing' && Parser.isCancelIntent(text)) {
    await resetCustomerState(senderId);
    const reply = "অর্ডারটি বাতিল করা হলো। 🌸 কোনো সমস্যা নেই — যেকোনো সময় আবার শুরু করতে পারেন। আমাদের কালেকশন দেখতে চাইলে জানান!";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
    return;
  }

  if (!isPhoto && (payload === 'BTN_CONFIRM_ORDER' || payload?.startsWith('BTN_CONFIRM_ORDER') || Parser.isConfirmIntent(text))) {
    let category = (await getCurrentCategory(senderId)) || 'affordable';
    let qty = 100;
    let advance = 0;

    if (payload?.startsWith('BTN_CONFIRM_ORDER|')) {
      const parts = payload.split('|');
      category = parts[1] || category;
      qty = parseInt(parts[2], 10) || 100;
      advance = parseInt(parts[3], 10) || 0;
    } else {
      const order = await getOrder(senderId);
      if (order?.quantity) qty = order.quantity;
      const total = getOrderTotal(qty, category);
      advance = getAdvanceAmount(total);
    }

    if (!advance) {
      const total = getOrderTotal(qty, category);
      advance = getAdvanceAmount(total);
    }

    await setConversationStage(senderId, 'payment_pending');
    await setUserAwaitingPayment(senderId, true);

    const advanceText = advance > 0 ? `💰 ৩০% অ্যাডভান্সের পরিমাণ: ${bngDigits(advance)}৳\n` : '';
    const reply = `আলহামদুলিল্লাহ! আপনার অর্ডারটি কনফার্ম হলো। 🌸\n\nঅর্ডারটি এগিয়ে নিতে ৩০% অ্যাডভান্স পেমেন্ট পাঠান:\n📲 বিকাশ / নগদ / রকেট (পার্সোনাল): 01682588856\n${advanceText}\nপেমেন্ট সম্পন্ন করে লাস্ট ৪ ডিজিট বা স্ক্রিনশট এখানে পাঠিয়ে দিন।\n\nআমাদের অভিজ্ঞ ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে মেসেঞ্জার/হোয়াটসঅ্যাপে প্রুফ চেক করাবে। আপনার ফাইনাল অনুমোদনের পরই কেবল প্রিন্ট হবে! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "পেমেন্ট করেছি", payload: "BTN_PAID" },
      { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
      { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" }
    ]);
    await appendMessage(senderId, 'bot', reply);
    return;
  }

  if (!isPhoto && conversationStage === 'reviewing' && (payload === 'BTN_EDIT_ORDER' || Parser.isEditIntent(text))) {
    const correction = Parser.detectCorrection(text);
    if (correction && correction.field && correction.field !== 'card' && correction.field !== 'quantity' && correction.newValue) {
      await updateOrder(senderId, { [correction.field]: correction.newValue });
      const label = Parser.WEDDING_FIELD_LABELS_BN[correction.field] || correction.field;
      const reply = `ঠিক আছে, ${label} আপডেট করে দিলাম: ${correction.newValue}। অন্য কিছু ঠিক করতে চান, নাকি সব ঠিক আছে?`;
      await sendMessengerText(senderId, reply);
      await appendMessage(senderId, 'bot', reply);
      await sendOrderSummary(senderId);
    } else {
      const reply = "কোন তথ্যটি ঠিক করতে চান? সরাসরি লিখুন, যেমন:\n\"বরের নাম ভুল হয়েছে, রাকিব না, সাকিব\"\n\"৫০ না, ১০০ পিস\"\n\"তারিখটা ২৬ ডিসেম্বর হবে\"";
      await sendMessengerText(senderId, reply);
      await appendMessage(senderId, 'bot', reply);
    }
    return;
  }

  // Correction / quantity-change / card-change usable from ANY stage once
  // an order is already in progress (STEP 12/13/14) — not just while
  // reviewing, since a customer might notice a mistake mid-collection too.
  if (!isPhoto && (conversationStage === 'collecting_info' || conversationStage === 'reviewing' || conversationStage === 'payment_pending')) {
    const correction = Parser.detectCorrection(text);
    if (correction) {
      if (correction.field === 'quantity' && typeof correction.newValue === 'number') {
        await updateOrder(senderId, { quantity: correction.newValue });
        const cat = (await getCurrentCategory(senderId)) || 'affordable';
        // FIX: getCategoryPrice/buildCategoryPriceText is only correct for
        // qty >= 50 (it always uses the >=50 tier table). A quantity
        // CHANGE down to under 50 pieces used to still show >=50 tier
        // pricing here (wrong number shown to the customer) instead of the
        // low-quantity fixed-band price every other quantity-price path in
        // this file already branches to.
        const priceMsg = correction.newValue >= 50
          ? getCategoryPrice(correction.newValue, cat)
          : getLowQtyPrice(correction.newValue);
        const reply = `ঠিক আছে, পরিমাণ ${bngDigits(correction.newValue)} পিস করে দিলাম। নতুন হিসাব:\n\n${priceMsg}`;
        await sendMessengerText(senderId, reply);
        await appendMessage(senderId, 'bot', reply);
        await sendOrderSummary(senderId);
        return;
      }
      if (correction.field === 'card') {
        if (correction.reference === 'previous') {
          const lastShown = await getLastShownCards(senderId);
          if (lastShown.length >= 2) {
            const prevId = lastShown[lastShown.length - 2];
            const cat = (await getCurrentCategory(senderId)) || 'affordable';
            await setSelectedCard(senderId, { category: cat, cardId: prevId });
            const reply = "ঠিক আছে, আগের কার্ডটাই সিলেক্ট করে দিলাম। ✅";
            await sendMessengerText(senderId, reply);
            await appendMessage(senderId, 'bot', reply);
            await sendOrderSummary(senderId);
            return;
          }
        }
        // Ambiguous — don't guess (ABSOLUTE RULE #10)
        const reply = "কোন ডিজাইনটি নিতে চান? চাইলে কার্ডের ছবি পাঠাতে পারেন, অথবা কালেকশন থেকে আবার বেছে নিতে পারেন। 😊";
        await sendMessengerButtonBlock(senderId, reply, [
          { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
          { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
          { title: "দাম জানুন", payload: "BTN_PRICE" }
        ]);
        await appendMessage(senderId, 'bot', reply);
        return;
      }
      if (correction.field && correction.newValue) {
        await updateOrder(senderId, { [correction.field]: correction.newValue });
        const label = Parser.WEDDING_FIELD_LABELS_BN[correction.field] || correction.field;
        const reply = `ঠিক আছে, ${label} আপডেট করে দিলাম: ${correction.newValue}। ✅`;
        await sendMessengerText(senderId, reply);
        await appendMessage(senderId, 'bot', reply);
        if (conversationStage === 'reviewing') {
          await sendOrderSummary(senderId);
        }
        return;
      }
    }
  }

  // ================================================================
  // NEW (P0-4 / STEP 5/6): if we're actively collecting wedding info (or
  // the customer just pasted the full form), route free text through the
  // structured extractor instead of the generic "thanks, please pay"
  // message the original bot always sent regardless of what was actually
  // provided.
  // ================================================================
  if (!isPhoto && !isButtonClick && (conversationStage === 'collecting_info' || (isFormSubmission))) {
    const handled = await handleWeddingInfoMessage(senderId, text);
    if (handled) return;
  }

  // NEW (STEP 7/8): design selection purely by words — "এইটা ভালো",
  // "এই ডিজাইনটা চাই", "আগেরটা", "৩ নম্বরটা চাই", "এই কার্ডটা নিব" — all
  // of these previously either did nothing recognizable (crash via the
  // existingConv bug) or were simply not understood. Resolved against
  // `lastShownCards` (the most recent gallery batch) rather than
  // requiring the customer to reply-to/quote the specific photo message.
  if (!isPhoto && !isButtonClick) {
    const designRef = Parser.detectDesignReference(text);
    if (designRef) {
      const lastShown = await getLastShownCards(senderId);
      const cat = (await getCurrentCategory(senderId)) || 'affordable';
      let resolvedId = null;

      if (designRef.type === 'ordinal' && lastShown[designRef.index - 1]) {
        resolvedId = lastShown[designRef.index - 1];
      } else if ((designRef.type === 'last' || designRef.type === 'take') && lastShown.length > 0) {
        resolvedId = lastShown[lastShown.length - 1];
      } else if (designRef.type === 'previous' && lastShown.length >= 2) {
        resolvedId = lastShown[lastShown.length - 2];
      }

      if (resolvedId) {
        await setSelectedCard(senderId, { category: cat, cardId: resolvedId });
        const priceTable = getFullPriceTable(cat);
        const emoji = cat === 'premium' ? '✨' : '💚';
        const catName = cat === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';

        if (designRef.type === 'take') {
          const reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${priceTable}\n\nআপনার কত পিস লাগবে বলুন, তাহলে অর্ডারটা এগিয়ে নিই! 😊`;
          await sendMessengerButtonBlock(senderId, reply, [
            { title: "অর্ডার করবো", payload: `BTN_ORDER_${cat.toUpperCase()}` },
            { title: "দাম জানুন", payload: "BTN_PRICE" },
            { title: "কার্ড দেখুন", payload: cat === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
          ]);
          await appendMessage(senderId, 'bot', reply);
        } else {
          const reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${priceTable}\n\nআপনার কত পিস লাগবে বলুন! 😊`;
          await sendMessengerButtonBlock(senderId, reply, [
            { title: "অর্ডার করবো", payload: "BTN_ORDER" },
            { title: "দাম জানুন", payload: "BTN_PRICE" },
            { title: "কার্ড দেখুন", payload: cat === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
          ]);
          await appendMessage(senderId, 'bot', reply);
        }
        return;
      } else if (designRef.type === 'ordinal' || designRef.type === 'previous') {
        // Referenced a design we have no record of showing — don't guess.
        const reply = "দুঃখিত, ঠিক কোন ডিজাইনটা বলছেন বুঝতে পারিনি। 🙏 আমাদের কালেকশন আরেকবার দেখে নিন, অথবা কার্ডের ছবি পাঠান!";
        await sendMessengerButtonBlock(senderId, reply, [
          { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
          { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
          { title: "দাম জানুন", payload: "BTN_PRICE" }
        ]);
        await appendMessage(senderId, 'bot', reply);
        return;
      }
      // else: fall through to the rest of the router (e.g. "এইটা ভালো"
      // with nothing shown yet isn't actually a design reference).
    }
  }

  // ===== PHOTO UPLOADED OR QUOTED CARD REPLY =====
  if (isPhoto && (photoUrl || quotedCard)) {
    if (quotedCard) {
      const category = quotedCard.category || 'affordable';
      await setCurrentCategory(senderId, category);
      await setSelectedCard(senderId, { category, cardId: quotedCard.cardId, url: quotedCard.url });

      // FIX (P1-3 / STEP 9 / audit A11): VISUAL_CATALOG_RULES says the
      // same design can exist in both sizes and a photo can't show size —
      // so show BOTH category price tables instead of asserting one,
      // wiring in a business rule the original file imported but never
      // actually used.
      let reply;
      const priceTable = getFullPriceTable(category);
      const emoji = category === 'premium' ? '✨' : '💚';
      const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
      reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${priceTable}\n\nআপনার কত পিস লাগবে বলুন! 😊`;

      if (customerPhotoCaption) {
        const capQtyResult = Parser.extractQuantity(customerPhotoCaption);
        const hasBargainOrQuestion = /[?？]|টাকা|করে|দিবো|দিব|রাখবেন|কম|ছাড়|ছাড়|ডিসকাউন্ট|অফার|হবে|কালার|রং|রঙ|কবে|দিন|বাজেট|পারি|পারবেন|সম্ভব|বলা|জানান|দাম|কত|কতো|রেট|rate|price|koto|dam|discount/i.test(customerPhotoCaption);
        if (capQtyResult && capQtyResult.qty >= 50 && !hasBargainOrQuestion) {
          reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${category === 'premium' ? '✨ Premium' : '💚 Affordable'} কালেকশনের কার্ড।\n\n${getCategoryPrice(capQtyResult.qty, category)}\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
        } else {
          try {
            const visionCheck = await analyzeCardImage({
              photoUrl: quotedCard.url || photoUrl,
              customerCaption: customerPhotoCaption,
              topCandidate: { code: quotedCard.cardId, category, isMatch: true, similarity: 1.0 }
            });
            if (visionCheck?.reply) {
              reply = visionCheck.reply;
            }
          } catch (e) {
            console.warn('AI quotedCard caption reply error:', e.message);
          }
        }
      }

      const altCat = category === 'premium' ? 'affordable' : 'premium';
      const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';
      await sendMessengerButtonBlock(senderId, reply, [
        { title: "অর্ডার করবো", payload: `BTN_ORDER_${category.toUpperCase()}` },
        { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
        { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    } else {
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

      const driveHighMatch = matchResult && matchResult.similarity >= 0.65;
      const driveMediumMatch = matchResult && matchResult.similarity >= 0.48 && matchResult.similarity < 0.65;

      const buildMatchedReply = async (category, matchCode) => {
        await setCurrentCategory(senderId, category);
        await setSelectedCard(senderId, { category, code: matchCode, url: photoUrl });

        const priceTable = getFullPriceTable(category);
        const emoji = category === 'premium' ? '✨' : '💚';
        const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
        let reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${priceTable}\n\nআপনার কত পিস কার্ড লাগবে বলুন! 😊`;

        if (customerPhotoCaption) {
          const capQtyResult = Parser.extractQuantity(customerPhotoCaption);
          const hasBargainOrQuestion = /[?？]|টাকা|করে|দিবো|দিব|রাখবেন|কম|ছাড়|ছাড়|ডিসকাউন্ট|অফার|হবে|কালার|রং|রঙ|কবে|দিন|বাজেট|পারি|পারবেন|সম্ভব|বলা|জানান|দাম|কত|কতো|রেট|rate|price|koto|dam|discount/i.test(customerPhotoCaption);
          if (capQtyResult && capQtyResult.qty >= 50 && !hasBargainOrQuestion) {
            reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${category === 'premium' ? '✨ Premium' : '💚 Affordable'} কালেকশনের কার্ড।\n\n${getCategoryPrice(capQtyResult.qty, category)}\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
          } else {
            try {
              const visionCheck = await analyzeCardImage({
                photoUrl,
                base64Data: photoBase64,
                mimeType: photoMime,
                customerCaption: customerPhotoCaption,
                topCandidate: { code: matchCode, category, isMatch: true, similarity: 1.0 }
              });
              if (visionCheck?.reply) {
                reply = visionCheck.reply;
              }
            } catch (err) {
              console.warn('AI buildMatchedReply caption reply error:', err.message);
            }
          }
        }

        const altCat = category === 'premium' ? 'affordable' : 'premium';
        const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';
        await sendMessengerButtonBlock(senderId, reply, [
          { title: "অর্ডার করবো", payload: `BTN_ORDER_${category.toUpperCase()}` },
          { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
          { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
        ]);
        await appendMessage(senderId, 'bot', reply);
      };

      if (driveHighMatch) {
        const category = matchResult.category === 'premium' ? 'premium' : 'affordable';
        await buildMatchedReply(category, matchResult.code);
      } else if (driveMediumMatch) {
        const visionCheck = await analyzeCardImage({
          photoUrl, base64Data: photoBase64, mimeType: photoMime,
          customerCaption: customerPhotoCaption, topCandidate: matchResult
        });

        if (visionCheck?.type === 'WEDDING_CARD') {
          let category = matchResult.category === 'premium' ? 'premium' : 'affordable';
          if (visionCheck.detectedCategory === 'premium' || visionCheck.detectedCategory === 'affordable') {
            category = visionCheck.detectedCategory;
          }
          await buildMatchedReply(category, matchResult.code);
        } else if (visionCheck?.type === 'PAYMENT_RECEIPT') {
          await setCustomerAwaitingPayment(senderId, true);
          await setHumanTakeoverSafe(senderId, true);
          const reply = visionCheck.reply || `অনেক ধন্যবাদ! আপনার টাকা পাঠানোর স্ক্রিনশটটি আমরা পেয়েছি। 🌸\n\nঅনুগ্রহ করে আপনার বিকাশ/নগদ নম্বরের শেষ ৪টি ডিজিট লিখে দিন।`;
          await sendMessengerButtonBlock(senderId, reply, [
            { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
            { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" },
            { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" }
          ]);
          await appendMessage(senderId, 'bot', reply);
        } else {
          const reply = visionCheck?.reply || `ছবিটির জন্য ধন্যবাদ! 🌸 আপনি কি বিয়ের কার্ড দেখতে চাইছেন? আমাদের কালেকশন দেখুন! 😊`;
          await sendMessengerButtonBlock(senderId, reply, [
            { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
            { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
            { title: "দাম জানুন", payload: "BTN_PRICE" }
          ]);
          await appendMessage(senderId, 'bot', reply);
        }
      } else {
        const visionRes = await analyzeCardImage({
          photoUrl, base64Data: photoBase64, mimeType: photoMime,
          customerCaption: customerPhotoCaption, topCandidate: matchResult
        });

        if (visionRes?.type === 'PAYMENT_RECEIPT') {
          await setCustomerAwaitingPayment(senderId, true);
          await setHumanTakeoverSafe(senderId, true);
          const reply = visionRes.reply || `অনেক ধন্যবাদ! আপনার টাকা পাঠানোর স্ক্রিনশটটি আমরা পেয়েছি। 🌸\n\nঅনুগ্রহ করে আপনার বিকাশ/নগদ নম্বরের শেষ ৪টি ডিজিট লিখে দিন। আমাদের অ্যাকাউন্টস টিম স্টেটমেন্ট দেখে পেমেন্টটি চেক করে কিছুক্ষণের মধ্যেই আপনাকে নিশ্চিত করবে।`;
          await sendMessengerButtonBlock(senderId, reply, [
            { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
            { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" },
            { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" }
          ]);
          await appendMessage(senderId, 'bot', reply);
        } else if (visionRes?.type === 'OTHER') {
          const reply = visionRes.reply || `ছবিটির জন্য ধন্যবাদ! 🌸 আপনি কি কোনো নির্দিষ্ট ডিজাইনের বিয়ের কার্ড তৈরি করতে চাইছেন? আমাদের কালেকশন দেখতে পারেন অথবা আপনার পছন্দের কার্ডের ছবি বা কত পিস লাগবে জানাতে পারেন!`;
          await sendMessengerButtonBlock(senderId, reply, [
            { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
            { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
            { title: "দাম জানুন", payload: "BTN_PRICE" }
          ]);
          await appendMessage(senderId, 'bot', reply);
        } else {
          const reply = `সুন্দর কার্ড! 😍 তবে এই ডিজাইনটি আমাদের বর্তমান কালেকশনে নেই।\n\nআমাদের কালেকশন থেকে পছন্দের কার্ড দেখুন এবং সেই ছবি পাঠান — তাহলে সাথে সাথে দাম জানাবো! 😊`;
          await sendMessengerButtonBlock(senderId, reply, [
            { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
            { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
            { title: "দাম জানুন", payload: "BTN_PRICE" }
          ]);
          await appendMessage(senderId, 'bot', reply);
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
    const cat = (await getCurrentCategory(senderId)) || 'affordable';
    await setCurrentCategory(senderId, cat);

    const priceTable = getFullPriceTable(cat);
    const emoji = cat === 'premium' ? '✨' : '💚';
    const catName = cat === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';
    const altCat = cat === 'premium' ? 'affordable' : 'premium';
    const altName = altCat === 'premium' ? '✨ Premium' : '💚 Affordable';

    let reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${priceTable}\n\nআপনার কত পিস লাগবে বলুন! 😊`;

    const qtyResult = Parser.extractQuantity(normalizedTxt);
    const hasBargainOrQuestion = /[?？]|টাকা|করে|দিবো|দিব|রাখবেন|কম|ছাড়|ছাড়|ডিসকাউন্ট|অফার|হবে|কালার|রং|রঙ|কবে|দিন|বাজেট|পারি|পারবেন|সম্ভব|বলা|জানান|দাম|কত|কতো|রেট|rate|price|koto|dam|discount/i.test(normalizedTxt);
    if (qtyResult && qtyResult.qty >= 50 && !hasBargainOrQuestion) {
      reply = `দারুণ পছন্দ! 😍 এটি আমাদের ${emoji} ${catName} কালেকশনের কার্ড।\n\n${getCategoryPrice(qtyResult.qty, cat)}\n\nঅর্ডার করতে চাইলে বলুন! 😊`;
    } else if (hasBargainOrQuestion) {
      try {
        const convHistory = existingConv?.messages || [];
        const aiReply = await generateAISalesResponse(senderId, text, convHistory);
        if (aiReply) reply = aiReply;
      } catch (e) {
        console.warn('Quoted reply AI sales response error:', e.message);
      }
    }

    await sendMessengerButtonBlock(senderId, reply, [
      { title: "অর্ডার করবো", payload: "BTN_ORDER" },
      { title: `${altName} রেট`, payload: altCat === 'premium' ? "BTN_PREMIUM_PRICE" : "BTN_AFFORDABLE_PRICE" },
      { title: "কার্ড দেখুন", payload: cat === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== FACEBOOK AD / POST REFERRAL ENTRY =====
  else if (isAdReferral && (!payload || payload === '' || payload === 'BTN_AD_ENTRY' || !text || text.includes('গোল্ড ফয়েল') || text.includes('WhatsApp:'))) {
    const reply = `আসসালামু আলাইকুম! 🌸 বন্ধন প্রিন্টিং হাউসে স্বাগতম।\nআমাদের গোল্ড ফয়েল ও প্রিমিয়াম বিয়ের কার্ডের বিজ্ঞাপনটি দেখে যোগাযোগ করার জন্য ধন্যবাদ! আপনি কি এই ধরনের কার্ডের কালেকশন দেখতে চাইছেন?`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== LIKE / THUMBS UP STICKER OR EMOJI =====
  else if (isLikeThumbsUp) {
    const reply = `লাইক দেওয়ার জন্য অনেক ধন্যবাদ! 🌸😊\nবন্ধন প্রিন্টিং হাউসে স্বাগতম। আপনি কি কোনো নির্দিষ্ট ডিজাইনের বিয়ের কার্ড দেখতে চাইছেন?`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== SHARED REEL / VIDEO / POST FROM PAGE =====
  else if (isLinkOrShare) {
    const reply = `আমাদের ভিডিও/পোস্টের ডিজাইনটি পছন্দ করার জন্য ধন্যবাদ! 😍🌸\n\nএই কার্ডটির দামের হিসাব (মিনিমাম ৫০ পিস):\n${getFullPriceTable('affordable')}\n\n${getFullPriceTable('premium')}\n\nআপনার কত পিস কার্ড লাগবে বলুন, সঠিক হিসাব জানিয়ে দিচ্ছি! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== ORDER FORM SUBMITTED BY CUSTOMER (full paste) =====
  // FIX (P0-4 / STEP 5/6/11): the original bot only ever pattern-matched
  // that *something form-shaped* arrived and replied with a fixed "thanks,
  // pay 30% now" message regardless of what was actually filled in — no
  // parsing, no validation, no summary. Now routes through the same
  // structured extractor as incremental collection, and only asks for
  // payment after showing a summary the customer has explicitly confirmed
  // (see sendOrderSummary / BTN_CONFIRM_ORDER above).
  else if (isFormSubmission) {
    await handleWeddingInfoMessage(senderId, text);
  }
  // ===== WHOLESALE / PAIKARI INQUIRY (STRICT RETAIL ONLY POLICY) =====
  else if (isWholesaleQuery) {
    const reply = "আন্তরিকভাবে দুঃখিত, আমরা পাইকারি বা হোলসেল (Wholesale)-এ কার্ড বিক্রি করি না। 🌸\nআমরা শুধুমাত্র বর-কনের পরিবারের জন্য সরাসরি খুচরা (Retail) কার্ড প্রিন্ট ও হোম ডেলিভারি সরবরাহ করে থাকি।\n\nআপনার নিজের বিয়ের অনুষ্ঠানের জন্য কত পিস কার্ড প্রয়োজন জানালে, আমাদের কালেকশন ও রেট চার্ট দেখাতে পারি! 😊";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== LOW QUANTITY / MINIMUM ORDER QUERY =====
  else if (!isFormSubmission && isMinimumOrderQuery) {
    const reply = `আমাদের বিয়ের কার্ডের অফিশিয়াল মিনিমাম অর্ডার ৫০ পিস থেকে শুরু। কারণ ৫০ বা ১০০ পিস বানালে ডাইস, প্লেট ও মেকিং চার্জ ভাগ হয়ে পিস প্রতি খরচ অনেক কম পড়ে: 🌸\n\n` +
      `💚 সাশ্রয়ী (Affordable):\n` +
      `• ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)\n` +
      `• ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)\n` +
      `• ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস)\n\n` +
      `✨ প্রিমিয়াম (Premium):\n` +
      `• ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)\n` +
      `• ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)\n` +
      `• ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস) (🎁 সাথে ১টি ফ্রি নিকাহনামা!)\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 তবে কারো যদি নিতান্তই ৫০ পিসের কম লাগে:\n` +
      `ফিক্সড মেকিং ও ডাইস চার্জের কারণে ১-৫ পিস ১,০০০৳, ৬-১০ পিস ১,৫০০৳ এবং ১১-৪৯ পিস প্রতি পিস ৭৫৳ করে রাখা হয়।\n\n` +
      `💡 পরামর্শ: ৫০ পিস নেওয়া সবচেয়ে বেশি লাভজনক ও সাশ্রয়ী! আপনার কত পিস লাগবে বলুন? 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "৫০ পিস অর্ডার", payload: "QTY_50" },
      { title: "১০০ পিস অর্ডার", payload: "QTY_100" },
      { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== PAYMENT LAST DIGITS / CONFIRMATION SUBMITTED BY USER =====
  else if (isPaymentInfoSubmission) {
    const digitsMatch = normalizedTxt.match(/\b\d{3,8}\b/);
    const digits = digitsMatch ? digitsMatch[0] : '';
    const digitsText = digits ? ` (${bngDigits(digits)})` : '';

    await setCustomerAwaitingPayment(senderId, false);
    await setOrderStatus(senderId, 'Payment_Submitted');
    await setPaymentStatus(senderId, 'Submitted');
    await setConversationStage(senderId, 'payment_submitted');
    await setHumanTakeoverSafe(senderId, true);

    const reply = `অনেক ধন্যবাদ! আপনার পেমেন্টের লাস্ট ৪ ডিজিট${digitsText} আমরা পেয়েছি। 🌸\n\nঅনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন। আমাদের অ্যাকাউন্টস টিম স্টেটমেন্ট দেখে পেমেন্টটি চেক করে কিছুক্ষণের মধ্যেই আপনাকে নিশ্চিত করবে।\n\nপেমেন্ট নিশ্চিত হওয়ামাত্রই আমাদের ডিজাইনার আপনার কার্ডের কাজ শুরু করে দেবে! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" },
      { title: "📍 অফিসের ঠিকানা", payload: "BTN_LOCATION" },
      { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== PAYMENT CLAIMED (NO DIGITS YET) OR BTN_PAID CLICKED =====
  else if (payload === 'BTN_PAID' || isPaymentDonePhrase) {
    await setCustomerAwaitingPayment(senderId, true);
    const reply = `অনেক ধন্যবাদ! আপনার পেমেন্টের স্ক্রিনশট বা বিকাশ/নগদ লাস্ট ৪ ডিজিট এখানে লিখে দিন। 😊\nআমাদের টিম দ্রুত যাচাই করে আপনার অর্ডারটি নিশ্চিত করবে এবং ডিজাইনার কাজ শুরু করবে! 🌸`;
    await sendMessengerText(senderId, reply);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== 50/100 TK CONCESSION / BARGAIN ACCEPTANCE (OWNER AUTHORIZED) =====
  else if (bargainOffer && bargainOffer.accepted) {
    const diffText = bargainOffer.discountAmount > 0 ? `${bngDigits(bargainOffer.discountAmount)}৳ কমিয়ে ` : '';
    const reply = `জি ঠিক আছে ভাইয়া! আপনার সম্মানে আমরা ${diffText}${bngDigits(bargainOffer.finalPrice)}৳-তেই রাখছি! 🎉🤝\n\nতাহলে আপনার ${bngDigits(bargainOffer.qty)} পিস কার্ডের অর্ডারটি কনফার্ম করার জন্য এগিয়ে নিচ্ছি।\n\n📋 অর্ডার করার সহজ ৩টি ধাপ:\n১️⃣ তথ্য পূরণ: প্রথমে নিচের 'ফর্ম পূরণ' বাটনে চাপ দিয়ে বর-কনের নাম ও অনুষ্ঠানসূচী লিখে পাঠান।\n২️⃣ অ্যাডভান্স: তথ্য পাওয়ার পর ৩০% অ্যাডভান্স (${bngDigits(bargainOffer.advance30)}৳) দিতে হবে।\n৩️⃣ ডিজাইন ও প্রিন্ট: ডিজাইনার আপনাকে ড্রাফট প্রুফ দেখাবে। পছন্দ হলে প্রিন্ট হবে!\n\n👇 অর্ডারটি শুরু করতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন:`;

    await updateOrder(senderId, { quantity: bargainOffer.qty });
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "📝 ফর্ম পূরণ করুন", payload: "BTN_FORM" },
      { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
      { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== QUANTITY — Show price for CURRENT category or Min 50 Pcs Warning =====
  else if (quantity && !isPriceObjectionOrDiscount) {
    if (quantity < 50) {
      const reply = getLowQtyPrice(quantity);
      await sendMessengerButtonBlock(senderId, reply, [
        { title: "৫০ পিস অর্ডার", payload: "QTY_50" },
        { title: "অর্ডার করবো", payload: "BTN_ORDER" },
        { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    } else {
      const currentCat = (await getCurrentCategory(senderId)) || 'affordable';
      const reply = getCategoryPrice(quantity, currentCat) + "\n\nঅর্ডার করতে চাইলে বলুন! 😊";

      const oppositeBtn = currentCat === 'premium'
        ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
        : { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" };

      await sendMessengerButtonBlock(senderId, reply, [
        { title: "অর্ডার করবো", payload: "BTN_ORDER" },
        oppositeBtn,
        { title: "দাম জানুন", payload: "BTN_PRICE" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    }
  }
  // ===== GENERAL DESIGN / CARD VIEW REQUEST =====
  else if (
    !txt.includes('affordable') && !txt.includes('premium') && !txt.includes('সাশ্রয়ী') && !txt.includes('প্রিমিয়াম') &&
    (txt.match(/(?:কার্ড|card|ডিজাইন|design|কালেকশন|collection).*?(?:দেখব|দেখবো|দেখতে|দেখান|দেখা|show|ছবি|pic)/i) ||
     txt.match(/^(কার্ড\s*দেখব|কার্ড\s*দেখবো|কার্ড\s*দেখতে\s*চাই|কার্ডের\s*ডিজাইন\s*দেখতে\s*চাই|ডিজাইন\s*দেখব|ডিজাইন\s*দেখতে\s*চাই|কালেকশন\s*দেখব|কালেকশন\s*দেখতে\s*চাই|ডিজাইন\s*গুলো\s*দেখতে\s*চাই)$/i) ||
     // FIX (P2-2 / STEP 7): the most natural opener of all — "কার্ড লাগবে",
     // "বিয়ের কার্ড লাগবে" — previously matched NOTHING here and fell all
     // the way through to the broken AI fallback (the #1 finding from the
     // audit). Recognized explicitly now.
     txt.match(/^(কার্ড|বিয়ের\s*কার্ড|বিয়ে\s*কার্ড)\s*(লাগবে|দরকার|চাই)$/i))
  ) {
    const reply = `আমাদের বিয়ের কার্ডের দুটি চমৎকার কালেকশন রয়েছে: 🌸\n\n💚 সাশ্রয়ী (Affordable) — সেরা বাজেটে আধুনিক লেজার-কাট ডিজাইন\n✨ প্রিমিয়াম (Premium) — বড় সাইজের লাক্সারি ও রাজকীয় লুক\n\nআপনি কোন কালেকশনের ডিজাইন দেখতে চান? 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== ORDER INTENT (VERIFY CARD SELECTION FIRST!) =====
  else if (
    payload === 'BTN_ORDER' ||
    payload === 'BTN_ORDER_PREMIUM' ||
    payload === 'BTN_ORDER_AFFORDABLE' ||
    (payload && payload.startsWith('BTN_ORDER')) ||
    (!payload && (
      txt.match(/(?:অর্ডার|order|বুকিং|booking)\s*(?:করবো|করব|করতে\s*চাই|করমু|দিব|দিবো|দেবো)?/i) ||
      txt === 'অর্ডার' || txt === 'order' || txt === 'বুকিং' || txt === 'booking'
    ))
  ) {
    let orderCategory = null;
    if (payload === 'BTN_ORDER_PREMIUM') orderCategory = 'premium';
    else if (payload === 'BTN_ORDER_AFFORDABLE') orderCategory = 'affordable';

    if (!orderCategory) {
      const sc = await getSelectedCard(senderId);
      if (sc) orderCategory = sc.category;
    }
    if (!orderCategory) {
      orderCategory = await getCurrentCategory(senderId);
    }

    const isOrderButtonClick = payload && payload.startsWith('BTN_ORDER');

    if (!orderCategory && !isOrderButtonClick) {
      const reply = `অর্ডার কনফার্ম করার আগে আপনার পছন্দের কার্ডটি জেনে নেওয়া প্রয়োজন! 🌸\n\nআপনি কোন কার্ডটি বানাতে চাইছেন?\n\n📸 আমাদের পেজ বা পোস্টের যে কার্ডটি আপনার পছন্দ হয়েছে, দয়া করে তার ছবি বা স্ক্রিনশট এখানে ইনবক্সে পাঠিয়ে দিন!\n👀 কালেকশন দেখতে চাইলে নিচের বাটন চাপুন: 😊`;
      await sendMessengerButtonBlock(senderId, reply, [
        { title: "💚 Affordable কালেকশন", payload: "BTN_AFFORDABLE" },
        { title: "✨ Premium কালেকশন", payload: "BTN_PREMIUM" },
        { title: "দাম জানুন", payload: "BTN_PRICE" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    } else {
      const catLabel = orderCategory === 'premium' ? '✨ Premium' : (orderCategory === 'affordable' ? '💚 Affordable' : '🌸');
      const cardDesc = orderCategory ? `(${catLabel})` : '';

      await sendMessengerText(senderId, ORDER_RULES_MSG);
      await appendMessage(senderId, 'bot', ORDER_RULES_MSG);

      const followUp = `দারুণ! আপনার পছন্দের কার্ড ${cardDesc} সিলেক্ট হয়েছে। 🎉\n\nএবার কার্ডের তথ্য পূরণ করতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন! 👇`;
      await setConversationStage(senderId, 'card_selected');
      await sendMessengerButtonBlock(senderId, followUp, [
        { title: "📝 ফর্ম পূরণ করুন", payload: "BTN_FORM" },
        { title: "অন্য ডিজাইন দেখুন", payload: "BTN_AFFORDABLE" },
        { title: "দাম জানুন", payload: "BTN_PRICE" }
      ]);
      await appendMessage(senderId, 'bot', followUp);
    }
  }
  // ===== AFFORDABLE COLLECTION =====
  else if (payload === 'BTN_AFFORDABLE' || payload === 'MORE_AFFORDABLE' || payload.startsWith('MORE_AFFORDABLE_') || (!payload && (txt.includes('affordable') || txt.includes('অ্যাফোর্ডেবল') || txt.includes('সাশ্রয়ী')))) {
    let offset = 0;
    if (payload.startsWith('MORE_AFFORDABLE_')) {
      offset = parseInt(payload.replace('MORE_AFFORDABLE_', ''), 10) || 0;
    }
    await sendSequentialGallery(senderId, 'affordable', offset);
  }
  // ===== PREMIUM COLLECTION =====
  else if (payload === 'BTN_PREMIUM' || payload === 'MORE_PREMIUM' || payload.startsWith('MORE_PREMIUM_') || (!payload && (txt.includes('premium') || txt.includes('প্রিমিয়াম') || txt.includes('লাক্সারি')))) {
    let offset = 0;
    if (payload.startsWith('MORE_PREMIUM_')) {
      offset = parseInt(payload.replace('MORE_PREMIUM_', ''), 10) || 0;
    }
    await sendSequentialGallery(senderId, 'premium', offset);
  }
  // ===== DESIGN & PRICE QUERY (e.g. "ডিজাইন এবং প্রাইজ দিবেন", "design and price", "ডিজাইন ও দাম") =====
  else if (txt.match(/ডিজাইন\s*(?:ও|এবং)?\s*(?:প্রাইজ|দাম|রেট)|(?:প্রাইজ|দাম|রেট)\s*(?:ও|এবং)?\s*ডিজাইন/i) || txt.match(/design\s*(?:and|o)?\s*(?:price|rate)|(?:price|rate)\s*(?:and|o)?\s*design/i)) {
    const reply = buildBothCategoriesPriceText(bngDigits) + "\n\nআমাদের সেরা ডিজাইনগুলোর ছবি দেখতে নিচে ক্যাটাগরি বেছে নিন: 👇";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== GENERAL DESIGN / CARD GALLERY REQUEST (e.g. "ডিজাইন দেখান", "কার্ড দেখান", "ডিজাইন দেখতে চাই") =====
  else if (txt.match(/(?:কার্ড|ডিজাইন|design|card)\s*(?:দেখান|দেখবো|দেখব|দেখতে\s*চাই|আছে|দিবেন|পাঠান|send\s*koren)/i) || txt === 'ডিজাইন' || txt === 'design' || txt === 'কার্ড' || txt === 'cards') {
    const reply = "আমাদের জনপ্রিয় সব বিয়ের কার্ডের ডিজাইন দেখতে নিচে ক্যাটাগরি বেছে নিন: 🌸";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== PRICE — Context-aware or complete price table (NO LOOPS!) =====
  else if ((
    payload === 'BTN_PRICE' ||
    txt.match(/\b(pp|p|dp|prc|pr|price|rate|cost|dam|daam|koto|koto\s*tk)\b/i) ||
    txt.match(/দাম|কত|কতো|মূল্য|রেট|প্রাইজ|টাকা|খরচ|পিস\s*কত|eita\s*koto|aita\s*koto|etar\s*dam|eitar\s*dam|atar\s*dam/i) ||
    txt === 'pp' || txt === 'pp?' || txt === 'p?' || txt === 'দাম' || txt === 'দাম?' || txt === 'কত?' || txt === 'কতো?'
  ) && !isPriceObjectionOrDiscount) {
    const currentCat = await getCurrentCategory(senderId);

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
      await appendMessage(senderId, 'bot', reply);
    } else {
      const reply = buildBothCategoriesPriceText(bngDigits) + "\nআপনার কত পিস লাগবে বলুন? 😊";

      await sendMessengerButtonBlock(senderId, reply, [
        { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
        { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
        { title: "অর্ডার করবো", payload: "BTN_ORDER" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    }
  }
  // ===== CATEGORY-SPECIFIC PRICE BUTTONS =====
  else if (payload === 'BTN_AFFORDABLE_PRICE') {
    await setCurrentCategory(senderId, 'affordable');
    const reply = getFullPriceTable('affordable') + "\n\nকত পিস লাগবে বলুন! 😊";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" },
      { title: "✨ Premium রেট", payload: "BTN_PREMIUM_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  else if (payload === 'BTN_PREMIUM_PRICE') {
    await setCurrentCategory(senderId, 'premium');
    const reply = getFullPriceTable('premium') + "\n\nকত পিস লাগবে বলুন! 😊";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" },
      { title: "💚 Affordable রেট", payload: "BTN_AFFORDABLE_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== CUSTOMER SAYS THEY SENT PHOTO BY TEXT (CHECK IF REAL PHOTO EXISTS) =====
  else if (payload === 'BTN_HAS_PHOTO' || txt.match(/ছবি\s*(দিয়েছি|দিছি|পাঠিয়েছি|পাঠাইছি)|chobi\s*(disi|diasi|dichi|pathaisi)/i)) {
    const existingCard = await getSelectedCard(senderId);
    if (!existingCard) {
      const reply = `আমরা তো এখনো আপনার পছন্দের কার্ডের কোনো ছবি পাইনি ভাইয়া! 🌸\n\nদয়া করে মেসেঞ্জারের ক্যামেরা বা গ্যালারি আইকন চেপে আপনার পছন্দের কার্ডটির ছবি বা স্ক্রিনশট এখানে পাঠিয়ে দিন। ছবি পেলেই আমরা সাথে সাথে ফর্ম দেবো! 😊`;
      await sendMessengerButtonBlock(senderId, reply, [
        { title: "💚 Affordable কালেকশন", payload: "BTN_AFFORDABLE" },
        { title: "✨ Premium কালেকশন", payload: "BTN_PREMIUM" },
        { title: "দাম জানুন", payload: "BTN_PRICE" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    } else {
      const reply = `জি অনেক ধন্যবাদ! আপনার পাঠানো ছবি অনুযায়ী ডিজাইনার কাজ করবে। 🌸\n\nএবার বর-কনের নাম ও অনুষ্ঠানসূচীর তথ্য পাঠাতে নিচের 'ফর্ম পূরণ' বাটনে চাপুন: 👇`;
      await sendMessengerButtonBlock(senderId, reply, [
        { title: "📝 ফর্ম পূরণ করুন", payload: "BTN_FORM" },
        { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
        { title: "📞 হটলাইনে কথা বলুন", payload: "BTN_HOTLINE" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    }
  }
  // ===== BOTH FORMS / ORDER FORM & INFORMATION REQUEST =====
  else if (payload === 'BTN_BOTH_FORMS' || (!isFormSubmission && (
    txt.match(/bangla\s*(and|&|\+|,|o|\s+)\s*english\s*form/i) ||
    txt.match(/english\s*(and|&|\+|,|o|\s+)\s*bangla\s*form/i) ||
    txt.match(/বাংলা\s*(এবং|ও|আর|\+|,)\s*(ইংরেজি|ইংলিশ)\s*(ফর্ম|ফরম)/i) ||
    txt.match(/(ইংরেজি|ইংলিশ)\s*(এবং|ও|আর|\+|,)\s*বাংলা\s*(ফর্ম|ফরম)/i) ||
    txt.match(/দুটো\s*ফর্ম|দুইটা\s*ফর্ম|উভয়\s*ফর্ম|both\s*forms?/i)
  ))) {
    await sendMessengerText(senderId, BANGLA_ORDER_FORM_TEXT);
    await appendMessage(senderId, 'bot', BANGLA_ORDER_FORM_TEXT);
    await delay(300);

    await sendMessengerText(senderId, ENGLISH_ORDER_FORM_TEXT);
    await appendMessage(senderId, 'bot', ENGLISH_ORDER_FORM_TEXT);
    await delay(300);

    const bothTipMsg = "উপরে বাংলা ও ইংরেজি দুটি ফর্মই দেওয়া হলো। 🌸\nযেকোনো একটি ফর্ম কপি করে আপনার কার্ডের তথ্য ও পরিমাণ (কত পিস লাগবে) লিখে পাঠিয়ে দিন! 🥰";
    await setConversationStage(senderId, 'collecting_info');
    await sendMessengerButtonBlock(senderId, bothTipMsg, [
      { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
      { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', bothTipMsg);
  }
  // ===== BANGLA ORDER FORM =====
  else if (payload === 'BTN_FORM_BN' || (!isFormSubmission && (
    txt.match(/bangla\s*form|বাংলা\s*ফর্ম|বাংলা\s*ফরম/i) ||
    (txt.match(/বাংলা|bangla/i) && txt.match(/ফর্ম|form|ফরম/i)) ||
    txt === 'বাংলা' || txt === 'বাংলায়' || txt === 'bangla' || txt === 'banglay' ||
    txt.match(/^(bangla\s*hobe|বাংলা\s*হবে|বাংলাতে)$/i)
  ))) {
    await sendMessengerText(senderId, BANGLA_ORDER_FORM_TEXT);
    await appendMessage(senderId, 'bot', BANGLA_ORDER_FORM_TEXT);

    const tipMsg = "উপরের ফর্মটি কপি করে তথ্য ও কার্ডের পরিমাণ (কত পিস লাগবে) লিখে পাঠিয়ে দিন! 🥰";
    await setConversationStage(senderId, 'collecting_info');
    await sendMessengerButtonBlock(senderId, tipMsg, [
      { title: "🇬🇧 English Form", payload: "BTN_FORM_EN" },
      { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', tipMsg);
  }
  // ===== ENGLISH ORDER FORM =====
  else if (payload === 'BTN_FORM_EN' || (!isFormSubmission && (
    txt.match(/english\s*form|ইংরেজি\s*ফর্ম|ইংলিশ\s*ফর্ম|ইংরেজি\s*ফরম|ইংলিশ\s*ফরম/i) ||
    (txt.match(/english|ইংরেজি|ইংলিশ/i) && txt.match(/ফর্ম|form|ফরম/i)) ||
    txt === 'english' || txt === 'ইংরেজি' || txt === 'ইংলিশ' || txt === 'ইংরেজিতে' ||
    txt.match(/^(english\s*hobe|ইংরেজিতে\s*হবে|ইংলিশে\s*হবে)$/i)
  ))) {
    await sendMessengerText(senderId, ENGLISH_ORDER_FORM_TEXT);
    await appendMessage(senderId, 'bot', ENGLISH_ORDER_FORM_TEXT);

    const tipMsgEn = "Please copy the form above, fill in the details & quantity, and send it here! 🥰";
    await setConversationStage(senderId, 'collecting_info');
    await sendMessengerButtonBlock(senderId, tipMsgEn, [
      { title: "🇧🇩 বাংলা ফর্ম", payload: "BTN_FORM_BN" },
      { title: "অর্ডার নিয়মাবলী", payload: "BTN_POLICY" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', tipMsgEn);
  }
  // ===== GENERAL FORM OR INFORMATION CHECKLIST QUERY =====
  else if (payload === 'BTN_FORM' || (!isFormSubmission && (
    txt.match(/ফর্ম|form|ফরম/i) ||
    txt.match(/তথ্য|information|info|ডিটেইলস|details|কি\s*কি\s*লাগবে|কী\s*কী\s*লাগবে|কি\s*লাগবে|কী\s*লাগবে|কি\s*তথ্য|কী\s*তথ্য|তথ্য\s*লাগবে|info\s*lagbe|information\s*lagbe/i)
  ))) {
    const infoNotice = `📋 বিয়ের কার্ড তৈরিতে যেসব তথ্য প্রয়োজন হয়:\n\n১. 📦 কার্ডের পরিমাণ (কত পিস লাগবে)\n২. 🤵 বরের নাম, পিতা, মাতা ও ঠিকানা\n৩. 👰 কনের নাম, পিতা, মাতা ও ঠিকানা\n৪. 📅 অনুষ্ঠানসূচী (হলুদ, বিবাহ, বৌ-ভাত: তারিখ, সময় ও স্থান)\n৫. 💌 আমন্ত্রণে (ছোটদের নাম, যোগাযোগ নম্বর)\n৬. 🚚 কুরিয়ার ডেলিভারি ঠিকানা ও মোবাইল\n\nআপনার কার্ডটি কি বাংলায় করবেন নাকি ইংরেজিতে? নিচের বাটন থেকে ফর্ম সিলেক্ট করুন: 👇\n\n💡 (চাইলে পুরো ফর্ম একসাথে না লিখে, একটা একটা করে তথ্য দিলেও চলবে — আমি জিজ্ঞেস করে করে নিয়ে নেব!)`;
    await sendMessengerButtonBlock(senderId, infoNotice, [
      { title: "🇧🇩 বাংলা ফর্ম", payload: "BTN_FORM_BN" },
      { title: "🇬🇧 English Form", payload: "BTN_FORM_EN" },
      { title: "উভয় ফর্ম দেখুন", payload: "BTN_BOTH_FORMS" }
    ]);
    await appendMessage(senderId, 'bot', infoNotice);
  }
  // ===== DELIVERY TIMELINE QUERY =====
  else if (txt.match(/ডেলিভারি\s*(সময়|সময়|কতদিন|কবে)|কত\s*দিন\s*(লাগবে|লাগে)|কতদিনে\s*(পাব|পৌঁছাবে)|কবে\s*(পাব|পৌঁছাবে)|delivery\s*(time|koto|din)/i)) {
    const reply = `🚚 আমাদের ডেলিভারি সময় ও প্রক্রিয়া:\n\n• ডিজাইন ও প্রুফ চেক: কার্ডের তথ্য পাওয়ার পর ১-২ দিনের মধ্যে ডিজাইনার প্রুফ দেখাবে।\n• প্রিন্ট ও ডেলিভারি: আপনার ডিজাইন ওকে হওয়ার পর ৫-৭ কর্মদিবসের মধ্যে জেলা শহরে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি পৌঁছে যাবে!\n\n(জরুরি প্রয়োজনে মানিকগঞ্জ অফিস বা ঢাকার নির্দিষ্ট কারখানা থেকেও সংগ্রহ করতে পারবেন) 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "দাম জানুন", payload: "BTN_PRICE" },
      { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  else if (payload === 'BTN_POLICY' || txt.match(/পলিসি|policy|কুরিয়ার/)) {
    await sendMessengerText(senderId, ORDER_RULES_MSG);
    await appendMessage(senderId, 'bot', ORDER_RULES_MSG);

    const followUp = "কার্ডের তথ্য পাঠাতে নিচের বাটনে চাপুন: 👇";
    await sendMessengerButtonBlock(senderId, followUp, [
      { title: "📝 ফর্ম পূরণ করুন", payload: "BTN_FORM" },
      { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', followUp);
  }
  // ===== DIRECT CARD CODE QUERY (e.g. AFF-012, PREM-005, AFF 12) =====
  else if (txt.match(/\b(aff|prem)[-_\s]*(\d{1,3})\b/i)) {
    const codeMatch = txt.match(/\b(aff|prem)[-_\s]*(\d{1,3})\b/i);
    const prefix = codeMatch[1].toLowerCase() === 'prem' ? 'PREM' : 'AFF';
    const num = String(parseInt(codeMatch[2], 10)).padStart(3, '0');
    const cardCode = prefix + '-' + num;
    const category = prefix === 'PREM' ? 'premium' : 'affordable';
    await setCurrentCategory(senderId, category);
    await setSelectedCard(senderId, { category, code: cardCode });

    const priceTable = getFullPriceTable(category);
    const emoji = category === 'premium' ? '✨' : '💚';
    const catName = category === 'premium' ? 'Premium (লাক্সারি)' : 'Affordable (সাশ্রয়ী)';

    const reply = `আমাদের ${emoji} ${catName} কালেকশনের কার্ড:\n\n${priceTable}\n\nকত পিস লাগবে বলুন! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "অর্ডার করবো", payload: "BTN_ORDER" },
      { title: "দাম জানুন", payload: "BTN_PRICE" },
      { title: "কার্ড দেখুন", payload: category === 'premium' ? "BTN_PREMIUM" : "BTN_AFFORDABLE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== NIKAHNAMA QUERY =====
  else if (txt.match(/nikahnama|নিকাহনামা|নিকাহ নামা/i)) {
    const reply = `📜 নিকাহনামা তথ্য:\n\nনিকাহনামা সার্ভিস সম্পর্কে জানতে বা আলাদাভাবে নিকাহনামা প্রিন্ট করতে আমাদের হটলাইনে কল বা হোয়াটসঅ্যাপ করুন! 😊\n\n📞 হটলাইন: 01701016826 (বন্ধন হটলাইন)`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== CUSTOM DESIGN / PROOFING QUERY =====
  else if (txt.match(/custom|কাস্টম|ডিজাইন চেঞ্জ|ডিজাইনার|লেখা/i)) {
    const reply = `🎨 কাস্টম ডিজাইন সুবিধা:

অর্ডার কনফার্ম (৩০% অ্যাডভান্স) করার পর আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে হোয়াটসঅ্যাপ/মেসেঞ্জারে চেক করাবে।

আপনার পছন্দ ও ওকে হওয়ার পরই প্রিন্ট শুরু হবে! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "অর্ডার করবো", payload: "BTN_ORDER" },
      { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== LOCATION / ADDRESS =====
  // FIX (P2-2 / Part F finding): only treat "ঠিকানা" as an office-location
  // QUESTION, not a statement about the customer's OWN delivery address
  // ("আমি ঠিকানা পরে দিব" = "I'll give the address later" — was
  // previously misrouted into reciting the shop's own address).
  else if (payload === 'BTN_LOCATION' || (
    txt.match(/location|লোকেশন|ঠিকানা|address|kothay|কোথায়|office|অফিস|shop|দোকান|shoroom|শো-রুম|showroom|কারখানা|karkhana/i) &&
    !Parser.isWaitOrDeferIntent(text)
  )) {
    const reply = `📍 আমাদের অফিস ও ঠিকানার তথ্য:\n\n🏢 অফিস: ২/১-২, ভূমি অফিস লেন, মানিকগঞ্জ, ঢাকা।\n🏭 কারখানা: ফকিরাপুল, বাবুবাজার, বঙ্গবাজার (ঢাকা)।\n\n🛒 অর্ডার প্রক্রিয়া:\nঅনলাইনে অথবা মানিকগঞ্জ অফিসে সরাসরি এসে অর্ডার করতে পারবেন।\n\n📦 প্রোডাক্ট ডেলিভারি/সংগ্রহ:\n• কুরিয়ারের মাধ্যমে (সারাদেশে হোম ডেলিভারি)\n• মানিকগঞ্জ অফিসে সরাসরি\n• অথবা কার্ডের ধরন অনুযায়ী ঢাকার নির্দিষ্ট কারখানা থেকেও সংগ্রহ করতে পারবেন!\n\n🗺️ গুগল ম্যাপ লিংক:\nhttps://maps.app.goo.gl/CnyRST5KxHjWDAtd9\n\nকার্ড দেখতে বা অর্ডার করতে নিচের বাটনে চাপুন! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== HOTLINE BUTTON =====
  else if (payload === 'BTN_HOTLINE') {
    const reply = `📞 আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন:\n01701016826 (বন্ধন হটলাইন)\n\nআমরা সার্বক্ষণিক সহায়তায় আছি! 😊`;
    await sendMessengerText(senderId, reply);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== PAYMENT / BKASH NUMBER QUERY =====
  else if (txt.match(/bkash|bKash|বিকাশ|nagad|নগদ|rocket|রকেট|payment|পেমেন্ট|এডভান্স|advance/i) && !isPaymentDonePhrase) {
    const reply = `💳 পেমেন্ট তথ্য:\n\nঅর্ডার কনফার্ম করতে ৩০% অ্যাডভান্স পেমেন্ট করতে হবে।\n\n📲 পেমেন্ট নম্বর (পার্সোনাল):\n01682588856 (বিকাশ / নগদ / রকেট)\n\nপেমেন্ট করার পর এখানে স্ক্রিনশট বা ট্রানজেকশন আইডি পাঠান! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "ফর্ম পূরণ", payload: "BTN_FORM" },
      { title: "কার্ড দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== CONTACT / PHONE / HOTLINE =====
  else if (txt.match(/phone|mobile|ফোন|মোবাইল|contact|যোগাযোগ|hotline|whatsapp|হোয়াটসঅ্যাপ|কথা বলব|call/i)) {
    const reply = `📞 আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন:\n01701016826 (বন্ধন হটলাইন)\n\nআপনার যেকোনো প্রশ্নের জন্য আমরা রেডি আছি! 😊`;
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== CUSTOMER IS CONFUSED — offer help + human option instead of going silent =====
  // NEW (Part E/G finding): the original bot had NO branch at all for
  // "আমি বুঝি নাই" style messages — they fell through to the (broken)
  // AI fallback. Handled explicitly now, always with a way to reach a human.
  else if (Parser.isConfusedIntent(text)) {
    const reply = "কোনো সমস্যা নেই, আবার সহজভাবে বলি! 😊 আপনি কি বিয়ের কার্ড দেখতে চান, দাম জানতে চান, নাকি অর্ডার করতে চান? অথবা সরাসরি আমাদের একজনের সাথে কথা বলতে চাইলে জানান।";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "দাম জানুন", payload: "BTN_PRICE" },
      { title: "📞 মানুষের সাথে কথা বলব", payload: "BTN_HOTLINE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== CUSTOMER SAYS THEY'LL ANSWER LATER / ASKS TO WAIT =====
  // NEW: previously fell through to the broken AI fallback too. A
  // "wait"/"I'll tell you later" message deserves a light acknowledgment,
  // not silence or an unrelated reply.
  else if (Parser.isWaitOrDeferIntent(text)) {
    const reply = "জি, কোনো তাড়া নেই! 😊 যখন সময় হবে জানাবেন, আমি এখানেই আছি।";
    await sendMessengerText(senderId, reply);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== INNER PAGE / DESIGN SAMPLE QUERY =====
  else if (Parser.isInnerPageQuery(text)) {
    const sampleImg = INNER_DESIGN_SAMPLE?.url || INNER_DESIGN_SAMPLE?.driveId || "https://boondhon-platform-qr9a.vercel.app/samples/inner-sample-01.jpg";
    await sendMessengerImage(senderId, sampleImg, 'inner_sample');

    const reply = "এটা আমাদের ভেতরের পাতার একটা sample layout। আপনার ধর্ম অনুযায়ী (ইসলামিক — বিসমিল্লাহ ক্যালিগ্রাফি, বা সনাতন — শ্রী শ্রী গণেশায় নমঃ) উপরের অংশ পরিবর্তন করে দেওয়া হবে, বাকি design অপরিবর্তিত থাকবে। আপনার আর কনে/বরের নাম, তারিখ, ঠিকানাও এখানে বসিয়ে দেওয়া হবে।";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== ACKNOWLEDGEMENTS ("ok", "okay", "ঠিক আছে", "জি", "আচ্ছা", "হুম", "ধন্যবাদ") =====
  else if (txt.match(/^(ok|okay|ওকে|ঠিক আছে|জি|আচ্ছা|accha|acha|হুম|hum|thik ase|thik|হয়তো|থাক)$/i)) {
    const reply = "জি ধন্যবাদ! 😊 আমাদের বিয়ের কার্ড দেখতে বা অর্ডার করতে নিচের বাটনে চাপুন!";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "অর্ডার করবো", payload: "BTN_ORDER" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  else if (txt.match(/^(thanks|thank you|ধন্যবাদ|ধন্যবাদ।)$/i)) {
    const reply = "আপনাকেও অনেক ধন্যবাদ! 🌸 বিয়ের কার্ড সংক্রান্ত যেকোনো দরকারে আমাদের জানাতে পারেন।";
    await sendMessengerButtonBlock(senderId, reply, [
      { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
      { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
      { title: "দাম জানুন", payload: "BTN_PRICE" }
    ]);
    await appendMessage(senderId, 'bot', reply);
  }
  // ===== DEFAULT — Welcome or AI fallback =====
  else {
    const isGreeting = Parser.isGreeting(text);

    if (isGreeting || isButtonClick) {
      const reply = "আসসালামু আলাইকুম! 🌸\nবন্ধন প্রিন্টিং হাউসে স্বাগতম।\nআপনি কি বিয়ের কার্ড দেখতে চাইছেন?";
      await sendMessengerButtonBlock(senderId, reply, [
        { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" },
        { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" },
        { title: "দাম জানুন", payload: "BTN_PRICE" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    } else {
      // ===== AI SALES BRAIN — Smart conversational reply =====
      // FIX (P0-1): this branch used to crash on every message that
      // reached it — `existingConv` was referenced without ever being
      // declared. `existingConv` is now loaded at the top of this
      // function (before appendMessage), so this works correctly.
      const currentCat = await getCurrentCategory(senderId);
      const catBtn = currentCat === 'premium'
        ? { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" }
        : currentCat === 'affordable'
          ? { title: "✨ Premium দেখুন", payload: "BTN_PREMIUM" }
          : { title: "💚 Affordable দেখুন", payload: "BTN_AFFORDABLE" };

      const convHistory = existingConv?.messages || [];
      const aiReply = await generateAISalesResponse(senderId, text, convHistory);

      let fallbackMsg = "ধন্যবাদ! 😊 আমাদের কালেকশন দেখতে নিচের বাটনে ক্লিক করুন, অথবা সরাসরি মানুষের সাথে কথা বলতে চাইলে জানান!";
      if (isPriceObjectionOrDiscount) {
        fallbackMsg = "আপনার বাজেট ও দিকটা বুঝতে পারছি। আমাদের কার্ডগুলোতে প্রিমিয়াম মেটেরিয়াল ও নিখুঁত ফিনিশিং নিশ্চিত করা হয়। আপনি মোট কত পিস নিতে চাইছেন আর কেমন বাজেট ভাবছেন জানালে, সেরা অপশনটি বের করে দিচ্ছি! 😊";
      }
      const reply = aiReply || fallbackMsg;
      await sendMessengerButtonBlock(senderId, reply, [
        catBtn,
        { title: "দাম জানুন", payload: "BTN_PRICE" },
        { title: "অর্ডার করবো", payload: "BTN_ORDER" }
      ]);
      await appendMessage(senderId, 'bot', reply);
    }
  }
}
