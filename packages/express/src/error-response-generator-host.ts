import type { ResponseGenerator } from '@armscye/response';

export class ErrorResponseGeneratorHost {
  private _responseGenerator: ResponseGenerator;

  constructor(responseGenerator: ResponseGenerator) {
    this._responseGenerator = responseGenerator;
  }

  get responseGenerator(): ResponseGenerator {
    return this._responseGenerator;
  }
}
