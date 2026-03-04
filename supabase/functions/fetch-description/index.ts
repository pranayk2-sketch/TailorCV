/**
 * Supabase Edge Function: fetch-description
 *
 * Fetches HTML from an internship's job URL, extracts readable text (regex-based, no JSDOM
 * to avoid Deno "Requires run access" in Edge Functions), and upserts into internship_descriptions.
 *
 * Deploy: supabase functions deploy fetch-description
 * Invoke: supabase.functions.invoke('fetch-description', { body: { internshipId } })
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TailorCV/1.0; +https://github.com/tailorcv)',
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

/** Extract JSON-LD JobPosting description if present. */
function extractFromJsonLd(html: string): string {
  const match = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return '';
  try {
    const parsed = JSON.parse(match[1]);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (item['@type'] === 'JobPosting' && item.description) {
        return String(item.description).trim();
      }
    }
  } catch (_) {}
  return '';
}

/** Extract text from HTML without JSDOM (avoids Deno run permission in Edge Functions). */
function extractTextFromHtml(html: string): string {
  const jsonLd = extractFromJsonLd(html);
  if (jsonLd.length > 100) return jsonLd;

  let s = html
    .replace(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  const bodyMatch = s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) s = bodyMatch[1];
  for (const tag of ['main', 'article']) {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = s.match(re);
    if (m && m[1].replace(/<[^>]+>/g, ' ').trim().length > 100) {
      s = m[1];
      break;
    }
  }
  const text = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 50 ? text : jsonLd;
}

function cleanText(text: string): string {
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

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function fetchAndExtract(url: string): Promise<{ rawText: string; cleanedText: string; checksum: string }> {
  const html = await fetchHtml(url);
  const rawText = extractTextFromHtml(html);
  const cleanedText = cleanText(rawText);
  const checksum = await sha256Hex(cleanedText);
  return {
    rawText: rawText.slice(0, 50000),
    cleanedText,
    checksum,
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { internshipId } = (await req.json()) || {};
    if (!internshipId || typeof internshipId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing internshipId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase env vars');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data: internship, error: internErr } = await supabase
      .from('internships')
      .select('id, url')
      .eq('id', internshipId)
      .single();

    if (internErr || !internship?.url) {
      return new Response(
        JSON.stringify({ error: 'Internship not found or has no URL' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { rawText, cleanedText, checksum } = await fetchAndExtract(internship.url);

    const { error: upsertErr } = await supabase.from('internship_descriptions').upsert(
      {
        internship_id: internshipId,
        raw_text: rawText,
        cleaned_text: cleanedText,
        source: 'scrape',
        fetched_at: new Date().toISOString(),
        checksum,
        tokens_estimate: Math.ceil(cleanedText.length / 4),
        metadata: {},
      },
      { onConflict: 'internship_id' },
    );

    if (upsertErr) {
      return new Response(
        JSON.stringify({ error: upsertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        internshipId,
        fetchedAt: new Date().toISOString(),
        checksum,
        cleanedPreview: cleanedText.slice(0, 1200),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[fetch-description]', message);
    return new Response(
      JSON.stringify({ error: message || 'Fetch failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
