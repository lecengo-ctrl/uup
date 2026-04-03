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
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}
