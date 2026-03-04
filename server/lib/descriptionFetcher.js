/**
 * Fetch HTML from URL and extract readable text via Readability.
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { createHash } from 'crypto';

const FETCH_TIMEOUT_MS = 10000;
const MAX_CLEANED_LENGTH = 20000;

const EEO_PATTERNS = [
  /equal\s+opportunity\s+employer[^.]*\./gi,
  /eeo[^.]*\./gi,
  /affirmative\s+action[^.]*\./gi,
  /we\s+are\s+an?\s+equal\s+opportunity[^.]*\./gi,
  /all\s+qualified\s+applicants[^.]*\./gi,
  /without\s+regard\s+to\s+race[^.]*\./gi,
  /diversity\s+and\s+inclusion\s+statement[^.]*\./gi,
  /reasonable\s+accommodation[^.]*\./gi,
  /ada\s+compliant[^.]*\./gi,
];

/**
 * Fetch HTML with timeout.
 */
async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; TailorCV/1.0; +https://github.com/tailorcv)',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

/**
 * Clean extracted text: remove boilerplate, collapse whitespace, clamp length.
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') return '';
  let out = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  for (const pat of EEO_PATTERNS) {
    out = out.replace(pat, '');
  }
  out = out.replace(/\s+/g, ' ').trim();

  if (out.length > MAX_CLEANED_LENGTH) {
    out = out.slice(0, MAX_CLEANED_LENGTH);
  }
  return out;
}

/**
 * Extract readable text from HTML URL.
 * Returns { rawText, cleanedText, checksum }.
 */
export async function fetchAndExtract(url) {
  const html = await fetchHtml(url);
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const rawText = article?.textContent || dom.window.document.body?.textContent || '';
  const cleanedText = cleanText(rawText);
  const checksum = createHash('sha256').update(cleanedText).digest('hex');

  return {
    rawText: rawText.slice(0, 50000),
    cleanedText,
    checksum,
  };
}
