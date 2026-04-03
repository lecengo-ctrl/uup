import { apiFetch } from './api';

export async function getComments(appId: string) {
  return apiFetch(`/api/comments?appId=${appId}`);
}

export async function createComment(comment: any) {
  return apiFetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify(comment),
  });
}
