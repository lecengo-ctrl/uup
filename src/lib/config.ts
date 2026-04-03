import { apiFetch } from './api';

export async function getGlobalConfig() {
  try {
    const config = await apiFetch('/api/config');
    return config;
  } catch (error) {
    console.error('Failed to get global config:', error);
    return null;
  }
}
