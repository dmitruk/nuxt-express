import { ModuleThis } from '@nuxt/types';
import chalk from 'chalk';
import Chokidar, { FSWatcher } from 'chokidar';
import { INormalizedMiddleware } from './interfaces';
import { Logger } from './logger';

export function createFsWatcher(nuxtModule: ModuleThis, middlewares: INormalizedMiddleware[]): FSWatcher {
  const watchPaths = middlewares.reduce<string[]>((paths, middleware) => {
    for (const watchPath of middleware.watch) {
      if (!paths.find(path => watchPath.startsWith(path))) {
        paths.push(watchPath);
      }
    }

    return paths;
  }, []);

  return Chokidar.watch(watchPaths).on('change', (filePath) => {
    const reloadWatchPath = watchPaths.filter(watchPath => filePath.startsWith(watchPath));

    for (const id of Object.keys(require.cache)) {
      if (reloadWatchPath.find(watchPath => id.startsWith(watchPath))) {
        delete require.cache[id];
        Logger.debug(chalk`Clear module cache for {gray ${id}}`);
      }
    }

    if (!reloadWatchPath.length) {
      return;
    }

    const reloadMiddlewares = middlewares.filter(middleware => middleware.watch.find(path => reloadWatchPath.includes(path)));

    for (const middleware of reloadMiddlewares) {
      nuxtModule.nuxt.resolver.requireModule(middleware.handler, { interopDefault: false });
    }

    Logger.info([
      chalk`{cyan Reload}`,
      reloadMiddlewares.map(({path}) => chalk.bold(path)).join(', '),
      `middleware${reloadMiddlewares.length > 1 ? 's' : ''}`,
      chalk`({gray ${filePath}})`
    ].join(' '));
  });
}
