import 'styled-components';
import type { CSSProp } from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {}

  // Fix for React 18 compatibility
  export interface ThemedStyledComponentsModule<T> {
    createGlobalStyle: any;
  }
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    css?: CSSProp;
  }
}
