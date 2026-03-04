import { supabase } from '@/lib/supabaseClient';
import type { InternshipFilters } from '@/types/internship';
import type { FilterPreset, FilterPresetResult, FilterPresetsResult } from '@/types/filter';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Saves a named filter preset for the current user. */
export async function createFilterPreset(
  name: string,
  filters: InternshipFilters,
): Promise<FilterPresetResult> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('internship_filters')
    .insert({ user_id: userId, name, filters })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FilterPreset, error: null };
}

/** Returns all filter presets for the current user, newest first. */
export async function getFilterPresets(): Promise<FilterPresetsResult> {
  const userId = await getUserId();
  if (!userId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('internship_filters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as FilterPreset[]) ?? [], error: null };
}

/** Updates name and/or filters for an existing preset. */
export async function updateFilterPreset(
  id: string,
  updates: Partial<{ name: string; filters: InternshipFilters }>,
): Promise<FilterPresetResult> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('internship_filters')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FilterPreset, error: null };
}

/** Deletes a filter preset by ID. */
export async function deleteFilterPreset(id: string): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('internship_filters')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}
