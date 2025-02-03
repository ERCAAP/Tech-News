export interface BaseRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SocialRegisterData extends BaseRegisterData {
  socialProvider: 'google' | 'apple';
  socialId: string;
  picture?: string;
  locale?: string;
}

export type RegisterData = BaseRegisterData | SocialRegisterData; 