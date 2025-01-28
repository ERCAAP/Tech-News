import 'react-navigation';

declare module '@react-navigation/native' {
  export interface DefaultNavigatorOptions {
    id?: string | undefined;
  }
}
