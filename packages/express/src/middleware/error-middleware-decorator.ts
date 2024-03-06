import type { NotchMiddleware } from '@armscye/middleware';

export class ErrorMiddlewareDecorator implements NotchMiddleware {
  private readonly callable: Function;

  constructor(callable: Function) {
    this.callable = callable;
  }

  public process(err: any, req: any, res: any, next?: any) {
    return this.callable(err, req, res, next);
  }
}
