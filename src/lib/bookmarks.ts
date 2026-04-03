import { apiFetch } from './api';

export async function getBookmarks() {
  return apiFetch('/api/bookmarks');
}

export async function toggleBookmark(appId: string) {
  return apiFetch('/api/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ appId }),
  });
}
