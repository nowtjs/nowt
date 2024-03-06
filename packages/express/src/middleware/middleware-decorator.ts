import type { NotchMiddleware } from '@armscye/middleware';

export class MiddlewareDecorator implements NotchMiddleware {
  private readonly callable: Function;

  constructor(callable: Function) {
    this.callable = callable;
  }

  public process(req: any, res: any, next: any) {
    return this.callable(req, res, next);
  }
}
