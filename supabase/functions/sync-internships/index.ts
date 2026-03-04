/**
 * Supabase Edge Function: sync-internships
 *
 * Fetches the SimplifyJobs Summer 2026 listings.json and upserts all entries
 * into the `internships` table using the service role key.
 *
 * Deploy:
 *   supabase functions deploy sync-internships
 *
 * Invoke manually:
 *   supabase functions invoke sync-internships
 *
 * Cron schedule (set in Supabase Dashboard → Edge Functions → sync-internships → Schedule):
 *   0 * * * *   (every hour)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LISTINGS_URL =
  'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json';

const CHUNK_SIZE = 500;

interface SimplifyListing {
  id: string;
  company_name: string;
  title: string;
  locations: string[];
  url: string;
  company_url: string;
  active: boolean;
  is_visible: boolean;
  date_posted: number;   // Unix timestamp (seconds)
  date_updated: number;  // Unix timestamp (seconds)
  source: string;
  terms: string[];
  sponsorship?: string;
}

interface UpsertRecord {
  source_id: string;
  company_name: string;
  title: string;
  locations: string[];
  terms: string[];
  url: string;
  company_url: string;
  active: boolean;
  is_visible: boolean;
  source: string;
  date_posted: string | null;
  date_updated: string | null;
  last_synced_at: string;
}

function toIso(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds || unixSeconds <= 0) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

Deno.serve(async (_req: Request) => {
  const startedAt = new Date().toISOString();
  console.log(`[sync-internships] Starting sync at ${startedAt}`);

  try {
    // ── 1. Fetch listings ────────────────────────────────────────────────────
    const fetchRes = await fetch(LISTINGS_URL);
    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch listings: HTTP ${fetchRes.status} ${fetchRes.statusText}`);
    }

    const listings: SimplifyListing[] = await fetchRes.json();
    console.log(`[sync-internships] Fetched ${listings.length} listings`);

    // ── 2. Build Supabase client with service role key ───────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ── 3. Transform ─────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const records: UpsertRecord[] = listings.map((item) => ({
      source_id: item.id ?? '',
      company_name: item.company_name ?? '',
      title: item.title ?? '',
      locations: Array.isArray(item.locations) ? item.locations : [],
      terms: Array.isArray(item.terms) ? item.terms : [],
      url: item.url ?? '',
      company_url: item.company_url ?? '',
      active: item.active ?? true,
      is_visible: item.is_visible ?? true,
      source: item.source ?? 'Simplify',
      date_posted: toIso(item.date_posted),
      date_updated: toIso(item.date_updated),
      last_synced_at: now,
    }));

    // ── 4. Upsert in chunks ──────────────────────────────────────────────────
    let totalUpserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase
        .from('internships')
        .upsert(chunk, { onConflict: 'source_id' });

      if (error) {
        const msg = `Chunk ${Math.floor(i / CHUNK_SIZE) + 1} error: ${error.message}`;
        console.error(`[sync-internships] ${msg}`);
        errors.push(msg);
      } else {
        totalUpserted += chunk.length;
        console.log(
          `[sync-internships] Upserted chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(records.length / CHUNK_SIZE)} (${chunk.length} records)`,
        );
      }
    }

    const body = {
      success: errors.length === 0,
      total_fetched: listings.length,
      total_upserted: totalUpserted,
      errors: errors.length > 0 ? errors : undefined,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    };

    console.log(`[sync-internships] Done. Upserted ${totalUpserted}/${listings.length} records.`);
    return new Response(JSON.stringify(body, null, 2), {
      status: errors.length === 0 ? 200 : 207,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sync-internships] Fatal error: ${message}`);
    return new Response(
      JSON.stringify({ success: false, error: message, started_at: startedAt }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
