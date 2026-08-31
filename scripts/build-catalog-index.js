#!/usr/bin/env node
/**
 * build-catalog-index.js
 * 
 * One-time script to generate multimodal embeddings for all catalog images.
 * Downloads each image from Google Drive and creates an embedding vector using
 * Gemini's embedding model, then saves to lib/catalog-embeddings.json.
 * 
 * Usage:
 *   node scripts/build-catalog-index.js              # Full build (all 161 images)
 *   node scripts/build-catalog-index.js --test        # Test with first 3 images only
 *   node scripts/build-catalog-index.js --resume      # Resume from where it left off
 * 
 * Requires:
 *   - GEMINI_API_KEY environment variable set
 */

const fs = require('fs');
const path = require('path');

// ===== CATALOG DATA (copied from lib/data.js) =====
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

// ===== CONFIGURATION =====
const OUTPUT_PATH = path.join(__dirname, '..', 'lib', 'catalog-embeddings.json');
const EMBEDDING_MODELS = ['gemini-embedding-2', 'multimodal-embedding-001', 'text-embedding-004'];
const DRIVE_URL = (id) => `https://lh3.googleusercontent.com/d/${id}`;
const MAX_RETRIES = 3;
const DELAY_BETWEEN_REQUESTS_MS = 500;

// ===== HELPERS =====
function getCardCode(type, index) {
  const prefix = type === 'premium' ? 'PREM' : 'AFF';
  const num = String(index + 1).padStart(3, '0');
  return `${prefix}-${num}`;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(driveId) {
  const url = DRIVE_URL(driveId);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to download image ${driveId}: HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = (response.headers.get('content-type') || 'image/jpeg').split(';')[0];
  return { buffer, contentType };
}

async function generateEmbedding(imageBuffer, mimeType, apiKey) {
  const base64Data = imageBuffer.toString('base64');
  let lastErr = null;

  for (const modelName of EMBEDDING_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            parts: [{
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.embedding && data.embedding.values) {
          return { vector: data.embedding.values, modelUsed: modelName };
        }
      } else {
        const errText = await response.text();
        lastErr = new Error(`Model ${modelName} failed (${response.status}): ${errText}`);
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('All embedding models failed');
}

// ===== MAIN =====
async function main() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is not set.');
    console.error('   Set it: set GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const isTest = process.argv.includes('--test');
  const isResume = process.argv.includes('--resume');

  const allImages = [
    ...AFFORDABLE_IDS.map((id, i) => ({ id, category: 'affordable', code: getCardCode('affordable', i) })),
    ...PREMIUM_IDS.map((id, i) => ({ id, category: 'premium', code: getCardCode('premium', i) }))
  ];

  const imagesToProcess = isTest ? allImages.slice(0, 3) : allImages;

  console.log('=================================================');
  console.log('  BOONDHON Catalog Embedding Index Builder');
  console.log('=================================================');
  console.log(`  Model:    ${EMBEDDING_MODELS.join(', ')}`);
  console.log(`  Images:   ${imagesToProcess.length} of ${allImages.length}`);
  console.log(`  Mode:     ${isTest ? 'TEST (3 images)' : isResume ? 'RESUME' : 'FULL BUILD'}`);
  console.log(`  Output:   ${OUTPUT_PATH}`);
  console.log('=================================================\n');

  let existingIndex = { version: 1, model: EMBEDDING_MODELS[0], generated_at: '', embeddings: {} };
  if (isResume && fs.existsSync(OUTPUT_PATH)) {
    try {
      existingIndex = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      console.log(`📂 Loaded existing index with ${Object.keys(existingIndex.embeddings).length} embeddings.\n`);
    } catch (err) {
      console.warn('⚠️  Could not load existing index, starting fresh.\n');
    }
  }

  const index = existingIndex;
  let successCount = Object.keys(index.embeddings).length;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < imagesToProcess.length; i++) {
    const img = imagesToProcess[i];
    const progress = `[${i + 1}/${imagesToProcess.length}]`;

    if (isResume && index.embeddings[img.id]) {
      skipCount++;
      process.stdout.write(`${progress} ⏭️  ${img.code} (already indexed)\n`);
      continue;
    }

    let lastError = null;
    for (let retry = 0; retry < MAX_RETRIES; retry++) {
      try {
        process.stdout.write(`${progress} 📸 ${img.code} (${img.category}) ... `);
        const { buffer, contentType } = await downloadImage(img.id);
        process.stdout.write(`downloaded (${(buffer.length / 1024).toFixed(0)}KB) ... `);
        const { vector, modelUsed } = await generateEmbedding(buffer, contentType, GEMINI_API_KEY);
        process.stdout.write(`embedded (${vector.length}d via ${modelUsed}) ✅\n`);
        index.embeddings[img.id] = { category: img.category, code: img.code, vector };
        successCount++;
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (retry < MAX_RETRIES - 1) {
          const waitMs = (retry + 1) * 2000;
          process.stdout.write(`⚠️ retry ${retry + 1}/${MAX_RETRIES} (waiting ${waitMs}ms)...\n`);
          await delay(waitMs);
        }
      }
    }

    if (lastError) {
      console.error(`${progress} ❌ ${img.code} FAILED: ${lastError.message}`);
      failCount++;
    }

    if ((i + 1) % 10 === 0) {
      index.generated_at = new Date().toISOString();
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index), 'utf-8');
      console.log(`   💾 Progress saved (${Object.keys(index.embeddings).length} embeddings)\n`);
    }

    await delay(DELAY_BETWEEN_REQUESTS_MS);
  }

  index.generated_at = new Date().toISOString();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index), 'utf-8');
  const fileSizeMB = (fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2);

  console.log('\n=================================================');
  console.log('  BUILD COMPLETE');
  console.log('=================================================');
  console.log(`  ✅ Success:  ${successCount}`);
  console.log(`  ⏭️  Skipped:  ${skipCount}`);
  console.log(`  ❌ Failed:   ${failCount}`);
  console.log(`  📁 Output:   ${OUTPUT_PATH} (${fileSizeMB} MB)`);
  console.log('=================================================');

  if (failCount > 0) {
    console.log('\n⚠️  Some images failed. Run with --resume to retry failed ones.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
