export interface NewsItem {
  _id: string;
  title: string;
  displayTitle?: string;
  content: string;
  category: string;
  coverImage?: string;
  imageRefs?: Array<{ url: string; filename: string }>;
  createdAt: string;
  timestamp: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
} 