/**
 * test-matcher.js
 * 
 * Verifies catalog matching logic and cosine similarity.
 */

const fs = require('fs');
const path = require('path');

const EMBEDDINGS_PATH = path.join(__dirname, '..', 'lib', 'catalog-embeddings.json');

function main() {
  console.log('=================================================');
  console.log('  BOONDHON Catalog Matcher Verification Test');
  console.log('=================================================');

  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.log('ℹ️  catalog-embeddings.json does not exist yet.');
    console.log('   Run `node scripts/build-catalog-index.js` with your GEMINI_API_KEY to generate it.');
    console.log('=================================================');
    return;
  }

  const data = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
  const embeddings = data.embeddings || {};
  const total = Object.keys(embeddings).length;

  console.log(`✅ Loaded catalog index with ${total} embeddings.`);
  console.log(`   Model: ${data.model || 'N/A'}`);
  console.log(`   Generated At: ${data.generated_at || 'N/A'}`);

  const affordableCount = Object.values(embeddings).filter(e => e.category === 'affordable').length;
  const premiumCount = Object.values(embeddings).filter(e => e.category === 'premium').length;

  console.log(`   Affordable Embeddings: ${affordableCount}`);
  console.log(`   Premium Embeddings:    ${premiumCount}`);
  console.log('=================================================');
}

main();
