import { apiFetch } from './api';

export async function getTransactions() {
  return apiFetch('/api/transactions');
}

export async function createTransaction(transaction: any) {
  return apiFetch('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
}
