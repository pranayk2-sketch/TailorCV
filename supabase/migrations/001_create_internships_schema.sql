-- ============================================================
-- TailorCV — Internship Schema Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- A) internships  (public read, service-role write)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internships (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id      text        UNIQUE NOT NULL,
  company_name   text        NOT NULL DEFAULT '',
  title          text        NOT NULL DEFAULT '',
  locations      text[]      NOT NULL DEFAULT '{}',
  terms          text[]      NOT NULL DEFAULT '{}',
  url            text        NOT NULL DEFAULT '',
  company_url    text        NOT NULL DEFAULT '',
  active         boolean     NOT NULL DEFAULT true,
  is_visible     boolean     NOT NULL DEFAULT true,
  source         text        NOT NULL DEFAULT 'Simplify',
  date_posted    timestamptz,
  date_updated   timestamptz,
  last_synced_at timestamptz
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_internships_active_visible
  ON public.internships (active, is_visible);

CREATE INDEX IF NOT EXISTS idx_internships_company_name
  ON public.internships (company_name);

CREATE INDEX IF NOT EXISTS idx_internships_source_id
  ON public.internships (source_id);

-- GIN indexes for array overlap / contains queries
CREATE INDEX IF NOT EXISTS idx_internships_locations_gin
  ON public.internships USING GIN (locations);

CREATE INDEX IF NOT EXISTS idx_internships_terms_gin
  ON public.internships USING GIN (terms);

-- RLS
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) may read
CREATE POLICY "internships_public_read"
  ON public.internships FOR SELECT
  USING (true);

-- No direct INSERT / UPDATE / DELETE from the client.
-- The Edge Function uses the service role key, which bypasses RLS.


-- ─────────────────────────────────────────────────────────────
-- B) internship_filters  (user-owned)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internship_filters (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL,
  name       text        NOT NULL DEFAULT '',
  filters    jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internship_filters_user_id
  ON public.internship_filters (user_id);

ALTER TABLE public.internship_filters ENABLE ROW LEVEL SECURITY;

-- TODO: Replace with auth-based policy once Supabase Auth is integrated:
--   CREATE POLICY "internship_filters_owner_crud" ON public.internship_filters
--     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- For now, allow all so the app works without auth:
CREATE POLICY "temp_allow_all_internship_filters"
  ON public.internship_filters FOR ALL
  USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- C) saved_internships  (user-owned)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_internships (
  id             uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid  NOT NULL,
  internship_id  uuid  NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  status         text  NOT NULL DEFAULT 'saved'
    CHECK (status IN ('saved', 'applied', 'interviewing', 'rejected', 'offer')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_internships_user_id
  ON public.saved_internships (user_id);

CREATE INDEX IF NOT EXISTS idx_saved_internships_internship_id
  ON public.saved_internships (internship_id);

-- Prevent duplicate saves per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_internships_user_internship
  ON public.saved_internships (user_id, internship_id);

ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;

-- TODO: Replace with auth-based policy once Supabase Auth is integrated:
--   CREATE POLICY "saved_internships_owner_crud" ON public.saved_internships
--     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- For now, allow all so the app works without auth:
CREATE POLICY "temp_allow_all_saved_internships"
  ON public.saved_internships FOR ALL
  USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- D) updated_at auto-trigger
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_internship_filters_updated_at
  BEFORE UPDATE ON public.internship_filters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_saved_internships_updated_at
  BEFORE UPDATE ON public.saved_internships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
