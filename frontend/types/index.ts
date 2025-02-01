export interface ViewsData {
  total: number;
  unique: number;
  last24Hours: number;
  history: Array<{
    userId: string;
    timestamp: string;
  }>;
}

export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  summary: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: string;
  imageUrl?: string;
  views?: {
    total: number;
  };
  likes?: string[];
  favorites?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewsState {
  news: NewsItem[];
  favorites: NewsItem[];
  isLoading: boolean;
  error: string | null;
  stats: any | null;
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