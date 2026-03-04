import { supabase } from '@/lib/supabaseClient';

/** Use Edge Functions when enabled or when no API server URL. Set VITE_USE_DESCRIPTION_EDGE_FUNCTIONS=true to avoid running npm run api. */
const USE_EDGE_FUNCTIONS =
  import.meta.env.VITE_USE_DESCRIPTION_EDGE_FUNCTIONS === 'true' || !import.meta.env.VITE_API_URL;

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export async function fetchDescription(internshipId: string): Promise<{
  data: { internshipId: string; fetchedAt: string; checksum: string; cleanedPreview: string } | null;
  error: string | null;
}> {
  if (USE_EDGE_FUNCTIONS) {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-description', {
        body: { internshipId },
      });
      if (error) return { data: null, error: error.message || 'Edge function failed' };
      const err = (data as { error?: string })?.error;
      if (err) return { data: null, error: err };
      return { data: data as { internshipId: string; fetchedAt: string; checksum: string; cleanedPreview: string }, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : 'Edge function unreachable. Deploy: supabase functions deploy fetch-description',
      };
    }
  }

  try {
    const res = await fetch(`${API_URL}/api/description/fetch`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ internshipId }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || res.statusText };
    return { data: json, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'API unreachable. Run: npm run api',
    };
  }
}

export async function fetchDescriptionsBulk(internshipIds: string[]): Promise<{
  data: { results: Array<{ internshipId?: string; error?: string; fetchedAt?: string; checksum?: string }> } | null;
  error: string | null;
}> {
  if (USE_EDGE_FUNCTIONS) {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-descriptions-bulk', {
        body: { internshipIds },
      });
      if (error) return { data: null, error: error.message || 'Edge function failed' };
      const err = (data as { error?: string })?.error;
      if (err) return { data: null, error: err };
      return { data: data as { results: Array<{ internshipId?: string; error?: string; fetchedAt?: string; checksum?: string }> }, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : 'Edge function unreachable. Deploy: supabase functions deploy fetch-descriptions-bulk',
      };
    }
  }

  try {
    const res = await fetch(`${API_URL}/api/description/fetch-bulk`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ internshipIds }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || res.statusText };
    return { data: json, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'API unreachable. Run: npm run api',
    };
  }
}

export async function getDescription(internshipId: string): Promise<{
  data: { cleanedText: string; fetchedAt: string; checksum: string; preview: string } | null;
  error: string | null;
}> {
  // internship_descriptions has public read (RLS), so query Supabase directly
  const { data, error } = await supabase
    .from('internship_descriptions')
    .select('cleaned_text, fetched_at, checksum')
    .eq('internship_id', internshipId)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || 'Description not found' };
  }

  const preview = (data.cleaned_text || '').slice(0, 1200);
  return {
    data: {
      cleanedText: data.cleaned_text || '',
      fetchedAt: data.fetched_at || '',
      checksum: data.checksum || '',
      preview,
    },
    error: null,
  };
}
