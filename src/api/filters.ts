import { supabase } from '@/lib/supabaseClient';
import type { InternshipFilters } from '@/types/internship';
import type { FilterPreset, FilterPresetResult, FilterPresetsResult } from '@/types/filter';

// TODO: Replace with auth.uid() once Supabase Auth is integrated.
const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';

/** Saves a named filter preset for the current user. */
export async function createFilterPreset(
  name: string,
  filters: InternshipFilters,
): Promise<FilterPresetResult> {
  const { data, error } = await supabase
    .from('internship_filters')
    .insert({ user_id: PLACEHOLDER_USER_ID, name, filters })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FilterPreset, error: null };
}

/** Returns all filter presets for the current user, newest first. */
export async function getFilterPresets(): Promise<FilterPresetsResult> {
  const { data, error } = await supabase
    .from('internship_filters')
    .select('*')
    .eq('user_id', PLACEHOLDER_USER_ID)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as FilterPreset[]) ?? [], error: null };
}

/** Updates name and/or filters for an existing preset. */
export async function updateFilterPreset(
  id: string,
  updates: Partial<{ name: string; filters: InternshipFilters }>,
): Promise<FilterPresetResult> {
  const { data, error } = await supabase
    .from('internship_filters')
    .update(updates)
    .eq('id', id)
    .eq('user_id', PLACEHOLDER_USER_ID)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FilterPreset, error: null };
}

/** Deletes a filter preset by ID. */
export async function deleteFilterPreset(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('internship_filters')
    .delete()
    .eq('id', id)
    .eq('user_id', PLACEHOLDER_USER_ID);

  return { error: error?.message ?? null };
}
