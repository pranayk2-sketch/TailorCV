import { supabase } from '@/lib/supabaseClient';
import type {
  Internship,
  InternshipFilters,
  GetInternshipsParams,
  GetInternshipsResult,
  GetInternshipsBatchParams,
  GetInternshipsBatchResult,
} from '@/types/internship';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Applies InternshipFilters onto a raw Supabase query builder chain. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: InternshipFilters): any {
  if (filters.query?.trim()) {
    const q = filters.query.trim().replace(/'/g, "''");
    query = query.or(`company_name.ilike.%${q}%,title.ilike.%${q}%`);
  }

  if (filters.remoteOnly) {
    // locations array must contain the exact string "Remote"
    query = query.contains('locations', ['Remote']);
  } else if (filters.locations && filters.locations.length > 0) {
    query = query.overlaps('locations', filters.locations);
  }

  if (filters.terms && filters.terms.length > 0) {
    query = query.overlaps('terms', filters.terms);
  }

  if (filters.companiesInclude && filters.companiesInclude.length > 0) {
    query = query.in('company_name', filters.companiesInclude);
  }

  if (filters.companiesExclude && filters.companiesExclude.length > 0) {
    for (const company of filters.companiesExclude) {
      query = query.neq('company_name', company);
    }
  }

  return query;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginated internship list with optional filters.
 * Returns the total count for pagination controls.
 */
export async function getInternships({
  filters = {},
  page = 1,
  pageSize = 10,
}: GetInternshipsParams = {}): Promise<GetInternshipsResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('internships')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .eq('is_visible', true);

  query = applyFilters(query, filters);

  const { data, count, error } = await query
    .order('company_name', { ascending: true })
    .order('source_id', { ascending: true })
    .range(from, to);

  if (error) return { data: [], count: 0, error: error.message };
  return { data: (data as Internship[]) ?? [], count: count ?? 0, error: null };
}

/**
 * Returns exactly `count` internships that match the given filters.
 *
 * Ordering is deterministic: stable sort by source_id ASC.
 * A future upgrade can swap this for an RPC that uses md5(source_id || seed)
 * for seed-based pseudo-random ordering.
 */
export async function getInternshipsForBatch({
  filters = {},
  count,
  excludeIds = [],
}: GetInternshipsBatchParams): Promise<GetInternshipsBatchResult> {
  let query = supabase
    .from('internships')
    .select('*')
    .eq('active', true)
    .eq('is_visible', true);

  query = applyFilters(query, filters);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query
    .order('source_id', { ascending: true })
    .limit(count);

  if (error) return { data: [], error: error.message };
  return { data: (data as Internship[]) ?? [], error: null };
}

/**
 * Get internships by IDs.
 */
export async function getInternshipsByIds(ids: string[]): Promise<{
  data: Internship[];
  error: string | null;
}> {
  if (ids.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .in('id', ids);
  if (error) return { data: [], error: error.message };
  return { data: (data as Internship[]) ?? [], error: null };
}

/**
 * Get a single internship by ID.
 */
export async function getInternship(id: string): Promise<{
  data: Internship | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Internship, error: null };
}

// Saved internships moved to src/api/savedInternships.ts (uses auth.uid())
