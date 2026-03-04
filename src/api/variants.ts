import { supabase } from '@/lib/supabaseClient';
import type { ResumeVariant, VariantMapResult } from '@/types/variant';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function mapInternshipToVariant(internshipId: string): Promise<{
  data: VariantMapResult | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_URL}/api/variant/map`, {
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

export async function getVariant(id: string): Promise<{
  data: { variant: ResumeVariant; internships: Array<{ id: string; company_name: string; title: string; url: string }> } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_URL}/api/variant/${id}`, {
      headers: await getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || res.statusText };
    return { data: json, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'API unreachable',
    };
  }
}

export async function getInternshipVariant(internshipId: string): Promise<{
  data: { variant: ResumeVariant | null } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_URL}/api/internship/${internshipId}/variant`, {
      headers: await getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || res.statusText };
    return { data: json, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'API unreachable',
    };
  }
}
