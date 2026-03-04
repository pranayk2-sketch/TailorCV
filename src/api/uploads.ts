import { supabase } from '@/lib/supabaseClient';
import type { UploadedResume } from '@/types/upload';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

const BUCKET = 'user-files';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function uploadResumeFile(file: File): Promise<{
  data: UploadedResume | null;
  error: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  if (file.size > MAX_SIZE_BYTES) return { data: null, error: 'File too large (max 10MB)' };
  if (!ALLOWED_TYPES.includes(file.type))
    return { data: null, error: 'Invalid file type. Use PDF or DOCX.' };

  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `${userId}/resumes/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) return { data: null, error: uploadError.message };

  const { data, error } = await supabase
    .from('uploaded_resumes')
    .insert({
      user_id: userId,
      file_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      parsed_text: null,
      parsed_json: {},
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as UploadedResume, error: null };
}

export async function listUploadedResumes(): Promise<{
  data: UploadedResume[];
  error: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { data: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('uploaded_resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as UploadedResume[]) ?? [], error: null };
}

export async function getLatestUploadedResume(): Promise<{
  data: UploadedResume | null;
  error: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('uploaded_resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as UploadedResume | null, error: null };
}

export function getResumeDownloadUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

const PARSE_SERVER_URL = import.meta.env.VITE_PARSE_SERVER_URL || 'http://localhost:3001';

/** Call the local parse server to parse a resume. Requires parse-server to be running. */
export async function parseResume(resumeId: string): Promise<{
  data: import('@/types/parsedResume').ParsedResume | null;
  error: string | null;
}> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      return { data: null, error: 'Not authenticated. Please log in.' };
    }

    const res = await fetch(`${PARSE_SERVER_URL}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeId, accessToken }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || res.statusText };
    return { data: json, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Parse server unreachable. Run: npm run parse-server',
    };
  }
}

/** Update parsed_text and parsed_json for an uploaded resume. */
export async function updateParsedResume(
  id: string,
  parsedText: string | null,
  parsedJson: Record<string, unknown>,
): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('uploaded_resumes')
    .update({ parsed_text: parsedText, parsed_json: parsedJson })
    .eq('id', id)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}
