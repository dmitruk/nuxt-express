import Path from 'path';
import Fs from 'fs';
import { ModuleThis } from '@nuxt/types';
import { IMiddleware, INormalizedMiddleware } from './interfaces';

export function normalizePath(nuxtModule: ModuleThis, path?: string | string[]): string[] {
  if (!path) {
    return [];
  }

  const paths = Array.isArray(path) ? path : [path];

  return paths.map(path => nuxtModule.nuxt.resolver.resolvePath(path));
}

export function normalizeMiddleware(
  nuxtModule: ModuleThis,
  middleware?: string | string[] | IMiddleware | IMiddleware[]
): INormalizedMiddleware[] {
  if (!middleware) {
    return [];
  }

  if (Array.isArray(middleware)) {
    const normalizedMiddlewares: INormalizedMiddleware[] = [];

    for (const m of middleware) {
      normalizedMiddlewares.push(...normalizeMiddleware(nuxtModule, m));
    }

    return normalizedMiddlewares;
  }

  if (typeof middleware !== 'string' && !middleware.handler) {
    return [];
  }

  const handlerPath = nuxtModule.nuxt.resolver.resolvePath(typeof middleware === 'string' ? middleware : middleware.handler);
  const handlerPathIsDir = Fs.statSync(handlerPath).isDirectory();
  const watchPath = handlerPathIsDir ? handlerPath : Path.dirname(handlerPath);

  return [{
    handler: typeof middleware === 'string' ? middleware : middleware.handler,
    path: (typeof middleware === 'string' || !middleware.path) ? '/' : middleware.path,
    member: (typeof middleware === 'string' || !middleware.member) ? 'default' : middleware.member,
    watch: (typeof middleware === 'string' || !middleware.watch)
      ? [watchPath]
      : [watchPath, ...normalizePath(nuxtModule, middleware.watch)]
  }];
}
