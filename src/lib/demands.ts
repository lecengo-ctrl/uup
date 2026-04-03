import { apiFetch } from './api';

export async function getDemands() {
  return apiFetch('/api/demands');
}

export async function createDemand(demand: any) {
  return apiFetch('/api/demands', {
    method: 'POST',
    body: JSON.stringify(demand),
  });
}
