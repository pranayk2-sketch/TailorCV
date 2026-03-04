import { supabase } from '@/lib/supabaseClient';
import type { SavedInternship } from '@/types/saved';

export type SavedStatus = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';

export async function saveInternship(
  internshipId: string,
  status: SavedStatus = 'saved',
): Promise<{ data: SavedInternship | null; error: string | null }> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('saved_internships')
    .upsert(
      { user_id: userId, internship_id: internshipId, status },
      { onConflict: 'user_id,internship_id' },
    )
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SavedInternship, error: null };
}

export async function unsaveInternship(internshipId: string): Promise<{ error: string | null }> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('saved_internships')
    .delete()
    .eq('user_id', userId)
    .eq('internship_id', internshipId);

  return { error: error?.message ?? null };
}

export async function getSavedInternships(): Promise<{
  data: SavedInternship[];
  error: string | null;
}> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('saved_internships')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as SavedInternship[]) ?? [], error: null };
}

export async function updateSavedStatus(
  internshipId: string,
  status: SavedStatus,
): Promise<{ data: SavedInternship | null; error: string | null }> {
  return saveInternship(internshipId, status);
}
