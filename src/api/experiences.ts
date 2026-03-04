import { supabase } from '@/lib/supabaseClient';
import type { Experience, ExperienceBullet, ExperienceInsert, BulletInsert } from '@/types/experience';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function listExperiences(type?: string): Promise<{
  data: Experience[];
  error: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { data: [], error: 'Not authenticated' };

  let query = supabase
    .from('experiences')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: (data as Experience[]) ?? [], error: null };
}

export async function upsertExperience(
  payload: ExperienceInsert & { id?: string },
): Promise<{ data: Experience | null; error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const row = {
    user_id: userId,
    type: payload.type ?? 'work',
    org: payload.org ?? '',
    role_title: payload.role_title ?? '',
    location: payload.location ?? null,
    start_date: payload.start_date ?? null,
    end_date: payload.end_date ?? null,
    is_current: payload.is_current ?? false,
    sort_order: payload.sort_order ?? 0,
    metadata: payload.metadata ?? {},
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from('experiences')
      .update(row)
      .eq('id', payload.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Experience, error: null };
  }

  const { data, error } = await supabase
    .from('experiences')
    .insert(row)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Experience, error: null };
}

export async function deleteExperience(id: string): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function listBullets(experienceId: string): Promise<{
  data: ExperienceBullet[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('experience_bullets')
    .select('*')
    .eq('experience_id', experienceId)
    .order('sort_order', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data as ExperienceBullet[]) ?? [], error: null };
}

export async function upsertBullet(payload: BulletInsert & { id?: string }): Promise<{
  data: ExperienceBullet | null;
  error: string | null;
}> {
  const row = {
    experience_id: payload.experience_id,
    bullet: payload.bullet ?? '',
    tags: payload.tags ?? [],
    sort_order: payload.sort_order ?? 0,
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from('experience_bullets')
      .update(row)
      .eq('id', payload.id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as ExperienceBullet, error: null };
  }

  const { data, error } = await supabase
    .from('experience_bullets')
    .insert(row)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as ExperienceBullet, error: null };
}

export async function deleteBullet(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('experience_bullets').delete().eq('id', id);
  return { error: error?.message ?? null };
}

/** Replace all bullets for an experience. Deletes existing, inserts new. */
export async function upsertBulletsForExperience(
  experienceId: string,
  bullets: string[],
): Promise<{ error: string | null }> {
  const { error: delErr } = await supabase
    .from('experience_bullets')
    .delete()
    .eq('experience_id', experienceId);
  if (delErr) return { error: delErr.message };

  if (bullets.length === 0) return { error: null };

  const rows = bullets
    .filter((b) => b.trim())
    .map((bullet, i) => ({ experience_id: experienceId, bullet: bullet.trim(), sort_order: i }));

  const { error: insErr } = await supabase.from('experience_bullets').insert(rows);
  return { error: insErr?.message ?? null };
}

/** Update sort_order for multiple experiences. */
export async function reorderExperiences(
  updates: { id: string; sort_order: number }[],
): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  for (const { id, sort_order } of updates) {
    const { error } = await supabase
      .from('experiences')
      .update({ sort_order })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) return { error: error.message };
  }
  return { error: null };
}
