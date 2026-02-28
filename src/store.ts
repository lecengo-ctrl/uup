import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppStatus = 'online' | 'review' | 'offline';

export interface AppItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverUrl: string;
  authorId: string;
  views: number;
  likes: number;
  status: AppStatus;
  createdAt: number;
  htmlContent: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  role: 'user' | 'admin';
}

export interface Comment {
  id: string;
  appId: string;
  authorId: string;
  content: string;
  createdAt: number;
}

interface StoreState {
  currentUser: User | null;
  users: Record<string, User>;
  apps: AppItem[];
  comments: Comment[];
  bookmarks: Record<string, string[]>; // userId -> appId[]
  likes: Record<string, string[]>; // userId -> appId[]
  
  login: (phone: string, role?: 'user' | 'admin') => void;
  logout: () => void;
  addApp: (app: Omit<AppItem, 'id' | 'views' | 'likes' | 'status' | 'createdAt'>) => string;
  updateApp: (id: string, updates: Partial<AppItem>) => void;
  deleteApp: (id: string) => void;
  incrementViews: (id: string) => void;
  toggleLike: (appId: string) => void;
  toggleBookmark: (appId: string) => void;
  addComment: (appId: string, content: string) => void;
  deleteComment: (id: string) => void;
}

const mockApps: AppItem[] = [
  {
    id: 'app-1',
    title: 'AI 贪吃蛇',
    description: '一个简单的贪吃蛇游戏，使用纯HTML/JS编写。',
    tags: ['小游戏', '休闲'],
    coverUrl: 'https://picsum.photos/seed/snake/400/300',
    authorId: 'user-1',
    views: 1250,
    likes: 342,
    status: 'online',
    createdAt: Date.now() - 10000000,
    htmlContent: `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#222;color:#fff;font-family:sans-serif;}</style></head><body><h1>AI 贪吃蛇 (Demo)</h1></body></html>`
  },
  {
    id: 'app-2',
    title: '番茄钟计时器',
    description: '极简风格的番茄钟，提升你的工作效率。',
    tags: ['效率工具'],
    coverUrl: 'https://picsum.photos/seed/pomodoro/400/300',
    authorId: 'user-2',
    views: 890,
    likes: 120,
    status: 'online',
    createdAt: Date.now() - 5000000,
    htmlContent: `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f5f5f5;color:#333;font-family:sans-serif;}</style></head><body><h1>25:00</h1></body></html>`
  }
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: {
        'user-1': { id: 'user-1', nickname: 'SnakeMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user-1', role: 'user' },
        'user-2': { id: 'user-2', nickname: 'ProductivityNinja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user-2', role: 'user' },
        'admin-1': { id: 'admin-1', nickname: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', role: 'admin' }
      },
      apps: mockApps,
      comments: [],
      bookmarks: {},
      likes: {},

      login: (phone, role = 'user') => set((state) => {
        const id = `user-${phone}`;
        const isNew = !state.users[id];
        const newUser = isNew ? {
          id,
          nickname: `User_${phone.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
          role
        } : state.users[id];

        return {
          currentUser: newUser,
          users: isNew ? { ...state.users, [id]: newUser } : state.users
        };
      }),

      logout: () => set({ currentUser: null }),

      addApp: (appData) => {
        const id = `app-${Date.now()}`;
        const newApp: AppItem = {
          ...appData,
          id,
          views: 0,
          likes: 0,
          status: 'online', // MVP auto online
          createdAt: Date.now()
        };
        set((state) => ({ apps: [newApp, ...state.apps] }));
        return id;
      },

      updateApp: (id, updates) => set((state) => ({
        apps: state.apps.map(app => app.id === id ? { ...app, ...updates } : app)
      })),

      deleteApp: (id) => set((state) => ({
        apps: state.apps.filter(app => app.id !== id)
      })),

      incrementViews: (id) => set((state) => ({
        apps: state.apps.map(app => app.id === id ? { ...app, views: app.views + 1 } : app)
      })),

      toggleLike: (appId) => set((state) => {
        if (!state.currentUser) return state;
        const userId = state.currentUser.id;
        const userLikes = state.likes[userId] || [];
        const isLiked = userLikes.includes(appId);
        
        const newLikes = isLiked 
          ? userLikes.filter(id => id !== appId)
          : [...userLikes, appId];

        return {
          likes: { ...state.likes, [userId]: newLikes },
          apps: state.apps.map(app => 
            app.id === appId 
              ? { ...app, likes: app.likes + (isLiked ? -1 : 1) } 
              : app
          )
        };
      }),

      toggleBookmark: (appId) => set((state) => {
        if (!state.currentUser) return state;
        const userId = state.currentUser.id;
        const userBookmarks = state.bookmarks[userId] || [];
        const isBookmarked = userBookmarks.includes(appId);
        
        const newBookmarks = isBookmarked 
          ? userBookmarks.filter(id => id !== appId)
          : [...userBookmarks, appId];

        return {
          bookmarks: { ...state.bookmarks, [userId]: newBookmarks }
        };
      }),

      addComment: (appId, content) => set((state) => {
        if (!state.currentUser) return state;
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          appId,
          authorId: state.currentUser.id,
          content,
          createdAt: Date.now()
        };
        return { comments: [newComment, ...state.comments] };
      }),

      deleteComment: (id) => set((state) => ({
        comments: state.comments.filter(c => c.id !== id)
      }))
    }),
    {
      name: 'qingyeyun-storage',
    }
  )
);
