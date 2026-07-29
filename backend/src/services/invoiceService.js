const fs = require('fs');
const path = require('path');
const { jsonrepair } = require('jsonrepair');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const EXTENSION_TO_MEDIA_TYPE = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const EXTRACTION_PROMPT = `You are an invoice data extraction engine.
You will be shown one invoice document, which may be a clean printed invoice
OR a photo of a handwritten / hand-filled invoice.

Read every field carefully, including handwritten numbers and cursive text.
If a field truly cannot be determined, use null (do not guess).

Respond with ONLY a single JSON object, no markdown fences, no commentary,
using exactly this shape:

{
  "invoiceNumber": string|null,
  "supplier": string|null,
  "billTo": string|null,
  "invoiceDate": string|null,
  "paymentMethod": string|null,
  "subtotal": number|null,
  "tax": number|null,
  "totalAmount": number|null,
  "isHandwritten": boolean,
  "items": [
    { "description": string, "quantity": number|null, "unitPrice": number|null, "total": number|null }
  ]
}

Rules:
- "totalAmount" is the grand total due (after tax), not the subtotal.
- If subtotal/tax aren't explicitly shown but totalAmount is, it's fine to leave subtotal/tax null.
- "isHandwritten" should be true if the invoice text is handwritten or filled into a template by hand.
- Numbers must be plain JSON numbers (no currency symbols, no thousands separators).
- If there are no line items, return an empty array for "items".
- Each string value must be a single line: never put a literal line break inside a
  string, collapse multi-line addresses/descriptions into one line separated by ", ".
- Do not add a trailing comma after the last item in an array or object.`;

function getMediaType(filePath, mimetype) {
  if (mimetype === 'application/pdf') return 'application/pdf';
  if (mimetype && mimetype.startsWith('image/')) return mimetype;
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSION_TO_MEDIA_TYPE[ext] || 'application/pdf';
}

function extractJsonFromText(rawText) {
  // Gemini is asked for pure JSON via response_mime_type, but strip fences
  // defensively in case it wraps the answer in ```json ... ``` anyway.
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Model response did not contain a JSON object');
  }
  const candidate = cleaned.slice(firstBrace, lastBrace + 1);

  // Try a strict parse first (fast path for the common case).
  try {
    return JSON.parse(candidate);
  } catch (strictError) {
    // Handwritten / messier OCR output occasionally produces near-valid
    // JSON — a trailing comma, an unescaped newline inside a string, etc.
    // jsonrepair fixes these classes of issues without us having to guess
    // the exact malformation.
    try {
      const repaired = jsonrepair(candidate);
      return JSON.parse(repaired);
    } catch (repairError) {
      console.error('--- Raw model output that failed to parse as JSON ---');
      console.error(rawText);
      console.error('--- End raw model output ---');
      throw new Error(`Model returned malformed JSON: ${repairError.message}`);
    }
  }
}

function normalizeNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

const MAX_RETRIES = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Pulls a suggested wait time out of Gemini's 429 body if present
// (RetryInfo.retryDelay, e.g. "23s"), otherwise falls back to exponential
// backoff with jitter. 503 responses don't typically include RetryInfo,
// so they'll fall straight through to the backoff branch below.
function getRetryDelayMs(errBodyText, attempt) {
  try {
    const parsed = JSON.parse(errBodyText);
    const retryInfo = (parsed?.error?.details || []).find(
      (d) => d['@type']?.includes('RetryInfo')
    );
    if (retryInfo?.retryDelay) {
      const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
      if (!Number.isNaN(seconds)) return Math.ceil(seconds * 1000) + 250;
    }
  } catch {
    // fall through to backoff
  }
  const base = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s, 8s...
  const jitter = Math.floor(Math.random() * 500);
  return base + jitter;
}

async function callGemini(mediaType, base64) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: EXTRACTION_PROMPT },
              { inline_data: { mime_type: mediaType, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          response_mime_type: 'application/json',
          // Handwritten invoices can produce more verbose descriptions/OCR
          // noise than clean printed ones — give it enough room so the
          // JSON array never gets cut off mid-item.
          maxOutputTokens: 4096,
        },
      }),
    });

    if (response.ok) {
      return response.json();
    }

    const errBody = await response.text().catch(() => '');

    // 429 = rate limited, 503 = model temporarily overloaded (Gemini's
    // "high demand" UNAVAILABLE response). Both are transient and worth
    // retrying with backoff; anything else (400, 401, 403, etc.) is a
    // real error and should fail immediately instead of wasting retries.
    const isRetryable = response.status === 429 || response.status === 503;

    if (isRetryable && attempt < MAX_RETRIES) {
      const delay = getRetryDelayMs(errBody, attempt);
      const reason = response.status === 429 ? 'rate limited' : 'overloaded (503)';
      console.warn(`Gemini ${reason} (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms`);
      await sleep(delay);
      continue;
    }

    throw new Error(`AI extraction request failed (${response.status}): ${errBody.slice(0, 300)}`);
  }
}

/**
 * Runs AI extraction on a single uploaded file via Google Gemini's free
 * tier and returns a normalized object. Field names here (supplier, tax,
 * ...) are generic; app.js maps them onto the actual SupplierInvoice
 * column names when saving.
 * Throws on failure so the caller can record a 'failed' row.
 */
async function processFile(filePath, mimetype, originalFileName) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const mediaType = getMediaType(filePath, mimetype);
  const base64 = fs.readFileSync(filePath, { encoding: 'base64' });

  const data = await callGemini(mediaType, base64);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    // Common cause: the file was blocked by Gemini's safety filters, or
    // the response was truncated — surface whatever reason is available.
    const finishReason = data?.candidates?.[0]?.finishReason;
    throw new Error(`AI extraction returned no content${finishReason ? ` (finishReason: ${finishReason})` : ''}`);
  }

  const parsed = extractJsonFromText(text);

  const items = Array.isArray(parsed.items)
    ? parsed.items.map((item) => ({
        description: item.description || '—',
        quantity: item.quantity ?? null,
        unitPrice: normalizeNumber(item.unitPrice),
        total: normalizeNumber(item.total),
      }))
    : [];

  return {
    invoiceNumber: parsed.invoiceNumber || originalFileName,
    supplier: parsed.supplier || null,
    billTo: parsed.billTo || null,
    invoiceDate: parsed.invoiceDate || null,
    paymentMethod: parsed.paymentMethod || null,
    subtotal: normalizeNumber(parsed.subtotal),
    tax: normalizeNumber(parsed.tax),
    totalAmount: normalizeNumber(parsed.totalAmount),
    isHandwritten: Boolean(parsed.isHandwritten),
    items,
    extractedData: parsed,
  };
}

module.exports = { processFile };