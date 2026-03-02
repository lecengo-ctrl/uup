import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export type AppStatus = "online" | "review" | "offline";
export type Visibility = "public" | "private";

export interface Recognitions {
  creative: number;
  professional: number;
  beautiful: number;
}

export interface AppItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverUrl: string;
  authorId: string;
  views: number;
  recognitions: Recognitions;
  downloads: number;
  purchases: number;
  status: AppStatus;
  visibility: Visibility;
  allowDownload: boolean;
  price: number;
  createdAt: number;
  htmlContent: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  role: "user" | "admin";
  level: number;
  balance: number;
  withdrawable: number;
}

export interface Comment {
  id: string;
  appId: string;
  authorId: string;
  content: string;
  replyToId?: string;
  isPinned?: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "view" | "bookmark" | "comment" | "download" | "purchase" | "system";
  content: string;
  isRead: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "income" | "withdraw";
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: number;
}

export interface Demand {
  id: string;
  publisherId: string;
  title: string;
  description: string;
  budget: number;
  deadline: number;
  status: "open" | "taken" | "delivered" | "completed" | "closed";
  takerId?: string;
  createdAt: number;
}

interface StoreState {
  currentUser: User | null;
  users: Record<string, User>;
  apps: AppItem[];
  comments: Comment[];
  bookmarks: Record<string, string[]>; // userId -> appId[]
  userRecognitions: string[]; // array of `${userId}-${appId}-${type}`
  notifications: Notification[];
  transactions: Transaction[];
  demands: Demand[];
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  login: (phone: string, role?: "user" | "admin") => void;
  logout: () => void;
  addApp: (
    app: Omit<
      AppItem,
      | "id"
      | "views"
      | "recognitions"
      | "downloads"
      | "purchases"
      | "status"
      | "createdAt"
    >,
  ) => string;
  updateApp: (id: string, updates: Partial<AppItem>) => void;
  deleteApp: (id: string) => void;
  incrementViews: (id: string) => void;
  toggleRecognition: (appId: string, type: keyof Recognitions) => void;
  toggleBookmark: (appId: string) => void;
  addComment: (appId: string, content: string, replyToId?: string) => void;
  deleteComment: (id: string) => void;
  pinComment: (id: string, isPinned: boolean) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "isRead" | "createdAt">,
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  purchaseApp: (appId: string) => void;
  downloadApp: (appId: string) => void;
  addDemand: (demand: Omit<Demand, "id" | "status" | "createdAt">) => void;
  updateDemand: (id: string, updates: Partial<Demand>) => void;
  withdraw: (amount: number) => void;
}

