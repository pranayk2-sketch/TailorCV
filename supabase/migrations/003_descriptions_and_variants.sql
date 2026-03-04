-- ============================================================
-- TailorCV — Descriptions + Variants (Phase: no AI yet)
-- Run AFTER migrations 001 and 002 in Supabase SQL Editor.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- A) internship_descriptions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internship_descriptions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id   uuid        NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  raw_text       text        NOT NULL DEFAULT '',
  cleaned_text   text        NOT NULL DEFAULT '',
  source         text        NOT NULL DEFAULT 'scrape',
  fetched_at     timestamptz NOT NULL DEFAULT now(),
  checksum       text,
  tokens_estimate int,
  metadata       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(internship_id)
);

CREATE INDEX IF NOT EXISTS idx_internship_descriptions_internship_id
  ON public.internship_descriptions (internship_id);

ALTER TABLE public.internship_descriptions ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can see descriptions)
CREATE POLICY "internship_descriptions_select"
  ON public.internship_descriptions FOR SELECT
  USING (true);

-- No INSERT/UPDATE from client; server uses service role


-- ─────────────────────────────────────────────────────────────
-- B) resume_variants
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resume_variants (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_family    text        NOT NULL DEFAULT 'unknown',
  fingerprint    text        NOT NULL,
  keywords       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  plan_json      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_resume_variants_user_id
  ON public.resume_variants (user_id);

CREATE INDEX IF NOT EXISTS idx_resume_variants_fingerprint
  ON public.resume_variants (user_id, fingerprint);

ALTER TABLE public.resume_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_variants_crud_own"
  ON public.resume_variants
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_resume_variants_updated_at
  BEFORE UPDATE ON public.resume_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- C) variant_internships
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.variant_internships (
  variant_id     uuid        NOT NULL REFERENCES public.resume_variants(id) ON DELETE CASCADE,
  internship_id  uuid        NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (variant_id, internship_id)
);

CREATE INDEX IF NOT EXISTS idx_variant_internships_variant_id
  ON public.variant_internships (variant_id);

CREATE INDEX IF NOT EXISTS idx_variant_internships_internship_id
  ON public.variant_internships (internship_id);

ALTER TABLE public.variant_internships ENABLE ROW LEVEL SECURITY;

-- Read: user can see if they own the variant
CREATE POLICY "variant_internships_select_own"
  ON public.variant_internships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resume_variants rv
      WHERE rv.id = variant_internships.variant_id
        AND rv.user_id = auth.uid()
    )
  );

-- Insert/Delete: only via server (service role) or user owning variant
CREATE POLICY "variant_internships_insert_own"
  ON public.variant_internships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resume_variants rv
      WHERE rv.id = variant_internships.variant_id
        AND rv.user_id = auth.uid()
    )
  );

CREATE POLICY "variant_internships_delete_own"
  ON public.variant_internships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.resume_variants rv
      WHERE rv.id = variant_internships.variant_id
        AND rv.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────
-- D) Alter generated_resumes
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.generated_resumes
  ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.resume_variants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_generated_resumes_variant_id
  ON public.generated_resumes (variant_id);
