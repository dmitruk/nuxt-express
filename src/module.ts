import { Module } from '@nuxt/types';
import { normalizeMiddleware } from './utils';
import { IMiddleware } from './interfaces';
import { createExpressApp } from './express-app';
import { createFsWatcher } from './fs-watcher';

const nuxtExpressModule: Module<string | string[] | IMiddleware | IMiddleware[]> = function(moduleOptions) {
  const middlewares = moduleOptions ? normalizeMiddleware(this, moduleOptions) : [];

  if (!middlewares.length) {
    return;
  }

  const app = createExpressApp(this, middlewares);

  this.addServerMiddleware(app);

  if (this.options.dev) {
    const watcher = createFsWatcher(this, middlewares);

    this.nuxt.hook('close', () => watcher.close());
  }
};

export default nuxtExpressModule;
