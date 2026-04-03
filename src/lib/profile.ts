import { apiFetch } from './api';

export async function getProfile() {
  return apiFetch('/api/profile');
}

export async function updateProfile(profile: any) {
  return apiFetch('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(profile),
  });
}
