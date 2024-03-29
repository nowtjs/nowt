import type { Container, Provider } from '@armscye/container';
import type { HttpAdapter } from '@armscye/http';
import type { Logger } from '@armscye/logging';
import type { Module } from '@armscye/module';
import { NoopLogger } from '@nowtjs/utils';

import { Application } from './application';
import { HTTP_ADAPTER, LOGGER } from './constants';
import { HookCollector } from './hook-collector';
import { HookContainer } from './hook-container';
import { HookFactory } from './hook-factory';
import { HttpAdapterHost } from './http-adapter-host';
import { LoggerHost } from './logger-host';

export class NotchModule implements Module {
  register(): { providers: Provider[] } {
    return {
      providers: [
        {
          provide: HttpAdapterHost.name,
          useFactory: (container: Container) => {
            const adapter = container.has(HTTP_ADAPTER)
              ? container.get<HttpAdapter>(HTTP_ADAPTER)
              : undefined;

            return new HttpAdapterHost(adapter);
          },
        },
        {
          provide: LoggerHost.name,
          useFactory: (container: Container) => {
            const logger = container.has(LOGGER)
              ? container.get<Logger>(LOGGER)
              : new NoopLogger();

            return new LoggerHost(logger);
          },
        },
        {
          provide: HookContainer.name,
          useFactory: (container: Container) => {
            return new HookContainer(container);
          },
        },
        {
          provide: HookFactory.name,
          useFactory: (container: Container) => {
            return new HookFactory(container.get(HookContainer.name));
          },
        },
        {
          provide: HookCollector.name,
          useFactory: (container: Container) => {
            const config = container.has('config')
              ? container.get<any>('config')
              : {};

            return new HookCollector(
              container.get(HookFactory.name),
              config.hooks,
            );
          },
        },
        {
          provide: Application.name,
          useFactory: (container: Container) => {
            const httpAdapterHost = container.get<HttpAdapterHost>(
              HttpAdapterHost.name,
            );

            if (!httpAdapterHost.httpAdapter) {
              throw new Error('HTTP adapter missing');
            }

            const config = container.has('config')
              ? container.get<any>('config')
              : {};
            const loggerHost = container.get<LoggerHost>(LoggerHost.name);
            const hooks = container.get<HookCollector>(HookCollector.name);

            return new Application(httpAdapterHost.httpAdapter, hooks, {
              log: loggerHost.logger.getLogger(Application.name),
              config: config.notch,
            });
          },
        },
      ],
    };
  }
}
