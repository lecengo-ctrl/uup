import { supabase } from './supabase';

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return {};
  return { 'Authorization': `Bearer ${session.access_token}` };
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  const response = await fetch(path, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[apiFetch Error]', response.status, errorData);
    throw new Error(`API Error (${response.status}): ${errorData.error || 'Request failed'}`);
  }

  if (response.status === 204) return null;
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`[apiFetch JSON Parse Error] URL: ${path}, Status: ${response.status}, Body:`, text.substring(0, 200));
    throw e;
  }
}
