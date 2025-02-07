export interface User {
  isSubscription: boolean;
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  token?: string;
  favoriteNews: string[];
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

// Admin kontrolü için yardımcı fonksiyon
export const isUserAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export interface ViewsData {
  total: number;
  unique: number;
  last24Hours: number;
  users: Array<{
    _id: string;
    timestamp: string;
  }>;
  count: number;
}

export interface NewsItem {
  _id: string;
  title: string;
  displayTitle: string;
  content: string;
  summary: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: string;
  subCategory?: string;
  tags: string[];
  imageUrl?: string;
  contentImages: string[];
  videoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  views: {
    total: number;
    unique: number;
    last24Hours: number;
    users: Array<{
      _id: string;
      timestamp: string;
    }>;
    count: number;
  };
  likes: string[];
  favorites: {
    users: string[];
    count: number;
  };
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isHighlighted: boolean;
  readTime: number;
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
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