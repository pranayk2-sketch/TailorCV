export interface Internship {
  id: string;
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
  last_synced_at: string | null;
}

export interface InternshipFilters {
  query?: string;
  locations?: string[];
  terms?: string[];
  remoteOnly?: boolean;
  companiesInclude?: string[];
  companiesExclude?: string[];
}

export interface GetInternshipsParams {
  filters?: InternshipFilters;
  page?: number;
  pageSize?: number;
}

export interface GetInternshipsBatchParams {
  filters?: InternshipFilters;
  count: number;
  /** Stable seed string for deterministic ordering (used as tie-break prefix).
   *  If omitted, falls back to ORDER BY source_id ASC. */
  seed?: string;
  /** Internship IDs to exclude (e.g. already saved/selected by the user). */
  excludeIds?: string[];
}

export interface GetInternshipsResult {
  data: Internship[];
  count: number;
  error: string | null;
}

export interface GetInternshipsBatchResult {
  data: Internship[];
  error: string | null;
}
