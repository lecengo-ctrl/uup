import { apiFetch } from './api';

export async function getApps(params: { category?: string; sort?: string; authorId?: string } = {}) {
  const url = new URL('/api/apps', window.location.origin);
  if (params.category) url.searchParams.set('category', params.category);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.authorId) url.searchParams.set('authorId', params.authorId);

  return apiFetch(url.toString());
}

export async function getAppDetail(id: string) {
  return apiFetch(`/api/apps/detail?id=${id}`);
}

export async function createApp(app: any) {
  return apiFetch('/api/apps', {
    method: 'POST',
    body: JSON.stringify(app),
  });
}

export async function updateApp(id: string, app: any) {
  return apiFetch(`/api/apps/detail?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify(app),
  });
}

export async function deleteApp(id: string) {
  return apiFetch(`/api/apps/detail?id=${id}`, {
    method: 'DELETE',
  });
}
