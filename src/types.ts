export interface Profile {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  role: 'user' | 'admin';
  level: number;
  balance: number;
  withdrawable: number;
  created_at: string;
  updated_at: string;
}

export interface User extends Profile {}

export interface Recognitions {
  creative: number;
  professional: number;
  beautiful: number;
}

export interface AppItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string[];
  cover_url: string;
  views: number;
  recognitions: Recognitions;
  downloads: number;
  purchases: number;
  status: 'online' | 'review' | 'offline';
  visibility: 'public' | 'private';
  allow_download: boolean;
  price: number;
  html_content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    nickname: string;
    avatar: string;
  };
}

export interface Comment {
  id: string;
  user_id: string;
  app_id: string;
  content: string;
  reply_to_id?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    nickname: string;
    avatar: string;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'withdraw';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'view' | 'bookmark' | 'comment' | 'download' | 'purchase' | 'system';
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Demand {
  id: string;
  user_id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: 'open' | 'taken' | 'delivered' | 'completed' | 'closed';
  taker_id?: string;
  created_at: string;
  updated_at: string;
}
