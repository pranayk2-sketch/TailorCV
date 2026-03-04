import { supabase } from '@/lib/supabaseClient';
import type { Coursework, CourseworkInsert } from '@/types/coursework';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function listCoursework(): Promise<{ data: Coursework[]; error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { data: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('coursework')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as Coursework[]) ?? [], error: null };
}

export async function upsertCoursework(
  payload: CourseworkInsert & { id?: string },
): Promise<{ data: Coursework | null; error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const row = {
    user_id: userId,
    course_code: payload.course_code ?? '',
    course_name: payload.course_name ?? '',
    category: payload.category ?? null,
    sort_order: payload.sort_order ?? 0,
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from('coursework')
      .update(row)
      .eq('id', payload.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Coursework, error: null };
  }

  const { data, error } = await supabase
    .from('coursework')
    .insert(row)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Coursework, error: null };
}

export async function deleteCoursework(id: string): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('coursework')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}
