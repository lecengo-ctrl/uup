import { supabase } from './supabase';
import { syncLocalData } from './sync';

export async function login(phone: string) {
  // Simplified login: use Supabase's OTP or just a mock for now
  // In a real app, we'd use `signInWithOtp` or similar.
  // For this project, we'll use a simplified version.
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: `+86${phone}`,
  });

  if (error) throw error;
  return data;
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: `+86${phone}`,
    token,
    type: 'sms',
  });

  if (error) throw error;

  // After successful login, sync local data
  await syncLocalData();

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
