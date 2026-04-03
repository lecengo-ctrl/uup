import { apiFetch } from './api';

export async function getRecognitions(appId: string) {
  return apiFetch(`/api/recognitions?appId=${appId}`);
}

export async function toggleRecognition(appId: string, type: string) {
  return apiFetch('/api/recognitions', {
    method: 'POST',
    body: JSON.stringify({ appId, type }),
  });
}
