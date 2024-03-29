import * as http from 'node:http';
import * as https from 'node:https';
import type { AddressInfo } from 'node:net';
import { platform } from 'node:os';

import type { HttpAdapter } from '@armscye/http';
import { isFunction, isString } from '@hemjs/notions';

import type { HookCollector } from './hook-collector';
import type { ApplicationEnvironment } from './interfaces';

export class Application {
  protected httpServer: http.Server | https.Server;
  private readonly adapter: HttpAdapter;
  private readonly hooks: HookCollector;
  private readonly _environment: ApplicationEnvironment;
  private isInitialized = false;
  private isListening = false;

  constructor(
    adapter: HttpAdapter,
    hooks: HookCollector,
    environment: ApplicationEnvironment,
  ) {
    this.adapter = adapter;
    this.hooks = hooks;
    this._environment = environment;
    this.registerHttpServer();
  }

  get environment() {
    return this._environment;
  }

  public async init() {
    if (this.isInitialized) {
      return this;
    }

    this.environment.log.info('Initializing application');
    await this.hooks.addStartupHook();
    this.isInitialized = true;
    this.environment.log.info('Application initialized');
    return this;
  }

  public getHttpAdapter<T extends HttpAdapter = HttpAdapter>(): T {
    return this.adapter as T;
  }

  public getHttpServer(): http.Server | https.Server {
    return this.httpServer;
  }

  public registerHttpServer(): void {
    this.httpServer = this.createServer();
  }

  public createServer<T = any>(): T {
    this.environment.log.info(
      `Initializing adapter [${this.adapter.getName()}] `,
    );
    this.adapter.initHttpServer();
    this.environment.log.info(`${this.adapter.getName()} initialized`);
    return this.adapter.getHttpServer() as T;
  }

  public async listen(
    port: string | number,
    callback?: () => void,
  ): Promise<any>;
  public async listen(
    port: string | number,
    hostname: string,
    callback?: () => void,
  ): Promise<any>;
  public async listen(port: any, ...args: any[]): Promise<any> {
    if (!this.isInitialized) await this.init();

    return new Promise((resolve, reject) => {
      const errorHandler = (e: any) => {
        this.environment.log.error(e?.toString?.());
        reject(e);
      };
      this.httpServer.once('error', errorHandler);
      const isCallbackInOriginalArgs = isFunction(args[args.length - 1]);
      const listenFnArgs = isCallbackInOriginalArgs
        ? args.slice(0, args.length - 1)
        : args;
      this.httpServer.listen(
        port,
        ...listenFnArgs,
        (...originalCallbackArgs: unknown[]) => {
          if (originalCallbackArgs[0] instanceof Error) {
            return reject(originalCallbackArgs[0]);
          }
          const address = this.httpServer.address();
          if (address) {
            this.httpServer.removeListener('error', errorHandler);
            this.isListening = true;
            resolve(this.httpServer);
          }
          if (isCallbackInOriginalArgs) {
            args[args.length - 1](...originalCallbackArgs);
          }
        },
      );
    });
  }

  public async close(signal?: string): Promise<void> {
    await this.dispose();
    await this.hooks.addShutdownHook(signal);
    this.isListening = false;
  }

  public async getUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isListening) {
        reject('Server not listening!');
        return;
      }
      const address = this.httpServer.address();
      resolve(this.formatAddress(address));
    });
  }

  protected async dispose(): Promise<void> {
    this.adapter && (await this.adapter.close());
  }

  private formatAddress(address: string | AddressInfo): string {
    if (isString(address)) {
      if (platform() === 'win32') {
        return address;
      }
      const basePath = encodeURIComponent(address);
      return `${this.getProtocol()}+unix://${basePath}`;
    }
    let host = address.address;
    if ([6, 'IPv6'].includes(address.family)) {
      if (host === '::') {
        host = '[::1]';
      } else {
        host = `[${host}]`;
      }
    } else if (host === '0.0.0.0') {
      host = '127.0.0.1';
    }
    return `${this.getProtocol()}://${host}:${address.port}`;
  }

  private getProtocol(): 'http' | 'https' {
    return this.environment.config?.tls ? 'https' : 'http';
  }
}
