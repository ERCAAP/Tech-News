export interface SocialLoginRequest {
  provider: 'google' | 'apple';
  token: string;
}

export interface SocialUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
} 