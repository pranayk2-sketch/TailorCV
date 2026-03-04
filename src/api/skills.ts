import { supabase } from '@/lib/supabaseClient';
import type { Skill, SkillInsert } from '@/types/skill';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function listSkills(): Promise<{ data: Skill[]; error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { data: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as Skill[]) ?? [], error: null };
}

export async function upsertSkill(payload: SkillInsert & { id?: string }): Promise<{
  data: Skill | null;
  error: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const row = {
    user_id: userId,
    name: payload.name ?? '',
    category: payload.category ?? null,
    proficiency: payload.proficiency ?? null,
    keywords: payload.keywords ?? [],
    sort_order: payload.sort_order ?? 0,
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from('skills')
      .update(row)
      .eq('id', payload.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Skill, error: null };
  }

  const { data, error } = await supabase
    .from('skills')
    .insert(row)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Skill, error: null };
}

export async function deleteSkill(id: string): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}
