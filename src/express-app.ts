import { ModuleThis } from '@nuxt/types';
import { INormalizedMiddleware } from './interfaces';
import Express, { Application, NextFunction, Request, Response } from 'express';
import { Logger } from './logger';
import chalk from 'chalk';

export function createExpressApp(nuxtModule: ModuleThis, middlewares: INormalizedMiddleware[]): Application {
  const app = Express();

  for (const middleware of middlewares) {
    nuxtModule.nuxt.resolver.requireModule(middleware.handler, { interopDefault: false });

    app.use(middleware.path, (req: Request, res: Response, next: NextFunction): void => {
      let handler;

      try {
        const module = nuxtModule.nuxt.resolver.requireModule(middleware.handler, { interopDefault: false });

        handler = module[middleware.member];
      } catch (error) {
        Logger.error('Error:', error);

        handler = (_req: Request, _res: Response, next: NextFunction): void => next(error);
      }

      handler(req, res, next);
    });
  }

  Logger.success([
    'Added',
    middlewares.map(middleware => chalk.bold(middleware.path)).join(', '),
    `middleware${middlewares.length > 1 ? 's' : ''}`
  ].join(' '));

  return app;
}
