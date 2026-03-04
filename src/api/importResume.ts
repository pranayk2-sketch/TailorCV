import type { ParsedResume } from '@/types/parsedResume';
import { listExperiences, upsertExperience, upsertBulletsForExperience } from '@/api/experiences';
import { upsertSkill } from '@/api/skills';
import { upsertCoursework } from '@/api/coursework';
import { updateProfile } from '@/api/profile';

function normalize(s: string): string {
  return (s || '').trim().toLowerCase();
}

/** Check if we already have an experience with same org + role_title. */
function isDuplicateExperience(
  existing: { org: string; role_title: string }[],
  org: string,
  role_title: string,
): boolean {
  const nOrg = normalize(org);
  const nRole = normalize(role_title);
  return existing.some(
    (e) => normalize(e.org) === nOrg && normalize(e.role_title) === nRole,
  );
}

/** Import parsed resume data into the DB. Skips experiences we already have. */
export async function importParsedResume(parsed: ParsedResume): Promise<{ error: string | null }> {
  try {
    if (parsed.profile?.full_name || parsed.profile?.headline || parsed.profile?.bio) {
      await updateProfile({
        full_name: parsed.profile.full_name || undefined,
        headline: parsed.profile.headline || undefined,
        bio: parsed.profile.bio || undefined,
      });
    }

    const { data: existingExps } = await listExperiences();
    const existing = (existingExps || []).map((e) => ({
      org: e.org || '',
      role_title: e.role_title || '',
    }));

    for (const exp of parsed.experiences) {
      if (isDuplicateExperience(existing, exp.org, exp.role_title)) {
        continue;
      }
      const { data } = await upsertExperience({
        type: exp.type,
        org: exp.org,
        role_title: exp.role_title,
        location: exp.location ?? null,
        start_date: exp.start_date ?? null,
        end_date: exp.end_date ?? null,
        is_current: exp.is_current,
      });
      if (data) {
        existing.push({ org: exp.org, role_title: exp.role_title });
        if (exp.bullets.length > 0) {
          await upsertBulletsForExperience(data.id, exp.bullets);
        }
      }
    }

    for (const skill of parsed.skills) {
      await upsertSkill({ name: skill.name, category: skill.category || undefined });
    }

    for (const c of parsed.coursework) {
      await upsertCoursework({
        course_code: c.course_code || '',
        course_name: c.course_name,
      });
    }

    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Import failed' };
  }
}
