/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@nuxt/types' {
  type ModuleThis = {
    [key: string]: any;
    nuxt: any;
    options: any;
    extendBuild(fn: Function): void;
  };

  export type Module<T = any> = (this: ModuleThis, moduleOptions: T) => Promise<void> | void;
}
