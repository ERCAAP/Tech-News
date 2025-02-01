declare module "expo-router" {
  import type { ComponentProps } from 'react';
  import type { LinkProps as OriginalLinkProps } from '@react-navigation/native';

  export type PathList = {
    "/": undefined;
    "/create-news": undefined;
    "/edit-profile": undefined;
    "/privacy": undefined;
    "/terms": undefined;
    "/(admin)/edit-news/[id]": { id: string };
    "/category/[id]": { id: string };
    "/(tabs)": undefined;
    "/(tabs)/index": undefined;
    "/(tabs)/admin": undefined;
    "/(tabs)/profile": undefined;
    "/(tabs)/news/[id]": { id: string };
    "/(tabs)/news/[slug]": { slug: string };
    "/(auth)/login": undefined;
    "/(auth)/register": undefined;
  };

  export type PathConfig = PathList;

  // Navigation types
  export type Stack = any;
  export type Tabs = any;
  export type Redirect = any;
  export type Link = any;

  // Hook types
  export const useRouter: () => {
    push: (path: string | { pathname: string; params?: Record<string, string> }) => void;
    replace: (path: string | { pathname: string; params?: Record<string, string> }) => void;
    back: () => void;
    canGoBack: () => boolean;
  };

  export const useLocalSearchParams: <T extends Record<string, string>>() => T;
  export const usePathname: () => string | null;

  // Component types
  export const Stack: Stack;
  export const Tabs: Tabs;
  export const Redirect: Redirect;
  export const Link: React.FC<OriginalLinkProps & { href: string }>;

  // Router instance
  export const router: ReturnType<typeof useRouter>;
} 