import { supabase } from '@/lib/supabaseClient';
import type { GeneratedResume } from '@/types/generatedResume';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function listGeneratedResumes(): Promise<{
  data: GeneratedResume[];
  error: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { data: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('generated_resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as GeneratedResume[]) ?? [], error: null };
}

export async function getGeneratedResume(id: string): Promise<{
  data: GeneratedResume | null;
  error: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('generated_resumes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as GeneratedResume, error: null };
}
