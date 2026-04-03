import { apiFetch } from './api';

export async function getNotifications() {
  return apiFetch('/api/notifications');
}

export async function markAsRead(id: string) {
  return apiFetch(`/api/notifications?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_read: true }),
  });
}
