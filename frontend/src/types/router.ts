declare module "expo-router" {
  import type { ComponentProps } from 'react';
  import type { LinkProps as OriginalLinkProps, NavigatorScreenParams } from '@react-navigation/native';

  // Define MainTabParamList
  export type MainTabParamList = {
    Home: undefined;
    Profile: undefined;
  };

  export type RootParamList = {
    Login: undefined;
    Main: NavigatorScreenParams<MainTabParamList>;
  };

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
  } & RootParamList;

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

  // Update Link type to accept children and asChild
  export interface CustomLinkProps extends Omit<OriginalLinkProps<PathConfig>, 'to'> {
    href: string;
    children?: React.ReactNode;
    asChild?: boolean;
  }
  export const Link: React.FC<CustomLinkProps>;

  // Router instance
  export const router: ReturnType<typeof useRouter>;
} 