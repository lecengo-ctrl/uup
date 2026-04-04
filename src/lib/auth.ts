import { supabase } from './supabase';
import { syncLocalData } from './sync';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // After successful login, sync local data
  await syncLocalData();
  
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function login(email: string) {
  // Simplified login: use Supabase's OTP or just a mock for now
  // In a real app, we'd use `signInWithOtp` or similar.
  // For this project, we'll use a simplified version.
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) throw error;
  return data;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
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
