/**
 * catalog-matcher.js
 * 
 * Runtime module for matching customer-uploaded photos against
 * pre-computed catalog embeddings using cosine similarity.
 * 
 * Usage in messenger.js:
 *   import { findCatalogMatch } from '../../lib/catalog-matcher';
 *   const match = await findCatalogMatch(base64ImageData, 'image/jpeg');
 *   // match = { id, category, code, similarity } or null
 */

import fs from 'fs';
import path from 'path';

// ===== CONFIGURATION =====
const EMBEDDING_MODELS = ['gemini-embedding-2', 'multimodal-embedding-001', 'text-embedding-004'];
const MATCH_THRESHOLD = 0.48; // Lowered to 0.48 to reliably match real-world mobile camera photos, screenshots, and crops
const EMBEDDINGS_PATH = path.join(process.cwd(), 'lib', 'catalog-embeddings.json');

// ===== CACHED CATALOG INDEX =====
let cachedIndex = null;

function loadCatalogIndex() {
  if (cachedIndex) return cachedIndex;

  try {
    // Try requiring directly (Webpack / Next.js bundles this at build time)
    try {
      cachedIndex = require('./catalog-embeddings.json');
      if (cachedIndex && cachedIndex.embeddings) {
        console.log(`catalog-matcher: Bundled index loaded (${Object.keys(cachedIndex.embeddings).length} embeddings)`);
        return cachedIndex;
      }
    } catch (e) {
      // Fallback to fs read
    }

    if (fs.existsSync(EMBEDDINGS_PATH)) {
      const raw = fs.readFileSync(EMBEDDINGS_PATH, 'utf-8');
      cachedIndex = JSON.parse(raw);
      console.log(`catalog-matcher: Loaded ${Object.keys(cachedIndex.embeddings).length} catalog embeddings from fs`);
      return cachedIndex;
    }

    console.warn('catalog-matcher: catalog-embeddings.json not found');
    return null;
  } catch (err) {
    console.error('catalog-matcher: Failed to load catalog index:', err.message);
    return null;
  }
}

// ===== MATH HELPERS =====
function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  const dot = dotProduct(a, b);
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// ===== EMBEDDING GENERATION =====
async function generateImageEmbedding(base64Data, mimeType, apiKey) {
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
          return data.embedding.values;
        }
      } else {
        const errorText = await response.text();
        lastErr = new Error(`Embedding API error (${response.status}): ${errorText}`);
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('All embedding models failed');
}

// ===== MAIN MATCHING FUNCTION =====

/**
 * Find the best matching catalog image for a customer's uploaded photo.
 * 
 * @param {string} base64Data - Base64-encoded image data
 * @param {string} mimeType - MIME type of the image (e.g. 'image/jpeg')
 * @returns {Promise<Object|null>} Best match result or null if no match found
 *   { id, category, code, similarity, isMatch, topMatches }
 */
export async function findCatalogMatch(base64Data, mimeType) {
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
  if (!GEMINI_API_KEY) {
    console.error('catalog-matcher: GEMINI_API_KEY is not set');
    return null;
  }

  const index = loadCatalogIndex();
  if (!index || !index.embeddings || Object.keys(index.embeddings).length === 0) {
    console.warn('catalog-matcher: No catalog embeddings available. Run build-catalog-index.js first.');
    return null;
  }

  try {
    // 1. Generate embedding for the customer's photo
    const customerEmbedding = await generateImageEmbedding(base64Data, mimeType, GEMINI_API_KEY);

    // 2. Compare against all catalog embeddings
    const results = Object.entries(index.embeddings).map(([id, data]) => ({
      id,
      category: data.category,
      code: data.code,
      similarity: cosineSimilarity(customerEmbedding, data.vector)
    }));

    // 3. Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    const best = results[0];
    const isMatch = best && best.similarity >= MATCH_THRESHOLD;

    console.log(`catalog-matcher: Best match = ${best.code} (${best.category}) @ ${(best.similarity * 100).toFixed(1)}% similarity | isMatch=${isMatch}`);

    // Return the best match + top 5 for debugging
    return {
      id: best.id,
      category: best.category,
      code: best.code,
      similarity: best.similarity,
      isMatch,
      topMatches: results.slice(0, 5).map(r => ({
        code: r.code,
        category: r.category,
        similarity: (r.similarity * 100).toFixed(1) + '%'
      }))
    };

  } catch (err) {
    console.error('catalog-matcher: Match error:', err.message);
    return null;
  }
}

/**
 * Check if the catalog embeddings file exists and is valid.
 * @returns {boolean}
 */
export function isCatalogIndexReady() {
  const index = loadCatalogIndex();
  return !!(index && index.embeddings && Object.keys(index.embeddings).length > 0);
}

/**
 * Get top N closest catalog images to a customer photo.
 * Useful for showing "similar designs" when no exact match is found.
 * 
 * @param {string} base64Data - Base64-encoded image data
 * @param {string} mimeType - MIME type
 * @param {number} n - Number of results to return
 * @returns {Promise<Array>} Array of { id, category, code, similarity }
 */
export async function findTopNMatches(base64Data, mimeType, n = 3) {
  const result = await findCatalogMatch(base64Data, mimeType);
  if (!result) return [];

  // Re-load the full results from the top matches
  // The findCatalogMatch already returns topMatches, but we need the IDs
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
  const index = loadCatalogIndex();
  if (!index) return [];

  const customerEmbedding = await generateImageEmbedding(base64Data, mimeType, GEMINI_API_KEY);
  
  const results = Object.entries(index.embeddings).map(([id, data]) => ({
    id,
    category: data.category,
    code: data.code,
    similarity: cosineSimilarity(customerEmbedding, data.vector)
  }));

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, n);
}