const mockApps: AppItem[] = [
  {
    id: "app-1",
    title: "AI 贪吃蛇",
    description: "一个简单的贪吃蛇游戏，使用纯HTML/JS编写。",
    tags: ["小游戏", "开源免费", "创意 idea"],
    coverUrl: "https://picsum.photos/seed/snake/400/300",
    authorId: "user-1",
    views: 1250,
    recognitions: { creative: 120, professional: 45, beautiful: 80 },
    downloads: 300,
    purchases: 0,
    status: "online",
    visibility: "public",
    allowDownload: true,
    price: 0,
    createdAt: Date.now() - 10000000,
    htmlContent: `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#222;color:#fff;font-family:sans-serif;}</style></head><body><h1>AI 贪吃蛇 (Demo)</h1></body></html>`,
  },
  {
    id: "app-2",
    title: "番茄钟计时器",
    description: "极简风格的番茄钟，提升你的工作效率。",
    tags: ["效率工具", "个人自用", "高颜值设计"],
    coverUrl: "https://picsum.photos/seed/pomodoro/400/300",
    authorId: "user-2",
    views: 890,
    recognitions: { creative: 30, professional: 150, beautiful: 200 },
    downloads: 50,
    purchases: 10,
    status: "online",
    visibility: "public",
    allowDownload: true,
    price: 9.9,
    createdAt: Date.now() - 5000000,
    htmlContent: `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f5f5f5;color:#333;font-family:sans-serif;}</style></head><body><h1>25:00</h1></body></html>`,
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      currentUser: null,
      users: {
        "user-1": {
          id: "user-1",
          nickname: "SnakeMaster",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user-1",
          role: "user",
          level: 3,
          balance: 150.5,
          withdrawable: 100,
        },
        "user-2": {
          id: "user-2",
          nickname: "ProductivityNinja",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user-2",
          role: "user",
          level: 5,
          balance: 890,
          withdrawable: 800,
        },
        "admin-1": {
          id: "admin-1",
          nickname: "Admin",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
          role: "admin",
          level: 10,
          balance: 0,
          withdrawable: 0,
        },
      },
      apps: mockApps,
      comments: [],
      bookmarks: {},
      userRecognitions: [],
      notifications: [],
      transactions: [],
      demands: [],

      login: (phone, role = "user") =>
        set((state) => {
          const id = `user-${phone}`;
          const isNew = !state.users[id];
          const newUser: User = isNew
            ? {
                id,
                nickname: `User_${phone.slice(-4)}`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
                role,
                level: 1,
                balance: 0,
                withdrawable: 0,
              }
            : state.users[id];

          return {
            currentUser: newUser,
            users: isNew ? { ...state.users, [id]: newUser } : state.users,
          };
        }),

      logout: () => set({ currentUser: null }),

      addApp: (appData) => {
        const id = `app-${Date.now()}`;
        const newApp: AppItem = {
          ...appData,
          id,
          views: 0,
          recognitions: { creative: 0, professional: 0, beautiful: 0 },
          downloads: 0,
          purchases: 0,
          status: "online",
          createdAt: Date.now(),
        };
        set((state) => ({ apps: [newApp, ...state.apps] }));
        return id;
      },

      updateApp: (id, updates) =>
        set((state) => ({
          apps: state.apps.map((app) =>
            app.id === id ? { ...app, ...updates } : app,
          ),
        })),

      deleteApp: (id) =>
        set((state) => ({
          apps: state.apps.filter((app) => app.id !== id),
        })),

      incrementViews: (id) =>
        set((state) => {
          const app = state.apps.find((a) => a.id === id);
          if (
            app &&
            state.currentUser &&
            app.authorId !== state.currentUser.id
          ) {
            // Add notification for author
            get().addNotification({
              userId: app.authorId,
              type: "view",
              content: `有人访问了你的应用《${app.title}》`,
            });
          }
          return {
            apps: state.apps.map((app) =>
              app.id === id ? { ...app, views: app.views + 1 } : app,
            ),
          };
        }),

      toggleRecognition: (appId, type) =>
        set((state) => {
          if (!state.currentUser) return state;
          const userId = state.currentUser.id;
          const recKey = `${userId}-${appId}-${type}`;
          const isRecognized = state.userRecognitions.includes(recKey);

          const newUserRecognitions = isRecognized
            ? state.userRecognitions.filter((k) => k !== recKey)
            : [...state.userRecognitions, recKey];

          return {
            userRecognitions: newUserRecognitions,
            apps: state.apps.map((app) =>
              app.id === appId
                ? {
                    ...app,
                    recognitions: {
                      ...(app.recognitions || {
                        creative: 0,
                        professional: 0,
                        beautiful: 0,
                      }),
                      [type]:
                        (app.recognitions?.[type] || 0) +
                        (isRecognized ? -1 : 1),
                    },
                  }
                : app,
            ),
          };
        }),

      toggleBookmark: (appId) =>
        set((state) => {
          if (!state.currentUser) return state;
          const userId = state.currentUser.id;
          const userBookmarks = state.bookmarks[userId] || [];
          const isBookmarked = userBookmarks.includes(appId);

          const newBookmarks = isBookmarked
            ? userBookmarks.filter((id) => id !== appId)
            : [...userBookmarks, appId];

          const app = state.apps.find((a) => a.id === appId);
          if (!isBookmarked && app && app.authorId !== userId) {
            get().addNotification({
              userId: app.authorId,
              type: "bookmark",
              content: `${state.currentUser.nickname} 收藏了你的应用《${app.title}》`,
            });
          }

          return {
            bookmarks: { ...state.bookmarks, [userId]: newBookmarks },
          };
        }),

      addComment: (appId, content, replyToId) =>
        set((state) => {
          if (!state.currentUser) return state;
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            appId,
            authorId: state.currentUser.id,
            content,
            replyToId,
            createdAt: Date.now(),
          };

          const app = state.apps.find((a) => a.id === appId);
          if (app && app.authorId !== state.currentUser.id) {
            get().addNotification({
              userId: app.authorId,
              type: "comment",
              content: `${state.currentUser.nickname} 评论了你的应用《${app.title}》`,
            });
          }

          return { comments: [newComment, ...state.comments] };
        }),

      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        })),

      pinComment: (id, isPinned) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id ? { ...c, isPinned } : c,
          ),
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif-${Date.now()}-${Math.random()}`,
              isRead: false,
              createdAt: Date.now(),
            },
            ...state.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n,
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => {
          if (!state.currentUser) return state;
          return {
            notifications: state.notifications.map((n) =>
              n.userId === state.currentUser!.id ? { ...n, isRead: true } : n,
            ),
          };
        }),

      purchaseApp: (appId) =>
        set((state) => {
          if (!state.currentUser) return state;
          const app = state.apps.find((a) => a.id === appId);
          if (!app || app.price <= 0) return state;

          // Mock purchase
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            userId: app.authorId,
            amount: app.price * 0.8, // 20% platform fee
            type: "income",
            description: `应用《${app.title}》被购买`,
            status: "completed",
            createdAt: Date.now(),
          };

          get().addNotification({
            userId: app.authorId,
            type: "purchase",
            content: `你的应用《${app.title}》产生了一笔新订单，收益 ￥${(app.price * 0.8).toFixed(2)}`,
          });

          return {
            apps: state.apps.map((a) =>
              a.id === appId ? { ...a, purchases: a.purchases + 1 } : a,
            ),
            transactions: [transaction, ...state.transactions],
            users: {
              ...state.users,
              [app.authorId]: {
                ...state.users[app.authorId],
                balance: state.users[app.authorId].balance + transaction.amount,
                withdrawable:
                  state.users[app.authorId].withdrawable + transaction.amount,
              },
            },
          };
        }),

      downloadApp: (appId) =>
        set((state) => {
          const app = state.apps.find((a) => a.id === appId);
          if (app && app.authorId !== state.currentUser?.id) {
            get().addNotification({
              userId: app.authorId,
              type: "download",
              content: `有人下载了你的应用《${app.title}》`,
            });
          }
          return {
            apps: state.apps.map((a) =>
              a.id === appId ? { ...a, downloads: a.downloads + 1 } : a,
            ),
          };
        }),

      addDemand: (demand) =>
        set((state) => ({
          demands: [
            {
              ...demand,
              id: `demand-${Date.now()}`,
              status: "open",
              createdAt: Date.now(),
            },
            ...state.demands,
          ],
        })),

      updateDemand: (id, updates) =>
        set((state) => ({
          demands: state.demands.map((d) =>
            d.id === id ? { ...d, ...updates } : d,
          ),
        })),

      withdraw: (amount) =>
        set((state) => {
          if (!state.currentUser) return state;
          const user = state.users[state.currentUser.id];
          if (user.withdrawable < amount) return state;

          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            userId: user.id,
            amount: -amount,
            type: "withdraw",
            description: `提现申请`,
            status: "pending",
            createdAt: Date.now(),
          };

          return {
            transactions: [transaction, ...state.transactions],
            users: {
              ...state.users,
              [user.id]: {
                ...user,
                withdrawable: user.withdrawable - amount,
              },
            },
            currentUser: {
              ...state.currentUser,
              withdrawable: state.currentUser.withdrawable - amount,
            },
          };
        }),
    }),
    {
      name: "qingyeyun-storage",
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
