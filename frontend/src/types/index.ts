export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// User tipi için yardımcı fonksiyonlar
export const getUserFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

export const getUserInitials = (user: User): string => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

export const isUserAdmin = (user: User): boolean => {
  return user.role === 'admin';
};

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