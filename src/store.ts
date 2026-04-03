import { create } from "zustand";
import { get, del } from "idb-keyval";
import { 
  getApps, getAppDetail, createApp, updateApp as apiUpdateApp, deleteApp as apiDeleteApp,
  getProfile, updateProfile, getComments, createComment as apiCreateComment,
  getBookmarks, toggleBookmark as apiToggleBookmark,
  getNotifications, markAsRead,
  getTransactions, createTransaction,
  getDemands, createDemand as apiCreateDemand,
  toggleRecognition as apiToggleRecognition,
  supabase, syncLocalData, apiFetch
} from "./lib";
import { AppItem, User, Comment, Notification, Transaction, Demand, Recognitions } from "./types";

interface StoreState {
  currentUser: User | null;
  apps: AppItem[];
  currentApp: AppItem | null;
  comments: Comment[];
  bookmarks: string[]; // appId[]
  userRecognitions: string[]; // array of `${userId}-${appId}-${type}`
  notifications: Notification[];
  transactions: Transaction[];
  demands: Demand[];
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  init: () => Promise<void>;
  login: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchApps: (params?: any) => Promise<void>;
  fetchAppDetail: (id: string) => Promise<void>;
  addApp: (app: any) => Promise<string>;
  updateApp: (id: string, updates: any) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  toggleRecognition: (appId: string, type: keyof Recognitions) => Promise<void>;
  toggleBookmark: (appId: string) => Promise<void>;
  addComment: (appId: string, content: string, replyToId?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  purchaseApp: (appId: string) => Promise<void>;
  addDemand: (demand: any) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  _hasHydrated: false,
  setHasHydrated: (state) => set({ _hasHydrated: state }),
  currentUser: null,
  apps: [],
  currentApp: null,
  comments: [],
  bookmarks: [],
  userRecognitions: [],
  notifications: [],
  transactions: [],
  demands: [],

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const profile = await getProfile();
        const bookmarksData = await getBookmarks();
        const notificationsData = await getNotifications();
        const transactionsData = await getTransactions();
        
        set({ 
          currentUser: profile,
          bookmarks: bookmarksData.map((b: any) => b.app_id),
          notifications: notificationsData,
          transactions: transactionsData
        });
      } catch (error) {
        console.error("Failed to init user data:", error);
      }
    }
    
    await get().fetchApps();
    set({ _hasHydrated: true });
  },

  login: async (phone) => {
    const { error } = await supabase.auth.signInWithOtp({ phone: `+86${phone}` });
    if (error) throw error;
  },

  verifyOtp: async (phone, token) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: `+86${phone}`,
      token,
      type: 'sms',
    });
    if (error) throw error;
    
    // Sync legacy data on first login
    await syncLocalData();
    await get().init();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null, bookmarks: [], notifications: [], transactions: [] });
  },

  fetchApps: async (params) => {
    const apps = await getApps(params);
    set({ apps });
  },

  fetchAppDetail: async (id) => {
    const app = await getAppDetail(id);
    const comments = await getComments(id);
    set({ currentApp: app, comments });
  },

  addApp: async (appData) => {
    const newApp = await createApp(appData);
    set((state) => ({ apps: [newApp, ...state.apps] }));
    return newApp.id;
  },

  updateApp: async (id, updates) => {
    const updatedApp = await apiUpdateApp(id, updates);
    set((state) => ({
      apps: state.apps.map((app) => app.id === id ? updatedApp : app),
      currentApp: state.currentApp?.id === id ? updatedApp : state.currentApp
    }));
  },

  deleteApp: async (id) => {
    await apiDeleteApp(id);
    set((state) => ({
      apps: state.apps.filter((app) => app.id !== id)
    }));
  },

  incrementViews: async (id) => {
    // API detail route already increments views
    await getAppDetail(id);
  },

  toggleRecognition: async (appId, type) => {
    await apiToggleRecognition(appId, type);
    // Refresh app detail to get updated counts
    if (get().currentApp?.id === appId) {
      await get().fetchAppDetail(appId);
    }
  },

  toggleBookmark: async (appId) => {
    await apiToggleBookmark(appId);
    const isBookmarked = get().bookmarks.includes(appId);
    set((state) => ({
      bookmarks: isBookmarked 
        ? state.bookmarks.filter(id => id !== appId)
        : [...state.bookmarks, appId]
    }));
  },

  addComment: async (appId, content, replyToId) => {
    const newComment = await apiCreateComment({ appId, content, replyToId });
    set((state) => ({ comments: [newComment, ...state.comments] }));
  },

  markNotificationRead: async (id) => {
    await markAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n)
    }));
  },

  markAllNotificationsRead: async () => {
    // API call to mark all as read
    await apiFetch('/api/notifications/read-all', { method: 'POST' });
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true }))
    }));
  },

  purchaseApp: async (appId) => {
    // Mock purchase logic via API
    await apiFetch('/api/purchase', { method: 'POST', body: JSON.stringify({ appId }) });
    await get().init(); // Refresh balance and transactions
  },

  addDemand: async (demandData) => {
    await apiCreateDemand(demandData);
    const demands = await getDemands();
    set({ demands });
  },

  withdraw: async (amount) => {
    await createTransaction({ amount: -amount, type: 'withdraw', description: '提现申请' });
    await get().init();
  }
}));

