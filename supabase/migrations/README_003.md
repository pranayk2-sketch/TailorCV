# Migration 003: Descriptions + Variants

Run this migration in Supabase SQL Editor **after** migrations 001 and 002.

```sql
-- Copy contents of 003_descriptions_and_variants.sql and execute
```

Or via Supabase CLI:
```bash
supabase db push
```

Creates:
- `internship_descriptions` — cached job posting text
- `resume_variants` — user resume variants (role_family + fingerprint)
- `variant_internships` — links internships to variants
- Alters `generated_resumes` to add `variant_id` column
