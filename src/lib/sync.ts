import { apiFetch } from './api';
import { get, del } from 'idb-keyval';

export async function syncLocalData() {
  const localData = await get('qingyeyun-storage');
  if (!localData) return;

  const { state } = localData;
  if (!state) return;

  try {
    await apiFetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        apps: state.apps || [],
        transactions: state.transactions || [],
        bookmarks: Object.keys(state.bookmarks || {}).flatMap(uid => state.bookmarks[uid]),
        notifications: state.notifications || [],
      }),
    });

    // Clear local data after successful sync
    await del('qingyeyun-storage');
    console.log('Local data synced successfully');
  } catch (error) {
    console.error('Failed to sync local data:', error);
  }
}
