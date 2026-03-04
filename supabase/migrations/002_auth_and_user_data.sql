-- ============================================================
-- TailorCV — Auth + User Data Schema  (Migration 002)
-- Run this AFTER migration 001 in Supabase SQL Editor.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- A) profiles  (1 row per auth.user)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text        NOT NULL DEFAULT '',
  email         text        NOT NULL DEFAULT '',
  headline      text,
  bio           text,
  location      text,
  website_url   text,
  linkedin_url  text,
  github_url    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles (id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup (includes full_name from signUp options.data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at for profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- B) experiences
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.experiences (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL DEFAULT 'work'
    CHECK (type IN ('work','project','leadership','education','award','publication')),
  org         text        NOT NULL DEFAULT '',
  role_title  text        NOT NULL DEFAULT '',
  location    text,
  start_date  date,
  end_date    date,
  is_current  boolean     NOT NULL DEFAULT false,
  sort_order  int         NOT NULL DEFAULT 0,
  metadata    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON public.experiences (user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_type    ON public.experiences (user_id, type);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiences_crud_own" ON public.experiences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- C) experience_bullets
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.experience_bullets (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id  uuid        NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  bullet         text        NOT NULL DEFAULT '',
  tags           text[]      NOT NULL DEFAULT '{}',
  sort_order     int         NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experience_bullets_experience_id
  ON public.experience_bullets (experience_id);

ALTER TABLE public.experience_bullets ENABLE ROW LEVEL SECURITY;
-- Access via parent experience ownership
CREATE POLICY "bullets_crud_own" ON public.experience_bullets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      WHERE e.id = experience_bullets.experience_id
        AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.experiences e
      WHERE e.id = experience_bullets.experience_id
        AND e.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────
-- D) skills
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL DEFAULT '',
  category    text,
  proficiency int,
  keywords    text[]      NOT NULL DEFAULT '{}',
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills (user_id);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_crud_own" ON public.skills
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- E) coursework
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coursework (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_code  text        NOT NULL DEFAULT '',
  course_name  text        NOT NULL DEFAULT '',
  category     text,
  sort_order   int         NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coursework_user_id ON public.coursework (user_id);

ALTER TABLE public.coursework ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coursework_crud_own" ON public.coursework
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- F) uploaded_resumes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uploaded_resumes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path    text        NOT NULL DEFAULT '',
  file_name    text        NOT NULL DEFAULT '',
  mime_type    text        NOT NULL DEFAULT '',
  size_bytes   bigint      NOT NULL DEFAULT 0,
  parsed_text  text,
  parsed_json  jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_resumes_user_id ON public.uploaded_resumes (user_id);

ALTER TABLE public.uploaded_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uploads_crud_own" ON public.uploaded_resumes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- G) generated_resumes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.generated_resumes (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  internship_id  uuid        REFERENCES public.internships(id) ON DELETE SET NULL,
  title          text        NOT NULL DEFAULT '',
  latex_source   text        NOT NULL DEFAULT '',
  pdf_path       text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_resumes_user_id ON public.generated_resumes (user_id);

ALTER TABLE public.generated_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generated_resumes_crud_own" ON public.generated_resumes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- H & I) Drop + recreate internship_filters and saved_internships
--        with proper FK to profiles (replaces migration 001 versions)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.saved_internships CASCADE;
DROP TABLE IF EXISTS public.internship_filters CASCADE;

CREATE TABLE public.internship_filters (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       text        NOT NULL DEFAULT '',
  filters    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internship_filters_user_id_v2
  ON public.internship_filters (user_id);

ALTER TABLE public.internship_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "filters_crud_own" ON public.internship_filters
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_internship_filters_updated_at_v2
  BEFORE UPDATE ON public.internship_filters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.saved_internships (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  internship_id  uuid        NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  status         text        NOT NULL DEFAULT 'saved'
    CHECK (status IN ('saved','applied','interviewing','rejected','offer')),
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_internships_user_id_v2
  ON public.saved_internships (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_internships_user_internship_v2
  ON public.saved_internships (user_id, internship_id);

ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_crud_own" ON public.saved_internships
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_saved_internships_updated_at_v2
  BEFORE UPDATE ON public.saved_internships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- Storage buckets + policies
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-resumes', 'generated-resumes', false)
ON CONFLICT (id) DO NOTHING;

-- user-files: owner-only access, files must be under their uid folder
CREATE POLICY "user_files_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "user_files_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "user_files_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- generated-resumes: owner-only access
CREATE POLICY "gen_resumes_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'generated-resumes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "gen_resumes_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'generated-resumes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
