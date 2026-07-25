const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function ocrImageBuffer(buffer) {
  // Try to load tesseract.js dynamically — optional dependency
  try {
    const { createWorker } = require('tesseract.js');
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text;
  } catch (err) {
    console.warn('tesseract.js not available or failed:', err.message);
    return null;
  }
}

function extractFieldsFromText(text) {
  const result = {
    rawText: text,
    invoiceNumber: null,
    supplier: null,
    invoiceDate: null,
    totalAmount: null,
    items: []
  };

  if (!text) return result;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Try to find invoice number
  for (const line of lines) {
    const m = line.match(/invoice\s*(?:no\.?|number|#)?\s*[:#\-\s]*([A-Z0-9-\/]+)/i);
    if (m) { result.invoiceNumber = m[1]; break; }
  }

  // Try to find a total amount (search lines containing total or amount)
  for (const line of lines.reverse()) {
    const m = line.match(/(?:total\s*amount|amount\s*due|grand\s*total|total)[:\s]*\$?\s*([0-9,]+\.\d{1,2})/i);
    if (m) { result.totalAmount = parseFloat(m[1].replace(/,/g, '')); break; }
  }

  // Try to find a date
  for (const line of lines) {
    const m = line.match(/(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})|(\d{1,2} \w+ \d{4})/);
    if (m) { result.invoiceDate = m[0]; break; }
  }

  // Supplier: assume first non-numeric line at top
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const l = lines[i];
    if (!/^[0-9\$\-\.\/]+$/.test(l) && l.length > 2 && !/invoice/i.test(l)) {
      result.supplier = l; break;
    }
  }

  // Try to extract table-like items (very heuristic)
  for (const line of lines) {
    const m = line.match(/(.+)\s+(\d+)\s+\$?([0-9,]+\.\d{1,2})\s+\$?([0-9,]+\.\d{1,2})/);
    if (m) {
      result.items.push({ description: m[1].trim(), quantity: parseInt(m[2], 10), unitPrice: parseFloat(m[3].replace(/,/g, '')), total: parseFloat(m[4].replace(/,/g, '')) });
    }
  }

  return result;
}

async function processFile(filePath, mimetype) {
  const buffer = fs.readFileSync(filePath);
  let text = null;

  if (mimetype && mimetype.includes('pdf')) {
    try {
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (err) {
      console.warn('pdf-parse failed:', err.message);
    }
  }

  if ((!text || text.trim().length === 0) && mimetype && mimetype.startsWith('image/')) {
    text = await ocrImageBuffer(buffer);
  }

  // As a fallback, try OCR even for PDFs if text extraction failed
  if ((!text || text.trim().length === 0)) {
    const ocr = await ocrImageBuffer(buffer);
    if (ocr) text = ocr;
  }

  const extracted = extractFieldsFromText(text || '');
  return extracted;
}

module.exports = {
  processFile,
  extractFieldsFromText
};
