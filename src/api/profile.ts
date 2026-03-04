import { supabase } from '@/lib/supabaseClient';
import type { Profile, ProfileUpdate } from '@/types/profile';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Profile, error: null };
}

export async function updateProfile(updates: ProfileUpdate): Promise<{ data: Profile | null; error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Profile, error: null };
}
