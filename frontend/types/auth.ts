export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  socialProvider?: 'google' | 'apple';
  socialId?: string;
  picture?: string;
  locale?: string;
} 