export interface SocialLoginPayload {
  provider: 'google' | 'apple';
  token: string | null;
} 