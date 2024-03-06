import type { NotchMiddleware } from '@armscye/middleware';

export class ErrorHandlerHost {
  private _errorHandler?: NotchMiddleware;

  constructor(errorHandler: NotchMiddleware) {
    this._errorHandler = errorHandler;
  }

  get errorHandler(): NotchMiddleware {
    return this._errorHandler;
  }
}
