export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  favoriteNews: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
  category: string;
  likes: number;
  isFavorited: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface NewsState {
  news: NewsItem[];
  favorites: NewsItem[];
  isLoading: boolean;
  error: string | null;
} 