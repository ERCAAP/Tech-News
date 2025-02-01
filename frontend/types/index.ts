export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  author: {
    firstName: string;
    lastName: string;
  };
  category: string;
  imageUrl?: string;
  contentImages?: string[];
  createdAt: string;
  updatedAt: string;
  views?: {
    total: number;
    unique: number;
  };
  favorites?: {
    count: number;
    users: string[];
  };
  status: 'draft' | 'published' | 'archived';
}

export interface NewsState {
  news: NewsItem[];
  favorites: NewsItem[];
  isLoading: boolean;
  error: string | null;
  stats: any;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
}

export function isUserAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// ... other types ... 