export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface NewsState {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
} 